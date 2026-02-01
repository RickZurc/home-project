<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faction extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'tag',
        'description',
        'leader_id',
        'level',
        'respect',
        'treasury',
        'max_members',
        'territories_controlled',
        'at_war',
        'war_target_id',
        'war_started_at',
    ];

    protected function casts(): array
    {
        return [
            'at_war' => 'boolean',
            'war_started_at' => 'datetime',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function warTarget(): BelongsTo
    {
        return $this->belongsTo(Faction::class, 'war_target_id');
    }

    public function combatLogsAsAttacker(): HasMany
    {
        return $this->hasMany(CombatLog::class, 'attacker_faction_id');
    }

    public function combatLogsAsDefender(): HasMany
    {
        return $this->hasMany(CombatLog::class, 'defender_faction_id');
    }

    // ========================================
    // HELPERS
    // ========================================

    public function memberCount(): int
    {
        return $this->members()->count();
    }

    public function isFull(): bool
    {
        return $this->memberCount() >= $this->max_members;
    }

    public function canRecruit(): bool
    {
        return ! $this->isFull();
    }

    public function totalBattleStats(): int
    {
        return $this->members->sum(fn ($m) => $m->getBattleStats());
    }

    public function averageBattleStats(): float
    {
        $count = $this->memberCount();

        return $count > 0 ? $this->totalBattleStats() / $count : 0;
    }

    public function declareWarOn(Faction $target): void
    {
        $this->update([
            'at_war' => true,
            'war_target_id' => $target->id,
            'war_started_at' => now(),
        ]);

        $target->update([
            'at_war' => true,
            'war_target_id' => $this->id,
            'war_started_at' => now(),
        ]);
    }

    public function endWar(): void
    {
        if ($this->warTarget) {
            $this->warTarget->update([
                'at_war' => false,
                'war_target_id' => null,
                'war_started_at' => null,
            ]);
        }

        $this->update([
            'at_war' => false,
            'war_target_id' => null,
            'war_started_at' => null,
        ]);
    }

    public function respectForNextLevel(): int
    {
        return (int) (1000 * pow(2, $this->level - 1));
    }
}
