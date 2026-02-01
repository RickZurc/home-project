<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CombatLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'attacker_id',
        'defender_id',
        'winner_id',
        'result',
        'attacker_damage_dealt',
        'defender_damage_dealt',
        'turns',
        'money_stolen',
        'respect_gained',
        'experience_gained',
        'attacker_hospital_time',
        'defender_hospital_time',
        'log',
        'is_war_hit',
        'attacker_faction_id',
        'defender_faction_id',
    ];

    protected function casts(): array
    {
        return [
            'log' => 'array',
            'is_war_hit' => 'boolean',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function attacker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'attacker_id');
    }

    public function defender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'defender_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    public function attackerFaction(): BelongsTo
    {
        return $this->belongsTo(Faction::class, 'attacker_faction_id');
    }

    public function defenderFaction(): BelongsTo
    {
        return $this->belongsTo(Faction::class, 'defender_faction_id');
    }

    // ========================================
    // HELPERS
    // ========================================

    public function attackerWon(): bool
    {
        return $this->winner_id === $this->attacker_id;
    }

    public function defenderWon(): bool
    {
        return $this->winner_id === $this->defender_id;
    }

    public function wasStalemate(): bool
    {
        return $this->result === 'stalemate';
    }

    public function totalDamage(): int
    {
        return $this->attacker_damage_dealt + $this->defender_damage_dealt;
    }

    public function getFormattedLog(): array
    {
        return $this->log ?? [];
    }

    public function getSummary(): string
    {
        $attackerName = $this->attacker->name ?? 'Unknown';
        $defenderName = $this->defender->name ?? 'Unknown';

        return match ($this->result) {
            'win' => "{$attackerName} defeated {$defenderName}",
            'lose' => "{$defenderName} defeated {$attackerName}",
            'stalemate' => "Stalemate between {$attackerName} and {$defenderName}",
            'escape' => "{$defenderName} escaped from {$attackerName}",
            default => "Combat between {$attackerName} and {$defenderName}",
        };
    }
}
