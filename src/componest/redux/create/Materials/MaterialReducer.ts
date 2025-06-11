import {
  CREATE_MATERIAL_REQUEST,
  CREATE_MATERIAL_SUCCESS,
  CREATE_MATERIAL_FAIL,
} from "./MaterialContants";

interface MaterialState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: MaterialState = {
  loading: false,
  success: false,
  error: null,
};

export const materialCreateReducer = (state = initialState, action: any): MaterialState => {
  switch (action.type) {
    case CREATE_MATERIAL_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case CREATE_MATERIAL_SUCCESS:
      return { ...state, loading: false, success: true };
    case CREATE_MATERIAL_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};