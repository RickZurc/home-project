<?php

namespace Database\Seeders;

use App\Models\Crime;
use App\Models\Item;
use Illuminate\Database\Seeder;

class CrimeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Build a slug -> ID lookup map for items
        $itemIds = Item::pluck('id', 'slug')->toArray();

        $crimes = [
            [
                'name' => 'Search for Cash',
                'slug' => 'search-for-cash',
                'description' => 'Search the streets for loose change',
                'base_success_rate' => 95,
                'nerve_cost' => 1,
                'min_money' => 10,
                'max_money' => 50,
                'min_experience' => 1,
                'max_experience' => 2,
                'jail_time_min' => 60,
                'jail_time_max' => 120,
                'level_required' => 1,
                'cooldown' => 30,
                'possible_items' => ['cigarettes', 'sunglasses'],
            ],
            [
                'name' => 'Pickpocket',
                'slug' => 'pickpocket',
                'description' => 'Steal wallets from unsuspecting pedestrians',
                'base_success_rate' => 80,
                'nerve_cost' => 2,
                'min_money' => 50,
                'max_money' => 200,
                'min_experience' => 2,
                'max_experience' => 4,
                'jail_time_min' => 180,
                'jail_time_max' => 300,
                'level_required' => 1,
                'cooldown' => 45,
                'possible_items' => ['stolen-watch', 'cheap-phone', 'wallet'],
            ],
            [
                'name' => 'Shoplift',
                'slug' => 'shoplift',
                'description' => 'Steal items from local stores',
                'base_success_rate' => 70,
                'nerve_cost' => 3,
                'min_money' => 100,
                'max_money' => 500,
                'min_experience' => 4,
                'max_experience' => 6,
                'jail_time_min' => 300,
                'jail_time_max' => 480,
                'level_required' => 3,
                'cooldown' => 60,
                'possible_items' => ['sunglasses', 'gold-chain', 'smartphone'],
            ],
            [
                'name' => 'Mug Someone',
                'slug' => 'mug-someone',
                'description' => 'Threaten someone and take their valuables',
                'base_success_rate' => 60,
                'nerve_cost' => 5,
                'min_money' => 300,
                'max_money' => 1000,
                'min_experience' => 8,
                'max_experience' => 12,
                'jail_time_min' => 600,
                'jail_time_max' => 900,
                'hospital_time_min' => 0,
                'hospital_time_max' => 300,
                'level_required' => 5,
                'cooldown' => 120,
                'possible_items' => ['gold-chain', 'smartphone', 'designer-handbag'],
            ],
            [
                'name' => 'Steal a Car',
                'slug' => 'steal-a-car',
                'description' => 'Break into and hotwire a parked vehicle',
                'base_success_rate' => 50,
                'nerve_cost' => 8,
                'min_money' => 1000,
                'max_money' => 5000,
                'min_experience' => 15,
                'max_experience' => 25,
                'jail_time_min' => 900,
                'jail_time_max' => 1200,
                'level_required' => 10,
                'cooldown' => 180,
                'possible_items' => ['car-stereo', 'laptop', 'diamond-ring'],
            ],
            [
                'name' => 'Armed Robbery',
                'slug' => 'armed-robbery',
                'description' => 'Rob a convenience store at gunpoint',
                'base_success_rate' => 40,
                'nerve_cost' => 10,
                'min_money' => 2500,
                'max_money' => 10000,
                'min_experience' => 25,
                'max_experience' => 40,
                'jail_time_min' => 1200,
                'jail_time_max' => 1800,
                'hospital_time_min' => 0,
                'hospital_time_max' => 600,
                'level_required' => 15,
                'cooldown' => 300,
                'possible_items' => ['diamond-ring', 'rolex-watch', 'cash-stack', 'jewelry-box'],
            ],
            [
                'name' => 'Bank Heist',
                'slug' => 'bank-heist',
                'description' => 'Plan and execute a daring bank robbery',
                'base_success_rate' => 25,
                'nerve_cost' => 20,
                'min_money' => 10000,
                'max_money' => 50000,
                'min_experience' => 60,
                'max_experience' => 100,
                'jail_time_min' => 1800,
                'jail_time_max' => 2700,
                'hospital_time_min' => 0,
                'hospital_time_max' => 900,
                'level_required' => 25,
                'cooldown' => 600,
                'possible_items' => ['safe-contents', 'gold-bars', 'rare-painting'],
            ],
            [
                'name' => 'Kidnapping',
                'slug' => 'kidnapping',
                'description' => 'Kidnap a wealthy target for ransom',
                'base_success_rate' => 20,
                'nerve_cost' => 25,
                'min_money' => 25000,
                'max_money' => 100000,
                'min_experience' => 80,
                'max_experience' => 120,
                'jail_time_min' => 2700,
                'jail_time_max' => 3600,
                'hospital_time_min' => 0,
                'hospital_time_max' => 1200,
                'level_required' => 35,
                'cooldown' => 900,
                'possible_items' => ['briefcase-diamonds', 'crown-jewels'],
            ],
            [
                'name' => 'Hack a Corporation',
                'slug' => 'hack-a-corporation',
                'description' => 'Infiltrate corporate systems and steal data',
                'base_success_rate' => 30,
                'nerve_cost' => 15,
                'min_money' => 5000,
                'max_money' => 25000,
                'min_experience' => 40,
                'max_experience' => 60,
                'jail_time_min' => 1500,
                'jail_time_max' => 2100,
                'level_required' => 20,
                'cooldown' => 420,
                'possible_items' => ['laptop', 'black-market-data'],
            ],
            [
                'name' => 'Drug Trafficking',
                'slug' => 'drug-trafficking',
                'description' => 'Move illegal substances across borders',
                'base_success_rate' => 35,
                'nerve_cost' => 12,
                'min_money' => 5000,
                'max_money' => 30000,
                'min_experience' => 50,
                'max_experience' => 70,
                'jail_time_min' => 1800,
                'jail_time_max' => 2400,
                'level_required' => 18,
                'cooldown' => 480,
                'possible_items' => ['cash-stack', 'gold-bars'],
            ],
        ];

        foreach ($crimes as $crime) {
            // Convert item slugs to IDs
            $crime['possible_items'] = array_map(
                fn ($slug) => $itemIds[$slug] ?? null,
                $crime['possible_items']
            );
            $crime['possible_items'] = array_filter($crime['possible_items']);

            Crime::updateOrCreate(
                ['slug' => $crime['slug']],
                $crime
            );
        }
    }
}
