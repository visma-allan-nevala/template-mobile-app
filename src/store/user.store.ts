/**
 * User Store
 *
 * Zustand store for user profile and preferences.
 *
 * Usage:
 *   import { useUserStore } from '@store/user.store';
 *   const { profile, preferences, updateProfile } = useUserStore();
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '@core/types';

// User preferences type
interface UserPreferences {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  language: string;
}

// User profile type
interface UserProfile {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  isLoading: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const defaultPreferences: UserPreferences = {
  themeMode: 'system',
  notificationsEnabled: true,
  language: 'en',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      preferences: defaultPreferences,
      isLoading: false,

      setProfile: (profile) => set({ profile }),

      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      setThemeMode: (mode) =>
        set((state) => ({
          preferences: { ...state.preferences, themeMode: mode },
        })),

      setLoading: (isLoading) => set({ isLoading }),

      reset: () =>
        set({
          profile: null,
          preferences: defaultPreferences,
          isLoading: false,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
