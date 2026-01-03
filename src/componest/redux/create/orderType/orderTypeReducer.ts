/**
 * DEPRECATED: This file redirects to v2 reducer
 */
import { orderTypeV2Reducer } from '../../unifiedV2/unifiedV2Reducer';

// Export reducers matching old interface
export const orderTypeListReducer = orderTypeV2Reducer;
export const orderTypeDetailReducer = orderTypeV2Reducer;
export const defaultOrderTypeReducer = orderTypeV2Reducer;
export const orderTypeCreateReducer = orderTypeV2Reducer;
