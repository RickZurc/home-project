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
        Schema::create('combat_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attacker_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('defender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('winner_id')->nullable()->constrained('users')->nullOnDelete();

            // Combat result
            $table->string('result'); // win, lose, stalemate, escape
            $table->integer('attacker_damage_dealt')->default(0);
            $table->integer('defender_damage_dealt')->default(0);
            $table->integer('turns')->default(0);

            // Rewards/Losses
            $table->bigInteger('money_stolen')->default(0);
            $table->integer('respect_gained')->default(0);
            $table->integer('experience_gained')->default(0);

            // Hospital time in seconds
            $table->integer('attacker_hospital_time')->default(0);
            $table->integer('defender_hospital_time')->default(0);

            // Full combat log (JSON array of turns)
            $table->json('log')->nullable();

            // Faction war related
            $table->boolean('is_war_hit')->default(false);
            $table->foreignId('attacker_faction_id')->nullable()->constrained('factions')->nullOnDelete();
            $table->foreignId('defender_faction_id')->nullable()->constrained('factions')->nullOnDelete();

            $table->timestamps();

            $table->index(['attacker_id', 'created_at']);
            $table->index(['defender_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('combat_logs');
    }
};
