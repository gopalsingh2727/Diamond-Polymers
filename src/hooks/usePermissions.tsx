/**
 * usePermissions Hook
 * Check user permissions for entities and actions
 *
 * Usage:
 * const { canCreate, canRead, canUpdate, canDelete, hasPermission } = usePermissions('orders');
 * const { canRead: canReadReports } = usePermissions('reports');
 *
 * // In JSX
 * {canCreate && <button>Create Order</button>}
 */

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Permission action types
type CRUDAction = 'create' | 'read' | 'update' | 'delete';
type ReadOnlyAction = 'read';
type ReadUpdateAction = 'read' | 'update';

// Entity types with their allowed actions
type CRUDEntity =
  | 'orders'
  | 'accounts'
  | 'customerCategory'
  | 'parentCompany'
  | 'machines'
  | 'machineType'
  | 'machineOperator'
  | 'step'
  | 'categories'
  | 'optionType'
  | 'optionSpec'
  | 'options'
  | 'orderType'
  | 'printType'
  | 'excelExportType'
  | 'reportType'
  | 'template'
  | 'deviceAccess'
  | 'inventory';

type ReadOnlyEntity = 'daybook' | 'reports';
type ReadUpdateEntity = 'dispatch';

type Entity = CRUDEntity | ReadOnlyEntity | ReadUpdateEntity;

// Permission object structure
interface CRUDPermission {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
}

interface UserPermissions {
  [key: string]: CRUDPermission | { read?: boolean } | { read?: boolean; update?: boolean };
}

interface UsePermissionsReturn {
  // Individual permission checks
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  // Generic permission checker
  hasPermission: (action: string) => boolean;

  // Check any permission for multiple entities
  hasAnyPermission: (entities: Entity[], action?: string) => boolean;

  // User role info
  role: string | null;
  isEmployee: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isMasterAdmin: boolean;

  // Full access (non-employee roles)
  hasFullAccess: boolean;
}

/**
 * Hook to check user permissions
 * @param entity - The entity to check permissions for (orders, accounts, machines, etc.)
 */
export const usePermissions = (entity?: Entity): UsePermissionsReturn => {
  const auth = useSelector((state: RootState) => state.auth);

  return useMemo(() => {
    const user = auth?.userData;
    const role = user?.role?.toLowerCase() || null;

    // Role checks
    const isEmployee = role === 'employee';
    const isManager = role === 'manager';
    const isAdmin = role === 'admin';
    const isMasterAdmin = role === 'master_admin';

    // Non-employee roles have full access
    const hasFullAccess = !isEmployee && (isMasterAdmin || isAdmin || isManager);

    // Get permissions object
    const permissions: UserPermissions = user?.permissions || {};

    // Get entity-specific permissions
    const entityPermissions = entity ? permissions[entity] : null;

    // Permission checker function
    const hasPermission = (action: string): boolean => {
      // Non-employee roles have full access
      if (hasFullAccess) return true;

      // Employee must have explicit permission
      if (!isEmployee || !entity || !entityPermissions) return false;

      return (entityPermissions as any)[action] === true;
    };

    // Check if user has any permission for multiple entities
    const hasAnyPermission = (entities: Entity[], action: string = 'read'): boolean => {
      if (hasFullAccess) return true;

      for (const ent of entities) {
        const entPerms = permissions[ent];
        if (entPerms && (entPerms as any)[action] === true) {
          return true;
        }
      }
      return false;
    };

    return {
      canCreate: hasPermission('create'),
      canRead: hasPermission('read'),
      canUpdate: hasPermission('update'),
      canDelete: hasPermission('delete'),
      hasPermission,
      hasAnyPermission,
      role,
      isEmployee,
      isManager,
      isAdmin,
      isMasterAdmin,
      hasFullAccess,
    };
  }, [auth, entity]);
};

/**
 * Check if user can manage employees
 * master_admin, admin, and manager can manage employees
 */
export const useCanManageEmployees = (): boolean => {
  const auth = useSelector((state: RootState) => state.auth);
  const role = auth?.userData?.role?.toLowerCase();
  return role === 'master_admin' || role === 'admin' || role === 'manager';
};

/**
 * Check if user can access payroll
 * master_admin, admin, and manager can access payroll
 */
export const useCanAccessPayroll = (): boolean => {
  const auth = useSelector((state: RootState) => state.auth);
  const role = auth?.userData?.role?.toLowerCase();
  return role === 'master_admin' || role === 'admin' || role === 'manager';
};

/**
 * Get all permissions for the current user
 * Useful for debugging or displaying in admin panels
 */
export const useAllPermissions = () => {
  const auth = useSelector((state: RootState) => state.auth);

  return useMemo(() => {
    const user = auth?.userData;
    const role = user?.role?.toLowerCase();

    if (role !== 'employee') {
      // Non-employees have full access
      return {
        isFullAccess: true,
        role,
        permissions: null,
      };
    }

    return {
      isFullAccess: false,
      role,
      permissions: user?.permissions || {},
    };
  }, [auth]);
};

/**
 * Higher-order component to wrap components with permission checks
 * Usage:
 * export default withPermission(MyComponent, 'orders', 'create');
 */
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  entity: Entity,
  action: CRUDAction | ReadOnlyAction | ReadUpdateAction
): React.FC<P> => {
  return (props: P) => {
    const { hasPermission } = usePermissions(entity);

    if (!hasPermission(action)) {
      return null; // Or return an access denied message
    }

    return <Component {...props} />;
  };
};

export default usePermissions;
