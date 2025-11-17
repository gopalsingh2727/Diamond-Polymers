import {
  CREATE_MATERIAL_SPEC_REQUEST,
  CREATE_MATERIAL_SPEC_SUCCESS,
  CREATE_MATERIAL_SPEC_FAIL,
  GET_MATERIAL_SPECS_REQUEST,
  GET_MATERIAL_SPECS_SUCCESS,
  GET_MATERIAL_SPECS_FAIL,
  GET_MATERIAL_SPEC_BY_ID_REQUEST,
  GET_MATERIAL_SPEC_BY_ID_SUCCESS,
  GET_MATERIAL_SPEC_BY_ID_FAIL,
  GET_MATERIAL_SPECS_BY_TYPE_REQUEST,
  GET_MATERIAL_SPECS_BY_TYPE_SUCCESS,
  GET_MATERIAL_SPECS_BY_TYPE_FAIL,
  UPDATE_MATERIAL_SPEC_REQUEST,
  UPDATE_MATERIAL_SPEC_SUCCESS,
  UPDATE_MATERIAL_SPEC_FAIL,
  DELETE_MATERIAL_SPEC_REQUEST,
  DELETE_MATERIAL_SPEC_SUCCESS,
  DELETE_MATERIAL_SPEC_FAIL,
  ACTIVATE_MATERIAL_SPEC_REQUEST,
  ACTIVATE_MATERIAL_SPEC_SUCCESS,
  ACTIVATE_MATERIAL_SPEC_FAIL,
  DEACTIVATE_MATERIAL_SPEC_REQUEST,
  DEACTIVATE_MATERIAL_SPEC_SUCCESS,
  DEACTIVATE_MATERIAL_SPEC_FAIL
} from "./materialSpecConstants";

interface MaterialSpecState {
  loading: boolean;
  error: string | null;
  success?: boolean;
  materialSpecs?: any[];
  materialSpec?: any;
}

// Create Material Spec Reducer
const initialCreateState: MaterialSpecState = {
  loading: false,
  error: null,
  success: false,
};

export const materialSpecCreateReducer = (state = initialCreateState, action: any): MaterialSpecState => {
  switch (action.type) {
    case CREATE_MATERIAL_SPEC_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case CREATE_MATERIAL_SPEC_SUCCESS:
      return { ...state, loading: false, success: true };
    case CREATE_MATERIAL_SPEC_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Material Spec List Reducer
const initialListState = {
  materialSpecs: [],
  loading: false,
  error: null,
};

export const materialSpecListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case GET_MATERIAL_SPECS_REQUEST:
    case GET_MATERIAL_SPECS_BY_TYPE_REQUEST:
      return { ...state, loading: true };
    case GET_MATERIAL_SPECS_SUCCESS:
    case GET_MATERIAL_SPECS_BY_TYPE_SUCCESS:
      return { loading: false, materialSpecs: action.payload, error: null };
    case GET_MATERIAL_SPECS_FAIL:
    case GET_MATERIAL_SPECS_BY_TYPE_FAIL:
      return { loading: false, error: action.payload, materialSpecs: [] };
    default:
      return state;
  }
};

// Material Spec Detail Reducer
const initialDetailState: MaterialSpecState = {
  loading: false,
  error: null,
  materialSpec: null,
};

export const materialSpecDetailReducer = (state = initialDetailState, action: any): MaterialSpecState => {
  switch (action.type) {
    case GET_MATERIAL_SPEC_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_MATERIAL_SPEC_BY_ID_SUCCESS:
      return { ...state, loading: false, materialSpec: action.payload };
    case GET_MATERIAL_SPEC_BY_ID_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Material Spec Update Reducer
const initialUpdateState: MaterialSpecState = {
  loading: false,
  error: null,
  success: false,
};

export const materialSpecUpdateReducer = (
  state = initialUpdateState,
  action: any
): MaterialSpecState => {
  switch (action.type) {
    case UPDATE_MATERIAL_SPEC_REQUEST:
    case ACTIVATE_MATERIAL_SPEC_REQUEST:
    case DEACTIVATE_MATERIAL_SPEC_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case UPDATE_MATERIAL_SPEC_SUCCESS:
    case ACTIVATE_MATERIAL_SPEC_SUCCESS:
    case DEACTIVATE_MATERIAL_SPEC_SUCCESS:
      return { ...state, loading: false, success: true };
    case UPDATE_MATERIAL_SPEC_FAIL:
    case ACTIVATE_MATERIAL_SPEC_FAIL:
    case DEACTIVATE_MATERIAL_SPEC_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};

// Material Spec Delete Reducer
const initialDeleteState: MaterialSpecState = {
  loading: false,
  error: null,
  success: false,
};

export const materialSpecDeleteReducer = (
  state = initialDeleteState,
  action: any
): MaterialSpecState => {
  switch (action.type) {
    case DELETE_MATERIAL_SPEC_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case DELETE_MATERIAL_SPEC_SUCCESS:
      return { ...state, loading: false, success: true };
    case DELETE_MATERIAL_SPEC_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};
