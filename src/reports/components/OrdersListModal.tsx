import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../componest/redux/rootReducer';
import { AppDispatch } from '../../store';
import { fetchOrders } from '../../componest/redux/oders/OdersActions';
import './styles/OrdersListModal.css';

interface OrdersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filters: {
    branchId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
  customFilter?: (order: any) => boolean; // Custom filter function for client-side filtering
}

const OrdersListModal: React.FC<OrdersListModalProps> = ({ isOpen, onClose, title, filters, customFilter }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const ordersState = useSelector((state: RootState) => (state.orders as any)?.list || { orders: [], loading: false });
  const allOrders = ordersState?.orders || [];
  const loading = ordersState?.loading || false;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 15;

  useEffect(() => {
    if (isOpen && filters.branchId) {
      dispatch(fetchOrders({
        branchId: filters.branchId,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 1000,
      }));
    }
  }, [dispatch, isOpen, filters.branchId, filters.status, filters.startDate, filters.endDate]);

  // Apply custom filter first, then search filter
  const filteredOrders = useMemo(() => {
    let orders = allOrders;

    // Apply custom filter if provided (for orderType, category, etc.)
    if (customFilter) {
      orders = orders.filter(customFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      orders = orders.filter((order: any) =>
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.customerId?.companyName?.toLowerCase().includes(searchLower) ||
        order._id?.toLowerCase().includes(searchLower)
      );
    }

    return orders;
  }, [allOrders, customFilter, searchTerm]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'completed': '#22c55e',
      'pending': '#eab308',
      'in_progress': '#3b82f6',
      'issue': '#ef4444',
      'cancelled': '#94a3b8',
      'dispatched': '#10b981',
      'approved': '#6366f1',
      'Wait for Approval': '#f97316',
    };
    return colors[status] || '#94a3b8';
  };

  const handleViewOrder = (orderId: string) => {
    onClose();
    navigate(`/menu/Oders/details/${orderId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="orders-list-modal-overlay" onClick={onClose}>
      <div className="orders-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="orders-list-modal__header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="orders-list-modal__filters">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="modal-search-input"
          />
          <div className="modal-count">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="orders-list-modal__content">
          {loading ? (
            <div className="modal-loading">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="modal-empty">No orders found</div>
          ) : (
            <>
              <table className="modal-orders-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Order ID</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order: any, index: number) => (
                    <tr key={order._id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="order-id-cell">{order.orderNumber || order._id?.slice(-8)}</td>
                      <td>{order.customerId?.companyName || 'Unknown'}</td>
                      <td>
                        <span
                          className="modal-status-badge"
                          style={{ backgroundColor: getStatusColor(order.overallStatus) }}
                        >
                          {order.overallStatus || 'Unknown'}
                        </span>
                      </td>
                      <td>{order.totalQuantity || order.quantity || 0}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="modal-view-btn"
                          onClick={() => handleViewOrder(order._id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="modal-pagination">
                  <button
                    className="modal-pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="modal-pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="modal-pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersListModal;
