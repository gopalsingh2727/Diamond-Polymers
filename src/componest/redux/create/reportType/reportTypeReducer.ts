import {
  CREATE_REPORT_TYPE_REQUEST,
  CREATE_REPORT_TYPE_SUCCESS,
  CREATE_REPORT_TYPE_FAIL,
  GET_REPORT_TYPES_REQUEST,
  GET_REPORT_TYPES_SUCCESS,
  GET_REPORT_TYPES_FAIL,
  GET_REPORT_TYPE_BY_ID_REQUEST,
  GET_REPORT_TYPE_BY_ID_SUCCESS,
  GET_REPORT_TYPE_BY_ID_FAIL,
  GET_REPORT_TYPES_BY_BRANCH_REQUEST,
  GET_REPORT_TYPES_BY_BRANCH_SUCCESS,
  GET_REPORT_TYPES_BY_BRANCH_FAIL,
  GET_REPORT_TYPES_BY_CATEGORY_REQUEST,
  GET_REPORT_TYPES_BY_CATEGORY_SUCCESS,
  GET_REPORT_TYPES_BY_CATEGORY_FAIL,
  GET_DEFAULT_REPORT_TYPE_REQUEST,
  GET_DEFAULT_REPORT_TYPE_SUCCESS,
  GET_DEFAULT_REPORT_TYPE_FAIL,
  UPDATE_REPORT_TYPE_REQUEST,
  UPDATE_REPORT_TYPE_SUCCESS,
  UPDATE_REPORT_TYPE_FAIL,
  DELETE_REPORT_TYPE_REQUEST,
  DELETE_REPORT_TYPE_SUCCESS,
  DELETE_REPORT_TYPE_FAIL,
  SET_DEFAULT_REPORT_TYPE_REQUEST,
  SET_DEFAULT_REPORT_TYPE_SUCCESS,
  SET_DEFAULT_REPORT_TYPE_FAIL,
  GENERATE_REPORT_REQUEST,
  GENERATE_REPORT_SUCCESS,
  GENERATE_REPORT_FAIL,
  CLEAR_REPORT_TYPE_ERRORS,
  CLEAR_REPORT_DATA
} from "./reportTypeConstants";

interface ReportTypeState {
  loading: boolean;
  error: string | null;
  reportTypes?: any[];
  reportType?: any;
}

interface GeneratedReportState {
  loading: boolean;
  error: string | null;
  reportData?: any;
  graphData?: any[];
  tableData?: any[];
  summary?: any;
}

// Report Type List Reducer
const initialListState = {
  reportTypes: [],
  loading: false,
  error: null,
};

export const reportTypeListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case GET_REPORT_TYPES_REQUEST:
    case GET_REPORT_TYPES_BY_BRANCH_REQUEST:
    case GET_REPORT_TYPES_BY_CATEGORY_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_REPORT_TYPES_SUCCESS:
      return {
        loading: false,
        reportTypes: action.payload.reportTypes || action.payload,
        error: null
      };
    case GET_REPORT_TYPES_BY_BRANCH_SUCCESS:
    case GET_REPORT_TYPES_BY_CATEGORY_SUCCESS:
      return {
        loading: false,
        reportTypes: action.payload.reportTypes || action.payload,
        error: null
      };
    case GET_REPORT_TYPES_FAIL:
    case GET_REPORT_TYPES_BY_BRANCH_FAIL:
    case GET_REPORT_TYPES_BY_CATEGORY_FAIL:
      return { loading: false, error: action.payload, reportTypes: [] };
    case CLEAR_REPORT_TYPE_ERRORS:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Report Type Detail Reducer
const initialDetailState: ReportTypeState = {
  loading: false,
  error: null,
  reportType: null,
};

export const reportTypeDetailReducer = (state = initialDetailState, action: any): ReportTypeState => {
  switch (action.type) {
    case GET_REPORT_TYPE_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_REPORT_TYPE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        reportType: action.payload.reportType || action.payload
      };
    case GET_REPORT_TYPE_BY_ID_FAIL:
      return { ...state, loading: false, error: action.payload };
    case CLEAR_REPORT_TYPE_ERRORS:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Default Report Type Reducer
const initialDefaultState: ReportTypeState = {
  loading: false,
  error: null,
  reportType: null,
};

export const defaultReportTypeReducer = (state = initialDefaultState, action: any): ReportTypeState => {
  switch (action.type) {
    case GET_DEFAULT_REPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_DEFAULT_REPORT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        reportType: action.payload.reportType || action.payload
      };
    case GET_DEFAULT_REPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, reportType: null };
    case SET_DEFAULT_REPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case SET_DEFAULT_REPORT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        reportType: action.payload.reportType || action.payload
      };
    case SET_DEFAULT_REPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload };
    case CLEAR_REPORT_TYPE_ERRORS:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create Report Type Reducer
const initialCreateState: ReportTypeState = {
  loading: false,
  error: null,
  reportType: null,
};

export const reportTypeCreateReducer = (state = initialCreateState, action: any): ReportTypeState => {
  switch (action.type) {
    case CREATE_REPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_REPORT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        reportType: action.payload.reportType || action.payload,
        error: null
      };
    case CREATE_REPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, reportType: null };
    case CLEAR_REPORT_TYPE_ERRORS:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Update Report Type Reducer
const initialUpdateState: ReportTypeState = {
  loading: false,
  error: null,
  reportType: null,
};

export const reportTypeUpdateReducer = (state = initialUpdateState, action: any): ReportTypeState => {
  switch (action.type) {
    case UPDATE_REPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_REPORT_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        reportType: action.payload.reportType || action.payload,
        error: null
      };
    case UPDATE_REPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload };
    case CLEAR_REPORT_TYPE_ERRORS:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Delete Report Type Reducer
const initialDeleteState = {
  loading: false,
  error: null,
  success: false,
};

export const reportTypeDeleteReducer = (state = initialDeleteState, action: any) => {
  switch (action.type) {
    case DELETE_REPORT_TYPE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case DELETE_REPORT_TYPE_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case DELETE_REPORT_TYPE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    case CLEAR_REPORT_TYPE_ERRORS:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Generated Report Reducer (for report execution results)
const initialGeneratedState: GeneratedReportState = {
  loading: false,
  error: null,
  reportData: null,
  graphData: [],
  tableData: [],
  summary: null,
};

export const generatedReportReducer = (state = initialGeneratedState, action: any): GeneratedReportState => {
  switch (action.type) {
    case GENERATE_REPORT_REQUEST:
      return { ...state, loading: true, error: null };
    case GENERATE_REPORT_SUCCESS:
      return {
        ...state,
        loading: false,
        reportData: action.payload,
        graphData: action.payload.graphData || [],
        tableData: action.payload.tableData || [],
        summary: action.payload.summary || null,
        error: null
      };
    case GENERATE_REPORT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        reportData: null,
        graphData: [],
        tableData: [],
        summary: null
      };
    case CLEAR_REPORT_DATA:
      return initialGeneratedState;
    case CLEAR_REPORT_TYPE_ERRORS:
      return { ...state, error: null };
    default:
      return state;
  }
};
