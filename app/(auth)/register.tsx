/**
 * Register Screen
 *
 * User registration screen with form validation.
 *
 * LLM Instructions:
 * - Uses RegisterForm component for the form UI
 * - Uses useAuth hook for registration logic
 * - Redirects to (tabs) on successful registration
 */

import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors, spacing } from '@/core/theme';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/layout/Container';
import { Text } from '@/components/ui/Text';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  const handleRegister = async (data: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
  }) => {
    clearError();
    try {
      await register(data);
      router.replace('/(tabs)');
    } catch {
      // Error is handled by the auth store
    }
  };

  return (
    <Container safeArea>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text variant="title" center>
              Create Account
            </Text>
            <Text variant="body" color="secondary" center style={styles.subtitle}>
              Sign up to get started
            </Text>
          </View>

          <View style={styles.form}>
            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />
          </View>

          <View style={styles.footer}>
            <Text variant="body" color="secondary" center>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Text variant="body" style={styles.link}>
                Sign In
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  form: {
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
