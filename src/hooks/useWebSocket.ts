/**
 * React Hooks for WebSocket
 * Easy-to-use hooks for WebSocket integration
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../componest/redux/rootReducer';

/**
 * Hook to get WebSocket connection status
 */
export const useWebSocketStatus = () => {
  return useSelector((state: RootState) => {
    const websocket = (state as any).websocket;
    return {
      status: websocket?.status || 'disconnected',
      isConnected: websocket?.isConnected || false,
      connectionId: websocket?.connectionId || null,
      error: websocket?.error || null,
      reconnectAttempts: websocket?.reconnectAttempts || 0,
      subscribedRooms: websocket?.subscribedRooms || []
    };
  });
};

/**
 * Hook to connect to WebSocket
 */
export const useWebSocketConnect = () => {
  const dispatch = useDispatch();

  return {
    connect: (url: string, token: string, platform?: string, deviceId?: string) => {
      dispatch({
        type: 'websocket/connect',
        payload: { url, token, platform, deviceId }
      });
    },
    disconnect: () => {
      dispatch({ type: 'websocket/disconnect' });
    }
  };
};

/**
 * Hook to send WebSocket messages
 */
export const useWebSocketSend = () => {
  const dispatch = useDispatch();

  return (message: any) => {
    dispatch({
      type: 'websocket/send',
      payload: message
    });
  };
};

/**
 * Hook to subscribe to rooms
 */
export const useWebSocketRooms = () => {
  const dispatch = useDispatch();

  return {
    subscribeToRoom: (roomName: string) => {
      dispatch({
        type: 'websocket/subscribeToRoom',
        payload: roomName
      });
    },
    subscribeToOrder: (orderId: string) => {
      dispatch({
        type: 'websocket/subscribeToOrder',
        payload: orderId
      });
    },
    subscribeToMachine: (machineId: string) => {
      dispatch({
        type: 'websocket/subscribeToMachine',
        payload: machineId
      });
    }
  };
};

/**
 * Hook to check if force logged out
 */
export const useForceLogoutStatus = () => {
  return useSelector((state: RootState) => {
    const websocket = (state as any).websocket;
    return {
      forceLoggedOut: websocket?.forceLoggedOut || false,
      forceLogoutReason: websocket?.forceLogoutReason || null
    };
  });
};

/**
 * Hook to auto-subscribe to order updates
 * Automatically subscribes when orderId changes
 */
export const useOrderUpdates = (orderId: string | null) => {
  const dispatch = useDispatch();
  const { isConnected } = useWebSocketStatus();

  useEffect(() => {
    if (isConnected && orderId) {

      dispatch({
        type: 'websocket/subscribeToOrder',
        payload: orderId
      });
    }
  }, [orderId, isConnected, dispatch]);
};

/**
 * Hook to auto-subscribe to machine updates
 */
export const useMachineUpdates = (machineId: string | null) => {
  const dispatch = useDispatch();
  const { isConnected } = useWebSocketStatus();

  useEffect(() => {
    if (isConnected && machineId) {

      dispatch({
        type: 'websocket/subscribeToMachine',
        payload: machineId
      });
    }
  }, [machineId, isConnected, dispatch]);
};

/**
 * Hook to auto-subscribe to daybook/orders updates for a branch
 * Replaces 30-second polling with real-time WebSocket subscription
 */
export const useDaybookUpdates = (branchId: string | null, onOrderUpdate?: (data: any) => void) => {
  const dispatch = useDispatch();
  const { isConnected } = useWebSocketStatus();

  useEffect(() => {
    if (isConnected && branchId) {

      dispatch({
        type: 'websocket/send',
        payload: {
          action: 'subscribeToDaybook',
          data: { branchId }
        }
      });
    }
  }, [branchId, isConnected, dispatch]);

  // Set up listener for order updates (WebSocket events)
  useEffect(() => {
    if (!onOrderUpdate) return;

    const handleOrderUpdate = (event: CustomEvent) => {
      const { type, data } = event.detail;
      // ✅ Listen for all order-related events
      if (type === 'order:created' || type === 'order:updated' || type === 'order:deleted' ||
      type === 'order:status_changed' || type === 'order:priority_changed' ||
      type === 'daybook:updated' || type === 'referenceData:invalidate') {

        onOrderUpdate(data);
      }
    };

    window.addEventListener('websocket:message' as any, handleOrderUpdate);
    return () => {
      window.removeEventListener('websocket:message' as any, handleOrderUpdate);
    };
  }, [onOrderUpdate]);

  // ✅ Also listen for local order updates (fallback when WebSocket is not connected)
  useEffect(() => {
    if (!onOrderUpdate) return;

    const handleLocalOrderUpdate = (event: CustomEvent) => {

      onOrderUpdate(event.detail.data);
    };

    window.addEventListener('order:updated:local' as any, handleLocalOrderUpdate);
    return () => {
      window.removeEventListener('order:updated:local' as any, handleLocalOrderUpdate);
    };
  }, [onOrderUpdate]);
};

/**
 * Hook to auto-subscribe to dispatch updates for a branch
 * Replaces polling with real-time WebSocket subscription
 */
export const useDispatchUpdates = (branchId: string | null, onOrderUpdate?: (data: any) => void) => {
  const dispatch = useDispatch();
  const { isConnected } = useWebSocketStatus();

  useEffect(() => {
    if (isConnected && branchId) {

      dispatch({
        type: 'websocket/send',
        payload: {
          action: 'subscribeToDispatch',
          data: { branchId }
        }
      });
    }
  }, [branchId, isConnected, dispatch]);

  // Set up listener for order updates (WebSocket events)
  useEffect(() => {
    if (!onOrderUpdate) return;

    const handleOrderUpdate = (event: CustomEvent) => {
      const { type, data } = event.detail;
      // ✅ Listen for all order-related events
      if (type === 'order:created' || type === 'order:updated' || type === 'order:deleted' ||
      type === 'order:status_changed' || type === 'order:priority_changed' ||
      type === 'dispatch:updated' || type === 'referenceData:invalidate') {

        onOrderUpdate(data);
      }
    };

    window.addEventListener('websocket:message' as any, handleOrderUpdate);
    return () => {
      window.removeEventListener('websocket:message' as any, handleOrderUpdate);
    };
  }, [onOrderUpdate]);

  // ✅ Also listen for local order updates (fallback when WebSocket is not connected)
  useEffect(() => {
    if (!onOrderUpdate) return;

    const handleLocalOrderUpdate = (event: CustomEvent) => {

      onOrderUpdate(event.detail.data);
    };

    window.addEventListener('order:updated:local' as any, handleLocalOrderUpdate);
    return () => {
      window.removeEventListener('order:updated:local' as any, handleLocalOrderUpdate);
    };
  }, [onOrderUpdate]);
};

/**
 * Hook to auto-subscribe to dashboard updates
 */
export const useDashboardUpdates = (branchId: string | null, onDashboardUpdate?: (data: any) => void) => {
  const dispatch = useDispatch();
  const { isConnected } = useWebSocketStatus();

  useEffect(() => {
    if (isConnected && branchId) {

      dispatch({
        type: 'websocket/send',
        payload: {
          action: 'subscribeToDashboard',
          data: { branchId }
        }
      });
    }
  }, [branchId, isConnected, dispatch]);

  // Set up listener for dashboard updates
  useEffect(() => {
    if (!onDashboardUpdate) return;

    const handleDashboardUpdate = (event: CustomEvent) => {
      const { type, data } = event.detail;
      if (type === 'dashboard:updated' || type === 'referenceData:invalidate') {

        onDashboardUpdate(data);
      }
    };

    window.addEventListener('websocket:message' as any, handleDashboardUpdate);
    return () => {
      window.removeEventListener('websocket:message' as any, handleDashboardUpdate);
    };
  }, [onDashboardUpdate]);
};

/**
 * Hook to listen for reference data updates (machine, machineType, etc.)
 * Triggers callback when data changes so components can refetch
 */
export const useReferenceDataUpdates = (
entityTypes: string[],
onUpdate?: (data: {entityType: string;action: string;}) => void) =>
{
  useEffect(() => {
    if (!onUpdate) return;

    const handleReferenceUpdate = (event: CustomEvent) => {
      const { type, data } = event.detail;
      if (type === 'referenceData:invalidate') {
        const entityType = data?.entityType;
        if (entityTypes.includes(entityType) || entityTypes.includes('*')) {

          onUpdate({ entityType, action: data?.action });
        }
      }
    };

    window.addEventListener('websocket:message' as any, handleReferenceUpdate);
    return () => {
      window.removeEventListener('websocket:message' as any, handleReferenceUpdate);
    };
  }, [entityTypes, onUpdate]);
};

/**
 * Hook specifically for machine and machineType updates
 */
export const useMachineDataUpdates = (onUpdate?: () => void) => {
  useReferenceDataUpdates(['machine', 'machineType'], () => {

    onUpdate?.();
  });
};

export default {
  useWebSocketStatus,
  useWebSocketConnect,
  useWebSocketSend,
  useWebSocketRooms,
  useForceLogoutStatus,
  useOrderUpdates,
  useMachineUpdates,
  useDaybookUpdates,
  useDispatchUpdates,
  useDashboardUpdates,
  useReferenceDataUpdates,
  useMachineDataUpdates
};