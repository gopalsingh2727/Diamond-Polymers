/**
 * CompanyGroupsList - Groups contacts by company
 * Shows company-level stats and conversations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import './CompanyGroupsList.css';

// Icons
const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
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
  companyName?: string;
  companyId?: string;
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

interface CompanyGroupsListProps {
  contacts: Contact[];
  onSelectCompany: (company: CompanyGroup) => void;
  selectedCompanyId?: string;
}

const CompanyGroupsList: React.FC<CompanyGroupsListProps> = ({
  contacts,
  onSelectCompany,
  selectedCompanyId
}) => {
  const [orderStats, setOrderStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Get authentication data
  const getToken = () => localStorage.getItem('authToken') || '';
  const getBranchId = () => localStorage.getItem('selectedBranchId') || localStorage.getItem('selectedBranch') || '';
  const API_BASE = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
  const API_KEY = import.meta.env.VITE_API_KEY || '';

  // Group contacts by company
  const companyGroups = useMemo(() => {
    const groups = new Map<string, CompanyGroup>();

    contacts.forEach(contact => {
      // Determine company - could be from contact data or user's company
      const companyId = contact.companyId || 'unknown';
      const companyName = contact.companyName || contact.userName?.split(' ')[0] + ' Company';

      if (!groups.has(companyId)) {
        // Generate company code from name
        const companyCode = companyName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase())
          .join('')
          .substring(0, 3) + '-' + String(Math.floor(Math.random() * 999)).padStart(3, '0');

        groups.set(companyId, {
          companyId,
          companyName,
          companyCode,
          contacts: [],
          totalChats: 0,
          totalUnread: 0,
          pendingOrders: 0,
          receivedOrders: 0,
          totalOrders: 0
        });
      }

      const group = groups.get(companyId)!;
      group.contacts.push(contact);
      group.totalChats += 1;
      group.totalUnread += contact.unreadCount || 0;
    });

    return Array.from(groups.values()).sort((a, b) =>
      b.totalUnread - a.totalUnread || b.totalChats - a.totalChats
    );
  }, [contacts]);

  // Fetch order stats for each company
  useEffect(() => {
    const fetchOrderStats = async () => {
      setLoading(true);
      const stats: Record<string, any> = {};

      for (const company of companyGroups) {
        try {
          // Aggregate stats for all contacts in this company
          let totalOrders = 0;
          let pendingOrders = 0;
          let receivedOrders = 0;

          for (const contact of company.contacts) {
            // Fetch forwarded orders for this contact
            const forwardedRes = await fetch(
              `${API_BASE}/v2/orders/forwarded-person?personId=${contact.userId}`,
              {
                headers: {
                  'Authorization': `Bearer ${getToken()}`,
                  'x-api-key': API_KEY,
                  'x-selected-branch': getBranchId(),
                },
              }
            );

            if (forwardedRes.ok) {
              const forwardedData = await forwardedRes.json();
              const forwarded = forwardedData.data?.orders || [];
              totalOrders += forwarded.length;
              pendingOrders += forwarded.filter((o: any) =>
                o.status === 'pending' || o.overallStatus === 'pending'
              ).length;
            }

            // Fetch received orders for this contact
            const receivedRes = await fetch(
              `${API_BASE}/v2/orders/received-person?personId=${contact.userId}`,
              {
                headers: {
                  'Authorization': `Bearer ${getToken()}`,
                  'x-api-key': API_KEY,
                  'x-selected-branch': getBranchId(),
                },
              }
            );

            if (receivedRes.ok) {
              const receivedData = await receivedRes.json();
              const received = receivedData.data?.orders || [];
              totalOrders += received.length;
              receivedOrders += received.length;
            }
          }

          stats[company.companyId] = {
            totalOrders,
            pendingOrders,
            receivedOrders
          };
        } catch (error) {
          console.error(`Error fetching stats for company ${company.companyName}:`, error);
          stats[company.companyId] = {
            totalOrders: 0,
            pendingOrders: 0,
            receivedOrders: 0
          };
        }
      }

      setOrderStats(stats);
      setLoading(false);
    };

    if (companyGroups.length > 0) {
      fetchOrderStats();
    }
  }, [companyGroups]);

  // Merge order stats into company groups
  const enrichedCompanyGroups = useMemo(() => {
    return companyGroups.map(company => ({
      ...company,
      totalOrders: orderStats[company.companyId]?.totalOrders || 0,
      pendingOrders: orderStats[company.companyId]?.pendingOrders || 0,
      receivedOrders: orderStats[company.companyId]?.receivedOrders || 0
    }));
  }, [companyGroups, orderStats]);

  return (
    <div className="company-groups-list">
      {enrichedCompanyGroups.length === 0 ? (
        <div className="company-groups-empty">
          <BuildingIcon />
          <p className="empty-title">No Company Connections</p>
          <p className="empty-subtitle">Connect with people from different companies to see them here</p>
        </div>
      ) : (
        enrichedCompanyGroups.map(company => (
          <div
            key={company.companyId}
            className={`company-group-item ${selectedCompanyId === company.companyId ? 'active' : ''}`}
            onClick={() => onSelectCompany(company)}
          >
            <div className="company-avatar">
              <BuildingIcon />
            </div>

            <div className="company-info">
              <div className="company-header">
                <span className="company-name">{company.companyName}</span>
                {company.totalUnread > 0 && (
                  <span className="company-unread-badge">{company.totalUnread}</span>
                )}
              </div>
              <div className="company-code">{company.companyCode}</div>
              <div className="company-stats">
                <span className="stat-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                  {company.totalChats} chats
                </span>
                {company.pendingOrders > 0 && (
                  <span className="stat-item pending">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
                    </svg>
                    {company.pendingOrders} pending
                  </span>
                )}
                {company.receivedOrders > 0 && (
                  <span className="stat-item received">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    {company.receivedOrders} received
                  </span>
                )}
              </div>
            </div>

            <div className="company-arrow">
              <ArrowIcon />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompanyGroupsList;
