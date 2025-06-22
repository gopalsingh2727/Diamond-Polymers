import {
  CREATE_MATERIAL_REQUEST,
  CREATE_MATERIAL_SUCCESS,
  CREATE_MATERIAL_FAIL,
  GET_MATERIALS_REQUEST,
  GET_MATERIALS_SUCCESS,
  GET_MATERIALS_FAIL,
  UPDATE_MATERIAL_REQUEST,
  UPDATE_MATERIAL_SUCCESS,
  UPDATE_MATERIAL_FAIL,
  DELETE_MATERIAL_REQUEST,
  DELETE_MATERIAL_SUCCESS,
  DELETE_MATERIAL_FAIL,
} from "./MaterialContants";

// -------------------- CREATE --------------------
interface MaterialCreateState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const createInitialState: MaterialCreateState = {
  loading: false,
  success: false,
  error: null,
};

export const materialCreateReducer = (
  state = createInitialState,
  action: any
): MaterialCreateState => {
  switch (action.type) {
    case CREATE_MATERIAL_REQUEST:
      return { loading: true, success: false, error: null };
    case CREATE_MATERIAL_SUCCESS:
      return { loading: false, success: true, error: null };
    case CREATE_MATERIAL_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// -------------------- GET --------------------
interface MaterialListState {
  materials: any[];
  loading: boolean;
  error: string | null;
}

const listInitialState: MaterialListState = {
  materials: [],
  loading: false,
  error: null,
};

export const materialListReducer = (
  state = listInitialState,
  action: any
): MaterialListState => {
  switch (action.type) {
    case GET_MATERIALS_REQUEST:
      return { ...state, loading: true };
    case GET_MATERIALS_SUCCESS:
      return { loading: false, materials: action.payload, error: null };
    case GET_MATERIALS_FAIL:
      return { loading: false, materials: [], error: action.payload };
    default:
      return state;
  }
};

// -------------------- UPDATE --------------------
interface MaterialUpdateState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const updateInitialState: MaterialUpdateState = {
  loading: false,
  success: false,
  error: null,
};

export const materialUpdateReducer = (
  state = updateInitialState,
  action: any
): MaterialUpdateState => {
  switch (action.type) {
    case UPDATE_MATERIAL_REQUEST:
      return { loading: true, success: false, error: null };
    case UPDATE_MATERIAL_SUCCESS:
      return { loading: false, success: true, error: null };
    case UPDATE_MATERIAL_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// -------------------- DELETE --------------------
interface MaterialDeleteState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const deleteInitialState: MaterialDeleteState = {
  loading: false,
  success: false,
  error: null,
};

export const materialDeleteReducer = (
  state = deleteInitialState,
  action: any
): MaterialDeleteState => {
  switch (action.type) {
    case DELETE_MATERIAL_REQUEST:
      return { loading: true, success: false, error: null };
    case DELETE_MATERIAL_SUCCESS:
      return { loading: false, success: true, error: null };
    case DELETE_MATERIAL_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};