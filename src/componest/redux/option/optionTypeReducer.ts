import {
  CREATE_OPTION_TYPE_REQUEST,
  CREATE_OPTION_TYPE_SUCCESS,
  CREATE_OPTION_TYPE_FAILURE,
  GET_OPTION_TYPES_REQUEST,
  GET_OPTION_TYPES_SUCCESS,
  GET_OPTION_TYPES_FAILURE,
  UPDATE_OPTION_TYPE_REQUEST,
  UPDATE_OPTION_TYPE_SUCCESS,
  UPDATE_OPTION_TYPE_FAILURE,
  DELETE_OPTION_TYPE_REQUEST,
  DELETE_OPTION_TYPE_SUCCESS,
  DELETE_OPTION_TYPE_FAILURE,
} from './optionTypeActions';

interface OptionTypeState {
  optionTypes: any[];
  loading: boolean;
  error: string | null;
}

const initialState: OptionTypeState = {
  optionTypes: [],
  loading: false,
  error: null,
};

const optionTypeReducer = (state = initialState, action: any): OptionTypeState => {
  switch (action.type) {
    case CREATE_OPTION_TYPE_REQUEST:
    case GET_OPTION_TYPES_REQUEST:
    case UPDATE_OPTION_TYPE_REQUEST:
    case DELETE_OPTION_TYPE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_OPTION_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        optionTypes: [...state.optionTypes, action.payload],
        error: null,
      };

    case GET_OPTION_TYPES_SUCCESS:
      return {
        ...state,
        loading: false,
        optionTypes: action.payload,
        error: null,
      };

    case UPDATE_OPTION_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        optionTypes: state.optionTypes.map((ot) =>
          ot._id === action.payload._id ? action.payload : ot
        ),
        error: null,
      };

    case DELETE_OPTION_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        optionTypes: state.optionTypes.filter((ot) => ot._id !== action.payload),
        error: null,
      };

    case CREATE_OPTION_TYPE_FAILURE:
    case GET_OPTION_TYPES_FAILURE:
    case UPDATE_OPTION_TYPE_FAILURE:
    case DELETE_OPTION_TYPE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default optionTypeReducer;
