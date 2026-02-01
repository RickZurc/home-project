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
        Schema::create('crime_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('crime_id')->constrained()->cascadeOnDelete();

            $table->boolean('success');
            $table->integer('nerve_spent');

            // Rewards (if successful)
            $table->bigInteger('money_gained')->default(0);
            $table->integer('experience_gained')->default(0);
            $table->foreignId('item_gained_id')->nullable()->constrained('items')->nullOnDelete();

            // Penalties (if failed)
            $table->integer('jail_time')->default(0);
            $table->integer('hospital_time')->default(0);

            $table->text('message')->nullable(); // flavor text

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crime_logs');
    }
};
