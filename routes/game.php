<?php

use App\Http\Controllers\Game\BankController;
use App\Http\Controllers\Game\CombatController;
use App\Http\Controllers\Game\CrimeController;
use App\Http\Controllers\Game\DashboardController;
use App\Http\Controllers\Game\FactionController;
use App\Http\Controllers\Game\GymController;
use App\Http\Controllers\Game\InventoryController;
use App\Http\Controllers\Game\MarketController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Game Routes
|--------------------------------------------------------------------------
|
| All game-related routes are defined here. They require authentication.
|
*/

Route::middleware(['auth', 'verified'])->prefix('game')->name('game.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile/{user}', [DashboardController::class, 'profile'])->name('profile');
    Route::get('/hospital', [DashboardController::class, 'hospital'])->name('hospital');
    Route::get('/jail', [DashboardController::class, 'jail'])->name('jail');

    // Combat
    Route::prefix('combat')->name('combat.')->group(function () {
        Route::get('/', [CombatController::class, 'index'])->name('index');
        Route::get('/history', [CombatController::class, 'history'])->name('history');
        Route::get('/log/{combatLog}', [CombatController::class, 'log'])->name('log');
        Route::get('/{target}', [CombatController::class, 'show'])->name('show');
        Route::post('/{target}/attack', [CombatController::class, 'attack'])->name('attack');
    });

    // Gym
    Route::prefix('gym')->name('gym.')->group(function () {
        Route::get('/', [GymController::class, 'index'])->name('index');
        Route::post('/train', [GymController::class, 'train'])->name('train');
    });

    // Crimes
    Route::prefix('crimes')->name('crimes.')->group(function () {
        Route::get('/', [CrimeController::class, 'index'])->name('index');
        Route::post('/{crime}/commit', [CrimeController::class, 'commit'])->name('commit');
    });

    // Bank
    Route::prefix('bank')->name('bank.')->group(function () {
        Route::get('/', [BankController::class, 'index'])->name('index');
        Route::post('/deposit', [BankController::class, 'deposit'])->name('deposit');
        Route::post('/withdraw', [BankController::class, 'withdraw'])->name('withdraw');
        Route::post('/transfer', [BankController::class, 'transfer'])->name('transfer');
    });

    // Inventory
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/', [InventoryController::class, 'index'])->name('index');
        Route::post('/{inventory}/equip', [InventoryController::class, 'equip'])->name('equip');
        Route::post('/{inventory}/unequip', [InventoryController::class, 'unequip'])->name('unequip');
        Route::post('/{inventory}/use', [InventoryController::class, 'use'])->name('use');
    });

    // Market
    Route::prefix('market')->name('market.')->group(function () {
        Route::get('/', [MarketController::class, 'index'])->name('index');
        Route::get('/sell', [MarketController::class, 'sell'])->name('sell');
        Route::get('/item/{item}', [MarketController::class, 'item'])->name('item');
        Route::post('/buy/{listing}', [MarketController::class, 'buy'])->name('buy');
        Route::post('/list', [MarketController::class, 'createListing'])->name('list');
        Route::delete('/listing/{listing}', [MarketController::class, 'cancelListing'])->name('cancel');
    });

    // Factions
    Route::prefix('factions')->name('factions.')->group(function () {
        Route::get('/', [FactionController::class, 'index'])->name('index');
        Route::get('/create', [FactionController::class, 'create'])->name('create');
        Route::post('/', [FactionController::class, 'store'])->name('store');
        Route::get('/{faction}', [FactionController::class, 'show'])->name('show');
        Route::post('/leave', [FactionController::class, 'leave'])->name('leave');
        Route::post('/donate', [FactionController::class, 'donate'])->name('donate');
        Route::post('/{faction}/invite', [FactionController::class, 'invite'])->name('invite');
        Route::post('/{faction}/kick/{user}', [FactionController::class, 'kick'])->name('kick');
        Route::post('/{faction}/war', [FactionController::class, 'declareWar'])->name('war');
    });
});
