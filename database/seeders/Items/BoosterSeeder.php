<?php

namespace Database\Seeders\Items;

use App\Models\Item;
use Illuminate\Database\Seeder;

class BoosterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'name' => 'XP Booster',
                'slug' => 'xp-booster',
                'description' => '+50% XP gain for 1 hour',
                'type' => 'booster',
                'subtype' => 'temporary',
                'rarity' => 'rare',
                'damage' => 0,
                'armor' => 0,
                'accuracy' => 0,
                'base_price' => 10000,
                'market_price' => 10000,
                'tradeable' => true,
                'consumable' => true,
                'uses' => 1,
                'effects' => json_encode(['xp_boost' => 50, 'duration' => 3600]),
                'level_required' => 1,
            ],
            [
                'name' => 'Crime Success Booster',
                'slug' => 'crime-success-booster',
                'description' => '+25% crime success rate for 1 hour',
                'type' => 'booster',
                'subtype' => 'temporary',
                'rarity' => 'rare',
                'damage' => 0,
                'armor' => 0,
                'accuracy' => 0,
                'base_price' => 15000,
                'market_price' => 15000,
                'tradeable' => true,
                'consumable' => true,
                'uses' => 1,
                'effects' => json_encode(['crime_boost' => 25, 'duration' => 3600]),
                'level_required' => 1,
            ],
        ];

        foreach ($items as $item) {
            Item::updateOrCreate(
                ['slug' => $item['slug']],
                $item
            );
        }
    }
}
