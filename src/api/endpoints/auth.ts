/**
 * Auth API Endpoints
 *
 * API calls for authentication-related operations.
 *
 * Usage:
 *   import { authApi } from '@api/endpoints/auth';
 *   const response = await authApi.login({ email, password });
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '@core/constants';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data, { skipAuth: true }),

  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data, { skipAuth: true }),

  logout: (): Promise<void> => apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT),

  refreshToken: (data: RefreshTokenRequest): Promise<RefreshTokenResponse> =>
    apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, data, { skipAuth: true }),
};
