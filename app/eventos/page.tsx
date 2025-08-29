"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import FilterBar from '@/components/events/filter-bar';
import EventCard from '@/components/events/event-card';
import { Event } from '@/types/event';
import { useEvents } from '@/hooks/useEvents';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventsPage() {
  const searchParams = useSearchParams();
  const { events, loading, error } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!events.length) return;

    // Filter events based on URL parameters
    const locationParam = searchParams.get('location');
    const dateParam = searchParams.get('date');
    
    let results = [...events];
    
    if (locationParam) {
      results = results.filter(event => event.location === locationParam);
    }
    
    if (dateParam) {
      results = results.filter(event => {
        const eventDate = new Date(event.startDate).toISOString().split('T')[0];
        return eventDate === dateParam;
      });
    }
    
    setFilteredEvents(results);
  }, [searchParams, events]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-[400px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <FilterBar />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {filteredEvents.map((event, index) => (
          <EventCard key={event.uuid} event={event} index={index} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum evento encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
}