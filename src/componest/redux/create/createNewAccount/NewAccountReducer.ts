import {
  CREATE_ACCOUNT_REQUEST,
  CREATE_ACCOUNT_SUCCESS,
  CREATE_ACCOUNT_FAIL,
  GET_ACCOUNTS_REQUEST,
  GET_ACCOUNTS_SUCCESS,
  GET_ACCOUNTS_FAIL,
  UPDATE_ACCOUNT_REQUEST,
  UPDATE_ACCOUNT_SUCCESS,
  UPDATE_ACCOUNT_FAIL,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAIL,
} from "./NewAccountConstants";

// Types
interface Account {
  _id: string;
  username: string;
  [key: string]: any;
}

interface AccountState {
  loading: boolean;
  success?: boolean;
  error?: string | null;
  accounts?: Account[];
  updatedAccount?: Account;
  deletedAccountId?: string;
  createdAccount?: Account;
}

// ✅ Create Account Reducer
export const createAccountReducer = (
  state: AccountState = { loading: false },
  action: any
): AccountState => {
  switch (action.type) {
    case CREATE_ACCOUNT_REQUEST:
      return { loading: true };
    case CREATE_ACCOUNT_SUCCESS:
      return { loading: false, success: true, createdAccount: action.payload };
    case CREATE_ACCOUNT_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// ✅ Get All Accounts Reducer
export const getAccountsReducer = (
  state: AccountState = { loading: false, accounts: [] },
  action: any
): AccountState => {
  switch (action.type) {
    case GET_ACCOUNTS_REQUEST:
      return { ...state, loading: true };
    case GET_ACCOUNTS_SUCCESS:
      return { loading: false, accounts: action.payload };
    case GET_ACCOUNTS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// ✅ Update Account Reducer
export const updateAccountReducer = (
  state: AccountState = { loading: false },
  action: any
): AccountState => {
  switch (action.type) {
    case UPDATE_ACCOUNT_REQUEST:
      return { loading: true };
    case UPDATE_ACCOUNT_SUCCESS:
      return { loading: false, success: true, updatedAccount: action.payload };
    case UPDATE_ACCOUNT_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

// ✅ Delete Account Reducer
export const deleteAccountReducer = (
  state: AccountState = { loading: false },
  action: any
): AccountState => {
  switch (action.type) {
    case DELETE_ACCOUNT_REQUEST:
      return { loading: true };
    case DELETE_ACCOUNT_SUCCESS:
      return { loading: false, success: true, deletedAccountId: action.payload };
    case DELETE_ACCOUNT_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};