
# Branch Management Redux Module

## 📦 Overview

This module provides comprehensive branch management functionality with Redux state management, allowing users to switch between different manufacturing branches and filter all data accordingly.

---

## 🗂️ File Structure

```
redux/branches/
├── README.md              ← You are here
├── branchTypes.ts         ← TypeScript interfaces & types
├── branchActions.ts       ← Action creators & thunks
├── branchReducer.ts       ← Branch state reducer
└── branchSelectors.ts     ← State selectors
```

---

## 🎯 Features

- ✅ **Branch Selection** - Switch between branches or view all
- ✅ **Redux Integration** - Centralized state management
- ✅ **TypeScript Support** - Fully typed interfaces
- ✅ **Selectors** - Optimized state access
- ✅ **Loading States** - Handle async operations
- ✅ **Error Handling** - Proper error management
- ✅ **Region Filtering** - Group branches by region
- ✅ **Active/Inactive** - Filter active branches only

---

## 🚀 Quick Start

### 1. Import Branch Selector Component

```tsx
import { BranchSelector } from '@/components/BranchSelector';

function MyReport() {
  return (
    <div>
      <BranchSelector 
        showAllOption={true}
        activeOnly={true}
        onBranchChange={(branchId) => {
          console.log('Branch changed to:', branchId);
        }}
      />
    </div>
  );
}
```

### 2. Access Selected Branch in Redux

```tsx
import { useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId, selectSelectedBranch } from '@/redux/branches/branchSelectors';

function MyComponent() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const selectedBranch = useAppSelector(selectSelectedBranch);

  return (
    <div>
      {selectedBranch ? (
        <p>Current Branch: {selectedBranch.name}</p>
      ) : (
        <p>Viewing: All Branches</p>
      )}
    </div>
  );
}
```

### 3. Filter Data by Branch

```tsx
import { useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId } from '@/redux/branches/branchSelectors';
import { filterByBranch } from '@/lib/branchUtils';
import { mockOrders } from '@/lib/mockData';

function OrdersList() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  
  // Filter orders by selected branch
  const filteredOrders = filterByBranch(mockOrders, selectedBranchId);

  return (
    <div>
      <h2>Orders ({filteredOrders.length})</h2>
      {filteredOrders.map(order => (
        <div key={order._id}>{order.orderId}</div>
      ))}
    </div>
  );
}
```

---

## 📚 API Reference

### Branch Interface

```typescript
interface Branch {
  id: string;              // Unique identifier
  name: string;            // Branch name
  code: string;            // Branch code (e.g., "BRC-001")
  location: string;        // Physical location
  region: string;          // Geographic region
  isActive: boolean;       // Active status
  machineCount: number;    // Number of machines
  employeeCount: number;   // Number of employees
  createdAt: Date;         // Creation date
}
```

### Actions

#### Load Branches
```typescript
import { loadBranches } from '@/redux/branches/branchActions';

dispatch(loadBranches());
```

#### Change Branch
```typescript
import { changeBranch } from '@/redux/branches/branchActions';

// Select specific branch
dispatch(changeBranch('branch001'));

// Select all branches
dispatch(changeBranch(null));
```

#### Set Branches
```typescript
import { setBranches } from '@/redux/branches/branchActions';

dispatch(setBranches(branchesArray));
```

### Selectors

#### Basic Selectors

```typescript
import {
  selectBranches,              // Get all branches
  selectSelectedBranchId,      // Get selected branch ID
  selectSelectedBranch,        // Get selected branch object
  selectActiveBranches,        // Get active branches only
  selectBranchLoading,         // Get loading state
  selectBranchError,           // Get error message
} from '@/redux/branches/branchSelectors';

const branches = useAppSelector(selectBranches);
const selectedId = useAppSelector(selectSelectedBranchId);
const selected = useAppSelector(selectSelectedBranch);
```

#### Advanced Selectors

```typescript
import {
  selectBranchesByRegion,      // Get branches by region
  selectRegions,               // Get all unique regions
  selectIsAllBranchesSelected, // Check if "All" is selected
  selectBranchById,            // Get specific branch
  selectBranchStats,           // Get branch statistics
} from '@/redux/branches/branchSelectors';

const westernBranches = useAppSelector(state => 
  selectBranchesByRegion(state, 'Western')
);

const regions = useAppSelector(selectRegions);
const stats = useAppSelector(selectBranchStats);
```

### Branch Statistics

```typescript
const stats = useAppSelector(selectBranchStats);

console.log(stats);
// {
//   total: 6,
//   active: 5,
//   inactive: 1,
//   totalMachines: 63,
//   totalEmployees: 202
// }
```

---

## 🎨 Component Variants

### 1. Standard Branch Selector

```tsx
<BranchSelector 
  showAllOption={true}
  activeOnly={true}
  onBranchChange={(branchId) => console.log(branchId)}
  className="w-full"
/>
```

### 2. Compact Branch Selector

```tsx
<CompactBranchSelector 
  showAllOption={true}
  onBranchChange={(branchId) => console.log(branchId)}
  className="w-[200px]"
/>
```

### 3. Region-Grouped Selector

```tsx
<RegionBranchSelector 
  showAllOption={true}
  onBranchChange={(branchId) => console.log(branchId)}
  className="w-full"
/>
```

---

## 🛠️ Utility Functions

### Filter by Branch

```typescript
import { filterByBranch } from '@/lib/branchUtils';

const orders = filterByBranch(allOrders, selectedBranchId);
// Returns all orders if selectedBranchId is null
// Returns filtered orders if branchId is specified
```

### Group by Branch

```typescript
import { groupByBranch } from '@/lib/branchUtils';

const grouped = groupByBranch(allOrders);
// {
//   'branch001': [...orders],
//   'branch002': [...orders],
//   ...
// }
```

### Get Count by Branch

```typescript
import { getCountByBranch } from '@/lib/branchUtils';

const counts = getCountByBranch(allOrders);
// {
//   'branch001': 150,
//   'branch002': 120,
//   ...
// }
```

### Get Branch Summary

```typescript
import { getBranchSummary } from '@/lib/branchUtils';

const summary = getBranchSummary(allOrders, branches);
// [
//   {
//     branchId: 'branch001',
//     branchName: 'Mumbai Manufacturing Unit',
//     branchCode: 'BRC-001',
//     count: 150,
//     percentage: 30
//   },
//   ...
// ]
```

### Aggregate by Branch

```typescript
import { aggregateByBranch } from '@/lib/branchUtils';

const aggregated = aggregateByBranch(
  allOrders,
  branches,
  (orders) => ({
    total: orders.length,
    completed: orders.filter(o => o.overallStatus === 'completed').length,
    totalValue: orders.reduce((sum, o) => sum + o.financial.finalPrice, 0)
  })
);
```

---

## 💡 Use Cases

### Use Case 1: Filter Orders by Branch

```tsx
function OrdersReport() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const orders = filterByBranch(mockOrders, selectedBranchId);

  return (
    <div>
      <BranchSelector />
      <Table data={orders} />
    </div>
  );
}
```

### Use Case 2: Branch-Specific Metrics

```tsx
function MetricsDashboard() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const selectedBranch = useAppSelector(selectSelectedBranch);
  const orders = filterByBranch(mockOrders, selectedBranchId);
  const machines = filterByBranch(mockMachines, selectedBranchId);

  const metrics = {
    totalOrders: orders.length,
    activeMachines: machines.filter(m => m.status === 'active').length,
    branchName: selectedBranch?.name || 'All Branches'
  };

  return (
    <div>
      <h2>{metrics.branchName}</h2>
      <MetricCard label="Total Orders" value={metrics.totalOrders} />
      <MetricCard label="Active Machines" value={metrics.activeMachines} />
    </div>
  );
}
```

### Use Case 3: Branch Comparison Report

```tsx
function BranchComparisonReport() {
  const branches = useAppSelector(selectActiveBranches);
  const summary = getBranchSummary(mockOrders, branches);

  return (
    <Table>
      <thead>
        <tr>
          <th>Branch</th>
          <th>Orders</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        {summary.map(row => (
          <tr key={row.branchId}>
            <td>{row.branchCode} - {row.branchName}</td>
            <td>{row.count}</td>
            <td>{row.percentage.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
```

### Use Case 4: Region-Based Analysis

```tsx
function RegionalReport() {
  const regions = useAppSelector(selectRegions);
  const branches = useAppSelector(selectBranches);

  return (
    <div>
      {regions.map(region => {
        const regionBranches = getBranchesByRegion(branches, region);
        const regionOrders = filterByBranches(
          mockOrders,
          regionBranches.map(b => b.id)
        );

        return (
          <div key={region}>
            <h3>{region} Region</h3>
            <p>Branches: {regionBranches.length}</p>
            <p>Orders: {regionOrders.length}</p>
          </div>
        );
      })}
    </div>
  );
}
```

---

## 🎯 Integration with Existing Reports

### Update Overview Report

```tsx
// components/reports/OverviewReport.tsx
import { useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId } from '@/redux/branches/branchSelectors';
import { filterByBranch } from '@/lib/branchUtils';
import { BranchSelector } from '../BranchSelector';

function OverviewReport() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  
  // Filter all data by selected branch
  const orders = filterByBranch(mockOrders, selectedBranchId);
  const machines = filterByBranch(mockMachines, selectedBranchId);
  const customers = filterByBranch(mockCustomers, selectedBranchId);

  return (
    <div>
      <BranchSelector />
      {/* Rest of your report using filtered data */}
    </div>
  );
}
```

### Update Custom Report Builder

```tsx
// components/reports/CustomReportBuilder.tsx
import { BranchSelector } from '../BranchSelector';
import { useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId } from '@/redux/branches/branchSelectors';

function CustomReportBuilder() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);

  // Add branch filter to configuration
  return (
    <div>
      <div className="filters">
        <BranchSelector showAllOption={true} />
        {/* Other filters */}
      </div>
      {/* Report content */}
    </div>
  );
}
```

---

## 📊 Mock Data

The system includes 6 mock branches:

1. **BRC-001** - Mumbai Manufacturing Unit (Western, Active)
2. **BRC-002** - Delhi Production Center (Northern, Active)
3. **BRC-003** - Bangalore Tech Facility (Southern, Active)
4. **BRC-004** - Pune Manufacturing Hub (Western, Active)
5. **BRC-005** - Ahmedabad Plant (Western, Active)
6. **BRC-006** - Hyderabad Facility (Southern, Inactive)

Access via:
```typescript
import { mockBranches } from '@/lib/mockBranches';
```

---

## ✅ Best Practices

### 1. Always Handle Null Branch ID

```typescript
// ✅ Good
const filteredData = filterByBranch(data, selectedBranchId);

// ❌ Bad - manually checking
const filteredData = selectedBranchId 
  ? data.filter(item => item.branchId === selectedBranchId)
  : data;
```

### 2. Use Selectors

```typescript
// ✅ Good
const branch = useAppSelector(selectSelectedBranch);

// ❌ Bad - direct state access
const branch = useAppSelector(state => 
  state.branches.branches.find(b => b.id === state.branches.selectedBranchId)
);
```

### 3. React to Branch Changes

```typescript
const selectedBranchId = useAppSelector(selectSelectedBranchId);

useEffect(() => {
  // Refresh data when branch changes
  loadReportData(selectedBranchId);
}, [selectedBranchId]);
```

### 4. Show Branch Context

```typescript
function ReportHeader() {
  const selectedBranch = useAppSelector(selectSelectedBranch);

  return (
    <div>
      <h1>Production Report</h1>
      <p>
        {selectedBranch 
          ? `Branch: ${selectedBranch.code} - ${selectedBranch.name}`
          : 'All Branches'
        }
      </p>
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Branch Selector Not Showing Branches

```typescript
// Make sure to load branches
useEffect(() => {
  dispatch(loadBranches());
}, [dispatch]);
```

### Filtered Data Is Empty

```typescript
// Check if data has branchId property
console.log(mockOrders[0].branchId); // Should exist

// Verify branch ID matches
const selectedId = useAppSelector(selectSelectedBranchId);
console.log('Selected:', selectedId);
console.log('Available:', mockOrders.map(o => o.branchId));
```

### Branch Not Persisting

```typescript
// Check Redux DevTools
// Verify action is dispatched
dispatch(changeBranch('branch001'));

// Check reducer is included in root reducer
// See /redux/rootReducer.ts
```

---

## 🚀 Next Steps

1. **Add to ReportDashboard**: Include `<BranchSelector />` in main dashboard
2. **Update All Reports**: Add branch filtering to each report component
3. **Persist Selection**: Add localStorage persistence if needed
4. **API Integration**: Replace mock data with real API calls
5. **Advanced Filters**: Combine with date range, status filters, etc.

---

**Branch management is now fully integrated! Switch branches to filter all your reports! 🏢**
