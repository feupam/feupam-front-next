'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getEventPrice } from '@/lib/event-prices';

export interface UserReservation {
  id: string;
  email: string;
  eventId: string;
  eventName?: string; // Para compatibilidade após mapeamento
  gender: string;
  status: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  expiresAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  position: number;
  // Campos opcionais para compatibilidade
  price?: number;
  spotId?: string;
  ticketKind?: string;
  userType?: string;
  chargeId?: Array<{
    amount: number;
    chargeId: string;
    email: string;
    envioWhatsapp: boolean;
    event: string;
    lote: number;
    meio: string;
    payLink: string;
    qrcodePix: string;
    status: string;
  }>;
}

interface UseUserReservationsReturn {
  reservations: UserReservation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserReservations(): UseUserReservationsReturn {
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('[useUserReservations] Hook inicializado - Estado inicial:', {
    reservations: reservations.length,
    loading,
    error
  });

  const fetchReservations = async () => {
    try {
      console.log('[useUserReservations] Iniciando busca de reservas...');
      setLoading(true);
      setError(null);
      
      // Usar o endpoint de histórico completo para incluir reservas "Pago"
      const data = await api.users.getReservationsHistory();
      console.log('[useUserReservations] Dados recebidos do histórico:', data);
      console.log('[useUserReservations] Tipo dos dados:', typeof data);
      
      // O endpoint reservations-report retorna um objeto com dados paginados
      let reservationsArray: any[] = [];
      if (data && data.data && Array.isArray(data.data)) {
        // Extrair reservations de cada usuário
        reservationsArray = data.data.flatMap((userWithReservations: any) => 
          userWithReservations.reservations || []
        );
      } else if (data && Array.isArray(data)) {
        // Fallback se retornar array direto
        reservationsArray = data;
      }
      
      console.log('[useUserReservations] Reservations extraídas:', reservationsArray);
      console.log('[useUserReservations] Quantidade de itens:', reservationsArray?.length);
      
      if (reservationsArray && Array.isArray(reservationsArray)) {
        // Processar dados da API externa para formato compatível
        const processedReservations = reservationsArray.map((reservation: any) => {
          console.log('[useUserReservations] Processando reserva:', reservation);
          
          // Para eventos conhecidos, definir preço baseado no eventId
          const knownPrice = getEventPrice(reservation.eventId);
          
          return {
            ...reservation,
            // Garantir campos obrigatórios
            spotId: reservation.id || reservation.spotId,
            ticketKind: reservation.ticketKind || 'full',
            userType: reservation.userType || 'client',
            // Converter timestamp para compatibilidade
            updatedAt: reservation.createdAt || reservation.updatedAt,
            // Usar preço da reserva se disponível, senão usar preço conhecido, senão undefined
            price: reservation.price || knownPrice,
            // Mapear eventId para eventName para compatibilidade
            eventName: reservation.eventName || reservation.eventId
          };
        });
        
        console.log('[useUserReservations] Reservas processadas:', processedReservations);
        setReservations(processedReservations);
      } else {
        console.log('[useUserReservations] Dados não são um array válido, definindo array vazio');
        setReservations([]);
      }
    } catch (err: any) {
      console.error('[useUserReservations] Erro ao buscar reservas:', err);
      setError(err.message || 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations
  };
}
