// reducers/orderReducers.ts - Fixed Version

import { combineReducers } from 'redux';
import {
  OrderActionTypes,
  OrderData,
  PaginationInfo,
  OrderSummary,
  StatusCounts,
  OrderFiltersResponse,
  OrderMeta,
  ValidationResult,
  

} from './orderTypes';


// Constants - make sure these match your OdersContants.ts
const ORDER_SAVE_REQUEST = 'ORDER_SAVE_REQUEST';
const ORDER_SAVE_SUCCESS = 'ORDER_SAVE_SUCCESS';
const ORDER_SAVE_FAILURE = 'ORDER_SAVE_FAILURE';
const ORDER_RESET = 'ORDER_RESET';
const COLLECT_FORM_DATA = 'COLLECT_FORM_DATA';
const VALIDATE_FORM_DATA = 'VALIDATE_FORM_DATA';
const CLEAR_FORM_DATA = 'CLEAR_FORM_DATA';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';
const CLEAR_ERROR = 'CLEAR_ERROR';
const SET_SUCCESS_MESSAGE = 'SET_SUCCESS_MESSAGE';
const CLEAR_SUCCESS_MESSAGE = 'CLEAR_SUCCESS_MESSAGE';
const FETCH_ORDERS_REQUEST = 'FETCH_ORDERS_REQUEST';
const FETCH_ORDERS_SUCCESS = 'FETCH_ORDERS_SUCCESS';
const FETCH_ORDERS_FAILURE = 'FETCH_ORDERS_FAILURE';
// const UPDATE_ORDER_STATUS = 'UPDATE_ORDER_STATUS';
const UPDATE_MACHINE_STATUS = 'UPDATE_MACHINE_STATUS';
const CLEAR_ORDERS = 'CLEAR_ORDERS';
const  GET_ACCOUNT_ORDERS_REQUEST = 'GET_ACCOUNT_ORDERS_REQUEST';
const GET_ACCOUNT_ORDERS_SUCCESS = 'GET_ACCOUNT_ORDERS_SUCCESS';
const GET_ACCOUNT_ORDERS_FAILURE = 'GET_ACCOUNT_ORDERS_FAILURE';


// Additional action interfaces to handle CLEAR_ORDERS
interface ClearOrdersAction {
  type: typeof CLEAR_ORDERS;
}

// Extended action types
type ExtendedOrderActionTypes = OrderActionTypes | ClearOrdersAction;

// Order List State - matching your component expectations
interface OrderListState {
  orders: OrderData[];
  pagination: PaginationInfo | null;
  summary: OrderSummary | null;
  statusCounts: StatusCounts | null;
  filters: OrderFiltersResponse | null;
  meta: OrderMeta | null;
  loading: boolean;
  error: string | null;
  isFetching: boolean;
}

// Order Form State
interface OrderFormState {
  currentOrder: OrderData | null;
  formData: OrderData | null;
  validation: ValidationResult | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  warningMessage: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// Initial states
const initialOrderListState: OrderListState = {
  orders: [],
  pagination: null,
  summary: null,
  statusCounts: null,
  filters: null,
  meta: null,
  loading: false,
  error: null,
  isFetching: false,
};

const initialOrderFormState: OrderFormState = {
  currentOrder: null,
  formData: null,
  validation: null,
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
  warningMessage: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
};

// Order List Reducer - THIS IS THE MAIN ONE YOUR COMPONENT USES
const orderListReducer = (
  state: OrderListState = initialOrderListState,
  action: ExtendedOrderActionTypes
): OrderListState => {
  console.log('📊 Order List Reducer - Action:', action.type, action);
  
  switch (action.type) {
    case FETCH_ORDERS_REQUEST:
      console.log('📊 FETCH_ORDERS_REQUEST received');
      return {
        ...state,
        loading: true,
        isFetching: true,
        error: null
      };

    case SET_LOADING:
      console.log('📊 SET_LOADING:', action.payload);
      return {
        ...state,
        loading: action.payload,
        isFetching: action.payload,
        error: action.payload ? null : state.error // Clear error when starting to load
      };

    case SET_ERROR:
      console.log('📊 SET_ERROR:', action.payload);
      return {
        ...state,
        error: action.payload,
        loading: false,
        isFetching: false
      };

    case FETCH_ORDERS_SUCCESS:
      console.log('📊 FETCH_ORDERS_SUCCESS - Full Action:', action);
      console.log('📊 FETCH_ORDERS_SUCCESS - Payload:', action.payload);
      
      // Handle different possible payload structures from your API
      let orders: OrderData[] = [];
      let pagination: PaginationInfo | null = null;
      let summary: OrderSummary | null = null;
      let statusCounts: StatusCounts | null = null;
      
      if (action.payload) {
        // Check if payload has the nested data structure
        if (action.payload.data) {
          orders = action.payload.data.orders || [];
          pagination = action.payload.data.pagination || null;
          summary = action.payload.data.summary || null;
          statusCounts = action.payload.data.statusCounts || null;
        }
        // Check if payload has orders directly
        else if (action.payload.orders) {
          orders = action.payload.orders;
          pagination = action.payload.pagination || null;
          summary = action.payload.summary || null;
          statusCounts = action.payload.statusCounts || null;
        }
        // Check if payload is an array of orders
        else if (Array.isArray(action.payload)) {
          orders = action.payload;
        }
        // If payload has success flag, look for orders in different structures
        else if (action.payload.success !== undefined) {
          if (action.payload.data?.orders) {
            orders = action.payload.data.orders;
            pagination = action.payload.data.pagination || null;
            summary = action.payload.data.summary || null;
            statusCounts = action.payload.data.statusCounts || null;
          }
        }
        // Fallback: try to use payload as single order
        else if (action.payload._id || action.payload.orderId) {
          orders = [action.payload as OrderData];
        }
      }

      console.log('📊 Processed orders:', orders.length);
      console.log('📊 Sample order:', orders[0]);
      console.log('📊 Processed pagination:', pagination);
      
      return {
        ...state,
        orders: orders,
        pagination: pagination,
        summary: summary,
        statusCounts: statusCounts,
        loading: false,
        isFetching: false,
        error: null
      };

    case FETCH_ORDERS_FAILURE:
      console.log('📊 FETCH_ORDERS_FAILURE:', action.payload);
      return {
        ...state,
        orders: [],
        loading: false,
        isFetching: false,
        error: action.payload
      };

    case CLEAR_ORDERS:
      console.log('📊 CLEAR_ORDERS');
      return {
        ...initialOrderListState
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Order Form Reducer
const orderFormReducer = (
  state: OrderFormState = initialOrderFormState,
  action: OrderActionTypes
): OrderFormState => {
  switch (action.type) {
    case ORDER_SAVE_REQUEST:
      return {
        ...state,
        loading: true,
        saving: true,
        isCreating: true,
        error: null,
        successMessage: null,
      };
      
    case ORDER_SAVE_SUCCESS:
      const savePayload = action.payload as any;
      return {
        ...state,
        loading: false,
        saving: false,
        isCreating: false,
        currentOrder: savePayload.order,
        error: null,
        successMessage: 'Order saved successfully!',
      };
      
    case ORDER_SAVE_FAILURE:
      return {
        ...state,
        loading: false,
        saving: false,
        isCreating: false,
        error: action.payload as string,
        successMessage: null,
      };
      
    case ORDER_RESET:
      return {
        ...initialOrderFormState,
      };
      
    case COLLECT_FORM_DATA:
      return {
        ...state,
        formData: action.payload as OrderData,
      };
      
    case VALIDATE_FORM_DATA:
      return {
        ...state,
        validation: action.payload as ValidationResult,
      };
      
    case CLEAR_FORM_DATA:
      return {
        ...state,
        formData: null,
        validation: null,
      };
      
    case SET_ERROR:
      return {
        ...state,
        error: action.payload as string,
        loading: false,
        saving: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
      };
      
    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
      
    case SET_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: action.payload as string,
      };
      
    case CLEAR_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: null,
      };
      
    case UPDATE_MACHINE_STATUS:
      const machinePayload = action.payload as any;
      if (state.currentOrder && state.currentOrder.steps) {
        const updatedSteps = [...state.currentOrder.steps];
        if (updatedSteps[machinePayload.stepIndex]?.machines[machinePayload.machineIndex]) {
          updatedSteps[machinePayload.stepIndex].machines[machinePayload.machineIndex] = {
            ...updatedSteps[machinePayload.stepIndex].machines[machinePayload.machineIndex],
            status: machinePayload.status,
            operatorId: machinePayload.operatorId,
            note: machinePayload.note,
            reason: machinePayload.reason,
          };
        }
        
        return {
          ...state,
          currentOrder: {
            ...state.currentOrder,
            steps: updatedSteps,
          },
        };
      }
      return state;
      
    default:
      return state;
  }
};



// Combined Order Reducer
const orderReducer = combineReducers({
  list: orderListReducer,
  form: orderFormReducer,
});

// Export the combined state type
export type CombinedOrderState = {
  list: OrderListState;
  form: OrderFormState;
};


const initialState = {
  orders: [],
  loading: false,
  error: null
};

export const accountOrdersReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case GET_ACCOUNT_ORDERS_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_ACCOUNT_ORDERS_SUCCESS:
      return { ...state, loading: false, orders: action.payload };

    case GET_ACCOUNT_ORDERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};




export { orderListReducer, orderFormReducer };
export type { OrderListState, OrderFormState };

// Default export
export default orderReducer;