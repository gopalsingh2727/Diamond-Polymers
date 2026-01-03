/**
 * WebSocket Manager Component
 * Automatically connects/disconnects WebSocket based on authentication state
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../componest/redux/rootReducer';
import { getCurrentWsUrl } from '../utils/axiosInterceptor';

const WebSocketManager = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);
  const wsStatus = useSelector((state: any) => state.websocket?.status);
  const isConnected = useSelector((state: any) => state.websocket?.isConnected);

  // Track if we've initiated connection to prevent duplicate attempts
  const hasInitiatedConnection = useRef(false);

  // Effect to connect on authentication
  useEffect(() => {
    // Only proceed if authenticated and haven't connected yet
    if (!isAuthenticated || hasInitiatedConnection.current) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || getCurrentWsUrl();
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    // Skip if no URL or token
    if (!wsUrl || !token) {

      return;
    }



    // Determine platform (Electron vs Web)
    const isElectron = !!(window as any).electron;
    const platform = isElectron ? 'electron' : 'web';

    // Mark that we've initiated connection
    hasInitiatedConnection.current = true;

    // Connect to WebSocket with auto-reconnect
    // The WebSocketClient will handle all reconnections internally
    dispatch({
      type: 'websocket/connect',
      payload: {
        url: wsUrl,
        token,
        platform,
        autoReconnect: true,
        maxReconnectAttempts: 10
      }
    });





  }, [isAuthenticated, dispatch]); // Only depend on auth state and dispatch

  // Effect to disconnect on logout
  useEffect(() => {
    if (!isAuthenticated && (wsStatus === 'connected' || wsStatus === 'connecting' || wsStatus === 'reconnecting')) {

      dispatch({ type: 'websocket/disconnect' });
      hasInitiatedConnection.current = false; // Reset for next login
    }
  }, [isAuthenticated, wsStatus, dispatch]);

  // Log connection status changes
  useEffect(() => {

  }, [wsStatus, isConnected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {

        dispatch({ type: 'websocket/disconnect' });
        hasInitiatedConnection.current = false;
      }
    };
  }, [isConnected, dispatch]);

  // This component doesn't render anything
  return null;
};

export default WebSocketManager;