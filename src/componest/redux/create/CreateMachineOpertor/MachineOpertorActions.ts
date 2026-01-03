/**
 * DEPRECATED: This file redirects to v2 API
 * Use imports from '../../unifiedV2/operatorActions' directly
 */
export * from '../../unifiedV2/operatorActions';

// Legacy aliases for backward compatibility
export {
  createOperatorV2 as createOperator,
  getOperatorsV2 as listOperators,
  getOperatorsV2 as getOperators,
  getOperatorV2 as getOperatorById,
  updateOperatorV2 as updateOperator,
  deleteOperatorV2 as deleteOperator,
} from '../../unifiedV2/operatorActions';
