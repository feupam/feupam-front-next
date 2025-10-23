/**
 * Admin Feature Types
 */

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  isStaff?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface AdminEvent {
  id: string;
  name: string;
  description?: string;
  date: string;
  status: 'active' | 'inactive' | 'cancelled';
  maxCapacity?: number;
  currentCapacity?: number;
}

export interface AdminReservation {
  id: string;
  userId: string;
  eventId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalReservations: number;
  totalRevenue: number;
}
