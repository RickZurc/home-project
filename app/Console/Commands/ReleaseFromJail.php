<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ReleaseFromJail extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'game:release-jail';

    /**
     * The console command description.
     */
    protected $description = 'Release players whose jail time has expired';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Releasing players from jail...');

        $released = User::query()
            ->where('status', 'jailed')
            ->where('jail_until', '<', now())
            ->update([
                'status' => 'active',
                'jail_until' => null,
            ]);

        $this->info("Released {$released} players from jail.");

        return Command::SUCCESS;
    }
}
