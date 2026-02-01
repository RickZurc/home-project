<?php

namespace App\Actions\Game;

use App\Models\Crime;
use App\Models\CrimeLog;
use App\Models\GymActivity;
use App\Models\Inventory;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class GameService
{
    // Gym configuration
    protected const GYM_ENERGY_COST = 5;

    protected const GYM_BASE_STAT_GAIN = 1;

    protected const GYM_HAPPINESS_BONUS = 0.5; // 50% bonus at max happiness

    // Bank configuration
    protected const BANK_INTEREST_RATE = 0.001; // 0.1% daily

    /**
     * Train a stat at the gym.
     */
    public function train(User $user, string $stat, int $energyToSpend = 5): array
    {
        $validStats = ['strength', 'speed', 'defense', 'dexterity'];

        if (! in_array($stat, $validStats)) {
            return ['success' => false, 'message' => 'Invalid stat.'];
        }

        if (! $user->canTrain()) {
            if ($user->energy < self::GYM_ENERGY_COST) {
                return ['success' => false, 'message' => 'Not enough energy.'];
            }

            return ['success' => false, 'message' => 'You are not available to train.'];
        }

        $energyToSpend = min($energyToSpend, $user->energy);
        $energyToSpend = max(self::GYM_ENERGY_COST, $energyToSpend);

        return DB::transaction(function () use ($user, $stat, $energyToSpend) {
            $statBefore = $user->{$stat};

            // Calculate stat gain with happiness bonus
            $happinessMultiplier = 1 + (($user->happiness / $user->max_happiness) * self::GYM_HAPPINESS_BONUS);
            $baseGain = ($energyToSpend / self::GYM_ENERGY_COST) * self::GYM_BASE_STAT_GAIN;
            $statGain = (int) ceil($baseGain * $happinessMultiplier * (1 + rand(-10, 10) / 100));

            // Apply diminishing returns for high stats
            $currentStat = $user->{$stat};
            if ($currentStat > 1000) {
                $diminishingFactor = 1000 / $currentStat;
                $statGain = max(1, (int) ($statGain * $diminishingFactor));
            }

            // Update user (skip energy cost for test user)
            if (! $user->isTestUser()) {
                $user->decrement('energy', $energyToSpend);
                $user->decrement('happiness', min(5, (int) ($energyToSpend / 2)));
            }
            $user->increment($stat, $statGain);
            $user->update(['last_action_at' => now()]);

            // Log activity
            GymActivity::create([
                'user_id' => $user->id,
                'stat_trained' => $stat,
                'energy_spent' => $energyToSpend,
                'stat_gained' => $statGain,
                'stat_before' => $statBefore,
                'stat_after' => $user->fresh()->{$stat},
            ]);

            return [
                'success' => true,
                'stat' => $stat,
                'gained' => $statGain,
                'newValue' => $user->{$stat},
                'energyRemaining' => $user->energy,
            ];
        });
    }

    /**
     * Commit a crime.
     */
    public function commitCrime(User $user, Crime $crime): array
    {
        if (! $crime->canAttempt($user)) {
            if ($user->level < $crime->level_required) {
                return ['success' => false, 'message' => "You need to be level {$crime->level_required}."];
            }
            if ($user->nerve < $crime->nerve_cost) {
                return ['success' => false, 'message' => "Not enough nerve. Need {$crime->nerve_cost}."];
            }

            return ['success' => false, 'message' => 'You are not available to commit crimes.'];
        }

        return DB::transaction(function () use ($user, $crime) {
            // Spend nerve (skip for test user)
            if (! $user->isTestUser()) {
                $user->decrement('nerve', $crime->nerve_cost);
            }
            $user->update(['last_action_at' => now()]);

            // Calculate success
            $successRate = $crime->calculateSuccessRate($user);
            $roll = rand(1, 100);
            $success = $roll <= $successRate;

            $logData = [
                'user_id' => $user->id,
                'crime_id' => $crime->id,
                'success' => $success,
                'nerve_spent' => $crime->nerve_cost,
                'money_gained' => 0,
                'experience_gained' => 0,
                'item_gained_id' => null,
                'jail_time' => 0,
                'hospital_time' => 0,
                'message' => '',
            ];

            if ($success) {
                // Rewards
                $money = $crime->getMoneyReward();
                $experience = $crime->getExperienceReward();
                $item = $crime->getRandomItem();

                $logData['money_gained'] = $money;
                $logData['experience_gained'] = $experience;
                $logData['message'] = $this->getCrimeSuccessMessage($crime);

                if ($money > 0) {
                    Transaction::record($user, 'crime', $money, 'money', null, "Committed {$crime->name}");
                    $user->increment('wallet', $money);
                }

                $user->increment('experience', $experience);
                $user->increment('crimes_committed');

                if ($item) {
                    $logData['item_gained_id'] = $item->id;
                    $inventory = Inventory::firstOrCreate(
                        ['user_id' => $user->id, 'item_id' => $item->id, 'equipped' => false],
                        ['quantity' => 0]
                    );
                    $inventory->addQuantity(1);
                }

                // Check level up
                $this->checkLevelUp($user);
            } else {
                // Failure - jail or hospital
                $jailTime = $crime->getJailTime();
                $hospitalTime = $crime->getHospitalTime();

                if ($jailTime > 0 && $hospitalTime > 0) {
                    // Random which one applies
                    if (rand(0, 1) === 0) {
                        $hospitalTime = 0;
                    } else {
                        $jailTime = 0;
                    }
                }

                $logData['jail_time'] = $jailTime;
                $logData['hospital_time'] = $hospitalTime;
                $logData['message'] = $this->getCrimeFailureMessage($crime);

                if ($jailTime > 0) {
                    $user->sendToJail($jailTime);
                } elseif ($hospitalTime > 0) {
                    $user->sendToHospital($hospitalTime);
                }
            }

            $crimeLog = CrimeLog::create($logData);

            return [
                'success' => true,
                'crimeSuccess' => $success,
                'log' => $crimeLog,
                'roll' => $roll,
                'successRate' => $successRate,
                'rewards' => $success ? [
                    'money' => $logData['money_gained'],
                    'experience' => $logData['experience_gained'],
                    'item' => $item?->name,
                ] : null,
                'penalty' => ! $success ? [
                    'jailTime' => $jailTime ?? 0,
                    'hospitalTime' => $hospitalTime ?? 0,
                ] : null,
                'message' => $logData['message'],
            ];
        });
    }

    /**
     * Deposit money to bank.
     */
    public function bankDeposit(User $user, int $amount): array
    {
        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Invalid amount.'];
        }

        if ($user->wallet < $amount) {
            return ['success' => false, 'message' => 'Insufficient funds in wallet.'];
        }

        return DB::transaction(function () use ($user, $amount) {
            Transaction::record($user, 'deposit', -$amount, 'money', null, 'Bank deposit');
            Transaction::record($user, 'deposit', $amount, 'bank', null, 'Bank deposit');

            $user->decrement('wallet', $amount);
            $user->increment('bank', $amount);

            return [
                'success' => true,
                'wallet' => $user->wallet,
                'bank' => $user->bank,
            ];
        });
    }

    /**
     * Withdraw money from bank.
     */
    public function bankWithdraw(User $user, int $amount): array
    {
        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Invalid amount.'];
        }

        if ($user->bank < $amount) {
            return ['success' => false, 'message' => 'Insufficient funds in bank.'];
        }

        return DB::transaction(function () use ($user, $amount) {
            Transaction::record($user, 'withdraw', $amount, 'money', null, 'Bank withdrawal');
            Transaction::record($user, 'withdraw', -$amount, 'bank', null, 'Bank withdrawal');

            $user->increment('wallet', $amount);
            $user->decrement('bank', $amount);

            return [
                'success' => true,
                'wallet' => $user->wallet,
                'bank' => $user->bank,
            ];
        });
    }

    /**
     * Transfer money to another player.
     */
    public function transferMoney(User $sender, User $recipient, int $amount): array
    {
        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Invalid amount.'];
        }

        if ($sender->id === $recipient->id) {
            return ['success' => false, 'message' => 'Cannot transfer to yourself.'];
        }

        if ($sender->wallet < $amount) {
            return ['success' => false, 'message' => 'Insufficient funds.'];
        }

        return DB::transaction(function () use ($sender, $recipient, $amount) {
            Transaction::record($sender, 'transfer', -$amount, 'money', $recipient, "Transfer to {$recipient->name}");
            Transaction::record($recipient, 'transfer', $amount, 'money', $sender, "Transfer from {$sender->name}");

            $sender->decrement('wallet', $amount);
            $recipient->increment('wallet', $amount);

            return [
                'success' => true,
                'wallet' => $sender->wallet,
                'recipientName' => $recipient->name,
                'amount' => $amount,
            ];
        });
    }

    /**
     * Use a consumable item.
     */
    public function useItem(User $user, Inventory $inventory): array
    {
        if ($inventory->user_id !== $user->id) {
            return ['success' => false, 'message' => 'Item not found.'];
        }

        $item = $inventory->item;

        if (! $item->consumable) {
            return ['success' => false, 'message' => 'This item cannot be used.'];
        }

        return DB::transaction(function () use ($user, $inventory, $item) {
            $effects = $item->effects ?? [];
            $appliedEffects = [];

            foreach ($effects as $effect => $value) {
                switch ($effect) {
                    case 'heal':
                        $healed = min($value, $user->max_health - $user->health);
                        $user->increment('health', $healed);
                        $appliedEffects[] = "Restored {$healed} health";
                        break;

                    case 'energy':
                        $restored = min($value, $user->max_energy - $user->energy);
                        $user->increment('energy', $restored);
                        $appliedEffects[] = "Restored {$restored} energy";
                        break;

                    case 'nerve':
                        $restored = min($value, $user->max_nerve - $user->nerve);
                        $user->increment('nerve', $restored);
                        $appliedEffects[] = "Restored {$restored} nerve";
                        break;

                    case 'happiness':
                        $restored = min($value, $user->max_happiness - $user->happiness);
                        $user->increment('happiness', $restored);
                        $appliedEffects[] = "Restored {$restored} happiness";
                        break;

                    case 'hospital_out':
                        if ($user->isInHospital()) {
                            $user->release();
                            $appliedEffects[] = 'Released from hospital';
                        }
                        break;

                    case 'jail_out':
                        if ($user->isInJail()) {
                            $user->release();
                            $appliedEffects[] = 'Released from jail';
                        }
                        break;

                    case 'stat_boost':
                        foreach ($value as $stat => $boost) {
                            if (in_array($stat, ['strength', 'speed', 'defense', 'dexterity'])) {
                                $user->increment($stat, $boost);
                                $appliedEffects[] = "+{$boost} {$stat}";
                            }
                        }
                        break;
                }
            }

            // Consume the item
            $inventory->use();

            return [
                'success' => true,
                'item' => $item->name,
                'effects' => $appliedEffects,
            ];
        });
    }

    /**
     * Regenerate stats (called by scheduler).
     */
    public function regenerateStats(User $user): void
    {
        $updates = [];

        // Health regeneration (5% per tick if not in hospital/jail)
        if ($user->isAvailable() && $user->health < $user->max_health) {
            $regen = max(1, (int) ($user->max_health * 0.05));
            $updates['health'] = min($user->max_health, $user->health + $regen);
        }

        // Energy regeneration (5 per tick)
        if ($user->energy < $user->max_energy) {
            $updates['energy'] = min($user->max_energy, $user->energy + 5);
        }

        // Nerve regeneration (1 per tick)
        if ($user->nerve < $user->max_nerve) {
            $updates['nerve'] = min($user->max_nerve, $user->nerve + 1);
        }

        // Happiness regeneration (2 per tick)
        if ($user->happiness < $user->max_happiness) {
            $updates['happiness'] = min($user->max_happiness, $user->happiness + 2);
        }

        // Check if status has expired
        if ($user->status !== 'okay' && $user->status_until && $user->status_until->isPast()) {
            $updates['status'] = 'okay';
            $updates['status_until'] = null;
            if ($user->health === 0) {
                $updates['health'] = (int) ($user->max_health * 0.25); // 25% health on release
            }
        }

        if (! empty($updates)) {
            $user->update($updates);
        }
    }

    /**
     * Process bank interest (called daily by scheduler).
     */
    public function processBankInterest(): int
    {
        $count = 0;

        User::where('bank', '>', 0)->chunk(100, function ($users) use (&$count) {
            foreach ($users as $user) {
                $interest = (int) ($user->bank * self::BANK_INTEREST_RATE);
                if ($interest > 0) {
                    Transaction::record($user, 'interest', $interest, 'bank', null, 'Daily interest');
                    $user->increment('bank', $interest);
                    $count++;
                }
            }
        });

        return $count;
    }

    /**
     * Get crime success message.
     */
    protected function getCrimeSuccessMessage(Crime $crime): string
    {
        $messages = [
            'You successfully completed the crime.',
            'The job went smoothly. Nice work.',
            'Success! You got away clean.',
            'Everything went according to plan.',
        ];

        return $messages[array_rand($messages)];
    }

    /**
     * Get crime failure message.
     */
    protected function getCrimeFailureMessage(Crime $crime): string
    {
        $messages = [
            'You were caught in the act!',
            'Things went wrong and you got busted.',
            'The cops arrived before you could escape.',
            'A witness spotted you and called the authorities.',
        ];

        return $messages[array_rand($messages)];
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
            $user->max_nerve += 2;
            $user->health = $user->max_health;
            $user->energy = $user->max_energy;
            $user->nerve = $user->max_nerve;
        }
        $user->save();
    }
}
