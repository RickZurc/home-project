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
        Schema::table('users', function (Blueprint $table) {
            // Core Stats
            $table->integer('level')->default(1);
            $table->bigInteger('experience')->default(0);

            // Regenerating Stats
            $table->integer('health')->default(100);
            $table->integer('max_health')->default(100);
            $table->integer('energy')->default(100);
            $table->integer('max_energy')->default(100);
            $table->integer('nerve')->default(50);
            $table->integer('max_nerve')->default(50);
            $table->integer('happiness')->default(100);
            $table->integer('max_happiness')->default(100);

            // Combat Stats
            $table->bigInteger('strength')->default(10);
            $table->bigInteger('speed')->default(10);
            $table->bigInteger('defense')->default(10);
            $table->bigInteger('dexterity')->default(10);

            // Economy
            $table->bigInteger('wallet')->default(1000);
            $table->bigInteger('bank')->default(0);
            $table->integer('points')->default(0);

            // State
            $table->string('status')->default('okay'); // okay, hospital, jail, traveling
            $table->timestamp('status_until')->nullable();
            $table->timestamp('last_action_at')->nullable();

            // Combat cooldowns
            $table->timestamp('attack_cooldown_until')->nullable();

            // Faction
            $table->foreignId('faction_id')->nullable()->constrained()->nullOnDelete();
            $table->string('faction_role')->nullable();

            // Statistics
            $table->integer('attacks_won')->default(0);
            $table->integer('attacks_lost')->default(0);
            $table->integer('defends_won')->default(0);
            $table->integer('defends_lost')->default(0);
            $table->bigInteger('damage_dealt')->default(0);
            $table->bigInteger('damage_received')->default(0);
            $table->integer('crimes_committed')->default(0);
            $table->bigInteger('money_mugged')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['faction_id']);
            $table->dropColumn([
                'level', 'experience',
                'health', 'max_health', 'energy', 'max_energy',
                'nerve', 'max_nerve', 'happiness', 'max_happiness',
                'strength', 'speed', 'defense', 'dexterity',
                'wallet', 'bank', 'points',
                'status', 'status_until', 'last_action_at',
                'attack_cooldown_until',
                'faction_id', 'faction_role',
                'attacks_won', 'attacks_lost', 'defends_won', 'defends_lost',
                'damage_dealt', 'damage_received', 'crimes_committed', 'money_mugged',
            ]);
        });
    }
};
