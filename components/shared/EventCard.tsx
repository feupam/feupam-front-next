'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types/event';
import { ActionButton } from './ActionButton';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onReserveClick?: () => void;
}

/**
 * EventCard - Componente reutilizável para exibir cards de eventos
 * 
 * @example
 * ```tsx
 * <EventCard 
 *   event={eventData}
 *   variant="default"
 *   showActions={true}
 * />
 * ```
 */
export function EventCard({ 
  event, 
  variant = 'default', 
  showActions = true,
  onReserveClick 
}: EventCardProps) {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  // Calcula vagas disponíveis
  const getTotalSpots = () => {
    if (event.eventType === 'gender_specific') {
      const male = Number(event.maxClientMale || 0);
      const female = Number(event.maxClientFemale || 0);
      return male + female;
    }
    return Number(event.maxGeneralSpots || 0);
  };

  const totalSpots = getTotalSpots();
  const availableSpots = event.availability ?? totalSpots;
  const spotPercentage = totalSpots > 0 ? ((totalSpots - availableSpots) / totalSpots) * 100 : 0;

  // Status do evento
  const getEventStatus = () => {
    if (!event.isOpen) return { label: 'Fechado', color: 'bg-gray-500' };
    if (availableSpots === 0) return { label: 'Esgotado', color: 'bg-red-500' };
    if (availableSpots < totalSpots * 0.2) return { label: 'Últimas vagas', color: 'bg-orange-500' };
    return { label: 'Disponível', color: 'bg-green-500' };
  };

  const status = getEventStatus();

  return (
    <Card className={`flex flex-col h-full hover:shadow-lg transition-all duration-300 ${isFeatured ? 'border-primary border-2' : ''}`}>
      {/* Image */}
      {event.image && !isCompact && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Image 
            src={event.image} 
            alt={event.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge className={`absolute top-2 right-2 ${status.color}`}>
            {status.label}
          </Badge>
          {isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500">
              Destaque
            </Badge>
          )}
        </div>
      )}

      <CardHeader className={isCompact ? 'pb-3' : ''}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className={`line-clamp-2 ${isCompact ? 'text-lg' : 'text-xl'}`}>
            {event.name}
          </CardTitle>
          {isCompact && (
            <Badge className={`${status.color} shrink-0`}>
              {status.label}
            </Badge>
          )}
        </div>
        {event.description && !isCompact && (
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {formatDate(event.date, { 
              format: 'long',
              rangeDate: event.range_date 
            })}
          </span>
        </div>

        {/* Time */}
        {event.time && !isCompact && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{event.time}</span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        {/* Age Restrictions */}
        {(event.idadeMinima || event.idadeMaxima) && !isCompact && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {event.idadeMinima && event.idadeMaxima 
                ? `${event.idadeMinima} a ${event.idadeMaxima} anos`
                : event.idadeMinima 
                  ? `A partir de ${event.idadeMinima} anos`
                  : `Até ${event.idadeMaxima} anos`
              }
            </span>
          </div>
        )}

        {/* Available Spots */}
        {totalSpots > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                Vagas
              </span>
              <span className="font-medium">
                {availableSpots}/{totalSpots}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  spotPercentage > 80 ? 'bg-red-500' : 
                  spotPercentage > 60 ? 'bg-orange-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${spotPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Price */}
        <div className="text-2xl font-bold text-primary pt-2">
          {formatCurrency(event.price)}
        </div>
      </CardContent>

      {showActions && event.isOpen && (
        <CardFooter className="flex gap-2">
          <ActionButton asChild variant="outline" className="flex-1">
            <Link href={`/event/${encodeURIComponent(event.name)}`}>
              Ver Detalhes
            </Link>
          </ActionButton>
          <ActionButton 
            asChild 
            className="flex-1"
            onClick={onReserveClick}
          >
            <Link href={`/reserva/${event.uuid}/full`}>
              Reservar
            </Link>
          </ActionButton>
        </CardFooter>
      )}

      {!event.isOpen && showActions && (
        <CardFooter>
          <ActionButton asChild variant="secondary" className="w-full">
            <Link href={`/event/${encodeURIComponent(event.name)}`}>
              Ver Informações
            </Link>
          </ActionButton>
        </CardFooter>
      )}
    </Card>
  );
}
