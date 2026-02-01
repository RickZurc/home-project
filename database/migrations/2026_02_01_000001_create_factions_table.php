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
        Schema::create('factions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('tag', 10)->unique();
            $table->text('description')->nullable();
            $table->foreignId('leader_id')->constrained('users')->cascadeOnDelete();

            // Faction stats
            $table->integer('level')->default(1);
            $table->bigInteger('respect')->default(0);
            $table->bigInteger('treasury')->default(0);
            $table->integer('max_members')->default(10);

            // Territory
            $table->integer('territories_controlled')->default(0);

            // War status
            $table->boolean('at_war')->default(false);
            $table->foreignId('war_target_id')->nullable()->constrained('factions')->nullOnDelete();
            $table->timestamp('war_started_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factions');
    }
};
