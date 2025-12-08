import axios from 'axios';
import { Dispatch } from 'redux';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// Action Types
export const GET_DASHBOARD_REQUEST = 'GET_DASHBOARD_REQUEST';
export const GET_DASHBOARD_SUCCESS = 'GET_DASHBOARD_SUCCESS';
export const GET_DASHBOARD_FAILURE = 'GET_DASHBOARD_FAILURE';

export const GET_STATUS_REPORT_REQUEST = 'GET_STATUS_REPORT_REQUEST';
export const GET_STATUS_REPORT_SUCCESS = 'GET_STATUS_REPORT_SUCCESS';
export const GET_STATUS_REPORT_FAILURE = 'GET_STATUS_REPORT_FAILURE';

export const GET_ORDER_TYPE_REPORT_REQUEST = 'GET_ORDER_TYPE_REPORT_REQUEST';
export const GET_ORDER_TYPE_REPORT_SUCCESS = 'GET_ORDER_TYPE_REPORT_SUCCESS';
export const GET_ORDER_TYPE_REPORT_FAILURE = 'GET_ORDER_TYPE_REPORT_FAILURE';

export const GET_CATEGORY_REPORT_REQUEST = 'GET_CATEGORY_REPORT_REQUEST';
export const GET_CATEGORY_REPORT_SUCCESS = 'GET_CATEGORY_REPORT_SUCCESS';
export const GET_CATEGORY_REPORT_FAILURE = 'GET_CATEGORY_REPORT_FAILURE';

export const GET_OPTION_TYPE_REPORT_REQUEST = 'GET_OPTION_TYPE_REPORT_REQUEST';
export const GET_OPTION_TYPE_REPORT_SUCCESS = 'GET_OPTION_TYPE_REPORT_SUCCESS';
export const GET_OPTION_TYPE_REPORT_FAILURE = 'GET_OPTION_TYPE_REPORT_FAILURE';

export const GET_OPTIONS_BY_TYPE_REQUEST = 'GET_OPTIONS_BY_TYPE_REQUEST';
export const GET_OPTIONS_BY_TYPE_SUCCESS = 'GET_OPTIONS_BY_TYPE_SUCCESS';
export const GET_OPTIONS_BY_TYPE_FAILURE = 'GET_OPTIONS_BY_TYPE_FAILURE';

export const GET_COMPANY_REPORT_REQUEST = 'GET_COMPANY_REPORT_REQUEST';
export const GET_COMPANY_REPORT_SUCCESS = 'GET_COMPANY_REPORT_SUCCESS';
export const GET_COMPANY_REPORT_FAILURE = 'GET_COMPANY_REPORT_FAILURE';

export const EXPORT_EXCEL_REQUEST = 'EXPORT_EXCEL_REQUEST';
export const EXPORT_EXCEL_SUCCESS = 'EXPORT_EXCEL_SUCCESS';
export const EXPORT_EXCEL_FAILURE = 'EXPORT_EXCEL_FAILURE';

export const CLEAR_REPORT_DATA = 'CLEAR_REPORT_DATA';

// Types
interface ReportFilters {
  branchId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  orderTypeId?: string;
  category?: string;
  optionTypeId?: string;
}

// Action Creators
export const getDashboard = (filters?: ReportFilters) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_DASHBOARD_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(filters as any).toString();
    const url = `${baseUrl}/reports/dashboard${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_DASHBOARD_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_DASHBOARD_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getStatusReport = (filters?: ReportFilters) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_STATUS_REPORT_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(filters as any).toString();
    const url = `${baseUrl}/reports/by-status${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_STATUS_REPORT_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_STATUS_REPORT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getOrderTypeReport = (filters?: ReportFilters) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_ORDER_TYPE_REPORT_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(filters as any).toString();
    const url = `${baseUrl}/reports/by-order-type${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_ORDER_TYPE_REPORT_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_ORDER_TYPE_REPORT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getCategoryReport = (filters?: ReportFilters) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_CATEGORY_REPORT_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(filters as any).toString();
    const url = `${baseUrl}/reports/by-category${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_CATEGORY_REPORT_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_CATEGORY_REPORT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getOptionTypeReport = (filters?: ReportFilters) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_OPTION_TYPE_REPORT_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(filters as any).toString();
    const url = `${baseUrl}/reports/by-option-type${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_OPTION_TYPE_REPORT_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_OPTION_TYPE_REPORT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getOptionsByType = (optionTypeId: string, filters?: ReportFilters) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_OPTIONS_BY_TYPE_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(filters as any).toString();
    const url = `${baseUrl}/reports/option-types/${optionTypeId}/options${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_OPTIONS_BY_TYPE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_OPTIONS_BY_TYPE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getCompanyReport = (filters?: ReportFilters) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_COMPANY_REPORT_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(filters as any).toString();
    const url = `${baseUrl}/reports/by-company${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_COMPANY_REPORT_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_COMPANY_REPORT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const exportExcel = (exportData: {
  reportType: string;
  branchId?: string;
  fromDate?: string;
  toDate?: string;
  groupId?: string;
  filters?: any;
}) => async (dispatch: Dispatch) => {
  dispatch({ type: EXPORT_EXCEL_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${baseUrl}/reports/export/excel`, exportData, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportData.reportType}_report.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    dispatch({ type: EXPORT_EXCEL_SUCCESS });

    return true;
  } catch (error: any) {
    dispatch({
      type: EXPORT_EXCEL_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const clearReportData = () => ({
  type: CLEAR_REPORT_DATA,
});
