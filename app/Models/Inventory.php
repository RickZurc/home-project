<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventories';

    protected $fillable = [
        'user_id',
        'item_id',
        'quantity',
        'equipped',
        'uses_remaining',
    ];

    protected function casts(): array
    {
        return [
            'equipped' => 'boolean',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopeEquipped($query)
    {
        return $query->where('equipped', true);
    }

    public function scopeUnequipped($query)
    {
        return $query->where('equipped', false);
    }

    public function scopeWeapons($query)
    {
        return $query->whereHas('item', fn ($q) => $q->where('type', 'weapon'));
    }

    public function scopeArmor($query)
    {
        return $query->whereHas('item', fn ($q) => $q->where('type', 'armor'));
    }

    // ========================================
    // HELPERS
    // ========================================

    public function equip(): bool
    {
        if (! $this->item->isWeapon() && ! $this->item->isArmor()) {
            return false;
        }

        // Unequip other items of the same type
        Inventory::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->whereHas('item', fn ($q) => $q->where('type', $this->item->type))
            ->update(['equipped' => false]);

        $this->update(['equipped' => true]);

        return true;
    }

    public function unequip(): bool
    {
        $this->update(['equipped' => false]);

        return true;
    }

    public function use(): bool
    {
        if (! $this->item->consumable) {
            return false;
        }

        if ($this->uses_remaining !== null) {
            $this->decrement('uses_remaining');
            if ($this->uses_remaining <= 0) {
                $this->delete();
            }
        } else {
            $this->decrement('quantity');
            if ($this->quantity <= 0) {
                $this->delete();
            }
        }

        return true;
    }

    public function addQuantity(int $amount): void
    {
        $this->increment('quantity', $amount);
    }

    public function removeQuantity(int $amount): bool
    {
        if ($this->quantity < $amount) {
            return false;
        }

        $this->decrement('quantity', $amount);

        if ($this->quantity <= 0) {
            $this->delete();
        }

        return true;
    }
}
