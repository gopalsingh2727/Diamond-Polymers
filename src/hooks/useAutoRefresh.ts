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
  options: UseAutoRefreshOptions = {}
): UseAutoRefreshReturn => {
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
      console.log('🔄 Auto-refresh: Fetching fresh data...');

      // Execute the refresh function
      await refreshFunction();

      // Execute optional callback
      if (onRefresh) {
        await onRefresh();
      }

      setLastRefresh(new Date());
      console.log('✅ Auto-refresh: Complete');
    } catch (error) {
      console.error('❌ Auto-refresh: Failed', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFunction, onRefresh, isRefreshing]);

  const triggerRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    executeRefresh();
  }, [executeRefresh]);

  const stopRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsEnabled(false);
      console.log('⏸️ Auto-refresh: Stopped');
    }
  }, []);

  const startRefresh = useCallback(() => {
    setIsEnabled(true);
    console.log('▶️ Auto-refresh: Started');
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

    console.log(`⏰ Auto-refresh: Enabled (every ${interval / 1000} seconds)`);

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
