import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  message: string;
}

/**
 * Hook to detect network connectivity
 * Shows appropriate messages when network is down
 */
export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    wasOffline: false,
    message: ''
  });

  useEffect(() => {
    const handleOnline = () => {

      setStatus({
        isOnline: true,
        wasOffline: status.wasOffline,
        message: 'Connection restored!'
      });

      // Clear the "restored" message after 3 seconds
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, message: '', wasOffline: false }));
      }, 3000);
    };

    const handleOffline = () => {

      setStatus({
        isOnline: false,
        wasOffline: true,
        message: 'Network not working. Please check your connection.'
      });
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status.wasOffline]);

  return status;
};