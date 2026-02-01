import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem, Faction, Player } from '@/types';
import { Users, Swords, Crown, Shield, ArrowRight, Search, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Factions', href: '/game/factions' },
];

interface Props {
    factions: Faction[];
    myFaction: Faction | null;
    pendingInvites: { faction: Faction }[];
}

export default function Factions({ factions, myFaction, pendingInvites }: Props) {
    const [search, setSearch] = useState('');

    const filteredFactions = factions.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Factions" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Users className="h-8 w-8" />
                            Factions
                        </h1>
                        <p className="text-muted-foreground">Join or create a faction to gain power</p>
                    </div>
                    {!myFaction && (
                        <Button asChild>
                            <Link href="/game/factions/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Faction
                            </Link>
                        </Button>
                    )}
                </div>

                {/* My Faction */}
                {myFaction && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-500" />
                                Your Faction
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">{myFaction.name}</div>
                                    {myFaction.tag && <Badge variant="outline">[{myFaction.tag}]</Badge>}
                                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {myFaction.membersCount} members
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Shield className="h-4 w-4" />
                                            {myFaction.respect.toLocaleString()} respect
                                        </span>
                                        {myFaction.atWar && (
                                            <Badge variant="destructive" className="animate-pulse">
                                                <Swords className="mr-1 h-3 w-3" />
                                                At War
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Button asChild>
                                    <Link href={`/game/factions/${myFaction.id}`}>
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                    <Card className="border-yellow-500/50">
                        <CardHeader>
                            <CardTitle>Pending Invitations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {pendingInvites.map((invite) => (
                                    <div key={invite.faction.id} className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div>
                                            <div className="font-medium">{invite.faction.name}</div>
                                            {invite.faction.tag && <Badge variant="outline">[{invite.faction.tag}]</Badge>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button asChild size="sm">
                                                <Link href={`/game/factions/${invite.faction.id}`}>View</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search factions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>

                {/* Faction List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Factions</CardTitle>
                        <CardDescription>Browse factions and their stats</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredFactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Users className="h-16 w-16 text-muted-foreground" />
                                <h2 className="mt-4 text-xl font-medium">No factions found</h2>
                                <p className="mt-2 text-muted-foreground">Be the first to create a faction!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredFactions.map((faction) => (
                                    <Link
                                        key={faction.id}
                                        href={`/game/factions/${faction.id}`}
                                        className="flex items-center justify-between rounded-lg bg-muted p-4 transition-all hover:bg-muted/70"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold">
                                                {faction.tag || faction.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{faction.name}</span>
                                                    {faction.atWar && (
                                                        <Badge variant="destructive">
                                                            <Swords className="mr-1 h-3 w-3" />
                                                            War
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span>{faction.membersCount} members</span>
                                                    <span>{faction.respect.toLocaleString()} respect</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
