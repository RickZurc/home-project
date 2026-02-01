<?php

namespace Database\Seeders\Items;

use App\Models\Item;
use Illuminate\Database\Seeder;

class ConsumableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            // Health Items
            [
                'name' => 'First Aid Kit',
                'slug' => 'first-aid-kit',
                'description' => 'Restores 25 health',
                'type' => 'consumable',
                'rarity' => 'common',
                'damage' => 0,
                'armor' => 0,
                'accuracy' => 0,
                'base_price' => 250,
                'market_price' => 250,
                'tradeable' => true,
                'consumable' => true,
                'uses' => 1,
                'effects' => json_encode(['heal' => 25]),
                'level_required' => 1,
            ],
            [
                'name' => 'Medical Kit',
                'slug' => 'medical-kit',
                'description' => 'Restores 50 health',
                'type' => 'consumable',
                'rarity' => 'uncommon',
                'damage' => 0,
                'armor' => 0,
                'accuracy' => 0,
                'base_price' => 750,
                'market_price' => 750,
                'tradeable' => true,
                'consumable' => true,
                'uses' => 1,
                'effects' => json_encode(['heal' => 50]),
                'level_required' => 1,
            ],
            [
                'name' => 'Emergency Treatment',
                'slug' => 'emergency-treatment',
                'description' => 'Fully restores health',
                'type' => 'consumable',
                'rarity' => 'rare',
                'damage' => 0,
                'armor' => 0,
                'accuracy' => 0,
                'base_price' => 2500,
                'market_price' => 2500,
                'tradeable' => true,
                'consumable' => true,
                'uses' => 1,
                'effects' => json_encode(['heal' => 100]),
                'level_required' => 1,
            ],

            // Energy Items
            [
                'name' => 'Energy Drink',
                'slug' => 'energy-drink',
                'description' => 'Restores 25 energy',
                'type' => 'consumable',
                'rarity' => 'common',
                'damage' => 0,
                'armor' => 0,
                'accuracy' => 0,
                'base_price' => 100,
                'market_price' => 100,
                'tradeable' => true,
                'consumable' => true,
                'uses' => 1,
                'effects' => json_encode(['energy' => 25]),
                'level_required' => 1,
            ],
            [
                'name' => 'Adrenaline Shot',
                'slug' => 'adrenaline-shot',
                'description' => 'Restores 50 energy instantly',
                'type' => 'consumable',
                'rarity' => 'uncommon',
                'damage' => 0,
                'armor' => 0,
                'accuracy' => 0,
                'base_price' => 350,
                'market_price' => 350,
                'tradeable' => true,
                'consumable' => true,
                'uses' => 1,
                'effects' => json_encode(['energy' => 50]),
                'level_required' => 1,
            ],

            // Nerve Items
            [
                'name' => 'Nerve Pills',
                'slug' => 'nerve-pills',
                'description' => 'Restores 10 nerve',
                'type' => 'consumable',
                'rarity' => 'uncommon',
                'damage' => 0,
                'armor' => 0,
                'accuracy' => 0,
                'base_price' => 500,
                'market_price' => 500,
                'tradeable' => true,
                'consumable' => true,
                'uses' => 1,
                'effects' => json_encode(['nerve' => 10]),
                'level_required' => 1,
            ],

            // Happiness Items
            [
                'name' => 'Happy Pills',
                'slug' => 'happy-pills',
                'description' => 'Restores 50 happiness',
                'type' => 'consumable',
                'rarity' => 'common',
                'damage' => 0,
                'armor' => 0,
                'accuracy' => 0,
                'base_price' => 200,
                'market_price' => 200,
                'tradeable' => true,
                'consumable' => true,
                'uses' => 1,
                'effects' => json_encode(['happiness' => 50]),
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
