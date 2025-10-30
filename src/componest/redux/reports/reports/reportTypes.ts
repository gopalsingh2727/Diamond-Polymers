// reportTypes.ts - Report TypeScript Interfaces

// Date Range Interface
export interface DateRange {
  from: Date;
  to: Date;
}

// Order Interface
export interface Order {
  _id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  materialId: string;
  materialType: string;
  materialWeight: number;
  overallStatus: 'pending' | 'in_progress' | 'dispatched' | 'cancelled' | 'Wait for Approval' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  actualStartDate?: string;
  actualEndDate?: string;
  operatorName: string;
  realTimeData: {
    totalNetWeight: number;
    totalWastage: number;
    overallEfficiency: number;
  };
  financial: {
    actualCost?: number;
  };
}

// Machine Interface
export interface Machine {
  _id: string;
  machineId: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  currentOrder?: string;
  utilizationRate: number;
  totalProduction: number;
  efficiency: number;
  downtime: number;
}

// Material Interface
export interface Material {
  _id: string;
  name: string;
  type: string;
  totalUsed: number;
  unit: string;
}

// Customer Interface
export interface Customer {
  _id: string;
  name: string;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalProduction: number;
  lastOrderDate: string;
}

// Efficiency Trend Interface
export interface EfficiencyTrend {
  date: string;
  efficiency: number;
  orders: number;
}

// Production Output Interface
export interface ProductionOutput {
  date: string;
  netWeight: number;
  wastage: number;
}

// Machine Utilization Interface
export interface MachineUtilization {
  date: string;
  utilizationRate: number;
  activeHours: number;
  totalHours: number;
}

// Overview Report State
export interface OverviewReportState {
  orders: Order[];
  efficiencyTrends: EfficiencyTrend[];
  productionOutput: ProductionOutput[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Orders Report State
export interface OrdersReportState {
  orders: Order[];
  statusFilter: string;
  priorityFilter: string;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Production Report State
export interface ProductionReportState {
  orders: Order[];
  materials: Material[];
  productionOutput: ProductionOutput[];
  materialTypeFilter: string;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Machine Report State
export interface MachineReportState {
  machines: Machine[];
  machineUtilization: MachineUtilization[];
  machineTypeFilter: string;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Customer Report State
export interface CustomerReportState {
  customers: Customer[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Filters State
export interface FiltersState {
  dateRange: DateRange;
  statusFilter: string;
  priorityFilter: string;
  machineTypeFilter: string;
  materialTypeFilter: string;
}

// Branch State
export interface BranchState {
  _id: string;
  name: string;
  location: string;
  code: string;
}

// Combined Report State
export interface ReportState {
  overview: OverviewReportState;
  orders: OrdersReportState;
  production: ProductionReportState;
  machines: MachineReportState;
  customers: CustomerReportState;
  filters: FiltersState;
  branch: BranchState | null;
  activeTab: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

// Action Types
export const FETCH_OVERVIEW_REQUEST = 'FETCH_OVERVIEW_REQUEST';
export const FETCH_OVERVIEW_SUCCESS = 'FETCH_OVERVIEW_SUCCESS';
export const FETCH_OVERVIEW_FAILURE = 'FETCH_OVERVIEW_FAILURE';

export const FETCH_ORDERS_REPORT_REQUEST = 'FETCH_ORDERS_REPORT_REQUEST';
export const FETCH_ORDERS_REPORT_SUCCESS = 'FETCH_ORDERS_REPORT_SUCCESS';
export const FETCH_ORDERS_REPORT_FAILURE = 'FETCH_ORDERS_REPORT_FAILURE';

export const FETCH_PRODUCTION_REQUEST = 'FETCH_PRODUCTION_REQUEST';
export const FETCH_PRODUCTION_SUCCESS = 'FETCH_PRODUCTION_SUCCESS';
export const FETCH_PRODUCTION_FAILURE = 'FETCH_PRODUCTION_FAILURE';

export const FETCH_MACHINES_REQUEST = 'FETCH_MACHINES_REQUEST';
export const FETCH_MACHINES_SUCCESS = 'FETCH_MACHINES_SUCCESS';
export const FETCH_MACHINES_FAILURE = 'FETCH_MACHINES_FAILURE';

export const FETCH_CUSTOMERS_REQUEST = 'FETCH_CUSTOMERS_REQUEST';
export const FETCH_CUSTOMERS_SUCCESS = 'FETCH_CUSTOMERS_SUCCESS';
export const FETCH_CUSTOMERS_FAILURE = 'FETCH_CUSTOMERS_FAILURE';

export const FETCH_MATERIALS_REQUEST = 'FETCH_MATERIALS_REQUEST';
export const FETCH_MATERIALS_SUCCESS = 'FETCH_MATERIALS_SUCCESS';
export const FETCH_MATERIALS_FAILURE = 'FETCH_MATERIALS_FAILURE';

export const SET_DATE_RANGE = 'SET_DATE_RANGE';
export const SET_STATUS_FILTER = 'SET_STATUS_FILTER';
export const SET_PRIORITY_FILTER = 'SET_PRIORITY_FILTER';
export const SET_MACHINE_TYPE_FILTER = 'SET_MACHINE_TYPE_FILTER';
export const SET_MATERIAL_TYPE_FILTER = 'SET_MATERIAL_TYPE_FILTER';
export const CLEAR_FILTERS = 'CLEAR_FILTERS';

export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const SET_SUCCESS_MESSAGE = 'SET_SUCCESS_MESSAGE';
export const CLEAR_SUCCESS_MESSAGE = 'CLEAR_SUCCESS_MESSAGE';

export const SET_ACTIVE_TAB = 'SET_ACTIVE_TAB';
export const SET_BRANCH = 'SET_BRANCH';

// Action Interfaces
export interface FetchOverviewRequestAction {
  type: typeof FETCH_OVERVIEW_REQUEST;
}

export interface FetchOverviewSuccessAction {
  type: typeof FETCH_OVERVIEW_SUCCESS;
  payload: {
    orders: Order[];
    efficiencyTrends: EfficiencyTrend[];
    productionOutput: ProductionOutput[];
  };
}

export interface FetchOverviewFailureAction {
  type: typeof FETCH_OVERVIEW_FAILURE;
  payload: string;
}

export interface FetchOrdersReportRequestAction {
  type: typeof FETCH_ORDERS_REPORT_REQUEST;
}

export interface FetchOrdersReportSuccessAction {
  type: typeof FETCH_ORDERS_REPORT_SUCCESS;
  payload: Order[];
}

export interface FetchOrdersReportFailureAction {
  type: typeof FETCH_ORDERS_REPORT_FAILURE;
  payload: string;
}

export interface FetchProductionRequestAction {
  type: typeof FETCH_PRODUCTION_REQUEST;
}

export interface FetchProductionSuccessAction {
  type: typeof FETCH_PRODUCTION_SUCCESS;
  payload: {
    orders: Order[];
    materials: Material[];
    productionOutput: ProductionOutput[];
  };
}

export interface FetchProductionFailureAction {
  type: typeof FETCH_PRODUCTION_FAILURE;
  payload: string;
}

export interface FetchMachinesRequestAction {
  type: typeof FETCH_MACHINES_REQUEST;
}

export interface FetchMachinesSuccessAction {
  type: typeof FETCH_MACHINES_SUCCESS;
  payload: {
    machines: Machine[];
    machineUtilization: MachineUtilization[];
  };
}

export interface FetchMachinesFailureAction {
  type: typeof FETCH_MACHINES_FAILURE;
  payload: string;
}

export interface FetchCustomersRequestAction {
  type: typeof FETCH_CUSTOMERS_REQUEST;
}

export interface FetchCustomersSuccessAction {
  type: typeof FETCH_CUSTOMERS_SUCCESS;
  payload: {
    customers: Customer[];
    orders: Order[];
  };
}

export interface FetchCustomersFailureAction {
  type: typeof FETCH_CUSTOMERS_FAILURE;
  payload: string;
}

export interface FetchMaterialsRequestAction {
  type: typeof FETCH_MATERIALS_REQUEST;
}

export interface FetchMaterialsSuccessAction {
  type: typeof FETCH_MATERIALS_SUCCESS;
  payload: Material[];
}

export interface FetchMaterialsFailureAction {
  type: typeof FETCH_MATERIALS_FAILURE;
  payload: string;
}

export interface SetDateRangeAction {
  type: typeof SET_DATE_RANGE;
  payload: DateRange;
}

export interface SetStatusFilterAction {
  type: typeof SET_STATUS_FILTER;
  payload: string;
}

export interface SetPriorityFilterAction {
  type: typeof SET_PRIORITY_FILTER;
  payload: string;
}

export interface SetMachineTypeFilterAction {
  type: typeof SET_MACHINE_TYPE_FILTER;
  payload: string;
}

export interface SetMaterialTypeFilterAction {
  type: typeof SET_MATERIAL_TYPE_FILTER;
  payload: string;
}

export interface ClearFiltersAction {
  type: typeof CLEAR_FILTERS;
}

export interface SetLoadingAction {
  type: typeof SET_LOADING;
  payload: boolean;
}

export interface SetErrorAction {
  type: typeof SET_ERROR;
  payload: string;
}

export interface ClearErrorAction {
  type: typeof CLEAR_ERROR;
}

export interface SetSuccessMessageAction {
  type: typeof SET_SUCCESS_MESSAGE;
  payload: string;
}

export interface ClearSuccessMessageAction {
  type: typeof CLEAR_SUCCESS_MESSAGE;
}

export interface SetActiveTabAction {
  type: typeof SET_ACTIVE_TAB;
  payload: string;
}

export interface SetBranchAction {
  type: typeof SET_BRANCH;
  payload: BranchState;
}

// Union type for all report actions
export type ReportActionTypes =
  | FetchOverviewRequestAction
  | FetchOverviewSuccessAction
  | FetchOverviewFailureAction
  | FetchOrdersReportRequestAction
  | FetchOrdersReportSuccessAction
  | FetchOrdersReportFailureAction
  | FetchProductionRequestAction
  | FetchProductionSuccessAction
  | FetchProductionFailureAction
  | FetchMachinesRequestAction
  | FetchMachinesSuccessAction
  | FetchMachinesFailureAction
  | FetchCustomersRequestAction
  | FetchCustomersSuccessAction
  | FetchCustomersFailureAction
  | FetchMaterialsRequestAction
  | FetchMaterialsSuccessAction
  | FetchMaterialsFailureAction
  | SetDateRangeAction
  | SetStatusFilterAction
  | SetPriorityFilterAction
  | SetMachineTypeFilterAction
  | SetMaterialTypeFilterAction
  | ClearFiltersAction
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction
  | SetSuccessMessageAction
  | ClearSuccessMessageAction
  | SetActiveTabAction
  | SetBranchAction;
