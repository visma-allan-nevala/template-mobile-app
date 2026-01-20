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
 *
 * Features:
 *   - Automatic token refresh on 401 responses
 *   - Request timeout handling
 *   - Structured error responses
 *   - Configurable auth header injection
 */

import { config } from '@core/config';
import { tokenManager } from '@services/auth/token-manager';
import type { ApiErrorResponse } from './types';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip authentication header */
  skipAuth?: boolean;
  /** Skip automatic token refresh on 401 */
  skipRefresh?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  /**
   * Subscribe to token refresh completion
   */
  private subscribeToRefresh(callback: (token: string | null) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notify all subscribers when token refresh completes
   */
  private notifyRefreshSubscribers(token: string | null): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Get authorization headers with current access token
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await tokenManager.getValidAccessToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Handle 401 response by refreshing token and retrying request
   */
  private async handleUnauthorized<T>(
    endpoint: string,
    options: RequestOptions
  ): Promise<T | null> {
    // If already refreshing, wait for completion
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.subscribeToRefresh(async (token) => {
          if (token) {
            // Retry with new token
            try {
              const result = await this.request<T>(endpoint, {
                ...options,
                skipRefresh: true,
              });
              resolve(result);
            } catch {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      });
    }

    // Start token refresh
    this.isRefreshing = true;

    try {
      const newTokens = await tokenManager.refreshTokens();
      this.notifyRefreshSubscribers(newTokens.accessToken);
      this.isRefreshing = false;

      // Retry original request with new token
      return await this.request<T>(endpoint, {
        ...options,
        skipRefresh: true,
      });
    } catch {
      this.notifyRefreshSubscribers(null);
      this.isRefreshing = false;
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, skipAuth = false, skipRefresh = false, ...fetchOptions } = options;

    // Validate endpoint
    if (!endpoint || typeof endpoint !== 'string') {
      throw new ApiError('INVALID_ENDPOINT', 'Endpoint must be a non-empty string', 0);
    }

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

      // Handle 401 Unauthorized with automatic token refresh
      if (response.status === 401 && !skipAuth && !skipRefresh) {
        const retryResult = await this.handleUnauthorized<T>(endpoint, options);
        if (retryResult !== null) {
          return retryResult;
        }
        // If refresh failed, throw unauthorized error
        throw new ApiError('UNAUTHORIZED', 'Session expired. Please log in again.', 401);
      }

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

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401 || this.code === 'UNAUTHORIZED';
  }

  /**
   * Check if this is a network error
   */
  isNetworkError(): boolean {
    return this.status === 0 || this.code === 'NETWORK_ERROR';
  }

  /**
   * Check if this is a timeout error
   */
  isTimeoutError(): boolean {
    return this.status === 408 || this.code === 'TIMEOUT';
  }
}

export const apiClient = new ApiClient();
