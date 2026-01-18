/**
 * MessagesList - Company Chat/Messages Interface
 * Shows all conversations with contacts
 */

import React, { useState } from 'react';
import ConnectionManagement from './ConnectionManagement';
import CompanyGroupsList from './CompanyGroupsList';
import CompanyDetailView from './CompanyDetailView';
import './MessagesList.css';

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);

const AddContactIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

interface Contact {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: string;
  connectedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  branchName?: string;
  companyId?: string;
  companyName?: string;
}

interface MessagesListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
  loading?: boolean;
}

const MessagesList: React.FC<MessagesListProps> = ({
  contacts,
  onSelectContact,
  selectedContactId,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'company'>('all');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      contact.userName?.toLowerCase().includes(term) ||
      contact.userEmail?.toLowerCase().includes(term)
    );
  });

  // Get initials from name
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format time
  const formatTime = (timestamp: string): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="messages-list-container">
      {/* Header */}
      <div className="messages-list-header">
        <div className="messages-list-header-content">
          <div>
            <h2 className="messages-list-title">Messages</h2>
            <p className="messages-list-subtitle">Messages and conversations</p>
          </div>
          <button
            className="add-contact-button"
            onClick={() => setShowConnectionModal(true)}
            title="Add new contact"
          >
            <AddContactIcon />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="messages-search-bar">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="messages-search-input"
        />
      </div>

      {/* Branch Filter */}
      <div className="messages-branch-filter">
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="branch-select"
        >
          <option value="all">All Branches</option>
          <option value="main">Main Office</option>
          <option value="downtown">Downtown Branch</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="messages-tabs">
        <button
          className={`messages-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Chats
        </button>
        <button
          className={`messages-tab ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          Company Chats
        </button>
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {activeTab === 'all' ? (
          // All Chats Tab - Individual Contacts
          loading ? (
            <div className="messages-loading">
              <div className="spinner-small"></div>
              <p>Loading conversations...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="messages-empty">
              <MessageIcon />
              <p className="empty-title">VizOrder Connect</p>
              <p className="empty-subtitle">Select a chat to start messaging</p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div
                key={contact._id}
                className={`conversation-item ${selectedContactId === contact.userId ? 'active' : ''}`}
                onClick={() => onSelectContact(contact)}
              >
                <div className="conversation-avatar-wrapper">
                  <div className={`conversation-avatar ${contact.isOnline ? 'online' : ''}`}>
                    {getInitials(contact.userName)}
                  </div>
                  {contact.isOnline && <div className="online-indicator"></div>}
                </div>

                <div className="conversation-content">
                  <div className="conversation-header">
                    <span className="conversation-name">{contact.userName}</span>
                    <span className="conversation-time">
                      {formatTime(contact.lastMessageTime || contact.connectedAt)}
                    </span>
                  </div>
                  <div className="conversation-preview">
                    <p className="conversation-message">
                      {contact.lastMessage || 'Start a conversation'}
                    </p>
                    {contact.unreadCount && contact.unreadCount > 0 && (
                      <span className="unread-badge">{contact.unreadCount}</span>
                    )}
                  </div>
                  {contact.userRole && (
                    <div className="conversation-branch">
                      {contact.userRole}
                    </div>
                  )}
                </div>
              </div>
            ))
          )
        ) : selectedCompany ? (
          // Company Detail View - Show contacts within selected company
          <CompanyDetailView
            company={selectedCompany}
            onBack={() => setSelectedCompany(null)}
            onSelectContact={onSelectContact}
            selectedContactId={selectedContactId}
          />
        ) : (
          // Company Chats Tab - Grouped by Company
          <CompanyGroupsList
            contacts={contacts}
            onSelectCompany={(company) => setSelectedCompany(company)}
            selectedCompanyId={selectedCompany?.companyId}
          />
        )}
      </div>

      {/* Connection Management Modal */}
      {showConnectionModal && (
        <div className="connection-modal-overlay" onClick={() => setShowConnectionModal(false)}>
          <div className="connection-modal-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="connection-modal-header">
              <h3>Connection Management</h3>
              <button
                className="connection-modal-close"
                onClick={() => setShowConnectionModal(false)}
              >
                ×
              </button>
            </div>
            <ConnectionManagement
              onClose={() => setShowConnectionModal(false)}
              onOpenChat={(personId) => {
                // Find the contact and select it
                const contact = contacts.find(c => c.userId === personId);
                if (contact) {
                  onSelectContact(contact);
                }
                setShowConnectionModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesList;
