// Column Configuration
export interface TableColumn {
  name: string;
  dataType: 'text' | 'number' | 'formula' | 'date';
  isRequired: boolean;
  order: number;
  placeholder: string;
}

// Formula Configuration
export interface TableFormula {
  expression: string;
  dependencies: string[];
  description: string;
}

// Table Settings
export interface TableSettings {
  autoCalculate: boolean;
  autoUpdateOrders: boolean;
  maxRows: number;
  enableHistory: boolean;
}

// Table Structure
export interface TableStructure {
  machineId: string;
  machineName: string;
  columns: TableColumn[];
  formulas: { [key: string]: TableFormula };
  settings: TableSettings;
}

// Table Row Data
export interface TableRowData {
  [columnName: string]: string | number | Date;
}

// Total Calculations
export interface TotalCalculations {
  totalNetWeight?: number;
  totalWastage?: number;
  totalCost?: number;
  overallEfficiency?: number;
  rowsProcessed?: number;
  [key: string]: number | undefined;
}

// Table Data
export interface MachineTableData {
  _id?: string;
  orderId: string;
  machineId: string;
  rowData: TableRowData[];
  totalCalculations: TotalCalculations;
  status: 'active' | 'completed' | 'paused';
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Calculated Output (from Order schema)
export interface CalculatedOutput {
  netWeight: number;
  wastageWeight: number;
  efficiency: number;
  totalCost: number;
  rowsProcessed: number;
  lastUpdated: Date;
}

// Machine Info
export interface MachineInfo {
  _id: string;
  machineName: string;
  machineType: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  status: 'none' | 'pending' | 'in-progress' | 'completed' | 'paused' | 'error';
  operatorName?: string;
  operatorId?: string;
  startedAt?: Date;
  completedAt?: Date;
  note?: string;
}

// Order Info
export interface OrderInfo {
  orderId: string;
  _id: string;
  customer: string;
  status: string;
}

// Step Info
export interface StepInfo {
  stepId: string;
  stepStatus: string;
}

// Complete Machine Table Response
export interface MachineTableResponse {
  order: OrderInfo;
  machine: MachineInfo;
  step: StepInfo;
  tableStructure: TableStructure;
  tableData: MachineTableData | null;
  calculatedOutput: CalculatedOutput | null;
}

// Selected Machine
export interface SelectedMachine {
  machineId: string;
  machineName: string;
  orderId: string;
}

// Redux State
export interface MachineTableState {
  // Current machine table data
  currentTableData: MachineTableResponse | null;
  
  // Selected machine
  selectedMachine: SelectedMachine | null;
  
  // Loading states
  loading: boolean;
  updating: boolean;
  deleting: boolean;
  adding: boolean;
  
  // Error states
  error: string | null;
  updateError: string | null;
  
  // Success states
  successMessage: string | null;
  
  // Cache for multiple machines
  cachedTables: {
    [machineId: string]: MachineTableResponse;
  };
}

// Action Types
export const FETCH_MACHINE_TABLE_REQUEST = 'FETCH_MACHINE_TABLE_REQUEST';
export const FETCH_MACHINE_TABLE_SUCCESS = 'FETCH_MACHINE_TABLE_SUCCESS';
export const FETCH_MACHINE_TABLE_FAILURE = 'FETCH_MACHINE_TABLE_FAILURE';
export const CLEAR_MACHINE_TABLE_DATA = 'CLEAR_MACHINE_TABLE_DATA';
export const CLEAR_MACHINE_TABLE_ERROR = 'CLEAR_MACHINE_TABLE_ERROR';
export const SET_SELECTED_MACHINE = 'SET_SELECTED_MACHINE';
export const CLEAR_SELECTED_MACHINE = 'CLEAR_SELECTED_MACHINE';
export const UPDATE_TABLE_ROW_REQUEST = 'UPDATE_TABLE_ROW_REQUEST';
export const UPDATE_TABLE_ROW_SUCCESS = 'UPDATE_TABLE_ROW_SUCCESS';
export const UPDATE_TABLE_ROW_FAILURE = 'UPDATE_TABLE_ROW_FAILURE';
export const DELETE_TABLE_ROW_REQUEST = 'DELETE_TABLE_ROW_REQUEST';
export const DELETE_TABLE_ROW_SUCCESS = 'DELETE_TABLE_ROW_SUCCESS';
export const DELETE_TABLE_ROW_FAILURE = 'DELETE_TABLE_ROW_FAILURE';
export const ADD_TABLE_ROW_REQUEST = 'ADD_TABLE_ROW_REQUEST';
export const ADD_TABLE_ROW_SUCCESS = 'ADD_TABLE_ROW_SUCCESS';
export const ADD_TABLE_ROW_FAILURE = 'ADD_TABLE_ROW_FAILURE';
export const FETCH_MACHINE_CONFIG_REQUEST = 'FETCH_MACHINE_CONFIG_REQUEST';
export const FETCH_MACHINE_CONFIG_SUCCESS = 'FETCH_MACHINE_CONFIG_SUCCESS';
export const FETCH_MACHINE_CONFIG_FAILURE = 'FETCH_MACHINE_CONFIG_FAILURE';

// Action Interfaces
export interface FetchMachineTableRequestAction {
  type: typeof FETCH_MACHINE_TABLE_REQUEST;
}

export interface FetchMachineTableSuccessAction {
  type: typeof FETCH_MACHINE_TABLE_SUCCESS;
  payload: MachineTableResponse;
}

export interface FetchMachineTableFailureAction {
  type: typeof FETCH_MACHINE_TABLE_FAILURE;
  payload: string;
}

export interface ClearMachineTableDataAction {
  type: typeof CLEAR_MACHINE_TABLE_DATA;
}

export interface ClearMachineTableErrorAction {
  type: typeof CLEAR_MACHINE_TABLE_ERROR;
}

export interface SetSelectedMachineAction {
  type: typeof SET_SELECTED_MACHINE;
  payload: SelectedMachine;
}

export interface ClearSelectedMachineAction {
  type: typeof CLEAR_SELECTED_MACHINE;
}

export interface UpdateTableRowRequestAction {
  type: typeof UPDATE_TABLE_ROW_REQUEST;
}

export interface UpdateTableRowSuccessAction {
  type: typeof UPDATE_TABLE_ROW_SUCCESS;
  payload: MachineTableResponse;
}

export interface UpdateTableRowFailureAction {
  type: typeof UPDATE_TABLE_ROW_FAILURE;
  payload: string;
}

export interface DeleteTableRowRequestAction {
  type: typeof DELETE_TABLE_ROW_REQUEST;
}

export interface DeleteTableRowSuccessAction {
  type: typeof DELETE_TABLE_ROW_SUCCESS;
  payload: MachineTableResponse;
}

export interface DeleteTableRowFailureAction {
  type: typeof DELETE_TABLE_ROW_FAILURE;
  payload: string;
}

export interface AddTableRowRequestAction {
  type: typeof ADD_TABLE_ROW_REQUEST;
}

export interface AddTableRowSuccessAction {
  type: typeof ADD_TABLE_ROW_SUCCESS;
  payload: MachineTableResponse;
}

export interface AddTableRowFailureAction {
  type: typeof ADD_TABLE_ROW_FAILURE;
  payload: string;
}

export interface FetchMachineConfigRequestAction {
  type: typeof FETCH_MACHINE_CONFIG_REQUEST;
}

export interface FetchMachineConfigSuccessAction {
  type: typeof FETCH_MACHINE_CONFIG_SUCCESS;
  payload: TableStructure;
}

export interface FetchMachineConfigFailureAction {
  type: typeof FETCH_MACHINE_CONFIG_FAILURE;
  payload: string;
}

// Union type for all actions
export type MachineTableActionTypes =
  | FetchMachineTableRequestAction
  | FetchMachineTableSuccessAction
  | FetchMachineTableFailureAction
  | ClearMachineTableDataAction
  | ClearMachineTableErrorAction
  | SetSelectedMachineAction
  | ClearSelectedMachineAction
  | UpdateTableRowRequestAction
  | UpdateTableRowSuccessAction
  | UpdateTableRowFailureAction
  | DeleteTableRowRequestAction
  | DeleteTableRowSuccessAction
  | DeleteTableRowFailureAction
  | AddTableRowRequestAction
  | AddTableRowSuccessAction
  | AddTableRowFailureAction
  | FetchMachineConfigRequestAction
  | FetchMachineConfigSuccessAction
  | FetchMachineConfigFailureAction;