'use client';

import Link from 'next/link';
import { Event } from '@/types/event';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatFullDateTime } from '@/lib/utils';

interface EventListProps {
  events: Event[];
}

export function EventList({ events = [] }: EventListProps) {
  if (!events.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum evento disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.uuid} className="flex flex-col">
          <CardHeader>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>{event.location}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Data: {formatFullDateTime(event.startDate)}
              </p>
              <p className="text-sm text-muted-foreground">
                Vagas: {event.maxGeneralSpots}
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(event.price)}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href={`/eventos/${event.uuid}`} prefetch={false}>
                Ver detalhes
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 