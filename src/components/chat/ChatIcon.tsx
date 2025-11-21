/**
 * ChatIcon - Floating chat toggle button
 * Orange themed with notification badge
 * Draggable to any position
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';

interface ChatIconProps {
  onClick: () => void;
  hasNotifications: boolean;
  notificationCount: number;
  position?: { x: number; y: number };
  onPositionChange?: (x: number, y: number) => void;
}

const ChatIcon: React.FC<ChatIconProps> = ({
  onClick,
  hasNotifications,
  notificationCount,
  position,
  onPositionChange
}) => {
  const iconRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [iconPosition, setIconPosition] = useState(position || {
    x: typeof window !== 'undefined' ? window.innerWidth - 80 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight - 80 : 0
  });
  const dragStartTime = useRef<number>(0);

  // Sync with external position
  useEffect(() => {
    if (position) {
      setIconPosition(position);
    }
  }, [position]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartTime.current = Date.now();
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && iconRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Boundary constraints
      const maxX = window.innerWidth - 56;
      const maxY = window.innerHeight - 56;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      setIconPosition({ x: boundedX, y: boundedY });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

      // If drag was short (< 200ms), treat as click
      const dragDuration = Date.now() - dragStartTime.current;
      if (dragDuration < 200) {
        onClick();
      } else if (onPositionChange) {
        onPositionChange(iconPosition.x, iconPosition.y);
      }
    }
  }, [isDragging, iconPosition, onClick, onPositionChange]);

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

  return (
    <button
      ref={iconRef}
      onMouseDown={handleMouseDown}
      className={`fixed z-50 w-14 h-14 rounded-full shadow-lg
                 flex items-center justify-center transition-shadow duration-200
                 hover:shadow-xl focus:outline-none focus:ring-4
                 focus:ring-orange-300 ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'}`}
      style={{
        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
        left: iconPosition.x,
        top: iconPosition.y,
        transform: isDragging ? 'scale(1.1)' : 'scale(1)'
      }}
      aria-label="Open chat"
    >
      {/* Chat bubble icon */}
      <svg
        className="w-7 h-7 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Notification badge */}
      {hasNotifications && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white
                        text-xs font-bold rounded-full flex items-center justify-center
                        animate-pulse">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  );
};

export default ChatIcon;
