import { isTokenExpired, decodeIdToken, VismaConnectError } from '@services/auth/visma-connect';

describe('isTokenExpired', () => {
  it('returns true when token is expired', () => {
    const expiredTimestamp = Date.now() - 1000; // 1 second ago
    expect(isTokenExpired(expiredTimestamp)).toBe(true);
  });

  it('returns false when token is not expired', () => {
    const futureTimestamp = Date.now() + 120000; // 2 minutes from now (beyond default 60s buffer)
    expect(isTokenExpired(futureTimestamp)).toBe(false);
  });

  it('returns true when within buffer period', () => {
    const almostExpired = Date.now() + 30000; // 30 seconds from now
    expect(isTokenExpired(almostExpired, 60)).toBe(true); // 60 second buffer
  });

  it('returns false when outside buffer period', () => {
    const almostExpired = Date.now() + 90000; // 90 seconds from now
    expect(isTokenExpired(almostExpired, 60)).toBe(false); // 60 second buffer
  });

  it('handles zero buffer', () => {
    const exactNow = Date.now() + 100;
    expect(isTokenExpired(exactNow, 0)).toBe(false);
  });
});

describe('decodeIdToken', () => {
  it('returns null for invalid JWT format', () => {
    expect(decodeIdToken('invalid')).toBeNull();
    expect(decodeIdToken('only.two')).toBeNull();
    expect(decodeIdToken('')).toBeNull();
  });

  it('returns null for malformed payload', () => {
    // Valid structure but invalid base64 payload
    expect(decodeIdToken('header.!!!invalid!!!.signature')).toBeNull();
  });

  it('decodes valid JWT payload', () => {
    // Create a simple test JWT (header.payload.signature)
    const payload = { sub: 'user123', email: 'test@example.com' };
    const encodedPayload = btoa(JSON.stringify(payload));
    const testJwt = `header.${encodedPayload}.signature`;

    const result = decodeIdToken(testJwt);
    expect(result).toEqual(payload);
  });

  it('handles base64url encoded payload', () => {
    const payload = { sub: 'user+special/chars' };
    // Base64url encoding (- instead of +, _ instead of /)
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_');
    const testJwt = `header.${encodedPayload}.signature`;

    const result = decodeIdToken(testJwt);
    expect(result).toEqual(payload);
  });
});

describe('VismaConnectError', () => {
  it('creates error with code and description', () => {
    const error = new VismaConnectError('invalid_grant', 'Token expired');

    expect(error.error).toBe('invalid_grant');
    expect(error.errorDescription).toBe('Token expired');
    expect(error.message).toBe('Token expired');
    expect(error.name).toBe('VismaConnectError');
  });

  it('uses error code as message when no description', () => {
    const error = new VismaConnectError('invalid_grant');

    expect(error.message).toBe('invalid_grant');
    expect(error.errorDescription).toBeUndefined();
  });

  it('is instance of Error', () => {
    const error = new VismaConnectError('test_error');
    expect(error).toBeInstanceOf(Error);
  });
});
