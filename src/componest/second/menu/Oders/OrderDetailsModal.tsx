/**
 * Order Details Modal Component
 * Shows complete order information when clicking on an order
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Loader2, AlertCircle, Calendar, User, Package, CheckCircle, Clock } from 'lucide-react';
import { fetchOrderDetails, clearOrderDetails } from '../../../redux/oders/OdersActions';
import { AppDispatch } from '../../../../store';
import { RootState } from '../../../redux/rootReducer';
import './OrderDetailsModal.css';

interface OrderDetailsModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, orderId, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux
  const orderDetails = useSelector((state: RootState) => state.orderForm?.currentOrder);
  const loading = useSelector((state: RootState) => state.orderForm?.loading);
  const error = useSelector((state: RootState) => state.orderForm?.error);

  // Fetch order details when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      console.log('🔍 Fetching order details for:', orderId);
      dispatch(fetchOrderDetails(orderId));
    }

    // Cleanup when modal closes
    return () => {
      if (!isOpen) {
        dispatch(clearOrderDetails());
      }
    };
  }, [isOpen, orderId, dispatch]);

  if (!isOpen) return null;

  // Get status color
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'completed': '#22c55e',
      'pending': '#eab308',
      'in_progress': '#3b82f6',
      'issue': '#ef4444',
      'cancelled': '#94a3b8',
      'dispatched': '#10b981',
      'approved': '#6366f1',
      'Wait for Approval': '#f97316'
    };
    return colors[status] || '#94a3b8';
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      'urgent': '#ef4444',
      'high': '#f97316',
      'normal': '#3b82f6',
      'low': '#94a3b8'
    };
    return colors[priority] || '#3b82f6';
  };

  return (
    <div className="order-details-modal-overlay" onClick={onClose}>
      <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="order-details-header">
          <div className="order-details-header-left">
            <Package size={24} />
            <h2>Order Details</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="order-details-content">
          {loading && (
            <div className="loading-state">
              <Loader2 size={48} className="loading-spinner" />
              <p>Loading order details...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <AlertCircle size={48} className="error-icon" />
              <p className="error-message">{error}</p>
              <button
                className="retry-button"
                onClick={() => dispatch(fetchOrderDetails(orderId))}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && orderDetails && (
            <>
              {/* Order Header Info */}
              <div className="order-header-section">
                <div className="order-id-badge">
                  <span className="order-id-label">Order ID</span>
                  <span className="order-id-value">{orderDetails.orderId}</span>
                </div>
                <div className="order-status-badge" style={{ backgroundColor: getStatusColor(orderDetails.overallStatus) }}>
                  {orderDetails.overallStatus}
                </div>
                <div className="order-priority-badge" style={{ backgroundColor: getPriorityColor(orderDetails.priority || 'normal') }}>
                  {orderDetails.priority || 'normal'}
                </div>
              </div>

              {/* Grid Layout for Sections */}
              <div className="details-grid">
                {/* Customer Information */}
                <div className="details-card">
                  <h3 className="details-card-title">
                    <User size={18} />
                    Customer Information
                  </h3>
                  <div className="details-list">
                    <div className="detail-item">
                      <span className="detail-label">Company</span>
                      <span className="detail-value">{orderDetails.customerId?.companyName || 'N/A'}</span>
                    </div>
                    {orderDetails.customerId?.phone1 && (
                      <div className="detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{orderDetails.customerId.phone1}</span>
                      </div>
                    )}
                    {orderDetails.customerId?.email && (
                      <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{orderDetails.customerId.email}</span>
                      </div>
                    )}
                    {orderDetails.customerId?.address1 && (
                      <div className="detail-item">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">{orderDetails.customerId.address1}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Type */}
                {orderDetails.orderTypeId && (
                  <div className="details-card">
                    <h3 className="details-card-title">
                      <Package size={18} />
                      Order Type
                    </h3>
                    <div className="details-list">
                      <div className="detail-item">
                        <span className="detail-label">Type Name</span>
                        <span className="detail-value">{orderDetails.orderTypeId.typeName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Type Code</span>
                        <span className="detail-value">{orderDetails.orderTypeId.typeCode}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="details-card">
                  <h3 className="details-card-title">
                    <Calendar size={18} />
                    Timeline
                  </h3>
                  <div className="details-list">
                    <div className="detail-item">
                      <span className="detail-label">Created</span>
                      <span className="detail-value">{new Date(orderDetails.createdAt).toLocaleString()}</span>
                    </div>
                    {orderDetails.updatedAt && (
                      <div className="detail-item">
                        <span className="detail-label">Updated</span>
                        <span className="detail-value">{new Date(orderDetails.updatedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {orderDetails.createdByName && (
                      <div className="detail-item">
                        <span className="detail-label">Created By</span>
                        <span className="detail-value">{orderDetails.createdByName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Branch */}
                {orderDetails.branchId && (
                  <div className="details-card">
                    <h3 className="details-card-title">
                      <Package size={18} />
                      Branch
                    </h3>
                    <div className="details-list">
                      <div className="detail-item">
                        <span className="detail-label">Branch Name</span>
                        <span className="detail-value">{orderDetails.branchId.name}</span>
                      </div>
                      {orderDetails.branchId.code && (
                        <div className="detail-item">
                          <span className="detail-label">Branch Code</span>
                          <span className="detail-value">{orderDetails.branchId.code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Manufacturing Steps */}
              {orderDetails.steps && orderDetails.steps.length > 0 && (
                <div className="details-section">
                  <h3 className="section-title">
                    Manufacturing Steps ({orderDetails.steps.length})
                  </h3>
                  <div className="steps-list">
                    {orderDetails.steps.map((step: any, index: number) => (
                      <div key={index} className="step-card">
                        <div className="step-header">
                          <span className="step-number">Step {index + 1}</span>
                          <span className="step-name">{step.stepName || step.stepId?.stepName || 'Unnamed Step'}</span>
                          <span className="step-status" style={{ backgroundColor: getStatusColor(step.stepStatus || 'pending') }}>
                            {step.stepStatus || 'pending'}
                          </span>
                        </div>

                        {step.machines && step.machines.length > 0 && (
                          <div className="machines-list">
                            {step.machines.map((machine: any, mIndex: number) => (
                              <div key={mIndex} className="machine-item">
                                <div className="machine-info">
                                  <span className="machine-name">{machine.machineName}</span>
                                  <span className="machine-type">{machine.machineType}</span>
                                </div>
                                <div className="machine-meta">
                                  <span className="machine-status" style={{ color: getStatusColor(machine.status || 'pending') }}>
                                    {machine.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                    {machine.status || 'pending'}
                                  </span>
                                  {machine.operatorName && (
                                    <span className="machine-operator">
                                      <User size={14} />
                                      {machine.operatorName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options */}
              {orderDetails.options && orderDetails.options.length > 0 && (
                <div className="details-section">
                  <h3 className="section-title">Options ({orderDetails.options.length})</h3>
                  <div className="options-list">
                    {orderDetails.options.map((option: any, index: number) => (
                      <div key={index} className="option-card">
                        <h4 className="option-name">{option.optionName || option.optionTypeName}</h4>
                        {option.specificationValues && option.specificationValues.length > 0 && (
                          <div className="specifications-list">
                            {option.specificationValues.map((spec: any, sIndex: number) => (
                              <div key={sIndex} className="specification-item">
                                <span className="spec-name">{spec.name}</span>
                                <span className="spec-value">{spec.value} {spec.unit}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {orderDetails.Notes && (
                <div className="details-section">
                  <h3 className="section-title">Notes</h3>
                  <div className="notes-content">
                    {orderDetails.Notes}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="order-details-footer">
          <button className="close-footer-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
