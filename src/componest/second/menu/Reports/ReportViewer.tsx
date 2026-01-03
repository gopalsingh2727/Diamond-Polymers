/**
 * Report Viewer Component
 * Displays executed report with:
 * - Data table
 * - Calculations/Summary
 * - Charts
 * - Export options
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getReportTypesV2 } from '../../../redux/unifiedV2/reportTypeActions';
import { executeReport, getReportSummary, clearReport } from '../../../redux/reports/reportExecutionActions';
import { AppDispatch } from '../../../../store';
import { BackButton } from '../../../allCompones/BackButton';
import './reports.css';

interface ReportType {
  _id: string;
  typeName: string;
  typeCode: string;
  reportCategory: string;
  description?: string;
}

const ReportViewer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'summary'>('table');

  // Get report types from Redux
  const rawReportTypes = useSelector((state: any) => state.v2.reportType?.list);
  const reportTypes = Array.isArray(rawReportTypes) ? rawReportTypes : [];
  const reportTypesLoading = useSelector((state: any) => state.v2.reportType?.loading);

  // Check for pre-selected report type from navigation
  useEffect(() => {
    const state = location.state as any;
    if (state?.reportTypeId) {
      setSelectedReportType(state.reportTypeId);
    }
  }, [location]);

  // Fetch report types on mount
  useEffect(() => {
    dispatch(getReportTypesV2());
  }, [dispatch]);

  // Execute report when type is selected
  const handleExecuteReport = async () => {
    if (!selectedReportType) return;

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        reportTypeId: selectedReportType,
        page: currentPage,
        limit: 100,
      };

      if (dateFrom || dateTo) {
        params.dateOverride = {};
        if (dateFrom) params.dateOverride.from = new Date(dateFrom).toISOString();
        if (dateTo) params.dateOverride.to = new Date(dateTo).toISOString();
      }

      const result = await dispatch(executeReport(params));
      setReportData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to execute report');
    } finally {
      setLoading(false);
    }
  };

  // Category colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      customer: '#3b82f6',
      order: '#10b981',
      sales: '#f59e0b',
      production: '#8b5cf6',
      inventory: '#f97316',
      financial: '#06b6d4',
      custom: '#6b7280'
    };
    return colors[category] || colors.custom;
  };

  return (
    <div className="report-viewer">
      {/* Header */}
      <div className="report-header">
        <div className="report-header-left">
          <BackButton />
          <h1>Report Viewer</h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Report Type</label>
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            disabled={reportTypesLoading}
          >
            <option value="">Select Report Type</option>
            {reportTypes.map((rt: ReportType) => (
              <option key={rt._id} value={rt._id}>
                {rt.typeName} ({rt.typeCode})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <button
          className="execute-btn"
          onClick={handleExecuteReport}
          disabled={!selectedReportType || loading}
        >
          {loading ? 'Executing...' : 'Execute Report'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      {/* Report Content */}
      {reportData && (
        <div className="report-content">
          {/* Report Info */}
          <div className="report-info">
            <h2>{reportData.reportType.typeName}</h2>
            <span
              className="category-badge"
              style={{ backgroundColor: getCategoryColor(reportData.reportType.reportCategory) }}
            >
              {reportData.reportType.reportCategory}
            </span>
            <span className="row-count">
              {reportData.pagination.total} records
            </span>
          </div>

          {/* Tabs */}
          <div className="report-tabs">
            <button
              className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              Data Table
            </button>
            <button
              className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              Charts ({reportData.charts?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary ({reportData.calculations?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Data Table */}
            {activeTab === 'table' && (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {reportData.columns.map((col: any) => (
                        <th key={col.key} style={{ textAlign: col.align || 'left' }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.rows.map((row: any, idx: number) => (
                      <tr key={row._id || idx}>
                        {reportData.columns.map((col: any) => (
                          <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                            {row[col.key] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {reportData.pagination.page} of {reportData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(reportData.pagination.totalPages, p + 1))}
                    disabled={currentPage === reportData.pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Charts */}
            {activeTab === 'charts' && (
              <div className="charts-container">
                {reportData.charts?.length > 0 ? (
                  reportData.charts.map((chart: any, idx: number) => (
                    <div key={idx} className="chart-card">
                      <h3>{chart.name}</h3>
                      <div className="chart-placeholder">
                        <div className="chart-type-badge">{chart.type} Chart</div>
                        <div className="chart-data">
                          {chart.labels.map((label: string, i: number) => (
                            <div key={i} className="chart-bar">
                              <span className="bar-label">{label}</span>
                              <div
                                className="bar-fill"
                                style={{
                                  width: `${(chart.data[i] / Math.max(...chart.data)) * 100}%`,
                                  backgroundColor: chart.colors[i % chart.colors.length] || '#3b82f6'
                                }}
                              />
                              <span className="bar-value">{chart.data[i]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-charts">
                    No charts configured for this report type
                  </div>
                )}
              </div>
            )}

            {/* Summary/Calculations */}
            {activeTab === 'summary' && (
              <div className="summary-container">
                {reportData.calculations?.length > 0 ? (
                  <div className="calculations-grid">
                    {reportData.calculations.map((calc: any, idx: number) => (
                      <div key={idx} className="calculation-card">
                        <div className="calc-name">{calc.name}</div>
                        <div className="calc-value">
                          {calc.value.toLocaleString()}
                          {calc.unit && <span className="calc-unit">{calc.unit}</span>}
                        </div>
                        <div className="calc-formula">{calc.formula}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-calculations">
                    No calculations configured for this report type
                  </div>
                )}

                {/* Production Summary */}
                <div className="production-summary">
                  <h3>Production Metrics</h3>
                  <div className="metrics-grid">
                    <div className="metric-card input">
                      <div className="metric-label">Total Input</div>
                      <div className="metric-value">
                        {reportData.rows.reduce((sum: number, row: any) => sum + (row.totalRawWeight || 0), 0).toFixed(2)} KG
                      </div>
                    </div>
                    <div className="metric-card output">
                      <div className="metric-label">Total Output</div>
                      <div className="metric-value">
                        {reportData.rows.reduce((sum: number, row: any) => sum + (row.totalNetWeight || 0), 0).toFixed(2)} KG
                      </div>
                    </div>
                    <div className="metric-card loss">
                      <div className="metric-label">Total Loss</div>
                      <div className="metric-value">
                        {reportData.rows.reduce((sum: number, row: any) => sum + (row.totalWastage || 0), 0).toFixed(2)} KG
                      </div>
                    </div>
                    <div className="metric-card efficiency">
                      <div className="metric-label">Avg Efficiency</div>
                      <div className="metric-value">
                        {(reportData.rows.reduce((sum: number, row: any) => sum + (row.overallEfficiency || 0), 0) / (reportData.rows.length || 1)).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <div className="export-actions">
            {reportData.exportConfig?.excelEnabled && (
              <button className="export-btn excel">
                Export to Excel
              </button>
            )}
            {reportData.exportConfig?.pdfEnabled && (
              <button className="export-btn pdf">
                Export to PDF
              </button>
            )}
            {reportData.exportConfig?.printEnabled && (
              <button className="export-btn print" onClick={() => window.print()}>
                Print Report
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>Select a Report Type</h2>
          <p>Choose a report type and optionally set date filters, then click "Execute Report" to view data.</p>
        </div>
      )}
    </div>
  );
};

export default ReportViewer;
