import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: number | string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

export function StatCard({ label, value, icon, trend, trendValue, className }: StatCardProps) {
    return (
        <div className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                {icon && <span className="text-muted-foreground">{icon}</span>}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                {trend && trendValue && (
                    <span
                        className={cn('text-sm', {
                            'text-green-500': trend === 'up',
                            'text-red-500': trend === 'down',
                            'text-gray-500': trend === 'neutral',
                        })}
                    >
                        {trend === 'up' && '↑'}
                        {trend === 'down' && '↓'}
                        {trendValue}
                    </span>
                )}
            </div>
        </div>
    );
}
