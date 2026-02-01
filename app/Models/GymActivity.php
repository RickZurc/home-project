<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GymActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stat_trained',
        'energy_spent',
        'stat_gained',
        'stat_before',
        'stat_after',
    ];

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ========================================
    // HELPERS
    // ========================================

    public function getStatLabel(): string
    {
        return match ($this->stat_trained) {
            'strength' => 'Strength',
            'speed' => 'Speed',
            'defense' => 'Defense',
            'dexterity' => 'Dexterity',
            default => ucfirst($this->stat_trained),
        };
    }

    public function getEfficiency(): float
    {
        return $this->energy_spent > 0
            ? round($this->stat_gained / $this->energy_spent, 2)
            : 0;
    }
}
