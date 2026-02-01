<?php

namespace App\Http\Controllers\Game;

use App\Actions\Game\GameService;
use App\Http\Controllers\Controller;
use App\Models\GymActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GymController extends Controller
{
    public function __construct(
        protected GameService $gameService
    ) {}

    /**
     * Show the gym page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $recentActivities = GymActivity::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->take(10)
            ->get();

        return Inertia::render('game/gym/index', [
            'stats' => [
                'strength' => $user->strength,
                'speed' => $user->speed,
                'defense' => $user->defense,
                'dexterity' => $user->dexterity,
            ],
            'energy' => $user->energy,
            'maxEnergy' => $user->max_energy,
            'happiness' => $user->happiness,
            'maxHappiness' => $user->max_happiness,
            'canTrain' => $user->canTrain(),
            'recentActivities' => $recentActivities,
        ]);
    }

    /**
     * Train a stat.
     */
    public function train(Request $request)
    {
        $request->validate([
            'stat' => 'required|in:strength,speed,defense,dexterity',
            'energy' => 'sometimes|integer|min:5',
        ]);

        $result = $this->gameService->train(
            $request->user(),
            $request->stat,
            $request->energy ?? 5
        );

        if (! $result['success']) {
            return back()->withErrors(['train' => $result['message']]);
        }

        return back()->with('success', "Gained {$result['gained']} {$result['stat']}!");
    }
}
