import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlayerStatusBadge } from '@/components/game';
import type { BreadcrumbItem, Faction, Player } from '@/types';
import { ArrowLeft, Users, Crown, Shield, Swords, DollarSign, LogOut, UserPlus, Trash } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Factions', href: '/game/factions' },
    { title: 'Details', href: '#' },
];

interface Props {
    faction: Faction & {
        members: Player[];
        leader: Player;
        wars: { enemy: Faction }[];
    };
    isLeader: boolean;
    isMember: boolean;
    hasInvite: boolean;
}

export default function FactionShow({ faction, isLeader, isMember, hasInvite }: Props) {
    const { auth } = usePage().props as any;
    const inviteForm = useForm({ username: '' });
    const donateForm = useForm({ amount: '' });
    const leaveForm = useForm({});
    const warForm = useForm({ target_id: '' });

    const handleInvite = () => {
        if (inviteForm.data.username) {
            inviteForm.post(`/game/factions/${faction.id}/invite`, { preserveScroll: true });
        }
    };

    const handleDonate = () => {
        if (donateForm.data.amount) {
            donateForm.post(`/game/factions/${faction.id}/donate`, { preserveScroll: true });
        }
    };

    const handleLeave = () => {
        if (confirm('Are you sure you want to leave this faction?')) {
            leaveForm.post(`/game/factions/${faction.id}/leave`, { preserveScroll: true });
        }
    };

    const handleKick = (memberId: number) => {
        if (confirm('Are you sure you want to kick this member?')) {
            leaveForm.post(`/game/factions/${faction.id}/kick/${memberId}`, { preserveScroll: true });
        }
    };

    const handleJoin = () => {
        leaveForm.post(`/game/factions/${faction.id}/join`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={faction.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/game/factions">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            {faction.name}
                            {faction.tag && <Badge variant="outline">[{faction.tag}]</Badge>}
                        </h1>
                        {faction.description && <p className="text-muted-foreground">{faction.description}</p>}
                    </div>
                    {hasInvite && (
                        <Button onClick={handleJoin} disabled={leaveForm.processing}>
                            Accept Invite
                        </Button>
                    )}
                    {isMember && !isLeader && (
                        <Button variant="destructive" onClick={handleLeave} disabled={leaveForm.processing}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Leave Faction
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8 text-blue-500" />
                                <div>
                                    <div className="text-2xl font-bold">{faction.membersCount}</div>
                                    <div className="text-sm text-muted-foreground">Members</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Shield className="h-8 w-8 text-purple-500" />
                                <div>
                                    <div className="text-2xl font-bold">{faction.respect.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">Respect</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-8 w-8 text-green-500" />
                                <div>
                                    <div className="text-2xl font-bold">${faction.treasury.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">Treasury</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Crown className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <div className="text-lg font-bold">{faction.leader.name}</div>
                                    <div className="text-sm text-muted-foreground">Leader</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Wars */}
                {faction.atWar && faction.wars && faction.wars.length > 0 && (
                    <Card className="border-red-500/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-500">
                                <Swords className="h-5 w-5" />
                                Active Wars
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {faction.wars.map((war) => (
                                    <div key={war.enemy.id} className="flex items-center justify-between rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
                                        <div>
                                            <span className="font-medium">{war.enemy.name}</span>
                                            {war.enemy.tag && <Badge variant="outline" className="ml-2">[{war.enemy.tag}]</Badge>}
                                        </div>
                                        <Badge variant="destructive">At War</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Member Management - Leaders Only */}
                {isLeader && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Faction Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium mb-2">Invite Player</div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter username"
                                        value={inviteForm.data.username}
                                        onChange={(e) => inviteForm.setData('username', e.target.value)}
                                    />
                                    <Button onClick={handleInvite} disabled={inviteForm.processing}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Invite
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Donate - Members Only */}
                {isMember && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Donate to Treasury</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={donateForm.data.amount}
                                    onChange={(e) => donateForm.setData('amount', e.target.value)}
                                />
                                <Button onClick={handleDonate} disabled={donateForm.processing}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Donate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Members List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Members</CardTitle>
                        <CardDescription>{faction.membersCount} total members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {faction.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between rounded-lg bg-muted p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{member.name}</span>
                                                {member.id === faction.leader.id && (
                                                    <Badge variant="secondary">
                                                        <Crown className="mr-1 h-3 w-3" />
                                                        Leader
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Level {member.level}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {member.status && <PlayerStatusBadge status={member.status} />}
                                        {isLeader && member.id !== auth.user.id && (
                                            <Button variant="ghost" size="icon" onClick={() => handleKick(member.id)}>
                                                <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
