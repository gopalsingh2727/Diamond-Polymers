/**
 * Order Forward Redux Reducer
 * State management for order forwarding and connection management
 */

import * as types from './orderForwardConstants';
import { OrderForwardState, OrderForwardActionTypes } from './orderForwardTypes';

const initialState: OrderForwardState = {
  // Connection management
  connections: [],
  pendingRequests: [],
  sentRequests: [],
  connectionsLoading: false,

  // Received orders
  receivedOrders: [],
  receivedOrdersPagination: null,
  receivedOrdersLoading: false,

  // Forwarded orders
  forwardedOrders: [],
  forwardedOrdersPagination: null,
  forwardedOrdersLoading: false,

  // Pending orders (awaiting acceptance)
  pendingOrders: [],
  pendingOrdersPagination: null,
  pendingOrdersLoading: false,

  // Accepted orders (orders I've accepted)
  acceptedOrders: [],
  acceptedOrdersPagination: null,
  acceptedOrdersLoading: false,

  // Denied orders (orders I've denied)
  deniedOrders: [],
  deniedOrdersPagination: null,
  deniedOrdersLoading: false,

  // Forwarding chain
  forwardingChain: null,
  forwardingChainLoading: false,

  // UI state
  forwardModalOpen: false,
  connectionModalOpen: false,

  // Async state
  loading: false,
  error: null,
  successMessage: null
};

const orderForwardReducer = (
  state = initialState,
  action: OrderForwardActionTypes
): OrderForwardState => {
  switch (action.type) {
    // ============= CONNECTION MANAGEMENT =============

    case types.SEND_CONNECTION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.SEND_CONNECTION_SUCCESS:
      return {
        ...state,
        loading: false,
        sentRequests: [...state.sentRequests, action.payload],
        successMessage: 'Connection request sent successfully'
      };

    case types.SEND_CONNECTION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case types.RESPOND_TO_CONNECTION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.RESPOND_TO_CONNECTION_SUCCESS:
      return {
        ...state,
        loading: false,
        pendingRequests: state.pendingRequests.filter(
          req => req._id !== action.payload._id
        ),
        connections: action.payload.status === 'accepted'
          ? [...state.connections, action.payload]
          : state.connections,
        successMessage: `Connection request ${action.payload.status} successfully`
      };

    case types.RESPOND_TO_CONNECTION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case types.FETCH_CONNECTIONS_REQUEST:
      return {
        ...state,
        connectionsLoading: true,
        error: null
      };

    case types.FETCH_CONNECTIONS_SUCCESS:
      return {
        ...state,
        connectionsLoading: false,
        connections: action.payload
      };

    case types.FETCH_CONNECTIONS_FAILURE:
      return {
        ...state,
        connectionsLoading: false,
        error: action.payload
      };

    case types.FETCH_PENDING_REQUESTS_REQUEST:
      return {
        ...state,
        connectionsLoading: true,
        error: null
      };

    case types.FETCH_PENDING_REQUESTS_SUCCESS:
      return {
        ...state,
        connectionsLoading: false,
        pendingRequests: action.payload
      };

    case types.FETCH_PENDING_REQUESTS_FAILURE:
      return {
        ...state,
        connectionsLoading: false,
        error: action.payload
      };

    case types.FETCH_SENT_REQUESTS_REQUEST:
      return {
        ...state,
        connectionsLoading: true,
        error: null
      };

    case types.FETCH_SENT_REQUESTS_SUCCESS:
      return {
        ...state,
        connectionsLoading: false,
        sentRequests: action.payload
      };

    case types.FETCH_SENT_REQUESTS_FAILURE:
      return {
        ...state,
        connectionsLoading: false,
        error: action.payload
      };

    case types.REMOVE_CONNECTION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.REMOVE_CONNECTION_SUCCESS:
      return {
        ...state,
        loading: false,
        connections: state.connections.filter(
          conn => conn._id !== action.payload
        ),
        successMessage: 'Connection removed successfully'
      };

    case types.REMOVE_CONNECTION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ============= ORDER FORWARDING =============

    case types.FORWARD_ORDER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.FORWARD_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        forwardedOrders: [action.payload.forwardedOrder, ...state.forwardedOrders],
        successMessage: 'Order forwarded successfully',
        forwardModalOpen: false
      };

    case types.FORWARD_ORDER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case types.FETCH_RECEIVED_ORDERS_REQUEST:
      return {
        ...state,
        receivedOrdersLoading: true,
        error: null
      };

    case types.FETCH_RECEIVED_ORDERS_SUCCESS:
      return {
        ...state,
        receivedOrdersLoading: false,
        receivedOrders: action.payload.orders,
        receivedOrdersPagination: action.payload.pagination
      };

    case types.FETCH_RECEIVED_ORDERS_FAILURE:
      return {
        ...state,
        receivedOrdersLoading: false,
        error: action.payload
      };

    case types.FETCH_FORWARDED_ORDERS_REQUEST:
      return {
        ...state,
        forwardedOrdersLoading: true,
        error: null
      };

    case types.FETCH_FORWARDED_ORDERS_SUCCESS:
      return {
        ...state,
        forwardedOrdersLoading: false,
        forwardedOrders: action.payload.orders,
        forwardedOrdersPagination: action.payload.pagination
      };

    case types.FETCH_FORWARDED_ORDERS_FAILURE:
      return {
        ...state,
        forwardedOrdersLoading: false,
        error: action.payload
      };

    case types.FETCH_FORWARDING_CHAIN_REQUEST:
      return {
        ...state,
        forwardingChainLoading: true,
        error: null
      };

    case types.FETCH_FORWARDING_CHAIN_SUCCESS:
      return {
        ...state,
        forwardingChainLoading: false,
        forwardingChain: action.payload
      };

    case types.FETCH_FORWARDING_CHAIN_FAILURE:
      return {
        ...state,
        forwardingChainLoading: false,
        error: action.payload
      };

    // ============= ORDER ACCEPTANCE =============

    case types.FETCH_PENDING_ORDERS_REQUEST:
      return {
        ...state,
        pendingOrdersLoading: true,
        error: null
      };

    case types.FETCH_PENDING_ORDERS_SUCCESS:
      return {
        ...state,
        pendingOrdersLoading: false,
        pendingOrders: action.payload.orders,
        pendingOrdersPagination: action.payload.pagination
      };

    case types.FETCH_PENDING_ORDERS_FAILURE:
      return {
        ...state,
        pendingOrdersLoading: false,
        error: action.payload
      };

    case types.FETCH_ACCEPTED_ORDERS_REQUEST:
      return {
        ...state,
        acceptedOrdersLoading: true,
        error: null
      };

    case types.FETCH_ACCEPTED_ORDERS_SUCCESS:
      return {
        ...state,
        acceptedOrdersLoading: false,
        acceptedOrders: action.payload.orders,
        acceptedOrdersPagination: action.payload.pagination
      };

    case types.FETCH_ACCEPTED_ORDERS_FAILURE:
      return {
        ...state,
        acceptedOrdersLoading: false,
        error: action.payload
      };

    case types.FETCH_DENIED_ORDERS_REQUEST:
      return {
        ...state,
        deniedOrdersLoading: true,
        error: null
      };

    case types.FETCH_DENIED_ORDERS_SUCCESS:
      return {
        ...state,
        deniedOrdersLoading: false,
        deniedOrders: action.payload.orders,
        deniedOrdersPagination: action.payload.pagination
      };

    case types.FETCH_DENIED_ORDERS_FAILURE:
      return {
        ...state,
        deniedOrdersLoading: false,
        error: action.payload
      };

    case types.ACCEPT_ORDER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.ACCEPT_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: 'Order accepted successfully'
      };

    case types.ACCEPT_ORDER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case types.DENY_ORDER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.DENY_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: 'Order denied'
      };

    case types.DENY_ORDER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ============= STATUS SYNC =============

    case types.SYNC_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.SYNC_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: `Status synced across ${action.payload.modifiedCount} copies`
      };

    case types.SYNC_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ============= UI STATE =============

    case types.SET_FORWARD_MODAL_OPEN:
      return {
        ...state,
        forwardModalOpen: action.payload
      };

    case types.SET_CONNECTION_MODAL_OPEN:
      return {
        ...state,
        connectionModalOpen: action.payload
      };

    case types.CLEAR_ORDER_FORWARD_ERROR:
      return {
        ...state,
        error: null
      };

    case types.CLEAR_ORDER_FORWARD_SUCCESS:
      return {
        ...state,
        successMessage: null
      };

    default:
      return state;
  }
};

export default orderForwardReducer;
