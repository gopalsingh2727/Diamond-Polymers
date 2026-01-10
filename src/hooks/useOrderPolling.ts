/**
 * useOrderPolling Hook
 * React hook for real-time order updates using long-polling
 *
 * Usage:
 * const { orders, isPolling, error } = useOrderPolling(branchId, { enabled: true });
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { pollOrders, OrderUpdate } from '../services/orderPollingService';

export interface UseOrderPollingOptions {
  enabled?: boolean;
  timeout?: number;
  types?: string[];
  onUpdate?: (updates: OrderUpdate[]) => void;
  onError?: (error: Error) => void;
}

export interface UseOrderPollingReturn {
  updates: OrderUpdate[];
  isPolling: boolean;
  error: Error | null;
  lastUpdate: string | null;
  startPolling: () => void;
  stopPolling: () => void;
}

export function useOrderPolling(
  branchId: string,
  options: UseOrderPollingOptions = {}
): UseOrderPollingReturn {
  const {
    enabled = true,
    timeout = 30000,
    types,
    onUpdate,
    onError,
  } = options;

  const [updates, setUpdates] = useState<OrderUpdate[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const activeRef = useRef(enabled);
  const lastUpdateRef = useRef<string>(new Date().toISOString());

  // Update active ref when enabled changes
  useEffect(() => {
    activeRef.current = enabled;
  }, [enabled]);

  const poll = useCallback(async () => {
    if (!activeRef.current || !branchId) return;

    setIsPolling(true);
    setError(null);

    try {
      const response = await pollOrders({
        branchId,
        since: lastUpdateRef.current,
        timeout,
        types,
      });

      if (response.success && response.data.updates.length > 0) {
        const newUpdates = response.data.updates;

        // Add updates to state
        setUpdates((prev) => [...prev, ...newUpdates]);

        // Update last update timestamp
        lastUpdateRef.current = response.data.timestamp;
        setLastUpdate(response.data.timestamp);

        // Call onUpdate callback
        if (onUpdate) {
          onUpdate(newUpdates);
        }
      }

      // Continue polling if still active
      if (activeRef.current) {
        setTimeout(poll, 1000); // Small delay before next poll
      }
    } catch (err: any) {
      console.error('Polling error:', err);
      const error = new Error(err.message || 'Polling failed');
      setError(error);

      if (onError) {
        onError(error);
      }

      // Retry after error with exponential backoff
      if (activeRef.current) {
        setTimeout(poll, 5000);
      }
    } finally {
      setIsPolling(false);
    }
  }, [branchId, timeout, types, onUpdate, onError]);

  const startPolling = useCallback(() => {
    activeRef.current = true;
    poll();
  }, [poll]);

  const stopPolling = useCallback(() => {
    activeRef.current = false;
  }, []);

  // Start/stop polling based on enabled flag
  useEffect(() => {
    if (enabled && branchId) {
      poll();
    }

    return () => {
      activeRef.current = false;
    };
  }, [enabled, branchId, poll]);

  return {
    updates,
    isPolling,
    error,
    lastUpdate,
    startPolling,
    stopPolling,
  };
}
