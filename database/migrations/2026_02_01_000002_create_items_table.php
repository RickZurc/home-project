<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('type'); // weapon, armor, consumable, booster, special
            $table->string('subtype')->nullable(); // melee, ranged, temporary, permanent

            // Base stats
            $table->integer('damage')->default(0);
            $table->integer('accuracy')->default(0);
            $table->integer('armor')->default(0);

            // Effects (JSON for flexibility)
            $table->json('effects')->nullable();

            // Economy
            $table->bigInteger('base_price')->default(0);
            $table->bigInteger('market_price')->default(0);
            $table->integer('circulation')->default(0); // total in game

            // Requirements
            $table->integer('level_required')->default(1);
            $table->json('stats_required')->nullable();

            // Properties
            $table->boolean('tradeable')->default(true);
            $table->boolean('consumable')->default(false);
            $table->integer('uses')->nullable(); // for consumables
            $table->string('rarity')->default('common'); // common, uncommon, rare, epic, legendary

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
