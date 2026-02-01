<?php

namespace App\Http\Controllers\Game;

use App\Actions\Game\GameService;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankController extends Controller
{
    public function __construct(
        protected GameService $gameService
    ) {}

    /**
     * Show the bank page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $transactions = Transaction::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->take(20)
            ->get();

        return Inertia::render('game/bank/index', [
            'wallet' => $user->wallet,
            'bank' => $user->bank,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Deposit money.
     */
    public function deposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $result = $this->gameService->bankDeposit($request->user(), $request->amount);

        if (! $result['success']) {
            return back()->withErrors(['deposit' => $result['message']]);
        }

        return back()->with('success', 'Deposited $'.number_format($request->amount));
    }

    /**
     * Withdraw money.
     */
    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $result = $this->gameService->bankWithdraw($request->user(), $request->amount);

        if (! $result['success']) {
            return back()->withErrors(['withdraw' => $result['message']]);
        }

        return back()->with('success', 'Withdrew $'.number_format($request->amount));
    }

    /**
     * Transfer money to another player.
     */
    public function transfer(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'amount' => 'required|integer|min:1',
        ]);

        $recipient = \App\Models\User::findOrFail($request->recipient_id);
        $result = $this->gameService->transferMoney($request->user(), $recipient, $request->amount);

        if (! $result['success']) {
            return back()->withErrors(['transfer' => $result['message']]);
        }

        return back()->with('success', 'Transferred $'.number_format($request->amount).' to '.$recipient->name);
    }
}
