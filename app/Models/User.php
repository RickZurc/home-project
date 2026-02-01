<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'faction_id',
        'faction_role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'status_until' => 'datetime',
            'last_action_at' => 'datetime',
            'attack_cooldown_until' => 'datetime',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function faction(): BelongsTo
    {
        return $this->belongsTo(Faction::class);
    }

    public function inventory(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function attacksMade(): HasMany
    {
        return $this->hasMany(CombatLog::class, 'attacker_id');
    }

    public function attacksReceived(): HasMany
    {
        return $this->hasMany(CombatLog::class, 'defender_id');
    }

    public function crimeLogs(): HasMany
    {
        return $this->hasMany(CrimeLog::class);
    }

    public function gymActivities(): HasMany
    {
        return $this->hasMany(GymActivity::class);
    }

    public function marketListings(): HasMany
    {
        return $this->hasMany(MarketListing::class, 'seller_id');
    }

    // ========================================
    // GAME HELPERS
    // ========================================

    public function isInHospital(): bool
    {
        return $this->status === 'hospital' && $this->status_until?->isFuture();
    }

    public function isInJail(): bool
    {
        return $this->status === 'jail' && $this->status_until?->isFuture();
    }

    public function isTraveling(): bool
    {
        return $this->status === 'traveling' && $this->status_until?->isFuture();
    }

    public function isAvailable(): bool
    {
        return $this->status === 'okay' || ! $this->status_until?->isFuture();
    }

    public function canAttack(): bool
    {
        if ($this->isTestUser()) {
            return $this->isAvailable()
                && (! $this->attack_cooldown_until || $this->attack_cooldown_until->isPast());
        }

        return $this->isAvailable()
            && $this->energy >= 25
            && (! $this->attack_cooldown_until || $this->attack_cooldown_until->isPast());
    }

    public function canCommitCrime(): bool
    {
        if ($this->isTestUser()) {
            return $this->isAvailable();
        }

        return $this->isAvailable() && $this->nerve >= 1;
    }

    public function canTrain(): bool
    {
        if ($this->isTestUser()) {
            return $this->isAvailable();
        }

        return $this->isAvailable() && $this->energy >= 5;
    }

    public function getBattleStats(): int
    {
        return $this->strength + $this->speed + $this->defense + $this->dexterity;
    }

    public function getEquippedWeapon(): ?Inventory
    {
        return $this->inventory()
            ->where('equipped', true)
            ->whereHas('item', fn ($q) => $q->where('type', 'weapon'))
            ->with('item')
            ->first();
    }

    public function getEquippedArmor(): ?Inventory
    {
        return $this->inventory()
            ->where('equipped', true)
            ->whereHas('item', fn ($q) => $q->where('type', 'armor'))
            ->with('item')
            ->first();
    }

    public function experienceForNextLevel(): int
    {
        return (int) (100 * pow(1.5, $this->level - 1));
    }

    public function experienceProgress(): float
    {
        $required = $this->experienceForNextLevel();

        return min(100, ($this->experience / $required) * 100);
    }

    public function sendToHospital(int $seconds): void
    {
        $this->update([
            'status' => 'hospital',
            'status_until' => now()->addSeconds($seconds),
            'health' => 0,
        ]);
    }

    public function sendToJail(int $seconds): void
    {
        $this->update([
            'status' => 'jail',
            'status_until' => now()->addSeconds($seconds),
        ]);
    }

    public function release(): void
    {
        $this->update([
            'status' => 'okay',
            'status_until' => null,
        ]);
    }

    /**
     * Check if this user is the test user with infinite resources.
     */
    public function isTestUser(): bool
    {
        return $this->email === 'test@example.com';
    }
}
