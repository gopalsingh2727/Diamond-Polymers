# 🔄 Integrate Polling into Your Components

Quick integration guide for adding real-time polling to:
- Daybook
- Dispatch
- All Orders
- Account Orders (Customer Orders)

---

## Step 1: Add to Daybook Component

**File**: `/src/componest/second/menu/Daybook/Daybook.tsx`

### Add Import
```typescript
import { useOrderRealtimeSync } from '../../../../hooks/useOrderRealtimeSync';
```

### Add Hook (around line 192, near WebSocket hooks)
```typescript
// Existing WebSocket code
const { isConnected: wsConnected, status: wsStatus } = useWebSocketStatus();

// ADD THIS: Polling with WebSocket fallback
const { isLive, connectionMethod, isPolling, forceRefresh } = useOrderRealtimeSync(
  branchId,
  {
    enabled: true,
    preferWebSocket: true, // Try WebSocket first
    pollingFallback: true, // Use polling when WebSocket disconnected
    wsStatus: wsConnected ? 'connected' : 'disconnected',
    onUpdate: handleOrderUpdate, // Reuse existing WebSocket update handler
    onError: (error) => console.error('❌ Realtime sync error:', error),
  }
);
```

### Update Status Indicator (around line 644)
```typescript
{/* Replace existing WebSocket status indicator */}
<div className="connection-status">
  {isLive ? (
    <div className="status-live">
      <SignalIcon className="h-5 w-5 text-green-500" />
      <span>
        Live{' '}
        <small>
          ({connectionMethod === 'websocket' ? 'WebSocket' : 'Polling'})
        </small>
      </span>
    </div>
  ) : (
    <div className="status-offline">
      <SignalSlashIcon className="h-5 w-5 text-gray-400" />
      <span>Offline</span>
    </div>
  )}

  {isPolling && (
    <div className="polling-indicator">
      <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-500" />
      <span className="text-xs text-blue-600">Syncing...</span>
    </div>
  )}

  <button
    onClick={forceRefresh}
    className="refresh-btn"
    title="Force refresh"
  >
    <ArrowPathIcon className="h-4 w-4" />
  </button>
</div>
```

---

## Step 2: Add to Dispatch Component

**File**: `/src/componest/second/menu/Dispatch/Dispatch.tsx` OR `/src/componest/second/menu/Oders/Dispatch/Dispatch.tsx`

### Same Integration Pattern

```typescript
// Add import
import { useOrderRealtimeSync } from '../../../../hooks/useOrderRealtimeSync';

// Inside component (find where WebSocket is used or orders are fetched)
const { isLive, connectionMethod, forceRefresh } = useOrderRealtimeSync(
  branchId,
  {
    enabled: true,
    preferWebSocket: true,
    pollingFallback: true,
    wsStatus: wsStatus, // If you have WebSocket
    onUpdate: (updates) => {
      console.log('📦 Dispatch updates:', updates);
      // Refresh orders when updates arrive
      dispatch(fetchOrders({}) as any);
    },
  }
);

// Add status indicator to UI
<div className="header-actions">
  {isLive && (
    <span className="live-badge">
      🟢 Live ({connectionMethod})
    </span>
  )}
  <button onClick={forceRefresh}>
    🔄 Refresh
  </button>
</div>
```

---

## Step 3: Add to All Orders Component

**File**: `/src/componest/second/menu/Oders/indexAllOders.tsx`

### Integration

```typescript
// Add import
import { useOrderRealtimeSync } from '../../../hooks/useOrderRealtimeSync';

// Inside component
const { isLive, connectionMethod, isPolling, forceRefresh } = useOrderRealtimeSync(
  branchId,
  {
    enabled: true,
    preferWebSocket: false, // Polling only for All Orders (less critical)
    pollingFallback: true,
    onUpdate: (updates) => {
      console.log(`📋 All Orders: ${updates.length} updates`);
      // Refresh the orders list
      fetchAllOrders();
    },
  }
);

// UI Update
<div className="orders-header">
  <h2>All Orders</h2>

  {isLive && (
    <div className="realtime-status">
      <span className="indicator"></span>
      Real-time {isPolling && '(Polling)'}
    </div>
  )}

  <button onClick={forceRefresh} className="refresh-button">
    <ArrowPathIcon className="h-5 w-5" />
    Refresh
  </button>
</div>
```

---

## Step 4: Add to Account Orders (Customer Orders)

If you have a component that shows orders for specific customers/accounts:

```typescript
// Add import
import { useOrderRealtimeSync } from '../../../hooks/useOrderRealtimeSync';

// Inside component
const { isLive, forceRefresh } = useOrderRealtimeSync(
  branchId,
  {
    enabled: true,
    preferWebSocket: false, // Use polling for customer pages
    pollingFallback: true,
    onUpdate: (updates) => {
      // Filter updates for this customer only
      const customerUpdates = updates.filter(
        (update) => update.data.customerId === customerId
      );

      if (customerUpdates.length > 0) {
        console.log(`👤 Customer ${customerId}: ${customerUpdates.length} updates`);
        refreshCustomerOrders();
      }
    },
  }
);

// UI
<div className="customer-orders-header">
  <h3>Customer Orders</h3>
  {isLive && <span className="live-badge">🟢 Live</span>}
</div>
```

---

## Alternative: Quick Integration (No WebSocket Fallback)

If you just want simple polling without WebSocket complexity:

### For ANY Order Page

```typescript
import { useOrderPolling } from '../hooks/useOrderPolling';

// Inside component
const { updates, isPolling } = useOrderPolling(branchId, {
  enabled: true,
  timeout: 30000,
  onUpdate: (updates) => {
    console.log('Updates received:', updates);
    // Refresh your orders
    dispatch(fetchOrders({}) as any);
  },
});

// UI
{isPolling && <span>🔄 Syncing...</span>}
```

---

## CSS for Status Indicators

Add this to your component CSS or global styles:

```css
/* Live Status Badge */
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #10b981;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-live {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #10b981;
  font-weight: 500;
}

.status-offline {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9ca3af;
}

.polling-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #dbeafe;
  border-radius: 8px;
}

.refresh-btn {
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

/* Realtime indicator animation */
.indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

---

## Testing Checklist

After integration, test:

- [ ] **Daybook**: Real-time updates appear
- [ ] **Dispatch**: Orders update when status changes
- [ ] **All Orders**: New orders appear automatically
- [ ] **Account Orders**: Customer-specific updates work
- [ ] Status indicator shows "WebSocket" or "Polling"
- [ ] Refresh button works
- [ ] Updates continue after WebSocket disconnects (polling fallback)

---

## Common handleOrderUpdate Implementation

If your components don't have `handleOrderUpdate`, add this:

```typescript
const handleOrderUpdate = useCallback((updates: any[]) => {
  console.log(`Received ${updates.length} order updates`);

  // Option 1: Refresh all orders
  dispatch(fetchOrders({}) as any);

  // Option 2: Update specific orders in state (more efficient)
  setOrders((prevOrders) => {
    const updated = [...prevOrders];

    updates.forEach((update) => {
      const index = updated.findIndex((o) => o._id === update.data._id);

      switch (update.type) {
        case 'order:created':
          if (index === -1) {
            updated.unshift(update.data); // Add new order
          }
          break;

        case 'order:updated':
        case 'order:status_changed':
          if (index >= 0) {
            updated[index] = { ...updated[index], ...update.data }; // Update existing
          }
          break;

        case 'order:deleted':
          return updated.filter((o) => o._id !== update.data._id); // Remove deleted
      }
    });

    return updated;
  });
}, [dispatch]);
```

---

## Quick Summary

**For each component:**

1. Import `useOrderRealtimeSync`
2. Add hook with your `branchId`
3. Use `onUpdate` to refresh orders
4. Add status indicator to UI
5. Done! 🎉

**WebSocket + Polling Strategy:**
- Daybook: WebSocket first, polling fallback
- Dispatch: WebSocket first, polling fallback
- All Orders: Polling only (less critical)
- Account Orders: Polling only

This gives you real-time updates everywhere with automatic fallback! 🚀
