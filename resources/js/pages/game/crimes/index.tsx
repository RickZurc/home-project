import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatBar } from '@/components/game';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { BreadcrumbItem, Crime, CrimeLog, CrimeResult } from '@/types';
import { AlertTriangle, DollarSign, Zap, Lock, Star, TrendingUp } from 'lucide-react';
import { usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Crimes', href: '/game/crimes' },
];

interface Props {
    crimes: Crime[];
    nerve: number;
    maxNerve: number;
    level: number;
    experience: number;
    experienceForNextLevel: number;
    experienceProgress: number;
    canCommitCrime: boolean;
    recentCrimes: CrimeLog[];
    nextUnlock: {
        name: string;
        levelRequired: number;
        levelsAway: number;
    } | null;
}

export default function Crimes({ 
    crimes, 
    nerve, 
    maxNerve, 
    level,
    experience,
    experienceForNextLevel,
    experienceProgress,
    canCommitCrime, 
    recentCrimes,
    nextUnlock 
}: Props) {
    const { props } = usePage();
    const crimeResult = (props as { crimeResult?: CrimeResult }).crimeResult;

    const { post, processing } = useForm({});

    const handleCommit = (crimeId: number) => {
        post(`/game/crimes/${crimeId}/commit`, {
            preserveScroll: true,
        });
    };

    const getSuccessRateColor = (rate: number) => {
        if (rate >= 80) return 'text-green-500';
        if (rate >= 60) return 'text-yellow-500';
        if (rate >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const unlockedCrimes = crimes.filter(c => !c.isLocked);
    const lockedCrimes = crimes.filter(c => c.isLocked);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crimes" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <AlertTriangle className="h-8 w-8" />
                            Crimes
                        </h1>
                        <p className="text-muted-foreground">Commit crimes to earn money and experience</p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                        <Star className="mr-2 h-5 w-5 text-yellow-500" />
                        Level {level}
                    </Badge>
                </div>

                {/* Level Progress & Nerve */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-purple-500" />
                                    <span className="font-medium">Level Progress</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {experience.toLocaleString()} / {experienceForNextLevel.toLocaleString()} XP
                                </span>
                            </div>
                            <Progress value={experienceProgress} className="h-3" />
                            {nextUnlock && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    <Lock className="inline h-3 w-3 mr-1" />
                                    <strong>{nextUnlock.name}</strong> unlocks at level {nextUnlock.levelRequired} 
                                    ({nextUnlock.levelsAway} level{nextUnlock.levelsAway !== 1 ? 's' : ''} away)
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <StatBar label="Nerve" current={nerve} max={maxNerve} color="blue" />
                            <p className="mt-2 text-sm text-muted-foreground">Nerve regenerates over time. Each crime costs nerve.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Crime Result Banner */}
                {crimeResult && (
                    <Card className={crimeResult.crimeSuccess ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'border-red-500 bg-red-50 dark:bg-red-950/30'}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                {crimeResult.crimeSuccess ? (
                                    <>
                                        <div className="rounded-full bg-green-500 p-2 text-white">✓</div>
                                        <div>
                                            <div className="font-bold text-green-700 dark:text-green-300">Success!</div>
                                            <div className="text-sm text-green-600 dark:text-green-400">
                                                {crimeResult.message}
                                                {crimeResult.rewards && (
                                                    <span className="ml-2">
                                                        +${crimeResult.rewards.money.toLocaleString()} | +{crimeResult.rewards.experience} XP
                                                        {crimeResult.rewards.item && ` | Found: ${crimeResult.rewards.item}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="rounded-full bg-red-500 p-2 text-white">✗</div>
                                        <div>
                                            <div className="font-bold text-red-700 dark:text-red-300">Busted!</div>
                                            <div className="text-sm text-red-600 dark:text-red-400">
                                                {crimeResult.message}
                                                {crimeResult.penalty?.jailTime && crimeResult.penalty.jailTime > 0 && (
                                                    <span className="ml-2">Jailed for {Math.floor(crimeResult.penalty.jailTime / 60)} minutes</span>
                                                )}
                                                {crimeResult.penalty?.hospitalTime && crimeResult.penalty.hospitalTime > 0 && (
                                                    <span className="ml-2">Hospitalized for {Math.floor(crimeResult.penalty.hospitalTime / 60)} minutes</span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Available Crimes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Crimes ({unlockedCrimes.length})</CardTitle>
                        <CardDescription>Higher level crimes offer better rewards but are riskier</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {unlockedCrimes.map((crime) => (
                                <div key={crime.id} className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold">{crime.name}</h3>
                                            <p className="text-xs text-muted-foreground">{crime.description}</p>
                                        </div>
                                        <Badge variant="outline">Lvl {crime.levelRequired}</Badge>
                                    </div>

                                    <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Zap className="h-4 w-4 text-blue-500" />
                                            <span>{crime.nerveCost} nerve</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className={`font-bold ${getSuccessRateColor(crime.successRate)}`}>{crime.successRate}%</span>
                                            <span className="text-muted-foreground">success</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-green-500" />
                                            <span>
                                                ${crime.moneyRange[0].toLocaleString()} - ${crime.moneyRange[1].toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-purple-500">✦</span>
                                            <span>
                                                {crime.expRange[0]} - {crime.expRange[1]} XP
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleCommit(crime.id)}
                                        disabled={!crime.canAttempt || !canCommitCrime || processing}
                                        className="w-full"
                                        variant={crime.canAttempt ? 'default' : 'secondary'}
                                    >
                                        {nerve < crime.nerveCost ? `Need ${crime.nerveCost} nerve` : 'Commit Crime'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Locked Crimes */}
                {lockedCrimes.length > 0 && (
                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-muted-foreground">
                                <Lock className="h-5 w-5" />
                                Locked Crimes ({lockedCrimes.length})
                            </CardTitle>
                            <CardDescription>Level up to unlock more crimes with better rewards</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {lockedCrimes.map((crime) => (
                                    <div key={crime.id} className="rounded-lg border border-dashed bg-muted/30 p-4 opacity-60">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold flex items-center gap-2">
                                                    <Lock className="h-4 w-4" />
                                                    {crime.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">{crime.description}</p>
                                            </div>
                                            <Badge variant="secondary">Lvl {crime.levelRequired}</Badge>
                                        </div>

                                        <div className="mb-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Zap className="h-4 w-4" />
                                                <span>{crime.nerveCost} nerve</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>???%</span>
                                                <span>success</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                <span>
                                                    ${crime.moneyRange[0].toLocaleString()} - ${crime.moneyRange[1].toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>✦</span>
                                                <span>
                                                    {crime.expRange[0]} - {crime.expRange[1]} XP
                                                </span>
                                            </div>
                                        </div>

                                        <Button disabled className="w-full" variant="outline">
                                            <Lock className="mr-2 h-4 w-4" />
                                            {crime.levelsUntilUnlock} level{crime.levelsUntilUnlock !== 1 ? 's' : ''} to unlock
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Crimes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentCrimes.length === 0 ? (
                            <p className="text-center text-muted-foreground">No recent crime activity</p>
                        ) : (
                            <div className="space-y-2">
                                {recentCrimes.map((log) => {
                                    const nerveSpent = log.nerveSpent ?? log.nerve_spent ?? 0;
                                    const moneyGained = log.moneyGained ?? log.money_gained ?? 0;
                                    const experienceGained = log.experienceGained ?? log.experience_gained ?? 0;
                                    const jailTime = log.jailTime ?? log.jail_time ?? 0;
                                    const hospitalTime = log.hospitalTime ?? log.hospital_time ?? 0;

                                    return (
                                        <div key={log.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`rounded-full p-1 ${log.success ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                                                    {log.success ? '✓' : '✗'}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{log.crime?.name}</div>
                                                    <div className="text-xs text-muted-foreground">{nerveSpent} nerve spent</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {log.success ? (
                                                    <>
                                                        <div className="font-bold text-green-500">+${moneyGained.toLocaleString()}</div>
                                                        <div className="text-xs text-muted-foreground">+{experienceGained} XP</div>
                                                    </>
                                                ) : (
                                                    <div className="text-red-500">
                                                        {jailTime > 0 && <span>Jailed {Math.floor(jailTime / 60)}m</span>}
                                                        {hospitalTime > 0 && <span>Hospital {Math.floor(hospitalTime / 60)}m</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
