/**
 * useCall Hook - React hook for call management
 * Provides unified call state and actions for components
 */

import { useState, useEffect, useCallback } from 'react';
import callManager, { CallManagerState, IncomingCallData } from '../services/call/CallManager';
import { CallType } from '../services/webrtc/WebRTCService';

export interface UseCallReturn {
  // State
  callState: CallManagerState['callState'];
  callType: CallManagerState['callType'];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callDuration: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isOnHold: boolean;
  isMinimized: boolean;
  activePersonId: string | null;
  activePersonName: string;
  incomingCall: IncomingCallData | null;

  // Computed
  isInCall: boolean;
  hasIncomingCall: boolean;

  // Actions
  startCall: (personId: string, personName: string, callType: CallType) => Promise<boolean>;
  acceptCall: () => Promise<boolean>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => boolean;
  toggleCamera: () => boolean;
  toggleHold: () => boolean;
  switchCamera: () => Promise<boolean>;
  minimizeCall: () => void;
  expandCall: () => void;
  toggleMinimize: () => boolean;

  // Event handlers (for WebSocket events)
  handleIncomingCall: (data: IncomingCallData) => void;
  handleCallAnswered: (answer: RTCSessionDescriptionInit) => void;
  handleCallRejected: () => void;
  handleCallEnded: () => void;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => void;
}

export function useCall(): UseCallReturn {
  const [state, setState] = useState<CallManagerState>(callManager.getState());

  // Subscribe to CallManager state changes
  useEffect(() => {
    const unsubscribe = callManager.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  // Actions
  const startCall = useCallback(
    (personId: string, personName: string, callType: CallType) => {
      return callManager.startCall(personId, personName, callType);
    },
    []
  );

  const acceptCall = useCallback(() => {
    return callManager.acceptCall();
  }, []);

  const rejectCall = useCallback(() => {
    callManager.rejectCall();
  }, []);

  const endCall = useCallback(() => {
    callManager.endCall();
  }, []);

  const toggleMute = useCallback(() => {
    return callManager.toggleMute();
  }, []);

  const toggleCamera = useCallback(() => {
    return callManager.toggleCamera();
  }, []);

  const toggleHold = useCallback(() => {
    return callManager.toggleHold();
  }, []);

  const switchCamera = useCallback(() => {
    return callManager.switchCamera();
  }, []);

  const minimizeCall = useCallback(() => {
    callManager.minimizeCall();
  }, []);

  const expandCall = useCallback(() => {
    callManager.expandCall();
  }, []);

  const toggleMinimize = useCallback(() => {
    return callManager.toggleMinimize();
  }, []);

  // Event handlers
  const handleIncomingCall = useCallback((data: IncomingCallData) => {
    callManager.handleIncomingCall(data);
  }, []);

  const handleCallAnswered = useCallback((answer: RTCSessionDescriptionInit) => {
    callManager.handleCallAnswered(answer);
  }, []);

  const handleCallRejected = useCallback(() => {
    callManager.handleCallRejected();
  }, []);

  const handleCallEnded = useCallback(() => {
    callManager.handleCallEnded();
  }, []);

  const handleIceCandidate = useCallback((candidate: RTCIceCandidateInit) => {
    callManager.handleIceCandidate(candidate);
  }, []);

  return {
    // State
    callState: state.callState,
    callType: state.callType,
    localStream: state.localStream,
    remoteStream: state.remoteStream,
    callDuration: state.callDuration,
    isMuted: state.isMuted,
    isCameraOff: state.isCameraOff,
    isOnHold: state.isOnHold,
    isMinimized: state.isMinimized,
    activePersonId: state.activePersonId,
    activePersonName: state.activePersonName,
    incomingCall: state.incomingCall,

    // Computed
    isInCall: callManager.isInCall(),
    hasIncomingCall: state.incomingCall !== null,

    // Actions
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleHold,
    switchCamera,
    minimizeCall,
    expandCall,
    toggleMinimize,

    // Event handlers
    handleIncomingCall,
    handleCallAnswered,
    handleCallRejected,
    handleCallEnded,
    handleIceCandidate,
  };
}

export default useCall;
