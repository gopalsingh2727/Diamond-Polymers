/**
 * MessageReactions - Message reaction component
 * Allows users to react to messages with emojis (👍❤️😂😮😢🙏🎉🔥)
 * Shows reaction counts and picker
 */

import React, { useState, useRef, useEffect } from 'react';
import { AddReactionIcon } from './icons';
import './MessageReactions.css';

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  userIds: string[];
  userNames: string[];
}

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  currentUserId: string;
  isMyMessage: boolean;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

// Common emoji reactions
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  currentUserId,
  isMyMessage,
  onAddReaction,
  onRemoveReaction,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Group reactions by emoji
  const reactionSummary: ReactionSummary[] = reactions.reduce((acc, reaction) => {
    const existing = acc.find(r => r.emoji === reaction.emoji);
    if (existing) {
      existing.count++;
      existing.userIds.push(reaction.userId);
      existing.userNames.push(reaction.userName);
    } else {
      acc.push({
        emoji: reaction.emoji,
        count: 1,
        userIds: [reaction.userId],
        userNames: [reaction.userName],
      });
    }
    return acc;
  }, [] as ReactionSummary[]);

  // Check if current user reacted with specific emoji
  const hasUserReacted = (emoji: string): boolean => {
    return reactions.some(r => r.emoji === emoji && r.userId === currentUserId);
  };

  // Handle reaction click
  const handleReactionClick = (emoji: string) => {
    if (hasUserReacted(emoji)) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
    setShowPicker(false);
  };

  // Handle add reaction button
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPicker(!showPicker);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  // Format tooltip text
  const getTooltipText = (summary: ReactionSummary): string => {
    if (summary.count === 1) {
      return summary.userNames[0];
    } else if (summary.count === 2) {
      return `${summary.userNames[0]} and ${summary.userNames[1]}`;
    } else {
      return `${summary.userNames[0]} and ${summary.count - 1} others`;
    }
  };

  return (
    <div className={`message-reactions-container ${isMyMessage ? 'my-message' : 'their-message'}`}>
      {/* Existing Reactions */}
      {reactionSummary.length > 0 && (
        <div className="message-reactions-list">
          {reactionSummary.map((summary) => (
            <button
              key={summary.emoji}
              className={`reaction-bubble ${hasUserReacted(summary.emoji) ? 'reacted' : ''}`}
              onClick={() => handleReactionClick(summary.emoji)}
              onMouseEnter={() => setShowTooltip(summary.emoji)}
              onMouseLeave={() => setShowTooltip(null)}
              title={getTooltipText(summary)}
            >
              <span className="reaction-emoji">{summary.emoji}</span>
              <span className="reaction-count">{summary.count}</span>

              {/* Tooltip */}
              {showTooltip === summary.emoji && (
                <div className="reaction-tooltip">
                  {getTooltipText(summary)}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Add Reaction Button */}
      <div className="reaction-picker-wrapper" ref={pickerRef}>
        <button
          className={`add-reaction-btn ${showPicker ? 'active' : ''}`}
          onClick={handleAddClick}
          title="Add reaction"
        >
          <AddReactionIcon width={16} height={16} />
        </button>

        {/* Emoji Picker */}
        {showPicker && (
          <div className={`reaction-picker ${isMyMessage ? 'right-aligned' : 'left-aligned'}`}>
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className={`reaction-picker-emoji ${hasUserReacted(emoji) ? 'selected' : ''}`}
                onClick={() => handleReactionClick(emoji)}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
