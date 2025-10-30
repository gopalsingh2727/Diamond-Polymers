/**
 * BRANCH INTEGRATION EXAMPLES
 * Complete examples showing how to use branch filtering in your reports
 */

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { loadBranches, changeBranch } from './redux/branches/branchActions';
import {
  selectBranches,
  selectSelectedBranchId,
  selectSelectedBranch,
  selectActiveBranches,
  selectBranchStats,
} from './redux/branches/branchSelectors';
import { BranchSelector, CompactBranchSelector, RegionBranchSelector } from './components/BranchSelector';
import { filterByBranch, getBranchSummary, groupByBranch } from './lib/branchUtils';
import { mockOrders, mockMachines, mockCustomers } from './lib/mockData';

// ============================================
// EXAMPLE 1: Basic Branch Selector Usage
// ============================================

export function BasicBranchExample() {
  return (
    <div className="p-6 space-y-4">
      <h2>Branch Selection</h2>
      
      {/* Simple branch selector */}
      <BranchSelector 
        showAllOption={true}
        activeOnly={true}
        onBranchChange={(branchId) => {
          console.log('Selected branch:', branchId);
        }}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 2: Filter Orders by Branch
// ============================================

export function FilteredOrdersExample() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const selectedBranch = useAppSelector(selectSelectedBranch);
  
  // Filter orders based on selected branch
  const filteredOrders = filterByBranch(mockOrders, selectedBranchId);
  
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2>Orders Report</h2>
        <BranchSelector />
      </div>
      
      <div className="bg-blue-50 p-4 rounded">
        <p>
          Showing {filteredOrders.length} orders from{' '}
          {selectedBranch ? selectedBranch.name : 'All Branches'}
        </p>
      </div>
      
      <div className="space-y-2">
        {filteredOrders.map(order => (
          <div key={order._id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between">
              <span className="font-medium">{order.orderId}</span>
              <span className="text-sm text-slate-600">{order.customerName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Branch-Specific Dashboard
// ============================================

export function BranchDashboard() {
  const dispatch = useAppDispatch();
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const selectedBranch = useAppSelector(selectSelectedBranch);
  
  // Load branches on mount
  useEffect(() => {
    dispatch(loadBranches());
  }, [dispatch]);
  
  // Filter all data by selected branch
  const orders = filterByBranch(mockOrders, selectedBranchId);
  const machines = filterByBranch(mockMachines, selectedBranchId);
  const customers = filterByBranch(mockCustomers, selectedBranchId);
  
  // Calculate metrics
  const metrics = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.overallStatus === 'completed').length,
    activeMachines: machines.filter(m => m.status === 'active').length,
    totalCustomers: customers.length,
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header with Branch Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manufacturing Dashboard</h1>
          <p className="text-slate-600">
            {selectedBranch 
              ? `${selectedBranch.code} - ${selectedBranch.name}`
              : 'All Branches'
            }
          </p>
        </div>
        <BranchSelector className="w-[400px]" />
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Orders"
          value={metrics.totalOrders}
          subtitle="All time"
        />
        <MetricCard 
          title="Completed"
          value={metrics.completedOrders}
          subtitle={`${((metrics.completedOrders / metrics.totalOrders) * 100).toFixed(1)}% completion rate`}
        />
        <MetricCard 
          title="Active Machines"
          value={metrics.activeMachines}
          subtitle={`${machines.length} total`}
        />
        <MetricCard 
          title="Customers"
          value={metrics.totalCustomers}
          subtitle="Active customers"
        />
      </div>
    </div>
  );
}

// Helper component
function MetricCard({ title, value, subtitle }: { title: string; value: number; subtitle: string }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Branch Comparison Report
// ============================================

export function BranchComparisonReport() {
  const branches = useAppSelector(selectActiveBranches);
  const summary = getBranchSummary(mockOrders, branches);
  
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Branch Performance Comparison</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Branch</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Location</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-slate-600">Orders</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-slate-600">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {summary.map(row => {
              const branch = branches.find(b => b.id === row.branchId);
              return (
                <tr key={row.branchId} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{row.branchCode}</div>
                    <div className="text-sm text-slate-600">{row.branchName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {branch?.location}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {row.count}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex-1 max-w-[100px] bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${row.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{row.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Region-Based Analysis
// ============================================

export function RegionalAnalysisReport() {
  const branches = useAppSelector(selectBranches);
  const groupedOrders = groupByBranch(mockOrders);
  
  // Group branches by region
  const regions = Array.from(new Set(branches.map(b => b.region)));
  
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Regional Analysis</h2>
      
      {regions.map(region => {
        const regionBranches = branches.filter(b => b.region === region);
        const regionOrders = regionBranches.reduce((total, branch) => {
          return total + (groupedOrders[branch.id]?.length || 0);
        }, 0);
        
        return (
          <div key={region} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">{region} Region</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-600">Branches</p>
                <p className="text-2xl font-bold">{regionBranches.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold">{regionOrders}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg per Branch</p>
                <p className="text-2xl font-bold">
                  {regionBranches.length > 0 
                    ? Math.round(regionOrders / regionBranches.length)
                    : 0
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              {regionBranches.map(branch => (
                <div key={branch.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <span className="font-medium">{branch.code}</span>
                    <span className="text-slate-600 ml-2">{branch.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{groupedOrders[branch.id]?.length || 0}</span>
                    <span className="text-sm text-slate-600 ml-1">orders</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// EXAMPLE 6: Custom Report with Branch Filter
// ============================================

export function CustomBranchReport() {
  const dispatch = useAppDispatch();
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const branches = useAppSelector(selectActiveBranches);
  
  const [selectedMetric, setSelectedMetric] = React.useState<'orders' | 'machines' | 'customers'>('orders');
  
  // Filter data
  const orders = filterByBranch(mockOrders, selectedBranchId);
  const machines = filterByBranch(mockMachines, selectedBranchId);
  const customers = filterByBranch(mockCustomers, selectedBranchId);
  
  const getData = () => {
    switch (selectedMetric) {
      case 'orders': return orders;
      case 'machines': return machines;
      case 'customers': return customers;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Custom Analysis Report</h2>
        <div className="flex gap-4">
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-4 py-2 border rounded"
          >
            <option value="orders">Orders</option>
            <option value="machines">Machines</option>
            <option value="customers">Customers</option>
          </select>
          <BranchSelector className="w-[300px]" />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg font-medium mb-4">
          {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} - {getData().length} items
        </p>
        <p className="text-slate-600">
          Filtered data from {selectedBranchId ? branches.find(b => b.id === selectedBranchId)?.name : 'All Branches'}
        </p>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Branch Selector Variants
// ============================================

export function BranchSelectorVariants() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h3 className="font-medium">Standard Branch Selector</h3>
        <BranchSelector />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Compact Branch Selector (for toolbars)</h3>
        <CompactBranchSelector />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Region-Grouped Branch Selector</h3>
        <RegionBranchSelector />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Without "All Branches" Option</h3>
        <BranchSelector showAllOption={false} />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">With Change Handler</h3>
        <BranchSelector 
          onBranchChange={(branchId) => {
            alert(`Branch changed to: ${branchId || 'All Branches'}`);
          }}
        />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 8: Branch Statistics Display
// ============================================

export function BranchStatistics() {
  const stats = useAppSelector(selectBranchStats);
  const branches = useAppSelector(selectBranches);
  
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Branch Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-slate-600">Total Branches</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
          <p className="text-xs text-green-600 mt-1">{stats.active} active</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-slate-600">Total Machines</p>
          <p className="text-3xl font-bold mt-2">{stats.totalMachines}</p>
          <p className="text-xs text-slate-500 mt-1">Across all branches</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-slate-600">Total Employees</p>
          <p className="text-3xl font-bold mt-2">{stats.totalEmployees}</p>
          <p className="text-xs text-slate-500 mt-1">Full-time staff</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-sm text-slate-600">Avg Machines/Branch</p>
          <p className="text-3xl font-bold mt-2">
            {stats.active > 0 ? Math.round(stats.totalMachines / stats.active) : 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Active branches only</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Branch Details</h3>
        <div className="space-y-3">
          {branches.map(branch => (
            <div key={branch.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <span className="font-medium">{branch.code}</span>
                <span className="text-slate-600 ml-2">{branch.name}</span>
                {!branch.isActive && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>
              <div className="text-right text-sm text-slate-600">
                <div>{branch.machineCount} machines</div>
                <div>{branch.employeeCount} employees</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 9: Integration with Existing Report
// ============================================

export function ExistingReportWithBranchFilter() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const orders = filterByBranch(mockOrders, selectedBranchId);
  
  // Your existing report logic here...
  const completedOrders = orders.filter(o => o.overallStatus === 'completed');
  const pendingOrders = orders.filter(o => o.overallStatus === 'pending');
  
  return (
    <div className="p-6 space-y-6">
      {/* Add branch selector to your existing report */}
      <div className="flex items-center justify-between">
        <h2>Existing Report</h2>
        <BranchSelector />
      </div>
      
      {/* Your existing report content with filtered data */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p>Completed Orders</p>
          <p className="text-2xl font-bold">{completedOrders.length}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p>Pending Orders</p>
          <p className="text-2xl font-bold">{pendingOrders.length}</p>
        </div>
      </div>
    </div>
  );
}

export default BranchDashboard;
