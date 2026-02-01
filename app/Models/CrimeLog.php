<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrimeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'crime_id',
        'success',
        'nerve_spent',
        'money_gained',
        'experience_gained',
        'item_gained_id',
        'jail_time',
        'hospital_time',
        'message',
    ];

    protected function casts(): array
    {
        return [
            'success' => 'boolean',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function crime(): BelongsTo
    {
        return $this->belongsTo(Crime::class);
    }

    public function itemGained(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_gained_id');
    }

    // ========================================
    // HELPERS
    // ========================================

    public function wasSuccessful(): bool
    {
        return $this->success;
    }

    public function getRewardSummary(): string
    {
        if (! $this->success) {
            if ($this->jail_time > 0) {
                return 'Jailed for '.$this->formatTime($this->jail_time);
            }
            if ($this->hospital_time > 0) {
                return 'Hospitalized for '.$this->formatTime($this->hospital_time);
            }

            return 'Failed';
        }

        $parts = [];
        if ($this->money_gained > 0) {
            $parts[] = '$'.number_format($this->money_gained);
        }
        if ($this->experience_gained > 0) {
            $parts[] = $this->experience_gained.' XP';
        }
        if ($this->itemGained) {
            $parts[] = $this->itemGained->name;
        }

        return implode(', ', $parts) ?: 'Success';
    }

    protected function formatTime(int $seconds): string
    {
        if ($seconds < 60) {
            return $seconds.'s';
        }
        if ($seconds < 3600) {
            return floor($seconds / 60).'m';
        }

        return floor($seconds / 3600).'h '.floor(($seconds % 3600) / 60).'m';
    }
}
