<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketListing extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'item_id',
        'quantity',
        'price_per_unit',
        'total_price',
        'status',
        'buyer_id',
        'sold_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'sold_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeForItem($query, int $itemId)
    {
        return $query->where('item_id', $itemId);
    }

    public function scopeCheapestFirst($query)
    {
        return $query->orderBy('price_per_unit', 'asc');
    }

    // ========================================
    // HELPERS
    // ========================================

    public function isActive(): bool
    {
        return $this->status === 'active'
            && (! $this->expires_at || $this->expires_at->isFuture());
    }

    public function canBePurchasedBy(User $user): bool
    {
        return $this->isActive()
            && $this->seller_id !== $user->id
            && $user->wallet >= $this->total_price;
    }

    public function purchase(User $buyer): bool
    {
        if (! $this->canBePurchasedBy($buyer)) {
            return false;
        }

        // Deduct money from buyer
        Transaction::record($buyer, 'market_buy', -$this->total_price, 'money', $this->seller, "Bought {$this->quantity}x {$this->item->name}");
        $buyer->decrement('wallet', $this->total_price);

        // Add money to seller
        $seller = $this->seller;
        Transaction::record($seller, 'market_sell', $this->total_price, 'money', $buyer, "Sold {$this->quantity}x {$this->item->name}");
        $seller->increment('wallet', $this->total_price);

        // Add item to buyer's inventory
        $inventory = Inventory::firstOrCreate(
            ['user_id' => $buyer->id, 'item_id' => $this->item_id, 'equipped' => false],
            ['quantity' => 0]
        );
        $inventory->addQuantity($this->quantity);

        // Update listing
        $this->update([
            'status' => 'sold',
            'buyer_id' => $buyer->id,
            'sold_at' => now(),
        ]);

        // Update item market price
        $this->item->updateMarketPrice();

        return true;
    }

    public function cancel(): bool
    {
        if (! $this->isActive()) {
            return false;
        }

        // Return items to seller
        $inventory = Inventory::firstOrCreate(
            ['user_id' => $this->seller_id, 'item_id' => $this->item_id, 'equipped' => false],
            ['quantity' => 0]
        );
        $inventory->addQuantity($this->quantity);

        $this->update(['status' => 'cancelled']);

        return true;
    }

    public static function createListing(User $seller, Item $item, int $quantity, int $pricePerUnit, ?int $expiresInHours = 168): ?self
    {
        // Check seller has enough items
        $inventory = $seller->inventory()
            ->where('item_id', $item->id)
            ->where('equipped', false)
            ->first();

        if (! $inventory || $inventory->quantity < $quantity) {
            return null;
        }

        // Check item is tradeable
        if (! $item->tradeable) {
            return null;
        }

        // Remove items from inventory
        $inventory->removeQuantity($quantity);

        return self::create([
            'seller_id' => $seller->id,
            'item_id' => $item->id,
            'quantity' => $quantity,
            'price_per_unit' => $pricePerUnit,
            'total_price' => $quantity * $pricePerUnit,
            'status' => 'active',
            'expires_at' => $expiresInHours ? now()->addHours($expiresInHours) : null,
        ]);
    }
}
