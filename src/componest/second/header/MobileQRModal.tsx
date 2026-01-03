

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import { crudAPI } from '../../../utils/crudHelpers';
import { QRCodeSVG } from 'qrcode.react';

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
  const [copied, setCopied] = useState(false);

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
      setTimeRemaining(sessionData.expiresIn || 300); // Default 5 minutes
    } catch (err: any) {
      // Fallback: use current token directly if API doesn't exist
      const fallbackSession: MobileSession = {
        sessionId: `mobile-${Date.now()}`,
        token: token || '',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        expiresIn: 300
      };
      setSession(fallbackSession);
      setTimeRemaining(300);
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

  const copyToken = () => {
    if (session?.token) {
      navigator.clipboard.writeText(session.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = () => {
    setSession(null);
    generateMobileSession();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Mobile Login</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Scan with your mobile app to login
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-500">Generating QR code...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : session ? (
            <div className="flex flex-col items-center">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-inner">
                <QRCodeSVG
                  value={getQRData()}
                  size={200}
                  level="M"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              {/* Timer */}
              <div className="mt-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-mono text-lg ${timeRemaining < 60 ? 'text-red-500' : 'text-gray-700'}`}>
                  {formatTime(timeRemaining)}
                </span>
                {timeRemaining === 0 && (
                  <button
                    onClick={handleRefresh}
                    className="ml-2 text-orange-500 hover:text-orange-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Open 27 Manufacturing app on your mobile</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Tap "Scan QR to Login" option</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Point camera at this QR code</span>
                </div>
              </div>

              {/* Alternative: Copy Token */}
              <div className="mt-6 w-full pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center mb-2">Or copy token manually</p>
                <button
                  onClick={copyToken}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Token
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MobileQRModal;
