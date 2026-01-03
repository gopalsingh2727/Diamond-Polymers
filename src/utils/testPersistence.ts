/**
 * Test Persistence Utilities
 * Helper functions to test redux-persist localStorage
 */

export const testPersistence = {
  /**
   * Check if redux-persist has data in localStorage
   */
  checkLocalStorage: () => {


    const persistRoot = localStorage.getItem('persist:root');

    if (!persistRoot) {

      return null;
    }

    try {
      const parsed = JSON.parse(persistRoot);



      // Check orders
      if (parsed.orders) {
        const orders = JSON.parse(parsed.orders);






      } else {

      }

      // Check dataCache
      if (parsed.dataCache) {
        const dataCache = JSON.parse(parsed.dataCache);




      }

      return parsed;
    } catch (err) {

      return null;
    }
  },

  /**
   * Clear persisted data
   */
  clearPersistedData: () => {

    localStorage.removeItem('persist:root');

  },

  /**
   * Compare Redux state with localStorage
   */
  compareStates: (reduxState: any) => {


    const persistRoot = localStorage.getItem('persist:root');
    if (!persistRoot) {

      return;
    }

    const parsed = JSON.parse(persistRoot);
    const ordersFromStorage = parsed.orders ? JSON.parse(parsed.orders) : null;
    const ordersFromRedux = reduxState.orders;




    const match = JSON.stringify(ordersFromRedux) === JSON.stringify(ordersFromStorage);


    return { ordersFromRedux, ordersFromStorage, match };
  },

  /**
   * Watch for changes to localStorage
   */
  watchLocalStorage: () => {


    let lastValue = localStorage.getItem('persist:root');

    const interval = setInterval(() => {
      const currentValue = localStorage.getItem('persist:root');

      if (currentValue !== lastValue) {


        if (currentValue && lastValue) {
          try {
            const current = JSON.parse(currentValue);
            const last = JSON.parse(lastValue);

            const currentOrders = current.orders ? JSON.parse(current.orders) : null;
            const lastOrders = last.orders ? JSON.parse(last.orders) : null;

            const currentCount = currentOrders?.list?.orders?.length || 0;
            const lastCount = lastOrders?.list?.orders?.length || 0;

            if (currentCount !== lastCount) {

            } else {

            }
          } catch (err) {

          }
        }

        lastValue = currentValue;
      }
    }, 500); // Check every 500ms




    return interval;
  },

  /**
   * Simulate an order update to test persistence
   */
  simulateOrderUpdate: (store: any) => {


    const testOrder = {
      _id: 'test_' + Date.now(),
      orderId: 'TEST-' + Date.now(),
      customerId: 'test-customer',
      materialId: 'test-material',
      overallStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Dispatch WebSocket action
    store.dispatch({
      type: 'orders/orderCreatedViaWS',
      payload: testOrder
    });




    setTimeout(() => {

      testPersistence.checkLocalStorage();
    }, 1000);

    return testOrder;
  }
};

// Expose to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).testPersistence = testPersistence;
}

export default testPersistence;