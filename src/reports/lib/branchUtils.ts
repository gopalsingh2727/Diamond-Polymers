/**
 * Branch Utility Functions
 * Helper functions for filtering and managing branch-related data
 */

import { Branch } from '../redux/branches/branchTypes';

// Filter interface for objects with branchId
interface BranchFilterable {
  branchId: string;
  [key: string]: any;
}

/**
 * Filter array of items by branch ID
 * If branchId is null, returns all items (All Branches)
 */
export function filterByBranch<T extends BranchFilterable>(
  items: T[],
  selectedBranchId: string | null
): T[] {
  if (selectedBranchId === null) {
    return items; // Return all items when "All Branches" is selected
  }
  return items.filter(item => item.branchId === selectedBranchId);
}

/**
 * Group items by branch
 */
export function groupByBranch<T extends BranchFilterable>(
  items: T[]
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const branchId = item.branchId;
    if (!acc[branchId]) {
      acc[branchId] = [];
    }
    acc[branchId].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Get count of items per branch
 */
export function getCountByBranch<T extends BranchFilterable>(
  items: T[]
): Record<string, number> {
  return items.reduce((acc, item) => {
    const branchId = item.branchId;
    acc[branchId] = (acc[branchId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Filter items by multiple branch IDs
 */
export function filterByBranches<T extends BranchFilterable>(
  items: T[],
  branchIds: string[]
): T[] {
  if (branchIds.length === 0) {
    return items; // Return all if no branches specified
  }
  return items.filter(item => branchIds.includes(item.branchId));
}

/**
 * Get branch summary statistics for a dataset
 */
export function getBranchSummary<T extends BranchFilterable>(
  items: T[],
  branches: Branch[]
): {
  branchId: string;
  branchName: string;
  branchCode: string;
  count: number;
  percentage: number;
}[] {
  const totalCount = items.length;
  const countByBranch = getCountByBranch(items);

  return branches.map(branch => ({
    branchId: branch.id,
    branchName: branch.name,
    branchCode: branch.code,
    count: countByBranch[branch.id] || 0,
    percentage: totalCount > 0 ? ((countByBranch[branch.id] || 0) / totalCount) * 100 : 0,
  }));
}

/**
 * Check if item belongs to selected branch
 */
export function isBranchMatch(
  item: BranchFilterable,
  selectedBranchId: string | null
): boolean {
  if (selectedBranchId === null) {
    return true; // All branches
  }
  return item.branchId === selectedBranchId;
}

/**
 * Get branch name by ID
 */
export function getBranchName(
  branchId: string,
  branches: Branch[]
): string {
  const branch = branches.find(b => b.id === branchId);
  return branch ? branch.name : 'Unknown Branch';
}

/**
 * Get branch code by ID
 */
export function getBranchCode(
  branchId: string,
  branches: Branch[]
): string {
  const branch = branches.find(b => b.id === branchId);
  return branch ? branch.code : 'N/A';
}

/**
 * Filter and aggregate data by branch
 */
export function aggregateByBranch<T extends BranchFilterable, R>(
  items: T[],
  branches: Branch[],
  aggregator: (items: T[]) => R
): {
  branchId: string;
  branchName: string;
  branchCode: string;
  data: R;
}[] {
  const grouped = groupByBranch(items);

  return branches.map(branch => ({
    branchId: branch.id,
    branchName: branch.name,
    branchCode: branch.code,
    data: aggregator(grouped[branch.id] || []),
  }));
}

/**
 * Sort branches by a specific criteria
 */
export function sortBranches(
  branches: Branch[],
  sortBy: 'name' | 'code' | 'region' | 'machineCount' | 'employeeCount' = 'code',
  order: 'asc' | 'desc' = 'asc'
): Branch[] {
  const sorted = [...branches].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'code':
        comparison = a.code.localeCompare(b.code);
        break;
      case 'region':
        comparison = a.region.localeCompare(b.region);
        break;
      case 'machineCount':
        comparison = a.machineCount - b.machineCount;
        break;
      case 'employeeCount':
        comparison = a.employeeCount - b.employeeCount;
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Format branch display name
 */
export function formatBranchDisplay(
  branch: Branch,
  format: 'full' | 'code' | 'name' | 'code-name' = 'code-name'
): string {
  switch (format) {
    case 'full':
      return `${branch.code} - ${branch.name} (${branch.location})`;
    case 'code':
      return branch.code;
    case 'name':
      return branch.name;
    case 'code-name':
    default:
      return `${branch.code} - ${branch.name}`;
  }
}

/**
 * Get active branch count
 */
export function getActiveBranchCount(branches: Branch[]): number {
  return branches.filter(b => b.isActive).length;
}

/**
 * Get branch by region
 */
export function getBranchesByRegion(
  branches: Branch[],
  region: string
): Branch[] {
  return branches.filter(b => b.region === region);
}

/**
 * Get all unique regions from branches
 */
export function getUniqueRegions(branches: Branch[]): string[] {
  const regions = branches.map(b => b.region);
  return Array.from(new Set(regions)).sort();
}

/**
 * Calculate total metrics across branches
 */
export function calculateBranchTotals(branches: Branch[]): {
  totalMachines: number;
  totalEmployees: number;
  totalBranches: number;
  activeBranches: number;
} {
  const activeBranches = branches.filter(b => b.isActive);

  return {
    totalMachines: activeBranches.reduce((sum, b) => sum + b.machineCount, 0),
    totalEmployees: activeBranches.reduce((sum, b) => sum + b.employeeCount, 0),
    totalBranches: branches.length,
    activeBranches: activeBranches.length,
  };
}
