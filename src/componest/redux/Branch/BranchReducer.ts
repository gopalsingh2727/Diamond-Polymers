// src/redux/branches/branchReducer.ts

import {
  FETCH_BRANCHES_REQUEST,
  FETCH_BRANCHES_SUCCESS,
  FETCH_BRANCHES_FAIL,
  SELECT_BRANCH_REQUEST,
  SELECT_BRANCH_SUCCESS,
  SELECT_BRANCH_FAIL,
  BRANCH_LIST_REQUEST,
  BRANCH_LIST_SUCCESS,
  BRANCH_LIST_FAIL,
} from "./BranchActions";

export interface Branch {
  id: number;
  name: string;
}


export interface BranchState {
  loading: boolean;
  error: string | null;
  branches: Branch[];
  selectedBranch: Branch | null;
}

const initialState: BranchState = {
  loading: false,
  error: null,
  branches: [],
  selectedBranch: null,
};

export const branchReducer = (state = initialState, action: any): BranchState => {
  switch (action.type) {
    case FETCH_BRANCHES_REQUEST:
    case SELECT_BRANCH_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_BRANCHES_SUCCESS:
      return { ...state, loading: false, branches: action.payload };

    case SELECT_BRANCH_SUCCESS:
      return { ...state, loading: false, selectedBranch: action.payload };

    case FETCH_BRANCHES_FAIL:
    case SELECT_BRANCH_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export const branchListReducer = (state = initialState, action: any): BranchState => {
  switch (action.type) {
    case BRANCH_LIST_REQUEST:
      return { ...state, loading: true };

    case BRANCH_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        branches: action.payload,
        error: null,
      };

    case BRANCH_LIST_FAIL:
      return {
        ...state,
        loading: false,
        branches: [],
        error: action.payload,
      };

    default:
      return state;
  }
};