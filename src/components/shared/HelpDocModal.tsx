import React, { useState } from 'react';
import './HelpDocModal.css';

export interface HelpStep {
  title: string;
  description: string;
  tip?: string;
}

export interface HelpSection {
  title: string;
  icon?: string;
  content: string | string[];
}

export interface HelpDocContent {
  title: string;
  subtitle?: string;
  purpose: string;
  steps: HelpStep[];
  sections?: HelpSection[];
  examples?: {
    title: string;
    data: Record<string, string>;
  }[];
  tips?: string[];
}

interface HelpDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: HelpDocContent;
}

const HelpDocModal: React.FC<HelpDocModalProps> = ({ isOpen, onClose, content }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'fields' | 'examples'>('steps');

  if (!isOpen) return null;

  return (
    <div className="help-doc-overlay" onClick={onClose}>
      <div className="help-doc-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="help-doc-header">
          <div className="help-doc-title-section">
            <h2 className="help-doc-title">{content.title}</h2>
            {content.subtitle && <p className="help-doc-subtitle">{content.subtitle}</p>}
          </div>
          <button className="help-doc-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Purpose Box */}
        <div className="help-doc-purpose">
          <div className="purpose-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="purpose-content">
            <strong>Purpose:</strong> {content.purpose}
          </div>
        </div>

        {/* Tabs */}
        <div className="help-doc-tabs">
          <button
            className={`help-doc-tab ${activeTab === 'steps' ? 'active' : ''}`}
            onClick={() => setActiveTab('steps')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Step-by-Step
          </button>
          {content.sections && (
            <button
              className={`help-doc-tab ${activeTab === 'fields' ? 'active' : ''}`}
              onClick={() => setActiveTab('fields')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Fields
            </button>
          )}
          {content.examples && content.examples.length > 0 && (
            <button
              className={`help-doc-tab ${activeTab === 'examples' ? 'active' : ''}`}
              onClick={() => setActiveTab('examples')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              Examples
            </button>
          )}
        </div>

        {/* Content */}
        <div className="help-doc-content">
          {/* Steps Tab */}
          {activeTab === 'steps' && (
            <div className="help-steps-container">
              {content.steps.map((step, index) => (
                <div key={index} className="help-step">
                  <div className="help-step-number">{index + 1}</div>
                  <div className="help-step-content">
                    <h4 className="help-step-title">{step.title}</h4>
                    <p className="help-step-description">{step.description}</p>
                    {step.tip && (
                      <div className="help-step-tip">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18V5l12-2v13"></path>
                          <circle cx="6" cy="18" r="3"></circle>
                          <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                        <span>{step.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Tips Section */}
              {content.tips && content.tips.length > 0 && (
                <div className="help-tips-box">
                  <h4>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Tips
                  </h4>
                  <ul>
                    {content.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Fields Tab */}
          {activeTab === 'fields' && content.sections && (
            <div className="help-fields-container">
              {content.sections.map((section, index) => (
                <div key={index} className="help-field-section">
                  <h4 className="help-field-title">
                    {section.icon && <span className="field-icon">{section.icon}</span>}
                    {section.title}
                  </h4>
                  {Array.isArray(section.content) ? (
                    <ul className="help-field-list">
                      {section.content.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="help-field-description">{section.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Examples Tab */}
          {activeTab === 'examples' && content.examples && (
            <div className="help-examples-container">
              {content.examples.map((example, index) => (
                <div key={index} className="help-example">
                  <h4 className="help-example-title">
                    <span className="example-number">{index + 1}</span>
                    {example.title}
                  </h4>
                  <div className="help-example-data">
                    {Object.entries(example.data).map(([key, value]) => (
                      <div key={key} className="example-row">
                        <span className="example-key">{key}:</span>
                        <span className="example-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Help Button Component
interface HelpButtonProps {
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const HelpButton: React.FC<HelpButtonProps> = ({ onClick, size = 'medium' }) => {
  const sizeMap = {
    small: { width: 24, height: 24, fontSize: 12 },
    medium: { width: 32, height: 32, fontSize: 16 },
    large: { width: 40, height: 40, fontSize: 20 }
  };

  const { width, height, fontSize } = sizeMap[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className="help-button"
      title="View Help & Documentation"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${fontSize}px`
      }}
    >
      ?
    </button>
  );
};

export default HelpDocModal;
