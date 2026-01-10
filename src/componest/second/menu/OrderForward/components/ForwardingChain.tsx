import React from 'react';
import { ArrowRight, Calendar, User, FileText } from 'lucide-react';
import './ForwardingChain.css';

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

interface ForwardingChainProps {
  chain: ForwardingStep[];
  orderNumber: string;
}

const ForwardingChain: React.FC<ForwardingChainProps> = ({ chain, orderNumber }) => {
  if (!chain || chain.length === 0) {
    return (
      <div className="forwarding-chain-empty">
        <p>No forwarding history available</p>
      </div>
    );
  }

  return (
    <div className="forwarding-chain-container">
      <div className="forwarding-chain-header">
        <h3>Forwarding Chain</h3>
        <span className="chain-count">{chain.length} forward{chain.length > 1 ? 's' : ''}</span>
      </div>

      <div className="forwarding-chain-timeline">
        {chain.map((step, index) => (
          <div key={index} className="forwarding-step">
            {/* From */}
            <div className="forwarding-node from-node">
              <div className="node-icon">
                <User size={16} />
              </div>
              <div className="node-details">
                <div className="node-name">{step.from}</div>
                {step.fromRole && (
                  <div className="node-role">{step.fromRole}</div>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="forwarding-arrow">
              <ArrowRight size={20} />
              <div className="arrow-line"></div>
            </div>

            {/* To */}
            <div className="forwarding-node to-node">
              <div className="node-icon">
                <User size={16} />
              </div>
              <div className="node-details">
                <div className="node-name">{step.to}</div>
                {step.toRole && (
                  <div className="node-role">{step.toRole}</div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="forwarding-metadata">
              <div className="metadata-row">
                <Calendar size={14} />
                <span>{new Date(step.date).toLocaleString()}</span>
              </div>
              {step.forwardedByName && (
                <div className="metadata-row">
                  <User size={14} />
                  <span>By: {step.forwardedByName}</span>
                </div>
              )}
              {step.notes && (
                <div className="metadata-row notes-row">
                  <FileText size={14} />
                  <span>{step.notes}</span>
                </div>
              )}
            </div>

            {/* Connector line to next step */}
            {index < chain.length - 1 && (
              <div className="step-connector"></div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="forwarding-chain-summary">
        <div className="summary-path">
          <strong>Complete Path:</strong>
          <div className="path-visualization">
            {chain.map((step, index) => (
              <React.Fragment key={index}>
                {index === 0 && (
                  <>
                    <span className="path-node">{step.from}</span>
                    <ArrowRight size={14} className="path-arrow" />
                  </>
                )}
                <span className="path-node">{step.to}</span>
                {index < chain.length - 1 && (
                  <ArrowRight size={14} className="path-arrow" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardingChain;
