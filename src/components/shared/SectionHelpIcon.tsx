import React, { useState } from 'react';
import './SectionHelpIcon.css';
import { HelpSection } from './HelpDocModal';

interface SectionHelpIconProps {
  section: HelpSection;
  size?: number;
}

const SectionHelpIcon: React.FC<SectionHelpIconProps> = ({ section, size = 20 }) => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="section-help-icon-container">
      <button
        type="button"
        className="section-help-icon-button"
        onClick={() => setShowPopover(!showPopover)}
        title="Click for detailed help"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size - 4}px`
        }}
      >
        ℹ️
      </button>

      {showPopover && (
        <>
          <div
            className="section-help-backdrop"
            onClick={() => setShowPopover(false)}
          />
          <div className="section-help-popover">
            <div className="section-help-header">
              {section.icon && <span className="section-help-icon">{section.icon}</span>}
              <h4 className="section-help-title">{section.title}</h4>
              <button
                className="section-help-close"
                onClick={() => setShowPopover(false)}
              >
                ×
              </button>
            </div>
            <div className="section-help-content">
              {Array.isArray(section.content) ? (
                <div className="section-help-list">
                  {section.content.map((item, i) => {
                    // Empty lines for spacing
                    if (item === '') {
                      return <div key={i} className="section-help-spacer" />;
                    }
                    // Check if it's a header line (ends with :)
                    if (item.trim().endsWith(':') && !item.startsWith(' ')) {
                      return (
                        <div key={i} className="section-help-header-line">
                          {item}
                        </div>
                      );
                    }
                    // Regular content
                    return (
                      <div key={i} className="section-help-item">
                        {item}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="section-help-text">{section.content}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SectionHelpIcon;
