/**
 * ChatMessages Component
 * Displays list of chat messages with reactions and typing indicators
 */

import React, { useRef, useEffect } from 'react';
import type { ChatMessagesProps } from '../../types/chat';
import {
  PhoneIcon,
  VideocamIcon,
  CallMissedIcon,
  CallEndIcon,
  InventoryIcon,
  VisibilityIcon,
  CheckCircleIcon,
  CancelIcon,
  ForwardIcon
} from './icons';

export function ChatMessages({
  messages,
  loading,
  typingUsers,
  onAddReaction,
  onRemoveReaction,
  searchQuery,
  currentUserId,
  onViewOrder,
  onAcceptOrder,
  onDenyOrder
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Format timestamp
  const formatTime = (timestamp: Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Highlight search matches
  const highlightText = (text: string, query?: string): React.ReactNode => {
    if (!query || !query.trim()) {
      return text;
    }

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="person-chat-messages">
        <div className="person-chat-loading">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="person-chat-messages">
        <div className="person-chat-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
          <h3>No messages yet</h3>
          <span>Start the conversation by sending a message below</span>
        </div>
      </div>
    );
  }

  // Format call duration
  const formatCallDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  // Render call message
  const renderCallMessage = (message: any) => {
    const isVideo = message.type === 'video_call';
    const isMissed = message.callStatus === 'missed';
    const isRejected = message.callStatus === 'rejected';

    return (
      <div className={`call-message-content ${isMissed ? 'missed-call' : ''}`}>
        <div className="call-message-icon">
          {isMissed ? (
            <CallMissedIcon width={20} height={20} />
          ) : isRejected ? (
            <CallEndIcon width={20} height={20} />
          ) : isVideo ? (
            <VideocamIcon width={20} height={20} />
          ) : (
            <PhoneIcon width={20} height={20} />
          )}
        </div>
        <div className="call-message-details">
          <span className="call-message-type">{message.message}</span>
          {message.callDuration && message.callDuration > 0 && (
            <span className="call-message-duration">
              {formatCallDuration(message.callDuration)}
            </span>
          )}
          {isMissed && <span className="call-message-status">Missed</span>}
          {isRejected && <span className="call-message-status">Not answered</span>}
        </div>
      </div>
    );
  };

  // Render order message
  const renderOrderMessage = (message: any) => {
    const isForwarded = message.type === 'order_forward';
    const orderData = message.orderData;

    if (!orderData) return null;

    const status = orderData.forwardStatus || 'pending';
    const isPending = status === 'pending';
    const isAccepted = status === 'accepted';
    const isDenied = status === 'denied';

    return (
      <div className={`order-message-content ${status}`}>
        <div className="order-message-header">
          <div className="order-message-icon">
            {isForwarded ? (
              <span style={{ color: '#f97316' }}>
                <ForwardIcon width={20} height={20} />
              </span>
            ) : (
              <span style={{ color: '#f97316' }}>
                <InventoryIcon width={20} height={20} />
              </span>
            )}
          </div>
          <div className="order-message-title">
            <span className="order-message-label">
              {isForwarded ? 'Order Forwarded' : 'Order Received'}
            </span>
            <span className="order-message-number">#{orderData.orderNumber}</span>
          </div>
        </div>

        <div className="order-message-body">
          {orderData.customerName && (
            <div className="order-message-row">
              <span className="order-label">Customer:</span>
              <span className="order-value">{orderData.customerName}</span>
            </div>
          )}
          <div className="order-message-row">
            <span className="order-label">Items:</span>
            <span className="order-value">{orderData.itemCount || 0} items</span>
          </div>
          {orderData.orderType && (
            <div className="order-message-row">
              <span className="order-label">Type:</span>
              <span className="order-value">{orderData.orderType}</span>
            </div>
          )}
          <div className="order-message-row">
            <span className="order-label">Status:</span>
            <span className={`order-status-badge status-${status}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        <div className="order-message-actions">
          {onViewOrder && (
            <button
              className="order-action-btn view-btn"
              onClick={() => onViewOrder(orderData.orderId)}
              title="View Order Details"
            >
              <VisibilityIcon width={18} height={18} />
              <span>View</span>
            </button>
          )}

          {!message.isMe && isPending && (
            <>
              {onAcceptOrder && (
                <button
                  className="order-action-btn accept-btn"
                  onClick={() => onAcceptOrder(orderData.orderId)}
                  title="Accept Order"
                >
                  <CheckCircleIcon width={18} height={18} />
                  <span>Accept</span>
                </button>
              )}
              {onDenyOrder && (
                <button
                  className="order-action-btn deny-btn"
                  onClick={() => onDenyOrder(orderData.orderId)}
                  title="Deny Order"
                >
                  <CancelIcon width={18} height={18} />
                  <span>Deny</span>
                </button>
              )}
            </>
          )}

          {isAccepted && (
            <div className="order-status-message accepted">
              <CheckCircleIcon width={16} height={16} />
              <span>Accepted</span>
            </div>
          )}

          {isDenied && (
            <div className="order-status-message denied">
              <CancelIcon width={16} height={16} />
              <span>Denied</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="person-chat-messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`chat-message ${message.isMe ? 'chat-message-me' : 'chat-message-them'} ${
            message.type && (message.type === 'call' || message.type === 'video_call') ? 'chat-message-call' : ''
          }`}
        >
          <div className="chat-message-content">
            {/* Sender name (only for their messages) */}
            {!message.isMe && (
              <span className="chat-message-sender">{message.senderName}</span>
            )}

            {/* Render call message, order message, or regular text message */}
            {message.type && (message.type === 'call' || message.type === 'video_call') ? (
              renderCallMessage(message)
            ) : message.type && (message.type === 'order_forward' || message.type === 'order_received') ? (
              renderOrderMessage(message)
            ) : (
              <p className="chat-message-text">
                {highlightText(message.message, searchQuery)}
              </p>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="message-attachments">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment-item">
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="attachment-image"
                      />
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        📎 {attachment.name}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Timestamp and status */}
            <div className="message-time-wrapper">
              <span className="message-time">{formatTime(message.timestamp)}</span>
              {message.isMe && message.status && (
                <span className={`message-status status-${message.status}`}>
                  {message.status === 'sent' && '✓'}
                  {message.status === 'delivered' && '✓✓'}
                  {message.status === 'read' && '✓✓'}
                  {message.status === 'failed' && '✗'}
                </span>
              )}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="message-reactions">
                {message.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    className={`reaction-bubble ${
                      reaction.userId === currentUserId ? 'my-reaction' : ''
                    }`}
                    onClick={() => {
                      if (reaction.userId === currentUserId) {
                        onRemoveReaction(message.id, reaction.emoji);
                      }
                    }}
                    title={`${reaction.userName}: ${reaction.emoji}`}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">
            {typingUsers[0]} is typing...
          </span>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
