
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

interface DeviceAccess {
  _id: string;
  deviceName: string;
  location: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

interface DeviceAccessState {
  // Create functionality (detailed names)
  createLoading: boolean;
  createSuccess: boolean;
  createError: string | null;
  createdDevice: DeviceAccess | null;

  // Create functionality (simple names for component compatibility)
  loading: boolean;
  success: boolean;
  error: string | null;

  // List functionality
  listLoading: boolean;
  listError: string | null;
  devices: DeviceAccess[];

  // Update functionality
  updateLoading: boolean;
  updateSuccess: boolean;
  updateError: string | null;
  updatedDevice: DeviceAccess | null;

  // Delete functionality
  deleteLoading: boolean;
  deleteSuccess: boolean;
  deleteError: string | null;
  deletedDeviceId: string | null;
}

const initialState: DeviceAccessState = {
  // Create state (detailed names)
  createLoading: false,
  createSuccess: false,
  createError: null,
  createdDevice: null,

  // Create state (simple names for component compatibility)
  loading: false,
  success: false,
  error: null,

  // List state
  listLoading: false,
  listError: null,
  devices: [],

  // Update state
  updateLoading: false,
  updateSuccess: false,
  updateError: null,
  updatedDevice: null,

  // Delete state
  deleteLoading: false,
  deleteSuccess: false,
  deleteError: null,
  deletedDeviceId: null,
};

export const deviceAccessReducer = (
  state = initialState,
  action: any
): DeviceAccessState => {
  switch (action.type) {
    // Create cases
    case DEVICE_ACCESS_CREATE_REQUEST:
      return {
        ...state,
        createLoading: true,
        loading: true,
        createError: null,
        error: null,
        createSuccess: false,
        success: false,
      };

    case DEVICE_ACCESS_CREATE_SUCCESS:
      return {
        ...state,
        createLoading: false,
        loading: false,
        createSuccess: true,
        success: true,
        createdDevice: action.payload,
        createError: null,
        error: null,
        devices: [...state.devices, action.payload],
      };

    case DEVICE_ACCESS_CREATE_FAIL:
      return {
        ...state,
        createLoading: false,
        loading: false,
        createError: action.payload,
        error: action.payload,
        createSuccess: false,
        success: false,
      };

    // List cases
    case DEVICE_ACCESS_LIST_REQUEST:
      return {
        ...state,
        listLoading: true,
        listError: null,
      };

    case DEVICE_ACCESS_LIST_SUCCESS:
      return {
        ...state,
        listLoading: false,
        devices: action.payload,
        listError: null,
      };

    case DEVICE_ACCESS_LIST_FAIL:
      return {
        ...state,
        listLoading: false,
        listError: action.payload,
      };

    // Update cases
    case DEVICE_ACCESS_UPDATE_REQUEST:
      return {
        ...state,
        updateLoading: true,
        updateError: null,
        updateSuccess: false,
      };

    case DEVICE_ACCESS_UPDATE_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        updateSuccess: true,
        updatedDevice: action.payload,
        updateError: null,
        // Update the device in the devices array
        devices: state.devices.map((device) =>
          device._id === action.payload._id ? action.payload : device
        ),
      };

    case DEVICE_ACCESS_UPDATE_FAIL:
      return {
        ...state,
        updateLoading: false,
        updateError: action.payload,
        updateSuccess: false,
      };

    // Delete cases
    case DEVICE_ACCESS_DELETE_REQUEST:
      return {
        ...state,
        deleteLoading: true,
        deleteError: null,
        deleteSuccess: false,
      };

    case DEVICE_ACCESS_DELETE_SUCCESS:
      return {
        ...state,
        deleteLoading: false,
        deleteSuccess: true,
        deletedDeviceId: action.payload,
        deleteError: null,
        // Remove the device from the devices array
        devices: state.devices.filter((device) => device._id !== action.payload),
      };

    case DEVICE_ACCESS_DELETE_FAIL:
      return {
        ...state,
        deleteLoading: false,
        deleteError: action.payload,
        deleteSuccess: false,
      };

    default:
      return state;
  }
};