import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Search, Mail, User, Send, Eye, X, AlertCircle } from 'lucide-react';
import { searchOrdersByEmail, forwardOrderToPerson } from '../../../../redux/orderforward/orderForwardActions';
import { AppDispatch } from '../../../../../store';
import ForwardToPersonModal from './ForwardToPersonModal';
import './OrderSearchByEmail.css';

interface OrderSearchByEmailProps {
  onClose?: () => void;
}

const OrderSearchByEmail: React.FC<OrderSearchByEmailProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('🔐 Token check on mount:', token ? 'Token exists' : 'No token');
    if (!token) {
      setIsAuthenticated(false);
      setError('Please login to search orders.');
    } else {
      console.log('✅ User is authenticated');
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 Starting search for email:', email);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const selectedBranch = localStorage.getItem('selectedBranch');
    console.log('🔐 Token check before search:', token ? 'Token exists' : 'No token');
    console.log('🏢 Selected branch:', selectedBranch || 'No branch selected');

    if (!token) {
      console.error('❌ No token found in localStorage');
      setError('You must be logged in to search orders. Please login and try again.');
      return;
    }

    setSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      console.log('📡 Calling searchOrdersByEmail API...');
      const response: any = await dispatch(searchOrdersByEmail(email, 1, 50));
      console.log('✅ Search response received:', response);

      setSearchResults(response.data.orders || []);

      if (response.data.orders.length === 0) {
        setError(`No orders found for email: ${email}`);
      } else {
        console.log(`✅ Found ${response.data.orders.length} orders`);
      }
    } catch (err: any) {
      console.error('❌ Search error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      // Handle specific error cases
      const errorMessage = err.response?.data?.message || err.message || 'Failed to search orders';

      if (errorMessage.includes('authentication') || errorMessage.includes('token')) {
        setError('Authentication failed. Please login again and try.');
      } else if (errorMessage.includes('permission')) {
        setError('You do not have permission to search orders.');
      } else {
        setError(errorMessage);
      }

      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleForwardOrder = (order: any) => {
    setSelectedOrder(order);
    setShowForwardModal(true);
  };

  const handleForwardComplete = async (personId: string, personRole: string, notes: string) => {
    try {
      // Normalize role to match expected type
      const normalizedRole = personRole.toLowerCase().replace(/\s+/g, '_') as 'master_admin' | 'admin' | 'manager' | 'employee';
      await dispatch(forwardOrderToPerson(selectedOrder.originalOrderId, personId, normalizedRole, notes) as any);
      setShowForwardModal(false);
      setSelectedOrder(null);
      // Optionally refresh search
    } catch (err) {
      console.error('Forward failed:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-search-modal">
      <div className="order-search-container">
        {/* Header */}
        <div className="order-search-header">
          <div>
            <h2>Search Orders by Email</h2>
            <p>Find orders sent to or received by a specific email address</p>
          </div>
          {onClose && (
            <button className="btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <Mail size={20} />
            <input
              type="email"
              placeholder="Enter customer or user email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="search-input"
            />
            <button
              type="submit"
              className="btn-search"
              disabled={searching || !email || !isAuthenticated}
              title={!isAuthenticated ? 'Please login to search orders' : ''}
            >
              {searching ? (
                <>
                  <span className="spinner-small"></span>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="search-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <h3>Found {searchResults.length} orders</h3>
              <span className="search-email-label">
                <Mail size={14} />
                {email}
              </span>
            </div>

            <div className="results-list">
              {searchResults.map((order) => (
                <div key={order._id} className="order-result-card">
                  <div className="order-result-header">
                    <div className="order-number">
                      Order: <strong>{order.orderNumber}</strong>
                    </div>
                    <div className={`status-badge status-${order.overallStatus}`}>
                      {order.overallStatus}
                    </div>
                  </div>

                  <div className="order-result-details">
                    {/* Customer Info */}
                    {order.customerInfo && (
                      <div className="detail-row">
                        <User size={14} />
                        <span>
                          Customer: {order.customerInfo.name}
                          {order.customerInfo.email && ` (${order.customerInfo.email})`}
                        </span>
                      </div>
                    )}

                    {/* Person Info */}
                    <div className="detail-row">
                      <Mail size={14} />
                      <span>
                        {order.isReceived ? 'Received by' : 'Sent by'}: {order.personName} ({order.personEmail})
                      </span>
                    </div>

                    {/* Branch Info */}
                    <div className="detail-row">
                      <span className="detail-label">Branch:</span>
                      <span>{order.branchName}</span>
                    </div>

                    {/* Amount */}
                    {order.totalAmount && (
                      <div className="detail-row">
                        <span className="detail-label">Amount:</span>
                        <span className="order-amount">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Date */}
                    <div className="detail-row">
                      <span className="detail-label">Date:</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="order-result-actions">
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => setViewOrder(order)}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleForwardOrder(order)}
                    >
                      <Send size={16} />
                      Forward
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searching && searchResults.length === 0 && !error && email && (
          <div className="search-empty">
            <Search size={48} />
            <p>Enter an email address to search for orders</p>
          </div>
        )}
      </div>

      {/* Forward Modal */}
      {showForwardModal && selectedOrder && (
        <ForwardToPersonModal
          order={selectedOrder}
          onClose={() => {
            setShowForwardModal(false);
            setSelectedOrder(null);
          }}
          onForward={handleForwardComplete}
        />
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="dialog-overlay" onClick={() => setViewOrder(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Order Details</h3>
              <button className="btn-close" onClick={() => setViewOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="dialog-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Order Number:</strong>
                  <span>{viewOrder.orderNumber}</span>
                </div>
                <div className="detail-item">
                  <strong>Status:</strong>
                  <span className={`status-badge status-${viewOrder.overallStatus}`}>
                    {viewOrder.overallStatus}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Person:</strong>
                  <span>{viewOrder.personName} ({viewOrder.personEmail})</span>
                </div>
                <div className="detail-item">
                  <strong>Branch:</strong>
                  <span>{viewOrder.branchName}</span>
                </div>
                {viewOrder.customerInfo && (
                  <>
                    <div className="detail-item">
                      <strong>Customer Name:</strong>
                      <span>{viewOrder.customerInfo.name}</span>
                    </div>
                    {viewOrder.customerInfo.email && (
                      <div className="detail-item">
                        <strong>Customer Email:</strong>
                        <span>{viewOrder.customerInfo.email}</span>
                      </div>
                    )}
                  </>
                )}
                {viewOrder.totalAmount && (
                  <div className="detail-item">
                    <strong>Total Amount:</strong>
                    <span className="order-amount">${viewOrder.totalAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <strong>Created:</strong>
                  <span>{formatDate(viewOrder.createdAt)}</span>
                </div>
              </div>

              {/* Notes */}
              {viewOrder.notes && viewOrder.notes.length > 0 && (
                <div className="order-notes">
                  <strong>Notes:</strong>
                  {viewOrder.notes.map((note: any, index: number) => (
                    <div key={index} className="note-item">
                      <p>{note.note}</p>
                      <small>
                        {note.createdByName} - {formatDate(note.createdAt)}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dialog-footer">
              <button className="btn-outline" onClick={() => setViewOrder(null)}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setViewOrder(null);
                  handleForwardOrder(viewOrder);
                }}
              >
                <Send size={16} />
                Forward Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSearchByEmail;
