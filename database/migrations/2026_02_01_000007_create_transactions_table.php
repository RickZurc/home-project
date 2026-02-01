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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('other_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('type'); // deposit, withdraw, transfer, trade, crime, attack, market_buy, market_sell
            $table->string('currency')->default('money'); // money, points, bank

            $table->bigInteger('amount');
            $table->bigInteger('balance_before');
            $table->bigInteger('balance_after');

            $table->text('description')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
