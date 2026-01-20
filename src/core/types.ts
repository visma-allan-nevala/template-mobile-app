/**
 * Shared/Global Types
 *
 * Types that are used across multiple modules go here.
 * Module-specific types should be colocated with their modules.
 *
 * Usage:
 *   import type { User, PaginatedResponse } from '@core/types';
 */

// User entity (shared across auth, profile, etc.)
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Paginated response for list endpoints
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

// Generic error type
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Navigation param types (extend as needed)
export type RootStackParamList = {
  '(auth)/login': undefined;
  '(auth)/register': undefined;
  '(tabs)': undefined;
  '(tabs)/profile': undefined;
  '(tabs)/settings': undefined;
};

// Theme mode
export type ThemeMode = 'light' | 'dark' | 'system';

// Loading state helper
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: AppError | null;
}
