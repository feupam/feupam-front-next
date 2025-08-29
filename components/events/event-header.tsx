"use client";

import { Event } from '@/types/event';

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-white mb-3">{event.name}</h1>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white">
          Evento com Vagas por Gênero
        </span>
      </div>
    </div>
  );
}