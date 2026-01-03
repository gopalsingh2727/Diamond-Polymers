import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../componest/redux/rootReducer';
import { AppDispatch } from '../../../store';
import { getStatusReport, exportExcel } from '../../../componest/redux/reports/reportActions';
import OrdersListModal from '../OrdersListModal';

interface StatusTabProps {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
}

const StatusTab: React.FC<StatusTabProps> = ({ dateRange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const branchId = localStorage.getItem('selectedBranch') || localStorage.getItem('branchId') || localStorage.getItem('selectedBranchId') || '';
  const { statusReport, exporting } = useSelector((state: RootState) => state.reports);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);

  useEffect(() => {
    if (branchId) {
      dispatch(getStatusReport({ branchId, ...dateRange }));
    }
  }, [dispatch, branchId, dateRange.fromDate, dateRange.toDate]);

  const handleExport = () => {
    dispatch(exportExcel({
      reportType: 'status',
      branchId,
      ...dateRange
    }));
  };

  const data = statusReport.data;

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

  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      'completed': '✓',
      'pending': '⏳',
      'in_progress': '🔄',
      'issue': '⚠️',
      'cancelled': '✕',
      'dispatched': '🚚',
      'approved': '👍',
      'Wait for Approval': '⏰',
    };
    return icons[status] || '📋';
  };

  const formatStatusName = (status: string): string => {
    const names: Record<string, string> = {
      'completed': 'Completed',
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'issue': 'Issues',
      'cancelled': 'Cancelled',
      'dispatched': 'Dispatched',
      'approved': 'Approved',
      'Wait for Approval': 'Wait for Approval',
    };
    return names[status] || status;
  };

  // Calculate totals
  const calculateFormulas = (items: any[]) => {
    if (!items || items.length === 0) {
      return { sum: 0, average: 0, count: 0, min: 0, max: 0, sqrt: 0 };
    }
    const counts = items.map((item) => item.count);
    const sum = counts.reduce((a, b) => a + b, 0);
    return {
      sum,
      average: sum / counts.length,
      count: counts.length,
      min: Math.min(...counts),
      max: Math.max(...counts),
      sqrt: Math.sqrt(sum),
    };
  };

  const formulas = data ? calculateFormulas(data.byStatus || []) : null;

  // Sort status for better display
  const statusOrder = [
    'Wait for Approval',
    'pending',
    'approved',
    'in_progress',
    'completed',
    'dispatched',
    'issue',
    'cancelled'
  ];

  const sortedByStatus = data?.byStatus?.slice().sort((a: any, b: any) => {
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  }) || [];

  const handleStatusClick = (status: any) => {
    setSelectedStatus(status);
    setModalOpen(true);
  };

  return (
    <div className="status-tab">
      <div className="tab-header">
        <h2>Orders by Status</h2>
        <button
          className="report-export-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {statusReport.loading ? (
        <div className="loading">Loading status report...</div>
      ) : !data || !data.byStatus || data.byStatus.length === 0 ? (
        <div className="report-empty">No status data available</div>
      ) : (
        <>
          {/* Status Summary Cards */}
          <div className="status-summary-cards">
            {sortedByStatus.map((item: any) => (
              <div
                key={item.status}
                className="status-summary-card"
                style={{ borderColor: getStatusColor(item.status), cursor: 'pointer' }}
                onClick={() => handleStatusClick(item)}
              >
                <div
                  className="status-summary-card__icon"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  {getStatusIcon(item.status)}
                </div>
                <div className="status-summary-card__info">
                  <div className="status-summary-card__count">{item.count}</div>
                  <div className="status-summary-card__name">{formatStatusName(item.status)}</div>
                </div>
                <div className="status-summary-card__percentage">
                  {data.total > 0
                    ? ((item.count / data.total) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            ))}
          </div>

          {/* Status Flow Visualization */}
          <div className="status-flow">
            <h3>Order Status Flow</h3>
            <div className="status-flow-diagram">
              <div className="flow-step">
                <div
                  className="flow-box"
                  style={{ backgroundColor: getStatusColor('Wait for Approval'), cursor: 'pointer' }}
                  onClick={() => handleStatusClick(data.byStatus.find((s: any) => s.status === 'Wait for Approval'))}
                >
                  <span className="flow-count">
                    {data.byStatus.find((s: any) => s.status === 'Wait for Approval')?.count || 0}
                  </span>
                  <span className="flow-label">Wait for Approval</span>
                </div>
              </div>
              <div className="flow-arrow">&rarr;</div>
              <div className="flow-step">
                <div
                  className="flow-box"
                  style={{ backgroundColor: getStatusColor('pending'), cursor: 'pointer' }}
                  onClick={() => handleStatusClick(data.byStatus.find((s: any) => s.status === 'pending'))}
                >
                  <span className="flow-count">
                    {data.byStatus.find((s: any) => s.status === 'pending')?.count || 0}
                  </span>
                  <span className="flow-label">Pending</span>
                </div>
              </div>
              <div className="flow-arrow">&rarr;</div>
              <div className="flow-step">
                <div
                  className="flow-box"
                  style={{ backgroundColor: getStatusColor('approved'), cursor: 'pointer' }}
                  onClick={() => handleStatusClick(data.byStatus.find((s: any) => s.status === 'approved'))}
                >
                  <span className="flow-count">
                    {data.byStatus.find((s: any) => s.status === 'approved')?.count || 0}
                  </span>
                  <span className="flow-label">Approved</span>
                </div>
              </div>
              <div className="flow-arrow">&rarr;</div>
              <div className="flow-step">
                <div
                  className="flow-box"
                  style={{ backgroundColor: getStatusColor('in_progress'), cursor: 'pointer' }}
                  onClick={() => handleStatusClick(data.byStatus.find((s: any) => s.status === 'in_progress'))}
                >
                  <span className="flow-count">
                    {data.byStatus.find((s: any) => s.status === 'in_progress')?.count || 0}
                  </span>
                  <span className="flow-label">In Progress</span>
                </div>
              </div>
              <div className="flow-arrow">&rarr;</div>
              <div className="flow-step">
                <div
                  className="flow-box"
                  style={{ backgroundColor: getStatusColor('completed'), cursor: 'pointer' }}
                  onClick={() => handleStatusClick(data.byStatus.find((s: any) => s.status === 'completed'))}
                >
                  <span className="flow-count">
                    {data.byStatus.find((s: any) => s.status === 'completed')?.count || 0}
                  </span>
                  <span className="flow-label">Completed</span>
                </div>
              </div>
              <div className="flow-arrow">&rarr;</div>
              <div className="flow-step">
                <div
                  className="flow-box"
                  style={{ backgroundColor: getStatusColor('dispatched'), cursor: 'pointer' }}
                  onClick={() => handleStatusClick(data.byStatus.find((s: any) => s.status === 'dispatched'))}
                >
                  <span className="flow-count">
                    {data.byStatus.find((s: any) => s.status === 'dispatched')?.count || 0}
                  </span>
                  <span className="flow-label">Dispatched</span>
                </div>
              </div>
            </div>
            <div className="status-exceptions">
              <div
                className="exception-box"
                style={{ borderColor: getStatusColor('issue'), cursor: 'pointer' }}
                onClick={() => handleStatusClick(data.byStatus.find((s: any) => s.status === 'issue'))}
              >
                <span className="exception-icon">{getStatusIcon('issue')}</span>
                <span className="exception-count">
                  {data.byStatus.find((s: any) => s.status === 'issue')?.count || 0}
                </span>
                <span className="exception-label">Issues</span>
              </div>
              <div
                className="exception-box"
                style={{ borderColor: getStatusColor('cancelled'), cursor: 'pointer' }}
                onClick={() => handleStatusClick(data.byStatus.find((s: any) => s.status === 'cancelled'))}
              >
                <span className="exception-icon">{getStatusIcon('cancelled')}</span>
                <span className="exception-count">
                  {data.byStatus.find((s: any) => s.status === 'cancelled')?.count || 0}
                </span>
                <span className="exception-label">Cancelled</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="report-chart">
            <div className="report-chart__title">Status Distribution</div>
            <div className="bar-chart">
              {sortedByStatus.map((item: any) => {
                const maxCount = Math.max(...data.byStatus.map((s: any) => s.count));
                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={item.status}
                    className="status-bar"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleStatusClick(item)}
                  >
                    <div className="status-bar__label" style={{ width: '140px' }}>
                      {formatStatusName(item.status)}
                    </div>
                    <div
                      className="status-bar__fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getStatusColor(item.status),
                      }}
                    />
                    <div className="status-bar__value">{item.count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Table */}
          <div className="report-table-container">
            <h3>Status Details</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {sortedByStatus.map((item: any, index: number) => (
                  <tr
                    key={item.status}
                    onClick={() => handleStatusClick(item)}
                    style={{ cursor: 'pointer' }}
                    className="clickable-row"
                  >
                    <td>{index + 1}</td>
                    <td>
                      <div className="status-cell">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(item.status) }}
                        >
                          {getStatusIcon(item.status)}
                        </span>
                        {formatStatusName(item.status)}
                      </div>
                    </td>
                    <td>{item.count}</td>
                    <td>
                      {data.total > 0
                        ? ((item.count / data.total) * 100).toFixed(1)
                        : 0}%
                    </td>
                    <td>{item.totalQuantity || 0}</td>
                  </tr>
                ))}
                {/* Formula Rows */}
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">SUM</td>
                  <td>{formulas?.sum}</td>
                  <td>100%</td>
                  <td></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">AVERAGE</td>
                  <td>{formulas?.average.toFixed(2)}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">COUNT</td>
                  <td>{formulas?.count}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">MIN</td>
                  <td>{formulas?.min}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">MAX</td>
                  <td>{formulas?.max}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">SQRT</td>
                  <td>{formulas?.sqrt.toFixed(2)}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Orders List Modal */}
      {selectedStatus && (
        <OrdersListModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`${formatStatusName(selectedStatus.status)} Orders`}
          filters={{
            branchId,
            status: selectedStatus.status,
            startDate: dateRange.fromDate,
            endDate: dateRange.toDate,
          }}
        />
      )}
    </div>
  );
};

export default StatusTab;
