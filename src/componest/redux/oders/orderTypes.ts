// orderTypes.ts - Updated with proper action types

// Base Order Data Interface (keep your existing one)
export interface OrderData {
  _id?: string;
  orderId?: string;
  customerId: string;
  materialId: string;
  materialTypeId: string;
  materialWeight: number;
  Width: number;
  Height: number;
  Thickness: number;
  SealingType: string;
  BottomGusset: string;
  Flap: string;
  AirHole: string;
  Printing: boolean;
  mixMaterial: MixMaterial[];
  steps: OrderStep[];
  branchId: string;
  createdBy: string;
  createdByRole: 'admin' | 'manager';
  product27InfinityId: string;
  Notes?: string;
  quantity?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'approved' | 'dispatched' | 'Wait for Approval' | 'issue';
  createdAt?: Date;
  updatedAt?: Date;

  // Additional fields from backend population
  customer?: any;
  branch?: any;
  material?: any;
  materialType?: any;
  creator?: any;
  orderType?: {
    _id: string;
    typeName: string;
    typeCode: string;
    description?: string;
    color?: string;
    icon?: string;
  };
  stepsCount?: number;
  totalMachines?: number;
  completedSteps?: number;
}

// Mix Material Interface (keep existing)
export interface MixMaterial {
  materialId: string;
  materialName: string;
  materialType: string;
  materialWeight: number;
  percentage: number;
}

// Order Step Interface (keep existing)
export interface OrderStep {
  stepId: string;
  stepName?: string;
  machines: OrderMachine[];
  status?: 'pending' | 'in-progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
}

// Order Machine Interface (keep existing)
export interface OrderMachine {
  machineId: string;
  machineName: string;
  machineType: string;
  operatorId?: string;
  operatorName?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused' | 'error' | 'issue' | 'none';
  startedAt?: Date;
  completedAt?: Date;
  note?: string;
  reason?: string;
  estimatedTime?: number;
  actualTime?: number;
}

// Validation Result Interface (keep existing)
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Backend Response Interfaces - Updated to match actual backend
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  showing: number;
}

export interface OrderSummary {
  totalOrders: number;
  totalWeight: number;
  avgWeight: number;
}

export interface StatusCounts {
  [status: string]: number;
}

export interface OrderFiltersResponse {
  applied: any;
  available: {
    sortBy: string[];
    sortOrder: string[];
    statuses: string[];
  };
}

export interface OrderMeta {
  queryTime: number;
  timestamp: string;
  userRole: string;
  userId: string;
}

// Updated API Response Interface to match backend
export interface OrderListApiResponse {
  success: boolean;
  data: {
    orders: OrderData[];
    pagination: PaginationInfo;
    summary: OrderSummary;
    statusCounts: StatusCounts;
    filters: OrderFiltersResponse;
    meta: OrderMeta;
  };
}

export interface OrderCreateResponse {
  message: string;
  orderId: string;
  _id: string;
  customerId: string;
  stepsCount: number;
  totalMachines: number;
  machinesWithIds: number;
  createdBy: string;
  createdByRole: string;
}

// Order Filters Interface (keep existing but extend)
export interface OrderFilters {
  status?: string;
  customerId?: string;
  branchId?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  materialType?: string;
  stepStatus?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: string | number;
  limit?: string | number;
  startDate?: string;
  endDate?: string;
  search?: string;
  materialId?: string;
}

// Updated Action Interfaces - Fixed to handle all payload types properly
export interface OrderSaveRequestAction {
  type: 'ORDER_SAVE_REQUEST';
}

export interface OrderSaveSuccessAction {
  type: 'ORDER_SAVE_SUCCESS';
  payload: {
    order: OrderData;
    response: OrderCreateResponse;
  };
}

export interface OrderSaveFailureAction {
  type: 'ORDER_SAVE_FAILURE';
  payload: string;
}

export interface OrderResetAction {
  type: 'ORDER_RESET';
}

export interface CollectFormDataAction {
  type: 'COLLECT_FORM_DATA';
  payload: OrderData;
}

export interface ValidateFormDataAction {
  type: 'VALIDATE_FORM_DATA';
  payload: ValidationResult;
}

export interface ClearFormDataAction {
  type: 'CLEAR_FORM_DATA';
}

export interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}

export interface SetErrorAction {
  type: 'SET_ERROR';
  payload: string;
}

export interface ClearErrorAction {
  type: 'CLEAR_ERROR';
}

export interface SetSuccessMessageAction {
  type: 'SET_SUCCESS_MESSAGE';
  payload: string;
}

export interface ClearSuccessMessageAction {
  type: 'CLEAR_SUCCESS_MESSAGE';
}

export interface FetchOrdersRequestAction {
  type: 'FETCH_ORDERS_REQUEST';
}

// Updated to handle flexible payload structure from API
export interface FetchOrdersSuccessAction {
  type: 'FETCH_ORDERS_SUCCESS';
  payload: OrderListApiResponse | OrderData[] | any; // Flexible to handle different API response formats
}

export interface FetchOrdersFailureAction {
  type: 'FETCH_ORDERS_FAILURE';
  payload: string;
}

export interface ClearOrdersAction {
  type: 'CLEAR_ORDERS';
}

export interface UpdateOrderStatusAction {
  type: 'UPDATE_ORDER_STATUS';
  payload: {
    orderId: string;
    status: string;
  };
}

export interface UpdateMachineStatusAction {
  type: 'UPDATE_MACHINE_STATUS';
  payload: {
    orderId: string;
    stepIndex: number;
    machineIndex: number;
    status: string;
    operatorId?: string;
    note?: string;
    reason?: string;
  };
}

// Union type for all order actions - NOW INCLUDES CLEAR_ORDERS
export type OrderActionTypes = 
  | OrderSaveRequestAction
  | OrderSaveSuccessAction
  | OrderSaveFailureAction
  | OrderResetAction
  | CollectFormDataAction
  | ValidateFormDataAction
  | ClearFormDataAction
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction
  | SetSuccessMessageAction
  | ClearSuccessMessageAction
  | FetchOrdersRequestAction
  | FetchOrdersSuccessAction
  | FetchOrdersFailureAction
  | ClearOrdersAction
  | UpdateOrderStatusAction
  | UpdateMachineStatusAction;

// Updated Redux State Interface
export interface OrderState {
  // Current order being worked on
  currentOrder: OrderData | null;

  // List of orders - now includes backend data
  orders: OrderData[];
  pagination: PaginationInfo | null;
  summary: OrderSummary | null;
  statusCounts: StatusCounts | null;
  filters: OrderFiltersResponse | null;
  meta: OrderMeta | null;

  // Form data collection
  formData: OrderData | null;

  // Validation state
  validation: ValidationResult | null;

  // UI State
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  warningMessage: string | null;

  // Operation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetching: boolean;

  // Machine Table Data (NEW)
  machineTable: OrderMachineTableState;
}

// Component Props Interfaces (keep existing)
export interface OrderFormProps {
  customerRef: React.RefObject<any>;
  materialRef: React.RefObject<any>;
  stepRef?: React.RefObject<any>;
  onSave?: (orderData: OrderData) => void;
  onCancel?: () => void;
  initialData?: Partial<OrderData>;
  disabled?: boolean;
}

export interface OrderListProps {
  orders: OrderData[];
  loading: boolean;
  error: string | null;
  filters: OrderFilters | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onFilterChange: (filters: OrderFilters) => void;
  onPageChange: (page: number) => void;
  onOrderSelect: (order: OrderData) => void;
  onOrderEdit: (orderId: string) => void;
  onOrderDelete: (orderId: string) => void;
  onOrderStatusUpdate: (orderId: string, status: string) => void;
}

export interface MachineStepProps {
  step: OrderStep;
  stepIndex: number;
  onMachineStatusUpdate: (machineIndex: number, status: string, operatorId?: string, note?: string) => void;
  onOperatorAssign: (machineIndex: number, operatorId: string) => void;
  disabled?: boolean;
}

// Utility Types
export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
export type MachineStatus = 'none' | 'pending' | 'in-progress' | 'completed' | 'paused' | 'error';
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'blocked' | 'none' | 'pause';

// ============================================================================
// MACHINE TABLE DATA TYPES (Integration with Orders)
// ============================================================================

// Table Column Configuration
export interface MachineTableColumn {
  name: string;
  dataType: 'text' | 'number' | 'formula' | 'date';
  isRequired: boolean;
  order: number;
  placeholder: string;
}

// Table Formula Configuration
export interface MachineTableFormula {
  expression: string;
  dependencies: string[];
  description: string;
}

// Table Settings
export interface MachineTableSettings {
  autoCalculate: boolean;
  autoUpdateOrders: boolean;
  maxRows: number;
  enableHistory: boolean;
}

// Table Structure (from Machine model)
export interface MachineTableStructure {
  machineId: string;
  machineName: string;
  columns: MachineTableColumn[];
  formulas: { [key: string]: MachineTableFormula };
  settings: MachineTableSettings;
}

// Table Row Data
export interface MachineTableRowData {
  rowId: number;
  [columnName: string]: string | number | Date;
}

// Total Calculations
export interface MachineTableTotalCalculations {
  totalNetWeight: number;
  totalRawWeight: number;
  totalWastage: number;
  overallEfficiency: number;
  totalRows: number;
  averageEfficiency: number;
  totalCost: number;
}

// Machine Table Data (from table.js model)
export interface OrderMachineTableData {
  _id?: string;
  orderId: string;
  machineId: string;
  rowData: MachineTableRowData[];
  totalCalculations: MachineTableTotalCalculations;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  currentOperator?: string;
  lastCalculatedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Calculated Output (from machine in order)
export interface MachineCalculatedOutput {
  netWeight: number;
  wastageWeight: number;
  efficiency: number;
  totalCost: number;
  rowsProcessed: number;
  lastUpdated: Date;
}

// Order Info for Table Response
export interface OrderTableInfo {
  orderId: string;
  _id: string;
  customer: string;
  status: string;
  materialWeight?: number;
  dimensions?: {
    width: number;
    height: number;
    thickness: number;
  };
}

// Machine Info for Table Response
export interface MachineTableInfo {
  machineId: string;
  machineName: string;
  machineType: string;
  status: MachineStatus;
  operatorName?: string;
  sizeX?: string;
  sizeY?: string;
  sizeZ?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// Step Info for Table Response
export interface StepTableInfo {
  stepId: string;
  stepStatus: StepStatus;
}

// Complete Machine Table Response from API
export interface OrderMachineTableResponse {
  order: OrderTableInfo;
  machine: MachineTableInfo;
  step: StepTableInfo;
  tableStructure: MachineTableStructure;
  tableData: OrderMachineTableData | null;
  calculatedOutput: MachineCalculatedOutput | null;
}

// Machine Table State in Orders Redux
export interface OrderMachineTableState {
  // Current selected machine table
  currentMachineTable: OrderMachineTableResponse | null;

  // Cache for multiple machine tables in an order
  machineTablesCache: {
    [machineId: string]: OrderMachineTableResponse;
  };

  // Loading states
  loadingMachineTable: boolean;
  updatingTableRow: boolean;
  deletingTableRow: boolean;
  addingTableRow: boolean;

  // Error state
  machineTableError: string | null;

  // Success message
  machineTableSuccess: string | null;
}

// Action Interfaces for Machine Table in Orders
export interface FetchOrderMachineTableRequestAction {
  type: 'FETCH_ORDER_MACHINE_TABLE_REQUEST';
}

export interface FetchOrderMachineTableSuccessAction {
  type: 'FETCH_ORDER_MACHINE_TABLE_SUCCESS';
  payload: OrderMachineTableResponse;
}

export interface FetchOrderMachineTableFailureAction {
  type: 'FETCH_ORDER_MACHINE_TABLE_FAILURE';
  payload: string;
}

export interface ClearOrderMachineTableAction {
  type: 'CLEAR_ORDER_MACHINE_TABLE';
}

export interface AddMachineTableRowRequestAction {
  type: 'ADD_MACHINE_TABLE_ROW_REQUEST';
}

export interface AddMachineTableRowSuccessAction {
  type: 'ADD_MACHINE_TABLE_ROW_SUCCESS';
  payload: OrderMachineTableResponse;
}

export interface AddMachineTableRowFailureAction {
  type: 'ADD_MACHINE_TABLE_ROW_FAILURE';
  payload: string;
}

export interface UpdateMachineTableRowRequestAction {
  type: 'UPDATE_MACHINE_TABLE_ROW_REQUEST';
}

export interface UpdateMachineTableRowSuccessAction {
  type: 'UPDATE_MACHINE_TABLE_ROW_SUCCESS';
  payload: OrderMachineTableResponse;
}

export interface UpdateMachineTableRowFailureAction {
  type: 'UPDATE_MACHINE_TABLE_ROW_FAILURE';
  payload: string;
}

export interface DeleteMachineTableRowRequestAction {
  type: 'DELETE_MACHINE_TABLE_ROW_REQUEST';
}

export interface DeleteMachineTableRowSuccessAction {
  type: 'DELETE_MACHINE_TABLE_ROW_SUCCESS';
  payload: OrderMachineTableResponse;
}

export interface DeleteMachineTableRowFailureAction {
  type: 'DELETE_MACHINE_TABLE_ROW_FAILURE';
  payload: string;
}

// Machine Table Action Types Union
export type OrderMachineTableActionTypes =
  | FetchOrderMachineTableRequestAction
  | FetchOrderMachineTableSuccessAction
  | FetchOrderMachineTableFailureAction
  | ClearOrderMachineTableAction
  | AddMachineTableRowRequestAction
  | AddMachineTableRowSuccessAction
  | AddMachineTableRowFailureAction
  | UpdateMachineTableRowRequestAction
  | UpdateMachineTableRowSuccessAction
  | UpdateMachineTableRowFailureAction
  | DeleteMachineTableRowRequestAction
  | DeleteMachineTableRowSuccessAction
  | DeleteMachineTableRowFailureAction;