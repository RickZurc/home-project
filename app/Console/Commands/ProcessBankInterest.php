<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Console\Command;

class ProcessBankInterest extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'game:bank-interest';

    /**
     * The console command description.
     */
    protected $description = 'Process daily bank interest for all players';

    /**
     * Daily interest rate (0.1% per day)
     */
    protected const DAILY_INTEREST_RATE = 0.001;

    /**
     * Minimum bank balance to earn interest
     */
    protected const MINIMUM_BALANCE = 1000;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Processing bank interest...');

        $players = User::query()
            ->where('bank_balance', '>=', self::MINIMUM_BALANCE)
            ->get();

        $totalInterest = 0;
        $processed = 0;

        foreach ($players as $player) {
            $interest = (int) floor($player->bank_balance * self::DAILY_INTEREST_RATE);

            if ($interest > 0) {
                $player->increment('bank_balance', $interest);

                Transaction::record(
                    userId: $player->id,
                    type: 'interest',
                    amount: $interest,
                    description: 'Daily bank interest'
                );

                $totalInterest += $interest;
                $processed++;
            }
        }

        $this->info("Processed interest for {$processed} players. Total: \${$totalInterest}");

        return Command::SUCCESS;
    }
}
