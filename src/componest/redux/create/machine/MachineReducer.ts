/**
 * DEPRECATED: This file redirects to v2 reducer
 */
import { machineV2Reducer } from '../../unifiedV2/unifiedV2Reducer';

// Export reducers matching old interface
export const machineCreateReducer = machineV2Reducer;
export const machineListReducer = machineV2Reducer;
export const machineDetailReducer = machineV2Reducer;
export const machineUpdateReducer = machineV2Reducer;
export const machineDeleteReducer = machineV2Reducer;
