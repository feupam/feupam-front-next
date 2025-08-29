import { request } from '@/lib/api';
import { auth } from '@/lib/firebase';

// Atualizando a interface para aceitar uma resposta booleana ou objeto
export type ReservationStatus = boolean | {
  isAvailable: boolean;
  spotId?: string;
  waitingList?: boolean;
};

export interface ReservationRequest {
  eventId: string;
  ticketKind: string;
}

export interface ReservationResponse {
  spotId: string;
  email: string;
  eventId: string;
  ticketKind: string;
  userType?: string;
  gender?: string;
  status?: string;
  price?: number;
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface TicketPurchaseRequest {
  eventId: string;
  reservationId: string;
}

export const reservationService = {
  async checkAvailability(eventId: string): Promise<ReservationStatus> {
    const token = await auth.currentUser?.getIdToken();
    return request<ReservationStatus>(`/events/${eventId}/check-spot`, {
      method: 'GET',
      token
    });
  },

  async createReservation(data: ReservationRequest): Promise<ReservationResponse> {
    const token = await auth.currentUser?.getIdToken();
    const response = await request<ReservationResponse>(`/events/${data.eventId}/reserve-spot`, {
      method: 'POST',
      body: JSON.stringify({
        ticket_kind: data.ticketKind
      }),
      token
    });
    console.log('Resposta da reserva:', response);
    console.log('É booleano?', typeof response === 'boolean');
    return response;
  },

  async getUserReservations(): Promise<ReservationResponse[]> {
    const token = await auth.currentUser?.getIdToken();
    return request<ReservationResponse[]>('/users/reservations', {
      method: 'GET',
      token
    });
  },

  async purchaseTicket(data: TicketPurchaseRequest): Promise<any> {
    const token = await auth.currentUser?.getIdToken();
    return request(`/tickets/${data.eventId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({
        reservationId: data.reservationId
      }),
      token
    });
  }
}; 