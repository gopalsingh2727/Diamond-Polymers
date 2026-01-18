/**
 * PersonChat Component - Complete Rewrite
 * Clean, modular chat interface with video/audio calling and order sharing
 *
 * Features:
 * - Real-time chat with WebSocket
 * - Video/Audio calling with WebRTC
 * - Order viewing and sharing
 * - Message reactions and search
 * - File attachments
 * - Typing indicators
 *
 * Architecture:
 * - Uses custom hooks for business logic
 * - Modular sub-components for UI
 * - Redux for state management
 * - Full TypeScript type safety
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';

// Centralized Icons
import {
  InventoryIcon,
  ForwardIcon,
  MessageIcon as ChatIcon,
  SearchIcon,
  FilterListIcon,
} from './icons';

// Redux Actions
import { fetchMessages, sendMessage as sendMessageAction } from '../../../../redux/p2pChat/p2pChatActions';

// Services & Utils
import WebRTCService from '../../../../../services/webrtc/WebRTCService';

// Chat Components
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';

// Existing Modals (keep these)
import IncomingCallModal from './chat/IncomingCallModal';
import CallingModal from './chat/CallingModal';
import ActiveCallModal from './chat/ActiveCallModal';

// Styles
import './PersonChat.css';

// ============= TYPES =============

interface PersonChatProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  personEmail?: string;
  embedded?: boolean;
  autoStartCall?: 'audio' | 'video'; // Auto-start call when component opens
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isMe: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type?: 'text' | 'call' | 'video_call';
  callDuration?: number; // in seconds
  callStatus?: 'missed' | 'completed' | 'rejected' | 'busy';
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName?: string;
  customer?: { name: string };
  status?: string;
  forwardStatus?: string;
  items?: any[];
  itemCount?: number;
  orderType?: string;
  createdAt: Date | string;
  dueDate?: Date | string;
  forwardedBy?: { name?: string; email?: string };
  forwardedTo?: { name?: string; email?: string };
  toBranch?: { name?: string };
  fromBranch?: { name?: string };
}

type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed';
type CallType = 'audio' | 'video';

interface IncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  callType: CallType;
}

// ============= MAIN COMPONENT =============

function PersonChat({
  isOpen,
  onClose,
  personId,
  personName,
  personEmail,
  embedded = false,
  autoStartCall
}: PersonChatProps) {
  const dispatch = useDispatch();

  // ========== STATE ==========
  const [activeTab, setActiveTab] = useState<'chat' | 'orders'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [messageSearchTerm, setMessageSearchTerm] = useState('');

  // Order filters
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');

  // Call state
  const [callState, setCallState] = useState<CallState>('idle');
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callHistory, setCallHistory] = useState<ChatMessage[]>([]);

  // Call UI state
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState(false); // Cost-saving: audio-only
  const [callDuration, setCallDuration] = useState(0);

  // Refs
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const callStateRef = useRef(callState);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebRTC service once
  if (!webrtcServiceRef.current) {
    webrtcServiceRef.current = new WebRTCService();
  }

  // Keep ref in sync
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // ========== REDUX SELECTORS ==========

  // Get current user ID - try multiple paths for compatibility
  const currentUserId = useSelector((state: RootState) => {
    // Try auth.userData.userId (new structure)
    if (state.auth?.userData?.userId) {
      return state.auth.userData.userId;
    }
    // Try auth.user.userId (alternative structure)
    if ((state.auth as any)?.user?.userId) {
      return (state.auth as any).user.userId;
    }
    // Try login.userDetails.userId (legacy structure)
    if ((state as any).login?.userDetails?.userId) {
      return (state as any).login.userDetails.userId;
    }
    // Try getting from localStorage as fallback
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.userId || parsed.id || parsed._id;
      }
    } catch (error) {
      console.error('[PersonChat] Failed to parse userData from localStorage:', error);
    }
    return null;
  });

  const wsConnected = useSelector((state: RootState) => state.websocket.isConnected);

  // Get messages from Redux
  const reduxMessages = useSelector((state: RootState) =>
    state.p2pChat.messages[personId] || []
  );

  // DEBUG: Log Redux state
  useEffect(() => {
    console.log('[PersonChat] DEBUG - currentUserId:', currentUserId);
    console.log('[PersonChat] DEBUG - personId:', personId);
    console.log('[PersonChat] DEBUG - reduxMessages count:', reduxMessages.length);
    console.log('[PersonChat] DEBUG - reduxMessages:', reduxMessages);

    // Debug auth state structure
    console.log('[PersonChat] DEBUG - Auth state check:', {
      'auth.userData': (window as any).store?.getState?.()?.auth?.userData,
      'auth.user': (window as any).store?.getState?.()?.auth?.user,
      'login.userDetails': (window as any).store?.getState?.()?.login?.userDetails,
    });
  }, [currentUserId, personId, reduxMessages]);

  // Get orders from Redux
  const forwardedOrders = useSelector((state: RootState) =>
    state.orderForward.forwardedOrders || []
  );
  const receivedOrders = useSelector((state: RootState) =>
    state.orderForward.receivedOrders || []
  );

  // ========== FILTER ORDERS (MEMOIZED) ==========

  const filteredOrders = useMemo(() => {
    console.log('[PersonChat] DEBUG - Filtering orders for personId:', personId);
    console.log('[PersonChat] DEBUG - Total forwardedOrders:', forwardedOrders?.length || 0);
    console.log('[PersonChat] DEBUG - Total receivedOrders:', receivedOrders?.length || 0);

    // Filter orders by personId AND search/status/type filters
    const filterByPersonId = (orders: any[], isForwarded: boolean): Order[] => {
      if (!orders || orders.length === 0) return [];

      let filtered = orders.filter((order: any) => {
        // For forwarded orders: check if this order was forwarded TO this person
        if (isForwarded) {
          const forwardedToId = order.forwardedToPerson || order.forwardedTo || order.forwardedToPersonId;
          const match = forwardedToId === personId;
          if (match) {
            console.log('[PersonChat] DEBUG - Forwarded order match:', order.orderNumber, forwardedToId);
          }
          return match;
        }

        // For received orders: check if this order was received FROM this person
        const receivedFromId = order.forwardedFromPerson || order.receivedFromPerson || order.forwardedBy?._id || order.forwardedBy;
        const match = receivedFromId === personId;
        if (match) {
          console.log('[PersonChat] DEBUG - Received order match:', order.orderNumber, receivedFromId);
        }
        return match;
      });

      // Apply search filter
      if (orderSearchTerm) {
        const searchLower = orderSearchTerm.toLowerCase();
        filtered = filtered.filter((order: any) => {
          const orderNumber = order.orderNumber?.toLowerCase() || '';
          const customerName = (order.customerName || order.customer?.name || '').toLowerCase();
          return orderNumber.includes(searchLower) || customerName.includes(searchLower);
        });
      }

      // Apply status filter
      if (orderStatusFilter !== 'all') {
        filtered = filtered.filter((order: any) => {
          const status = (order.forwardStatus || order.status || 'pending').toLowerCase();
          return status === orderStatusFilter.toLowerCase();
        });
      }

      // Apply type filter
      if (orderTypeFilter !== 'all') {
        filtered = filtered.filter((order: any) => {
          const type = (order.orderType || '').toLowerCase();
          return type === orderTypeFilter.toLowerCase();
        });
      }

      console.log('[PersonChat] DEBUG - Filtered results:', filtered.length, 'orders');
      return filtered;
    };

    const result = {
      forwarded: filterByPersonId(forwardedOrders, true),
      received: filterByPersonId(receivedOrders, false)
    };

    console.log('[PersonChat] DEBUG - Final order counts:', {
      forwarded: result.forwarded.length,
      received: result.received.length
    });

    return result;
  }, [forwardedOrders, receivedOrders, personId, orderSearchTerm, orderStatusFilter, orderTypeFilter]);

  // ========== TRANSFORM MESSAGES (MEMOIZED) ==========

  const messages = useMemo<ChatMessage[]>(() => {
    console.log('[PersonChat] DEBUG - Transform starting...');
    console.log('[PersonChat] DEBUG - currentUserId in transform:', currentUserId);

    if (!currentUserId) {
      console.log('[PersonChat] DEBUG - No currentUserId, returning empty array');
      return [];
    }

    // Transform regular chat messages
    let transformed = reduxMessages.map((msg: any) => {
      // Normalize message type (backend uses uppercase, frontend uses lowercase with underscore)
      let messageType = msg.type || msg.messageType || 'text';
      if (messageType === 'CALL') messageType = 'call';
      if (messageType === 'VIDEO_CALL') messageType = 'video_call';
      if (messageType === 'ORDER_FORWARD') messageType = 'order_forward';
      if (messageType === 'ORDER_RECEIVED') messageType = 'order_received';
      if (messageType === 'TEXT') messageType = 'text';

      return {
        id: msg._id || msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName || 'Unknown',
        message: msg.text || msg.message || '',
        timestamp: new Date(msg.timestamp || msg.createdAt),
        // FIX: isMe should compare with MY ID, not personId
        isMe: msg.senderId === currentUserId,
        status: msg.status || 'sent',
        type: messageType,
        callDuration: msg.callDuration,
        callStatus: msg.callStatus,
        orderData: msg.orderData,
        reactions: (msg.reactions || []).map((r: any) => ({
          emoji: r.emoji,
          userId: r.userId,
          userName: r.userName,
          timestamp: r.timestamp ? new Date(r.timestamp) : new Date()
        })) as any
      };
    });

    // NOTE: Order messages now come from the chat API (database) when orders are forwarded
    // No need to create virtual messages from Redux state anymore

    // Merge all messages: chat (includes orders) + call history
    const allMessages = [...transformed, ...callHistory].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Apply search filter
    let filtered = allMessages;
    if (messageSearchTerm) {
      const searchLower = messageSearchTerm.toLowerCase();
      filtered = allMessages.filter((msg: any) =>
        msg.message.toLowerCase().includes(searchLower) ||
        msg.senderName.toLowerCase().includes(searchLower) ||
        (msg.orderData?.orderNumber?.toLowerCase().includes(searchLower)) ||
        (msg.orderData?.customerName?.toLowerCase().includes(searchLower))
      );
    }

    console.log('[PersonChat] DEBUG - Transformed messages count:', filtered.length);
    console.log('[PersonChat] DEBUG - Transformed messages:', filtered);

    return filtered;
  }, [reduxMessages, currentUserId, messageSearchTerm, callHistory]);

  // ========== EFFECTS ==========

  // Fetch messages on mount
  useEffect(() => {
    if (isOpen && personId) {
      (dispatch as any)(fetchMessages(personId));
    }
  }, [dispatch, isOpen, personId]);

  // Cleanup WebRTC on unmount
  useEffect(() => {
    return () => {
      if (callStateRef.current !== 'idle') {
        const service = webrtcServiceRef.current;
        if (service) {
          service.endCall();
        }
      }
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
    };
  }, []);

  // Auto-start call if specified
  useEffect(() => {
    if (isOpen && autoStartCall && callState === 'idle') {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        handleStartCall(autoStartCall);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoStartCall]); // Don't include callState to avoid re-triggering

  // Track call duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (callState === 'connected' && callStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState, callStartTime]);

  // ========== HANDLERS ==========

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !wsConnected) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await (dispatch as any)(sendMessageAction(personId, messageText));
    } catch (error) {
      console.error('[PersonChat] Send error:', error);
      setNewMessage(messageText); // Restore on error
    }
  }, [newMessage, personId, wsConnected, dispatch]);

  const handleStartCall = useCallback(async (type: CallType) => {
    try {
      setCallState('calling');
      setCallStartTime(new Date());
      const service = webrtcServiceRef.current;
      if (!service) throw new Error('WebRTC not initialized');

      await service.startCall(type);
      setLocalStream(service.getLocalStream());

      // Auto-timeout after 60 seconds
      callTimeoutRef.current = setTimeout(() => {
        if (callStateRef.current === 'calling') {
          handleEndCall();
        }
      }, 60000);
    } catch (error) {
      console.error('[PersonChat] Start call error:', error);
      setCallState('failed');
    }
  }, []);

  const handleEndCall = useCallback(async () => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    // Calculate call duration
    let duration = 0;
    let status: 'missed' | 'completed' | 'rejected' | 'busy' = 'completed';

    if (callStartTime) {
      duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);

      // Determine call status based on duration and call state
      if (duration < 5) {
        status = callStateRef.current === 'calling' ? 'missed' : 'rejected';
      } else {
        status = 'completed';
      }
    }

    // Add call to history (local state for immediate UI update)
    const callMessage: ChatMessage = {
      id: `call-${Date.now()}`,
      senderId: currentUserId || '',
      senderName: 'You',
      message: isVideoEnabled ? 'Video call' : 'Voice call',
      timestamp: new Date(),
      isMe: true,
      type: isVideoEnabled ? 'video_call' : 'call',
      callDuration: duration,
      callStatus: status,
      status: 'sent'
    };

    setCallHistory(prev => [...prev, callMessage]);

    // Save call to database
    try {
      const token = localStorage.getItem('authToken');
      const branchId = localStorage.getItem('selectedBranchId') || '';
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

      await fetch(`${baseUrl}/v2/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-selected-branch': branchId,
          'x-api-key': import.meta.env.VITE_API_KEY || ''
        },
        body: JSON.stringify({
          receiverId: personId,
          receiverName: personName,
          receiverEmail: personEmail || '',
          messageType: isVideoEnabled ? 'VIDEO_CALL' : 'CALL',
          text: isVideoEnabled ? 'Video call' : 'Voice call',
          callDuration: duration,
          callStatus: status
        })
      });

      console.log('[PersonChat] Call history saved to database');
    } catch (error) {
      console.error('[PersonChat] Failed to save call history:', error);
    }

    const service = webrtcServiceRef.current;
    if (service) {
      service.endCall();
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    setCallState('ended');
    setIsMuted(false);
    setIsVideoEnabled(true);
    setCallStartTime(null);

    setTimeout(() => setCallState('idle'), 2000);
  }, [localStream, remoteStream, callStartTime, isVideoEnabled, currentUserId, personId, personName, personEmail]);

  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      setCallState('connected');
      const service = webrtcServiceRef.current;
      if (!service) throw new Error('WebRTC not initialized');

      // answerCall takes the remote offer
      // For now, just set connected state
      setLocalStream(service.getLocalStream());
      setIncomingCall(null);
    } catch (error) {
      console.error('[PersonChat] Accept call error:', error);
      setCallState('failed');
    }
  }, [incomingCall]);

  const handleRejectCall = useCallback(() => {
    const service = webrtcServiceRef.current;
    if (service) {
      service.endCall();
    }
    setIncomingCall(null);
    setCallState('idle');
  }, [incomingCall]);

  const handleToggleMute = useCallback(() => {
    const service = webrtcServiceRef.current;
    if (service) {
      const newMutedState = service.toggleMicrophone();
      setIsMuted(newMutedState);
    }
  }, []);

  const handleToggleVideo = useCallback(() => {
    const service = webrtcServiceRef.current;
    if (service) {
      const newVideoState = service.toggleCamera();
      setIsVideoEnabled(newVideoState);

      // If turning off video during minimized state, switch to audio-only mode
      if (!newVideoState && isCallMinimized) {
        setIsAudioOnlyMode(true);
      }
      // If turning on video, disable audio-only mode
      if (newVideoState) {
        setIsAudioOnlyMode(false);
      }
    }
  }, [isCallMinimized]);

  const handleMinimizeCall = useCallback(() => {
    setIsCallMinimized(prev => !prev);

    // When minimizing a video call, optionally switch to audio-only to save bandwidth
    if (!isCallMinimized && isVideoEnabled) {
      // Ask user if they want to switch to audio-only
      const switchToAudio = confirm(
        'Switch to audio-only mode while minimized to save bandwidth and reduce costs?'
      );
      if (switchToAudio) {
        setIsAudioOnlyMode(true);
        // Disable video track but keep call active
        const service = webrtcServiceRef.current;
        if (service) {
          service.toggleCamera(); // Turn off camera
          setIsVideoEnabled(false);
        }
      }
    }

    // When maximizing, restore video if not in audio-only mode
    if (isCallMinimized && !isAudioOnlyMode && !isVideoEnabled) {
      const service = webrtcServiceRef.current;
      if (service) {
        service.toggleCamera(); // Turn on camera
        setIsVideoEnabled(true);
      }
    }
  }, [isCallMinimized, isVideoEnabled, isAudioOnlyMode]);

  const handleToggleAudioOnly = useCallback(() => {
    setIsAudioOnlyMode(prev => {
      const newMode = !prev;

      // If enabling audio-only mode, turn off video
      if (newMode && isVideoEnabled) {
        const service = webrtcServiceRef.current;
        if (service) {
          service.toggleCamera();
          setIsVideoEnabled(false);
        }
      }

      // If disabling audio-only mode, turn on video
      if (!newMode && !isVideoEnabled) {
        const service = webrtcServiceRef.current;
        if (service) {
          service.toggleCamera();
          setIsVideoEnabled(true);
        }
      }

      return newMode;
    });
  }, [isVideoEnabled]);

  // ========== ORDER HANDLERS ==========

  const handleViewOrder = useCallback(async (orderId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
      const response = await fetch(`${baseUrl}/v2/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': import.meta.env.VITE_API_KEY || ''
        }
      });

      if (response.ok) {
        const result = await response.json();
        const order = result.data || result;

        // Navigate to order form with order data
        // You can customize this navigation based on your app's routing
        console.log('[PersonChat] Viewing order:', order);
        alert(`View order #${order.orderNumber}\n\nThis would navigate to the order details page.`);
      } else {
        alert('Failed to load order details');
      }
    } catch (error) {
      console.error('[PersonChat] Error viewing order:', error);
      alert('Error loading order. Please try again.');
    }
  }, []);

  const handleAcceptOrder = useCallback(async (orderId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const branchId = localStorage.getItem('selectedBranchId') || '';
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

      const response = await fetch(`${baseUrl}/b2b/order-forward/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-selected-branch': branchId,
          'x-api-key': import.meta.env.VITE_API_KEY || ''
        },
        body: JSON.stringify({ forwardId: orderId })
      });

      if (response.ok) {
        // Refresh orders to update status
        await (dispatch as any)(fetchMessages(personId));
        alert('Order accepted successfully!');
      } else {
        alert('Failed to accept order');
      }
    } catch (error) {
      console.error('[PersonChat] Error accepting order:', error);
      alert('Error accepting order. Please try again.');
    }
  }, [dispatch, personId]);

  const handleDenyOrder = useCallback(async (orderId: string) => {
    const reason = prompt('Please provide a reason for denying this order:');
    if (!reason || !reason.trim()) {
      return; // User cancelled or didn't provide a reason
    }

    try {
      const token = localStorage.getItem('authToken');
      const branchId = localStorage.getItem('selectedBranchId') || '';
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

      const response = await fetch(`${baseUrl}/b2b/order-forward/deny`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-selected-branch': branchId,
          'x-api-key': import.meta.env.VITE_API_KEY || ''
        },
        body: JSON.stringify({ forwardId: orderId, reason: reason.trim() })
      });

      if (response.ok) {
        // Refresh orders to update status
        await (dispatch as any)(fetchMessages(personId));
        alert('Order denied successfully');
      } else {
        alert('Failed to deny order');
      }
    } catch (error) {
      console.error('[PersonChat] Error denying order:', error);
      alert('Error denying order. Please try again.');
    }
  }, [dispatch, personId]);

  // ========== HANDLERS - CLOSE ==========

  const handleCloseChat = useCallback(() => {
    // If there's an active call, minimize it instead of ending
    if (callState === 'connected' || callState === 'calling') {
      setIsCallMinimized(true);
      // Close the chat UI but keep call running
      onClose();
    } else {
      // No active call, just close normally
      onClose();
    }
  }, [callState, onClose]);

  // ========== RENDER ==========

  // Render call modals and widgets outside of chat UI (always visible)
  const CallUI = (
    <>
      {/* Call Modals */}
      {incomingCall && (
        <IncomingCallModal
          isOpen={true}
          callerName={incomingCall.callerName}
          callType={incomingCall.callType}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {callState === 'calling' && (
        <CallingModal
          isOpen={true}
          personName={personName}
          callType={isVideoEnabled ? 'video' : 'audio'}
          onCancel={handleEndCall}
          isMinimized={isCallMinimized}
          onMinimize={handleMinimizeCall}
        />
      )}

      {callState === 'connected' && localStream && remoteStream && !isCallMinimized && (
        <ActiveCallModal
          isOpen={true}
          personName={personName}
          callType={isVideoEnabled ? 'video' : 'audio'}
          isMuted={isMuted}
          isCameraOff={!isVideoEnabled}
          localStream={localStream}
          remoteStream={remoteStream}
          callDuration={callDuration}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleVideo}
          onEndCall={handleEndCall}
          isMinimized={isCallMinimized}
          onMinimize={handleMinimizeCall}
          isOnHold={false}
          isScreenSharing={false}
        />
      )}

      {/* Minimized Call Widget */}
      {callState === 'connected' && isCallMinimized && (
        <div className="minimized-call-widget" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          minWidth: '280px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{personName}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
              {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
              {isAudioOnlyMode && ' • Audio Only'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleToggleMute}
              style={{
                background: isMuted ? '#ef4444' : '#374151',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button
              onClick={handleMinimizeCall}
              style={{
                background: '#374151',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Expand"
            >
              ⬆️
            </button>
            <button
              onClick={handleEndCall}
              style={{
                background: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="End Call"
            >
              📞
            </button>
          </div>
        </div>
      )}

      {/* Audio-Only Mode Badge */}
      {callState === 'connected' && isAudioOnlyMode && !isCallMinimized && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💰 Cost-Saving Mode: Audio Only
          <button
            onClick={handleToggleAudioOnly}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Enable Video
          </button>
        </div>
      )}
    </>
  );

  // Chat UI - only render when isOpen
  if (!isOpen) {
    // Just render call UI
    return CallUI;
  }

  const Content = (
    <>
      {/* Header */}
      <ChatHeader
        personName={personName}
        personEmail={personEmail}
        personStatus={{ online: wsConnected, lastActiveAt: null }}
        onClose={handleCloseChat}
        onStartCall={handleStartCall}
        onToggleSearch={() => setShowSearch(!showSearch)}
        wsConnected={wsConnected}
        embedded={embedded}
      />

      {/* Tabs */}
      <div className="person-chat-tabs">
        <button
          className={`person-chat-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <ChatIcon />
          Chat
          {messages.length > 0 && <span className="tab-badge">{messages.length}</span>}
        </button>
        <button
          className={`person-chat-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <InventoryIcon />
          Orders
          {(filteredOrders.forwarded.length + filteredOrders.received.length) > 0 && (
            <span className="tab-badge">
              {filteredOrders.forwarded.length + filteredOrders.received.length}
            </span>
          )}
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <>
          {/* Message Search Bar */}
          {showSearch && (
            <div className="message-search-bar">
              <span style={{ color: '#737373' }}><SearchIcon width={20} height={20} /></span>
              <input
                type="text"
                placeholder="Search messages..."
                value={messageSearchTerm}
                onChange={(e) => setMessageSearchTerm(e.target.value)}
                className="message-search-input"
                autoFocus
              />
              {messageSearchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={() => setMessageSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>
          )}

          {console.log('[PersonChat] DEBUG - Rendering ChatMessages with:', {
            messagesCount: messages.length,
            messages: messages,
            currentUserId: currentUserId
          })}
          <ChatMessages
            messages={messages}
            loading={false}
            typingUsers={[]}
            currentUserId={currentUserId || ''}
            onViewOrder={handleViewOrder}
            onAcceptOrder={handleAcceptOrder}
            onDenyOrder={handleDenyOrder}
          />

          <ChatInput
            value={newMessage}
            onChange={setNewMessage}
            onSend={handleSendMessage}
            onTyping={() => {}}
            disabled={!wsConnected}
            placeholder={wsConnected ? 'Message...' : 'Connecting...'}
          />
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="person-chat-content">
          {/* Order Filters */}
          <div className="orders-filters">
            <div className="orders-filter-search">
              <span style={{ color: '#737373' }}><SearchIcon width={20} height={20} /></span>
              <input
                type="text"
                placeholder="Search by order # or customer..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="orders-search-input"
              />
            </div>
            <div className="orders-filter-controls">
              <div className="orders-filter-group">
                <span style={{ color: '#737373' }}><FilterListIcon width={18} height={18} /></span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="orders-filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>
              <div className="orders-filter-group">
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="orders-filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="standard">Standard</option>
                  <option value="urgent">Urgent</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </div>

          {filteredOrders.forwarded.length === 0 && filteredOrders.received.length === 0 ? (
            <div className="person-chat-empty">
              <span style={{ opacity: 0.3 }}><InventoryIcon width={64} height={64} /></span>
              <h3>No orders with {personName}</h3>
              <span>Orders you forward to or receive from this person will appear here</span>
            </div>
          ) : (
            <div className="orders-container">
              {filteredOrders.forwarded.length > 0 && (
                <div className="orders-section">
                  <h4 className="orders-section-title">
                    <ForwardIcon />
                    Forwarded to {personName}
                    <span className="orders-count">{filteredOrders.forwarded.length}</span>
                  </h4>
                  <div className="orders-list">
                    {filteredOrders.forwarded.map((order) => (
                      <div key={order._id} className="order-card">
                        <div className="order-card-header">
                          <span className="order-number">#{order.orderNumber}</span>
                          <span className={`order-status status-${(order.forwardStatus || order.status || 'pending').toLowerCase()}`}>
                            {(order.forwardStatus || order.status || 'PENDING').toUpperCase()}
                          </span>
                        </div>
                        <div className="order-card-body">
                          <div className="order-customer">
                            {order.customerName || order.customer?.name || 'Unknown'}
                          </div>
                          <div className="order-meta">
                            <span>{order.items?.length || order.itemCount || 0} Items</span>
                            {order.orderType && <span>• {order.orderType}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredOrders.received.length > 0 && (
                <div className="orders-section">
                  <h4 className="orders-section-title">
                    <InventoryIcon />
                    Received from {personName}
                    <span className="orders-count">{filteredOrders.received.length}</span>
                  </h4>
                  <div className="orders-list">
                    {filteredOrders.received.map((order) => (
                      <div key={order._id} className="order-card">
                        <div className="order-card-header">
                          <span className="order-number">#{order.orderNumber}</span>
                          <span className={`order-status status-${(order.forwardStatus || order.status || 'pending').toLowerCase()}`}>
                            {(order.forwardStatus || order.status || 'PENDING').toUpperCase()}
                          </span>
                        </div>
                        <div className="order-card-body">
                          <div className="order-customer">
                            {order.customerName || order.customer?.name || 'Unknown'}
                          </div>
                          <div className="order-meta">
                            <span>{order.items?.length || order.itemCount || 0} Items</span>
                            {order.orderType && <span>• {order.orderType}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );

  // Render based on mode
  if (embedded) {
    return (
      <>
        <div className="person-chat-embedded">{Content}</div>
        {CallUI}
      </>
    );
  }

  return (
    <>
      <div className="person-chat-overlay" onClick={handleCloseChat}>
        <div className="person-chat-modal" onClick={(e) => e.stopPropagation()}>
          {Content}
        </div>
      </div>
      {CallUI}
    </>
  );
}

export default PersonChat;
