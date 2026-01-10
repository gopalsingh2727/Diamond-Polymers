import React, { useState } from 'react';
import { Send, X, AlertCircle } from 'lucide-react';
import PersonSelector from './PersonSelector';
import './ForwardToPersonModal.css';

interface Person {
  _id: string;
  role: 'master_admin' | 'admin' | 'manager' | 'employee';
  roleName: string;
  username: string;
  email: string;
  fullName?: string;
  designation?: string;
  branchName: string;
}

interface ForwardToPersonModalProps {
  order: any;
  onClose: () => void;
  onForward: (personId: string, personRole: string, notes: string) => Promise<void>;
}

const ForwardToPersonModal: React.FC<ForwardToPersonModalProps> = ({
  order,
  onClose,
  onForward
}) => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [notes, setNotes] = useState('');
  const [forwarding, setForwarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForward = async () => {
    if (!selectedPerson) {
      setError('Please select a person to forward to');
      return;
    }

    setForwarding(true);
    setError(null);

    try {
      await onForward(selectedPerson._id, selectedPerson.role, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to forward order');
    } finally {
      setForwarding(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content forward-person-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Forward Order to Person</h2>
            <p className="order-number">Order: {order.orderId || order.orderNumber}</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <PersonSelector
            onSelect={setSelectedPerson}
            selectedPerson={selectedPerson}
          />

          {/* Notes Section */}
          <div className="notes-section">
            <label htmlFor="forward-notes">
              Notes (Optional)
            </label>
            <textarea
              id="forward-notes"
              placeholder="Add notes for the recipient..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={forwarding}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleForward}
            disabled={!selectedPerson || forwarding}
          >
            {forwarding ? (
              <>
                <span className="spinner-small"></span>
                Forwarding...
              </>
            ) : (
              <>
                <Send size={18} />
                Forward to {selectedPerson ? (selectedPerson.fullName || selectedPerson.username) : 'Person'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardToPersonModal;
