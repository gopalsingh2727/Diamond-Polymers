import {
  ADD_PRINTING_SPEC_REQUEST,
  ADD_PRINTING_SPEC_SUCCESS,
  ADD_PRINTING_SPEC_FAIL,
  GET_PRINTING_SPECS_REQUEST,
  GET_PRINTING_SPECS_SUCCESS,
  GET_PRINTING_SPECS_FAIL,
  UPDATE_PRINTING_SPEC_REQUEST,
  UPDATE_PRINTING_SPEC_SUCCESS,
  UPDATE_PRINTING_SPEC_FAIL,
  DELETE_PRINTING_SPEC_REQUEST,
  DELETE_PRINTING_SPEC_SUCCESS,
  DELETE_PRINTING_SPEC_FAIL
} from "./printingSpecConstants";

interface PrintingSpec {
  _id: string;
  printingTypeId: string;
  specName: string;
  description?: string;
  colors?: string[];
  resolution?: { width: number; height: number; unit: string };
  printArea?: { width: number; height: number; unit: string };
  inkType?: string;
  substrates?: string[];
  dryingMethod?: string;
  customSpecs?: any;
  isActive: boolean;
}

interface PrintingSpecState {
  printingSpecs: PrintingSpec[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PrintingSpecState = {
  printingSpecs: [],
  loading: false,
  error: null,
  success: false
};

export const printingSpecReducer = (
  state = initialState,
  action: any
): PrintingSpecState => {
  switch (action.type) {
    case ADD_PRINTING_SPEC_REQUEST:
    case GET_PRINTING_SPECS_REQUEST:
    case UPDATE_PRINTING_SPEC_REQUEST:
    case DELETE_PRINTING_SPEC_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false
      };

    case ADD_PRINTING_SPEC_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        printingSpecs: [...state.printingSpecs, action.payload.printingSpec]
      };

    case GET_PRINTING_SPECS_SUCCESS:
      return {
        ...state,
        loading: false,
        printingSpecs: action.payload
      };

    case UPDATE_PRINTING_SPEC_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        printingSpecs: state.printingSpecs.map(spec =>
          spec._id === action.payload.printingSpec._id
            ? action.payload.printingSpec
            : spec
        )
      };

    case DELETE_PRINTING_SPEC_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        printingSpecs: state.printingSpecs.filter(spec => spec._id !== action.payload)
      };

    case ADD_PRINTING_SPEC_FAIL:
    case GET_PRINTING_SPECS_FAIL:
    case UPDATE_PRINTING_SPEC_FAIL:
    case DELETE_PRINTING_SPEC_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };

    default:
      return state;
  }
};
