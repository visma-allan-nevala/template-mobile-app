/**
 * useAuth Hook
 *
 * Convenience hook for authentication operations.
 * Combines auth store state with auth service actions.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout, isLoading, error } = useAuth();
 *   await login({ email, password });
 */

import { useCallback } from 'react';
import { useAuthStore } from '@store/auth.store';
import { authService } from '@services/auth.service';
import type { LoginRequest, RegisterRequest } from '@api/types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const login = useCallback(async (credentials: LoginRequest) => {
    await authService.login(credentials);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await authService.register(data);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
