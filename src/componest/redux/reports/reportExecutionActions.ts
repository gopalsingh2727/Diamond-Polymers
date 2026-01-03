/**
 * Report Execution Actions
 * For executing reports and getting data
 */

import axios from 'axios';
import { Dispatch } from 'redux';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  const selectedBranch = localStorage.getItem('selectedBranch');
  const headers: Record<string, string> = {
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (selectedBranch) {
    headers['x-selected-branch'] = selectedBranch;
  }
  return headers;
};

// Action Types
export const REPORT_EXECUTE_REQUEST = 'REPORT_EXECUTE_REQUEST';
export const REPORT_EXECUTE_SUCCESS = 'REPORT_EXECUTE_SUCCESS';
export const REPORT_EXECUTE_FAILURE = 'REPORT_EXECUTE_FAILURE';

export const REPORT_SUMMARY_REQUEST = 'REPORT_SUMMARY_REQUEST';
export const REPORT_SUMMARY_SUCCESS = 'REPORT_SUMMARY_SUCCESS';
export const REPORT_SUMMARY_FAILURE = 'REPORT_SUMMARY_FAILURE';

export const REPORT_CLEAR = 'REPORT_CLEAR';

// Interfaces
export interface ExecuteReportParams {
  reportTypeId: string;
  dateOverride?: {
    from?: string;
    to?: string;
  };
  page?: number;
  limit?: number;
  exportFormat?: 'json' | 'excel' | 'pdf';
}

export interface ReportResult {
  reportType: {
    _id: string;
    typeName: string;
    typeCode: string;
    reportCategory: string;
  };
  rows: any[];
  calculations: {
    name: string;
    value: number;
    unit: string;
    formula: string;
  }[];
  charts: {
    name: string;
    type: string;
    labels: string[];
    data: number[];
    colors: string[];
    showLegend: boolean;
    showDataLabels: boolean;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  columns: any[];
  exportConfig: any;
}

export interface ReportSummary {
  statusCounts: Record<string, number>;
  monthlyOrders: number;
  production: {
    totalRawWeight: number;
    totalNetWeight: number;
    totalWastage: number;
    totalCost: number;
    avgEfficiency: number;
  };
}

// Execute Report
export const executeReport = (params: ExecuteReportParams) => async (dispatch: Dispatch) => {
  dispatch({ type: REPORT_EXECUTE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/report/execute`, params, {
      headers: getHeaders(),
    });

    dispatch({
      type: REPORT_EXECUTE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: REPORT_EXECUTE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Report Summary
export const getReportSummary = () => async (dispatch: Dispatch) => {
  dispatch({ type: REPORT_SUMMARY_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/report/summary`, {
      headers: getHeaders(),
    });

    dispatch({
      type: REPORT_SUMMARY_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: REPORT_SUMMARY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Clear Report Data
export const clearReport = () => ({
  type: REPORT_CLEAR,
});
