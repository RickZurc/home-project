import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RarityBadge } from '@/components/game';
import type { BreadcrumbItem, MarketListing, Item } from '@/types';
import { Store, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Market', href: '/game/market' },
];

interface Props {
    listings: {
        data: MarketListing[];
        current_page: number;
        last_page: number;
    };
    itemTypes: string[];
    filters: {
        type?: string;
        search?: string;
    };
}

export default function Market({ listings, itemTypes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');

    const { post, processing } = useForm({});

    const handleBuy = (listingId: number) => {
        if (confirm('Are you sure you want to purchase this item?')) {
            post(`/game/market/buy/${listingId}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Market" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Store className="h-8 w-8" />
                            Market
                        </h1>
                        <p className="text-muted-foreground">Buy and sell items with other players</p>
                    </div>
                    <Button asChild>
                        <Link href="/game/market/sell">Sell Items</Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant={selectedType === '' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedType('')}>
                                    All
                                </Button>
                                {itemTypes.map((type) => (
                                    <Button
                                        key={type}
                                        variant={selectedType === type ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedType(type)}
                                        className="capitalize"
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Listings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Listings</CardTitle>
                        <CardDescription>Sorted by lowest price first</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {listings.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Store className="h-16 w-16 text-muted-foreground" />
                                <h2 className="mt-4 text-xl font-medium">No listings found</h2>
                                <p className="mt-2 text-muted-foreground">Be the first to sell something!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {listings.data
                                    .filter((listing) => {
                                        const matchesSearch = !search || listing.item.name.toLowerCase().includes(search.toLowerCase());
                                        const matchesType = !selectedType || listing.item.type === selectedType;
                                        return matchesSearch && matchesType;
                                    })
                                    .map((listing) => (
                                        <div key={listing.id} className="rounded-lg border bg-card p-4 shadow-sm">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <Link href={`/game/market/item/${listing.item.id}`} className="font-medium hover:underline">
                                                        {listing.item.name}
                                                    </Link>
                                                    <div className="mt-1 flex items-center gap-1">
                                                        <RarityBadge rarity={listing.item.rarity} />
                                                        <Badge variant="outline" className="capitalize">
                                                            {listing.item.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">x{listing.quantity}</Badge>
                                            </div>

                                            <div className="mt-3 text-sm text-muted-foreground">
                                                {listing.item.damage > 0 && <span className="mr-2">+{listing.item.damage} dmg</span>}
                                                {listing.item.armor > 0 && <span className="mr-2">+{listing.item.armor} def</span>}
                                            </div>

                                            <div className="mt-3 border-t pt-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        ${listing.pricePerUnit.toLocaleString()} each
                                                    </span>
                                                    <span className="font-bold text-green-500">${listing.totalPrice.toLocaleString()}</span>
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">Seller: {listing.seller?.name}</div>
                                            </div>

                                            <Button onClick={() => handleBuy(listing.id)} disabled={processing} className="mt-3 w-full">
                                                Buy Now
                                            </Button>
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
