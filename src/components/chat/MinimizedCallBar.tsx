/**
 * MinimizedCallBar - Compact call bar when call is minimized
 * Shows caller name, duration, and quick controls
 */

import React from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, Maximize2, PhoneOff } from 'lucide-react';
import './MinimizedCallBar.css';

interface MinimizedCallBarProps {
  personName: string;
  callType: 'audio' | 'video';
  callDuration: number;
  isMuted: boolean;
  isCameraOff: boolean;
  onMaximize: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

const MinimizedCallBar: React.FC<MinimizedCallBarProps> = ({
  personName,
  callType,
  callDuration,
  isMuted,
  isCameraOff,
  onMaximize,
  onToggleMute,
  onToggleCamera,
  onEndCall
}) => {
  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="minimized-call-bar">
      {/* Left: Person info */}
      <div className="minimized-call-info" onClick={onMaximize}>
        <div className="minimized-avatar">
          <span className="minimized-avatar-text">{getInitials(personName)}</span>
          <span className="call-active-indicator"></span>
        </div>
        <div className="minimized-details">
          <div className="minimized-name">{personName}</div>
          <div className="minimized-status">
            {callType === 'video' ? <Video size={12} /> : <Phone size={12} />}
            <span>{formatDuration(callDuration)}</span>
          </div>
        </div>
      </div>

      {/* Right: Quick controls */}
      <div className="minimized-controls">
        {/* Mute toggle */}
        <button
          className={`minimized-btn ${isMuted ? 'active' : ''}`}
          onClick={onToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Camera toggle (video calls only) */}
        {callType === 'video' && (
          <button
            className={`minimized-btn ${isCameraOff ? 'active' : ''}`}
            onClick={onToggleCamera}
            title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
          </button>
        )}

        {/* Maximize */}
        <button
          className="minimized-btn maximize-btn"
          onClick={onMaximize}
          title="Maximize"
        >
          <Maximize2 size={16} />
        </button>

        {/* End call */}
        <button
          className="minimized-btn end-btn"
          onClick={onEndCall}
          title="End call"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
};

export default MinimizedCallBar;
