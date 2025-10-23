'use client';

import { UserReservationsList } from '@/components/profile/UserReservationsList';
import { useUserReservations } from '@/hooks/useUserReservations';
import { useAuth } from '@/src/features/auth';
import { useEffect } from 'react';

export default function TestReservationsPage() {
  const { user } = useAuth();
  const { reservations, loading, error, refetch } = useUserReservations();

  useEffect(() => {
    console.log('[TestReservationsPage] User:', user);
    console.log('[TestReservationsPage] Reservations:', reservations);
    console.log('[TestReservationsPage] Loading:', loading);
    console.log('[TestReservationsPage] Error:', error);
  }, [user, reservations, loading, error]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você precisa estar logado para ver esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Teste - Lista de Reservas (API Externa)</h1>
        <p className="text-muted-foreground mb-4">
          Dados vindos da API: {process.env.NEXT_PUBLIC_API_URL}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Endpoint: GET /users/reservations
        </p>
        
        <UserReservationsList
          reservations={reservations}
          loading={loading}
          error={error}
          onRefetch={refetch}
        />
      </div>
    </div>
  );
}
