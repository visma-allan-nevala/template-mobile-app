/**
 * Error Boundary Component
 *
 * Catches React errors and displays fallback UI.
 * In production, integrate with crash reporting (Sentry, Bugsnag).
 *
 * Usage:
 *   // Wrap in app/_layout.tsx:
 *   <ErrorBoundary>
 *     <Slot />
 *   </ErrorBoundary>
 *
 * LLM Instructions:
 * - Wrap root layout with this component
 * - Add crash reporting SDK calls in componentDidCatch
 * - Example Sentry integration:
 *   componentDidCatch(error, errorInfo) {
 *     Sentry.captureException(error, { extra: errorInfo });
 *   }
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@core/theme';
import { config, isDev } from '@core/config';
import { Button } from './ui/Button';
import { Text } from './ui/Text';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error in development
    if (isDev) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // TODO: Send to crash reporting service in production
    // Example with Sentry:
    // if (config.features.enableCrashReporting) {
    //   Sentry.captureException(error, {
    //     extra: { componentStack: errorInfo.componentStack },
    //   });
    // }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text variant="title" center style={styles.title}>
              Something went wrong
            </Text>
            <Text variant="body" color="secondary" center style={styles.message}>
              We apologize for the inconvenience. Please try again.
            </Text>

            {isDev && this.state.error && (
              <ScrollView style={styles.errorBox}>
                <Text variant="caption" style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text variant="caption" style={styles.errorText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <Button onPress={this.handleReset} style={styles.button}>
              Try Again
            </Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.md,
  },
  message: {
    marginBottom: spacing.lg,
  },
  errorBox: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: colors.gray[100],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontFamily: 'monospace',
    color: colors.error,
  },
  button: {
    minWidth: 150,
  },
});
