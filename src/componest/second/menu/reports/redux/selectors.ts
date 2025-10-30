/**
 * Redux Selectors
 * Memoized selectors for efficient state access with branch filtering
 */

import { RootState } from './rootReducer';
import { filterByBranch, getBranchSummary } from '../lib/branchUtils';

// ============================================
// Input Selectors
// ============================================

// Branch selectors
const selectSelectedBranchId = (state: RootState) => state.branches.selectedBranchId;
const selectBranches = (state: RootState) => state.branches.branches;

// Report selectors
const selectAllOrders = (state: RootState) => state.reports.orders.orders;
const selectAllMachines = (state: RootState) => state.reports.machines.machines;
const selectAllCustomers = (state: RootState) => state.reports.customers.customers;

// Filter selectors
const selectStatusFilter = (state: RootState) => state.reports.filters.statusFilter;
const selectPriorityFilter = (state: RootState) => state.reports.filters.priorityFilter;
const selectMachineTypeFilter = (state: RootState) => state.reports.filters.machineTypeFilter;
const selectMaterialTypeFilter = (state: RootState) => state.reports.filters.materialTypeFilter;
const selectDateRange = (state: RootState) => state.reports.filters.dateRange;

// ============================================
// Branch-Filtered Selectors
// ============================================

/**
 * Get orders filtered by selected branch
 * Returns all orders if no branch is selected
 */
export const selectBranchOrders = (state: RootState) => {
  const orders = selectAllOrders(state);
  const branchId = selectSelectedBranchId(state);
  return filterByBranch(orders, branchId);
};

/**
 * Get machines filtered by selected branch
 */
export const selectBranchMachines = (state: RootState) => {
  const machines = selectAllMachines(state);
  const branchId = selectSelectedBranchId(state);
  return filterByBranch(machines, branchId);
};

/**
 * Get customers filtered by selected branch
 */
export const selectBranchCustomers = (state: RootState) => {
  const customers = selectAllCustomers(state);
  const branchId = selectSelectedBranchId(state);
  return filterByBranch(customers, branchId);
};

// ============================================
// Combined Filter Selectors
// ============================================

/**
 * Get orders filtered by branch, status, and priority
 */
export const selectFilteredOrders = (state: RootState) => {
  let orders = selectBranchOrders(state);
  const status = selectStatusFilter(state);
  const priority = selectPriorityFilter(state);
  const dateRange = selectDateRange(state);
  
  // Filter by status
  if (status && status !== 'all') {
    orders = orders.filter(o => o.overallStatus === status);
  }
  
  // Filter by priority
  if (priority && priority !== 'all') {
    orders = orders.filter(o => o.priority === priority);
  }
  
  // Filter by date range
  if (dateRange) {
    orders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= dateRange.from && orderDate <= dateRange.to;
    });
  }
  
  return orders;
};

/**
 * Get machines filtered by branch and type
 */
export const selectFilteredMachines = (state: RootState) => {
  let machines = selectBranchMachines(state);
  const machineType = selectMachineTypeFilter(state);
  
  if (machineType && machineType !== 'all') {
    machines = machines.filter(m => m.type === machineType);
  }
  
  return machines;
};

// ============================================
// Statistics Selectors
// ============================================

/**
 * Get order statistics for selected branch
 */
export const selectBranchOrderStats = (state: RootState) => {
  const orders = selectBranchOrders(state);
  
  return {
    total: orders.length,
    completed: orders.filter(o => o.overallStatus === 'completed').length,
    pending: orders.filter(o => o.overallStatus === 'pending').length,
    inProgress: orders.filter(o => o.overallStatus === 'in_progress').length,
    dispatched: orders.filter(o => o.overallStatus === 'dispatched').length,
    cancelled: orders.filter(o => o.overallStatus === 'cancelled').length,
    waitingApproval: orders.filter(o => o.overallStatus === 'Wait for Approval').length,
  };
};

/**
 * Get machine statistics for selected branch
 */
export const selectBranchMachineStats = (state: RootState) => {
  const machines = selectBranchMachines(state);
  
  return {
    total: machines.length,
    active: machines.filter(m => m.status === 'active').length,
    inactive: machines.filter(m => m.status === 'inactive').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
    utilizationRate: machines.length > 0
      ? machines.reduce((sum, m) => sum + m.utilizationRate, 0) / machines.length
      : 0,
    totalProduction: machines.reduce((sum, m) => sum + m.totalProduction, 0),
  };
};

/**
 * Get customer statistics for selected branch
 */
export const selectBranchCustomerStats = (state: RootState) => {
  const customers = selectBranchCustomers(state);
  
  return {
    total: customers.length,
    totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
    totalCompleted: customers.reduce((sum, c) => sum + c.completedOrders, 0),
    totalPending: customers.reduce((sum, c) => sum + c.pendingOrders, 0),
    totalProduction: customers.reduce((sum, c) => sum + c.totalProduction, 0),
  };
};

/**
 * Get production statistics for selected branch
 */
export const selectBranchProductionStats = (state: RootState) => {
  const orders = selectBranchOrders(state);
  
  const totalNetWeight = orders.reduce((sum, o) => sum + (o.realTimeData?.totalNetWeight || 0), 0);
  const totalWastage = orders.reduce((sum, o) => sum + (o.realTimeData?.totalWastage || 0), 0);
  const totalCost = orders.reduce((sum, o) => sum + (o.realTimeData?.totalCost || 0), 0);
  
  const ordersWithEfficiency = orders.filter(o => o.realTimeData?.overallEfficiency > 0);
  const avgEfficiency = ordersWithEfficiency.length > 0
    ? ordersWithEfficiency.reduce((sum, o) => sum + o.realTimeData.overallEfficiency, 0) / ordersWithEfficiency.length
    : 0;
  
  return {
    totalOrders: orders.length,
    totalNetWeight,
    totalWastage,
    totalCost,
    avgEfficiency,
    wastagePercentage: totalNetWeight > 0 ? (totalWastage / totalNetWeight) * 100 : 0,
  };
};

/**
 * Get financial statistics for selected branch
 */
export const selectBranchFinancialStats = (state: RootState) => {
  const orders = selectBranchOrders(state);
  
  return {
    totalRevenue: orders.reduce((sum, o) => sum + (o.financial?.finalPrice || 0), 0),
    totalCost: orders.reduce((sum, o) => sum + (o.financial?.actualCost || 0), 0),
    totalProfit: orders.reduce((sum, o) => {
      const revenue = o.financial?.finalPrice || 0;
      const cost = o.financial?.actualCost || 0;
      return sum + (revenue - cost);
    }, 0),
    materialCost: orders.reduce((sum, o) => sum + (o.financial?.materialCost || 0), 0),
    laborCost: orders.reduce((sum, o) => sum + (o.financial?.laborCost || 0), 0),
    overheadCost: orders.reduce((sum, o) => sum + (o.financial?.overheadCost || 0), 0),
  };
};

// ============================================
// Priority & Status Breakdown Selectors
// ============================================

/**
 * Get order count by priority
 */
export const selectOrdersByPriority = (state: RootState) => {
  const orders = selectBranchOrders(state);
  
  return {
    low: orders.filter(o => o.priority === 'low').length,
    normal: orders.filter(o => o.priority === 'normal').length,
    high: orders.filter(o => o.priority === 'high').length,
    urgent: orders.filter(o => o.priority === 'urgent').length,
  };
};

/**
 * Get order count by status
 */
export const selectOrdersByStatus = (state: RootState) => {
  const orders = selectBranchOrders(state);
  
  return {
    pending: orders.filter(o => o.overallStatus === 'pending').length,
    in_progress: orders.filter(o => o.overallStatus === 'in_progress').length,
    completed: orders.filter(o => o.overallStatus === 'completed').length,
    dispatched: orders.filter(o => o.overallStatus === 'dispatched').length,
    cancelled: orders.filter(o => o.overallStatus === 'cancelled').length,
    wait_for_approval: orders.filter(o => o.overallStatus === 'Wait for Approval').length,
  };
};

/**
 * Get machines by type
 */
export const selectMachinesByType = (state: RootState) => {
  const machines = selectBranchMachines(state);
  
  // Group by type
  const byType: Record<string, number> = {};
  machines.forEach(machine => {
    byType[machine.type] = (byType[machine.type] || 0) + 1;
  });
  
  return byType;
};

// ============================================
// Branch Comparison Selectors
// ============================================

/**
 * Get order summary for all branches
 */
export const selectBranchOrderSummary = (state: RootState) => {
  const orders = selectAllOrders(state);
  const branches = selectBranches(state);
  
  return getBranchSummary(orders, branches);
};

/**
 * Get machine summary for all branches
 */
export const selectBranchMachineSummary = (state: RootState) => {
  const machines = selectAllMachines(state);
  const branches = selectBranches(state);
  
  return getBranchSummary(machines, branches);
};

/**
 * Get customer summary for all branches
 */
export const selectBranchCustomerSummary = (state: RootState) => {
  const customers = selectAllCustomers(state);
  const branches = selectBranches(state);
  
  return getBranchSummary(customers, branches);
};

// ============================================
// Material Type Selectors
// ============================================

/**
 * Get unique material types from filtered orders
 */
export const selectMaterialTypes = (state: RootState) => {
  const orders = selectBranchOrders(state);
  const materialTypes = orders.map(o => o.materialType);
  return Array.from(new Set(materialTypes)).sort();
};

/**
 * Get orders filtered by material type
 */
export const selectOrdersByMaterialType = (state: RootState) => {
  const orders = selectBranchOrders(state);
  const materialFilter = selectMaterialTypeFilter(state);
  
  if (!materialFilter || materialFilter === 'all') {
    return orders;
  }
  
  return orders.filter(o => o.materialType === materialFilter);
};

// ============================================
// Date Range Selectors
// ============================================

/**
 * Get orders within date range
 */
export const selectOrdersInDateRange = (state: RootState) => {
  const orders = selectBranchOrders(state);
  const dateRange = selectDateRange(state);
  
  if (!dateRange) {
    return orders;
  }
  
  return orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= dateRange.from && orderDate <= dateRange.to;
  });
};

// ============================================
// Top Performers Selectors
// ============================================

/**
 * Get top customers by order count
 */
export const selectTopCustomers = (state: RootState, limit: number = 5) => {
  const customers = selectBranchCustomers(state);
  
  return [...customers]
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, limit);
};

/**
 * Get top performing machines
 */
export const selectTopMachines = (state: RootState, limit: number = 5) => {
  const machines = selectBranchMachines(state);
  
  return [...machines]
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, limit);
};

// ============================================
// Loading & Error Selectors
// ============================================

/**
 * Check if any report is loading
 */
export const selectIsAnyReportLoading = (state: RootState) => {
  return (
    state.reports.overview.loading ||
    state.reports.orders.loading ||
    state.reports.production.loading ||
    state.reports.machines.loading ||
    state.reports.customers.loading ||
    state.branches.loading
  );
};

/**
 * Get all errors
 */
export const selectAllErrors = (state: RootState) => {
  const errors = [];
  
  if (state.reports.overview.error) errors.push(state.reports.overview.error);
  if (state.reports.orders.error) errors.push(state.reports.orders.error);
  if (state.reports.production.error) errors.push(state.reports.production.error);
  if (state.reports.machines.error) errors.push(state.reports.machines.error);
  if (state.reports.customers.error) errors.push(state.reports.customers.error);
  if (state.branches.error) errors.push(state.branches.error);
  
  return errors;
};

// ============================================
// Export all selectors
// ============================================

export default {
  // Branch-filtered data
  selectBranchOrders,
  selectBranchMachines,
  selectBranchCustomers,
  
  // Combined filters
  selectFilteredOrders,
  selectFilteredMachines,
  
  // Statistics
  selectBranchOrderStats,
  selectBranchMachineStats,
  selectBranchCustomerStats,
  selectBranchProductionStats,
  selectBranchFinancialStats,
  
  // Breakdowns
  selectOrdersByPriority,
  selectOrdersByStatus,
  selectMachinesByType,
  
  // Branch comparisons
  selectBranchOrderSummary,
  selectBranchMachineSummary,
  selectBranchCustomerSummary,
  
  // Material types
  selectMaterialTypes,
  selectOrdersByMaterialType,
  
  // Date range
  selectOrdersInDateRange,
  
  // Top performers
  selectTopCustomers,
  selectTopMachines,
  
  // UI state
  selectIsAnyReportLoading,
  selectAllErrors,
};
