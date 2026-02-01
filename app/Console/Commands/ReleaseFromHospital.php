<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ReleaseFromHospital extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'game:release-hospital';

    /**
     * The console command description.
     */
    protected $description = 'Release players whose hospital time has expired';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Releasing players from hospital...');

        $released = User::query()
            ->where('status', 'hospitalized')
            ->where('hospital_until', '<', now())
            ->update([
                'status' => 'active',
                'hospital_until' => null,
            ]);

        $this->info("Released {$released} players from hospital.");

        return Command::SUCCESS;
    }
}
