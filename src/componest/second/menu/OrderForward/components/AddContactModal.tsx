import React, { useState, useEffect } from 'react';
import { UserPlus, X, AlertCircle, Search } from 'lucide-react';
import './AddContactModal.css';

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

interface AddContactModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'http://localhost:4000/dev';

  const getToken = () => localStorage.getItem('authToken') || '';
  const getBranchId = () => localStorage.getItem('selectedBranchId') || '';

  // Fetch all users (not yet connected)
  const fetchPeople = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v2/orders/forward/people`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId()
        }
      });
      const data = await response.json();

      // This endpoint now returns only connected people, so we need to fetch ALL people
      // We'll need to create a new endpoint or modify this logic
      // For now, let's use the existing endpoint
      if (data.success) {
        setPeople(data.data || []);
        setFilteredPeople(data.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send contact request
  const handleSendRequest = async () => {
    if (!selectedPerson) {
      setError('Please select a person');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/v2/contacts/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId()
        },
        body: JSON.stringify({
          toUserId: selectedPerson._id,
          toUserRole: selectedPerson.role,
          message: message.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to send contact request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send contact request');
    } finally {
      setSending(false);
    }
  };

  // Filter people based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPeople(people);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = people.filter(p =>
      (p.fullName?.toLowerCase().includes(term)) ||
      (p.username?.toLowerCase().includes(term)) ||
      (p.email?.toLowerCase().includes(term)) ||
      (p.roleName?.toLowerCase().includes(term))
    );
    setFilteredPeople(filtered);
  }, [searchTerm, people]);

  useEffect(() => {
    fetchPeople();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-contact-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2><UserPlus size={24} /> Add New Contact</h2>
            <p className="subtitle">Send a contact request to start forwarding orders</p>
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

          {/* Search */}
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* People List */}
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <div className="people-list">
              {filteredPeople.length === 0 ? (
                <div className="empty-message">
                  {searchTerm ? 'No users found matching your search' : 'All available users are already in your contacts'}
                </div>
              ) : (
                filteredPeople.map(person => (
                  <div
                    key={person._id}
                    className={`person-item ${selectedPerson?._id === person._id ? 'selected' : ''}`}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <div className="person-avatar">
                      {(person.fullName || person.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="person-info">
                      <div className="person-name">{person.fullName || person.username}</div>
                      <div className="person-role">{person.roleName}</div>
                      <div className="person-email">{person.email}</div>
                      <div className="person-branch">{person.branchName}</div>
                    </div>
                    {selectedPerson?._id === person._id && (
                      <div className="check-icon">✓</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Message (optional) */}
          {selectedPerson && (
            <div className="message-section">
              <label htmlFor="contact-message">
                Message (Optional)
              </label>
              <textarea
                id="contact-message"
                placeholder="Add a message with your request..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <div className="char-count">{message.length}/500</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSendRequest}
            disabled={!selectedPerson || sending}
          >
            {sending ? (
              <>
                <span className="spinner-small"></span>
                Sending...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Send Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;
