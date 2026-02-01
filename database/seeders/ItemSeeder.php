<?php

namespace Database\Seeders;

use Database\Seeders\Items\ArmorSeeder;
use Database\Seeders\Items\BoosterSeeder;
use Database\Seeders\Items\ConsumableSeeder;
use Database\Seeders\Items\LootSeeder;
use Database\Seeders\Items\WeaponSeeder;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            WeaponSeeder::class,
            ArmorSeeder::class,
            ConsumableSeeder::class,
            BoosterSeeder::class,
            LootSeeder::class,
        ]);
    }
}
