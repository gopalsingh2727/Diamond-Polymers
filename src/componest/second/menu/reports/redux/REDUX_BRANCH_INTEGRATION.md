# 🔄 Redux Branch Integration Guide

## Overview

This guide shows how to integrate branch filtering with your existing Redux structure for reports and orders.

---

## 📦 Redux Structure

```
redux/
├── branches/          ← Branch management (NEW)
│   ├── branchTypes.ts
│   ├── branchActions.ts
│   ├── branchReducer.ts
│   └── branchSelectors.ts
├── orders/            ← Order management (EXISTING)
│   ├── orderTypes.ts
│   ├── orderActions.ts
│   ├── orderReducer.ts
│   └── orderConstants.ts
├── reports/           ← Report management (EXISTING)
│   ├── reportTypes.ts
│   ├── reportActions.ts
│   ├── reportReducer.ts
│   └── reportConstants.ts
├── rootReducer.ts     ← Combines all reducers
├── store.ts           ← Redux store
└── hooks.ts           ← Typed hooks
```

---

## 🔗 Integration Points

### 1. Root Reducer (Already Updated)

```typescript
// redux/rootReducer.ts
import { combineReducers } from 'redux';
import reportReducer from './reports/reportReducer';
import orderReducer from './orders/orderReducer';
import { branchReducer } from './branches/branchReducer';

const rootReducer = combineReducers({
  reports: reportReducer,
  orders: orderReducer,
  branches: branchReducer, // ✅ Branch reducer added
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
```

### 2. Updated Interfaces (Already Done)

All interfaces now include `branchId` field:

```typescript
// Order interface - redux/orders/orderTypes.ts
export interface Order {
  _id: string;
  orderId: string;
  branchId: string; // ✅ Added
  customerName: string; // ✅ Added
  operatorName: string; // ✅ Added
  materialType: string; // ✅ Added
  // ... rest of fields
}

// Machine interface - redux/reports/reportTypes.ts
export interface Machine {
  _id: string;
  machineId: string;
  branchId: string; // ✅ Added
  // ... rest of fields
}

// Customer interface - redux/reports/reportTypes.ts
export interface Customer {
  _id: string;
  branchId: string; // ✅ Added
  companyName?: string; // ✅ Added
  firstName?: string; // ✅ Added
  // ... rest of fields
}
```

---

## 🎯 Usage Patterns

### Pattern 1: Component with Branch Filter

```tsx
import { useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId } from '@/redux/branches/branchSelectors';
import { filterByBranch } from '@/lib/branchUtils';
import { BranchSelector } from '@/components/BranchSelector';

function OrdersReport() {
  // Get selected branch from Redux
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  
  // Get orders from Redux
  const allOrders = useAppSelector(state => state.orders.orders);
  
  // Filter by selected branch
  const filteredOrders = filterByBranch(allOrders, selectedBranchId);

  return (
    <div>
      <BranchSelector />
      <OrderTable orders={filteredOrders} />
    </div>
  );
}
```

### Pattern 2: Redux Action with Branch Filter

```tsx
// redux/reports/reportActions.ts
import { filterByBranch } from '@/lib/branchUtils';

export const fetchFilteredOrders = () => {
  return async (dispatch: any, getState: any) => {
    dispatch({ type: 'FETCH_ORDERS_REQUEST' });
    
    try {
      // Get current branch selection
      const selectedBranchId = getState().branches.selectedBranchId;
      
      // Fetch all orders
      const orders = await fetchOrdersFromAPI();
      
      // Filter by branch
      const filteredOrders = filterByBranch(orders, selectedBranchId);
      
      dispatch({
        type: 'FETCH_ORDERS_SUCCESS',
        payload: filteredOrders
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_ORDERS_FAILURE',
        payload: error.message
      });
    }
  };
};
```

### Pattern 3: Selector with Branch Filter

```tsx
// redux/reports/reportSelectors.ts (CREATE THIS FILE)
import { createSelector } from 'reselect';
import { RootState } from '../rootReducer';
import { filterByBranch } from '@/lib/branchUtils';

// Input selectors
const selectAllOrders = (state: RootState) => state.reports.orders.orders;
const selectSelectedBranchId = (state: RootState) => state.branches.selectedBranchId;

// Memoized selector with branch filtering
export const selectFilteredOrders = createSelector(
  [selectAllOrders, selectSelectedBranchId],
  (orders, branchId) => filterByBranch(orders, branchId)
);

// Use in component
function MyComponent() {
  const filteredOrders = useAppSelector(selectFilteredOrders);
  return <div>{filteredOrders.length} orders</div>;
}
```

### Pattern 4: Multiple Filters Combined

```tsx
import { useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId } from '@/redux/branches/branchSelectors';
import { filterByBranch } from '@/lib/branchUtils';

function ProductionReport() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const statusFilter = useAppSelector(state => state.reports.filters.statusFilter);
  const dateRange = useAppSelector(state => state.reports.filters.dateRange);
  
  // Get all orders
  const allOrders = useAppSelector(state => state.reports.orders.orders);
  
  // Apply all filters
  let filteredOrders = filterByBranch(allOrders, selectedBranchId);
  
  if (statusFilter !== 'all') {
    filteredOrders = filteredOrders.filter(o => o.overallStatus === statusFilter);
  }
  
  if (dateRange) {
    filteredOrders = filteredOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= dateRange.from && orderDate <= dateRange.to;
    });
  }

  return <OrderList orders={filteredOrders} />;
}
```

---

## 📊 Report Components Integration

### Overview Report

```tsx
// components/reports/OverviewReport.tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId } from '@/redux/branches/branchSelectors';
import { filterByBranch } from '@/lib/branchUtils';
import { BranchSelector } from '../BranchSelector';

export function OverviewReport() {
  const dispatch = useAppDispatch();
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  
  // Get data from Redux
  const orders = useAppSelector(state => state.reports.overview.orders);
  const loading = useAppSelector(state => state.reports.overview.loading);
  
  // Filter by branch
  const filteredOrders = filterByBranch(orders, selectedBranchId);
  
  // Load data when branch changes
  useEffect(() => {
    dispatch(fetchOverviewData());
  }, [selectedBranchId, dispatch]);

  return (
    <div>
      <BranchSelector />
      {loading ? <Loading /> : <OverviewContent orders={filteredOrders} />}
    </div>
  );
}
```

### Orders Report

```tsx
// components/reports/OrdersReport.tsx
import { useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId } from '@/redux/branches/branchSelectors';
import { filterByBranch } from '@/lib/branchUtils';

export function OrdersReport() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const orders = useAppSelector(state => state.reports.orders.orders);
  const statusFilter = useAppSelector(state => state.reports.orders.statusFilter);
  
  // Filter by branch and status
  let filtered = filterByBranch(orders, selectedBranchId);
  
  if (statusFilter !== 'all') {
    filtered = filtered.filter(o => o.overallStatus === statusFilter);
  }

  return (
    <div>
      <BranchSelector />
      <StatusFilter />
      <OrdersTable orders={filtered} />
    </div>
  );
}
```

### Machine Report

```tsx
// components/reports/MachineReport.tsx
import { useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId } from '@/redux/branches/branchSelectors';
import { filterByBranch } from '@/lib/branchUtils';

export function MachineReport() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const machines = useAppSelector(state => state.reports.machines.machines);
  const machineTypeFilter = useAppSelector(state => state.reports.machines.machineTypeFilter);
  
  // Filter by branch
  let filtered = filterByBranch(machines, selectedBranchId);
  
  // Filter by type
  if (machineTypeFilter !== 'all') {
    filtered = filtered.filter(m => m.type === machineTypeFilter);
  }

  return (
    <div>
      <BranchSelector />
      <MachineTypeFilter />
      <MachineTable machines={filtered} />
    </div>
  );
}
```

### Customer Report

```tsx
// components/reports/CustomerReport.tsx
import { useAppSelector } from '@/redux/hooks';
import { selectSelectedBranchId } from '@/redux/branches/branchSelectors';
import { filterByBranch } from '@/lib/branchUtils';

export function CustomerReport() {
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const customers = useAppSelector(state => state.reports.customers.customers);
  const orders = useAppSelector(state => state.reports.customers.orders);
  
  // Filter both customers and orders by branch
  const filteredCustomers = filterByBranch(customers, selectedBranchId);
  const filteredOrders = filterByBranch(orders, selectedBranchId);

  return (
    <div>
      <BranchSelector />
      <CustomerTable 
        customers={filteredCustomers} 
        orders={filteredOrders} 
      />
    </div>
  );
}
```

---

## 🔄 Refresh Data on Branch Change

### Method 1: useEffect Hook

```tsx
function MyReport() {
  const dispatch = useAppDispatch();
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  
  useEffect(() => {
    // Reload data when branch changes
    dispatch(fetchReportData());
  }, [selectedBranchId, dispatch]);

  return <ReportContent />;
}
```

### Method 2: Branch Change Handler

```tsx
function MyReport() {
  const dispatch = useAppDispatch();
  
  const handleBranchChange = (branchId: string | null) => {
    // Custom logic when branch changes
    dispatch(clearCurrentData());
    dispatch(fetchReportData());
  };

  return (
    <BranchSelector onBranchChange={handleBranchChange} />
  );
}
```

### Method 3: Redux Middleware (Advanced)

```typescript
// redux/middleware/branchMiddleware.ts
export const branchChangeMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  
  // When branch changes, refresh all reports
  if (action.type === 'branches/SET_SELECTED_BRANCH') {
    store.dispatch(fetchOverviewData());
    store.dispatch(fetchOrdersData());
    store.dispatch(fetchMachinesData());
  }
  
  return result;
};

// Add to store.ts
import { branchChangeMiddleware } from './middleware/branchMiddleware';

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk, branchChangeMiddleware))
);
```

---

## 🎨 Redux Selectors Library

Create a comprehensive selectors file:

```typescript
// redux/selectors.ts
import { createSelector } from 'reselect';
import { RootState } from './rootReducer';
import { filterByBranch } from '@/lib/branchUtils';

// Input selectors
const selectAllOrders = (state: RootState) => state.reports.orders.orders;
const selectAllMachines = (state: RootState) => state.reports.machines.machines;
const selectAllCustomers = (state: RootState) => state.reports.customers.customers;
const selectSelectedBranchId = (state: RootState) => state.branches.selectedBranchId;
const selectStatusFilter = (state: RootState) => state.reports.filters.statusFilter;
const selectPriorityFilter = (state: RootState) => state.reports.filters.priorityFilter;

// Branch-filtered selectors
export const selectBranchOrders = createSelector(
  [selectAllOrders, selectSelectedBranchId],
  (orders, branchId) => filterByBranch(orders, branchId)
);

export const selectBranchMachines = createSelector(
  [selectAllMachines, selectSelectedBranchId],
  (machines, branchId) => filterByBranch(machines, branchId)
);

export const selectBranchCustomers = createSelector(
  [selectAllCustomers, selectSelectedBranchId],
  (customers, branchId) => filterByBranch(customers, branchId)
);

// Combined filter selectors
export const selectFilteredOrders = createSelector(
  [selectBranchOrders, selectStatusFilter, selectPriorityFilter],
  (orders, status, priority) => {
    let filtered = orders;
    
    if (status !== 'all') {
      filtered = filtered.filter(o => o.overallStatus === status);
    }
    
    if (priority !== 'all') {
      filtered = filtered.filter(o => o.priority === priority);
    }
    
    return filtered;
  }
);

// Statistics selectors
export const selectBranchOrderStats = createSelector(
  [selectBranchOrders],
  (orders) => ({
    total: orders.length,
    completed: orders.filter(o => o.overallStatus === 'completed').length,
    pending: orders.filter(o => o.overallStatus === 'pending').length,
    inProgress: orders.filter(o => o.overallStatus === 'in_progress').length,
  })
);

export const selectBranchMachineStats = createSelector(
  [selectBranchMachines],
  (machines) => ({
    total: machines.length,
    active: machines.filter(m => m.status === 'active').length,
    inactive: machines.filter(m => m.status === 'inactive').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
  })
);
```

### Using Selectors

```tsx
import { useAppSelector } from '@/redux/hooks';
import {
  selectBranchOrders,
  selectFilteredOrders,
  selectBranchOrderStats
} from '@/redux/selectors';

function DashboardStats() {
  const stats = useAppSelector(selectBranchOrderStats);
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total" value={stats.total} />
      <StatCard label="Completed" value={stats.completed} />
      <StatCard label="Pending" value={stats.pending} />
      <StatCard label="In Progress" value={stats.inProgress} />
    </div>
  );
}
```

---

## 🧪 Testing

### Test Branch Filtering

```typescript
import { filterByBranch } from '@/lib/branchUtils';
import { mockOrders } from '@/lib/mockData';

describe('Branch Filtering', () => {
  it('should filter orders by branch', () => {
    const filtered = filterByBranch(mockOrders, 'branch001');
    expect(filtered.every(o => o.branchId === 'branch001')).toBe(true);
  });
  
  it('should return all orders when branchId is null', () => {
    const filtered = filterByBranch(mockOrders, null);
    expect(filtered.length).toBe(mockOrders.length);
  });
});
```

---

## ✅ Checklist for Integration

- [x] Updated Order interface with `branchId`, `customerName`, `operatorName`, `materialType`
- [x] Updated Machine interface with `branchId`
- [x] Updated Customer interface with `branchId`
- [x] Branch reducer added to rootReducer
- [x] Branch selectors created
- [x] Branch utility functions created
- [ ] Add BranchSelector to all report components
- [ ] Apply filterByBranch to all data in reports
- [ ] Create Redux selectors for branch-filtered data (optional)
- [ ] Add branch change handlers where needed
- [ ] Test branch filtering in all reports

---

## 📝 Migration Steps

### Step 1: Update Existing Reports

For each report component (`OverviewReport`, `OrdersReport`, etc.):

1. Import required hooks and utilities
2. Add BranchSelector component
3. Get selectedBranchId from Redux
4. Apply filterByBranch to data
5. Test functionality

### Step 2: Update Actions (Optional)

Add branch filtering to Redux actions if you want server-side filtering:

```typescript
export const fetchOrders = () => {
  return async (dispatch: any, getState: any) => {
    const { selectedBranchId } = getState().branches;
    
    // Pass branch to API
    const orders = await api.fetchOrders({ branchId: selectedBranchId });
    
    dispatch({
      type: 'FETCH_ORDERS_SUCCESS',
      payload: orders
    });
  };
};
```

### Step 3: Create Selectors (Recommended)

Create `/redux/selectors.ts` with memoized selectors for better performance.

---

## 🎉 Complete!

Your Redux structure is now fully integrated with branch management!

**Key Benefits:**
- ✅ Centralized branch state
- ✅ Consistent filtering across all components
- ✅ TypeScript support
- ✅ Memoized selectors for performance
- ✅ Easy to test
- ✅ Scalable architecture

**Next Steps:**
1. Add BranchSelector to remaining reports
2. Create memoized selectors
3. Add branch change handlers
4. Test all functionality
5. Document any custom patterns
