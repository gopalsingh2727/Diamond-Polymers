// reportActions.ts - Report Actions
import { Dispatch } from 'redux';
import axios from 'axios';
import {
  FETCH_OVERVIEW_REQUEST,
  FETCH_OVERVIEW_SUCCESS,
  FETCH_OVERVIEW_FAILURE,
  FETCH_ORDERS_REPORT_REQUEST,
  FETCH_ORDERS_REPORT_SUCCESS,
  FETCH_ORDERS_REPORT_FAILURE,
  FETCH_PRODUCTION_REQUEST,
  FETCH_PRODUCTION_SUCCESS,
  FETCH_PRODUCTION_FAILURE,
  FETCH_MACHINES_REQUEST,
  FETCH_MACHINES_SUCCESS,
  FETCH_MACHINES_FAILURE,
  FETCH_CUSTOMERS_REQUEST,
  FETCH_CUSTOMERS_SUCCESS,
  FETCH_CUSTOMERS_FAILURE,
  FETCH_MATERIALS_REQUEST,
  FETCH_MATERIALS_SUCCESS,
  FETCH_MATERIALS_FAILURE,
  SET_DATE_RANGE,
  SET_STATUS_FILTER,
  SET_PRIORITY_FILTER,
  SET_MACHINE_TYPE_FILTER,
  SET_MATERIAL_TYPE_FILTER,
  CLEAR_FILTERS,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_SUCCESS_MESSAGE,
  CLEAR_SUCCESS_MESSAGE,
  SET_ACTIVE_TAB,
  SET_BRANCH,
} from './reportConstants';
import { ReportActionTypes, DateRange, BranchState } from './reportTypes';
import { RootState } from '../rootReducer';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
});

const getToken = (getState: () => RootState) =>
  getState().auth?.token || localStorage.getItem("authToken");

const getBranchId = () => localStorage.getItem("selectedBranch");

// Fetch Overview Report Data
export const fetchOverviewReport = (dateRange?: DateRange) =>
  async (dispatch: Dispatch<ReportActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_OVERVIEW_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      if (!branchId) {
        throw new Error("Branch ID missing");
      }

      // Build query params
      const params: any = { branchId };
      if (dateRange) {
        params.startDate = dateRange.from.toISOString();
        params.endDate = dateRange.to.toISOString();
      }

      console.log("Fetching overview report with params:", params);

      // Fetch orders
      const ordersResponse = await axios.get(`${baseUrl}/orders`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      // Fetch efficiency trends (if you have a separate endpoint)
      // const efficiencyResponse = await axios.get(`${baseUrl}/reports/efficiency`, {
      //   params,
      //   headers: getAuthHeaders(token),
      // });

      // Fetch production output (if you have a separate endpoint)
      // const productionResponse = await axios.get(`${baseUrl}/reports/production`, {
      //   params,
      //   headers: getAuthHeaders(token),
      // });

      // For now, we'll extract data from orders response
      const orders = ordersResponse.data?.data?.orders || ordersResponse.data?.orders || [];

      // Calculate efficiency trends from orders
      const efficiencyTrends = calculateEfficiencyTrends(orders, dateRange);
      
      // Calculate production output from orders
      const productionOutput = calculateProductionOutput(orders, dateRange);

      dispatch({
        type: FETCH_OVERVIEW_SUCCESS,
        payload: {
          orders,
          efficiencyTrends,
          productionOutput,
        },
      });

      dispatch({ type: SET_LOADING, payload: false });
      return { orders, efficiencyTrends, productionOutput };

    } catch (error: any) {
      console.error("Error fetching overview report:", error);
      
      let errorMessage = "Failed to fetch overview report";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_OVERVIEW_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// Fetch Orders Report Data
export const fetchOrdersReport = (filters?: any) =>
  async (dispatch: Dispatch<ReportActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_ORDERS_REPORT_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const params: any = { branchId };
      
      // Add filters
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== 'all') {
            params[key] = filters[key];
          }
        });
      }

      console.log("Fetching orders report with params:", params);

      const response = await axios.get(`${baseUrl}/orders`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const orders = response.data?.data?.orders || response.data?.orders || [];

      dispatch({
        type: FETCH_ORDERS_REPORT_SUCCESS,
        payload: orders,
      });

      dispatch({ type: SET_LOADING, payload: false });
      return orders;

    } catch (error: any) {
      console.error("Error fetching orders report:", error);
      
      let errorMessage = "Failed to fetch orders report";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_ORDERS_REPORT_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// Fetch Production Report Data
export const fetchProductionReport = (filters?: any) =>
  async (dispatch: Dispatch<ReportActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_PRODUCTION_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const params: any = { branchId };
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== 'all') {
            params[key] = filters[key];
          }
        });
      }

      console.log("Fetching production report with params:", params);

      // Fetch orders
      const ordersResponse = await axios.get(`${baseUrl}/orders`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      // Fetch materials
      const materialsResponse = await axios.get(`${baseUrl}/materials`, {
        params: { branchId },
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const orders = ordersResponse.data?.data?.orders || ordersResponse.data?.orders || [];
      const materials = materialsResponse.data?.data?.materials || materialsResponse.data?.materials || [];
      
      // Calculate production output
      const productionOutput = calculateProductionOutput(orders, filters?.dateRange);

      dispatch({
        type: FETCH_PRODUCTION_SUCCESS,
        payload: {
          orders,
          materials,
          productionOutput,
        },
      });

      dispatch({ type: SET_LOADING, payload: false });
      return { orders, materials, productionOutput };

    } catch (error: any) {
      console.error("Error fetching production report:", error);
      
      let errorMessage = "Failed to fetch production report";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_PRODUCTION_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// Fetch Machines Report Data
export const fetchMachinesReport = (filters?: any) =>
  async (dispatch: Dispatch<ReportActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_MACHINES_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const params: any = { branchId };
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== 'all') {
            params[key] = filters[key];
          }
        });
      }

      console.log("Fetching machines report with params:", params);

      const response = await axios.get(`${baseUrl}/machines`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const machines = response.data?.data?.machines || response.data?.machines || [];
      
      // Calculate machine utilization
      const machineUtilization = calculateMachineUtilization(machines, filters?.dateRange);

      dispatch({
        type: FETCH_MACHINES_SUCCESS,
        payload: {
          machines,
          machineUtilization,
        },
      });

      dispatch({ type: SET_LOADING, payload: false });
      return { machines, machineUtilization };

    } catch (error: any) {
      console.error("Error fetching machines report:", error);
      
      let errorMessage = "Failed to fetch machines report";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_MACHINES_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// Fetch Customers Report Data
export const fetchCustomersReport = (filters?: any) =>
  async (dispatch: Dispatch<ReportActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_CUSTOMERS_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken(getState);
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const params: any = { branchId };
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== 'all') {
            params[key] = filters[key];
          }
        });
      }

      console.log("Fetching customers report with params:", params);

      // Fetch customers
      const customersResponse = await axios.get(`${baseUrl}/customers`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      // Fetch orders for customer analysis
      const ordersResponse = await axios.get(`${baseUrl}/orders`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const customers = customersResponse.data?.data?.customers || customersResponse.data?.customers || [];
      const orders = ordersResponse.data?.data?.orders || ordersResponse.data?.orders || [];

      dispatch({
        type: FETCH_CUSTOMERS_SUCCESS,
        payload: {
          customers,
          orders,
        },
      });

      dispatch({ type: SET_LOADING, payload: false });
      return { customers, orders };

    } catch (error: any) {
      console.error("Error fetching customers report:", error);
      
      let errorMessage = "Failed to fetch customers report";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_CUSTOMERS_FAILURE,
        payload: errorMessage,
      });

      dispatch({ type: SET_ERROR, payload: errorMessage });
      dispatch({ type: SET_LOADING, payload: false });
      
      throw error;
    }
  };

// Fetch Materials
export const fetchMaterials = () =>
  async (dispatch: Dispatch<ReportActionTypes>, getState: () => RootState) => {
    try {
      dispatch({ type: FETCH_MATERIALS_REQUEST });

      const token = getToken(getState);
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const response = await axios.get(`${baseUrl}/materials`, {
        params: { branchId },
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const materials = response.data?.data?.materials || response.data?.materials || [];

      dispatch({
        type: FETCH_MATERIALS_SUCCESS,
        payload: materials,
      });

      return materials;

    } catch (error: any) {
      console.error("Error fetching materials:", error);
      
      let errorMessage = "Failed to fetch materials";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      dispatch({
        type: FETCH_MATERIALS_FAILURE,
        payload: errorMessage,
      });
      
      throw error;
    }
  };

// Helper Functions
const calculateEfficiencyTrends = (orders: any[], dateRange?: DateRange) => {
  // Group orders by date and calculate average efficiency
  const trends: { [key: string]: { total: number; count: number; orders: number } } = {};
  
  orders.forEach(order => {
    if (order.realTimeData?.overallEfficiency > 0) {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { total: 0, count: 0, orders: 0 };
      }
      trends[date].total += order.realTimeData.overallEfficiency;
      trends[date].count += 1;
      trends[date].orders += 1;
    }
  });

  return Object.keys(trends)
    .sort()
    .slice(-7) // Last 7 days
    .map(date => ({
      date,
      efficiency: Math.round(trends[date].total / trends[date].count * 10) / 10,
      orders: trends[date].orders,
    }));
};

const calculateProductionOutput = (orders: any[], dateRange?: DateRange) => {
  const output: { [key: string]: { netWeight: number; wastage: number } } = {};
  
  orders.forEach(order => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    if (!output[date]) {
      output[date] = { netWeight: 0, wastage: 0 };
    }
    output[date].netWeight += order.realTimeData?.totalNetWeight || 0;
    output[date].wastage += order.realTimeData?.totalWastage || 0;
  });

  return Object.keys(output)
    .sort()
    .slice(-7) // Last 7 days
    .map(date => ({
      date,
      netWeight: Math.round(output[date].netWeight),
      wastage: Math.round(output[date].wastage),
    }));
};

const calculateMachineUtilization = (machines: any[], dateRange?: DateRange) => {
  // This would typically come from your machine tracking system
  // For now, return sample data structure
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return last7Days.map(date => ({
    date,
    utilizationRate: Math.random() * 30 + 70, // Sample data 70-100%
    activeHours: Math.random() * 8 + 16, // Sample data 16-24 hours
    totalHours: 24,
  }));
};

// Filter Actions
export const setDateRange = (dateRange: DateRange): ReportActionTypes => ({
  type: SET_DATE_RANGE,
  payload: dateRange,
});

export const setStatusFilter = (status: string): ReportActionTypes => ({
  type: SET_STATUS_FILTER,
  payload: status,
});

export const setPriorityFilter = (priority: string): ReportActionTypes => ({
  type: SET_PRIORITY_FILTER,
  payload: priority,
});

export const setMachineTypeFilter = (machineType: string): ReportActionTypes => ({
  type: SET_MACHINE_TYPE_FILTER,
  payload: machineType,
});

export const setMaterialTypeFilter = (materialType: string): ReportActionTypes => ({
  type: SET_MATERIAL_TYPE_FILTER,
  payload: materialType,
});

export const clearFilters = (): ReportActionTypes => ({
  type: CLEAR_FILTERS,
});

// UI Actions
export const setLoading = (loading: boolean): ReportActionTypes => ({
  type: SET_LOADING,
  payload: loading,
});

export const setError = (error: string): ReportActionTypes => ({
  type: SET_ERROR,
  payload: error,
});

export const clearError = (): ReportActionTypes => ({
  type: CLEAR_ERROR,
});

export const setSuccessMessage = (message: string): ReportActionTypes => ({
  type: SET_SUCCESS_MESSAGE,
  payload: message,
});

export const clearSuccessMessage = (): ReportActionTypes => ({
  type: CLEAR_SUCCESS_MESSAGE,
});

export const setActiveTab = (tab: string): ReportActionTypes => ({
  type: SET_ACTIVE_TAB,
  payload: tab,
});

export const setBranch = (branch: BranchState): ReportActionTypes => ({
  type: SET_BRANCH,
  payload: branch,
});
