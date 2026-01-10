import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, Package, Calendar, User, Mail, Phone, MapPin, FileText, Share2, CheckCircle, XCircle } from 'lucide-react';
import ForwardingChain from './ForwardingChain';
import {
  fetchForwardedOrdersFromPerson,
  fetchReceivedOrdersForPerson,
  fetchPersonForwardingChain,
  acceptForwardedOrder,
  denyForwardedOrder
} from '../../../../redux/orderforward/orderForwardActions';
import { AppDispatch } from '../../../../../store';
import './MyOrdersModal.css';

interface Order {
  _id: string;
  orderNumber: string;
  orderType?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  status?: string;
  totalAmount?: number;
  createdAt: string;
  notes?: string;
  forwardingStatus?: 'pending' | 'accepted' | 'denied';
  acceptedAt?: string;
  deniedAt?: string;
  responseNote?: string;
}

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactId: string;
  forwardedCount: number;
  receivedCount: number;
}

interface ForwardingStep {
  from: string;
  fromId?: string;
  fromRole?: string;
  to: string;
  toId?: string;
  toRole?: string;
  notes?: string;
  date: string;
  forwardedByName?: string;
}

const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  contactName,
  contactId,
  forwardedCount,
  receivedCount
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'forwarded' | 'received'>('forwarded');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'denied'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderChain, setSelectedOrderChain] = useState<ForwardingStep[] | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [loadingChain, setLoadingChain] = useState(false);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, activeTab, contactId]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = activeTab === 'forwarded'
        ? await dispatch(fetchForwardedOrdersFromPerson(1, 100))
        : await dispatch(fetchReceivedOrdersForPerson(1, 100));

      // Filter orders by contactId and ensure they are from PersonOrderForward collection
      const allOrders = result.data?.orders || [];
      const filteredOrders = allOrders.filter((order: any) => {
        // Ensure order is a forwarded order (from PersonOrderForward collection)
        const isForwardedOrder = order.isForwarded !== undefined || order.isReceived !== undefined;

        if (!isForwardedOrder) {
          return false; // Skip non-forwarded orders
        }

        if (activeTab === 'forwarded') {
          // Show orders forwarded TO this contact
          return order.forwardedToPerson === contactId;
        } else {
          // Show orders received FROM this contact (only forwarded orders)
          return order.receivedFromPerson === contactId;
        }
      });

      setOrders(filteredOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply status filter to orders
  const filteredOrdersByStatus = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.forwardingStatus === statusFilter;
  });

  const fetchForwardingChain = async (orderId: string, orderNumber: string) => {
    setLoadingChain(true);
    setSelectedOrderNumber(orderNumber);

    try {
      const result = await dispatch(fetchPersonForwardingChain(orderId));

      // Transform API response to ForwardingStep format
      const chain: ForwardingStep[] = result.data?.chain?.map((step: any) => ({
        from: step.fromPersonName || step.fromBranchName || 'Unknown',
        fromId: step.fromPersonId || step.fromBranchId,
        fromRole: step.fromPersonRole,
        to: step.toPersonName || step.toBranchName || 'Unknown',
        toId: step.toPersonId || step.toBranchId,
        toRole: step.toPersonRole,
        notes: step.notes || step.note,
        date: step.forwardedAt || step.date,
        forwardedByName: step.forwardedByName
      })) || [];

      setSelectedOrderChain(chain);
    } catch (err: any) {
      console.error('Error fetching forwarding chain:', err);
      setSelectedOrderChain([]);
    } finally {
      setLoadingChain(false);
    }
  };

  const handleAcceptOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Accept forwarded order ${orderNumber}?`)) return;

    setProcessingOrder(orderId);
    try {
      await dispatch(acceptForwardedOrder(orderId, 'Order accepted'));
      await fetchOrders();
      alert(`Order ${orderNumber} accepted successfully!`);
    } catch (err: any) {
      console.error('Error accepting order:', err);
      alert(`Failed to accept order: ${err.message}`);
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleDenyOrder = async (orderId: string, orderNumber: string) => {
    const reason = window.prompt(`Deny order ${orderNumber}? Please provide a reason:`);
    if (!reason) return;

    setProcessingOrder(orderId);
    try {
      await dispatch(denyForwardedOrder(orderId, reason));
      await fetchOrders();
      alert(`Order ${orderNumber} denied.`);
    } catch (err: any) {
      console.error('Error denying order:', err);
      alert(`Failed to deny order: ${err.message}`);
    } finally {
      setProcessingOrder(null);
    }
  };

  if (!isOpen) return null;

  const totalOrders = forwardedCount + receivedCount;

  return (
    <div className="my-orders-modal-overlay" onClick={onClose}>
      <div className="my-orders-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <Package size={24} />
            <div>
              <h2>Orders with {contactName}</h2>
              <p className="modal-subtitle">Total: {totalOrders} orders</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'forwarded' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('forwarded');
              setStatusFilter('all');
            }}
          >
            📤 Forwarded ({forwardedCount})
          </button>
          <button
            className={`modal-tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('received');
              setStatusFilter('all');
            }}
          >
            📥 Received ({receivedCount})
          </button>
        </div>

        {/* Status Filter - Only show for received tab */}
        {activeTab === 'received' && (
          <div className="status-filter-tabs">
            <button
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({orders.length})
            </button>
            <button
              className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              ⏳ Pending ({orders.filter(o => o.forwardingStatus === 'pending').length})
            </button>
            <button
              className={`filter-btn ${statusFilter === 'accepted' ? 'active' : ''}`}
              onClick={() => setStatusFilter('accepted')}
            >
              ✅ Accepted ({orders.filter(o => o.forwardingStatus === 'accepted').length})
            </button>
            <button
              className={`filter-btn ${statusFilter === 'denied' ? 'active' : ''}`}
              onClick={() => setStatusFilter('denied')}
            >
              ❌ Denied ({orders.filter(o => o.forwardingStatus === 'denied').length})
            </button>
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {loading && (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
          )}

          {error && (
            <div className="modal-error">
              <p>❌ {error}</p>
            </div>
          )}

          {!loading && !error && filteredOrdersByStatus.length === 0 && (
            <div className="modal-empty">
              <Package size={48} />
              <p>
                {orders.length === 0
                  ? `No ${activeTab} orders with this contact`
                  : `No ${statusFilter} orders`
                }
              </p>
            </div>
          )}

          {!loading && !error && filteredOrdersByStatus.length > 0 && (
            <div className="orders-list">
              {filteredOrdersByStatus.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      <Package size={16} />
                      <strong>{order.orderNumber}</strong>
                    </div>
                    <div className="order-date">
                      <Calendar size={14} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Forwarding Status Badge */}
                  {order.forwardingStatus && (
                    <div className={`forwarding-status-badge status-${order.forwardingStatus}`}>
                      {order.forwardingStatus === 'accepted' && <CheckCircle size={14} />}
                      {order.forwardingStatus === 'denied' && <XCircle size={14} />}
                      {order.forwardingStatus === 'pending' && <span>⏳</span>}
                      <span>{order.forwardingStatus.toUpperCase()}</span>
                    </div>
                  )}

                  {order.customerName && (
                    <div className="order-detail">
                      <User size={14} />
                      <span>{order.customerName}</span>
                    </div>
                  )}

                  {order.customerPhone && (
                    <div className="order-detail">
                      <Phone size={14} />
                      <span>{order.customerPhone}</span>
                    </div>
                  )}

                  {order.customerEmail && (
                    <div className="order-detail">
                      <Mail size={14} />
                      <span>{order.customerEmail}</span>
                    </div>
                  )}

                  {order.customerAddress && (
                    <div className="order-detail">
                      <MapPin size={14} />
                      <span>{order.customerAddress}</span>
                    </div>
                  )}

                  {order.notes && Array.isArray(order.notes) && order.notes.length > 0 && order.notes[0]?.note && (
                    <div className="order-detail">
                      <FileText size={14} />
                      <span>{typeof order.notes[0].note === 'string' ? order.notes[0].note : ''}</span>
                    </div>
                  )}

                  {order.responseNote && (
                    <div className="order-detail response-note">
                      <FileText size={14} />
                      <span><strong>Response:</strong> {order.responseNote}</span>
                    </div>
                  )}

                  {order.status && (
                    <div className="order-footer">
                      <span className={`order-status status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                      {order.totalAmount && (
                        <span className="order-amount">₹{order.totalAmount}</span>
                      )}
                    </div>
                  )}

                  {/* Accept/Deny Buttons for Received Orders */}
                  {activeTab === 'received' && order.forwardingStatus === 'pending' && (
                    <div className="order-actions">
                      <button
                        className="btn-accept-order"
                        onClick={() => handleAcceptOrder(order._id, order.orderNumber)}
                        disabled={processingOrder === order._id}
                      >
                        <CheckCircle size={16} />
                        <span>Accept</span>
                      </button>
                      <button
                        className="btn-deny-order"
                        onClick={() => handleDenyOrder(order._id, order.orderNumber)}
                        disabled={processingOrder === order._id}
                      >
                        <XCircle size={16} />
                        <span>Deny</span>
                      </button>
                    </div>
                  )}

                  {/* View Forwarding Chain Button */}
                  <button
                    className="btn-view-chain"
                    onClick={() => fetchForwardingChain(order._id, order.orderNumber)}
                    disabled={loadingChain}
                  >
                    <Share2 size={16} />
                    <span>View Forwarding History</span>
                  </button>

                  {/* Show Forwarding Chain for selected order */}
                  {selectedOrderNumber === order.orderNumber && selectedOrderChain !== null && (
                    <div className="order-chain-section">
                      {loadingChain ? (
                        <div className="chain-loading">Loading chain...</div>
                      ) : (
                        <ForwardingChain
                          chain={selectedOrderChain}
                          orderNumber={order.orderNumber}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersModal;
