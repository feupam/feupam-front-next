"use client";

import { useEvents } from '@/hooks/useEvents';
import { EventList } from '@/components/EventList';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { events, loading, error } = useEvents();
  
  if (error) {
  return (
      <div className="container mx-auto p-4">
        <div className="text-red-500">Erro: {error}</div>
              </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
            ))}
          </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Eventos Disponíveis</h1>
      <EventList events={events} />
    </div>
  );
}