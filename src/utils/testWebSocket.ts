/**
 * WebSocket Testing Utilities
 * Use in browser console to test WebSocket functionality
 *
 * Usage:
 * import { WebSocketTester } from './utils/testWebSocket';
 *
 * // In browser console
 * WebSocketTester.checkConnection()
 * WebSocketTester.testPing()
 * WebSocketTester.subscribeToOrder('orderId')
 */

export class WebSocketTester {
  /**
   * Check WebSocket connection status
   */
  static checkConnection() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    console.group('🔍 WebSocket Connection Check');

    console.log('1. Token:', token ? '✅ Present' : '❌ Missing');
    console.log('   Token value:', token?.substring(0, 20) + '...');

    console.log('2. User Data:', userData ? '✅ Present' : '❌ Missing');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('   User ID:', user._id);
        console.log('   Role:', user.role);
        console.log('   Branch:', user.branchId);
      } catch (e) {
        console.error('   ❌ Invalid JSON:', e);
      }
    }

    console.log('3. WebSocket URL:', import.meta.env.VITE_WEBSOCKET_URL || '❌ Not configured');

    // Check if window has WebSocket
    console.log('4. WebSocket Support:', typeof WebSocket !== 'undefined' ? '✅ Supported' : '❌ Not supported');

    // Check Redux store
    try {
      const store = (window as any).__REDUX_STORE__;
      if (store) {
        const state = store.getState();
        console.log('5. Redux WebSocket State:', state.websocket);
      } else {
        console.log('5. Redux Store: ❌ Not accessible (try adding to window in store.tsx)');
      }
    } catch (e) {
      console.log('5. Redux Store: ❌ Error accessing:', e);
    }

    console.groupEnd();

    return {
      token: !!token,
      userData: !!userData,
      wsUrl: import.meta.env.VITE_WEBSOCKET_URL,
      wsSupport: typeof WebSocket !== 'undefined'
    };
  }

  /**
   * Test WebSocket ping/pong
   */
  static async testPing() {
    console.log('🏓 Testing WebSocket ping...');

    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {
        console.error('❌ Redux store not accessible');
        return;
      }

      const { websocket } = store.getState();

      if (!websocket.isConnected) {
        console.error('❌ WebSocket not connected');
        return;
      }

      console.log('✅ WebSocket connected, sending ping...');

      store.dispatch({
        type: 'websocket/send',
        payload: { action: 'ping' }
      });

      console.log('⏳ Waiting for pong response...');
      console.log('Check Redux DevTools or browser Network tab (WS) for response');

    } catch (error) {
      console.error('❌ Error testing ping:', error);
    }
  }

  /**
   * Subscribe to order updates
   */
  static subscribeToOrder(orderId: string) {
    console.log(`📦 Subscribing to order: ${orderId}...`);

    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {
        console.error('❌ Redux store not accessible');
        return;
      }

      store.dispatch({
        type: 'websocket/subscribeToOrder',
        payload: orderId
      });

      console.log('✅ Subscription request sent');
      console.log('Check WebSocket Network tab for confirmation');

    } catch (error) {
      console.error('❌ Error subscribing to order:', error);
    }
  }

  /**
   * Subscribe to machine updates
   */
  static subscribeToMachine(machineId: string) {
    console.log(`🏭 Subscribing to machine: ${machineId}...`);

    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {
        console.error('❌ Redux store not accessible');
        return;
      }

      store.dispatch({
        type: 'websocket/subscribeToMachine',
        payload: machineId
      });

      console.log('✅ Subscription request sent');
      console.log('Check WebSocket Network tab for confirmation');

    } catch (error) {
      console.error('❌ Error subscribing to machine:', error);
    }
  }

  /**
   * Get current WebSocket status
   */
  static getStatus() {
    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {
        console.error('❌ Redux store not accessible');
        return;
      }

      const { websocket } = store.getState();

      console.group('📊 WebSocket Status');
      console.log('Status:', websocket.status);
      console.log('Connected:', websocket.isConnected);
      console.log('Connection ID:', websocket.connectionId);
      console.log('Subscribed Rooms:', websocket.subscribedRooms);
      console.log('Error:', websocket.error || 'None');
      console.log('Reconnect Attempts:', websocket.reconnectAttempts);
      console.log('Connected At:', websocket.connectedAt);
      console.log('Last Ping:', websocket.lastPingTime);
      console.groupEnd();

      return websocket;

    } catch (error) {
      console.error('❌ Error getting status:', error);
    }
  }

  /**
   * Simulate order status change (for testing)
   */
  static simulateOrderStatusChange(orderId: string, newStatus: string) {
    console.log(`🧪 Simulating order status change: ${orderId} → ${newStatus}`);

    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {
        console.error('❌ Redux store not accessible');
        return;
      }

      store.dispatch({
        type: 'orders/orderStatusChangedViaWS',
        payload: {
          _id: orderId,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      });

      console.log('✅ Simulated status change dispatched');
      console.log('Check Redux DevTools to see state update');

    } catch (error) {
      console.error('❌ Error simulating status change:', error);
    }
  }

  /**
   * Monitor WebSocket messages
   */
  static startMonitoring() {
    console.log('👁️ Starting WebSocket message monitoring...');
    console.log('All WebSocket messages will be logged to console');
    console.log('Stop with WebSocketTester.stopMonitoring()');

    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {
        console.error('❌ Redux store not accessible');
        return;
      }

      // Subscribe to store changes
      const unsubscribe = store.subscribe(() => {
        const { websocket } = store.getState();
        const lastMessage = websocket.lastMessages?.[0];

        if (lastMessage) {
          console.log('📨 WebSocket Message:', lastMessage);
        }
      });

      (window as any).__WS_MONITOR_UNSUBSCRIBE__ = unsubscribe;
      console.log('✅ Monitoring started');

    } catch (error) {
      console.error('❌ Error starting monitoring:', error);
    }
  }

  /**
   * Stop monitoring WebSocket messages
   */
  static stopMonitoring() {
    const unsubscribe = (window as any).__WS_MONITOR_UNSUBSCRIBE__;

    if (unsubscribe) {
      unsubscribe();
      delete (window as any).__WS_MONITOR_UNSUBSCRIBE__;
      console.log('✅ Monitoring stopped');
    } else {
      console.log('ℹ️ No monitoring session active');
    }
  }

  /**
   * Force reconnection
   */
  static forceReconnect() {
    console.log('🔄 Forcing WebSocket reconnection...');

    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {
        console.error('❌ Redux store not accessible');
        return;
      }

      // Disconnect first
      store.dispatch({ type: 'websocket/disconnect' });

      setTimeout(() => {
        // Reconnect after 1 second
        const token = localStorage.getItem('authToken');
        const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;

        if (!token) {
          console.error('❌ No auth token found');
          return;
        }

        store.dispatch({
          type: 'websocket/connect',
          payload: {
            url: wsUrl,
            token,
            platform: 'electron'
          }
        });

        console.log('✅ Reconnection initiated');

      }, 1000);

    } catch (error) {
      console.error('❌ Error forcing reconnect:', error);
    }
  }
}

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).WebSocketTester = WebSocketTester;
  console.log('✅ WebSocketTester available in console');
  console.log('Try: WebSocketTester.checkConnection()');
}

export default WebSocketTester;
