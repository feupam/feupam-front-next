'use client';

import React, { useEffect, useState } from 'react';
import { HeroCarousel } from '@/components/netflix/HeroCarousel';
import { EventGrid } from '@/components/netflix/EventGrid';
import { NetflixHeader } from '@/components/netflix/NetflixHeader';
import { eventService, EventData } from '@/services/eventService';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';

export default function HomePage() {
  const { setCurrentEventFromData } = useCurrentEventContext();
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  // Função para atualizar o contexto quando seleciona um evento
  const handleEventSelect = (index: number) => {
    setSelectedEventIndex(index);
    if (events[index]) {
      console.log('[Home] Usuário selecionou evento:', events[index].name, 'index:', index);
      console.log('[Home] Definindo no contexto:', events[index]);
      setCurrentEventFromData(events[index]);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await eventService.getEventStatus('federa');
        console.log("API response:", response);

        setCurrentDate(response.currentDate || null);
        setEvents(response.events ?? []);
        
        // Define o primeiro evento como padrão
        if (response.events && response.events.length > 0 && response.events[0]) {
          console.log('[Home] Definindo primeiro evento no contexto:', response.events[0].name);
          setCurrentEventFromData(response.events[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os dados do evento');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [setCurrentEventFromData]);

  // loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  // erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // caso não tenha eventos
  if (events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-yellow-500">Nenhum evento disponível</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NetflixHeader events={events} />
      {/* Espaçamento para compensar o header fixo */}
      <div className="pt-12">
        {currentDate && events.length > 0 && (
          <>
            <HeroCarousel
              events={events.map(event => ({
                ...event,
                description: event.description ?? "",
              }))}
              onEventSelect={handleEventSelect}
              selectedIndex={selectedEventIndex}
            />
            <EventGrid
              events={events.map(event => ({
                ...event,
                description: event.description ?? "",
              }))}
              onEventSelect={handleEventSelect}
              selectedIndex={selectedEventIndex}
            />
          </>
        )}
      </div>
    </div>
  );
}
