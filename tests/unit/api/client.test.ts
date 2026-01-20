import { ApiError } from '@api/client';

describe('ApiError', () => {
  it('creates error with code, message, and status', () => {
    const error = new ApiError('NOT_FOUND', 'Resource not found', 404);

    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.status).toBe(404);
    expect(error.name).toBe('ApiError');
  });

  it('includes optional details', () => {
    const details = { field: ['Invalid value'] };
    const error = new ApiError('VALIDATION_ERROR', 'Validation failed', 400, details);

    expect(error.details).toEqual(details);
  });

  describe('isAuthError', () => {
    it('returns true for 401 status', () => {
      const error = new ApiError('UNAUTHORIZED', 'Unauthorized', 401);
      expect(error.isAuthError()).toBe(true);
    });

    it('returns true for UNAUTHORIZED code', () => {
      const error = new ApiError('UNAUTHORIZED', 'Session expired', 403);
      expect(error.isAuthError()).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = new ApiError('NOT_FOUND', 'Not found', 404);
      expect(error.isAuthError()).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('returns true for status 0', () => {
      const error = new ApiError('NETWORK_ERROR', 'Network failed', 0);
      expect(error.isNetworkError()).toBe(true);
    });

    it('returns true for NETWORK_ERROR code', () => {
      const error = new ApiError('NETWORK_ERROR', 'Connection refused', 503);
      expect(error.isNetworkError()).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = new ApiError('SERVER_ERROR', 'Server error', 500);
      expect(error.isNetworkError()).toBe(false);
    });
  });

  describe('isTimeoutError', () => {
    it('returns true for 408 status', () => {
      const error = new ApiError('TIMEOUT', 'Request timeout', 408);
      expect(error.isTimeoutError()).toBe(true);
    });

    it('returns true for TIMEOUT code', () => {
      const error = new ApiError('TIMEOUT', 'Timed out', 0);
      expect(error.isTimeoutError()).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = new ApiError('SERVER_ERROR', 'Server error', 500);
      expect(error.isTimeoutError()).toBe(false);
    });
  });

  it('is instance of Error', () => {
    const error = new ApiError('TEST', 'Test error', 500);
    expect(error).toBeInstanceOf(Error);
  });
});
