/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/machineActions' directly
 */
export * from '../../unifiedV2/machineActions';

// Legacy aliases for backward compatibility
export {
  createMachineV2 as createMachine,
  getMachinesV2 as getMachines,
  getMachineV2 as getMachineById,
  updateMachineV2 as updateMachine,
  deleteMachineV2 as deleteMachine,
} from '../../unifiedV2/machineActions';
