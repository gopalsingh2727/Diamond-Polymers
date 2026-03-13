/**
 * Dashboard Type Reducer  (v2)
 */

import {
  DASHBOARD_TYPE_V2_CREATE_REQUEST, DASHBOARD_TYPE_V2_CREATE_SUCCESS, DASHBOARD_TYPE_V2_CREATE_FAILURE,
  DASHBOARD_TYPE_V2_LIST_REQUEST,   DASHBOARD_TYPE_V2_LIST_SUCCESS,   DASHBOARD_TYPE_V2_LIST_FAILURE,
  DASHBOARD_TYPE_V2_GET_REQUEST,    DASHBOARD_TYPE_V2_GET_SUCCESS,    DASHBOARD_TYPE_V2_GET_FAILURE,
  DASHBOARD_TYPE_V2_UPDATE_REQUEST, DASHBOARD_TYPE_V2_UPDATE_SUCCESS, DASHBOARD_TYPE_V2_UPDATE_FAILURE,
  DASHBOARD_TYPE_V2_DELETE_REQUEST, DASHBOARD_TYPE_V2_DELETE_SUCCESS, DASHBOARD_TYPE_V2_DELETE_FAILURE,
} from './dashboardTypeActions';

interface DashboardTypeState {
  list:    any[];
  current: any | null;
  loading: boolean;
  error:   string | null;
}

const initialState: DashboardTypeState = {
  list:    [],
  current: null,
  loading: false,
  error:   null,
};

const dashboardTypeReducer = (
  state = initialState,
  action: { type: string; payload?: any }
): DashboardTypeState => {
  switch (action.type) {

    // ── Loading states ────────────────────────────────────────────
    case DASHBOARD_TYPE_V2_CREATE_REQUEST:
    case DASHBOARD_TYPE_V2_LIST_REQUEST:
    case DASHBOARD_TYPE_V2_GET_REQUEST:
    case DASHBOARD_TYPE_V2_UPDATE_REQUEST:
    case DASHBOARD_TYPE_V2_DELETE_REQUEST:
      return { ...state, loading: true, error: null };

    // ── Success ───────────────────────────────────────────────────
    case DASHBOARD_TYPE_V2_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        list:    [...state.list, action.payload],
      };

    case DASHBOARD_TYPE_V2_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        list:    Array.isArray(action.payload) ? action.payload : [],
      };

    case DASHBOARD_TYPE_V2_GET_SUCCESS:
      return { ...state, loading: false, current: action.payload };

    case DASHBOARD_TYPE_V2_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list.map((item) =>
          item._id === action.payload._id ? action.payload : item
        ),
        current: action.payload,
      };

    case DASHBOARD_TYPE_V2_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        list:    state.list.filter((item) => item._id !== action.payload),
        current: state.current?._id === action.payload ? null : state.current,
      };

    // ── Failure ───────────────────────────────────────────────────
    case DASHBOARD_TYPE_V2_CREATE_FAILURE:
    case DASHBOARD_TYPE_V2_LIST_FAILURE:
    case DASHBOARD_TYPE_V2_GET_FAILURE:
    case DASHBOARD_TYPE_V2_UPDATE_FAILURE:
    case DASHBOARD_TYPE_V2_DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default dashboardTypeReducer;
