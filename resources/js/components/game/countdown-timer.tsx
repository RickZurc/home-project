import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
    targetDate: string | null;
    onComplete?: () => void;
    className?: string;
    showLabel?: boolean;
    label?: string;
}

export function CountdownTimer({ targetDate, onComplete, className, showLabel = true, label = 'Time remaining' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!targetDate) {
            setTimeLeft(0);
            return;
        }

        const target = new Date(targetDate).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, target - now);
            setTimeLeft(diff);

            if (diff === 0 && onComplete) {
                onComplete();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [targetDate, onComplete]);

    if (timeLeft === 0) {
        return null;
    }

    const seconds = Math.floor((timeLeft / 1000) % 60);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const hours = Math.floor((timeLeft / 1000 / 60 / 60) % 24);
    const days = Math.floor(timeLeft / 1000 / 60 / 60 / 24);

    const formatTime = () => {
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0 || days > 0) parts.push(`${hours}h`);
        if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);
        return parts.join(' ');
    };

    return (
        <div className={cn('text-sm', className)}>
            {showLabel && <span className="text-muted-foreground">{label}: </span>}
            <span className="font-mono font-medium text-orange-500">{formatTime()}</span>
        </div>
    );
}
