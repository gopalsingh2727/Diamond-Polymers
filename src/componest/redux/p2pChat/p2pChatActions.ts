import { Dispatch } from 'redux';
import {
  fetchConversationsStart,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  addMessageOptimistic,
  replaceMessage,
  updateMessageStatus,
  resetUnread,
  updateUserStatus,
} from './p2pChatSlice';

// API Base URL
const API_BASE = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper functions for auth headers
const getToken = (): string => {
  const token = localStorage.getItem('authToken') || '';
  return token;
};

const getSelectedBranch = (): string | null => {
  // First check direct localStorage key
  const directBranch = localStorage.getItem('selectedBranch');
  if (directBranch) {
    return directBranch;
  }

  // Fallback: check userData.selectedBranch
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.selectedBranch || parsed.branchId || null;
    }
  } catch {
    // Ignore parse errors
  }

  return null;
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${getToken()}`,
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  };

  // Add selected branch header for data isolation
  const selectedBranch = getSelectedBranch();
  if (selectedBranch) {
    headers['x-selected-branch'] = selectedBranch;
  }

  return headers;
};

/**
 * 1. Fetch All Conversations (Recent Chats with unread counts)
 * GET /v2/chat/conversations
 */
export const fetchConversations = () => async (dispatch: Dispatch) => {
  try {
    dispatch(fetchConversationsStart());

    console.log('[P2P Chat Actions] Fetching conversations...');

    const response = await fetch(`${API_BASE}/v2/chat/conversations`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('[P2P Chat Actions] Conversations response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[P2P Chat Actions] Failed to fetch conversations:', errorText);
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[P2P Chat Actions] Conversations data:', data);

    // Transform backend format to Redux format
    const conversations = (data.data || []).map((conv: any) => ({
      _id: conv.personId, // Use personId as conversation ID
      participants: [
        {
          userId: conv.personId,
          userName: conv.personName,
          userRole: 'User'
        }
      ],
      lastMessage: conv.lastMessage ? {
        text: conv.lastMessage.text,
        senderId: conv.lastMessage.isMe ? 'me' : conv.personId,
        senderName: conv.lastMessage.isMe ? 'Me' : conv.personName,
        timestamp: new Date(conv.lastMessage.timestamp),
        messageType: 'TEXT',
      } : undefined,
      lastMessageAt: conv.lastMessage ? new Date(conv.lastMessage.timestamp) : new Date(),
      messageCount: 0,
      unreadCounts: { [conv.personId]: conv.unreadCount || 0 },
      isOnline: conv.isOnline || false,
      lastActiveAt: conv.lastActiveAt ? new Date(conv.lastActiveAt) : null,
    }));

    dispatch(fetchConversationsSuccess(conversations));

    // Update user statuses in Redux
    conversations.forEach((conv: any) => {
      dispatch(updateUserStatus({
        personId: conv._id,
        isOnline: conv.isOnline || false,
        lastActiveAt: conv.lastActiveAt
      }));
    });
  } catch (error: any) {
    console.error('[P2P Chat Actions] Error fetching conversations:', error);
    dispatch(fetchConversationsFailure(error.message || 'Failed to fetch conversations'));
  }
};

/**
 * 2. Fetch Messages with a Person
 * GET /v2/chat/messages/{personId}
 */
export const fetchMessages = (personId: string, before?: Date) => async (dispatch: Dispatch) => {
  try {
    dispatch(fetchMessagesStart());

    let url = `${API_BASE}/v2/chat/messages/${personId}`;
    const params = new URLSearchParams();
    if (before) {
      params.append('before', before.toISOString());
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log('[P2P Chat Actions] Fetching messages for person:', personId);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('[P2P Chat Actions] Messages response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[P2P Chat Actions] Failed to fetch messages:', errorText);
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[P2P Chat Actions] Messages data:', data);

    // Transform backend format to Redux format
    const messages = (data.data || []).map((msg: any) => ({
      _id: msg._id, // Backend always uses MongoDB _id
      conversationId: personId, // Use personId as conversationId
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderRole: 'User',
      text: msg.text, // Backend uses 'text' field
      type: 'text',
      timestamp: new Date(msg.createdAt), // Backend uses 'createdAt' from MongoDB timestamps
      status: msg.status || 'sent',
      reactions: [],
      readBy: msg.status === 'read' ? [msg.senderId] : [],
    }));

    dispatch(
      fetchMessagesSuccess({
        conversationId: personId,
        messages: messages,
        hasMore: data.hasMore || false,
      })
    );
  } catch (error: any) {
    console.error('[P2P Chat Actions] Error fetching messages:', error);
    dispatch(fetchMessagesFailure(error.message || 'Failed to fetch messages'));
  }
};

/**
 * 3. Send Message to a Person
 * POST /v2/chat/send
 */
export const sendMessage = (
  personId: string,
  text: string
) => async (dispatch: Dispatch, getState: any) => {
  const tempId = `temp-${Date.now()}`;
  const state = getState();
  const currentUser = state.login?.userDetails || state.auth?.user;

  console.log('[P2P Chat Actions] Sending message to person:', personId);
  console.log('[P2P Chat Actions] Message text:', text);

  // Optimistic update
  const tempMessage = {
    _id: tempId,
    conversationId: personId,
    senderId: currentUser?.userId || 'me',
    senderName: currentUser?.name || 'Me',
    senderRole: currentUser?.role || 'User',
    type: 'text' as const,
    text,
    attachments: [],
    status: 'sending' as const,
    readBy: [],
    reactions: [],
    isDeleted: false,
    timestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  dispatch(addMessageOptimistic(tempMessage));

  try {
    const requestBody = {
      receiverId: personId,
      receiverModel: 'User',
      text: text,
      messageType: 'TEXT'
    };

    console.log('[P2P Chat Actions] Sending message:', requestBody);

    const response = await fetch(`${API_BASE}/v2/chat/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log('[P2P Chat Actions] Send message response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[P2P Chat Actions] Failed to send message:', errorText);
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[P2P Chat Actions] Send message result:', data);

    // Transform backend message to Redux format
    const sentMessage = {
      _id: data.data._id,
      conversationId: personId,
      senderId: data.data.senderId,
      senderName: data.data.senderName,
      senderRole: 'User',
      text: data.data.text,
      type: 'text' as const,
      timestamp: new Date(data.data.createdAt),
      status: 'sent' as const,
      readBy: [],
      reactions: [],
    };

    // Replace temp message with real one
    dispatch(replaceMessage({ tempId, message: sentMessage }));
  } catch (error: any) {
    console.error('[P2P Chat Actions] Error sending message:', error);

    // Mark message as failed
    dispatch(updateMessageStatus({ tempId, status: 'failed' }));

    throw error;
  }
};

/**
 * 4. Mark Messages as Read
 * PUT /v2/chat/read
 */
export const markAsRead = (personId: string) => async (dispatch: Dispatch) => {
  try {
    console.log('[P2P Chat Actions] Marking messages as read for person:', personId);

    const response = await fetch(`${API_BASE}/v2/chat/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        senderId: personId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.statusText}`);
    }

    console.log('[P2P Chat Actions] Marked as read successfully');

    // Update local unread count immediately
    dispatch(resetUnread(personId));
  } catch (error: any) {
    console.error('[P2P Chat Actions] Error marking as read:', error);
  }
};

/**
 * 5. Get Unread Count
 * GET /v2/chat/unread-count
 */
export const fetchUnreadCount = () => async (dispatch: Dispatch) => {
  try {
    const response = await fetch(`${API_BASE}/v2/chat/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.unreadCount || 0;
  } catch (error: any) {
    console.error('[P2P Chat Actions] Error fetching unread count:', error);
    return 0;
  }
};

/**
 * Retry Failed Message
 */
export const retryMessage = (tempId: string) => async (dispatch: Dispatch, getState: any) => {
  const state = getState();
  const messages = state.p2pChat.messages;

  // Find the failed message
  let failedMessage: any = null;
  for (const conversationId in messages) {
    const msg = messages[conversationId].find((m: any) => m._id === tempId);
    if (msg) {
      failedMessage = msg;
      break;
    }
  }

  if (!failedMessage) {
    console.error('[P2P Chat Actions] Failed message not found');
    return;
  }

  // Retry sending
  dispatch(updateMessageStatus({ tempId, status: 'sending' }));

  try {
    await dispatch(sendMessage(failedMessage.conversationId, failedMessage.text) as any);
  } catch (error) {
    console.error('[P2P Chat Actions] Retry failed:', error);
  }
};

/**
 * 6. Get User Status (Online/Offline + Last Active)
 * GET /v2/chat/user-status/{personId}
 */
export const fetchUserStatus = (personId: string) => async (dispatch: Dispatch) => {
  try {
    const response = await fetch(`${API_BASE}/v2/chat/user-status/${personId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user status: ${response.statusText}`);
    }

    const data = await response.json();

    dispatch(updateUserStatus({
      personId: data.data.personId,
      isOnline: data.data.isOnline || false,
      lastActiveAt: data.data.lastActiveAt ? new Date(data.data.lastActiveAt) : null
    }));
  } catch (error: any) {
    console.error('[P2P Chat Actions] Error fetching user status:', error);
    // Set offline status on error
    dispatch(updateUserStatus({
      personId,
      isOnline: false,
      lastActiveAt: null
    }));
  }
};

/**
 * 7. Update User Activity (Heartbeat)
 * POST /v2/chat/activity
 */
export const updateActivity = () => async (dispatch: Dispatch) => {
  try {
    await fetch(`${API_BASE}/v2/chat/activity`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (error: any) {
    console.error('[P2P Chat Actions] Error updating activity:', error);
  }
};
