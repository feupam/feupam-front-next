/**
 * Service Layer Barrel Export
 * Central export point for all services
 */

// Base service
export { apiService, ApiService } from './api.service';
export type { ApiRequestConfig } from './api.service';

// Event service
export { eventService } from './event.service';
export type { 
  Event, 
  EventStats, 
  CreateEventData 
} from './event.service';

// Reservation service
export { reservationService } from './reservation.service';
export type { 
  Reservation, 
  CreateReservationData, 
  ReservationFilters 
} from './reservation.service';

// User service
export { userService } from './user.service';
export type { 
  User, 
  UserAddress, 
  UpdateUserData, 
  UserFilters 
} from './user.service';

// Admin service
export { adminService } from './admin.service';
export type { 
  DiscountData, 
  FreeEventData, 
  CouponData, 
  Coupon, 
  ValidateCouponData 
} from './admin.service';

// Payment service
export { paymentService } from './payment.service';
export type { 
  PaymentIntent, 
  CreatePaymentData, 
  PaymentData, 
  InstallmentOption 
} from './payment.service';

/**
 * Usage example:
 * 
 * ```typescript
 * import { eventService, userService } from '@/services';
 * import type { Event, User } from '@/services';
 * 
 * const events = await eventService.getEvents(token);
 * const user = await userService.getProfile(token);
 * ```
 */
