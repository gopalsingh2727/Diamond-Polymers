/**
 * CallManager - Unified Call State Management
 * Single source of truth for all call-related state and logic
 * Used by both PersonChat and GlobalIncomingCallHandler
 */

import WebRTCService, { CallState, CallType } from '../webrtc/WebRTCService';
import ringtoneManager from '../../utils/ringtone';
import callNotificationManager from '../../utils/callNotifications';
import callHistoryTracker from '../../utils/callHistoryTracker';
import { getWebSocketClient } from '../../componest/redux/websocket/websocketMiddleware';

export interface IncomingCallData {
  callerId: string;
  callerName: string;
  callerEmail?: string;
  callType: CallType;
  offer?: RTCSessionDescriptionInit;
  timestamp?: string;
}

export interface CallManagerState {
  callState: CallState;
  callType: CallType;
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
}

export type CallStateChangeCallback = (state: CallManagerState) => void;

class CallManager {
  private webrtcService: WebRTCService;
  private state: CallManagerState;
  private listeners: Set<CallStateChangeCallback> = new Set();
  private callTimerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.webrtcService = new WebRTCService();
    this.state = this.getInitialState();
  }

  private getInitialState(): CallManagerState {
    return {
      callState: 'idle',
      callType: 'audio',
      localStream: null,
      remoteStream: null,
      callDuration: 0,
      isMuted: false,
      isCameraOff: false,
      isOnHold: false,
      isMinimized: false,
      activePersonId: null,
      activePersonName: '',
      incomingCall: null,
    };
  }

  // Subscribe to state changes
  subscribe(callback: CallStateChangeCallback): () => void {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(this.state);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners of state change
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback({ ...this.state }));
  }

  // Update state and notify listeners
  private updateState(updates: Partial<CallManagerState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // Get current state
  getState(): CallManagerState {
    return { ...this.state };
  }

  // Check if currently in a call
  isInCall(): boolean {
    return this.state.callState !== 'idle' && this.state.callState !== 'ended' && this.state.callState !== 'failed';
  }

  // Handle incoming call
  handleIncomingCall(data: IncomingCallData): void {
    console.log('[CallManager] Handling incoming call from:', data.callerName);

    // If already in a call, reject
    if (this.isInCall()) {
      console.log('[CallManager] Already in a call, sending busy signal');
      this.sendBusySignal(data.callerId);
      return;
    }

    // Store incoming call data
    this.updateState({ incomingCall: data });

    // Track call history
    callHistoryTracker.trackIncomingCallStart(
      data.callerId,
      data.callerName,
      data.callType
    );

    // Show notification
    callNotificationManager.showIncomingCallNotification(
      data.callerName,
      data.callType,
      {
        onNotificationClick: () => {
          window.focus();
        }
      }
    );

    console.log('[CallManager] Incoming call ready to be accepted');
  }

  // Start outgoing call
  async startCall(personId: string, personName: string, callType: CallType): Promise<boolean> {
    console.log('[CallManager] Starting', callType, 'call to:', personName);

    if (this.isInCall()) {
      console.error('[CallManager] Already in a call');
      return false;
    }

    try {
      // Update state
      this.updateState({
        callState: 'calling',
        callType,
        activePersonId: personId,
        activePersonName: personName,
      });

      // Track outgoing call
      callHistoryTracker.trackOutgoingCallStart(personId, personName, callType);

      // Play outgoing ringtone
      ringtoneManager.playOutgoingRingtone();

      // Setup WebRTC handlers
      this.setupWebRTCHandlers(personId);

      // Start the call
      const offer = await this.webrtcService.startCall(callType);
      if (!offer) {
        throw new Error('Failed to create call offer');
      }

      // Send offer via WebSocket
      const wsClient = getWebSocketClient();
      if (wsClient) {
        wsClient.send({
          action: 'call:offer',
          data: { receiverId: personId, offer, callType }
        });
      } else {
        throw new Error('WebSocket not connected');
      }

      console.log('[CallManager] Call offer sent');
      return true;
    } catch (error: any) {
      console.error('[CallManager] Failed to start call:', error);
      ringtoneManager.stop();
      this.updateState({
        callState: 'failed',
        activePersonId: null,
        activePersonName: '',
      });
      callHistoryTracker.markCallFailed();
      return false;
    }
  }

  // Accept incoming call
  async acceptCall(): Promise<boolean> {
    const incomingCall = this.state.incomingCall;
    if (!incomingCall || !incomingCall.offer) {
      console.error('[CallManager] No incoming call to accept');
      return false;
    }

    console.log('[CallManager] Accepting call from:', incomingCall.callerName);

    try {
      // Stop ringtone
      ringtoneManager.stop();

      // Close notification
      callNotificationManager.closeActiveNotification();

      // Update state
      this.updateState({
        callState: 'ringing',
        callType: incomingCall.callType,
        activePersonId: incomingCall.callerId,
        activePersonName: incomingCall.callerName,
        incomingCall: null,
      });

      // Track answered
      callHistoryTracker.updateCallAnswered();

      // Setup WebRTC handlers
      this.setupWebRTCHandlers(incomingCall.callerId);

      // Answer the call
      const answer = await this.webrtcService.answerCall(incomingCall.offer, incomingCall.callType);
      if (!answer) {
        throw new Error('Failed to create answer');
      }

      // Send answer via WebSocket
      const wsClient = getWebSocketClient();
      if (wsClient) {
        wsClient.send({
          action: 'call:answer',
          data: { callerId: incomingCall.callerId, answer }
        });
      } else {
        throw new Error('WebSocket not connected');
      }

      console.log('[CallManager] Call accepted successfully');
      return true;
    } catch (error: any) {
      console.error('[CallManager] Failed to accept call:', error);
      this.rejectCall();
      return false;
    }
  }

  // Reject incoming call
  rejectCall(): void {
    const incomingCall = this.state.incomingCall;
    if (!incomingCall) {
      this.resetState();
      return;
    }

    console.log('[CallManager] Rejecting call from:', incomingCall.callerName);

    // Stop ringtone
    ringtoneManager.stop();

    // Close notification
    callNotificationManager.closeActiveNotification();

    // Track rejected
    callHistoryTracker.markCallRejected();

    // Show missed call notification
    callNotificationManager.showMissedCallNotification(
      incomingCall.callerName,
      incomingCall.callType
    );

    // Send reject via WebSocket
    const wsClient = getWebSocketClient();
    if (wsClient) {
      wsClient.send({
        action: 'call:reject',
        data: { callerId: incomingCall.callerId, reason: 'Call declined' }
      });
    }

    // Reset state
    this.resetState();
  }

  // End active call
  endCall(): void {
    console.log('[CallManager] Ending call');

    const { callState, callDuration, activePersonId, activePersonName } = this.state;

    // Stop timer
    this.stopCallTimer();

    // Stop ringtone
    ringtoneManager.stop();

    // Complete history
    if (callState === 'connected' || callState === 'on_hold') {
      callHistoryTracker.completeCall(callDuration);
      callNotificationManager.showCallEndedNotification(activePersonName, callDuration);
    } else if (callState === 'calling' || callState === 'ringing') {
      callHistoryTracker.markCallFailed();
    }

    // Send end signal
    if (activePersonId && callState !== 'idle' && callState !== 'failed') {
      const wsClient = getWebSocketClient();
      if (wsClient) {
        wsClient.send({
          action: 'call:end',
          data: { targetUserId: activePersonId }
        });
      }
    }

    // Stop WebRTC
    this.stopMediaTracks();
    this.webrtcService.endCall();

    // Reset state
    this.resetState();
  }

  // Handle call answered (caller side)
  handleCallAnswered(answer: RTCSessionDescriptionInit): void {
    console.log('[CallManager] Call answered, setting remote answer');
    ringtoneManager.stop();
    this.webrtcService.handleAnswer(answer);
  }

  // Handle call rejected (caller side)
  handleCallRejected(): void {
    console.log('[CallManager] Call rejected');
    ringtoneManager.stop();
    callHistoryTracker.markCallRejected();
    this.updateState({ callState: 'failed' });
    setTimeout(() => this.resetState(), 2000);
  }

  // Handle call ended by other party
  handleCallEnded(): void {
    console.log('[CallManager] Call ended by other party');
    if (this.isInCall()) {
      this.endCall();
    }
  }

  // Handle ICE candidate
  handleIceCandidate(candidate: RTCIceCandidateInit): void {
    if (this.isInCall()) {
      this.webrtcService.addIceCandidate(candidate);
    }
  }

  // Toggle mute
  toggleMute(): boolean {
    const enabled = this.webrtcService.toggleMicrophone();
    this.updateState({ isMuted: !enabled });
    return !enabled;
  }

  // Toggle camera
  toggleCamera(): boolean {
    const enabled = this.webrtcService.toggleCamera();
    this.updateState({ isCameraOff: !enabled });
    return !enabled;
  }

  // Toggle hold
  toggleHold(): boolean {
    const result = this.webrtcService.toggleHold();
    if (result) {
      const isOnHold = this.webrtcService.isCallOnHold();
      this.updateState({
        isOnHold,
        callState: isOnHold ? 'on_hold' : 'connected'
      });
    }
    return this.state.isOnHold;
  }

  // Minimize call
  minimizeCall(): void {
    if (this.isInCall()) {
      console.log('[CallManager] Minimizing call');
      this.updateState({ isMinimized: true });
    }
  }

  // Expand call (restore from minimized)
  expandCall(): void {
    if (this.isInCall()) {
      console.log('[CallManager] Expanding call');
      this.updateState({ isMinimized: false });
    }
  }

  // Toggle minimize state
  toggleMinimize(): boolean {
    if (this.isInCall()) {
      const newMinimized = !this.state.isMinimized;
      this.updateState({ isMinimized: newMinimized });
      return newMinimized;
    }
    return false;
  }

  // Switch camera
  async switchCamera(): Promise<boolean> {
    return this.webrtcService.switchCamera();
  }

  // Private: Setup WebRTC handlers
  private setupWebRTCHandlers(targetUserId: string): void {
    this.webrtcService.setEventHandlers({
      onStateChange: (state) => {
        console.log('[CallManager] WebRTC state:', state);
        this.updateState({ callState: state });
        if (state === 'connected') {
          this.startCallTimer();
        }
      },
      onLocalStream: (stream) => {
        console.log('[CallManager] Local stream received');
        this.updateState({ localStream: stream });
      },
      onRemoteStream: (stream) => {
        console.log('[CallManager] Remote stream received');
        this.updateState({ remoteStream: stream });
      },
      onIceCandidate: (candidate) => {
        const wsClient = getWebSocketClient();
        if (wsClient) {
          wsClient.send({
            action: 'call:ice_candidate',
            data: { targetUserId, candidate: candidate.toJSON() }
          });
        }
      },
      onError: (error) => {
        console.error('[CallManager] WebRTC error:', error);
        this.endCall();
      }
    });
  }

  // Private: Start call timer
  private startCallTimer(): void {
    this.stopCallTimer();
    this.callTimerInterval = setInterval(() => {
      this.updateState({ callDuration: this.state.callDuration + 1 });
    }, 1000);
  }

  // Private: Stop call timer
  private stopCallTimer(): void {
    if (this.callTimerInterval) {
      clearInterval(this.callTimerInterval);
      this.callTimerInterval = null;
    }
  }

  // Private: Stop media tracks
  private stopMediaTracks(): void {
    const { localStream, remoteStream } = this.state;

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
    }
  }

  // Private: Send busy signal
  private sendBusySignal(callerId: string): void {
    const wsClient = getWebSocketClient();
    if (wsClient) {
      wsClient.send({
        action: 'call:reject',
        data: { callerId, reason: 'User is busy' }
      });
    }
  }

  // Private: Reset state
  private resetState(): void {
    this.stopCallTimer();
    this.stopMediaTracks();
    ringtoneManager.stop();
    callNotificationManager.closeActiveNotification();
    this.updateState(this.getInitialState());
  }
}

// Export singleton instance
export const callManager = new CallManager();
export default callManager;
