<?php

namespace App\Actions\Game;

use App\Models\Faction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FactionService
{
    protected const CREATE_COST = 100000;

    protected const BASE_UPKEEP = 1000;

    /**
     * Create a new faction.
     */
    public function create(User $leader, string $name, string $tag, ?string $description = null): array
    {
        if ($leader->faction_id) {
            return ['success' => false, 'message' => 'You are already in a faction.'];
        }

        if ($leader->wallet < self::CREATE_COST) {
            return ['success' => false, 'message' => 'Not enough money. Need $'.number_format(self::CREATE_COST).'.'];
        }

        if (strlen($tag) < 2 || strlen($tag) > 10) {
            return ['success' => false, 'message' => 'Tag must be 2-10 characters.'];
        }

        if (Faction::where('name', $name)->exists()) {
            return ['success' => false, 'message' => 'Faction name already taken.'];
        }

        if (Faction::where('tag', $tag)->exists()) {
            return ['success' => false, 'message' => 'Faction tag already taken.'];
        }

        return DB::transaction(function () use ($leader, $name, $tag, $description) {
            $leader->decrement('wallet', self::CREATE_COST);

            $faction = Faction::create([
                'name' => $name,
                'tag' => strtoupper($tag),
                'description' => $description,
                'leader_id' => $leader->id,
                'treasury' => 0,
            ]);

            $leader->update([
                'faction_id' => $faction->id,
                'faction_role' => 'leader',
            ]);

            return [
                'success' => true,
                'faction' => $faction,
            ];
        });
    }

    /**
     * Invite a player to the faction.
     */
    public function invite(Faction $faction, User $inviter, User $target): array
    {
        if ($inviter->faction_id !== $faction->id) {
            return ['success' => false, 'message' => 'You are not in this faction.'];
        }

        if (! in_array($inviter->faction_role, ['leader', 'co-leader'])) {
            return ['success' => false, 'message' => 'You do not have permission to invite.'];
        }

        if ($target->faction_id) {
            return ['success' => false, 'message' => 'Player is already in a faction.'];
        }

        if ($faction->isFull()) {
            return ['success' => false, 'message' => 'Faction is full.'];
        }

        return DB::transaction(function () use ($faction, $target) {
            $target->update([
                'faction_id' => $faction->id,
                'faction_role' => 'member',
            ]);

            return [
                'success' => true,
                'message' => "{$target->name} has joined the faction.",
            ];
        });
    }

    /**
     * Leave a faction.
     */
    public function leave(User $user): array
    {
        if (! $user->faction_id) {
            return ['success' => false, 'message' => 'You are not in a faction.'];
        }

        $faction = $user->faction;

        if ($user->faction_role === 'leader') {
            // Transfer leadership or disband
            $newLeader = $faction->members()
                ->where('id', '!=', $user->id)
                ->orderByRaw("CASE WHEN faction_role = 'co-leader' THEN 0 ELSE 1 END")
                ->first();

            if ($newLeader) {
                return $this->transferLeadership($faction, $user, $newLeader);
            } else {
                return $this->disband($faction, $user);
            }
        }

        $user->update([
            'faction_id' => null,
            'faction_role' => null,
        ]);

        return [
            'success' => true,
            'message' => 'You have left the faction.',
        ];
    }

    /**
     * Kick a member from the faction.
     */
    public function kick(Faction $faction, User $kicker, User $target): array
    {
        if ($kicker->faction_id !== $faction->id) {
            return ['success' => false, 'message' => 'You are not in this faction.'];
        }

        if ($target->faction_id !== $faction->id) {
            return ['success' => false, 'message' => 'Player is not in this faction.'];
        }

        if ($kicker->id === $target->id) {
            return $this->leave($kicker);
        }

        // Permission check
        $kickerLevel = $this->getRoleLevel($kicker->faction_role);
        $targetLevel = $this->getRoleLevel($target->faction_role);

        if ($kickerLevel <= $targetLevel) {
            return ['success' => false, 'message' => 'You cannot kick this member.'];
        }

        $target->update([
            'faction_id' => null,
            'faction_role' => null,
        ]);

        return [
            'success' => true,
            'message' => "{$target->name} has been kicked from the faction.",
        ];
    }

    /**
     * Transfer leadership.
     */
    public function transferLeadership(Faction $faction, User $currentLeader, User $newLeader): array
    {
        if ($currentLeader->faction_id !== $faction->id || $currentLeader->faction_role !== 'leader') {
            return ['success' => false, 'message' => 'You are not the faction leader.'];
        }

        if ($newLeader->faction_id !== $faction->id) {
            return ['success' => false, 'message' => 'Player is not in this faction.'];
        }

        return DB::transaction(function () use ($faction, $currentLeader, $newLeader) {
            $faction->update(['leader_id' => $newLeader->id]);
            $newLeader->update(['faction_role' => 'leader']);
            $currentLeader->update(['faction_role' => 'co-leader']);

            return [
                'success' => true,
                'message' => "{$newLeader->name} is now the faction leader.",
            ];
        });
    }

    /**
     * Disband the faction.
     */
    public function disband(Faction $faction, User $leader): array
    {
        if ($leader->faction_id !== $faction->id || $leader->faction_role !== 'leader') {
            return ['success' => false, 'message' => 'You are not the faction leader.'];
        }

        return DB::transaction(function () use ($faction) {
            // Distribute treasury among members
            $members = $faction->members;
            $memberCount = $members->count();

            if ($faction->treasury > 0 && $memberCount > 0) {
                $share = (int) ($faction->treasury / $memberCount);
                foreach ($members as $member) {
                    $member->increment('wallet', $share);
                }
            }

            // Remove all members
            User::where('faction_id', $faction->id)->update([
                'faction_id' => null,
                'faction_role' => null,
            ]);

            // End any wars
            if ($faction->at_war) {
                $faction->endWar();
            }

            $faction->delete();

            return [
                'success' => true,
                'message' => 'Faction has been disbanded.',
            ];
        });
    }

    /**
     * Donate to faction treasury.
     */
    public function donate(User $user, int $amount): array
    {
        if (! $user->faction_id) {
            return ['success' => false, 'message' => 'You are not in a faction.'];
        }

        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Invalid amount.'];
        }

        if ($user->wallet < $amount) {
            return ['success' => false, 'message' => 'Insufficient funds.'];
        }

        return DB::transaction(function () use ($user, $amount) {
            $user->decrement('wallet', $amount);
            $user->faction->increment('treasury', $amount);
            $user->faction->increment('respect', (int) ($amount / 1000));

            return [
                'success' => true,
                'amount' => $amount,
                'treasury' => $user->faction->treasury,
            ];
        });
    }

    /**
     * Declare war on another faction.
     */
    public function declareWar(Faction $faction, User $leader, Faction $target): array
    {
        if ($leader->faction_id !== $faction->id || $leader->faction_role !== 'leader') {
            return ['success' => false, 'message' => 'Only the faction leader can declare war.'];
        }

        if ($faction->id === $target->id) {
            return ['success' => false, 'message' => 'Cannot declare war on yourself.'];
        }

        if ($faction->at_war) {
            return ['success' => false, 'message' => 'Already at war.'];
        }

        if ($target->at_war) {
            return ['success' => false, 'message' => 'Target faction is already at war.'];
        }

        $faction->declareWarOn($target);

        return [
            'success' => true,
            'message' => "War declared on {$target->name}!",
        ];
    }

    /**
     * Get role hierarchy level.
     */
    protected function getRoleLevel(string $role): int
    {
        return match ($role) {
            'leader' => 3,
            'co-leader' => 2,
            'officer' => 1,
            default => 0,
        };
    }
}
