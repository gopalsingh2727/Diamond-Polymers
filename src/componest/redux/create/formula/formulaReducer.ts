import {
  CREATE_FORMULA_REQUEST,
  CREATE_FORMULA_SUCCESS,
  CREATE_FORMULA_FAIL,
  GET_FORMULAS_REQUEST,
  GET_FORMULAS_SUCCESS,
  GET_FORMULAS_FAIL,
  GET_FORMULA_BY_NAME_REQUEST,
  GET_FORMULA_BY_NAME_SUCCESS,
  GET_FORMULA_BY_NAME_FAIL,
  UPDATE_FORMULA_REQUEST,
  UPDATE_FORMULA_SUCCESS,
  UPDATE_FORMULA_FAIL,
  DELETE_FORMULA_REQUEST,
  DELETE_FORMULA_SUCCESS,
  DELETE_FORMULA_FAIL,
  TEST_FORMULA_REQUEST,
  TEST_FORMULA_SUCCESS,
  TEST_FORMULA_FAIL
} from "./formulaConstants";

interface FormulaState {
  loading: boolean;
  error: string | null;
  success?: boolean;
  formulas?: any[];
  formula?: any;
  testResult?: any;
}

// Create Formula Reducer
const initialCreateState: FormulaState = {
  loading: false,
  error: null,
  success: false,
};

export const formulaCreateReducer = (state = initialCreateState, action: any): FormulaState => {
  switch (action.type) {
    case CREATE_FORMULA_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case CREATE_FORMULA_SUCCESS:
      return { ...state, loading: false, success: true };
    case CREATE_FORMULA_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Formula List Reducer
const initialListState = {
  formulas: [],
  loading: false,
  error: null,
};

export const formulaListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case GET_FORMULAS_REQUEST:
      return { ...state, loading: true };
    case GET_FORMULAS_SUCCESS:
      return { loading: false, formulas: action.payload, error: null };
    case GET_FORMULAS_FAIL:
      return { loading: false, error: action.payload, formulas: [] };
    default:
      return state;
  }
};

// Formula Detail Reducer
const initialDetailState: FormulaState = {
  loading: false,
  error: null,
  formula: null,
};

export const formulaDetailReducer = (state = initialDetailState, action: any): FormulaState => {
  switch (action.type) {
    case GET_FORMULA_BY_NAME_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_FORMULA_BY_NAME_SUCCESS:
      return { ...state, loading: false, formula: action.payload };
    case GET_FORMULA_BY_NAME_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Formula Update Reducer
const initialUpdateState: FormulaState = {
  loading: false,
  error: null,
  success: false,
};

export const formulaUpdateReducer = (
  state = initialUpdateState,
  action: any
): FormulaState => {
  switch (action.type) {
    case UPDATE_FORMULA_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case UPDATE_FORMULA_SUCCESS:
      return { ...state, loading: false, success: true };
    case UPDATE_FORMULA_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};

// Formula Delete Reducer
const initialDeleteState: FormulaState = {
  loading: false,
  error: null,
  success: false,
};

export const formulaDeleteReducer = (
  state = initialDeleteState,
  action: any
): FormulaState => {
  switch (action.type) {
    case DELETE_FORMULA_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case DELETE_FORMULA_SUCCESS:
      return { ...state, loading: false, success: true };
    case DELETE_FORMULA_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};

// Formula Test Reducer
const initialTestState: FormulaState = {
  loading: false,
  error: null,
  testResult: null,
};

export const formulaTestReducer = (
  state = initialTestState,
  action: any
): FormulaState => {
  switch (action.type) {
    case TEST_FORMULA_REQUEST:
      return { ...state, loading: true, error: null, testResult: null };
    case TEST_FORMULA_SUCCESS:
      return { ...state, loading: false, testResult: action.payload };
    case TEST_FORMULA_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
