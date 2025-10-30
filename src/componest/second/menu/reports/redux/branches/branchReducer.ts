/**
 * Branch Redux Reducer
 * Manages branch state
 */

import { BranchState, BranchAction, BRANCH_ACTION_TYPES } from './branchTypes';

const initialState: BranchState = {
  branches: [],
  selectedBranchId: null, // null = "All Branches"
  loading: false,
  error: null,
};

export const branchReducer = (
  state = initialState,
  action: BranchAction
): BranchState => {
  switch (action.type) {
    case BRANCH_ACTION_TYPES.SET_BRANCHES:
      return {
        ...state,
        branches: action.payload,
      };

    case BRANCH_ACTION_TYPES.SET_SELECTED_BRANCH:
      return {
        ...state,
        selectedBranchId: action.payload,
        error: null, // Clear error on successful selection
      };

    case BRANCH_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case BRANCH_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case BRANCH_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
