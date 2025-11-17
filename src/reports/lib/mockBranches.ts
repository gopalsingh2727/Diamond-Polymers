/**
 * Mock Branch Data
 * Sample branches for testing and development
 */

import { Branch } from '../redux/branches/branchTypes';

export const mockBranches: Branch[] = [
  {
    id: 'branch001',
    name: 'Mumbai Manufacturing Unit',
    code: 'BRC-001',
    location: 'Andheri East, Mumbai',
    region: 'Western',
    isActive: true,
    machineCount: 14,
    employeeCount: 45,
    createdAt: new Date('2020-01-15'),
  },
  {
    id: 'branch002',
    name: 'Delhi Production Center',
    code: 'BRC-002',
    location: 'Okhla Industrial Area, Delhi',
    region: 'Northern',
    isActive: true,
    machineCount: 12,
    employeeCount: 38,
    createdAt: new Date('2020-06-10'),
  },
  {
    id: 'branch003',
    name: 'Bangalore Tech Facility',
    code: 'BRC-003',
    location: 'Peenya Industrial Area, Bangalore',
    region: 'Southern',
    isActive: true,
    machineCount: 16,
    employeeCount: 52,
    createdAt: new Date('2021-03-22'),
  },
  {
    id: 'branch004',
    name: 'Pune Manufacturing Hub',
    code: 'BRC-004',
    location: 'Chakan Industrial Zone, Pune',
    region: 'Western',
    isActive: true,
    machineCount: 10,
    employeeCount: 32,
    createdAt: new Date('2021-09-05'),
  },
  {
    id: 'branch005',
    name: 'Ahmedabad Plant',
    code: 'BRC-005',
    location: 'Narol Industrial Area, Ahmedabad',
    region: 'Western',
    isActive: true,
    machineCount: 11,
    employeeCount: 35,
    createdAt: new Date('2022-02-18'),
  },
  {
    id: 'branch006',
    name: 'Hyderabad Facility (Inactive)',
    code: 'BRC-006',
    location: 'Balanagar Industrial Area, Hyderabad',
    region: 'Southern',
    isActive: false,
    machineCount: 0,
    employeeCount: 0,
    createdAt: new Date('2019-11-30'),
  },
];

// Export individual branches for quick access
export const mumbaiBranch = mockBranches[0];
export const delhiBranch = mockBranches[1];
export const bangaloreBranch = mockBranches[2];
export const puneBranch = mockBranches[3];
export const ahmedabadBranch = mockBranches[4];

// Helper function to get branch by ID
export const getBranchById = (branchId: string): Branch | undefined => {
  return mockBranches.find(branch => branch.id === branchId);
};

// Helper function to get branch by code
export const getBranchByCode = (code: string): Branch | undefined => {
  return mockBranches.find(branch => branch.code === code);
};

// Get active branches only
export const getActiveBranches = (): Branch[] => {
  return mockBranches.filter(branch => branch.isActive);
};

// Get branches by region
export const getBranchesByRegion = (region: string): Branch[] => {
  return mockBranches.filter(branch => branch.region === region);
};

// Get all regions
export const getAllRegions = (): string[] => {
  const regions = mockBranches.map(b => b.region);
  return Array.from(new Set(regions)).sort();
};

// Branch statistics
export const getBranchStatistics = () => {
  const active = mockBranches.filter(b => b.isActive);
  return {
    total: mockBranches.length,
    active: active.length,
    inactive: mockBranches.length - active.length,
    totalMachines: active.reduce((sum, b) => sum + b.machineCount, 0),
    totalEmployees: active.reduce((sum, b) => sum + b.employeeCount, 0),
    averageMachinesPerBranch: active.length > 0 
      ? Math.round(active.reduce((sum, b) => sum + b.machineCount, 0) / active.length) 
      : 0,
    averageEmployeesPerBranch: active.length > 0
      ? Math.round(active.reduce((sum, b) => sum + b.employeeCount, 0) / active.length)
      : 0,
  };
};
