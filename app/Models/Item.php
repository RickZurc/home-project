<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'subtype',
        'damage',
        'accuracy',
        'armor',
        'effects',
        'base_price',
        'market_price',
        'circulation',
        'level_required',
        'stats_required',
        'tradeable',
        'consumable',
        'uses',
        'rarity',
    ];

    protected function casts(): array
    {
        return [
            'effects' => 'array',
            'stats_required' => 'array',
            'possible_items' => 'array',
            'tradeable' => 'boolean',
            'consumable' => 'boolean',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function marketListings(): HasMany
    {
        return $this->hasMany(MarketListing::class);
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopeWeapons($query)
    {
        return $query->where('type', 'weapon');
    }

    public function scopeArmor($query)
    {
        return $query->where('type', 'armor');
    }

    public function scopeConsumables($query)
    {
        return $query->where('type', 'consumable');
    }

    public function scopeTradeable($query)
    {
        return $query->where('tradeable', true);
    }

    public function scopeByRarity($query, string $rarity)
    {
        return $query->where('rarity', $rarity);
    }

    // ========================================
    // HELPERS
    // ========================================

    public function isWeapon(): bool
    {
        return $this->type === 'weapon';
    }

    public function isArmor(): bool
    {
        return $this->type === 'armor';
    }

    public function isConsumable(): bool
    {
        return $this->type === 'consumable';
    }

    public function getEffect(string $key, mixed $default = null): mixed
    {
        return $this->effects[$key] ?? $default;
    }

    public function getRarityColor(): string
    {
        return match ($this->rarity) {
            'common' => 'gray',
            'uncommon' => 'green',
            'rare' => 'blue',
            'epic' => 'purple',
            'legendary' => 'orange',
            default => 'gray',
        };
    }

    public function updateMarketPrice(): void
    {
        $avgPrice = $this->marketListings()
            ->where('status', 'active')
            ->avg('price_per_unit');

        if ($avgPrice) {
            $this->update(['market_price' => (int) $avgPrice]);
        }
    }
}
