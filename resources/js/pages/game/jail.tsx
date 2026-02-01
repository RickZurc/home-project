import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer, PlayerStatusBadge } from '@/components/game';
import type { BreadcrumbItem, Player } from '@/types';
import { Lock, Clock, Users, RefreshCw, AlertTriangle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Jail', href: '/game/jail' },
];

interface JailedPlayer extends Player {
    jailUntil: string;
    jailReason?: string;
}

interface Props {
    players: JailedPlayer[];
    totalCount: number;
    myStatus: {
        isJailed: boolean;
        jailUntil?: string;
        jailReason?: string;
    };
}

export default function Jail({ players, totalCount, myStatus }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jail" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Lock className="h-8 w-8 text-yellow-500" />
                            Jail
                        </h1>
                        <p className="text-muted-foreground">Players serving time for their crimes</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/game/jail" method="get">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Link>
                    </Button>
                </div>

                {/* Your Status */}
                {myStatus.isJailed && myStatus.jailUntil && (
                    <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-8 w-8 text-yellow-500" />
                                    <div>
                                        <div className="text-lg font-bold text-yellow-500">You are in jail</div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-muted-foreground">You cannot attack, train, or commit crimes</p>
                                            {myStatus.jailReason && (
                                                <Badge variant="secondary">{myStatus.jailReason}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Time remaining</div>
                                    <CountdownTimer targetDate={myStatus.jailUntil} className="text-2xl font-bold text-yellow-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <div className="text-2xl font-bold">{totalCount}</div>
                                    <div className="text-sm text-muted-foreground">Total In Jail</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tip */}
                <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                                <div className="font-medium">Tip: Avoid Jail Time</div>
                                <p className="text-sm text-muted-foreground">
                                    Higher nerve and intelligence stats increase your success rate for crimes, reducing your chances of getting caught.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Jailed Players */}
                <Card>
                    <CardHeader>
                        <CardTitle>Jailed Players</CardTitle>
                        <CardDescription>Players currently serving time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {players.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Lock className="h-16 w-16 text-muted-foreground" />
                                <h2 className="mt-4 text-xl font-medium">Jail is empty</h2>
                                <p className="mt-2 text-muted-foreground">No one is currently serving time</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {players.map((player) => (
                                    <div key={player.id} className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-500 dark:bg-yellow-950">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{player.name}</div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>Level {player.level}</span>
                                                    {player.jailReason && (
                                                        <>
                                                            <span>•</span>
                                                            <Badge variant="outline">{player.jailReason}</Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    Time left
                                                </div>
                                                <CountdownTimer targetDate={player.jailUntil} className="font-bold text-yellow-500" />
                                            </div>
                                            <PlayerStatusBadge status="jail" />
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
