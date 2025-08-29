'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Event } from '@/types/event';
import { eventService } from '@/services/eventService';

interface CurrentEventContextData {
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;
  isCurrentEventOpen: boolean;
  loading: boolean;
  error: string | null;
  refreshCurrentEvent: () => Promise<void>;
  setCurrentEventByName: (eventName: string) => Promise<void>;
  setCurrentEventFromData: (eventData: any) => void;
}

const CurrentEventContext = createContext<CurrentEventContextData | undefined>(undefined);

export function CurrentEventProvider({ children }: { children: ReactNode }) {
  const [currentEvent, setCurrentEventState] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log para rastrear mudanças no contexto
  useEffect(() => {
    console.log('[CurrentEventContext] Provider montado');
    
    // Carrega evento do localStorage na inicialização
    try {
      const savedEvent = localStorage.getItem('currentEvent');
      if (savedEvent) {
        const event = JSON.parse(savedEvent);
        console.log('[CurrentEventContext] Carregando evento do localStorage:', event.name);
        setCurrentEventState(event);
      }
    } catch (error) {
      console.error('[CurrentEventContext] Erro ao carregar do localStorage:', error);
    }
    
    return () => {
      console.log('[CurrentEventContext] Provider desmontado');
    };
  }, []);

  useEffect(() => {
    console.log('[CurrentEventContext] currentEvent mudou:', currentEvent?.name || 'null');
  }, [currentEvent]);

  // Função para buscar status atualizado do evento atual
  const refreshCurrentEvent = async () => {
    if (!currentEvent) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[CurrentEventContext] Atualizando status do evento:', currentEvent.name);
      const response = await eventService.getEventStatus('federa');
      
      if (response.events && response.events.length > 0) {
        // Busca o evento atual na resposta
        const updatedEventData = response.events.find(e => 
          String(e.id) === currentEvent.uuid || 
          e.name.toLowerCase() === currentEvent.name.toLowerCase()
        );
        
        if (updatedEventData) {
          console.log('[CurrentEventContext] Evento encontrado na API:', updatedEventData);
          
          // Atualiza o evento com os dados mais recentes da API
          const updatedEvent: Event = {
            ...currentEvent,
            isOpen: updatedEventData.isOpen,
            startDate: updatedEventData.startDate,
            endDate: updatedEventData.endDate,
            date: updatedEventData.date
          };
          
          console.log('[CurrentEventContext] Evento atualizado:', updatedEvent);
          setCurrentEventState(updatedEvent);
        }
      }
    } catch (err) {
      console.error('[CurrentEventContext] Erro ao atualizar evento:', err);
      setError('Erro ao atualizar status do evento');
    } finally {
      setLoading(false);
    }
  };

  // Função para definir evento atual diretamente com os dados
  const setCurrentEventFromData = useCallback((eventData: any) => {
    console.log('[CurrentEventContext] Definindo evento a partir de dados:', eventData);
    
    const event: Event = {
      uuid: String(eventData.id),
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
    };
    
    console.log('[CurrentEventContext] Evento processado:', event);
    setCurrentEventState(event);
    
    // Salva no localStorage para persistir entre navegações
    try {
      localStorage.setItem('currentEvent', JSON.stringify(event));
      console.log('[CurrentEventContext] Evento salvo no localStorage');
    } catch (error) {
      console.error('[CurrentEventContext] Erro ao salvar no localStorage:', error);
    }
  }, []); // Empty dependency array since it only uses the passed parameter

  // Função para definir evento atual pelo nome (busca na API)
  const setCurrentEventByName = useCallback(async (eventName: string) => {
    // Evita buscar novamente se já temos o evento correto
    if (currentEvent && currentEvent.name.toLowerCase() === eventName.toLowerCase()) {
      console.log('[CurrentEventContext] Evento já está definido, pulando busca');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[CurrentEventContext] Buscando evento por nome:', eventName);
      const response = await eventService.getEventStatus('federa');
      
      if (response.events && response.events.length > 0) {
        const eventData = response.events.find(e => 
          e.name.toLowerCase() === eventName.toLowerCase()
        );
        
        if (eventData) {
          console.log('[CurrentEventContext] Evento encontrado:', eventData);
          setCurrentEventFromData(eventData);
        } else {
          setError(`Evento '${eventName}' não encontrado`);
        }
      }
    } catch (err) {
      console.error('[CurrentEventContext] Erro ao buscar evento:', err);
      setError('Erro ao buscar evento');
    } finally {
      setLoading(false);
    }
  }, [currentEvent, setCurrentEventFromData]);

  const setCurrentEvent = (event: Event | null) => {
    console.log('[CurrentEventContext] Definindo evento atual:', event);
    setCurrentEventState(event);
  };

  // Calcula se o evento atual está aberto
  const isCurrentEventOpen = currentEvent?.isOpen ?? false;

  return (
    <CurrentEventContext.Provider value={{
      currentEvent,
      setCurrentEvent,
      isCurrentEventOpen,
      loading,
      error,
      refreshCurrentEvent,
      setCurrentEventByName,
      setCurrentEventFromData
    }}>
      {children}
    </CurrentEventContext.Provider>
  );
}

export function useCurrentEventContext() {
  const context = useContext(CurrentEventContext);
  if (context === undefined) {
    throw new Error('useCurrentEventContext must be used within a CurrentEventProvider');
  }
  return context;
}
