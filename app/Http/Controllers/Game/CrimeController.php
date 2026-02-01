<?php

namespace App\Http\Controllers\Game;

use App\Actions\Game\GameService;
use App\Http\Controllers\Controller;
use App\Models\Crime;
use App\Models\CrimeLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CrimeController extends Controller
{
    public function __construct(
        protected GameService $gameService
    ) {}

    /**
     * Show the crimes page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Get ALL crimes to show progression
        $crimes = Crime::orderBy('level_required')
            ->orderBy('nerve_cost')
            ->get()
            ->map(function ($crime) use ($user) {
                $isLocked = $user->level < $crime->level_required;

                return [
                    'id' => $crime->id,
                    'name' => $crime->name,
                    'slug' => $crime->slug,
                    'description' => $crime->description,
                    'nerveCost' => $crime->nerve_cost,
                    'levelRequired' => $crime->level_required,
                    'successRate' => $isLocked ? 0 : $crime->calculateSuccessRate($user),
                    'moneyRange' => [$crime->min_money, $crime->max_money],
                    'expRange' => [$crime->min_experience, $crime->max_experience],
                    'canAttempt' => $crime->canAttempt($user),
                    'isLocked' => $isLocked,
                    'levelsUntilUnlock' => max(0, $crime->level_required - $user->level),
                ];
            });

        $recentCrimes = CrimeLog::where('user_id', $user->id)
            ->with('crime:id,name')
            ->orderByDesc('created_at')
            ->take(10)
            ->get();

        // Calculate next unlock
        $nextUnlock = Crime::where('level_required', '>', $user->level)
            ->orderBy('level_required')
            ->first();

        return Inertia::render('game/crimes/index', [
            'crimes' => $crimes,
            'nerve' => $user->nerve,
            'maxNerve' => $user->max_nerve,
            'level' => $user->level,
            'experience' => $user->experience,
            'experienceForNextLevel' => $user->experienceForNextLevel(),
            'experienceProgress' => $user->experienceProgress(),
            'canCommitCrime' => $user->canCommitCrime(),
            'recentCrimes' => $recentCrimes,
            'nextUnlock' => $nextUnlock ? [
                'name' => $nextUnlock->name,
                'levelRequired' => $nextUnlock->level_required,
                'levelsAway' => $nextUnlock->level_required - $user->level,
            ] : null,
        ]);
    }

    /**
     * Commit a crime.
     */
    public function commit(Request $request, Crime $crime)
    {
        $result = $this->gameService->commitCrime($request->user(), $crime);

        if (! $result['success']) {
            return back()->withErrors(['crime' => $result['message']]);
        }

        return back()->with('crimeResult', $result);
    }
}
