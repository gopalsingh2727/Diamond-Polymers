import {
  CREATE_FORMULA_REQUEST,
  CREATE_FORMULA_SUCCESS,
  CREATE_FORMULA_FAILURE,
  GET_FORMULAS_REQUEST,
  GET_FORMULAS_SUCCESS,
  GET_FORMULAS_FAILURE,
  GET_FORMULA_BY_NAME_REQUEST,
  GET_FORMULA_BY_NAME_SUCCESS,
  GET_FORMULA_BY_NAME_FAILURE,
  UPDATE_FORMULA_REQUEST,
  UPDATE_FORMULA_SUCCESS,
  UPDATE_FORMULA_FAILURE,
  DELETE_FORMULA_REQUEST,
  DELETE_FORMULA_SUCCESS,
  DELETE_FORMULA_FAILURE,
  TEST_FORMULA_REQUEST,
  TEST_FORMULA_SUCCESS,
  TEST_FORMULA_FAILURE,
} from './formulaConstants';

interface FormulaState {
  loading: boolean;
  success: boolean;
  error: string | null;
  formula?: any;
  formulas?: any[];
  result?: any;
}

const initialState: FormulaState = {
  loading: false,
  success: false,
  error: null,
};

// Create Formula Reducer
export const formulaCreateReducer = (state = initialState, action: any): FormulaState => {
  switch (action.type) {
    case CREATE_FORMULA_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_FORMULA_SUCCESS:
      return { ...state, loading: false, success: true, formula: action.payload };
    case CREATE_FORMULA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Get Formulas List Reducer
export const formulaListReducer = (state = { ...initialState, formulas: [] }, action: any): FormulaState => {
  switch (action.type) {
    case GET_FORMULAS_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_FORMULAS_SUCCESS:
      return { ...state, loading: false, success: true, formulas: action.payload };
    case GET_FORMULAS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Get Formula Detail Reducer
export const formulaDetailReducer = (state = initialState, action: any): FormulaState => {
  switch (action.type) {
    case GET_FORMULA_BY_NAME_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_FORMULA_BY_NAME_SUCCESS:
      return { ...state, loading: false, success: true, formula: action.payload };
    case GET_FORMULA_BY_NAME_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Update Formula Reducer
export const formulaUpdateReducer = (state = initialState, action: any): FormulaState => {
  switch (action.type) {
    case UPDATE_FORMULA_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_FORMULA_SUCCESS:
      return { ...state, loading: false, success: true, formula: action.payload };
    case UPDATE_FORMULA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Delete Formula Reducer
export const formulaDeleteReducer = (state = initialState, action: any): FormulaState => {
  switch (action.type) {
    case DELETE_FORMULA_REQUEST:
      return { ...state, loading: true, error: null };
    case DELETE_FORMULA_SUCCESS:
      return { ...state, loading: false, success: true };
    case DELETE_FORMULA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Test Formula Reducer
export const formulaTestReducer = (state = initialState, action: any): FormulaState => {
  switch (action.type) {
    case TEST_FORMULA_REQUEST:
      return { ...state, loading: true, error: null };
    case TEST_FORMULA_SUCCESS:
      return { ...state, loading: false, success: true, result: action.payload };
    case TEST_FORMULA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
