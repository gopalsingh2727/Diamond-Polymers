import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });

  // Get branchId from Redux state or localStorage as fallback
  const { selectedBranch } = useSelector((state: RootState) => state.branches);
  const branchId = selectedBranch?.id?.toString() || selectedBranch?._id || localStorage.getItem('branchId') || '';

  const { dashboard } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    if (branchId) {
      dispatch(getDashboard({ branchId, ...dateRange }));
      dispatch(getReportGroups({ branchId }));
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
      <div className="report-dashboard__header">
         <BackButton/>
        <h1 className="report-dashboard__title">Reports Dashboard</h1>
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
