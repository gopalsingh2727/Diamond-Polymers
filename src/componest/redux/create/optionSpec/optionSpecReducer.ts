import {
  CREATE_OPTION_SPEC_REQUEST,
  CREATE_OPTION_SPEC_SUCCESS,
  CREATE_OPTION_SPEC_FAILURE,
  GET_OPTION_SPECS_REQUEST,
  GET_OPTION_SPECS_SUCCESS,
  GET_OPTION_SPECS_FAILURE,
  GET_OPTION_SPEC_BY_ID_REQUEST,
  GET_OPTION_SPEC_BY_ID_SUCCESS,
  GET_OPTION_SPEC_BY_ID_FAILURE,
  UPDATE_OPTION_SPEC_REQUEST,
  UPDATE_OPTION_SPEC_SUCCESS,
  UPDATE_OPTION_SPEC_FAILURE,
  DELETE_OPTION_SPEC_REQUEST,
  DELETE_OPTION_SPEC_SUCCESS,
  DELETE_OPTION_SPEC_FAILURE,
} from './optionSpecActions';

interface Specification {
  name: string;
  value: string | number | boolean;
  unit?: string;
  dataType: 'string' | 'number' | 'boolean';
  formula?: string;
  isCalculated?: boolean;
}

interface OptionSpec {
  _id: string;
  name: string;
  code: string;
  optionTypeId: string;
  description?: string;
  specifications: Specification[];
  branchId: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OptionSpecState {
  optionSpecs: OptionSpec[];
  currentOptionSpec: OptionSpec | null;
  loading: boolean;
  error: string | null;
}

const initialState: OptionSpecState = {
  optionSpecs: [],
  currentOptionSpec: null,
  loading: false,
  error: null,
};

const optionSpecReducer = (state = initialState, action: any): OptionSpecState => {
  switch (action.type) {
    case CREATE_OPTION_SPEC_REQUEST:
    case GET_OPTION_SPECS_REQUEST:
    case GET_OPTION_SPEC_BY_ID_REQUEST:
    case UPDATE_OPTION_SPEC_REQUEST:
    case DELETE_OPTION_SPEC_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_OPTION_SPEC_SUCCESS:
      return {
        ...state,
        loading: false,
        optionSpecs: [...state.optionSpecs, action.payload],
        error: null,
      };

    case GET_OPTION_SPECS_SUCCESS:
      return {
        ...state,
        loading: false,
        optionSpecs: action.payload,
        error: null,
      };

    case GET_OPTION_SPEC_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        currentOptionSpec: action.payload,
        error: null,
      };

    case UPDATE_OPTION_SPEC_SUCCESS:
      return {
        ...state,
        loading: false,
        optionSpecs: state.optionSpecs.map((spec) =>
          spec._id === action.payload._id ? action.payload : spec
        ),
        currentOptionSpec: action.payload,
        error: null,
      };

    case DELETE_OPTION_SPEC_SUCCESS:
      return {
        ...state,
        loading: false,
        optionSpecs: state.optionSpecs.filter((spec) => spec._id !== action.payload),
        error: null,
      };

    case CREATE_OPTION_SPEC_FAILURE:
    case GET_OPTION_SPECS_FAILURE:
    case GET_OPTION_SPEC_BY_ID_FAILURE:
    case UPDATE_OPTION_SPEC_FAILURE:
    case DELETE_OPTION_SPEC_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default optionSpecReducer;
