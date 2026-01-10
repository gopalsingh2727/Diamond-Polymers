import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Check, X, Clock, Send } from 'lucide-react';
import './ContactManagement.css';

interface Contact {
  _id: string;
  userId: string;
  userRole: string;
  userName: string;
  userEmail: string;
  connectedAt: string;
}

interface ContactRequest {
  _id: string;
  fromUserId: string;
  fromUserRole: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'denied';
  requestedAt: string;
}

interface ContactManagementProps {
  onClose: () => void;
}

const ContactManagement: React.FC<ContactManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'pending' | 'sent'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ContactRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'http://localhost:4000/dev';

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  const getBranchId = () => {
    return localStorage.getItem('selectedBranchId') || '';
  };

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v2/contacts`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId()
        }
      });
      const data = await response.json();
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v2/contacts/pending`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId()
        }
      });
      const data = await response.json();
      if (data.success) {
        setPendingRequests(data.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sent requests
  const fetchSentRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v2/contacts/sent`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId()
        }
      });
      const data = await response.json();
      if (data.success) {
        setSentRequests(data.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Accept contact request
  const handleAccept = async (requestId: string) => {
    try {
      const response = await fetch(`${API_BASE}/v2/contacts/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId()
        },
        body: JSON.stringify({ requestId, action: 'accept' })
      });
      const data = await response.json();
      if (data.success) {
        // Refresh lists
        fetchPendingRequests();
        fetchContacts();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Deny contact request
  const handleDeny = async (requestId: string) => {
    try {
      const response = await fetch(`${API_BASE}/v2/contacts/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId()
        },
        body: JSON.stringify({ requestId, action: 'deny' })
      });
      const data = await response.json();
      if (data.success) {
        fetchPendingRequests();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    } else if (activeTab === 'pending') {
      fetchPendingRequests();
    } else if (activeTab === 'sent') {
      fetchSentRequests();
    }
  }, [activeTab]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content contact-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2><Users size={24} /> Contacts</h2>
            <p className="subtitle">Manage your forwarding contacts</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Users size={18} />
            Contacts ({contacts.length})
          </button>
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock size={18} />
            Pending ({pendingRequests.length})
          </button>
          <button
            className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <Send size={18} />
            Sent ({sentRequests.length})
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {error && (
            <div className="error-alert">
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {/* Contacts Tab */}
              {activeTab === 'contacts' && (
                <div className="contacts-list">
                  {contacts.length === 0 ? (
                    <div className="empty-state">
                      <UserPlus size={48} />
                      <p>No contacts yet</p>
                      <small>Send contact requests to start forwarding orders</small>
                    </div>
                  ) : (
                    contacts.map(contact => (
                      <div key={contact._id} className="contact-item">
                        <div className="contact-avatar">
                          {contact.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="contact-info">
                          <div className="contact-name">{contact.userName}</div>
                          <div className="contact-role">{contact.userRole}</div>
                          <div className="contact-email">{contact.userEmail}</div>
                        </div>
                        <div className="contact-badge connected">Connected</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pending Requests Tab */}
              {activeTab === 'pending' && (
                <div className="requests-list">
                  {pendingRequests.length === 0 ? (
                    <div className="empty-state">
                      <Clock size={48} />
                      <p>No pending requests</p>
                    </div>
                  ) : (
                    pendingRequests.map(request => (
                      <div key={request._id} className="request-item">
                        <div className="contact-avatar">
                          {request.fromUserName.charAt(0).toUpperCase()}
                        </div>
                        <div className="request-info">
                          <div className="contact-name">{request.fromUserName}</div>
                          <div className="contact-role">{request.fromUserRole}</div>
                          <div className="contact-email">{request.fromUserEmail}</div>
                          {request.message && (
                            <div className="request-message">{request.message}</div>
                          )}
                        </div>
                        <div className="request-actions">
                          <button
                            className="btn btn-accept"
                            onClick={() => handleAccept(request._id)}
                          >
                            <Check size={16} /> Accept
                          </button>
                          <button
                            className="btn btn-deny"
                            onClick={() => handleDeny(request._id)}
                          >
                            <X size={16} /> Deny
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Sent Requests Tab */}
              {activeTab === 'sent' && (
                <div className="requests-list">
                  {sentRequests.length === 0 ? (
                    <div className="empty-state">
                      <Send size={48} />
                      <p>No sent requests</p>
                    </div>
                  ) : (
                    sentRequests.map(request => (
                      <div key={request._id} className="request-item">
                        <div className="contact-avatar">
                          {request.toUserId ? 'U' : 'U'}
                        </div>
                        <div className="request-info">
                          <div className="contact-name">User</div>
                          <div className="contact-role">Status: {request.status}</div>
                        </div>
                        <div className={`contact-badge ${request.status}`}>
                          {request.status}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManagement;
