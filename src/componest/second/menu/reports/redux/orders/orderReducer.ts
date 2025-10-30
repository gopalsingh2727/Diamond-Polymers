// orderReducer.ts - Order Reducer matching MongoDB Schema
import {
  OrderActionTypes,
  OrderState,
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
  FETCH_ORDER_BY_ID_REQUEST,
  FETCH_ORDER_BY_ID_SUCCESS,
  FETCH_ORDER_BY_ID_FAILURE,
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  UPDATE_ORDER_REQUEST,
  UPDATE_ORDER_SUCCESS,
  UPDATE_ORDER_FAILURE,
  DELETE_ORDER_REQUEST,
  DELETE_ORDER_SUCCESS,
  DELETE_ORDER_FAILURE,
  UPDATE_ORDER_STATUS_SUCCESS,
  COMPLETE_MACHINE_SUCCESS,
  PROGRESS_TO_NEXT_STEP_SUCCESS,
  UPDATE_REALTIME_DATA_SUCCESS,
  ADD_ORDER_NOTE_SUCCESS,
  UPDATE_QUALITY_CONTROL_SUCCESS,
  FETCH_DASHBOARD_DATA_REQUEST,
  FETCH_DASHBOARD_DATA_SUCCESS,
  FETCH_DASHBOARD_DATA_FAILURE,
  FETCH_EFFICIENCY_REPORT_REQUEST,
  FETCH_EFFICIENCY_REPORT_SUCCESS,
  FETCH_EFFICIENCY_REPORT_FAILURE,
  SET_ORDER_FILTERS,
  CLEAR_ORDER_FILTERS,
  SET_CURRENT_ORDER,
  CLEAR_CURRENT_ORDER,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_SUCCESS_MESSAGE,
  CLEAR_SUCCESS_MESSAGE,
} from './orderTypes';

// Initial State
const initialState: OrderState = {
  currentOrder: null,
  orders: [],
  pagination: null,
  dashboardData: null,
  efficiencyReport: null,
  filters: {},
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isFetching: false,
};

// Order Reducer
const orderReducer = (
  state: OrderState = initialState,
  action: OrderActionTypes
): OrderState => {
  switch (action.type) {
    // ==================== Fetch Orders ====================
    case FETCH_ORDERS_REQUEST:
      return {
        ...state,
        loading: true,
        isFetching: true,
        error: null,
      };

    case FETCH_ORDERS_SUCCESS:
      const ordersData = action.payload.data || action.payload;
      return {
        ...state,
        orders: ordersData.orders || [],
        pagination: ordersData.pagination || null,
        loading: false,
        isFetching: false,
        error: null,
      };

    case FETCH_ORDERS_FAILURE:
      return {
        ...state,
        loading: false,
        isFetching: false,
        error: action.payload,
      };

    // ==================== Fetch Order By ID ====================
    case FETCH_ORDER_BY_ID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_ORDER_BY_ID_SUCCESS:
      return {
        ...state,
        currentOrder: action.payload,
        loading: false,
        error: null,
      };

    case FETCH_ORDER_BY_ID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ==================== Create Order ====================
    case CREATE_ORDER_REQUEST:
      return {
        ...state,
        isCreating: true,
        saving: true,
        loading: true,
        error: null,
      };

    case CREATE_ORDER_SUCCESS:
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        currentOrder: action.payload,
        isCreating: false,
        saving: false,
        loading: false,
        error: null,
      };

    case CREATE_ORDER_FAILURE:
      return {
        ...state,
        isCreating: false,
        saving: false,
        loading: false,
        error: action.payload,
      };

    // ==================== Update Order ====================
    case UPDATE_ORDER_REQUEST:
      return {
        ...state,
        isUpdating: true,
        saving: true,
        loading: true,
        error: null,
      };

    case UPDATE_ORDER_SUCCESS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
        currentOrder: action.payload,
        isUpdating: false,
        saving: false,
        loading: false,
        error: null,
      };

    case UPDATE_ORDER_FAILURE:
      return {
        ...state,
        isUpdating: false,
        saving: false,
        loading: false,
        error: action.payload,
      };

    // ==================== Delete Order ====================
    case DELETE_ORDER_REQUEST:
      return {
        ...state,
        isDeleting: true,
        loading: true,
        error: null,
      };

    case DELETE_ORDER_SUCCESS:
      return {
        ...state,
        orders: state.orders.filter(order => order._id !== action.payload),
        currentOrder: state.currentOrder?._id === action.payload ? null : state.currentOrder,
        isDeleting: false,
        loading: false,
        error: null,
      };

    case DELETE_ORDER_FAILURE:
      return {
        ...state,
        isDeleting: false,
        loading: false,
        error: action.payload,
      };

    // ==================== Update Order Status ====================
    case UPDATE_ORDER_STATUS_SUCCESS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
        currentOrder: state.currentOrder?._id === action.payload._id 
          ? action.payload 
          : state.currentOrder,
      };

    // ==================== Complete Machine ====================
    case COMPLETE_MACHINE_SUCCESS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
        currentOrder: state.currentOrder?._id === action.payload._id 
          ? action.payload 
          : state.currentOrder,
      };

    // ==================== Progress to Next Step ====================
    case PROGRESS_TO_NEXT_STEP_SUCCESS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
        currentOrder: state.currentOrder?._id === action.payload._id 
          ? action.payload 
          : state.currentOrder,
      };

    // ==================== Update Real-time Data ====================
    case UPDATE_REALTIME_DATA_SUCCESS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
        currentOrder: state.currentOrder?._id === action.payload._id 
          ? action.payload 
          : state.currentOrder,
      };

    // ==================== Add Order Note ====================
    case ADD_ORDER_NOTE_SUCCESS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
        currentOrder: state.currentOrder?._id === action.payload._id 
          ? action.payload 
          : state.currentOrder,
      };

    // ==================== Update Quality Control ====================
    case UPDATE_QUALITY_CONTROL_SUCCESS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
        currentOrder: state.currentOrder?._id === action.payload._id 
          ? action.payload 
          : state.currentOrder,
      };

    // ==================== Dashboard Data ====================
    case FETCH_DASHBOARD_DATA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_DASHBOARD_DATA_SUCCESS:
      return {
        ...state,
        dashboardData: action.payload,
        loading: false,
        error: null,
      };

    case FETCH_DASHBOARD_DATA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ==================== Efficiency Report ====================
    case FETCH_EFFICIENCY_REPORT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_EFFICIENCY_REPORT_SUCCESS:
      return {
        ...state,
        efficiencyReport: action.payload,
        loading: false,
        error: null,
      };

    case FETCH_EFFICIENCY_REPORT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ==================== Filters ====================
    case SET_ORDER_FILTERS:
      return {
        ...state,
        filters: action.payload,
      };

    case CLEAR_ORDER_FILTERS:
      return {
        ...state,
        filters: {},
      };

    // ==================== Current Order ====================
    case SET_CURRENT_ORDER:
      return {
        ...state,
        currentOrder: action.payload,
      };

    case CLEAR_CURRENT_ORDER:
      return {
        ...state,
        currentOrder: null,
      };

    // ==================== UI State ====================
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case SET_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: action.payload,
      };

    case CLEAR_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: null,
      };

    default:
      return state;
  }
};

export default orderReducer;
