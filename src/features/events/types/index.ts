/**
 * Events Feature Types
 * Consolidated type definitions for events
 */

// Re-export from individual type files
export * from './event';
export * from './event-data';

// Additional event-specific types
export interface EventFilter {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'cancelled';
  startDate?: string;
  endDate?: string;
}

export interface EventAvailability {
  available: boolean;
  spotsLeft: number;
  totalSpots: number;
  status: 'open' | 'full' | 'closed' | 'expired';
  message?: string;
}

export interface EventRegistration {
  eventId: string;
  userId: string;
  ticketType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
