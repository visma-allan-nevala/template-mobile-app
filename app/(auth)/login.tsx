/**
 * Login Screen
 *
 * User authentication screen with email/password login.
 *
 * LLM Instructions:
 * - Uses LoginForm component for the form UI
 * - Uses useAuth hook for authentication logic
 * - Redirects to (tabs) on successful login
 */

import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors, spacing } from '@/core/theme';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/layout/Container';
import { Text } from '@/components/ui/Text';
import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    clearError();
    try {
      await login({ email, password });
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
              Welcome Back
            </Text>
            <Text variant="body" color="secondary" center style={styles.subtitle}>
              Sign in to continue
            </Text>
          </View>

          <View style={styles.form}>
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
          </View>

          <View style={styles.footer}>
            <Text variant="body" color="secondary" center>
              Don&apos;t have an account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Text variant="body" style={styles.link}>
                Sign Up
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
