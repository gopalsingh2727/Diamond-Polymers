/**
 * Branch Redux Types
 * Type definitions for branch state management
 */

// Branch Interface
export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  region: string;
  isActive: boolean;
  machineCount: number;
  employeeCount: number;
  createdAt: Date;
}

// Branch State
export interface BranchState {
  branches: Branch[];
  selectedBranchId: string | null; // null means "All Branches"
  loading: boolean;
  error: string | null;
}

// Action Types
export const BRANCH_ACTION_TYPES = {
  SET_BRANCHES: 'branches/SET_BRANCHES',
  SET_SELECTED_BRANCH: 'branches/SET_SELECTED_BRANCH',
  SET_LOADING: 'branches/SET_LOADING',
  SET_ERROR: 'branches/SET_ERROR',
  CLEAR_ERROR: 'branches/CLEAR_ERROR',
} as const;

// Action Interfaces
export interface SetBranchesAction {
  type: typeof BRANCH_ACTION_TYPES.SET_BRANCHES;
  payload: Branch[];
}

export interface SetSelectedBranchAction {
  type: typeof BRANCH_ACTION_TYPES.SET_SELECTED_BRANCH;
  payload: string | null;
}

export interface SetLoadingAction {
  type: typeof BRANCH_ACTION_TYPES.SET_LOADING;
  payload: boolean;
}

export interface SetErrorAction {
  type: typeof BRANCH_ACTION_TYPES.SET_ERROR;
  payload: string;
}

export interface ClearErrorAction {
  type: typeof BRANCH_ACTION_TYPES.CLEAR_ERROR;
}

// Union type for all branch actions
export type BranchAction =
  | SetBranchesAction
  | SetSelectedBranchAction
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction;
