/**
 * Stock Overview Component
 * Displays inventory items with search, filter, and credit/debit operations
 * Supports multi-unit tracking (e.g., Weight AND Pieces)
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store';
import {
  creditInventory,
  debitInventory,
} from '../../../../redux/unifiedV2/inventoryActions';
import CreditDebitModal from './CreditDebitModal';

interface UnitQuantity {
  inventoryTypeId: string | { _id: string; name: string; symbol: string };
  quantity: number;
  reservedQuantity: number;
  minimumLevel: number;
}

interface StockOverviewProps {
  inventory: any[];
  loading: boolean;
  locations: any[];
  onRefresh: () => void;
}

const StockOverview: React.FC<StockOverviewProps> = ({
  inventory,
  loading,
  locations,
  onRefresh,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'normal'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'credit' | 'debit' | null>(null);

  // Get inventory types for resolving unit names
  const inventoryTypes = useSelector((state: RootState) => state.v2?.inventoryType?.list || []);

  // Helper to get unit info from inventoryTypeId
  const getUnitInfo = (inventoryTypeId: string | { _id: string; name: string; symbol: string }) => {
    if (typeof inventoryTypeId === 'object' && inventoryTypeId !== null) {
      return { name: inventoryTypeId.name, symbol: inventoryTypeId.symbol };
    }
    const unit = inventoryTypes.find((u: any) => u._id === inventoryTypeId);
    return unit ? { name: unit.name, symbol: unit.symbol } : { name: 'Unknown', symbol: '?' };
  };

  // Check if item has multi-unit quantities
  const hasMultiUnitQuantities = (item: any) => {
    return item.quantities && Array.isArray(item.quantities) && item.quantities.length > 0;
  };

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.optionId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locationId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      !filterLocation || item.locationId?._id === filterLocation;

    const isLowStock = item.currentQuantity <= (item.minimumStockLevel || 0);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'low' && isLowStock) ||
      (filterStatus === 'normal' && !isLowStock);

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const handleCredit = (item: any) => {
    setSelectedItem(item);
    setModalType('credit');
  };

  const handleDebit = (item: any) => {
    setSelectedItem(item);
    setModalType('debit');
  };

  const handleModalSubmit = async (data: {
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    if (!selectedItem) return;

    try {
      if (modalType === 'credit') {
        await dispatch(creditInventory(selectedItem._id, data));
      } else {
        await dispatch(debitInventory(selectedItem._id, data));
      }
      setModalType(null);
      setSelectedItem(null);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const getStockStatus = (item: any) => {
    const available = item.currentQuantity - (item.reservedQuantity || 0);
    const minLevel = item.minimumStockLevel || 0;

    if (available <= 0) return { status: 'critical', label: 'Out of Stock' };
    if (available <= minLevel * 0.5) return { status: 'critical', label: 'Critical' };
    if (available <= minLevel) return { status: 'warning', label: 'Low' };
    return { status: 'normal', label: 'Normal' };
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        Loading inventory...
      </div>
    );
  }

  return (
    <div className="stock-overview">
      {/* Filters */}
      <div className="stock-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by option or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="stock-search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="stock-filter-select"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="stock-filter-select"
          >
            <option value="all">All Status</option>
            <option value="low">Low Stock Only</option>
            <option value="normal">Normal Stock</option>
          </select>
        </div>
        <div className="filter-count">
          {filteredInventory.length} of {inventory.length} items
        </div>
      </div>

      {/* Inventory Table */}
      {filteredInventory.length > 0 ? (
        <div className="stock-table-wrapper">
          <table className="stock-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Option</th>
                <th>Location</th>
                <th>Stock Quantities</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, index) => {
                const stockStatus = getStockStatus(item);
                const available = item.currentQuantity - (item.reservedQuantity || 0);
                const hasMultiUnit = hasMultiUnitQuantities(item);

                return (
                  <tr key={item._id} className={`stock-row status-${stockStatus.status}`}>
                    <td>{index + 1}</td>
                    <td className="option-name">{item.optionId?.name || 'Unknown'}</td>
                    <td>{item.locationId?.name || 'Default'}</td>
                    <td className="qty-cell">
                      {hasMultiUnit ? (
                        // Multi-unit display
                        <div className="multi-unit-quantities">
                          {item.quantities.map((q: UnitQuantity, qIndex: number) => {
                            const unitInfo = getUnitInfo(q.inventoryTypeId);
                            const qtyAvailable = q.quantity - (q.reservedQuantity || 0);
                            const isLow = qtyAvailable <= (q.minimumLevel || 0);
                            return (
                              <div key={qIndex} className={`unit-quantity-row ${isLow ? 'low-stock' : ''}`}>
                                <span className="unit-label">{unitInfo.name}:</span>
                                <span className="unit-values">
                                  <span className="unit-current">{q.quantity}</span>
                                  {q.reservedQuantity > 0 && (
                                    <span className="unit-reserved">(-{q.reservedQuantity} reserved)</span>
                                  )}
                                  <span className="unit-available">= {qtyAvailable} {unitInfo.symbol}</span>
                                  {q.minimumLevel > 0 && (
                                    <span className="unit-min">(min: {q.minimumLevel})</span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // Legacy single-unit display
                        <div className="single-unit-quantities">
                          <div className="unit-quantity-row">
                            <span className="unit-values">
                              <span className="unit-current">{item.currentQuantity}</span>
                              {(item.reservedQuantity || 0) > 0 && (
                                <span className="unit-reserved">(-{item.reservedQuantity} reserved)</span>
                              )}
                              <span className="unit-available">= {available} {item.unit || 'pcs'}</span>
                              {(item.minimumStockLevel || 0) > 0 && (
                                <span className="unit-min">(min: {item.minimumStockLevel})</span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${stockStatus.status}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button
                        className="action-btn credit"
                        onClick={() => handleCredit(item)}
                        title="Add Stock"
                      >
                        + Credit
                      </button>
                      <button
                        className="action-btn debit"
                        onClick={() => handleDebit(item)}
                        title="Remove Stock"
                        disabled={available <= 0}
                      >
                        - Debit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="stock-empty">
          {inventory.length === 0
            ? 'No inventory items found. Inventory is auto-created when you create options with inventory-based option types.'
            : `No items match your search "${searchTerm}"`}
        </div>
      )}

      {/* Credit/Debit Modal */}
      {modalType && selectedItem && (
        <CreditDebitModal
          type={modalType}
          item={selectedItem}
          onClose={() => {
            setModalType(null);
            setSelectedItem(null);
          }}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default StockOverview;
