/**
 * Auth API Endpoints
 *
 * API calls for authentication-related operations.
 *
 * Usage:
 *   import { authApi } from '@api/endpoints/auth';
 *
 *   // Email/password login
 *   const response = await authApi.login({ email, password });
 *
 *   // OAuth login (for mobile apps with Visma Connect)
 *   const response = await authApi.oauthLogin({
 *     provider: 'visma_connect',
 *     accessToken: vismaAccessToken,
 *   });
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
  OAuthTokenLoginRequest,
  OAuthCodeExchangeRequest,
  OAuthLoginResponse,
} from '../types';

export const authApi = {
  /**
   * Login with email and password
   */
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data, { skipAuth: true }),

  /**
   * Register a new user with email and password
   */
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data, { skipAuth: true }),

  /**
   * Logout current user (revokes tokens)
   */
  logout: (): Promise<void> => apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT),

  /**
   * Refresh access token using refresh token
   */
  refreshToken: (data: RefreshTokenRequest): Promise<RefreshTokenResponse> =>
    apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, data, { skipAuth: true }),

  /**
   * OAuth token login - Exchange OAuth provider access token for backend JWT
   *
   * This is the preferred method for mobile apps:
   * 1. App performs OAuth flow with provider (e.g., Visma Connect)
   * 2. App sends provider access token to backend
   * 3. Backend validates with provider and issues its own JWT
   *
   * @param data OAuth provider name and access token
   * @returns Backend JWT tokens and user profile
   */
  oauthLogin: (data: OAuthTokenLoginRequest): Promise<OAuthLoginResponse> =>
    apiClient.post<OAuthLoginResponse>(API_ENDPOINTS.AUTH.OAUTH_LOGIN, data, { skipAuth: true }),

  /**
   * OAuth code exchange - Backend handles code exchange with provider
   *
   * Alternative method for apps that want backend to handle token exchange:
   * 1. App initiates OAuth flow and receives authorization code
   * 2. App sends code + PKCE verifier to backend
   * 3. Backend exchanges code for tokens and issues its own JWT
   *
   * @param data Authorization code and PKCE parameters
   * @returns Backend JWT tokens and user profile
   */
  oauthExchange: (data: OAuthCodeExchangeRequest): Promise<OAuthLoginResponse> =>
    apiClient.post<OAuthLoginResponse>(API_ENDPOINTS.AUTH.OAUTH_EXCHANGE, data, { skipAuth: true }),
};
