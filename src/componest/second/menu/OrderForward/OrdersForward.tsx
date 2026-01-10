import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, Send, Package, RefreshCw, Clock, CheckCircle, XCircle, Ban, Plus, MessageCircle } from 'lucide-react';
import { BackButton } from '../../../allCompones/BackButton';
import ConnectionManagement from './components/ConnectionManagement';
import MyOrdersModal from './components/MyOrdersModal';
import PersonChat from './components/PersonChat';
import {
  fetchForwardedOrdersFromPerson,
  fetchReceivedOrdersForPerson,
  acceptForwardedOrder,
  denyForwardedOrder
} from '../../../redux/orderforward/orderForwardActions';
import { RootState, AppDispatch } from '../../../../store';
import './OrdersForward.css';

interface OrdersForwardProps {
  initialView?: 'connections' | 'forwarded' | 'pending' | 'accepted' | 'denied';
}

// Helper function to safely extract note text
const getNotesText = (notes: any): string | null => {
  if (!notes) return null;

  try {
    // If notes is an array, get the first note
    if (Array.isArray(notes) && notes.length > 0 && notes[0]?.note) {
      const noteText = notes[0].note;
      return typeof noteText === 'string' ? noteText : null;
    }

    // If notes is a single object with a note property
    if (typeof notes === 'object' && !Array.isArray(notes) && notes.note) {
      const noteText = notes.note;
      return typeof noteText === 'string' ? noteText : null;
    }
  } catch (error) {
    console.error('[getNotesText] Error extracting notes:', error, notes);
  }

  return null;
};

// Helper function to safely get a string value
const safeString = (value: any, fallback: string = ''): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const OrdersForward: React.FC<OrdersForwardProps> = ({ initialView = 'pending' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'connections' | 'forwarded' | 'pending' | 'accepted' | 'denied'>(initialView);

  // Deny modal state
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [denyingOrderId, setDenyingOrderId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');

  // Redux state for person-to-person forwarded orders
  const {
    forwardedOrders,
    forwardedOrdersLoading,
    receivedOrders,
    receivedOrdersLoading,
    loading: actionLoading,
    error: orderForwardError
  } = useSelector((state: RootState) => state.orderForward);

  // Filter received orders by status
  const pendingOrders = Array.isArray(receivedOrders)
    ? receivedOrders.filter((order: any) => order.forwardingStatus === 'pending')
    : [];
  const acceptedOrders = Array.isArray(receivedOrders)
    ? receivedOrders.filter((order: any) => order.forwardingStatus === 'accepted')
    : [];
  const deniedOrders = Array.isArray(receivedOrders)
    ? receivedOrders.filter((order: any) => order.forwardingStatus === 'denied')
    : [];

  // Loading states
  const pendingOrdersLoading = receivedOrdersLoading;
  const acceptedOrdersLoading = receivedOrdersLoading;
  const deniedOrdersLoading = receivedOrdersLoading;

  // MyOrdersModal state
  const [myOrdersModalOpen, setMyOrdersModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    id: string;
    name: string;
    forwardedCount: number;
    receivedCount: number;
  } | null>(null);

  // PersonChat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPerson, setChatPerson] = useState<{
    id: string;
    name: string;
    email?: string;
  } | null>(null);

  // Debug: Log chat state changes
  useEffect(() => {
    console.log('[OrdersForward] Chat State:', { chatOpen, chatPerson });
  }, [chatOpen, chatPerson]);

  // Debug: Log Redux state changes
  useEffect(() => {
    console.log('[OrdersForward] Redux State Updated:');
    console.log('  - forwardedOrders:', forwardedOrders?.length || 0, forwardedOrders);
    console.log('  - receivedOrders:', receivedOrders?.length || 0);
    console.log('  - pendingOrders:', pendingOrders?.length || 0);
    console.log('  - acceptedOrders:', acceptedOrders?.length || 0);
    console.log('  - deniedOrders:', deniedOrders?.length || 0);
    console.log('  - forwardedOrdersLoading:', forwardedOrdersLoading);
    console.log('  - error:', orderForwardError);
  }, [forwardedOrders, receivedOrders, pendingOrders, acceptedOrders, deniedOrders, forwardedOrdersLoading, orderForwardError]);

  // Use Redux actions for person-to-person forwarding
  useEffect(() => {
    console.log('[OrdersForward] Active view changed to:', activeView);
    if (activeView === 'forwarded') {
      console.log('[OrdersForward] Fetching forwarded orders...');
      dispatch(fetchForwardedOrdersFromPerson()).then((result: any) => {
        console.log('[OrdersForward] Forwarded orders result:', result);
        console.log('[OrdersForward] Orders received:', result?.data?.orders?.length || 0);
        if (result?.data?.orders) {
          console.log('[OrdersForward] Sample order:', result.data.orders[0]);
        }
      }).catch((error: any) => {
        console.error('[OrdersForward] Error fetching forwarded orders:', error);
        console.error('[OrdersForward] Error details:', error.response?.data);
      });
    } else if (activeView === 'pending' || activeView === 'accepted' || activeView === 'denied') {
      // Fetch all received orders and filter by status in the component
      dispatch(fetchReceivedOrdersForPerson());
    }
  }, [activeView, dispatch]);

  // Handle accept order
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await dispatch(acceptForwardedOrder(orderId));
      // Refresh received orders after accept
      dispatch(fetchReceivedOrdersForPerson());
    } catch (error) {
      console.error('Failed to accept order:', error);
    }
  };

  // Handle deny order
  const handleDenyOrder = async () => {
    if (!denyingOrderId || !denyReason.trim()) return;

    try {
      await dispatch(denyForwardedOrder(denyingOrderId, denyReason));
      setDenyModalOpen(false);
      setDenyingOrderId(null);
      setDenyReason('');
      // Refresh received orders after deny
      dispatch(fetchReceivedOrdersForPerson());
    } catch (error) {
      console.error('Failed to deny order:', error);
    }
  };

  // Open deny modal
  const openDenyModal = (orderId: string) => {
    setDenyingOrderId(orderId);
    setDenyModalOpen(true);
  };

  // Handle clicking on an order to view order details
  const handleViewOrderDetails = async (orderId: string, isReceivedOrder: boolean = false) => {
    console.log('[OrdersForward] Fetching order details for:', orderId, 'isReceivedOrder:', isReceivedOrder);

    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
      const response = await fetch(`${baseUrl}/v2/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': import.meta.env.VITE_API_KEY || ''
        }
      });

      if (response.ok) {
        const result = await response.json();
        const order = result.data || result;

        console.log('[OrdersForward] Order fetched:', order);

        navigate('/menu/orderform', {
          state: {
            isEdit: true,
            orderData: order,
            isEditMode: true,
            editMode: true,
            mode: 'edit',
            orderId: order.orderId || order._id,
            isReceivedForwardedOrder: isReceivedOrder, // Flag to hide customer details
            hideCustomerDetails: isReceivedOrder // Additional flag for clarity
          }
        });
      } else {
        console.error('Failed to fetch order:', response.status, response.statusText);
        alert(`Failed to load order details: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Error loading order details. Please try again.');
    }
  };

  // Handle clicking on contact to view all orders with that person
  const handleContactClick = (contactId: string, contactName: string) => {
    console.log('[OrdersForward] handleContactClick:', { contactId, contactName });

    // Count orders with this contact (person-to-person)
    const forwardedCount = Array.isArray(forwardedOrders)
      ? forwardedOrders.filter(order => order.forwardedToPerson === contactId).length
      : 0;
    // Count from pending + accepted orders (received orders)
    const pendingFromContact = Array.isArray(pendingOrders)
      ? pendingOrders.filter(order => order.receivedFromPerson === contactId).length
      : 0;
    const acceptedFromContact = Array.isArray(acceptedOrders)
      ? acceptedOrders.filter(order => order.receivedFromPerson === contactId).length
      : 0;
    const receivedCount = pendingFromContact + acceptedFromContact;

    console.log('[OrdersForward] Counts:', { forwardedCount, receivedCount });

    setSelectedContact({
      id: contactId,
      name: contactName,
      forwardedCount,
      receivedCount
    });
    setMyOrdersModalOpen(true);
  };

  // Handle opening chat with a person
  const handleOpenChat = (personId: string, personName: string, personEmail?: string) => {
    console.log('[OrdersForward] Opening chat with:', { personId, personName, personEmail });
    setChatPerson({
      id: personId,
      name: personName,
      email: personEmail
    });
    setChatOpen(true);
  };

  return (
    <div className="orders-forward-container">
      {/* Header */}
      <div className="orders-forward-header">
        <div className="header-left">
          <BackButton />
          <h1>Order Forward</h1>
        </div>
        <div className="header-actions">
          <button
            className="btn-create-connection"
            onClick={() => setActiveView('connections')}
            title="Add new connection"
          >
            <Plus size={20} />
            <span>New Connection</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs - Only Forward Related Orders */}
      <div className="orders-forward-tabs">
        <button
          className={`tab-btn ${activeView === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveView('pending')}
        >
          <Clock size={20} />
          <span>New Received ({Array.isArray(pendingOrders) ? pendingOrders.length : 0})</span>
        </button>
        <button
          className={`tab-btn ${activeView === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveView('accepted')}
        >
          <CheckCircle size={20} />
          <span>Accepted ({Array.isArray(acceptedOrders) ? acceptedOrders.length : 0})</span>
        </button>
        <button
          className={`tab-btn ${activeView === 'denied' ? 'active' : ''}`}
          onClick={() => setActiveView('denied')}
        >
          <Ban size={20} />
          <span>Denied ({Array.isArray(deniedOrders) ? deniedOrders.length : 0})</span>
        </button>
        <button
          className={`tab-btn ${activeView === 'forwarded' ? 'active' : ''}`}
          onClick={() => setActiveView('forwarded')}
        >
          <Send size={20} />
          <span>Forwarded ({Array.isArray(forwardedOrders) ? forwardedOrders.length : 0})</span>
        </button>
        <button
          className={`tab-btn ${activeView === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveView('connections')}
        >
          <Users size={20} />
          <span>Connections</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="orders-forward-content">
        {/* Connections Tab */}
        {activeView === 'connections' && (
          <ConnectionManagement
            onClose={() => {}}
            onOpenChat={handleOpenChat}
          />
        )}

        {/* Pending Orders Tab - Orders awaiting acceptance */}
        {activeView === 'pending' && (
          <div className="orders-view">
            {pendingOrdersLoading ? (
              <div className="loading-state">
                <RefreshCw size={48} className="spin" />
                <p>Loading pending orders...</p>
              </div>
            ) : orderForwardError ? (
              <div className="error-state">
                <p>{orderForwardError}</p>
                <button onClick={() => dispatch(fetchReceivedOrdersForPerson())} className="btn-retry">
                  Retry
                </button>
              </div>
            ) : !Array.isArray(pendingOrders) || pendingOrders.length === 0 ? (
              <div className="empty-state">
                <Clock size={64} />
                <h2>No Pending Orders</h2>
                <p>Orders awaiting your acceptance will appear here</p>
              </div>
            ) : (
              <div className="orders-table-container">
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>From</th>
                        <th>Customer</th>
                        <th>Received Date</th>
                        <th>Notes</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map(order => (
                        <tr key={order._id}>
                          <td className="table-order-number">{safeString(order.orderNumber)}</td>
                          <td className="table-person">{safeString(order.receivedFromName, 'Unknown')}</td>
                          <td>{safeString(order.customerInfo?.name, '-')}</td>
                          <td className="table-date">{order.receivedAt ? new Date(order.receivedAt).toLocaleDateString() : 'N/A'}</td>
                          <td className="table-notes">{getNotesText(order.notes) || '-'}</td>
                          <td>
                            <span className="status-badge pending">Pending</span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn-view btn-table-action"
                                onClick={() => handleViewOrderDetails(order.originalOrderId || order._id, true)}
                                title="View Details"
                              >
                                <Package size={14} />
                                View
                              </button>
                              <button
                                className="btn-accept btn-table-action"
                                onClick={() => handleAcceptOrder(order._id)}
                                disabled={actionLoading}
                                title="Accept Order"
                              >
                                <CheckCircle size={14} />
                                Accept
                              </button>
                              <button
                                className="btn-deny btn-table-action"
                                onClick={() => openDenyModal(order._id)}
                                disabled={actionLoading}
                                title="Deny Order"
                              >
                                <XCircle size={14} />
                                Deny
                              </button>
                              <button
                                className="btn-chat btn-table-action"
                                onClick={() => handleOpenChat(order.receivedFromPerson || '', order.receivedFromName || 'Unknown')}
                                title="Chat with sender"
                              >
                                <MessageCircle size={14} />
                                Chat
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Accepted Orders Tab - Orders I've accepted */}
        {activeView === 'accepted' && (
          <div className="orders-view">
            {acceptedOrdersLoading ? (
              <div className="loading-state">
                <RefreshCw size={48} className="spin" />
                <p>Loading accepted orders...</p>
              </div>
            ) : orderForwardError ? (
              <div className="error-state">
                <p>{orderForwardError}</p>
                <button onClick={() => dispatch(fetchReceivedOrdersForPerson())} className="btn-retry">
                  Retry
                </button>
              </div>
            ) : !Array.isArray(acceptedOrders) || acceptedOrders.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={64} />
                <h2>No Accepted Orders</h2>
                <p>Orders you've accepted will appear here</p>
              </div>
            ) : (
              <div className="orders-table-container">
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>From</th>
                        <th>Customer</th>
                        <th>Order Status</th>
                        <th>Accepted Date</th>
                        <th>Chain Steps</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acceptedOrders.map(order => (
                        <tr key={order._id} onClick={() => handleViewOrderDetails(order.originalOrderId || order._id, true)} style={{ cursor: 'pointer' }}>
                          <td className="table-order-number">{safeString(order.orderNumber)}</td>
                          <td className="table-person">{safeString(order.receivedFromName || order.originalBranchName, 'Unknown')}</td>
                          <td>{safeString(order.customerInfo?.name, '-')}</td>
                          <td>{safeString(order.overallStatus, 'N/A')}</td>
                          <td className="table-date">{order.acceptedAt ? new Date(order.acceptedAt).toLocaleDateString() : 'N/A'}</td>
                          <td>{order.forwardingChain && Array.isArray(order.forwardingChain) ? order.forwardingChain.length : 0}</td>
                          <td>
                            <span className="status-badge accepted">Accepted</span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn-view btn-table-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOrderDetails(order.originalOrderId || order._id, true);
                                }}
                                title="View Details"
                              >
                                <Package size={14} />
                                View
                              </button>
                              <button
                                className="btn-chat btn-table-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenChat(order.receivedFromPerson || '', order.receivedFromName || 'Unknown');
                                }}
                                title="Chat with sender"
                              >
                                <MessageCircle size={14} />
                                Chat
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Denied Orders Tab - Orders I've denied */}
        {activeView === 'denied' && (
          <div className="orders-view">
            {deniedOrdersLoading ? (
              <div className="loading-state">
                <RefreshCw size={48} className="spin" />
                <p>Loading denied orders...</p>
              </div>
            ) : orderForwardError ? (
              <div className="error-state">
                <p>{orderForwardError}</p>
                <button onClick={() => dispatch(fetchReceivedOrdersForPerson())} className="btn-retry">
                  Retry
                </button>
              </div>
            ) : !Array.isArray(deniedOrders) || deniedOrders.length === 0 ? (
              <div className="empty-state">
                <Ban size={64} />
                <h2>No Denied Orders</h2>
                <p>Orders you've denied will appear here</p>
              </div>
            ) : (
              <div className="orders-table-container">
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>From</th>
                        <th>Customer</th>
                        <th>Denied Date</th>
                        <th>Denial Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deniedOrders.map(order => (
                        <tr key={order._id}>
                          <td className="table-order-number">{safeString(order.orderNumber)}</td>
                          <td className="table-person">{safeString(order.receivedFromName || order.originalBranchName, 'Unknown')}</td>
                          <td>{safeString(order.customerInfo?.name, '-')}</td>
                          <td className="table-date">{order.deniedAt ? new Date(order.deniedAt).toLocaleDateString() : 'N/A'}</td>
                          <td className="table-denial-reason">{safeString(order.responseNote || order.denialReason, '-')}</td>
                          <td>
                            <span className="status-badge denied">Denied</span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn-view btn-table-action"
                                onClick={() => handleViewOrderDetails(order.originalOrderId || order._id, true)}
                                title="View Details"
                              >
                                <Package size={14} />
                                View
                              </button>
                              <button
                                className="btn-chat btn-table-action"
                                onClick={() => handleOpenChat(order.receivedFromPerson || '', order.receivedFromName || 'Unknown')}
                                title="Chat with sender"
                              >
                                <MessageCircle size={14} />
                                Chat
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Forwarded Orders Tab */}
        {activeView === 'forwarded' && (
          <div className="orders-view">
            {forwardedOrdersLoading ? (
              <div className="loading-state">
                <RefreshCw size={48} className="spin" />
                <p>Loading forwarded orders...</p>
              </div>
            ) : orderForwardError ? (
              <div className="error-state">
                <p>{orderForwardError}</p>
                <button onClick={() => dispatch(fetchForwardedOrdersFromPerson())} className="btn-retry">
                  Retry
                </button>
              </div>
            ) : !Array.isArray(forwardedOrders) || forwardedOrders.length === 0 ? (
              <div className="empty-state">
                <Send size={64} />
                <h2>No Forwarded Orders</h2>
                <p>Orders you forward to others will appear here</p>
              </div>
            ) : (
              <div className="orders-table-container">
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Forwarded To</th>
                        <th>Customer</th>
                        <th>Forwarded Date</th>
                        <th>Recipient Status</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forwardedOrders.map(order => {
                        // Get the latest chain status for this forwarded order
                        const lastChainItem = order.forwardingChain && order.forwardingChain.length > 0
                          ? order.forwardingChain[order.forwardingChain.length - 1]
                          : null;
                        const recipientStatus = lastChainItem?.status || order.forwardingStatus || 'pending';

                        // Support both person-to-person and branch-to-branch forwarding
                        const forwardedToPersonId = order.forwardedToPerson || order.forwardedTo;
                        const forwardedToPersonName = order.forwardedToPersonName || order.forwardedToName || 'Unknown';

                        return (
                          <tr key={order._id}>
                            <td className="table-order-number">{safeString(order.orderNumber)}</td>
                            <td className="table-person">{safeString(forwardedToPersonName, 'Unknown')}</td>
                            <td>{safeString(order.customerInfo?.name, '-')}</td>
                            <td className="table-date">{order.forwardedAt ? new Date(order.forwardedAt).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <span className={`status-badge ${recipientStatus}`}>
                                {recipientStatus === 'accepted' ? 'Accepted' : recipientStatus === 'denied' ? 'Denied' : 'Pending'}
                              </span>
                              {recipientStatus === 'accepted' && lastChainItem?.acceptedAt && (
                                <div className="table-sub-info">
                                  {new Date(lastChainItem.acceptedAt).toLocaleDateString()}
                                </div>
                              )}
                              {recipientStatus === 'denied' && lastChainItem?.deniedAt && (
                                <div className="table-sub-info">
                                  {new Date(lastChainItem.deniedAt).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="table-notes">
                              {recipientStatus === 'denied' && lastChainItem?.denialReason
                                ? safeString(lastChainItem.denialReason)
                                : getNotesText(order.notes) || '-'}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="btn-view btn-table-action"
                                  onClick={() => forwardedToPersonId && forwardedToPersonName && handleContactClick(forwardedToPersonId, forwardedToPersonName)}
                                  title="View All Orders with this Contact"
                                >
                                  <Package size={14} />
                                  View All
                                </button>
                                <button
                                  className="btn-chat btn-table-action"
                                  onClick={() => forwardedToPersonId && forwardedToPersonName && handleOpenChat(forwardedToPersonId, forwardedToPersonName)}
                                  title="Chat with recipient"
                                >
                                  <MessageCircle size={14} />
                                  Chat
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* My Orders Modal */}
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

      {/* Person Chat */}
      {chatPerson && (
        <PersonChat
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setChatPerson(null);
          }}
          personId={chatPerson.id}
          personName={chatPerson.name}
          personEmail={chatPerson.email}
        />
      )}

      {/* Deny Order Modal */}
      {denyModalOpen && (
        <div className="modal-overlay" onClick={() => setDenyModalOpen(false)}>
          <div className="modal-content deny-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Deny Order</h2>
              <button className="close-btn" onClick={() => setDenyModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for denying this order:</p>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Enter reason for denial..."
                rows={4}
                className="deny-reason-input"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => {
                  setDenyModalOpen(false);
                  setDenyReason('');
                  setDenyingOrderId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-deny"
                onClick={handleDenyOrder}
                disabled={!denyReason.trim() || actionLoading}
              >
                {actionLoading ? 'Denying...' : 'Confirm Deny'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersForward;
