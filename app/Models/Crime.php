<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Crime extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'nerve_cost',
        'level_required',
        'base_success_rate',
        'stat_modifiers',
        'min_money',
        'max_money',
        'min_experience',
        'max_experience',
        'possible_items',
        'jail_time_min',
        'jail_time_max',
        'hospital_time_min',
        'hospital_time_max',
        'cooldown',
    ];

    protected function casts(): array
    {
        return [
            'stat_modifiers' => 'array',
            'possible_items' => 'array',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function logs(): HasMany
    {
        return $this->hasMany(CrimeLog::class);
    }

    // ========================================
    // HELPERS
    // ========================================

    public function calculateSuccessRate(User $user): int
    {
        $rate = $this->base_success_rate;

        if ($this->stat_modifiers) {
            foreach ($this->stat_modifiers as $stat => $modifier) {
                $statValue = $user->{$stat} ?? 0;
                $rate += (int) ($statValue * $modifier);
            }
        }

        // Level bonus
        $rate += ($user->level - $this->level_required) * 2;

        // Cap between 5% and 95%
        return max(5, min(95, $rate));
    }

    public function getMoneyReward(): int
    {
        return rand($this->min_money, $this->max_money);
    }

    public function getExperienceReward(): int
    {
        return rand($this->min_experience, $this->max_experience);
    }

    public function getJailTime(): int
    {
        return rand($this->jail_time_min, $this->jail_time_max);
    }

    public function getHospitalTime(): int
    {
        return rand($this->hospital_time_min, $this->hospital_time_max);
    }

    public function getRandomItem(): ?Item
    {
        if (empty($this->possible_items)) {
            return null;
        }

        // 10% chance to get an item
        if (rand(1, 100) > 10) {
            return null;
        }

        $itemId = $this->possible_items[array_rand($this->possible_items)];

        return Item::find($itemId);
    }

    public function canAttempt(User $user): bool
    {
        return $user->level >= $this->level_required
            && $user->nerve >= $this->nerve_cost
            && $user->isAvailable();
    }
}
