/**
 * Type definitions for Chat components
 */

export type CallType = 'audio' | 'video';

export interface PersonStatus {
  online: boolean;
  lastActiveAt: Date | string | null;
}

export interface ChatHeaderProps {
  personName: string;
  personEmail?: string;
  personStatus: PersonStatus;
  onClose: () => void;
  onStartCall: (type: CallType) => void;
  onToggleSearch: () => void;
  wsConnected: boolean;
  embedded?: boolean;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
  onAttachFile?: () => void;
  onSelectEmoji?: (emoji: string) => void;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isMe: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type?: 'text' | 'call' | 'video_call' | 'order_forward' | 'order_received';
  callDuration?: number;
  callStatus?: 'missed' | 'completed' | 'rejected' | 'busy';
  orderData?: any;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
    timestamp: Date;
  }>;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
  typingUsers: string[];
  currentUserId: string;
  onViewOrder?: (orderId: string) => void;
  onAcceptOrder?: (orderId: string) => void;
  onDenyOrder?: (orderId: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  searchQuery?: string;
}

export interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface IncomingCallModalProps extends CallModalProps {
  callerName: string;
  callType: CallType;
  onAccept: () => void;
  onReject: () => void;
}

export interface CallingModalProps extends CallModalProps {
  personName: string;
  callType: CallType;
  onCancel: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
}

export interface ActiveCallModalProps extends CallModalProps {
  personName: string;
  callType: CallType;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isOnHold?: boolean;
  isScreenSharing?: boolean;
  isMinimized?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor' | null;
  callDuration: number;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onSwitchCamera?: () => void;
  onToggleHold?: () => void;
  onToggleScreenShare?: () => void;
  onMinimize?: () => void;
  onEndCall: () => void;
}
