/**
 * useApi Hook
 *
 * Generic hook for handling API calls with loading and error states.
 * Useful for one-off API calls in components.
 *
 * Usage:
 *   const { data, isLoading, error, execute } = useApi(userApi.getProfile);
 *   useEffect(() => { execute(); }, []);
 *
 *   // Or with parameters:
 *   const { execute } = useApi(userApi.updateProfile);
 *   await execute({ displayName: 'New Name' });
 */

import { useState, useCallback } from 'react';
import type { AppError } from '@core/types';
import { ApiError } from '@api/client';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: AppError | null;
}

interface UseApiReturn<T, P extends unknown[]> extends UseApiState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T, P extends unknown[]>(
  apiFunction: (...params: P) => Promise<T>
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const data = await apiFunction(...params);
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (err) {
        const error: AppError =
          err instanceof ApiError
            ? { code: err.code, message: err.message, details: err.details }
            : { code: 'UNKNOWN_ERROR', message: err instanceof Error ? err.message : 'Unknown error' };

        setState({ data: null, isLoading: false, error });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
