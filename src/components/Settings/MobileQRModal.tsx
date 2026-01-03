/**
 * Mobile QR Login Modal
 * Generates a QR code that mobile app can scan to login
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../componest/redux/rootReducer';
import { crudAPI } from '../../utils/crudHelpers';
import { QRCodeCanvas } from 'qrcode.react';
import './Settings.css';

interface MobileQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MobileSession {
  sessionId: string;
  token: string;
  expiresAt: string;
  expiresIn: number;
}

const MobileQRModal = ({ isOpen, onClose }: MobileQRModalProps) => {
  const { userData, token } = useSelector((state: RootState) => state.auth);
  const [session, setSession] = useState<MobileSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Generate mobile session when modal opens
  useEffect(() => {
    if (isOpen && !session) {
      generateMobileSession();
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const generateMobileSession = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create mobile session via API
      const response = await crudAPI.create('/auth/mobile-session', {
        userId: userData?._id || userData?.id,
        branchId: localStorage.getItem('selectedBranch'),
        platform: 'mobile',
        deviceInfo: navigator.userAgent
      });

      const sessionData = response as MobileSession;
      setSession(sessionData);
      setTimeRemaining(sessionData.expiresIn || 30);
    } catch {
      // Fallback: use current token directly if API doesn't exist
      const fallbackSession: MobileSession = {
        sessionId: `mobile-${Date.now()}`,
        token: token || '',
        expiresAt: new Date(Date.now() + 30 * 1000).toISOString(),
        expiresIn: 30
      };
      setSession(fallbackSession);
      setTimeRemaining(30);
    } finally {
      setLoading(false);
    }
  };

  const getQRData = () => {
    if (!session) return '';

    const apiUrl = import.meta.env.VITE_API_27INFINITY_IN || 'https://api.27infinity.in';

    // QR data contains all info needed for mobile login
    const qrData = {
      type: 'mobile-login',
      apiUrl,
      token: session.token,
      sessionId: session.sessionId,
      branchId: localStorage.getItem('selectedBranch'),
      expiresAt: session.expiresAt
    };

    return JSON.stringify(qrData);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    setSession(null);
    generateMobileSession();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="qr-modal-overlay">
      <div className="qr-modal-container">
        {/* Header */}
        <div className="qr-modal-header">
          <div className="qr-modal-header-row">
            <h2 className="qr-modal-title">Mobile Login</h2>
            <button onClick={onClose} className="qr-modal-close-btn">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="qr-modal-subtitle">Scan with your mobile app to login</p>
        </div>

        {/* Content */}
        <div className="qr-modal-content">
          {loading ? (
            <div className="qr-loading-container">
              <div className="qr-loading-spinner" />
              <p className="qr-loading-text">Generating QR code...</p>
            </div>
          ) : error ? (
            <div className="qr-error-container">
              <div className="qr-error-icon">
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="qr-error-message">{error}</p>
              <button onClick={handleRefresh} className="qr-retry-btn">
                Try Again
              </button>
            </div>
          ) : session ? (
            <div className="qr-display-container">
              {/* QR Code */}
              <div style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QRCodeCanvas
                  value={getQRData() || 'https://27infinity.in'}
                  size={180}
                  level="M"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              {/* Timer */}
              <div className="qr-timer-container">
                <svg className="qr-timer-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`qr-timer-text ${timeRemaining < 60 ? 'expired' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
                {timeRemaining === 0 && (
                  <button onClick={handleRefresh} className="qr-refresh-btn">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileQRModal;
