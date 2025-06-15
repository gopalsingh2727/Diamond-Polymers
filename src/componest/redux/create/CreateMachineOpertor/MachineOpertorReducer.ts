import {
  CREATE_OPERATOR_REQUEST,
  CREATE_OPERATOR_SUCCESS,
  CREATE_OPERATOR_FAIL,
  FETCH_OPERATORS_REQUEST,
  FETCH_OPERATORS_SUCCESS,
  FETCH_OPERATORS_FAIL,
  UPDATE_OPERATOR_REQUEST,
  UPDATE_OPERATOR_SUCCESS,
  UPDATE_OPERATOR_FAIL,
  DELETE_OPERATOR_REQUEST,
  DELETE_OPERATOR_SUCCESS,
  DELETE_OPERATOR_FAIL,
} from "./MachineOpertorConstants";

// 1. Create Operator Reducer
interface OperatorCreateState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const operatorCreateInitialState: OperatorCreateState = {
  loading: false,
  success: false,
  error: null,
};

export const operatorCreateReducer = (
  state = operatorCreateInitialState,
  action: any
): OperatorCreateState => {
  switch (action.type) {
    case CREATE_OPERATOR_REQUEST:
      return { loading: true, success: false, error: null };
    case CREATE_OPERATOR_SUCCESS:
      return { loading: false, success: true, error: null };
    case CREATE_OPERATOR_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// 2. List Operators Reducer
interface OperatorListState {
  loading: boolean;
  operators: any[];
  error: string | null;
}

const operatorListInitialState: OperatorListState = {
  loading: false,
  operators: [],
  error: null,
};

export const operatorListReducer = (
  state = operatorListInitialState,
  action: any
): OperatorListState => {
  switch (action.type) {
    case FETCH_OPERATORS_REQUEST:
      return { ...state, loading: true };
    case FETCH_OPERATORS_SUCCESS:
      return { loading: false, operators: action.payload, error: null };
    case FETCH_OPERATORS_FAIL:
      return { loading: false, operators: [], error: action.payload };
    default:
      return state;
  }
};

// 3. Update Operator Reducer
interface OperatorUpdateState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const operatorUpdateInitialState: OperatorUpdateState = {
  loading: false,
  success: false,
  error: null,
};

export const operatorUpdateReducer = (
  state = operatorUpdateInitialState,
  action: any
): OperatorUpdateState => {
  switch (action.type) {
    case UPDATE_OPERATOR_REQUEST:
      return { loading: true, success: false, error: null };
    case UPDATE_OPERATOR_SUCCESS:
      return { loading: false, success: true, error: null };
    case UPDATE_OPERATOR_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// 4. Delete Operator Reducer
interface OperatorDeleteState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const operatorDeleteInitialState: OperatorDeleteState = {
  loading: false,
  success: false,
  error: null,
};

export const operatorDeleteReducer = (
  state = operatorDeleteInitialState,
  action: any
): OperatorDeleteState => {
  switch (action.type) {
    case DELETE_OPERATOR_REQUEST:
      return { loading: true, success: false, error: null };
    case DELETE_OPERATOR_SUCCESS:
      return { loading: false, success: true, error: null };
    case DELETE_OPERATOR_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};