/**
 * Active Call Modal - Enhanced with all video call features
 * Features: End call, Camera on/off, Switch camera, Mute/Unmute, Fullscreen
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  RotateCw
} from 'lucide-react';
import './CallModal.css';

interface ActiveCallModalProps {
  isOpen: boolean;
  personName: string;
  callType: 'audio' | 'video';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  callDuration: number; // in seconds
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onSwitchCamera?: () => void;
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
  callDuration,
  onToggleMute,
  onToggleCamera,
  onSwitchCamera,
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

  return (
    <div className="call-modal-overlay">
      <div
        ref={modalRef}
        className={`call-modal active-call-modal ${callType === 'video' ? 'video-call' : 'audio-call'} ${isFullscreen ? 'fullscreen' : ''}`}
      >
        {/* Remote Video/Audio */}
        <div className="remote-video-container">
          {callType === 'video' ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
          ) : (
            <div className="audio-call-avatar">
              <div className="avatar-circle">
                {personName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Call Info Overlay */}
          <div className={`call-info-overlay ${!showControls && isFullscreen ? 'hidden' : ''}`}>
            <h3 className="person-name">{personName}</h3>
            <p className="call-duration">{displayDuration}</p>
            {!remoteStream && <p className="connecting-text">Connecting...</p>}
          </div>
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {callType === 'video' && (
          <div className={`local-video-container ${!showControls && isFullscreen ? 'compact' : ''}`}>
            {isCameraOff ? (
              <div className="camera-off-indicator">
                <VideoOff size={32} />
                <p>Camera Off</p>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="local-video"
              />
            )}
          </div>
        )}

        {/* Call Controls */}
        <div className={`call-controls ${!showControls && isFullscreen ? 'hidden' : ''}`}>
          {/* Mute/Unmute Microphone */}
          <button
            className={`control-btn ${isMuted ? 'muted' : ''}`}
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {/* Camera Toggle (Video calls only) */}
          {callType === 'video' && (
            <button
              className={`control-btn ${isCameraOff ? 'camera-off' : ''}`}
              onClick={onToggleCamera}
              title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
          )}

          {/* Switch Camera (Video calls only, if multiple cameras available) */}
          {callType === 'video' && hasCameraSwitch && onSwitchCamera && !isCameraOff && (
            <button
              className="control-btn"
              onClick={onSwitchCamera}
              title="Switch Camera"
            >
              <RotateCw size={24} />
            </button>
          )}

          {/* Speaker Toggle */}
          <button
            className={`control-btn ${!isSpeakerOn ? 'speaker-off' : ''}`}
            onClick={toggleSpeaker}
            title={isSpeakerOn ? 'Mute Speaker' : 'Unmute Speaker'}
          >
            {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>

          {/* Fullscreen Toggle (Video calls only) */}
          {callType === 'video' && (
            <button
              className="control-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          )}

          {/* Minimize Call */}
          {onMinimize && (
            <button
              className="control-btn minimize-call-btn"
              onClick={onMinimize}
              title="Minimize Call"
            >
              <Minimize size={24} />
            </button>
          )}

          {/* End Call */}
          <button
            className="control-btn end-call-btn"
            onClick={onEndCall}
            title="End Call"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveCallModal;
