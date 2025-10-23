"use client"

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'selected_event';

export interface EventStorageData {
  id: string;
  name: string;
  eventStatus?: any; // Dados da API /events/event-status
  savedAt: string;
}

export function useEventStorage() {
  const [selectedEvent, setSelectedEventState] = useState<EventStorageData | null>(null);

  // Carregar do localStorage na montagem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Verificar se não expirou (opcional: 1 hora)
          const savedAt = new Date(parsed.savedAt);
          const now = new Date();
          const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setSelectedEventState(parsed);
          } else {
            // Expirou, limpar
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (error) {
          console.error('Error parsing stored event:', error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  const setSelectedEvent = (event: Omit<EventStorageData, 'savedAt'>) => {
    const data: EventStorageData = {
      ...event,
      savedAt: new Date().toISOString(),
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSelectedEventState(data);
    }
  };

  const clearSelectedEvent = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      setSelectedEventState(null);
    }
  };

  return {
    selectedEvent,
    setSelectedEvent,
    clearSelectedEvent,
  };
}
