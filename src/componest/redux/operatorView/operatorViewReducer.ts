import {
  GET_MACHINE_ORDERS_REQUEST,
  GET_MACHINE_ORDERS_SUCCESS,
  GET_MACHINE_ORDERS_FAIL,
  GET_ORDER_TABLE_DATA_REQUEST,
  GET_ORDER_TABLE_DATA_SUCCESS,
  GET_ORDER_TABLE_DATA_FAIL,
  ADD_TABLE_ROW_REQUEST,
  ADD_TABLE_ROW_SUCCESS,
  ADD_TABLE_ROW_FAIL,
  UPDATE_TABLE_ROW_REQUEST,
  UPDATE_TABLE_ROW_SUCCESS,
  UPDATE_TABLE_ROW_FAIL,
  DELETE_TABLE_ROW_REQUEST,
  DELETE_TABLE_ROW_SUCCESS,
  DELETE_TABLE_ROW_FAIL,
  MARK_ORDER_COMPLETE_REQUEST,
  MARK_ORDER_COMPLETE_SUCCESS,
  MARK_ORDER_COMPLETE_FAIL,
  WS_MACHINE_TABLE_ROW_ADDED,
  WS_MACHINE_TABLE_ROW_UPDATED,
  WS_MACHINE_TABLE_ROW_DELETED,
  WS_MACHINE_TABLE_ORDER_COMPLETE,
  CLEAR_OPERATOR_VIEW_ERROR,
  CLEAR_ORDER_TABLE_DATA,
  SET_SELECTED_ORDER
} from "./operatorViewConstants";

// Types
export interface OrderOption {
  optionId?: string;
  optionName: string;
  optionCode?: string;
  category?: string;  // Optional - can be any category or none
  quantity?: number;
  specificationValues?: any[];
}

export interface MachineTableSummary {
  machineId: string;
  machineName?: string;
  totals?: Record<string, number>;
  progress?: number;
  isComplete?: boolean;
}

export interface MachineTemplate {
  _id: string;
  templateName: string;
  orderTypeId?: string;
  orderTypeName?: string;
}

export interface MachineOrder {
  _id: string;
  orderId: string;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderImage?: string;
  orderTypeId: any;
  orderType?: any;
  machineTableData?: any;
  status?: string;
  progress?: number;
  isComplete?: boolean;
  options?: OrderOption[];
}

export interface TableRow {
  _id: string;
  rowNumber: number;
  values: Array<{
    columnName: string;
    value: any;
    unit?: string;
  }>;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface OrderTableData {
  orderId: string;
  orderNumber?: string;
  orderType?: any;
  customer?: any;
  template?: any;
  options?: OrderOption[];
  rows: TableRow[];
  totals?: Record<string, number>;
  targetValue?: number;
  currentValue?: number;
  progress?: number;
  isComplete?: boolean;
  previousMachines?: MachineTableSummary[];  // Data from previous machines in workflow
}

interface OperatorViewState {
  loading: boolean;
  rowLoading: boolean;
  error: string | null;
  orders: MachineOrder[];
  selectedOrder: MachineOrder | null;
  tableData: OrderTableData | null;
  templates: MachineTemplate[];
  success: boolean;
}

// Initial State
const initialState: OperatorViewState = {
  loading: false,
  rowLoading: false,
  error: null,
  orders: [],
  selectedOrder: null,
  tableData: null,
  templates: [],
  success: false
};

// Main Reducer
const operatorViewReducer = (
  state = initialState,
  action: any
): OperatorViewState => {
  switch (action.type) {
    // Get Machine Orders
    case GET_MACHINE_ORDERS_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_MACHINE_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: action.payload.orders || action.payload,
        templates: action.payload.templates || state.templates,
        error: null
      };
    case GET_MACHINE_ORDERS_FAIL:
      return { ...state, loading: false, error: action.payload, orders: [] };

    // Get Order Table Data
    case GET_ORDER_TABLE_DATA_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_ORDER_TABLE_DATA_SUCCESS:
      const tableDataPayload = action.payload.data || action.payload;
      return {
        ...state,
        loading: false,
        tableData: {
          orderId: tableDataPayload.orderId,
          orderNumber: tableDataPayload.orderNumber,
          orderType: tableDataPayload.orderType,
          customer: tableDataPayload.customer,
          template: tableDataPayload.template,
          options: tableDataPayload.options || [],
          rows: tableDataPayload.tableData?.rows || tableDataPayload.rows || [],
          totals: tableDataPayload.tableData?.totals || tableDataPayload.totals || {},
          targetValue: tableDataPayload.tableData?.targetValue || tableDataPayload.targetValue,
          currentValue: tableDataPayload.tableData?.currentValue || tableDataPayload.currentValue,
          progress: tableDataPayload.tableData?.progress || tableDataPayload.progress,
          isComplete: tableDataPayload.tableData?.isComplete || tableDataPayload.isComplete,
          previousMachines: tableDataPayload.previousMachines || []
        },
        error: null
      };
    case GET_ORDER_TABLE_DATA_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Add Table Row
    case ADD_TABLE_ROW_REQUEST:
      return { ...state, rowLoading: true, error: null, success: false };
    case ADD_TABLE_ROW_SUCCESS:
      const newRow = action.payload.row;
      const addedTableData = state.tableData ? {
        ...state.tableData,
        rows: [...state.tableData.rows, newRow],
        totals: action.payload.totals || state.tableData.totals,
        currentValue: action.payload.currentValue ?? state.tableData.currentValue,
        progress: action.payload.progress ?? state.tableData.progress,
        isComplete: action.payload.isComplete ?? state.tableData.isComplete
      } : null;
      return {
        ...state,
        rowLoading: false,
        tableData: addedTableData,
        success: true,
        error: null
      };
    case ADD_TABLE_ROW_FAIL:
      return { ...state, rowLoading: false, error: action.payload, success: false };

    // Update Table Row
    case UPDATE_TABLE_ROW_REQUEST:
      return { ...state, rowLoading: true, error: null, success: false };
    case UPDATE_TABLE_ROW_SUCCESS:
      const updatedRow = action.payload.row;
      const updatedTableData = state.tableData ? {
        ...state.tableData,
        rows: state.tableData.rows.map(r =>
          r._id === updatedRow._id ? updatedRow : r
        ),
        totals: action.payload.totals || state.tableData.totals,
        currentValue: action.payload.currentValue ?? state.tableData.currentValue,
        progress: action.payload.progress ?? state.tableData.progress,
        isComplete: action.payload.isComplete ?? state.tableData.isComplete
      } : null;
      return {
        ...state,
        rowLoading: false,
        tableData: updatedTableData,
        success: true,
        error: null
      };
    case UPDATE_TABLE_ROW_FAIL:
      return { ...state, rowLoading: false, error: action.payload, success: false };

    // Delete Table Row
    case DELETE_TABLE_ROW_REQUEST:
      return { ...state, rowLoading: true, error: null, success: false };
    case DELETE_TABLE_ROW_SUCCESS:
      const deletedRowId = action.payload.rowId;
      const afterDeleteTableData = state.tableData ? {
        ...state.tableData,
        rows: state.tableData.rows.filter(r => r._id !== deletedRowId),
        totals: action.payload.totals || state.tableData.totals,
        currentValue: action.payload.currentValue ?? state.tableData.currentValue,
        progress: action.payload.progress ?? state.tableData.progress
      } : null;
      return {
        ...state,
        rowLoading: false,
        tableData: afterDeleteTableData,
        success: true,
        error: null
      };
    case DELETE_TABLE_ROW_FAIL:
      return { ...state, rowLoading: false, error: action.payload, success: false };

    // Mark Order Complete
    case MARK_ORDER_COMPLETE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case MARK_ORDER_COMPLETE_SUCCESS:
      const completedOrderId = action.payload.orderId;
      return {
        ...state,
        loading: false,
        orders: state.orders.map(o =>
          o._id === completedOrderId ? { ...o, isComplete: true, status: 'completed' } : o
        ),
        tableData: state.tableData && state.tableData.orderId === completedOrderId
          ? { ...state.tableData, isComplete: true }
          : state.tableData,
        success: true,
        error: null
      };
    case MARK_ORDER_COMPLETE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };

    // WebSocket Events
    case WS_MACHINE_TABLE_ROW_ADDED:
      if (state.tableData && state.tableData.orderId === action.payload.orderId) {
        // Avoid duplicates
        if (state.tableData.rows.find(r => r._id === action.payload.row._id)) {
          return state;
        }
        return {
          ...state,
          tableData: {
            ...state.tableData,
            rows: [...state.tableData.rows, action.payload.row],
            totals: action.payload.totals || state.tableData.totals,
            currentValue: action.payload.currentValue ?? state.tableData.currentValue,
            progress: action.payload.progress ?? state.tableData.progress
          }
        };
      }
      return state;

    case WS_MACHINE_TABLE_ROW_UPDATED:
      if (state.tableData && state.tableData.orderId === action.payload.orderId) {
        return {
          ...state,
          tableData: {
            ...state.tableData,
            rows: state.tableData.rows.map(r =>
              r._id === action.payload.row._id ? action.payload.row : r
            ),
            totals: action.payload.totals || state.tableData.totals,
            currentValue: action.payload.currentValue ?? state.tableData.currentValue,
            progress: action.payload.progress ?? state.tableData.progress
          }
        };
      }
      return state;

    case WS_MACHINE_TABLE_ROW_DELETED:
      if (state.tableData && state.tableData.orderId === action.payload.orderId) {
        return {
          ...state,
          tableData: {
            ...state.tableData,
            rows: state.tableData.rows.filter(r => r._id !== action.payload.rowId),
            totals: action.payload.totals || state.tableData.totals,
            currentValue: action.payload.currentValue ?? state.tableData.currentValue,
            progress: action.payload.progress ?? state.tableData.progress
          }
        };
      }
      return state;

    case WS_MACHINE_TABLE_ORDER_COMPLETE:
      return {
        ...state,
        orders: state.orders.map(o =>
          o._id === action.payload.orderId ? { ...o, isComplete: true, status: 'completed' } : o
        ),
        tableData: state.tableData && state.tableData.orderId === action.payload.orderId
          ? { ...state.tableData, isComplete: true }
          : state.tableData
      };

    // Clear Error
    case CLEAR_OPERATOR_VIEW_ERROR:
      return { ...state, error: null, success: false };

    // Clear Order Table Data
    case CLEAR_ORDER_TABLE_DATA:
      return { ...state, tableData: null };

    // Set Selected Order
    case SET_SELECTED_ORDER:
      return { ...state, selectedOrder: action.payload };

    default:
      return state;
  }
};

export default operatorViewReducer;
