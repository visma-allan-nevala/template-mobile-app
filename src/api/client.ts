/**
 * API Client
 *
 * Centralized fetch wrapper with authentication, error handling,
 * and automatic token refresh.
 *
 * Usage:
 *   import { apiClient } from '@api/client';
 *   const response = await apiClient.get<UserProfile>('/user/profile');
 *   const result = await apiClient.post<LoginResponse>('/auth/login', { email, password });
 */

import { config } from '@core/config';
import { secureStorage } from '@utils/secure-storage';
import type { ApiErrorResponse } from './types';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await secureStorage.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, skipAuth = false, ...fetchOptions } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    if (!skipAuth) {
      const authHeaders = await this.getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          error: {
            code: 'UNKNOWN_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        }));

        throw new ApiError(
          errorData.error.code,
          errorData.error.message,
          response.status,
          errorData.error.details
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('TIMEOUT', 'Request timed out', 408);
        }
        throw new ApiError('NETWORK_ERROR', error.message, 0);
      }

      throw new ApiError('UNKNOWN_ERROR', 'An unexpected error occurred', 0);
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();
