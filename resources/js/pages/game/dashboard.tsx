import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBar, StatCard, CountdownTimer, PlayerStatusBadge } from '@/components/game';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem, Player, CombatLog as CombatLogType, PlayerBasic } from '@/types';
import { Sword, Shield, Zap, Target, Wallet, Building2, Trophy, Skull } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Game',
        href: '/game',
    },
];

interface Props {
    player: Player;
    recentAttacks: Array<CombatLogType & { defender: PlayerBasic }>;
    recentDefends: Array<CombatLogType & { attacker: PlayerBasic }>;
    equippedWeapon: { id: number; name: string; damage: number } | null;
    equippedArmor: { id: number; name: string; armor: number } | null;
}

export default function GameDashboard({ player, recentAttacks, recentDefends, equippedWeapon, equippedArmor }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Game Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Status Banner */}
                {!player.isAvailable && (
                    <div className="rounded-lg bg-red-100 p-4 dark:bg-red-900/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <PlayerStatusBadge status={player.status} />
                                <span className="font-medium">
                                    {player.status === 'hospital' && 'You are in the hospital recovering from your injuries.'}
                                    {player.status === 'jail' && 'You are serving time in jail.'}
                                    {player.status === 'traveling' && 'You are currently traveling.'}
                                </span>
                            </div>
                            <CountdownTimer targetDate={player.statusUntil} />
                        </div>
                    </div>
                )}

                {/* Player Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{player.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>Level {player.level}</span>
                            {player.faction && (
                                <>
                                    <span>•</span>
                                    <Link href={`/game/factions/${player.faction.id}`} className="hover:underline">
                                        [{player.faction.tag}] {player.faction.name}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="default">
                            <Link href="/game/combat">Attack</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/game/crimes">Crimes</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/game/gym">Gym</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/game/inventory">Inventory</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/game/factions">Factions</Link>
                        </Button>
                    </div>
                </div>

                {/* Experience Bar */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-2 flex justify-between text-sm">
                            <span>Experience</span>
                            <span>
                                {player.experience.toLocaleString()} / {player.experienceForNextLevel.toLocaleString()} XP
                            </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-3 rounded-full bg-purple-500 transition-all"
                                style={{ width: `${player.experienceProgress}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Stat Bars */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <StatBar label="Health" current={player.health} max={player.maxHealth} color="red" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <StatBar label="Energy" current={player.energy} max={player.maxEnergy} color="green" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <StatBar label="Nerve" current={player.nerve} max={player.maxNerve} color="blue" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <StatBar label="Happiness" current={player.happiness} max={player.maxHappiness} color="yellow" />
                        </CardContent>
                    </Card>
                </div>

                {/* Combat Stats & Economy */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Combat Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sword className="h-5 w-5" />
                                Combat Stats
                            </CardTitle>
                            <CardDescription>Total Battle Stats: {player.battleStats.toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                    <div className="flex items-center gap-2">
                                        <Sword className="h-4 w-4 text-red-500" />
                                        <span>Strength</span>
                                    </div>
                                    <span className="font-bold">{player.strength.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-yellow-500" />
                                        <span>Speed</span>
                                    </div>
                                    <span className="font-bold">{player.speed.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-500" />
                                        <span>Defense</span>
                                    </div>
                                    <span className="font-bold">{player.defense.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-green-500" />
                                        <span>Dexterity</span>
                                    </div>
                                    <span className="font-bold">{player.dexterity.toLocaleString()}</span>
                                </div>
                            </div>
                            {(equippedWeapon || equippedArmor) && (
                                <div className="mt-4 border-t pt-4">
                                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">Equipment</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {equippedWeapon && (
                                            <Badge variant="secondary">
                                                ⚔️ {equippedWeapon.name} (+{equippedWeapon.damage} dmg)
                                            </Badge>
                                        )}
                                        {equippedArmor && (
                                            <Badge variant="secondary">
                                                🛡️ {equippedArmor.name} (+{equippedArmor.armor} def)
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Economy */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                Economy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-green-500" />
                                        <span>Wallet</span>
                                    </div>
                                    <span className="text-xl font-bold">${player.wallet.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-blue-500" />
                                        <span>Bank</span>
                                    </div>
                                    <span className="text-xl font-bold">${player.bank.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">💎</span>
                                        <span>Points</span>
                                    </div>
                                    <span className="text-xl font-bold">{player.points.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                    <Link href="/game/bank">Bank</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                    <Link href="/game/market">Market</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics & Recent Activity */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Battle Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Battle Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard label="Attacks Won" value={player.attacksWon} />
                                <StatCard label="Attacks Lost" value={player.attacksLost} />
                                <StatCard label="Defends Won" value={player.defendsWon} />
                                <StatCard label="Defends Lost" value={player.defendsLost} />
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Crimes Committed</span>
                                    <span className="font-medium">{player.crimesCommitted.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Skull className="h-5 w-5" />
                                Recent Attacks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentAttacks.length === 0 && recentDefends.length === 0 ? (
                                <p className="text-center text-muted-foreground">No recent combat activity</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentAttacks.slice(0, 3).map((attack) => (
                                        <div key={attack.id} className="flex items-center justify-between rounded-lg bg-muted p-2 text-sm">
                                            <span>
                                                You attacked <strong>{attack.defender?.name}</strong>
                                            </span>
                                            <Badge variant={attack.result === 'win' ? 'default' : 'destructive'}>
                                                {attack.result === 'win' ? 'Won' : 'Lost'}
                                            </Badge>
                                        </div>
                                    ))}
                                    {recentDefends.slice(0, 3).map((attack) => (
                                        <div key={attack.id} className="flex items-center justify-between rounded-lg bg-muted p-2 text-sm">
                                            <span>
                                                <strong>{attack.attacker?.name}</strong> attacked you
                                            </span>
                                            <Badge variant={attack.result === 'lose' ? 'default' : 'destructive'}>
                                                {attack.result === 'lose' ? 'Defended' : 'Lost'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Button asChild variant="link" className="mt-2 w-full">
                                <Link href="/game/combat/history">View All Combat History</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
