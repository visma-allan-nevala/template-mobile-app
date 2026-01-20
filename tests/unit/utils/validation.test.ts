import {
  isValidEmail,
  validatePassword,
  validateUsername,
  isEmpty,
  isInRange,
  validateRequired,
} from '@utils/validation';

describe('isValidEmail', () => {
  it('returns true for valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  it('returns false for invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user @domain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('returns empty array for valid password', () => {
    const errors = validatePassword('ValidPass1');
    expect(errors).toHaveLength(0);
  });

  it('requires minimum length', () => {
    const errors = validatePassword('Ab1');
    expect(errors).toContain('Password must be at least 8 characters');
  });

  it('requires lowercase letter', () => {
    const errors = validatePassword('UPPERCASE1');
    expect(errors).toContain('Password must contain at least one lowercase letter');
  });

  it('requires uppercase letter', () => {
    const errors = validatePassword('lowercase1');
    expect(errors).toContain('Password must contain at least one uppercase letter');
  });

  it('requires a number', () => {
    const errors = validatePassword('NoNumbers');
    expect(errors).toContain('Password must contain at least one number');
  });

  it('returns multiple errors for multiple violations', () => {
    const errors = validatePassword('abc');
    expect(errors.length).toBeGreaterThan(1);
  });
});

describe('validateUsername', () => {
  it('returns empty array for valid username', () => {
    const errors = validateUsername('valid_user123');
    expect(errors).toHaveLength(0);
  });

  it('requires minimum length', () => {
    const errors = validateUsername('ab');
    expect(errors).toContain('Username must be at least 3 characters');
  });

  it('enforces maximum length', () => {
    const longUsername = 'a'.repeat(31);
    const errors = validateUsername(longUsername);
    expect(errors).toContain('Username must be at most 30 characters');
  });

  it('only allows letters, numbers, and underscores', () => {
    expect(validateUsername('invalid-user')).toContain(
      'Username can only contain letters, numbers, and underscores'
    );
    expect(validateUsername('invalid user')).toContain(
      'Username can only contain letters, numbers, and underscores'
    );
    expect(validateUsername('invalid@user')).toContain(
      'Username can only contain letters, numbers, and underscores'
    );
  });
});

describe('isEmpty', () => {
  it('returns true for null and undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isEmpty('')).toBe(true);
  });

  it('returns true for whitespace-only string', () => {
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty('\t\n')).toBe(true);
  });

  it('returns false for non-empty strings', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty('  hello  ')).toBe(false);
  });
});

describe('isInRange', () => {
  it('returns true when value is within range', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
    expect(isInRange(1, 1, 10)).toBe(true);
    expect(isInRange(10, 1, 10)).toBe(true);
  });

  it('returns false when value is outside range', () => {
    expect(isInRange(0, 1, 10)).toBe(false);
    expect(isInRange(11, 1, 10)).toBe(false);
  });
});

describe('validateRequired', () => {
  it('returns empty array when all required fields are present', () => {
    const data = { name: 'John', email: 'john@example.com' };
    const errors = validateRequired(data, ['name', 'email']);
    expect(errors).toHaveLength(0);
  });

  it('returns missing field names', () => {
    const data = { name: 'John', email: '' };
    const errors = validateRequired(data, ['name', 'email', 'phone']);
    expect(errors).toContain('email');
    expect(errors).toContain('phone');
    expect(errors).not.toContain('name');
  });

  it('treats null and undefined as missing', () => {
    const data = { name: 'John', email: null, phone: undefined };
    const errors = validateRequired(data, ['name', 'email', 'phone']);
    expect(errors).toContain('email');
    expect(errors).toContain('phone');
  });
});
