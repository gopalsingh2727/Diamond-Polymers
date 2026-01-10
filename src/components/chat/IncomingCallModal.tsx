/**
 * Incoming Call Modal - Enhanced UI/UX
 * Displays when receiving a voice or video call
 * Plays ringtone automatically with visual feedback
 */

import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video, Volume2 } from 'lucide-react';
import ringtoneManager from '../../utils/ringtone';
import './CallModal.css';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  callerName,
  callType,
  onAccept,
  onReject
}) => {
  const [isRinging, setIsRinging] = useState(false);

  // Play ringtone when modal opens, stop when it closes
  useEffect(() => {
    if (isOpen) {
      console.log('[IncomingCall] Playing ringtone');
      setIsRinging(true);
      ringtoneManager.playIncomingRingtone();
    } else {
      console.log('[IncomingCall] Stopping ringtone');
      setIsRinging(false);
      ringtoneManager.stop();
    }

    // Cleanup: stop ringtone when component unmounts
    return () => {
      setIsRinging(false);
      ringtoneManager.stop();
    };
  }, [isOpen]);

  // Stop ringtone and execute callback
  const handleAccept = () => {
    setIsRinging(false);
    ringtoneManager.stop();
    onAccept();
  };

  const handleReject = () => {
    setIsRinging(false);
    ringtoneManager.stop();
    ringtoneManager.playNotificationSound(); // Quick beep when rejecting
    onReject();
  };

  if (!isOpen) return null;

  // Get caller initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="call-modal-overlay">
      <div className="call-modal incoming-call-modal enhanced">
        {/* Sound Indicator */}
        {isRinging && (
          <div className="sound-indicator">
            <Volume2 size={16} className="sound-icon" />
            <span className="sound-text">Ringing...</span>
          </div>
        )}

        {/* Caller Avatar */}
        <div className="caller-avatar-container">
          <div className={`caller-avatar ${callType === 'video' ? 'video' : 'audio'}`}>
            <span className="avatar-initials">{getInitials(callerName)}</span>
          </div>

          {/* Ringing Pulse Animation */}
          <div className="ringing-pulses">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
        </div>

        {/* Caller Info */}
        <div className="call-modal-header">
          <h2 className="caller-name">{callerName}</h2>
          <div className="call-type-badge">
            {callType === 'video' ? (
              <>
                <Video size={16} />
                <span>Video Call</span>
              </>
            ) : (
              <>
                <Phone size={16} />
                <span>Voice Call</span>
              </>
            )}
          </div>
          <p className="call-status-incoming">
            {callType === 'video' ? 'Incoming video call...' : 'Incoming voice call...'}
          </p>
        </div>

        {/* Action Buttons - Enhanced */}
        <div className="call-actions enhanced">
          <button className="call-btn-enhanced reject-btn" onClick={handleReject} title="Decline call">
            <div className="btn-circle reject">
              <PhoneOff size={28} />
            </div>
            <span className="btn-label">Decline</span>
          </button>

          <button className="call-btn-enhanced accept-btn" onClick={handleAccept} title="Accept call">
            <div className="btn-circle accept">
              <Phone size={28} />
            </div>
            <span className="btn-label">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
