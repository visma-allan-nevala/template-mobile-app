/**
 * Auth Store
 *
 * Zustand store for authentication state with persistence.
 * Manages user session, tokens, and auth status.
 *
 * Usage:
 *   import { useAuthStore } from '@store/auth.store';
 *   const { user, isAuthenticated, login, logout } = useAuthStore();
 *
 * LLM Instructions:
 * - This store persists auth state across app restarts
 * - Tokens are stored securely via secureStorage
 * - Call logout() to clear all auth data
 * - Token refresh is handled by tokenManager, not this store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '@utils/secure-storage';
import { STORAGE_KEYS } from '@core/constants';
import type { User } from '@core/types';

// Auth state type (colocated with store)
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** Unix timestamp when access token expires */
  tokenExpiresAt: number | null;

  // Actions
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  /**
   * Login with tokens
   * @param user User data
   * @param accessToken Access token
   * @param refreshToken Refresh token
   * @param expiresAt Optional token expiry timestamp (ms since epoch)
   */
  login: (
    user: User,
    accessToken: string,
    refreshToken: string,
    expiresAt?: number
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  /** Update token expiry timestamp (called after token refresh) */
  updateTokenExpiry: (expiresAt: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokenExpiresAt: null,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      login: async (user, accessToken, refreshToken, expiresAt) => {
        // Store tokens securely
        const storagePromises: Promise<void>[] = [
          secureStorage.setToken(accessToken),
          secureStorage.setRefreshToken(refreshToken),
        ];

        // Store token expiry if provided
        if (expiresAt) {
          storagePromises.push(secureStorage.set(STORAGE_KEYS.TOKEN_EXPIRY, String(expiresAt)));
        }

        await Promise.all(storagePromises);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          tokenExpiresAt: expiresAt ?? null,
        });
      },

      logout: async () => {
        // Clear secure storage (tokens and expiry)
        await Promise.all([
          secureStorage.clearAll(),
          secureStorage.delete(STORAGE_KEYS.TOKEN_EXPIRY),
          secureStorage.delete(STORAGE_KEYS.ID_TOKEN),
        ]);

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          tokenExpiresAt: null,
        });
      },

      clearError: () => set({ error: null }),

      updateTokenExpiry: (expiresAt) => {
        // Also persist to secure storage
        secureStorage.set(STORAGE_KEYS.TOKEN_EXPIRY, String(expiresAt));
        set({ tokenExpiresAt: expiresAt });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not tokens (they're in secure storage)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
    }
  )
);
