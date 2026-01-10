/**
 * CallHistory - Call log with history of all calls (incoming, outgoing, missed)
 * Shows call duration, timestamps, and allows callback
 */

import React, { useState, useEffect } from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Calendar } from 'lucide-react';
import './CallHistory.css';

export interface CallRecord {
  id: string;
  personId: string;
  personName: string;
  callType: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'rejected' | 'failed';
  duration: number; // in seconds
  timestamp: Date;
}

interface CallHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onCallPerson: (personId: string, personName: string, callType: 'audio' | 'video') => void;
}

const CallHistory: React.FC<CallHistoryProps> = ({ isOpen, onClose, onCallPerson }) => {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'missed' | 'incoming' | 'outgoing'>('all');
  const [loading, setLoading] = useState(false);

  // Load call history from localStorage and API
  useEffect(() => {
    if (isOpen) {
      loadCallHistory();
    }
  }, [isOpen]);

  const loadCallHistory = async () => {
    setLoading(true);
    try {
      // Load from localStorage first (instant)
      const localHistory = localStorage.getItem('callHistory');
      if (localHistory) {
        const parsed = JSON.parse(localHistory);
        // Convert timestamp strings back to Date objects
        const records = parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
        setCallRecords(records);
      }

      // Then fetch from API (if available)
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

      const response = await fetch(`${baseUrl}/v2/call/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': import.meta.env.VITE_API_KEY || ''
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const records = result.data.map((r: any) => ({
            ...r,
            timestamp: new Date(r.timestamp)
          }));
          setCallRecords(records);
          // Update localStorage
          localStorage.setItem('callHistory', JSON.stringify(result.data));
        }
      }
    } catch (error) {
      console.error('[CallHistory] Error loading history:', error);
      // Continue with localStorage data if API fails
    } finally {
      setLoading(false);
    }
  };

  // Filter records based on selected filter
  const filteredRecords = callRecords.filter(record => {
    if (filter === 'all') return true;
    if (filter === 'missed') return record.status === 'missed' || record.status === 'rejected';
    if (filter === 'incoming') return record.direction === 'incoming' && record.status === 'completed';
    if (filter === 'outgoing') return record.direction === 'outgoing' && record.status === 'completed';
    return true;
  });

  // Group records by date
  const groupedRecords = filteredRecords.reduce((groups, record) => {
    const dateKey = formatDateKey(record.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(record);
    return groups;
  }, {} as Record<string, CallRecord[]>);

  // Format date key for grouping
  function formatDateKey(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  // Format call duration
  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Format time
  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // Get call icon and color based on call details
  function getCallIconAndColor(record: CallRecord) {
    if (record.status === 'missed' || record.status === 'rejected') {
      return { icon: PhoneMissed, color: '#ef4444', label: 'Missed' };
    }
    if (record.direction === 'incoming') {
      return { icon: PhoneIncoming, color: '#10b981', label: 'Incoming' };
    }
    return { icon: PhoneOutgoing, color: '#3b82f6', label: 'Outgoing' };
  }

  // Handle call back
  const handleCallBack = (record: CallRecord) => {
    onCallPerson(record.personId, record.personName, record.callType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="call-history-overlay" onClick={onClose}>
      <div className="call-history-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="call-history-header">
          <div className="call-history-title">
            <Phone size={20} />
            <h3>Call History</h3>
          </div>
          <button className="call-history-close" onClick={onClose}>×</button>
        </div>

        {/* Filters */}
        <div className="call-history-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'missed' ? 'active' : ''}`}
            onClick={() => setFilter('missed')}
          >
            Missed
          </button>
          <button
            className={`filter-btn ${filter === 'incoming' ? 'active' : ''}`}
            onClick={() => setFilter('incoming')}
          >
            Incoming
          </button>
          <button
            className={`filter-btn ${filter === 'outgoing' ? 'active' : ''}`}
            onClick={() => setFilter('outgoing')}
          >
            Outgoing
          </button>
        </div>

        {/* Call Records */}
        <div className="call-history-list">
          {loading ? (
            <div className="call-history-loading">
              <div className="loading-spinner"></div>
              <p>Loading call history...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="call-history-empty">
              <Phone size={48} />
              <p>No calls yet</p>
              <span>Your call history will appear here</span>
            </div>
          ) : (
            Object.entries(groupedRecords).map(([dateKey, records]) => (
              <div key={dateKey} className="call-history-group">
                {/* Date header */}
                <div className="date-header">
                  <Calendar size={14} />
                  <span>{dateKey}</span>
                </div>

                {/* Call records for this date */}
                {records.map((record) => {
                  const { icon: CallIcon, color, label } = getCallIconAndColor(record);

                  return (
                    <div key={record.id} className="call-record">
                      {/* Call icon */}
                      <div className="call-icon" style={{ backgroundColor: `${color}20` }}>
                        <CallIcon size={18} style={{ color }} />
                      </div>

                      {/* Call details */}
                      <div className="call-details">
                        <div className="call-person-name">{record.personName}</div>
                        <div className="call-meta">
                          <span className="call-type-badge">
                            {record.callType === 'video' ? (
                              <><Video size={12} /> Video</>
                            ) : (
                              <><Phone size={12} /> Audio</>
                            )}
                          </span>
                          <span className="call-direction" style={{ color }}>
                            {label}
                          </span>
                          <span className="call-time">
                            <Clock size={12} />
                            {formatTime(record.timestamp)}
                          </span>
                          {record.status === 'completed' && (
                            <span className="call-duration">
                              {formatDuration(record.duration)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Call back buttons */}
                      <div className="call-actions">
                        <button
                          className="call-back-btn audio"
                          onClick={() => handleCallBack({ ...record, callType: 'audio' })}
                          title="Audio Call"
                        >
                          <Phone size={16} />
                        </button>
                        <button
                          className="call-back-btn video"
                          onClick={() => handleCallBack({ ...record, callType: 'video' })}
                          title="Video Call"
                        >
                          <Video size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CallHistory;
