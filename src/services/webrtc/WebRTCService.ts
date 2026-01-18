/**
 * WebRTC Service
 * Handles peer-to-peer audio/video connections for chat calls
 */

export type CallType = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed' | 'on_hold';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

interface CallEventHandlers {
  onStateChange?: (state: CallState) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onLocalStream?: (stream: MediaStream) => void;
  onScreenShareStream?: (stream: MediaStream | null) => void;
  onError?: (error: Error) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
}

export default class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenShareStream: MediaStream | null = null;
  private isScreenSharing: boolean = false;
  private originalVideoTrack: MediaStreamTrack | null = null;
  private callState: CallState = 'idle';
  private callType: CallType = 'audio';
  private eventHandlers: CallEventHandlers = {};
  private isOnHold: boolean = false;
  private previousCallState: CallState = 'idle';

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
   * Put call on hold - pauses all audio/video streams
   */
  holdCall(): boolean {
    if (!this.localStream || this.callState !== 'connected') {
      console.warn('[WebRTC] Cannot hold - no active call');
      return false;
    }

    console.log('[WebRTC] Putting call on hold');
    this.isOnHold = true;
    this.previousCallState = this.callState;

    // Disable all tracks (pauses media transmission)
    this.localStream.getTracks().forEach((track) => {
      track.enabled = false;
    });

    this.updateCallState('on_hold');
    return true;
  }

  /**
   * Resume call from hold
   */
  resumeCall(): boolean {
    if (!this.localStream || this.callState !== 'on_hold') {
      console.warn('[WebRTC] Cannot resume - call is not on hold');
      return false;
    }

    console.log('[WebRTC] Resuming call from hold');
    this.isOnHold = false;

    // Re-enable all tracks
    this.localStream.getTracks().forEach((track) => {
      track.enabled = true;
    });

    this.updateCallState('connected');
    return true;
  }

  /**
   * Toggle hold state
   */
  toggleHold(): boolean {
    if (this.callState === 'on_hold') {
      return this.resumeCall();
    } else if (this.callState === 'connected') {
      return this.holdCall();
    }
    return false;
  }

  /**
   * Check if call is on hold
   */
  isCallOnHold(): boolean {
    return this.isOnHold;
  }

  /**
   * Start screen sharing
   * Replaces the camera video track with screen share
   */
  async startScreenShare(): Promise<boolean> {
    try {
      if (!this.peerConnection || this.callState !== 'connected') {
        console.warn('[WebRTC] Cannot share screen - no active call');
        return false;
      }

      // Check if getDisplayMedia is supported
      if (!navigator.mediaDevices.getDisplayMedia) {
        console.error('[WebRTC] Screen sharing not supported');
        if (this.eventHandlers.onError) {
          this.eventHandlers.onError(new Error('Screen sharing is not supported in this browser'));
        }
        return false;
      }

      console.log('[WebRTC] Starting screen share...');

      // Get screen share stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: false, // Set to true if you want to share system audio
      });

      this.screenShareStream = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      if (!screenTrack) {
        console.error('[WebRTC] No video track in screen share stream');
        return false;
      }

      // Handle when user stops sharing via browser UI
      screenTrack.onended = () => {
        console.log('[WebRTC] Screen share ended by user');
        this.stopScreenShare();
      };

      // Find the video sender and replace track
      const videoSender = this.peerConnection.getSenders().find(
        sender => sender.track?.kind === 'video'
      );

      if (videoSender) {
        // Store the original video track
        this.originalVideoTrack = videoSender.track;

        // Replace with screen share track
        await videoSender.replaceTrack(screenTrack);
        console.log('[WebRTC] Video track replaced with screen share');
      } else {
        // No video sender, add the screen track
        this.peerConnection.addTrack(screenTrack, screenStream);
        console.log('[WebRTC] Screen share track added');
      }

      this.isScreenSharing = true;

      // Notify UI
      if (this.eventHandlers.onScreenShareStream) {
        this.eventHandlers.onScreenShareStream(screenStream);
      }

      console.log('[WebRTC] Screen sharing started successfully');
      return true;
    } catch (error: any) {
      console.error('[WebRTC] Error starting screen share:', error);

      // User cancelled the screen share picker
      if (error.name === 'NotAllowedError') {
        console.log('[WebRTC] Screen share cancelled by user');
        return false;
      }

      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(new Error('Failed to start screen sharing: ' + error.message));
      }
      return false;
    }
  }

  /**
   * Stop screen sharing and restore camera
   */
  async stopScreenShare(): Promise<boolean> {
    try {
      if (!this.isScreenSharing || !this.screenShareStream) {
        console.warn('[WebRTC] Not currently sharing screen');
        return false;
      }

      console.log('[WebRTC] Stopping screen share...');

      // Stop screen share tracks
      this.screenShareStream.getTracks().forEach(track => {
        track.stop();
      });

      // Restore original video track if we have one
      if (this.originalVideoTrack && this.peerConnection) {
        const videoSender = this.peerConnection.getSenders().find(
          sender => sender.track?.kind === 'video'
        );

        if (videoSender) {
          // Get a new camera stream to replace screen share
          if (this.localStream) {
            const cameraTrack = this.localStream.getVideoTracks()[0];
            if (cameraTrack) {
              await videoSender.replaceTrack(cameraTrack);
              console.log('[WebRTC] Restored camera video track');
            }
          }
        }
      }

      this.screenShareStream = null;
      this.isScreenSharing = false;
      this.originalVideoTrack = null;

      // Notify UI
      if (this.eventHandlers.onScreenShareStream) {
        this.eventHandlers.onScreenShareStream(null);
      }

      console.log('[WebRTC] Screen sharing stopped');
      return true;
    } catch (error) {
      console.error('[WebRTC] Error stopping screen share:', error);
      return false;
    }
  }

  /**
   * Toggle screen sharing
   */
  async toggleScreenShare(): Promise<boolean> {
    if (this.isScreenSharing) {
      return this.stopScreenShare();
    } else {
      return this.startScreenShare();
    }
  }

  /**
   * Check if currently sharing screen
   */
  isScreenSharingActive(): boolean {
    return this.isScreenSharing;
  }

  /**
   * Check if screen sharing is supported
   */
  static isScreenShareSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }

  /**
   * Request Picture-in-Picture mode for remote video
   * @param videoElement - The video element to put in PiP mode
   */
  async requestPictureInPicture(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      if (!document.pictureInPictureEnabled) {
        console.warn('[WebRTC] Picture-in-Picture not supported');
        return false;
      }

      if (document.pictureInPictureElement) {
        // Exit PiP if already active
        await document.exitPictureInPicture();
        console.log('[WebRTC] Exited Picture-in-Picture');
        return false;
      } else {
        // Enter PiP mode
        await videoElement.requestPictureInPicture();
        console.log('[WebRTC] Entered Picture-in-Picture');
        return true;
      }
    } catch (error) {
      console.error('[WebRTC] Error toggling Picture-in-Picture:', error);
      return false;
    }
  }

  /**
   * Check if Picture-in-Picture is supported
   */
  isPictureInPictureSupported(): boolean {
    return document.pictureInPictureEnabled === true;
  }

  /**
   * Check if currently in Picture-in-Picture mode
   */
  isInPictureInPicture(): boolean {
    return document.pictureInPictureElement !== null;
  }

  /**
   * End the call
   */
  endCall(): void {
    console.log('[WebRTC] Ending call - stopping all media tracks');

    // Clear pending ICE candidates
    this.pendingIceCandidates = [];

    // Stop all local tracks (camera/microphone)
    if (this.localStream) {
      console.log('[WebRTC] Stopping local stream tracks:', this.localStream.getTracks().length);
      this.localStream.getTracks().forEach((track) => {
        console.log('[WebRTC] Stopping local track:', track.kind, track.label);
        track.stop();
        track.enabled = false;
      });
      this.localStream = null;
    }

    // Stop all remote tracks
    if (this.remoteStream) {
      console.log('[WebRTC] Stopping remote stream tracks:', this.remoteStream.getTracks().length);
      this.remoteStream.getTracks().forEach((track) => {
        console.log('[WebRTC] Stopping remote track:', track.kind, track.label);
        track.stop();
        track.enabled = false;
      });
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      // Remove all tracks from senders first
      this.peerConnection.getSenders().forEach((sender) => {
        if (sender.track) {
          console.log('[WebRTC] Removing sender track:', sender.track.kind);
          sender.track.stop();
        }
      });

      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Reset hold state
    this.isOnHold = false;

    console.log('[WebRTC] ✅ Call ended - all media tracks stopped');
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

  /**
   * Get connection quality statistics
   * Useful for adaptive bitrate and monitoring
   */
  async getConnectionStats(): Promise<{
    rtt: number;
    packetLoss: number;
    bitrate: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  } | null> {
    if (!this.peerConnection) return null;

    try {
      const stats = await this.peerConnection.getStats();
      let rtt = 0;
      let packetsLost = 0;
      let packetsReceived = 0;
      let bytesReceived = 0;

      stats.forEach((report) => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          rtt = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
        }
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          packetsLost = report.packetsLost || 0;
          packetsReceived = report.packetsReceived || 0;
          bytesReceived = report.bytesReceived || 0;
        }
      });

      const totalPackets = packetsLost + packetsReceived;
      const packetLoss = totalPackets > 0 ? (packetsLost / totalPackets) * 100 : 0;
      const bitrate = bytesReceived * 8; // bits per second (approximate)

      // Determine quality based on metrics
      let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
      if (rtt > 300 || packetLoss > 5) {
        quality = 'poor';
      } else if (rtt > 200 || packetLoss > 2) {
        quality = 'fair';
      } else if (rtt > 100 || packetLoss > 1) {
        quality = 'good';
      }

      return { rtt, packetLoss, bitrate, quality };
    } catch (error) {
      console.error('[WebRTC] Error getting connection stats:', error);
      return null;
    }
  }

  /**
   * Apply adaptive bitrate based on network conditions
   * Adjusts video quality automatically
   */
  async applyAdaptiveBitrate(): Promise<void> {
    if (!this.peerConnection || this.callType !== 'video') return;

    try {
      const stats = await this.getConnectionStats();
      if (!stats) return;

      const videoSender = this.peerConnection.getSenders().find(
        sender => sender.track?.kind === 'video'
      );

      if (!videoSender) return;

      const params = videoSender.getParameters();
      if (!params.encodings || params.encodings.length === 0) {
        params.encodings = [{}];
      }

      // Adjust bitrate based on quality
      let maxBitrate: number;
      switch (stats.quality) {
        case 'excellent':
          maxBitrate = 2500000; // 2.5 Mbps - HD quality
          break;
        case 'good':
          maxBitrate = 1500000; // 1.5 Mbps - Good quality
          break;
        case 'fair':
          maxBitrate = 800000; // 800 Kbps - Medium quality
          break;
        case 'poor':
          maxBitrate = 400000; // 400 Kbps - Low quality
          break;
        default:
          maxBitrate = 1500000;
      }

      params.encodings[0].maxBitrate = maxBitrate;
      await videoSender.setParameters(params);

      console.log(`[WebRTC] Adaptive bitrate applied: ${maxBitrate / 1000} Kbps (quality: ${stats.quality})`);
    } catch (error) {
      console.error('[WebRTC] Error applying adaptive bitrate:', error);
    }
  }

  /**
   * Start adaptive bitrate monitoring
   * Checks connection quality every 5 seconds and adjusts bitrate
   */
  private adaptiveBitrateInterval: NodeJS.Timeout | null = null;

  startAdaptiveBitrateMonitoring(): void {
    if (this.adaptiveBitrateInterval) {
      clearInterval(this.adaptiveBitrateInterval);
    }

    this.adaptiveBitrateInterval = setInterval(async () => {
      if (this.callState === 'connected') {
        await this.applyAdaptiveBitrate();
      }
    }, 5000);

    console.log('[WebRTC] Adaptive bitrate monitoring started');
  }

  stopAdaptiveBitrateMonitoring(): void {
    if (this.adaptiveBitrateInterval) {
      clearInterval(this.adaptiveBitrateInterval);
      this.adaptiveBitrateInterval = null;
      console.log('[WebRTC] Adaptive bitrate monitoring stopped');
    }
  }

  /**
   * Get network type and estimated bandwidth
   * Uses Network Information API if available
   */
  static getNetworkInfo(): {
    type: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null {
    const connection = (navigator as any).connection ||
                       (navigator as any).mozConnection ||
                       (navigator as any).webkitConnection;

    if (!connection) return null;

    return {
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0, // Mbps
      rtt: connection.rtt || 0, // ms
      saveData: connection.saveData || false
    };
  }

  /**
   * Get recommended video constraints based on network
   */
  static getRecommendedVideoConstraints(): MediaTrackConstraints {
    const networkInfo = WebRTCService.getNetworkInfo();

    if (!networkInfo) {
      // Default HD constraints
      return {
        width: { ideal: 1280, min: 640, max: 1920 },
        height: { ideal: 720, min: 480, max: 1080 },
        frameRate: { ideal: 30, min: 15 }
      };
    }

    // Adjust based on network type
    switch (networkInfo.effectiveType) {
      case '4g':
        return {
          width: { ideal: 1280, min: 640, max: 1920 },
          height: { ideal: 720, min: 480, max: 1080 },
          frameRate: { ideal: 30, min: 20 }
        };
      case '3g':
        return {
          width: { ideal: 640, min: 320, max: 1280 },
          height: { ideal: 480, min: 240, max: 720 },
          frameRate: { ideal: 20, min: 15 }
        };
      case '2g':
      case 'slow-2g':
        return {
          width: { ideal: 320, max: 640 },
          height: { ideal: 240, max: 480 },
          frameRate: { ideal: 15, max: 20 }
        };
      default:
        return {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        };
    }
  }
}
