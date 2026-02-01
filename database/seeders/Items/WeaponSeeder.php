<?php

namespace Database\Seeders\Items;

use App\Models\Item;
use Illuminate\Database\Seeder;

class WeaponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'name' => 'Pocket Knife',
                'slug' => 'pocket-knife',
                'description' => 'A small but sharp blade',
                'type' => 'weapon',
                'subtype' => 'melee',
                'rarity' => 'common',
                'damage' => 5,
                'armor' => 0,
                'accuracy' => 5,
                'base_price' => 500,
                'market_price' => 500,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 1,
            ],
            [
                'name' => 'Baseball Bat',
                'slug' => 'baseball-bat',
                'description' => 'Heavy wooden bat for serious damage',
                'type' => 'weapon',
                'subtype' => 'melee',
                'rarity' => 'common',
                'damage' => 10,
                'armor' => 0,
                'accuracy' => -5,
                'base_price' => 1000,
                'market_price' => 1000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 1,
            ],
            [
                'name' => 'Brass Knuckles',
                'slug' => 'brass-knuckles',
                'description' => 'Make your punches count',
                'type' => 'weapon',
                'subtype' => 'melee',
                'rarity' => 'uncommon',
                'damage' => 15,
                'armor' => 0,
                'accuracy' => 10,
                'base_price' => 2500,
                'market_price' => 2500,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 3,
            ],
            [
                'name' => 'Combat Knife',
                'slug' => 'combat-knife',
                'description' => 'Military-grade tactical knife',
                'type' => 'weapon',
                'subtype' => 'melee',
                'rarity' => 'uncommon',
                'damage' => 20,
                'armor' => 0,
                'accuracy' => 10,
                'base_price' => 5000,
                'market_price' => 5000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 5,
            ],
            [
                'name' => 'Pistol',
                'slug' => 'pistol',
                'description' => 'Standard 9mm handgun',
                'type' => 'weapon',
                'subtype' => 'ranged',
                'rarity' => 'rare',
                'damage' => 30,
                'armor' => 0,
                'accuracy' => 15,
                'base_price' => 15000,
                'market_price' => 15000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 10,
            ],
            [
                'name' => 'Shotgun',
                'slug' => 'shotgun',
                'description' => 'Devastating at close range',
                'type' => 'weapon',
                'subtype' => 'ranged',
                'rarity' => 'rare',
                'damage' => 45,
                'armor' => 0,
                'accuracy' => -10,
                'base_price' => 25000,
                'market_price' => 25000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 15,
            ],
            [
                'name' => 'Assault Rifle',
                'slug' => 'assault-rifle',
                'description' => 'Military-grade automatic weapon',
                'type' => 'weapon',
                'subtype' => 'ranged',
                'rarity' => 'epic',
                'damage' => 50,
                'armor' => 0,
                'accuracy' => 20,
                'base_price' => 75000,
                'market_price' => 75000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 25,
            ],
            [
                'name' => 'Legendary Blade',
                'slug' => 'legendary-blade',
                'description' => 'A mythical weapon of immense power',
                'type' => 'weapon',
                'subtype' => 'melee',
                'rarity' => 'legendary',
                'damage' => 75,
                'armor' => 0,
                'accuracy' => 25,
                'base_price' => 250000,
                'market_price' => 250000,
                'tradeable' => true,
                'consumable' => false,
                'level_required' => 40,
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
