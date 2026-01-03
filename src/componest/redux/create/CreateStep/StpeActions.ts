/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/stepActions' directly
 */
export * from '../../unifiedV2/stepActions';

// Legacy aliases for backward compatibility
export {
  createStepV2 as createStep,
  getStepsV2 as getSteps,
  getStepV2 as getStepById,
  updateStepV2 as updateStep,
  deleteStepV2 as deleteStep,
} from '../../unifiedV2/stepActions';
