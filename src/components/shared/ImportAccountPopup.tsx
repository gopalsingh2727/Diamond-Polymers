import React, { useRef } from 'react';
import './ImportAccountPopup.css';

interface ImportAccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplate: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isImporting: boolean;
  title?: string;
  infoMessage?: string;
  buttonText?: string;
}

const ImportAccountPopup: React.FC<ImportAccountPopupProps> = ({
  isOpen,
  onClose,
  onDownloadTemplate,
  onFileSelect,
  isImporting,
  title = 'Import Accounts',
  infoMessage = 'Bulk import up to 500 accounts at once. Download the template first.',
  buttonText = 'Import from Excel'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="import-account-overlay" onClick={onClose}>
      <div className="import-account-popup" onClick={(e) => e.stopPropagation()}>
        <button
          className="import-popup-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <h3 className="import-popup-title">{title}</h3>

        <div className="import-popup-content">
          <div className="import-icon-buttons">
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="import-icon-btn download"
              disabled={isImporting}
              title="Download Template"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="import-icon-btn upload"
              disabled={isImporting}
              title="Upload Excel File"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileSelect}
              style={{ display: 'none' }}
              disabled={isImporting}
            />
          </div>

          <div className="import-popup-info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>{infoMessage}</span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="import-from-excel-btn"
            disabled={isImporting}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportAccountPopup;
