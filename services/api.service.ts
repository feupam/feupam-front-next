/**
 * Base API Service
 * Centralized API configuration and common methods
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';

export interface ApiRequestConfig extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean>;
}

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = `${this.baseUrl}${endpoint}`;
    
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `${url}?${searchParams.toString()}`;
  }

  /**
   * Build request headers
   */
  private buildHeaders(token?: string, contentType: string = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generic request method
   */
  protected async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const { token, params, ...fetchConfig } = config;

    const url = this.buildUrl(endpoint, params);
    const headers = this.buildHeaders(token);

    const response = await fetch(url, {
      ...fetchConfig,
      headers: {
        ...headers,
        ...fetchConfig.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status} ${response.statusText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * GET request
   */
  protected async get<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  protected async post<T>(
    endpoint: string,
    data?: any,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  protected async put<T>(
    endpoint: string,
    data?: any,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  protected async patch<T>(
    endpoint: string,
    data?: any,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  protected async delete<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
