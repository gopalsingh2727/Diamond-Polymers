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
      console.log('📦 Subscribing to order updates:', orderId);
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
      console.log('🏭 Subscribing to machine updates:', machineId);
      dispatch({
        type: 'websocket/subscribeToMachine',
        payload: machineId
      });
    }
  }, [machineId, isConnected, dispatch]);
};

export default {
  useWebSocketStatus,
  useWebSocketConnect,
  useWebSocketSend,
  useWebSocketRooms,
  useForceLogoutStatus,
  useOrderUpdates,
  useMachineUpdates
};
