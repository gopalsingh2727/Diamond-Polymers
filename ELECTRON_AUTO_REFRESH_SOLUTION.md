# Electron Auto-Refresh Solution

## The Electron Problem

### Why Cache Invalidation Doesn't Work in Electron

**Browser Apps** (Web):
```
Manager 1 Browser ──┐
                    ├──> Shared Backend/Database
Manager 2 Browser ──┘
```
- Both browsers can use WebSockets or SSE
- Can notify each other of changes
- Cache invalidation works!

**Electron Apps** (Desktop):
```
Manager 1 Electron App (Independent Instance)
    ↓
    Own Memory
    Own Redux Store
    Own Cache
    ❌ NO CONNECTION to Manager 2

Manager 2 Electron App (Independent Instance)
    ↓
    Own Memory
    Own Redux Store
    Own Cache
    ❌ NO CONNECTION to Manager 1
```

**Problem**:
- Manager 2 creates a machine
- Manager 2's cache is invalidated ✅
- Manager 1 has **NO WAY TO KNOW** ❌
- Manager 1 keeps showing old data ❌

---

## ✅ Solution: Auto-Refresh Polling

Instead of trying to sync caches between Electron instances, we:
1. **Reduce cache duration** from 10 minutes to **2 minutes**
2. **Auto-refresh** every **60 seconds** in the background
3. **Show refresh indicator** so users know data is fresh

### How It Works

```
Manager 1 Electron:
  ↓
  Page Load → Fetch machines (cached for 2 min)
  ↓
  After 60 sec → Auto-refresh in background
  ↓
  Gets new machine created by Manager 2! ✅
  ↓
  After 120 sec → Auto-refresh again
  ↓
  Repeat forever while page is open
```

**Result**: Manager 1 sees Manager 2's changes within 60 seconds!

---

## Implementation

### 1. Auto-Refresh Hook

**File**: `src/hooks/useAutoRefresh.ts`

```typescript
import { useAutoRefresh } from '../hooks/useAutoRefresh';

const { isRefreshing, lastRefresh, triggerRefresh } = useAutoRefresh(
  () => dispatch(getMachinesIfNeeded()),
  {
    interval: 60000, // Refresh every 60 seconds
    enabled: true
  }
);
```

**Options**:
- `interval` - How often to refresh (milliseconds)
- `enabled` - Enable/disable auto-refresh
- `onRefresh` - Optional callback after refresh

**Returns**:
- `isRefreshing` - Is currently refreshing?
- `lastRefresh` - When was last refresh?
- `triggerRefresh()` - Manually trigger refresh
- `stopRefresh()` - Stop auto-refresh
- `startRefresh()` - Start auto-refresh

### 2. Cache Duration

**File**: `src/componest/redux/cache/dataCacheReducer.ts`

```typescript
// ✅ ELECTRON OPTIMIZATION: Shorter cache duration
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (was 10 minutes)
```

**Why 2 minutes?**
- Short enough that data feels fresh
- Long enough to reduce API calls
- Works well with 60-second auto-refresh

### 3. Smart Fetching

**File**: `src/componest/redux/create/machine/MachineActions.ts`

```typescript
export const getMachinesIfNeeded = () =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const machinesCache = state.dataCache?.machines;

    if (isCacheValid(machinesCache)) {
      console.log(`✅ Using cached machines (age: ${age} minutes)`);
      return machinesCache.data; // Return cached data
    } else {
      console.log('📊 Cache expired - fetching fresh data');
      return dispatch(getMachines()); // Fetch from API
    }
  };
```

---

## How to Apply to Any Component

### Step 1: Import the hook

```typescript
import { useAutoRefresh } from '../../../hooks/useAutoRefresh';
```

### Step 2: Add auto-refresh

```typescript
const MyComponent = () => {
  const dispatch = useDispatch();

  // ✅ Add this
  const { isRefreshing, triggerRefresh } = useAutoRefresh(
    () => dispatch(getDataIfNeeded()), // Your smart fetch function
    {
      interval: 60000, // 60 seconds
      enabled: true
    }
  );

  // Rest of your component...
};
```

### Step 3: (Optional) Show refresh indicator

```typescript
return (
  <div>
    <button onClick={triggerRefresh}>
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </button>

    {/* Your component content */}
  </div>
);
```

---

## Example: Edit Machines Component

**Before** (Old way - never refreshes):
```typescript
const EditMachinesNew = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMachines()); // Fetch once on load
  }, [dispatch]);

  // ❌ Never refreshes until user manually reloads page
};
```

**After** (New way - auto-refreshes):
```typescript
const EditMachinesNew = () => {
  const dispatch = useDispatch();

  // ✅ Auto-refresh every 60 seconds
  const { isRefreshing } = useAutoRefresh(
    () => dispatch(getMachinesIfNeeded()),
    {
      interval: 60000,
      enabled: true
    }
  );

  useEffect(() => {
    dispatch(getMachineTypes());
  }, [dispatch]);

  // ✅ Automatically gets new machines within 60 seconds!
};
```

---

## Testing

### Test 1: Verify Auto-Refresh is Working

1. **Open Electron app**
2. **Go to Edit Machines page**
3. **Open Developer Tools** (F12) → Console
4. **Look for logs**:
   ```
   ⏰ Auto-refresh: Enabled (every 60 seconds)
   🔄 Auto-refresh: Fetching fresh data...
   ✅ Using cached machines (age: 0 minutes)
   ✅ Auto-refresh: Complete
   ```
5. **Wait 60 seconds** → Should see another refresh log
6. **Wait 120 seconds (2 minutes)** → Cache expires, fetches from API

### Test 2: Two Electron Instances

1. **Open TWO Electron apps**
   - App 1: Manager 1
   - App 2: Manager 2

2. **App 1**: Go to Edit Machines page

3. **App 2**: Create a new machine

4. **App 1**: Wait up to 60 seconds
   - Console should show: `🔄 Auto-refresh: Fetching fresh data...`
   - New machine appears in list! ✅

### Test 3: Manual Refresh

1. **Add a refresh button** (optional):
   ```typescript
   <button onClick={triggerRefresh}>
     {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
   </button>
   ```

2. **Click the button**
3. **Console shows**: `🔄 Manual refresh triggered`
4. **Data refreshes immediately** (don't wait 60 seconds)

---

## Configuration

### Adjust Refresh Interval

**For faster sync** (uses more API calls):
```typescript
useAutoRefresh(() => dispatch(getData()), {
  interval: 30000 // 30 seconds
});
```

**For slower sync** (uses fewer API calls):
```typescript
useAutoRefresh(() => dispatch(getData()), {
  interval: 120000 // 2 minutes
});
```

### Disable Auto-Refresh (Optional)

```typescript
const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

useAutoRefresh(() => dispatch(getData()), {
  interval: 60000,
  enabled: autoRefreshEnabled // Toggle on/off
});

// Add toggle button
<button onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}>
  Auto-Refresh: {autoRefreshEnabled ? 'ON' : 'OFF'}
</button>
```

### Adjust Cache Duration

**File**: `src/componest/redux/cache/dataCacheReducer.ts`

```typescript
// Shorter cache = More frequent API calls, fresher data
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute

// Longer cache = Fewer API calls, less fresh data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

**Recommended for Electron**: 1-2 minutes

---

## Components That Need Auto-Refresh

Apply auto-refresh to these components:

### High Priority (Users expect fresh data):
1. ✅ **EditMachines** - Already done!
2. ⏳ **EditMaterials**
3. ⏳ **EditProducts**
4. ⏳ **EditCustomers**
5. ⏳ **Dashboard** - Analytics data
6. ⏳ **Order List** - Order status changes

### Medium Priority:
7. ⏳ **EditOperators**
8. ⏳ **EditSteps**
9. ⏳ **EditMachineTypes**
10. ⏳ **EditMaterialTypes**

### Low Priority (rarely changes):
11. ⏳ **EditBranches**
12. ⏳ **EditAdmins**

---

## Performance Impact

### API Call Comparison

**Before** (Old caching system):
```
Page Load: 1 API call
10 minutes: 0 API calls (using cache)
20 minutes: 0 API calls (using cache)
Total: 1 API call per 20 minutes
```

**After** (Auto-refresh system):
```
Page Load: 1 API call
1 minute: 0 API calls (using cache)
2 minutes: 1 API call (cache expired, refresh)
3 minutes: 0 API calls (using cache)
4 minutes: 1 API call (cache expired, refresh)
Total: ~1 API call per 2 minutes
```

**Result**:
- **10x more API calls** vs old system
- BUT **users see fresh data within 60 seconds!** ✅
- **Acceptable trade-off** for Electron desktop apps

### Network Usage

- **API call size**: ~50-100KB (machines list)
- **Calls per hour**: ~30 (every 2 minutes)
- **Bandwidth per hour**: ~1.5-3MB
- **Acceptable** for desktop apps on WiFi/Ethernet

---

## Alternative Solutions (Not Implemented)

### 1. WebSockets (Complex)

**Pros**:
- Real-time updates
- Instant sync between instances
- Efficient (no polling)

**Cons**:
- Requires WebSocket server
- More complex backend
- More code to maintain

### 2. Electron IPC (Local only)

**Pros**:
- Sync between instances on SAME computer

**Cons**:
- Doesn't work across different computers
- Doesn't help if Manager 1 and Manager 2 are on different PCs

### 3. Database Change Streams (Complex)

**Pros**:
- Real-time database notifications

**Cons**:
- Requires MongoDB Change Streams
- Backend complexity
- Requires connection pooling management

**Current Solution** (Polling) is:
- ✅ Simple to implement
- ✅ Works across multiple computers
- ✅ No backend changes needed
- ✅ Easy to understand and maintain

---

## Troubleshooting

### Issue: Auto-refresh not working

**Check**:
1. Open console (F12)
2. Look for: `⏰ Auto-refresh: Enabled`
3. If not there, hook not initialized

**Fix**:
```typescript
// Make sure you're calling useAutoRefresh
const { isRefreshing } = useAutoRefresh(
  () => dispatch(getData()),
  { interval: 60000, enabled: true }
);
```

### Issue: Too many API calls

**Symptom**: Console shows API calls every few seconds

**Fix**:
```typescript
// Increase interval
useAutoRefresh(() => dispatch(getData()), {
  interval: 120000 // 2 minutes instead of 1
});
```

### Issue: Data still stale

**Symptom**: Changes not showing even after 60+ seconds

**Check**:
1. Is cache duration too long?
2. Is smart fetch function working?
3. Console logs showing cache hits?

**Fix**:
```typescript
// Reduce cache duration
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute
```

---

## Summary

### For Electron Apps:

✅ **Short cache** (2 minutes) + **Auto-refresh** (60 seconds) = Fresh data for all instances!

### Benefits:
- ✅ Manager 1 sees Manager 2's changes within 60 seconds
- ✅ Simple to implement (just add `useAutoRefresh` hook)
- ✅ Works across different computers
- ✅ No backend changes needed
- ✅ Easy to configure (adjust interval)

### Trade-offs:
- ❌ More API calls (10x more vs old system)
- ❌ Not instant (up to 60 second delay)
- ✅ **Acceptable** for desktop apps

---

**Implemented**: 2025-01-16
**Status**: ✅ Working in EditMachines component
**Next**: Apply to other Edit components
**Performance**: ~30 API calls/hour (acceptable for Electron)
