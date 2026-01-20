/**
 * Tests for useVismaConnect hook
 *
 * Tests the complete OAuth 2.0 + PKCE authentication flow including:
 * - Login flow (browser open, callback handling, token exchange)
 * - Logout flow (token revocation, state cleanup)
 * - Error handling
 * - Deep link callback handling
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useVismaConnect, parseVismaUser } from '@hooks/useVismaConnect';

// Mock all external dependencies
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(() => ({
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('@api/endpoints/auth', () => ({
  authApi: {
    oauthLogin: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@services/auth/token-manager', () => ({
  tokenManager: {
    setTokens: jest.fn().mockResolvedValue(undefined),
    clearTokens: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@services/auth/visma-connect', () => ({
  vismaConnect: {
    initiateLogin: jest.fn(),
    handleCallback: jest.fn(),
  },
  VismaConnectError: class VismaConnectError extends Error {
    error: string;
    errorDescription?: string;
    constructor(error: string, errorDescription?: string) {
      super(errorDescription || error);
      this.name = 'VismaConnectError';
      this.error = error;
      this.errorDescription = errorDescription;
    }
  },
  decodeIdToken: jest.fn(),
}));

jest.mock('@services/app-initialization', () => ({
  onUserLogin: jest.fn().mockResolvedValue(undefined),
  onUserLogout: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@core/auth.config', () => ({
  authConfig: {
    clientId: 'test-client-id',
    scheme: 'test-app',
    scopes: ['openid', 'profile', 'email'],
  },
}));

jest.mock('@utils/secure-storage', () => ({
  secureStorage: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@core/constants', () => ({
  STORAGE_KEYS: {
    AUTH_STATE: 'auth_state',
  },
}));

jest.mock('@core/config', () => ({
  isDev: false,
}));

// Import mocked modules for assertions
import { authApi } from '@api/endpoints/auth';
import { tokenManager } from '@services/auth/token-manager';
import { vismaConnect, VismaConnectError, decodeIdToken } from '@services/auth/visma-connect';
import { onUserLogin, onUserLogout } from '@services/app-initialization';
import { secureStorage } from '@utils/secure-storage';
import { useAuthStore } from '@store/auth.store';

// Get the mocked useAuthStore
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('useVismaConnect', () => {
  // Mock auth store methods
  const mockLogin = jest.fn().mockResolvedValue(undefined);
  const mockLogout = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset auth store mock
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      logout: mockLogout,
    } as ReturnType<typeof useAuthStore>);

    // Reset Linking mock
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);
  });

  describe('initial state', () => {
    it('returns initial state with isLoading false and no error', () => {
      const { result } = renderHook(() => useVismaConnect());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('login flow', () => {
    const mockPkce = {
      codeVerifier: 'test-verifier',
      codeChallenge: 'test-challenge',
      codeChallengeMethod: 'S256' as const,
    };

    const mockInitiateLoginResponse = {
      authUrl: 'https://connect.visma.com/authorize?...',
      state: 'test-state-123',
      pkce: mockPkce,
      redirectUri: 'test-app://callback/oauth',
    };

    const mockTokenSet = {
      accessToken: 'visma-access-token',
      refreshToken: 'visma-refresh-token',
      idToken: 'visma-id-token',
      expiresAt: Date.now() + 3600000,
      expiresIn: 3600,
      tokenType: 'Bearer',
    };

    const mockOAuthResponse = {
      accessToken: 'backend-access-token',
      refreshToken: 'backend-refresh-token',
      expiresIn: 3600,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
      },
    };

    beforeEach(() => {
      (vismaConnect.initiateLogin as jest.Mock).mockResolvedValue(mockInitiateLoginResponse);
      (vismaConnect.handleCallback as jest.Mock).mockResolvedValue(mockTokenSet);
      (authApi.oauthLogin as jest.Mock).mockResolvedValue(mockOAuthResponse);
    });

    it('completes successful login flow', async () => {
      // Mock successful browser session
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: 'test-app://callback/oauth?code=auth-code&state=test-state-123',
      });

      // Mock pending auth state retrieval
      (secureStorage.get as jest.Mock).mockResolvedValue(
        JSON.stringify({
          state: 'test-state-123',
          pkce: mockPkce,
          redirectUri: 'test-app://callback/oauth',
          timestamp: Date.now(),
        })
      );

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.login();
      });

      // Verify PKCE flow was initiated
      expect(vismaConnect.initiateLogin).toHaveBeenCalled();

      // Verify auth state was saved before redirect
      expect(secureStorage.set).toHaveBeenCalledWith(
        'auth_state',
        expect.stringContaining('test-state-123')
      );

      // Verify browser was opened
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
        mockInitiateLoginResponse.authUrl,
        mockInitiateLoginResponse.redirectUri,
        expect.any(Object)
      );

      // Verify callback was handled
      expect(vismaConnect.handleCallback).toHaveBeenCalled();

      // Verify tokens were stored
      expect(tokenManager.setTokens).toHaveBeenCalledWith(mockTokenSet);

      // Verify backend exchange
      expect(authApi.oauthLogin).toHaveBeenCalledWith({
        provider: 'visma_connect',
        accessToken: mockTokenSet.accessToken,
        idToken: mockTokenSet.idToken,
      });

      // Verify auth store was updated
      expect(mockLogin).toHaveBeenCalled();

      // Verify user services were set up
      expect(onUserLogin).toHaveBeenCalledWith('user-123', 'test@example.com');

      // Verify loading state is false after completion
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles user cancellation', async () => {
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.login();
      });

      // Verify pending state was cleared
      expect(secureStorage.delete).toHaveBeenCalledWith('auth_state');

      // Verify no error
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);

      // Verify no token exchange occurred
      expect(authApi.oauthLogin).not.toHaveBeenCalled();
    });

    it('handles browser dismiss', async () => {
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'dismiss',
      });

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.login();
      });

      expect(secureStorage.delete).toHaveBeenCalledWith('auth_state');
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles OAuth error from provider', async () => {
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: 'test-app://callback/oauth?error=access_denied&error_description=User%20denied%20access',
      });

      (secureStorage.get as jest.Mock).mockResolvedValue(
        JSON.stringify({
          state: 'test-state-123',
          pkce: mockPkce,
          redirectUri: 'test-app://callback/oauth',
          timestamp: Date.now(),
        })
      );

      // Mock handleCallback to throw VismaConnectError
      (vismaConnect.handleCallback as jest.Mock).mockRejectedValue(
        new VismaConnectError('access_denied', 'User denied access')
      );

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.login();
      });

      expect(result.current.error).toBe('User denied access');
      expect(result.current.isLoading).toBe(false);
    });

    it('handles backend exchange failure', async () => {
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: 'test-app://callback/oauth?code=auth-code&state=test-state-123',
      });

      (secureStorage.get as jest.Mock).mockResolvedValue(
        JSON.stringify({
          state: 'test-state-123',
          pkce: mockPkce,
          redirectUri: 'test-app://callback/oauth',
          timestamp: Date.now(),
        })
      );

      (authApi.oauthLogin as jest.Mock).mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.login();
      });

      expect(result.current.error).toBe('Server error');
      expect(result.current.isLoading).toBe(false);
    });

    it('handles expired pending auth state', async () => {
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: 'test-app://callback/oauth?code=auth-code&state=test-state-123',
      });

      // Mock expired state (6 minutes old)
      (secureStorage.get as jest.Mock).mockResolvedValue(
        JSON.stringify({
          state: 'test-state-123',
          pkce: mockPkce,
          redirectUri: 'test-app://callback/oauth',
          timestamp: Date.now() - 6 * 60 * 1000,
        })
      );

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.login();
      });

      expect(result.current.error).toBe(
        'No pending authentication found. Please try logging in again.'
      );
    });

    it('prevents concurrent login attempts when already loading', async () => {
      let resolveFirst: (value: { type: string }) => void;
      const firstPromise = new Promise<{ type: string }>((resolve) => {
        resolveFirst = resolve;
      });

      (WebBrowser.openAuthSessionAsync as jest.Mock).mockReturnValueOnce(firstPromise);

      const { result } = renderHook(() => useVismaConnect());

      // Start first login
      let loginPromise: Promise<void>;
      await act(async () => {
        loginPromise = result.current.login();
      });

      // Verify loading state is true
      expect(result.current.isLoading).toBe(true);

      // Try to start second login while first is in progress
      await act(async () => {
        await result.current.login(); // Should return immediately
      });

      // Only one browser session should be opened
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledTimes(1);

      // Complete the first login
      await act(async () => {
        resolveFirst!({ type: 'cancel' });
        await loginPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('logout flow', () => {
    it('completes successful logout', async () => {
      (authApi.logout as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.logout();
      });

      // Verify backend logout was called
      expect(authApi.logout).toHaveBeenCalled();

      // Verify tokens were cleared
      expect(tokenManager.clearTokens).toHaveBeenCalled();

      // Verify auth store was cleared
      expect(mockLogout).toHaveBeenCalled();

      // Verify user services were cleaned up
      expect(onUserLogout).toHaveBeenCalled();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('clears local state even if backend logout fails', async () => {
      (authApi.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.logout();
      });

      // Local state should still be cleared
      expect(tokenManager.clearTokens).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(onUserLogout).toHaveBeenCalled();

      // No error should be shown for backend logout failure
      expect(result.current.error).toBeNull();
    });

    it('handles logout error', async () => {
      (authApi.logout as jest.Mock).mockResolvedValue(undefined);
      (tokenManager.clearTokens as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe('Storage error');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('clears the error state', async () => {
      // Trigger an error first
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.login();
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('deep link handling', () => {
    it('handles initial URL with OAuth callback', async () => {
      const callbackUrl = 'test-app://callback/oauth?code=auth-code&state=test-state';

      (Linking.getInitialURL as jest.Mock).mockResolvedValue(callbackUrl);

      (secureStorage.get as jest.Mock).mockResolvedValue(
        JSON.stringify({
          state: 'test-state',
          pkce: {
            codeVerifier: 'verifier',
            codeChallenge: 'challenge',
            codeChallengeMethod: 'S256',
          },
          redirectUri: 'test-app://callback/oauth',
          timestamp: Date.now(),
        })
      );

      (vismaConnect.handleCallback as jest.Mock).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: Date.now() + 3600000,
        expiresIn: 3600,
      });

      (authApi.oauthLogin as jest.Mock).mockResolvedValue({
        accessToken: 'backend-token',
        refreshToken: 'backend-refresh',
        expiresIn: 3600,
        user: { id: '123', email: 'test@example.com', username: 'test' },
      });

      renderHook(() => useVismaConnect());

      await waitFor(() => {
        expect(vismaConnect.handleCallback).toHaveBeenCalledWith(
          callbackUrl,
          'test-state',
          'verifier',
          'test-app://callback/oauth'
        );
      });
    });

    it('registers URL event listener', () => {
      renderHook(() => useVismaConnect());

      expect(Linking.addEventListener).toHaveBeenCalledWith('url', expect.any(Function));
    });

    it('cleans up URL event listener on unmount', () => {
      const mockRemove = jest.fn();
      (Linking.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });

      const { unmount } = renderHook(() => useVismaConnect());

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('configuration validation', () => {
    it('throws error when client ID is not configured', async () => {
      // Get reference to the mocked authConfig
      const authConfigMock = jest.requireMock('@core/auth.config');

      // Save original value
      const originalClientId = authConfigMock.authConfig.clientId;

      // Set to unconfigured placeholder
      authConfigMock.authConfig.clientId = 'YOUR_VISMA_CLIENT_ID';

      const { result } = renderHook(() => useVismaConnect());

      await act(async () => {
        await result.current.login();
      });

      expect(result.current.error).toBe(
        'Visma Connect client ID not configured. See docs/VISMA_CONNECT.md'
      );

      // Restore original value
      authConfigMock.authConfig.clientId = originalClientId;
    });
  });
});

describe('parseVismaUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses valid ID token', () => {
    (decodeIdToken as jest.Mock).mockReturnValue({
      sub: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    const result = parseVismaUser('valid-id-token');

    expect(result).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      displayName: 'Test User',
    });
  });

  it('returns null for invalid token', () => {
    (decodeIdToken as jest.Mock).mockReturnValue(null);

    const result = parseVismaUser('invalid-token');

    expect(result).toBeNull();
  });
});
