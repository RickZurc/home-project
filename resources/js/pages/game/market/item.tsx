import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RarityBadge } from '@/components/game';
import type { BreadcrumbItem, MarketListing, Item } from '@/types';
import { ArrowLeft, Store } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Market', href: '/game/market' },
    { title: 'Item', href: '#' },
];

interface Props {
    item: Item;
    listings: MarketListing[];
}

export default function MarketItem({ item, listings }: Props) {
    const { post, processing } = useForm({});

    const handleBuy = (listingId: number) => {
        if (confirm('Are you sure you want to purchase this item?')) {
            post(`/game/market/buy/${listingId}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${item.name} - Market`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/game/market">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">{item.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <RarityBadge rarity={item.rarity} />
                            <Badge variant="outline" className="capitalize">
                                {item.type}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Item Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Item Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {item.description && (
                                <div className="sm:col-span-2 lg:col-span-4">
                                    <p className="text-muted-foreground">{item.description}</p>
                                </div>
                            )}
                            {item.damage > 0 && (
                                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
                                    <div className="text-sm text-muted-foreground">Damage</div>
                                    <div className="text-xl font-bold text-red-500">+{item.damage}</div>
                                </div>
                            )}
                            {item.armor > 0 && (
                                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                                    <div className="text-sm text-muted-foreground">Defense</div>
                                    <div className="text-xl font-bold text-blue-500">+{item.armor}</div>
                                </div>
                            )}
                            {item.accuracy && item.accuracy > 0 && (
                                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/30">
                                    <div className="text-sm text-muted-foreground">Accuracy</div>
                                    <div className="text-xl font-bold text-yellow-500">+{item.accuracy}</div>
                                </div>
                            )}
                            <div className="rounded-lg bg-muted p-3">
                                <div className="text-sm text-muted-foreground">Base Price</div>
                                <div className="text-xl font-bold">${item.basePrice.toLocaleString()}</div>
                            </div>
                            {item.marketPrice && item.marketPrice > 0 && (
                                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                                    <div className="text-sm text-muted-foreground">Market Price</div>
                                    <div className="text-xl font-bold text-green-500">${item.marketPrice.toLocaleString()}</div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {item.consumable && <Badge>Consumable</Badge>}
                            {item.tradeable && <Badge variant="secondary">Tradeable</Badge>}
                        </div>
                    </CardContent>
                </Card>

                {/* Listings for this item */}
                <Card>
                    <CardHeader>
                        <CardTitle>Market Listings</CardTitle>
                        <CardDescription>All available listings for this item, sorted by lowest price</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {listings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Store className="h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-muted-foreground">No listings available for this item</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {listings.map((listing) => (
                                    <div key={listing.id} className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Seller</div>
                                                <div className="font-medium">{listing.seller?.name}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Quantity</div>
                                                <div className="font-medium">{listing.quantity}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Price/unit</div>
                                                <div className="font-medium">${listing.pricePerUnit.toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm text-muted-foreground">Total</div>
                                                <div className="text-xl font-bold text-green-500">${listing.totalPrice.toLocaleString()}</div>
                                            </div>
                                            <Button onClick={() => handleBuy(listing.id)} disabled={processing}>
                                                Buy
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
