'use client';

import { Event } from '@/types/event';
import { EventHeader } from '@/components/events/event-header';
import { EventInfo } from '@/components/events/event-info';
import { EventSpotsDistribution } from '@/components/events/event-spots-distribution';
import { EventBookingCard } from '@/components/events/event-booking-card';

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