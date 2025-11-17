import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { WifiIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Network Status Banner Component
 * Shows network connectivity status at the top of the application
 * - Red banner when offline: "Network not working. Please check your connection."
 * - Green banner when restored: "Connection restored!"
 * - Hidden when online with no recent offline events
 */
export const NetworkStatusBanner: React.FC = () => {
  const { isOnline, wasOffline, message } = useNetworkStatus();

  // Don't show banner if online and never was offline
  if (isOnline && !wasOffline && !message) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg animate-slide-in-top">
          <div className="flex items-center justify-center gap-3 max-w-7xl mx-auto">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 animate-pulse" />
            <p className="text-sm font-medium">
              {message || 'Network not working. Please check your connection.'}
            </p>
            <WifiIcon className="h-5 w-5 flex-shrink-0 opacity-50" />
          </div>
        </div>
      )}

      {/* Connection Restored Banner */}
      {isOnline && wasOffline && message && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-3 shadow-lg animate-slide-in-top">
          <div className="flex items-center justify-center gap-3 max-w-7xl mx-auto">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 animate-bounce" />
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkStatusBanner;
