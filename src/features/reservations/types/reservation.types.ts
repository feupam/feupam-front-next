export type ReservationStatus = 'pending' | 'confirmed' | 'expired' | 'cancelled' | 'payment_pending';

export interface Reservation {
  id: string;
  userId: string;
  eventId: string;
  eventName: string;
  ticketKind: string;
  spotNumber?: number;
  status: ReservationStatus;
  price: number;
  discount?: number;
  finalPrice: number;
  createdAt: Date | string;
  expiresAt?: Date | string;
  confirmedAt?: Date | string;
  cancelledAt?: Date | string;
  paymentMethod?: 'credit_card' | 'pix' | 'boleto';
  paymentId?: string;
}

export interface ReservationFormData {
  eventId: string;
  ticketKind: string;
  spotNumber?: number;
  userData?: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
}

export interface ReservationTimer {
  expiresAt: Date | string;
  remainingTime: number; // in milliseconds
  isExpired: boolean;
}
