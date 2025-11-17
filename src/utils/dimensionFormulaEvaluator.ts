import { Parser } from 'expr-eval';

export interface Dimension {
  name: string;
  value: string | number | boolean;
  unit?: string;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  formula?: string;
  isCalculated?: boolean;
}

/**
 * Evaluates formulas in dimensions array (client-side)
 * Formulas can reference other dimensions by name
 * Dimensions are evaluated in order, so formulas can only reference earlier dimensions
 */
export function evaluateDimensionFormulas(dimensions: Dimension[]): Dimension[] {
  if (!dimensions || !Array.isArray(dimensions)) {
    return dimensions;
  }

  // Create a parser instance
  const parser = new Parser();

  // Context stores calculated dimension values that can be referenced by formulas
  const context: Record<string, number> = {};

  // Process each dimension in order
  for (let i = 0; i < dimensions.length; i++) {
    const dim = dimensions[i];

    // If dimension has a formula, calculate its value
    if (dim.formula && dim.formula.trim() !== '') {
      try {
        // Validate that formula only uses numbers for dimensions
        if (dim.dataType !== 'number') {
          throw new Error(`Formula can only be used with dataType 'number', but '${dim.name}' has dataType '${dim.dataType}'`);
        }

        // Parse and evaluate the formula with current context
        const expression = parser.parse(dim.formula);
        const result = expression.evaluate(context);

        // Validate result is a number
        if (typeof result !== 'number' || isNaN(result)) {
          throw new Error(`Formula '${dim.formula}' did not evaluate to a valid number (got: ${result})`);
        }

        // Update dimension with calculated value
        dim.value = result;
        dim.isCalculated = true;

      } catch (error: any) {
        throw new Error(`Formula error in dimension '${dim.name}': ${error.message}`);
      }
    } else {
      // Manual value - ensure isCalculated is false
      dim.isCalculated = false;
    }

    // Add this dimension's value to context for future formulas
    // Only add numeric values to context to prevent type errors
    if (dim.dataType === 'number' && dim.value !== null && dim.value !== undefined) {
      context[dim.name] = Number(dim.value);
    }
  }

  return dimensions;
}

/**
 * Validates that all dimension references in formulas exist and are defined before usage
 */
export function validateDimensionReferences(dimensions: Dimension[]): { valid: boolean; errors: string[] } {
  if (!dimensions || !Array.isArray(dimensions)) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];
  const availableDimensions = new Set<string>();

  // Create parser to extract variable names
  const parser = new Parser();

  for (let i = 0; i < dimensions.length; i++) {
    const dim = dimensions[i];

    // Check for duplicate dimension names
    if (availableDimensions.has(dim.name)) {
      errors.push(`Duplicate dimension name: '${dim.name}' at index ${i}`);
    }

    if (dim.formula && dim.formula.trim() !== '') {
      try {
        // Parse formula to extract variables
        const expression = parser.parse(dim.formula);
        const variables = expression.variables();

        // Check each variable is defined in earlier dimensions
        variables.forEach((varName: string) => {
          if (!availableDimensions.has(varName)) {
            errors.push(
              `Dimension '${dim.name}' formula references '${varName}' which is not defined or is defined later. ` +
              `Only dimensions defined earlier can be referenced.`
            );
          }
        });
      } catch (error: any) {
        errors.push(`Invalid formula syntax in dimension '${dim.name}': ${error.message}`);
      }
    }

    // Add this dimension to available dimensions
    availableDimensions.add(dim.name);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Quick validation for a single formula string
 * Used for testing formulas without full dimension context
 */
export function validateFormulaSyntax(
  formula: string,
  availableDimensions: string[] = []
): { valid: boolean; error: string | null } {
  if (!formula || formula.trim() === '') {
    return { valid: true, error: null };
  }

  try {
    const parser = new Parser();

    // Try to parse the formula
    const expression = parser.parse(formula);

    // Get variables used in formula
    const variables = expression.variables();

    // Check if all variables are in available dimensions
    const unavailable = variables.filter((v: string) => !availableDimensions.includes(v));
    if (unavailable.length > 0) {
      return {
        valid: false,
        error: `Formula references undefined dimensions: ${unavailable.join(', ')}`
      };
    }

    return { valid: true, error: null };

  } catch (error: any) {
    return {
      valid: false,
      error: `Invalid formula syntax: ${error.message}`
    };
  }
}

/**
 * Evaluates a single formula with given context (for preview)
 */
export function evaluateFormula(formula: string, context: Record<string, number>): number | null {
  if (!formula || formula.trim() === '') {
    return null;
  }

  try {
    const parser = new Parser();
    const expression = parser.parse(formula);
    const result = expression.evaluate(context);

    if (typeof result === 'number' && !isNaN(result)) {
      return result;
    }

    return null;
  } catch (error) {
    return null;
  }
}
