import { ApiService } from './api.service';

/**
 * Event Service
 * All event-related API calls
 */

export interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  maxCapacity?: number;
  price?: number;
  status?: 'active' | 'inactive' | 'cancelled';
  [key: string]: any;
}

export interface EventStats {
  totalReservations: number;
  confirmedReservations: number;
  paidReservations: number;
  vagasDisponiveis?: {
    male: number;
    female: number;
  };
  reservasPagas?: {
    male: number;
    female: number;
  };
  updatedAt?: string;
  [key: string]: any;
}

export interface CreateEventData {
  name: string;
  description?: string;
  date: string;
  location?: string;
  maxCapacity?: number;
  price?: number;
  [key: string]: any;
}

class EventService extends ApiService {
  /**
   * Get all events
   */
  async getEvents(token?: string): Promise<Event[]> {
    return this.get<Event[]>('/events', { token });
  }

  /**
   * Get single event by ID
   */
  async getEvent(eventId: string, token?: string): Promise<Event> {
    return this.get<Event>(`/events/${eventId}`, { token });
  }

  /**
   * Create new event
   */
  async createEvent(data: CreateEventData, token: string): Promise<Event> {
    return this.post<Event>('/events', data, { token });
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, data: Partial<CreateEventData>, token: string): Promise<Event> {
    return this.put<Event>(`/events/${eventId}`, data, { token });
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, token: string): Promise<void> {
    return this.delete<void>(`/events/${eventId}`, { token });
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string, token: string): Promise<EventStats> {
    return this.get<EventStats>(`/events/${eventId}/stats`, { token });
  }

  /**
   * Toggle event status
   */
  async toggleEventStatus(eventId: string, token: string): Promise<Event> {
    return this.patch<Event>(`/events/${eventId}/toggle-status`, undefined, { token });
  }

  /**
   * Get event capacity info
   */
  async getEventCapacity(eventId: string, token?: string): Promise<{
    available: number;
    total: number;
    reserved: number;
  }> {
    return this.get(`/events/${eventId}/capacity`, { token });
  }
}

export const eventService = new EventService();
