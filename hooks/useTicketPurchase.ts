import { useState } from 'react';
import { api } from '@/lib/api';

interface UseTicketPurchaseProps {
  eventId: string;
  ticketKind: string;
  userType?: 'client' | 'staff';
}

interface SpotCheckResponse {
  isAvailable: boolean;
  waitingList?: boolean;
}

interface ReserveSpotResponse {
  spotId: string;
  email: string;
  eventId: string;
  userType: 'client' | 'staff';
  status: string;
}

export function useTicketPurchase({ eventId, ticketKind, userType = 'client' }: UseTicketPurchaseProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<ReserveSpotResponse | null>(null);
  const [isWaitingList, setIsWaitingList] = useState(false);

  // Verifica disponibilidade de vagas
  const checkSpotAvailability = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.events.checkSpot(eventId, ticketKind);
      setIsWaitingList(response.waitingList || false);
      return response.isAvailable;
    } catch (err) {
      setError('Erro ao verificar disponibilidade de vagas');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Tenta reservar uma vaga
  const reserveSpot = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.events.reserveSpot(eventId, {
        ticket_kind: ticketKind,
        userType
      });

      // Garantir que a resposta tem o formato esperado
      if (!response.spotId || !response.email || !response.eventId || !response.userType || !response.status) {
        throw new Error('Resposta da API inválida');
      }

      setReservationData(response);
      return response;
    } catch (err: any) {
      if (err?.response?.status === 400) {
        setIsWaitingList(true);
        setError('Você entrou para lista de espera');
      } else {
        setError('Erro ao reservar vaga');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Inicia o fluxo de compra
  const startPurchaseFlow = async () => {
    // 1. Verifica disponibilidade
    const isAvailable = await checkSpotAvailability();
    if (!isAvailable) {
      return false;
    }

    // 2. Tenta reservar
    const reservation = await reserveSpot();
    return !!reservation;
  };

  return {
    isLoading,
    error,
    isWaitingList,
    reservationData,
    startPurchaseFlow,
    checkSpotAvailability,
    reserveSpot
  };
} 