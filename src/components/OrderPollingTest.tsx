/**
 * Order Polling Test Page
 * Test the polling functionality with real-time updates
 *
 * To use: Add this to your routes and navigate to /test-polling
 */

import React, { useState, useEffect } from 'react';
import { useOrderPolling } from '../hooks/useOrderPolling';
import { useOrderChangeDetection } from '../hooks/useOrderChangeDetection';
import { OrderUpdate } from '../services/orderPollingService';

export function OrderPollingTestPage() {
  const [branchId, setBranchId] = useState('694e3f76635d7dd01a826b5b'); // Your test branch ID
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [changeDetectionEnabled, setChangeDetectionEnabled] = useState(false);
  const [updateLog, setUpdateLog] = useState<any[]>([]);
  const [orders, setOrders] = useState<Map<string, any>>(new Map());

  // Long Polling Hook
  const {
    updates: pollingUpdates,
    isPolling,
    error: pollingError,
    lastUpdate: pollingLastUpdate,
  } = useOrderPolling(branchId, {
    enabled: pollingEnabled,
    timeout: 30000,
    onUpdate: (updates) => {
      console.log('📡 Polling update received:', updates);
      logUpdate('POLLING', updates);
      applyUpdates(updates);
    },
    onError: (error) => {
      console.error('❌ Polling error:', error);
      logUpdate('ERROR', [{ type: 'error', data: { message: error.message } }]);
    },
  });

  // Change Detection Hook
  const {
    hasChanges,
    changeCount,
    isChecking,
    lastCheck,
  } = useOrderChangeDetection(branchId, {
    enabled: changeDetectionEnabled,
    interval: 5000, // Check every 5 seconds for testing
    onChangeDetected: (count) => {
      console.log(`📊 Changes detected: ${count} orders`);
      logUpdate('CHANGE_DETECTED', [
        { type: 'change_detected', data: { count } },
      ]);
    },
  });

  // Log updates to the UI
  const logUpdate = (source: string, updates: any[]) => {
    setUpdateLog((prev) => [
      {
        source,
        updates,
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, 49), // Keep last 50 updates
    ]);
  };

  // Apply updates to orders map
  const applyUpdates = (updates: OrderUpdate[]) => {
    setOrders((prev) => {
      const updated = new Map(prev);

      updates.forEach((update) => {
        switch (update.type) {
          case 'order:created':
            updated.set(update.data._id, update.data);
            break;

          case 'order:updated':
          case 'order:status_changed':
            const existing = updated.get(update.data._id);
            if (existing) {
              updated.set(update.data._id, { ...existing, ...update.data });
            } else {
              updated.set(update.data._id, update.data);
            }
            break;

          case 'order:deleted':
            updated.delete(update.data._id);
            break;
        }
      });

      return updated;
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔄 Order Polling Test Page</h1>

      {/* Configuration Panel */}
      <div style={styles.panel}>
        <h2>Configuration</h2>
        <div style={styles.config}>
          <label style={styles.label}>
            Branch ID:
            <input
              type="text"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              style={styles.input}
              placeholder="Enter branch ID"
            />
          </label>
        </div>
      </div>

      {/* Long Polling Controls */}
      <div style={styles.panel}>
        <h2>📡 Long Polling</h2>
        <div style={styles.controls}>
          <button
            onClick={() => setPollingEnabled(!pollingEnabled)}
            style={{
              ...styles.button,
              backgroundColor: pollingEnabled ? '#ef4444' : '#10b981',
            }}
          >
            {pollingEnabled ? '⏸ Stop' : '▶️ Start'} Polling
          </button>

          <div style={styles.status}>
            <div>
              Status:{' '}
              <span
                style={{
                  color: isPolling ? '#10b981' : '#6b7280',
                  fontWeight: 'bold',
                }}
              >
                {isPolling ? '🟢 Polling...' : '⚫ Idle'}
              </span>
            </div>
            {pollingLastUpdate && (
              <div style={styles.info}>
                Last Update: {new Date(pollingLastUpdate).toLocaleTimeString()}
              </div>
            )}
            {pollingError && (
              <div style={{ ...styles.info, color: '#ef4444' }}>
                Error: {pollingError.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Detection Controls */}
      <div style={styles.panel}>
        <h2>📊 Change Detection (Lightweight)</h2>
        <div style={styles.controls}>
          <button
            onClick={() => setChangeDetectionEnabled(!changeDetectionEnabled)}
            style={{
              ...styles.button,
              backgroundColor: changeDetectionEnabled ? '#ef4444' : '#3b82f6',
            }}
          >
            {changeDetectionEnabled ? '⏸ Stop' : '▶️ Start'} Detection
          </button>

          <div style={styles.status}>
            <div>
              Status:{' '}
              <span
                style={{
                  color: isChecking ? '#3b82f6' : '#6b7280',
                  fontWeight: 'bold',
                }}
              >
                {isChecking ? '🔵 Checking...' : '⚫ Idle'}
              </span>
            </div>
            {hasChanges && (
              <div style={{ ...styles.info, color: '#f59e0b' }}>
                ⚠️ {changeCount} changes detected!
              </div>
            )}
            {lastCheck && (
              <div style={styles.info}>
                Last Check: {new Date(lastCheck).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders Display */}
      <div style={styles.panel}>
        <h2>📦 Orders ({orders.size})</h2>
        <div style={styles.ordersGrid}>
          {Array.from(orders.values()).length === 0 ? (
            <div style={styles.empty}>
              No orders yet. Start polling or create an order to see updates.
            </div>
          ) : (
            Array.from(orders.values()).map((order) => (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <span style={styles.orderId}>{order.orderId}</span>
                  <span
                    style={{
                      ...styles.orderStatus,
                      backgroundColor: getStatusColor(order.overallStatus),
                    }}
                  >
                    {order.overallStatus}
                  </span>
                </div>
                <div style={styles.orderDetails}>
                  <div>Customer: {order.customerName || 'N/A'}</div>
                  <div>
                    Updated:{' '}
                    {order.updatedAt
                      ? new Date(order.updatedAt).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Update Log */}
      <div style={styles.panel}>
        <h2>📋 Update Log ({updateLog.length})</h2>
        <button
          onClick={() => setUpdateLog([])}
          style={{ ...styles.button, backgroundColor: '#6b7280', marginBottom: '10px' }}
        >
          Clear Log
        </button>
        <div style={styles.log}>
          {updateLog.length === 0 ? (
            <div style={styles.empty}>No updates yet</div>
          ) : (
            updateLog.map((log, index) => (
              <div key={index} style={styles.logEntry}>
                <div style={styles.logHeader}>
                  <span
                    style={{
                      ...styles.logSource,
                      backgroundColor:
                        log.source === 'POLLING'
                          ? '#10b981'
                          : log.source === 'CHANGE_DETECTED'
                          ? '#f59e0b'
                          : '#ef4444',
                    }}
                  >
                    {log.source}
                  </span>
                  <span style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre style={styles.logContent}>
                  {JSON.stringify(log.updates, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Testing Instructions */}
      <div style={styles.panel}>
        <h2>🧪 Testing Instructions</h2>
        <ol style={styles.instructions}>
          <li>Enter your Branch ID above</li>
          <li>Start either Long Polling or Change Detection (or both!)</li>
          <li>Create or update an order in your branch using another tab/window</li>
          <li>
            Watch the update log and orders section for real-time updates
          </li>
          <li>
            <strong>Long Polling:</strong> Waits for updates (up to 30s), shows
            immediately
          </li>
          <li>
            <strong>Change Detection:</strong> Checks every 5 seconds, notifies
            when changes exist
          </li>
        </ol>
      </div>
    </div>
  );
}

// Helper function to get status color
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    'in_progress': '#3b82f6',
    completed: '#10b981',
    dispatched: '#8b5cf6',
    cancelled: '#ef4444',
  };
  return colors[status] || '#6b7280';
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#111827',
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  config: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    width: '300px',
  },
  controls: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  status: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  info: {
    fontSize: '13px',
    color: '#6b7280',
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  orderCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '15px',
    backgroundColor: '#f9fafb',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  orderStatus: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
  },
  orderDetails: {
    fontSize: '13px',
    color: '#6b7280',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  log: {
    maxHeight: '400px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  logEntry: {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '10px',
    backgroundColor: '#f9fafb',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  logSource: {
    padding: '2px 8px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '600',
  },
  logTime: {
    fontSize: '12px',
    color: '#6b7280',
  },
  logContent: {
    fontSize: '12px',
    backgroundColor: '#1f2937',
    color: '#10b981',
    padding: '10px',
    borderRadius: '4px',
    overflow: 'auto',
    fontFamily: 'monospace',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
  instructions: {
    lineHeight: '1.8',
    color: '#374151',
    paddingLeft: '20px',
  },
};

export default OrderPollingTestPage;
