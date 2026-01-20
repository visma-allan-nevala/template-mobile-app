/**
 * Secure Storage Wrapper
 *
 * Uses expo-secure-store for sensitive data (tokens, credentials).
 * Data is encrypted using the device's keychain (iOS) or keystore (Android).
 * Falls back gracefully on web.
 *
 * Usage:
 *   import { secureStorage } from '@utils/secure-storage';
 *   await secureStorage.setToken('my-jwt-token');
 *   const token = await secureStorage.getToken();
 *   await secureStorage.clearAll(); // On logout
 *
 * LLM Instructions:
 * - Use this for sensitive data (tokens, passwords, API keys)
 * - For non-sensitive data, use regular AsyncStorage via storage.ts
 * - On web, data is stored in localStorage (less secure)
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '@core/constants';

// Web fallback using localStorage
const webStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  deleteItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return webStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    webStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    webStorage.deleteItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const secureStorage = {
  // Token management
  getToken: (): Promise<string | null> => getItem(STORAGE_KEYS.AUTH_TOKEN),

  setToken: (token: string): Promise<void> => setItem(STORAGE_KEYS.AUTH_TOKEN, token),

  getRefreshToken: (): Promise<string | null> => getItem(STORAGE_KEYS.REFRESH_TOKEN),

  setRefreshToken: (token: string): Promise<void> => setItem(STORAGE_KEYS.REFRESH_TOKEN, token),

  // Clear all secure data (call on logout)
  clearAll: async (): Promise<void> => {
    await Promise.all([
      deleteItem(STORAGE_KEYS.AUTH_TOKEN),
      deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },

  // Generic methods for custom secure storage needs
  get: getItem,
  set: setItem,
  delete: deleteItem,
};
