/**
 * Inventory Transactions
 * View and manage credit/debit transactions for an inventory
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../../../redux/rootReducer';
import { AppDispatch } from '../../../../store';
import { getInventoryTransactionsV2, createInventoryTransactionV2, deleteInventoryTransactionV2 } from '../../../redux/unifiedV2/inventoryTransactionActions';
import { getOptionsV2 } from '../../../redux/unifiedV2';
import { BackButton } from '../../../allCompones/BackButton';
import { ToastContainer } from '../../../../components/shared/Toast';
import { useCRUD } from '../../../../hooks/useCRUD';
import './inventoryTransactions.css';

interface TransactionType {
  _id: string;
  inventoryId: string;
  optionId?: { _id: string; name: string };
  type: 'credit' | 'debit' | 'adjustment';
  quantity: number;
  unitQuantities?: { inventoryTypeId: { _id: string; symbol: string }; quantity: number }[];
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  quantityBefore: number;
  quantityAfter: number;
  createdBy?: { name: string };
  createdAt: string;
}

interface Inventory {
  _id: string;
  name: string;
  code: string;
  allowedOptionTypes: { _id: string; name: string }[];
  inventoryUnits: { inventoryTypeId: { _id: string; name: string; symbol: string }; isPrimary: boolean }[];
}

const InventoryTransactions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useCRUD();

  // Get inventory from navigation state
  const inventory = location.state?.inventory as Inventory | undefined;

  // Form state for new transaction
  const [showForm, setShowForm] = useState(false);
  const [txType, setTxType] = useState<'credit' | 'debit'>('credit');
  const [selectedOption, setSelectedOption] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redux state
  const { list: transactions, loading } = useSelector(
    (state: RootState) => state.v2.inventoryTransaction
  );
  const { list: options } = useSelector(
    (state: RootState) => state.v2.option
  );

  useEffect(() => {
    if (inventory?._id) {
      dispatch(getInventoryTransactionsV2({ inventoryId: inventory._id }));
      dispatch(getOptionsV2());
    }
  }, [dispatch, inventory?._id]);

  // Filter options by allowed option types
  const allowedOptionTypeIds = inventory?.allowedOptionTypes?.map(ot => ot._id) || [];
  const filteredOptions = (options || []).filter((opt: any) =>
    allowedOptionTypeIds.includes(opt.optionTypeId?._id || opt.optionTypeId)
  );

  // Handle create transaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inventory?._id) {
      toast.error('Error', 'No inventory selected');
      return;
    }
    if (quantity <= 0) {
      toast.error('Error', 'Quantity must be greater than 0');
      return;
    }
    if (!reason.trim()) {
      toast.error('Error', 'Reason is required');
      return;
    }

    // Get user data from localStorage
    let userId = '';
    let userName = 'Unknown User';
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userId = userData._id || userData.id || '';
        userName = userData.name || userData.username || 'Unknown User';
      }
    } catch (error) {
      console.error('Error parsing userData:', error);
    }

    if (!userId) {
      toast.error('Error', 'User authentication required');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(createInventoryTransactionV2({
        inventoryId: inventory._id,
        optionId: selectedOption || undefined,
        type: txType,
        quantity,
        reason: reason.trim(),
        createdBy: userId,
        createdByName: userName,
      }));

      toast.success('Success', `${txType === 'credit' ? 'Stock added' : 'Stock removed'} successfully`);

      // Refresh transactions
      dispatch(getInventoryTransactionsV2({ inventoryId: inventory._id }));

      // Reset form
      setShowForm(false);
      setSelectedOption('');
      setQuantity(0);
      setReason('');
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || error.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction? This will affect the inventory balance.')) {
      return;
    }

    setDeletingId(transactionId);
    try {
      await dispatch(deleteInventoryTransactionV2(transactionId));
      toast.success('Success', 'Transaction deleted successfully');

      // Refresh transactions
      if (inventory?._id) {
        dispatch(getInventoryTransactionsV2({ inventoryId: inventory._id }));
      }
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || error.message || 'Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  if (!inventory) {
    return (
      <div className="invtx-container">
        <div className="invtx-header">
          <div className="invtx-header-left">
            <BackButton />
            <h1>Inventory Transactions</h1>
          </div>
        </div>
        <div className="invtx-empty">
          <p>No inventory selected. Please go back and select an inventory.</p>
          <button onClick={() => navigate('/menu/inventory')}>
            Go to Inventory Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invtx-container">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Header */}
      <div className="invtx-header">
        <div className="invtx-header-left">
          <BackButton />
          <div className="invtx-header-title">
            <h1>Transactions</h1>
            <span className="invtx-inv-name">{inventory.name} ({inventory.code})</span>
          </div>
        </div>
        <div className="invtx-header-right">
          <button
            className={`invtx-add-btn ${txType === 'credit' ? 'credit' : 'debit'}`}
            onClick={() => {
              setShowForm(!showForm);
              setTxType('credit');
            }}
          >
            + Credit
          </button>
          <button
            className={`invtx-add-btn debit`}
            onClick={() => {
              setShowForm(!showForm);
              setTxType('debit');
            }}
          >
            - Debit
          </button>
        </div>
      </div>

      {/* New Transaction Form */}
      {showForm && (
        <div className="invtx-form-card">
          <form onSubmit={handleSubmit}>
            <div className="invtx-form-header">
              <h3>{txType === 'credit' ? 'Add Stock (Credit)' : 'Remove Stock (Debit)'}</h3>
              <button type="button" className="close-btn" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>

            <div className="invtx-form-row">
              <div className="invtx-form-group">
                <label>Transaction Type</label>
                <div className="invtx-type-toggle">
                  <button
                    type="button"
                    className={`type-btn ${txType === 'credit' ? 'active credit' : ''}`}
                    onClick={() => setTxType('credit')}
                  >
                    + Credit
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${txType === 'debit' ? 'active debit' : ''}`}
                    onClick={() => setTxType('debit')}
                  >
                    - Debit
                  </button>
                </div>
              </div>

              <div className="invtx-form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Enter quantity"
                  min={0}
                  step="any"
                  required
                />
              </div>
            </div>

            <div className="invtx-form-row">
              <div className="invtx-form-group">
                <label>Option (Optional)</label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                >
                  <option value="">-- No specific option --</option>
                  {filteredOptions.map((opt: any) => (
                    <option key={opt._id} value={opt._id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div className="invtx-form-group">
                <label>Reason / Notes *</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Purchase, Sale, Adjustment"
                  required
                />
              </div>
            </div>

            <div className="invtx-form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className={`submit-btn ${txType}`}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Record ${txType === 'credit' ? 'Credit' : 'Debit'}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="invtx-main">
        {loading ? (
          <div className="invtx-loading">Loading transactions...</div>
        ) : (transactions || []).length === 0 ? (
          <div className="invtx-empty">
            <div className="empty-icon">📋</div>
            <h2>No Transactions</h2>
            <p>Record your first credit or debit transaction</p>
          </div>
        ) : (
          <div className="invtx-list">
            <div className="invtx-table-header">
              <span className="col-date">Date</span>
              <span className="col-type">Type</span>
              <span className="col-qty">Quantity</span>
              <span className="col-option">Option</span>
              <span className="col-reason">Reason</span>
              <span className="col-balance">Balance</span>
              <span className="col-actions">Actions</span>
            </div>

            {(transactions || []).map((tx: TransactionType) => (
              <div key={tx._id} className={`invtx-row ${tx.type}`}>
                <span className="col-date">
                  {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className={`col-type ${tx.type}`}>
                  {tx.type === 'credit' ? '+' : '-'} {tx.type.toUpperCase()}
                </span>
                <span className={`col-qty ${tx.type}`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.quantity}
                </span>
                <span className="col-option">
                  {tx.optionId?.name || '-'}
                </span>
                <span className="col-reason">
                  {tx.reason || '-'}
                </span>
                <span className="col-balance">
                  {tx.quantityBefore} → {tx.quantityAfter}
                </span>
                <span className="col-actions">
                  <button
                    className="delete-tx-btn"
                    onClick={() => handleDeleteTransaction(tx._id)}
                    disabled={deletingId === tx._id}
                    title="Delete transaction"
                  >
                    {deletingId === tx._id ? '...' : '🗑️'}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Panel */}
      <div className="invtx-summary">
        <div className="summary-item">
          <label>Total Credits</label>
          <span className="credit">
            +{(transactions || [])
              .filter((t: TransactionType) => t.type === 'credit')
              .reduce((sum: number, t: TransactionType) => sum + t.quantity, 0)}
          </span>
        </div>
        <div className="summary-item">
          <label>Total Debits</label>
          <span className="debit">
            -{(transactions || [])
              .filter((t: TransactionType) => t.type === 'debit')
              .reduce((sum: number, t: TransactionType) => sum + t.quantity, 0)}
          </span>
        </div>
        <div className="summary-item">
          <label>Net Balance</label>
          <span className="balance">
            {(transactions || []).length > 0
              ? (transactions as TransactionType[])[0].quantityAfter
              : 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryTransactions;
