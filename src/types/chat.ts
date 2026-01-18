/**
 * Chat System TypeScript Types
 * Comprehensive type definitions for chat, calls, orders, and messages
 */

// ============= MESSAGE TYPES =============

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isMe: boolean;
  status?: MessageStatus;
  type?: 'text' | 'call' | 'video_call' | 'order_forward' | 'order_received';
  callDuration?: number; // in seconds
  callStatus?: 'missed' | 'completed' | 'rejected' | 'busy';
  orderData?: {
    orderId: string;
    orderNumber: string;
    customerName?: string;
    itemCount?: number;
    orderType?: string;
    forwardStatus?: 'pending' | 'accepted' | 'denied';
    createdAt?: Date | string;
  };
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  replyTo?: {
    messageId: string;
    text: string;
    senderName: string;
  };
}

// ============= CALL TYPES =============

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'on_hold' | 'ended' | 'failed';
export type CallType = 'audio' | 'video';

export interface IncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  callType: CallType;
  timestamp: Date;
}

export interface CallStats {
  duration: number;
  startTime: Date;
  endTime?: Date;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

// ============= ORDER TYPES =============

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type ForwardStatus = 'pending' | 'accepted' | 'denied' | 'processing';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  specifications?: Record<string, any>;
}

export interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Order {
  _id: string;
  id?: string;
  orderNumber: string;

  // Customer
  customerName?: string;
  customer?: Customer;

  // Status
  status?: OrderStatus;
  forwardStatus?: ForwardStatus;
  overallStatus?: string;

  // Items
  items?: OrderItem[];
  itemCount?: number;

  // Order details
  orderType?: string;
  orderTypeId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  totalAmount?: number;

  // Forwarding info
  forwardedBy?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  forwardedByName?: string;
  forwardedByEmail?: string;

  forwardedTo?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  forwardedToName?: string;
  forwardedToEmail?: string;

  // Branch info
  toBranch?: {
    id?: string;
    name?: string;
  };
  toBranchName?: string;

  fromBranch?: {
    id?: string;
    name?: string;
  };
  fromBranchName?: string;

  // Timestamps
  createdAt: Date | string;
  updatedAt?: Date | string;
  date?: Date | string;
  dueDate?: Date | string;
  forwardedAt?: Date | string;

  // Notes
  notes?: Array<{
    note: string;
    createdAt: Date | string;
    createdByName?: string;
    noteType?: string;
  }>;
}

export interface OrdersWithPerson {
  forwarded: Order[];
  received: Order[];
}

// ============= USER STATUS TYPES =============

export interface UserStatus {
  online: boolean;
  lastActiveAt?: Date | string | null;
  typingIndicator?: boolean;
}

// ============= COMPONENT PROPS =============

export interface PersonChatProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  personEmail?: string;
  mode?: 'modal' | 'embedded';
  initialTab?: 'chat' | 'orders' | 'history';
}

export interface ChatHeaderProps {
  personName: string;
  personEmail?: string;
  personStatus: UserStatus;
  onClose: () => void;
  onStartCall: (type: CallType) => void;
  onToggleSearch: () => void;
  wsConnected: boolean;
  embedded?: boolean;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
  typingUsers: string[];
  onAddReaction?: (messageId: string, emoji: string) => Promise<void>;
  onRemoveReaction?: (messageId: string, emoji: string) => Promise<void>;
  searchQuery?: string;
  currentUserId?: string;
  onViewOrder?: (orderId: string) => void;
  onAcceptOrder?: (orderId: string) => void;
  onDenyOrder?: (orderId: string) => void;
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

export interface OrdersTabProps {
  personId: string;
  personName: string;
  personEmail?: string;
}

export interface TabNavigationProps {
  activeTab: 'chat' | 'orders' | 'history';
  onTabChange: (tab: 'chat' | 'orders' | 'history') => void;
  unreadCount?: number;
  orderCount?: number;
}

// ============= HOOK RETURN TYPES =============

export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (text: string, attachments?: MessageAttachment[]) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  markAsRead: () => void;
}

export interface UseCallStateReturn {
  callState: CallState;
  incomingCall: IncomingCall | null;
  startCall: (type: CallType) => Promise<void>;
  endCall: () => void;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  switchCamera: () => Promise<void>;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStats: CallStats | null;
}

export interface UseOrdersWithPersonReturn {
  orders: OrdersWithPerson;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseTypingIndicatorReturn {
  typingUsers: string[];
  startTyping: () => void;
  stopTyping: () => void;
}

export interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<MessageAttachment>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export interface UseMessageSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredMessages: ChatMessage[];
  currentMatch: number;
  totalMatches: number;
  goToNext: () => void;
  goToPrevious: () => void;
  clearSearch: () => void;
}
