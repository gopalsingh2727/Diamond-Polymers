/**
 * DEPRECATED: This file redirects to v2 reducer
 */
import { accountV2Reducer } from '../../unifiedV2/unifiedV2Reducer';

// Export reducers matching old interface
export const createAccountReducer = accountV2Reducer;
export const getAccountsReducer = accountV2Reducer;
export const updateAccountReducer = accountV2Reducer;
export const deleteAccountReducer = accountV2Reducer;
