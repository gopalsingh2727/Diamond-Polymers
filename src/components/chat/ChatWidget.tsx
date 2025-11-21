/**
 * ChatWidget - Main draggable chat container
 * Orange themed chat agent with voice support
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleChat,
  closeChat,
  minimizeChat,
  maximizeChat,
  setPosition
} from '../../componest/redux/chat/chatSlice';
import {
  loadChatSettings,
  loadChatHistory,
  loadReminders,
  checkDueReminders,
  updateChatPosition
} from '../../componest/redux/chat/chatActions';
import ChatWindow from './ChatWindow';
import ChatIcon from './ChatIcon';

interface RootState {
  chat: {
    isOpen: boolean;
    isMinimized: boolean;
    settings: any;
    position: { x: number; y: number } | null;
    dueReminders: any[];
  };
}

const ChatWidget: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, isMinimized, settings, position, dueReminders } = useSelector(
    (state: RootState) => state.chat
  );

  const widgetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [iconPosition, setIconPosition] = useState<{ x: number; y: number } | null>(null);
  const reminderCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Handle icon position change
  const handleIconPositionChange = useCallback((x: number, y: number) => {
    setIconPosition({ x, y });
    // Optionally save to server
    dispatch(updateChatPosition(x, y) as any);
  }, [dispatch]);

  // Initialize chat
  useEffect(() => {
    dispatch(loadChatSettings() as any);
    dispatch(loadChatHistory() as any);
    dispatch(loadReminders() as any);

    // Check for due reminders every minute
    reminderCheckInterval.current = setInterval(() => {
      dispatch(checkDueReminders() as any);
    }, 60000);

    // Initial check
    dispatch(checkDueReminders() as any);

    return () => {
      if (reminderCheckInterval.current) {
        clearInterval(reminderCheckInterval.current);
      }
    };
  }, [dispatch]);

  // Show notification for due reminders
  useEffect(() => {
    if (dueReminders.length > 0) {
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        dueReminders.forEach(reminder => {
          new Notification(`${settings?.assistantName || 'Reminder'}`, {
            body: reminder.title,
            icon: '/chat-icon.png'
          });
        });
      }
    }
  }, [dueReminders, settings?.assistantName]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (widgetRef.current && !isMinimized) {
      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  }, [isMinimized]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && widgetRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Boundary constraints
      const maxX = window.innerWidth - widgetRef.current.offsetWidth;
      const maxY = window.innerHeight - widgetRef.current.offsetHeight;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      dispatch(setPosition({ x: boundedX, y: boundedY }));
    }
  }, [isDragging, dragOffset, dispatch]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && position) {
      setIsDragging(false);
      // Save position to server
      dispatch(updateChatPosition(position.x, position.y) as any);
    }
  }, [isDragging, position, dispatch]);

  // Add global mouse listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Check if chat is enabled
  if (settings && !settings.isEnabled) {
    return null;
  }

  // Default position if not set
  const widgetPosition = position || {
    x: window.innerWidth - 420,
    y: window.innerHeight - 600
  };

  return (
    <>
      {/* Chat Toggle Icon - Draggable */}
      {!isOpen && (
        <ChatIcon
          onClick={() => dispatch(toggleChat())}
          hasNotifications={dueReminders.length > 0}
          notificationCount={dueReminders.length}
          position={iconPosition || undefined}
          onPositionChange={handleIconPositionChange}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={widgetRef}
          className={`fixed z-50 transition-all duration-200 ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          style={{
            left: isMinimized ? 'auto' : widgetPosition.x,
            top: isMinimized ? 'auto' : widgetPosition.y,
            right: isMinimized ? 20 : 'auto',
            bottom: isMinimized ? 20 : 'auto'
          }}
        >
          <ChatWindow
            isMinimized={isMinimized}
            onClose={() => dispatch(closeChat())}
            onMinimize={() => dispatch(minimizeChat())}
            onMaximize={() => dispatch(maximizeChat())}
            onDragStart={handleMouseDown}
            isDragging={isDragging}
            assistantName={settings?.assistantName || 'Assistant'}
            voiceGender={settings?.voiceGender || 'female'}
          />
        </div>
      )}
    </>
  );
};

export default ChatWidget;
