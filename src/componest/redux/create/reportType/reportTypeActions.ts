/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/reportTypeActions' directly
 */
export * from '../../unifiedV2/reportTypeActions';

// Legacy aliases for backward compatibility
export {
  createReportTypeV2 as createReportType,
  getReportTypesV2 as getReportTypes,
  getReportTypeV2 as getReportTypeById,
  updateReportTypeV2 as updateReportType,
  deleteReportTypeV2 as deleteReportType,
} from '../../unifiedV2/reportTypeActions';
