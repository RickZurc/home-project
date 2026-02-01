import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer, PlayerStatusBadge } from '@/components/game';
import type { BreadcrumbItem, Player } from '@/types';
import { Heart, Clock, Users, RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Hospital', href: '/game/hospital' },
];

interface HospitalizedPlayer extends Player {
    hospitalUntil: string;
    hospitalizedBy?: string;
}

interface Props {
    players: HospitalizedPlayer[];
    totalCount: number;
    myStatus: {
        isHospitalized: boolean;
        hospitalUntil?: string;
    };
}

export default function Hospital({ players, totalCount, myStatus }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hospital" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Heart className="h-8 w-8 text-red-500" />
                            Hospital
                        </h1>
                        <p className="text-muted-foreground">Players recovering from combat</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/game/hospital" method="get">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Link>
                    </Button>
                </div>

                {/* Your Status */}
                {myStatus.isHospitalized && myStatus.hospitalUntil && (
                    <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Heart className="h-8 w-8 text-red-500" />
                                    <div>
                                        <div className="text-lg font-bold text-red-500">You are hospitalized</div>
                                        <p className="text-muted-foreground">You cannot attack or commit crimes while recovering</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Time remaining</div>
                                    <CountdownTimer targetDate={myStatus.hospitalUntil} className="text-2xl font-bold text-red-500" />
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
                                    <div className="text-sm text-muted-foreground">Total Hospitalized</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Hospitalized Players */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hospitalized Players</CardTitle>
                        <CardDescription>Players currently recovering from their injuries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {players.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Heart className="h-16 w-16 text-muted-foreground" />
                                <h2 className="mt-4 text-xl font-medium">No one is hospitalized</h2>
                                <p className="mt-2 text-muted-foreground">Everyone is healthy and ready for action</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {players.map((player) => (
                                    <div key={player.id} className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-950">
                                                <Heart className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{player.name}</div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>Level {player.level}</span>
                                                    {player.hospitalizedBy && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Attacked by {player.hospitalizedBy}</span>
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
                                                <CountdownTimer targetDate={player.hospitalUntil} className="font-bold text-red-500" />
                                            </div>
                                            <PlayerStatusBadge status="hospital" />
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
