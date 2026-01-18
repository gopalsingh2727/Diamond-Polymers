/**
 * GlobalIncomingCallHandler - Handles incoming calls globally
 * Renders at App root level so calls work even when PersonChat is closed
 * Uses the unified CallManager service
 * Supports minimized call view
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../redux/rootReducer';
import IncomingCallModal from './IncomingCallModal';
import ActiveCallModal from './ActiveCallModal';
import CallingModal from './CallingModal';
import MinimizedCallWidget from './MinimizedCallWidget';
import useCall from '../../../../../../hooks/useCall';

const GlobalIncomingCallHandler: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

  const {
    callState,
    callType,
    localStream,
    remoteStream,
    callDuration,
    isMuted,
    isCameraOff,
    isOnHold,
    isMinimized,
    activePersonName,
    incomingCall,
    hasIncomingCall,
    isInCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleHold,
    minimizeCall,
    expandCall,
    handleIncomingCall,
    handleCallAnswered,
    handleCallRejected,
    handleCallEnded,
    handleIceCandidate,
  } = useCall();

  // Listen for WebSocket call events
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('[GlobalCallHandler] Setting up call event listeners');

    const onIncomingCall = (event: CustomEvent) => {
      const data = event.detail;
      console.log('[GlobalCallHandler] 📞 Incoming call:', data);

      // Skip if PersonChat is handling calls
      if ((window as any).__personChatOpen) {
        console.log('[GlobalCallHandler] PersonChat is open, skipping');
        return;
      }

      handleIncomingCall({
        callerId: data.callerId,
        callerName: data.callerName || 'Unknown Caller',
        callerEmail: data.callerEmail,
        callType: data.callType || 'audio',
        offer: data.offer,
        timestamp: data.timestamp,
      });
    };

    const onCallAnswered = (event: CustomEvent) => {
      const data = event.detail;
      console.log('[GlobalCallHandler] Call answered:', data);
      if (data.answer) {
        handleCallAnswered(data.answer);
      }
    };

    const onCallRejected = () => {
      console.log('[GlobalCallHandler] Call rejected');
      handleCallRejected();
    };

    const onCallEnded = () => {
      console.log('[GlobalCallHandler] Call ended');
      handleCallEnded();
    };

    const onIceCandidate = (event: CustomEvent) => {
      const data = event.detail;
      if (data.candidate) {
        handleIceCandidate(data.candidate);
      }
    };

    // Register listeners
    window.addEventListener('call:incoming', onIncomingCall as EventListener);
    window.addEventListener('call:answered', onCallAnswered as EventListener);
    window.addEventListener('call:rejected', onCallRejected as EventListener);
    window.addEventListener('call:ended', onCallEnded as EventListener);
    window.addEventListener('call:ice_candidate', onIceCandidate as EventListener);

    return () => {
      window.removeEventListener('call:incoming', onIncomingCall as EventListener);
      window.removeEventListener('call:answered', onCallAnswered as EventListener);
      window.removeEventListener('call:rejected', onCallRejected as EventListener);
      window.removeEventListener('call:ended', onCallEnded as EventListener);
      window.removeEventListener('call:ice_candidate', onIceCandidate as EventListener);
    };
  }, [isAuthenticated, handleIncomingCall, handleCallAnswered, handleCallRejected, handleCallEnded, handleIceCandidate]);

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  // Don't render if PersonChat is handling calls
  if ((window as any).__personChatOpen) return null;

  // Show incoming call modal
  if (hasIncomingCall && incomingCall) {
    return (
      <IncomingCallModal
        isOpen={true}
        callerName={incomingCall.callerName}
        callType={incomingCall.callType}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
    );
  }

  // Show calling modal (outgoing call waiting for answer)
  if (callState === 'calling') {
    return (
      <CallingModal
        isOpen={true}
        personName={activePersonName}
        callType={callType}
        onCancel={endCall}
      />
    );
  }

  // Show active call modal or minimized widget
  if (isInCall && (callState === 'connected' || callState === 'ringing' || callState === 'on_hold')) {
    // Show minimized widget if call is minimized
    if (isMinimized) {
      return (
        <MinimizedCallWidget
          personName={activePersonName}
          callType={callType}
          callDuration={callDuration}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isOnHold={isOnHold}
          localStream={localStream}
          remoteStream={remoteStream}
          onExpand={expandCall}
          onEndCall={endCall}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onToggleHold={toggleHold}
        />
      );
    }

    // Show full active call modal
    return (
      <ActiveCallModal
        isOpen={true}
        personName={activePersonName}
        callType={callType}
        callDuration={callDuration}
        localStream={localStream}
        remoteStream={remoteStream}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        isOnHold={isOnHold}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onToggleHold={toggleHold}
        onMinimize={minimizeCall}
        onEndCall={endCall}
      />
    );
  }

  return null;
};

export default GlobalIncomingCallHandler;
