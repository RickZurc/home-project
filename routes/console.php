<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Game Scheduled Tasks
|--------------------------------------------------------------------------
|
| These scheduled tasks power the game's economy and player systems.
| Run `php artisan schedule:run` every minute via cron.
|
*/

// Regenerate player stats every 5 minutes
Schedule::command('game:regenerate-stats')->everyFiveMinutes();

// Release players from hospital/jail every minute
Schedule::command('game:release-hospital')->everyMinute();
Schedule::command('game:release-jail')->everyMinute();

// Process bank interest daily at midnight
Schedule::command('game:bank-interest')->dailyAt('00:00');

// Expire old market listings daily at 3am
Schedule::command('game:expire-listings')->dailyAt('03:00');
