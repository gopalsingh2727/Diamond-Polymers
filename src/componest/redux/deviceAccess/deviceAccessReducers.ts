// Add this to your deviceAccessReducer.ts or create a types file

import {
  DEVICE_ACCESS_CREATE_REQUEST,
  DEVICE_ACCESS_CREATE_SUCCESS,
  DEVICE_ACCESS_CREATE_FAIL,
  DEVICE_ACCESS_LIST_REQUEST,
  DEVICE_ACCESS_LIST_SUCCESS,
  DEVICE_ACCESS_LIST_FAIL,
  DEVICE_ACCESS_UPDATE_REQUEST,
  DEVICE_ACCESS_UPDATE_SUCCESS,
  DEVICE_ACCESS_UPDATE_FAIL,
  DEVICE_ACCESS_DELETE_REQUEST,
  DEVICE_ACCESS_DELETE_SUCCESS,
  DEVICE_ACCESS_DELETE_FAIL,
} from "./deviceAccessConstants";

// Define the Device Access type
export interface DeviceAccess {
  _id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  branchId?: {
    _id: string;
    branchName: string;
  } | string;
  password?: string;
  pin?: string;
  machines?: Array<{
    machineId: string;
    machineName: string;
    machineType: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Define the state type
export interface DeviceAccessState {
  devices: DeviceAccess[];
  createdDevice: DeviceAccess | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Initial state
const initialState: DeviceAccessState = {
  devices: [],
  createdDevice: null,
  loading: false,
  success: false,
  error: null,
};

// Action types
interface DeviceAccessCreateRequest {
  type: typeof DEVICE_ACCESS_CREATE_REQUEST;
}

interface DeviceAccessCreateSuccess {
  type: typeof DEVICE_ACCESS_CREATE_SUCCESS;
  payload: DeviceAccess;
}

interface DeviceAccessCreateFail {
  type: typeof DEVICE_ACCESS_CREATE_FAIL;
  payload: string;
}

interface DeviceAccessListRequest {
  type: typeof DEVICE_ACCESS_LIST_REQUEST;
}

interface DeviceAccessListSuccess {
  type: typeof DEVICE_ACCESS_LIST_SUCCESS;
  payload: DeviceAccess[];
}

interface DeviceAccessListFail {
  type: typeof DEVICE_ACCESS_LIST_FAIL;
  payload: string;
}

interface DeviceAccessUpdateRequest {
  type: typeof DEVICE_ACCESS_UPDATE_REQUEST;
}

interface DeviceAccessUpdateSuccess {
  type: typeof DEVICE_ACCESS_UPDATE_SUCCESS;
  payload: DeviceAccess;
}

interface DeviceAccessUpdateFail {
  type: typeof DEVICE_ACCESS_UPDATE_FAIL;
  payload: string;
}

interface DeviceAccessDeleteRequest {
  type: typeof DEVICE_ACCESS_DELETE_REQUEST;
}

interface DeviceAccessDeleteSuccess {
  type: typeof DEVICE_ACCESS_DELETE_SUCCESS;
  payload: string;
}

interface DeviceAccessDeleteFail {
  type: typeof DEVICE_ACCESS_DELETE_FAIL;
  payload: string;
}

interface DeviceAccessReset {
  type: 'deviceAccess/reset';
}

type DeviceAccessActionTypes =
  | DeviceAccessCreateRequest
  | DeviceAccessCreateSuccess
  | DeviceAccessCreateFail
  | DeviceAccessListRequest
  | DeviceAccessListSuccess
  | DeviceAccessListFail
  | DeviceAccessUpdateRequest
  | DeviceAccessUpdateSuccess
  | DeviceAccessUpdateFail
  | DeviceAccessDeleteRequest
  | DeviceAccessDeleteSuccess
  | DeviceAccessDeleteFail
  | DeviceAccessReset;

// Reducer
const deviceAccessReducer = (
  state = initialState,
  action: DeviceAccessActionTypes
): DeviceAccessState => {
  switch (action.type) {
    case DEVICE_ACCESS_CREATE_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };

    case DEVICE_ACCESS_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        createdDevice: action.payload,
        error: null,
      };

    case DEVICE_ACCESS_CREATE_FAIL:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
        createdDevice: null,
      };

    case DEVICE_ACCESS_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DEVICE_ACCESS_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        devices: action.payload,
        error: null,
      };

    case DEVICE_ACCESS_LIST_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        devices: [],
      };

    case DEVICE_ACCESS_UPDATE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DEVICE_ACCESS_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        devices: state.devices.map((device) =>
          device._id === action.payload._id ? action.payload : device
        ),
        error: null,
      };

    case DEVICE_ACCESS_UPDATE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case DEVICE_ACCESS_DELETE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DEVICE_ACCESS_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        devices: state.devices.filter((device) => device._id !== action.payload),
        error: null,
      };

    case DEVICE_ACCESS_DELETE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'deviceAccess/reset':
      return {
        ...state,
        success: false,
        error: null,
        createdDevice: null,
      };

    default:
      return state;
  }
};

export default deviceAccessReducer;