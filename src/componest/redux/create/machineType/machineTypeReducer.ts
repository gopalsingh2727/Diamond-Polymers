/**
 * DEPRECATED: This file redirects to v2 reducer
 */
import { machineTypeV2Reducer } from '../../unifiedV2/unifiedV2Reducer';

// Export reducers matching old interface
export const machineTypeCreateReducer = machineTypeV2Reducer;
export const machineTypeListReducer = machineTypeV2Reducer;
export const machineTypeUpdateReducer = machineTypeV2Reducer;
export const machineTypeDeleteReducer = machineTypeV2Reducer;
