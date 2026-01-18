/**
 * Order Forward Redux Actions
 * API calls for order forwarding and connection management
 */

import { Dispatch } from 'redux';
import axios from 'axios';
import * as types from './orderForwardConstants';
import { OrderForwardActionTypes } from './orderForwardTypes';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (token: string, branchId?: string | null) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "x-api-key": API_KEY
  };

  const selectedBranch = branchId || localStorage.getItem("selectedBranchId");
  if (selectedBranch) {
    headers["x-selected-branch"] = selectedBranch;
  }

  return headers;
};

// ============= CONNECTION MANAGEMENT ACTIONS =============

/**
 * Send connection request to another company
 */
export const sendConnectionRequest = (toCompanyId: string, message?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.SEND_CONNECTION_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${baseUrl}/v2/contacts/request`,
        { toCompanyId, message },
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.SEND_CONNECTION_SUCCESS,
        payload: response.data.data
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send connection request';
      dispatch({
        type: types.SEND_CONNECTION_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Respond to connection request (accept/reject/block)
 */
export const respondToConnectionRequest = (
  connectionId: string,
  action: 'accept' | 'reject' | 'block',
  responseMessage?: string
) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.RESPOND_TO_CONNECTION_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${baseUrl}/v2/contacts/respond`,
        { action, responseMessage },
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.RESPOND_TO_CONNECTION_SUCCESS,
        payload: response.data.data
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to respond to connection request';
      dispatch({
        type: types.RESPOND_TO_CONNECTION_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch all accepted connections (contacts)
 */
export const fetchConnections = () => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_CONNECTIONS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${baseUrl}/v2/contacts`,
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.FETCH_CONNECTIONS_SUCCESS,
        payload: response.data.data.connections || response.data.data
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch contacts';
      dispatch({
        type: types.FETCH_CONNECTIONS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch pending incoming connection requests
 */
export const fetchPendingRequests = () => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_PENDING_REQUESTS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${baseUrl}/v2/contacts/pending`,
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.FETCH_PENDING_REQUESTS_SUCCESS,
        payload: response.data.data.requests
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch pending requests';
      dispatch({
        type: types.FETCH_PENDING_REQUESTS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch sent outgoing connection requests
 */
export const fetchSentRequests = () => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_SENT_REQUESTS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${baseUrl}/v2/contacts/sent`,
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.FETCH_SENT_REQUESTS_SUCCESS,
        payload: response.data.data.requests
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch sent requests';
      dispatch({
        type: types.FETCH_SENT_REQUESTS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Remove a connection
 */
export const removeConnection = (connectionId: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.REMOVE_CONNECTION_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.delete(
        `${baseUrl}/v2/contacts/${connectionId}`,
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.REMOVE_CONNECTION_SUCCESS,
        payload: connectionId
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove connection';
      dispatch({
        type: types.REMOVE_CONNECTION_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

// ============= ORDER FORWARDING ACTIONS =============

/**
 * Forward an order to another branch
 */
export const forwardOrder = (orderId: string, toBranchId: string, notes?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FORWARD_ORDER_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${baseUrl}/v2/orders/${orderId}/forward`,
        { toBranchId, notes },
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.FORWARD_ORDER_SUCCESS,
        payload: response.data.data
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to forward order';
      dispatch({
        type: types.FORWARD_ORDER_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch received orders
 */
export const fetchReceivedOrders = (page: number = 1, limit: number = 20, status?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_RECEIVED_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let url = `${baseUrl}/v2/orders/received?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_RECEIVED_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch received orders';
      dispatch({
        type: types.FETCH_RECEIVED_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch forwarded orders
 */
export const fetchForwardedOrders = (page: number = 1, limit: number = 20, status?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_FORWARDED_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let url = `${baseUrl}/v2/orders/forwarded?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_FORWARDED_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch forwarded orders';
      dispatch({
        type: types.FETCH_FORWARDED_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch forwarding chain for an order
 */
export const fetchForwardingChain = (orderId: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_FORWARDING_CHAIN_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${baseUrl}/v2/orders/${orderId}/chain`,
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.FETCH_FORWARDING_CHAIN_SUCCESS,
        payload: response.data.data
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch forwarding chain';
      dispatch({
        type: types.FETCH_FORWARDING_CHAIN_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

// ============= PERSON-TO-PERSON FORWARDING ACTIONS =============

/**
 * Fetch people for forwarding (Master Admin, Admin, Manager, Employee)
 * Uses /v2/orders/forward/people endpoint which returns connected contacts with full details
 */
export const fetchPeopleForForwarding = (role?: string, search?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Use /v2/contacts which returns connected people with email, company info
      let url = `${baseUrl}/v2/contacts`;
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (search) params.append('search', search);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      console.log('📋 fetchPeopleForForwarding response:', response.data);

      // Response format: { success, data: [...people], total }
      // OR { success, contacts: [...people], total }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch contacts';
      console.error('❌ fetchPeopleForForwarding error:', error.response?.data);
      throw error;
    }
  };
};

/**
 * Forward an order to a specific person
 */
export const forwardOrderToPerson = (
  orderId: string,
  toPersonId: string,
  toPersonRole: 'master_admin' | 'admin' | 'manager' | 'employee',
  notes?: string
) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FORWARD_ORDER_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log('🚀 [forwardOrderToPerson] API Request:', {
        url: `${baseUrl}/v2/orders/${orderId}/forward-to-person`,
        method: 'POST',
        body: { toPersonId, toPersonRole, notes },
        orderId
      });

      const response = await axios.post(
        `${baseUrl}/v2/orders/${orderId}/forward-to-person`,
        { toPersonId, toPersonRole, notes },
        { headers: getAuthHeaders(token) }
      );

      console.log('✅ [forwardOrderToPerson] API Response:', {
        status: response.status,
        success: response.data?.success,
        message: response.data?.message,
        data: response.data?.data
      });

      dispatch({
        type: types.FORWARD_ORDER_SUCCESS,
        payload: response.data.data
      });

      dispatch(clearSuccess() as any);
      setTimeout(() => {
        dispatch({
          type: types.CLEAR_ORDER_FORWARD_SUCCESS
        } as any);
      }, 3000);

      return response.data;
    } catch (error: any) {
      console.error('❌ [forwardOrderToPerson] API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to forward order to person';
      dispatch({
        type: types.FORWARD_ORDER_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch received orders for current person
 */
export const fetchReceivedOrdersForPerson = (page: number = 1, limit: number = 20, status?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_RECEIVED_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let url = `${baseUrl}/v2/orders/received-person?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_RECEIVED_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch received orders';
      dispatch({
        type: types.FETCH_RECEIVED_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch forwarded orders from current person
 */
export const fetchForwardedOrdersFromPerson = (page: number = 1, limit: number = 20, status?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_FORWARDED_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let url = `${baseUrl}/v2/orders/forwarded-person?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      console.log('🔍 [fetchForwardedOrdersFromPerson] API Request:', {
        url,
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      console.log('✅ [fetchForwardedOrdersFromPerson] API Response:', {
        status: response.status,
        data: response.data,
        ordersCount: response.data?.data?.orders?.length || 0
      });

      if (response.data?.data?.orders && response.data.data.orders.length > 0) {
        console.log('📦 [fetchForwardedOrdersFromPerson] Sample Order:', response.data.data.orders[0]);
      } else {
        console.warn('⚠️ [fetchForwardedOrdersFromPerson] No orders found in response');
      }

      dispatch({
        type: types.FETCH_FORWARDED_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [fetchForwardedOrdersFromPerson] API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch forwarded orders';
      dispatch({
        type: types.FETCH_FORWARDED_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch person-to-person forwarding chain
 */
export const fetchPersonForwardingChain = (orderId: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_FORWARDING_CHAIN_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${baseUrl}/v2/orders/${orderId}/chain-person`,
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.FETCH_FORWARDING_CHAIN_SUCCESS,
        payload: response.data.data
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch person forwarding chain';
      dispatch({
        type: types.FETCH_FORWARDING_CHAIN_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

// ============= UI STATE ACTIONS =============

/**
 * Set forward modal open/closed
 */
export const setForwardModalOpen = (isOpen: boolean) => {
  return (dispatch: Dispatch<OrderForwardActionTypes>) => {
    dispatch({
      type: types.SET_FORWARD_MODAL_OPEN,
      payload: isOpen
    });
  };
};

/**
 * Set connection modal open/closed
 */
export const setConnectionModalOpen = (isOpen: boolean) => {
  return (dispatch: Dispatch<OrderForwardActionTypes>) => {
    dispatch({
      type: types.SET_CONNECTION_MODAL_OPEN,
      payload: isOpen
    });
  };
};

/**
 * Clear error message
 */
export const clearError = () => {
  return (dispatch: Dispatch<OrderForwardActionTypes>) => {
    dispatch({ type: types.CLEAR_ORDER_FORWARD_ERROR });
  };
};

/**
 * Clear success message
 */
export const clearSuccess = () => {
  return (dispatch: Dispatch<OrderForwardActionTypes>) => {
    dispatch({ type: types.CLEAR_ORDER_FORWARD_SUCCESS });
  };
};

/**
 * Search orders by email
 */
export const searchOrdersByEmail = (email: string, page: number = 1, limit: number = 20) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      const token = localStorage.getItem("authToken");
      console.log('[Redux Action] searchOrdersByEmail - Token check:', token ? 'Token exists' : 'No token found');

      if (!token) {
        console.error('[Redux Action] No authentication token found in localStorage');
        throw new Error("No authentication token found");
      }

      const url = `${baseUrl}/v2/orders/search-by-email?email=${encodeURIComponent(email)}&page=${page}&limit=${limit}`;
      console.log('[Redux Action] Making API call to:', url);
      console.log('[Redux Action] Headers:', getAuthHeaders(token));

      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      console.log('[Redux Action] Search successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[Redux Action] Search failed:', error);
      console.error('[Redux Action] Error response:', error.response?.data);
      console.error('[Redux Action] Error status:', error.response?.status);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to search by email';
      console.error('[Redux Action] Final error message:', errorMessage);
      throw error;
    }
  };
};

/**
 * Accept a forwarded order
 */
export const acceptForwardedOrder = (orderId: string, responseNote?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.ACCEPT_ORDER_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${baseUrl}/v2/orders/${orderId}/accept-forward`,
        { responseNote },
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.ACCEPT_ORDER_SUCCESS,
        payload: response.data
      });

      // Refresh pending orders after accepting (order moves to accepted)
      await (dispatch as any)(fetchPendingOrders());

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to accept order';
      dispatch({
        type: types.ACCEPT_ORDER_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Deny a forwarded order
 */
export const denyForwardedOrder = (orderId: string, responseNote: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.DENY_ORDER_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!responseNote) {
        throw new Error("Response note is required when denying an order");
      }

      const response = await axios.post(
        `${baseUrl}/v2/orders/${orderId}/deny-forward`,
        { responseNote },
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.DENY_ORDER_SUCCESS,
        payload: response.data
      });

      // Refresh pending orders after denying
      await (dispatch as any)(fetchPendingOrders());

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deny order';
      dispatch({
        type: types.DENY_ORDER_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Accept a person-forwarded order (person-to-person)
 */
export const acceptPersonForwardedOrder = (orderId: string, responseNote?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.ACCEPT_ORDER_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${baseUrl}/v2/orders/${orderId}/accept-person-forward`,
        { responseNote },
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.ACCEPT_ORDER_SUCCESS,
        payload: response.data
      });

      // Refresh received orders after accepting
      await (dispatch as any)(fetchReceivedOrdersForPerson());

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to accept person-forwarded order';
      dispatch({
        type: types.ACCEPT_ORDER_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Deny a person-forwarded order (person-to-person)
 */
export const denyPersonForwardedOrder = (orderId: string, responseNote: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.DENY_ORDER_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!responseNote) {
        throw new Error("Response note is required when denying an order");
      }

      const response = await axios.post(
        `${baseUrl}/v2/orders/${orderId}/deny-person-forward`,
        { responseNote },
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.DENY_ORDER_SUCCESS,
        payload: response.data
      });

      // Refresh received orders after denying
      await (dispatch as any)(fetchReceivedOrdersForPerson());

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deny person-forwarded order';
      dispatch({
        type: types.DENY_ORDER_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

// ============= PENDING/ACCEPTED ORDERS ACTIONS =============

/**
 * Fetch pending orders (awaiting acceptance)
 */
export const fetchPendingOrders = (page: number = 1, limit: number = 20) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_PENDING_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = `${baseUrl}/v2/orders/pending?page=${page}&limit=${limit}`;

      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_PENDING_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch pending orders';
      dispatch({
        type: types.FETCH_PENDING_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch accepted orders (orders I've accepted)
 */
export const fetchAcceptedOrders = (page: number = 1, limit: number = 20, status?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_ACCEPTED_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let url = `${baseUrl}/v2/orders/accepted?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_ACCEPTED_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch accepted orders';
      dispatch({
        type: types.FETCH_ACCEPTED_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch denied orders (orders I've denied)
 */
export const fetchDeniedOrders = (page: number = 1, limit: number = 20) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_DENIED_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = `${baseUrl}/v2/orders/denied?page=${page}&limit=${limit}`;

      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_DENIED_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch denied orders';
      dispatch({
        type: types.FETCH_DENIED_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

// ============= STATUS SYNC ACTIONS =============

/**
 * Sync status across all copies of an order
 */
export const syncOrderStatus = (orderNumber: string, newStatus: string, notes?: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.SYNC_STATUS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${baseUrl}/v2/orders/sync-status/${orderNumber}`,
        { newStatus, notes },
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.SYNC_STATUS_SUCCESS,
        payload: response.data.data
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to sync status';
      dispatch({
        type: types.SYNC_STATUS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Get full forwarding chain by orderNumber
 */
export const fetchFullChainByOrderNumber = (orderNumber: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_FORWARDING_CHAIN_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${baseUrl}/v2/orders/chain/${orderNumber}`,
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.FETCH_FORWARDING_CHAIN_SUCCESS,
        payload: response.data.data
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch forwarding chain';
      dispatch({
        type: types.FETCH_FORWARDING_CHAIN_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

// ============= ROLE-BASED ORDER FETCHING ACTIONS =============

/**
 * Fetch my orders (orders assigned to current user)
 * Employee: See only their assigned orders
 */
export const fetchMyOrders = (page: number = 1, limit: number = 100) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_MY_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = `${baseUrl}/v2/orders/role-based/my-orders?page=${page}&limit=${limit}`;
      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_MY_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders || response.data.data,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch my orders';
      dispatch({
        type: types.FETCH_MY_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch team orders (orders from employees under current manager)
 * Manager: See orders from their team members
 */
export const fetchTeamOrders = (page: number = 1, limit: number = 100) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_TEAM_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = `${baseUrl}/v2/orders/role-based/team-orders?page=${page}&limit=${limit}`;
      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_TEAM_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders || response.data.data,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch team orders';
      dispatch({
        type: types.FETCH_TEAM_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch branch orders (all orders in current branch)
 * Manager/Admin: See all orders in their current selected branch
 */
export const fetchBranchOrders = (page: number = 1, limit: number = 100) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_BRANCH_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = `${baseUrl}/v2/orders/role-based/branch-orders?page=${page}&limit=${limit}`;
      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_BRANCH_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders || response.data.data,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch branch orders';
      dispatch({
        type: types.FETCH_BRANCH_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch all branch orders (orders from all branches user has access to)
 * Admin: See orders from all branches in their branchIds array
 */
export const fetchAllBranchOrders = (page: number = 1, limit: number = 100) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_ALL_BRANCH_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = `${baseUrl}/v2/orders/role-based/all-branch-orders?page=${page}&limit=${limit}`;
      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_ALL_BRANCH_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders || response.data.data,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch all branch orders';
      dispatch({
        type: types.FETCH_ALL_BRANCH_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch company orders (all orders under product27InfinityId)
 * Master Admin: See all orders in the entire company
 */
export const fetchCompanyOrders = (page: number = 1, limit: number = 100) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_COMPANY_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = `${baseUrl}/v2/orders/role-based/company-orders?page=${page}&limit=${limit}`;
      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_COMPANY_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders || response.data.data,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch company orders';
      dispatch({
        type: types.FETCH_COMPANY_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

/**
 * Fetch shared orders (person-to-person forwarded orders)
 * All Roles: See orders that have been shared directly with them
 */
export const fetchSharedOrders = (page: number = 1, limit: number = 100) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.FETCH_SHARED_ORDERS_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Use the existing person-to-person endpoint
      const url = `${baseUrl}/v2/orders/received-person?page=${page}&limit=${limit}`;
      const response = await axios.get(url, { headers: getAuthHeaders(token) });

      dispatch({
        type: types.FETCH_SHARED_ORDERS_SUCCESS,
        payload: {
          orders: response.data.data.orders || response.data.data,
          pagination: response.data.data.pagination
        }
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch shared orders';
      dispatch({
        type: types.FETCH_SHARED_ORDERS_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};

// ============= ORDER CANCELLATION ACTION =============

/**
 * Cancel an order
 * Allowed for: master_admin, admin, manager
 */
export const cancelOrder = (orderId: string, reason: string) => {
  return async (dispatch: Dispatch<OrderForwardActionTypes>) => {
    try {
      dispatch({ type: types.CANCEL_ORDER_REQUEST });

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!reason || !reason.trim()) {
        throw new Error("Cancellation reason is required");
      }

      const response = await axios.post(
        `${baseUrl}/v2/orders/${orderId}/cancel`,
        { reason },
        { headers: getAuthHeaders(token) }
      );

      dispatch({
        type: types.CANCEL_ORDER_SUCCESS,
        payload: response.data
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel order';
      dispatch({
        type: types.CANCEL_ORDER_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };
};
