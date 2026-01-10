/**
 * WebRTC Service
 * Handles peer-to-peer audio/video connections for chat calls
 */

export type CallType = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

interface CallEventHandlers {
  onStateChange?: (state: CallState) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onLocalStream?: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
}

export default class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callState: CallState = 'idle';
  private callType: CallType = 'audio';
  private eventHandlers: CallEventHandlers = {};

  // Queue for ICE candidates that arrive before peer connection is ready
  private pendingIceCandidates: RTCIceCandidateInit[] = [];

  private config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  constructor(handlers?: CallEventHandlers) {
    if (handlers) {
      this.eventHandlers = handlers;
    }
  }

  /**
   * Initialize WebRTC connection
   */
  private initializePeerConnection(): void {
    try {
      this.peerConnection = new RTCPeerConnection(this.config);

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.eventHandlers.onIceCandidate) {
          console.log('[WebRTC] New ICE candidate:', event.candidate);
          this.eventHandlers.onIceCandidate(event.candidate);
        }
      };

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('[WebRTC] Received remote track:', event.track.kind);
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(event.track);

        if (this.eventHandlers.onRemoteStream) {
          this.eventHandlers.onRemoteStream(this.remoteStream);
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('[WebRTC] Connection state:', this.peerConnection?.connectionState);

        switch (this.peerConnection?.connectionState) {
          case 'connected':
            this.updateCallState('connected');
            break;
          case 'disconnected':
          case 'failed':
            this.updateCallState('failed');
            break;
          case 'closed':
            this.updateCallState('ended');
            break;
        }
      };

      // Handle ICE connection state
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('[WebRTC] ICE connection state:', this.peerConnection?.iceConnectionState);

        if (this.peerConnection?.iceConnectionState === 'failed') {
          this.updateCallState('failed');
          if (this.eventHandlers.onError) {
            this.eventHandlers.onError(new Error('ICE connection failed'));
          }
        }
      };

      console.log('[WebRTC] Peer connection initialized');
    } catch (error) {
      console.error('[WebRTC] Error initializing peer connection:', error);
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(error as Error);
      }
    }
  }

  /**
   * Start a call (caller side)
   * @param callType - Type of call (audio or video)
   * @param existingStream - Optional pre-fetched media stream (avoids double device access)
   */
  async startCall(callType: CallType, existingStream?: MediaStream): Promise<RTCSessionDescriptionInit | null> {
    try {
      this.callType = callType;
      this.updateCallState('calling');

      // Use existing stream if provided, otherwise get a new one
      let stream: MediaStream | null = existingStream || null;
      if (!stream) {
        stream = await this.fetchLocalMediaStream(callType);
        if (!stream) {
          throw new Error('Failed to get local media stream');
        }
      }

      this.localStream = stream;
      if (this.eventHandlers.onLocalStream) {
        this.eventHandlers.onLocalStream(stream);
      }

      // Initialize peer connection
      this.initializePeerConnection();

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, stream);
      });

      // Create offer
      const offer = await this.peerConnection?.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });

      if (!offer) {
        throw new Error('Failed to create offer');
      }

      await this.peerConnection?.setLocalDescription(offer);
      console.log('[WebRTC] Offer created:', offer);

      return offer;
    } catch (error) {
      console.error('[WebRTC] Error starting call:', error);
      this.updateCallState('failed');
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(error as Error);
      }
      return null;
    }
  }

  /**
   * Answer an incoming call (receiver side)
   */
  async answerCall(
    offer: RTCSessionDescriptionInit,
    callType: CallType
  ): Promise<RTCSessionDescriptionInit | null> {
    try {
      this.callType = callType;
      this.updateCallState('ringing');

      // Get local media stream
      const stream = await this.fetchLocalMediaStream(callType);
      if (!stream) {
        throw new Error('Failed to get local media stream');
      }

      this.localStream = stream;
      if (this.eventHandlers.onLocalStream) {
        this.eventHandlers.onLocalStream(stream);
      }

      // Initialize peer connection
      this.initializePeerConnection();

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, stream);
      });

      // Set remote description (offer)
      await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(offer));

      // Process any queued ICE candidates now that remote description is set
      await this.processQueuedIceCandidates();

      // Create answer
      const answer = await this.peerConnection?.createAnswer();
      if (!answer) {
        throw new Error('Failed to create answer');
      }

      await this.peerConnection?.setLocalDescription(answer);
      console.log('[WebRTC] Answer created:', answer);

      return answer;
    } catch (error) {
      console.error('[WebRTC] Error answering call:', error);
      this.updateCallState('failed');
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(error as Error);
      }
      return null;
    }
  }

  /**
   * Handle answer from callee
   */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('No peer connection');
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('[WebRTC] Answer received and set');

      // Process any queued ICE candidates now that remote description is set
      await this.processQueuedIceCandidates();
    } catch (error) {
      console.error('[WebRTC] Error handling answer:', error);
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(error as Error);
      }
    }
  }

  /**
   * Add ICE candidate
   * If peer connection isn't ready, queue the candidate for later
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        console.log('[WebRTC] Peer connection not ready, queueing ICE candidate');
        this.pendingIceCandidates.push(candidate);
        return;
      }

      // Check if remote description is set before adding ICE candidate
      if (!this.peerConnection.remoteDescription) {
        console.log('[WebRTC] Remote description not set, queueing ICE candidate');
        this.pendingIceCandidates.push(candidate);
        return;
      }

      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('[WebRTC] ICE candidate added');
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error);
      // Don't propagate ICE candidate errors to avoid ending the call
      // ICE gathering will continue and connection may still succeed
    }
  }

  /**
   * Process queued ICE candidates
   * Called after remote description is set
   */
  private async processQueuedIceCandidates(): Promise<void> {
    if (this.pendingIceCandidates.length === 0) {
      return;
    }

    console.log(`[WebRTC] Processing ${this.pendingIceCandidates.length} queued ICE candidates`);

    const candidates = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];

    for (const candidate of candidates) {
      try {
        if (this.peerConnection && this.peerConnection.remoteDescription) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('[WebRTC] Queued ICE candidate added');
        }
      } catch (error) {
        console.error('[WebRTC] Error adding queued ICE candidate:', error);
      }
    }
  }

  /**
   * Fetch local media stream from browser (audio/video)
   */
  private async fetchLocalMediaStream(callType: CallType): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices API not supported in this browser');
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      };

      console.log('[WebRTC] Requesting media stream with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[WebRTC] Local stream obtained:', stream.getTracks().map(t => t.kind));
      return stream;
    } catch (error: any) {
      console.error('[WebRTC] Error getting local stream:', error);

      // Provide user-friendly error messages
      let userMessage = 'Failed to access camera/microphone';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        userMessage = 'Failed to start call. Please check your camera/microphone permissions.\n\nTo fix:\n1. Click the lock icon in your browser address bar\n2. Allow camera and microphone access\n3. Refresh the page and try again';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        const devices = callType === 'video' ? 'camera and microphone' : 'microphone';
        userMessage = `No ${devices} found. Please connect a device and try again.`;
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        userMessage = 'Camera/microphone is already in use by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        userMessage = 'Your camera/microphone does not meet the required specifications. Try using a different device.';
      } else if (error.name === 'SecurityError') {
        userMessage = 'Camera/microphone access blocked due to security restrictions. Please check your browser settings.';
      } else if (error.message) {
        userMessage = `Media access error: ${error.message}`;
      }

      const enhancedError = new Error(userMessage);
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(enhancedError);
      }
      return null;
    }
  }

  /**
   * Toggle microphone mute
   */
  toggleMicrophone(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('[WebRTC] Microphone:', audioTrack.enabled ? 'unmuted' : 'muted');
      return audioTrack.enabled;
    }
    return false;
  }

  /**
   * Toggle camera on/off
   */
  toggleCamera(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('[WebRTC] Camera:', videoTrack.enabled ? 'on' : 'off');
      return videoTrack.enabled;
    }
    return false;
  }

  /**
   * Get available cameras
   */
  async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      console.log('[WebRTC] Available cameras:', cameras.length);
      return cameras;
    } catch (error) {
      console.error('[WebRTC] Error getting cameras:', error);
      return [];
    }
  }

  /**
   * Switch to a different camera
   * @param deviceId - The device ID of the camera to switch to (optional - toggles between cameras if not provided)
   */
  async switchCamera(deviceId?: string): Promise<boolean> {
    try {
      if (!this.localStream) {
        console.error('[WebRTC] No local stream available');
        return false;
      }

      const videoTrack = this.localStream.getVideoTracks()[0];
      if (!videoTrack) {
        console.error('[WebRTC] No video track available');
        return false;
      }

      // Get available cameras
      const cameras = await this.getAvailableCameras();
      if (cameras.length < 2) {
        console.warn('[WebRTC] Only one camera available, cannot switch');
        return false;
      }

      // If no deviceId provided, find the next camera
      let targetDeviceId = deviceId;
      if (!targetDeviceId) {
        const currentDeviceId = videoTrack.getSettings().deviceId;
        const currentIndex = cameras.findIndex(cam => cam.deviceId === currentDeviceId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        targetDeviceId = cameras[nextIndex].deviceId;
      }

      console.log('[WebRTC] Switching to camera:', targetDeviceId);

      // Get new video stream with the selected camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: targetDeviceId } },
        audio: false
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace the old video track with the new one
      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      // Stop the old video track
      videoTrack.stop();

      // Remove old video track from local stream
      this.localStream.removeTrack(videoTrack);

      // Add new video track to local stream
      this.localStream.addTrack(newVideoTrack);

      // Notify UI to update
      if (this.eventHandlers.onLocalStream) {
        this.eventHandlers.onLocalStream(this.localStream);
      }

      console.log('[WebRTC] Camera switched successfully');
      return true;
    } catch (error) {
      console.error('[WebRTC] Error switching camera:', error);
      return false;
    }
  }

  /**
   * Get microphone mute status
   */
  isMicrophoneMuted(): boolean {
    if (!this.localStream) return true;
    const audioTrack = this.localStream.getAudioTracks()[0];
    return audioTrack ? !audioTrack.enabled : true;
  }

  /**
   * Get camera status
   */
  isCameraOff(): boolean {
    if (!this.localStream) return true;
    const videoTrack = this.localStream.getVideoTracks()[0];
    return videoTrack ? !videoTrack.enabled : true;
  }

  /**
   * End the call
   */
  endCall(): void {
    console.log('[WebRTC] Ending call');

    // Clear pending ICE candidates
    this.pendingIceCandidates = [];

    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.updateCallState('ended');
  }

  /**
   * Update call state and notify handlers
   */
  private updateCallState(state: CallState): void {
    this.callState = state;
    console.log('[WebRTC] Call state changed to:', state);

    if (this.eventHandlers.onStateChange) {
      this.eventHandlers.onStateChange(state);
    }
  }

  /**
   * Get current call state
   */
  getCallState(): CallState {
    return this.callState;
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Update event handlers
   */
  setEventHandlers(handlers: CallEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }
}
