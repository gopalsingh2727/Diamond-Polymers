/**
 * PersonChat - Person-to-Person Chat Modal
 * Chat with people you're forwarding orders to/from
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send, MessageCircle, Phone, Video, History } from 'lucide-react';
import { fetchMessages, sendMessage, markAsRead, fetchUserStatus, updateActivity } from '../../../../redux/p2pChat/p2pChatActions';
import { receiveNewMessage } from '../../../../redux/p2pChat/p2pChatSlice';
import { RootState } from '../../../../redux/rootReducer';
import { requestNotificationPermission } from '../../../../../utils/notifications';
import ringtoneManager from '../../../../../utils/ringtone';
import callNotificationManager from '../../../../../utils/callNotifications';
import callHistoryTracker from '../../../../../utils/callHistoryTracker';
import IncomingCallModal from '../../../../../components/chat/IncomingCallModal';
import CallingModal from '../../../../../components/chat/CallingModal';
import ActiveCallModal from '../../../../../components/chat/ActiveCallModal';
import CallHistory from '../../../../../components/chat/CallHistory';
import WebRTCService, { CallState, CallType } from '../../../../../services/webrtc/WebRTCService';
import { getWebSocketClient } from '../../../../redux/websocket/websocketMiddleware';
import './PersonChat.css';

interface PersonChatProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  personEmail?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isMe: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

const PersonChat: React.FC<PersonChatProps> = ({
  isOpen,
  onClose,
  personId,
  personName,
  personEmail
}) => {
  const dispatch = useDispatch();

  // Redux selectors
  const reduxMessages = useSelector((state: RootState) => state.p2pChat?.messages?.[personId] || []);
  const messagesLoading = useSelector((state: RootState) => state.p2pChat?.messagesLoading || false);
  const currentUserId = useSelector((state: RootState) => state.auth?.userData?.id || state.auth?.userData?._id);

  // Get person status from Redux
  const personStatus = useSelector((state: RootState) =>
    state.p2pChat?.userStatuses?.[personId] || { isOnline: false, lastActiveAt: null }
  );

  // Local state
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket connection status from global middleware
  const wsConnected = useSelector((state: RootState) => state.websocket?.status === 'connected');

  // WebRTC Call State
  const [webrtcService] = useState(() => new WebRTCService());
  const [callState, setCallState] = useState<CallState>('idle');
  const [callType, setCallType] = useState<CallType>('audio');
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    offer: RTCSessionDescriptionInit;
    callType: CallType;
  } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Call History state
  const [showCallHistory, setShowCallHistory] = useState(false);

  // Transform Redux messages to local ChatMessage format (include status)
  const messages: ChatMessage[] = reduxMessages.map((msg: any) => {
    // Parse timestamp safely
    const timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
    const validTimestamp = isNaN(timestamp.getTime()) ? new Date() : timestamp;

    return {
      id: msg._id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      message: msg.text || '',
      timestamp: validTimestamp,
      isMe: msg.senderId !== personId,
      status: msg.status || 'sent'
    };
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when chat opens
  useEffect(() => {
    if (isOpen && personId) {
      console.log('[PersonChat] Opening chat - loading messages from API');
      // Load messages from API
      dispatch(fetchMessages(personId) as any);
      // Mark messages as read
      dispatch(markAsRead(personId) as any);
    }
  }, [isOpen, personId, dispatch]);

  // Poll user status when chat is open
  useEffect(() => {
    if (isOpen && personId) {
      // Initial fetch
      dispatch(fetchUserStatus(personId) as any);

      // Poll every 10 seconds
      const interval = setInterval(() => {
        dispatch(fetchUserStatus(personId) as any);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isOpen, personId, dispatch]);

  // Send activity heartbeat periodically
  useEffect(() => {
    if (isOpen) {
      // Send initial heartbeat
      dispatch(updateActivity() as any);

      // Send heartbeat every 30 seconds
      const interval = setInterval(() => {
        dispatch(updateActivity() as any);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isOpen, dispatch]);

  // ✅ WebSocket is managed globally - no component-level connection needed

  // loadChatHistory is now handled by Redux via fetchMessages action in useEffect

  // Request notification permission when component mounts
  useEffect(() => {
    requestNotificationPermission();
    // Also request permission for call notifications
    callNotificationManager.requestPermission();
  }, []);

  // ========== WebRTC Call Handlers ==========

  // Start a call (audio or video)
  const handleStartCall = async (type: CallType) => {
    try {
      console.log('[Call] Starting call...');

      // Get media stream (this triggers the browser's permission dialog if needed)
      console.log('[Call] Requesting media access...');
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === 'video'
        });
        console.log('[Call] Media access granted, starting call...');
      } catch (permError: any) {
        console.error('[Call] Permission denied:', permError);

        // Show helpful error based on error type
        if (permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError') {
          alert(`Camera/Microphone access denied.\n\nPlease:\n1. Click "Allow" when your browser asks for permission\n2. Or restart the app and try again\n\nIf the dialog doesn't appear, check your system settings:\n• macOS: System Preferences → Security & Privacy → Camera/Microphone\n• Windows: Settings → Privacy → Camera/Microphone`);
        } else if (permError.name === 'NotFoundError') {
          alert('No camera or microphone found.\n\nPlease connect a device and try again.');
        } else {
          alert(`Cannot access camera/microphone: ${permError.message}`);
        }
        return;
      }

      // Permissions granted, now start the call with the stream
      setCallType(type);
      setCallState('calling');

      // Track outgoing call
      callHistoryTracker.trackOutgoingCallStart(
        personId,
        personName,
        type
      );

      // Play outgoing ringtone
      ringtoneManager.playOutgoingRingtone();

      // Set up WebRTC event handlers
      webrtcService.setEventHandlers({
        onStateChange: (state) => {
          setCallState(state);
          // Stop ringtone when call connects or ends
          if (state === 'connected' || state === 'ended' || state === 'failed') {
            ringtoneManager.stop();
          }
        },
        onLocalStream: setLocalStream,
        onRemoteStream: setRemoteStream,
        onIceCandidate: (candidate) => {
          const wsClient = getWebSocketClient();
          if (wsClient) {
            wsClient.send({
              action: 'call:ice_candidate',
              data: {
                targetUserId: personId,
                candidate: candidate.toJSON()
              }
            });
          }
        },
        onError: (error) => {
          console.error('[WebRTC] Error:', error);
          alert(`Call failed: ${error.message}`);
          handleEndCall();
        }
      });

      // Start the call with the pre-fetched stream (avoids double device access)
      const offer = await webrtcService.startCall(type, mediaStream);
      if (!offer) {
        throw new Error('Failed to create call offer.');
      }

      const wsClient = getWebSocketClient();
      if (wsClient) {
        wsClient.send({
          action: 'call:offer',
          data: { receiverId: personId, offer, callType: type }
        });
      }

      console.log('[Call] Started call to:', personName);
    } catch (error: any) {
      console.error('[Call] Error starting call:', error);
      alert(error.message || 'Failed to start call.');
      setCallState('failed');
      setTimeout(() => setCallState('idle'), 2000);
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    // Close the desktop notification
    callNotificationManager.closeActiveNotification();

    // Mark call as answered
    callHistoryTracker.updateCallAnswered();

    try {
      setCallType(incomingCall.callType);
      setCallState('ringing');

      webrtcService.setEventHandlers({
        onStateChange: (state) => {
          setCallState(state);
          if (state === 'connected') startCallTimer();
        },
        onLocalStream: setLocalStream,
        onRemoteStream: setRemoteStream,
        onIceCandidate: (candidate) => {
          const wsClient = getWebSocketClient();
          if (wsClient) {
            wsClient.send({
              action: 'call:ice_candidate',
              data: { targetUserId: incomingCall.callerId, candidate: candidate.toJSON() }
            });
          }
        },
        onError: (error) => {
          console.error('[WebRTC] Error:', error);
          alert(`Call failed: ${error.message}`);
          handleEndCall();
        }
      });

      const answer = await webrtcService.answerCall(incomingCall.offer, incomingCall.callType);
      if (!answer) throw new Error('Failed to create call answer');

      const wsClient = getWebSocketClient();
      if (wsClient) {
        wsClient.send({
          action: 'call:answer',
          data: { callerId: incomingCall.callerId, answer }
        });
      }

      setIncomingCall(null);
      console.log('[Call] Accepted call from:', incomingCall.callerName);
    } catch (error) {
      console.error('[Call] Error accepting call:', error);
      alert('Failed to answer call.');
      handleRejectCall();
    }
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;

    // Close the desktop notification
    callNotificationManager.closeActiveNotification();

    // Mark call as rejected
    callHistoryTracker.markCallRejected();

    // Show missed call notification
    callNotificationManager.showMissedCallNotification(
      incomingCall.callerName,
      incomingCall.callType
    );

    const wsClient = getWebSocketClient();
    if (wsClient) {
      wsClient.send({
        action: 'call:reject',
        data: { callerId: incomingCall.callerId, reason: 'Call declined' }
      });
    }

    setIncomingCall(null);
  };

  const handleEndCall = () => {
    // Store call duration before resetting
    const duration = callDuration;

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    // Complete call history if call was connected
    if (callState === 'connected') {
      callHistoryTracker.completeCall(duration);

      // Show call ended notification
      callNotificationManager.showCallEndedNotification(
        personName,
        duration
      );
    } else if (callState === 'calling') {
      // Call was never answered, mark as failed
      callHistoryTracker.markCallFailed();
    }

    if (callState === 'calling' || callState === 'connected') {
      const wsClient = getWebSocketClient();
      if (wsClient) {
        wsClient.send({
          action: 'call:end',
          data: { targetUserId: personId }
        });
      }
    }

    // Stop any playing ringtones
    ringtoneManager.stop();

    // Close any active notifications
    callNotificationManager.closeActiveNotification();

    webrtcService.endCall();
    setCallState('idle');
    setLocalStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
  };

  const handleToggleMute = () => {
    const muted = webrtcService.toggleMicrophone();
    setIsMuted(!muted);
  };

  const handleToggleCamera = () => {
    const cameraOn = webrtcService.toggleCamera();
    setIsCameraOff(!cameraOn);
  };

  const handleSwitchCamera = async () => {
    try {
      console.log('[Call] Switching camera...');
      const success = await webrtcService.switchCamera();
      if (!success) {
        console.warn('[Call] Camera switch failed');
      }
    } catch (error) {
      console.error('[Call] Error switching camera:', error);
    }
  };

  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  // Handle incoming WebSocket call events
  // Listen to BROWSER events dispatched by WebSocket middleware
  // This works even when component mounts/unmounts!
  useEffect(() => {
    console.log('[PersonChat] Registering browser event listener for incoming calls');

    const handleCallIncoming = (event: any) => {
      const data = event.detail;
      console.log('[PersonChat] Incoming call from browser event:', data);

      setIncomingCall({
        callerId: data.callerId,
        callerName: data.callerName,
        offer: data.offer,
        callType: data.callType
      });

      // Track incoming call
      callHistoryTracker.trackIncomingCallStart(
        data.callerId,
        data.callerName,
        data.callType
      );

      // Show desktop notification
      callNotificationManager.showIncomingCallNotification(
        data.callerName,
        data.callType,
        {
          onNotificationClick: () => {
            // Focus window when notification is clicked
            window.focus();
          }
        }
      );
    };

    const handleCallAnswered = async (message: any) => {
      console.log('[PersonChat] Call answered:', message);
      const data = message.data || message;
      await webrtcService.handleAnswer(data.answer);
      setCallState('connected');
      startCallTimer();

      // Show call answered notification
      callNotificationManager.showCallAnsweredNotification(
        personName,
        callType
      );
    };

    const handleCallRejected = (message: any) => {
      console.log('[PersonChat] Call rejected:', message);
      const data = message.data || message;
      alert(`${data.rejectedByName} declined your call`);
      handleEndCall();
    };

    const handleCallEnded = (message: any) => {
      console.log('[PersonChat] Call ended:', message);
      const data = message.data || message;
      handleEndCall();
    };

    const handleIceCandidate = async (message: any) => {
      console.log('[PersonChat] ICE candidate received:', message);
      const data = message.data || message;
      await webrtcService.addIceCandidate(data.candidate);
    };

    // Listen to browser events instead of WebSocket events
    window.addEventListener('call:incoming', handleCallIncoming as EventListener);

    console.log('[PersonChat] Browser event listener registered for incoming calls');

    return () => {
      console.log('[PersonChat] Unregistering browser event listener');
      window.removeEventListener('call:incoming', handleCallIncoming as EventListener);
    };
  }, []); // No dependencies - register once on mount

  // Keep other WebSocket handlers for call lifecycle events
  useEffect(() => {
    const wsClient = getWebSocketClient();
    if (!wsClient) return;

    console.log('[PersonChat] Registering WebSocket handlers for call lifecycle');

    wsClient.on('call:answered', handleCallAnswered);
    wsClient.on('call:rejected', handleCallRejected);
    wsClient.on('call:ended', handleCallEnded);
    wsClient.on('call:ice_candidate', handleIceCandidate);

    return () => {
      wsClient.off('call:answered', handleCallAnswered);
      wsClient.off('call:rejected', handleCallRejected);
      wsClient.off('call:ended', handleCallEnded);
      wsClient.off('call:ice_candidate', handleIceCandidate);
    };
  }, [webrtcService]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callState !== 'idle') handleEndCall();
    };
  }, []);

  // ========== End WebRTC Call Handlers ==========

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      console.log('[PersonChat] Sending message via Redux action');
      console.log('[PersonChat] To personId:', personId);
      console.log('[PersonChat] Message:', messageText);

      // Use Redux action to send message (handles optimistic update)
      await dispatch(sendMessage(personId, messageText) as any);
    } catch (error) {
      console.error('[PersonChat] Error sending message:', error);
      alert('Failed to send message. Please try again.');

      // Restore the message in the input field
      setNewMessage(messageText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time like WhatsApp - adaptive based on message age
  const formatMessageTime = (timestamp: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Less than 24 hours: show time "2:30 PM"
      return timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) {
      // Less than 1 week: show day "Monday"
      return timestamp.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      // Older: show date "Jan 15"
      return timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Check if we should show a date divider between messages
  const shouldShowDateDivider = (currentMsg: ChatMessage, prevMsg?: ChatMessage): boolean => {
    if (!prevMsg) return true; // Always show divider before first message

    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();

    return currentDate !== prevDate; // Show divider if dates are different
  };

  // Format date divider text
  const formatDateDivider = (timestamp: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(timestamp).toDateString();
    const todayDate = today.toDateString();
    const yesterdayDate = yesterday.toDateString();

    if (messageDate === todayDate) {
      return 'Today';
    } else if (messageDate === yesterdayDate) {
      return 'Yesterday';
    } else {
      return timestamp.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: timestamp.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Format last seen time
  const formatLastSeen = (lastActiveAt: Date): string => {
    const now = new Date();
    const diff = now.getTime() - lastActiveAt.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return lastActiveAt.toLocaleDateString();
    }
  };

  if (!isOpen) {
    console.log('[PersonChat] Not rendering - isOpen is false');
    return null;
  }

  console.log('[PersonChat] Rendering modal now!', { isOpen, personId, personName });

  return (
    <div className="person-chat-overlay" onClick={onClose}>
      <div className="person-chat-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="person-chat-header">
          <div className="person-chat-header-info">
            <MessageCircle size={20} className="person-chat-icon" />
            <div>
              <h3>{personName}</h3>
              {personStatus.isOnline ? (
                <p className="person-email" style={{ color: '#10b981', fontWeight: 500 }}>Online</p>
              ) : personStatus.lastActiveAt ? (
                <p className="person-email">Last seen {formatLastSeen(personStatus.lastActiveAt)}</p>
              ) : (
                personEmail && <p className="person-email">{personEmail}</p>
              )}
            </div>
          </div>
          <div className="person-chat-header-actions">
            {/* Call buttons with labels */}
            <button
              className="person-chat-action-btn call-btn-audio"
              onClick={() => handleStartCall('audio')}
              title="Voice Call"
            >
              <Phone size={18} />
              <span className="btn-label">Audio</span>
            </button>
            <button
              className="person-chat-action-btn call-btn-video"
              onClick={() => handleStartCall('video')}
              title="Video Call"
            >
              <Video size={18} />
              <span className="btn-label">Video</span>
            </button>
            <button
              className="person-chat-action-btn"
              onClick={() => setShowCallHistory(true)}
              title="Call History"
            >
              <History size={18} />
            </button>

            {wsConnected && (
              <div className="ws-status connected" title="Connected - Real-time messaging active">
                <span className="ws-indicator"></span>
                <span className="ws-text">Connected</span>
              </div>
            )}
            {!wsConnected && (
              <div className="ws-status disconnected" title="Disconnected - Messages may be delayed">
                <span className="ws-indicator"></span>
                <span className="ws-text">Offline</span>
              </div>
            )}
            <button className="person-chat-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="person-chat-messages">
          {messagesLoading ? (
            <div className="person-chat-loading">
              <div className="loading-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="person-chat-empty">
              <MessageCircle size={48} />
              <p>No messages yet</p>
              <span>Start a conversation with {personName}</span>
            </div>
          ) : (
            messages.map((msg, index) => {
              const showDivider = shouldShowDateDivider(msg, messages[index - 1]);

              return (
                <div key={msg.id}>
                  {/* Date Divider */}
                  {showDivider && (
                    <div className="date-divider">
                      <span className="date-divider-text">
                        {formatDateDivider(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Message */}
                  <div className={`chat-message ${msg.isMe ? 'chat-message-me' : 'chat-message-them'}`}>
                    <div className="chat-message-content">
                      {/* Sender name for received messages */}
                      {!msg.isMe && (
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          paddingLeft: '4px'
                        }}>
                          {msg.senderName}
                        </div>
                      )}

                      {/* Message text */}
                      <div className="chat-message-text">
                        {msg.message}

                        {/* Time and read receipts */}
                        <div className="message-time-wrapper">
                          <span>
                            {!isNaN(msg.timestamp.getTime())
                              ? formatMessageTime(msg.timestamp)
                              : 'Just now'}
                          </span>
                          {msg.isMe && (() => {
                            // Determine tick marks based on status
                            let tickMarks = '';
                            let tickColor = '';

                            if (msg.status === 'read') {
                              tickMarks = '✓✓';
                              tickColor = '#f97316'; // Orange for read
                            } else if (msg.status === 'delivered') {
                              tickMarks = '✓✓';
                              tickColor = ''; // Default gray for delivered
                            } else if (msg.status === 'sent') {
                              tickMarks = '✓';
                              tickColor = ''; // Single tick for sent
                            } else if (msg.status === 'sending') {
                              tickMarks = '🕐';
                              tickColor = ''; // Clock for sending
                            } else if (msg.status === 'failed') {
                              tickMarks = '❌';
                              tickColor = '#ef4444'; // Red for failed
                            }

                            return tickMarks ? (
                              <span
                                className="message-status"
                                style={tickColor ? { color: tickColor } : {}}
                                title={msg.status || 'Sent'}
                              >
                                {tickMarks}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="person-chat-input">
          <input
            type="text"
            placeholder={`Message ${personName}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="person-chat-send"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          isOpen={!!incomingCall}
          callerName={incomingCall.callerName}
          callType={incomingCall.callType}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Calling Modal (Outgoing Call) */}
      {callState === 'calling' && (
        <CallingModal
          isOpen={true}
          personName={personName}
          callType={callType}
          onCancel={handleEndCall}
        />
      )}

      {/* Active Call Modal */}
      {(callState === 'connected' || callState === 'ringing') && (
        <ActiveCallModal
          isOpen={true}
          personName={personName}
          callType={callType}
          localStream={localStream}
          remoteStream={remoteStream}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          callDuration={callDuration}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onSwitchCamera={handleSwitchCamera}
          onEndCall={handleEndCall}
        />
      )}

      {/* Call History Modal */}
      <CallHistory
        isOpen={showCallHistory}
        onClose={() => setShowCallHistory(false)}
        onCallPerson={(callPersonId, callPersonName, callType) => {
          // Call the person from history
          setShowCallHistory(false);
          // Start call after a brief delay
          setTimeout(() => {
            handleStartCall(callType);
          }, 300);
        }}
      />
    </div>
  );
};

export default PersonChat;
