import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  initialTimeMs: number;
  onTimeEnd: () => void;
}

export function CountdownTimer({ initialTimeMs, onTimeEnd }: CountdownTimerProps) {
  const [remainingMs, setRemainingMs] = useState(initialTimeMs);
  const totalTimeMs = 10 * 60 * 1000; // 10 minutos
  const progressValue = (remainingMs / totalTimeMs) * 100;
  
  // Formata o tempo restante
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (remainingMs <= 0) {
      onTimeEnd();
      return;
    }

    const interval = setInterval(() => {
      setRemainingMs(prev => {
        const newValue = prev - 1000;
        if (newValue <= 0) {
          clearInterval(interval);
          onTimeEnd();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingMs, onTimeEnd]);

  const isWarning = remainingMs < 60000;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Tempo restante para concluir a compra</span>
        <span className={`font-mono font-medium ${isWarning ? 'text-destructive' : 'text-foreground'}`}>
          {formatTime(remainingMs)}
        </span>
      </div>
      <Progress 
        value={progressValue} 
        className={cn(
          "h-2",
          isWarning && "bg-destructive/20 [&>div]:bg-destructive"
        )}
      />
    </div>
  );
} 