/**
 * useNetworkState Hook
 *
 * Tracks online/offline status.
 * Updates the app store when connectivity changes.
 *
 * Usage:
 *   const { isOnline, isConnected } = useNetworkState();
 *   if (!isOnline) { showOfflineBanner(); }
 *
 * Note: This is a simplified implementation.
 * For production, consider using @react-native-community/netinfo:
 *   npm install @react-native-community/netinfo
 *
 * LLM Instructions:
 * - Install netinfo for more accurate network detection
 * - This stub works for basic online/offline detection via browser APIs
 */

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAppStore } from '@store/app.store';

export function useNetworkState() {
  const { isOnline, setOnline } = useAppStore();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Web implementation using navigator.onLine
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => {
        setIsConnected(true);
        setOnline(true);
      };

      const handleOffline = () => {
        setIsConnected(false);
        setOnline(false);
      };

      // Set initial state
      setIsConnected(navigator.onLine);
      setOnline(navigator.onLine);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // For native platforms, install @react-native-community/netinfo
    // and implement proper network state detection here.
    // Example (after installing netinfo):
    //
    // import NetInfo from '@react-native-community/netinfo';
    //
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   setIsConnected(state.isConnected ?? true);
    //   setOnline(state.isInternetReachable ?? true);
    // });
    //
    // return () => unsubscribe();

    return undefined;
  }, [setOnline]);

  return {
    isOnline,
    isConnected,
  };
}
