<?php

namespace App\Console\Commands;

use App\Models\Inventory;
use App\Models\MarketListing;
use Illuminate\Console\Command;

class ExpireMarketListings extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'game:expire-listings';

    /**
     * The console command description.
     */
    protected $description = 'Expire old market listings and return items to sellers';

    /**
     * Listings expire after 7 days
     */
    protected const EXPIRATION_DAYS = 7;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Expiring old market listings...');

        $expiredListings = MarketListing::query()
            ->where('status', 'active')
            ->where('created_at', '<', now()->subDays(self::EXPIRATION_DAYS))
            ->get();

        $expired = 0;

        foreach ($expiredListings as $listing) {
            // Return items to seller's inventory
            $existingInventory = Inventory::where('user_id', $listing->seller_id)
                ->where('item_id', $listing->item_id)
                ->where('equipped', false)
                ->first();

            if ($existingInventory) {
                $existingInventory->increment('quantity', $listing->quantity);
            } else {
                Inventory::create([
                    'user_id' => $listing->seller_id,
                    'item_id' => $listing->item_id,
                    'quantity' => $listing->quantity,
                    'equipped' => false,
                ]);
            }

            $listing->update(['status' => 'expired']);
            $expired++;
        }

        $this->info("Expired {$expired} listings and returned items to sellers.");

        return Command::SUCCESS;
    }
}
