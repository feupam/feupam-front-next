"use client"

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReservationTimerProps {
  expiresAt: Date | string;
  onExpire?: () => void;
  className?: string;
}

export function ReservationTimer({ expiresAt, onExpire, className = '' }: ReservationTimerProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const expirationTime = typeof expiresAt === 'string' ? new Date(expiresAt).getTime() : expiresAt.getTime();
    
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = expirationTime - now;
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        onExpire?.();
        return;
      }
      
      setTimeLeft(difference);
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 text-red-600 font-semibold ${className}`}>
        <Clock className="h-5 w-5" />
        <span>Reserva expirada</span>
      </div>
    );
  }

  const isUrgent = timeLeft < 60000; // Less than 1 minute

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-600 animate-pulse' : 'text-yellow-600'} font-semibold ${className}`}>
      <Clock className="h-5 w-5" />
      <span>Tempo restante: {formatTime(timeLeft)}</span>
    </div>
  );
}
