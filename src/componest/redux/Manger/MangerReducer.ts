import {
  MANAGER_CREATE_REQUEST,
  MANAGER_CREATE_SUCCESS,
  MANAGER_CREATE_FAIL,
  MANAGER_GET_ALL_REQUEST,
  MANAGER_GET_ALL_SUCCESS,
  MANAGER_GET_ALL_FAIL,
  MANAGER_UPDATE_REQUEST,
  MANAGER_UPDATE_SUCCESS,
  MANAGER_UPDATE_FAIL,
  MANAGER_DELETE_REQUEST,
  MANAGER_DELETE_SUCCESS,
  MANAGER_DELETE_FAIL,
} from './MangerContants';

const initialCreateState = {
  loading: false,
  error: null,
  success: false,
  manager: null,
};

export const managerCreateReducer = (state = initialCreateState, action: any) => {
  switch (action.type) {
    case MANAGER_CREATE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case MANAGER_CREATE_SUCCESS:
      return { ...state, loading: false, success: true, manager: action.payload };
    case MANAGER_CREATE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};

const initialListState = {
  loading: false,
  error: null,
  managers: [],
};

export const managerListReducer = (state = initialListState, action: any) => {
  switch (action.type) {
    case MANAGER_GET_ALL_REQUEST:
      return { ...state, loading: true };
    case MANAGER_GET_ALL_SUCCESS:
      return { ...state, loading: false, managers: action.payload };
    case MANAGER_GET_ALL_FAIL:
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

export const managerUpdateReducer = (state = initialUpdateState, action: any) => {
  switch (action.type) {
    case MANAGER_UPDATE_REQUEST:
      return { ...state, loading: true, success: false };
    case MANAGER_UPDATE_SUCCESS:
      return { ...state, loading: false, success: true };
    case MANAGER_UPDATE_FAIL:
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

export const managerDeleteReducer = (state = initialDeleteState, action: any) => {
  switch (action.type) {
    case MANAGER_DELETE_REQUEST:
      return { ...state, loading: true, success: false };
    case MANAGER_DELETE_SUCCESS:
      return { ...state, loading: false, success: true };
    case MANAGER_DELETE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};