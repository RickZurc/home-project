import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem, Transaction } from '@/types';
import { Building2, ArrowDownLeft, ArrowUpRight, Send, Wallet } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Bank', href: '/game/bank' },
];

interface Props {
    wallet: number;
    bank: number;
    transactions: Transaction[];
}

export default function Bank({ wallet, bank, transactions }: Props) {
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [recipientId, setRecipientId] = useState('');

    const depositForm = useForm({ amount: 0 });
    const withdrawForm = useForm({ amount: 0 });
    const transferForm = useForm({ amount: 0, recipient_id: 0 });

    const handleDeposit = () => {
        const amount = parseInt(depositAmount);
        if (amount > 0) {
            depositForm.setData('amount', amount);
            depositForm.post('/game/bank/deposit', {
                preserveScroll: true,
                onSuccess: () => setDepositAmount(''),
            });
        }
    };

    const handleWithdraw = () => {
        const amount = parseInt(withdrawAmount);
        if (amount > 0) {
            withdrawForm.setData('amount', amount);
            withdrawForm.post('/game/bank/withdraw', {
                preserveScroll: true,
                onSuccess: () => setWithdrawAmount(''),
            });
        }
    };

    const handleTransfer = () => {
        const amount = parseInt(transferAmount);
        const recipient = parseInt(recipientId);
        if (amount > 0 && recipient > 0) {
            transferForm.setData('amount', amount);
            transferForm.setData('recipient_id', recipient);
            transferForm.post('/game/bank/transfer', {
                preserveScroll: true,
                onSuccess: () => {
                    setTransferAmount('');
                    setRecipientId('');
                },
            });
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit':
                return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
            case 'withdraw':
                return <ArrowUpRight className="h-4 w-4 text-red-500" />;
            case 'transfer':
                return <Send className="h-4 w-4 text-blue-500" />;
            default:
                return <Wallet className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Building2 className="h-8 w-8" />
                            Bank
                        </h1>
                        <p className="text-muted-foreground">Manage your money and earn 0.1% daily interest</p>
                    </div>
                </div>

                {/* Balance Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                                    <Wallet className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Wallet</div>
                                    <div className="text-3xl font-bold">${wallet.toLocaleString()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                                    <Building2 className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Bank Balance</div>
                                    <div className="text-3xl font-bold">${bank.toLocaleString()}</div>
                                    <div className="text-xs text-green-500">+${Math.floor(bank * 0.001).toLocaleString()}/day interest</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Deposit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowDownLeft className="h-5 w-5 text-green-500" />
                                Deposit
                            </CardTitle>
                            <CardDescription>Transfer money from wallet to bank</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="deposit-amount">Amount</Label>
                                    <Input
                                        id="deposit-amount"
                                        type="number"
                                        min={1}
                                        max={wallet}
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setDepositAmount(String(Math.floor(wallet * 0.25)))}>
                                        25%
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setDepositAmount(String(Math.floor(wallet * 0.5)))}>
                                        50%
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setDepositAmount(String(wallet))}>
                                        All
                                    </Button>
                                </div>
                                <Button onClick={handleDeposit} disabled={depositForm.processing || !depositAmount} className="w-full">
                                    Deposit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Withdraw */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowUpRight className="h-5 w-5 text-red-500" />
                                Withdraw
                            </CardTitle>
                            <CardDescription>Transfer money from bank to wallet</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="withdraw-amount">Amount</Label>
                                    <Input
                                        id="withdraw-amount"
                                        type="number"
                                        min={1}
                                        max={bank}
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setWithdrawAmount(String(Math.floor(bank * 0.25)))}>
                                        25%
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setWithdrawAmount(String(Math.floor(bank * 0.5)))}>
                                        50%
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setWithdrawAmount(String(bank))}>
                                        All
                                    </Button>
                                </div>
                                <Button onClick={handleWithdraw} disabled={withdrawForm.processing || !withdrawAmount} className="w-full" variant="secondary">
                                    Withdraw
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transfer */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5 text-blue-500" />
                                Transfer
                            </CardTitle>
                            <CardDescription>Send money to another player</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="recipient-id">Recipient ID</Label>
                                    <Input
                                        id="recipient-id"
                                        type="number"
                                        value={recipientId}
                                        onChange={(e) => setRecipientId(e.target.value)}
                                        placeholder="Player ID"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="transfer-amount">Amount</Label>
                                    <Input
                                        id="transfer-amount"
                                        type="number"
                                        min={1}
                                        max={wallet}
                                        value={transferAmount}
                                        onChange={(e) => setTransferAmount(e.target.value)}
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <Button onClick={handleTransfer} disabled={transferForm.processing || !transferAmount || !recipientId} className="w-full" variant="outline">
                                    Transfer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <p className="text-center text-muted-foreground">No transactions yet</p>
                        ) : (
                            <div className="space-y-2">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                                        <div className="flex items-center gap-3">
                                            {getTransactionIcon(tx.type)}
                                            <div>
                                                <div className="font-medium capitalize">{tx.type.replace('_', ' ')}</div>
                                                <div className="text-xs text-muted-foreground">{tx.description}</div>
                                            </div>
                                        </div>
                                        <div className={`font-bold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.amount >= 0 ? '+' : ''}${tx.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
