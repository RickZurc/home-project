import { cn } from '@/lib/utils';
import type { PlayerStatus } from '@/types/game';

interface PlayerStatusBadgeProps {
    status: PlayerStatus;
    statusUntil?: string | null;
    className?: string;
}

const statusConfig = {
    okay: {
        label: 'Available',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    hospital: {
        label: 'Hospital',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
    jail: {
        label: 'Jail',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    },
    traveling: {
        label: 'Traveling',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
};

export function PlayerStatusBadge({ status, className }: PlayerStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.okay;

    return (
        <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-xs font-medium', config.className, className)}>
            {config.label}
        </span>
    );
}
