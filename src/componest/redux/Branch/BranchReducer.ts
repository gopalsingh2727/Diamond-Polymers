// src/redux/branches/branchReducer.ts

import {
  FETCH_BRANCHES_REQUEST,
  FETCH_BRANCHES_SUCCESS,
  FETCH_BRANCHES_FAIL,
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
  lastFetched: string | null; // ✅ NEW: Track when branches were last fetched
}

// ✅ NEW: Load branches from localStorage on initial load
const loadBranchesFromStorage = (): Branch[] => {
  try {
    const cached = localStorage.getItem('cached_branches');
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.branches || [];
    }
  } catch (error) {
    console.error('Failed to load branches from localStorage:', error);
  }
  return [];
};

const initialState: BranchState = {
  loading: false,
  error: null,
  branches: loadBranchesFromStorage(), // ✅ Load from cache on init
  selectedBranch: null,
  lastFetched: null,
};

export const branchReducer = (state = initialState, action: any): BranchState => {
  switch (action.type) {
    case FETCH_BRANCHES_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_BRANCHES_SUCCESS:
      // ✅ Save branches to localStorage
      try {
        localStorage.setItem('cached_branches', JSON.stringify({
          branches: action.payload,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Failed to cache branches:', error);
      }
      return {
        ...state,
        loading: false,
        branches: action.payload,
        lastFetched: new Date().toISOString()
      };

    case FETCH_BRANCHES_FAIL:
      return { ...state, loading: false, error: action.payload };

    // ✅ Clear branches on logout
    case 'LOGOUT':
    case 'CLEAR_ORDER_FORM_DATA':
      try {
        localStorage.removeItem('cached_branches');
      } catch (error) {
        console.error('Failed to clear branch cache:', error);
      }
      return {
        loading: false,
        error: null,
        branches: [],
        selectedBranch: null,
        lastFetched: null,
      };

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