/**
 * Hook para gerenciar Fluxo Completo de Reserva
 * 
 * Fluxo: Verificar Vagas → Criar Reserva → Processar Pagamento
 * Detecta automaticamente fila de espera
 */

import { useState, useCallback } from 'react';
import { ReservationAPI, ReservationResponse, PaymentRequest, PaymentResponse } from '@/services/reservation.api';

export type ReservationFlowState = 
  | 'idle'
  | 'checking'
  | 'reserving'
  | 'reserved'
  | 'waitingList'
  | 'processing'
  | 'completed'
  | 'error';

interface UseReservationFlowResult {
  state: ReservationFlowState;
  loading: boolean;
  error: string | null;
  reservation: ReservationResponse | null;
  isInWaitingList: boolean;
  
  // Actions
  checkAndReserve: (eventId: string, userType?: 'client' | 'staff') => Promise<void>;
  processPayment: (paymentData: PaymentRequest) => Promise<PaymentResponse>;
  cancelReservation: (ticketId: string) => Promise<void>;
  reset: () => void;
}

export function useReservationFlow(): UseReservationFlowResult {
  const [state, setState] = useState<ReservationFlowState>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationResponse | null>(null);
  const [isInWaitingList, setIsInWaitingList] = useState(false);

  /**
   * FLUXO 1: Verificar Vagas e Criar Reserva
   */
  const checkAndReserve = useCallback(async (eventId: string, userType: 'client' | 'staff' = 'client') => {
    try {
      setLoading(true);
      setError(null);
      setState('checking');

      // 1. Verificar se há vagas
      console.log('[useReservationFlow] Verificando vagas para evento:', eventId);
      const hasSpots = await ReservationAPI.checkSpot(eventId);
      console.log('[useReservationFlow] Tem vagas?', hasSpots);

      // 2. Tentar criar reserva
      setState('reserving');
      console.log('[useReservationFlow] Criando reserva...');
      
      try {
        const reservationData = await ReservationAPI.reserveSpot(eventId, userType);
        console.log('[useReservationFlow] Reserva criada:', reservationData);
        
        setReservation(reservationData);
        setState('reserved');
        setIsInWaitingList(false);
        
      } catch (reserveError: any) {
        // Se retornar erro, pode ter sido adicionado à fila de espera
        const errorMessage = reserveError.message || '';
        
        if (errorMessage.includes('lista de espera') || errorMessage.includes('vagas terminaram')) {
          console.log('[useReservationFlow] Adicionado à fila de espera');
          setState('waitingList');
          setIsInWaitingList(true);
          setError(errorMessage);
        } else {
          throw reserveError;
        }
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar reserva';
      console.error('[useReservationFlow] Erro:', err);
      setError(message);
      setState('error');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * FLUXO 2: Processar Pagamento
   */
  const processPayment = useCallback(async (paymentData: PaymentRequest) => {
    try {
      setLoading(true);
      setError(null);
      setState('processing');

      console.log('[useReservationFlow] Processando pagamento:', paymentData);
      const result = await ReservationAPI.processPayment(paymentData);
      console.log('[useReservationFlow] Pagamento processado:', result);

      if (result.status === 'Pago' || result.status === 'paid') {
        setState('completed');
      }

      return result;

    } catch (err: any) {
      const message = err.message || 'Erro ao processar pagamento';
      console.error('[useReservationFlow] Erro no pagamento:', err);
      
      // Verificar se foi adicionado à fila
      if (message.includes('lista de espera') || message.includes('vagas terminaram')) {
        setState('waitingList');
        setIsInWaitingList(true);
      } else {
        setState('error');
      }
      
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * FLUXO 3: Cancelar Reserva
   */
  const cancelReservation = useCallback(async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useReservationFlow] Cancelando reserva:', ticketId);
      await ReservationAPI.cancelReservation(ticketId);
      console.log('[useReservationFlow] Reserva cancelada');

      setReservation(null);
      setState('idle');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar reserva';
      console.error('[useReservationFlow] Erro:', err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset do fluxo
   */
  const reset = useCallback(() => {
    setState('idle');
    setLoading(false);
    setError(null);
    setReservation(null);
    setIsInWaitingList(false);
  }, []);

  return {
    state,
    loading,
    error,
    reservation,
    isInWaitingList,
    checkAndReserve,
    processPayment,
    cancelReservation,
    reset,
  };
}
