/**
 * Register Form Component
 *
 * Reusable registration form with validation.
 *
 * Usage:
 *   <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />
 */

import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@core/theme';
import { isValidEmail, validatePassword, validateUsername, isEmpty } from '@utils/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Text } from '../ui/Text';

interface RegisterFormData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function RegisterForm({ onSubmit, isLoading = false, error }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const validate = (): boolean => {
    let isValid = true;

    // Email validation
    if (isEmpty(email)) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    const passwordErrors = validatePassword(password);
    if (isEmpty(password)) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (passwordErrors.length > 0) {
      setPasswordError(passwordErrors[0]);
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Username validation
    const usernameErrors = validateUsername(username);
    if (isEmpty(username)) {
      setUsernameError('Username is required');
      isValid = false;
    } else if (usernameErrors.length > 0) {
      setUsernameError(usernameErrors[0]);
      isValid = false;
    } else {
      setUsernameError('');
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        email,
        password,
        username,
        displayName: displayName || undefined,
      });
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
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Choose a username"
        autoCapitalize="none"
        autoComplete="username"
        error={usernameError}
        editable={!isLoading}
      />

      <Input
        label="Display Name (Optional)"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your display name"
        autoComplete="name"
        editable={!isLoading}
      />

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Create a password"
        secureTextEntry
        autoComplete="new-password"
        error={passwordError}
        helperText="At least 8 characters with uppercase, lowercase, and number"
        editable={!isLoading}
      />

      <Button onPress={handleSubmit} loading={isLoading} fullWidth style={styles.button}>
        Create Account
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
