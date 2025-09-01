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
      setLoading(true);
      setError(null);
      
      const data = await users.getReservations();
      setReservations(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar reservas:', err);
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
