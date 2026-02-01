<?php

namespace App\Http\Controllers\Game;

use App\Actions\Game\GameService;
use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function __construct(
        protected GameService $gameService
    ) {}

    /**
     * Show the inventory page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $inventory = $user->inventory()
            ->with('item')
            ->orderByDesc('equipped')
            ->orderBy('created_at')
            ->get()
            ->groupBy('item.type');

        return Inertia::render('game/inventory/index', [
            'inventory' => $inventory,
            'equippedWeapon' => $user->getEquippedWeapon()?->load('item'),
            'equippedArmor' => $user->getEquippedArmor()?->load('item'),
        ]);
    }

    /**
     * Equip an item.
     */
    public function equip(Request $request, Inventory $inventory)
    {
        if ($inventory->user_id !== $request->user()->id) {
            abort(403);
        }

        if (! $inventory->equip()) {
            return back()->withErrors(['equip' => 'Cannot equip this item.']);
        }

        return back()->with('success', "Equipped {$inventory->item->name}!");
    }

    /**
     * Unequip an item.
     */
    public function unequip(Request $request, Inventory $inventory)
    {
        if ($inventory->user_id !== $request->user()->id) {
            abort(403);
        }

        $inventory->unequip();

        return back()->with('success', "Unequipped {$inventory->item->name}.");
    }

    /**
     * Use a consumable item.
     */
    public function use(Request $request, Inventory $inventory)
    {
        $result = $this->gameService->useItem($request->user(), $inventory);

        if (! $result['success']) {
            return back()->withErrors(['use' => $result['message']]);
        }

        $effectsSummary = implode(', ', $result['effects']);

        return back()->with('success', "Used {$result['item']}: {$effectsSummary}");
    }
}
