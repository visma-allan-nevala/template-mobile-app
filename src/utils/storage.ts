/**
 * AsyncStorage Helpers
 *
 * Wrapper around AsyncStorage for non-sensitive data persistence.
 * Use this for user preferences, cached data, and app state.
 *
 * Usage:
 *   import { storage } from '@utils/storage';
 *   await storage.set('theme', 'dark');
 *   const theme = await storage.get<string>('theme');
 *   await storage.setObject('user_prefs', { notifications: true });
 *
 * Note: For sensitive data (tokens, passwords), use secure-storage.ts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Get a string value
  get: async <T extends string = string>(key: string): Promise<T | null> => {
    return (await AsyncStorage.getItem(key)) as T | null;
  },

  // Set a string value
  set: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },

  // Get a JSON object
  getObject: async <T>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Set a JSON object
  setObject: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  // Remove a key
  remove: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  // Clear all storage (use with caution)
  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },

  // Get multiple keys
  multiGet: async (keys: string[]): Promise<Record<string, string | null>> => {
    const pairs = await AsyncStorage.multiGet(keys);
    return Object.fromEntries(pairs);
  },

  // Set multiple key-value pairs
  multiSet: async (entries: Record<string, string>): Promise<void> => {
    const pairs = Object.entries(entries);
    await AsyncStorage.multiSet(pairs);
  },
};
