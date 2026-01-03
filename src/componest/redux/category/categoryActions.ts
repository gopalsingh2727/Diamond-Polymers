/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../unifiedV2/categoryActions' directly
 */
export * from '../unifiedV2/categoryActions';

// Legacy aliases for backward compatibility
export {
  createCategoryV2 as createCategory,
  getCategoriesV2 as getAllCategories,
  getCategoriesV2 as getCategories,
  getCategoryV2 as getCategoryById,
  updateCategoryV2 as updateCategory,
  deleteCategoryV2 as deleteCategory,
} from '../unifiedV2/categoryActions';
