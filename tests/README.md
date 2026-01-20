# Testing Guide

This document describes the testing setup and conventions for the template-mobile-app.

## Test Structure

```
tests/
├── setup.ts           # Jest setup with mocks
├── unit/              # Unit tests (fast, isolated)
│   ├── components/    # Component tests
│   ├── services/      # Service tests
│   ├── hooks/         # Hook tests
│   └── utils/         # Utility function tests
└── integration/       # Integration tests (feature tests)
```

## Running Tests

```bash
# Run all tests
make test
# or
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
make test-cov
# or
npm run test:coverage
```

## Writing Tests

### Unit Tests

Unit tests should be fast and isolated. Test individual functions, components, or hooks.

```typescript
// tests/unit/utils/formatting.test.ts
import { formatDate, truncate } from '@utils/formatting';

describe('formatDate', () => {
  it('formats a date string correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('Jan 15, 2024');
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
});
```

### Component Tests

Use React Testing Library for component tests.

```typescript
// tests/unit/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@components/ui/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Button>Click Me</Button>);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press</Button>);
    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId, queryByText } = render(
      <Button loading testID="loading-button">
        Submit
      </Button>
    );
    expect(queryByText('Submit')).toBeNull();
  });
});
```

### Hook Tests

Use `@testing-library/react-native` renderHook for hooks.

```typescript
// tests/unit/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '@hooks/useAuth';

describe('useAuth', () => {
  it('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

### Integration Tests

Integration tests verify features work together.

```typescript
// tests/integration/auth.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/(auth)/login';

// Mock the auth service
jest.mock('@services/auth.service', () => ({
  authService: {
    login: jest.fn(),
  },
}));

describe('Login Flow', () => {
  it('shows error for invalid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrong');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

## Mocking

Common mocks are configured in `tests/setup.ts`:

- `expo-secure-store` - Secure storage mock
- `@react-native-async-storage/async-storage` - Async storage mock
- `expo-router` - Navigation mock
- `expo-constants` - Constants mock

### Adding Custom Mocks

For module-specific mocks, create them in the test file or in a `__mocks__` folder:

```typescript
// tests/unit/services/auth.test.ts
jest.mock('@api/endpoints/auth', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));
```

## Coverage

Coverage reports are generated in the `coverage/` directory. The project has minimum coverage thresholds:

- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

View the HTML coverage report:
```bash
open coverage/lcov-report/index.html
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how it does it.

2. **Use meaningful assertions** - Be specific about what you're testing.

3. **Keep tests isolated** - Each test should be independent of others.

4. **Mock external dependencies** - APIs, storage, and native modules should be mocked.

5. **Write descriptive test names** - Test names should describe the expected behavior.

6. **Avoid testing implementation details** - Don't test internal state or private methods.

## Debugging Tests

```bash
# Run a specific test file
npm test -- tests/unit/utils/formatting.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="formatDate"

# Debug with verbose output
npm test -- --verbose
```
