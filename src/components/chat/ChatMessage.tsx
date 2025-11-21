/**
 * ChatMessage - Individual message bubble
 */

import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  assistantName: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  assistantName
}) => {
  const isUser = role === 'user';
  const time = new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format message content with markdown-like syntax
  const formatContent = (text: string) => {
    // Bold: **text**
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Inline code: `text`
    formatted = formatted.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
        }`}
      >
        {/* Assistant name label */}
        {!isUser && (
          <div className="text-xs font-medium text-orange-500 mb-1">
            {assistantName}
          </div>
        )}

        {/* Message content */}
        <div
          className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-700'}`}
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />

        {/* Timestamp */}
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-white/70' : 'text-gray-400'
          }`}
        >
          {time}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
