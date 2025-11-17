# Data Caching System - Prevent Multiple API Calls

## Problem Solved

❌ **Before**: Every time you create/edit an order, all reference data (branches, customers, machines, products, materials) is fetched from the server again and again.

✅ **After**: Data is fetched ONCE and cached for 5 minutes. No more repeated API calls!

---

## 🚀 Quick Start

### Method 1: Using React Hook (Recommended for New Components)

```typescript
import { useOrderFormData } from '@/hooks/useOrderFormData';

const OrderForm = () => {
  const {
    branches,
    customers,
    machines,
    products,
    materials,
    isLoading,
    isReady,
    refresh
  } = useOrderFormData();

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
      {/* Your form here */}
      <select>
        {branches.map(branch => (
          <option key={branch._id} value={branch._id}>
            {branch.name}
          </option>
        ))}
      </select>

      <select>
        {customers.map(customer => (
          <option key={customer._id} value={customer._id}>
            {customer.name}
          </option>
        ))}
      </select>

      {/* Refresh button if needed */}
      <button onClick={refresh}>Refresh Data</button>
    </div>
  );
};
```

### Method 2: Using Redux (For Existing Redux Components)

#### Step 1: Add cache reducer to your store

```typescript
// src/componest/redux/rootReducer.tsx
import cacheReducer from './cache/cacheSlice';

const rootReducer = combineReducers({
  // ... your existing reducers
  cache: cacheReducer
});
```

#### Step 2: Fetch data once in your App.tsx or main component

```typescript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllCachedData } from '@/componest/redux/cache/cacheSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch all reference data once on app load
    dispatch(fetchAllCachedData());
  }, [dispatch]);

  return <div>{/* Your app */}</div>;
}
```

#### Step 3: Use cached data in your components

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { fetchBranches, fetchCustomers } from '@/componest/redux/cache/cacheSlice';

const OrderForm = () => {
  const dispatch = useDispatch();

  // Get cached data from Redux
  const branches = useSelector((state) => state.cache.branches.data || []);
  const customers = useSelector((state) => state.cache.customers.data || []);
  const loading = useSelector((state) => state.cache.loading.branches);

  useEffect(() => {
    // This will use cache if available (won't make API call if data is fresh)
    dispatch(fetchBranches());
    dispatch(fetchCustomers());
  }, [dispatch]);

  return (
    <div>
      <select>
        {branches.map(branch => (
          <option key={branch._id} value={branch._id}>
            {branch.name}
          </option>
        ))}
      </select>
    </div>
  );
};
```

---

## 📋 Available Cached Data

The system automatically caches:

- ✅ **Branches** (5 min TTL)
- ✅ **Customers** (5 min TTL)
- ✅ **Machines** (5 min TTL)
- ✅ **Products** (5 min TTL)
- ✅ **Materials** (5 min TTL)
- ✅ **Material Types** (10 min TTL)
- ✅ **Product Types** (10 min TTL)
- ✅ **Machine Types** (10 min TTL)

---

## 🎯 How It Works

### 1. First Load
```
Component Opens → Check Cache → Empty → Fetch from API → Store in Cache
API Call: ✅ (Required)
```

### 2. Second Load (within 5 minutes)
```
Component Opens → Check Cache → Found & Fresh → Use Cached Data
API Call: ❌ (Prevented!)
```

### 3. After 5 Minutes
```
Component Opens → Check Cache → Found but Stale → Fetch from API → Update Cache
API Call: ✅ (Required)
```

---

## 💾 Cache Storage

Data is stored in TWO places:

1. **Memory** - Fast access during current session
2. **LocalStorage** - Persists across page refreshes

```
First Visit:    API Call → Cache in Memory + LocalStorage
Page Refresh:   Load from LocalStorage (Instant!)
After TTL:      API Call → Update Cache
```

---

## 🔄 Manual Refresh

### Using React Hook

```typescript
const { refresh, refreshBranches, refreshCustomers } = useOrderFormData();

// Refresh all data
<button onClick={refresh}>Refresh All</button>

// Refresh specific data
<button onClick={refreshBranches}>Refresh Branches Only</button>
```

### Using Redux

```typescript
import { fetchBranches, fetchAllCachedData, clearCache } from '@/componest/redux/cache/cacheSlice';

// Force refresh (bypass cache)
dispatch(fetchBranches(true)); // force = true

// Refresh all data
dispatch(fetchAllCachedData(true));

// Clear all cache
dispatch(clearCache());
```

---

## 📊 Cache Status

### Check if data is loading

```typescript
const { isLoading, isReady } = useOrderFormData();

if (isLoading) return <Spinner />;
if (!isReady) return <div>Loading required data...</div>;
```

### Check cache age

```typescript
import { useDataCache } from '@/hooks/useDataCache';

const { data, cacheAge, isStale } = useDataCache('branches', fetchBranches);

console.log(`Cache age: ${cacheAge}ms`);
console.log(`Is stale: ${isStale}`);
```

---

## 🛠️ Advanced Usage

### Custom Cache TTL

```typescript
import { useDataCache } from '@/hooks/useDataCache';

const { data } = useDataCache(
  'myData',
  () => api.fetch('/my-endpoint'),
  {
    ttl: 10 * 60 * 1000, // 10 minutes
    autoRefresh: true,    // Auto-refresh when stale
    onError: (error) => console.error(error)
  }
);
```

### Clear Specific Cache Item

```typescript
import { clearCacheItem } from '@/componest/redux/cache/cacheSlice';

// Clear only branches cache
dispatch(clearCacheItem('branches'));
```

### Check Cache in Console

```typescript
// See what's cached
console.log('[Cache] Branches:', localStorage.getItem('cache_branches'));
console.log('[Cache] Customers:', localStorage.getItem('cache_customers'));
```

---

## 🔍 Debugging

Enable console logs to see caching in action:

```
[Cache] Using cached branches (age: 45s)
[Redux Cache] Using cached customers
[Cache] Fetching fresh data for machines...
[Cache] Successfully cached machines
```

Look for these logs to verify caching is working!

---

## ⚡ Performance Benefits

### Before (No Caching)
```
User opens order form          → 8 API calls
User edits order              → 8 API calls
User creates another order    → 8 API calls
Total: 24 API calls = Slow! 🐌
```

### After (With Caching)
```
User opens order form          → 8 API calls (first time)
User edits order              → 0 API calls (cached!)
User creates another order    → 0 API calls (cached!)
Total: 8 API calls = Fast! 🚀
```

**Result: 66% fewer API calls!**

---

## 📝 Best Practices

1. **Use `useOrderFormData` for order forms** - All data is pre-configured

2. **Fetch on app load** - Load reference data when app starts
   ```typescript
   useEffect(() => {
     dispatch(fetchAllCachedData());
   }, []);
   ```

3. **Don't force refresh unless needed** - Let the cache TTL handle it

4. **Use manual refresh for user actions** - Add refresh button if users need latest data

5. **Clear cache on logout** - Reset cache when user logs out
   ```typescript
   const logout = () => {
     dispatch(clearCache());
     // ... other logout logic
   };
   ```

---

## 🔧 Troubleshooting

### Issue: Data not updating

**Solution**: The cache might be stale. Force refresh:
```typescript
dispatch(fetchBranches(true)); // force = true
```

### Issue: Too much data in localStorage

**Solution**: Clear old caches periodically:
```typescript
dispatch(clearCache());
```

### Issue: Cache showing old data after creating new item

**Solution**: Clear specific cache after creating:
```typescript
// After creating new branch
await branchAPI.create(data);
dispatch(clearCacheItem('branches'));
dispatch(fetchBranches(true));
```

---

## 📦 File Structure

```
src/
├── hooks/
│   ├── useDataCache.ts          # Generic caching hook
│   └── useOrderFormData.ts      # Order form specific hook
├── componest/redux/cache/
│   └── cacheSlice.ts            # Redux caching slice
└── utils/
    └── crudHelpers.ts           # API helpers with caching support
```

---

## 🎬 Complete Example

```typescript
import React from 'react';
import { useOrderFormData } from '@/hooks/useOrderFormData';
import { ActionButton } from '@/components/shared/ActionButton';
import { useCRUD } from '@/hooks/useCRUD';
import { crudAPI } from '@/utils/crudHelpers';

const CreateOrder = () => {
  const {
    branches,
    customers,
    machines,
    products,
    materials,
    isLoading,
    isReady,
    refresh
  } = useOrderFormData();

  const { saveState, handleSave } = useCRUD();

  const [order, setOrder] = React.useState({
    branchId: '',
    customerId: '',
    machineId: '',
    productId: '',
    quantity: 0
  });

  const onSave = () => {
    handleSave(() => crudAPI.create('/order/order', order), {
      successMessage: 'Order created successfully!',
      onSuccess: () => {
        setOrder({ branchId: '', customerId: '', machineId: '', productId: '', quantity: 0 });
      }
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading reference data...</div>;
  }

  if (!isReady) {
    return <div className="p-4">Preparing form...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create Order</h1>
        <button
          onClick={refresh}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          Refresh Data
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Branch</label>
          <select
            value={order.branchId}
            onChange={(e) => setOrder({ ...order, branchId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select Branch</option>
            {branches.map(branch => (
              <option key={branch._id} value={branch._id}>
                {branch.name} - {branch.location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Customer</label>
          <select
            value={order.customerId}
            onChange={(e) => setOrder({ ...order, customerId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Machine</label>
          <select
            value={order.machineId}
            onChange={(e) => setOrder({ ...order, machineId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select Machine</option>
            {machines.map(machine => (
              <option key={machine._id} value={machine._id}>
                {machine.machineName} - {machine.machineType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product</label>
          <select
            value={order.productId}
            onChange={(e) => setOrder({ ...order, productId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select Product</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.productName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <input
            type="number"
            value={order.quantity}
            onChange={(e) => setOrder({ ...order, quantity: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter quantity"
          />
        </div>

        <ActionButton
          type="save"
          state={saveState}
          onClick={onSave}
          className="w-full"
        >
          Create Order
        </ActionButton>
      </div>

      {/* Stats */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p>Available Branches: {branches.length}</p>
        <p>Available Customers: {customers.length}</p>
        <p>Available Machines: {machines.length}</p>
        <p>Available Products: {products.length}</p>
        <p>Available Materials: {materials.length}</p>
      </div>
    </div>
  );
};

export default CreateOrder;
```

---

## 🎉 Summary

✅ **Problem Solved**: No more repeated API calls
✅ **Performance**: 66%+ fewer server requests
✅ **User Experience**: Instant form loads
✅ **Easy Integration**: Just use the hook!

**Now your order forms load INSTANTLY!** 🚀
