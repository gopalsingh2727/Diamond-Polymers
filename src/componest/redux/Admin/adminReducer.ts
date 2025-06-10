import {
  CREATE_ADMIN_REQUEST,
  CREATE_ADMIN_SUCCESS,
  CREATE_ADMIN_FAIL,
} from './AdminActions';

const initialState = {
  loading: false,
  success: false,
  error: null,
};

export const adminCreateReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case CREATE_ADMIN_REQUEST:
      return { ...state, loading: true, success: false, error: null };

    case CREATE_ADMIN_SUCCESS:
      return { ...state, loading: false, success: true };

    case CREATE_ADMIN_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};