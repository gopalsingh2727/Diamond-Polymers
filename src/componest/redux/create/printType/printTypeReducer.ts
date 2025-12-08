import {
  CREATE_PRINT_TYPE_REQUEST,
  CREATE_PRINT_TYPE_SUCCESS,
  CREATE_PRINT_TYPE_FAIL,
  GET_PRINT_TYPES_REQUEST,
  GET_PRINT_TYPES_SUCCESS,
  GET_PRINT_TYPES_FAIL,
  GET_PRINT_TYPE_BY_ID_REQUEST,
  GET_PRINT_TYPE_BY_ID_SUCCESS,
  GET_PRINT_TYPE_BY_ID_FAIL,
  GET_PRINT_TYPES_BY_BRANCH_REQUEST,
  GET_PRINT_TYPES_BY_BRANCH_SUCCESS,
  GET_PRINT_TYPES_BY_BRANCH_FAIL,
  GET_PRINT_TYPES_BY_ORDER_TYPE_REQUEST,
  GET_PRINT_TYPES_BY_ORDER_TYPE_SUCCESS,
  GET_PRINT_TYPES_BY_ORDER_TYPE_FAIL,
  GET_DEFAULT_PRINT_TYPE_REQUEST,
  GET_DEFAULT_PRINT_TYPE_SUCCESS,
  GET_DEFAULT_PRINT_TYPE_FAIL,
  UPDATE_PRINT_TYPE_REQUEST,
  UPDATE_PRINT_TYPE_SUCCESS,
  UPDATE_PRINT_TYPE_FAIL,
  DELETE_PRINT_TYPE_REQUEST,
  DELETE_PRINT_TYPE_SUCCESS,
  DELETE_PRINT_TYPE_FAIL
} from "./printTypeConstants";

interface PrintTypeState {
  loading: boolean;
  error: string | null;
  printTypes?: any[];
  printType?: any;
}

// Print Type List Reducer
const initialListState = {
  printTypes: [],
  loading: false,
  error: null,
};

export const printTypeListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case GET_PRINT_TYPES_REQUEST:
    case GET_PRINT_TYPES_BY_BRANCH_REQUEST:
    case GET_PRINT_TYPES_BY_ORDER_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_PRINT_TYPES_SUCCESS:
      return {
        loading: false,
        printTypes: action.payload.printTypes || action.payload,
        error: null
      };
    case GET_PRINT_TYPES_BY_BRANCH_SUCCESS:
    case GET_PRINT_TYPES_BY_ORDER_TYPE_SUCCESS:
      return {
        loading: false,
        printTypes: action.payload.printTypes || action.payload,
        error: null
      };
    case GET_PRINT_TYPES_FAIL:
    case GET_PRINT_TYPES_BY_BRANCH_FAIL:
    case GET_PRINT_TYPES_BY_ORDER_TYPE_FAIL:
      return { loading: false, error: action.payload, printTypes: [] };
    default:
      return state;
  }
};

// Print Type Detail Reducer
const initialDetailState: PrintTypeState = {
  loading: false,
  error: null,
  printType: null,
};

export const printTypeDetailReducer = (state = initialDetailState, action: any): PrintTypeState => {
  switch (action.type) {
    case GET_PRINT_TYPE_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_PRINT_TYPE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        printType: action.payload.printType || action.payload
      };
    case GET_PRINT_TYPE_BY_ID_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Default Print Type Reducer
const initialDefaultState: PrintTypeState = {
  loading: false,
  error: null,
  printType: null,
};

export const defaultPrintTypeReducer = (state = initialDefaultState, action: any): PrintTypeState => {
  switch (action.type) {
    case GET_DEFAULT_PRINT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_DEFAULT_PRINT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        printType: action.payload.printType || action.payload
      };
    case GET_DEFAULT_PRINT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, printType: null };
    default:
      return state;
  }
};

// Create Print Type Reducer
const initialCreateState: PrintTypeState = {
  loading: false,
  error: null,
  printType: null,
};

export const printTypeCreateReducer = (state = initialCreateState, action: any): PrintTypeState => {
  switch (action.type) {
    case CREATE_PRINT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_PRINT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        printType: action.payload.printType || action.payload,
        error: null
      };
    case CREATE_PRINT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, printType: null };
    default:
      return state;
  }
};

// Update Print Type Reducer
const initialUpdateState: PrintTypeState = {
  loading: false,
  error: null,
  printType: null,
};

export const printTypeUpdateReducer = (state = initialUpdateState, action: any): PrintTypeState => {
  switch (action.type) {
    case UPDATE_PRINT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_PRINT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        printType: action.payload.printType || action.payload,
        error: null
      };
    case UPDATE_PRINT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Delete Print Type Reducer
const initialDeleteState = {
  loading: false,
  error: null,
  success: false,
};

export const printTypeDeleteReducer = (state = initialDeleteState, action: any) => {
  switch (action.type) {
    case DELETE_PRINT_TYPE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case DELETE_PRINT_TYPE_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case DELETE_PRINT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};
