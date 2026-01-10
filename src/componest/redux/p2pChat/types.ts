/**
 * P2P Chat Type Definitions
 * Types for person-to-person chat functionality
 */

export interface ChatConversation {
  _id: string;
  participants: Array<{
    userId: string;
    userName: string;
    userRole: string;
    userEmail?: string;
    companyId?: string;
    companyName?: string;
  }>;
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    messageType: string;
  };
  lastMessageAt: Date;
  messageCount: number;
  unreadCounts: Record<string, number>;
  type?: 'direct' | 'group';
  isActive?: boolean;
  isOnline?: boolean;
  lastActiveAt?: Date | null;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text?: string;
  type: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions: Array<{
    emoji: string;
    userId: string;
    userName: string;
    timestamp: Date;
  }>;
  readBy: string[];
  attachment?: {
    type: string;
    url: string;
    name?: string;
    size?: number;
  };
  orderId?: string;
  taskId?: string;
}

export interface P2PChatState {
  // Conversations
  conversations: ChatConversation[];
  activeConversationId: string | null;
  conversationsLoading: boolean;
  conversationsError: string | null;

  // Messages (keyed by conversationId)
  messages: Record<string, ChatMessage[]>;
  messagesLoading: boolean;
  messagesError: string | null;
  hasMoreMessages: Record<string, boolean>;

  // Unread counts (keyed by userId)
  unreadCounts: Record<string, number>;

  // UI state
  minimizedChats: string[];

  // Typing indicators (keyed by conversationId)
  typingUsers: Record<string, string[]>;

  // User statuses (keyed by personId)
  userStatuses: Record<string, { isOnline: boolean; lastActiveAt: Date | null }>;
}
