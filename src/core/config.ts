import Constants from 'expo-constants';

/**
 * Application Configuration
 *
 * Centralized configuration management using Expo Constants.
 * Environment variables are loaded from app.json extra field or .env files.
 *
 * Usage:
 *   import { config } from '@core/config';
 *   const url = config.api.baseUrl;
 */

interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  app: {
    name: string;
    version: string;
    env: 'development' | 'staging' | 'production';
  };
  features: {
    enableAnalytics: boolean;
    enableCrashReporting: boolean;
  };
}

const getEnvVar = (key: string, defaultValue: string): string => {
  const extra = Constants.expoConfig?.extra;
  return extra?.[key] ?? process.env[key] ?? defaultValue;
};

const getBoolEnvVar = (key: string, defaultValue: boolean): boolean => {
  const value = getEnvVar(key, String(defaultValue));
  return value === 'true' || value === '1';
};

export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar('API_BASE_URL', 'https://api.example.com'),
    timeout: parseInt(getEnvVar('API_TIMEOUT', '30000'), 10),
  },
  app: {
    name: Constants.expoConfig?.name ?? 'template-mobile-app',
    version: Constants.expoConfig?.version ?? '1.0.0',
    env: getEnvVar('NODE_ENV', 'development') as AppConfig['app']['env'],
  },
  features: {
    enableAnalytics: getBoolEnvVar('ENABLE_ANALYTICS', false),
    enableCrashReporting: getBoolEnvVar('ENABLE_CRASH_REPORTING', false),
  },
};

export const isDev = config.app.env === 'development';
export const isProd = config.app.env === 'production';
