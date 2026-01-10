/**
 * Example Components for Order Polling
 * Shows how to use the polling hooks in your components
 */

import React, { useState, useCallback } from 'react';
import { useOrderPolling } from '../hooks/useOrderPolling';
import { useOrderChangeDetection } from '../hooks/useOrderChangeDetection';

/**
 * Example 1: Long Polling Component (Real-time updates)
 * Best for: Desktop apps, admin dashboards
 */
export function OrderListWithPolling({ branchId }: { branchId: string }) {
  const [orders, setOrders] = useState<any[]>([]);

  // Handle order updates from polling
  const handleUpdate = useCallback((updates: any[]) => {
    console.log(`Received ${updates.length} order updates`);

    setOrders((prevOrders) => {
      const updatedOrders = [...prevOrders];

      updates.forEach((update) => {
        switch (update.type) {
          case 'order:created':
            // Add new order
            updatedOrders.unshift(update.data);
            break;

          case 'order:updated':
          case 'order:status_changed':
            // Update existing order
            const index = updatedOrders.findIndex(
              (o) => o._id === update.data._id
            );
            if (index >= 0) {
              updatedOrders[index] = { ...updatedOrders[index], ...update.data };
            }
            break;

          case 'order:deleted':
            // Remove deleted order
            return updatedOrders.filter((o) => o._id !== update.data._id);
        }
      });

      return updatedOrders;
    });
  }, []);

  // Start long polling
  const { isPolling, error, lastUpdate } = useOrderPolling(branchId, {
    enabled: true,
    timeout: 30000,
    onUpdate: handleUpdate,
    onError: (err) => console.error('Polling error:', err),
  });

  return (
    <div className="order-list">
      <div className="header">
        <h2>Orders (Real-time)</h2>
        {isPolling && (
          <div className="status polling">
            <span className="indicator">●</span> Polling...
          </div>
        )}
        {error && (
          <div className="status error">
            <span className="indicator">●</span> Error: {error.message}
          </div>
        )}
        {lastUpdate && (
          <div className="last-update">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="order-items">
        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-item">
              <div className="order-id">{order.orderId}</div>
              <div className="order-status">{order.overallStatus}</div>
              <div className="order-customer">{order.customerName}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Example 2: Change Detection Component (Periodic checking)
 * Best for: Mobile apps, battery-conscious scenarios
 */
export function OrderListWithChangeDetection({ branchId }: { branchId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Handle change detection
  const handleChangeDetected = useCallback((changeCount: number) => {
    console.log(`Detected ${changeCount} order changes`);
    setShouldRefetch(true);

    // Fetch orders when changes detected
    // You can call your existing fetchOrders function here
    // fetchOrders(branchId).then(setOrders);
  }, [branchId]);

  // Start change detection (checks every 10 seconds)
  const { hasChanges, changeCount, isChecking, lastCheck } = useOrderChangeDetection(
    branchId,
    {
      enabled: true,
      interval: 10000, // Check every 10 seconds
      onChangeDetected: handleChangeDetected,
    }
  );

  return (
    <div className="order-list">
      <div className="header">
        <h2>Orders (Change Detection)</h2>
        {isChecking && (
          <div className="status checking">
            <span className="indicator">●</span> Checking for changes...
          </div>
        )}
        {hasChanges && (
          <div className="status has-changes">
            <span className="indicator">●</span> {changeCount} changes detected
          </div>
        )}
        {lastCheck && (
          <div className="last-check">
            Last check: {new Date(lastCheck).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="order-items">
        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-item">
              <div className="order-id">{order.orderId}</div>
              <div className="order-status">{order.overallStatus}</div>
              <div className="order-customer">{order.customerName}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Example 3: Hybrid Approach (Combines both methods)
 * Use change detection for initial check, then switch to long polling
 */
export function OrderListHybrid({ branchId }: { branchId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [usePolling, setUsePolling] = useState(false);

  // Change detection (runs first)
  const { hasChanges, changeCount } = useOrderChangeDetection(branchId, {
    enabled: !usePolling, // Disable when polling is active
    interval: 10000,
    onChangeDetected: (count) => {
      console.log(`Changes detected: ${count}, switching to polling`);
      setUsePolling(true); // Switch to polling when changes are active
    },
  });

  // Long polling (activates when changes are detected)
  const { isPolling } = useOrderPolling(branchId, {
    enabled: usePolling,
    onUpdate: (updates) => {
      console.log(`Polling update: ${updates.length} orders`);
      // Update orders
      setOrders((prev) => {
        const updated = [...prev];
        updates.forEach((update) => {
          const index = updated.findIndex((o) => o._id === update.data._id);
          if (index >= 0) {
            updated[index] = update.data;
          } else {
            updated.push(update.data);
          }
        });
        return updated;
      });
    },
  });

  return (
    <div className="order-list">
      <div className="header">
        <h2>Orders (Hybrid Mode)</h2>
        {!usePolling && hasChanges && (
          <div className="status">
            {changeCount} changes detected, switching to real-time...
          </div>
        )}
        {isPolling && (
          <div className="status polling">
            <span className="indicator">●</span> Real-time updates active
          </div>
        )}
      </div>

      <div className="order-items">
        {orders.map((order) => (
          <div key={order._id} className="order-item">
            <div className="order-id">{order.orderId}</div>
            <div className="order-status">{order.overallStatus}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 4: Manual Control
 * Full control over polling start/stop
 */
export function OrderListManualControl({ branchId }: { branchId: string }) {
  const [isEnabled, setIsEnabled] = useState(false);

  const { isPolling, updates, startPolling, stopPolling } = useOrderPolling(
    branchId,
    {
      enabled: isEnabled,
    }
  );

  return (
    <div className="order-list">
      <div className="controls">
        <button onClick={() => {
          if (isEnabled) {
            stopPolling();
            setIsEnabled(false);
          } else {
            startPolling();
            setIsEnabled(true);
          }
        }}>
          {isEnabled ? 'Stop' : 'Start'} Polling
        </button>
        {isPolling && <span>Polling active...</span>}
      </div>

      <div className="updates">
        {updates.length} updates received
      </div>
    </div>
  );
}
