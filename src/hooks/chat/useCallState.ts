/**
 * useCallState Hook
 * Manages WebRTC call state with proper cleanup to prevent memory leaks
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { WebRTCService } from '../../services/WebRTCService';
import type {
  CallState,
  CallType,
  IncomingCall,
  CallStats,
  UseCallStateReturn
} from '../../types/chat';

/**
 * Custom hook for managing WebRTC calls
 *
 * @param personId - ID of the person to call
 * @param personName - Name of the person
 * @returns Call state and control functions
 */
export function useCallState(
  personId: string,
  personName: string
): UseCallStateReturn {
  // WebRTC service instance (persisted across renders)
  const webrtcServiceRef = useRef<WebRTCService | null>(null);

  // Initialize WebRTC service once
  if (!webrtcServiceRef.current) {
    webrtcServiceRef.current = new WebRTCService();
  }

  // Call state
  const [callState, setCallState] = useState<CallState>('idle');
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStats, setCallStats] = useState<CallStats | null>(null);

  // Refs to access latest state in cleanup (fixes memory leak bug)
  const callStateRef = useRef(callState);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  /**
   * Start an outgoing call
   */
  const startCall = useCallback(async (type: CallType): Promise<void> => {
    try {
      console.log('[useCallState] Starting call:', { personId, personName, type });

      setCallState('calling');
      callStartTimeRef.current = new Date();

      // Initialize WebRTC
      const service = webrtcServiceRef.current;
      if (!service) throw new Error('WebRTC service not initialized');

      await service.initCall(personId, type);
      const stream = service.getLocalStream();
      setLocalStream(stream);

      // Set auto-timeout (60 seconds)
      // FIX: Clear timeout when call is answered to prevent race condition
      callTimeoutRef.current = setTimeout(() => {
        if (callStateRef.current === 'calling') {
          console.log('[useCallState] Call timeout - no answer');
          endCall();
        }
      }, 60000);

    } catch (error) {
      console.error('[useCallState] Start call error:', error);
      setCallState('failed');
      throw error;
    }
  }, [personId, personName]);

  /**
   * Accept an incoming call
   */
  const acceptCall = useCallback(async (): Promise<void> => {
    if (!incomingCall) return;

    try {
      console.log('[useCallState] Accepting call from:', incomingCall.callerName);

      // FIX: Clear timeout to prevent race condition
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      setCallState('connected');
      callStartTimeRef.current = new Date();

      const service = webrtcServiceRef.current;
      if (!service) throw new Error('WebRTC service not initialized');

      await service.acceptCall(incomingCall.callId);
      const stream = service.getLocalStream();
      setLocalStream(stream);

      setIncomingCall(null);

    } catch (error) {
      console.error('[useCallState] Accept call error:', error);
      setCallState('failed');
      throw error;
    }
  }, [incomingCall]);

  /**
   * Reject an incoming call
   */
  const rejectCall = useCallback((): void => {
    console.log('[useCallState] Rejecting call');

    const service = webrtcServiceRef.current;
    if (service && incomingCall) {
      service.rejectCall(incomingCall.callId);
    }

    setIncomingCall(null);
    setCallState('idle');
  }, [incomingCall]);

  /**
   * End the current call
   */
  const endCall = useCallback((): void => {
    console.log('[useCallState] Ending call');

    // Clear timeout
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    // Calculate call stats
    if (callStartTimeRef.current) {
      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - callStartTimeRef.current.getTime()) / 1000
      );

      setCallStats({
        duration,
        startTime: callStartTimeRef.current,
        endTime,
        quality: 'good' // Could be calculated based on connection quality
      });

      callStartTimeRef.current = null;
    }

    // Clean up WebRTC
    const service = webrtcServiceRef.current;
    if (service) {
      service.endCall();
    }

    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('[useCallState] Stopped track:', track.kind);
      });
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    // Reset state
    setCallState('ended');
    setIsMuted(false);
    setIsVideoEnabled(true);
    setIsScreenSharing(false);

    // Return to idle after brief delay
    setTimeout(() => setCallState('idle'), 2000);
  }, [localStream, remoteStream]);

  /**
   * Toggle mute/unmute
   */
  const toggleMute = useCallback((): void => {
    const service = webrtcServiceRef.current;
    if (!service) return;

    const newMutedState = !isMuted;
    service.toggleMute();
    setIsMuted(newMutedState);

    console.log('[useCallState] Mute toggled:', newMutedState);
  }, [isMuted]);

  /**
   * Toggle video on/off
   */
  const toggleVideo = useCallback((): void => {
    const service = webrtcServiceRef.current;
    if (!service) return;

    const newVideoState = !isVideoEnabled;
    service.toggleVideo();
    setIsVideoEnabled(newVideoState);

    console.log('[useCallState] Video toggled:', newVideoState);
  }, [isVideoEnabled]);

  /**
   * Toggle screen sharing
   */
  const toggleScreenShare = useCallback(async (): Promise<void> => {
    try {
      const service = webrtcServiceRef.current;
      if (!service) return;

      const result = await service.toggleScreenShare();
      setIsScreenSharing(service.isScreenSharingActive());

      console.log('[useCallState] Screen share toggled:', result);
    } catch (error) {
      console.error('[useCallState] Screen share error:', error);
      throw error;
    }
  }, []);

  /**
   * Switch camera (front/back on mobile)
   */
  const switchCamera = useCallback(async (): Promise<void> => {
    try {
      const service = webrtcServiceRef.current;
      if (!service) return;

      await service.switchCamera();
      console.log('[useCallState] Camera switched');
    } catch (error) {
      console.error('[useCallState] Camera switch error:', error);
      throw error;
    }
  }, []);

  /**
   * Handle remote stream updates
   */
  useEffect(() => {
    const service = webrtcServiceRef.current;
    if (!service) return;

    const handleRemoteStream = (stream: MediaStream) => {
      console.log('[useCallState] Remote stream received');
      setRemoteStream(stream);
      setCallState('connected');
    };

    service.on('remoteStream', handleRemoteStream);

    return () => {
      service.off('remoteStream', handleRemoteStream);
    };
  }, []);

  /**
   * Cleanup on unmount - FIX: Uses ref to prevent memory leaks
   */
  useEffect(() => {
    return () => {
      console.log('[useCallState] Component unmounting, cleaning up...');

      // FIX: Use ref to get latest state (prevents memory leak)
      if (callStateRef.current !== 'idle') {
        endCall();
      }

      // Clear timeout
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }

      // Clean up WebRTC service
      const service = webrtcServiceRef.current;
      if (service) {
        service.destroy();
        webrtcServiceRef.current = null;
      }
    };
  }, []); // Safe with refs

  return {
    callState,
    incomingCall,
    startCall,
    endCall,
    acceptCall,
    rejectCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    switchCamera,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    localStream,
    remoteStream,
    callStats
  };
}
