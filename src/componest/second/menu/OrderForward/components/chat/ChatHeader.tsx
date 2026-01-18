/**
 * ChatHeader Component
 * Displays person info, status, and action buttons
 */

import React from 'react';
import { CloseIcon, CallIcon, VideocamIcon, SearchIcon } from './icons';
import type { ChatHeaderProps, CallType } from '../../types/chat';

export function ChatHeader({
  personName,
  personEmail,
  personStatus,
  onClose,
  onStartCall,
  onToggleSearch,
  wsConnected,
  embedded = false
}: ChatHeaderProps) {
  const handleCallClick = () => {
    onStartCall('audio');
  };

  const handleVideoClick = () => {
    onStartCall('video');
  };

  // Format last seen time
  const formatLastSeen = (lastActiveAt: Date | string | null): string => {
    if (!lastActiveAt) return 'offline';

    try {
      const date = typeof lastActiveAt === 'string' ? new Date(lastActiveAt) : lastActiveAt;
      if (isNaN(date.getTime())) return 'offline';

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Active now';
      if (diffMins < 60) return `Active ${diffMins}m ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Active ${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      return `Active ${diffDays}d ago`;
    } catch (error) {
      return 'offline';
    }
  };

  return (
    <div className="person-chat-header">
      <div className="person-chat-header-info">
        {/* Person Info */}
        <div className="person-info">
          <h3 className="person-name">{personName}</h3>
          {personEmail && (
            <p className="person-email">{personEmail}</p>
          )}
        </div>

        {/* Online Status */}
        <div className={`online-status ${personStatus.online ? 'online' : 'offline'}`}>
          {personStatus.online ? (
            <>
              <span className="status-dot"></span>
              <span className="status-text">Online</span>
            </>
          ) : (
            <span className="status-text">
              {formatLastSeen(personStatus.lastActiveAt)}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="person-chat-header-actions">
        {/* WebSocket Status Indicator */}
        {!wsConnected && (
          <div
            className="ws-status offline"
            title="Disconnected - messages may not send"
          >
            <span className="ws-dot"></span>
          </div>
        )}

        {/* Search Button */}
        <button
          className="header-action-btn"
          onClick={onToggleSearch}
          title="Search messages"
          aria-label="Search messages"
        >
          <SearchIcon width={24} height={24} />
        </button>

        {/* Audio Call Button */}
        <button
          className="header-action-btn"
          onClick={handleCallClick}
          title="Start audio call"
          aria-label={`Call ${personName}`}
        >
          <CallIcon width={24} height={24} />
        </button>

        {/* Video Call Button */}
        <button
          className="header-action-btn"
          onClick={handleVideoClick}
          title="Start video call"
          aria-label={`Video call ${personName}`}
        >
          <VideocamIcon width={24} height={24} />
        </button>

        {/* Close Button (only in modal mode) */}
        {!embedded && (
          <button
            className="header-action-btn person-chat-close"
            onClick={onClose}
            title="Close chat"
            aria-label="Close chat"
          >
            <CloseIcon width={24} height={24} />
          </button>
        )}
      </div>
    </div>
  );
}
