/**
 * DEPRECATED: This file redirects to v2 reducer
 */
import { customerCategoryV2Reducer } from '../../unifiedV2/unifiedV2Reducer';

// Export reducers matching old interface
export const createCustomerCategoryReducer = customerCategoryV2Reducer;
export const getCustomerCategoriesReducer = customerCategoryV2Reducer;
export const updateCustomerCategoryReducer = customerCategoryV2Reducer;
export const deleteCustomerCategoryReducer = customerCategoryV2Reducer;
