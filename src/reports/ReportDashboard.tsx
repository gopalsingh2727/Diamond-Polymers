import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../componest/redux/rootReducer';
import { AppDispatch } from '../store';
import { getDashboard } from '../componest/redux/reports/reportActions';
import { getReportGroups } from '../componest/redux/reportGroups/reportGroupActions';
import OverviewTab from './components/tabs/OverviewTab';
import GroupsTab from './components/tabs/GroupsTab';
import OrderTypeTab from './components/tabs/OrderTypeTab';
import CategoryTab from './components/tabs/CategoryTab';
import OptionSystemTab from './components/tabs/OptionSystemTab';
import StatusTab from './components/tabs/StatusTab';
import AllOrdersTab from './components/tabs/AllOrdersTab';
import './styles/ReportDashboard.css';
import { BackButton } from '../componest/allCompones/BackButton';

type TabType = 'overview' | 'groups' | 'orderTypes' | 'categories' | 'options' | 'status' | 'allOrders';

const ReportDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });

  // Get branchId from localStorage
  const branchId = localStorage.getItem('selectedBranch') ||
                   localStorage.getItem('branchId') ||
                   localStorage.getItem('selectedBranchId') ||
                   '';

  const { dashboard } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    console.log('=== REPORTS DEBUG ===');
    console.log('branchId:', branchId);
    console.log('dateRange:', dateRange);
    console.log('selectedBranch from localStorage:', localStorage.getItem('selectedBranch'));
    console.log('branchId from localStorage:', localStorage.getItem('branchId'));
    console.log('selectedBranchId from localStorage:', localStorage.getItem('selectedBranchId'));
    console.log('=====================');

    if (branchId) {
      dispatch(getDashboard({ branchId, ...dateRange }));
      dispatch(getReportGroups({ branchId }));
    } else {
      console.error('No branchId found! Reports cannot load without a branch ID.');
    }
  }, [dispatch, branchId, dateRange.fromDate, dateRange.toDate]);

  const handleDateChange = (field: 'fromDate' | 'toDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    if (branchId) {
      dispatch(getDashboard({ branchId, ...dateRange }));
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'allOrders', label: 'All Orders' },
    { key: 'groups', label: 'Groups' },
    { key: 'orderTypes', label: 'Order Types' },
    { key: 'categories', label: 'Categories' },
    { key: 'options', label: 'Options' },
    { key: 'status', label: 'Status' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab dateRange={dateRange} />;
      case 'allOrders':
        return <AllOrdersTab dateRange={dateRange} />;
      case 'groups':
        return <GroupsTab dateRange={dateRange} />;
      case 'orderTypes':
        return <OrderTypeTab dateRange={dateRange} />;
      case 'categories':
        return <CategoryTab dateRange={dateRange} />;
      case 'options':
        return <OptionSystemTab dateRange={dateRange} />;
      case 'status':
        return <StatusTab dateRange={dateRange} />;
      default:
        return <OverviewTab dateRange={dateRange} />;
    }
  };

  return (
    <div className="report-dashboard">
      {/* Debug Info - Remove after testing */}
      {!branchId && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #ef4444',
          padding: '12px',
          margin: '12px',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          <strong>⚠️ No Branch ID Found!</strong>
          <div>selectedBranch: {localStorage.getItem('selectedBranch') || 'null'}</div>
          <div>branchId: {localStorage.getItem('branchId') || 'null'}</div>
          <div>selectedBranchId: {localStorage.getItem('selectedBranchId') || 'null'}</div>
        </div>
      )}
      {branchId && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #10b981',
          padding: '8px 12px',
          margin: '12px',
          borderRadius: '8px',
          color: '#065f46',
          fontSize: '13px'
        }}>
          ✓ Branch ID: {branchId}
        </div>
      )}
      <div className="report-dashboard__header">
         <BackButton/>
        <h1 className="report-dashboard__title">Reports Dashboard</h1>
        <button
          className="report-dashboard__custom-btn"
          onClick={() => navigate('/menu/reports/viewer')}
        >
          Custom Reports
        </button>
        <div className="report-dashboard__actions">
          <div className="report-dashboard__date-filters">
            <div className="report-dashboard__date-field">
              <label>From:</label>
              <input
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => handleDateChange('fromDate', e.target.value)}
              />
            </div>
            <div className="report-dashboard__date-field">
              <label>To:</label>
              <input
                type="date"
                value={dateRange.toDate}
                onChange={(e) => handleDateChange('toDate', e.target.value)}
              />
            </div>
            <button className="report-dashboard__apply-btn" onClick={handleApplyFilters}>
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="report-dashboard__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`report-dashboard__tab ${activeTab === tab.key ? 'report-dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="report-dashboard__content">
        {dashboard.loading ? (
          <div className="report-dashboard__loading">Loading...</div>
        ) : (
          renderTab()
        )}
      </div>
    </div>
  );
};

export default ReportDashboard;
