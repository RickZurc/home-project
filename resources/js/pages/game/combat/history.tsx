import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem, CombatLog as CombatLogType, PlayerBasic } from '@/types';
import { Sword, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Combat', href: '/game/combat' },
    { title: 'History', href: '/game/combat/history' },
];

interface Props {
    attacks: {
        data: Array<CombatLogType & { attacker: PlayerBasic; defender: PlayerBasic }>;
        current_page: number;
        last_page: number;
    };
}

export default function CombatHistory({ attacks }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Combat History" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/game/combat">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Sword className="h-8 w-8" />
                            Combat History
                        </h1>
                        <p className="text-muted-foreground">View your past battles</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Battles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {attacks.data.length === 0 ? (
                            <p className="text-center text-muted-foreground">No combat history yet</p>
                        ) : (
                            <div className="space-y-2">
                                {attacks.data.map((attack) => (
                                    <Link
                                        key={attack.id}
                                        href={`/game/combat/log/${attack.id}`}
                                        className="flex items-center justify-between rounded-lg bg-muted p-4 transition-all hover:bg-muted/80"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="font-medium">
                                                    <span className="text-blue-500">{attack.attacker?.name}</span>
                                                    <span className="mx-2 text-muted-foreground">vs</span>
                                                    <span className="text-red-500">{attack.defender?.name}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(attack.createdAt)} • {attack.turns} turns
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {attack.moneyStolen > 0 && (
                                                <span className="text-sm text-green-500">+${attack.moneyStolen.toLocaleString()}</span>
                                            )}
                                            <Badge
                                                variant={
                                                    attack.result === 'win' ? 'default' : attack.result === 'lose' ? 'destructive' : 'secondary'
                                                }
                                            >
                                                {attack.result === 'win' ? 'Victory' : attack.result === 'lose' ? 'Defeat' : attack.result}
                                            </Badge>
                                        </div>
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
