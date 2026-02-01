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
        Schema::create('market_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();

            $table->integer('quantity');
            $table->bigInteger('price_per_unit');
            $table->bigInteger('total_price');

            $table->string('status')->default('active'); // active, sold, cancelled, expired
            $table->foreignId('buyer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sold_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();

            $table->index(['item_id', 'status', 'price_per_unit']);
            $table->index(['seller_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('market_listings');
    }
};
