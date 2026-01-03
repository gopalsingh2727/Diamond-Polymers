/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../unifiedV2/deviceAccessActions' directly
 */
export * from '../unifiedV2/deviceAccessActions';

// Legacy aliases for backward compatibility
export {
  createDeviceAccessV2 as createDeviceAccess,
  getDeviceAccessListV2 as getDeviceAccessList,
  getDeviceAccessV2 as getDeviceAccessById,
  updateDeviceAccessV2 as updateDeviceAccess,
  deleteDeviceAccessV2 as deleteDeviceAccess,
  resetDeviceAccessStateV2 as resetDeviceAccessState,
} from '../unifiedV2/deviceAccessActions';
