/**
 * useChatMessages Hook
 * Handles message fetching, sending, transforming with Redux
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchMessages, sendMessage, markMessagesAsRead } from '../../componest/redux/p2pChat/p2pChatSlice';
import type { ChatMessage, UseChatMessagesReturn, MessageAttachment } from '../../types/chat';

/**
 * Custom hook for managing chat messages with Redux
 *
 * @param personId - ID of the person to chat with
 * @returns Message state and actions
 */
export function useChatMessages(personId: string): UseChatMessagesReturn {
  const dispatch = useDispatch();

  // Get current user ID from auth state
  const currentUserId = useSelector((state: RootState) => state.auth.user?._id);

  // Get messages from Redux
  const reduxMessages = useSelector((state: RootState) =>
    state.p2pChat.messages[personId] || []
  );

  const loading = useSelector((state: RootState) =>
    state.p2pChat.loading[personId] || false
  );

  const error = useSelector((state: RootState) =>
    state.p2pChat.error[personId] || null
  );

  // Transform Redux messages to ChatMessage format with proper isMe logic
  const messages = useMemo<ChatMessage[]>(() => {
    if (!currentUserId) return [];

    return reduxMessages.map((msg: any) => ({
      id: msg._id || msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName || 'Unknown',
      message: msg.text || msg.message || '',
      timestamp: new Date(msg.timestamp || msg.createdAt),
      // FIX: isMe should be true when I sent it (senderId === currentUserId)
      isMe: msg.senderId === currentUserId,
      status: msg.status || 'sent',
      reactions: msg.reactions || [],
      attachments: msg.attachments || [],
      replyTo: msg.replyTo
    }));
  }, [reduxMessages, currentUserId]);

  // Fetch messages when component mounts or personId changes
  useEffect(() => {
    if (personId) {
      dispatch(fetchMessages(personId));
    }
  }, [dispatch, personId]);

  // Send message
  const sendMessageHandler = useCallback(async (
    text: string,
    attachments?: MessageAttachment[]
  ): Promise<void> => {
    if (!text.trim() && (!attachments || attachments.length === 0)) {
      return;
    }

    try {
      await dispatch(sendMessage({
        personId,
        text: text.trim(),
        attachments
      })).unwrap();
    } catch (error) {
      console.error('[useChatMessages] Send message error:', error);
      throw error;
    }
  }, [dispatch, personId]);

  // Add reaction to message
  const addReaction = useCallback(async (
    messageId: string,
    emoji: string
  ): Promise<void> => {
    // TODO: Implement reaction persistence
    // For now, log the action
    console.log('[useChatMessages] Add reaction:', { messageId, emoji });

    // This would dispatch a Redux action when implemented:
    // await dispatch(addMessageReaction({ messageId, emoji, personId })).unwrap();
  }, []);

  // Remove reaction from message
  const removeReaction = useCallback(async (
    messageId: string,
    emoji: string
  ): Promise<void> => {
    // TODO: Implement reaction removal
    console.log('[useChatMessages] Remove reaction:', { messageId, emoji });

    // This would dispatch a Redux action when implemented:
    // await dispatch(removeMessageReaction({ messageId, emoji, personId })).unwrap();
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    if (personId && messages.length > 0) {
      dispatch(markMessagesAsRead(personId));
    }
  }, [dispatch, personId, messages.length]);

  return {
    messages,
    loading,
    error,
    sendMessage: sendMessageHandler,
    addReaction,
    removeReaction,
    markAsRead
  };
}
