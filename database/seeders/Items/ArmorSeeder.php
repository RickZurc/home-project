<?php

namespace Database\Seeders\Items;

use App\Models\Item;
use Illuminate\Database\Seeder;

class ArmorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'name' => 'Leather Jacket',
                'slug' => 'leather-jacket',
                'description' => 'Basic protection against light attacks',
                'type' => 'armor',
                'rarity' => 'common',
                'damage' => 0,
                'armor' => 5,
                'accuracy' => 0,
                'base_price' => 750,
                'market_price' => 750,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 1,
            ],
            [
                'name' => 'Kevlar Vest',
                'slug' => 'kevlar-vest',
                'description' => 'Bulletproof vest for serious protection',
                'type' => 'armor',
                'rarity' => 'uncommon',
                'damage' => 0,
                'armor' => 15,
                'accuracy' => 0,
                'base_price' => 5000,
                'market_price' => 5000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 5,
            ],
            [
                'name' => 'Tactical Body Armor',
                'slug' => 'tactical-body-armor',
                'description' => 'Military-grade full body protection',
                'type' => 'armor',
                'rarity' => 'rare',
                'damage' => 0,
                'armor' => 30,
                'accuracy' => -5,
                'base_price' => 25000,
                'market_price' => 25000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 15,
            ],
            [
                'name' => 'Exoskeleton Suit',
                'slug' => 'exoskeleton-suit',
                'description' => 'Advanced powered armor with enhanced protection',
                'type' => 'armor',
                'rarity' => 'epic',
                'damage' => 0,
                'armor' => 50,
                'accuracy' => 0,
                'base_price' => 100000,
                'market_price' => 100000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 30,
            ],
            [
                'name' => 'Mythical Armor',
                'slug' => 'mythical-armor',
                'description' => 'Legendary armor of the ancients',
                'type' => 'armor',
                'rarity' => 'legendary',
                'damage' => 0,
                'armor' => 75,
                'accuracy' => 10,
                'base_price' => 300000,
                'market_price' => 300000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 45,
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
