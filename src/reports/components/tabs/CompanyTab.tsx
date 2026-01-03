import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../componest/redux/rootReducer';
import { AppDispatch } from '../../../store';
import { getCompanyReport, exportExcel } from '../../../componest/redux/reports/reportActions';

interface CompanyTabProps {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
}

const CompanyTab: React.FC<CompanyTabProps> = ({ dateRange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const branchId = localStorage.getItem('selectedBranch') || localStorage.getItem('branchId') || localStorage.getItem('selectedBranchId') || '';
  const { companyReport, exporting } = useSelector((state: RootState) => state.reports);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    if (branchId) {
      dispatch(getCompanyReport({ branchId, ...dateRange }));
    }
  }, [dispatch, branchId, dateRange.fromDate, dateRange.toDate]);

  const handleExport = () => {
    dispatch(exportExcel({
      reportType: 'company',
      branchId,
      ...dateRange
    }));
  };

  const data = companyReport.data;

  // Calculate formulas
  const calculateFormulas = (items: any[]) => {
    if (!items || items.length === 0) {
      return { sum: 0, average: 0, count: 0, min: 0, max: 0, sqrt: 0 };
    }
    const counts = items.map((item) => item.orderCount || 0);
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

  const formulas = data ? calculateFormulas(data.byCompany || []) : null;

  const getCompanyColor = (index: number): string => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="company-tab">
      <div className="tab-header">
        <h2>Orders by Company</h2>
        <button
          className="report-export-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {companyReport.loading ? (
        <div className="loading">Loading company report...</div>
      ) : !data || !data.byCompany || data.byCompany.length === 0 ? (
        <div className="report-empty">No company data available</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="report-summary-cards">
            <div className="report-summary-card">
              <div className="report-summary-card__value">{data.total || 0}</div>
              <div className="report-summary-card__label">Total Orders</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-card__value">{data.byCompany.length}</div>
              <div className="report-summary-card__label">Companies</div>
            </div>
            <div className="report-summary-card report-summary-card--completed">
              <div className="report-summary-card__value">
                {data.byCompany.reduce((sum: number, c: any) => sum + (c.completedCount || 0), 0)}
              </div>
              <div className="report-summary-card__label">Completed</div>
            </div>
            <div className="report-summary-card report-summary-card--pending">
              <div className="report-summary-card__value">
                {data.byCompany.reduce((sum: number, c: any) => sum + (c.pendingCount || 0), 0)}
              </div>
              <div className="report-summary-card__label">Pending</div>
            </div>
          </div>

          {/* Company Cards */}
          <div className="company-cards">
            {data.byCompany.slice(0, 8).map((item: any, index: number) => (
              <div
                key={item.customerId}
                className={`company-card ${selectedCompany?.customerId === item.customerId ? 'company-card--selected' : ''}`}
                onClick={() => setSelectedCompany(item)}
                style={{ borderLeftColor: getCompanyColor(index) }}
              >
                <div className="company-card__header">
                  <h3 className="company-card__name">{item.companyName}</h3>
                  {item.contactName && (
                    <span className="company-card__contact">{item.contactName}</span>
                  )}
                </div>
                <div className="company-card__stats">
                  <div className="company-card__stat">
                    <span className="stat-value">{item.orderCount}</span>
                    <span className="stat-label">Orders</span>
                  </div>
                  <div className="company-card__stat">
                    <span className="stat-value">{item.completedCount || 0}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="company-card__stat">
                    <span className="stat-value">{item.pendingCount || 0}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                </div>
                {item.phone && (
                  <div className="company-card__phone">{item.phone}</div>
                )}
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="report-chart">
            <div className="report-chart__title">Orders by Company</div>
            <div className="bar-chart">
              {data.byCompany.slice(0, 10).map((item: any, index: number) => {
                const maxCount = Math.max(...data.byCompany.map((c: any) => c.orderCount || 0));
                const percentage = maxCount > 0 ? ((item.orderCount || 0) / maxCount) * 100 : 0;
                return (
                  <div key={item.customerId} className="status-bar">
                    <div className="status-bar__label" style={{ width: '180px' }}>
                      {item.companyName?.substring(0, 20) || 'Unknown'}
                      {item.companyName?.length > 20 ? '...' : ''}
                    </div>
                    <div
                      className="status-bar__fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getCompanyColor(index),
                      }}
                    />
                    <div className="status-bar__value">{item.orderCount}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Companies Table */}
          <div className="report-table-container">
            <h3>All Companies</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Company Name</th>
                  <th>Contact</th>
                  <th>Orders</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>In Progress</th>
                  <th>Issues</th>
                </tr>
              </thead>
              <tbody>
                {data.byCompany.map((item: any, index: number) => (
                  <tr
                    key={item.customerId}
                    className={selectedCompany?.customerId === item.customerId ? 'selected-row' : ''}
                    onClick={() => setSelectedCompany(item)}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <div className="company-cell">
                        <span
                          className="company-dot"
                          style={{ backgroundColor: getCompanyColor(index) }}
                        />
                        {item.companyName}
                      </div>
                    </td>
                    <td>
                      <div>
                        {item.contactName && <div>{item.contactName}</div>}
                        {item.phone && <div className="text-muted">{item.phone}</div>}
                      </div>
                    </td>
                    <td>{item.orderCount}</td>
                    <td>{item.completedCount || 0}</td>
                    <td>{item.pendingCount || 0}</td>
                    <td>{item.inProgressCount || 0}</td>
                    <td>{item.issueCount || 0}</td>
                  </tr>
                ))}
                {/* Formula Rows */}
                <tr className="report-table__formula-row">
                  <td colSpan={3} className="report-table__formula-label">SUM</td>
                  <td>{formulas?.sum}</td>
                  <td colSpan={4}></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={3} className="report-table__formula-label">AVERAGE</td>
                  <td>{formulas?.average.toFixed(2)}</td>
                  <td colSpan={4}></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={3} className="report-table__formula-label">COUNT</td>
                  <td>{formulas?.count}</td>
                  <td colSpan={4}></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={3} className="report-table__formula-label">MIN</td>
                  <td>{formulas?.min}</td>
                  <td colSpan={4}></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={3} className="report-table__formula-label">MAX</td>
                  <td>{formulas?.max}</td>
                  <td colSpan={4}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Selected Company Orders */}
          {selectedCompany && data.allOrders && (
            <div className="report-table-container">
              <h3>Recent Orders - {selectedCompany.companyName}</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Order Number</th>
                    <th>Status</th>
                    <th>Quantity</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.allOrders
                    .filter((order: any) => order.customerId?.toString() === selectedCompany.customerId?.toString())
                    .slice(0, 10)
                    .map((order: any, index: number) => (
                      <tr key={order._id}>
                        <td>{index + 1}</td>
                        <td>{order.orderNumber || order._id}</td>
                        <td>
                          <span className={`status-badge status-badge--${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{order.totalQuantity || 0}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompanyTab;
