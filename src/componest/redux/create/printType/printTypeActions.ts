/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/printTypeActions' directly
 */
export * from '../../unifiedV2/printTypeActions';

// Legacy aliases for backward compatibility
export {
  createPrintTypeV2 as createPrintType,
  getPrintTypesV2 as getPrintTypes,
  getPrintTypeV2 as getPrintTypeById,
  updatePrintTypeV2 as updatePrintType,
  deletePrintTypeV2 as deletePrintType,
  getPrintTypesByOrderTypeV2 as getPrintTypesByOrderType,
} from '../../unifiedV2/printTypeActions';
