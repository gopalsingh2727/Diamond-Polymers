import {
  CREATE_PRODUCT_SPEC_REQUEST,
  CREATE_PRODUCT_SPEC_SUCCESS,
  CREATE_PRODUCT_SPEC_FAIL,
  GET_PRODUCT_SPECS_REQUEST,
  GET_PRODUCT_SPECS_SUCCESS,
  GET_PRODUCT_SPECS_FAIL,
  GET_PRODUCT_SPEC_BY_ID_REQUEST,
  GET_PRODUCT_SPEC_BY_ID_SUCCESS,
  GET_PRODUCT_SPEC_BY_ID_FAIL,
  GET_PRODUCT_SPECS_BY_TYPE_REQUEST,
  GET_PRODUCT_SPECS_BY_TYPE_SUCCESS,
  GET_PRODUCT_SPECS_BY_TYPE_FAIL,
  UPDATE_PRODUCT_SPEC_REQUEST,
  UPDATE_PRODUCT_SPEC_SUCCESS,
  UPDATE_PRODUCT_SPEC_FAIL,
  DELETE_PRODUCT_SPEC_REQUEST,
  DELETE_PRODUCT_SPEC_SUCCESS,
  DELETE_PRODUCT_SPEC_FAIL,
  ACTIVATE_PRODUCT_SPEC_REQUEST,
  ACTIVATE_PRODUCT_SPEC_SUCCESS,
  ACTIVATE_PRODUCT_SPEC_FAIL,
  DEACTIVATE_PRODUCT_SPEC_REQUEST,
  DEACTIVATE_PRODUCT_SPEC_SUCCESS,
  DEACTIVATE_PRODUCT_SPEC_FAIL
} from "./productSpecConstants";

interface ProductSpecState {
  loading: boolean;
  error: string | null;
  success?: boolean;
  productSpecs?: any[];
  productSpec?: any;
}

// Create Product Spec Reducer
const initialCreateState: ProductSpecState = {
  loading: false,
  error: null,
  success: false,
};

export const productSpecCreateReducer = (state = initialCreateState, action: any): ProductSpecState => {
  switch (action.type) {
    case CREATE_PRODUCT_SPEC_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case CREATE_PRODUCT_SPEC_SUCCESS:
      return { ...state, loading: false, success: true };
    case CREATE_PRODUCT_SPEC_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Product Spec List Reducer
const initialListState = {
  productSpecs: [],
  loading: false,
  error: null,
};

export const productSpecListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case GET_PRODUCT_SPECS_REQUEST:
    case GET_PRODUCT_SPECS_BY_TYPE_REQUEST:
      return { ...state, loading: true };
    case GET_PRODUCT_SPECS_SUCCESS:
    case GET_PRODUCT_SPECS_BY_TYPE_SUCCESS:
      return { loading: false, productSpecs: action.payload, error: null };
    case GET_PRODUCT_SPECS_FAIL:
    case GET_PRODUCT_SPECS_BY_TYPE_FAIL:
      return { loading: false, error: action.payload, productSpecs: [] };
    default:
      return state;
  }
};

// Product Spec Detail Reducer
const initialDetailState: ProductSpecState = {
  loading: false,
  error: null,
  productSpec: null,
};

export const productSpecDetailReducer = (state = initialDetailState, action: any): ProductSpecState => {
  switch (action.type) {
    case GET_PRODUCT_SPEC_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_PRODUCT_SPEC_BY_ID_SUCCESS:
      return { ...state, loading: false, productSpec: action.payload };
    case GET_PRODUCT_SPEC_BY_ID_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Product Spec Update Reducer
const initialUpdateState: ProductSpecState = {
  loading: false,
  error: null,
  success: false,
};

export const productSpecUpdateReducer = (
  state = initialUpdateState,
  action: any
): ProductSpecState => {
  switch (action.type) {
    case UPDATE_PRODUCT_SPEC_REQUEST:
    case ACTIVATE_PRODUCT_SPEC_REQUEST:
    case DEACTIVATE_PRODUCT_SPEC_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case UPDATE_PRODUCT_SPEC_SUCCESS:
    case ACTIVATE_PRODUCT_SPEC_SUCCESS:
    case DEACTIVATE_PRODUCT_SPEC_SUCCESS:
      return { ...state, loading: false, success: true };
    case UPDATE_PRODUCT_SPEC_FAIL:
    case ACTIVATE_PRODUCT_SPEC_FAIL:
    case DEACTIVATE_PRODUCT_SPEC_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};

// Product Spec Delete Reducer
const initialDeleteState: ProductSpecState = {
  loading: false,
  error: null,
  success: false,
};

export const productSpecDeleteReducer = (
  state = initialDeleteState,
  action: any
): ProductSpecState => {
  switch (action.type) {
    case DELETE_PRODUCT_SPEC_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case DELETE_PRODUCT_SPEC_SUCCESS:
      return { ...state, loading: false, success: true };
    case DELETE_PRODUCT_SPEC_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};
