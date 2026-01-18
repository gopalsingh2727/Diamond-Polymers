/**
 * MinimizedCallWidget - Floating widget for minimized calls
 * Shows call status, duration, and quick actions
 * Draggable and can be expanded back to full modal
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Maximize2,
  Pause,
  Play
} from 'lucide-react';
import './CallModal.css';

interface MinimizedCallWidgetProps {
  personName: string;
  callType: 'audio' | 'video';
  callDuration: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isOnHold: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onExpand: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera?: () => void;
  onToggleHold?: () => void;
}

const MinimizedCallWidget: React.FC<MinimizedCallWidgetProps> = ({
  personName,
  callType,
  callDuration,
  isMuted,
  isCameraOff,
  isOnHold,
  localStream,
  remoteStream,
  onExpand,
  onEndCall,
  onToggleMute,
  onToggleCamera,
  onToggleHold
}) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get initials
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Set video stream
  useEffect(() => {
    if (videoRef.current && remoteStream && callType === 'video') {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callType]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep widget within viewport
      const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 200);
      const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 120);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={widgetRef}
      className={`minimized-call-widget ${callType} ${isOnHold ? 'on-hold' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {/* Drag Handle */}
      <div className="widget-drag-handle" onMouseDown={handleMouseDown}>
        <div className="drag-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Video/Avatar Preview */}
      <div className="widget-preview" onClick={onExpand}>
        {callType === 'video' && remoteStream && !isOnHold ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="widget-video"
          />
        ) : (
          <div className="widget-avatar">
            <span>{getInitials(personName)}</span>
          </div>
        )}

        {/* On Hold Overlay */}
        {isOnHold && (
          <div className="widget-hold-overlay">
            <Pause size={20} />
          </div>
        )}

        {/* Expand button overlay */}
        <div className="widget-expand-overlay">
          <Maximize2 size={16} />
        </div>
      </div>

      {/* Call Info */}
      <div className="widget-info">
        <div className="widget-name">{personName}</div>
        <div className="widget-status">
          {callType === 'video' ? <Video size={12} /> : <Phone size={12} />}
          <span className={`widget-timer ${isOnHold ? 'paused' : ''}`}>
            {formatDuration(callDuration)}
          </span>
          {isOnHold && <span className="widget-hold-badge">Hold</span>}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="widget-actions">
        {/* Mute Toggle */}
        <button
          className={`widget-btn ${isMuted ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Camera Toggle (Video only) */}
        {callType === 'video' && onToggleCamera && (
          <button
            className={`widget-btn ${isCameraOff ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleCamera(); }}
            title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
          </button>
        )}

        {/* Hold Toggle */}
        {onToggleHold && (
          <button
            className={`widget-btn hold ${isOnHold ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleHold(); }}
            title={isOnHold ? 'Resume' : 'Hold'}
          >
            {isOnHold ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}

        {/* End Call */}
        <button
          className="widget-btn end-call"
          onClick={(e) => { e.stopPropagation(); onEndCall(); }}
          title="End Call"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
};

export default MinimizedCallWidget;
