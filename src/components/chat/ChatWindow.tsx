/**
 * ChatWindow - Main chat interface with orange theme
 */

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage } from '../../componest/redux/chat/chatActions';
import { fetchMessages, sendMessage, markAsRead, fetchUserStatus, updateActivity } from '../../componest/redux/p2pChat/p2pChatActions';
import ChatMessage from './ChatMessage';
import VoiceInput from './VoiceInput';
import { requestNotificationPermission } from '../../utils/notifications';
import ringtoneManager from '../../utils/ringtone';
import callNotificationManager from '../../utils/callNotifications';
import callHistoryTracker from '../../utils/callHistoryTracker';
import { Phone, Video, History } from 'lucide-react';
import IncomingCallModal from './IncomingCallModal';
import CallingModal from './CallingModal';
import ActiveCallModal from './ActiveCallModal';
import CallHistory from './CallHistory';
import WebRTCService, { CallState, CallType } from '../../services/webrtc/WebRTCService';
import { getWebSocketClient } from '../../componest/redux/websocket/websocketMiddleware';

interface ChatWindowProps {
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  isDragging: boolean;
  assistantName: string;
  voiceGender: 'male' | 'female';
}

interface RootState {
  chat: {
    messages: any[];
    isSending: boolean;
    error: string | null;
    settings: any;
  };
  p2pChat: {
    messages: Record<string, any[]>;
    messagesLoading: boolean;
    userStatuses: Record<string, { isOnline: boolean; lastActiveAt: Date | null }>;
  };
  auth: {
    userData: {
      id: string;
      _id: string;
    };
  };
}

// Constant empty array to avoid creating new references
const EMPTY_MESSAGES: any[] = [];

// Helper function to format last seen time
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

const ChatWindow: React.FC<ChatWindowProps> = ({
  isMinimized,
  onClose,
  onMinimize,
  onMaximize,
  onDragStart,
  isDragging,
  assistantName,
  voiceGender
}) => {
  const dispatch = useDispatch();
  const { messages, isSending, error, settings } = useSelector(
    (state: RootState) => state.chat
  );

  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Connections state
  const [showConnections, setShowConnections] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [viewMode, setViewMode] = useState<'conversations' | 'contacts'>('conversations');

  // PersonChat state - integrated in same window
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPerson, setChatPerson] = useState<{
    id: string;
    name: string;
    email?: string;
  } | null>(null);

  // Get user messages from Redux
  // Use chatPerson.id directly in selector to avoid creating new arrays
  const userMessages = useSelector((state: RootState) => {
    if (!chatPerson) return EMPTY_MESSAGES;
    return state.p2pChat?.messages?.[chatPerson.id] || EMPTY_MESSAGES;
  });
  const userMessagesLoading = useSelector((state: RootState) => state.p2pChat?.messagesLoading || false);

  // Get person status from Redux
  const personStatus = useSelector((state: RootState) => {
    if (!chatPerson) return { isOnline: false, lastActiveAt: null };
    return state.p2pChat?.userStatuses?.[chatPerson.id] || { isOnline: false, lastActiveAt: null };
  });

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

  // Handle close - stop mic and speech first
  const handleClose = () => {
    // Stop speech recognition if active
    if (isListening) {
      setIsListening(false);
    }

    // Stop speech synthesis if active
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Call the parent close handler
    onClose();
  };

  // Cleanup on unmount - stop all audio
  useEffect(() => {
    return () => {
      // Stop speech synthesis on unmount
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
    // Also request permission for call notifications
    callNotificationManager.requestPermission();
  }, []);

  // Listen for openChat events from notifications
  useEffect(() => {
    const handleOpenChatEvent = (event: any) => {
      const { personId, personName } = event.detail;
      if (personId && personName) {
        handleOpenChat(personId, personName);
      }
    };

    window.addEventListener('openChat', handleOpenChatEvent);
    return () => {
      window.removeEventListener('openChat', handleOpenChatEvent);
    };
  }, []);

  // Load available voices for text-to-speech
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    // Load voices immediately
    loadVoices();

    // Also listen for voiceschanged event (needed for some browsers)
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const message = inputValue.trim();

    // Add to message history
    setMessageHistory((prev) => [...prev, message]);
    setHistoryIndex(-1);
    setInputValue('');

    const result = await dispatch(sendChatMessage(message) as any);

    // Speak response if auto-speak is enabled
    if (result?.success && result.response && settings?.autoSpeak) {
      speakText(result.response);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IMPORTANT: Stop propagation to prevent affecting menu and other components
    e.stopPropagation();

    // Enter key - send message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Send to user or assistant based on current chat
      if (chatOpen && chatPerson) {
        handleSendUserMessage();
      } else {
        handleSend();
      }
      return;
    }

    // Up arrow - navigate backwards through history (older messages)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (messageHistory.length === 0) return;

      const newIndex = historyIndex === -1 ?
      messageHistory.length - 1 :
      Math.max(0, historyIndex - 1);

      setHistoryIndex(newIndex);
      setInputValue(messageHistory[newIndex]);
      return;
    }

    // Down arrow - navigate forwards through history (newer messages)
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const newIndex = historyIndex + 1;

      if (newIndex >= messageHistory.length) {
        setHistoryIndex(-1);
        setInputValue('');
      } else {
        setHistoryIndex(newIndex);
        setInputValue(messageHistory[newIndex]);
      }
      return;
    }

    // Escape key - clear input
    if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue('');
      setHistoryIndex(-1);
      return;
    }
  };

  const handleVoiceResult = async (text: string) => {
    setIsListening(false);
    if (!text.trim()) return;

    // Show the text in input first
    setInputValue(text);

    // Auto-send voice input after a short delay
    setTimeout(async () => {
      setInputValue('');
      const result = await dispatch(sendChatMessage(text) as any);

      // Always speak the response for voice input
      if (result?.success && result.response) {
        speakText(result.response);
      }
    }, 300);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {

      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Clean text for speech (remove markdown, excessive punctuation)
    const cleanText = text.
    replace(/[#*_`]/g, '').
    replace(/\n+/g, '. ').
    replace(/•/g, '').
    trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = settings?.language || 'en-IN';
    utterance.rate = settings?.speechRate || 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Select voice based on gender preference
    if (voices.length > 0) {
      // Try to find a matching voice
      let selectedVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        if (voiceGender === 'female') {
          return name.includes('female') ||
          name.includes('swara') ||
          name.includes('veena') ||
          name.includes('samantha') ||
          name.includes('karen');
        } else {
          return name.includes('male') ||
          name.includes('ravi') ||
          name.includes('alex') ||
          name.includes('daniel');
        }
      });

      // Fallback: find any voice for the language
      if (!selectedVoice) {
        const langCode = (settings?.language || 'en-IN').split('-')[0];
        selectedVoice = voices.find((v) => v.lang.startsWith(langCode));
      }

      // Fallback: use first available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Track speaking state
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    setLoadingContacts(true);
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

      const response = await fetch(`${baseUrl}/v2/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': import.meta.env.VITE_API_KEY || ''
        }
      });

      if (response.ok) {
        const result = await response.json();

        // Deduplicate conversations by personId to prevent duplicate keys
        const conversationsMap = new Map();
        (result.data || []).forEach((conv: any) => {
          if (!conversationsMap.has(conv.personId)) {
            conversationsMap.set(conv.personId, conv);
          }
        });
        const uniqueConversations = Array.from(conversationsMap.values());

        setConversations(uniqueConversations);

        // Calculate total unread count
        const total = uniqueConversations.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0);
        setTotalUnreadCount(total);
      } else {
        // Silent failure - conversations list will be empty
        // console.error('Failed to fetch conversations:', response.statusText);
        setConversations([]);
        setTotalUnreadCount(0);
      }
    } catch (error) {
      // Silent failure - conversations list will be empty
      // console.error('Error fetching conversations:', error);
      setConversations([]);
      setTotalUnreadCount(0);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

      const response = await fetch(`${baseUrl}/v2/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': import.meta.env.VITE_API_KEY || ''
        }
      });

      if (response.ok) {
        const result = await response.json();

        // Deduplicate contacts by userId to prevent duplicate keys
        const contactsMap = new Map();
        (result.data || []).forEach((contact: any) => {
          if (!contactsMap.has(contact.userId)) {
            contactsMap.set(contact.userId, contact);
          }
        });
        const uniqueContacts = Array.from(contactsMap.values());

        setContacts(uniqueContacts);
      } else {
        // Silent failure - contacts list will be empty
        // console.error('Failed to fetch contacts:', response.statusText);
        setContacts([]);
      }
    } catch (error) {
      // Silent failure - contacts list will be empty
      // console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

      const response = await fetch(`${baseUrl}/v2/chat/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': import.meta.env.VITE_API_KEY || ''
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTotalUnreadCount(result.data?.unreadCount || 0);
      } else {
        // Silent failure - unread count will remain 0
        setTotalUnreadCount(0);
      }
    } catch (error) {
      // Silent failure - unread count will remain 0
      // console.error('Error fetching unread count:', error);
      setTotalUnreadCount(0);
    }
  };

  // Load data when connections panel opens
  useEffect(() => {
    if (showConnections) {
      if (viewMode === 'conversations') {
        fetchConversations();
      } else {
        fetchContacts();
      }
    }
  }, [showConnections, viewMode]);

  // Fetch unread count periodically when not showing connections panel
  useEffect(() => {
    if (!showConnections) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [showConnections]);

  // Poll user status when chatting with a person
  useEffect(() => {
    if (chatOpen && chatPerson) {
      // Initial fetch
      dispatch(fetchUserStatus(chatPerson.id) as any);

      // Poll every 10 seconds
      const interval = setInterval(() => {
        dispatch(fetchUserStatus(chatPerson.id) as any);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [chatOpen, chatPerson, dispatch]);

  // Send activity heartbeat periodically
  useEffect(() => {
    // Send initial heartbeat
    dispatch(updateActivity() as any);

    // Send heartbeat every 30 seconds
    const interval = setInterval(() => {
      dispatch(updateActivity() as any);
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Handle opening chat with a contact
  const handleOpenChat = (personId: string, personName: string, personEmail?: string) => {
    // console.log('[ChatWindow] Opening chat with:', { personId, personName, personEmail });
    setChatPerson({
      id: personId,
      name: personName,
      email: personEmail
    });
    setChatOpen(true);
    setShowConnections(false); // Hide connections list when opening chat

    // Load messages from API
    dispatch(fetchMessages(personId) as any);
    // Mark messages as read
    dispatch(markAsRead(personId) as any);
    // User status will be fetched automatically by useEffect
  };

  // Handle going back from user chat
  const handleBackFromUserChat = () => {
    setChatOpen(false);
    setChatPerson(null);
    setShowConnections(true); // Go back to messages list

    // Refresh conversations to update unread counts
    if (viewMode === 'conversations') {
      fetchConversations();
    } else {
      fetchUnreadCount();
    }
  };

  // ========== WebRTC Call Handlers ==========

  // Start a call (audio or video)
  const handleStartCall = async (type: CallType) => {
    if (!chatPerson) return;

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
        chatPerson.id,
        chatPerson.name,
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
        onLocalStream: (stream) => {
          setLocalStream(stream);
        },
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
        },
        onIceCandidate: (candidate) => {
          // Send ICE candidate via WebSocket
          const wsClient = getWebSocketClient();
          if (wsClient) {
            wsClient.send({
              action: 'call:ice_candidate',
              data: {
                targetUserId: chatPerson.id,
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

      // Send offer via WebSocket
      const wsClient = getWebSocketClient();
      if (wsClient) {
        wsClient.send({
          action: 'call:offer',
          data: {
            receiverId: chatPerson.id,
            offer,
            callType: type
          }
        });
      }

      console.log('[Call] Started call to:', chatPerson.name);
    } catch (error: any) {
      console.error('[Call] Error starting call:', error);
      alert(error.message || 'Failed to start call.');
      setCallState('failed');
      setTimeout(() => setCallState('idle'), 2000);
    }
  };

  // Accept incoming call
  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    // Close the desktop notification
    callNotificationManager.closeActiveNotification();

    // Mark call as answered
    callHistoryTracker.updateCallAnswered();

    try {
      setCallType(incomingCall.callType);
      setCallState('ringing');

      // Set up WebRTC event handlers
      webrtcService.setEventHandlers({
        onStateChange: (state) => {
          setCallState(state);
          if (state === 'connected') {
            // Start call timer
            startCallTimer();
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
                targetUserId: incomingCall.callerId,
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

      // Answer the call
      const answer = await webrtcService.answerCall(incomingCall.offer, incomingCall.callType);
      if (!answer) {
        throw new Error('Failed to create call answer');
      }

      // Send answer via WebSocket
      const wsClient = getWebSocketClient();
      if (wsClient) {
        wsClient.send({
          action: 'call:answer',
          data: {
            callerId: incomingCall.callerId,
            answer
          }
        });
      }

      // Clear incoming call
      setIncomingCall(null);

      console.log('[Call] Accepted call from:', incomingCall.callerName);
    } catch (error) {
      console.error('[Call] Error accepting call:', error);
      alert('Failed to answer call. Please check your camera/microphone permissions.');
      handleRejectCall();
    }
  };

  // Reject incoming call
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
        data: {
          callerId: incomingCall.callerId,
          reason: 'Call declined'
        }
      });
    }

    setIncomingCall(null);
    console.log('[Call] Rejected call from:', incomingCall.callerName);
  };

  // End active call
  const handleEndCall = () => {
    // Store call duration before resetting
    const duration = callDuration;

    // Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    // Complete call history if call was connected
    if (callState === 'connected') {
      callHistoryTracker.completeCall(duration);

      // Show call ended notification
      if (chatPerson) {
        callNotificationManager.showCallEndedNotification(
          chatPerson.name,
          duration
        );
      }
    } else if (callState === 'calling') {
      // Call was never answered, mark as failed
      callHistoryTracker.markCallFailed();
    }

    // Notify other party if call is active
    if (chatPerson && (callState === 'calling' || callState === 'connected')) {
      const wsClient = getWebSocketClient();
      if (wsClient) {
        wsClient.send({
          action: 'call:end',
          data: {
            targetUserId: chatPerson.id
          }
        });
      }
    }

    // Stop any playing ringtones
    ringtoneManager.stop();

    // Close any active notifications
    callNotificationManager.closeActiveNotification();

    // End WebRTC call
    webrtcService.endCall();

    // Reset state
    setCallState('idle');
    setLocalStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);

    console.log('[Call] Call ended');
  };

  // Toggle microphone mute
  const handleToggleMute = () => {
    const muted = webrtcService.toggleMicrophone();
    setIsMuted(!muted);
  };

  // Toggle camera on/off
  const handleToggleCamera = () => {
    const cameraOn = webrtcService.toggleCamera();
    setIsCameraOff(!cameraOn);
  };

  // Switch camera (front/back or different cameras)
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

  // Start call duration timer
  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  // Handle incoming WebSocket call events
  // IMPORTANT: Register handlers on mount, NOT dependent on chatPerson
  // Users should be able to receive calls even when not actively chatting
  useEffect(() => {
    const wsClient = getWebSocketClient();
    if (!wsClient) {
      console.log('[Call] WebSocket client not available - handlers not registered');
      return;
    }

    console.log('[Call] Registering WebSocket call event handlers');

    const handleCallIncoming = (message: any) => {
      console.log('[Call] Incoming call:', message);
      // WebSocket message structure: { type: 'call:incoming', data: { callerId, callerName, offer, callType } }
      const data = message.data || message;

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
            // Focus window and maximize chat when notification is clicked
            window.focus();
            if (onMaximize) onMaximize();
          }
        }
      );
    };

    const handleCallAnswered = async (message: any) => {
      console.log('[Call] Call answered:', message);
      const data = message.data || message;
      await webrtcService.handleAnswer(data.answer);
      setCallState('connected');
      startCallTimer();

      // Show call answered notification
      if (chatPerson) {
        callNotificationManager.showCallAnsweredNotification(
          chatPerson.name,
          callType
        );
      }
    };

    const handleCallRejected = (message: any) => {
      console.log('[Call] Call rejected:', message);
      const data = message.data || message;
      alert(`${data.rejectedByName} declined your call`);
      handleEndCall();
    };

    const handleCallEnded = (message: any) => {
      console.log('[Call] Call ended by other party:', message);
      const data = message.data || message;
      handleEndCall();
    };

    const handleIceCandidate = async (message: any) => {
      console.log('[Call] ICE candidate received:', message);
      const data = message.data || message;
      await webrtcService.addIceCandidate(data.candidate);
    };

    // Register WebSocket event listeners
    wsClient.on('call:incoming', handleCallIncoming);
    wsClient.on('call:answered', handleCallAnswered);
    wsClient.on('call:rejected', handleCallRejected);
    wsClient.on('call:ended', handleCallEnded);
    wsClient.on('call:ice_candidate', handleIceCandidate);

    console.log('[Call] WebSocket call event handlers registered successfully');

    // Cleanup
    return () => {
      console.log('[Call] Unregistering WebSocket call event handlers');
      wsClient.off('call:incoming', handleCallIncoming);
      wsClient.off('call:answered', handleCallAnswered);
      wsClient.off('call:rejected', handleCallRejected);
      wsClient.off('call:ended', handleCallEnded);
      wsClient.off('call:ice_candidate', handleIceCandidate);
    };
  }, [webrtcService]); // Only depend on webrtcService, NOT chatPerson

  // Cleanup on unmount - end any active calls
  useEffect(() => {
    return () => {
      if (callState !== 'idle') {
        handleEndCall();
      }
    };
  }, []);

  // ========== End WebRTC Call Handlers ==========

  // Handle sending message to user
  const handleSendUserMessage = async () => {
    if (!inputValue.trim() || !chatPerson || isSending) return;

    const message = inputValue.trim();
    setInputValue('');

    try {
      await dispatch(sendMessage(chatPerson.id, message) as any);
    } catch (error) {
      // Silent failure - message sending failed, restore input
      // console.error('[ChatWindow] Error sending user message:', error);
      // Restore the message in the input field on error
      setInputValue(message);
    }
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div
        onClick={onMaximize}
        className="w-64 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg
                   shadow-lg cursor-pointer hover:shadow-xl transition-all p-3
                   flex items-center gap-3">



        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l.917-3.917A6.976 6.976 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
          </svg>
        </div>
        <span className="text-white font-medium">{assistantName}</span>
      </div>);

  }

  return (
    <div className="w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header - Draggable */}
      <div
        onMouseDown={onDragStart}
        className={`flex items-center justify-between px-4 py-3 cursor-grab
                   ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)'
        }}>

        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l.917-3.917A6.976 6.976 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
            </svg>
            {chatOpen && chatPerson && personStatus.isOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold truncate">
              {chatOpen && chatPerson ? chatPerson.name : assistantName}
            </h3>
            <span className="text-white/70 text-xs">
              {chatOpen && chatPerson ? (
                personStatus.isOnline ? (
                  'Online'
                ) : personStatus.lastActiveAt ? (
                  `Last seen ${formatLastSeen(personStatus.lastActiveAt)}`
                ) : (
                  'Offline'
                )
              ) : (
                isSending ? 'Typing...' : 'Online'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-20">
          {/* Call buttons - Show only when in user chat */}
          {(chatOpen && chatPerson) && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleStartCall('audio');
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30
                           flex items-center justify-center transition-colors cursor-pointer"
                title="Voice Call">
                <Phone size={16} className="text-white" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleStartCall('video');
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30
                           flex items-center justify-center transition-colors cursor-pointer"
                title="Video Call">
                <Video size={16} className="text-white" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowCallHistory(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30
                           flex items-center justify-center transition-colors cursor-pointer"
                title="Call History">
                <History size={16} className="text-white" />
              </button>
            </>
          )}

          {/* Back button - Show when in user chat or showing connections list */}
          {(chatOpen && chatPerson) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleBackFromUserChat();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30
                         flex items-center justify-center transition-colors cursor-pointer"
              title="Back to Messages">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          )}

          {/* Back button when showing connections (back to assistant chat) */}
          {showConnections && !chatOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowConnections(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30
                         flex items-center justify-center transition-colors cursor-pointer"
              title="Back to Assistant">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          )}

          {/* Connections button with unread badge (hide when in user chat) */}
          {!chatOpen && (
            <button
              type="button"
              onClick={(e) => {e.stopPropagation();e.preventDefault();setShowConnections(!showConnections);}}
              onMouseDown={(e) => e.stopPropagation()}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer relative ${
                showConnections ? 'bg-white/30' : 'bg-white/20 hover:bg-white/30'
              }`}
              title={`Messages${totalUnreadCount > 0 ? ` (${totalUnreadCount} unread)` : ''}`}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l.917-3.917A6.976 6.976 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
              </svg>
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </span>
              )}
            </button>
          )}

          {/* Minimize button */}
          <button
            type="button"
            onClick={(e) => {e.stopPropagation();e.preventDefault();onMinimize();}}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30
                       flex items-center justify-center transition-colors cursor-pointer"
            title="Minimize">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {e.stopPropagation();e.preventDefault();handleClose();}}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-red-500
                       flex items-center justify-center transition-colors cursor-pointer"
            title="Close">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatOpen && chatPerson ? (
          /* User Chat Messages */
          <div className="h-full flex flex-col">
            {userMessagesLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
                <p className="text-gray-500 mt-4 text-sm">Loading messages...</p>
              </div>
            ) : userMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-4xl mb-3">💬</div>
                <p className="font-medium text-lg text-gray-700">No messages yet</p>
                <p className="text-sm mt-2 text-gray-500">Start a conversation with {chatPerson.name}</p>
              </div>
            ) : (
              <>
                {userMessages.map((msg: any) => {
                  const isMe = msg.senderId !== chatPerson.id;
                  const timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();

                  // Determine tick marks based on status
                  let tickMarks = '';
                  if (isMe) {
                    if (msg.status === 'read') {
                      tickMarks = '✓✓'; // Blue double tick (read)
                    } else if (msg.status === 'delivered') {
                      tickMarks = '✓✓'; // Gray double tick (delivered)
                    } else if (msg.status === 'sent') {
                      tickMarks = '✓'; // Single tick (sent)
                    } else if (msg.status === 'sending') {
                      tickMarks = '🕐'; // Clock icon (sending)
                    } else if (msg.status === 'failed') {
                      tickMarks = '❌'; // Failed
                    }
                  }

                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isMe ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-2 shadow-sm`}>
                        {!isMe && (
                          <div className="text-xs text-gray-500 mb-1">{msg.senderName}</div>
                        )}
                        <div className="break-words">{msg.text}</div>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                          <span>{timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && tickMarks && (
                            <span className={msg.status === 'read' ? 'text-orange-300' : ''}>{tickMarks}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        ) : showConnections ? (
          /* Connections List */
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex-1">Messages</h3>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button
                onClick={() => setViewMode('conversations')}
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                  viewMode === 'conversations'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Chats
                {totalUnreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {totalUnreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode('contacts')}
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                  viewMode === 'contacts'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Contacts
              </button>
            </div>

            {loadingContacts ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
                <p className="text-gray-500 mt-4 text-sm">Loading...</p>
              </div>
            ) : viewMode === 'conversations' ? (
              /* Conversations View */
              conversations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">No conversations yet</h3>
                  <p className="text-gray-500 text-sm mb-6">Start chatting with your team members</p>
                  <button
                    onClick={() => setViewMode('contacts')}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                  >
                    Browse Contacts
                  </button>
                </div>
              ) : (
                <div className="space-y-1 pb-2 flex-1 overflow-y-auto">
                  {/* Assistant Conversation - Always First */}
                  <div
                    key="assistant-conversation"
                    onClick={() => {
                      setShowConnections(false);
                      setChatOpen(false);
                      setChatPerson(null);
                    }}
                    className="bg-white rounded-lg p-3 hover:bg-orange-50 transition-all cursor-pointer border border-transparent hover:border-orange-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          🤖
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <div className="font-semibold text-sm truncate text-gray-900">
                            {assistantName}
                          </div>
                          <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {messages.length > 0 && new Date(messages[messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-xs truncate text-gray-500">
                          {messages.length > 0 ? (
                            <>
                              {messages[messages.length - 1].role === 'user' && <span className="text-gray-400">You: </span>}
                              {messages[messages.length - 1].content.substring(0, 40)}...
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Start chatting with your AI assistant</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Conversations */}
                  {conversations.map((conv) => (
                    <div
                      key={conv.personId}
                      onClick={() => handleOpenChat(conv.personId, conv.personName, conv.personEmail)}
                      className="bg-white rounded-lg p-3 hover:bg-orange-50 transition-all cursor-pointer border border-transparent hover:border-orange-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {conv.personName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          {conv.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                          )}
                          {conv.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between mb-1">
                            <div className={`font-semibold text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                              {conv.personName}
                            </div>
                            <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                              {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-600 font-medium' : 'text-gray-500'}`}>
                            {conv.lastMessage.isMe && <span className="text-gray-400">You: </span>}
                            {conv.lastMessage.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Contacts View */
              contacts.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">No connections yet</h3>
                  <p className="text-gray-500 text-sm mb-6">Connect with team members to start chatting</p>
                  <button
                    onClick={() => setShowConnections(false)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                  >
                    Go to Order Forward
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pb-2 flex-1 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className="group bg-white rounded-xl p-3 hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-orange-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {contact.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate text-sm">{contact.userName}</div>
                          <div className="text-xs text-gray-500 truncate">{contact.userEmail}</div>
                          <div className="inline-block mt-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-medium">
                            {contact.userRole}
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenChat(contact.userId, contact.userName, contact.userEmail)}
                          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm font-semibold group-hover:animate-pulse"
                          title="Start Chat"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        ) : (
          /* AI Assistant Messages */
          <>
            {messages.length === 0 ?
            <div className="text-center text-gray-500 mt-8">
                <div className="text-4xl mb-3">👋</div>
                <p className="font-medium text-lg text-gray-700">Hi there! I'm {assistantName}</p>
                <p className="text-sm mt-2 text-gray-500">Your friendly manufacturing assistant</p>
                <div className="mt-6 bg-orange-50 rounded-lg p-4 mx-2">
                  <p className="text-sm font-medium text-orange-700 mb-3">What can I help you with?</p>
                  <div className="text-xs text-gray-600 space-y-2 text-left">
                    <p>💬 Just say <span className="text-orange-500 font-medium">"Hi"</span> to start chatting</p>
                    <p>📦 Type an <span className="text-orange-500 font-medium">Order ID</span> for order details</p>
                    <p>🏭 Type a <span className="text-orange-500 font-medium">Machine name</span> for status</p>
                    <p>👤 Type an <span className="text-orange-500 font-medium">Operator name</span> for activity</p>
                    <p>📊 Say <span className="text-orange-500 font-medium">"report"</span> for daily summary</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">Type <span className="font-mono bg-gray-100 px-1 rounded">/help</span> for all commands</p>
              </div> :

            messages.map((msg, index) =>
            <ChatMessage
              key={index}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              assistantName={assistantName} />

            )
            }
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error display */}
      {error &&
      <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      }

      {/* Input Area - Show when chatting (assistant or user), hide when showing connections list */}
      {!showConnections && (
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          {/* Stop speaker button - shows when speaking */}
          {isSpeaking &&
          <button
            onClick={stopSpeaking}
            className="w-10 h-10 rounded-full flex items-center justify-center
                         bg-red-500 hover:bg-red-600 transition-all animate-pulse"

            title="Stop speaking"
            type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          }

          {/* Voice input button */}
          <VoiceInput
            isListening={isListening}
            onStart={() => setIsListening(true)}
            onStop={() => setIsListening(false)}
            onResult={handleVoiceResult} />


          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening ? 'Listening...' :
              chatOpen && chatPerson ? `Message ${chatPerson.name}...` :
              'Type a message...'
            }
            disabled={isSending || isListening}
            className="flex-1 px-4 py-2 rounded-full border border-gray-200
                       focus:outline-none focus:border-orange-400 focus:ring-2
                       focus:ring-orange-100 text-sm disabled:bg-gray-50" />




          {/* Send button */}
          <button
            onClick={chatOpen && chatPerson ? handleSendUserMessage : handleSend}
            disabled={!inputValue.trim() || isSending}
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: inputValue.trim() && !isSending ?
              'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)' :
              '#e5e7eb'
            }}>

            {isSending ?
            <svg className="animate-spin w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg> :
            <svg className={`w-5 h-5 ${inputValue.trim() && !isSending ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            }
          </button>
        </div>
      </div>
      )}

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
      {callState === 'calling' && chatPerson && (
        <CallingModal
          isOpen={true}
          personName={chatPerson.name}
          callType={callType}
          onCancel={handleEndCall}
        />
      )}

      {/* Active Call Modal */}
      {(callState === 'connected' || callState === 'ringing') && chatPerson && (
        <ActiveCallModal
          isOpen={true}
          personName={chatPerson.name}
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
        onCallPerson={(personId, personName, callType) => {
          // Find the person in contacts or conversations
          handleOpenChat(personId, personName);
          setShowCallHistory(false);
          // Start call after a brief delay to let chat open
          setTimeout(() => {
            handleStartCall(callType);
          }, 300);
        }}
      />
    </div>
  );
};

export default ChatWindow;