/**
 * QR Code Login Component
 * Displays QR code for mobile app to scan
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { InfinitySpinner } from '@/components/InfinitySpinner';
import { crudAPI } from '@/utils/crudHelpers';
import { LOGIN_SUCCESS } from '../redux/login/authConstants';

interface QRCodeLoginProps {
  onBack: () => void;
}

const QRCodeLogin: React.FC<QRCodeLoginProps> = ({ onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [sessionId, setSessionId] = useState('');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'scanned' | 'authenticated'>('pending');
  const [wsError, setWsError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket anonymously for QR login
  useEffect(() => {
    connectAnonymousWebSocket();
    return () => {
      // Cleanup WebSocket and polling on unmount
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Generate QR session once we have a connectionId
  useEffect(() => {
    if (connectionId) {
      generateSession();
    }
  }, [connectionId]);

  const connectAnonymousWebSocket = () => {
    setIsConnecting(true);
    setWsError(null);

    try {
      // Get WebSocket URL from environment
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || (
      import.meta.env.DEV ? 'ws://localhost:3001' : 'wss://ws.27infinity.in');

      // Generate device ID if not exists
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `electron-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('deviceId', deviceId);
      }

      // Connect with anonymous token for QR login
      const url = new URL(wsUrl);
      url.searchParams.set('token', 'qr-login-anonymous');
      url.searchParams.set('platform', 'electron');
      url.searchParams.set('deviceId', deviceId);
      url.searchParams.set('purpose', 'qr-login');


      const ws = new WebSocket(url.toString());
      wsRef.current = ws;

      ws.onopen = () => {

        setIsConnecting(false);
        // Request connectionId from server
        ws.send(JSON.stringify({ action: 'getConnectionId' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);


          // Handle connection confirmation with connectionId
          if (message.type === 'connection' || message.action === 'connected') {
            if (message.connectionId) {

              setConnectionId(message.connectionId);
            }
          }

          // Handle QR login events
          if (message.type === 'qr:scanned') {
            setStatus('scanned');
          } else if (message.type === 'qr:login_success' || message.type === 'qr:authenticated') {
            handleAuthentication(message.data);
          }
        } catch (error) {

        }
      };

      ws.onerror = (error) => {

        setIsConnecting(false);
        setWsError('Failed to connect to server. Please try again.');
      };

      ws.onclose = () => {

        if (!connectionId) {
          setIsConnecting(false);
        }
      };

    } catch (error: any) {

      setIsConnecting(false);
      setWsError(error.message || 'Failed to connect to server');
    }
  };

  const handleAuthentication = (data: any) => {
    setStatus('authenticated');

    // Clear polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Close anonymous WebSocket
    if (wsRef.current) {
      wsRef.current.close();
    }

    const { token, refreshToken, user, branches, userType } = data;

    // Store tokens
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userRole', userType);
    localStorage.setItem('tokenExpiresAt', String(Date.now() + 43200000)); // 12 hours

    // Store user data
    const userData = { ...user, role: userType, branches };
    if (branches?.length > 0) {
      localStorage.setItem('selectedBranch', branches[0]._id);
      userData.selectedBranch = branches[0]._id;
    }
    localStorage.setItem('userData', JSON.stringify(userData));

    // Dispatch login success
    dispatch({
      type: LOGIN_SUCCESS,
      payload: { token, refreshToken, userData, userType, branches }
    });

    // Navigate to home
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId]);

  // Poll for authentication status (fallback if WebSocket doesn't deliver)
  useEffect(() => {
    if (!sessionId || timeRemaining === 0) return;

    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await crudAPI.read(`/qr-auth/status/${sessionId}`);

        if (response.status === 'scanned') {
          setStatus('scanned');
        } else if (response.status === 'authenticated') {
          handleAuthentication(response);
        }
      } catch (error) {

        // Ignore errors during polling (session not yet authenticated)
      }}, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [sessionId, timeRemaining]);

  const generateSession = async () => {
    if (!connectionId) {

      return;
    }

    setIsLoading(true);
    setStatus('pending');
    setWsError(null);

    try {
      // Get device ID
      const deviceId = localStorage.getItem('deviceId');

      // Call backend to create session with connectionId
      const response = await crudAPI.create('/qr-auth/create-session', {
        connectionId,
        platform: 'electron',
        deviceId
      });

      if (response && response.sessionId) {
        setSessionId(response.sessionId);
        setTimeRemaining(response.expiresIn || 300);
      } else {

        setWsError('Failed to create QR session. Please try again.');
      }
    } catch (error: any) {

      setWsError(error.message || 'Failed to create QR session. Please try again.');
    }

    setIsLoading(false);
  };

  const getQRData = () => {
    return JSON.stringify({
      type: '27-qr-login',
      sessionId,
      expiresAt: new Date(Date.now() + timeRemaining * 1000).toISOString()
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#4b5563',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>

            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', margin: 0 }}>Login with QR Code</h2>
          <div style={{ width: '40px' }} />
        </div>

        {/* Content */}
        <div style={{
          background: '#f9fafb',
          borderRadius: '16px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '350px',
          justifyContent: 'center'
        }}>
          {isConnecting ?
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <InfinitySpinner size="lg" />
              <p style={{ color: '#6b7280' }}>Connecting to server...</p>
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>Please wait while we establish a secure connection</p>
            </div> :
          wsError ?
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div style={{
              width: '64px',
              height: '64px',
              background: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#dc2626">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p style={{ color: '#dc2626', fontSize: '16px' }}>{wsError}</p>
              <button
              onClick={() => {
                // Reset state and reconnect
                setConnectionId(null);
                setSessionId('');
                if (wsRef.current) {
                  wsRef.current.close();
                  wsRef.current = null;
                }
                connectAnonymousWebSocket();
              }}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #FF6B35, #FFA500)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}>

                Try Again
              </button>
            </div> :
          isLoading ?
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <InfinitySpinner size="lg" />
              <p style={{ color: '#6b7280' }}>Generating QR code...</p>
            </div> :
          timeRemaining === 0 ?
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div style={{
              width: '64px',
              height: '64px',
              background: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#dc2626">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p style={{ color: '#dc2626', fontSize: '16px' }}>QR code expired</p>
              <button
              onClick={generateSession}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #FF6B35, #FFA500)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}>

                Generate New QR Code
              </button>
            </div> :
          status === 'authenticated' ?
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div style={{
              width: '80px',
              height: '80px',
              background: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p style={{ color: '#16a34a', fontSize: '18px', fontWeight: 600, margin: 0 }}>
                Login Successful!
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                Redirecting to dashboard...
              </p>
            </div> :
          status === 'scanned' ?
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div style={{
              width: '80px',
              height: '80px',
              background: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <InfinitySpinner size="md" />
              </div>
              <p style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 600, margin: 0 }}>
                QR Code Scanned
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                Waiting for confirmation on mobile app...
              </p>
            </div> :

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              {/* QR Code */}
              <div style={{
              padding: '20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
                <QRCodeCanvas
                value={getQRData()}
                size={180}
                level="M"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000" />

              </div>

              {/* Timer */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '18px', fontWeight: 500, color: '#1f2937', margin: '0 0 4px' }}>
                  Scan with 27 Manufacturing App
                </p>
                <p style={{
                color: timeRemaining < 60 ? '#dc2626' : '#6b7280',
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '16px'
              }}>
                  Expires in {formatTime(timeRemaining)}
                </p>
              </div>

              {/* Instructions */}
              <div style={{ width: '100%', background: 'white', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                    <span style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    background: '#fef3c7',
                    color: '#f59e0b',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>1</span>
                    <span>Open 27 Manufacturing mobile app</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                    <span style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    background: '#fef3c7',
                    color: '#f59e0b',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>2</span>
                    <span>Tap "Scan QR to Login"</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                    <span style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    background: '#fef3c7',
                    color: '#f59e0b',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>3</span>
                    <span>Point camera at this QR code</span>
                  </div>
                </div>
              </div>

              {/* Refresh button */}
              <button
              onClick={generateSession}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>

                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh QR Code
              </button>
            </div>
          }
        </div>
      </div>
    </div>);

};

export default QRCodeLogin;