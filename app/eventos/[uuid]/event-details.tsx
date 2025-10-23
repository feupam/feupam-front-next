'use client';

import { Event } from '@/types/event';
import { EventHeader, EventInfo, EventSpotsDistribution, EventBookingCard } from '@/src/features/events';

interface EventDetailsProps {
  event: Event;
}

export default function EventDetails({ event }: EventDetailsProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <EventHeader event={event} />
        <EventInfo event={event} />
        <EventSpotsDistribution event={event} />
        <EventBookingCard event={event} />
      </div>
    </div>
  );
} 