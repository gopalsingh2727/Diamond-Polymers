/**
 * Forward Order Modal - Reusable modal for forwarding orders
 * Can be used from any orders list page
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConnections,
  fetchPeopleForForwarding,
  forwardOrderToPerson,
  clearError,
  clearSuccess
} from '../../../../redux/orderforward/orderForwardActions';
import { RootState } from '../../../../redux/rootReducer';
import './ForwardOrderModal.css';

interface ForwardOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  onSuccess?: () => void;
}

const ForwardOrderModal: React.FC<ForwardOrderModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onSuccess
}) => {
  const dispatch = useDispatch();
  const {
    connections,
    connectionsLoading,
    loading,
    error,
    successMessage
  } = useSelector((state: RootState) => state.orderForward);

  // Removed branch forwarding - only person-to-person forwarding now
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedPersonRole, setSelectedPersonRole] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Load both connections and people when modal opens
      dispatch(fetchConnections() as any);

      // Load people for forwarding (using /v2/contacts)
      dispatch(fetchPeopleForForwarding() as any).then((result: any) => {
        console.log('📋 People for forwarding result:', result);
        console.log('📋 Result structure:', {
          hasData: !!result?.data,
          hasContacts: !!result?.contacts,
          hasDataContacts: !!result?.data?.contacts,
          isArray: Array.isArray(result),
          keys: result ? Object.keys(result) : []
        });

        // Try different response structures
        let peopleData: any[] = [];

        if (result?.data?.contacts && Array.isArray(result.data.contacts)) {
          // { success, data: { contacts: [...] } }
          peopleData = result.data.contacts;
        } else if (result?.contacts && Array.isArray(result.contacts)) {
          // { success, contacts: [...] }
          peopleData = result.contacts;
        } else if (result?.data && Array.isArray(result.data)) {
          // { success, data: [...people] }
          peopleData = result.data;
        } else if (Array.isArray(result)) {
          // Direct array response
          peopleData = result;
        }

        setPeople(peopleData);
        console.log('✅ Loaded people count:', peopleData.length);
        if (peopleData.length > 0) {
          console.log('✅ Sample person data:', peopleData[0]);
        } else {
          console.warn('⚠️ No people data found in response');
        }
      }).catch((err: any) => {
        console.error('❌ Failed to load people:', err);
        console.error('❌ Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        // Show error in modal
        dispatch({ type: 'FETCH_CONNECTIONS_FAILURE', payload: err.response?.data?.message || 'Failed to load contacts' } as any);
      });

      setSubmitted(false);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    // Auto-close on success
    if (submitted && successMessage) {
      setTimeout(() => {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    }
  }, [submitted, successMessage]);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError() as any), 5000);
    }
  }, [error, dispatch]);

  const handleClose = () => {
    setSelectedPersonId('');
    setSelectedPersonRole('');
    setNotes('');
    setSubmitted(false);
    dispatch(clearError() as any);
    dispatch(clearSuccess() as any);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only forward to person (branch forwarding removed)
    if (!selectedPersonId) {
      alert('Please select a person');
      return;
    }

    if (!selectedPersonRole) {
      alert('Person role is missing. Please select the person again.');
      return;
    }

    // Normalize role to lowercase
    const normalizedRole = selectedPersonRole.toLowerCase().replace(/\s+/g, '_') as 'master_admin' | 'admin' | 'manager' | 'employee';

    console.log('🚀 Forwarding to person:', {
      orderId,
      selectedPersonId,
      selectedPersonRole,
      normalizedRole,
      notes
    });

    try {
      setSubmitted(true);
      await dispatch(forwardOrderToPerson(orderId, selectedPersonId, normalizedRole, notes) as any);
    } catch (err: any) {
      console.error('❌ Failed to forward order to person:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        orderId,
        selectedPersonId,
        normalizedRole
      });
      setSubmitted(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal forward-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📤 Forward Order</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="order-summary">
            <h3>Order: {orderNumber}</h3>
            <p className="help-text">
              Forward this order to a person from your connections.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              ✓ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Person Selector - Branch forwarding removed */}
            <div className="form-group">
              <label htmlFor="targetPerson">
                Select Person to Forward To <span className="required">*</span>
              </label>
              {connectionsLoading ? (
                <div className="loading-inline">Loading contacts...</div>
              ) : people.length === 0 ? (
                <div className="no-connections-warning">
                  <p>⚠️ No contacts available</p>
                  <p className="help-text">
                    You need to have accepted connections with people to forward orders.
                    Go to Connections page to connect with people.
                  </p>
                </div>
              ) : (
                <select
                  id="targetPerson"
                  value={selectedPersonId}
                  onChange={(e) => {
                    const selectedOption = e.target.selectedOptions[0];
                    setSelectedPersonId(e.target.value);
                    setSelectedPersonRole(selectedOption.getAttribute('data-role') || '');
                  }}
                  required
                  disabled={loading}
                >
                  <option value="">-- Select a contact --</option>
                  {people.map((person) => {
                    const displayName = person.userName || person.fullName || person.username || 'Unknown User';
                    const email = person.userEmail || person.email || '';
                    const role = person.userRole || person.role || 'User';
                    const company = person.companyName || '';

                    return (
                      <option
                        key={person.userId || person._id}
                        value={person.userId || person._id}
                        data-role={role}
                      >
                        {displayName} {email && `(${email})`} - {role} {company && `@ ${company}`}
                      </option>
                    );
                  })}
                </select>
              )}
              <small className="help-text">
                Select a person from your accepted connections
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="notes">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this forwarding..."
                rows={4}
                disabled={loading}
                maxLength={500}
              />
              <small className="help-text">
                {notes.length}/500 characters
              </small>
            </div>

            {/* Confirmation notice */}
            {selectedPersonId && (
              <div className="confirmation-notice">
                <strong>What happens when you forward to a person:</strong>
                <ul>
                  <li>✓ The selected person will receive this order assignment</li>
                  <li>✓ They will get a real-time notification</li>
                  <li>✓ The original order stays in your branch</li>
                  <li>✓ You can track their progress on this order</li>
                </ul>
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading || !selectedPersonId || people.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Forwarding...
              </>
            ) : (
              <>
                📤 Forward Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardOrderModal;
