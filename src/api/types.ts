/**
 * API Types
 *
 * Request and response types for API endpoints.
 * These types define the contract with the backend API.
 */

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// User API types
export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Generic error response
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
