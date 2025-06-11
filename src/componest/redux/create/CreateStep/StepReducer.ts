import {
  CREATE_STEP_REQUEST,
  CREATE_STEP_SUCCESS,
  CREATE_STEP_FAIL,
} from "./StpeContants";

interface StepState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: StepState = {
  loading: false,
  success: false,
  error: null,
};

export const stepCreateReducer = (
  state = initialState,
  action: any
): StepState => {
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
