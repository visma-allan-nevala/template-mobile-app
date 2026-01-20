import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Dynamic Expo Configuration
 *
 * This file replaces app.json for dynamic configuration.
 * Environment variables are injected at build time via EAS Build.
 *
 * Usage:
 *   - Development: npx expo start
 *   - Build: eas build --profile <profile>
 *
 * Environment Variables:
 *   - APP_ENV: 'development' | 'staging' | 'production'
 *   - API_BASE_URL: Backend API URL
 *   - VISMA_CONNECT_CLIENT_ID: OAuth client ID
 *   - SENTRY_DSN: Sentry error tracking DSN
 */

const IS_DEV = process.env.APP_ENV === 'development';
const IS_STAGING = process.env.APP_ENV === 'staging';
const IS_PROD = process.env.APP_ENV === 'production';

// App identifiers per environment
const APP_IDENTIFIERS = {
  development: {
    ios: 'com.company.templatemobileapp.dev',
    android: 'com.company.templatemobileapp.dev',
  },
  staging: {
    ios: 'com.company.templatemobileapp.staging',
    android: 'com.company.templatemobileapp.staging',
  },
  production: {
    ios: 'com.company.templatemobileapp',
    android: 'com.company.templatemobileapp',
  },
};

// Get current environment
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (IS_PROD) return 'production';
  if (IS_STAGING) return 'staging';
  return 'development';
};

const environment = getEnvironment();
const identifiers = APP_IDENTIFIERS[environment];

// App name suffix for non-production builds
const getAppName = (): string => {
  const baseName = 'Template App';
  if (IS_DEV) return `${baseName} (Dev)`;
  if (IS_STAGING) return `${baseName} (Staging)`;
  return baseName;
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'template-mobile-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: process.env.APP_SCHEME || 'template-mobile-app',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: identifiers.ios,
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      // Deep linking for OAuth callback
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [process.env.APP_SCHEME || 'template-mobile-app'],
        },
      ],
    },
  },

  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: identifiers.android,
    // Deep linking for OAuth callback
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: process.env.APP_SCHEME || 'template-mobile-app',
            host: 'callback',
            pathPrefix: '/oauth',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },

  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#ffffff',
        sounds: [],
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  // Runtime configuration available via Constants.expoConfig.extra
  extra: {
    // Environment
    APP_ENV: environment,

    // API Configuration
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.example.com',
    API_TIMEOUT: process.env.API_TIMEOUT || '30000',

    // Feature Flags
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS || 'false',
    ENABLE_CRASH_REPORTING: process.env.ENABLE_CRASH_REPORTING || 'false',

    // Auth Configuration
    VISMA_CONNECT_CLIENT_ID: process.env.VISMA_CONNECT_CLIENT_ID || '',
    APP_SCHEME: process.env.APP_SCHEME || 'template-mobile-app',

    // Third-party Services
    SENTRY_DSN: process.env.SENTRY_DSN || '',

    // EAS Configuration
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'your-project-id',
    },
  },

  // Updates configuration (for OTA updates)
  updates: {
    enabled: IS_PROD || IS_STAGING,
    fallbackToCacheTimeout: 0,
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID || 'your-project-id'}`,
  },

  runtimeVersion: {
    policy: 'sdkVersion',
  },

  owner: process.env.EXPO_OWNER || 'your-expo-username',
});
