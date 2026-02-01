<?php

namespace App\Actions\Game;

use App\Models\CombatLog;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CombatService
{
    // Combat configuration
    protected const MAX_TURNS = 25;

    protected const ENERGY_COST = 25;

    protected const BASE_DAMAGE_MODIFIER = 0.5;

    protected const CRITICAL_HIT_CHANCE = 10; // percent

    protected const CRITICAL_HIT_MULTIPLIER = 1.5;

    protected const DODGE_BASE_CHANCE = 5; // percent

    protected const ESCAPE_BASE_CHANCE = 20; // percent

    protected const MONEYSTEAL_PERCENT = 5; // percent of wallet

    protected const ATTACK_COOLDOWN_SECONDS = 30;

    protected array $combatLog = [];

    protected int $turn = 0;

    /**
     * Execute an attack from attacker to defender.
     */
    public function attack(User $attacker, User $defender): array
    {
        // Validate combat conditions
        $validation = $this->validateAttack($attacker, $defender);
        if (! $validation['success']) {
            return $validation;
        }

        return DB::transaction(function () use ($attacker, $defender) {
            // Consume energy (skip for test user)
            if (! $attacker->isTestUser()) {
                $attacker->decrement('energy', self::ENERGY_COST);
            }
            $attacker->update([
                'attack_cooldown_until' => now()->addSeconds(self::ATTACK_COOLDOWN_SECONDS),
                'last_action_at' => now(),
            ]);

            // Initialize combat
            $this->combatLog = [];
            $this->turn = 0;

            $attackerHealth = $attacker->health;
            $defenderHealth = $defender->health;

            $attackerDamageDealt = 0;
            $defenderDamageDealt = 0;

            // Combat loop
            while ($attackerHealth > 0 && $defenderHealth > 0 && $this->turn < self::MAX_TURNS) {
                $this->turn++;

                // Attacker's turn
                $attackResult = $this->performAttackTurn($attacker, $defender, $defenderHealth);
                $defenderHealth = $attackResult['remainingHealth'];
                $attackerDamageDealt += $attackResult['damage'];

                $this->combatLog[] = [
                    'turn' => $this->turn,
                    'phase' => 'attack',
                    'attacker' => $attacker->name,
                    'damage' => $attackResult['damage'],
                    'critical' => $attackResult['critical'],
                    'dodged' => $attackResult['dodged'],
                    'remainingHealth' => $defenderHealth,
                ];

                if ($defenderHealth <= 0) {
                    break;
                }

                // Check if defender escapes
                if ($this->attemptEscape($defender, $attacker)) {
                    $this->combatLog[] = [
                        'turn' => $this->turn,
                        'phase' => 'escape',
                        'defender' => $defender->name,
                        'escaped' => true,
                    ];
                    break;
                }

                // Defender's counter-attack
                $counterResult = $this->performAttackTurn($defender, $attacker, $attackerHealth);
                $attackerHealth = $counterResult['remainingHealth'];
                $defenderDamageDealt += $counterResult['damage'];

                $this->combatLog[] = [
                    'turn' => $this->turn,
                    'phase' => 'counter',
                    'attacker' => $defender->name,
                    'damage' => $counterResult['damage'],
                    'critical' => $counterResult['critical'],
                    'dodged' => $counterResult['dodged'],
                    'remainingHealth' => $attackerHealth,
                ];
            }

            // Determine winner and apply results
            return $this->resolveCombat(
                $attacker,
                $defender,
                $attackerHealth,
                $defenderHealth,
                $attackerDamageDealt,
                $defenderDamageDealt
            );
        });
    }

    /**
     * Validate if attack can proceed.
     */
    protected function validateAttack(User $attacker, User $defender): array
    {
        if ($attacker->id === $defender->id) {
            return ['success' => false, 'message' => 'You cannot attack yourself.'];
        }

        if (! $attacker->canAttack()) {
            if ($attacker->energy < self::ENERGY_COST) {
                return ['success' => false, 'message' => 'Not enough energy. Need '.self::ENERGY_COST.' energy.'];
            }
            if ($attacker->isInHospital()) {
                return ['success' => false, 'message' => 'You are in the hospital.'];
            }
            if ($attacker->isInJail()) {
                return ['success' => false, 'message' => 'You are in jail.'];
            }
            if ($attacker->attack_cooldown_until?->isFuture()) {
                $seconds = $attacker->attack_cooldown_until->diffInSeconds(now());

                return ['success' => false, 'message' => "Attack on cooldown. Wait {$seconds} seconds."];
            }

            return ['success' => false, 'message' => 'You are not available to attack.'];
        }

        if (! $defender->isAvailable()) {
            if ($defender->isInHospital()) {
                return ['success' => false, 'message' => "{$defender->name} is in the hospital."];
            }
            if ($defender->isInJail()) {
                return ['success' => false, 'message' => "{$defender->name} is in jail."];
            }

            return ['success' => false, 'message' => "{$defender->name} is not available."];
        }

        return ['success' => true];
    }

    /**
     * Perform a single attack turn.
     */
    protected function performAttackTurn(User $attacker, User $defender, int $defenderCurrentHealth): array
    {
        // Check dodge
        if ($this->attemptDodge($defender, $attacker)) {
            return [
                'damage' => 0,
                'critical' => false,
                'dodged' => true,
                'remainingHealth' => $defenderCurrentHealth,
            ];
        }

        // Calculate base damage
        $damage = $this->calculateDamage($attacker, $defender);

        // Check critical hit
        $critical = $this->attemptCritical($attacker);
        if ($critical) {
            $damage = (int) ($damage * self::CRITICAL_HIT_MULTIPLIER);
        }

        // Apply damage
        $remainingHealth = max(0, $defenderCurrentHealth - $damage);

        return [
            'damage' => $damage,
            'critical' => $critical,
            'dodged' => false,
            'remainingHealth' => $remainingHealth,
        ];
    }

    /**
     * Calculate damage dealt by attacker.
     */
    protected function calculateDamage(User $attacker, User $defender): int
    {
        // Get equipped weapon bonus
        $weaponDamage = 0;
        $equippedWeapon = $attacker->getEquippedWeapon();
        if ($equippedWeapon && $equippedWeapon->item) {
            $weaponDamage = $equippedWeapon->item->damage;
        }

        // Get equipped armor reduction
        $armorReduction = 0;
        $equippedArmor = $defender->getEquippedArmor();
        if ($equippedArmor && $equippedArmor->item) {
            $armorReduction = $equippedArmor->item->armor;
        }

        // Base damage from strength
        $baseDamage = (int) ($attacker->strength * self::BASE_DAMAGE_MODIFIER);

        // Add weapon damage
        $totalDamage = $baseDamage + $weaponDamage;

        // Speed and dexterity provide accuracy bonus (more consistent damage)
        $accuracyBonus = ($attacker->speed + $attacker->dexterity) / 400;
        $damageVariance = rand(80, 120) / 100;
        $accuracyModifier = 1 - (1 - $damageVariance) * (1 - $accuracyBonus);

        $totalDamage = (int) ($totalDamage * $accuracyModifier);

        // Apply defense and armor reduction
        $defenseReduction = $defender->defense * 0.1 + $armorReduction;
        $totalDamage = max(1, $totalDamage - (int) $defenseReduction);

        return $totalDamage;
    }

    /**
     * Check if defender dodges the attack.
     */
    protected function attemptDodge(User $defender, User $attacker): bool
    {
        // Dodge chance based on speed difference and dexterity
        $speedDiff = $defender->speed - $attacker->speed;
        $dodgeChance = self::DODGE_BASE_CHANCE + ($speedDiff / 100) + ($defender->dexterity / 500);
        $dodgeChance = max(0, min(40, $dodgeChance)); // Cap at 40%

        return rand(1, 100) <= $dodgeChance;
    }

    /**
     * Check if attacker lands a critical hit.
     */
    protected function attemptCritical(User $attacker): bool
    {
        $critChance = self::CRITICAL_HIT_CHANCE + ($attacker->dexterity / 200);
        $critChance = min(35, $critChance); // Cap at 35%

        return rand(1, 100) <= $critChance;
    }

    /**
     * Check if defender escapes.
     */
    protected function attemptEscape(User $defender, User $attacker): bool
    {
        // Escape chance based on speed difference
        $speedDiff = $defender->speed - $attacker->speed;
        $escapeChance = self::ESCAPE_BASE_CHANCE + ($speedDiff / 50);
        $escapeChance = max(5, min(50, $escapeChance));

        return rand(1, 100) <= $escapeChance;
    }

    /**
     * Resolve combat and apply results.
     */
    protected function resolveCombat(
        User $attacker,
        User $defender,
        int $attackerHealth,
        int $defenderHealth,
        int $attackerDamageDealt,
        int $defenderDamageDealt
    ): array {
        $result = 'stalemate';
        $winnerId = null;
        $moneyStolen = 0;
        $respectGained = 0;
        $experienceGained = 0;
        $attackerHospitalTime = 0;
        $defenderHospitalTime = 0;

        // Check if defender escaped
        $defenderEscaped = ! empty(array_filter($this->combatLog, fn ($log) => ($log['phase'] ?? '') === 'escape' && ($log['escaped'] ?? false)
        ));

        if ($defenderEscaped) {
            $result = 'escape';
            $experienceGained = rand(1, 5);
        } elseif ($defenderHealth <= 0 && $attackerHealth > 0) {
            // Attacker wins
            $result = 'win';
            $winnerId = $attacker->id;

            // Calculate rewards
            $moneyStolen = (int) ($defender->wallet * self::MONEYSTEAL_PERCENT / 100);
            $respectGained = $this->calculateRespectGain($attacker, $defender);
            $experienceGained = $this->calculateExperienceGain($attacker, $defender);

            // Hospital time for defender
            $defenderHospitalTime = $this->calculateHospitalTime($attackerDamageDealt);

            // Update attacker stats
            $attacker->increment('attacks_won');
            $attacker->increment('money_mugged', $moneyStolen);
            $attacker->increment('damage_dealt', $attackerDamageDealt);
            $attacker->increment('experience', $experienceGained);
            $attacker->update(['health' => $attackerHealth]);

            // Update defender stats
            $defender->increment('defends_lost');
            $defender->increment('damage_received', $attackerDamageDealt);
            $defender->sendToHospital($defenderHospitalTime);

            // Transfer money
            if ($moneyStolen > 0) {
                Transaction::record($defender, 'attack', -$moneyStolen, 'money', $attacker, "Mugged by {$attacker->name}");
                $defender->decrement('wallet', $moneyStolen);

                Transaction::record($attacker, 'attack', $moneyStolen, 'money', $defender, "Mugged {$defender->name}");
                $attacker->increment('wallet', $moneyStolen);
            }
        } elseif ($attackerHealth <= 0 && $defenderHealth > 0) {
            // Defender wins
            $result = 'lose';
            $winnerId = $defender->id;

            // Hospital time for attacker
            $attackerHospitalTime = $this->calculateHospitalTime($defenderDamageDealt);

            // Update stats
            $attacker->increment('attacks_lost');
            $attacker->increment('damage_received', $defenderDamageDealt);
            $attacker->sendToHospital($attackerHospitalTime);

            $defender->increment('defends_won');
            $defender->increment('damage_dealt', $defenderDamageDealt);
            $defender->update(['health' => $defenderHealth]);
        } else {
            // Stalemate or both down
            $experienceGained = rand(1, 10);
            $attacker->increment('experience', $experienceGained);
            $attacker->update(['health' => max(1, $attackerHealth)]);
            $defender->update(['health' => max(1, $defenderHealth)]);
        }

        // Check for level up
        $this->checkLevelUp($attacker);

        // Faction war hit tracking
        $isWarHit = false;
        $attackerFactionId = null;
        $defenderFactionId = null;

        if ($attacker->faction_id && $defender->faction_id) {
            $attackerFaction = $attacker->faction;
            if ($attackerFaction->at_war && $attackerFaction->war_target_id === $defender->faction_id) {
                $isWarHit = true;
                $attackerFactionId = $attacker->faction_id;
                $defenderFactionId = $defender->faction_id;
                $respectGained = (int) ($respectGained * 1.5); // Bonus respect for war hits
            }
        }

        // Create combat log
        $combatLog = CombatLog::create([
            'attacker_id' => $attacker->id,
            'defender_id' => $defender->id,
            'winner_id' => $winnerId,
            'result' => $result,
            'attacker_damage_dealt' => $attackerDamageDealt,
            'defender_damage_dealt' => $defenderDamageDealt,
            'turns' => $this->turn,
            'money_stolen' => $moneyStolen,
            'respect_gained' => $respectGained,
            'experience_gained' => $experienceGained,
            'attacker_hospital_time' => $attackerHospitalTime,
            'defender_hospital_time' => $defenderHospitalTime,
            'log' => $this->combatLog,
            'is_war_hit' => $isWarHit,
            'attacker_faction_id' => $attackerFactionId,
            'defender_faction_id' => $defenderFactionId,
        ]);

        return [
            'success' => true,
            'result' => $result,
            'winner' => $winnerId === $attacker->id ? 'attacker' : ($winnerId === $defender->id ? 'defender' : null),
            'combatLog' => $combatLog,
            'summary' => [
                'turns' => $this->turn,
                'attackerDamage' => $attackerDamageDealt,
                'defenderDamage' => $defenderDamageDealt,
                'moneyStolen' => $moneyStolen,
                'experienceGained' => $experienceGained,
                'respectGained' => $respectGained,
                'attackerHospitalTime' => $attackerHospitalTime,
                'defenderHospitalTime' => $defenderHospitalTime,
            ],
            'log' => $this->combatLog,
        ];
    }

    /**
     * Calculate respect gained from winning.
     */
    protected function calculateRespectGain(User $attacker, User $defender): int
    {
        $levelDiff = $defender->level - $attacker->level;
        $baseRespect = 10;

        // Bonus for attacking higher level players
        if ($levelDiff > 0) {
            $baseRespect += $levelDiff * 5;
        }

        // Battle stats ratio bonus
        $statsRatio = $defender->getBattleStats() / max(1, $attacker->getBattleStats());
        if ($statsRatio > 1) {
            $baseRespect = (int) ($baseRespect * min(2, $statsRatio));
        }

        return max(1, $baseRespect);
    }

    /**
     * Calculate experience gained.
     */
    protected function calculateExperienceGain(User $attacker, User $defender): int
    {
        $levelDiff = $defender->level - $attacker->level;
        $baseExp = 50;

        if ($levelDiff > 0) {
            $baseExp += $levelDiff * 20;
        } elseif ($levelDiff < -5) {
            // Reduced exp for attacking much weaker players
            $baseExp = max(5, $baseExp + $levelDiff * 10);
        }

        return max(5, $baseExp + rand(-10, 10));
    }

    /**
     * Calculate hospital time based on damage taken.
     */
    protected function calculateHospitalTime(int $damageTaken): int
    {
        // Base: 1 minute per 10 damage, capped at 30 minutes
        $minutes = (int) ($damageTaken / 10);

        return min(1800, max(60, $minutes * 60));
    }

    /**
     * Check and process level up.
     */
    protected function checkLevelUp(User $user): void
    {
        while ($user->experience >= $user->experienceForNextLevel()) {
            $user->experience -= $user->experienceForNextLevel();
            $user->level++;
            $user->max_health += 10;
            $user->max_energy += 5;
            $user->health = $user->max_health;
            $user->energy = $user->max_energy;
        }
        $user->save();
    }
}
