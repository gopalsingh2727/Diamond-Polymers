/**
 * Low Stock Alerts Component
 * Displays items with low or critical stock levels
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store';
import { creditInventory } from '../../../../redux/unifiedV2/inventoryActions';
import CreditDebitModal from './CreditDebitModal';

interface LowStockAlertsProps {
  inventory: any[];
  loading: boolean;
  onRefresh: () => void;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({
  inventory,
  loading,
  onRefresh,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');

  // Get items with low stock
  const getLowStockItems = () => {
    return inventory
      .map((item) => {
        const available = item.currentQuantity - (item.reservedQuantity || 0);
        const minLevel = item.minimumStockLevel || 0;

        let severity: 'normal' | 'warning' | 'critical' = 'normal';
        if (available <= 0 || available <= minLevel * 0.5) {
          severity = 'critical';
        } else if (available <= minLevel) {
          severity = 'warning';
        }

        return { ...item, available, severity };
      })
      .filter((item) => item.severity !== 'normal')
      .filter((item) => filterSeverity === 'all' || item.severity === filterSeverity)
      .sort((a, b) => {
        // Sort critical first, then warning
        if (a.severity === 'critical' && b.severity !== 'critical') return -1;
        if (a.severity !== 'critical' && b.severity === 'critical') return 1;
        return a.available - b.available;
      });
  };

  const lowStockItems = getLowStockItems();

  const handleQuickRestock = (item: any) => {
    setSelectedItem(item);
  };

  const handleModalSubmit = async (data: {
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    if (!selectedItem) return;

    try {
      await dispatch(creditInventory(selectedItem._id, data));
      setSelectedItem(null);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to restock');
    }
  };

  // Count by severity
  const criticalCount = inventory.filter((item) => {
    const available = item.currentQuantity - (item.reservedQuantity || 0);
    const minLevel = item.minimumStockLevel || 0;
    return available <= 0 || available <= minLevel * 0.5;
  }).length;

  const warningCount = inventory.filter((item) => {
    const available = item.currentQuantity - (item.reservedQuantity || 0);
    const minLevel = item.minimumStockLevel || 0;
    return available > minLevel * 0.5 && available <= minLevel;
  }).length;

  if (loading) {
    return (
      <div className="inventory-loading">
        Loading alerts...
      </div>
    );
  }

  return (
    <div className="low-stock-alerts">
      {/* Alert Summary */}
      <div className="alert-summary">
        <div
          className={`alert-summary-card critical ${filterSeverity === 'critical' ? 'active' : ''}`}
          onClick={() => setFilterSeverity(filterSeverity === 'critical' ? 'all' : 'critical')}
        >
          <div className="alert-count">{criticalCount}</div>
          <div className="alert-label">Critical</div>
        </div>
        <div
          className={`alert-summary-card warning ${filterSeverity === 'warning' ? 'active' : ''}`}
          onClick={() => setFilterSeverity(filterSeverity === 'warning' ? 'all' : 'warning')}
        >
          <div className="alert-count">{warningCount}</div>
          <div className="alert-label">Warning</div>
        </div>
        <div
          className={`alert-summary-card total ${filterSeverity === 'all' ? 'active' : ''}`}
          onClick={() => setFilterSeverity('all')}
        >
          <div className="alert-count">{criticalCount + warningCount}</div>
          <div className="alert-label">Total Alerts</div>
        </div>
      </div>

      {/* Alert List */}
      {lowStockItems.length > 0 ? (
        <div className="alert-list">
          {lowStockItems.map((item) => (
            <div key={item._id} className={`alert-card ${item.severity}`}>
              <div className="alert-card-header">
                <span className={`severity-indicator ${item.severity}`}>
                  {item.severity === 'critical' ? 'CRITICAL' : 'WARNING'}
                </span>
                <span className="option-name">{item.optionId?.name || 'Unknown'}</span>
              </div>
              <div className="alert-card-body">
                <div className="stock-info">
                  <div className="stock-detail">
                    <span className="label">Current:</span>
                    <span className="value">{item.currentQuantity}</span>
                  </div>
                  <div className="stock-detail">
                    <span className="label">Available:</span>
                    <span className="value available">{item.available}</span>
                  </div>
                  <div className="stock-detail">
                    <span className="label">Minimum:</span>
                    <span className="value">{item.minimumStockLevel || 0}</span>
                  </div>
                  <div className="stock-detail">
                    <span className="label">Location:</span>
                    <span className="value">{item.locationId?.name || 'Default'}</span>
                  </div>
                </div>
                <div className="alert-message">
                  {item.available <= 0
                    ? 'Out of stock! Immediate restock required.'
                    : item.severity === 'critical'
                    ? `Only ${item.available} ${item.unit || 'units'} remaining! Below 50% of minimum level.`
                    : `Stock is low. Currently at or below minimum level.`}
                </div>
              </div>
              <div className="alert-card-footer">
                <button
                  className="restock-btn"
                  onClick={() => handleQuickRestock(item)}
                >
                  Quick Restock
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-alerts">
          <div className="no-alerts-icon">&#10003;</div>
          <div className="no-alerts-message">
            {filterSeverity === 'all'
              ? 'All inventory levels are healthy!'
              : `No ${filterSeverity} alerts at this time.`}
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {selectedItem && (
        <CreditDebitModal
          type="credit"
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default LowStockAlerts;
