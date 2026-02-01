import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RarityBadge } from '@/components/game';
import type { BreadcrumbItem, InventoryItem } from '@/types';
import { Package, Sword, Shield, Sparkles } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Inventory', href: '/game/inventory' },
];

interface Props {
    inventory: Record<string, InventoryItem[]>;
    equippedWeapon: InventoryItem | null;
    equippedArmor: InventoryItem | null;
}

export default function Inventory({ inventory, equippedWeapon, equippedArmor }: Props) {
    const { post, processing } = useForm({});

    const handleEquip = (inventoryId: number) => {
        post(`/game/inventory/${inventoryId}/equip`, { preserveScroll: true });
    };

    const handleUnequip = (inventoryId: number) => {
        post(`/game/inventory/${inventoryId}/unequip`, { preserveScroll: true });
    };

    const handleUse = (inventoryId: number) => {
        post(`/game/inventory/${inventoryId}/use`, { preserveScroll: true });
    };

    const categoryIcons: Record<string, React.ReactNode> = {
        weapon: <Sword className="h-5 w-5" />,
        armor: <Shield className="h-5 w-5" />,
        consumable: <Sparkles className="h-5 w-5" />,
        booster: <Sparkles className="h-5 w-5" />,
        special: <Package className="h-5 w-5" />,
    };

    const hasItems = Object.values(inventory).some((items) => items.length > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Package className="h-8 w-8" />
                            Inventory
                        </h1>
                        <p className="text-muted-foreground">Manage your items and equipment</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/game/market">Visit Market</Link>
                    </Button>
                </div>

                {/* Equipped Items */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sword className="h-5 w-5 text-red-500" />
                                Equipped Weapon
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {equippedWeapon ? (
                                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                    <div>
                                        <div className="font-medium">{equippedWeapon.item.name}</div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <RarityBadge rarity={equippedWeapon.item.rarity} />
                                            <span>+{equippedWeapon.item.damage} damage</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => handleUnequip(equippedWeapon.id)} disabled={processing}>
                                        Unequip
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground">No weapon equipped</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-500" />
                                Equipped Armor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {equippedArmor ? (
                                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                    <div>
                                        <div className="font-medium">{equippedArmor.item.name}</div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <RarityBadge rarity={equippedArmor.item.rarity} />
                                            <span>+{equippedArmor.item.armor} defense</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => handleUnequip(equippedArmor.id)} disabled={processing}>
                                        Unequip
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground">No armor equipped</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Inventory by Category */}
                {!hasItems ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Package className="h-16 w-16 text-muted-foreground" />
                                <h2 className="mt-4 text-xl font-medium">Your inventory is empty</h2>
                                <p className="mt-2 text-muted-foreground">Visit the market to buy items or commit crimes to find loot</p>
                                <div className="mt-4 flex gap-2">
                                    <Button asChild>
                                        <Link href="/game/market">Visit Market</Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="/game/crimes">Commit Crimes</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    Object.entries(inventory).map(([category, items]) => {
                        if (items.length === 0) return null;

                        return (
                            <Card key={category}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 capitalize">
                                        {categoryIcons[category] || <Package className="h-5 w-5" />}
                                        {category}s
                                        <Badge variant="secondary">{items.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {items.map((inv) => (
                                            <div key={inv.id} className={`rounded-lg border p-4 ${inv.equipped ? 'border-primary bg-primary/5' : ''}`}>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="font-medium">{inv.item.name}</div>
                                                        <div className="flex items-center gap-1">
                                                            <RarityBadge rarity={inv.item.rarity} />
                                                            {inv.quantity > 1 && <Badge variant="outline">x{inv.quantity}</Badge>}
                                                        </div>
                                                    </div>
                                                    {inv.equipped && <Badge>Equipped</Badge>}
                                                </div>

                                                {inv.item.description && <p className="mt-2 text-xs text-muted-foreground">{inv.item.description}</p>}

                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    {inv.item.damage > 0 && <span className="mr-2">+{inv.item.damage} dmg</span>}
                                                    {inv.item.armor > 0 && <span className="mr-2">+{inv.item.armor} def</span>}
                                                    {inv.usesRemaining !== null && <span>{inv.usesRemaining} uses left</span>}
                                                </div>

                                                <div className="mt-3 flex gap-2">
                                                    {(inv.item.type === 'weapon' || inv.item.type === 'armor') && !inv.equipped && (
                                                        <Button size="sm" onClick={() => handleEquip(inv.id)} disabled={processing}>
                                                            Equip
                                                        </Button>
                                                    )}
                                                    {inv.item.consumable && (
                                                        <Button size="sm" variant="secondary" onClick={() => handleUse(inv.id)} disabled={processing}>
                                                            Use
                                                        </Button>
                                                    )}
                                                    {inv.item.tradeable && !inv.equipped && (
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href="/game/market/sell">Sell</Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </AppLayout>
    );
}
