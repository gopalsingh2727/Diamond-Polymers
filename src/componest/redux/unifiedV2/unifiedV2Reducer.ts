/**
 * Unified V2 Reducer
 * Single reducer handling all v2 CRUD operations
 */

import { combineReducers } from 'redux';

// Generic state interface
interface EntityState<T = any> {
  list: T[];
  item: T | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

const initialState: EntityState = {
  list: [],
  item: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

// Generic reducer factory
const createEntityReducer = (entityName: string) => {
  const PREFIX = `${entityName}_V2`;

  return (state = initialState, action: any): EntityState => {
    switch (action.type) {
      // ✅ Clear data when branch switches
      case 'CLEAR_BRANCH_DATA':
        return initialState;

      // List
      case `${PREFIX}_LIST_REQUEST`:
        return { ...state, loading: true, error: null };
      case `${PREFIX}_LIST_SUCCESS`:
        return { ...state, loading: false, list: action.payload };
      case `${PREFIX}_LIST_FAILURE`:
        return { ...state, loading: false, error: action.payload };

      // Get single
      case `${PREFIX}_GET_REQUEST`:
        return { ...state, loading: true, error: null };
      case `${PREFIX}_GET_SUCCESS`:
        return { ...state, loading: false, item: action.payload };
      case `${PREFIX}_GET_FAILURE`:
        return { ...state, loading: false, error: action.payload };

      // Create
      case `${PREFIX}_CREATE_REQUEST`:
        return { ...state, creating: true, error: null };
      case `${PREFIX}_CREATE_SUCCESS`:
        return {
          ...state,
          creating: false,
          list: [action.payload, ...state.list],
        };
      case `${PREFIX}_CREATE_FAILURE`:
        return { ...state, creating: false, error: action.payload };

      // Update
      case `${PREFIX}_UPDATE_REQUEST`:
        return { ...state, updating: true, error: null };
      case `${PREFIX}_UPDATE_SUCCESS`:
        return {
          ...state,
          updating: false,
          list: state.list.map((item: any) =>
            item._id === action.payload._id ? action.payload : item
          ),
          item: state.item?._id === action.payload._id ? action.payload : state.item,
        };
      case `${PREFIX}_UPDATE_FAILURE`:
        return { ...state, updating: false, error: action.payload };

      // Delete
      case `${PREFIX}_DELETE_REQUEST`:
        return { ...state, deleting: true, error: null };
      case `${PREFIX}_DELETE_SUCCESS`:
        return {
          ...state,
          deleting: false,
          list: state.list.filter((item: any) => item._id !== action.payload),
          item: state.item?._id === action.payload ? null : state.item,
        };
      case `${PREFIX}_DELETE_FAILURE`:
        return { ...state, deleting: false, error: action.payload };

      default:
        return state;
    }
  };
};

// Create reducers for all entities
const accountV2Reducer = createEntityReducer('ACCOUNT');
const customerCategoryV2Reducer = createEntityReducer('CUSTOMER_CATEGORY');
const parentCompanyV2Reducer = createEntityReducer('PARENT_COMPANY');
const machineTypeV2Reducer = createEntityReducer('MACHINE_TYPE');
const machineV2Reducer = createEntityReducer('MACHINE');
const stepV2Reducer = createEntityReducer('STEP');
const operatorV2Reducer = createEntityReducer('OPERATOR');
const deviceAccessV2Reducer = createEntityReducer('DEVICE_ACCESS');
const categoryV2Reducer = createEntityReducer('CATEGORY');
const optionTypeV2Reducer = createEntityReducer('OPTION_TYPE');
const optionSpecV2Reducer = createEntityReducer('OPTION_SPEC');
const optionV2Reducer = createEntityReducer('OPTION');
const orderTypeV2Reducer = createEntityReducer('ORDER_TYPE');
const printTypeV2Reducer = createEntityReducer('PRINT_TYPE');
const excelExportTypeV2Reducer = createEntityReducer('EXCEL_EXPORT_TYPE');
const reportTypeV2Reducer = createEntityReducer('REPORT_TYPE');
const templateV2Reducer = createEntityReducer('TEMPLATE');
// Inventory reducers
const inventoryV2Reducer = createEntityReducer('INVENTORY');
const inventoryTransactionV2Reducer = createEntityReducer('INVENTORY_TRANSACTION');
const inventoryLocationV2Reducer = createEntityReducer('INVENTORY_LOCATION');
const inventoryTypeV2Reducer = createEntityReducer('INVENTORY_TYPE');
// Employee reducers
const employeeV2Reducer = createEntityReducer('EMPLOYEE');

// Payroll state interface
interface PayrollState {
  processing: boolean;
  summary: any | null;
  history: any | null;
  payslip: any | null;
  loading: boolean;
  error: string | null;
}

const payrollInitialState: PayrollState = {
  processing: false,
  summary: null,
  history: null,
  payslip: null,
  loading: false,
  error: null,
};

// Payroll reducer (custom, not using factory)
const payrollV2Reducer = (state = payrollInitialState, action: any): PayrollState => {
  switch (action.type) {
    // ✅ Clear data when branch switches
    case 'CLEAR_BRANCH_DATA':
      return payrollInitialState;

    case 'PAYROLL_V2_PROCESS_REQUEST':
    case 'PAYROLL_V2_BULK_PROCESS_REQUEST':
      return { ...state, processing: true, error: null };
    case 'PAYROLL_V2_PROCESS_SUCCESS':
    case 'PAYROLL_V2_BULK_PROCESS_SUCCESS':
      return { ...state, processing: false };
    case 'PAYROLL_V2_PROCESS_FAILURE':
    case 'PAYROLL_V2_BULK_PROCESS_FAILURE':
      return { ...state, processing: false, error: action.payload };

    case 'PAYROLL_V2_SUMMARY_REQUEST':
      return { ...state, loading: true, error: null };
    case 'PAYROLL_V2_SUMMARY_SUCCESS':
      return { ...state, loading: false, summary: action.payload };
    case 'PAYROLL_V2_SUMMARY_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'PAYROLL_V2_HISTORY_REQUEST':
      return { ...state, loading: true, error: null };
    case 'PAYROLL_V2_HISTORY_SUCCESS':
      return { ...state, loading: false, history: action.payload };
    case 'PAYROLL_V2_HISTORY_FAILURE':
      return { ...state, loading: false, error: action.payload };

    case 'PAYROLL_V2_PAYSLIP_REQUEST':
      return { ...state, loading: true, error: null };
    case 'PAYROLL_V2_PAYSLIP_SUCCESS':
      return { ...state, loading: false, payslip: action.payload };
    case 'PAYROLL_V2_PAYSLIP_FAILURE':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

// Combined V2 reducer
const unifiedV2Reducer = combineReducers({
  account: accountV2Reducer,
  customerCategory: customerCategoryV2Reducer,
  parentCompany: parentCompanyV2Reducer,
  machineType: machineTypeV2Reducer,
  machine: machineV2Reducer,
  step: stepV2Reducer,
  operator: operatorV2Reducer,
  deviceAccess: deviceAccessV2Reducer,
  category: categoryV2Reducer,
  optionType: optionTypeV2Reducer,
  optionSpec: optionSpecV2Reducer,
  option: optionV2Reducer,
  orderType: orderTypeV2Reducer,
  printType: printTypeV2Reducer,
  excelExportType: excelExportTypeV2Reducer,
  reportType: reportTypeV2Reducer,
  template: templateV2Reducer,
  inventory: inventoryV2Reducer,
  inventoryTransaction: inventoryTransactionV2Reducer,
  inventoryLocation: inventoryLocationV2Reducer,
  inventoryType: inventoryTypeV2Reducer,
  employee: employeeV2Reducer,
  payroll: payrollV2Reducer,
});

export default unifiedV2Reducer;

// Export individual reducers for backward compatibility
export {
  accountV2Reducer,
  customerCategoryV2Reducer,
  parentCompanyV2Reducer,
  machineTypeV2Reducer,
  machineV2Reducer,
  stepV2Reducer,
  operatorV2Reducer,
  deviceAccessV2Reducer,
  categoryV2Reducer,
  optionTypeV2Reducer,
  optionSpecV2Reducer,
  optionV2Reducer,
  orderTypeV2Reducer,
  printTypeV2Reducer,
  excelExportTypeV2Reducer,
  reportTypeV2Reducer,
  templateV2Reducer,
  inventoryV2Reducer,
  inventoryTransactionV2Reducer,
  inventoryLocationV2Reducer,
  inventoryTypeV2Reducer,
  employeeV2Reducer,
  payrollV2Reducer,
};
