<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class RegeneratePlayerStats extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'game:regenerate-stats';

    /**
     * The console command description.
     */
    protected $description = 'Regenerate player energy, nerve, and happiness over time';

    /**
     * Regeneration rates per tick (should run every 5 minutes)
     */
    protected const ENERGY_REGEN = 5;

    protected const NERVE_REGEN = 1;

    protected const HAPPINESS_REGEN = 2;

    protected const HEALTH_REGEN = 5;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Regenerating player stats...');

        // Only regenerate stats for active players (not hospitalized or jailed)
        $activePlayers = User::query()
            ->where(function ($query) {
                $query->whereNull('hospital_until')
                    ->orWhere('hospital_until', '<', now());
            })
            ->where(function ($query) {
                $query->whereNull('jail_until')
                    ->orWhere('jail_until', '<', now());
            })
            ->get();

        $updated = 0;

        foreach ($activePlayers as $player) {
            $changed = false;

            // Regenerate energy
            if ($player->energy < $player->max_energy) {
                $newEnergy = min($player->max_energy, $player->energy + self::ENERGY_REGEN);
                if ($newEnergy !== $player->energy) {
                    $player->energy = $newEnergy;
                    $changed = true;
                }
            }

            // Regenerate nerve
            if ($player->nerve < $player->max_nerve) {
                $newNerve = min($player->max_nerve, $player->nerve + self::NERVE_REGEN);
                if ($newNerve !== $player->nerve) {
                    $player->nerve = $newNerve;
                    $changed = true;
                }
            }

            // Regenerate happiness
            if ($player->happiness < $player->max_happiness) {
                $newHappiness = min($player->max_happiness, $player->happiness + self::HAPPINESS_REGEN);
                if ($newHappiness !== $player->happiness) {
                    $player->happiness = $newHappiness;
                    $changed = true;
                }
            }

            // Regenerate health (slower than other stats)
            if ($player->current_health < $player->max_health) {
                $newHealth = min($player->max_health, $player->current_health + self::HEALTH_REGEN);
                if ($newHealth !== $player->current_health) {
                    $player->current_health = $newHealth;
                    $changed = true;
                }
            }

            if ($changed) {
                $player->save();
                $updated++;
            }
        }

        $this->info("Updated stats for {$updated} players.");

        return Command::SUCCESS;
    }
}
