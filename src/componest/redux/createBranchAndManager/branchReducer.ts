import {
  BRANCH_CREATE_REQUEST,
  BRANCH_CREATE_SUCCESS,
  BRANCH_CREATE_FAIL,
} from "./branchConstants";

export const branchCreateReducer = (state = {}, action: any) => {
  switch (action.type) {
    case BRANCH_CREATE_REQUEST:
      return {...state, loading: true };
    case BRANCH_CREATE_SUCCESS:
      return { ...state,loading: false, success: true, branch: action.payload };
    case BRANCH_CREATE_FAIL:
      return { ...state,loading: false, error: action.payload };
    default:
      return state;
  }
};