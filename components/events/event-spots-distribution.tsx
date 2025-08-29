'use client';

import { Event } from '@/types/event';

interface EventSpotsDistributionProps {
  event: Event;
}

export function EventSpotsDistribution({ event }: EventSpotsDistributionProps) {
  return (
    <div className="bg-black/80 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-white mb-6">Distribuição de Vagas</h2>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Staff</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Masculino:</span>
              <span className="text-white font-medium">{event.maxStaffMale}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Feminino:</span>
              <span className="text-white font-medium">{event.maxStaffFemale}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-4">Participantes</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Masculino:</span>
              <span className="text-white font-medium">{event.maxClientMale}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Feminino:</span>
              <span className="text-white font-medium">{event.maxClientFemale}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 