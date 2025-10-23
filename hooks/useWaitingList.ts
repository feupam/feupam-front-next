/**
 * Hook para gerenciar Fila de Espera
 * 
 * - Polling a cada 30 segundos
 * - Detecta promoção automática
 * - Notifica usuário quando promovido
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ReservationAPI, WaitingListStatus } from '@/services/reservation.api';

interface UseWaitingListOptions {
  eventId: string;
  onPromoted?: () => void;
  onError?: (error: string) => void;
  enabled?: boolean;
  pollingInterval?: number; // em milissegundos (padrão: 30000)
}

export function useWaitingList({
  eventId,
  onPromoted,
  onError,
  enabled = true,
  pollingInterval = 30000, // 30 segundos
}: UseWaitingListOptions) {
  const [status, setStatus] = useState<WaitingListStatus>({ inQueue: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasInQueue = useRef(false);

  // Função para buscar status da fila
  const fetchStatus = useCallback(async () => {
    if (!eventId || !enabled) return;

    try {
      setLoading(true);
      const data = await ReservationAPI.getWaitingListStatus(eventId);
      
      // Detectar se foi promovido
      if (wasInQueue.current && !data.inQueue && onPromoted) {
        console.log('[useWaitingList] Usuário foi promovido!');
        onPromoted();
      }

      // Atualizar status
      wasInQueue.current = data.inQueue || false;
      setStatus(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar status da fila';
      setError(message);
      console.error('[useWaitingList] Erro:', err);
      
      if (onError) {
        onError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, enabled, onPromoted, onError]);

  // Função para sair da fila
  const leaveQueue = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      await ReservationAPI.leaveWaitingList(eventId);
      setStatus({ inQueue: false });
      wasInQueue.current = false;
      setError(null);
      
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sair da fila';
      setError(message);
      console.error('[useWaitingList] Erro ao sair da fila:', err);
      
      if (onError) {
        onError(message);
      }
      
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [eventId, onError]);

  // Iniciar polling
  useEffect(() => {
    if (!enabled || !eventId) {
      return;
    }

    // Buscar imediatamente
    fetchStatus();

    // Configurar interval
    intervalRef.current = setInterval(fetchStatus, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [eventId, enabled, pollingInterval, fetchStatus]);

  // Função para parar o polling
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Função para reiniciar o polling
  const restart = useCallback(() => {
    wasInQueue.current = false;
    fetchStatus();
  }, [fetchStatus]);

  return {
    inQueue: status.inQueue || false,
    position: status.position,
    totalInQueue: status.totalInQueue,
    addedAt: status.addedAt,
    loading,
    error,
    leaveQueue,
    refresh: fetchStatus,
    stop,
    restart,
  };
}
