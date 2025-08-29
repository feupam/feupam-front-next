'use client';

import { useEffect, useState } from 'react';
import { eventService } from '@/services/eventService';
import { Event } from '@/types/event';

interface UseCurrentEventResult {
  event: Event | null;
  loading: boolean;
  error: string | null;
}

export function useCurrentEvent(eventId: string): UseCurrentEventResult {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        console.log('[useCurrentEvent] Buscando dados para eventId:', eventId);
        const response = await eventService.getEventStatus('federa'); // Sempre busca todos os eventos
        console.log('[useCurrentEvent] Response da API:', response);
        
        if (response.events && response.events.length > 0) {
          // Busca o evento específico pelo ID, se fornecido
          let eventData = response.events.find(e => String(e.id) === String(eventId));
          console.log('[useCurrentEvent] EventData encontrado por ID:', eventData);
          
          // Se não encontrar por ID, tenta buscar por nome
          if (!eventData && eventId) {
            eventData = response.events.find(e => 
              e.name.toLowerCase() === eventId.toLowerCase()
            );
            console.log('[useCurrentEvent] EventData encontrado por nome:', eventData);
          }
          
          // Se ainda não encontrou, pega o último evento que estiver aberto ou o último da lista
          if (!eventData) {
            eventData = response.events.find(e => e.isOpen) || response.events[response.events.length - 1];
            console.log('[useCurrentEvent] EventData fallback:', eventData);
          }
          
          console.log('[useCurrentEvent] EventData final selecionado:', eventData);
          console.log('[useCurrentEvent] isOpen do evento:', eventData.isOpen);
          
          const processed = {
            uuid: String(eventData.id), // Usa o ID numérico como string para as rotas
            name: eventData.name,
            location: eventData.location || '',
            description: eventData.description || '',
            date: eventData.date,
            maxGeneralSpots: '0',
            price: 0,
            endDate: eventData.endDate,
            startDate: eventData.startDate,
            eventType: 'gender_specific' as const,
            title: eventData.name,
            time: eventData.startDate,
            image: '',
            tickets: [],
            cupons: [],
            isOpen: eventData.isOpen
          } as Event;
          
          console.log('[useCurrentEvent] Processed event:', processed);
          console.log('[useCurrentEvent] Processed isOpen:', processed.isOpen);
          
          setEvent(processed);
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os dados do evento');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId]);

  return { event, loading, error };
}
