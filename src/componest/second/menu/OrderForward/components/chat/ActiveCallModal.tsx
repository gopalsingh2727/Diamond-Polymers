/**
 * Active Call Modal - Enhanced with all video call features
 * Features: End call, Camera on/off, Switch camera, Mute/Unmute, Fullscreen
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  MicIcon,
  MicOffIcon,
  VideocamIcon,
  VideocamOffIcon,
  CallEndIcon,
  FullscreenIcon,
  FullscreenExitIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  CameraswitchIcon,
  PauseIcon,
  PlayArrowIcon,
  PictureInPictureAltIcon,
  OpenInNewIcon,
  ScreenShareIcon,
  StopScreenShareIcon,
  MinimizeIcon,
  OpenInFullIcon,
  CallIcon
} from './icons';
import './CallModal.css';

interface ActiveCallModalProps {
  isOpen: boolean;
  personName: string;
  callType: 'audio' | 'video';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isOnHold?: boolean;
  isScreenSharing?: boolean;
  isMinimized?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor' | null;
  callDuration: number; // in seconds
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onSwitchCamera?: () => void;
  onToggleHold?: () => void;
  onToggleScreenShare?: () => void;
  onMinimize?: () => void;
  onEndCall: () => void;
}

const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  isOpen,
  personName,
  callType,
  localStream,
  remoteStream,
  isMuted,
  isCameraOff,
  isOnHold = false,
  isScreenSharing = false,
  isMinimized = false,
  connectionQuality = null,
  callDuration,
  onToggleMute,
  onToggleCamera,
  onSwitchCamera,
  onToggleHold,
  onToggleScreenShare,
  onMinimize,
  onEndCall
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [displayDuration, setDisplayDuration] = useState('00:00');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [hasCameraSwitch, setHasCameraSwitch] = useState(false);
  const [isInPiP, setIsInPiP] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isScreenShareSupported, setIsScreenShareSupported] = useState(false);

  // Format call duration
  useEffect(() => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    setDisplayDuration(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  }, [callDuration]);

  // Check if camera switching is available
  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(d => d.kind === 'videoinput');
        setHasCameraSwitch(cameras.length > 1);
      } catch (error) {
        console.error('Error checking cameras:', error);
      }
    };
    checkCameras();
  }, []);

  // Check if Picture-in-Picture is supported
  useEffect(() => {
    setIsPiPSupported(document.pictureInPictureEnabled === true);
  }, []);

  // Check if screen sharing is supported
  useEffect(() => {
    setIsScreenShareSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia));
  }, []);

  // Listen for PiP changes
  useEffect(() => {
    const handlePiPChange = () => {
      setIsInPiP(document.pictureInPictureElement !== null);
    };

    document.addEventListener('enterpictureinpicture', handlePiPChange);
    document.addEventListener('leavepictureinpicture', handlePiPChange);

    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiPChange);
      document.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, []);

  // Handle Picture-in-Picture toggle
  const togglePictureInPicture = async () => {
    if (!remoteVideoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await remoteVideoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Error toggling Picture-in-Picture:', error);
    }
  };

  // Set local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      // Ensure speaker is on by default
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = isSpeakerOn ? 1.0 : 0.0;
    }
  }, [remoteStream, isSpeakerOn]);

  // Auto-hide controls after 3 seconds of no interaction (video calls only)
  useEffect(() => {
    if (callType !== 'video') return;

    let timeout: NodeJS.Timeout;

    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isFullscreen) setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetTimeout();

    if (isFullscreen) {
      document.addEventListener('mousemove', handleMouseMove);
      resetTimeout();
    } else {
      setShowControls(true);
    }

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isFullscreen, callType]);

  // Handle fullscreen
  const toggleFullscreen = async () => {
    if (!modalRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await modalRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Handle speaker toggle
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = !isSpeakerOn ? 1.0 : 0.0;
    }
  };

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!isOpen) return null;

  // Minimized view - small floating bar at bottom
  if (isMinimized) {
    return (
      <div className="call-minimized-bar active">
        <div className="minimized-info">
          <div className="minimized-avatar">
            {callType === 'video' ? (
              <VideocamIcon width={18} height={18} />
            ) : (
              <CallIcon width={18} height={18} />
            )}
          </div>
          <div className="minimized-text">
            <span className="minimized-name">{personName}</span>
            <span className="minimized-status">{displayDuration}</span>
          </div>
        </div>
        <div className="minimized-actions">
          <button
            className={`minimized-btn ${isMuted ? 'muted' : ''}`}
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOffIcon width={18} height={18} /> : <MicIcon width={18} height={18} />}
          </button>
          {onMinimize && (
            <button className="minimized-btn expand" onClick={onMinimize} title="Expand">
              <OpenInFullIcon width={18} height={18} />
            </button>
          )}
          <button className="minimized-btn end" onClick={onEndCall} title="End call">
            <CallEndIcon width={18} height={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="call-modal-overlay">
      <div
        ref={modalRef}
        className={`call-modal active-call-modal ${callType === 'video' ? 'video-call' : 'audio-call'} ${isFullscreen ? 'fullscreen' : ''}`}
      >
        {/* Remote Video/Audio */}
        <div className="call-video-container">
          {callType === 'video' ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="call-remote-video"
            />
          ) : (
            <div className="call-audio-avatar">
              <div className="caller-avatar audio">
                <span className="avatar-initials">{personName.charAt(0).toUpperCase()}</span>
              </div>
              {/* Audio call pulse animation */}
              <div className="calling-pulses">
                <div className="calling-wave"></div>
                <div className="calling-wave"></div>
              </div>
            </div>
          )}

          {/* Call Info Overlay */}
          <div className={`call-info-overlay ${!showControls && isFullscreen ? 'hidden' : ''}`}>
            <h3 className="caller-name">{personName}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <p className="call-timer">{displayDuration}</p>
              {connectionQuality && (
                <div
                  className={`connection-quality-indicator quality-${connectionQuality}`}
                  title={`Connection quality: ${connectionQuality}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: connectionQuality === 'excellent' ? 'rgba(34, 197, 94, 0.2)' :
                                     connectionQuality === 'good' ? 'rgba(59, 130, 246, 0.2)' :
                                     connectionQuality === 'fair' ? 'rgba(251, 191, 36, 0.2)' :
                                     'rgba(239, 68, 68, 0.2)',
                    color: connectionQuality === 'excellent' ? '#22c55e' :
                           connectionQuality === 'good' ? '#3b82f6' :
                           connectionQuality === 'fair' ? '#fbbf24' :
                           '#ef4444'
                  }}
                >
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: connectionQuality === 'excellent' ? '#22c55e' :
                                     connectionQuality === 'good' ? '#3b82f6' :
                                     connectionQuality === 'fair' ? '#fbbf24' :
                                     '#ef4444'
                  }}></span>
                  {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
                </div>
              )}
            </div>
            {!remoteStream && <p className="call-status-text">Connecting...</p>}
            {isOnHold && (
              <div className="call-hold-badge">
                <PauseIcon width={16} height={16} />
                <span>Call On Hold</span>
              </div>
            )}
          </div>
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {callType === 'video' && (
          <div className={`call-video-pip ${!showControls && isFullscreen ? 'compact' : ''}`}>
            {isCameraOff ? (
              <div className="call-camera-off">
                <VideocamOffIcon width={32} height={32} />
                <p>Camera Off</p>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="call-local-video"
              />
            )}
          </div>
        )}

        {/* Call Controls */}
        <div className={`call-controls-bar ${!showControls && isFullscreen ? 'hidden' : ''}`}>
          {/* Mute/Unmute Microphone */}
          <button
            className={`call-control-btn mute-btn ${isMuted ? 'active' : ''}`}
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOffIcon width={24} height={24} /> : <MicIcon width={24} height={24} />}
          </button>

          {/* Camera Toggle (Video calls only) */}
          {callType === 'video' && (
            <button
              className={`call-control-btn camera-btn ${isCameraOff ? 'active' : ''}`}
              onClick={onToggleCamera}
              title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isCameraOff ? <VideocamOffIcon width={24} height={24} /> : <VideocamIcon width={24} height={24} />}
            </button>
          )}

          {/* Switch Camera (Video calls only, if multiple cameras available) */}
          {callType === 'video' && hasCameraSwitch && onSwitchCamera && !isCameraOff && (
            <button
              className="call-control-btn switch-btn"
              onClick={onSwitchCamera}
              title="Switch Camera"
            >
              <CameraswitchIcon width={24} height={24} />
            </button>
          )}

          {/* Speaker Toggle */}
          <button
            className={`call-control-btn speaker-btn ${!isSpeakerOn ? 'active' : ''}`}
            onClick={toggleSpeaker}
            title={isSpeakerOn ? 'Mute Speaker' : 'Unmute Speaker'}
          >
            {isSpeakerOn ? <VolumeUpIcon width={24} height={24} /> : <VolumeOffIcon width={24} height={24} />}
          </button>

          {/* Hold/Resume Call */}
          {onToggleHold && (
            <button
              className={`call-control-btn hold-btn ${isOnHold ? 'active' : ''}`}
              onClick={onToggleHold}
              title={isOnHold ? 'Resume Call' : 'Hold Call'}
              aria-label={isOnHold ? 'Resume Call' : 'Hold Call'}
            >
              {isOnHold ? <PlayArrowIcon width={24} height={24} /> : <PauseIcon width={24} height={24} />}
            </button>
          )}

          {/* Screen Share (Video calls only) */}
          {callType === 'video' && isScreenShareSupported && onToggleScreenShare && (
            <button
              className={`call-control-btn screen-share-btn ${isScreenSharing ? 'active sharing' : ''}`}
              onClick={onToggleScreenShare}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
              aria-label={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              {isScreenSharing ? <StopScreenShareIcon width={24} height={24} /> : <ScreenShareIcon width={24} height={24} />}
            </button>
          )}

          {/* Picture-in-Picture (Video calls only) */}
          {callType === 'video' && isPiPSupported && remoteStream && (
            <button
              className={`call-control-btn pip-btn ${isInPiP ? 'active' : ''}`}
              onClick={togglePictureInPicture}
              title={isInPiP ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}
            >
              {isInPiP ? <OpenInNewIcon width={24} height={24} /> : <PictureInPictureAltIcon width={24} height={24} />}
            </button>
          )}

          {/* Fullscreen Toggle (Video calls only) */}
          {callType === 'video' && (
            <button
              className="call-control-btn fullscreen-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <FullscreenExitIcon width={24} height={24} /> : <FullscreenIcon width={24} height={24} />}
            </button>
          )}

          {/* Minimize Call */}
          {onMinimize && (
            <button
              className="call-control-btn minimize-btn"
              onClick={onMinimize}
              title="Minimize Call"
            >
              <MinimizeIcon width={24} height={24} />
            </button>
          )}

          {/* End Call */}
          <button
            className="call-control-btn end-call-btn"
            onClick={onEndCall}
            title="End Call"
          >
            <CallEndIcon width={24} height={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveCallModal;
