import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ArrowRight, User, Mail, MapPin, Calendar, FileText, X } from 'lucide-react';
import { fetchPersonForwardingChain } from '../../../../redux/orderforward/orderForwardActions';
import { AppDispatch } from '../../../../../store';
import './ForwardingChainDisplay.css';

interface ChainStep {
  from: {
    personId: string;
    personRole: string;
    personName: string;
    personEmail: string;
    branchName: string;
  };
  to: {
    personId: string;
    personRole: string;
    personName: string;
    personEmail: string;
    branchName: string;
  };
  notes: string;
  date: string;
  timestamp: string;
}

interface ForwardingChainDisplayProps {
  orderId: string;
  orderNumber: string;
  onClose?: () => void;
}

const ForwardingChainDisplay: React.FC<ForwardingChainDisplayProps> = ({
  orderId,
  orderNumber,
  onClose
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [chain, setChain] = useState<ChainStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChain();
  }, [orderId]);

  const loadChain = async () => {
    setLoading(true);
    setError(null);

    try {
      const response: any = await dispatch(fetchPersonForwardingChain(orderId));
      setChain(response.data.forwardingChain || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load forwarding chain');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'master_admin':
        return '#991b1b';
      case 'admin':
        return '#1e40af';
      case 'manager':
        return '#92400e';
      case 'employee':
        return '#065f46';
      default:
        return '#374151';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'master_admin':
        return 'Master Admin';
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'employee':
        return 'Employee';
      default:
        return role;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="chain-modal-overlay" onClick={onClose}>
        <div className="chain-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="chain-loading">
            <div className="spinner"></div>
            <p>Loading forwarding chain...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chain-modal-overlay" onClick={onClose}>
        <div className="chain-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="chain-error">
            <p>{error}</p>
            <button onClick={loadChain} className="btn-retry">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chain-modal-overlay" onClick={onClose}>
      <div className="chain-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chain-modal-header">
          <div>
            <h2>Order Forwarding Chain</h2>
            <p className="order-number-label">Order: {orderNumber}</p>
          </div>
          {onClose && (
            <button className="btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Chain Display */}
        <div className="chain-modal-body">
          {chain.length === 0 ? (
            <div className="chain-empty">
              <FileText size={48} />
              <p>No forwarding history</p>
              <span>This order hasn't been forwarded yet</span>
            </div>
          ) : (
            <div className="forwarding-chain">
              {chain.map((step, index) => (
                <div key={index} className="chain-step">
                  {/* From Person */}
                  <div className="person-card from-person">
                    <div className="person-header">
                      <div
                        className="person-avatar"
                        style={{ background: getRoleColor(step.from.personRole) }}
                      >
                        <User size={20} />
                      </div>
                      <div className="person-info">
                        <div className="person-name">{step.from.personName}</div>
                        <div
                          className="role-badge"
                          style={{ background: `${getRoleColor(step.from.personRole)}20`, color: getRoleColor(step.from.personRole) }}
                        >
                          {getRoleBadge(step.from.personRole)}
                        </div>
                      </div>
                    </div>
                    <div className="person-details">
                      <div className="detail-item">
                        <Mail size={14} />
                        <span>{step.from.personEmail}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>{step.from.branchName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="chain-arrow">
                    <ArrowRight size={24} />
                  </div>

                  {/* To Person */}
                  <div className="person-card to-person">
                    <div className="person-header">
                      <div
                        className="person-avatar"
                        style={{ background: getRoleColor(step.to.personRole) }}
                      >
                        <User size={20} />
                      </div>
                      <div className="person-info">
                        <div className="person-name">{step.to.personName}</div>
                        <div
                          className="role-badge"
                          style={{ background: `${getRoleColor(step.to.personRole)}20`, color: getRoleColor(step.to.personRole) }}
                        >
                          {getRoleBadge(step.to.personRole)}
                        </div>
                      </div>
                    </div>
                    <div className="person-details">
                      <div className="detail-item">
                        <Mail size={14} />
                        <span>{step.to.personEmail}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>{step.to.branchName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="step-metadata">
                    <div className="metadata-item">
                      <Calendar size={14} />
                      <span>{formatDate(step.date)}</span>
                    </div>
                    {step.notes && (
                      <div className="metadata-notes">
                        <FileText size={14} />
                        <span>{step.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Step Number */}
                  <div className="step-number">Step {index + 1}</div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {chain.length > 0 && (
            <div className="chain-summary">
              <div className="summary-item">
                <strong>Total Forwards:</strong>
                <span>{chain.length}</span>
              </div>
              <div className="summary-item">
                <strong>Current Owner:</strong>
                <span>{chain[chain.length - 1]?.to.personName} ({chain[chain.length - 1]?.to.personEmail})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForwardingChainDisplay;
