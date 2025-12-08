import axios from 'axios';
import { Dispatch } from 'redux';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const API_KEY = import.meta.env.VITE_API_KEY;

// Action Types
export const CREATE_REPORT_GROUP_REQUEST = 'CREATE_REPORT_GROUP_REQUEST';
export const CREATE_REPORT_GROUP_SUCCESS = 'CREATE_REPORT_GROUP_SUCCESS';
export const CREATE_REPORT_GROUP_FAILURE = 'CREATE_REPORT_GROUP_FAILURE';

export const GET_REPORT_GROUPS_REQUEST = 'GET_REPORT_GROUPS_REQUEST';
export const GET_REPORT_GROUPS_SUCCESS = 'GET_REPORT_GROUPS_SUCCESS';
export const GET_REPORT_GROUPS_FAILURE = 'GET_REPORT_GROUPS_FAILURE';

export const GET_REPORT_GROUP_BY_ID_REQUEST = 'GET_REPORT_GROUP_BY_ID_REQUEST';
export const GET_REPORT_GROUP_BY_ID_SUCCESS = 'GET_REPORT_GROUP_BY_ID_SUCCESS';
export const GET_REPORT_GROUP_BY_ID_FAILURE = 'GET_REPORT_GROUP_BY_ID_FAILURE';

export const UPDATE_REPORT_GROUP_REQUEST = 'UPDATE_REPORT_GROUP_REQUEST';
export const UPDATE_REPORT_GROUP_SUCCESS = 'UPDATE_REPORT_GROUP_SUCCESS';
export const UPDATE_REPORT_GROUP_FAILURE = 'UPDATE_REPORT_GROUP_FAILURE';

export const DELETE_REPORT_GROUP_REQUEST = 'DELETE_REPORT_GROUP_REQUEST';
export const DELETE_REPORT_GROUP_SUCCESS = 'DELETE_REPORT_GROUP_SUCCESS';
export const DELETE_REPORT_GROUP_FAILURE = 'DELETE_REPORT_GROUP_FAILURE';

export const GET_REPORT_GROUP_STATS_REQUEST = 'GET_REPORT_GROUP_STATS_REQUEST';
export const GET_REPORT_GROUP_STATS_SUCCESS = 'GET_REPORT_GROUP_STATS_SUCCESS';
export const GET_REPORT_GROUP_STATS_FAILURE = 'GET_REPORT_GROUP_STATS_FAILURE';

export const SELECT_REPORT_GROUP = 'SELECT_REPORT_GROUP';
export const CLEAR_REPORT_GROUP_DATA = 'CLEAR_REPORT_GROUP_DATA';

// Types
interface ReportGroupData {
  name: string;
  description?: string;
  branchId: string;
  selectedItems?: Array<{
    optionTypeId: string;
    optionTypeName: string;
    options: Array<{
      optionId: string;
      optionName: string;
    }>;
  }>;
  orderTypeIds?: string[];
  categoryIds?: string[];
  color?: string;
  createdBy?: string;
}

// Action Creators
export const createReportGroup = (groupData: ReportGroupData) => async (dispatch: Dispatch) => {
  dispatch({ type: CREATE_REPORT_GROUP_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${baseUrl}/report-groups`, groupData, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: CREATE_REPORT_GROUP_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: CREATE_REPORT_GROUP_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getReportGroups = (params?: { branchId?: string; isActive?: boolean }) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_REPORT_GROUPS_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${baseUrl}/report-groups${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_REPORT_GROUPS_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_REPORT_GROUPS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getReportGroupById = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_REPORT_GROUP_BY_ID_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${baseUrl}/report-groups/${id}`, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_REPORT_GROUP_BY_ID_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_REPORT_GROUP_BY_ID_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const updateReportGroup = (id: string, groupData: Partial<ReportGroupData>) => async (dispatch: Dispatch) => {
  dispatch({ type: UPDATE_REPORT_GROUP_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${baseUrl}/report-groups/${id}`, groupData, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: UPDATE_REPORT_GROUP_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_REPORT_GROUP_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const deleteReportGroup = (id: string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_REPORT_GROUP_REQUEST });

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${baseUrl}/report-groups/${id}`, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: DELETE_REPORT_GROUP_SUCCESS,
      payload: id,
    });

    return id;
  } catch (error: any) {
    dispatch({
      type: DELETE_REPORT_GROUP_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getReportGroupStats = (id: string, params?: { fromDate?: string; toDate?: string }) => async (dispatch: Dispatch) => {
  dispatch({ type: GET_REPORT_GROUP_STATS_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${baseUrl}/report-groups/${id}/stats${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    dispatch({
      type: GET_REPORT_GROUP_STATS_SUCCESS,
      payload: response.data.data,
    });

    return response.data.data;
  } catch (error: any) {
    dispatch({
      type: GET_REPORT_GROUP_STATS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const selectReportGroup = (group: any) => ({
  type: SELECT_REPORT_GROUP,
  payload: group,
});

export const clearReportGroupData = () => ({
  type: CLEAR_REPORT_GROUP_DATA,
});
