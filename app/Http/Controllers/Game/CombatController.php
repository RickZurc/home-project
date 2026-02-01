<?php

namespace App\Http\Controllers\Game;

use App\Actions\Game\CombatService;
use App\Http\Controllers\Controller;
use App\Models\CombatLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CombatController extends Controller
{
    public function __construct(
        protected CombatService $combatService
    ) {}

    /**
     * Show the attack page with available targets.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Get potential targets (excluding self, hospitalized, jailed)
        $targets = User::where('id', '!=', $user->id)
            ->where(function ($query) {
                $query->where('status', 'okay')
                    ->orWhere('status_until', '<', now());
            })
            ->select(['id', 'name', 'level', 'faction_id', 'status'])
            ->withCount(['attacksMade', 'defends_won' => fn ($q) => $q->where('winner_id', 'users.id')])
            ->orderBy('level')
            ->paginate(20);

        return Inertia::render('game/combat/index', [
            'targets' => $targets,
            'canAttack' => $user->canAttack(),
            'energy' => $user->energy,
            'cooldownUntil' => $user->attack_cooldown_until,
        ]);
    }

    /**
     * Show attack page for specific target.
     */
    public function show(User $target)
    {
        $user = request()->user();

        return Inertia::render('game/combat/attack', [
            'target' => [
                'id' => $target->id,
                'name' => $target->name,
                'level' => $target->level,
                'status' => $target->status,
                'faction' => $target->faction?->only(['id', 'name', 'tag']),
            ],
            'canAttack' => $user->canAttack() && $target->isAvailable(),
            'energy' => $user->energy,
            'energyCost' => 25,
        ]);
    }

    /**
     * Execute an attack.
     */
    public function attack(Request $request, User $target)
    {
        $result = $this->combatService->attack($request->user(), $target);

        if (! $result['success']) {
            return back()->withErrors(['attack' => $result['message']]);
        }

        return Inertia::render('game/combat/result', [
            'result' => $result,
            'target' => [
                'id' => $target->id,
                'name' => $target->name,
            ],
        ]);
    }

    /**
     * View combat log.
     */
    public function log(CombatLog $combatLog)
    {
        $user = request()->user();

        // Ensure user was involved in this combat
        if ($combatLog->attacker_id !== $user->id && $combatLog->defender_id !== $user->id) {
            abort(403);
        }

        return Inertia::render('game/combat/log', [
            'combatLog' => $combatLog->load(['attacker:id,name', 'defender:id,name']),
        ]);
    }

    /**
     * View attack history.
     */
    public function history(Request $request)
    {
        $user = $request->user();

        $attacks = CombatLog::where('attacker_id', $user->id)
            ->orWhere('defender_id', $user->id)
            ->with(['attacker:id,name', 'defender:id,name'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('game/combat/history', [
            'attacks' => $attacks,
        ]);
    }
}
