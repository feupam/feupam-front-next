import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminEvent {
  id: string;
  name: string;
  date?: string;
  location?: string;
  description?: string;
}

export function useAdminEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';
      const response = await fetch(`${API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar eventos');
      }

      const data = await response.json();
      console.log('[useAdminEvents] Dados recebidos da API:', data);
      console.log('[useAdminEvents] Tipo dos dados:', typeof data);
      console.log('[useAdminEvents] É array?', Array.isArray(data));
      
      // Mapear uuid para id para compatibilidade
      const mappedEvents = data.map((event: any) => ({
        ...event,
        id: event.uuid || event.id
      }));
      
      console.log('[useAdminEvents] Eventos mapeados:', mappedEvents);
      setEvents(mappedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return { events, loading, error, refetch: fetchEvents };
}
