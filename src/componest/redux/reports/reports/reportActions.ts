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

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
});

const getToken = () => localStorage.getItem("authToken");

const getBranchId = () => {
  const branchId = localStorage.getItem("selectedBranch");
  // Return null if viewing all branches or if not set
  if (!branchId || branchId === "all" || branchId === "null") {
    return null;
  }
  return branchId;
};

// Fetch Overview Report Data
export const fetchOverviewReport = (dateRange?: DateRange) =>
  async (dispatch: Dispatch<ReportActionTypes>) => {
    try {
      dispatch({ type: FETCH_OVERVIEW_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken();
      const branchId = getBranchId();

      if (!token) {
        throw new Error("You are not logged in. Please login to view reports.");
      }

      // Validate token format (JWT tokens have 3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error("Invalid authentication token. Please login again.");
      }

      // Build query params - branchId is optional for viewing all branches
      const params: any = {};
      if (branchId) {
        params.branchId = branchId;
      }
      if (dateRange) {
        params.startDate = dateRange.from.toISOString();
        params.endDate = dateRange.to.toISOString();
      }

      console.log("Fetching overview report with params:", params);
      console.log("API Base URL:", baseUrl);
      console.log("Full URL:", `${baseUrl}/reports/overview`);
      console.log("Has token:", !!token);
      console.log("API Key:", API_KEY ? "Set" : "Not set");

      // Fetch overview report from new API endpoint
      const response = await axios.get(`${baseUrl}/reports/overview`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      console.log("API Response:", response.data);

      const { orders, efficiencyTrends, productionOutput } = response.data?.data || {};

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
      console.error("=== DETAILED ERROR INFO ===");
      console.error("Error fetching overview report:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("Base URL:", baseUrl);
      console.error("=========================");

      let errorMessage = "Failed to fetch overview report";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error
          const status = error.response.status;
          const responseError = error.response.data?.error || error.response.data?.message;

          if (status === 401 || status === 403 || responseError === "Invalid token") {
            errorMessage = "Your session has expired. Please login again.";
          } else if (status === 404) {
            errorMessage = "Reports endpoint not found. Please check backend configuration.";
          } else {
            errorMessage = responseError || `Server error: ${status}`;
          }
        } else if (error.request) {
          // Request made but no response
          errorMessage = "Cannot connect to backend server. Please ensure the backend is running at " + baseUrl;
        } else {
          // Error setting up request
          errorMessage = error.message;
        }
      } else {
        errorMessage = error.message || "Unknown error occurred";
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
  async (dispatch: Dispatch<ReportActionTypes>) => {
    try {
      dispatch({ type: FETCH_ORDERS_REPORT_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken();
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const params: any = {};

      // Add branchId if not viewing all branches
      if (branchId) {
        params.branchId = branchId;
      }

      // Add filters
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== 'all') {
            params[key] = filters[key];
          }
        });
      }

      console.log("Fetching orders report with params:", params);

      const response = await axios.get(`${baseUrl}/reports/orders`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const orders = response.data?.data?.orders || [];

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
  async (dispatch: Dispatch<ReportActionTypes>) => {
    try {
      dispatch({ type: FETCH_PRODUCTION_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken();
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const params: any = {};

      // Add branchId if not viewing all branches
      if (branchId) {
        params.branchId = branchId;
      }

      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== 'all') {
            params[key] = filters[key];
          }
        });
      }

      console.log("Fetching production report with params:", params);

      // Fetch production report from new API endpoint
      const response = await axios.get(`${baseUrl}/reports/production`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const { orders, materials, productionOutput } = response.data?.data || {};

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
  async (dispatch: Dispatch<ReportActionTypes>) => {
    try {
      dispatch({ type: FETCH_MACHINES_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken();
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const params: any = {};

      // Add branchId if not viewing all branches
      if (branchId) {
        params.branchId = branchId;
      }

      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== 'all') {
            params[key] = filters[key];
          }
        });
      }

      console.log("Fetching machines report with params:", params);

      // Fetch machines report from new API endpoint
      const response = await axios.get(`${baseUrl}/reports/machines`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const { machines, machineUtilization } = response.data?.data || {};

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
  async (dispatch: Dispatch<ReportActionTypes>) => {
    try {
      dispatch({ type: FETCH_CUSTOMERS_REQUEST });
      dispatch({ type: SET_LOADING, payload: true });

      const token = getToken();
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const params: any = {};

      // Add branchId if not viewing all branches
      if (branchId) {
        params.branchId = branchId;
      }

      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== 'all') {
            params[key] = filters[key];
          }
        });
      }

      console.log("Fetching customers report with params:", params);

      // Fetch customers report from new API endpoint
      const response = await axios.get(`${baseUrl}/reports/customers`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const { customers, orders } = response.data?.data || {};

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
  async (dispatch: Dispatch<ReportActionTypes>) => {
    try {
      dispatch({ type: FETCH_MATERIALS_REQUEST });

      const token = getToken();
      const branchId = getBranchId();

      if (!token) {
        throw new Error("Authentication token missing");
      }

      // Build params - branchId is optional for viewing all branches
      const params: any = {};
      if (branchId) {
        params.branchId = branchId;
      }

      // Fetch materials report from new API endpoint
      const response = await axios.get(`${baseUrl}/reports/materials`, {
        params,
        headers: getAuthHeaders(token),
        timeout: 30000,
      });

      const materials = response.data?.data?.materials || [];

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
