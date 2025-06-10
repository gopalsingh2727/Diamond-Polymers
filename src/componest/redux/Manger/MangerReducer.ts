// In your managerReducer.ts
import {
  MANAGER_CREATE_REQUEST,
  MANAGER_CREATE_SUCCESS,
  MANAGER_CREATE_FAIL,
} from './MangerContants';

const initialState = {
  loading: false,
  error: null,
  success: false,
  manager: null,
};

export const managerCreateReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case MANAGER_CREATE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
      
    case MANAGER_CREATE_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        success: true, 
        manager: action.payload,
        error: null 
      };
      
    case MANAGER_CREATE_FAIL:
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        success: false 
      };
      
    default:
      return state;
  }
};