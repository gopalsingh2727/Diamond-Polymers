/**
 * WebSocket Event Handlers for Orders
 * Add these cases to your orders reducer
 *
 * Usage:
 * import { handleOrderWebSocketEvent } from './websocketHandlers';
 *
 * In your reducer:
 * case 'orders/orderCreatedViaWS':
 *   return handleOrderWebSocketEvent.orderCreated(state, action);
 */

export interface Order {
  _id: string;
  orderNumber?: string;
  status?: string;
  priority?: string;
  branchId?: string;
  customerId?: string;
  machineId?: string;
  [key: string]: any;
}

export interface OrderState {
  allOrders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder?: Order | null;
  [key: string]: any;
}

/**
 * WebSocket Event Handlers
 */
export const handleOrderWebSocketEvent = {
  /**
   * Handle order created via WebSocket
   */
  orderCreated: (state: OrderState, action: { payload: Order }): OrderState => {
    const newOrder = action.payload;

    // Check if order already exists (prevent duplicates)
    const exists = state.allOrders.some(order => order._id === newOrder._id);

    if (exists) {
      console.warn('Order already exists, skipping duplicate:', newOrder._id);
      return state;
    }

    console.log('📦 Order created via WebSocket:', newOrder.orderNumber || newOrder._id);

    return {
      ...state,
      allOrders: [newOrder, ...state.allOrders], // Add to beginning
    };
  },

  /**
   * Handle order status changed via WebSocket
   */
  statusChanged: (state: OrderState, action: { payload: { _id: string; status: string; updatedAt?: string } }): OrderState => {
    const { _id, status, updatedAt } = action.payload;

    console.log('📦 Order status changed via WebSocket:', _id, '→', status);

    return {
      ...state,
      allOrders: state.allOrders.map(order =>
        order._id === _id
          ? {
              ...order,
              status,
              ...(updatedAt && { updatedAt })
            }
          : order
      ),
      // Update selected order if it's the one being changed
      ...(state.selectedOrder?._id === _id && {
        selectedOrder: {
          ...state.selectedOrder,
          status,
          ...(updatedAt && { updatedAt })
        }
      })
    };
  },

  /**
   * Handle order priority changed via WebSocket
   */
  priorityChanged: (state: OrderState, action: { payload: { _id: string; priority: string; updatedAt?: string } }): OrderState => {
    const { _id, priority, updatedAt } = action.payload;

    console.log('📦 Order priority changed via WebSocket:', _id, '→', priority);

    return {
      ...state,
      allOrders: state.allOrders.map(order =>
        order._id === _id
          ? {
              ...order,
              priority,
              ...(updatedAt && { updatedAt })
            }
          : order
      ),
      ...(state.selectedOrder?._id === _id && {
        selectedOrder: {
          ...state.selectedOrder,
          priority,
          ...(updatedAt && { updatedAt })
        }
      })
    };
  },

  /**
   * Handle order updated via WebSocket (full update)
   */
  orderUpdated: (state: OrderState, action: { payload: Order }): OrderState => {
    const updatedOrder = action.payload;

    console.log('📦 Order updated via WebSocket:', updatedOrder._id);

    return {
      ...state,
      allOrders: state.allOrders.map(order =>
        order._id === updatedOrder._id
          ? { ...order, ...updatedOrder }
          : order
      ),
      ...(state.selectedOrder?._id === updatedOrder._id && {
        selectedOrder: { ...state.selectedOrder, ...updatedOrder }
      })
    };
  },

  /**
   * Handle order deleted via WebSocket
   */
  orderDeleted: (state: OrderState, action: { payload: { _id: string } }): OrderState => {
    const { _id } = action.payload;

    console.log('📦 Order deleted via WebSocket:', _id);

    return {
      ...state,
      allOrders: state.allOrders.filter(order => order._id !== _id),
      ...(state.selectedOrder?._id === _id && {
        selectedOrder: null
      })
    };
  },

  /**
   * Handle order assignment changed via WebSocket
   */
  assignmentChanged: (state: OrderState, action: { payload: { _id: string; machineId?: string; operatorId?: string; updatedAt?: string } }): OrderState => {
    const { _id, machineId, operatorId, updatedAt } = action.payload;

    console.log('📦 Order assignment changed via WebSocket:', _id);

    return {
      ...state,
      allOrders: state.allOrders.map(order =>
        order._id === _id
          ? {
              ...order,
              ...(machineId !== undefined && { machineId }),
              ...(operatorId !== undefined && { operatorId }),
              ...(updatedAt && { updatedAt })
            }
          : order
      ),
      ...(state.selectedOrder?._id === _id && {
        selectedOrder: {
          ...state.selectedOrder,
          ...(machineId !== undefined && { machineId }),
          ...(operatorId !== undefined && { operatorId }),
          ...(updatedAt && { updatedAt })
        }
      })
    };
  }
};

/**
 * Example usage in your reducer:
 *
 * const ordersReducer = (state = initialState, action: any) => {
 *   switch (action.type) {
 *     // ... existing cases ...
 *
 *     // WebSocket events
 *     case 'orders/orderCreatedViaWS':
 *       return handleOrderWebSocketEvent.orderCreated(state, action);
 *
 *     case 'orders/orderStatusChangedViaWS':
 *       return handleOrderWebSocketEvent.statusChanged(state, action);
 *
 *     case 'orders/orderPriorityChangedViaWS':
 *       return handleOrderWebSocketEvent.priorityChanged(state, action);
 *
 *     case 'orders/orderUpdatedViaWS':
 *       return handleOrderWebSocketEvent.orderUpdated(state, action);
 *
 *     case 'orders/orderDeletedViaWS':
 *       return handleOrderWebSocketEvent.orderDeleted(state, action);
 *
 *     case 'orders/orderAssignmentChangedViaWS':
 *       return handleOrderWebSocketEvent.assignmentChanged(state, action);
 *
 *     default:
 *       return state;
 *   }
 * };
 */
