import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlayerStatusBadge } from '@/components/game';
import type { BreadcrumbItem, PlayerBasic } from '@/types';
import { Sword, Search, Zap } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Combat', href: '/game/combat' },
];

interface Target extends PlayerBasic {
    attacks_made_count: number;
}

interface Props {
    targets: {
        data: Target[];
        current_page: number;
        last_page: number;
    };
    canAttack: boolean;
    energy: number;
    cooldownUntil: string | null;
}

export default function CombatIndex({ targets, canAttack, energy, cooldownUntil }: Props) {
    const [search, setSearch] = useState('');

    const filteredTargets = targets.data.filter((target) => target.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Combat" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Sword className="h-8 w-8" />
                            Combat
                        </h1>
                        <p className="text-muted-foreground">Attack other players to earn money and respect</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-green-500" />
                            <span className="font-medium">{energy} Energy</span>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/game/combat/history">Attack History</Link>
                        </Button>
                    </div>
                </div>

                {!canAttack && (
                    <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/30">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Sword className="h-6 w-6 text-orange-500" />
                                <div>
                                    {energy < 25 && <span>Not enough energy. You need 25 energy to attack.</span>}
                                    {cooldownUntil && new Date(cooldownUntil) > new Date() && (
                                        <span>Attack on cooldown. Wait a moment before attacking again.</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search players..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Targets List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Targets</CardTitle>
                        <CardDescription>Players who are currently available for attack</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredTargets.length === 0 ? (
                            <p className="text-center text-muted-foreground">No available targets found</p>
                        ) : (
                            <div className="space-y-2">
                                {filteredTargets.map((target) => (
                                    <div key={target.id} className="flex items-center justify-between rounded-lg bg-muted p-4 transition-all hover:bg-muted/80">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                                {target.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <Link href={`/game/profile/${target.id}`} className="font-medium hover:underline">
                                                    {target.name}
                                                </Link>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Badge variant="outline">Level {target.level}</Badge>
                                                    {target.faction && (
                                                        <Badge variant="secondary">
                                                            [{target.faction.tag}]
                                                        </Badge>
                                                    )}
                                                    <PlayerStatusBadge status={target.status || 'okay'} />
                                                </div>
                                            </div>
                                        </div>
                                        <Button asChild disabled={!canAttack || target.status !== 'okay'}>
                                            <Link href={`/game/combat/${target.id}`}>
                                                <Sword className="mr-2 h-4 w-4" />
                                                Attack
                                            </Link>
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
