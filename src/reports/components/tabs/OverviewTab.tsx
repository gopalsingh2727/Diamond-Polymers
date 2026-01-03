import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../componest/redux/rootReducer';
import { AppDispatch } from '../../../store';
import { exportExcel } from '../../../componest/redux/reports/reportActions';

interface OverviewTabProps {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
}

const OverviewTab: React.FC<OverviewTabProps> = ({ dateRange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const branchId = localStorage.getItem('selectedBranch') || localStorage.getItem('branchId') || localStorage.getItem('selectedBranchId') || '';
  const { dashboard, exporting } = useSelector((state: RootState) => state.reports);

  const handleExport = () => {
    dispatch(exportExcel({
      reportType: 'status',
      branchId,
      ...dateRange
    }));
  };

  const data = dashboard.data;
  if (!data) {
    return <div className="report-empty">No data available</div>;
  }

  const { summary, byStatus, byOrderType, byCategory } = data;

  return (
    <div className="overview-tab">
      {/* Summary Cards */}
      <div className="report-summary-cards">
        <div className="report-summary-card">
          <div className="report-summary-card__value">{summary?.totalOrders || 0}</div>
          <div className="report-summary-card__label">Total Orders</div>
        </div>
        <div className="report-summary-card report-summary-card--completed">
          <div className="report-summary-card__value">{summary?.completed || 0}</div>
          <div className="report-summary-card__label">Completed</div>
        </div>
        <div className="report-summary-card report-summary-card--pending">
          <div className="report-summary-card__value">{summary?.pending + summary?.waitForApproval || 0}</div>
          <div className="report-summary-card__label">Pending</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-card__value">{summary?.inProgress || 0}</div>
          <div className="report-summary-card__label">In Progress</div>
        </div>
        <div className="report-summary-card report-summary-card--issues">
          <div className="report-summary-card__value">{summary?.issues || 0}</div>
          <div className="report-summary-card__label">Issues</div>
        </div>
      </div>

      {/* Charts */}
      <div className="report-charts">
        <div className="report-chart">
          <div className="report-chart__title">Orders by Status</div>
          {byStatus && byStatus.length > 0 ? (
            <div className="status-chart">
              {byStatus.map((item: any) => {
                const percentage = summary?.totalOrders > 0
                  ? ((item.count / summary.totalOrders) * 100).toFixed(1)
                  : 0;
                return (
                  <div key={item.status} className="status-bar">
                    <div className="status-bar__label" style={{ width: '150px' }}>
                      {item.status}
                    </div>
                    <div className="status-bar__fill" style={{
                      width: `${percentage}%`,
                      backgroundColor: getStatusColor(item.status)
                    }} />
                    <div className="status-bar__value">{item.count} ({percentage}%)</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="report-empty">No status data</div>
          )}
        </div>

        <div className="report-chart">
          <div className="report-chart__title">Orders by Category</div>
          {byCategory && byCategory.length > 0 ? (
            <div className="category-chart">
              {byCategory.map((item: any) => {
                const maxCount = Math.max(...byCategory.map((c: any) => c.count));
                const percentage = maxCount > 0 ? ((item.count / maxCount) * 100) : 0;
                return (
                  <div key={item.category} className="status-bar">
                    <div className="status-bar__label" style={{ width: '100px' }}>
                      {item.category}
                    </div>
                    <div className="status-bar__fill" style={{
                      width: `${percentage}%`,
                      backgroundColor: getCategoryColor(item.category)
                    }} />
                    <div className="status-bar__value">{item.count}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="report-empty">No category data</div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          className="report-export-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {/* Order Types Table */}
      {byOrderType && byOrderType.length > 0 && (
        <div className="report-table-container">
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Orders by Order Type</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Order Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {byOrderType.map((item: any, index: number) => (
                <tr key={item.orderTypeId}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
              <tr className="report-table__formula-row">
                <td colSpan={2} className="report-table__formula-label">SUM</td>
                <td>{byOrderType.reduce((sum: number, item: any) => sum + item.count, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'completed': '#22c55e',
    'pending': '#eab308',
    'in_progress': '#3b82f6',
    'issue': '#ef4444',
    'cancelled': '#94a3b8',
    'dispatched': '#10b981',
    'approved': '#6366f1',
    'Wait for Approval': '#f97316',
  };
  return colors[status] || '#94a3b8';
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'product': '#3b82f6',
    'material': '#10b981',
    'printing': '#8b5cf6',
    'packaging': '#f59e0b',
  };
  return colors[category] || '#94a3b8';
};

export default OverviewTab;
