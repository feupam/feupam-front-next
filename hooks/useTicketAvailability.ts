import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Ticket } from '@/types/event';

interface UseTicketAvailabilityProps {
  eventId: string;
  tickets: Ticket[];
}

export function useTicketAvailability({ eventId, tickets }: UseTicketAvailabilityProps) {
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const availability = await Promise.all(
          tickets.map(async (ticket) => {
            const response = await api.events.checkSpot(eventId, ticket.id);
            return { ticketId: ticket.id, isAvailable: response.isAvailable };
          })
        );

        const newAvailabilityMap = availability.reduce((acc, { ticketId, isAvailable }) => {
          acc[ticketId] = isAvailable;
          return acc;
        }, {} as Record<string, boolean>);

        setAvailabilityMap(newAvailabilityMap);
      } catch (err) {
        setError('Erro ao verificar disponibilidade dos ingressos');
        console.error('Erro ao verificar disponibilidade:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [eventId, tickets]);

  return {
    availabilityMap,
    isLoading,
    error,
    refreshAvailability: () => {
      setIsLoading(true);
      // Força uma nova verificação
      setAvailabilityMap({});
    }
  };
} 