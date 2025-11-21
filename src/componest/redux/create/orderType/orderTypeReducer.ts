import {
  CREATE_ORDER_TYPE_REQUEST,
  CREATE_ORDER_TYPE_SUCCESS,
  CREATE_ORDER_TYPE_FAIL,
  GET_ORDER_TYPES_REQUEST,
  GET_ORDER_TYPES_SUCCESS,
  GET_ORDER_TYPES_FAIL,
  GET_ORDER_TYPE_BY_ID_REQUEST,
  GET_ORDER_TYPE_BY_ID_SUCCESS,
  GET_ORDER_TYPE_BY_ID_FAIL,
  GET_ORDER_TYPES_BY_BRANCH_REQUEST,
  GET_ORDER_TYPES_BY_BRANCH_SUCCESS,
  GET_ORDER_TYPES_BY_BRANCH_FAIL,
  GET_DEFAULT_ORDER_TYPE_REQUEST,
  GET_DEFAULT_ORDER_TYPE_SUCCESS,
  GET_DEFAULT_ORDER_TYPE_FAIL,
  UPDATE_ORDER_TYPE_REQUEST,
  UPDATE_ORDER_TYPE_SUCCESS,
  UPDATE_ORDER_TYPE_FAIL,
  DELETE_ORDER_TYPE_REQUEST,
  DELETE_ORDER_TYPE_SUCCESS,
  DELETE_ORDER_TYPE_FAIL
} from "./orderTypeConstants";

interface OrderTypeState {
  loading: boolean;
  error: string | null;
  orderTypes?: any[];
  orderType?: any;
}

// Order Type List Reducer
const initialListState = {
  orderTypes: [],
  loading: false,
  error: null,
};

export const orderTypeListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case GET_ORDER_TYPES_REQUEST:
    case GET_ORDER_TYPES_BY_BRANCH_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_ORDER_TYPES_SUCCESS:
      return {
        loading: false,
        orderTypes: action.payload.orderTypes || action.payload,
        error: null
      };
    case GET_ORDER_TYPES_BY_BRANCH_SUCCESS:
      return {
        loading: false,
        orderTypes: action.payload.orderTypes || action.payload,
        error: null
      };
    case GET_ORDER_TYPES_FAIL:
    case GET_ORDER_TYPES_BY_BRANCH_FAIL:
      return { loading: false, error: action.payload, orderTypes: [] };
    default:
      return state;
  }
};

// Order Type Detail Reducer
const initialDetailState: OrderTypeState = {
  loading: false,
  error: null,
  orderType: null,
};

export const orderTypeDetailReducer = (state = initialDetailState, action: any): OrderTypeState => {
  switch (action.type) {
    case GET_ORDER_TYPE_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_ORDER_TYPE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        orderType: action.payload.orderType || action.payload
      };
    case GET_ORDER_TYPE_BY_ID_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Default Order Type Reducer
const initialDefaultState: OrderTypeState = {
  loading: false,
  error: null,
  orderType: null,
};

export const defaultOrderTypeReducer = (state = initialDefaultState, action: any): OrderTypeState => {
  switch (action.type) {
    case GET_DEFAULT_ORDER_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_DEFAULT_ORDER_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        orderType: action.payload.orderType || action.payload
      };
    case GET_DEFAULT_ORDER_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, orderType: null };
    default:
      return state;
  }
};

// Create Order Type Reducer
const initialCreateState: OrderTypeState = {
  loading: false,
  error: null,
  orderType: null,
};

export const orderTypeCreateReducer = (state = initialCreateState, action: any): OrderTypeState => {
  switch (action.type) {
    case CREATE_ORDER_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_ORDER_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        orderType: action.payload.orderType || action.payload,
        error: null
      };
    case CREATE_ORDER_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, orderType: null };
    default:
      return state;
  }
};

// Update Order Type Reducer
const initialUpdateState: OrderTypeState = {
  loading: false,
  error: null,
  orderType: null,
};

export const orderTypeUpdateReducer = (state = initialUpdateState, action: any): OrderTypeState => {
  switch (action.type) {
    case UPDATE_ORDER_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_ORDER_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        orderType: action.payload.orderType || action.payload,
        error: null
      };
    case UPDATE_ORDER_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Delete Order Type Reducer
const initialDeleteState = {
  loading: false,
  error: null,
  success: false,
};

export const orderTypeDeleteReducer = (state = initialDeleteState, action: any) => {
  switch (action.type) {
    case DELETE_ORDER_TYPE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case DELETE_ORDER_TYPE_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case DELETE_ORDER_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};
