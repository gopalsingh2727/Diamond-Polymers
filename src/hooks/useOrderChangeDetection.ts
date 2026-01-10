/**
 * useOrderChangeDetection Hook
 * Lightweight polling that checks for changes periodically
 * Better for mobile apps and battery life
 *
 * Usage:
 * const { hasChanges, changeCount, check } = useOrderChangeDetection(branchId, {
 *   interval: 10000, // Check every 10 seconds
 *   onChangeDetected: () => refetchOrders()
 * });
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { checkOrderChanges } from '../services/orderPollingService';

export interface UseOrderChangeDetectionOptions {
  enabled?: boolean;
  interval?: number; // Check interval in ms
  onChangeDetected?: (changeCount: number) => void;
  onError?: (error: Error) => void;
}

export interface UseOrderChangeDetectionReturn {
  hasChanges: boolean;
  changeCount: number;
  isChecking: boolean;
  error: Error | null;
  lastCheck: string | null;
  check: () => Promise<void>;
}

export function useOrderChangeDetection(
  branchId: string,
  options: UseOrderChangeDetectionOptions = {}
): UseOrderChangeDetectionReturn {
  const {
    enabled = true,
    interval = 10000, // Default: check every 10 seconds
    onChangeDetected,
    onError,
  } = options;

  const [hasChanges, setHasChanges] = useState(false);
  const [changeCount, setChangeCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const lastCheckRef = useRef<string>(new Date().toISOString());
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const check = useCallback(async () => {
    if (!branchId) return;

    setIsChecking(true);
    setError(null);

    try {
      const response = await checkOrderChanges(branchId, lastCheckRef.current);

      if (response.success) {
        const { hasChanges, changeCount, timestamp } = response.data;

        setHasChanges(hasChanges);
        setChangeCount(changeCount);
        setLastCheck(timestamp);

        // Update last check timestamp
        lastCheckRef.current = timestamp;

        // Call callback if changes detected
        if (hasChanges && changeCount > 0 && onChangeDetected) {
          onChangeDetected(changeCount);
        }
      }
    } catch (err: any) {
      console.error('Change detection error:', err);
      const error = new Error(err.message || 'Change detection failed');
      setError(error);

      if (onError) {
        onError(error);
      }
    } finally {
      setIsChecking(false);
    }
  }, [branchId, onChangeDetected, onError]);

  // Set up periodic checking
  useEffect(() => {
    if (!enabled || !branchId) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    // Initial check
    check();

    // Set up interval
    intervalIdRef.current = setInterval(check, interval);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [enabled, branchId, interval, check]);

  return {
    hasChanges,
    changeCount,
    isChecking,
    error,
    lastCheck,
    check,
  };
}
