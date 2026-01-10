// reducers/orderReducers.ts - Fixed Version with WebSocket Support

import { combineReducers } from 'redux';
import {
  OrderActionTypes,
  OrderMachineTableActionTypes,
  OrderData,
  PaginationInfo,
  OrderSummary,
  StatusCounts,
  OrderFiltersResponse,
  OrderMeta,
  ValidationResult,
  OrderMachineTableResponse,
  OrderMachineTableState } from
'./orderTypes';


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

// ✅ UPDATE ORDER Constants - for live table updates
const UPDATE_ORDER_REQUEST = 'UPDATE_ORDER_REQUEST';
const UPDATE_ORDER_SUCCESS = 'UPDATE_ORDER_SUCCESS';
const UPDATE_ORDER_FAILURE = 'UPDATE_ORDER_FAILURE';
const GET_ACCOUNT_ORDERS_REQUEST = 'GET_ACCOUNT_ORDERS_REQUEST';
const GET_ACCOUNT_ORDERS_SUCCESS = 'GET_ACCOUNT_ORDERS_SUCCESS';
const GET_ACCOUNT_ORDERS_FAILURE = 'GET_ACCOUNT_ORDERS_FAILURE';

// WebSocket action constants
const ORDER_CREATED_VIA_WS = 'orders/orderCreatedViaWS';
const ORDER_STATUS_CHANGED_VIA_WS = 'orders/orderStatusChangedViaWS';
const ORDER_PRIORITY_CHANGED_VIA_WS = 'orders/orderPriorityChangedViaWS';
const ORDER_UPDATED_VIA_WS = 'orders/orderUpdatedViaWS';
const ORDER_DELETED_VIA_WS = 'orders/orderDeletedViaWS';
const ORDER_ASSIGNMENT_CHANGED_VIA_WS = 'orders/orderAssignmentChangedViaWS';

// Machine Table Constants
const FETCH_ORDER_MACHINE_TABLE_REQUEST = 'FETCH_ORDER_MACHINE_TABLE_REQUEST';
const FETCH_ORDER_MACHINE_TABLE_SUCCESS = 'FETCH_ORDER_MACHINE_TABLE_SUCCESS';
const FETCH_ORDER_MACHINE_TABLE_FAILURE = 'FETCH_ORDER_MACHINE_TABLE_FAILURE';
const CLEAR_ORDER_MACHINE_TABLE = 'CLEAR_ORDER_MACHINE_TABLE';
const ADD_MACHINE_TABLE_ROW_REQUEST = 'ADD_MACHINE_TABLE_ROW_REQUEST';
const ADD_MACHINE_TABLE_ROW_SUCCESS = 'ADD_MACHINE_TABLE_ROW_SUCCESS';
const ADD_MACHINE_TABLE_ROW_FAILURE = 'ADD_MACHINE_TABLE_ROW_FAILURE';
const UPDATE_MACHINE_TABLE_ROW_REQUEST = 'UPDATE_MACHINE_TABLE_ROW_REQUEST';
const UPDATE_MACHINE_TABLE_ROW_SUCCESS = 'UPDATE_MACHINE_TABLE_ROW_SUCCESS';
const UPDATE_MACHINE_TABLE_ROW_FAILURE = 'UPDATE_MACHINE_TABLE_ROW_FAILURE';
const DELETE_MACHINE_TABLE_ROW_REQUEST = 'DELETE_MACHINE_TABLE_ROW_REQUEST';
const DELETE_MACHINE_TABLE_ROW_SUCCESS = 'DELETE_MACHINE_TABLE_ROW_SUCCESS';
const DELETE_MACHINE_TABLE_ROW_FAILURE = 'DELETE_MACHINE_TABLE_ROW_FAILURE';


// Additional action interfaces to handle CLEAR_ORDERS
interface ClearOrdersAction {
  type: typeof CLEAR_ORDERS;
}

// ✅ UPDATE_ORDER action interfaces for live table updates
interface UpdateOrderRequestAction {
  type: typeof UPDATE_ORDER_REQUEST;
}

interface UpdateOrderSuccessAction {
  type: typeof UPDATE_ORDER_SUCCESS;
  payload: {order: OrderData;message?: string;} | OrderData;
}

interface UpdateOrderFailureAction {
  type: typeof UPDATE_ORDER_FAILURE;
  payload: string;
}

type UpdateOrderActions =
UpdateOrderRequestAction |
UpdateOrderSuccessAction |
UpdateOrderFailureAction;

// WebSocket action interfaces
interface WebSocketOrderCreatedAction {
  type: typeof ORDER_CREATED_VIA_WS;
  payload: OrderData;
}

interface WebSocketOrderStatusChangedAction {
  type: typeof ORDER_STATUS_CHANGED_VIA_WS;
  payload: {_id: string;status: string;updatedAt?: string;};
}

interface WebSocketOrderPriorityChangedAction {
  type: typeof ORDER_PRIORITY_CHANGED_VIA_WS;
  payload: {_id: string;priority: string;updatedAt?: string;};
}

interface WebSocketOrderUpdatedAction {
  type: typeof ORDER_UPDATED_VIA_WS;
  payload: OrderData;
}

interface WebSocketOrderDeletedAction {
  type: typeof ORDER_DELETED_VIA_WS;
  payload: {_id: string;};
}

interface WebSocketOrderAssignmentChangedAction {
  type: typeof ORDER_ASSIGNMENT_CHANGED_VIA_WS;
  payload: {_id: string;machineId?: string;operatorId?: string;updatedAt?: string;};
}

type WebSocketOrderActions =
WebSocketOrderCreatedAction |
WebSocketOrderStatusChangedAction |
WebSocketOrderPriorityChangedAction |
WebSocketOrderUpdatedAction |
WebSocketOrderDeletedAction |
WebSocketOrderAssignmentChangedAction;

// Extended action types
type ExtendedOrderActionTypes = OrderActionTypes | ClearOrdersAction | WebSocketOrderActions | UpdateOrderActions;

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
  isFetching: false
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
  isDeleting: false
};

const initialMachineTableState: OrderMachineTableState = {
  currentMachineTable: null,
  machineTablesCache: {},
  loadingMachineTable: false,
  updatingTableRow: false,
  deletingTableRow: false,
  addingTableRow: false,
  machineTableError: null,
  machineTableSuccess: null
};

// Order List Reducer - THIS IS THE MAIN ONE YOUR COMPONENT USES
const orderListReducer = (
state: OrderListState = initialOrderListState,
action: ExtendedOrderActionTypes)
: OrderListState => {


  switch (action.type) {
    case FETCH_ORDERS_REQUEST:

      return {
        ...state,
        loading: true,
        isFetching: true,
        error: null
      };

    case SET_LOADING:

      return {
        ...state,
        loading: action.payload,
        isFetching: action.payload,
        error: action.payload ? null : state.error // Clear error when starting to load
      };

    case SET_ERROR:

      return {
        ...state,
        error: action.payload,
        loading: false,
        isFetching: false
      };

    case FETCH_ORDERS_SUCCESS:



      // Handle different possible payload structures from your API
      let orders: OrderData[] = [];
      let pagination: PaginationInfo | null = null;
      let summary: OrderSummary | null = null;
      let statusCounts: StatusCounts | null = null;

      if (action.payload) {
        // Check if payload has the nested data structure
        if (action.payload.data) {
          // V2 API: response.data.data.data (v2 unified handler returns { success, data: { data: [], total, ... } })
          // V1 API: response.data.data.orders (old API returns { success, data: { orders: [], ... } })
          orders = action.payload.data.data || action.payload.data.orders || [];
          pagination = action.payload.data.pagination || {
            total: action.payload.data.total,
            page: action.payload.data.page,
            limit: action.payload.data.limit,
            pages: action.payload.data.pages
          } || null;
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

      return {
        ...state,
        orders: [],
        loading: false,
        isFetching: false,
        error: action.payload
      };

    case CLEAR_ORDERS:

      return {
        ...initialOrderListState
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    // ========================================
    // WebSocket Real-Time Update Cases
    // ========================================

    case ORDER_CREATED_VIA_WS:{

        const newOrder = (action as any).payload as OrderData;

        // Check if order already exists (prevent duplicates)
        const exists = state.orders.some((order) => order._id === newOrder._id);
        if (exists) {

          return state;
        }

        return {
          ...state,
          orders: [newOrder, ...state.orders] // Add to beginning
        };
      }

    case ORDER_STATUS_CHANGED_VIA_WS:{

        const { _id, status, updatedAt } = (action as any).payload;

        return {
          ...state,
          orders: state.orders.map((order) =>
          order._id === _id ?
          { ...order, status, ...(updatedAt && { updatedAt }) } :
          order
          )
        };
      }

    case ORDER_PRIORITY_CHANGED_VIA_WS:{

        const { _id, priority, updatedAt } = (action as any).payload;

        return {
          ...state,
          orders: state.orders.map((order) =>
          order._id === _id ?
          { ...order, priority, ...(updatedAt && { updatedAt }) } :
          order
          )
        };
      }

    case ORDER_UPDATED_VIA_WS:{

        const updatedOrder = (action as any).payload as OrderData;

        return {
          ...state,
          orders: state.orders.map((order) =>
          order._id === updatedOrder._id ?
          { ...order, ...updatedOrder } :
          order
          )
        };
      }

    case ORDER_DELETED_VIA_WS:{

        const { _id } = (action as any).payload;

        return {
          ...state,
          orders: state.orders.filter((order) => order._id !== _id)
        };
      }

    case ORDER_ASSIGNMENT_CHANGED_VIA_WS:{

        const { _id, machineId, operatorId, updatedAt } = (action as any).payload;

        return {
          ...state,
          orders: state.orders.map((order) =>
          order._id === _id ?
          {
            ...order,
            ...(machineId !== undefined && { machineId }),
            ...(operatorId !== undefined && { operatorId }),
            ...(updatedAt && { updatedAt })
          } :
          order
          )
        };
      }

    // ✅ FIXED: Handle UPDATE_ORDER_SUCCESS for live table updates
    case UPDATE_ORDER_REQUEST:{

        return {
          ...state,
          loading: true
        };
      }

    case UPDATE_ORDER_SUCCESS:{

        const payload = (action as any).payload;
        const updatedOrder = payload?.order || payload;

        if (!updatedOrder || !updatedOrder._id) {

          return { ...state, loading: false };
        }

        // Update the order in the list
        const orderExists = state.orders.some((order) => order._id === updatedOrder._id);

        if (orderExists) {
          return {
            ...state,
            loading: false,
            orders: state.orders.map((order) =>
            order._id === updatedOrder._id ?
            { ...order, ...updatedOrder } :
            order
            )
          };
        } else {
          // Order not in current list, just update loading state
          return { ...state, loading: false };
        }
      }

    case UPDATE_ORDER_FAILURE:{

        return {
          ...state,
          loading: false,
          error: (action as any).payload || 'Failed to update order'
        };
      }

    default:
      return state;
  }
};

// Order Form Reducer
const orderFormReducer = (
state: OrderFormState = initialOrderFormState,
action: OrderActionTypes)
: OrderFormState => {
  switch (action.type) {
    case ORDER_SAVE_REQUEST:
      return {
        ...state,
        loading: true,
        saving: true,
        isCreating: true,
        error: null,
        successMessage: null
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
        successMessage: 'Order saved successfully!'
      };

    case ORDER_SAVE_FAILURE:
      return {
        ...state,
        loading: false,
        saving: false,
        isCreating: false,
        error: action.payload as string,
        successMessage: null
      };

    case ORDER_RESET:
      return {
        ...initialOrderFormState
      };

    case COLLECT_FORM_DATA:
      return {
        ...state,
        formData: action.payload as OrderData
      };

    case VALIDATE_FORM_DATA:
      return {
        ...state,
        validation: action.payload as ValidationResult
      };

    case CLEAR_FORM_DATA:
      return {
        ...state,
        formData: null,
        validation: null
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.payload as string,
        loading: false,
        saving: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case SET_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: action.payload as string
      };

    case CLEAR_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: null
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
            reason: machinePayload.reason
          };
        }

        return {
          ...state,
          currentOrder: {
            ...state.currentOrder,
            steps: updatedSteps
          }
        };
      }
      return state;

    default:
      return state;
  }
};

// Machine Table Reducer
const machineTableReducer = (
state: OrderMachineTableState = initialMachineTableState,
action: OrderMachineTableActionTypes)
: OrderMachineTableState => {


  switch (action.type) {
    case FETCH_ORDER_MACHINE_TABLE_REQUEST:

      return {
        ...state,
        loadingMachineTable: true,
        machineTableError: null
      };

    case FETCH_ORDER_MACHINE_TABLE_SUCCESS:

      const fetchedTable = action.payload as OrderMachineTableResponse;
      return {
        ...state,
        currentMachineTable: fetchedTable,
        machineTablesCache: {
          ...state.machineTablesCache,
          [fetchedTable.machine.machineId]: fetchedTable
        },
        loadingMachineTable: false,
        machineTableError: null
      };

    case FETCH_ORDER_MACHINE_TABLE_FAILURE:

      return {
        ...state,
        loadingMachineTable: false,
        machineTableError: action.payload as string
      };

    case CLEAR_ORDER_MACHINE_TABLE:

      return {
        ...initialMachineTableState
      };

    case ADD_MACHINE_TABLE_ROW_REQUEST:

      return {
        ...state,
        addingTableRow: true,
        machineTableError: null,
        machineTableSuccess: null
      };

    case ADD_MACHINE_TABLE_ROW_SUCCESS:

      const addedTable = action.payload as OrderMachineTableResponse;
      return {
        ...state,
        currentMachineTable: addedTable,
        machineTablesCache: {
          ...state.machineTablesCache,
          [addedTable.machine.machineId]: addedTable
        },
        addingTableRow: false,
        machineTableError: null,
        machineTableSuccess: 'Row added successfully'
      };

    case ADD_MACHINE_TABLE_ROW_FAILURE:

      return {
        ...state,
        addingTableRow: false,
        machineTableError: action.payload as string,
        machineTableSuccess: null
      };

    case UPDATE_MACHINE_TABLE_ROW_REQUEST:

      return {
        ...state,
        updatingTableRow: true,
        machineTableError: null,
        machineTableSuccess: null
      };

    case UPDATE_MACHINE_TABLE_ROW_SUCCESS:

      const updatedTable = action.payload as OrderMachineTableResponse;
      return {
        ...state,
        currentMachineTable: updatedTable,
        machineTablesCache: {
          ...state.machineTablesCache,
          [updatedTable.machine.machineId]: updatedTable
        },
        updatingTableRow: false,
        machineTableError: null,
        machineTableSuccess: 'Row updated successfully'
      };

    case UPDATE_MACHINE_TABLE_ROW_FAILURE:

      return {
        ...state,
        updatingTableRow: false,
        machineTableError: action.payload as string,
        machineTableSuccess: null
      };

    case DELETE_MACHINE_TABLE_ROW_REQUEST:

      return {
        ...state,
        deletingTableRow: true,
        machineTableError: null,
        machineTableSuccess: null
      };

    case DELETE_MACHINE_TABLE_ROW_SUCCESS:

      const deletedTable = action.payload as OrderMachineTableResponse;
      return {
        ...state,
        currentMachineTable: deletedTable,
        machineTablesCache: {
          ...state.machineTablesCache,
          [deletedTable.machine.machineId]: deletedTable
        },
        deletingTableRow: false,
        machineTableError: null,
        machineTableSuccess: 'Row deleted successfully'
      };

    case DELETE_MACHINE_TABLE_ROW_FAILURE:

      return {
        ...state,
        deletingTableRow: false,
        machineTableError: action.payload as string,
        machineTableSuccess: null
      };

    default:
      return state;
  }
};

// Combined Order Reducer
const orderReducer = combineReducers({
  list: orderListReducer,
  form: orderFormReducer,
  machineTable: machineTableReducer
});

// Export the combined state type
export type CombinedOrderState = {
  list: OrderListState;
  form: OrderFormState;
  machineTable: OrderMachineTableState;
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




export { orderListReducer, orderFormReducer, machineTableReducer };
export type { OrderListState, OrderFormState };

// Default export
export default orderReducer;