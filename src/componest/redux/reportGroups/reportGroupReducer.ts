import {
  CREATE_REPORT_GROUP_REQUEST,
  CREATE_REPORT_GROUP_SUCCESS,
  CREATE_REPORT_GROUP_FAILURE,
  GET_REPORT_GROUPS_REQUEST,
  GET_REPORT_GROUPS_SUCCESS,
  GET_REPORT_GROUPS_FAILURE,
  GET_REPORT_GROUP_BY_ID_REQUEST,
  GET_REPORT_GROUP_BY_ID_SUCCESS,
  GET_REPORT_GROUP_BY_ID_FAILURE,
  UPDATE_REPORT_GROUP_REQUEST,
  UPDATE_REPORT_GROUP_SUCCESS,
  UPDATE_REPORT_GROUP_FAILURE,
  DELETE_REPORT_GROUP_REQUEST,
  DELETE_REPORT_GROUP_SUCCESS,
  DELETE_REPORT_GROUP_FAILURE,
  GET_REPORT_GROUP_STATS_REQUEST,
  GET_REPORT_GROUP_STATS_SUCCESS,
  GET_REPORT_GROUP_STATS_FAILURE,
  SELECT_REPORT_GROUP,
  CLEAR_REPORT_GROUP_DATA,
} from './reportGroupActions';

interface ReportGroup {
  _id: string;
  name: string;
  description?: string;
  branchId: any;
  selectedItems: Array<{
    optionTypeId: string;
    optionTypeName: string;
    options: Array<{
      optionId: string;
      optionName: string;
    }>;
  }>;
  orderTypeIds?: string[];
  categoryIds?: string[];
  color: string;
  isActive: boolean;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

interface GroupStats {
  group: {
    _id: string;
    name: string;
    description?: string;
    color: string;
    optionTypesCount: number;
    optionsCount: number;
  };
  summary: {
    totalOrders: number;
    totalQuantity: number;
    completed: number;
    pending: number;
    inProgress: number;
    issues: number;
  };
  byStatus: Array<{ _id: string; count: number }>;
  byOptionType: Array<{
    optionTypeId: string;
    optionTypeName: string;
    orderCount: number;
    totalQuantity: number;
  }>;
  byOption: Array<{
    optionId: string;
    optionName: string;
    optionTypeId: string;
    optionTypeName: string;
    orderCount: number;
    totalQuantity: number;
  }>;
  formulas: {
    sum: number;
    average: number;
    count: number;
    min: number;
    max: number;
    sqrt: number;
  };
}

interface ReportGroupsState {
  groups: ReportGroup[];
  selectedGroup: ReportGroup | null;
  groupStats: GroupStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  statsError: string | null;
}

const initialState: ReportGroupsState = {
  groups: [],
  selectedGroup: null,
  groupStats: null,
  loading: false,
  statsLoading: false,
  error: null,
  statsError: null,
};

const reportGroupReducer = (state = initialState, action: any): ReportGroupsState => {
  switch (action.type) {
    // Create
    case CREATE_REPORT_GROUP_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_REPORT_GROUP_SUCCESS:
      return {
        ...state,
        loading: false,
        groups: [action.payload, ...state.groups],
        error: null,
      };
    case CREATE_REPORT_GROUP_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Get All
    case GET_REPORT_GROUPS_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_REPORT_GROUPS_SUCCESS:
      return {
        ...state,
        loading: false,
        groups: action.payload,
        error: null,
      };
    case GET_REPORT_GROUPS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Get By ID
    case GET_REPORT_GROUP_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_REPORT_GROUP_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedGroup: action.payload,
        error: null,
      };
    case GET_REPORT_GROUP_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Update
    case UPDATE_REPORT_GROUP_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_REPORT_GROUP_SUCCESS:
      return {
        ...state,
        loading: false,
        groups: state.groups.map((group) =>
          group._id === action.payload._id ? action.payload : group
        ),
        selectedGroup: action.payload,
        error: null,
      };
    case UPDATE_REPORT_GROUP_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Delete
    case DELETE_REPORT_GROUP_REQUEST:
      return { ...state, loading: true, error: null };
    case DELETE_REPORT_GROUP_SUCCESS:
      return {
        ...state,
        loading: false,
        groups: state.groups.filter((group) => group._id !== action.payload),
        selectedGroup:
          state.selectedGroup?._id === action.payload ? null : state.selectedGroup,
        error: null,
      };
    case DELETE_REPORT_GROUP_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Get Stats
    case GET_REPORT_GROUP_STATS_REQUEST:
      return { ...state, statsLoading: true, statsError: null };
    case GET_REPORT_GROUP_STATS_SUCCESS:
      return {
        ...state,
        statsLoading: false,
        groupStats: action.payload,
        statsError: null,
      };
    case GET_REPORT_GROUP_STATS_FAILURE:
      return { ...state, statsLoading: false, statsError: action.payload };

    // Select Group
    case SELECT_REPORT_GROUP:
      return { ...state, selectedGroup: action.payload };

    // Clear Data
    case CLEAR_REPORT_GROUP_DATA:
      return initialState;

    default:
      return state;
  }
};

export default reportGroupReducer;
