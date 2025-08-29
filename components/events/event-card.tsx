"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const { date, time } = formatDateTime(event.startDate);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200"
    >
      <Link href={`/eventos/${event.uuid}`} className="relative aspect-[16/9] overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Disponível
        </div>
      </Link>
      
      <div className="flex flex-col p-4 space-y-2 flex-grow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold line-clamp-2 mt-1">{event.name}</h3>
          </div>
          <p className="text-base font-bold">{formatCurrency(event.price)}</p>
        </div>
        
        <div className="flex flex-col space-y-2 mt-2 text-sm text-muted-foreground pt-3 border-t border-border">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>
      
      <Link
        href={`/eventos/${event.uuid}`}
        className="mt-2 flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-center transition-colors bg-secondary hover:bg-secondary/80 border-t border-border"
      >
        Ver Detalhes
      </Link>
    </motion.div>
  );
}