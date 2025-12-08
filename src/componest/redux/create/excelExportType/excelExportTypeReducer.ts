import {
  CREATE_EXCEL_EXPORT_TYPE_REQUEST,
  CREATE_EXCEL_EXPORT_TYPE_SUCCESS,
  CREATE_EXCEL_EXPORT_TYPE_FAIL,
  GET_EXCEL_EXPORT_TYPES_REQUEST,
  GET_EXCEL_EXPORT_TYPES_SUCCESS,
  GET_EXCEL_EXPORT_TYPES_FAIL,
  GET_EXCEL_EXPORT_TYPE_BY_ID_REQUEST,
  GET_EXCEL_EXPORT_TYPE_BY_ID_SUCCESS,
  GET_EXCEL_EXPORT_TYPE_BY_ID_FAIL,
  GET_EXCEL_EXPORT_TYPES_BY_BRANCH_REQUEST,
  GET_EXCEL_EXPORT_TYPES_BY_BRANCH_SUCCESS,
  GET_EXCEL_EXPORT_TYPES_BY_BRANCH_FAIL,
  GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_REQUEST,
  GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_SUCCESS,
  GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_FAIL,
  GET_DEFAULT_EXCEL_EXPORT_TYPE_REQUEST,
  GET_DEFAULT_EXCEL_EXPORT_TYPE_SUCCESS,
  GET_DEFAULT_EXCEL_EXPORT_TYPE_FAIL,
  UPDATE_EXCEL_EXPORT_TYPE_REQUEST,
  UPDATE_EXCEL_EXPORT_TYPE_SUCCESS,
  UPDATE_EXCEL_EXPORT_TYPE_FAIL,
  DELETE_EXCEL_EXPORT_TYPE_REQUEST,
  DELETE_EXCEL_EXPORT_TYPE_SUCCESS,
  DELETE_EXCEL_EXPORT_TYPE_FAIL,
  SET_DEFAULT_EXCEL_EXPORT_TYPE_REQUEST,
  SET_DEFAULT_EXCEL_EXPORT_TYPE_SUCCESS,
  SET_DEFAULT_EXCEL_EXPORT_TYPE_FAIL
} from "./excelExportTypeConstants";

interface ExcelExportTypeState {
  loading: boolean;
  error: string | null;
  excelExportTypes?: any[];
  excelExportType?: any;
}

// Excel Export Type List Reducer
const initialListState = {
  excelExportTypes: [],
  loading: false,
  error: null,
};

export const excelExportTypeListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case GET_EXCEL_EXPORT_TYPES_REQUEST:
    case GET_EXCEL_EXPORT_TYPES_BY_BRANCH_REQUEST:
    case GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_EXCEL_EXPORT_TYPES_SUCCESS:
      return {
        loading: false,
        excelExportTypes: action.payload.excelExportTypes || action.payload,
        error: null
      };
    case GET_EXCEL_EXPORT_TYPES_BY_BRANCH_SUCCESS:
    case GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_SUCCESS:
      return {
        loading: false,
        excelExportTypes: action.payload.excelExportTypes || action.payload,
        error: null
      };
    case GET_EXCEL_EXPORT_TYPES_FAIL:
    case GET_EXCEL_EXPORT_TYPES_BY_BRANCH_FAIL:
    case GET_EXCEL_EXPORT_TYPES_BY_OPTION_TYPE_FAIL:
      return { loading: false, error: action.payload, excelExportTypes: [] };
    default:
      return state;
  }
};

// Excel Export Type Detail Reducer
const initialDetailState: ExcelExportTypeState = {
  loading: false,
  error: null,
  excelExportType: null,
};

export const excelExportTypeDetailReducer = (state = initialDetailState, action: any): ExcelExportTypeState => {
  switch (action.type) {
    case GET_EXCEL_EXPORT_TYPE_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_EXCEL_EXPORT_TYPE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        excelExportType: action.payload.excelExportType || action.payload
      };
    case GET_EXCEL_EXPORT_TYPE_BY_ID_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Default Excel Export Type Reducer
const initialDefaultState: ExcelExportTypeState = {
  loading: false,
  error: null,
  excelExportType: null,
};

export const defaultExcelExportTypeReducer = (state = initialDefaultState, action: any): ExcelExportTypeState => {
  switch (action.type) {
    case GET_DEFAULT_EXCEL_EXPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_DEFAULT_EXCEL_EXPORT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        excelExportType: action.payload.excelExportType || action.payload
      };
    case GET_DEFAULT_EXCEL_EXPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, excelExportType: null };
    case SET_DEFAULT_EXCEL_EXPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case SET_DEFAULT_EXCEL_EXPORT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        excelExportType: action.payload.excelExportType || action.payload
      };
    case SET_DEFAULT_EXCEL_EXPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Create Excel Export Type Reducer
const initialCreateState: ExcelExportTypeState = {
  loading: false,
  error: null,
  excelExportType: null,
};

export const excelExportTypeCreateReducer = (state = initialCreateState, action: any): ExcelExportTypeState => {
  switch (action.type) {
    case CREATE_EXCEL_EXPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_EXCEL_EXPORT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        excelExportType: action.payload.excelExportType || action.payload,
        error: null
      };
    case CREATE_EXCEL_EXPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, excelExportType: null };
    default:
      return state;
  }
};

// Update Excel Export Type Reducer
const initialUpdateState: ExcelExportTypeState = {
  loading: false,
  error: null,
  excelExportType: null,
};

export const excelExportTypeUpdateReducer = (state = initialUpdateState, action: any): ExcelExportTypeState => {
  switch (action.type) {
    case UPDATE_EXCEL_EXPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_EXCEL_EXPORT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        excelExportType: action.payload.excelExportType || action.payload,
        error: null
      };
    case UPDATE_EXCEL_EXPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Delete Excel Export Type Reducer
const initialDeleteState = {
  loading: false,
  error: null,
  success: false,
};

export const excelExportTypeDeleteReducer = (state = initialDeleteState, action: any) => {
  switch (action.type) {
    case DELETE_EXCEL_EXPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case DELETE_EXCEL_EXPORT_TYPE_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case DELETE_EXCEL_EXPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};
