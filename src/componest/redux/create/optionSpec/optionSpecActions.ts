/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/optionSpecActions' directly
 */
export * from '../../unifiedV2/optionSpecActions';

// Legacy aliases for backward compatibility
export {
  createOptionSpecV2 as createOptionSpec,
  getOptionSpecsV2 as getOptionSpecs,
  getOptionSpecV2 as getOptionSpecById,
  updateOptionSpecV2 as updateOptionSpec,
  deleteOptionSpecV2 as deleteOptionSpec,
} from '../../unifiedV2/optionSpecActions';
