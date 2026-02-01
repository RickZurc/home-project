<?php

namespace App\Http\Controllers\Game;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\MarketListing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketController extends Controller
{
    /**
     * Show the market page.
     */
    public function index(Request $request)
    {
        $query = MarketListing::active()
            ->with(['item:id,name,type,subtype,rarity,slug,damage,armor,base_price', 'seller:id,name'])
            ->cheapestFirst();

        if ($request->type) {
            $query->whereHas('item', fn ($q) => $q->where('type', $request->type));
        }

        if ($request->search) {
            $query->whereHas('item', fn ($q) => $q->where('name', 'like', "%{$request->search}%"));
        }

        $listings = $query->paginate(20);

        // Transform listings to camelCase
        $listings->getCollection()->transform(fn ($listing) => [
            'id' => $listing->id,
            'quantity' => $listing->quantity,
            'pricePerUnit' => $listing->price_per_unit,
            'totalPrice' => $listing->quantity * $listing->price_per_unit,
            'seller' => $listing->seller ? [
                'id' => $listing->seller->id,
                'name' => $listing->seller->name,
            ] : null,
            'item' => [
                'id' => $listing->item->id,
                'name' => $listing->item->name,
                'slug' => $listing->item->slug,
                'type' => $listing->item->type,
                'subtype' => $listing->item->subtype,
                'rarity' => $listing->item->rarity,
                'damage' => $listing->item->damage,
                'armor' => $listing->item->armor,
                'basePrice' => $listing->item->base_price,
            ],
        ]);

        $itemTypes = Item::distinct()->pluck('type');

        return Inertia::render('game/market/index', [
            'listings' => $listings,
            'itemTypes' => $itemTypes,
            'filters' => $request->only(['type', 'search']),
        ]);
    }

    /**
     * Show item listings.
     */
    public function item(Item $item)
    {
        $listings = MarketListing::active()
            ->forItem($item->id)
            ->with('seller:id,name')
            ->cheapestFirst()
            ->paginate(20);

        return Inertia::render('game/market/item', [
            'item' => $item,
            'listings' => $listings,
        ]);
    }

    /**
     * Purchase a listing.
     */
    public function buy(Request $request, MarketListing $listing)
    {
        $user = $request->user();

        if (! $listing->canBePurchasedBy($user)) {
            if (! $listing->isActive()) {
                return back()->withErrors(['buy' => 'This listing is no longer available.']);
            }
            if ($listing->seller_id === $user->id) {
                return back()->withErrors(['buy' => 'You cannot buy your own listing.']);
            }
            if ($user->wallet < $listing->total_price) {
                return back()->withErrors(['buy' => 'Insufficient funds.']);
            }

            return back()->withErrors(['buy' => 'Unable to complete purchase.']);
        }

        $listing->purchase($user);

        return back()->with('success', "Purchased {$listing->quantity}x {$listing->item->name}!");
    }

    /**
     * Show sell page.
     */
    public function sell(Request $request)
    {
        $user = $request->user();

        $inventory = $user->inventory()
            ->with('item')
            ->whereHas('item', fn ($q) => $q->where('tradeable', true))
            ->where('equipped', false)
            ->where('quantity', '>', 0)
            ->get()
            ->map(fn ($inv) => [
                'id' => $inv->id,
                'userId' => $inv->user_id,
                'itemId' => $inv->item_id,
                'quantity' => $inv->quantity,
                'equipped' => $inv->equipped,
                'usesRemaining' => $inv->uses_remaining,
                'item' => [
                    'id' => $inv->item->id,
                    'name' => $inv->item->name,
                    'slug' => $inv->item->slug,
                    'description' => $inv->item->description,
                    'type' => $inv->item->type,
                    'subtype' => $inv->item->subtype,
                    'damage' => $inv->item->damage,
                    'accuracy' => $inv->item->accuracy,
                    'armor' => $inv->item->armor,
                    'effects' => $inv->item->effects,
                    'basePrice' => $inv->item->base_price,
                    'marketPrice' => $inv->item->market_price,
                    'levelRequired' => $inv->item->level_required,
                    'tradeable' => $inv->item->tradeable,
                    'consumable' => $inv->item->consumable,
                    'rarity' => $inv->item->rarity,
                ],
            ]);

        $myListings = MarketListing::where('seller_id', $user->id)
            ->where('status', 'active')
            ->with('item:id,name,rarity')
            ->get()
            ->map(fn ($listing) => [
                'id' => $listing->id,
                'quantity' => $listing->quantity,
                'pricePerUnit' => $listing->price_per_unit,
                'totalPrice' => $listing->quantity * $listing->price_per_unit,
                'item' => [
                    'id' => $listing->item->id,
                    'name' => $listing->item->name,
                    'rarity' => $listing->item->rarity,
                ],
            ]);

        return Inertia::render('game/market/sell', [
            'inventory' => $inventory,
            'myListings' => $myListings,
        ]);
    }

    /**
     * Create a listing.
     */
    public function createListing(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'price_per_unit' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $item = Item::findOrFail($request->item_id);

        $listing = MarketListing::createListing(
            $user,
            $item,
            $request->quantity,
            $request->price_per_unit
        );

        if (! $listing) {
            return back()->withErrors(['listing' => 'Unable to create listing. Check your inventory.']);
        }

        return back()->with('success', 'Listing created!');
    }

    /**
     * Cancel a listing.
     */
    public function cancelListing(Request $request, MarketListing $listing)
    {
        if ($listing->seller_id !== $request->user()->id) {
            abort(403);
        }

        if (! $listing->cancel()) {
            return back()->withErrors(['cancel' => 'Unable to cancel listing.']);
        }

        return back()->with('success', 'Listing cancelled.');
    }
}
