/**
 * CompanyDetailView - Shows all contacts within a selected company
 */

import React, { useState } from 'react';
import './CompanyDetailView.css';

// Icons
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
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
}

interface CompanyGroup {
  companyId: string;
  companyName: string;
  companyCode: string;
  contacts: Contact[];
  totalChats: number;
  totalUnread: number;
  pendingOrders: number;
  receivedOrders: number;
  totalOrders: number;
}

interface CompanyDetailViewProps {
  company: CompanyGroup;
  onBack: () => void;
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
}

const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({
  company,
  onBack,
  onSelectContact,
  selectedContactId
}) => {
  const [filterBranch, setFilterBranch] = useState('all');

  // Get unique branches from contacts
  const branches = Array.from(
    new Set(
      company.contacts
        .map(c => c.branchName)
        .filter(Boolean)
    )
  );

  // Filter contacts by branch
  const filteredContacts = company.contacts.filter(contact => {
    if (filterBranch === 'all') return true;
    return contact.branchName === filterBranch;
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
    <div className="company-detail-view">
      {/* Header */}
      <div className="company-detail-header">
        <button className="company-back-button" onClick={onBack}>
          <BackIcon />
        </button>
        <div className="company-detail-title">
          <h3>{company.companyName}</h3>
          <p>{company.contacts.length} conversation{company.contacts.length !== 1 ? 's' : ''} • {company.totalUnread} unread</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="company-stats-cards">
        <div className="stat-card">
          <div className="stat-value">{company.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{company.pendingOrders}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card received">
          <div className="stat-value">{company.receivedOrders}</div>
          <div className="stat-label">Received</div>
        </div>
      </div>

      {/* Branch Filter */}
      {branches.length > 0 && (
        <div className="company-branch-filter">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="branch-select"
          >
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
      )}

      {/* Contacts List */}
      <div className="company-contacts-list">
        {filteredContacts.length === 0 ? (
          <div className="company-contacts-empty">
            <p>No contacts found in this branch</p>
          </div>
        ) : (
          filteredContacts.map(contact => (
            <div
              key={contact._id}
              className={`company-contact-item ${selectedContactId === contact.userId ? 'active' : ''}`}
              onClick={() => onSelectContact(contact)}
            >
              <div className="contact-avatar-wrapper">
                <div className={`contact-avatar ${contact.isOnline ? 'online' : ''}`}>
                  {getInitials(contact.userName)}
                </div>
                {contact.isOnline && <div className="online-indicator"></div>}
              </div>

              <div className="contact-content">
                <div className="contact-header">
                  <span className="contact-name">{contact.userName}</span>
                  <span className="contact-time">
                    {formatTime(contact.lastMessageTime || contact.connectedAt)}
                  </span>
                </div>
                <div className="contact-preview">
                  <p className="contact-message">
                    {contact.lastMessage || 'Start a conversation'}
                  </p>
                  {contact.unreadCount && contact.unreadCount > 0 && (
                    <span className="contact-unread-badge">{contact.unreadCount}</span>
                  )}
                </div>
                {contact.branchName && (
                  <div className="contact-branch">{contact.branchName}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompanyDetailView;
