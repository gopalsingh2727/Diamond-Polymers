import axios from "axios";
import {
  CREATE_MACHINE_TEMPLATE_REQUEST,
  CREATE_MACHINE_TEMPLATE_SUCCESS,
  CREATE_MACHINE_TEMPLATE_FAIL,
  GET_MACHINE_TEMPLATES_REQUEST,
  GET_MACHINE_TEMPLATES_SUCCESS,
  GET_MACHINE_TEMPLATES_FAIL,
  GET_MACHINE_TEMPLATE_BY_ID_REQUEST,
  GET_MACHINE_TEMPLATE_BY_ID_SUCCESS,
  GET_MACHINE_TEMPLATE_BY_ID_FAIL,
  GET_TEMPLATES_BY_MACHINE_REQUEST,
  GET_TEMPLATES_BY_MACHINE_SUCCESS,
  GET_TEMPLATES_BY_MACHINE_FAIL,
  UPDATE_MACHINE_TEMPLATE_REQUEST,
  UPDATE_MACHINE_TEMPLATE_SUCCESS,
  UPDATE_MACHINE_TEMPLATE_FAIL,
  DELETE_MACHINE_TEMPLATE_REQUEST,
  DELETE_MACHINE_TEMPLATE_SUCCESS,
  DELETE_MACHINE_TEMPLATE_FAIL,
  ACTIVATE_MACHINE_TEMPLATE_REQUEST,
  ACTIVATE_MACHINE_TEMPLATE_SUCCESS,
  ACTIVATE_MACHINE_TEMPLATE_FAIL,
  DEACTIVATE_MACHINE_TEMPLATE_REQUEST,
  DEACTIVATE_MACHINE_TEMPLATE_SUCCESS,
  DEACTIVATE_MACHINE_TEMPLATE_FAIL,
  DUPLICATE_MACHINE_TEMPLATE_REQUEST,
  DUPLICATE_MACHINE_TEMPLATE_SUCCESS,
  DUPLICATE_MACHINE_TEMPLATE_FAIL,
  CLEAR_MACHINE_TEMPLATE_ERROR
} from "./machineTemplateConstants";
import { Dispatch } from "redux";
import { RootState } from "../rootReducer";

// ENV
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY || "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

// Helpers
const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

const getBranchId = (getState: () => RootState): string | null => {
  const selectedBranch = getState().auth?.userData?.selectedBranch;
  if (selectedBranch) return selectedBranch;
  return localStorage.getItem("selectedBranch");
};

// Headers builder
const getHeaders = (
  token?: string | null,
  extra?: Record<string, string>
): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": apiKey,
  ...(extra || {}),
});

// Types
export interface ColumnConfig {
  name: string;
  label?: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'file' | 'link' | 'dropdown';
  unit?: string;
  formula?: string;
  isCalculated?: boolean;
  isRequired?: boolean;
  order?: number;
  width?: number;
  sourceType?: 'optionSpec' | 'order' | 'customer' | 'manual';
  sourceField?: string;
  optionTypeId?: string;
}

export interface CustomerFieldsConfig {
  showName?: boolean;
  showAddress?: boolean;
  showOrderId?: boolean;
  showImage?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
}

export interface TotalsConfig {
  columnName: string;
  formula: 'SUM' | 'AVERAGE' | 'COUNT' | 'MAX' | 'MIN' | 'CUSTOM';
  customFormula?: string;
}

export interface CompletionConfig {
  enabled?: boolean;
  targetField?: string;
  targetSource?: 'fixed' | 'orderQuantity' | 'optionSpec';
  fixedTargetValue?: number;
  autoComplete?: boolean;
}

export interface DisplayItemConfig {
  id: string;
  label: string;
  displayType: 'text' | 'number' | 'formula' | 'boolean' | 'image';
  sourceType: 'optionSpec' | 'order' | 'customer' | 'formula';
  optionTypeId?: string;
  optionTypeName?: string;
  optionSpecId?: string;
  optionSpecName?: string;
  specField?: string;
  unit?: string;
  formula?: {
    expression: string;
    dependencies: string[];
  };
  sourceField?: string;
  order: number;
  isVisible: boolean;
}

export interface SettingsConfig {
  autoStartTime?: boolean;
  autoEndTime?: boolean;
  requireOperator?: boolean;
  requireHelper?: boolean;
  requireApproval?: boolean;
  allowVoiceNote?: boolean;
  allowImageUpload?: boolean;
}

export interface MachineTemplateData {
  machineId: string;
  machineTypeId?: string;
  orderTypeId: string;
  optionTypeIds?: string[];
  templateName: string;
  description?: string;
  columns: ColumnConfig[];
  customerFields?: CustomerFieldsConfig;
  displayItems?: DisplayItemConfig[];
  totalsConfig?: TotalsConfig[];
  completionConfig?: CompletionConfig;
  settings?: SettingsConfig;
  isActive?: boolean;
  branchId?: string;
}

// Create Machine Template
export const createMachineTemplate = (templateData: MachineTemplateData) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: CREATE_MACHINE_TEMPLATE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const dataToSend = {
      ...templateData,
      branchId: templateData.branchId || branchId
    };

    const { data } = await axios.post(
      `${baseUrl}/machine-template`,
      dataToSend,
      { headers: getHeaders(token) }
    );

    dispatch({ type: CREATE_MACHINE_TEMPLATE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to create machine template";
    dispatch({ type: CREATE_MACHINE_TEMPLATE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get All Machine Templates
export const getMachineTemplates = () =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_MACHINE_TEMPLATES_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const url = branchId
      ? `${baseUrl}/machine-template?branchId=${branchId}`
      : `${baseUrl}/machine-template`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    dispatch({ type: GET_MACHINE_TEMPLATES_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch machine templates";
    dispatch({ type: GET_MACHINE_TEMPLATES_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Machine Template by ID
export const getMachineTemplateById = (id: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_MACHINE_TEMPLATE_BY_ID_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.get(
      `${baseUrl}/machine-template/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: GET_MACHINE_TEMPLATE_BY_ID_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch machine template";
    dispatch({ type: GET_MACHINE_TEMPLATE_BY_ID_FAIL, payload: errorMessage });
    throw error;
  }
};

// Get Templates by Machine ID
export const getTemplatesByMachine = (machineId: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: GET_TEMPLATES_BY_MACHINE_REQUEST });

    const token = getToken(getState);
    const branchId = getBranchId(getState);

    const url = branchId
      ? `${baseUrl}/machine/${machineId}/templates?branchId=${branchId}`
      : `${baseUrl}/machine/${machineId}/templates`;

    const { data } = await axios.get(url, {
      headers: getHeaders(token)
    });

    dispatch({ type: GET_TEMPLATES_BY_MACHINE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch templates for machine";
    dispatch({ type: GET_TEMPLATES_BY_MACHINE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Update Machine Template
export const updateMachineTemplate = (id: string, templateData: Partial<MachineTemplateData>) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_MACHINE_TEMPLATE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.put(
      `${baseUrl}/machine-template/${id}`,
      templateData,
      { headers: getHeaders(token) }
    );

    dispatch({ type: UPDATE_MACHINE_TEMPLATE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update machine template";
    dispatch({ type: UPDATE_MACHINE_TEMPLATE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Delete Machine Template
export const deleteMachineTemplate = (id: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DELETE_MACHINE_TEMPLATE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.delete(
      `${baseUrl}/machine-template/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({ type: DELETE_MACHINE_TEMPLATE_SUCCESS, payload: { id, ...data } });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete machine template";
    dispatch({ type: DELETE_MACHINE_TEMPLATE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Activate Machine Template
export const activateMachineTemplate = (id: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: ACTIVATE_MACHINE_TEMPLATE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.patch(
      `${baseUrl}/machine-template/${id}/activate`,
      {},
      { headers: getHeaders(token) }
    );

    dispatch({ type: ACTIVATE_MACHINE_TEMPLATE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to activate machine template";
    dispatch({ type: ACTIVATE_MACHINE_TEMPLATE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Deactivate Machine Template
export const deactivateMachineTemplate = (id: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DEACTIVATE_MACHINE_TEMPLATE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.patch(
      `${baseUrl}/machine-template/${id}/deactivate`,
      {},
      { headers: getHeaders(token) }
    );

    dispatch({ type: DEACTIVATE_MACHINE_TEMPLATE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to deactivate machine template";
    dispatch({ type: DEACTIVATE_MACHINE_TEMPLATE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Duplicate Machine Template
export const duplicateMachineTemplate = (id: string, newMachineId: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: DUPLICATE_MACHINE_TEMPLATE_REQUEST });

    const token = getToken(getState);

    const { data } = await axios.post(
      `${baseUrl}/machine-template/${id}/duplicate`,
      { newMachineId },
      { headers: getHeaders(token) }
    );

    dispatch({ type: DUPLICATE_MACHINE_TEMPLATE_SUCCESS, payload: data });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to duplicate machine template";
    dispatch({ type: DUPLICATE_MACHINE_TEMPLATE_FAIL, payload: errorMessage });
    throw error;
  }
};

// Clear Errors
export const clearMachineTemplateError = () => ({
  type: CLEAR_MACHINE_TEMPLATE_ERROR
});
