/**
 * Master Admin Profile Actions (v2 API)
 * Get master admin profile with company details
 * Only accessible by master_admin role
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
export const MASTER_ADMIN_PROFILE_REQUEST = 'MASTER_ADMIN_PROFILE_REQUEST';
export const MASTER_ADMIN_PROFILE_SUCCESS = 'MASTER_ADMIN_PROFILE_SUCCESS';
export const MASTER_ADMIN_PROFILE_FAILURE = 'MASTER_ADMIN_PROFILE_FAILURE';
export const MASTER_ADMIN_PROFILE_CLEAR = 'MASTER_ADMIN_PROFILE_CLEAR';

export const MASTER_ADMIN_PROFILE_UPDATE_REQUEST = 'MASTER_ADMIN_PROFILE_UPDATE_REQUEST';
export const MASTER_ADMIN_PROFILE_UPDATE_SUCCESS = 'MASTER_ADMIN_PROFILE_UPDATE_SUCCESS';
export const MASTER_ADMIN_PROFILE_UPDATE_FAILURE = 'MASTER_ADMIN_PROFILE_UPDATE_FAILURE';

// Types
export interface MasterAdminProfile {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  bio: string;
  profileImage: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDetails {
  _id: string;
  Product27InfinityId: string;
  name: string;
  description: string;
  type: string;
  category: string;
  status: string;
  version: string;
  pricing: {
    model: string;
    amount: number;
    currency: string;
    billingCycle: string;
  };
  features: Array<{
    name: string;
    description: string;
    enabled: boolean;
  }>;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    lastUpdated: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyStatistics {
  totalBranches: number;
  totalAdmins: number;
  totalManagers: number;
}

export interface MasterAdminProfileData {
  profile: MasterAdminProfile;
  company: CompanyDetails;
  statistics: CompanyStatistics;
}

// Get Master Admin Profile with Company Details
export const getMasterAdminProfile = () => async (dispatch: Dispatch) => {
  dispatch({ type: MASTER_ADMIN_PROFILE_REQUEST });

  try {
    const response = await axios.get(`${baseUrl}/v2/master-admin-profile`, {
      headers: getHeaders(),
    });

    dispatch({
      type: MASTER_ADMIN_PROFILE_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: MASTER_ADMIN_PROFILE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Clear Master Admin Profile
export const clearMasterAdminProfile = () => (dispatch: Dispatch) => {
  dispatch({ type: MASTER_ADMIN_PROFILE_CLEAR });
};

// Update Profile Data Interface
export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
}

// Update Master Admin Profile
export const updateMasterAdminProfile = (data: UpdateProfileData) => async (dispatch: Dispatch) => {
  dispatch({ type: MASTER_ADMIN_PROFILE_UPDATE_REQUEST });

  try {
    const response = await axios.put(`${baseUrl}/v2/master-admin-profile`, data, {
      headers: getHeaders(),
    });

    dispatch({
      type: MASTER_ADMIN_PROFILE_UPDATE_SUCCESS,
      payload: response.data.data,
    });

    // Refresh full profile after update
    dispatch({ type: MASTER_ADMIN_PROFILE_REQUEST });
    const refreshResponse = await axios.get(`${baseUrl}/v2/master-admin-profile`, {
      headers: getHeaders(),
    });
    dispatch({
      type: MASTER_ADMIN_PROFILE_SUCCESS,
      payload: refreshResponse.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: MASTER_ADMIN_PROFILE_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};
