import { ApiService } from './api.service';

/**
 * Admin Service
 * All admin-specific operations
 */

export interface DiscountData {
  email: string;
  discount: number;
  event: string;
}

export interface FreeEventData {
  email: string;
  eventId: string;
}

export interface CouponData {
  code: string;
  discount: number;
  eventId?: string;
  maxUses?: number;
  expiresAt?: string;
}

export interface Coupon extends CouponData {
  id: string;
  used: number;
  createdAt: string;
  isActive: boolean;
}

export interface ValidateCouponData {
  code: string;
  eventId: string;
}

class AdminService extends ApiService {
  /**
   * Apply discount to user
   */
  async applyDiscount(data: DiscountData, token: string): Promise<void> {
    return this.post<void>('/admin/discount', data, { token });
  }

  /**
   * Register user for free event
   */
  async registerFreeEvent(data: FreeEventData, token: string): Promise<void> {
    return this.post<void>(`/admin/${data.eventId}/free-event`, data, { token });
  }

  /**
   * Create coupon
   */
  async createCoupon(data: CouponData, token: string): Promise<Coupon> {
    return this.post<Coupon>('/admin/coupons', data, { token });
  }

  /**
   * Get all coupons
   */
  async getCoupons(token: string): Promise<Coupon[]> {
    return this.get<Coupon[]>('/admin/coupons', { token });
  }

  /**
   * Get coupon by ID
   */
  async getCoupon(couponId: string, token: string): Promise<Coupon> {
    return this.get<Coupon>(`/admin/coupons/${couponId}`, { token });
  }

  /**
   * Update coupon
   */
  async updateCoupon(couponId: string, data: Partial<CouponData>, token: string): Promise<Coupon> {
    return this.put<Coupon>(`/admin/coupons/${couponId}`, data, { token });
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(couponId: string, token: string): Promise<void> {
    return this.delete<void>(`/admin/coupons/${couponId}`, { token });
  }

  /**
   * Toggle coupon status
   */
  async toggleCouponStatus(couponId: string, token: string): Promise<Coupon> {
    return this.patch<Coupon>(`/admin/coupons/${couponId}/toggle-status`, undefined, { token });
  }

  /**
   * Validate coupon
   */
  async validateCoupon(data: ValidateCouponData, token?: string): Promise<{
    valid: boolean;
    discount?: number;
    message?: string;
  }> {
    return this.post('/coupons/validate', data, { token });
  }

  /**
   * Get admin dashboard stats
   */
  async getDashboardStats(token: string): Promise<{
    totalEvents: number;
    totalUsers: number;
    totalReservations: number;
    totalRevenue: number;
    [key: string]: any;
  }> {
    return this.get('/admin/dashboard/stats', { token });
  }

  /**
   * Export data (CSV/Excel)
   */
  async exportData(
    type: 'users' | 'reservations' | 'events',
    format: 'csv' | 'excel',
    token: string
  ): Promise<Blob> {
    const endpoint = `/admin/export/${type}`;
    const url = `${this['baseUrl']}${endpoint}?format=${format}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }
}

export const adminService = new AdminService();
