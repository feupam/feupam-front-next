'use client';

import { useState, useEffect } from 'react';
import { users } from '@/services/api';

export interface UserReservation {
  charges: Array<{
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
  email: string;
  eventId: string;
  gender: string;
  price: number;
  spotId: string;
  status: string;
  ticketKind: string;
  updatedAt: any;
  userType: string;
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

  const fetchReservations = async () => {
    try {
      console.log('[useUserReservations] Iniciando busca de reservas...');
      setLoading(true);
      setError(null);
      
      // Para desenvolvimento/teste, usar dados mockados se não estiver autenticado
      if (process.env.NODE_ENV === 'development') {
        try {
          const data = await users.getReservations();
          console.log('[useUserReservations] Dados recebidos da API:', data);
          setReservations(data || []);
        } catch (apiError: any) {
          // Se a API falhar (usuário não autenticado), usar dados mockados
          console.log('[useUserReservations] API falhou, usando dados mockados para desenvolvimento');
          const mockData = [
            {
              charges: [{
                amount: 36500,
                chargeId: "ch_n5VygLGiei8r6bWo",
                email: "test@test.com",
                envioWhatsapp: false,
                event: "federa",
                lote: 0,
                meio: "pix",
                payLink: "00020101021226820014br.gov.bcb.pix2560pix.stone.com.br/pix/v2/20dc5196-0e2a-4b58-afad-a8ca3807932c5204000053039865406365.005802BR5925PRESBITERIO VALE DO RIO G6014RIO DE JANEIRO6229052592afd6f91d7c032f8be5536c66304323E",
                qrcodePix: "https://api.pagar.me/core/v5/transactions/tran_7MoWA9PtKt3Laxe4/qrcode?payment_method=pix",
                status: "Pago"
              }],
              email: "test@test.com",
              eventId: "federa",
              gender: "male",
              price: 36500,
              spotId: "h25JtbI4iSbIvtAeKkoB",
              status: "Pago",
              ticketKind: "full",
              updatedAt: new Date(),
              userType: "client"
            },
            {
              charges: [{
                amount: 25000,
                chargeId: "ch_pendente123",
                email: "test@test.com",
                envioWhatsapp: false,
                event: "evento2",
                lote: 1,
                meio: "credit_card",
                payLink: "",
                qrcodePix: "",
                status: "Pendente"
              }],
              email: "test@test.com",
              eventId: "evento2",
              gender: "female",
              price: 25000,
              spotId: "spot123",
              status: "Pendente",
              ticketKind: "day",
              updatedAt: new Date(),
              userType: "client"
            }
          ];
          setReservations(mockData);
        }
      } else {
        const data = await users.getReservations();
        console.log('[useUserReservations] Dados recebidos:', data);
        setReservations(data || []);
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
