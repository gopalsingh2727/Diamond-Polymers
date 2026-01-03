/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/orderTypeActions' directly
 */
export * from '../../unifiedV2/orderTypeActions';

// Legacy aliases for backward compatibility
export {
  createOrderTypeV2 as createOrderType,
  getOrderTypesV2 as getOrderTypes,
  getOrderTypeV2 as getOrderTypeById,
  updateOrderTypeV2 as updateOrderType,
  deleteOrderTypeV2 as deleteOrderType,
} from '../../unifiedV2/orderTypeActions';
