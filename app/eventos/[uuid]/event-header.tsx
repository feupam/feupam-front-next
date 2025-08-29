'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Event } from '@/types/event';
import { getEventAvailabilityStatus } from '@/lib/utils';

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
  const availabilityStatus = getEventAvailabilityStatus(event);
  
  return (
    <div>
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg mb-6">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {event.eventType}
        </span>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
          availabilityStatus.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          availabilityStatus.status === 'limited' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
          availabilityStatus.status === 'sold_out' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
        }`}>
          {availabilityStatus.text}
        </span>
      </div>
    </div>
  );
} 