'use client';

import { AlertTriangle } from 'lucide-react';
import { Event } from '@/types/event';
import { Separator } from '@/components/ui/separator';

interface EventDescriptionProps {
  event: Event;
}

export function EventDescription({ event }: EventDescriptionProps) {
  return (
    <>
      <Separator className="my-6" />
      
      <div className="prose dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-4">Sobre este Evento</h2>
        <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
      </div>
      
      {Number(event.maxGeneralSpots) < 50 && (
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Últimas Vagas</h3>
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                <p>
                  Este evento está com poucas vagas disponíveis. Garanta logo seu ingresso!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 