import { cn } from '@/lib/utils';
import type { ItemRarity } from '@/types/game';

interface RarityBadgeProps {
    rarity: ItemRarity;
    className?: string;
}

const rarityConfig: Record<ItemRarity, { label: string; className: string }> = {
    common: {
        label: 'Common',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    },
    uncommon: {
        label: 'Uncommon',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    rare: {
        label: 'Rare',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
    epic: {
        label: 'Epic',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    },
    legendary: {
        label: 'Legendary',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    },
};

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
    const config = rarityConfig[rarity] || rarityConfig.common;

    return (
        <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-xs font-medium', config.className, className)}>
            {config.label}
        </span>
    );
}
