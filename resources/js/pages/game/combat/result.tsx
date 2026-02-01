import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem, CombatResult, CombatTurn } from '@/types';
import { Sword, Trophy, Skull, DollarSign, Zap, Heart, Clock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Combat', href: '/game/combat' },
    { title: 'Result', href: '#' },
];

interface Props {
    result: CombatResult;
    target: {
        id: number;
        name: string;
    };
}

export default function CombatResult({ result, target }: Props) {
    const isVictory = result.winner === 'attacker';
    const isDefeat = result.winner === 'defender';
    const isStalemate = result.result === 'stalemate';
    const isEscape = result.result === 'escape';

    const getResultIcon = () => {
        if (isVictory) return <Trophy className="h-16 w-16 text-yellow-500" />;
        if (isDefeat) return <Skull className="h-16 w-16 text-red-500" />;
        return <Sword className="h-16 w-16 text-gray-500" />;
    };

    const getResultTitle = () => {
        if (isVictory) return 'Victory!';
        if (isDefeat) return 'Defeated!';
        if (isEscape) return 'Target Escaped!';
        return 'Stalemate';
    };

    const getResultDescription = () => {
        if (isVictory) return `You defeated ${target.name} and claimed your rewards!`;
        if (isDefeat) return `${target.name} overpowered you. Better luck next time.`;
        if (isEscape) return `${target.name} managed to escape before you could finish them off.`;
        return 'Neither combatant could gain the upper hand.';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Combat Result" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Result Banner */}
                <Card className={isVictory ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30' : isDefeat ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : ''}>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            {getResultIcon()}
                            <h1 className="mt-4 text-3xl font-bold">{getResultTitle()}</h1>
                            <p className="mt-2 text-muted-foreground">{getResultDescription()}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Sword className="h-8 w-8 text-red-500" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Your Damage</div>
                                    <div className="text-2xl font-bold">{result.summary.attackerDamage.toLocaleString()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Heart className="h-8 w-8 text-pink-500" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Damage Taken</div>
                                    <div className="text-2xl font-bold">{result.summary.defenderDamage.toLocaleString()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-8 w-8 text-green-500" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Money {isVictory ? 'Stolen' : 'Lost'}</div>
                                    <div className={`text-2xl font-bold ${isVictory ? 'text-green-500' : 'text-red-500'}`}>
                                        {isVictory ? '+' : '-'}${result.summary.moneyStolen.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Zap className="h-8 w-8 text-purple-500" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Experience</div>
                                    <div className="text-2xl font-bold text-purple-500">+{result.summary.experienceGained}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Hospital Time */}
                {(result.summary.attackerHospitalTime > 0 || result.summary.defenderHospitalTime > 0) && (
                    <Card className="border-red-500 bg-red-50 dark:bg-red-950/30">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Clock className="h-6 w-6 text-red-500" />
                                <div>
                                    {result.summary.attackerHospitalTime > 0 && (
                                        <p>You were hospitalized for {Math.floor(result.summary.attackerHospitalTime / 60)} minutes.</p>
                                    )}
                                    {result.summary.defenderHospitalTime > 0 && (
                                        <p>{target.name} was hospitalized for {Math.floor(result.summary.defenderHospitalTime / 60)} minutes.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Combat Log */}
                <Card>
                    <CardHeader>
                        <CardTitle>Combat Log</CardTitle>
                        <CardDescription>Turn by turn breakdown of the fight ({result.summary.turns} turns)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {result.log.map((turn, index) => (
                                <div
                                    key={index}
                                    className={`rounded-lg p-3 ${
                                        turn.phase === 'attack' ? 'bg-blue-50 dark:bg-blue-950/30' : 
                                        turn.phase === 'counter' ? 'bg-red-50 dark:bg-red-950/30' : 
                                        'bg-yellow-50 dark:bg-yellow-950/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Turn {turn.turn}</Badge>
                                            <span className="font-medium">
                                                {turn.phase === 'escape' ? (
                                                    `${turn.defender} escaped!`
                                                ) : turn.dodged ? (
                                                    `${turn.attacker} attacked but missed!`
                                                ) : (
                                                    `${turn.attacker} hit for ${turn.damage} damage${turn.critical ? ' (Critical!)' : ''}`
                                                )}
                                            </span>
                                        </div>
                                        {turn.critical && <Badge className="bg-yellow-500">CRIT!</Badge>}
                                        {turn.dodged && <Badge variant="secondary">DODGED</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button asChild className="flex-1">
                        <Link href="/game">Back to Dashboard</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                        <Link href="/game/combat">Find More Targets</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
