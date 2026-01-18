/**
 * ChatInput Component
 * Handles message composition, emoji, and attachments
 */

import React, { useState, useRef } from 'react';
import { SendIcon, AttachFileIcon, EmojiEmotionsIcon } from './icons';
import type { ChatInputProps } from '../../types/chat';

export function ChatInput({
  value,
  onChange,
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Message...',
  onAttachFile,
  onSelectEmoji
}: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Common emojis
  const commonEmojis = [
    '😀', '😂', '😊', '😍', '🥰', '😎', '🤔', '😅',
    '👍', '👎', '👏', '🙌', '🤝', '💪', '✨', '🎉',
    '❤️', '💯', '🔥', '⭐', '✅', '❌', '⚡', '💡'
  ];

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    onTyping();
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
      setShowEmojiPicker(false);
      inputRef.current?.focus();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    if (onSelectEmoji) {
      onSelectEmoji(emoji);
    } else {
      onChange(value + emoji);
    }
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleAttachClick = () => {
    if (onAttachFile) {
      onAttachFile();
    }
    inputRef.current?.focus();
  };

  return (
    <div className="person-chat-input-wrapper">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-picker-header">
            <span>Pick an emoji</span>
            <button
              className="emoji-picker-close"
              onClick={() => setShowEmojiPicker(false)}
            >
              ×
            </button>
          </div>
          <div className="emoji-grid">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                className="emoji-btn"
                onClick={() => handleEmojiClick(emoji)}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="person-chat-input">
        {/* Emoji Button */}
        <button
          className="input-action-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Add emoji"
          aria-label="Add emoji"
          type="button"
        >
          <EmojiEmotionsIcon width={24} height={24} />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Type your message"
        />

        {/* Attach File Button */}
        {onAttachFile && (
          <button
            className="input-action-btn"
            onClick={handleAttachClick}
            title="Attach file"
            aria-label="Attach file"
            type="button"
          >
            <AttachFileIcon width={24} height={24} />
          </button>
        )}

        {/* Send Button */}
        <button
          className="person-chat-send"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          title="Send message"
          aria-label="Send message"
          type="button"
        >
          <SendIcon width={24} height={24} />
        </button>
      </div>
    </div>
  );
}
