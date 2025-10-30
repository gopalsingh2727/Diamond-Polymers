// reportReducer.ts - Report Reducers
import { combineReducers } from 'redux';
import {
  ReportActionTypes,
  OverviewReportState,
  OrdersReportState,
  ProductionReportState,
  MachineReportState,
  CustomerReportState,
  FiltersState,
  BranchState,
} from './reportTypes';
import {
  FETCH_OVERVIEW_REQUEST,
  FETCH_OVERVIEW_SUCCESS,
  FETCH_OVERVIEW_FAILURE,
  FETCH_ORDERS_REPORT_REQUEST,
  FETCH_ORDERS_REPORT_SUCCESS,
  FETCH_ORDERS_REPORT_FAILURE,
  FETCH_PRODUCTION_REQUEST,
  FETCH_PRODUCTION_SUCCESS,
  FETCH_PRODUCTION_FAILURE,
  FETCH_MACHINES_REQUEST,
  FETCH_MACHINES_SUCCESS,
  FETCH_MACHINES_FAILURE,
  FETCH_CUSTOMERS_REQUEST,
  FETCH_CUSTOMERS_SUCCESS,
  FETCH_CUSTOMERS_FAILURE,
  FETCH_MATERIALS_SUCCESS,
  SET_DATE_RANGE,
  SET_STATUS_FILTER,
  SET_PRIORITY_FILTER,
  SET_MACHINE_TYPE_FILTER,
  SET_MATERIAL_TYPE_FILTER,
  CLEAR_FILTERS,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_SUCCESS_MESSAGE,
  CLEAR_SUCCESS_MESSAGE,
  SET_ACTIVE_TAB,
  SET_BRANCH,
} from './reportConstants';

// Get default date range (last 30 days)
const getDefaultDateRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from, to };
};

// Initial States
const initialOverviewState: OverviewReportState = {
  orders: [],
  efficiencyTrends: [],
  productionOutput: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialOrdersState: OrdersReportState = {
  orders: [],
  statusFilter: 'all',
  priorityFilter: 'all',
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialProductionState: ProductionReportState = {
  orders: [],
  materials: [],
  productionOutput: [],
  materialTypeFilter: 'all',
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialMachineState: MachineReportState = {
  machines: [],
  machineUtilization: [],
  machineTypeFilter: 'all',
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialCustomerState: CustomerReportState = {
  customers: [],
  orders: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const initialFiltersState: FiltersState = {
  dateRange: getDefaultDateRange(),
  statusFilter: 'all',
  priorityFilter: 'all',
  machineTypeFilter: 'all',
  materialTypeFilter: 'all',
};

// Overview Reducer
const overviewReducer = (
  state: OverviewReportState = initialOverviewState,
  action: ReportActionTypes
): OverviewReportState => {
  switch (action.type) {
    case FETCH_OVERVIEW_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case FETCH_OVERVIEW_SUCCESS:
      return {
        ...state,
        orders: action.payload.orders,
        efficiencyTrends: action.payload.efficiencyTrends,
        productionOutput: action.payload.productionOutput,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    
    case FETCH_OVERVIEW_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    default:
      return state;
  }
};

// Orders Report Reducer
const ordersReducer = (
  state: OrdersReportState = initialOrdersState,
  action: ReportActionTypes
): OrdersReportState => {
  switch (action.type) {
    case FETCH_ORDERS_REPORT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case FETCH_ORDERS_REPORT_SUCCESS:
      return {
        ...state,
        orders: action.payload,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    
    case FETCH_ORDERS_REPORT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    case SET_STATUS_FILTER:
      return {
        ...state,
        statusFilter: action.payload,
      };
    
    case SET_PRIORITY_FILTER:
      return {
        ...state,
        priorityFilter: action.payload,
      };
    
    default:
      return state;
  }
};

// Production Report Reducer
const productionReducer = (
  state: ProductionReportState = initialProductionState,
  action: ReportActionTypes
): ProductionReportState => {
  switch (action.type) {
    case FETCH_PRODUCTION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case FETCH_PRODUCTION_SUCCESS:
      return {
        ...state,
        orders: action.payload.orders,
        materials: action.payload.materials,
        productionOutput: action.payload.productionOutput,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    
    case FETCH_PRODUCTION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    case FETCH_MATERIALS_SUCCESS:
      return {
        ...state,
        materials: action.payload,
      };
    
    case SET_MATERIAL_TYPE_FILTER:
      return {
        ...state,
        materialTypeFilter: action.payload,
      };
    
    default:
      return state;
  }
};

// Machines Report Reducer
const machinesReducer = (
  state: MachineReportState = initialMachineState,
  action: ReportActionTypes
): MachineReportState => {
  switch (action.type) {
    case FETCH_MACHINES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case FETCH_MACHINES_SUCCESS:
      return {
        ...state,
        machines: action.payload.machines,
        machineUtilization: action.payload.machineUtilization,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    
    case FETCH_MACHINES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    case SET_MACHINE_TYPE_FILTER:
      return {
        ...state,
        machineTypeFilter: action.payload,
      };
    
    default:
      return state;
  }
};

// Customers Report Reducer
const customersReducer = (
  state: CustomerReportState = initialCustomerState,
  action: ReportActionTypes
): CustomerReportState => {
  switch (action.type) {
    case FETCH_CUSTOMERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case FETCH_CUSTOMERS_SUCCESS:
      return {
        ...state,
        customers: action.payload.customers,
        orders: action.payload.orders,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    
    case FETCH_CUSTOMERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    default:
      return state;
  }
};

// Filters Reducer
const filtersReducer = (
  state: FiltersState = initialFiltersState,
  action: ReportActionTypes
): FiltersState => {
  switch (action.type) {
    case SET_DATE_RANGE:
      return {
        ...state,
        dateRange: action.payload,
      };
    
    case SET_STATUS_FILTER:
      return {
        ...state,
        statusFilter: action.payload,
      };
    
    case SET_PRIORITY_FILTER:
      return {
        ...state,
        priorityFilter: action.payload,
      };
    
    case SET_MACHINE_TYPE_FILTER:
      return {
        ...state,
        machineTypeFilter: action.payload,
      };
    
    case SET_MATERIAL_TYPE_FILTER:
      return {
        ...state,
        materialTypeFilter: action.payload,
      };
    
    case CLEAR_FILTERS:
      return {
        ...initialFiltersState,
        dateRange: getDefaultDateRange(),
      };
    
    default:
      return state;
  }
};

// Branch Reducer
const branchReducer = (
  state: BranchState | null = null,
  action: ReportActionTypes
): BranchState | null => {
  switch (action.type) {
    case SET_BRANCH:
      return action.payload;
    
    default:
      return state;
  }
};

// Active Tab Reducer
const activeTabReducer = (
  state: string = 'overview',
  action: ReportActionTypes
): string => {
  switch (action.type) {
    case SET_ACTIVE_TAB:
      return action.payload;
    
    default:
      return state;
  }
};

// Loading Reducer
const loadingReducer = (
  state: boolean = false,
  action: ReportActionTypes
): boolean => {
  switch (action.type) {
    case SET_LOADING:
      return action.payload;
    
    case FETCH_OVERVIEW_REQUEST:
    case FETCH_ORDERS_REPORT_REQUEST:
    case FETCH_PRODUCTION_REQUEST:
    case FETCH_MACHINES_REQUEST:
    case FETCH_CUSTOMERS_REQUEST:
      return true;
    
    case FETCH_OVERVIEW_SUCCESS:
    case FETCH_OVERVIEW_FAILURE:
    case FETCH_ORDERS_REPORT_SUCCESS:
    case FETCH_ORDERS_REPORT_FAILURE:
    case FETCH_PRODUCTION_SUCCESS:
    case FETCH_PRODUCTION_FAILURE:
    case FETCH_MACHINES_SUCCESS:
    case FETCH_MACHINES_FAILURE:
    case FETCH_CUSTOMERS_SUCCESS:
    case FETCH_CUSTOMERS_FAILURE:
      return false;
    
    default:
      return state;
  }
};

// Error Reducer
const errorReducer = (
  state: string | null = null,
  action: ReportActionTypes
): string | null => {
  switch (action.type) {
    case SET_ERROR:
      return action.payload;
    
    case CLEAR_ERROR:
      return null;
    
    case FETCH_OVERVIEW_REQUEST:
    case FETCH_ORDERS_REPORT_REQUEST:
    case FETCH_PRODUCTION_REQUEST:
    case FETCH_MACHINES_REQUEST:
    case FETCH_CUSTOMERS_REQUEST:
      return null;
    
    case FETCH_OVERVIEW_FAILURE:
    case FETCH_ORDERS_REPORT_FAILURE:
    case FETCH_PRODUCTION_FAILURE:
    case FETCH_MACHINES_FAILURE:
    case FETCH_CUSTOMERS_FAILURE:
      return action.payload;
    
    default:
      return state;
  }
};

// Success Message Reducer
const successMessageReducer = (
  state: string | null = null,
  action: ReportActionTypes
): string | null => {
  switch (action.type) {
    case SET_SUCCESS_MESSAGE:
      return action.payload;
    
    case CLEAR_SUCCESS_MESSAGE:
      return null;
    
    default:
      return state;
  }
};

// Combined Report Reducer
const reportReducer = combineReducers({
  overview: overviewReducer,
  orders: ordersReducer,
  production: productionReducer,
  machines: machinesReducer,
  customers: customersReducer,
  filters: filtersReducer,
  branch: branchReducer,
  activeTab: activeTabReducer,
  loading: loadingReducer,
  error: errorReducer,
  successMessage: successMessageReducer,
});

export type ReportState = ReturnType<typeof reportReducer>;

export default reportReducer;
