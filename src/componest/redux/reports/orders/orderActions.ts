// orderActions.ts - Order Actions matching MongoDB Schema
import { Dispatch } from 'redux';
import axios from 'axios';
import {
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
  FETCH_ORDER_BY_ID_REQUEST,
  FETCH_ORDER_BY_ID_SUCCESS,
  FETCH_ORDER_BY_ID_FAILURE,
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  UPDATE_ORDER_REQUEST,
  UPDATE_ORDER_SUCCESS,
  UPDATE_ORDER_FAILURE,
  DELETE_ORDER_REQUEST,
  DELETE_ORDER_SUCCESS,
  DELETE_ORDER_FAILURE,
  UPDATE_ORDER_STATUS_REQUEST,
  UPDATE_ORDER_STATUS_SUCCESS,
  UPDATE_ORDER_STATUS_FAILURE,
  COMPLETE_MACHINE_REQUEST,
  COMPLETE_MACHINE_SUCCESS,
  COMPLETE_MACHINE_FAILURE,
  PROGRESS_TO_NEXT_STEP_REQUEST,
  PROGRESS_TO_NEXT_STEP_SUCCESS,
  PROGRESS_TO_NEXT_STEP_FAILURE,
  UPDATE_REALTIME_DATA_REQUEST,
  UPDATE_REALTIME_DATA_SUCCESS,
  UPDATE_REALTIME_DATA_FAILURE,
  ADD_ORDER_NOTE_REQUEST,
  ADD_ORDER_NOTE_SUCCESS,
  ADD_ORDER_NOTE_FAILURE,
  UPDATE_QUALITY_CONTROL_REQUEST,
  UPDATE_QUALITY_CONTROL_SUCCESS,
  UPDATE_QUALITY_CONTROL_FAILURE,
  FETCH_DASHBOARD_DATA_REQUEST,
  FETCH_DASHBOARD_DATA_SUCCESS,
  FETCH_DASHBOARD_DATA_FAILURE,
  FETCH_EFFICIENCY_REPORT_REQUEST,
  FETCH_EFFICIENCY_REPORT_SUCCESS,
  FETCH_EFFICIENCY_REPORT_FAILURE,
  SET_ORDER_FILTERS,
  CLEAR_ORDER_FILTERS,
  SET_CURRENT_ORDER,
  CLEAR_CURRENT_ORDER,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_SUCCESS_MESSAGE,
  CLEAR_SUCCESS_MESSAGE,
} from './orderConstants';
import {
  OrderActionTypes,
  Order,
  OrderFilters,
  QualityControl,
} from './orderTypes';
import { RootState } from '../rootReducer';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
});

const getToken = (getState: () => RootState) => {
  // cast to any to safely access possible auth locations without TypeScript error
  const state: any = getState();
  // try multiple common locations and fall back to localStorage
  return (
    state?.auth?.token ||
    state?.authToken ||
    state?.orders?.auth?.token ||
    state?.orders?.token ||
    localStorage.getItem("authToken")
  );
};

const getBranchId = () => localStorage.getItem("selectedBranch");

// ==================== CRUD Operations ====================

// Fetch all orders with filters
export const fetchOrders = (filters?: OrderFilters) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_ORDERS_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const branchId = getBranchId();
      const params: any = { ...filters };
      
      if (branchId && !params.branchId) {
        params.branchId = branchId;
      }

      // Clean undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      console.log('Fetching orders with params:', params);

      const response = await axios.get(`${baseUrl}/orders`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      dispatch({
        type: FETCH_ORDERS_SUCCESS,
        payload: response.data,
      });

      dispatch({ type: SET_LOADING, payload: false });
      return response.data;

    } catch (error: any) {
      console.error("Error fetching orders:", error);
      
      let errorMessage = "Failed to fetch orders";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_ORDERS_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// Fetch single order by ID
export const fetchOrderById = (orderId: string) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_ORDER_BY_ID_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Fetching order:', orderId);

      const response = await axios.get(`${baseUrl}/orders/${orderId}`, {
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const order = response.data.data?.order || response.data.order;

      dispatch({
        type: FETCH_ORDER_BY_ID_SUCCESS,
        payload: order,
      });

      dispatch({ type: SET_CURRENT_ORDER, payload: order });
      dispatch({ type: SET_LOADING, payload: false });
      
      return order;

    } catch (error: any) {
      console.error("Error fetching order:", error);
      
      let errorMessage = "Failed to fetch order";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_ORDER_BY_ID_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// Create new order
export const createOrder = (orderData: Partial<Order>) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: CREATE_ORDER_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Creating order:', orderData);

      const response = await axios.post(
        `${baseUrl}/orders`,
        orderData,
        {
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const order = response.data.data?.order || response.data.order;

      dispatch({
        type: CREATE_ORDER_SUCCESS,
        payload: order,
      });

      dispatch({ 
        type: SET_SUCCESS_MESSAGE, 
        payload: `Order ${order.orderId} created successfully!` 
      });
      
      dispatch({ type: SET_LOADING, payload: false });
      
      return order;

    } catch (error: any) {
      console.error("Error creating order:", error);
      
      let errorMessage = "Failed to create order";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: CREATE_ORDER_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// Update order
export const updateOrder = (orderId: string, orderData: Partial<Order>) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: UPDATE_ORDER_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Updating order:', orderId, orderData);

      const response = await axios.put(
        `${baseUrl}/orders/${orderId}`,
        orderData,
        {
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const order = response.data.data?.order || response.data.order;

      dispatch({
        type: UPDATE_ORDER_SUCCESS,
        payload: order,
      });

      dispatch({ 
        type: SET_SUCCESS_MESSAGE, 
        payload: `Order ${order.orderId} updated successfully!` 
      });
      
      dispatch({ type: SET_LOADING, payload: false });
      
      return order;

    } catch (error: any) {
      console.error("Error updating order:", error);
      
      let errorMessage = "Failed to update order";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: UPDATE_ORDER_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// Delete order
export const deleteOrder = (orderId: string) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: DELETE_ORDER_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Deleting order:', orderId);

      await axios.delete(`${baseUrl}/orders/${orderId}`, {
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      dispatch({
        type: DELETE_ORDER_SUCCESS,
        payload: orderId,
      });

      dispatch({ 
        type: SET_SUCCESS_MESSAGE, 
        payload: 'Order deleted successfully!' 
      });
      
      dispatch({ type: SET_LOADING, payload: false });

    } catch (error: any) {
      console.error("Error deleting order:", error);
      
      let errorMessage = "Failed to delete order";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: DELETE_ORDER_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// ==================== Status Management ====================

// Update order status
export const updateOrderStatus = (orderId: string, status: Order['overallStatus']) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: UPDATE_ORDER_STATUS_REQUEST });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Updating order status:', orderId, status);

      const response = await axios.patch(
        `${baseUrl}/orders/${orderId}/status`,
        { status },
        {
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const order = response.data.data?.order || response.data.order;

      dispatch({
        type: UPDATE_ORDER_STATUS_SUCCESS,
        payload: order,
      });

      dispatch({ 
        type: SET_SUCCESS_MESSAGE, 
        payload: `Order status updated to ${status}` 
      });
      
      return order;

    } catch (error: any) {
      console.error("Error updating order status:", error);
      
      let errorMessage = "Failed to update order status";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: UPDATE_ORDER_STATUS_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      
      throw error;
    }
  };

// ==================== Machine Operations ====================

// Complete current machine in step
export const completeCurrentMachine = (orderId: string, stepIndex: number) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: COMPLETE_MACHINE_REQUEST });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Completing machine:', orderId, stepIndex);

      const response = await axios.post(
        `${baseUrl}/orders/${orderId}/complete-machine`,
        { stepIndex },
        {
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const order = response.data.data?.order || response.data.order;

      dispatch({
        type: COMPLETE_MACHINE_SUCCESS,
        payload: order,
      });

      dispatch({ 
        type: SET_SUCCESS_MESSAGE, 
        payload: 'Machine completed successfully' 
      });
      
      return order;

    } catch (error: any) {
      console.error("Error completing machine:", error);
      
      let errorMessage = "Failed to complete machine";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: COMPLETE_MACHINE_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      
      throw error;
    }
  };

// ==================== Step Operations ====================

// Progress to next step
export const progressToNextStep = (orderId: string) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: PROGRESS_TO_NEXT_STEP_REQUEST });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Progressing to next step:', orderId);

      const response = await axios.post(
        `${baseUrl}/orders/${orderId}/next-step`,
        {},
        {
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const order = response.data.data?.order || response.data.order;

      dispatch({
        type: PROGRESS_TO_NEXT_STEP_SUCCESS,
        payload: order,
      });

      dispatch({ 
        type: SET_SUCCESS_MESSAGE, 
        payload: 'Progressed to next step successfully' 
      });
      
      return order;

    } catch (error: any) {
      console.error("Error progressing to next step:", error);
      
      let errorMessage = "Failed to progress to next step";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: PROGRESS_TO_NEXT_STEP_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      
      throw error;
    }
  };

// ==================== Real-time Data ====================

// Update real-time data from machine tables
export const updateRealTimeData = (orderId: string) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: UPDATE_REALTIME_DATA_REQUEST });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Updating real-time data:', orderId);

      const response = await axios.post(
        `${baseUrl}/orders/${orderId}/update-realtime`,
        {},
        {
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const order = response.data.data?.order || response.data.order;

      dispatch({
        type: UPDATE_REALTIME_DATA_SUCCESS,
        payload: order,
      });
      
      return order;

    } catch (error: any) {
      console.error("Error updating real-time data:", error);
      
      let errorMessage = "Failed to update real-time data";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: UPDATE_REALTIME_DATA_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      
      throw error;
    }
  };

// ==================== Notes ====================

// Add note to order
export const addOrderNote = (
  orderId: string, 
  message: string, 
  createdBy: string, 
  noteType: 'general' | 'production' | 'quality' | 'delivery' | 'customer' = 'general'
) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: ADD_ORDER_NOTE_REQUEST });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Adding note to order:', orderId);

      const response = await axios.post(
        `${baseUrl}/orders/${orderId}/notes`,
        { message, createdBy, noteType },
        {
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const order = response.data.data?.order || response.data.order;

      dispatch({
        type: ADD_ORDER_NOTE_SUCCESS,
        payload: order,
      });

      dispatch({ 
        type: SET_SUCCESS_MESSAGE, 
        payload: 'Note added successfully' 
      });
      
      return order;

    } catch (error: any) {
      console.error("Error adding note:", error);
      
      let errorMessage = "Failed to add note";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: ADD_ORDER_NOTE_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      
      throw error;
    }
  };

// ==================== Quality Control ====================

// Update quality control
export const updateQualityControl = (orderId: string, qualityData: Partial<QualityControl>) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: UPDATE_QUALITY_CONTROL_REQUEST });

      const token = getToken(getState);
      if (!token) {
        throw new Error("Authentication token missing");
      }

      console.log('Updating quality control:', orderId);

      const response = await axios.patch(
        `${baseUrl}/orders/${orderId}/quality-control`,
        qualityData,
        {
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const order = response.data.data?.order || response.data.order;

      dispatch({
        type: UPDATE_QUALITY_CONTROL_SUCCESS,
        payload: order,
      });

      dispatch({ 
        type: SET_SUCCESS_MESSAGE, 
        payload: 'Quality control updated successfully' 
      });
      
      return order;

    } catch (error: any) {
      console.error("Error updating quality control:", error);
      
      let errorMessage = "Failed to update quality control";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: UPDATE_QUALITY_CONTROL_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      
      throw error;
    }
  };

// ==================== Dashboard and Reports ====================

// Fetch dashboard data
export const fetchDashboardData = (dateRange: number = 30) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_DASHBOARD_DATA_REQUEST });

      const token = getToken(getState);
      const branchId = getBranchId();
      
      if (!token) {
        throw new Error("Authentication token missing");
      }
      
      if (!branchId) {
        throw new Error("Branch ID missing");
      }

      console.log('Fetching dashboard data for branch:', branchId);

      const response = await axios.get(
        `${baseUrl}/orders/dashboard/${branchId}`,
        {
          params: { dateRange },
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const dashboardData = response.data.data || response.data;

      dispatch({
        type: FETCH_DASHBOARD_DATA_SUCCESS,
        payload: dashboardData,
      });
      
      return dashboardData;

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      
      let errorMessage = "Failed to fetch dashboard data";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_DASHBOARD_DATA_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      
      throw error;
    }
  };

// Fetch efficiency report
export const fetchEfficiencyReport = (startDate: string, endDate: string) =>
  async (dispatch: Dispatch<OrderActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_EFFICIENCY_REPORT_REQUEST });

      const token = getToken(getState);
      const branchId = getBranchId();
      
      if (!token) {
        throw new Error("Authentication token missing");
      }
      
      if (!branchId) {
        throw new Error("Branch ID missing");
      }

      console.log('Fetching efficiency report:', { branchId, startDate, endDate });

      const response = await axios.get(
        `${baseUrl}/orders/efficiency-report/${branchId}`,
        {
          params: { startDate, endDate },
          headers: getAuthHeaders(token),
          timeout: 30000,
        }
      );

      const efficiencyReport = response.data.data || response.data;

      dispatch({
        type: FETCH_EFFICIENCY_REPORT_SUCCESS,
        payload: efficiencyReport,
      });
      
      return efficiencyReport;

    } catch (error: any) {
      console.error("Error fetching efficiency report:", error);
      
      let errorMessage = "Failed to fetch efficiency report";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_EFFICIENCY_REPORT_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      
      throw error;
    }
  };

// ==================== Filters and State Management ====================

export const setOrderFilters = (filters: OrderFilters): OrderActionTypes => ({
  type: SET_ORDER_FILTERS,
  payload: filters,
});

export const clearOrderFilters = (): OrderActionTypes => ({
  type: CLEAR_ORDER_FILTERS,
});

export const setCurrentOrder = (order: Order): OrderActionTypes => ({
  type: SET_CURRENT_ORDER,
  payload: order,
});

export const clearCurrentOrder = (): OrderActionTypes => ({
  type: CLEAR_CURRENT_ORDER,
});

export const setLoading = (loading: boolean): OrderActionTypes => ({
  type: SET_LOADING,
  payload: loading,
});

export const setError = (error: string): OrderActionTypes => ({
  type: SET_ERROR,
  payload: error,
});

export const clearError = (): OrderActionTypes => ({
  type: CLEAR_ERROR,
});

export const setSuccessMessage = (message: string): OrderActionTypes => ({
  type: SET_SUCCESS_MESSAGE,
  payload: message,
});

export const clearSuccessMessage = (): OrderActionTypes => ({
  type: CLEAR_SUCCESS_MESSAGE,
});
