<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'other_user_id',
        'type',
        'currency',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function otherUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'other_user_id');
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeCredits($query)
    {
        return $query->where('amount', '>', 0);
    }

    public function scopeDebits($query)
    {
        return $query->where('amount', '<', 0);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // ========================================
    // HELPERS
    // ========================================

    public function isCredit(): bool
    {
        return $this->amount > 0;
    }

    public function isDebit(): bool
    {
        return $this->amount < 0;
    }

    public function getFormattedAmount(): string
    {
        $prefix = $this->isCredit() ? '+' : '';

        return $prefix.'$'.number_format(abs($this->amount));
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'deposit' => 'Bank Deposit',
            'withdraw' => 'Bank Withdrawal',
            'transfer' => 'Transfer',
            'trade' => 'Trade',
            'crime' => 'Crime',
            'attack' => 'Attack',
            'market_buy' => 'Market Purchase',
            'market_sell' => 'Market Sale',
            'interest' => 'Bank Interest',
            'gym' => 'Gym Fee',
            default => ucfirst($this->type),
        };
    }

    public static function record(
        User $user,
        string $type,
        int $amount,
        string $currency = 'money',
        ?User $otherUser = null,
        ?string $description = null,
        ?array $metadata = null
    ): self {
        $balanceField = $currency === 'bank' ? 'bank' : 'wallet';
        $balanceBefore = $user->{$balanceField};
        $balanceAfter = $balanceBefore + $amount;

        return self::create([
            'user_id' => $user->id,
            'other_user_id' => $otherUser?->id,
            'type' => $type,
            'currency' => $currency,
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }
}
