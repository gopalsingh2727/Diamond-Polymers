/**
 * Dimension Context Builder Utility
 *
 * Builds a merged dimension context from Product Spec and Material Spec
 * for use in machine operator view formula calculations.
 */

import { Parser } from 'expr-eval';

export interface Dimension {
  name: string;
  value: any;
  unit?: string;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  formula?: string;
  isCalculated?: boolean;
}

export interface ProductSpec {
  _id: string;
  specName: string;
  dimensions: Dimension[];
}

export interface MaterialSpec {
  _id: string;
  specName: string;
  mol?: number;
  weightPerPiece?: number;
  density?: number;
  dimensions: Dimension[];
}

export interface MachineCalculation {
  name: string;
  displayName: string;
  formula: string;
  unit?: string;
  description?: string;
}

export interface DimensionContext {
  [key: string]: number | string | boolean | Date;
}

/**
 * Extract dimensions from Product Spec based on dimension names
 */
export const extractProductDimensions = (
  productSpec: ProductSpec | null,
  dimensionNames: string[]
): DimensionContext => {
  const context: DimensionContext = {};

  if (!productSpec || !productSpec.dimensions) {
    return context;
  }

  dimensionNames.forEach(dimName => {
    const dimension = productSpec.dimensions.find(d => d.name === dimName);
    if (dimension) {
      context[dimName] = dimension.value;
    }
  });

  return context;
};

/**
 * Extract dimensions from Material Spec based on dimension names
 */
export const extractMaterialDimensions = (
  materialSpec: MaterialSpec | null,
  dimensionNames: string[]
): DimensionContext => {
  const context: DimensionContext = {};

  if (!materialSpec) {
    return context;
  }

  // Include top-level properties
  dimensionNames.forEach(dimName => {
    if (dimName === 'mol' && materialSpec.mol !== undefined) {
      context[dimName] = materialSpec.mol;
    } else if (dimName === 'weightPerPiece' && materialSpec.weightPerPiece !== undefined) {
      context[dimName] = materialSpec.weightPerPiece;
    } else if (dimName === 'density' && materialSpec.density !== undefined) {
      context[dimName] = materialSpec.density;
    } else if (materialSpec.dimensions) {
      // Check in dimensions array
      const dimension = materialSpec.dimensions.find(d => d.name === dimName);
      if (dimension) {
        context[dimName] = dimension.value;
      }
    }
  });

  return context;
};

/**
 * Merge product and material dimensions into a single context
 */
export const buildDimensionContext = (
  productSpec: ProductSpec | null,
  materialSpec: MaterialSpec | null,
  productDimensionNames: string[],
  materialDimensionNames: string[]
): DimensionContext => {
  const productContext = extractProductDimensions(productSpec, productDimensionNames);
  const materialContext = extractMaterialDimensions(materialSpec, materialDimensionNames);

  // Merge both contexts
  return {
    ...productContext,
    ...materialContext
  };
};

/**
 * Evaluate a single calculation using the dimension context
 */
export const evaluateCalculation = (
  calculation: MachineCalculation,
  context: DimensionContext
): { success: boolean; value?: number; error?: string } => {
  try {
    const parser = new Parser();
    const expr = parser.parse(calculation.formula);

    // Evaluate the expression with the context
    const result = expr.evaluate(context);

    // Check if result is a valid number
    if (typeof result === 'number' && !isNaN(result)) {
      return { success: true, value: result };
    } else {
      return { success: false, error: 'Formula did not return a valid number' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Formula evaluation failed' };
  }
};

/**
 * Evaluate all machine calculations
 */
export const evaluateAllCalculations = (
  calculations: MachineCalculation[],
  context: DimensionContext
): Record<string, { value?: number; error?: string; unit?: string; displayName: string }> => {
  const results: Record<string, { value?: number; error?: string; unit?: string; displayName: string }> = {};

  calculations.forEach(calc => {
    const evalResult = evaluateCalculation(calc, context);

    results[calc.name] = {
      displayName: calc.displayName,
      unit: calc.unit,
      ...(evalResult.success
        ? { value: evalResult.value }
        : { error: evalResult.error })
    };
  });

  return results;
};

/**
 * Format a dimension value for display
 */
export const formatDimensionValue = (value: any, unit?: string): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (typeof value === 'number') {
    // Format numbers with appropriate precision
    const formatted = value % 1 === 0 ? value.toString() : value.toFixed(4);
    return unit ? `${formatted} ${unit}` : formatted;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  return String(value) + (unit ? ` ${unit}` : '');
};

/**
 * Get dimension info from specs for display
 */
export const getDimensionInfo = (
  dimensionName: string,
  productSpec: ProductSpec | null,
  materialSpec: MaterialSpec | null
): { value: any; unit?: string; source: 'product' | 'material' | 'none' } => {
  // Check product spec first
  if (productSpec && productSpec.dimensions) {
    const productDim = productSpec.dimensions.find(d => d.name === dimensionName);
    if (productDim) {
      return {
        value: productDim.value,
        unit: productDim.unit,
        source: 'product'
      };
    }
  }

  // Check material spec
  if (materialSpec) {
    // Check top-level properties
    if (dimensionName === 'mol' && materialSpec.mol !== undefined) {
      return { value: materialSpec.mol, source: 'material' };
    }
    if (dimensionName === 'weightPerPiece' && materialSpec.weightPerPiece !== undefined) {
      return { value: materialSpec.weightPerPiece, unit: 'g', source: 'material' };
    }
    if (dimensionName === 'density' && materialSpec.density !== undefined) {
      return { value: materialSpec.density, unit: 'g/cm³', source: 'material' };
    }

    // Check dimensions array
    if (materialSpec.dimensions) {
      const materialDim = materialSpec.dimensions.find(d => d.name === dimensionName);
      if (materialDim) {
        return {
          value: materialDim.value,
          unit: materialDim.unit,
          source: 'material'
        };
      }
    }
  }

  return { value: null, source: 'none' };
};
