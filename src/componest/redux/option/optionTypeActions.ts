/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../unifiedV2/optionTypeActions' directly
 */
export * from '../unifiedV2/optionTypeActions';

// Legacy aliases for backward compatibility
export {
  createOptionTypeV2 as createOptionType,
  getOptionTypesV2 as getAllOptionTypes,
  getOptionTypesV2 as getOptionTypes,
  getOptionTypeV2 as getOptionTypeById,
  updateOptionTypeV2 as updateOptionType,
  deleteOptionTypeV2 as deleteOptionType,
} from '../unifiedV2/optionTypeActions';
