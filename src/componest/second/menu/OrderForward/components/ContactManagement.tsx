/**
 * ContactManagement - Premium Contact Management Component
 * Manages contacts, pending requests, and sent requests for order forwarding
 */

import React, { useState, useEffect, useCallback } from 'react';
// Centralized Icons
import {
  GroupIcon as PeopleIcon,
  PersonAddIcon,
  CheckCircleIcon as CheckIcon,
  CloseIcon,
  AccessTimeIcon,
  SendIcon,
  RefreshIcon,
  ErrorIcon as ErrorOutlineIcon,
} from './icons';
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
  const [processingId, setProcessingId] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

  // Get authentication details
  const getToken = useCallback(() => {
    return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  }, []);

  const getBranchId = useCallback(() => {
    return localStorage.getItem('selectedBranchId') || '';
  }, []);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v2/contacts`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setContacts(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch contacts');
      }
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getToken, getBranchId]);

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v2/contacts/pending`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pending requests: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setPendingRequests(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch pending requests');
      }
    } catch (err: any) {
      console.error('Error fetching pending requests:', err);
      setError(err.message || 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getToken, getBranchId]);

  // Fetch sent requests
  const fetchSentRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v2/contacts/sent`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sent requests: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setSentRequests(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch sent requests');
      }
    } catch (err: any) {
      console.error('Error fetching sent requests:', err);
      setError(err.message || 'Failed to load sent requests');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getToken, getBranchId]);

  // Accept contact request
  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    setError(null);
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

      if (!response.ok) {
        throw new Error(`Failed to accept request: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        // Refresh lists
        await Promise.all([fetchPendingRequests(), fetchContacts()]);
      } else {
        throw new Error(data.message || 'Failed to accept request');
      }
    } catch (err: any) {
      console.error('Error accepting request:', err);
      setError(err.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  // Deny contact request
  const handleDeny = async (requestId: string) => {
    setProcessingId(requestId);
    setError(null);
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

      if (!response.ok) {
        throw new Error(`Failed to deny request: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchPendingRequests();
      } else {
        throw new Error(data.message || 'Failed to deny request');
      }
    } catch (err: any) {
      console.error('Error denying request:', err);
      setError(err.message || 'Failed to deny request');
    } finally {
      setProcessingId(null);
    }
  };

  // Refresh current tab
  const handleRefresh = () => {
    if (activeTab === 'contacts') {
      fetchContacts();
    } else if (activeTab === 'pending') {
      fetchPendingRequests();
    } else if (activeTab === 'sent') {
      fetchSentRequests();
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
  }, [activeTab, fetchContacts, fetchPendingRequests, fetchSentRequests]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content contact-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>
              <PeopleIcon width={24} height={24} style={{ marginRight: 8 }} />
              Contact Management
            </h2>
            <p className="subtitle">Manage your order forwarding network</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-close"
              onClick={handleRefresh}
              title="Refresh"
              disabled={loading}
            >
              <RefreshIcon width={20} height={20} />
            </button>
            <button className="btn-close" onClick={onClose} title="Close">
              <CloseIcon width={20} height={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <PeopleIcon width={18} height={18} />
            <span>Contacts</span>
            {contacts.length > 0 && <span className="tab-count">({contacts.length})</span>}
          </button>
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <AccessTimeIcon width={18} height={18} />
            <span>Pending</span>
            {pendingRequests.length > 0 && <span className="tab-count">({pendingRequests.length})</span>}
          </button>
          <button
            className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <SendIcon width={18} height={18} />
            <span>Sent</span>
            {sentRequests.length > 0 && <span className="tab-count">({sentRequests.length})</span>}
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {error && (
            <div className="error-alert">
              <ErrorOutlineIcon width={20} height={20} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading {activeTab}...</p>
            </div>
          ) : (
            <>
              {/* Contacts Tab */}
              {activeTab === 'contacts' && (
                <div className="contacts-list">
                  {contacts.length === 0 ? (
                    <div className="empty-state">
                      <PersonAddIcon width={64} height={64} />
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
                          <div className="contact-meta">
                            Connected on {formatDate(contact.connectedAt)}
                          </div>
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
                      <AccessTimeIcon width={64} height={64} />
                      <p>No pending requests</p>
                      <small>You're all caught up!</small>
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
                            <div className="request-message">"{request.message}"</div>
                          )}
                          <div className="contact-meta">
                            Requested {formatDate(request.requestedAt)}
                          </div>
                        </div>
                        <div className="request-actions">
                          <button
                            className="btn-accept"
                            onClick={() => handleAccept(request._id)}
                            disabled={processingId === request._id}
                          >
                            <CheckIcon width={16} height={16} />
                            {processingId === request._id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            className="btn-deny"
                            onClick={() => handleDeny(request._id)}
                            disabled={processingId === request._id}
                          >
                            <CloseIcon width={16} height={16} />
                            {processingId === request._id ? 'Processing...' : 'Deny'}
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
                      <SendIcon width={64} height={64} />
                      <p>No sent requests</p>
                      <small>Start by sending a contact request</small>
                    </div>
                  ) : (
                    sentRequests.map(request => (
                      <div key={request._id} className="request-item">
                        <div className="contact-avatar">
                          {request.toUserId ? request.toUserId.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="request-info">
                          <div className="contact-name">
                            {request.fromUserName || 'Contact Request'}
                          </div>
                          <div className="contact-role">To: {request.toUserId}</div>
                          {request.message && (
                            <div className="request-message">"{request.message}"</div>
                          )}
                          <div className="contact-meta">
                            Sent {formatDate(request.requestedAt)}
                          </div>
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
