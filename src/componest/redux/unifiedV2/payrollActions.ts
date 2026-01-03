/**
 * Payroll Actions
 * Payment processing and history management
 */

import axios from 'axios';
import { Dispatch } from 'redux';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

const getHeaders = (branchId?: string) => {
  const token = localStorage.getItem('authToken');
  const selectedBranch = branchId || localStorage.getItem('selectedBranch');
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
export const PAYROLL_V2_PROCESS_REQUEST = 'PAYROLL_V2_PROCESS_REQUEST';
export const PAYROLL_V2_PROCESS_SUCCESS = 'PAYROLL_V2_PROCESS_SUCCESS';
export const PAYROLL_V2_PROCESS_FAILURE = 'PAYROLL_V2_PROCESS_FAILURE';

export const PAYROLL_V2_BULK_PROCESS_REQUEST = 'PAYROLL_V2_BULK_PROCESS_REQUEST';
export const PAYROLL_V2_BULK_PROCESS_SUCCESS = 'PAYROLL_V2_BULK_PROCESS_SUCCESS';
export const PAYROLL_V2_BULK_PROCESS_FAILURE = 'PAYROLL_V2_BULK_PROCESS_FAILURE';

export const PAYROLL_V2_HISTORY_REQUEST = 'PAYROLL_V2_HISTORY_REQUEST';
export const PAYROLL_V2_HISTORY_SUCCESS = 'PAYROLL_V2_HISTORY_SUCCESS';
export const PAYROLL_V2_HISTORY_FAILURE = 'PAYROLL_V2_HISTORY_FAILURE';

export const PAYROLL_V2_SUMMARY_REQUEST = 'PAYROLL_V2_SUMMARY_REQUEST';
export const PAYROLL_V2_SUMMARY_SUCCESS = 'PAYROLL_V2_SUMMARY_SUCCESS';
export const PAYROLL_V2_SUMMARY_FAILURE = 'PAYROLL_V2_SUMMARY_FAILURE';

export const PAYROLL_V2_PAYSLIP_REQUEST = 'PAYROLL_V2_PAYSLIP_REQUEST';
export const PAYROLL_V2_PAYSLIP_SUCCESS = 'PAYROLL_V2_PAYSLIP_SUCCESS';
export const PAYROLL_V2_PAYSLIP_FAILURE = 'PAYROLL_V2_PAYSLIP_FAILURE';

// Interfaces
export interface PaymentRecord {
  month: string;
  year: number;
  basicPaid: number;
  allowancesPaid: number;
  deductionsMade: number;
  netPaid: number;
  paidOn: Date;
  paymentMethod: 'bank' | 'cash' | 'cheque';
  transactionId?: string;
  status: 'pending' | 'paid' | 'partial';
  notes?: string;
}

export interface ProcessPaymentData {
  employeeId: string;
  month: string; // "2025-01"
  paymentMethod?: 'bank' | 'cash' | 'cheque';
  transactionId?: string;
  notes?: string;
  customAmount?: number;
}

export interface BulkPaymentData {
  month: string;
  employeeIds?: string[];
  paymentMethod?: 'bank' | 'cash' | 'cheque';
  branchId?: string;
}

export interface PayrollSummary {
  month: string;
  summary: {
    totalEmployees: number;
    totalMonthlyPayroll: number;
    paidCount: number;
    pendingCount: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
  };
  paidThisMonth: Array<{
    employeeId: string;
    employeeName: string;
    department?: string;
    branch?: string;
    netPaid: number;
    paidOn: Date;
  }>;
  pendingPayments: Array<{
    employeeId: string;
    employeeName: string;
    department?: string;
    branch?: string;
    netSalary: number;
  }>;
}

export interface Payslip {
  company: {
    name: string;
    branch?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  employee: {
    id: string;
    name: string;
    email: string;
    designation?: string;
    department?: string;
    joiningDate?: Date;
    bankName?: string;
    accountNumber?: string;
  };
  payPeriod: {
    month: string;
    year: number;
  };
  earnings: {
    basic: number;
    allowances: Array<{ name: string; amount: number }>;
    totalAllowances: number;
    grossEarnings: number;
  };
  deductions: {
    items: Array<{ name: string; amount: number }>;
    totalDeductions: number;
  };
  netPay: number;
  payment: {
    method: string;
    transactionId?: string;
    paidOn: Date;
    status: string;
  };
  generatedAt: string;
}

// Process Single Payment
export const processPayment = (data: ProcessPaymentData) => async (dispatch: Dispatch) => {
  dispatch({ type: PAYROLL_V2_PROCESS_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/payroll/process`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: PAYROLL_V2_PROCESS_SUCCESS,
      payload: response.data.payment,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: PAYROLL_V2_PROCESS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Process Bulk Payments
export const processBulkPayments = (data: BulkPaymentData) => async (dispatch: Dispatch) => {
  dispatch({ type: PAYROLL_V2_BULK_PROCESS_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/payroll/process-bulk`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: PAYROLL_V2_BULK_PROCESS_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: PAYROLL_V2_BULK_PROCESS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Payment History for an Employee
export const getPaymentHistory = (employeeId: string) => async (dispatch: Dispatch) => {
  dispatch({ type: PAYROLL_V2_HISTORY_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/payroll/history/${employeeId}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: PAYROLL_V2_HISTORY_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: PAYROLL_V2_HISTORY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Get Payroll Summary
export const getPayrollSummary = (params?: { month?: string; branchId?: string }) => async (dispatch: Dispatch) => {
  dispatch({ type: PAYROLL_V2_SUMMARY_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/payroll/summary${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    dispatch({
      type: PAYROLL_V2_SUMMARY_SUCCESS,
      payload: response.data,
    });

    return response.data as PayrollSummary;
  } catch (error: any) {
    dispatch({
      type: PAYROLL_V2_SUMMARY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Generate Payslip
export const generatePayslip = (employeeId: string, month: string) => async (dispatch: Dispatch) => {
  dispatch({ type: PAYROLL_V2_PAYSLIP_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/payroll/payslip/${employeeId}/${month}`, {
      headers: getHeaders(),
    });

    dispatch({
      type: PAYROLL_V2_PAYSLIP_SUCCESS,
      payload: response.data.payslip,
    });

    return response.data.payslip as Payslip;
  } catch (error: any) {
    dispatch({
      type: PAYROLL_V2_PAYSLIP_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Helper: Calculate Net Salary
export const calculateNetSalary = (salary: {
  basic: number;
  allowances?: Array<{ name: string; amount: number; type: 'fixed' | 'percentage' }>;
  deductions?: Array<{ name: string; amount: number; type: 'fixed' | 'percentage' }>;
}) => {
  const basic = salary.basic || 0;
  let totalAllowances = 0;
  let totalDeductions = 0;

  if (salary.allowances) {
    for (const a of salary.allowances) {
      totalAllowances += a.type === 'percentage' ? (basic * a.amount) / 100 : a.amount;
    }
  }

  if (salary.deductions) {
    for (const d of salary.deductions) {
      totalDeductions += d.type === 'percentage' ? (basic * d.amount) / 100 : d.amount;
    }
  }

  return {
    basic,
    totalAllowances,
    totalDeductions,
    netSalary: basic + totalAllowances - totalDeductions,
  };
};

// Helper: Format currency
export const formatCurrency = (amount: number, currency: string = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper: Get current month in YYYY-MM format
export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
