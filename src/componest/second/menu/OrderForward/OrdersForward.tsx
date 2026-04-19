import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BackButton } from '../../../allCompones/BackButton';
import {
  fetchForwardedOrdersFromPerson,
  fetchReceivedOrdersForPerson,
  acceptForwardedOrder,
  denyForwardedOrder,
  // Role-based imports
  fetchMyOrders,
  fetchTeamOrders,
  fetchBranchOrders,
  fetchAllBranchOrders,
  fetchCompanyOrders,
  fetchSharedOrders,
  cancelOrder
} from '../../../redux/orderforward/orderForwardActions';
import { RootState, AppDispatch } from '../../../../store';
import MessagesList from './components/MessagesList';
import PersonChat from './components/PersonChat';
import OrdersRoleSideMenu from './components/OrdersRoleSideMenu';
import ConnectionManagement from './components/ConnectionManagement';
import './OrdersForward.css';

// Icons
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"/>
  </svg>
);

const AllIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);

const PendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const CancelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
  </svg>
);

const VisibilityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

interface OrdersForwardProps {
  initialView?: 'all' | 'forwarded' | 'received' | 'pending' | 'connections';
}

interface Contact {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: string;
  connectedAt: string;
}

const OrdersForward: React.FC<OrdersForwardProps> = ({ initialView = 'pending' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [mainView, setMainView] = useState<'orders' | 'messages' | 'connections'>(
    initialView === 'connections' ? 'connections' : 'orders'
  );
  const [activeTab, setActiveTab] = useState<'all' | 'forwarded' | 'received' | 'pending'>(
    initialView === 'connections' ? 'pending' : (initialView ?? 'pending')
  );
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [denyingOrderId, setDenyingOrderId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');

  // Messages state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Keep track of active person for persistent calls (component stays mounted)
  const [activePerson, setActivePerson] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [callPerson, setCallPerson] = useState<{ id: string; name: string; email: string } | null>(null);

  // Role-based order management
  const [roleView, setRoleView] = useState<string>('myOrders');
  const [roleBasedOrders, setRoleBasedOrders] = useState<any[]>([]);
  const [roleBasedLoading, setRoleBasedLoading] = useState(false);

  // Cancel order state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Order counts for side menu
  const [orderCounts, setOrderCounts] = useState({
    myOrders: 0,
    teamOrders: 0,
    branchOrders: 0,
    allBranchOrders: 0,
    companyOrders: 0,
    sharedOrders: 0
  });

  const {
    forwardedOrders,
    forwardedOrdersLoading,
    receivedOrders,
    receivedOrdersLoading,
    loading: actionLoading
  } = useSelector((state: RootState) => state.orderForward);

  // Get user info from Redux
  const userData = useSelector((state: RootState) => state.auth?.userData);
  const userRole = userData?.role || 'employee';
  const canCancelOrders = ['manager', 'admin', 'master_admin'].includes(userRole);

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

  const allOrders = [...pendingOrders, ...acceptedOrders, ...(forwardedOrders || [])];

  // Fetch contacts for messages
  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      const branchId = localStorage.getItem('selectedBranchId') || '';
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

      const response = await fetch(`${baseUrl}/v2/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-selected-branch': branchId
        }
      });
      const data = await response.json();
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setContactsLoading(false);
    }
  };

  // Fetch orders based on selected role view
  const fetchOrdersForView = async (view: string) => {
    setRoleBasedLoading(true);
    try {
      let response;
      switch (view) {
        case 'myOrders':
          response = await dispatch(fetchMyOrders());
          break;
        case 'teamOrders':
          response = await dispatch(fetchTeamOrders());
          break;
        case 'branchOrders':
          response = await dispatch(fetchBranchOrders());
          break;
        case 'allBranchOrders':
          response = await dispatch(fetchAllBranchOrders());
          break;
        case 'companyOrders':
          response = await dispatch(fetchCompanyOrders());
          break;
        case 'sharedOrders':
          response = await dispatch(fetchSharedOrders());
          break;
        default:
          response = await dispatch(fetchMyOrders());
      }

      if (response?.data) {
        setRoleBasedOrders(response.data.orders || response.data);
      }
    } catch (error) {
      console.error('Error fetching orders for view:', view, error);
      setRoleBasedOrders([]);
    } finally {
      setRoleBasedLoading(false);
    }
  };

  // Fetch order counts for each view
  const fetchOrderCounts = async () => {
    try {
      const counts = {
        myOrders: 0,
        teamOrders: 0,
        branchOrders: 0,
        allBranchOrders: 0,
        companyOrders: 0,
        sharedOrders: 0
      };

      // Fetch count for My Orders (all roles)
      try {
        const myOrdersRes = await dispatch(fetchMyOrders(1, 1));
        counts.myOrders = myOrdersRes?.data?.pagination?.total || 0;
      } catch (err) {
        console.error('Error fetching my orders count:', err);
      }

      // Fetch counts based on role
      if (['manager', 'admin', 'master_admin'].includes(userRole)) {
        try {
          const teamOrdersRes = await dispatch(fetchTeamOrders(1, 1));
          counts.teamOrders = teamOrdersRes?.data?.pagination?.total || 0;
        } catch (err) {
          console.error('Error fetching team orders count:', err);
        }

        try {
          const branchOrdersRes = await dispatch(fetchBranchOrders(1, 1));
          counts.branchOrders = branchOrdersRes?.data?.pagination?.total || 0;
        } catch (err) {
          console.error('Error fetching branch orders count:', err);
        }
      }

      if (['admin', 'master_admin'].includes(userRole)) {
        try {
          const allBranchOrdersRes = await dispatch(fetchAllBranchOrders(1, 1));
          counts.allBranchOrders = allBranchOrdersRes?.data?.pagination?.total || 0;
        } catch (err) {
          console.error('Error fetching all branch orders count:', err);
        }
      }

      if (userRole === 'master_admin') {
        try {
          const companyOrdersRes = await dispatch(fetchCompanyOrders(1, 1));
          counts.companyOrders = companyOrdersRes?.data?.pagination?.total || 0;
        } catch (err) {
          console.error('Error fetching company orders count:', err);
        }
      }

      // Fetch shared orders count (all roles)
      try {
        const sharedOrdersRes = await dispatch(fetchSharedOrders(1, 1));
        counts.sharedOrders = sharedOrdersRes?.data?.pagination?.total || 0;
      } catch (err) {
        console.error('Error fetching shared orders count:', err);
      }

      setOrderCounts(counts);
    } catch (error) {
      console.error('Error fetching order counts:', error);
    }
  };

  // Cancel order handler
  const handleCancelOrder = async () => {
    if (!cancellingOrderId || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    if (cancelReason.trim().length < 5) {
      toast.error('Cancellation reason must be at least 5 characters');
      return;
    }

    try {
      await dispatch(cancelOrder(cancellingOrderId, cancelReason));
      toast.success('Order cancelled successfully');

      // Refresh current view
      fetchOrdersForView(roleView);

      // Close modal
      setCancelModalOpen(false);
      setCancellingOrderId(null);
      setCancelReason('');
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel order');
    }
  };

  const openCancelModal = (orderId: string) => {
    setCancellingOrderId(orderId);
    setCancelModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchReceivedOrdersForPerson());
    dispatch(fetchForwardedOrdersFromPerson());
    fetchContacts();
  }, [dispatch]);

  // Effect to fetch orders when role view changes
  useEffect(() => {
    if (mainView === 'orders') {
      fetchOrdersForView(roleView);
    }
  }, [roleView, mainView]);

  // Effect to fetch order counts on mount
  useEffect(() => {
    fetchOrderCounts();
  }, [userRole]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await dispatch(acceptForwardedOrder(orderId));
      dispatch(fetchReceivedOrdersForPerson());
    } catch (error) {
      console.error('Failed to accept order:', error);
    }
  };

  const handleDenyOrder = async () => {
    if (!denyingOrderId || !denyReason.trim()) return;

    try {
      await dispatch(denyForwardedOrder(denyingOrderId, denyReason));
      setDenyModalOpen(false);
      setDenyingOrderId(null);
      setDenyReason('');
      dispatch(fetchReceivedOrdersForPerson());
    } catch (error) {
      console.error('Failed to deny order:', error);
    }
  };

  const openDenyModal = (orderId: string) => {
    setDenyingOrderId(orderId);
    setDenyModalOpen(true);
  };

  const handleViewOrderDetails = async (orderId: string, isReceivedOrder: boolean = false) => {
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

        navigate('/menu/orderform', {
          state: {
            isEdit: true,
            orderData: order,
            isEditMode: true,
            editMode: true,
            mode: 'edit',
            orderId: order.orderId || order._id,
            isReceivedForwardedOrder: isReceivedOrder,
            hideCustomerDetails: isReceivedOrder
          }
        });
      } else {
        toast.error('Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error loading order details. Please try again.');
    }
  };

  const getCurrentOrders = () => {
    switch (activeTab) {
      case 'forwarded':
        return forwardedOrders || [];
      case 'received':
        return [...acceptedOrders, ...deniedOrders];
      case 'pending':
        return pendingOrders;
      case 'all':
      default:
        return allOrders;
    }
  };

  const safeString = (value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
  };

  const currentOrders = getCurrentOrders();
  const isLoading = receivedOrdersLoading || forwardedOrdersLoading || roleBasedLoading;

  return (
    <div className="orders-forward-page-wrapper">
      {/* Role-Based Side Menu - Only show in orders view */}
      {/* {mainView === 'orders' && (
        <OrdersRoleSideMenu
          activeView={roleView}
          onViewChange={(view) => {
            setRoleView(view);
            fetchOrdersForView(view);
          }}
          orderCounts={orderCounts}
        />
      )} */}

      {/* Side Menu */}
      <div className="orders-side-menu">
        <button
          className={`side-menu-btn ${mainView === 'orders' ? 'active' : ''}`}
          onClick={() => setMainView('orders')}
        >
          <InboxIcon />
          <span>Orders</span>
        </button>
        <button
          className={`side-menu-btn ${mainView === 'messages' ? 'active' : ''}`}
          onClick={() => setMainView('messages')}
        >
          <MessageIcon />
          <span>Messages</span>
        </button>
        <button
          className={`side-menu-btn ${mainView === 'connections' ? 'active' : ''}`}
          onClick={() => setMainView('connections')}
        >
          <AllIcon />
          <span>Connections</span>
        </button>
      </div>

      {/* Main Area */}
      <div className="orders-forward-page">
        {/* Header */}
        <div className="orders-forward-header">
          <div className="header-left">
            <BackButton />
            <h1 className="page-title">
              {mainView === 'orders' ? 'Orders' : mainView === 'messages' ? 'Messages' : 'Connections'}
            </h1>
          </div>
          <div className="header-subtitle">
            {mainView === 'orders'
              ? 'Manage and track all orders'
              : mainView === 'messages'
              ? 'Messages and conversations'
              : 'Manage your connections'}
          </div>
        </div>

        {/* Main Content */}
        {mainView === 'connections' ? (
          <div style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
            <ConnectionManagement
              onClose={() => setMainView('orders')}
              onOpenChat={(personId, personName, personEmail) => {
                setActivePerson({ id: personId, name: personName, email: personEmail || '' });
                setIsChatOpen(true);
                setMainView('messages');
              }}
            />
          </div>
        ) : mainView === 'messages' ? (
          <div className="messages-view-wrapper">
            <MessagesList
              contacts={contacts}
              onSelectContact={setSelectedContact}
              selectedContactId={selectedContact?.userId}
              loading={contactsLoading}
            />
            {selectedContact && (
              <PersonChat
                isOpen={true}
                onClose={() => setSelectedContact(null)}
                personId={selectedContact.userId}
                personName={selectedContact.userName}
                personEmail={selectedContact.userEmail}
                embedded={true}
              />
            )}
          </div>
        ) : (
          <div className="orders-forward-content">
            {/* Section Header */}
            <div className="section-header">
              <h2 className="section-title">Orders</h2>
              <p className="section-subtitle">View orders you created and orders sent to you</p>
            </div>

            {/* Tabs */}
            <div className="orders-tabs">
              <button
                className={`orders-tab ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <PendingIcon />
                <span>Pending Orders ({pendingOrders.length})</span>
              </button>
              <button
                className={`orders-tab ${activeTab === 'received' ? 'active' : ''}`}
                onClick={() => setActiveTab('received')}
              >
                <InboxIcon />
                <span>Received Orders ({acceptedOrders.length + deniedOrders.length})</span>
              </button>
              <button
                className={`orders-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <AllIcon />
                <span>All Orders ({allOrders.length})</span>
              </button>
              <button
                className={`orders-tab ${activeTab === 'forwarded' ? 'active' : ''}`}
                onClick={() => setActiveTab('forwarded')}
              >
                <SendIcon />
                <span>Forwarded Orders ({(forwardedOrders || []).length})</span>
              </button>
            </div>

            {/* Orders Section */}
            <div className="orders-section">
              <div className="orders-section-header">
                <h3 className="orders-section-title">
                  {activeTab === 'pending' && 'Pending Orders'}
                  {activeTab === 'received' && 'Received Orders'}
                  {activeTab === 'forwarded' && 'Orders you created and sent to other users'}
                  {activeTab === 'all' && 'All Orders'}
                </h3>
              </div>

              {/* Orders Table */}
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading orders...</p>
                </div>
              ) : currentOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>No orders found</p>
                </div>
              ) : (
                <div className="orders-table-wrapper">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>{activeTab === 'forwarded' ? 'Sent To' : 'From'}</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Order Date</th>
                        <th>Last Updated</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map((order: any) => {
                        const isForwarded = activeTab === 'forwarded' || order.forwardedToPerson;
                        const personName = isForwarded
                          ? (order.forwardedToPersonName || order.forwardedToName || 'Unknown')
                          : (order.receivedFromName || 'Unknown');
                        const status = order.forwardingStatus || 'pending';

                        return (
                          <tr key={order._id}>
                            <td className="order-number">{safeString(order.orderNumber || order.orderId, '-')}</td>
                            <td>{personName}</td>
                            <td>{safeString(order.customerInfo?.name, '-')}</td>
                            <td>
                              {Array.isArray(order.options) ? order.options.length : 0} Items
                              <div className="item-details">
                                {order.options?.[0]?.optionTypeName || 'Wireless Headphones'}
                              </div>
                            </td>
                            <td>
                              {order.forwardedAt
                                ? new Date(order.forwardedAt).toLocaleDateString()
                                : order.createdAt
                                  ? new Date(order.createdAt).toLocaleDateString()
                                  : '-'}
                            </td>
                            <td>
                              {order.updatedAt
                                ? new Date(order.updatedAt).toLocaleDateString()
                                : '-'}
                            </td>
                            <td>
                              <span className={`status-badge ${status}`}>
                                {status === 'pending' ? 'processing' : status}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="action-btn view-btn"
                                  onClick={() => handleViewOrderDetails(order.originalOrderId || order._id, !isForwarded)}
                                  title="View Order"
                                >
                                  <VisibilityIcon />
                                </button>
                                {status === 'pending' && !isForwarded && (
                                  <>
                                    <button
                                      className="action-btn accept-btn"
                                      onClick={() => handleAcceptOrder(order._id)}
                                      disabled={actionLoading}
                                      title="Accept"
                                    >
                                      <CheckCircleIcon />
                                    </button>
                                    <button
                                      className="action-btn deny-btn"
                                      onClick={() => openDenyModal(order._id)}
                                      disabled={actionLoading}
                                      title="Deny"
                                    >
                                      <CancelIcon />
                                    </button>
                                  </>
                                )}
                                <button
                                  className="action-btn message-btn"
                                  onClick={() => {
                                    const personId = isForwarded
                                      ? (order.forwardedToPerson || order.forwardedTo)
                                      : order.receivedFromPerson;
                                    const personEmail = isForwarded
                                      ? (order.forwardedToPersonEmail || order.forwardedToEmail || '')
                                      : (order.receivedFromEmail || '');
                                    setActivePerson({ id: personId, name: personName, email: personEmail });
                                    setIsChatOpen(true);
                                    setCallPerson(null); // Clear call flag
                                  }}
                                  title={`Message ${personName}`}
                                >
                                  <MessageIcon />
                                </button>
                                <button
                                  className="action-btn call-btn"
                                  onClick={() => {
                                    const personId = isForwarded
                                      ? (order.forwardedToPerson || order.forwardedTo)
                                      : order.receivedFromPerson;
                                    const personEmail = isForwarded
                                      ? (order.forwardedToPersonEmail || order.forwardedToEmail || '')
                                      : (order.receivedFromEmail || '');
                                    const person = { id: personId, name: personName, email: personEmail };
                                    setActivePerson(person);
                                    setCallPerson(person); // Mark as call (for autoStartCall)
                                    setIsChatOpen(true);
                                  }}
                                  title={`Call ${personName}`}
                                >
                                  <PhoneIcon />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deny Modal */}
        {denyModalOpen && (
          <div className="modal-overlay" onClick={() => setDenyModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3 className="modal-title">Deny Order</h3>
              <p className="modal-description">
                Please provide a reason for denying this order:
              </p>
              <textarea
                className="modal-textarea"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Enter reason for denial..."
                rows={4}
              />
              <div className="modal-actions">
                <button
                  className="modal-btn cancel-btn"
                  onClick={() => {
                    setDenyModalOpen(false);
                    setDenyReason('');
                    setDenyingOrderId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-btn confirm-btn"
                  onClick={handleDenyOrder}
                  disabled={!denyReason.trim() || actionLoading}
                >
                  {actionLoading ? 'Denying...' : 'Confirm Deny'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat/Call Modal - Persists to keep call state alive */}
        {activePerson && (
          <PersonChat
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            personId={activePerson.id}
            personName={activePerson.name}
            personEmail={activePerson.email}
            embedded={false}
            autoStartCall={activePerson === callPerson ? 'audio' : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default OrdersForward;
