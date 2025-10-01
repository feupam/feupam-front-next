'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { EventData } from '@/services/eventService';
import { useRouter } from 'next/navigation';

interface EventsViewerProps {
  events: EventData[];
}

export function EventsViewer({ events }: EventsViewerProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/calendario-eventos');
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-10 w-10 text-emerald-200 hover:text-emerald-400 hover:bg-emerald-500/20"
      onClick={handleClick}
    >
      <Calendar className="h-6 w-6" />
      <span className="sr-only">Eventos</span>
    </Button>
  );
}
