import {
  CREATE_MACHINE_REQUEST,
  CREATE_MACHINE_SUCCESS,
  CREATE_MACHINE_FAIL,
  GET_MACHINE_REQUEST,
  GET_MACHINE_SUCCESS,
  GET_MACHINE_FAIL,
  GET_MACHINES_REQUEST,
  GET_MACHINES_SUCCESS,
  GET_MACHINES_FAIL,
  UPDATE_MACHINE_REQUEST,
  UPDATE_MACHINE_SUCCESS,
  UPDATE_MACHINE_FAIL,
  DELETE_MACHINE_REQUEST,
  DELETE_MACHINE_SUCCESS,
  DELETE_MACHINE_FAIL,
} from "./MachineContants";

// ✅ Create state type
interface MachineCreateState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

// ✅ Detail state type
interface MachineDetailState {
  loading: boolean;
  machine: any | null;
  error: string | null;
}

// ✅ Initial states
const createInitialState: MachineCreateState = {
  loading: false,
  success: false,
  error: null,
};

const detailInitialState: MachineDetailState = {
  loading: false,
  machine: null,
  error: null,
};

// ✅ Create reducer
export const machineCreateReducer = (
  state = createInitialState,
  action: any
): MachineCreateState => {
  switch (action.type) {
    case CREATE_MACHINE_REQUEST:
      return { loading: true, success: false, error: null };
    case CREATE_MACHINE_SUCCESS:
      return { loading: false, success: true, error: null };
    case CREATE_MACHINE_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// ✅ Detail reducer
export const machineDetailReducer = (
  state = detailInitialState,
  action: any
): MachineDetailState => {
  switch (action.type) {
    case GET_MACHINE_REQUEST:
      return { ...state, loading: true };
    case GET_MACHINE_SUCCESS:
      return { loading: false, machine: action.payload, error: null };
    case GET_MACHINE_FAIL:
      return { loading: false, machine: null, error: action.payload };
    default:
      return state;
  }
};




interface MachineListState {
  loading: boolean;
  machines: any[];
  error: string | null;
}

const initialState: MachineListState = {
  loading: false,
  machines: [],
  error: null,
};

export const machineListReducer = (
  state = initialState,
  action: any
): MachineListState => {
  switch (action.type) {
    case GET_MACHINES_REQUEST:
      return { ...state, loading: true };
    case GET_MACHINES_SUCCESS:
      return { loading: false, machines: action.payload, error: null };
    case GET_MACHINES_FAIL:
      return { loading: false, machines: [], error: action.payload };
    default:
      return state;
  }
};



const initialUpdateState = {
  loading: false,
  success: false,
  error: null,
};

export const machineUpdateReducer = (state = initialUpdateState, action: any) => {
  switch (action.type) {
    case UPDATE_MACHINE_REQUEST:
      return { loading: true, success: false, error: null };
    case UPDATE_MACHINE_SUCCESS:
      return { loading: false, success: true, error: null };
    case UPDATE_MACHINE_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

const initialDeleteState = {
  loading: false,
  success: false,
  error: null,
};

export const machineDeleteReducer = (state = initialDeleteState, action: any) => {
  switch (action.type) {
    case DELETE_MACHINE_REQUEST:
      return { loading: true, success: false, error: null };
    case DELETE_MACHINE_SUCCESS:
      return { loading: false, success: true, error: null };
    case DELETE_MACHINE_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};