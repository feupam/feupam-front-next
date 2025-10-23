/**
 * API Service para Reservas
 * 
 * Implementa todos os endpoints conforme documentação:
 * https://us-central1-federa-api.cloudfunctions.net/api
 * 
 * Todos os endpoints requerem: Authorization: Bearer {firebase_token}
 */

import { auth } from '@/lib/firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';

// Helper para obter token do Firebase
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuário não autenticado');
  }
  return await user.getIdToken();
}

// Helper para fazer requisições autenticadas
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
}

// ==================== INTERFACES ====================

export interface ReservationResponse {
  id: string;
  status: 'reserved' | 'Pago' | 'expired';
  expiresAt: string;
  message?: string;
  spotId?: string;
  eventId?: string;
  remainingMinutes?: number;
  remainingSeconds?: number;
}

export interface InstallmentOption {
  installments: number;
  installmentAmount: number;
  totalAmount: number;
}

export interface PaymentRequest {
  ticketId: string;
  paymentMethod: 'credit_card' | 'pix';
  installments: number;
}

export interface PaymentResponse {
  status: string;
  ticketId: string;
  chargeId?: string;
  qrCode?: string;
  qrCodeText?: string;
}

export interface UserReservation {
  id: string;
  eventId: string;
  eventName: string;
  status: 'reserved' | 'Pago' | 'expired';
  createdAt: string;
  expiresAt?: string;
  remainingMinutes?: number;
  remainingSeconds?: number;
  price?: number;
}

export interface WaitingListStatus {
  inQueue?: boolean;
  position?: number;
  totalInQueue?: number;
  addedAt?: string;
}

export interface EventStats {
  // Para eventos GENERAL
  totalPaid?: number;
  totalReserved?: number;
  maxGeneralSpots?: number;
  availableSpots?: number;
  waitingListSize?: number;
  
  // Para eventos GENDER_SPECIFIC
  femalePaid?: number;
  femaleReserved?: number;
  malePaid?: number;
  maleReserved?: number;
  maxClientFemale?: number;
  maxClientMale?: number;
  availableFemaleSpots?: number;
  availableMaleSpots?: number;
}

// ==================== API METHODS ====================

export const ReservationAPI = {
  /**
   * 1. Verificar Disponibilidade de Vagas
   * GET /events/{eventId}/check-spot
   */
  async checkSpot(eventId: string): Promise<boolean> {
    return fetchWithAuth(`/events/${eventId}/check-spot`);
  },

  /**
   * 2. Criar Reserva (5 minutos para pagar)
   * POST /events/{eventId}/reserve-spot
   */
  async reserveSpot(eventId: string, userType: 'client' | 'staff' = 'client'): Promise<ReservationResponse> {
    return fetchWithAuth(`/events/${eventId}/reserve-spot`, {
      method: 'POST',
      body: JSON.stringify({ userType }),
    });
  },

  /**
   * 3. Ver Opções de Parcelamento
   * GET /events/{eventId}/installments
   */
  async getInstallments(eventId: string): Promise<InstallmentOption[]> {
    return fetchWithAuth(`/events/${eventId}/installments`);
  },

  /**
   * 4. Ver Status da Reserva (Countdown)
   * GET /tickets/{ticketId}/purchase
   */
  async getReservationStatus(ticketId: string): Promise<ReservationResponse> {
    return fetchWithAuth(`/tickets/${ticketId}/purchase`);
  },

  /**
   * 5. Processar Pagamento
   * POST /tickets/payment
   */
  async processPayment(data: PaymentRequest): Promise<PaymentResponse> {
    return fetchWithAuth(`/tickets/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 6. Ver Minhas Reservas
   * GET /users/reservations
   */
  async getUserReservations(): Promise<UserReservation[]> {
    return fetchWithAuth(`/users/reservations`);
  },

  /**
   * 7. Ver Posição na Fila de Espera
   * GET /events/{eventId}/waiting-list
   */
  async getWaitingListStatus(eventId: string): Promise<WaitingListStatus> {
    return fetchWithAuth(`/events/${eventId}/waiting-list`);
  },

  /**
   * 8. Sair da Fila de Espera
   * DELETE /events/{eventId}/waiting-list
   */
  async leaveWaitingList(eventId: string): Promise<{ message: string }> {
    return fetchWithAuth(`/events/${eventId}/waiting-list`, {
      method: 'DELETE',
    });
  },

  /**
   * 9. Cancelar Reserva Pendente
   * PATCH /users/cancel-reservation
   */
  async cancelReservation(ticketId: string): Promise<{ message: string; ticketId: string }> {
    return fetchWithAuth(`/users/cancel-reservation`, {
      method: 'PATCH',
      body: JSON.stringify({ ticketId }),
    });
  },

  /**
   * 10. Ver Estatísticas do Evento
   * GET /events/{eventId}/stats
   */
  async getEventStats(eventId: string): Promise<EventStats> {
    return fetchWithAuth(`/events/${eventId}/stats`);
  },
};
