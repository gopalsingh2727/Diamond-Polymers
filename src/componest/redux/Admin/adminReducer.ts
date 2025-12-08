import {
  CREATE_ADMIN_REQUEST,
  CREATE_ADMIN_SUCCESS,
  CREATE_ADMIN_FAIL,
  ADMIN_LIST_REQUEST,
  ADMIN_LIST_SUCCESS,
  ADMIN_LIST_FAIL,
  ADMIN_UPDATE_REQUEST,
  ADMIN_UPDATE_SUCCESS,
  ADMIN_UPDATE_FAIL,
  ADMIN_DELETE_REQUEST,
  ADMIN_DELETE_SUCCESS,
  ADMIN_DELETE_FAIL,
} from './AdminActions';

const initialCreateState = {
  loading: false,
  success: false,
  error: null,
};

export const adminCreateReducer = (state = initialCreateState, action: any) => {
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

const initialListState = {
  loading: false,
  error: null,
  admins: [],
};

export const adminListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case ADMIN_LIST_REQUEST:
      return { ...state, loading: true };
    case ADMIN_LIST_SUCCESS:
      return { ...state, loading: false, admins: action.payload };
    case ADMIN_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const initialUpdateState = {
  loading: false,
  error: null,
  success: false,
};

export const adminUpdateReducer = (state = initialUpdateState, action: any) => {
  switch (action.type) {
    case ADMIN_UPDATE_REQUEST:
      return { ...state, loading: true, success: false };
    case ADMIN_UPDATE_SUCCESS:
      return { ...state, loading: false, success: true };
    case ADMIN_UPDATE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};

const initialDeleteState = {
  loading: false,
  error: null,
  success: false,
};

export const adminDeleteReducer = (state = initialDeleteState, action: any) => {
  switch (action.type) {
    case ADMIN_DELETE_REQUEST:
      return { ...state, loading: true, success: false };
    case ADMIN_DELETE_SUCCESS:
      return { ...state, loading: false, success: true };
    case ADMIN_DELETE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};
