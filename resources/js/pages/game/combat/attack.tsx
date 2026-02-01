import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayerStatusBadge } from '@/components/game';
import type { BreadcrumbItem, FactionBasic } from '@/types';
import { Sword, ArrowLeft, Zap, AlertTriangle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Combat', href: '/game/combat' },
    { title: 'Attack', href: '#' },
];

interface Props {
    target: {
        id: number;
        name: string;
        level: number;
        status: 'okay' | 'hospital' | 'jail' | 'traveling';
        faction: FactionBasic | null;
    };
    canAttack: boolean;
    energy: number;
    energyCost: number;
}

export default function Attack({ target, canAttack, energy, energyCost }: Props) {
    const { post, processing } = useForm({});

    const handleAttack = () => {
        post(`/game/combat/${target.id}/attack`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Attack ${target.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/game/combat">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Attack {target.name}</h1>
                        <p className="text-muted-foreground">Prepare to engage in combat</p>
                    </div>
                </div>

                {/* Target Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Target Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                                {target.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">{target.name}</h2>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">Level {target.level}</Badge>
                                    <PlayerStatusBadge status={target.status} />
                                    {target.faction && (
                                        <Badge variant="secondary">
                                            [{target.faction.tag}] {target.faction.name}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attack Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sword className="h-5 w-5" />
                            Combat Details
                        </CardTitle>
                        <CardDescription>Review the requirements before attacking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg bg-muted p-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Zap className="h-4 w-4" />
                                    Energy Cost
                                </div>
                                <div className="mt-1 text-2xl font-bold">{energyCost}</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    You have: <span className={energy >= energyCost ? 'text-green-500' : 'text-red-500'}>{energy}</span>
                                </div>
                            </div>
                            <div className="rounded-lg bg-muted p-4">
                                <div className="text-sm text-muted-foreground">Potential Rewards</div>
                                <ul className="mt-2 space-y-1 text-sm">
                                    <li>• Steal up to 5% of target&apos;s wallet</li>
                                    <li>• Gain experience based on level difference</li>
                                    <li>• Earn respect for your faction</li>
                                </ul>
                            </div>
                        </div>

                        {!canAttack && (
                            <div className="mt-4 flex items-center gap-2 rounded-lg bg-orange-100 p-4 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                <AlertTriangle className="h-5 w-5" />
                                <span>
                                    {target.status !== 'okay'
                                        ? `${target.name} is not available for attack (${target.status})`
                                        : energy < energyCost
                                          ? 'Not enough energy to attack'
                                          : 'You are not able to attack right now'}
                                </span>
                            </div>
                        )}

                        <div className="mt-6 flex gap-4">
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/game/combat">Cancel</Link>
                            </Button>
                            <Button onClick={handleAttack} disabled={!canAttack || processing} className="flex-1" variant="destructive">
                                {processing ? (
                                    'Attacking...'
                                ) : (
                                    <>
                                        <Sword className="mr-2 h-4 w-4" />
                                        Attack {target.name}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Warning */}
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-300">
                                <strong>Warning:</strong> Combat results depend on both players&apos; stats, equipment, and some luck. If you lose,
                                you may end up in the hospital and lose money. Make sure you&apos;re prepared before attacking.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
