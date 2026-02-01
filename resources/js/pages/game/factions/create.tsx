import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Users, DollarSign, AlertTriangle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Factions', href: '/game/factions' },
    { title: 'Create', href: '/game/factions/create' },
];

const CREATION_COST = 100000;

interface Props {
    wallet: number;
}

export default function FactionCreate({ wallet }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        tag: '',
        description: '',
    });

    const canAfford = wallet >= CREATION_COST;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/game/factions', { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Faction" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/game/factions">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Users className="h-8 w-8" />
                            Create Faction
                        </h1>
                        <p className="text-muted-foreground">Start your own faction and build an empire</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Faction Details</CardTitle>
                            <CardDescription>Fill in the details for your new faction</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Faction Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter faction name"
                                        maxLength={50}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tag">Faction Tag (optional)</Label>
                                    <Input
                                        id="tag"
                                        value={data.tag}
                                        onChange={(e) => setData('tag', e.target.value.toUpperCase())}
                                        placeholder="ABC"
                                        maxLength={5}
                                    />
                                    <p className="text-xs text-muted-foreground">3-5 character tag shown next to member names</p>
                                    {errors.tag && <p className="text-sm text-red-500">{errors.tag}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                        placeholder="Describe your faction..."
                                        rows={4}
                                        maxLength={500}
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <Button type="submit" disabled={processing || !canAfford} className="w-full">
                                    Create Faction - ${CREATION_COST.toLocaleString()}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Cost
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span>Creation Fee:</span>
                                        <span className="font-bold">${CREATION_COST.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Your Balance:</span>
                                        <span className={canAfford ? 'font-bold text-green-500' : 'font-bold text-red-500'}>
                                            ${wallet.toLocaleString()}
                                        </span>
                                    </div>
                                    {!canAfford && (
                                        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-500 dark:bg-red-950/30">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span className="text-sm">Insufficient funds</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>What You Get</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        Lead your own faction
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        Invite and manage members
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        Faction treasury for group funds
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        Declare war on rival factions
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        Earn faction respect through combat
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
