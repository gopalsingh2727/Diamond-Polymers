import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../store';

// Redux Actions
import {
  fetchContacts,
  fetchPendingRequests,
  fetchSentRequests,
  fetchAllPeople,
  sendConnectionRequest,
  acceptConnectionRequest,
  denyConnectionRequest,
  removeConnection,
} from '../../../../redux/contacts/contactsActions';
import { clearMessages } from '../../../../redux/contacts/contactsSlice';

// Centralized Icons
import {
  GroupIcon as PeopleIcon,
  PersonAddIcon,
  CheckCircleIcon as CheckIcon,
  CloseIcon,
  AccessTimeIcon,
  SendIcon,
  SearchIcon,
  ErrorIcon,
  InventoryIcon,
  MessageIcon as ChatIcon,
  CancelIcon as DeleteIcon,
  ForwardIcon,
} from './icons';

// Components
import MyOrdersModal from './MyOrdersModal';
import './ConnectionManagement.css';

interface ConnectionManagementProps {
  onClose: () => void;
  onOpenChat?: (personId: string, personName: string, personEmail?: string) => void;
}

const ConnectionManagement: React.FC<ConnectionManagementProps> = ({ onClose, onOpenChat }) => {
  const dispatch = useDispatch<AppDispatch>();

  console.log('[ConnectionManagement] Component rendered');

  // ========== STATE ==========
  const [activeTab, setActiveTab] = useState<'contacts' | 'pending' | 'sent' | 'send'>('contacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [message, setMessage] = useState('');

  // MyOrdersModal state
  const [myOrdersModalOpen, setMyOrdersModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    id: string;
    name: string;
    forwardedCount: number;
    receivedCount: number;
  } | null>(null);

  // ========== REDUX SELECTORS ==========
  const {
    contacts,
    contactsLoading,
    contactsError,
    pendingRequests,
    pendingLoading,
    pendingError,
    sentRequests,
    sentLoading,
    sentError,
    allPeople,
    peopleLoading,
    peopleError,
    actionLoading,
    actionError,
    actionSuccess,
  } = useSelector((state: RootState) => state.contacts);

  const API_BASE = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

  // ========== FILTERED PEOPLE (NO FILTERING - backend handles search) ==========
  // Backend /v2/contacts/search already filters by search term
  const filteredPeople = allPeople;

  // ========== EFFECTS ==========

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'contacts') {
      (dispatch as any)(fetchContacts());
    } else if (activeTab === 'pending') {
      (dispatch as any)(fetchPendingRequests());
    } else if (activeTab === 'sent') {
      (dispatch as any)(fetchSentRequests());
    }
    // Note: 'send' tab triggers search via searchTerm effect below
  }, [activeTab, dispatch]);

  // Search users when search term changes (with debounce)
  useEffect(() => {
    if (activeTab !== 'send') return;

    // Debounce search by 500ms
    const timeoutId = setTimeout(() => {
      console.log('[ConnectionManagement] Searching for:', searchTerm);
      (dispatch as any)(fetchAllPeople(searchTerm));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTab, dispatch]);

  // Clear messages after showing them
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timeout = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [actionSuccess, actionError, dispatch]);

  // If request sent successfully, switch to sent tab
  useEffect(() => {
    if (actionSuccess && actionSuccess.includes('request sent')) {
      setTimeout(() => {
        setActiveTab('sent');
        setSelectedPerson(null);
        setMessage('');
      }, 1500);
    }
  }, [actionSuccess]);

  // ========== HANDLERS ==========

  const handleSendRequest = async () => {
    if (!selectedPerson) return;

    await (dispatch as any)(sendConnectionRequest(
      selectedPerson._id,
      selectedPerson.role,
      message
    ));
  };

  const handleAccept = async (requestId: string) => {
    await (dispatch as any)(acceptConnectionRequest(requestId));
  };

  const handleDeny = async (requestId: string) => {
    await (dispatch as any)(denyConnectionRequest(requestId));
  };

  const handleRemoveConnection = async (contactId: string, contactName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${contactName} from your connections?`)) {
      return;
    }
    await (dispatch as any)(removeConnection(contactId, contactName));
  };

  const handleViewOrders = async (contactId: string, contactName: string) => {
    try {
      const getToken = () => localStorage.getItem('authToken') || '';
      const getBranchId = () => localStorage.getItem('selectedBranchId') || '';

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
      setSelectedContact({
        id: contactId,
        name: contactName,
        forwardedCount: 0,
        receivedCount: 0
      });
      setMyOrdersModalOpen(true);
    }
  };

  const handleForwardOrder = (contactId: string, contactName: string) => {
    // TODO: Open forward order modal/form
    console.log('Forward order to:', contactId, contactName);
  };

  const handleChat = (contactId: string, contactName: string, contactEmail?: string) => {
    console.log('[ConnectionManagement] Opening chat with:', contactId, contactName, contactEmail);
    if (onOpenChat) {
      onOpenChat(contactId, contactName, contactEmail);
    }
  };

  // ========== LOADING STATE ==========
  const isLoading = contactsLoading || pendingLoading || sentLoading || peopleLoading;
  const currentError = contactsError || pendingError || sentError || peopleError;

  // ========== RENDER ==========
  return (
    <div className="connection-modal">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <PeopleIcon width={18} height={18} />
          My Contacts ({contacts.length})
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <AccessTimeIcon width={18} height={18} />
          Pending ({pendingRequests.length})
        </button>
        <button
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <SendIcon width={18} height={18} />
          Sent ({sentRequests.length})
        </button>
        <button
          className={`tab ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          <PersonAddIcon width={18} height={18} />
          Send Request
        </button>
      </div>

      {/* Content */}
      <div className="modal-body">
        {/* Alerts */}
        {(actionError || currentError) && (
          <div className="error-alert">
            <ErrorIcon width={18} height={18} />
            <span>{actionError || currentError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="success-alert">
            <CheckIcon width={18} height={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* MY CONTACTS TAB */}
            {activeTab === 'contacts' && (
              <div className="contacts-list">
                {contacts.length === 0 ? (
                  <div className="empty-state">
                    <PeopleIcon width={48} height={48} />
                    <p>No connections yet</p>
                    <small>Send connection requests to start forwarding orders</small>
                    <button
                      className="btn btn-primary"
                      onClick={() => setActiveTab('send')}
                      style={{ marginTop: '16px' }}
                    >
                      <PersonAddIcon width={18} height={18} /> Send Request
                    </button>
                  </div>
                ) : (
                  contacts.map(contact => (
                    <div key={contact._id} className="contact-item">
                      <div className="contact-avatar">
                        {(contact.userName || 'U').charAt(0).toUpperCase()}
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
                          <InventoryIcon width={16} height={16} />
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleForwardOrder(contact.userId, contact.userName)}
                          title="Forward Order"
                        >
                          <ForwardIcon width={16} height={16} />
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleChat(contact.userId, contact.userName, contact.userEmail)}
                          title="Chat"
                        >
                          <ChatIcon width={16} height={16} />
                        </button>
                        <button
                          className="btn btn-deny"
                          onClick={() => handleRemoveConnection(contact.userId, contact.userName)}
                          title="Remove Connection"
                        >
                          <DeleteIcon width={16} height={16} />
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
                    <AccessTimeIcon width={48} height={48} />
                    <p>No pending requests</p>
                    <small>Requests you receive will appear here</small>
                  </div>
                ) : (
                  pendingRequests.map(request => (
                    <div key={request._id} className="request-item">
                      <div className="contact-avatar">
                        {(request.fromUserName || 'U').charAt(0).toUpperCase()}
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
                          disabled={actionLoading}
                        >
                          <CheckIcon width={16} height={16} /> Accept
                        </button>
                        <button
                          className="btn btn-deny"
                          onClick={() => handleDeny(request._id)}
                          disabled={actionLoading}
                        >
                          <CloseIcon width={16} height={16} /> Deny
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleChat(request.fromUserId, request.fromUserName, request.fromUserEmail)}
                          title="Chat"
                        >
                          <ChatIcon width={16} height={16} />
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
                    <SendIcon width={48} height={48} />
                    <p>No sent requests</p>
                    <small>Requests you send will appear here</small>
                    <button
                      className="btn btn-primary"
                      onClick={() => setActiveTab('send')}
                      style={{ marginTop: '16px' }}
                    >
                      <PersonAddIcon width={18} height={18} /> Send Request
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
                  <SearchIcon width={18} height={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or role (min 3 characters)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Search hint or loading */}
                {peopleLoading && (
                  <div className="loading-message">
                    <span className="spinner-small"></span>
                    Searching...
                  </div>
                )}

                {/* People List */}
                <div className="people-list">
                  {!peopleLoading && filteredPeople.length === 0 ? (
                    <div className="empty-message">
                      {searchTerm.length === 0
                        ? 'Type at least 3 characters to search for users'
                        : searchTerm.length < 3
                        ? `Type ${3 - searchTerm.length} more character${3 - searchTerm.length > 1 ? 's' : ''} to search`
                        : 'No users found matching your search'}
                    </div>
                  ) : (
                    filteredPeople.map(person => {
                      const canSendRequest = !person.isConnected && !person.hasPendingRequest;

                      return (
                        <div
                          key={person._id}
                          className={`person-item ${selectedPerson?._id === person._id ? 'selected' : ''} ${!canSendRequest ? 'disabled' : ''}`}
                          onClick={() => canSendRequest && setSelectedPerson(person)}
                        >
                          <div className="person-avatar">
                            {(person.fullName || person.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="person-info">
                            <div className="person-name">
                              {person.fullName || person.username || 'Unknown'}
                              {person.companyName && !person.isSameCompany && (
                                <span className="company-badge" title="Different company">
                                  {person.companyName}
                                </span>
                              )}
                            </div>
                            <div className="person-role">{person.roleName}</div>
                            <div className="person-email">{person.email}</div>
                            <div className="person-branch">{person.branchName}</div>
                          </div>
                          <div className="person-status">
                            {person.isConnected && (
                              <span className="status-badge connected">
                                <CheckIcon width={14} height={14} /> Connected
                              </span>
                            )}
                            {person.hasPendingRequest && person.pendingRequestDirection === 'sent' && (
                              <span className="status-badge pending-sent">
                                <AccessTimeIcon width={14} height={14} /> Request Sent
                              </span>
                            )}
                            {person.hasPendingRequest && person.pendingRequestDirection === 'received' && (
                              <span className="status-badge pending-received">
                                <AccessTimeIcon width={14} height={14} /> Request Received
                              </span>
                            )}
                            {canSendRequest && selectedPerson?._id === person._id && (
                              <div className="check-icon">✓</div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message (optional) - only show if person can receive request */}
                {selectedPerson && !selectedPerson.isConnected && !selectedPerson.hasPendingRequest && (
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

                {/* Send Button - only show if person can receive request */}
                {selectedPerson && !selectedPerson.isConnected && !selectedPerson.hasPendingRequest && (
                  <div className="send-button-container">
                    <button
                      className="btn btn-primary btn-large"
                      onClick={handleSendRequest}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <span className="spinner-small"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <PersonAddIcon width={18} height={18} />
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
