import { ApiService } from './api.service';

/**
 * Payment Service
 * All payment-related API calls
 */

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  clientSecret?: string;
  [key: string]: any;
}

export interface CreatePaymentData {
  reservationId: string;
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  installments?: number;
  [key: string]: any;
}

export interface PaymentData {
  id: string;
  reservationId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  confirmedAt?: string;
  [key: string]: any;
}

export interface InstallmentOption {
  installments: number;
  amount: number;
  totalAmount: number;
  interest: number;
  interestRate: number;
}

class PaymentService extends ApiService {
  /**
   * Create payment intent
   */
  async createPaymentIntent(data: CreatePaymentData, token: string): Promise<PaymentIntent> {
    return this.post<PaymentIntent>('/payments/create-intent', data, { token });
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string, token: string): Promise<PaymentData> {
    return this.get<PaymentData>(`/payments/${paymentId}`, { token });
  }

  /**
   * Get payment by reservation ID
   */
  async getPaymentByReservation(reservationId: string, token: string): Promise<PaymentData> {
    return this.get<PaymentData>(`/payments/reservation/${reservationId}`, { token });
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentId: string, token: string): Promise<PaymentData> {
    return this.post<PaymentData>(`/payments/${paymentId}/confirm`, undefined, { token });
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string, token: string): Promise<PaymentData> {
    return this.post<PaymentData>(`/payments/${paymentId}/cancel`, undefined, { token });
  }

  /**
   * Get installment options
   */
  async getInstallmentOptions(amount: number, eventId?: string): Promise<InstallmentOption[]> {
    return this.get<InstallmentOption[]>('/payments/installments', {
      params: { amount, eventId: eventId || '' }
    });
  }

  /**
   * Process Pix payment
   */
  async createPixPayment(data: CreatePaymentData, token: string): Promise<{
    qrCode: string;
    qrCodeUrl: string;
    expiresAt: string;
    paymentId: string;
  }> {
    return this.post('/payments/pix', data, { token });
  }

  /**
   * Process Boleto payment
   */
  async createBoletoPayment(data: CreatePaymentData, token: string): Promise<{
    boletoUrl: string;
    barcode: string;
    expiresAt: string;
    paymentId: string;
  }> {
    return this.post('/payments/boleto', data, { token });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<{
    status: PaymentIntent['status'];
    updatedAt: string;
  }> {
    return this.get(`/payments/${paymentId}/status`);
  }

  /**
   * Refund payment (admin)
   */
  async refundPayment(paymentId: string, amount?: number, token?: string): Promise<PaymentData> {
    return this.post(`/admin/payments/${paymentId}/refund`, { amount }, { token });
  }
}

export const paymentService = new PaymentService();
