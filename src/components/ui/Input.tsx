/**
 * Input Component
 *
 * Text input with label, error state, and helper text.
 *
 * Usage:
 *   <Input
 *     label="Email"
 *     value={email}
 *     onChangeText={setEmail}
 *     placeholder="Enter your email"
 *     keyboardType="email-address"
 *   />
 *   <Input
 *     label="Password"
 *     value={password}
 *     onChangeText={setPassword}
 *     secureTextEntry
 *     error="Password is required"
 *   />
 */

import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@core/theme';
import { Text } from './Text';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

export function Input({ label, error, helperText, disabled = false, ...inputProps }: InputProps) {
  const hasError = !!error;

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, hasError && styles.inputError, disabled && styles.inputDisabled]}
        placeholderTextColor={colors.gray[400]}
        editable={!disabled}
        {...inputProps}
      />
      {error && (
        <Text variant="caption" color="error" style={styles.helperText}>
          {error}
        </Text>
      )}
      {!error && helperText && (
        <Text variant="caption" color="secondary" style={styles.helperText}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    backgroundColor: colors.white,
    minHeight: 44,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    color: colors.gray[400],
  },
  helperText: {
    marginTop: spacing.xs,
  },
});
