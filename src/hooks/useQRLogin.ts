/**
 * Hook for QR Code Login
 * Manages QR session creation and listens for login success via WebSocket
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useWebSocketStatus } from './useWebSocket';
import { crudAPI } from '@/utils/crudHelpers';
import { LOGIN_SUCCESS } from '@/componest/redux/login/authConstants';

interface QRSession {
  sessionId: string;
  expiresAt: string;
  expiresIn: number;
}

interface QRLoginState {
  isLoading: boolean;
  error: string | null;
  session: QRSession | null;
  status: 'idle' | 'pending' | 'scanned' | 'authenticated' | 'expired' | 'error';
  timeRemaining: number;
}

export const useQRLogin = () => {
  const dispatch = useDispatch();
  const { isConnected, connectionId } = useWebSocketStatus();

  const [state, setState] = useState<QRLoginState>({
    isLoading: false,
    error: null,
    session: null,
    status: 'idle',
    timeRemaining: 0
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate QR session
  const generateQRSession = useCallback(async () => {
    if (!isConnected || !connectionId) {
      setState((prev) => ({
        ...prev,
        error: 'WebSocket not connected. Please wait...',
        status: 'error'
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await crudAPI.create('/qr-auth/create-session', {
        connectionId,
        platform: 'electron',
        deviceId: localStorage.getItem('deviceId') || undefined
      });

      const session = response as QRSession;

      setState({
        isLoading: false,
        error: null,
        session,
        status: 'pending',
        timeRemaining: session.expiresIn
      });

      // Start countdown timer
      startCountdown(session.expiresIn);

      // Start polling for status (fallback if WS notification missed)
      startPolling(session.sessionId);

    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create QR session',
        status: 'error'
      }));
    }
  }, [isConnected, connectionId]);

  // Countdown timer
  const startCountdown = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let remaining = seconds;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setState((prev) => ({ ...prev, timeRemaining: remaining }));

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setState((prev) => ({
          ...prev,
          status: 'expired',
          error: 'QR code expired. Please generate a new one.'
        }));
      }
    }, 1000);
  };

  // Poll session status (fallback)
  const startPolling = (sessionId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await crudAPI.read(`/qr-auth/status/${sessionId}`);
        if (response.status === 'scanned') {
          setState((prev) => {
            if (prev.status === 'pending') {
              return { ...prev, status: 'scanned' };
            }
            return prev;
          });
        }
      } catch {

        // Ignore polling errors
      }}, 3000);
  };

  // Listen for WebSocket events
  useEffect(() => {
    const handleWebSocketMessage = (event: CustomEvent) => {
      const { type, data } = event.detail;

      if (type === 'qr:scanned' && data.sessionId === state.session?.sessionId) {

        setState((prev) => ({ ...prev, status: 'scanned' }));
      }

      if (type === 'qr:login_success' && data.sessionId === state.session?.sessionId) {


        // Clear timers
        if (timerRef.current) clearInterval(timerRef.current);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        // Update state
        setState((prev) => ({ ...prev, status: 'authenticated' }));

        // Store tokens (same as regular login)
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenExpiresAt', String(Date.now() + (data.expiresIn || 900) * 1000));
        localStorage.setItem('userData', JSON.stringify({
          ...data.user,
          role: data.userType,
          branches: data.branches
        }));
        localStorage.setItem('userRole', data.userType);

        if (data.user.selectedBranch || data.branches?.[0]?._id) {
          localStorage.setItem('selectedBranch', data.user.selectedBranch || data.branches[0]._id);
        }

        // Dispatch login success
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            token: data.token,
            refreshToken: data.refreshToken,
            userData: { ...data.user, role: data.userType, branches: data.branches }
          }
        });
      }
    };

    window.addEventListener('websocket:message' as any, handleWebSocketMessage);

    return () => {
      window.removeEventListener('websocket:message' as any, handleWebSocketMessage);
    };
  }, [state.session?.sessionId, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Reset session
  const resetSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    setState({
      isLoading: false,
      error: null,
      session: null,
      status: 'idle',
      timeRemaining: 0
    });
  }, []);

  return {
    ...state,
    generateQRSession,
    resetSession,
    isWebSocketConnected: isConnected,
    qrCodeData: state.session ? JSON.stringify({
      type: '27-qr-login',
      sessionId: state.session.sessionId,
      expiresAt: state.session.expiresAt
    }) : null
  };
};

export default useQRLogin;