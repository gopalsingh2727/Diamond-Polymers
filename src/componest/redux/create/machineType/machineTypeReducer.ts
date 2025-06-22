import {
  ADD_MACHINE_TYPE_REQUEST,
  ADD_MACHINE_TYPE_SUCCESS,
  ADD_MACHINE_TYPE_FAIL,
  GET_MACHINE_TYPES_REQUEST,
  GET_MACHINE_TYPES_SUCCESS,
  GET_MACHINE_TYPES_FAIL,
  MACHINE_TYPE_REQUEST,
  MACHINE_TYPE_SUCCESS,
  MACHINE_TYPE_FAIL,
  UPDATE_MACHINE_TYPE_REQUEST,
  UPDATE_MACHINE_TYPE_SUCCESS,
  UPDATE_MACHINE_TYPE_FAIL,
  DELETE_MACHINE_TYPE_REQUEST,
  DELETE_MACHINE_TYPE_SUCCESS,
  DELETE_MACHINE_TYPE_FAIL


} from "./machineTypeConstants";

interface MachineTypeState {
  loading: boolean;
  error: string | null;
  success?: boolean;
  items?: any[];
}

const initialCreateState: MachineTypeState = {
  loading: false,
  error: null,
  success: false,
};

export const machineTypeCreateReducer = (state = initialCreateState, action: any): MachineTypeState => {
  switch (action.type) {
    case ADD_MACHINE_TYPE_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case ADD_MACHINE_TYPE_SUCCESS:
      return { ...state, loading: false, success: true };
    case ADD_MACHINE_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const initialListState = {
  items: [],
  loading: false,
  error: null,
};

export const machineTypeListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case GET_MACHINE_TYPES_REQUEST:
    case MACHINE_TYPE_REQUEST:
      return { ...state, loading: true };
    case GET_MACHINE_TYPES_SUCCESS:
    case MACHINE_TYPE_SUCCESS:
      return { loading: false, items: action.payload, error: null };
    case GET_MACHINE_TYPES_FAIL:
    case MACHINE_TYPE_FAIL:
      return { loading: false, error: action.payload, items: [] };
    default:
      return state;
  }
};




interface MachineTypeUpdateState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialUpdateState: MachineTypeUpdateState = {
  loading: false,
  error: null,
  success: false,
};

export const machineTypeUpdateReducer = (
  state = initialUpdateState,
  action: any
): MachineTypeUpdateState => {
  switch (action.type) {
    case UPDATE_MACHINE_TYPE_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case UPDATE_MACHINE_TYPE_SUCCESS:
      return { ...state, loading: false, success: true };
    case UPDATE_MACHINE_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};






interface MachineTypeDeleteState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialDeleteState: MachineTypeDeleteState = {
  loading: false,
  error: null,
  success: false,
};

export const machineTypeDeleteReducer = (
  state = initialDeleteState,
  action: any
): MachineTypeDeleteState => {
  switch (action.type) {
    case DELETE_MACHINE_TYPE_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case DELETE_MACHINE_TYPE_SUCCESS:
      return { ...state, loading: false, success: true };
    case DELETE_MACHINE_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};

