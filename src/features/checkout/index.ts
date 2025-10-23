/**
 * Checkout Feature Module
 * Payment processing and reservation checkout
 */

// Components
export { default as PaymentForm } from './components/payment-form';
export { default as CheckoutClient } from './components/checkout-client';

// Hooks
export { useReservationProcess } from './hooks/useReservationProcess';

/**
 * Usage:
 * ```tsx
 * import { PaymentForm, CheckoutClient, useReservationProcess } from '@/src/features/checkout';
 * 
 * const { processReservation, loading } = useReservationProcess();
 * 
 * <PaymentForm onSubmit={processReservation} />
 * ```
 */
