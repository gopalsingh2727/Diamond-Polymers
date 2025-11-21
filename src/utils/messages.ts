/**
 * Shared utility for consistent success/error messages across all components
 */

// Success message types
type ActionType = 'created' | 'updated' | 'deleted' | 'saved' | 'added';

/**
 * Generate a consistent success message for CRUD operations
 * @param entity - The entity name (e.g., 'Order type', 'Product', 'Machine')
 * @param action - The action performed (default: 'created')
 * @param additionalInfo - Optional additional info to append (e.g., ID)
 * @returns Formatted success message
 *
 * @example
 * successMessage('Order type') // "Order type created successfully!"
 * successMessage('Product', 'updated') // "Product updated successfully!"
 * successMessage('Order', 'created', 'Order ID: ORD-001') // "Order created successfully! Order ID: ORD-001"
 */
export const successMessage = (
  entity: string,
  action: ActionType = 'created',
  additionalInfo?: string
): string => {
  const base = `${entity} ${action} successfully!`;
  return additionalInfo ? `${base} ${additionalInfo}` : base;
};

/**
 * Generate a consistent error message for CRUD operations
 * @param entity - The entity name
 * @param action - The action that failed
 * @param error - Optional error details
 * @returns Formatted error message
 *
 * @example
 * errorMessage('Order type', 'create') // "Failed to create order type"
 * errorMessage('Product', 'update', 'Network error') // "Failed to update product: Network error"
 */
export const errorMessage = (
  entity: string,
  action: string,
  error?: string
): string => {
  const base = `Failed to ${action} ${entity.toLowerCase()}`;
  return error ? `${base}: ${error}` : base;
};

/**
 * Pre-defined entity names for consistency
 */
export const ENTITIES = {
  ORDER_TYPE: 'Order type',
  ORDER: 'Order',
  PRODUCT: 'Product',
  PRODUCT_SPEC: 'Product spec',
  MATERIAL: 'Material',
  MATERIAL_SPEC: 'Material spec',
  MACHINE: 'Machine',
  MACHINE_TYPE: 'Machine type',
  OPERATOR: 'Operator',
  FORMULA: 'Formula',
  STEP: 'Production step',
  ACCOUNT: 'Account',
  BRANCH: 'Branch',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
} as const;

/**
 * Quick success message generators for common entities
 */
export const messages = {
  orderType: {
    created: () => successMessage(ENTITIES.ORDER_TYPE),
    updated: () => successMessage(ENTITIES.ORDER_TYPE, 'updated'),
    deleted: () => successMessage(ENTITIES.ORDER_TYPE, 'deleted'),
  },
  order: {
    created: (orderId?: string) => successMessage(ENTITIES.ORDER, 'created', orderId ? `Order ID: ${orderId}` : undefined),
    updated: () => successMessage(ENTITIES.ORDER, 'updated'),
    deleted: () => successMessage(ENTITIES.ORDER, 'deleted'),
  },
  product: {
    created: () => successMessage(ENTITIES.PRODUCT),
    updated: () => successMessage(ENTITIES.PRODUCT, 'updated'),
    deleted: () => successMessage(ENTITIES.PRODUCT, 'deleted'),
  },
  productSpec: {
    created: () => successMessage(ENTITIES.PRODUCT_SPEC),
    updated: () => successMessage(ENTITIES.PRODUCT_SPEC, 'updated'),
    deleted: () => successMessage(ENTITIES.PRODUCT_SPEC, 'deleted'),
  },
  material: {
    created: () => successMessage(ENTITIES.MATERIAL),
    updated: () => successMessage(ENTITIES.MATERIAL, 'updated'),
    deleted: () => successMessage(ENTITIES.MATERIAL, 'deleted'),
  },
  materialSpec: {
    created: () => successMessage(ENTITIES.MATERIAL_SPEC),
    updated: () => successMessage(ENTITIES.MATERIAL_SPEC, 'updated'),
    deleted: () => successMessage(ENTITIES.MATERIAL_SPEC, 'deleted'),
  },
  machine: {
    created: () => successMessage(ENTITIES.MACHINE),
    updated: () => successMessage(ENTITIES.MACHINE, 'updated'),
    deleted: () => successMessage(ENTITIES.MACHINE, 'deleted'),
  },
  machineType: {
    created: () => successMessage(ENTITIES.MACHINE_TYPE),
    updated: () => successMessage(ENTITIES.MACHINE_TYPE, 'updated'),
    deleted: () => successMessage(ENTITIES.MACHINE_TYPE, 'deleted'),
  },
  operator: {
    created: () => successMessage(ENTITIES.OPERATOR),
    updated: () => successMessage(ENTITIES.OPERATOR, 'updated'),
    deleted: () => successMessage(ENTITIES.OPERATOR, 'deleted'),
  },
  formula: {
    created: () => successMessage(ENTITIES.FORMULA),
    updated: () => successMessage(ENTITIES.FORMULA, 'updated'),
    deleted: () => successMessage(ENTITIES.FORMULA, 'deleted'),
  },
  step: {
    created: () => successMessage(ENTITIES.STEP),
    updated: () => successMessage(ENTITIES.STEP, 'updated'),
    deleted: () => successMessage(ENTITIES.STEP, 'deleted'),
  },
  account: {
    created: () => successMessage(ENTITIES.ACCOUNT),
    updated: () => successMessage(ENTITIES.ACCOUNT, 'updated'),
    deleted: () => successMessage(ENTITIES.ACCOUNT, 'deleted'),
  },
  branch: {
    created: () => successMessage(ENTITIES.BRANCH),
    updated: () => successMessage(ENTITIES.BRANCH, 'updated'),
    deleted: () => successMessage(ENTITIES.BRANCH, 'deleted'),
  },
  admin: {
    created: () => successMessage(ENTITIES.ADMIN),
    updated: () => successMessage(ENTITIES.ADMIN, 'updated'),
    deleted: () => successMessage(ENTITIES.ADMIN, 'deleted'),
  },
  manager: {
    created: (branchName?: string) => successMessage(ENTITIES.MANAGER, 'created', branchName ? `for ${branchName}` : undefined),
    updated: () => successMessage(ENTITIES.MANAGER, 'updated'),
    deleted: () => successMessage(ENTITIES.MANAGER, 'deleted'),
  },
};

export default messages;