import {
  formatDate,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  truncate,
  capitalize,
  formatFileSize,
} from '@utils/formatting';

describe('formatDate', () => {
  it('formats a date string with default options', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/Jan 15, 2024/);
  });

  it('formats a Date object', () => {
    const date = new Date('2024-06-20');
    const result = formatDate(date);
    expect(result).toMatch(/Jun 20, 2024/);
  });

  it('accepts custom format options', () => {
    const result = formatDate('2024-01-15', { year: 'numeric', month: 'long' });
    expect(result).toMatch(/January 2024/);
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for recent times', () => {
    const now = new Date();
    const result = formatRelativeTime(now);
    expect(result).toBe('just now');
  });

  it('returns minutes ago for times within an hour', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const result = formatRelativeTime(date);
    expect(result).toBe('5 minutes ago');
  });

  it('returns singular minute for 1 minute ago', () => {
    const date = new Date(Date.now() - 60 * 1000); // 1 minute ago
    const result = formatRelativeTime(date);
    expect(result).toBe('1 minute ago');
  });

  it('returns hours ago for times within a day', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    const result = formatRelativeTime(date);
    expect(result).toBe('3 hours ago');
  });

  it('returns days ago for times within a week', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const result = formatRelativeTime(date);
    expect(result).toBe('2 days ago');
  });
});

describe('formatCurrency', () => {
  it('formats USD currency by default', () => {
    const result = formatCurrency(1234.56);
    expect(result).toMatch(/\$1,234\.56/);
  });

  it('formats other currencies', () => {
    const result = formatCurrency(1000, 'EUR', 'de-DE');
    expect(result).toMatch(/1.*€/);
  });
});

describe('formatNumber', () => {
  it('adds thousands separators', () => {
    const result = formatNumber(1234567);
    expect(result).toBe('1,234,567');
  });
});

describe('truncate', () => {
  it('truncates long text with ellipsis', () => {
    const result = truncate('Hello World', 8);
    expect(result).toBe('Hello...');
  });

  it('returns original text if shorter than max length', () => {
    const result = truncate('Hi', 10);
    expect(result).toBe('Hi');
  });

  it('returns original text if equal to max length', () => {
    const result = truncate('Hello', 5);
    expect(result).toBe('Hello');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('lowercases rest of string', () => {
    expect(capitalize('hELLO')).toBe('Hello');
  });

  it('handles single character', () => {
    expect(capitalize('h')).toBe('H');
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
  });
});
