import {
  CREATE_ACCOUNT_REQUEST,
  CREATE_ACCOUNT_SUCCESS,
  CREATE_ACCOUNT_FAIL,
} from './NewAccountConstants';

const initialState = {
  loading: false,
  customer: null,
  error: null,
};

export const accountReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case CREATE_ACCOUNT_REQUEST:
      return { ...state, loading: true, error: null };

    case CREATE_ACCOUNT_SUCCESS:
      return { ...state, loading: false, customer: action.payload };

    case CREATE_ACCOUNT_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};