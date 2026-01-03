/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/machineTypeActions' directly
 */
export * from '../../unifiedV2/machineTypeActions';

// Legacy aliases for backward compatibility
export {
  createMachineTypeV2 as createMachineType,
  createMachineTypeV2 as addMachineType,
  getMachineTypesV2 as getMachineTypes,
  getMachineTypesV2 as getAllMachineTypes,
  getMachineTypeV2 as getMachineTypeById,
  updateMachineTypeV2 as updateMachineType,
  deleteMachineTypeV2 as deleteMachineType,
} from '../../unifiedV2/machineTypeActions';
