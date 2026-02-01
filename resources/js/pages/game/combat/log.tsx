import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem, CombatLog as CombatLogType, CombatTurn } from '@/types';
import { ArrowLeft, Swords, Trophy, Heart, Shield, Zap } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Combat', href: '/game/combat' },
    { title: 'Log', href: '#' },
];

interface Props {
    combat: CombatLogType;
}

export default function CombatLog({ combat }: Props) {
    const getTurnIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <Zap className="h-4 w-4 text-yellow-500" />;
            case 'miss':
                return <Shield className="h-4 w-4 text-blue-500" />;
            default:
                return <Swords className="h-4 w-4 text-red-500" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Combat Log" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/game/combat/history">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Swords className="h-8 w-8" />
                            Combat Log
                        </h1>
                        <p className="text-muted-foreground">
                            {combat.attacker?.name} vs {combat.defender?.name}
                        </p>
                    </div>
                </div>

                {/* Combat Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Battle Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg bg-muted p-4">
                                <div className="text-sm text-muted-foreground">Attacker</div>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-xl font-bold">{combat.attacker?.name}</span>
                                    {combat.winnerId === combat.attackerId && (
                                        <Badge className="bg-green-500">Winner</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-lg bg-muted p-4 text-center">
                                <div className="text-sm text-muted-foreground">Result</div>
                                <div className="mt-1 text-xl font-bold">
                                    {combat.turns || 0} turns
                                </div>
                                <Badge variant={combat.result === 'escape' ? 'secondary' : 'default'}>
                                    {combat.result === 'escape' ? 'Escaped' : 'Knockout'}
                                </Badge>
                            </div>
                            <div className="rounded-lg bg-muted p-4">
                                <div className="text-sm text-muted-foreground">Defender</div>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-xl font-bold">{combat.defender?.name}</span>
                                    {combat.winnerId === combat.defenderId && (
                                        <Badge className="bg-green-500">Winner</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Rewards */}
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {combat.experienceGained !== undefined && combat.experienceGained > 0 && (
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <span className="text-muted-foreground">XP Earned</span>
                                    <span className="font-bold text-blue-500">+{combat.experienceGained}</span>
                                </div>
                            )}
                            {combat.respectGained !== undefined && combat.respectGained > 0 && (
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <span className="text-muted-foreground">Respect Earned</span>
                                    <span className="font-bold text-purple-500">+{combat.respectGained}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Turn-by-Turn Log */}
                <Card>
                    <CardHeader>
                        <CardTitle>Turn-by-Turn Log</CardTitle>
                        <CardDescription>Complete breakdown of the fight</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative space-y-2">
                            {combat.log?.map((turn: CombatTurn, index: number) => {
                                const isAttacker = turn.attacker === 'attacker';
                                const attackerName = isAttacker ? combat.attacker?.name : combat.defender?.name;
                                const defenderName = isAttacker ? combat.defender?.name : combat.attacker?.name;
                                const turnType = turn.critical ? 'critical' : turn.dodged ? 'miss' : 'normal';

                                return (
                                    <div
                                        key={index}
                                        className={`relative rounded-lg border p-4 ${
                                            turnType === 'critical'
                                                ? 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20'
                                                : turnType === 'miss'
                                                  ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/20'
                                                  : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {getTurnIcon(turnType)}
                                                        <span className="font-medium">{attackerName}</span>
                                                        <span className="text-muted-foreground">→</span>
                                                        <span className="font-medium">{defenderName}</span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">{turn.message || `${turn.damage > 0 ? `Dealt ${turn.damage} damage` : 'Missed!'}`}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {turn.damage > 0 && (
                                                    <Badge variant={turnType === 'critical' ? 'default' : 'secondary'}>
                                                        -{turn.damage} HP
                                                    </Badge>
                                                )}
                                                {turnType === 'miss' && <Badge variant="outline">Missed</Badge>}
                                            </div>
                                        </div>

                                        {/* Health bars after turn */}
                                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                    <span>{combat.attacker?.name}</span>
                                                    <span>{turn.attackerHp ?? turn.remainingHealth} HP</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full bg-red-500 transition-all"
                                                        style={{ width: `${Math.max(0, ((turn.attackerHp ?? turn.remainingHealth) / 100) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                    <span>{combat.defender?.name}</span>
                                                    <span>{turn.defenderHp ?? turn.remainingHealth} HP</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all"
                                                        style={{ width: `${Math.max(0, ((turn.defenderHp ?? turn.remainingHealth) / 100) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Final Result */}
                            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                                <div className="flex items-center justify-center gap-3">
                                    <Trophy className="h-6 w-6 text-yellow-500" />
                                    <span className="text-xl font-bold">
                                        {combat.result === 'escape'
                                            ? `${combat.winnerId === combat.attackerId ? combat.defender?.name : combat.attacker?.name} escaped!`
                                            : `${combat.winnerId === combat.attackerId ? combat.attacker?.name : combat.defender?.name} wins!`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
