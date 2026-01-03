/**
 * Credit/Debit Modal Component
 * Modal form for adding or removing inventory stock
 */

import React, { useState } from 'react';

interface CreditDebitModalProps {
  type: 'credit' | 'debit';
  item: any;
  onClose: () => void;
  onSubmit: (data: { quantity: number; reason: string; notes?: string }) => Promise<void>;
}

const CreditDebitModal: React.FC<CreditDebitModalProps> = ({
  type,
  item,
  onClose,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const available = item.currentQuantity - (item.reservedQuantity || 0);
  const maxDebit = type === 'debit' ? available : Infinity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    if (type === 'debit' && quantity > available) {
      alert(`Cannot debit more than available quantity (${available})`);
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ quantity, reason: reason.trim(), notes: notes.trim() || undefined });
    } finally {
      setLoading(false);
    }
  };

  const reasonOptions = type === 'credit'
    ? ['Purchase', 'Return', 'Adjustment', 'Initial Stock', 'Transfer In', 'Other']
    : ['Sale', 'Damaged', 'Expired', 'Adjustment', 'Transfer Out', 'Other'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {type === 'credit' ? 'Add Stock (Credit)' : 'Remove Stock (Debit)'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-item-info">
          <p><strong>Option:</strong> {item.optionId?.name || 'Unknown'}</p>
          <p><strong>Location:</strong> {item.locationId?.name || 'Default'}</p>
          <p><strong>Current Stock:</strong> {item.currentQuantity} {item.unit || 'pcs'}</p>
          {type === 'debit' && (
            <p><strong>Available:</strong> {available} {item.unit || 'pcs'}</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={type === 'debit' ? maxDebit : undefined}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="form-input"
              required
            />
            {type === 'debit' && (
              <span className="form-hint">Max: {available}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason *</label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-input"
              required
            >
              <option value="">Select a reason...</option>
              {reasonOptions.map((opt) => (
                <option key={opt} value={opt.toLowerCase()}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              rows={3}
              placeholder="Additional details..."
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-submit ${type}`}
              disabled={loading || quantity <= 0 || !reason}
            >
              {loading ? 'Processing...' : type === 'credit' ? 'Add Stock' : 'Remove Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditDebitModal;
