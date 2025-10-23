/**
 * Events Feature Utils
 * Utility functions for event operations
 */

export * from './event-prices';

/**
 * Format event date range
 */
export function formatEventDate(startDate: string, rangeDate?: string): string {
  const start = new Date(startDate);
  
  if (!rangeDate) {
    return start.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  const end = new Date(rangeDate);
  return `${start.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })} - ${end.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })}`;
}

/**
 * Check if event is expired
 */
export function isEventExpired(eventDate: string): boolean {
  return new Date(eventDate) < new Date();
}

/**
 * Get event availability status
 */
export function getEventAvailabilityStatus(
  currentSpots: number,
  maxSpots: number,
  isActive: boolean,
  eventDate: string
): {
  status: 'open' | 'full' | 'closed' | 'expired';
  message: string;
  spotsLeft: number;
} {
  const spotsLeft = maxSpots - currentSpots;
  
  if (isEventExpired(eventDate)) {
    return {
      status: 'expired',
      message: 'Evento encerrado',
      spotsLeft: 0
    };
  }
  
  if (!isActive) {
    return {
      status: 'closed',
      message: 'Inscrições fechadas',
      spotsLeft: 0
    };
  }
  
  if (spotsLeft <= 0) {
    return {
      status: 'full',
      message: 'Vagas esgotadas',
      spotsLeft: 0
    };
  }
  
  return {
    status: 'open',
    message: `${spotsLeft} vagas disponíveis`,
    spotsLeft
  };
}
