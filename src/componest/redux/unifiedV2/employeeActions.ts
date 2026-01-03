/**
 * Employee Actions
 * CRUD operations for Employee management
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
    'Content-Type': 'application/json'
  };
  if (selectedBranch) {
    headers['x-selected-branch'] = selectedBranch;
  }
  return headers;
};

// Action Types
export const EMPLOYEE_V2_CREATE_REQUEST = 'EMPLOYEE_V2_CREATE_REQUEST';
export const EMPLOYEE_V2_CREATE_SUCCESS = 'EMPLOYEE_V2_CREATE_SUCCESS';
export const EMPLOYEE_V2_CREATE_FAILURE = 'EMPLOYEE_V2_CREATE_FAILURE';

export const EMPLOYEE_V2_LIST_REQUEST = 'EMPLOYEE_V2_LIST_REQUEST';
export const EMPLOYEE_V2_LIST_SUCCESS = 'EMPLOYEE_V2_LIST_SUCCESS';
export const EMPLOYEE_V2_LIST_FAILURE = 'EMPLOYEE_V2_LIST_FAILURE';

export const EMPLOYEE_V2_GET_REQUEST = 'EMPLOYEE_V2_GET_REQUEST';
export const EMPLOYEE_V2_GET_SUCCESS = 'EMPLOYEE_V2_GET_SUCCESS';
export const EMPLOYEE_V2_GET_FAILURE = 'EMPLOYEE_V2_GET_FAILURE';

export const EMPLOYEE_V2_UPDATE_REQUEST = 'EMPLOYEE_V2_UPDATE_REQUEST';
export const EMPLOYEE_V2_UPDATE_SUCCESS = 'EMPLOYEE_V2_UPDATE_SUCCESS';
export const EMPLOYEE_V2_UPDATE_FAILURE = 'EMPLOYEE_V2_UPDATE_FAILURE';

export const EMPLOYEE_V2_DELETE_REQUEST = 'EMPLOYEE_V2_DELETE_REQUEST';
export const EMPLOYEE_V2_DELETE_SUCCESS = 'EMPLOYEE_V2_DELETE_SUCCESS';
export const EMPLOYEE_V2_DELETE_FAILURE = 'EMPLOYEE_V2_DELETE_FAILURE';

// Employee Interfaces
export interface Allowance {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface Deduction {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface Salary {
  basic: number;
  type: 'monthly' | 'daily' | 'hourly';
  allowances: Allowance[];
  deductions: Deduction[];
  paymentDay?: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface CRUDPermission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface EmployeePermissions {
  orders?: CRUDPermission;
  accounts?: CRUDPermission;
  customerCategory?: CRUDPermission;
  parentCompany?: CRUDPermission;
  machines?: CRUDPermission;
  machineType?: CRUDPermission;
  machineOperator?: CRUDPermission;
  step?: CRUDPermission;
  categories?: CRUDPermission;
  optionType?: CRUDPermission;
  optionSpec?: CRUDPermission;
  options?: CRUDPermission;
  orderType?: CRUDPermission;
  printType?: CRUDPermission;
  excelExportType?: CRUDPermission;
  reportType?: CRUDPermission;
  template?: CRUDPermission;
  deviceAccess?: CRUDPermission;
  daybook?: {read: boolean;};
  dispatch?: {read: boolean;update: boolean;};
  reports?: {read: boolean;};
  inventory?: CRUDPermission;
}

export interface Employee {
  _id: string;
  employeeId: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  designation?: string;
  department?: string;
  joiningDate?: Date;
  status: 'active' | 'inactive' | 'terminated';
  terminationDate?: Date;
  salary: Salary;
  permissions: EmployeePermissions;
  branchId: string;
  product27InfinityId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  designation?: string;
  department?: string;
  joiningDate?: string;
  branchId?: string;
  salary?: Salary;
  permissions?: EmployeePermissions;
}

// Create Employee
export const createEmployeeV2 = (data: CreateEmployeeData) => async (dispatch: Dispatch) => {
  dispatch({ type: EMPLOYEE_V2_CREATE_REQUEST });

  try {
    const response = await axios.post(`${baseUrl}/employee`, data, {
      headers: getHeaders()
    });

    dispatch({
      type: EMPLOYEE_V2_CREATE_SUCCESS,
      payload: response.data.employee
    });

    return response.data.employee;
  } catch (error: any) {
    dispatch({
      type: EMPLOYEE_V2_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Get All Employees
export const getEmployeesV2 = (params?: Record<string, any>) => async (dispatch: Dispatch) => {
  dispatch({ type: EMPLOYEE_V2_LIST_REQUEST });

  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = `${baseUrl}/employee${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    dispatch({
      type: EMPLOYEE_V2_LIST_SUCCESS,
      payload: response.data.employees || []
    });

    return response.data.employees;
  } catch (error: any) {
    dispatch({
      type: EMPLOYEE_V2_LIST_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Get Single Employee
export const getEmployeeV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: EMPLOYEE_V2_GET_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/employee/${id}`, {
      headers: getHeaders()
    });

    dispatch({
      type: EMPLOYEE_V2_GET_SUCCESS,
      payload: response.data.employee
    });

    return response.data.employee;
  } catch (error: any) {
    dispatch({
      type: EMPLOYEE_V2_GET_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Update Employee
export const updateEmployeeV2 = (id: string, data: Partial<Employee>) => async (dispatch: Dispatch) => {
  dispatch({ type: EMPLOYEE_V2_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/employee/${id}`, data, {
      headers: getHeaders()
    });

    dispatch({
      type: EMPLOYEE_V2_UPDATE_SUCCESS,
      payload: response.data.employee
    });

    return response.data.employee;
  } catch (error: any) {
    dispatch({
      type: EMPLOYEE_V2_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Delete Employee
export const deleteEmployeeV2 = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: EMPLOYEE_V2_DELETE_REQUEST });

  try {
    await axios.delete(`${baseUrl}/employee/${id}`, {
      headers: getHeaders()
    });

    dispatch({
      type: EMPLOYEE_V2_DELETE_SUCCESS,
      payload: id
    });

    return id;
  } catch (error: any) {
    dispatch({
      type: EMPLOYEE_V2_DELETE_FAILURE,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Get Departments
export const getDepartments = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.get(`${baseUrl}/employee/departments`, {
      headers: getHeaders()
    });

    return response.data.departments || [];
  } catch (error: any) {

    return [];
  }
};