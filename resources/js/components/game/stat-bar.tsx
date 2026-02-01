import { cn } from '@/lib/utils';

interface StatBarProps {
    label: string;
    current: number;
    max: number;
    color?: 'red' | 'green' | 'blue' | 'yellow' | 'purple';
    showValues?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const colorClasses = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
};

export function StatBar({
    label,
    current,
    max,
    color = 'green',
    showValues = true,
    size = 'md',
    className,
}: StatBarProps) {
    const percentage = max > 0 ? Math.min(100, (current / max) * 100) : 0;

    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    return (
        <div className={cn('space-y-1', className)}>
            <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                {showValues && (
                    <span className="text-gray-500 dark:text-gray-400">
                        {current.toLocaleString()} / {max.toLocaleString()}
                    </span>
                )}
            </div>
            <div className={cn('w-full rounded-full bg-gray-200 dark:bg-gray-700', sizeClasses[size])}>
                <div
                    className={cn('rounded-full transition-all duration-300', colorClasses[color], sizeClasses[size])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
