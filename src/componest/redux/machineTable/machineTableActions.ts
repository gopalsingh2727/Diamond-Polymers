import { Dispatch } from 'redux';
import axios from 'axios';
import {
  MachineTableActionTypes,
  MachineTableResponse,
  SelectedMachine,
  TableRowData,
  TableStructure
} from './machineTableTypes';
import {
  FETCH_MACHINE_TABLE_REQUEST,
  FETCH_MACHINE_TABLE_SUCCESS,
  FETCH_MACHINE_TABLE_FAILURE,
  CLEAR_MACHINE_TABLE_DATA,
  CLEAR_MACHINE_TABLE_ERROR,
  SET_SELECTED_MACHINE,
  CLEAR_SELECTED_MACHINE,
  UPDATE_TABLE_ROW_REQUEST,
  UPDATE_TABLE_ROW_SUCCESS,
  UPDATE_TABLE_ROW_FAILURE,
  DELETE_TABLE_ROW_REQUEST,
  DELETE_TABLE_ROW_SUCCESS,
  DELETE_TABLE_ROW_FAILURE,
  ADD_TABLE_ROW_REQUEST,
  ADD_TABLE_ROW_SUCCESS,
  ADD_TABLE_ROW_FAILURE,
  FETCH_MACHINE_CONFIG_REQUEST,
  FETCH_MACHINE_CONFIG_SUCCESS,
  FETCH_MACHINE_CONFIG_FAILURE,
  SAVE_MACHINE_CONFIG_REQUEST,
  SAVE_MACHINE_CONFIG_SUCCESS,
  SAVE_MACHINE_CONFIG_FAILURE,
  UPDATE_MACHINE_CONFIG_REQUEST,
  UPDATE_MACHINE_CONFIG_SUCCESS,
  UPDATE_MACHINE_CONFIG_FAILURE
} from './machineTableConstants';
import { RootState } from '../rootReducer';

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || '';
const API_KEY = import.meta.env.VITE_API_KEY;

// Helper function to get auth headers
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
});

// Helper function to get token
const getToken = (getState: () => RootState): string => {
  const token = getState().auth?.token || localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }
  return token;
};

// ============================================================================
// FETCH MACHINE TABLE DATA FROM ORDER
// ============================================================================

export const fetchMachineTableData = (orderId: string, machineId: string) =>
  async (dispatch: Dispatch<MachineTableActionTypes>, getState: () => RootState) => {
    try {
      console.log('🔍 Fetching machine table data:', { orderId, machineId });
      
      dispatch({ type: FETCH_MACHINE_TABLE_REQUEST });

      const token = getToken(getState);

      // Validate inputs
      if (!orderId || !machineId) {
        throw new Error('Order ID and Machine ID are required');
      }

      const response = await axios.get<{ success: boolean; data: MachineTableResponse }>(
        `${baseUrl}/orders/${orderId}/machines/${machineId}/table-data`,
        { headers: getAuthHeaders(token) }
      );

      console.log('✅ Machine table data fetched successfully:', response.data);

      if (response.data.success && response.data.data) {
        dispatch({
          type: FETCH_MACHINE_TABLE_SUCCESS,
          payload: response.data.data
        });
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error: any) {
      console.error('❌ Error fetching machine table data:', error);

      let errorMessage = 'Failed to fetch machine table data';

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Machine or order not found';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: FETCH_MACHINE_TABLE_FAILURE,
        payload: errorMessage
      });

      throw error;
    }
  };

// ============================================================================
// FETCH MACHINE CONFIGURATION ONLY
// ============================================================================

export const fetchMachineConfig = (machineId: string) =>
  async (dispatch: Dispatch<MachineTableActionTypes>, getState: () => RootState) => {
    try {
      console.log('🔍 Fetching machine configuration:', { machineId });
      
      dispatch({ type: FETCH_MACHINE_CONFIG_REQUEST });

      const token = getToken(getState);

      if (!machineId) {
        throw new Error('Machine ID is required');
      }

      const response = await axios.get<{ success: boolean; data: TableStructure }>(
        `${baseUrl}/machines/${machineId}/table-config`,
        { headers: getAuthHeaders(token) }
      );

      console.log('✅ Machine configuration fetched successfully:', response.data);

      if (response.data.success && response.data.data) {
        dispatch({
          type: FETCH_MACHINE_CONFIG_SUCCESS,
          payload: response.data.data
        });
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error: any) {
      console.error('❌ Error fetching machine configuration:', error);

      let errorMessage = 'Failed to fetch machine configuration';

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: FETCH_MACHINE_CONFIG_FAILURE,
        payload: errorMessage
      });

      throw error;
    }
  };

// ============================================================================
// ADD TABLE ROW
// ============================================================================

export const addTableRow = (orderId: string, machineId: string, rowData: TableRowData) =>
  async (dispatch: Dispatch<MachineTableActionTypes>, getState: () => RootState) => {
    try {
      console.log('➕ Adding table row:', { orderId, machineId, rowData });
      
      dispatch({ type: ADD_TABLE_ROW_REQUEST });

      const token = getToken(getState);

      const response = await axios.post<{ success: boolean; data: MachineTableResponse }>(
        `${baseUrl}/orders/${orderId}/machines/${machineId}/table-data/rows`,
        { rowData },
        { headers: getAuthHeaders(token) }
      );

      console.log('✅ Table row added successfully:', response.data);

      if (response.data.success && response.data.data) {
        dispatch({
          type: ADD_TABLE_ROW_SUCCESS,
          payload: response.data.data
        });
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error: any) {
      console.error('❌ Error adding table row:', error);

      let errorMessage = 'Failed to add table row';

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: ADD_TABLE_ROW_FAILURE,
        payload: errorMessage
      });

      throw error;
    }
  };

// ============================================================================
// UPDATE TABLE ROW
// ============================================================================

export const updateTableRow = (orderId: string, machineId: string, rowIndex: number, rowData: TableRowData) =>
  async (dispatch: Dispatch<MachineTableActionTypes>, getState: () => RootState) => {
    try {
      console.log('✏️ Updating table row:', { orderId, machineId, rowIndex, rowData });
      
      dispatch({ type: UPDATE_TABLE_ROW_REQUEST });

      const token = getToken(getState);

      const response = await axios.put<{ success: boolean; data: MachineTableResponse }>(
        `${baseUrl}/orders/${orderId}/machines/${machineId}/table-data/rows/${rowIndex}`,
        { rowData },
        { headers: getAuthHeaders(token) }
      );

      console.log('✅ Table row updated successfully:', response.data);

      if (response.data.success && response.data.data) {
        dispatch({
          type: UPDATE_TABLE_ROW_SUCCESS,
          payload: response.data.data
        });
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error: any) {
      console.error('❌ Error updating table row:', error);

      let errorMessage = 'Failed to update table row';

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: UPDATE_TABLE_ROW_FAILURE,
        payload: errorMessage
      });

      throw error;
    }
  };

// ============================================================================
// DELETE TABLE ROW
// ============================================================================

export const deleteTableRow = (orderId: string, machineId: string, rowIndex: number) =>
  async (dispatch: Dispatch<MachineTableActionTypes>, getState: () => RootState) => {
    try {
      console.log('🗑️ Deleting table row:', { orderId, machineId, rowIndex });
      
      dispatch({ type: DELETE_TABLE_ROW_REQUEST });

      const token = getToken(getState);

      const response = await axios.delete<{ success: boolean; data: MachineTableResponse }>(
        `${baseUrl}/orders/${orderId}/machines/${machineId}/table-data/rows/${rowIndex}`,
        { headers: getAuthHeaders(token) }
      );

      console.log('✅ Table row deleted successfully:', response.data);

      if (response.data.success && response.data.data) {
        dispatch({
          type: DELETE_TABLE_ROW_SUCCESS,
          payload: response.data.data
        });
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error: any) {
      console.error('❌ Error deleting table row:', error);

      let errorMessage = 'Failed to delete table row';

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: DELETE_TABLE_ROW_FAILURE,
        payload: errorMessage
      });

      throw error;
    }
  };

// ============================================================================
// HELPER ACTIONS
// ============================================================================

export const setSelectedMachine = (machine: SelectedMachine): MachineTableActionTypes => ({
  type: SET_SELECTED_MACHINE,
  payload: machine
});

export const clearSelectedMachine = (): MachineTableActionTypes => ({
  type: CLEAR_SELECTED_MACHINE
});

export const clearMachineTableData = (): MachineTableActionTypes => ({
  type: CLEAR_MACHINE_TABLE_DATA
});

export const clearMachineTableError = (): MachineTableActionTypes => ({
  type: CLEAR_MACHINE_TABLE_ERROR
});

// ============================================================================
// CREATE MACHINE TEMPLATE (POST /machine-template)
// ============================================================================

export const createMachineTemplate = (configData: any) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      console.log('💾 Creating machine template:', configData);

      dispatch({ type: SAVE_MACHINE_CONFIG_REQUEST });

      const token = getToken(getState);

      const response = await axios.post(
        `${baseUrl}/machine-template`,
        configData,
        { headers: getAuthHeaders(token) }
      );

      console.log('✅ Machine template created successfully:', response.data);

      dispatch({
        type: SAVE_MACHINE_CONFIG_SUCCESS,
        payload: response.data.data || response.data
      });
      return response.data;

    } catch (error: any) {
      console.error('❌ Error creating machine template:', error);

      let errorMessage = 'Failed to create machine template';

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: SAVE_MACHINE_CONFIG_FAILURE,
        payload: errorMessage
      });

      throw error;
    }
  };

// ============================================================================
// UPDATE MACHINE TEMPLATE (PUT /machine-template/{id})
// ============================================================================

export const updateMachineTemplate = (templateId: string, configData: any) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      console.log('✏️ Updating machine template:', { templateId, configData });

      dispatch({ type: UPDATE_MACHINE_CONFIG_REQUEST });

      const token = getToken(getState);

      if (!templateId) {
        throw new Error('Template ID is required');
      }

      const response = await axios.put(
        `${baseUrl}/machine-template/${templateId}`,
        configData,
        { headers: getAuthHeaders(token) }
      );

      console.log('✅ Machine template updated successfully:', response.data);

      dispatch({
        type: UPDATE_MACHINE_CONFIG_SUCCESS,
        payload: response.data.data || response.data
      });
      return response.data;

    } catch (error: any) {
      console.error('❌ Error updating machine template:', error);

      let errorMessage = 'Failed to update machine template';

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: UPDATE_MACHINE_CONFIG_FAILURE,
        payload: errorMessage
      });

      throw error;
    }
  };

// ============================================================================
// GET TEMPLATES BY MACHINE (GET /machine/{machineId}/templates)
// ============================================================================

export const getTemplatesByMachine = (machineId: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      console.log('🔍 Fetching templates for machine:', machineId);

      dispatch({ type: FETCH_MACHINE_CONFIG_REQUEST });

      const token = getToken(getState);

      if (!machineId) {
        throw new Error('Machine ID is required');
      }

      const response = await axios.get(
        `${baseUrl}/machine/${machineId}/templates`,
        { headers: getAuthHeaders(token) }
      );

      console.log('✅ Machine templates fetched successfully:', response.data);

      dispatch({
        type: FETCH_MACHINE_CONFIG_SUCCESS,
        payload: response.data.data || response.data
      });
      return response.data;

    } catch (error: any) {
      console.error('❌ Error fetching machine templates:', error);

      let errorMessage = 'Failed to fetch machine templates';

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: FETCH_MACHINE_CONFIG_FAILURE,
        payload: errorMessage
      });

      throw error;
    }
  };

// Legacy aliases for backwards compatibility
export const saveMachineConfig = createMachineTemplate;
export const updateMachineConfig = (machineId: string, configData: any) =>
  updateMachineTemplate(configData._id || machineId, configData);