import {
  MachineTableState,
  MachineTableActionTypes
} from './machineTableTypes';
import {
  FETCH_MACHINE_TABLE_REQUEST,
  FETCH_MACHINE_TABLE_SUCCESS,
  FETCH_MACHINE_TABLE_FAILURE,
  CLEAR_MACHINE_TABLE_DATA,
  CLEAR_MACHINE_TABLE_ERROR,
  SET_SELECTED_MACHINE,
  CLEAR_SELECTED_MACHINE,
  UPDATE_TABLE_ROW_REQUEST,
  UPDATE_TABLE_ROW_SUCCESS,
  UPDATE_TABLE_ROW_FAILURE,
  DELETE_TABLE_ROW_REQUEST,
  DELETE_TABLE_ROW_SUCCESS,
  DELETE_TABLE_ROW_FAILURE,
  ADD_TABLE_ROW_REQUEST,
  ADD_TABLE_ROW_SUCCESS,
  ADD_TABLE_ROW_FAILURE,
  FETCH_MACHINE_CONFIG_REQUEST,
  FETCH_MACHINE_CONFIG_SUCCESS,
  FETCH_MACHINE_CONFIG_FAILURE
} from './machineTableConstants';

const initialState: MachineTableState = {
  currentTableData: null,
  selectedMachine: null,
  loading: false,
  updating: false,
  deleting: false,
  adding: false,
  error: null,
  updateError: null,
  successMessage: null,
  cachedTables: {}
};

const machineTableReducer = (
  state = initialState,
  action: MachineTableActionTypes
): MachineTableState => {
  switch (action.type) {
    // FETCH MACHINE TABLE DATA
    case FETCH_MACHINE_TABLE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_MACHINE_TABLE_SUCCESS:
      return {
        ...state,
        loading: false,
        currentTableData: action.payload,
        error: null,
        cachedTables: {
          ...state.cachedTables,
          [action.payload.machine._id]: action.payload
        }
      };

    case FETCH_MACHINE_TABLE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        currentTableData: null
      };

    // FETCH MACHINE CONFIG
    case FETCH_MACHINE_CONFIG_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_MACHINE_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    case FETCH_MACHINE_CONFIG_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // ADD TABLE ROW
    case ADD_TABLE_ROW_REQUEST:
      return {
        ...state,
        adding: true,
        updateError: null,
        successMessage: null
      };

    case ADD_TABLE_ROW_SUCCESS:
      return {
        ...state,
        adding: false,
        currentTableData: action.payload,
        successMessage: 'Row added successfully',
        updateError: null,
        cachedTables: {
          ...state.cachedTables,
          [action.payload.machine._id]: action.payload
        }
      };

    case ADD_TABLE_ROW_FAILURE:
      return {
        ...state,
        adding: false,
        updateError: action.payload,
        successMessage: null
      };

    // UPDATE TABLE ROW
    case UPDATE_TABLE_ROW_REQUEST:
      return {
        ...state,
        updating: true,
        updateError: null,
        successMessage: null
      };

    case UPDATE_TABLE_ROW_SUCCESS:
      return {
        ...state,
        updating: false,
        currentTableData: action.payload,
        successMessage: 'Row updated successfully',
        updateError: null,
        cachedTables: {
          ...state.cachedTables,
          [action.payload.machine._id]: action.payload
        }
      };

    case UPDATE_TABLE_ROW_FAILURE:
      return {
        ...state,
        updating: false,
        updateError: action.payload,
        successMessage: null
      };

    // DELETE TABLE ROW
    case DELETE_TABLE_ROW_REQUEST:
      return {
        ...state,
        deleting: true,
        updateError: null,
        successMessage: null
      };

    case DELETE_TABLE_ROW_SUCCESS:
      return {
        ...state,
        deleting: false,
        currentTableData: action.payload,
        successMessage: 'Row deleted successfully',
        updateError: null,
        cachedTables: {
          ...state.cachedTables,
          [action.payload.machine._id]: action.payload
        }
      };

    case DELETE_TABLE_ROW_FAILURE:
      return {
        ...state,
        deleting: false,
        updateError: action.payload,
        successMessage: null
      };

    // SELECTED MACHINE
    case SET_SELECTED_MACHINE:
      return {
        ...state,
        selectedMachine: action.payload
      };

    case CLEAR_SELECTED_MACHINE:
      return {
        ...state,
        selectedMachine: null
      };

    // CLEAR ACTIONS
    case CLEAR_MACHINE_TABLE_DATA:
      return {
        ...state,
        currentTableData: null,
        selectedMachine: null,
        error: null,
        updateError: null,
        successMessage: null
      };

    case CLEAR_MACHINE_TABLE_ERROR:
      return {
        ...state,
        error: null,
        updateError: null
      };

    default:
      return state;
  }
};

export default machineTableReducer;