/**
 * Hook para Countdown Timer da Reserva
 * 
 * - Atualiza a cada 1 segundo
 * - Busca remainingSeconds da API
 * - Alert quando falta 1 minuto
 * - Callback quando expira
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ReservationAPI } from '@/services/reservation.api';

export interface CountdownTimerState {
  remainingMinutes: number;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number; // 0-100
  expired: boolean;
  formatted: string; // "4:59"
}

interface UseCountdownTimerOptions {
  ticketId: string;
  onExpired?: () => void;
  onOneMinuteLeft?: () => void;
  enabled?: boolean;
}

export function useCountdownTimer({ 
  ticketId, 
  onExpired, 
  onOneMinuteLeft,
  enabled = true 
}: UseCountdownTimerOptions) {
  const [state, setState] = useState<CountdownTimerState>({
    remainingMinutes: 5,
    remainingSeconds: 300,
    totalSeconds: 300,
    progress: 100,
    expired: false,
    formatted: '5:00',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const oneMinuteAlertShown = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Função para formatar o tempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para buscar status da API
  const fetchStatus = useCallback(async () => {
    if (!ticketId || !enabled) return;

    try {
      setLoading(true);
      const data = await ReservationAPI.getReservationStatus(ticketId);
      
      const totalSeconds = data.remainingSeconds || 0;
      const minutes = data.remainingMinutes || Math.floor(totalSeconds / 60);
      
      setState({
        remainingMinutes: minutes,
        remainingSeconds: totalSeconds,
        totalSeconds,
        progress: (totalSeconds / 300) * 100, // 300 = 5 minutos
        expired: totalSeconds <= 0,
        formatted: formatTime(totalSeconds),
      });

      // Alert quando falta 1 minuto (uma vez apenas)
      if (totalSeconds === 60 && !oneMinuteAlertShown.current && onOneMinuteLeft) {
        oneMinuteAlertShown.current = true;
        onOneMinuteLeft();
      }

      // Callback de expiração
      if (totalSeconds <= 0 && onExpired) {
        onExpired();
      }

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar status da reserva';
      setError(message);
      console.error('[useCountdownTimer] Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [ticketId, enabled, onExpired, onOneMinuteLeft]);

  // Iniciar polling a cada 1 segundo
  useEffect(() => {
    if (!enabled || !ticketId) {
      return;
    }

    // Buscar imediatamente
    fetchStatus();

    // Configurar interval
    intervalRef.current = setInterval(fetchStatus, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ticketId, enabled, fetchStatus]);

  // Função para parar o timer
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Função para reiniciar o timer
  const restart = useCallback(() => {
    oneMinuteAlertShown.current = false;
    fetchStatus();
  }, [fetchStatus]);

  return {
    ...state,
    loading,
    error,
    stop,
    restart,
  };
}
