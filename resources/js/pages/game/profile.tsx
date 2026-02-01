import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatBar, PlayerStatusBadge, RarityBadge } from '@/components/game';
import type { BreadcrumbItem, Player, InventoryItem, CombatLog, CrimeLog } from '@/types';
import { User, Swords, Shield, Heart, Zap, Brain, Award, Calendar, Clock, Target, Skull, HandCoins } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Profile', href: '#' },
];

interface Props {
    player: Player & {
        statistics: {
            totalAttacks: number;
            attacksWon: number;
            attacksLost: number;
            crimesCommitted: number;
            crimesSucceeded: number;
            moneyEarned: number;
            timeHospitalized: number;
            timeJailed: number;
        };
        equippedWeapon?: InventoryItem;
        equippedArmor?: InventoryItem;
    };
    recentCombats: CombatLog[];
    recentCrimes: CrimeLog[];
    isOwnProfile: boolean;
}

export default function Profile({ player, recentCombats, recentCrimes, isOwnProfile }: Props) {
    const winRate = player.statistics.totalAttacks > 0 ? Math.round((player.statistics.attacksWon / player.statistics.totalAttacks) * 100) : 0;
    const crimeRate = player.statistics.crimesCommitted > 0 ? Math.round((player.statistics.crimesSucceeded / player.statistics.crimesCommitted) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${player.name}'s Profile`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                            {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold">
                                {player.name}
                                <Badge variant="secondary">Level {player.level}</Badge>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <PlayerStatusBadge status={player.status} />
                                {player.faction && (
                                    <Badge variant="outline">{player.faction.name}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    {!isOwnProfile && player.status === 'okay' && (
                        <Button asChild>
                            <Link href={`/game/combat/attack/${player.id}`}>
                                <Swords className="mr-2 h-4 w-4" />
                                Attack
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Combat Stats */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Swords className="h-5 w-5" />
                                Battle Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-red-500" />
                                        <span className="text-sm text-muted-foreground">Strength</span>
                                    </div>
                                    <div className="mt-1 text-2xl font-bold">{player.strength.toLocaleString()}</div>
                                </div>
                                <div className="rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-500" />
                                        <span className="text-sm text-muted-foreground">Defense</span>
                                    </div>
                                    <div className="mt-1 text-2xl font-bold">{player.defense.toLocaleString()}</div>
                                </div>
                                <div className="rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-yellow-500" />
                                        <span className="text-sm text-muted-foreground">Speed</span>
                                    </div>
                                    <div className="mt-1 text-2xl font-bold">{player.speed.toLocaleString()}</div>
                                </div>
                                <div className="rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-purple-500" />
                                        <span className="text-sm text-muted-foreground">Dexterity</span>
                                    </div>
                                    <div className="mt-1 text-2xl font-bold">{player.dexterity.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Equipment */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border p-4">
                                    <div className="text-sm text-muted-foreground">Weapon</div>
                                    {player.equippedWeapon ? (
                                        <div className="mt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{player.equippedWeapon.item.name}</span>
                                                <RarityBadge rarity={player.equippedWeapon.item.rarity} />
                                            </div>
                                            <div className="text-sm text-red-500">+{player.equippedWeapon.item.damage} damage</div>
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-muted-foreground">No weapon equipped</div>
                                    )}
                                </div>
                                <div className="rounded-lg border p-4">
                                    <div className="text-sm text-muted-foreground">Armor</div>
                                    {player.equippedArmor ? (
                                        <div className="mt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{player.equippedArmor.item.name}</span>
                                                <RarityBadge rarity={player.equippedArmor.item.rarity} />
                                            </div>
                                            <div className="text-sm text-blue-500">+{player.equippedArmor.item.armor} defense</div>
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-muted-foreground">No armor equipped</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lifetime Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Lifetime Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm">
                                    <Target className="h-4 w-4" />
                                    Attacks Won
                                </span>
                                <span className="font-bold text-green-500">{player.statistics.attacksWon}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm">
                                    <Skull className="h-4 w-4" />
                                    Attacks Lost
                                </span>
                                <span className="font-bold text-red-500">{player.statistics.attacksLost}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Win Rate</span>
                                <span className="font-bold">{winRate}%</span>
                            </div>
                            <div className="border-t pt-4 flex items-center justify-between">
                                <span className="text-sm">Crimes Committed</span>
                                <span className="font-bold">{player.statistics.crimesCommitted}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Crime Success Rate</span>
                                <span className="font-bold">{crimeRate}%</span>
                            </div>
                            <div className="border-t pt-4 flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm">
                                    <HandCoins className="h-4 w-4" />
                                    Total Earnings
                                </span>
                                <span className="font-bold text-green-500">${player.statistics.moneyEarned.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Combats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Combats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentCombats.length === 0 ? (
                                <p className="text-center text-muted-foreground">No combat history</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentCombats.map((combat) => {
                                        const isAttacker = combat.attackerId === player.id;
                                        const won = combat.winnerId === player.id;
                                        const opponent = isAttacker ? combat.defender : combat.attacker;

                                        return (
                                            <div key={combat.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground">{isAttacker ? 'Attacked' : 'Defended vs'}</span>
                                                        <span className="font-medium">{opponent?.name}</span>
                                                    </div>
                                                </div>
                                                <Badge variant={won ? 'default' : 'destructive'}>{won ? 'Won' : 'Lost'}</Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Crimes */}
                    {isOwnProfile && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Crimes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentCrimes.length === 0 ? (
                                    <p className="text-center text-muted-foreground">No crime history</p>
                                ) : (
                                    <div className="space-y-2">
                                        {recentCrimes.map((crime) => (
                                            <div key={crime.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                                                <div>
                                                    <div className="font-medium">{crime.crime?.name}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {crime.success ? (
                                                        <span className="text-sm text-green-500">+${crime.moneyGained?.toLocaleString()}</span>
                                                    ) : (
                                                        <span className="text-sm text-red-500">Failed</span>
                                                    )}
                                                    <Badge variant={crime.success ? 'default' : 'destructive'}>
                                                        {crime.success ? 'Success' : 'Failed'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
