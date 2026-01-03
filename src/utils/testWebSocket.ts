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







    if (userData) {
      try {
        const user = JSON.parse(userData);



      } catch (e) {

      }
    }



    // Check if window has WebSocket


    // Check Redux store
    try {
      const store = (window as any).__REDUX_STORE__;
      if (store) {
        const state = store.getState();

      } else {

      }
    } catch (e) {

    }



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


    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {

        return;
      }

      const { websocket } = store.getState();

      if (!websocket.isConnected) {

        return;
      }



      store.dispatch({
        type: 'websocket/send',
        payload: { action: 'ping' }
      });




    } catch (error) {

    }
  }

  /**
   * Subscribe to order updates
   */
  static subscribeToOrder(orderId: string) {


    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {

        return;
      }

      store.dispatch({
        type: 'websocket/subscribeToOrder',
        payload: orderId
      });




    } catch (error) {

    }
  }

  /**
   * Subscribe to machine updates
   */
  static subscribeToMachine(machineId: string) {


    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {

        return;
      }

      store.dispatch({
        type: 'websocket/subscribeToMachine',
        payload: machineId
      });




    } catch (error) {

    }
  }

  /**
   * Get current WebSocket status
   */
  static getStatus() {
    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {

        return;
      }

      const { websocket } = store.getState();












      return websocket;

    } catch (error) {

    }
  }

  /**
   * Simulate order status change (for testing)
   */
  static simulateOrderStatusChange(orderId: string, newStatus: string) {


    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {

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




    } catch (error) {

    }
  }

  /**
   * Monitor WebSocket messages
   */
  static startMonitoring() {




    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {

        return;
      }

      // Subscribe to store changes
      const unsubscribe = store.subscribe(() => {
        const { websocket } = store.getState();
        const lastMessage = websocket.lastMessages?.[0];

        if (lastMessage) {

        }
      });

      (window as any).__WS_MONITOR_UNSUBSCRIBE__ = unsubscribe;


    } catch (error) {

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

    } else {

    }
  }

  /**
   * Force reconnection
   */
  static forceReconnect() {


    try {
      const store = (window as any).__REDUX_STORE__;
      if (!store) {

        return;
      }

      // Disconnect first
      store.dispatch({ type: 'websocket/disconnect' });

      setTimeout(() => {
        // Reconnect after 1 second
        const token = localStorage.getItem('authToken');
        const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;

        if (!token) {

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



      }, 1000);

    } catch (error) {

    }
  }
}

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).WebSocketTester = WebSocketTester;


}

export default WebSocketTester;