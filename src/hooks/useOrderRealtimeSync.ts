/**
 * useOrderRealtimeSync Hook
 * Unified hook that combines WebSocket and Polling for order updates
 * Automatically falls back to polling when WebSocket is disconnected
 *
 * Usage in Daybook, Dispatch, Dashboard:
 * const { isLive, connectionMethod } = useOrderRealtimeSync(branchId, {
 *   onUpdate: handleOrderUpdate,
 *   preferWebSocket: true  // Try WebSocket first, fallback to polling
 * });
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { pollOrders, OrderUpdate } from '../services/orderPollingService';
import { fetchOrders } from '../componest/redux/oders/OdersActions';

export interface UseOrderRealtimeSyncOptions {
  enabled?: boolean;
  preferWebSocket?: boolean; // If true, use WebSocket when available
  pollingFallback?: boolean; // If true, use polling when WebSocket fails
  wsStatus?: 'connected' | 'disconnected' | 'connecting';
  onUpdate?: (updates: OrderUpdate[]) => void;
  onError?: (error: Error) => void;
}

export interface UseOrderRealtimeSyncReturn {
  isLive: boolean;
  connectionMethod: 'websocket' | 'polling' | 'none';
  isPolling: boolean;
  lastUpdate: string | null;
  error: Error | null;
  forceRefresh: () => void;
}

export function useOrderRealtimeSync(
  branchId: string,
  options: UseOrderRealtimeSyncOptions = {}
): UseOrderRealtimeSyncReturn {
  const {
    enabled = true,
    preferWebSocket = true,
    pollingFallback = true,
    wsStatus = 'disconnected',
    onUpdate,
    onError,
  } = options;

  const dispatch = useDispatch();
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'websocket' | 'polling' | 'none'>('none');

  const activeRef = useRef(enabled);
  const lastUpdateRef = useRef<string>(new Date().toISOString());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine which method to use
  const shouldUseWebSocket = preferWebSocket && wsStatus === 'connected';
  const shouldUsePolling = enabled && pollingFallback && !shouldUseWebSocket;

  // Polling function
  const poll = useCallback(async () => {
    if (!activeRef.current || !branchId || !shouldUsePolling) return;

    setIsPolling(true);
    setError(null);

    try {
      const response = await pollOrders({
        branchId,
        since: lastUpdateRef.current,
        timeout: 30000,
      });

      if (response.success && response.data.updates.length > 0) {
        const newUpdates = response.data.updates;

        console.log(`📡 Polling: Received ${newUpdates.length} order updates`);

        // Update last update timestamp
        lastUpdateRef.current = response.data.timestamp;
        setLastUpdate(response.data.timestamp);

        // Call onUpdate callback
        if (onUpdate) {
          onUpdate(newUpdates);
        }

        // Also dispatch Redux action to refresh orders
        dispatch(fetchOrders({}) as any);
      }

      // Continue polling if still active
      if (activeRef.current && shouldUsePolling) {
        pollingIntervalRef.current = setTimeout(poll, 2000); // Poll every 2 seconds
      }
    } catch (err: any) {
      console.error('❌ Polling error:', err);
      const error = new Error(err.message || 'Polling failed');
      setError(error);

      if (onError) {
        onError(error);
      }

      // Retry after error
      if (activeRef.current && shouldUsePolling) {
        pollingIntervalRef.current = setTimeout(poll, 5000);
      }
    } finally {
      setIsPolling(false);
    }
  }, [branchId, shouldUsePolling, onUpdate, onError, dispatch]);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    if (branchId) {
      dispatch(fetchOrders({}) as any);
      lastUpdateRef.current = new Date().toISOString();
    }
  }, [branchId, dispatch]);

  // Update connection method based on status
  useEffect(() => {
    if (shouldUseWebSocket) {
      setConnectionMethod('websocket');
      // Stop polling if WebSocket is active
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    } else if (shouldUsePolling) {
      setConnectionMethod('polling');
    } else {
      setConnectionMethod('none');
    }
  }, [shouldUseWebSocket, shouldUsePolling]);

  // Start/stop polling based on conditions
  useEffect(() => {
    activeRef.current = enabled;

    if (shouldUsePolling && branchId) {
      console.log('🔄 Starting polling for branch:', branchId);
      poll();
    }

    return () => {
      activeRef.current = false;
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [shouldUsePolling, branchId, poll, enabled]);

  const isLive = shouldUseWebSocket || isPolling;

  return {
    isLive,
    connectionMethod,
    isPolling,
    lastUpdate,
    error,
    forceRefresh,
  };
}
