import { ApiService } from './api.service';

/**
 * User Service
 * All user-related API calls
 */

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  cpf?: string;
  address?: UserAddress;
  isStaff?: boolean;
  isAdmin?: boolean;
  [key: string]: any;
}

export interface UserAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UpdateUserData {
  displayName?: string;
  phoneNumber?: string;
  cpf?: string;
  address?: UserAddress;
  [key: string]: any;
}

export interface UserFilters {
  email?: string;
  cpf?: string;
  isStaff?: boolean;
  search?: string;
}

class UserServiceClass extends ApiService {
  /**
   * Get current user profile
   */
  async getProfile(token: string): Promise<User> {
    return this.get<User>('/users/profile', { token });
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserData, token: string): Promise<User> {
    return this.put<User>('/users/profile', data, { token });
  }

  /**
   * Get user by ID (admin)
   */
  async getUserById(userId: string, token: string): Promise<User> {
    return this.get<User>(`/admin/users/${userId}`, { token });
  }

  /**
   * Get user by email (admin)
   */
  async getUserByEmail(email: string, token: string): Promise<User> {
    return this.get<User>('/admin/users/by-email', { 
      token,
      params: { email }
    });
  }

  /**
   * Get user by CPF (admin)
   */
  async getUserByCPF(cpf: string, token: string): Promise<User> {
    return this.get<User>('/admin/users/by-cpf', { 
      token,
      params: { cpf }
    });
  }

  /**
   * Search users (admin)
   */
  async searchUsers(token: string, filters?: UserFilters): Promise<User[]> {
    return this.get<User[]>('/admin/users', { 
      token,
      params: filters as Record<string, string>
    });
  }

  /**
   * Update user (admin)
   */
  async updateUser(userId: string, data: UpdateUserData, token: string): Promise<User> {
    return this.put<User>(`/admin/users/${userId}`, data, { token });
  }

  /**
   * Delete user (admin)
   */
  async deleteUser(userId: string, token: string): Promise<void> {
    return this.delete<void>(`/admin/users/${userId}`, { token });
  }

  /**
   * Toggle staff status (admin)
   */
  async toggleStaffStatus(userId: string, token: string): Promise<User> {
    return this.patch<User>(`/admin/users/${userId}/toggle-staff`, undefined, { token });
  }

  /**
   * Set staff password (admin)
   */
  async setStaffPassword(data: { email: string; password: string }, token: string): Promise<void> {
    return this.post<void>('/admin/staff/password', data, { token });
  }
}

export const userService = new UserServiceClass();
