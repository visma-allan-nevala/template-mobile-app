/**
 * Auth Service
 *
 * Business logic for authentication operations.
 * Orchestrates API calls and state updates.
 *
 * Usage:
 *   import { authService } from '@services/auth.service';
 *   await authService.login({ email, password });
 *   await authService.logout();
 *
 * LLM Instructions:
 * - This service connects the API layer with the store layer
 * - It handles errors and updates store state appropriately
 * - Use this in components instead of calling API directly
 */

import { authApi } from '@api/endpoints/auth';
import { useAuthStore } from '@store/auth.store';
import type { LoginRequest, RegisterRequest } from '@api/types';
import type { User } from '@core/types';

// Convert API user response to User type
function toUser(apiUser: {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    username: apiUser.username,
    displayName: apiUser.displayName,
    avatarUrl: apiUser.avatarUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<void> => {
    const store = useAuthStore.getState();

    store.setLoading(true);
    store.clearError();

    try {
      const response = await authApi.login(credentials);

      const user = toUser(response.user);

      await store.login(user, response.accessToken, response.refreshToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      store.setError(message);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<void> => {
    const store = useAuthStore.getState();

    store.setLoading(true);
    store.clearError();

    try {
      const response = await authApi.register(data);

      const user = toUser(response.user);

      await store.login(user, response.accessToken, response.refreshToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      store.setError(message);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    const store = useAuthStore.getState();

    try {
      // Try to call logout API (best effort)
      await authApi.logout().catch(() => {
        // Ignore logout API errors - we'll clear local state anyway
      });
    } finally {
      await store.logout();
    }
  },

  // Check if user is authenticated (for initial app load)
  checkAuth: (): boolean => {
    const store = useAuthStore.getState();
    return store.isAuthenticated && store.user !== null;
  },
};
