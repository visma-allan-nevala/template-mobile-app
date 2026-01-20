/**
 * Validation Utilities
 *
 * Helper functions for validating user input.
 *
 * Usage:
 *   import { isValidEmail, validatePassword } from '@utils/validation';
 *   if (!isValidEmail(email)) { ... }
 *   const errors = validatePassword(password);
 */

import { VALIDATION } from '@core/constants';

// Validate email format
export function isValidEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email);
}

// Validate password and return array of error messages
export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
}

// Validate username
export function validateUsername(username: string): string[] {
  const errors: string[] = [];

  if (username.length < VALIDATION.USERNAME_MIN_LENGTH) {
    errors.push(`Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`);
  }

  if (username.length > VALIDATION.USERNAME_MAX_LENGTH) {
    errors.push(`Username must be at most ${VALIDATION.USERNAME_MAX_LENGTH} characters`);
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  return errors;
}

// Check if a string is empty or only whitespace
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

// Check if value is within a numeric range
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// Validate required fields and return missing field names
export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): string[] {
  return requiredFields.filter((field) => {
    const value = data[field];
    if (typeof value === 'string') {
      return isEmpty(value);
    }
    return value === null || value === undefined;
  }) as string[];
}
