import {
  CREATE_OPTION_REQUEST,
  CREATE_OPTION_SUCCESS,
  CREATE_OPTION_FAILURE,
  GET_OPTIONS_REQUEST,
  GET_OPTIONS_SUCCESS,
  GET_OPTIONS_FAILURE,
  UPDATE_OPTION_REQUEST,
  UPDATE_OPTION_SUCCESS,
  UPDATE_OPTION_FAILURE,
  DELETE_OPTION_REQUEST,
  DELETE_OPTION_SUCCESS,
  DELETE_OPTION_FAILURE,
  UPLOAD_OPTION_FILES_REQUEST,
  UPLOAD_OPTION_FILES_SUCCESS,
  UPLOAD_OPTION_FILES_FAILURE,
  ADD_OPTION_LINK_REQUEST,
  ADD_OPTION_LINK_SUCCESS,
  ADD_OPTION_LINK_FAILURE,
} from './optionActions';

interface OptionState {
  options: any[];
  loading: boolean;
  error: string | null;
}

const initialState: OptionState = {
  options: [],
  loading: false,
  error: null,
};

const optionReducer = (state = initialState, action: any): OptionState => {
  switch (action.type) {
    case CREATE_OPTION_REQUEST:
    case GET_OPTIONS_REQUEST:
    case UPDATE_OPTION_REQUEST:
    case DELETE_OPTION_REQUEST:
    case UPLOAD_OPTION_FILES_REQUEST:
    case ADD_OPTION_LINK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_OPTION_SUCCESS:
      return {
        ...state,
        loading: false,
        options: [...state.options, action.payload],
        error: null,
      };

    case GET_OPTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        options: action.payload,
        error: null,
      };

    case UPDATE_OPTION_SUCCESS:
    case UPLOAD_OPTION_FILES_SUCCESS:
    case ADD_OPTION_LINK_SUCCESS:
      return {
        ...state,
        loading: false,
        options: state.options.map((opt) =>
          opt._id === action.payload._id ? action.payload : opt
        ),
        error: null,
      };

    case DELETE_OPTION_SUCCESS:
      return {
        ...state,
        loading: false,
        options: state.options.filter((opt) => opt._id !== action.payload),
        error: null,
      };

    case CREATE_OPTION_FAILURE:
    case GET_OPTIONS_FAILURE:
    case UPDATE_OPTION_FAILURE:
    case DELETE_OPTION_FAILURE:
    case UPLOAD_OPTION_FILES_FAILURE:
    case ADD_OPTION_LINK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default optionReducer;
