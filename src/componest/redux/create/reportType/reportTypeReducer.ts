/**
 * DEPRECATED: This file redirects to v2 reducer
 */
import { reportTypeV2Reducer } from '../../unifiedV2/unifiedV2Reducer';

// Export reducers matching old interface
export const reportTypeListReducer = reportTypeV2Reducer;
export const reportTypeDetailReducer = reportTypeV2Reducer;
export const defaultReportTypeReducer = reportTypeV2Reducer;
export const reportTypeCreateReducer = reportTypeV2Reducer;
export const reportTypeUpdateReducer = reportTypeV2Reducer;
export const reportTypeDeleteReducer = reportTypeV2Reducer;
export const generatedReportReducer = reportTypeV2Reducer;
