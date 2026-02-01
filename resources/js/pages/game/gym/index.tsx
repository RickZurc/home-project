import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatBar } from '@/components/game';
import type { BreadcrumbItem, GymActivity } from '@/types';
import { Dumbbell, Zap, Shield, Target, Sword } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Game', href: '/game' },
    { title: 'Gym', href: '/game/gym' },
];

interface Props {
    stats: {
        strength: number;
        speed: number;
        defense: number;
        dexterity: number;
    };
    energy: number;
    maxEnergy: number;
    happiness: number;
    maxHappiness: number;
    canTrain: boolean;
    recentActivities: GymActivity[];
}

const statConfig = {
    strength: {
        label: 'Strength',
        icon: Sword,
        color: 'text-red-500',
        description: 'Increases damage dealt in combat',
    },
    speed: {
        label: 'Speed',
        icon: Zap,
        color: 'text-yellow-500',
        description: 'Increases dodge chance and escape rate',
    },
    defense: {
        label: 'Defense',
        icon: Shield,
        color: 'text-blue-500',
        description: 'Reduces damage taken in combat',
    },
    dexterity: {
        label: 'Dexterity',
        icon: Target,
        color: 'text-green-500',
        description: 'Increases critical hit chance and accuracy',
    },
};

type StatType = keyof typeof statConfig;

export default function Gym({ stats, energy, maxEnergy, happiness, maxHappiness, canTrain, recentActivities }: Props) {
    const [selectedStat, setSelectedStat] = useState<StatType>('strength');
    const [energyToSpend, setEnergyToSpend] = useState(5);

    const { post, processing, setData, data } = useForm({
        stat: 'strength' as StatType,
        energy: 5,
    });

    // Sync form data when selected stat or energy changes
    useEffect(() => {
        setData('stat', selectedStat);
    }, [selectedStat]);

    useEffect(() => {
        setData('energy', energyToSpend);
    }, [energyToSpend]);

    const handleTrain = () => {
        post('/game/gym/train', {
            preserveScroll: true,
        });
    };

    const happinessBonus = Math.round((happiness / maxHappiness) * 50);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gym" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <Dumbbell className="h-8 w-8" />
                            Gym
                        </h1>
                        <p className="text-muted-foreground">Train your combat stats to become stronger</p>
                    </div>
                </div>

                {/* Energy & Happiness */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <StatBar label="Energy" current={energy} max={maxEnergy} color="green" />
                            <p className="mt-2 text-sm text-muted-foreground">Training costs 5 energy per session</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <StatBar label="Happiness" current={happiness} max={maxHappiness} color="yellow" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                Current happiness bonus: <span className="font-medium text-green-500">+{happinessBonus}%</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Training Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Select Stat to Train</CardTitle>
                        <CardDescription>Choose which combat stat you want to improve</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {(Object.keys(statConfig) as StatType[]).map((stat) => {
                                const config = statConfig[stat];
                                const Icon = config.icon;
                                const isSelected = selectedStat === stat;

                                return (
                                    <button
                                        key={stat}
                                        onClick={() => setSelectedStat(stat)}
                                        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                            isSelected ? 'border-primary bg-primary/5' : 'border-transparent bg-muted hover:border-muted-foreground/20'
                                        }`}
                                    >
                                        <Icon className={`h-8 w-8 ${config.color}`} />
                                        <div className="text-center">
                                            <div className="font-medium">{config.label}</div>
                                            <div className="text-2xl font-bold">{stats[stat].toLocaleString()}</div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{config.description}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Energy Slider */}
                        <div className="mt-6 border-t pt-6">
                            <label className="mb-2 block text-sm font-medium">Energy to spend: {energyToSpend}</label>
                            <input
                                type="range"
                                min={5}
                                max={Math.min(energy, 100)}
                                step={5}
                                value={energyToSpend}
                                onChange={(e) => setEnergyToSpend(Number(e.target.value))}
                                className="w-full"
                                disabled={energy < 5}
                            />
                            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                <span>5</span>
                                <span>{Math.min(energy, 100)}</span>
                            </div>
                        </div>

                        <Button onClick={handleTrain} disabled={!canTrain || processing} className="mt-6 w-full" size="lg">
                            {processing ? 'Training...' : `Train ${statConfig[selectedStat].label}`}
                        </Button>

                        {!canTrain && <p className="mt-2 text-center text-sm text-red-500">Not enough energy or you are unavailable</p>}
                    </CardContent>
                </Card>

                {/* Recent Training */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Training</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActivities.length === 0 ? (
                            <p className="text-center text-muted-foreground">No recent training activity</p>
                        ) : (
                            <div className="space-y-2">
                                {recentActivities.map((activity) => {
                                    const statTrained = activity.statTrained ?? activity.stat_trained;
                                    const config = statConfig[statTrained as StatType];
                                    const Icon = config?.icon || Dumbbell;
                                    const energySpent = activity.energySpent ?? activity.energy_spent ?? 0;
                                    const statGained = activity.statGained ?? activity.stat_gained ?? 0;
                                    const statBefore = activity.statBefore ?? activity.stat_before ?? 0;
                                    const statAfter = activity.statAfter ?? activity.stat_after ?? 0;

                                    return (
                                        <div key={activity.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                                            <div className="flex items-center gap-3">
                                                <Icon className={`h-5 w-5 ${config?.color || 'text-gray-500'}`} />
                                                <div>
                                                    <div className="font-medium">{config?.label || statTrained}</div>
                                                    <div className="text-xs text-muted-foreground">{energySpent} energy spent</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-500">+{statGained}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {statBefore.toLocaleString()} → {statAfter.toLocaleString()}
                                                </div>
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
