/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/accountActions' directly
 */
export * from '../../unifiedV2/accountActions';

// Legacy aliases for backward compatibility
export {
  createAccountV2 as createAccount,
  getAccountsV2 as getAccounts,
  getAccountV2 as getAccountById,
  updateAccountV2 as updateAccount,
  deleteAccountV2 as deleteAccount,
} from '../../unifiedV2/accountActions';
