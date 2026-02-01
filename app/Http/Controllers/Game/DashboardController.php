<?php

namespace App\Http\Controllers\Game;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the game dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Get recent attack logs
        $recentAttacks = $user->attacksMade()
            ->with('defender:id,name')
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        $recentDefends = $user->attacksReceived()
            ->with('attacker:id,name')
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        return Inertia::render('game/dashboard', [
            'player' => [
                'id' => $user->id,
                'name' => $user->name,
                'level' => $user->level,
                'experience' => $user->experience,
                'experienceForNextLevel' => $user->experienceForNextLevel(),
                'experienceProgress' => $user->experienceProgress(),

                // Bars
                'health' => $user->health,
                'maxHealth' => $user->max_health,
                'energy' => $user->energy,
                'maxEnergy' => $user->max_energy,
                'nerve' => $user->nerve,
                'maxNerve' => $user->max_nerve,
                'happiness' => $user->happiness,
                'maxHappiness' => $user->max_happiness,

                // Combat stats
                'strength' => $user->strength,
                'speed' => $user->speed,
                'defense' => $user->defense,
                'dexterity' => $user->dexterity,
                'battleStats' => $user->getBattleStats(),

                // Economy
                'wallet' => $user->wallet,
                'bank' => $user->bank,
                'points' => $user->points,

                // Status
                'status' => $user->status,
                'statusUntil' => $user->status_until,
                'isAvailable' => $user->isAvailable(),

                // Stats
                'attacksWon' => $user->attacks_won,
                'attacksLost' => $user->attacks_lost,
                'defendsWon' => $user->defends_won,
                'defendsLost' => $user->defends_lost,
                'crimesCommitted' => $user->crimes_committed,

                // Faction
                'faction' => $user->faction?->only(['id', 'name', 'tag']),
                'factionRole' => $user->faction_role,
            ],
            'recentAttacks' => $recentAttacks,
            'recentDefends' => $recentDefends,
            'equippedWeapon' => $user->getEquippedWeapon()?->item?->only(['id', 'name', 'damage']),
            'equippedArmor' => $user->getEquippedArmor()?->item?->only(['id', 'name', 'armor']),
        ]);
    }

    /**
     * Show player profile.
     */
    public function profile(User $user)
    {
        return Inertia::render('game/profile', [
            'player' => [
                'id' => $user->id,
                'name' => $user->name,
                'level' => $user->level,
                'status' => $user->status,
                'faction' => $user->faction?->only(['id', 'name', 'tag']),
                'attacksWon' => $user->attacks_won,
                'attacksLost' => $user->attacks_lost,
                'defendsWon' => $user->defends_won,
                'defendsLost' => $user->defends_lost,
                'crimesCommitted' => $user->crimes_committed,
                'createdAt' => $user->created_at,
            ],
            'canAttack' => request()->user()->canAttack() && $user->isAvailable() && $user->id !== request()->user()->id,
        ]);
    }

    /**
     * Show hospital page.
     */
    public function hospital(Request $request)
    {
        $hospitalized = User::where('status', 'hospital')
            ->where('status_until', '>', now())
            ->select(['id', 'name', 'level', 'status_until'])
            ->orderBy('status_until')
            ->paginate(20);

        return Inertia::render('game/hospital', [
            'hospitalized' => $hospitalized,
            'userStatus' => $request->user()->status,
            'userStatusUntil' => $request->user()->status_until,
        ]);
    }

    /**
     * Show jail page.
     */
    public function jail(Request $request)
    {
        $jailed = User::where('status', 'jail')
            ->where('status_until', '>', now())
            ->select(['id', 'name', 'level', 'status_until'])
            ->orderBy('status_until')
            ->paginate(20);

        return Inertia::render('game/jail', [
            'jailed' => $jailed,
            'userStatus' => $request->user()->status,
            'userStatusUntil' => $request->user()->status_until,
        ]);
    }
}
