"use client"

import { EventCard } from '@/components/shared/EventCard';
import { Event } from '@/types/event';
import { useEventStorage } from '@/hooks/useEventStorage';
import { useRouter } from 'next/navigation';

interface EventCardWithStorageProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
}

export function EventCardWithStorage({ 
  event, 
  variant = 'default', 
  showActions = true 
}: EventCardWithStorageProps) {
  const { setSelectedEvent } = useEventStorage();
  const router = useRouter();

  const handleReserveClick = () => {
    // Marcar que está navegando para não limpar o cache
    sessionStorage.setItem('navigating', 'true');
    
    // Salvar evento no localStorage
    setSelectedEvent({
      id: event.uuid,
      name: event.name,
      eventStatus: event, // Salvar o evento completo
    });
  };

  // Sobrescrever o EventCard para interceptar cliques e salvar no localStorage
  return (
    <div onClick={(e) => {
      // Se clicar em qualquer lugar do card, salvar o evento
      const target = e.target as HTMLElement;
      
      // Se clicar em um link ou botão, deixar o comportamento padrão
      if (target.tagName === 'A' || target.closest('a')) {
        sessionStorage.setItem('navigating', 'true');
        setSelectedEvent({
          id: event.uuid,
          name: event.name,
          eventStatus: event,
        });
      }
    }}>
      <EventCard 
        event={event}
        variant={variant}
        showActions={showActions}
        onReserveClick={handleReserveClick}
      />
    </div>
  );
}
