import {
  GET_DASHBOARD_REQUEST,
  GET_DASHBOARD_SUCCESS,
  GET_DASHBOARD_FAILURE,
  GET_STATUS_REPORT_REQUEST,
  GET_STATUS_REPORT_SUCCESS,
  GET_STATUS_REPORT_FAILURE,
  GET_ORDER_TYPE_REPORT_REQUEST,
  GET_ORDER_TYPE_REPORT_SUCCESS,
  GET_ORDER_TYPE_REPORT_FAILURE,
  GET_CATEGORY_REPORT_REQUEST,
  GET_CATEGORY_REPORT_SUCCESS,
  GET_CATEGORY_REPORT_FAILURE,
  GET_OPTION_TYPE_REPORT_REQUEST,
  GET_OPTION_TYPE_REPORT_SUCCESS,
  GET_OPTION_TYPE_REPORT_FAILURE,
  GET_OPTIONS_BY_TYPE_REQUEST,
  GET_OPTIONS_BY_TYPE_SUCCESS,
  GET_OPTIONS_BY_TYPE_FAILURE,
  GET_COMPANY_REPORT_REQUEST,
  GET_COMPANY_REPORT_SUCCESS,
  GET_COMPANY_REPORT_FAILURE,
  EXPORT_EXCEL_REQUEST,
  EXPORT_EXCEL_SUCCESS,
  EXPORT_EXCEL_FAILURE,
  CLEAR_REPORT_DATA,
} from './reportActions';

interface ReportsState {
  dashboard: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  statusReport: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  orderTypeReport: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  categoryReport: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  optionTypeReport: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  optionsByType: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  companyReport: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  exporting: boolean;
  exportError: string | null;
}

const initialState: ReportsState = {
  dashboard: {
    data: null,
    loading: false,
    error: null,
  },
  statusReport: {
    data: null,
    loading: false,
    error: null,
  },
  orderTypeReport: {
    data: null,
    loading: false,
    error: null,
  },
  categoryReport: {
    data: null,
    loading: false,
    error: null,
  },
  optionTypeReport: {
    data: null,
    loading: false,
    error: null,
  },
  optionsByType: {
    data: null,
    loading: false,
    error: null,
  },
  companyReport: {
    data: null,
    loading: false,
    error: null,
  },
  exporting: false,
  exportError: null,
};

const reportReducer = (state = initialState, action: any): ReportsState => {
  switch (action.type) {
    // Dashboard
    case GET_DASHBOARD_REQUEST:
      return {
        ...state,
        dashboard: { ...state.dashboard, loading: true, error: null },
      };
    case GET_DASHBOARD_SUCCESS:
      return {
        ...state,
        dashboard: { data: action.payload, loading: false, error: null },
      };
    case GET_DASHBOARD_FAILURE:
      return {
        ...state,
        dashboard: { ...state.dashboard, loading: false, error: action.payload },
      };

    // Status Report
    case GET_STATUS_REPORT_REQUEST:
      return {
        ...state,
        statusReport: { ...state.statusReport, loading: true, error: null },
      };
    case GET_STATUS_REPORT_SUCCESS:
      return {
        ...state,
        statusReport: { data: action.payload, loading: false, error: null },
      };
    case GET_STATUS_REPORT_FAILURE:
      return {
        ...state,
        statusReport: { ...state.statusReport, loading: false, error: action.payload },
      };

    // Order Type Report
    case GET_ORDER_TYPE_REPORT_REQUEST:
      return {
        ...state,
        orderTypeReport: { ...state.orderTypeReport, loading: true, error: null },
      };
    case GET_ORDER_TYPE_REPORT_SUCCESS:
      return {
        ...state,
        orderTypeReport: { data: action.payload, loading: false, error: null },
      };
    case GET_ORDER_TYPE_REPORT_FAILURE:
      return {
        ...state,
        orderTypeReport: { ...state.orderTypeReport, loading: false, error: action.payload },
      };

    // Category Report
    case GET_CATEGORY_REPORT_REQUEST:
      return {
        ...state,
        categoryReport: { ...state.categoryReport, loading: true, error: null },
      };
    case GET_CATEGORY_REPORT_SUCCESS:
      return {
        ...state,
        categoryReport: { data: action.payload, loading: false, error: null },
      };
    case GET_CATEGORY_REPORT_FAILURE:
      return {
        ...state,
        categoryReport: { ...state.categoryReport, loading: false, error: action.payload },
      };

    // Option Type Report
    case GET_OPTION_TYPE_REPORT_REQUEST:
      return {
        ...state,
        optionTypeReport: { ...state.optionTypeReport, loading: true, error: null },
      };
    case GET_OPTION_TYPE_REPORT_SUCCESS:
      return {
        ...state,
        optionTypeReport: { data: action.payload, loading: false, error: null },
      };
    case GET_OPTION_TYPE_REPORT_FAILURE:
      return {
        ...state,
        optionTypeReport: { ...state.optionTypeReport, loading: false, error: action.payload },
      };

    // Options by Type (Drill-down)
    case GET_OPTIONS_BY_TYPE_REQUEST:
      return {
        ...state,
        optionsByType: { ...state.optionsByType, loading: true, error: null },
      };
    case GET_OPTIONS_BY_TYPE_SUCCESS:
      return {
        ...state,
        optionsByType: { data: action.payload, loading: false, error: null },
      };
    case GET_OPTIONS_BY_TYPE_FAILURE:
      return {
        ...state,
        optionsByType: { ...state.optionsByType, loading: false, error: action.payload },
      };

    // Company Report
    case GET_COMPANY_REPORT_REQUEST:
      return {
        ...state,
        companyReport: { ...state.companyReport, loading: true, error: null },
      };
    case GET_COMPANY_REPORT_SUCCESS:
      return {
        ...state,
        companyReport: { data: action.payload, loading: false, error: null },
      };
    case GET_COMPANY_REPORT_FAILURE:
      return {
        ...state,
        companyReport: { ...state.companyReport, loading: false, error: action.payload },
      };

    // Export Excel
    case EXPORT_EXCEL_REQUEST:
      return {
        ...state,
        exporting: true,
        exportError: null,
      };
    case EXPORT_EXCEL_SUCCESS:
      return {
        ...state,
        exporting: false,
        exportError: null,
      };
    case EXPORT_EXCEL_FAILURE:
      return {
        ...state,
        exporting: false,
        exportError: action.payload,
      };

    // Clear Data
    case CLEAR_REPORT_DATA:
      return initialState;

    default:
      return state;
  }
};

export default reportReducer;
