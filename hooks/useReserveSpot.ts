import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from './use-toast';

export function useReserveSpot() {
  const [isReserving, setIsReserving] = useState(false);
  const { toast } = useToast();

  const reserveSpot = async (eventId: string, ticketKind: string) => {
    try {
      setIsReserving(true);
      const response = await api.events.reserveSpot(eventId, {
        ticket_kind: ticketKind,
        userType: 'client',
      });
      return response;
    } catch (error: any) {
      toast({
        title: 'Erro ao reservar vaga',
        description: error?.message || 'Não foi possível reservar a vaga.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsReserving(false);
    }
  };

  return { reserveSpot, isReserving };
} 