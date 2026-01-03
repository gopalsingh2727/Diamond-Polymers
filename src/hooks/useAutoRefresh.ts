/**
 * Auto-Refresh Hook for Electron Apps
 *
 * Automatically refreshes data every X seconds to keep all Electron instances in sync.
 * This is necessary because Electron apps don't share cache between instances.
 *
 * Usage:
 * const { isRefreshing, lastRefresh, triggerRefresh } = useAutoRefresh(
 *   () => dispatch(getMachinesIfNeeded()),
 *   60000 // Refresh every 60 seconds
 * );
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // Refresh interval in milliseconds (default: 60000 = 1 minute)
  enabled?: boolean; // Enable/disable auto-refresh (default: true)
  onRefresh?: () => void | Promise<void>; // Callback to execute on refresh
}

interface UseAutoRefreshReturn {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  triggerRefresh: () => void;
  stopRefresh: () => void;
  startRefresh: () => void;
}

export const useAutoRefresh = (
refreshFunction: () => void | Promise<void>,
options: UseAutoRefreshOptions = {})
: UseAutoRefreshReturn => {
  const {
    interval = 60000, // Default: 1 minute
    enabled = true,
    onRefresh
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const executeRefresh = useCallback(async () => {
    if (isRefreshing) return; // Prevent concurrent refreshes

    try {
      setIsRefreshing(true);


      // Execute the refresh function
      await refreshFunction();

      // Execute optional callback
      if (onRefresh) {
        await onRefresh();
      }

      setLastRefresh(new Date());

    } catch (error) {

    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFunction, onRefresh, isRefreshing]);

  const triggerRefresh = useCallback(() => {

    executeRefresh();
  }, [executeRefresh]);

  const stopRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsEnabled(false);

    }
  }, []);

  const startRefresh = useCallback(() => {
    setIsEnabled(true);

  }, []);

  useEffect(() => {
    if (!isEnabled) {
      stopRefresh();
      return;
    }

    // Initial refresh
    executeRefresh();

    // Set up interval
    intervalRef.current = setInterval(() => {
      executeRefresh();
    }, interval);



    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isEnabled, interval, executeRefresh, stopRefresh]);

  return {
    isRefreshing,
    lastRefresh,
    triggerRefresh,
    stopRefresh,
    startRefresh
  };
};