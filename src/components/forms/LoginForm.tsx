/**
 * Login Form Component
 *
 * Reusable login form with validation.
 *
 * Usage:
 *   <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
 */

import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@core/theme';
import { isValidEmail, isEmpty } from '@utils/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Text } from '../ui/Text';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = (): boolean => {
    let isValid = true;

    if (isEmpty(email)) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (isEmpty(password)) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(email, password);
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text variant="body" color="error" center>
            {error}
          </Text>
        </View>
      )}

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={emailError}
        editable={!isLoading}
      />

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        autoComplete="password"
        error={passwordError}
        editable={!isLoading}
      />

      <Button onPress={handleSubmit} loading={isLoading} fullWidth style={styles.button}>
        Sign In
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
});
