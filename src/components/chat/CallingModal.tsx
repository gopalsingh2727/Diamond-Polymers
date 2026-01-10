/**
 * Calling Modal - Enhanced UI/UX for Outgoing Calls
 * Displays when making a call (waiting for other person to answer)
 * Plays outgoing ringtone automatically with visual feedback
 */

import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video, Volume2 } from 'lucide-react';
import ringtoneManager from '../../utils/ringtone';
import './CallModal.css';

interface CallingModalProps {
  isOpen: boolean;
  personName: string;
  callType: 'audio' | 'video';
  onCancel: () => void;
}

const CallingModal: React.FC<CallingModalProps> = ({
  isOpen,
  personName,
  callType,
  onCancel
}) => {
  const [isCalling, setIsCalling] = useState(false);

  // Play outgoing ringtone when modal opens, stop when it closes
  useEffect(() => {
    if (isOpen) {
      console.log('[Calling] Playing outgoing ringtone');
      setIsCalling(true);
      ringtoneManager.playOutgoingRingtone();
    } else {
      console.log('[Calling] Stopping outgoing ringtone');
      setIsCalling(false);
      ringtoneManager.stop();
    }

    // Cleanup: stop ringtone when component unmounts
    return () => {
      setIsCalling(false);
      ringtoneManager.stop();
    };
  }, [isOpen]);

  // Cancel call and stop ringtone
  const handleCancel = () => {
    setIsCalling(false);
    ringtoneManager.stop();
    onCancel();
  };

  if (!isOpen) return null;

  // Get person initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="call-modal-overlay">
      <div className="call-modal calling-modal enhanced">
        {/* Sound Indicator */}
        {isCalling && (
          <div className="sound-indicator outgoing">
            <Volume2 size={16} className="sound-icon" />
            <span className="sound-text">Calling...</span>
          </div>
        )}

        {/* Person Avatar */}
        <div className="caller-avatar-container">
          <div className={`caller-avatar ${callType === 'video' ? 'video' : 'audio'}`}>
            <span className="avatar-initials">{getInitials(personName)}</span>
          </div>

          {/* Calling Pulse Animation (different from ringing) */}
          <div className="calling-pulses">
            <div className="calling-wave"></div>
            <div className="calling-wave"></div>
            <div className="calling-wave"></div>
          </div>
        </div>

        {/* Person Info */}
        <div className="call-modal-header">
          <h2 className="caller-name">{personName}</h2>
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
          <p className="call-status-calling">
            <span className="calling-dots">Calling</span>
            <span className="dots-animation">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
        </div>

        {/* Cancel Button */}
        <div className="call-actions enhanced">
          <button className="call-btn-enhanced cancel-btn" onClick={handleCancel} title="Cancel call">
            <div className="btn-circle cancel">
              <PhoneOff size={28} />
            </div>
            <span className="btn-label">Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallingModal;
