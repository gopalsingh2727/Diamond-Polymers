/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../unifiedV2/optionActions' directly
 */
export * from '../unifiedV2/optionActions';

// Legacy aliases for backward compatibility
export {
  createOptionV2 as createOption,
  getOptionsV2 as getAllOptions,
  getOptionsV2 as getOptions,
  getOptionV2 as getOptionById,
  updateOptionV2 as updateOption,
  deleteOptionV2 as deleteOption,
} from '../unifiedV2/optionActions';
