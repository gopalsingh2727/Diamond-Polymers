import {
  CREATE_STEP_REQUEST,
  CREATE_STEP_SUCCESS,
  CREATE_STEP_FAIL,
  GET_STEPS_REQUEST,
  GET_STEPS_SUCCESS,
  GET_STEPS_FAIL,
  UPDATE_STEP_REQUEST,
  UPDATE_STEP_SUCCESS,
  UPDATE_STEP_FAIL,
  DELETE_STEP_REQUEST,
  DELETE_STEP_SUCCESS,
  DELETE_STEP_FAIL,
} from "./StpeContants";

// CREATE
interface StepCreateState {
  loading: boolean;
  success: boolean;
  error: string | null;
}
const createInitial: StepCreateState = {
  loading: false,
  success: false,
  error: null,
};
export const stepCreateReducer = (
  state = createInitial,
  action: any
): StepCreateState => {
  switch (action.type) {
    case CREATE_STEP_REQUEST:
      return { loading: true, success: false, error: null };
    case CREATE_STEP_SUCCESS:
      return { loading: false, success: true, error: null };
    case CREATE_STEP_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// GET (List)
interface StepListState {
  loading: boolean;
  steps: any[];
  error: string | null;
}
const listInitial: StepListState = {
  loading: false,
  steps: [],
  error: null,
};
export const stepListReducer = (
  state = listInitial,
  action: any
): StepListState => {
  switch (action.type) {
    case GET_STEPS_REQUEST:
      return { ...state, loading: true };
    case GET_STEPS_SUCCESS:
      return { loading: false, steps: action.payload, error: null };
    case GET_STEPS_FAIL:
      return { loading: false, steps: [], error: action.payload };
    default:
      return state;
  }
};

// UPDATE
interface StepUpdateState {
  loading: boolean;
  success: boolean;
  error: string | null;
}
const updateInitial: StepUpdateState = {
  loading: false,
  success: false,
  error: null,
};
export const stepUpdateReducer = (
  state = updateInitial,
  action: any
): StepUpdateState => {
  switch (action.type) {
    case UPDATE_STEP_REQUEST:
      return { loading: true, success: false, error: null };
    case UPDATE_STEP_SUCCESS:
      return { loading: false, success: true, error: null };
    case UPDATE_STEP_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// DELETE
interface StepDeleteState {
  loading: boolean;
  success: boolean;
  error: string | null;
}
const deleteInitial: StepDeleteState = {
  loading: false,
  success: false,
  error: null,
};
export const stepDeleteReducer = (
  state = deleteInitial,
  action: any
): StepDeleteState => {
  switch (action.type) {
    case DELETE_STEP_REQUEST:
      return { loading: true, success: false, error: null };
    case DELETE_STEP_SUCCESS:
      return { loading: false, success: true, error: null };
    case DELETE_STEP_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};