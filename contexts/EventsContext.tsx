'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Event } from '@/types/event';
import { api } from '@/lib/api';

interface EventsContextData {
  events: Event[];
  loading: boolean;
  error: string | null;
  getEventByUuid: (uuid: string) => Event | undefined;
  reloadEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextData | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.events.list();
      setEvents(response);
    } catch (err) {
      setError('Erro ao buscar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventByUuid = (uuid: string) => events.find(e => e.uuid === uuid);

  return (
    <EventsContext.Provider value={{ events, loading, error, getEventByUuid, reloadEvents: fetchEvents }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
} 