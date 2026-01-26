/**
 * Billing Actions (v2 API)
 * Generate monthly bills, view history (READ ONLY)
 * Bill status updates (pay/unpay) are managed by dashboard admin only
 * Only accessible by master_admin role
 *
 * Pricing:
 * - Branch: 499/month
 * - Admin: 70/month
 * - Manager: 50/month
 * - Orders: 2.5/order
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
export const BILLING_CURRENT_REQUEST = 'BILLING_CURRENT_REQUEST';
export const BILLING_CURRENT_SUCCESS = 'BILLING_CURRENT_SUCCESS';
export const BILLING_CURRENT_FAILURE = 'BILLING_CURRENT_FAILURE';

export const BILLING_HISTORY_REQUEST = 'BILLING_HISTORY_REQUEST';
export const BILLING_HISTORY_SUCCESS = 'BILLING_HISTORY_SUCCESS';
export const BILLING_HISTORY_FAILURE = 'BILLING_HISTORY_FAILURE';

export const BILLING_GENERATE_REQUEST = 'BILLING_GENERATE_REQUEST';
export const BILLING_GENERATE_SUCCESS = 'BILLING_GENERATE_SUCCESS';
export const BILLING_GENERATE_FAILURE = 'BILLING_GENERATE_FAILURE';

// REMOVED: BILLING_PAY and BILLING_UNPAY actions
// Bill status updates are now managed by dashboard admin only

export const BILLING_CLEAR = 'BILLING_CLEAR';

// Types
export interface BillUsage {
  branches: number;
  admins: number;
  managers: number;
  operators: number;
  orders: number;
  oldOrders: number;
  newOrders: number;
}

export interface BillPricing {
  baseRate: number;
  branchRate: number;
  adminRate: number;
  managerRate: number;
  operatorRate: number;
  orderRate: number;
  oldOrderRate: number;
  newOrderRate?: number;
}

export interface BillBreakdown {
  baseAmount: number;
  branchAmount: number;
  adminAmount: number;
  managerAmount: number;
  operatorAmount: number;
  orderAmount: number;
  oldOrderAmount: number;
  newOrderAmount: number;
}

export interface BillDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
  reason?: string;
  appliedBy?: string;
  appliedAt?: string;
}

export interface Bill {
  _id: string;
  billNumber: string;
  billingMonth: number;
  billingYear: number;
  periodStart: string;
  periodEnd: string;
  usage: BillUsage;
  pricing: BillPricing;
  breakdown: BillBreakdown;
  discount?: BillDiscount;
  subtotal: number;
  discountedSubtotal?: number;
  tax: number;
  taxRate: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  paidAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillPreview {
  billingMonth: number;
  billingYear: number;
  periodStart: string;
  periodEnd: string;
  usage: BillUsage;
  pricing: BillPricing;
  breakdown: BillBreakdown;
  discount?: BillDiscount;
  subtotal: number;
  discountedSubtotal?: number;
  tax: number;
  taxRate: number;
  totalAmount: number;
  currency: string;
}

export interface BillingSummary {
  total: number;
  totalAmount: number;
  paid: { count: number; amount: number };
  pending: { count: number; amount: number };
  overdue: { count: number; amount: number };
}

// Get Current Month Bill or Preview
export const getCurrentBill = () => async (dispatch: Dispatch) => {
  dispatch({ type: BILLING_CURRENT_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/billing/current`, {
      headers: getHeaders(),
    });

    dispatch({
      type: BILLING_CURRENT_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: BILLING_CURRENT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Billing History
export const getBillingHistory = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  year?: number;
}) => async (dispatch: Dispatch) => {
  dispatch({ type: BILLING_HISTORY_REQUEST });

  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.year) queryParams.append('year', params.year.toString());

    const response = await axios.get(
      `${baseUrl}/v2/billing${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      { headers: getHeaders() }
    );

    dispatch({
      type: BILLING_HISTORY_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: BILLING_HISTORY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Generate Bill
export const generateBill = (month?: number, year?: number) => async (dispatch: Dispatch) => {
  dispatch({ type: BILLING_GENERATE_REQUEST });

  try {
    const response = await axios.post(
      `${baseUrl}/v2/billing/generate`,
      { month, year },
      { headers: getHeaders() }
    );

    dispatch({
      type: BILLING_GENERATE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: BILLING_GENERATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// REMOVED: markBillPaid and markBillUnpaid functions
// Bill status updates (pay/unpay) are now managed by dashboard admin only
// See: dashboard/dashboard-backend/handlers/admin/bills.js

// Clear Billing State
export const clearBilling = () => (dispatch: Dispatch) => {
  dispatch({ type: BILLING_CLEAR });
};
