/**
 * Application Constants
 *
 * Static values used throughout the application.
 * Keep runtime configuration in config.ts; this file is for static constants.
 *
 * Usage:
 *   import { STORAGE_KEYS, ROUTES } from '@core/constants';
 */

// AsyncStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
  ID_TOKEN: 'id_token',
  USER_PREFERENCES: 'user_preferences',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  THEME_MODE: 'theme_mode',
  AUTH_STATE: 'auth_state', // For persisting PKCE state during OAuth flow
} as const;

// Route names for type-safe navigation
export const ROUTES = {
  // Auth routes
  LOGIN: '/(auth)/login',
  REGISTER: '/(auth)/register',

  // Main app routes (tabs)
  HOME: '/(tabs)',
  PROFILE: '/(tabs)/profile',
  SETTINGS: '/(tabs)/settings',
} as const;

// API endpoints (relative paths)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },
} as const;

// Validation rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
} as const;

// Timing constants (in milliseconds)
export const TIMING = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200,
  API_RETRY_DELAY: 1000,
} as const;
