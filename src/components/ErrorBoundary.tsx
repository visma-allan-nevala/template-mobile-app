/**
 * Error Boundary Component
 *
 * Catches React errors and displays fallback UI.
 * Integrates with crash reporting for production error tracking.
 *
 * Usage:
 *   // Wrap in app/_layout.tsx:
 *   <ErrorBoundary>
 *     <Slot />
 *   </ErrorBoundary>
 *
 *   // With custom fallback:
 *   <ErrorBoundary fallback={<CustomErrorUI />}>
 *     <App />
 *   </ErrorBoundary>
 *
 * LLM Instructions:
 * - Wrap root layout with this component
 * - Crash reporting is automatically integrated when enabled
 * - Use onError prop for custom error handling
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@core/theme';
import { config, isDev } from '@core/config';
import { crashReporting } from '@services/analytics';
import { Button } from './ui/Button';
import { Text } from './ui/Text';

interface Props {
  children: ReactNode;
  /** Custom fallback UI when error occurs */
  fallback?: ReactNode;
  /** Custom error handler */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details (defaults to isDev) */
  showDetails?: boolean;
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

    // Send to crash reporting service if enabled
    if (config.features.enableCrashReporting) {
      crashReporting.captureComponentError(error, errorInfo.componentStack || '');

      // Add breadcrumb for context
      crashReporting.addBreadcrumb({
        message: 'React ErrorBoundary caught error',
        category: 'error',
        level: 'error',
        data: {
          errorName: error.name,
          errorMessage: error.message,
        },
      });
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Track recovery attempt
    if (config.features.enableCrashReporting) {
      crashReporting.addBreadcrumb({
        message: 'User attempted error recovery',
        category: 'ui',
        level: 'info',
      });
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = isDev } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
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

            {showDetails && error && (
              <ScrollView style={styles.errorBox}>
                <Text variant="caption" style={styles.errorTitle}>
                  Error: {error.name}
                </Text>
                <Text variant="caption" style={styles.errorText}>
                  {error.message}
                </Text>
                {errorInfo && (
                  <>
                    <Text variant="caption" style={[styles.errorTitle, styles.stackTitle] as never}>
                      Component Stack:
                    </Text>
                    <Text variant="caption" style={styles.errorText}>
                      {errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </ScrollView>
            )}

            <Button onPress={this.handleReset} style={styles.button}>
              Try Again
            </Button>

            {!isDev && config.features.enableCrashReporting && (
              <Text variant="caption" color="secondary" center style={styles.reportText}>
                This error has been automatically reported.
              </Text>
            )}
          </View>
        </View>
      );
    }

    return children;
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
  errorTitle: {
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.xs,
  },
  stackTitle: {
    marginTop: spacing.md,
  },
  errorText: {
    fontFamily: 'monospace',
    color: colors.gray[700],
    fontSize: 12,
  },
  button: {
    minWidth: 150,
  },
  reportText: {
    marginTop: spacing.md,
  },
});
