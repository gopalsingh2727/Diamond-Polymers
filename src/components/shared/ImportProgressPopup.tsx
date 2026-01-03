import React from 'react';
import './ImportProgressPopup.css';

interface ImportProgressPopupProps {
  isOpen: boolean;
  currentIndex: number;
  total: number;
  successCount: number;
  failedCount: number;
  message?: string;
}

const ImportProgressPopup: React.FC<ImportProgressPopupProps> = ({
  isOpen,
  currentIndex,
  total,
  successCount,
  failedCount,
  message
}) => {
  if (!isOpen) return null;

  const progress = total > 0 ? (currentIndex / total) * 100 : 0;

  return (
    <div className="import-progress-overlay">
      <div className="import-progress-popup-minimal">
        <p className="import-progress-text">
          {message || `Importing ${currentIndex} of ${total} accounts...`}{' '}
          <span className="import-progress-stats">
            ({successCount} success, {failedCount} failed)
          </span>
        </p>
        <div className="import-progress-bar-container">
          <div
            className="import-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImportProgressPopup;
