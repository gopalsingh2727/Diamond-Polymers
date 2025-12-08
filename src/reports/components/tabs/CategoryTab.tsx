import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../componest/redux/rootReducer';
import { AppDispatch } from '../../../store';
import { getCategoryReport, exportExcel } from '../../../componest/redux/reports/reportActions';

interface CategoryTabProps {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
}

const CategoryTab: React.FC<CategoryTabProps> = ({ dateRange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const branchId = localStorage.getItem('branchId') || '';
  const { categoryReport, exporting } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    if (branchId) {
      dispatch(getCategoryReport({ branchId, ...dateRange }));
    }
  }, [dispatch, branchId, dateRange.fromDate, dateRange.toDate]);

  const handleExport = () => {
    dispatch(exportExcel({
      reportType: 'category',
      branchId,
      ...dateRange
    }));
  };

  const data = categoryReport.data;

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'product': '#3b82f6',
      'material': '#10b981',
      'printing': '#8b5cf6',
      'packaging': '#f59e0b',
    };
    return colors[category.toLowerCase()] || '#94a3b8';
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'product': '📦',
      'material': '🧱',
      'printing': '🖨️',
      'packaging': '📤',
    };
    return icons[category.toLowerCase()] || '📊';
  };

  // Calculate totals
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

  const formulas = data ? calculateFormulas(data.byCategory || []) : null;

  return (
    <div className="category-tab">
      <div className="tab-header">
        <h2>Orders by Category</h2>
        <button
          className="report-export-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {categoryReport.loading ? (
        <div className="loading">Loading category report...</div>
      ) : !data || !data.byCategory || data.byCategory.length === 0 ? (
        <div className="report-empty">No category data available</div>
      ) : (
        <>
          {/* Category Cards */}
          <div className="category-cards">
            {data.byCategory.map((item: any) => (
              <div
                key={item.category}
                className="category-card"
                style={{ borderLeftColor: getCategoryColor(item.category) }}
              >
                <div className="category-card__icon">{getCategoryIcon(item.category)}</div>
                <div className="category-card__info">
                  <div className="category-card__name">{item.categoryName || item.category}</div>
                  <div className="category-card__count">{item.orderCount} orders</div>
                </div>
                <div className="category-card__stats">
                  <div className="category-card__stat">
                    <span className="stat-value">{item.optionCount || 0}</span>
                    <span className="stat-label">Options</span>
                  </div>
                  <div className="category-card__stat">
                    <span className="stat-value">{item.totalQuantity || 0}</span>
                    <span className="stat-label">Quantity</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Distribution Chart */}
          <div className="report-chart">
            <div className="report-chart__title">Category Distribution</div>
            <div className="pie-chart-container">
              <div className="pie-chart-legend">
                {data.byCategory.map((item: any) => {
                  const total = data.byCategory.reduce((sum: number, c: any) => sum + (c.orderCount || 0), 0);
                  const percentage = total > 0 ? (((item.orderCount || 0) / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={item.category} className="legend-item">
                      <div
                        className="legend-color"
                        style={{ backgroundColor: getCategoryColor(item.category) }}
                      />
                      <div className="legend-text">
                        <span className="legend-name">{item.categoryName || item.category}</span>
                        <span className="legend-value">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bar-chart">
                {data.byCategory.map((item: any) => {
                  const maxCount = Math.max(...data.byCategory.map((c: any) => c.orderCount || 0));
                  const percentage = maxCount > 0 ? ((item.orderCount || 0) / maxCount) * 100 : 0;
                  return (
                    <div key={item.category} className="status-bar">
                      <div className="status-bar__label" style={{ width: '100px' }}>
                        {item.categoryName || item.category}
                      </div>
                      <div
                        className="status-bar__fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getCategoryColor(item.category),
                        }}
                      />
                      <div className="status-bar__value">{item.orderCount}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="report-table-container">
            <h3>Category Details</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>Options</th>
                  <th>Quantity</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.byCategory.map((item: any, index: number) => (
                  <tr key={item.category}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="category-cell">
                        <span
                          className="category-dot"
                          style={{ backgroundColor: getCategoryColor(item.category) }}
                        />
                        {item.categoryName || item.category}
                      </div>
                    </td>
                    <td>{item.orderCount}</td>
                    <td>{item.optionCount || 0}</td>
                    <td>{item.totalQuantity || 0}</td>
                    <td>{item.percentage || 0}%</td>
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
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryTab;
