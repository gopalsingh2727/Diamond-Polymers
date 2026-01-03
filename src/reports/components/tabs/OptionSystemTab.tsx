import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../componest/redux/rootReducer';
import { AppDispatch } from '../../../store';
import {
  getOptionTypeReport,
  getOptionsByType,
  exportExcel,
} from '../../../componest/redux/reports/reportActions';

interface OptionSystemTabProps {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
}

const OptionSystemTab: React.FC<OptionSystemTabProps> = ({ dateRange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const branchId = localStorage.getItem('selectedBranch') || localStorage.getItem('branchId') || localStorage.getItem('selectedBranchId') || '';
  const { optionTypeReport, optionsByType, exporting } = useSelector(
    (state: RootState) => state.reports
  );

  const [selectedOptionType, setSelectedOptionType] = useState<string | null>(null);
  const [drillLevel, setDrillLevel] = useState<'optionType' | 'option' | 'spec'>('optionType');

  useEffect(() => {
    if (branchId) {
      dispatch(getOptionTypeReport({ branchId, ...dateRange }));
    }
  }, [dispatch, branchId, dateRange.fromDate, dateRange.toDate]);

  const handleOptionTypeClick = (optionTypeId: string) => {
    setSelectedOptionType(optionTypeId);
    setDrillLevel('option');
    dispatch(getOptionsByType(optionTypeId, {
      branchId,
      ...dateRange,
    }));
  };

  const handleBack = () => {
    if (drillLevel === 'option') {
      setDrillLevel('optionType');
      setSelectedOptionType(null);
    } else if (drillLevel === 'spec') {
      setDrillLevel('option');
    }
  };

  const handleExport = () => {
    dispatch(exportExcel({
      reportType: 'optionType',
      branchId,
      ...dateRange,
      filters: selectedOptionType ? { optionTypeId: selectedOptionType } : undefined
    }));
  };

  const data = optionTypeReport.data;
  const optionData = optionsByType.data;

  // Calculate formulas
  const calculateFormulas = (items: any[], field: string = 'count') => {
    if (!items || items.length === 0) {
      return { sum: 0, average: 0, count: 0, min: 0, max: 0, sqrt: 0 };
    }
    const values = items.map((item) => item[field] || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      sum,
      average: sum / values.length,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      sqrt: Math.sqrt(sum),
    };
  };

  const getOptionTypeColor = (index: number): string => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="option-system-tab">
      <div className="tab-header">
        <div className="breadcrumb">
          <span
            className={`breadcrumb-item ${drillLevel === 'optionType' ? 'active' : 'clickable'}`}
            onClick={() => {
              setDrillLevel('optionType');
              setSelectedOptionType(null);
            }}
          >
            Option Types
          </span>
          {selectedOptionType && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className={`breadcrumb-item ${drillLevel === 'option' ? 'active' : 'clickable'}`}>
                {data?.byOptionType?.find((ot: any) => ot.optionTypeId === selectedOptionType)?.optionTypeName || 'Options'}
              </span>
            </>
          )}
        </div>
        <div className="tab-actions">
          {drillLevel !== 'optionType' && (
            <button className="btn-secondary" onClick={handleBack}>
              &larr; Back
            </button>
          )}
          <button
            className="report-export-btn"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </div>

      {/* Level 1: Option Types */}
      {drillLevel === 'optionType' && (
        <>
          {optionTypeReport.loading ? (
            <div className="loading">Loading option types report...</div>
          ) : !data || !data.byOptionType || data.byOptionType.length === 0 ? (
            <div className="report-empty">No option type data available</div>
          ) : (
            <>
              {/* Summary */}
              <div className="report-summary-cards">
                <div className="report-summary-card">
                  <div className="report-summary-card__value">{data.totalOrders || 0}</div>
                  <div className="report-summary-card__label">Total Orders</div>
                </div>
                <div className="report-summary-card">
                  <div className="report-summary-card__value">{data.byOptionType.length}</div>
                  <div className="report-summary-card__label">Option Types</div>
                </div>
                <div className="report-summary-card">
                  <div className="report-summary-card__value">{data.formulas?.sumQuantity || 0}</div>
                  <div className="report-summary-card__label">Total Quantity</div>
                </div>
              </div>

              {/* Option Type Cards - Clickable for drill-down */}
              <div className="option-type-cards">
                {data.byOptionType.map((item: any, index: number) => (
                  <div
                    key={item.optionTypeId}
                    className="option-type-card"
                    onClick={() => handleOptionTypeClick(item.optionTypeId)}
                  >
                    <div
                      className="option-type-card__color"
                      style={{ backgroundColor: getOptionTypeColor(index) }}
                    />
                    <div className="option-type-card__content">
                      <h3>{item.optionTypeName}</h3>
                      <div className="option-type-card__stats">
                        <div className="stat">
                          <span className="stat-value">{item.orderCount}</span>
                          <span className="stat-label">Orders</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{item.totalQuantity || 0}</span>
                          <span className="stat-label">Quantity</span>
                        </div>
                      </div>
                    </div>
                    <div className="option-type-card__arrow">&rarr;</div>
                  </div>
                ))}
              </div>

              {/* Table with Formulas */}
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Option Type</th>
                      <th>Orders</th>
                      <th>Quantity</th>
                      <th>Completed</th>
                      <th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byOptionType.map((item: any, index: number) => (
                      <tr
                        key={item.optionTypeId}
                        className="clickable-row"
                        onClick={() => handleOptionTypeClick(item.optionTypeId)}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <div className="cell-with-icon">
                            <span
                              className="color-dot"
                              style={{ backgroundColor: getOptionTypeColor(index) }}
                            />
                            {item.optionTypeName}
                          </div>
                        </td>
                        <td>{item.orderCount}</td>
                        <td>{item.totalQuantity || 0}</td>
                        <td>{item.completedCount || 0}</td>
                        <td>{item.pendingCount || 0}</td>
                      </tr>
                    ))}
                    {/* Formula Rows */}
                    {(() => {
                      const formulas = calculateFormulas(data.byOptionType, 'orderCount');
                      return (
                        <>
                          <tr className="report-table__formula-row">
                            <td colSpan={2} className="report-table__formula-label">SUM</td>
                            <td>{formulas.sum}</td>
                            <td>{calculateFormulas(data.byOptionType, 'totalQuantity').sum}</td>
                            <td colSpan={2}></td>
                          </tr>
                          <tr className="report-table__formula-row">
                            <td colSpan={2} className="report-table__formula-label">AVERAGE</td>
                            <td>{formulas.average.toFixed(2)}</td>
                            <td>{calculateFormulas(data.byOptionType, 'totalQuantity').average.toFixed(2)}</td>
                            <td colSpan={2}></td>
                          </tr>
                          <tr className="report-table__formula-row">
                            <td colSpan={2} className="report-table__formula-label">COUNT</td>
                            <td>{formulas.count}</td>
                            <td></td>
                            <td colSpan={2}></td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Level 2: Options under selected Option Type */}
      {drillLevel === 'option' && (
        <>
          {optionsByType.loading ? (
            <div className="loading">Loading options...</div>
          ) : !optionData || !optionData.options || optionData.options.length === 0 ? (
            <div className="report-empty">No options data available for this type</div>
          ) : (
            <>
              {/* Summary for this Option Type */}
              <div className="report-summary-cards">
                <div className="report-summary-card">
                  <div className="report-summary-card__value">{optionData.summary?.totalOrders || 0}</div>
                  <div className="report-summary-card__label">Total Orders</div>
                </div>
                <div className="report-summary-card">
                  <div className="report-summary-card__value">{optionData.options.length}</div>
                  <div className="report-summary-card__label">Options</div>
                </div>
                <div className="report-summary-card">
                  <div className="report-summary-card__value">{optionData.summary?.totalQuantity || 0}</div>
                  <div className="report-summary-card__label">Total Quantity</div>
                </div>
              </div>

              {/* Options Chart */}
              <div className="report-chart">
                <div className="report-chart__title">Options Distribution</div>
                <div className="bar-chart">
                  {optionData.options.slice(0, 10).map((item: any, index: number) => {
                    const maxCount = Math.max(...optionData.options.map((o: any) => o.count));
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={item.optionId} className="status-bar">
                        <div className="status-bar__label" style={{ width: '150px' }}>
                          {item.optionName}
                        </div>
                        <div
                          className="status-bar__fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getOptionTypeColor(index),
                          }}
                        />
                        <div className="status-bar__value">{item.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Options Table */}
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Option Name</th>
                      <th>Orders</th>
                      <th>Quantity</th>
                      <th>Completed</th>
                      <th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionData.options.map((item: any, index: number) => (
                      <tr key={item.optionId}>
                        <td>{index + 1}</td>
                        <td>{item.optionName}</td>
                        <td>{item.count}</td>
                        <td>{item.totalQuantity || 0}</td>
                        <td>{item.completed || 0}</td>
                        <td>{item.pending || 0}</td>
                      </tr>
                    ))}
                    {/* Formula Rows */}
                    {(() => {
                      const formulas = calculateFormulas(optionData.options, 'count');
                      const qtyFormulas = calculateFormulas(optionData.options, 'totalQuantity');
                      return (
                        <>
                          <tr className="report-table__formula-row">
                            <td colSpan={2} className="report-table__formula-label">SUM</td>
                            <td>{formulas.sum}</td>
                            <td>{qtyFormulas.sum}</td>
                            <td colSpan={2}></td>
                          </tr>
                          <tr className="report-table__formula-row">
                            <td colSpan={2} className="report-table__formula-label">AVERAGE</td>
                            <td>{formulas.average.toFixed(2)}</td>
                            <td>{qtyFormulas.average.toFixed(2)}</td>
                            <td colSpan={2}></td>
                          </tr>
                          <tr className="report-table__formula-row">
                            <td colSpan={2} className="report-table__formula-label">COUNT</td>
                            <td>{formulas.count}</td>
                            <td></td>
                            <td colSpan={2}></td>
                          </tr>
                          <tr className="report-table__formula-row">
                            <td colSpan={2} className="report-table__formula-label">MIN</td>
                            <td>{formulas.min}</td>
                            <td>{qtyFormulas.min}</td>
                            <td colSpan={2}></td>
                          </tr>
                          <tr className="report-table__formula-row">
                            <td colSpan={2} className="report-table__formula-label">MAX</td>
                            <td>{formulas.max}</td>
                            <td>{qtyFormulas.max}</td>
                            <td colSpan={2}></td>
                          </tr>
                          <tr className="report-table__formula-row">
                            <td colSpan={2} className="report-table__formula-label">SQRT</td>
                            <td>{formulas.sqrt.toFixed(2)}</td>
                            <td>{qtyFormulas.sqrt.toFixed(2)}</td>
                            <td colSpan={2}></td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Specifications Section (if available) */}
              {optionData.specifications && optionData.specifications.length > 0 && (
                <div className="report-table-container">
                  <h3>Option Specifications</h3>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Option</th>
                        <th>Spec Name</th>
                        <th>Spec Value</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionData.specifications.map((item: any, index: number) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.optionName}</td>
                          <td>{item.specName}</td>
                          <td>{item.specValue}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OptionSystemTab;
