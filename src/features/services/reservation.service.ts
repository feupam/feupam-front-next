import { ApiService } from './api.service';

/**
 * Reservation Service
 * All reservation-related API calls
 */

export interface Reservation {
  id: string;
  userId: string;
  eventId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  expiresAt?: string;
  [key: string]: any;
}

export interface CreateReservationData {
  eventId: string;
  ticketQuantity?: number;
  ticketType?: string;
  [key: string]: any;
}

export interface ReservationFilters {
  eventId?: string;
  status?: string;
  paymentStatus?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

class ReservationService extends ApiService {
  /**
   * Get user's reservations
   */
  async getUserReservations(token: string, filters?: ReservationFilters): Promise<Reservation[]> {
    return this.get<Reservation[]>('/reservations', { 
      token, 
      params: filters as Record<string, string>
    });
  }

  /**
   * Get single reservation
   */
  async getReservation(reservationId: string, token: string): Promise<Reservation> {
    return this.get<Reservation>(`/reservations/${reservationId}`, { token });
  }

  /**
   * Create new reservation
   */
  async createReservation(data: CreateReservationData, token: string): Promise<Reservation> {
    return this.post<Reservation>('/reservations', data, { token });
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(reservationId: string, token: string): Promise<Reservation> {
    return this.post<Reservation>(`/reservations/${reservationId}/cancel`, undefined, { token });
  }

  /**
   * Confirm reservation
   */
  async confirmReservation(reservationId: string, token: string): Promise<Reservation> {
    return this.post<Reservation>(`/reservations/${reservationId}/confirm`, undefined, { token });
  }

  /**
   * Get reservations by event (admin)
   */
  async getEventReservations(eventId: string, token: string, filters?: ReservationFilters): Promise<Reservation[]> {
    return this.get<Reservation[]>(`/admin/events/${eventId}/reservations`, { 
      token,
      params: filters as Record<string, string>
    });
  }

  /**
   * Get all reservations (admin)
   */
  async getAllReservations(token: string, filters?: ReservationFilters): Promise<Reservation[]> {
    return this.get<Reservation[]>('/admin/reservations', { 
      token,
      params: filters as Record<string, string>
    });
  }
}

export const reservationService = new ReservationService();
