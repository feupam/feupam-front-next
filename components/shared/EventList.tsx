'use client';

import { EventCardWithStorage } from '@/components/events/EventCardWithStorage';
import { Event } from '@/types/event';

interface EventListProps {
  events: Event[];
  variant?: 'default' | 'compact' | 'featured';
  columns?: 1 | 2 | 3 | 4;
}

/**
 * EventList - Lista de eventos usando EventCard com localStorage
 * 
 * @example
 * ```tsx
 * <EventList 
 *   events={eventData}
 *   variant="default"
 *   columns={3}
 * />
 * ```
 */
export function EventList({ events, variant = 'default', columns = 3 }: EventListProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum evento disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {events.map((event) => (
        <EventCardWithStorage 
          key={event.uuid} 
          event={event}
          variant={variant}
          showActions={true}
        />
      ))}
    </div>
  );
}
