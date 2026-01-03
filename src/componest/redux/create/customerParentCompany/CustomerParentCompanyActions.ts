/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/parentCompanyActions' directly
 */
export * from '../../unifiedV2/parentCompanyActions';

// Legacy aliases for backward compatibility
export {
  createParentCompanyV2 as createCustomerParentCompany,
  getParentCompaniesV2 as getCustomerParentCompanies,
  getParentCompanyV2 as getCustomerParentCompanyById,
  updateParentCompanyV2 as updateCustomerParentCompany,
  deleteParentCompanyV2 as deleteCustomerParentCompany,
} from '../../unifiedV2/parentCompanyActions';
