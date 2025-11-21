// orderTypes.ts - Order Types matching MongoDB Schema

// Machine Progress Interface
export interface MachineProgress {
  _id?: string;
  machineId?: string;
  operatorId?: string;
  operatorName?: string;
  status: 'none' | 'pending' | 'in-progress' | 'completed' | 'paused' | 'error' | 'issue';
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  note?: string | null;
  reason?: string | null;
  machineTableDataId?: string;
  calculatedOutput: {
    netWeight: number;
    wastageWeight: number;
    efficiency: number;
    totalCost: number;
    rowsProcessed: number;
    lastUpdated: Date | string;
  };
  targetOutput: {
    expectedWeight: number;
    expectedEfficiency: number;
    maxWastage: number;
  };
  qualityStatus: 'pending' | 'passed' | 'failed' | 'review';
  qualityNotes: string[];
}

// Step Progress Interface
export interface StepProgress {
  _id?: string;
  stepId: string;
  machines: MachineProgress[];
  stepStatus: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'none' | 'pause';
  stepStartedAt?: Date | string;
  stepCompletedAt?: Date | string;
  stepNotes?: string;
}

// Mix Material Interface
export interface MixMaterial {
  _id?: string;
  materialId: string;
  materialName: string;
  plannedWeight: number;
  actualUsedWeight: number;
  wastageWeight: number;
  efficiency: number;
  costPerKg: number;
  totalCost: number;
  specifications?: {
    grade?: string;
    color?: string;
    density?: number;
    additives?: string[];
  };
  lastUpdated: Date | string;
}

// Real-time Data Interface
export interface RealTimeData {
  totalNetWeight: number;
  totalWastage: number;
  totalCost: number;
  overallEfficiency: number;
  activeMachines: number;
  completedMachines: number;
  totalRowsProcessed: number;
  lastUpdated: Date | string;
}

// Quality Control Interface
export interface QualityControl {
  inspectionRequired: boolean;
  inspectionStatus: 'pending' | 'in_progress' | 'passed' | 'failed' | 'review';
  inspectedBy?: string;
  inspectionDate?: Date | string;
  qualityScore?: number;
  qualityNotes: string[];
  defects: string[];
}

// Financial Interface
export interface Financial {
  estimatedCost: number;
  actualCost: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  profitMargin: number;
  finalPrice: number;
}

// Delivery Interface
export interface Delivery {
  expectedDate?: Date | string;
  actualDate?: Date | string;
  deliveryAddress?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  deliveryStatus: 'pending' | 'shipped' | 'delivered' | 'delayed';
}

// Note Interface
export interface OrderNote {
  _id?: string;
  message: string;
  createdBy: string;
  createdAt: Date | string;
  noteType: 'general' | 'production' | 'quality' | 'delivery' | 'customer';
}

// Attachment Interface
export interface OrderAttachment {
  _id?: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date | string;
}

// Main Order Interface
export interface Order {
  _id: string;
  orderId: string;
  customerId: string;
  customerName: string; // Added for reports
  operatorId: string; // Added for reports
  operatorName: string; // Added for reports
  materialId: string;
  materialType: string; // Added for reports (material name)
  materialWeight: number;
  Width: number;
  Height: number;
  Thickness: number;
  SealingType?: string | null;
  BottomGusset?: string | null;
  Flap?: string | null;
  AirHole?: string | null;
  Printing: boolean;
  colors?: string[];
  designNotes?: string;
  specialInstructions?: string;
  mixMaterial: MixMaterial[];
  steps: StepProgress[];
  currentStepIndex: number;
  overallStatus: 'pending' | 'in_progress' | 'dispatched' | 'cancelled' | 'Wait for Approval' | 'completed' | 'approved' | 'issue';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledStartDate?: Date | string;
  scheduledEndDate?: Date | string;
  actualStartDate?: Date | string | null;
  actualEndDate?: Date | string | null;
  branchId: string;
  createdBy: string;
  createdByRole: 'admin' | 'manager';
  assignedManager?: string;
  realTimeData: RealTimeData;
  qualityControl: QualityControl;
  financial: Financial;
  delivery: Delivery;
  notes: OrderNote[];
  attachments: OrderAttachment[];
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Virtuals
  completionPercentage?: number;
  estimatedDuration?: number;
  
  // Populated fields
  customer?: any;
  material?: any;
  branch?: any;
  creator?: any;
  assignedManagerData?: any;
  orderType?: {
    _id: string;
    typeName: string;
    typeCode: string;
    description?: string;
    color?: string;
    icon?: string;
  };
}

// Dashboard Data Interface
export interface DashboardData {
  dateRange: string;
  statusBreakdown: {
    _id: string;
    count: number;
    totalWeight: number;
    totalCost: number;
    avgEfficiency: number;
  }[];
  totalOrders: number;
}

// Efficiency Report Interface
export interface EfficiencyReport {
  orderId: string;
  customerName: string;
  overallEfficiency: number;
  totalNetWeight: number;
  steps: StepProgress[];
}

// Order Filters Interface
export interface OrderFilters {
  branchId?: string;
  customerId?: string;
  overallStatus?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pagination Info
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  showing: number;
}

// API Response Interfaces
export interface OrderListResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: PaginationInfo;
    summary?: {
      totalOrders: number;
      totalWeight: number;
      avgWeight: number;
    };
    statusCounts?: { [key: string]: number };
  };
  message?: string;
}

export interface SingleOrderResponse {
  success: boolean;
  data: {
    order: Order;
  };
  message: string;
}

export interface OrderCreateResponse {
  success: boolean;
  data: {
    order: Order;
    orderId: string;
  };
  message: string;
}

export interface OrderUpdateResponse {
  success: boolean;
  data: {
    order: Order;
  };
  message: string;
}

// Redux State Interface
export interface OrderState {
  // Current order being viewed/edited
  currentOrder: Order | null;
  
  // List of orders
  orders: Order[];
  pagination: PaginationInfo | null;
  
  // Dashboard data
  dashboardData: DashboardData | null;
  efficiencyReport: EfficiencyReport[] | null;
  
  // Filters
  filters: OrderFilters;
  
  // UI States
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Operation flags
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetching: boolean;
}

// Action Types Constants
export const FETCH_ORDERS_REQUEST = 'FETCH_ORDERS_REQUEST';
export const FETCH_ORDERS_SUCCESS = 'FETCH_ORDERS_SUCCESS';
export const FETCH_ORDERS_FAILURE = 'FETCH_ORDERS_FAILURE';

export const FETCH_ORDER_BY_ID_REQUEST = 'FETCH_ORDER_BY_ID_REQUEST';
export const FETCH_ORDER_BY_ID_SUCCESS = 'FETCH_ORDER_BY_ID_SUCCESS';
export const FETCH_ORDER_BY_ID_FAILURE = 'FETCH_ORDER_BY_ID_FAILURE';

export const CREATE_ORDER_REQUEST = 'CREATE_ORDER_REQUEST';
export const CREATE_ORDER_SUCCESS = 'CREATE_ORDER_SUCCESS';
export const CREATE_ORDER_FAILURE = 'CREATE_ORDER_FAILURE';

export const UPDATE_ORDER_REQUEST = 'UPDATE_ORDER_REQUEST';
export const UPDATE_ORDER_SUCCESS = 'UPDATE_ORDER_SUCCESS';
export const UPDATE_ORDER_FAILURE = 'UPDATE_ORDER_FAILURE';

export const DELETE_ORDER_REQUEST = 'DELETE_ORDER_REQUEST';
export const DELETE_ORDER_SUCCESS = 'DELETE_ORDER_SUCCESS';
export const DELETE_ORDER_FAILURE = 'DELETE_ORDER_FAILURE';

export const UPDATE_ORDER_STATUS_REQUEST = 'UPDATE_ORDER_STATUS_REQUEST';
export const UPDATE_ORDER_STATUS_SUCCESS = 'UPDATE_ORDER_STATUS_SUCCESS';
export const UPDATE_ORDER_STATUS_FAILURE = 'UPDATE_ORDER_STATUS_FAILURE';

export const COMPLETE_MACHINE_REQUEST = 'COMPLETE_MACHINE_REQUEST';
export const COMPLETE_MACHINE_SUCCESS = 'COMPLETE_MACHINE_SUCCESS';
export const COMPLETE_MACHINE_FAILURE = 'COMPLETE_MACHINE_FAILURE';

export const PROGRESS_TO_NEXT_STEP_REQUEST = 'PROGRESS_TO_NEXT_STEP_REQUEST';
export const PROGRESS_TO_NEXT_STEP_SUCCESS = 'PROGRESS_TO_NEXT_STEP_SUCCESS';
export const PROGRESS_TO_NEXT_STEP_FAILURE = 'PROGRESS_TO_NEXT_STEP_FAILURE';

export const UPDATE_REALTIME_DATA_REQUEST = 'UPDATE_REALTIME_DATA_REQUEST';
export const UPDATE_REALTIME_DATA_SUCCESS = 'UPDATE_REALTIME_DATA_SUCCESS';
export const UPDATE_REALTIME_DATA_FAILURE = 'UPDATE_REALTIME_DATA_FAILURE';

export const ADD_ORDER_NOTE_REQUEST = 'ADD_ORDER_NOTE_REQUEST';
export const ADD_ORDER_NOTE_SUCCESS = 'ADD_ORDER_NOTE_SUCCESS';
export const ADD_ORDER_NOTE_FAILURE = 'ADD_ORDER_NOTE_FAILURE';

export const UPDATE_QUALITY_CONTROL_REQUEST = 'UPDATE_QUALITY_CONTROL_REQUEST';
export const UPDATE_QUALITY_CONTROL_SUCCESS = 'UPDATE_QUALITY_CONTROL_SUCCESS';
export const UPDATE_QUALITY_CONTROL_FAILURE = 'UPDATE_QUALITY_CONTROL_FAILURE';

export const FETCH_DASHBOARD_DATA_REQUEST = 'FETCH_DASHBOARD_DATA_REQUEST';
export const FETCH_DASHBOARD_DATA_SUCCESS = 'FETCH_DASHBOARD_DATA_SUCCESS';
export const FETCH_DASHBOARD_DATA_FAILURE = 'FETCH_DASHBOARD_DATA_FAILURE';

export const FETCH_EFFICIENCY_REPORT_REQUEST = 'FETCH_EFFICIENCY_REPORT_REQUEST';
export const FETCH_EFFICIENCY_REPORT_SUCCESS = 'FETCH_EFFICIENCY_REPORT_SUCCESS';
export const FETCH_EFFICIENCY_REPORT_FAILURE = 'FETCH_EFFICIENCY_REPORT_FAILURE';

export const SET_ORDER_FILTERS = 'SET_ORDER_FILTERS';
export const CLEAR_ORDER_FILTERS = 'CLEAR_ORDER_FILTERS';
export const SET_CURRENT_ORDER = 'SET_CURRENT_ORDER';
export const CLEAR_CURRENT_ORDER = 'CLEAR_CURRENT_ORDER';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const SET_SUCCESS_MESSAGE = 'SET_SUCCESS_MESSAGE';
export const CLEAR_SUCCESS_MESSAGE = 'CLEAR_SUCCESS_MESSAGE';

// Action Interfaces
export interface FetchOrdersRequestAction {
  type: typeof FETCH_ORDERS_REQUEST;
}

export interface FetchOrdersSuccessAction {
  type: typeof FETCH_ORDERS_SUCCESS;
  payload: OrderListResponse;
}

export interface FetchOrdersFailureAction {
  type: typeof FETCH_ORDERS_FAILURE;
  payload: string;
}

export interface FetchOrderByIdRequestAction {
  type: typeof FETCH_ORDER_BY_ID_REQUEST;
}

export interface FetchOrderByIdSuccessAction {
  type: typeof FETCH_ORDER_BY_ID_SUCCESS;
  payload: Order;
}

export interface FetchOrderByIdFailureAction {
  type: typeof FETCH_ORDER_BY_ID_FAILURE;
  payload: string;
}

export interface CreateOrderRequestAction {
  type: typeof CREATE_ORDER_REQUEST;
}

export interface CreateOrderSuccessAction {
  type: typeof CREATE_ORDER_SUCCESS;
  payload: Order;
}

export interface CreateOrderFailureAction {
  type: typeof CREATE_ORDER_FAILURE;
  payload: string;
}

export interface UpdateOrderRequestAction {
  type: typeof UPDATE_ORDER_REQUEST;
}

export interface UpdateOrderSuccessAction {
  type: typeof UPDATE_ORDER_SUCCESS;
  payload: Order;
}

export interface UpdateOrderFailureAction {
  type: typeof UPDATE_ORDER_FAILURE;
  payload: string;
}

export interface DeleteOrderRequestAction {
  type: typeof DELETE_ORDER_REQUEST;
}

export interface DeleteOrderSuccessAction {
  type: typeof DELETE_ORDER_SUCCESS;
  payload: string;
}

export interface DeleteOrderFailureAction {
  type: typeof DELETE_ORDER_FAILURE;
  payload: string;
}

export interface UpdateOrderStatusRequestAction {
  type: typeof UPDATE_ORDER_STATUS_REQUEST;
}

export interface UpdateOrderStatusSuccessAction {
  type: typeof UPDATE_ORDER_STATUS_SUCCESS;
  payload: Order;
}

export interface UpdateOrderStatusFailureAction {
  type: typeof UPDATE_ORDER_STATUS_FAILURE;
  payload: string;
}

export interface CompleteMachineRequestAction {
  type: typeof COMPLETE_MACHINE_REQUEST;
}

export interface CompleteMachineSuccessAction {
  type: typeof COMPLETE_MACHINE_SUCCESS;
  payload: Order;
}

export interface CompleteMachineFailureAction {
  type: typeof COMPLETE_MACHINE_FAILURE;
  payload: string;
}

export interface ProgressToNextStepRequestAction {
  type: typeof PROGRESS_TO_NEXT_STEP_REQUEST;
}

export interface ProgressToNextStepSuccessAction {
  type: typeof PROGRESS_TO_NEXT_STEP_SUCCESS;
  payload: Order;
}

export interface ProgressToNextStepFailureAction {
  type: typeof PROGRESS_TO_NEXT_STEP_FAILURE;
  payload: string;
}

export interface UpdateRealTimeDataRequestAction {
  type: typeof UPDATE_REALTIME_DATA_REQUEST;
}

export interface UpdateRealTimeDataSuccessAction {
  type: typeof UPDATE_REALTIME_DATA_SUCCESS;
  payload: Order;
}

export interface UpdateRealTimeDataFailureAction {
  type: typeof UPDATE_REALTIME_DATA_FAILURE;
  payload: string;
}

export interface AddOrderNoteRequestAction {
  type: typeof ADD_ORDER_NOTE_REQUEST;
}

export interface AddOrderNoteSuccessAction {
  type: typeof ADD_ORDER_NOTE_SUCCESS;
  payload: Order;
}

export interface AddOrderNoteFailureAction {
  type: typeof ADD_ORDER_NOTE_FAILURE;
  payload: string;
}

export interface UpdateQualityControlRequestAction {
  type: typeof UPDATE_QUALITY_CONTROL_REQUEST;
}

export interface UpdateQualityControlSuccessAction {
  type: typeof UPDATE_QUALITY_CONTROL_SUCCESS;
  payload: Order;
}

export interface UpdateQualityControlFailureAction {
  type: typeof UPDATE_QUALITY_CONTROL_FAILURE;
  payload: string;
}

export interface FetchDashboardDataRequestAction {
  type: typeof FETCH_DASHBOARD_DATA_REQUEST;
}

export interface FetchDashboardDataSuccessAction {
  type: typeof FETCH_DASHBOARD_DATA_SUCCESS;
  payload: DashboardData;
}

export interface FetchDashboardDataFailureAction {
  type: typeof FETCH_DASHBOARD_DATA_FAILURE;
  payload: string;
}

export interface FetchEfficiencyReportRequestAction {
  type: typeof FETCH_EFFICIENCY_REPORT_REQUEST;
}

export interface FetchEfficiencyReportSuccessAction {
  type: typeof FETCH_EFFICIENCY_REPORT_SUCCESS;
  payload: EfficiencyReport[];
}

export interface FetchEfficiencyReportFailureAction {
  type: typeof FETCH_EFFICIENCY_REPORT_FAILURE;
  payload: string;
}

export interface SetOrderFiltersAction {
  type: typeof SET_ORDER_FILTERS;
  payload: OrderFilters;
}

export interface ClearOrderFiltersAction {
  type: typeof CLEAR_ORDER_FILTERS;
}

export interface SetCurrentOrderAction {
  type: typeof SET_CURRENT_ORDER;
  payload: Order;
}

export interface ClearCurrentOrderAction {
  type: typeof CLEAR_CURRENT_ORDER;
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

// Union Type for all Order Actions
export type OrderActionTypes =
  | FetchOrdersRequestAction
  | FetchOrdersSuccessAction
  | FetchOrdersFailureAction
  | FetchOrderByIdRequestAction
  | FetchOrderByIdSuccessAction
  | FetchOrderByIdFailureAction
  | CreateOrderRequestAction
  | CreateOrderSuccessAction
  | CreateOrderFailureAction
  | UpdateOrderRequestAction
  | UpdateOrderSuccessAction
  | UpdateOrderFailureAction
  | DeleteOrderRequestAction
  | DeleteOrderSuccessAction
  | DeleteOrderFailureAction
  | UpdateOrderStatusRequestAction
  | UpdateOrderStatusSuccessAction
  | UpdateOrderStatusFailureAction
  | CompleteMachineRequestAction
  | CompleteMachineSuccessAction
  | CompleteMachineFailureAction
  | ProgressToNextStepRequestAction
  | ProgressToNextStepSuccessAction
  | ProgressToNextStepFailureAction
  | UpdateRealTimeDataRequestAction
  | UpdateRealTimeDataSuccessAction
  | UpdateRealTimeDataFailureAction
  | AddOrderNoteRequestAction
  | AddOrderNoteSuccessAction
  | AddOrderNoteFailureAction
  | UpdateQualityControlRequestAction
  | UpdateQualityControlSuccessAction
  | UpdateQualityControlFailureAction
  | FetchDashboardDataRequestAction
  | FetchDashboardDataSuccessAction
  | FetchDashboardDataFailureAction
  | FetchEfficiencyReportRequestAction
  | FetchEfficiencyReportSuccessAction
  | FetchEfficiencyReportFailureAction
  | SetOrderFiltersAction
  | ClearOrderFiltersAction
  | SetCurrentOrderAction
  | ClearCurrentOrderAction
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction
  | SetSuccessMessageAction
  | ClearSuccessMessageAction;
