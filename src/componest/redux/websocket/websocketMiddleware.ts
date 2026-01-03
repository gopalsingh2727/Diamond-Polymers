/**
 * WebSocket Middleware
 * Integrates WebSocket client with Redux store
 */

import { Middleware } from 'redux';
import WebSocketClient from '../../../services/websocket/WebSocketClient';
import {
  connecting,
  connected,
  disconnected,
  reconnecting,
  connectionError,
  messageReceived,
  pingReceived,
  forceLogout } from
'./websocketSlice';

let wsClient: WebSocketClient | null = null;
let reconnectAttempts = 0;

/**
 * Create WebSocket middleware
 */
const websocketMiddleware: Middleware = (store) => (next) => (action: any) => {
  const { type, payload } = action;

  switch (type) {
    case 'websocket/connect':
      handleConnect(store, payload);
      break;

    case 'websocket/disconnect':
      handleDisconnect(store);
      break;

    case 'websocket/send':
      handleSend(payload);
      break;

    case 'websocket/subscribeToRoom':
      handleSubscribeToRoom(payload);
      break;

    case 'websocket/subscribeToOrder':
      handleSubscribeToOrder(payload);
      break;

    case 'websocket/subscribeToMachine':
      handleSubscribeToMachine(payload);
      break;

    default:
      break;
  }

  return next(action);
};

/**
 * Handle WebSocket connection
 */
function handleConnect(store: any, payload: {url: string;token: string;platform?: string;deviceId?: string;autoReconnect?: boolean;maxReconnectAttempts?: number;}) {
  // Skip if no URL provided
  if (!payload?.url) {

    return;
  }

  if (wsClient && wsClient.connected) {

    return;
  }

  store.dispatch(connecting());

  const { url, token, platform, deviceId, autoReconnect = false, maxReconnectAttempts = 3 } = payload;

  wsClient = new WebSocketClient({
    url,
    token,
    platform: platform as 'electron' | 'web' | 'mobile' || 'web',
    deviceId,
    autoReconnect,
    reconnectInterval: 5000,
    maxReconnectAttempts,
    heartbeatInterval: 30000
  });

  // Listen to connection state changes
  wsClient.onConnectionStateChange((state) => {
    switch (state) {
      case 'connecting':
        store.dispatch(connecting());
        break;

      case 'connected':
        // ✅ FIXED: Dispatch connected action immediately when WebSocket opens
        // This ensures UI shows "Online" even if server doesn't send expected message

        store.dispatch(connected({
          connectionId: `ws-${Date.now()}`, // Temporary ID until server sends real one
          rooms: [] // Will be updated when server sends room info
        }));
        break;

      case 'disconnected':
        store.dispatch(disconnected());
        break;

      case 'reconnecting':
        reconnectAttempts++;
        store.dispatch(reconnecting(reconnectAttempts));
        break;
    }
  });

  // Listen to all WebSocket messages
  wsClient.on('*', (message) => {
    store.dispatch(messageReceived(message));

    // Handle specific message types
    const { type, action: messageAction } = message;
    const eventType = type || messageAction;

    switch (eventType) {
      case 'pong':
        store.dispatch(pingReceived());
        break;

      case 'Connected':
      case 'connected':
        // Initial connection response

        if (message.connectionId && message.rooms) {

          store.dispatch(connected({
            connectionId: message.connectionId,
            rooms: message.rooms
          }));

          // ✅ Auto-subscribe to daybook AND dispatch rooms for real-time order updates
          const branchId = message.branchId || localStorage.getItem('branchId') || localStorage.getItem('selectedBranch');
          if (branchId && wsClient) {

            wsClient.send({
              action: 'subscribeToDaybook',
              data: { branchId }
            });


            wsClient.send({
              action: 'subscribeToDispatch',
              data: { branchId }
            });
          }
        }
        break;
    }
  });

  // Listen for force logout
  wsClient.on('session:force_logout', (data) => {

    store.dispatch(forceLogout({
      reason: data.reason,
      message: data.message
    }));

    // Clear authentication
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');

    // Redirect to login (you can customize this)
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  });

  // Listen for order updates
  wsClient.on('order:created', (data) => {

    // Dispatch to orders reducer
    store.dispatch({ type: 'orders/orderCreatedViaWS', payload: data.data });
    // Dispatch browser event for useDaybookUpdates hook
    window.dispatchEvent(new CustomEvent('websocket:message', {
      detail: { type: 'order:created', data: data.data }
    }));
  });

  wsClient.on('order:status_changed', (data) => {

    // Dispatch to orders reducer
    store.dispatch({ type: 'orders/orderStatusChangedViaWS', payload: data.data });
    // Dispatch browser event for useDaybookUpdates hook

    window.dispatchEvent(new CustomEvent('websocket:message', {
      detail: { type: 'order:status_changed', data: data.data }
    }));
  });

  wsClient.on('order:priority_changed', (data) => {

    // Dispatch to orders reducer
    store.dispatch({ type: 'orders/orderPriorityChangedViaWS', payload: data.data });
    // Dispatch browser event for useDaybookUpdates hook
    window.dispatchEvent(new CustomEvent('websocket:message', {
      detail: { type: 'order:priority_changed', data: data.data }
    }));
  });

  // ✅ Listen for order updates (for Daybook real-time updates)
  wsClient.on('order:updated', (data) => {

    // Dispatch to orders reducer
    store.dispatch({ type: 'orders/orderUpdatedViaWS', payload: data.data });
    // Dispatch browser event for useDaybookUpdates hook

    window.dispatchEvent(new CustomEvent('websocket:message', {
      detail: { type: 'order:updated', data: data.data }
    }));
  });

  // ✅ Listen for order deletions
  wsClient.on('order:deleted', (data) => {

    // Dispatch to orders reducer
    store.dispatch({ type: 'orders/orderDeletedViaWS', payload: data.data });
    // Dispatch browser event for useDaybookUpdates hook
    window.dispatchEvent(new CustomEvent('websocket:message', {
      detail: { type: 'order:deleted', data: data.data }
    }));
  });

  // ✅ Listen for daybook-specific updates
  wsClient.on('daybook:updated', (data) => {

    // Dispatch browser event for useDaybookUpdates hook
    window.dispatchEvent(new CustomEvent('websocket:message', {
      detail: { type: 'daybook:updated', data: data.data }
    }));
  });

  // ✅ Listen for dispatch-specific updates
  wsClient.on('dispatch:updated', (data) => {

    // Dispatch browser event for useDispatchUpdates hook
    window.dispatchEvent(new CustomEvent('websocket:message', {
      detail: { type: 'dispatch:updated', data: data.data }
    }));
  });

  // Listen for machine updates
  wsClient.on('machine:status_changed', (data) => {

    // Dispatch to machine reducer
    store.dispatch({ type: 'machines/machineStatusChangedViaWS', payload: data.data });
  });

  wsClient.on('machine:order_started', (data) => {

    store.dispatch({ type: 'machines/machineOrderStartedViaWS', payload: data.data });
  });

  wsClient.on('machine:order_completed', (data) => {

    store.dispatch({ type: 'machines/machineOrderCompletedViaWS', payload: data.data });
  });

  // 🔄 Listen for reference data changes (cache invalidation)
  wsClient.on('referenceData:invalidate', (data) => {
    const entityType = data.data?.entityType || data.entityType;
    const action = data.data?.action || data.action;


    // Clear the order form data cache
    store.dispatch({ type: 'REFRESH_ORDER_FORM_DATA' });

    // Also invalidate specific data cache based on entity type
    const entityToCacheMap: Record<string, string[]> = {
      'machine': ['machines'],
      'machineType': ['machineTypes'],
      'operator': ['operators'],
      'customer': ['customers'],
      'step': ['steps'],
      'option': ['options'],
      'optionType': ['optionTypes'],
      'optionSpec': ['optionSpecs'],
      'order': ['orders'],
      'orderType': ['orderTypes']
    };

    const cacheKeys = entityToCacheMap[entityType];
    if (cacheKeys) {
      store.dispatch({ type: 'INVALIDATE_CACHE', payload: { dataTypes: cacheKeys } });

    }

    // Emit custom event so components can react and refetch
    window.dispatchEvent(new CustomEvent('websocket:message', {
      detail: { type: 'referenceData:invalidate', data: data.data || data }
    }));


  });

  // Connect (silently fail if server unavailable)
  wsClient.connect().catch(() => {
    store.dispatch(connectionError('WebSocket unavailable'));
  });
}

/**
 * Handle WebSocket disconnection
 */
function handleDisconnect(store: any) {
  if (wsClient) {
    wsClient.disconnect();
    wsClient = null;
    reconnectAttempts = 0;
    store.dispatch(disconnected());
  }
}

/**
 * Handle sending message
 */
function handleSend(payload: any) {
  if (wsClient && wsClient.connected) {
    wsClient.send(payload);
  } else {

    // Message will be queued automatically by WebSocketClient
    if (wsClient) {
      wsClient.send(payload);
    }
  }
}

/**
 * Handle room subscription
 */
function handleSubscribeToRoom(roomName: string) {
  if (wsClient) {
    wsClient.subscribeToRoom(roomName);
  }
}

/**
 * Handle order subscription
 */
function handleSubscribeToOrder(orderId: string) {
  if (wsClient) {
    wsClient.subscribeToOrder(orderId);
  }
}

/**
 * Handle machine subscription
 */
function handleSubscribeToMachine(machineId: string) {
  if (wsClient) {
    wsClient.subscribeToMachine(machineId);
  }
}

/**
 * Get WebSocket client instance (for direct access if needed)
 */
export function getWebSocketClient(): WebSocketClient | null {
  return wsClient;
}

export default websocketMiddleware;