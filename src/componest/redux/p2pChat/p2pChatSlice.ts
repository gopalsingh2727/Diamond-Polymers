import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatConversation, ChatMessage, P2PChatState } from './types';

const initialState: P2PChatState = {
  conversations: [],
  activeConversationId: null,
  conversationsLoading: false,
  conversationsError: null,

  messages: {},
  messagesLoading: false,
  messagesError: null,
  hasMoreMessages: {},

  unreadCounts: {},

  minimizedChats: [],

  typingUsers: {},

  userStatuses: {}, // personId -> { isOnline: boolean, lastActiveAt: Date | null }
};

const p2pChatSlice = createSlice({
  name: 'p2pChat',
  initialState,
  reducers: {
    // ==========================================
    // Conversations
    // ==========================================
    fetchConversationsStart: (state) => {
      state.conversationsLoading = true;
      state.conversationsError = null;
    },
    fetchConversationsSuccess: (state, action: PayloadAction<ChatConversation[]>) => {
      state.conversationsLoading = false;
      state.conversations = action.payload;

      // Initialize unread counts from conversations
      action.payload.forEach((conv) => {
        if (conv.unreadCounts) {
          Object.keys(conv.unreadCounts).forEach((userId) => {
            state.unreadCounts[userId] = (state.unreadCounts[userId] || 0) + conv.unreadCounts[userId];
          });
        }
      });
    },
    fetchConversationsFailure: (state, action: PayloadAction<string>) => {
      state.conversationsLoading = false;
      state.conversationsError = action.payload;
    },

    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },

    // ==========================================
    // Messages
    // ==========================================
    fetchMessagesStart: (state) => {
      state.messagesLoading = true;
      state.messagesError = null;
    },
    fetchMessagesSuccess: (
      state,
      action: PayloadAction<{ conversationId: string; messages: ChatMessage[]; hasMore: boolean }>
    ) => {
      state.messagesLoading = false;
      const { conversationId, messages, hasMore } = action.payload;

      // Prepend messages (for loading history) with deduplication
      const existingMessages = state.messages[conversationId] || [];
      const existingIds = new Set(existingMessages.map(msg => msg._id));

      // Filter out messages that already exist
      const newMessages = messages.filter(msg => !existingIds.has(msg._id));

      state.messages[conversationId] = [...newMessages, ...existingMessages];
      state.hasMoreMessages[conversationId] = hasMore;
    },
    fetchMessagesFailure: (state, action: PayloadAction<string>) => {
      state.messagesLoading = false;
      state.messagesError = action.payload;
    },

    // ==========================================
    // Send Message (Optimistic Update)
    // ==========================================
    addMessageOptimistic: (state, action: PayloadAction<ChatMessage>) => {
      const { conversationId } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(action.payload);
    },

    replaceMessage: (state, action: PayloadAction<{ tempId: string; message: ChatMessage }>) => {
      const { tempId, message } = action.payload;
      const conversationId = message.conversationId;

      if (state.messages[conversationId]) {
        const index = state.messages[conversationId].findIndex((msg) => msg._id === tempId);
        if (index !== -1) {
          state.messages[conversationId][index] = message;
        }
      }
    },

    updateMessageStatus: (state, action: PayloadAction<{ tempId: string; status: ChatMessage['status'] }>) => {
      const { tempId, status } = action.payload;

      // Find message across all conversations
      Object.keys(state.messages).forEach((conversationId) => {
        const index = state.messages[conversationId].findIndex((msg) => msg._id === tempId);
        if (index !== -1) {
          state.messages[conversationId][index].status = status;
        }
      });
    },

    // ==========================================
    // Real-time Message Received (WebSocket)
    // ==========================================
    receiveNewMessage: (state, action: PayloadAction<ChatMessage>) => {
      const message = action.payload;
      const { conversationId } = message;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Add message if not already in list
      const exists = state.messages[conversationId].some((msg) => msg._id === message._id);
      if (!exists) {
        state.messages[conversationId].push(message);
      }

      // Update conversation's last message
      const conversation = state.conversations.find((c) => c._id === conversationId);
      if (conversation) {
        conversation.lastMessage = {
          text: message.text || '',
          senderId: message.senderId,
          senderName: message.senderName,
          timestamp: message.timestamp,
          messageType: message.type,
        };
        conversation.lastMessageAt = message.timestamp;
        conversation.messageCount += 1;
      }
    },

    // ==========================================
    // Unread Counts
    // ==========================================
    incrementUnread: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const conversation = state.conversations.find((c) => c._id === conversationId);
      if (conversation && conversation.participants.length > 0) {
        const otherParticipant = conversation.participants.find((p) => p.userId !== action.payload);
        if (otherParticipant) {
          state.unreadCounts[otherParticipant.userId] = (state.unreadCounts[otherParticipant.userId] || 0) + 1;
        }
      }
    },

    resetUnread: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const conversation = state.conversations.find((c) => c._id === conversationId);
      if (conversation && conversation.participants.length > 0) {
        const otherParticipant = conversation.participants.find((p) => p.userId !== action.payload);
        if (otherParticipant) {
          state.unreadCounts[otherParticipant.userId] = 0;
        }
      }
    },

    // ==========================================
    // Reactions
    // ==========================================
    addReactionOptimistic: (
      state,
      action: PayloadAction<{ messageId: string; emoji: string; userId: string; userName: string }>
    ) => {
      const { messageId, emoji, userId, userName } = action.payload;

      // Find message and add reaction
      Object.keys(state.messages).forEach((conversationId) => {
        const message = state.messages[conversationId].find((msg) => msg._id === messageId);
        if (message) {
          const existingReaction = message.reactions.find(
            (r) => r.emoji === emoji && r.userId === userId
          );
          if (!existingReaction) {
            message.reactions.push({ emoji, userId, userName, timestamp: new Date() });
          }
        }
      });
    },

    // ==========================================
    // Message Read Receipts (WebSocket)
    // ==========================================
    messageRead: (state, action: PayloadAction<{ messageId: string; userId: string }>) => {
      const { messageId, userId } = action.payload;

      // Find message and update readBy
      Object.keys(state.messages).forEach((conversationId) => {
        const message = state.messages[conversationId].find((msg) => msg._id === messageId);
        if (message && !message.readBy.includes(userId)) {
          message.readBy.push(userId);
        }
      });
    },

    // ==========================================
    // Typing Indicators (WebSocket)
    // ==========================================
    userTyping: (state, action: PayloadAction<{ conversationId: string; userId: string; userName: string }>) => {
      const { conversationId, userId } = action.payload;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }

      // Auto-remove after 3 seconds (handled in component)
    },

    userStoppedTyping: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;

      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter((id) => id !== userId);
      }
    },

    // ==========================================
    // UI State
    // ==========================================
    minimizeChat: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      if (!state.minimizedChats.includes(conversationId)) {
        state.minimizedChats.push(conversationId);
      }
    },

    maximizeChat: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.minimizedChats = state.minimizedChats.filter((id) => id !== conversationId);
    },

    // ==========================================
    // User Status (Online/Offline + Last Active)
    // ==========================================
    updateUserStatus: (
      state,
      action: PayloadAction<{ personId: string; isOnline: boolean; lastActiveAt: Date | null }>
    ) => {
      const { personId, isOnline, lastActiveAt } = action.payload;
      state.userStatuses[personId] = { isOnline, lastActiveAt };
    },

    // ==========================================
    // Clear State (on logout)
    // ==========================================
    clearChatState: () => initialState,
  },
});

export const {
  fetchConversationsStart,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  setActiveConversation,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  addMessageOptimistic,
  replaceMessage,
  updateMessageStatus,
  receiveNewMessage,
  incrementUnread,
  resetUnread,
  addReactionOptimistic,
  messageRead,
  userTyping,
  userStoppedTyping,
  minimizeChat,
  maximizeChat,
  updateUserStatus,
  clearChatState,
} = p2pChatSlice.actions;

export default p2pChatSlice.reducer;
