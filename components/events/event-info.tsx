"use client";

import { Event } from '@/types/event';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventInfoProps {
  event: Event;
}

export function EventInfo({ event }: EventInfoProps) {
  return (
    <div className="bg-white rounded-lg p-6 mb-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <CalendarDays className="h-6 w-6 text-gray-600 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-600">Data</p>
            <p className="text-base font-semibold text-gray-900">
              {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-6 w-6 text-gray-600 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-600">Local</p>
            <p className="text-base font-semibold text-gray-900">{event.location}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="h-6 w-6 text-gray-600 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-600">Vagas</p>
            {event.eventType === 'gender_specific' ? (
              <>
                <p className="text-base font-semibold text-gray-900">
                  M: {event.maxClientMale} | F: {event.maxClientFemale}
                </p>
                <p className="text-sm text-gray-600">
                  Staff - M: {event.maxStaffMale} | F: {event.maxStaffFemale}
                </p>
              </>
            ) : (
              <p className="text-base font-semibold text-gray-900">
                {event.maxGeneralSpots}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}