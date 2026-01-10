import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Check, X, Clock, Send, Search, AlertCircle, Package, MessageCircle, Trash2, Forward } from 'lucide-react';
import MyOrdersModal from './MyOrdersModal';
import './ConnectionManagement.css';

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
  toUserName?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'denied';
  requestedAt: string;
}

interface ConnectionManagementProps {
  onClose: () => void;
  onOpenChat?: (personId: string, personName: string, personEmail?: string) => void;
}

const ConnectionManagement: React.FC<ConnectionManagementProps> = ({ onClose, onOpenChat }) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'pending' | 'sent' | 'send'>('contacts');

  // Data states
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ContactRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ContactRequest[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);

  // MyOrdersModal state
  const [myOrdersModalOpen, setMyOrdersModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    id: string;
    name: string;
    forwardedCount: number;
    receivedCount: number;
  } | null>(null);

  // Send request states
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [message, setMessage] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = 'http://localhost:4000/dev';

  const getToken = () => localStorage.getItem('authToken') || '';
  const getBranchId = () => localStorage.getItem('selectedBranchId') || '';

  // ============================================================================
  // FETCH FUNCTIONS
  // ============================================================================

  // Fetch my contacts (connected people)
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
      } else {
        setError(data.message || 'Failed to fetch contacts');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending requests (received)
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
      } else {
        setError(data.message || 'Failed to fetch pending requests');
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
      } else {
        setError(data.message || 'Failed to fetch sent requests');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all people (for sending requests)
  const fetchAllPeople = async () => {
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
      if (data.success) {
        setAllPeople(data.data || []);
        setFilteredPeople(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch people');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ACTION FUNCTIONS
  // ============================================================================

  // Send contact request
  const handleSendRequest = async () => {
    if (!selectedPerson) {
      setError('Please select a person');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

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
        setSuccess(`Connection request sent to ${selectedPerson.fullName || selectedPerson.username}!`);
        setSelectedPerson(null);
        setMessage('');
        // Switch to sent requests tab
        setTimeout(() => {
          setActiveTab('sent');
          fetchSentRequests();
        }, 1500);
      } else {
        setError(data.message || 'Failed to send request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  // Accept request
  const handleAccept = async (requestId: string) => {
    setError(null);
    setSuccess(null);
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
        setSuccess('Connection accepted!');
        fetchPendingRequests();
        fetchContacts();
      } else {
        setError(data.message || 'Failed to accept request');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Deny request
  const handleDeny = async (requestId: string) => {
    setError(null);
    setSuccess(null);
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
        setSuccess('Request denied');
        fetchPendingRequests();
      } else {
        setError(data.message || 'Failed to deny request');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle view orders for a contact
  const handleViewOrders = async (contactId: string, contactName: string) => {
    try {
      // Fetch order counts for this contact
      const [forwardedRes, receivedRes] = await Promise.all([
        fetch(`${API_BASE}/v2/orders/forwarded?contactId=${contactId}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'x-selected-branch': getBranchId()
          }
        }),
        fetch(`${API_BASE}/v2/orders/received?contactId=${contactId}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'x-selected-branch': getBranchId()
          }
        })
      ]);

      const forwardedData = await forwardedRes.json();
      const receivedData = await receivedRes.json();

      const forwardedCount = forwardedData.success ? (forwardedData.data?.length || 0) : 0;
      const receivedCount = receivedData.success ? (receivedData.data?.length || 0) : 0;

      setSelectedContact({
        id: contactId,
        name: contactName,
        forwardedCount,
        receivedCount
      });
      setMyOrdersModalOpen(true);
    } catch (err) {
      console.error('Error fetching order counts:', err);
      // Still open modal with 0 counts
      setSelectedContact({
        id: contactId,
        name: contactName,
        forwardedCount: 0,
        receivedCount: 0
      });
      setMyOrdersModalOpen(true);
    }
  };

  // Handle forward order to contact
  const handleForwardOrder = (contactId: string, contactName: string) => {
    // TODO: Open forward order modal/form
    setSuccess(`Opening forward order to ${contactName}...`);
    console.log('Forward order to:', contactId, contactName);
  };

  // Handle chat with contact
  const handleChat = (contactId: string, contactName: string, contactEmail?: string) => {
    console.log('[ConnectionManagement] Opening chat with:', contactId, contactName, contactEmail);
    if (onOpenChat) {
      onOpenChat(contactId, contactName, contactEmail);
    } else {
      console.warn('[ConnectionManagement] onOpenChat prop not provided');
    }
  };

  // Handle remove connection
  const handleRemoveConnection = async (contactId: string, contactName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${contactName} from your connections?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${API_BASE}/v2/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'x-selected-branch': getBranchId()
        }
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(`Removed ${contactName} from connections`);
        fetchContacts();
      } else {
        setError(data.message || 'Failed to remove connection');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove connection');
    }
  };

  // ============================================================================
  // SEARCH & FILTER
  // ============================================================================

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPeople(allPeople);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = allPeople.filter(p =>
      (p.fullName?.toLowerCase().includes(term)) ||
      (p.username?.toLowerCase().includes(term)) ||
      (p.email?.toLowerCase().includes(term)) ||
      (p.roleName?.toLowerCase().includes(term))
    );
    setFilteredPeople(filtered);
  }, [searchTerm, allPeople]);

  // ============================================================================
  // LOAD DATA BASED ON TAB
  // ============================================================================

  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    } else if (activeTab === 'pending') {
      fetchPendingRequests();
    } else if (activeTab === 'sent') {
      fetchSentRequests();
    } else if (activeTab === 'send') {
      fetchAllPeople();
    }
  }, [activeTab]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="connection-modal">
      {/* Tabs */}
      <div className="tabs">
          <button
            className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Users size={18} />
            My Contacts ({contacts.length})
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
          <button
            className={`tab ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            <UserPlus size={18} />
            Send Request
          </button>
      </div>

      {/* Content */}
      <div className="modal-body">
          {/* Alerts */}
          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="success-alert">
              <Check size={18} />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {/* MY CONTACTS TAB */}
              {activeTab === 'contacts' && (
                <div className="contacts-list">
                  {contacts.length === 0 ? (
                    <div className="empty-state">
                      <Users size={48} />
                      <p>No connections yet</p>
                      <small>Send connection requests to start forwarding orders</small>
                      <button
                        className="btn btn-primary"
                        onClick={() => setActiveTab('send')}
                        style={{ marginTop: '16px' }}
                      >
                        <UserPlus size={18} /> Send Request
                      </button>
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
                        <div className="contact-actions" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleViewOrders(contact.userId, contact.userName)}
                            title="View Orders"
                          >
                            <Package size={16} />
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleForwardOrder(contact.userId, contact.userName)}
                            title="Forward Order"
                          >
                            <Forward size={16} />
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleChat(contact.userId, contact.userName, contact.userEmail)}
                            title="Chat"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button
                            className="btn btn-deny"
                            onClick={() => handleRemoveConnection(contact.userId, contact.userName)}
                            title="Remove Connection"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* PENDING REQUESTS TAB */}
              {activeTab === 'pending' && (
                <div className="requests-list">
                  {pendingRequests.length === 0 ? (
                    <div className="empty-state">
                      <Clock size={48} />
                      <p>No pending requests</p>
                      <small>Requests you receive will appear here</small>
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
                          <button
                            className="btn btn-primary"
                            onClick={() => handleChat(request.fromUserId, request.fromUserName, request.fromUserEmail)}
                            title="Chat"
                          >
                            <MessageCircle size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SENT REQUESTS TAB */}
              {activeTab === 'sent' && (
                <div className="requests-list">
                  {sentRequests.length === 0 ? (
                    <div className="empty-state">
                      <Send size={48} />
                      <p>No sent requests</p>
                      <small>Requests you send will appear here</small>
                      <button
                        className="btn btn-primary"
                        onClick={() => setActiveTab('send')}
                        style={{ marginTop: '16px' }}
                      >
                        <UserPlus size={18} /> Send Request
                      </button>
                    </div>
                  ) : (
                    sentRequests.map(request => (
                      <div key={request._id} className="request-item">
                        <div className="contact-avatar">
                          {request.toUserName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="request-info">
                          <div className="contact-name">{request.toUserName || 'User'}</div>
                          <div className="contact-role">
                            Sent {new Date(request.requestedAt).toLocaleDateString()}
                          </div>
                          {request.message && (
                            <div className="request-message">{request.message}</div>
                          )}
                        </div>
                        <div className={`contact-badge ${request.status}`}>
                          {request.status}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SEND REQUEST TAB */}
              {activeTab === 'send' && (
                <div className="send-request-content">
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
                  <div className="people-list">
                    {filteredPeople.length === 0 ? (
                      <div className="empty-message">
                        {searchTerm
                          ? 'No users found matching your search'
                          : 'All available users are already in your contacts'}
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

                  {/* Message (optional) */}
                  {selectedPerson && (
                    <div className="message-section">
                      <label htmlFor="connection-message">
                        Message (Optional)
                      </label>
                      <textarea
                        id="connection-message"
                        placeholder="Add a message with your request..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        maxLength={500}
                      />
                      <div className="char-count">{message.length}/500</div>
                    </div>
                  )}

                  {/* Send Button */}
                  {selectedPerson && (
                    <div className="send-button-container">
                      <button
                        className="btn btn-primary btn-large"
                        onClick={handleSendRequest}
                        disabled={sending}
                      >
                        {sending ? (
                          <>
                            <span className="spinner-small"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} />
                            Send Connection Request to {selectedPerson.fullName || selectedPerson.username}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      {/* MyOrdersModal */}
      {selectedContact && (
        <MyOrdersModal
          isOpen={myOrdersModalOpen}
          onClose={() => {
            setMyOrdersModalOpen(false);
            setSelectedContact(null);
          }}
          contactName={selectedContact.name}
          contactId={selectedContact.id}
          forwardedCount={selectedContact.forwardedCount}
          receivedCount={selectedContact.receivedCount}
        />
      )}
    </div>
  );
};

export default ConnectionManagement;
