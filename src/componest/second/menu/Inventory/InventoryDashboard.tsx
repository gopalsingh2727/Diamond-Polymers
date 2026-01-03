/**
 * Inventory Dashboard
 * Shows all inventories (like OrderTypes) with their linked option types
 * Click to view/edit or see transactions
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../redux/rootReducer';
import { AppDispatch } from '../../../../store';
import { getInventoryV2 } from '../../../redux/unifiedV2/inventoryActions';
import { BackButton } from '../../../allCompones/BackButton';
import './inventory.css';

interface Inventory {
  _id: string;
  name: string;
  code: string;
  description?: string;
  allowedOptionTypes: { _id: string; name: string }[];
  inventoryUnits: { inventoryTypeId: { _id: string; name: string; symbol: string }; isPrimary: boolean }[];
  dynamicCalculations: { name: string; formula: string; unit?: string }[];
  isActive: boolean;
  createdAt: string;
}

const InventoryDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const { list: inventories, loading } = useSelector(
    (state: RootState) => state.v2.inventory
  );

  useEffect(() => {
    dispatch(getInventoryV2());
  }, [dispatch]);

  // Navigate to edit
  const goToEdit = (inventory: Inventory) => {
    navigate('/menu/indexcreateroute/inventory', {
      state: { inventoryData: inventory }
    });
  };

  // Navigate to transactions
  const goToTransactions = (inventory: Inventory, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/menu/inventory/transactions', {
      state: { inventory }
    });
  };

  return (
    <div className="invdash-container">
      {/* Header */}
      <div className="invdash-header">
        <div className="invdash-header-left">
          <BackButton />
          <h1>Inventory Management</h1>
          <span className="invdash-count">{(inventories || []).length} inventories</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="invdash-main">
        {loading ? (
          <div className="invdash-loading">Loading inventories...</div>
        ) : (inventories || []).length === 0 ? (
          <div className="invdash-empty">
            <div className="empty-icon">📦</div>
            <h2>No Inventories</h2>
            <p>No inventory items found</p>
          </div>
        ) : (
          <div className="invdash-grid">
            {(inventories || []).map((inv: Inventory) => (
              <div
                key={inv._id}
                className={`invdash-card ${inv.isActive ? '' : 'inactive'}`}
                onClick={() => goToEdit(inv)}
              >
                <div className="card-header">
                  <span className="card-code">{inv.code}</span>
                  <span className={`card-status ${inv.isActive ? 'active' : 'inactive'}`}>
                    {inv.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="card-name">{inv.name}</h3>

                {inv.description && (
                  <p className="card-desc">{inv.description}</p>
                )}

                <div className="card-section">
                  <label>Option Types</label>
                  <div className="card-tags">
                    {inv.allowedOptionTypes?.length > 0 ? (
                      inv.allowedOptionTypes.slice(0, 3).map((ot: any) => (
                        <span key={ot._id} className="tag">{ot.name}</span>
                      ))
                    ) : (
                      <span className="empty-tag">None</span>
                    )}
                    {inv.allowedOptionTypes?.length > 3 && (
                      <span className="tag more">+{inv.allowedOptionTypes.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="card-section">
                  <label>Units</label>
                  <div className="card-tags">
                    {inv.inventoryUnits?.length > 0 ? (
                      inv.inventoryUnits.map((u: any) => (
                        <span
                          key={u.inventoryTypeId?._id}
                          className={`tag unit ${u.isPrimary ? 'primary' : ''}`}
                        >
                          {u.inventoryTypeId?.symbol || '?'}
                        </span>
                      ))
                    ) : (
                      <span className="empty-tag">None</span>
                    )}
                  </div>
                </div>

                <div className="card-section">
                  <label>Formulas</label>
                  <div className="card-formulas">
                    {inv.dynamicCalculations?.length > 0 ? (
                      <span className="formula-count">
                        {inv.dynamicCalculations.length} calculation(s)
                      </span>
                    ) : (
                      <span className="empty-tag">None</span>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="action-btn transactions"
                    onClick={(e) => goToTransactions(inv, e)}
                  >
                    📋 View Transactions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="invdash-info">
        <h3>How Inventory Works</h3>
        <ul>
          <li><strong>Create:</strong> Define inventory with linked option types and formulas</li>
          <li><strong>Credit/Debit:</strong> Record stock in/out transactions</li>
          <li><strong>Formulas:</strong> Auto-calculate totals based on option specifications</li>
          <li><strong>Reports:</strong> View transaction history and current stock levels</li>
        </ul>
      </div>
    </div>
  );
};

export default InventoryDashboard;
