<?php

namespace App\Http\Controllers\Game;

use App\Actions\Game\FactionService;
use App\Http\Controllers\Controller;
use App\Models\Faction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FactionController extends Controller
{
    public function __construct(
        protected FactionService $factionService
    ) {}

    /**
     * Show factions list.
     */
    public function index(Request $request)
    {
        $user = $request->user()->fresh();

        $factions = Faction::withCount('members')
            ->orderByDesc('respect')
            ->get();

        return Inertia::render('game/factions/index', [
            'factions' => $factions,
            'myFaction' => $user->faction?->loadCount('members'),
            'pendingInvites' => [], // TODO: Implement faction invites
        ]);
    }

    /**
     * Show faction details.
     */
    public function show(Faction $faction)
    {
        $faction->load([
            'leader:id,name,level',
            'members:id,name,level,faction_role',
            'warTarget:id,name,tag',
        ]);

        return Inertia::render('game/factions/show', [
            'faction' => $faction,
            'isLeader' => request()->user()->id === $faction->leader_id,
            'isMember' => request()->user()->faction_id === $faction->id,
        ]);
    }

    /**
     * Show create faction page.
     */
    public function create()
    {
        $user = request()->user()->fresh();

        // Redirect if user already has a faction
        if ($user->faction_id) {
            return redirect()->route('game.factions.index')
                ->withErrors(['create' => 'You are already in a faction. Leave your current faction first.']);
        }

        return Inertia::render('game/factions/create', [
            'cost' => 100000,
            'wallet' => $user->wallet,
        ]);
    }

    /**
     * Store a new faction.
     */
    public function store(Request $request)
    {
        $user = $request->user()->fresh();

        // Check if user already has a faction
        if ($user->faction_id) {
            return back()->withErrors(['create' => 'You are already in a faction.']);
        }

        $request->validate([
            'name' => 'required|string|min:3|max:50|unique:factions',
            'tag' => 'required|string|min:2|max:10|unique:factions',
            'description' => 'nullable|string|max:500',
        ]);

        $result = $this->factionService->create(
            $user,
            $request->name,
            $request->tag,
            $request->description
        );

        if (! $result['success']) {
            return back()->withErrors(['create' => $result['message']]);
        }

        return redirect()->route('game.factions.show', $result['faction']);
    }

    /**
     * Invite a player.
     */
    public function invite(Request $request, Faction $faction)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $target = User::findOrFail($request->user_id);
        $result = $this->factionService->invite($faction, $request->user(), $target);

        if (! $result['success']) {
            return back()->withErrors(['invite' => $result['message']]);
        }

        return back()->with('success', $result['message']);
    }

    /**
     * Leave faction.
     */
    public function leave(Request $request)
    {
        $result = $this->factionService->leave($request->user());

        if (! $result['success']) {
            return back()->withErrors(['leave' => $result['message']]);
        }

        return redirect()->route('game.factions.index')->with('success', $result['message']);
    }

    /**
     * Kick a member.
     */
    public function kick(Request $request, Faction $faction, User $user)
    {
        $result = $this->factionService->kick($faction, $request->user(), $user);

        if (! $result['success']) {
            return back()->withErrors(['kick' => $result['message']]);
        }

        return back()->with('success', $result['message']);
    }

    /**
     * Donate to treasury.
     */
    public function donate(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $result = $this->factionService->donate($request->user(), $request->amount);

        if (! $result['success']) {
            return back()->withErrors(['donate' => $result['message']]);
        }

        return back()->with('success', 'Donated $'.number_format($request->amount));
    }

    /**
     * Declare war.
     */
    public function declareWar(Request $request, Faction $faction)
    {
        $request->validate([
            'target_id' => 'required|exists:factions,id',
        ]);

        $target = Faction::findOrFail($request->target_id);
        $result = $this->factionService->declareWar($faction, $request->user(), $target);

        if (! $result['success']) {
            return back()->withErrors(['war' => $result['message']]);
        }

        return back()->with('success', $result['message']);
    }
}
