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
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '@utils/secure-storage';
import type { User } from '@core/types';

// Auth state type (colocated with store)
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      login: async (user, accessToken, refreshToken) => {
        // Store tokens securely
        await Promise.all([
          secureStorage.setToken(accessToken),
          secureStorage.setRefreshToken(refreshToken),
        ]);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: async () => {
        // Clear secure storage
        await secureStorage.clearAll();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not tokens (they're in secure storage)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
