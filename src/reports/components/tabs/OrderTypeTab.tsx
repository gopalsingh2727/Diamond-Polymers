import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../componest/redux/rootReducer';
import { AppDispatch } from '../../../store';
import { getOrderTypeReport, exportExcel } from '../../../componest/redux/reports/reportActions';

interface OrderTypeTabProps {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
}

const OrderTypeTab: React.FC<OrderTypeTabProps> = ({ dateRange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const branchId = localStorage.getItem('branchId') || '';
  const { orderTypeReport, exporting } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    if (branchId) {
      dispatch(getOrderTypeReport({ branchId, ...dateRange }));
    }
  }, [dispatch, branchId, dateRange.fromDate, dateRange.toDate]);

  const handleExport = () => {
    dispatch(exportExcel({
      reportType: 'orderType',
      branchId,
      ...dateRange
    }));
  };

  const data = orderTypeReport.data;

  // Calculate totals for formulas
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

  const formulas = data ? calculateFormulas(data.byOrderType || []) : null;

  return (
    <div className="ordertype-tab">
      <div className="tab-header">
        <h2>Orders by Order Type</h2>
        <button
          className="report-export-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {orderTypeReport.loading ? (
        <div className="loading">Loading order type report...</div>
      ) : !data || !data.byOrderType || data.byOrderType.length === 0 ? (
        <div className="report-empty">No order type data available</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="report-summary-cards">
            <div className="report-summary-card">
              <div className="report-summary-card__value">{data.summary?.totalOrders || 0}</div>
              <div className="report-summary-card__label">Total Orders</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-card__value">{data.byOrderType.length}</div>
              <div className="report-summary-card__label">Order Types</div>
            </div>
            <div className="report-summary-card report-summary-card--completed">
              <div className="report-summary-card__value">{data.summary?.completed || 0}</div>
              <div className="report-summary-card__label">Completed</div>
            </div>
            <div className="report-summary-card report-summary-card--pending">
              <div className="report-summary-card__value">{data.summary?.pending || 0}</div>
              <div className="report-summary-card__label">Pending</div>
            </div>
          </div>

          {/* Chart */}
          <div className="report-chart">
            <div className="report-chart__title">Order Type Distribution</div>
            <div className="bar-chart">
              {data.byOrderType.map((item: any) => {
                const maxCount = Math.max(...data.byOrderType.map((ot: any) => ot.count));
                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.orderTypeId} className="status-bar">
                    <div className="status-bar__label" style={{ width: '150px' }}>
                      {item.orderTypeName}
                    </div>
                    <div
                      className="status-bar__fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getOrderTypeColor(item.orderTypeName),
                      }}
                    />
                    <div className="status-bar__value">{item.count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Order Type</th>
                  <th>Count</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>In Progress</th>
                </tr>
              </thead>
              <tbody>
                {data.byOrderType.map((item: any, index: number) => (
                  <tr key={item.orderTypeId}>
                    <td>{index + 1}</td>
                    <td>{item.orderTypeName}</td>
                    <td>{item.count}</td>
                    <td>{item.statusBreakdown?.completed || 0}</td>
                    <td>{item.statusBreakdown?.pending || 0}</td>
                    <td>{item.statusBreakdown?.inProgress || 0}</td>
                  </tr>
                ))}
                {/* Formula Rows */}
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">SUM</td>
                  <td>{formulas?.sum}</td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">AVERAGE</td>
                  <td>{formulas?.average.toFixed(2)}</td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">COUNT</td>
                  <td>{formulas?.count}</td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">MIN</td>
                  <td>{formulas?.min}</td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">MAX</td>
                  <td>{formulas?.max}</td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="report-table__formula-row">
                  <td colSpan={2} className="report-table__formula-label">SQRT</td>
                  <td>{formulas?.sqrt.toFixed(2)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// Helper function for colors
const getOrderTypeColor = (name: string): string => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default OrderTypeTab;
