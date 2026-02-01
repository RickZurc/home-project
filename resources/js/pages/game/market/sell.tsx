import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RarityBadge } from '@/components/game';
import type { BreadcrumbItem, InventoryItem, MarketListing } from '@/types';
import { Store, Package, ArrowLeft, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Market', href: '/game/market' },
    { title: 'Sell', href: '/game/market/sell' },
];

interface Props {
    inventory: InventoryItem[];
    myListings: MarketListing[];
}

export default function MarketSell({ inventory, myListings }: Props) {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [pricePerUnit, setPricePerUnit] = useState('');

    const listForm = useForm({
        item_id: 0,
        quantity: 1,
        price_per_unit: 0,
    });

    const cancelForm = useForm({});

    const handleList = () => {
        if (selectedItem && quantity && pricePerUnit) {
            listForm.setData('item_id', selectedItem.item.id);
            listForm.setData('quantity', parseInt(quantity));
            listForm.setData('price_per_unit', parseInt(pricePerUnit));
            listForm.post('/game/market/list', {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedItem(null);
                    setQuantity('1');
                    setPricePerUnit('');
                },
            });
        }
    };

    const handleCancel = (listingId: number) => {
        if (confirm('Are you sure you want to cancel this listing?')) {
            cancelForm.delete(`/game/market/listing/${listingId}`, { preserveScroll: true });
        }
    };

    const totalPrice = parseInt(quantity || '0') * parseInt(pricePerUnit || '0');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sell Items" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/game/market">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Store className="h-8 w-8" />
                            Sell Items
                        </h1>
                        <p className="text-muted-foreground">List your items for sale on the market</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Inventory Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Inventory</CardTitle>
                            <CardDescription>Select an item to sell</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {inventory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Package className="h-12 w-12 text-muted-foreground" />
                                    <p className="mt-2 text-muted-foreground">No tradeable items in inventory</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {inventory.map((inv) => (
                                        <button
                                            key={inv.id}
                                            onClick={() => {
                                                setSelectedItem(inv);
                                                setQuantity('1');
                                            }}
                                            className={`w-full rounded-lg border p-3 text-left transition-all ${
                                                selectedItem?.id === inv.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{inv.item.name}</div>
                                                    <div className="flex items-center gap-1">
                                                        <RarityBadge rarity={inv.item.rarity} />
                                                        <Badge variant="outline">x{inv.quantity}</Badge>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Base: ${inv.item.basePrice.toLocaleString()}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Listing Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Listing</CardTitle>
                            <CardDescription>Set the quantity and price for your listing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedItem ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg bg-muted p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{selectedItem.item.name}</div>
                                                <div className="flex items-center gap-1">
                                                    <RarityBadge rarity={selectedItem.item.rarity} />
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="quantity">Quantity (max: {selectedItem.quantity})</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min={1}
                                            max={selectedItem.quantity}
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="price">Price per unit</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min={1}
                                            value={pricePerUnit}
                                            onChange={(e) => setPricePerUnit(e.target.value)}
                                            placeholder={`Suggested: $${selectedItem.item.marketPrice || selectedItem.item.basePrice}`}
                                        />
                                    </div>

                                    {totalPrice > 0 && (
                                        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                                            <div className="flex items-center justify-between">
                                                <span>Total Price:</span>
                                                <span className="text-2xl font-bold text-green-500">${totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleList}
                                        disabled={listForm.processing || !quantity || !pricePerUnit}
                                        className="w-full"
                                    >
                                        Create Listing
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground">Select an item from your inventory to list</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* My Listings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Active Listings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {myListings.length === 0 ? (
                            <p className="text-center text-muted-foreground">You have no active listings</p>
                        ) : (
                            <div className="space-y-2">
                                {myListings.map((listing) => (
                                    <div key={listing.id} className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div>
                                            <div className="font-medium">{listing.item?.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {listing.quantity}x @ ${listing.pricePerUnit.toLocaleString()} each
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-green-500">${listing.totalPrice.toLocaleString()}</span>
                                            <Button variant="destructive" size="sm" onClick={() => handleCancel(listing.id)} disabled={cancelForm.processing}>
                                                Cancel
                                            </Button>
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
