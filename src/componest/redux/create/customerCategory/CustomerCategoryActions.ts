/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/customerCategoryActions' directly
 */
export * from '../../unifiedV2/customerCategoryActions';

// Legacy aliases for backward compatibility
export {
  createCustomerCategoryV2 as createCustomerCategory,
  getCustomerCategoriesV2 as getCustomerCategories,
  getCustomerCategoryV2 as getCustomerCategoryById,
  updateCustomerCategoryV2 as updateCustomerCategory,
  deleteCustomerCategoryV2 as deleteCustomerCategory,
} from '../../unifiedV2/customerCategoryActions';
