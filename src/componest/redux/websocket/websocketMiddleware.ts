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
import { showMessageNotification, isWindowFocused, getNotificationPreferences, playNotificationSound, requestNotificationPermission } from '../../../utils/notifications';

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

          // ✅ Auto-subscribe to user's own room for P2P chat messages
          const userData = localStorage.getItem('userData');
          if (userData && wsClient) {
            try {
              const user = JSON.parse(userData);
              const userId = user.id || user._id;
              if (userId) {
                console.log('[WebSocket] Subscribing to user room for P2P chat:', `user:${userId}`);
                wsClient.send({
                  action: 'subscribe',
                  data: { room: `user:${userId}` }
                });
              }
            } catch (error) {
              console.error('[WebSocket] Failed to parse userData for chat subscription:', error);
            }
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

  // ✅ Listen for WebRTC call signaling (incoming calls)
  // This is GLOBAL - works even when PersonChat is not open!
  wsClient.on('call:incoming', (message) => {
    console.log('[WebSocket Middleware] 📞 INCOMING CALL received:', message);
    const data = message.data || message;

    // Store incoming call data globally so it can be accessed anywhere
    (window as any).__incomingCall = data;

    // Show browser notification for incoming call (works even when not in chat)
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`📞 Incoming ${data.callType} call`, {
        body: `${data.callerName} is calling you...`,
        icon: '/icon.png',
        requireInteraction: true,
        tag: 'incoming-call'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 30 seconds
      setTimeout(() => notification.close(), 30000);
    }

    // Also try to play ringtone globally
    try {
      // Create a simple audio context for ringtone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 1000);

      console.log('[WebSocket Middleware] 🔔 Playing ringtone for incoming call');
    } catch (e) {
      console.log('[WebSocket Middleware] Could not play ringtone:', e);
    }

    // Dispatch Redux action to store incoming call state
    store.dispatch({
      type: 'SET_INCOMING_CALL',
      payload: data
    });

    // Dispatch custom browser event so components can handle it
    window.dispatchEvent(new CustomEvent('call:incoming', {
      detail: data
    }));

    console.log('[WebSocket Middleware] ✅ Incoming call event dispatched globally');
  });

  // ✅ Listen for call answered event
  wsClient.on('call:answered', (message) => {
    console.log('[WebSocket Middleware] Call answered:', message);
    const data = message.data || message;
    window.dispatchEvent(new CustomEvent('call:answered', {
      detail: data
    }));
  });

  // ✅ Listen for call rejected event
  wsClient.on('call:rejected', (message) => {
    console.log('[WebSocket Middleware] Call rejected:', message);
    const data = message.data || message;
    window.dispatchEvent(new CustomEvent('call:rejected', {
      detail: data
    }));
  });

  // ✅ Listen for call ended event
  wsClient.on('call:ended', (message) => {
    console.log('[WebSocket Middleware] Call ended:', message);
    const data = message.data || message;
    window.dispatchEvent(new CustomEvent('call:ended', {
      detail: data
    }));
  });

  // ✅ Listen for ICE candidate event
  wsClient.on('call:ice_candidate', (message) => {
    console.log('[WebSocket Middleware] ICE candidate received:', message);
    const data = message.data || message;
    window.dispatchEvent(new CustomEvent('call:ice_candidate', {
      detail: data
    }));
  });

  // ✅ Listen for ICE candidate sent confirmation (from backend)
  wsClient.on('ice_candidate_sent', (message) => {
    // This is just a confirmation from backend, no action needed
    console.log('[WebSocket Middleware] ICE candidate sent confirmation');
  });

  // ✅ Listen for call initiated confirmation
  wsClient.on('call:initiated', (message) => {
    console.log('[WebSocket Middleware] Call initiated:', message);
    const data = message.data || message;

    // Check if any connections were notified
    if (data.connectionsNotified === 0) {
      console.warn('[WebSocket Middleware] WARNING: No receiver connections found! User may be offline.');
    } else {
      console.log(`[WebSocket Middleware] Call sent to ${data.connectionsNotified} connection(s)`);
    }

    window.dispatchEvent(new CustomEvent('call:initiated', {
      detail: data
    }));
  });

  // ✅ Listen for P2P chat messages
  wsClient.on('chat_message', (data) => {
    console.log('[WebSocket] Received chat_message:', data);

    if (data.data) {
      const msg = data.data;
      const userData = localStorage.getItem('userData');
      let currentUserId = null;

      try {
        if (userData) {
          const user = JSON.parse(userData);
          currentUserId = user.id || user._id;
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse userData:', error);
      }

      // Only show notification if message is from someone else
      const isFromMe = msg.senderId === currentUserId;

      // Dispatch to p2pChat reducer
      store.dispatch({
        type: 'p2pChat/receiveNewMessage',
        payload: {
          _id: msg._id || Date.now().toString(),
          conversationId: msg.senderId === currentUserId ? msg.receiverId : msg.senderId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderRole: 'User',
          text: msg.text || msg.message,
          type: 'text',
          timestamp: new Date(msg.createdAt || Date.now()),
          status: 'delivered',
          reactions: [],
          readBy: []
        }
      });

      console.log('[WebSocket] Chat message dispatched to Redux');

      // Show notification for incoming messages
      if (!isFromMe) {
        console.log('[WebSocket] Showing notification for message from:', msg.senderName);

        // Always show notification for incoming messages (you can change this later)
        // For testing: Set to true to always show, or use !isWindowFocused() for production
        const shouldShowNotification = true; // Change to !isWindowFocused() for production

        console.log('[WebSocket] Should show notification:', shouldShowNotification);
        console.log('[WebSocket] Window focused:', isWindowFocused());

        if (shouldShowNotification) {
          // ✅ Request permission before showing notification
          requestNotificationPermission().then(async (permission) => {
            console.log('[WebSocket] Notification permission:', permission);

            if (permission === 'granted') {
              try {
                showMessageNotification(
                  msg.senderName || 'Unknown User',
                  msg.text || msg.message || 'New message',
                  msg.senderId,
                  () => {
                    // Handle notification click - bring window to focus
                    window.focus();
                    // Dispatch custom event to open chat with this person
                    window.dispatchEvent(new CustomEvent('openChat', {
                      detail: {
                        personId: msg.senderId,
                        personName: msg.senderName
                      }
                    }));
                  }
                );
                console.log('[WebSocket] ✅ Notification shown successfully');
              } catch (error) {
                console.error('[WebSocket] ❌ Failed to show notification:', error);
              }
            } else if (permission === 'denied') {
              console.error('[WebSocket] ❌ Notifications are BLOCKED. Enable in browser settings:');
              console.error('   Chrome: Click lock icon in address bar → Notifications → Allow');
              console.error('   Firefox: Click lock icon → Permissions → Notifications → Allow');
            } else {
              console.warn('[WebSocket] ⚠️ Notification permission not granted (user dismissed prompt)');
            }
          }).catch((error) => {
            console.error('[WebSocket] ❌ Failed to request notification permission:', error);
          });
        } else {
          console.log('[WebSocket] Skipping notification (window is focused)');
        }
      }
    }
  });

  // ✅ Listen for user status updates (online/offline/typing)
  wsClient.on('chat:user_status', (data) => {
    console.log('[WebSocket] Received chat:user_status:', data);
    const statusData = data.data || data;

    store.dispatch({
      type: 'p2pChat/updateUserStatus',
      payload: {
        personId: statusData.userId || statusData.personId,
        isOnline: statusData.isOnline,
        lastActiveAt: statusData.lastActiveAt ? new Date(statusData.lastActiveAt) : null
      }
    });
  });

  // ✅ Listen for typing indicators
  wsClient.on('chat:typing', (data) => {
    console.log('[WebSocket] User typing:', data);
    const typingData = data.data || data;

    store.dispatch({
      type: 'p2pChat/userTyping',
      payload: {
        conversationId: typingData.conversationId || typingData.senderId,
        userId: typingData.userId || typingData.senderId,
        userName: typingData.userName || typingData.senderName
      }
    });
  });

  wsClient.on('chat:stopped_typing', (data) => {
    console.log('[WebSocket] User stopped typing:', data);
    const typingData = data.data || data;

    store.dispatch({
      type: 'p2pChat/userStoppedTyping',
      payload: {
        conversationId: typingData.conversationId || typingData.senderId,
        userId: typingData.userId || typingData.senderId
      }
    });
  });

  // ✅ Listen for message read receipts
  wsClient.on('chat:message_read', (data) => {
    console.log('[WebSocket] Message read:', data);
    const readData = data.data || data;

    store.dispatch({
      type: 'p2pChat/messageRead',
      payload: {
        messageId: readData.messageId,
        userId: readData.userId
      }
    });
  });

  // ✅ Listen for unread count updates
  wsClient.on('chat:unread_count', (data) => {
    console.log('[WebSocket] Unread count update:', data);
    const unreadData = data.data || data;

    // Dispatch to update unread counts in Redux
    window.dispatchEvent(new CustomEvent('chat:unread_update', {
      detail: unreadData
    }));
  });

  // ✅ Listen for order forwarded events (Person 1 → Person 2)
  wsClient.on('order:forwarded', (data) => {
    console.log('[WebSocket] 📦 Order forwarded received:', data);
    const orderData = data.data || data;

    // Get current user
    const userData = localStorage.getItem('userData');
    let currentUserId = null;
    try {
      if (userData) {
        const user = JSON.parse(userData);
        currentUserId = user.id || user._id;
      }
    } catch (error) {
      console.error('[WebSocket] Failed to parse userData:', error);
    }

    // Only show notification if order is forwarded TO me
    const isForMe = orderData.receiverId === currentUserId;

    if (isForMe) {
      // Dispatch to Redux
      store.dispatch({
        type: 'orderForward/receiveForwardedOrder',
        payload: orderData
      });

      // Show desktop notification
      const shouldShowNotification = true; // Change to !isWindowFocused() for production

      if (shouldShowNotification) {
        // ✅ Request permission before showing notification
        requestNotificationPermission().then((permission) => {
          console.log('[WebSocket] Order notification permission:', permission);

          if (permission === 'granted') {
            try {
              const notification = new Notification('📦 New Order Forwarded', {
                body: `${orderData.senderName || 'Someone'} forwarded Order #${orderData.orderNumber || 'Unknown'} to you`,
                icon: '/icon.png',
                tag: `order-forward-${orderData._id}`,
                requireInteraction: false
              });

              notification.onclick = () => {
                window.focus();
                notification.close();

                // Navigate to forwarded orders
                window.location.hash = '#/order-forward';
              };

              // Auto-close after 8 seconds
              setTimeout(() => {
                notification.close();
              }, 8000);

              // Play sound
              const prefs = getNotificationPreferences();
              if (prefs.sound) {
                playNotificationSound();
              }

              console.log('[WebSocket] ✅ Order forward notification shown');
            } catch (error) {
              console.error('[WebSocket] ❌ Failed to show order notification:', error);
            }
          } else if (permission === 'denied') {
            console.error('[WebSocket] ❌ Order notifications BLOCKED. Enable in browser settings.');
          }
        }).catch((error) => {
          console.error('[WebSocket] ❌ Failed to request permission for order notification:', error);
        });
      }
    }
  });

  // ✅ Listen for order accepted events (Person 2 accepts → Person 1 notified)
  wsClient.on('order:accepted', (data) => {
    console.log('[WebSocket] ✅ Order accepted:', data);
    const orderData = data.data || data;

    // Dispatch to Redux
    store.dispatch({
      type: 'orderForward/orderAccepted',
      payload: orderData
    });

    // Show desktop notification
    requestNotificationPermission().then((permission) => {
      if (permission === 'granted') {
        try {
          const notification = new Notification('✅ Order Accepted', {
            body: `${orderData.acceptedByName || 'Someone'} accepted your forwarded order #${orderData.orderNumber}`,
            icon: '/icon.png',
            tag: `order-accepted-${orderData._id}`
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
            window.location.hash = '#/order-forward';
          };

          setTimeout(() => notification.close(), 5000);

          // Play sound
          const prefs = getNotificationPreferences();
          if (prefs.sound) {
            playNotificationSound();
          }

          console.log('[WebSocket] ✅ Order accepted notification shown');
        } catch (error) {
          console.error('[WebSocket] ❌ Failed to show accepted notification:', error);
        }
      } else if (permission === 'denied') {
        console.error('[WebSocket] ❌ Notifications BLOCKED for order accepted.');
      }
    }).catch((error) => {
      console.error('[WebSocket] ❌ Failed to request permission for accepted notification:', error);
    });
  });

  // ✅ Listen for order rejected events (Person 2 rejects → Person 1 notified)
  wsClient.on('order:rejected', (data) => {
    console.log('[WebSocket] ❌ Order rejected:', data);
    const orderData = data.data || data;

    // Dispatch to Redux
    store.dispatch({
      type: 'orderForward/orderRejected',
      payload: orderData
    });

    // Show desktop notification
    requestNotificationPermission().then((permission) => {
      if (permission === 'granted') {
        try {
          const notification = new Notification('❌ Order Rejected', {
            body: `${orderData.rejectedByName || 'Someone'} rejected your forwarded order #${orderData.orderNumber}`,
            icon: '/icon.png',
            tag: `order-rejected-${orderData._id}`
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
            window.location.hash = '#/order-forward';
          };

          setTimeout(() => notification.close(), 5000);

          // Play sound
          const prefs = getNotificationPreferences();
          if (prefs.sound) {
            playNotificationSound();
          }

          console.log('[WebSocket] ✅ Order rejected notification shown');
        } catch (error) {
          console.error('[WebSocket] ❌ Failed to show rejected notification:', error);
        }
      } else if (permission === 'denied') {
        console.error('[WebSocket] ❌ Notifications BLOCKED for order rejected.');
      }
    }).catch((error) => {
      console.error('[WebSocket] ❌ Failed to request permission for rejected notification:', error);
    });
  });

  // ❌ REMOVED DUPLICATE 'message' handler to prevent duplicate messages

  // Continue with rest of event listeners below...

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