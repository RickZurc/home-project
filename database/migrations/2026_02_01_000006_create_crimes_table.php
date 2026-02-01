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
        Schema::create('crimes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Requirements
            $table->integer('nerve_cost')->default(1);
            $table->integer('level_required')->default(1);

            // Success/Failure
            $table->integer('base_success_rate')->default(50); // percentage
            $table->json('stat_modifiers')->nullable(); // which stats affect success

            // Rewards
            $table->bigInteger('min_money')->default(0);
            $table->bigInteger('max_money')->default(0);
            $table->integer('min_experience')->default(0);
            $table->integer('max_experience')->default(0);
            $table->json('possible_items')->nullable(); // item IDs that can drop

            // Failure penalties
            $table->integer('jail_time_min')->default(0); // seconds
            $table->integer('jail_time_max')->default(0);
            $table->integer('hospital_time_min')->default(0);
            $table->integer('hospital_time_max')->default(0);

            // Cooldown
            $table->integer('cooldown')->default(60); // seconds

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crimes');
    }
};
