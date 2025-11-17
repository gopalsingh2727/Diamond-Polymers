# Redux Setup for Manufacturing Dashboard

This Redux implementation follows the same pattern as your order management system, adapted for the reporting dashboard.

## Structure

```
redux/
├── reports/
│   ├── reportActions.ts    # Action creators for fetching reports
│   ├── reportConstants.ts  # Action type constants
│   ├── reportReducer.ts    # Reducers for report state
│   └── reportTypes.ts      # TypeScript interfaces
├── rootReducer.ts          # Combines all reducers
├── store.ts                # Redux store configuration
├── hooks.ts                # Custom TypeScript hooks
└── README.md               # This file
```

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
VITE_API_27INFINITY_IN=your_api_base_url
VITE_API_KEY=your_api_key
```

### 2. Provider Setup

The Provider is already configured in `App.tsx`:

```tsx
import { Provider } from 'react-redux';
import store from './redux/store';

<Provider store={store}>
  <YourComponents />
</Provider>
```

## Usage in Components

### Basic Example - Fetching Orders

```tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchOrdersReport } from '../redux/reports/reportActions';

function OrdersReport() {
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { orders, loading, error } = useAppSelector(
    (state) => state.reports.orders
  );
  
  // Fetch orders on component mount
  useEffect(() => {
    dispatch(fetchOrdersReport());
  }, [dispatch]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {orders.map(order => (
        <div key={order._id}>{order.orderId}</div>
      ))}
    </div>
  );
}
```

### With Filters

```tsx
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  fetchOrdersReport, 
  setStatusFilter,
  setDateRange 
} from '../redux/reports/reportActions';

function OrdersReportWithFilters() {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState('all');
  
  const { orders, loading } = useAppSelector(
    (state) => state.reports.orders
  );
  const dateRange = useAppSelector(
    (state) => state.reports.filters.dateRange
  );
  
  useEffect(() => {
    const filters: any = {};
    
    if (dateRange) {
      filters.startDate = dateRange.from.toISOString();
      filters.endDate = dateRange.to.toISOString();
    }
    
    if (status !== 'all') {
      filters.status = status;
    }
    
    dispatch(fetchOrdersReport(filters));
  }, [dispatch, dateRange, status]);
  
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    dispatch(setStatusFilter(newStatus));
  };
  
  return (
    <div>
      <select value={status} onChange={(e) => handleStatusChange(e.target.value)}>
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
      
      {/* Render orders */}
    </div>
  );
}
```

## Available Actions

### Fetch Reports

```tsx
// Overview Report
dispatch(fetchOverviewReport(dateRange));

// Orders Report
dispatch(fetchOrdersReport(filters));

// Production Report
dispatch(fetchProductionReport(filters));

// Machines Report
dispatch(fetchMachinesReport(filters));

// Customers Report
dispatch(fetchCustomersReport(filters));

// Materials
dispatch(fetchMaterials());
```

### Set Filters

```tsx
// Date Range
dispatch(setDateRange({ from: new Date(), to: new Date() }));

// Status Filter
dispatch(setStatusFilter('completed'));

// Priority Filter
dispatch(setPriorityFilter('urgent'));

// Machine Type Filter
dispatch(setMachineTypeFilter('Cutting Machine'));

// Material Type Filter
dispatch(setMaterialTypeFilter('HDPE'));

// Clear All Filters
dispatch(clearFilters());
```

### UI State

```tsx
// Set Loading
dispatch(setLoading(true));

// Set Error
dispatch(setError('Something went wrong'));

// Clear Error
dispatch(clearError());

// Set Success Message
dispatch(setSuccessMessage('Data saved successfully'));

// Clear Success Message
dispatch(clearSuccessMessage());
```

## State Structure

The Redux state is organized as follows:

```typescript
{
  reports: {
    overview: {
      orders: Order[],
      efficiencyTrends: EfficiencyTrend[],
      productionOutput: ProductionOutput[],
      loading: boolean,
      error: string | null,
      lastUpdated: string | null
    },
    orders: {
      orders: Order[],
      statusFilter: string,
      priorityFilter: string,
      loading: boolean,
      error: string | null,
      lastUpdated: string | null
    },
    production: {
      orders: Order[],
      materials: Material[],
      productionOutput: ProductionOutput[],
      materialTypeFilter: string,
      loading: boolean,
      error: string | null,
      lastUpdated: string | null
    },
    machines: {
      machines: Machine[],
      machineUtilization: MachineUtilization[],
      machineTypeFilter: string,
      loading: boolean,
      error: string | null,
      lastUpdated: string | null
    },
    customers: {
      customers: Customer[],
      orders: Order[],
      loading: boolean,
      error: string | null,
      lastUpdated: string | null
    },
    filters: {
      dateRange: { from: Date, to: Date },
      statusFilter: string,
      priorityFilter: string,
      machineTypeFilter: string,
      materialTypeFilter: string
    },
    branch: BranchState | null,
    activeTab: string,
    loading: boolean,
    error: string | null,
    successMessage: string | null
  }
}
```

## Accessing State

### Using Hooks

```tsx
// Get specific data
const orders = useAppSelector((state) => state.reports.orders.orders);
const loading = useAppSelector((state) => state.reports.loading);
const dateRange = useAppSelector((state) => state.reports.filters.dateRange);

// Get multiple values
const { orders, loading, error } = useAppSelector(
  (state) => state.reports.orders
);
```

## Error Handling

All action creators include error handling:

```tsx
try {
  await dispatch(fetchOrdersReport(filters));
  // Success
} catch (error) {
  // Error is already dispatched to store
  console.error('Failed to fetch orders:', error);
}
```

## TypeScript Support

All types are defined in `reportTypes.ts`:

```typescript
import { 
  Order, 
  Machine, 
  Customer, 
  DateRange 
} from '../redux/reports/reportTypes';
```

## Integration with Existing Order Management

If you want to integrate this with your existing order management Redux:

1. Import your order reducer in `rootReducer.ts`:
```tsx
import orderReducer from './orders/orderReducer';

const rootReducer = combineReducers({
  reports: reportReducer,
  orders: orderReducer,
  // ... other reducers
});
```

2. Use both in your components:
```tsx
const orders = useAppSelector((state) => state.orders.list.orders);
const reports = useAppSelector((state) => state.reports.orders.orders);
```

## Best Practices

1. **Always use custom hooks**: Use `useAppDispatch` and `useAppSelector` instead of plain `useDispatch` and `useSelector`

2. **Memoize selectors**: For complex state selections, use `reselect` library:
```tsx
import { createSelector } from 'reselect';

const selectOrders = (state) => state.reports.orders.orders;
const selectCompletedOrders = createSelector(
  [selectOrders],
  (orders) => orders.filter(o => o.overallStatus === 'completed')
);
```

3. **Handle loading states**: Always show loading indicators when fetching data

4. **Handle errors**: Display user-friendly error messages

5. **Clear errors**: Clear errors when navigating or retrying operations

## Example: Complete Component

See `/components/reports/OrdersReportWithRedux.tsx` for a complete example of a Redux-connected component.

## Debugging

Enable Redux DevTools:
1. Install Redux DevTools browser extension
2. DevTools are automatically enabled in development mode
3. Inspect state, actions, and time-travel debugging

## Migration from Mock Data

To migrate from mock data to Redux:

1. Replace mock data imports:
```tsx
// Before
import { mockOrders } from '../lib/mockData';

// After
import { useAppSelector } from '../redux/hooks';
const orders = useAppSelector((state) => state.reports.orders.orders);
```

2. Add data fetching:
```tsx
useEffect(() => {
  dispatch(fetchOrdersReport());
}, [dispatch]);
```

3. Add loading and error states:
```tsx
const { loading, error } = useAppSelector((state) => state.reports.orders);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

## Authentication

The Redux actions automatically use authentication from:
1. Redux auth state: `getState().auth?.token`
2. localStorage: `localStorage.getItem("authToken")`

Make sure to set the auth token:
```tsx
localStorage.setItem("authToken", yourToken);
```

## Branch Management

The Redux actions automatically use the selected branch:
```tsx
localStorage.setItem("selectedBranch", branchId);
```

Or set it in Redux:
```tsx
dispatch(setBranch({
  _id: "branch001",
  name: "Mumbai Manufacturing Unit",
  location: "Andheri East, Mumbai",
  code: "BRC-001"
}));
```
