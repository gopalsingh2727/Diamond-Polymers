/**
 * Alert Evaluator Utility
 * Evaluates alert conditions for ViewTemplate columns and display items
 *
 * Usage Examples:
 *
 * 1. For Self source (column's own value):
 *    const result = evaluateAlert(alert, columnValue);
 *
 * 2. For Option Spec source (e.g., weight from specification):
 *    const result = evaluateAlertWithSource(alert, rowData, optionTypes, columns);
 *    // Gets value from specified option type and spec field
 *
 * 3. For Formula source (calculated value):
 *    const result = evaluateAlertWithSource(alert, rowData, optionTypes, columns);
 *    // Calculates formula using row data and columns
 */

// Alert configuration types
export type AlertCondition =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'is_empty'
  | 'is_not_empty';

export type AlertSeverity = 'info' | 'warning' | 'error';
export type AlertSourceType = 'self' | 'optionSpec' | 'formula';
export type CompareValueType = 'static' | 'formula';

export interface AlertConfig {
  enabled: boolean;
  // Data source for alert evaluation
  sourceType?: AlertSourceType; // Where to get value from: self (column value), optionSpec, formula
  // Option Spec source fields
  optionTypeId?: string;
  optionTypeName?: string;
  specField?: string;
  specFieldUnit?: string;
  // Formula source
  formula?: {
    expression: string;
    dependencies: string[];
  };
  // Comparison
  condition: AlertCondition;
  // Compare value configuration
  compareValueType?: CompareValueType; // static (fixed value) or formula
  value: string | number;
  compareFormula?: {
    expression: string;
    dependencies: string[];
  };
  message: string;
  severity: AlertSeverity;
}

export interface AlertResult {
  triggered: boolean;
  message: string;
  severity: AlertSeverity;
  fieldLabel?: string;
  actualValue?: any;
  expectedValue?: any;
  sourceType?: AlertSourceType;
}

// Context for evaluating alerts with different sources
export interface AlertEvaluationContext {
  rowData: Record<string, any>; // Current row data (column name -> value)
  optionTypes: Array<{
    optionTypeId: string;
    optionTypeName: string;
    specs?: Record<string, any>;
    specificationValues?: Array<{ name: string; value: any; unit?: string }>;
  }>;
  columns: Array<{ name: string; label?: string }>;
}

/**
 * Get the value to evaluate based on alert source type
 */
export function getAlertValueFromSource(
  alert: AlertConfig,
  selfValue: any,
  context?: AlertEvaluationContext
): any {
  const sourceType = alert.sourceType || 'self';

  switch (sourceType) {
    case 'self':
      return selfValue;

    case 'optionSpec':
      if (!context || !alert.optionTypeId || !alert.specField) {
        return selfValue; // Fallback to self if context is missing
      }
      // Find the option type and get the spec field value
      const optionType = context.optionTypes.find(
        ot => ot.optionTypeId === alert.optionTypeId
      );
      if (optionType) {
        // Try getting from specificationValues array first
        if (optionType.specificationValues) {
          const specValue = optionType.specificationValues.find(
            sv => sv.name === alert.specField
          );
          if (specValue) {
            return specValue.value;
          }
        }
        // Try getting from specs object
        if (optionType.specs && optionType.specs[alert.specField] !== undefined) {
          return optionType.specs[alert.specField];
        }
      }
      return null;

    case 'formula':
      if (!context || !alert.formula?.expression) {
        return selfValue; // Fallback to self if context is missing
      }
      // Evaluate the formula expression
      return evaluateFormulaExpression(alert.formula.expression, context.rowData);

    default:
      return selfValue;
  }
}

/**
 * Evaluate a formula expression with row data
 * Expression format: {column_name} + {other_column} or {wt} - {tare}
 */
export function evaluateFormulaExpression(
  expression: string,
  rowData: Record<string, any>
): number | null {
  try {
    let formula = expression;
    const fieldMatches = expression.match(/\{([^}]+)\}/g) || [];

    for (const match of fieldMatches) {
      const fieldName = match.slice(1, -1); // Remove { and }
      const value = rowData[fieldName];

      if (value === null || value === undefined || value === '') {
        return null; // Can't calculate if any dependency is missing
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return null;
      }

      formula = formula.replace(match, String(numValue));
    }

    // Safe evaluation using Function (not eval)
    // Only allows basic math operations
    const safeFormula = formula.replace(/[^0-9+\-*/().]/g, '');
    if (safeFormula !== formula.replace(/\s/g, '')) {
      console.warn('Unsafe characters in formula:', expression);
      return null;
    }

    const result = Function(`"use strict"; return (${safeFormula})`)();
    return typeof result === 'number' && !isNaN(result) ? result : null;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return null;
  }
}

/**
 * Evaluate alert with source context
 * This is the main function to use when you have full context available
 */
export function evaluateAlertWithSource(
  alert: AlertConfig | undefined,
  selfValue: any,
  context: AlertEvaluationContext | undefined,
  fieldLabel?: string
): AlertResult {
  if (!alert || !alert.enabled) {
    return {
      triggered: false,
      message: '',
      severity: 'warning',
      fieldLabel,
      actualValue: selfValue
    };
  }

  // Get the value to evaluate based on source type
  const valueToEvaluate = getAlertValueFromSource(alert, selfValue, context);

  // Get the compare value (static or formula-based)
  let compareValue: any = alert.value;
  if (alert.compareValueType === 'formula' && alert.compareFormula?.expression && context?.rowData) {
    const formulaResult = evaluateFormulaExpression(alert.compareFormula.expression, context.rowData);
    if (formulaResult !== null) {
      compareValue = formulaResult;
    }
  }

  // Evaluate the condition with the computed compare value
  return evaluateAlertWithCompareValue(alert, valueToEvaluate, compareValue, fieldLabel);
}

/**
 * Evaluate alert with a custom compare value (for formula-based comparisons)
 *
 * @param alert - The alert configuration
 * @param currentValue - The current value to check
 * @param compareValue - The value to compare against (can be from formula)
 * @param fieldLabel - Optional label for the field
 * @returns AlertResult with triggered status and message
 */
export function evaluateAlertWithCompareValue(
  alert: AlertConfig | undefined,
  currentValue: any,
  compareValue: any,
  fieldLabel?: string
): AlertResult {
  // Default result - not triggered
  const defaultResult: AlertResult = {
    triggered: false,
    message: '',
    severity: 'warning',
    fieldLabel,
    actualValue: currentValue,
    sourceType: alert?.sourceType || 'self'
  };

  // If no alert config or not enabled, return default
  if (!alert || !alert.enabled) {
    return defaultResult;
  }

  const { condition, message, severity } = alert;
  let triggered = false;

  // Normalize values for comparison
  const normalizedCurrent = normalizeValue(currentValue);
  const normalizedExpected = normalizeValue(compareValue);

  // Evaluate condition
  switch (condition) {
    case 'equals':
      triggered = normalizedCurrent === normalizedExpected;
      break;

    case 'not_equals':
      triggered = normalizedCurrent !== normalizedExpected;
      break;

    case 'greater_than':
      triggered = Number(normalizedCurrent) > Number(normalizedExpected);
      break;

    case 'less_than':
      triggered = Number(normalizedCurrent) < Number(normalizedExpected);
      break;

    case 'greater_or_equal':
      triggered = Number(normalizedCurrent) >= Number(normalizedExpected);
      break;

    case 'less_or_equal':
      triggered = Number(normalizedCurrent) <= Number(normalizedExpected);
      break;

    case 'is_empty':
      triggered = isEmpty(currentValue);
      break;

    case 'is_not_empty':
      triggered = !isEmpty(currentValue);
      break;

    default:
      triggered = false;
  }

  // Generate message
  const alertMessage = message || generateDefaultMessage(fieldLabel, condition, compareValue, currentValue, alert.sourceType);

  return {
    triggered,
    message: alertMessage,
    severity: severity || 'warning',
    fieldLabel,
    actualValue: currentValue,
    expectedValue: compareValue,
    sourceType: alert.sourceType || 'self'
  };
}

/**
 * Evaluate if an alert should be triggered based on the current value
 *
 * @param alert - The alert configuration
 * @param currentValue - The current value to check (from optionSpec, formula, or customer)
 * @param fieldLabel - Optional label for the field (used in default messages)
 * @returns AlertResult with triggered status and message
 */
export function evaluateAlert(
  alert: AlertConfig | undefined,
  currentValue: any,
  fieldLabel?: string
): AlertResult {
  // Default result - not triggered
  const defaultResult: AlertResult = {
    triggered: false,
    message: '',
    severity: 'warning',
    fieldLabel,
    actualValue: currentValue,
    sourceType: alert?.sourceType || 'self'
  };

  // If no alert config or not enabled, return default
  if (!alert || !alert.enabled) {
    return defaultResult;
  }

  const { condition, value: expectedValue, message, severity } = alert;
  let triggered = false;

  // Normalize values for comparison
  const normalizedCurrent = normalizeValue(currentValue);
  const normalizedExpected = normalizeValue(expectedValue);

  // Evaluate condition
  switch (condition) {
    case 'equals':
      triggered = normalizedCurrent === normalizedExpected;
      break;

    case 'not_equals':
      triggered = normalizedCurrent !== normalizedExpected;
      break;

    case 'greater_than':
      triggered = Number(normalizedCurrent) > Number(normalizedExpected);
      break;

    case 'less_than':
      triggered = Number(normalizedCurrent) < Number(normalizedExpected);
      break;

    case 'greater_or_equal':
      triggered = Number(normalizedCurrent) >= Number(normalizedExpected);
      break;

    case 'less_or_equal':
      triggered = Number(normalizedCurrent) <= Number(normalizedExpected);
      break;

    case 'is_empty':
      triggered = isEmpty(currentValue);
      break;

    case 'is_not_empty':
      triggered = !isEmpty(currentValue);
      break;

    default:
      triggered = false;
  }

  // Generate message
  const alertMessage = message || generateDefaultMessage(fieldLabel, condition, expectedValue, currentValue, alert.sourceType);

  return {
    triggered,
    message: alertMessage,
    severity: severity || 'warning',
    fieldLabel,
    actualValue: currentValue,
    expectedValue,
    sourceType: alert.sourceType || 'self'
  };
}

/**
 * Evaluate multiple alerts for a row of data
 * Useful for checking all columns/display items at once
 */
export function evaluateRowAlerts(
  items: Array<{ label: string; alert?: AlertConfig; value: any }>,
  context?: AlertEvaluationContext
): AlertResult[] {
  return items
    .map(item => evaluateAlertWithSource(item.alert, item.value, context, item.label))
    .filter(result => result.triggered);
}

/**
 * Get the highest severity from multiple alerts
 */
export function getHighestSeverity(alerts: AlertResult[]): AlertSeverity {
  const severityOrder: AlertSeverity[] = ['info', 'warning', 'error'];
  let highest: AlertSeverity = 'info';

  for (const alert of alerts) {
    if (alert.triggered) {
      const currentIndex = severityOrder.indexOf(alert.severity);
      const highestIndex = severityOrder.indexOf(highest);
      if (currentIndex > highestIndex) {
        highest = alert.severity;
      }
    }
  }

  return highest;
}

/**
 * Get severity color for UI display
 */
export function getSeverityColor(severity: AlertSeverity): {
  background: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (severity) {
    case 'info':
      return {
        background: '#dbeafe',
        border: '#3b82f6',
        text: '#1e40af',
        icon: 'info'
      };
    case 'warning':
      return {
        background: '#fef3c7',
        border: '#f59e0b',
        text: '#92400e',
        icon: 'alert-triangle'
      };
    case 'error':
      return {
        background: '#fee2e2',
        border: '#ef4444',
        text: '#991b1b',
        icon: 'alert-circle'
      };
    default:
      return {
        background: '#f3f4f6',
        border: '#9ca3af',
        text: '#374151',
        icon: 'info'
      };
  }
}

/**
 * Get severity emoji for display
 */
export function getSeverityEmoji(severity: AlertSeverity): string {
  switch (severity) {
    case 'info':
      return 'ℹ️';
    case 'warning':
      return '⚠️';
    case 'error':
      return '🚨';
    default:
      return '📢';
  }
}

// Helper functions

function normalizeValue(value: any): string | number {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    // Try to parse as number if it looks like one
    const num = parseFloat(value);
    if (!isNaN(num) && value.trim() !== '') {
      return num;
    }
    return value.trim().toLowerCase();
  }
  return String(value).trim().toLowerCase();
}

function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (typeof value === 'number' && isNaN(value)) {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  return false;
}

function generateDefaultMessage(
  fieldLabel: string | undefined,
  condition: AlertCondition,
  expectedValue: any,
  actualValue: any,
  sourceType?: AlertSourceType
): string {
  const field = fieldLabel || 'Value';
  const sourcePrefix = sourceType === 'optionSpec' ? 'Spec ' : sourceType === 'formula' ? 'Calculated ' : '';

  switch (condition) {
    case 'equals':
      return `${sourcePrefix}${field} is equal to ${expectedValue}`;
    case 'not_equals':
      return `${sourcePrefix}${field} is not equal to ${expectedValue}`;
    case 'greater_than':
      return `${sourcePrefix}${field} (${actualValue}) is greater than ${expectedValue}`;
    case 'less_than':
      return `${sourcePrefix}${field} (${actualValue}) is less than ${expectedValue}`;
    case 'greater_or_equal':
      return `${sourcePrefix}${field} (${actualValue}) is greater than or equal to ${expectedValue}`;
    case 'less_or_equal':
      return `${sourcePrefix}${field} (${actualValue}) is less than or equal to ${expectedValue}`;
    case 'is_empty':
      return `${sourcePrefix}${field} is empty`;
    case 'is_not_empty':
      return `${sourcePrefix}${field} is not empty`;
    default:
      return `Alert triggered for ${sourcePrefix}${field}`;
  }
}

/**
 * Condition display labels for UI
 */
export const CONDITION_LABELS: Record<AlertCondition, string> = {
  equals: 'Equals (=)',
  not_equals: 'Not Equals (≠)',
  greater_than: 'Greater Than (>)',
  less_than: 'Less Than (<)',
  greater_or_equal: 'Greater or Equal (≥)',
  less_or_equal: 'Less or Equal (≤)',
  is_empty: 'Is Empty',
  is_not_empty: 'Is Not Empty'
};

/**
 * Severity display labels for UI
 */
export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: 'ℹ️ Info',
  warning: '⚠️ Warning',
  error: '🚨 Error'
};

/**
 * Source type display labels for UI
 */
export const SOURCE_TYPE_LABELS: Record<AlertSourceType, string> = {
  self: 'Column Value',
  optionSpec: 'Option Spec',
  formula: 'Formula'
};
