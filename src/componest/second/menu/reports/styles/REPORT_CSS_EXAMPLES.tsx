/**
 * REPORT CSS VISUAL EXAMPLES
 * 
 * This file contains copy-paste ready examples of all report CSS classes in action.
 * Use these as templates when building custom reports.
 */

// ============================================
// 1. COMPLETE METRIC CARD EXAMPLE
// ============================================
export const MetricCardExample = () => (
  <div className="report-metric-card">
    <div className="report-metric-card-header">
      <div className="report-metric-card-title">Total Orders</div>
      <Database className="report-metric-card-icon" />
    </div>
    <div className="report-metric-card-body">
      <div className="report-metric-value">1,245</div>
      <p className="report-metric-context">
        Based on 30 orders
      </p>
    </div>
  </div>
);

// ============================================
// 2. METRICS SUMMARY GRID
// ============================================
export const MetricsSummaryExample = () => (
  <div className="report-metrics-summary">
    <div className="report-metric-card">
      <div className="report-metric-card-header">
        <div className="report-metric-card-title">Total Orders</div>
        <ClipboardList className="report-metric-card-icon" />
      </div>
      <div className="report-metric-card-body">
        <div className="report-metric-value">1,245</div>
        <p className="report-metric-context">Based on 30 days</p>
      </div>
    </div>

    <div className="report-metric-card">
      <div className="report-metric-card-header">
        <div className="report-metric-card-title">Efficiency</div>
        <TrendingUp className="report-metric-card-icon" />
      </div>
      <div className="report-metric-card-body">
        <div className="report-metric-value">94.2%</div>
        <p className="report-metric-context">
          <span className="report-status-dot report-status-dot-success"></span>
          Up 2.1%
        </p>
      </div>
    </div>

    <div className="report-metric-card">
      <div className="report-metric-card-header">
        <div className="report-metric-card-title">Wastage</div>
        <AlertTriangle className="report-metric-card-icon" />
      </div>
      <div className="report-metric-card-body">
        <div className="report-metric-value">248 kg</div>
        <p className="report-metric-context">
          <span className="report-status-dot report-status-dot-warning"></span>
          5.2% of total
        </p>
      </div>
    </div>

    <div className="report-metric-card">
      <div className="report-metric-card-header">
        <div className="report-metric-card-title">Production</div>
        <Package className="report-metric-card-icon" />
      </div>
      <div className="report-metric-card-body">
        <div className="report-metric-value">4,850 kg</div>
        <p className="report-metric-context">Net weight produced</p>
      </div>
    </div>
  </div>
);

// ============================================
// 3. ACTION BUTTONS
// ============================================
export const ActionButtonsExample = () => (
  <div className="report-actions">
    <button className="report-button">
      <Eye className="report-button-icon" />
      Generate Report
    </button>
    <button className="report-button-export">
      <Download className="report-button-icon" />
      Export Excel
    </button>
    <button className="report-button-print">
      <Printer className="report-button-icon" />
      Print
    </button>
    <button className="report-button-secondary">
      <Settings className="report-button-icon" />
      Configure
    </button>
  </div>
);

// ============================================
// 4. CONFIGURATION PANEL
// ============================================
export const ConfigPanelExample = () => (
  <div className="report-config-panel">
    <div className="report-config-header">
      <h2 className="report-config-title">
        <Filter className="w-5 h-5" />
        Report Configuration
      </h2>
      <p className="report-config-description">
        Configure your custom report by selecting metrics and filters
      </p>
    </div>
    <div className="report-config-body">
      {/* Report Type Selection */}
      <div className="report-type-section">
        <label className="report-type-label">Report Type</label>
        <select className="report-type-select">
          <option>Order Analysis</option>
          <option>Machine Performance</option>
          <option>Material Usage</option>
        </select>
      </div>

      {/* Metrics Selection */}
      <div className="report-metrics-section">
        <label className="report-metrics-label">Metrics to Display</label>
        <div className="report-metrics-grid">
          <div className="report-metric-item">
            <input type="checkbox" className="report-metric-checkbox" />
            <label className="report-metric-label">Total Orders</label>
          </div>
          <div className="report-metric-item">
            <input type="checkbox" className="report-metric-checkbox" />
            <label className="report-metric-label">Completion Rate</label>
          </div>
          <div className="report-metric-item">
            <input type="checkbox" className="report-metric-checkbox" />
            <label className="report-metric-label">Avg Efficiency</label>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="report-filters-section">
        <div className="report-filter-group">
          <label className="report-filter-label">Status</label>
          <select className="report-filter-select">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Priority</label>
          <select className="report-filter-select">
            <option>All Priorities</option>
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="report-actions">
        <button className="report-button">
          <Eye className="report-button-icon" />
          Generate Report
        </button>
      </div>
    </div>
  </div>
);

// ============================================
// 5. CHART CONTAINER
// ============================================
export const ChartContainerExample = () => (
  <div className="report-chart-container">
    <div className="report-chart-header">
      <h3 className="report-chart-title">Order Status Distribution</h3>
      <p className="report-chart-description">
        Breakdown of orders by current status
      </p>
    </div>
    <div className="report-chart-body">
      <div className="report-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// ============================================
// 6. DATA TABLE
// ============================================
export const DataTableExample = () => (
  <div className="report-table-container">
    <div className="report-table-header">
      <h3 className="report-table-title">Detailed Order Data</h3>
      <p className="report-table-description">
        Showing 50 orders matching your criteria
      </p>
    </div>
    <div className="report-table-body">
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead className="report-table-head">
            <tr>
              <th className="report-table-header-cell">Order ID</th>
              <th className="report-table-header-cell">Customer</th>
              <th className="report-table-header-cell">Status</th>
              <th className="report-table-header-cell-right">Net Weight</th>
              <th className="report-table-header-cell-right">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            <tr className="report-table-row">
              <td className="report-table-cell-mono">ORD-NYC-001</td>
              <td className="report-table-cell">Acme Corp</td>
              <td className="report-table-cell">
                <span className="report-badge report-badge-status">
                  In Progress
                </span>
              </td>
              <td className="report-table-cell-right">1,250 kg</td>
              <td className="report-table-cell-right">
                <span className="report-badge report-badge-efficiency">
                  94.2%
                </span>
              </td>
            </tr>
            <tr className="report-table-row">
              <td className="report-table-cell-mono">ORD-NYC-002</td>
              <td className="report-table-cell">Tech Industries</td>
              <td className="report-table-cell">
                <span className="report-badge report-badge-status">
                  Completed
                </span>
              </td>
              <td className="report-table-cell-right">890 kg</td>
              <td className="report-table-cell-right">
                <span className="report-badge report-badge-efficiency">
                  96.8%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ============================================
// 7. BADGES
// ============================================
export const BadgesExample = () => (
  <div className="flex flex-wrap gap-2">
    <span className="report-badge report-badge-status">In Progress</span>
    <span className="report-badge report-badge-priority">High Priority</span>
    <span className="report-badge report-badge-efficiency">94.2%</span>
    <span className="report-badge report-badge-warning">Low Stock</span>
    <span className="report-badge report-badge-error">Error</span>
  </div>
);

// ============================================
// 8. LOADING STATE
// ============================================
export const LoadingStateExample = () => (
  <div className="report-loading">
    <div className="report-loading-spinner"></div>
    <span className="report-loading-text">Loading report data...</span>
  </div>
);

// ============================================
// 9. EMPTY STATE
// ============================================
export const EmptyStateExample = () => (
  <div className="report-empty">
    <FileX className="report-empty-icon" />
    <h3 className="report-empty-title">No Data Available</h3>
    <p className="report-empty-description">
      There are no orders matching your selected filters. 
      Try adjusting your date range or filter criteria.
    </p>
  </div>
);

// ============================================
// 10. STATUS INDICATORS
// ============================================
export const StatusIndicatorsExample = () => (
  <div className="space-y-2">
    <div>
      <span className="report-status-dot report-status-dot-success"></span>
      Machine Active
    </div>
    <div>
      <span className="report-status-dot report-status-dot-warning"></span>
      Maintenance Required
    </div>
    <div>
      <span className="report-status-dot report-status-dot-error"></span>
      Machine Error
    </div>
    <div>
      <span className="report-status-dot report-status-dot-info"></span>
      Machine Idle
    </div>
  </div>
);

// ============================================
// 11. HIGHLIGHT BOXES
// ============================================
export const HighlightBoxesExample = () => (
  <div className="space-y-4">
    <div className="report-highlight-success">
      <p><strong>Success:</strong> Report generated successfully!</p>
    </div>
    <div className="report-highlight-info">
      <p><strong>Info:</strong> Data is updated every 5 minutes.</p>
    </div>
    <div className="report-highlight">
      <p><strong>Note:</strong> Some metrics may be estimated.</p>
    </div>
    <div className="report-highlight-error">
      <p><strong>Error:</strong> Unable to fetch real-time data.</p>
    </div>
  </div>
);

// ============================================
// 12. GRID LAYOUTS
// ============================================
export const GridLayoutsExample = () => (
  <>
    {/* 2-column grid */}
    <div className="report-grid-2">
      <div className="report-metric-card">Card 1</div>
      <div className="report-metric-card">Card 2</div>
    </div>

    {/* 3-column grid */}
    <div className="report-grid-3">
      <div className="report-metric-card">Card 1</div>
      <div className="report-metric-card">Card 2</div>
      <div className="report-metric-card">Card 3</div>
    </div>

    {/* 4-column grid */}
    <div className="report-grid-4">
      <div className="report-metric-card">Card 1</div>
      <div className="report-metric-card">Card 2</div>
      <div className="report-metric-card">Card 3</div>
      <div className="report-metric-card">Card 4</div>
    </div>
  </>
);

// ============================================
// 13. PRINT ELEMENTS
// ============================================
export const PrintElementsExample = () => (
  <>
    <div className="report-print-header">
      <h1>Manufacturing Dashboard Report</h1>
      <p>Generated on: {new Date().toLocaleDateString()}</p>
      <p>Branch: New York Manufacturing</p>
    </div>

    {/* Your report content here */}

    <div className="report-print-footer">
      <p>© 2025 Your Company Name | Confidential Document</p>
      <p>Page generated at {new Date().toLocaleString()}</p>
    </div>
  </>
);

// ============================================
// 14. COMPLETE REPORT EXAMPLE
// ============================================
export const CompleteReportExample = () => (
  <div className="report-container">
    {/* Configuration Panel */}
    <div className="report-config-panel">
      <div className="report-config-header">
        <h2 className="report-config-title">
          <Filter className="w-5 h-5" />
          Report Configuration
        </h2>
        <p className="report-config-description">
          Configure your custom report
        </p>
      </div>
      <div className="report-config-body">
        {/* Configuration options */}
        <div className="report-actions">
          <button className="report-button">
            <Eye className="report-button-icon" />
            Generate Report
          </button>
        </div>
      </div>
    </div>

    {/* Print Header (hidden on screen, shown when printing) */}
    <div className="report-print-header">
      <h1>Order Analysis Report</h1>
      <p>Generated: {new Date().toLocaleDateString()}</p>
    </div>

    {/* Metrics Summary */}
    <div className="report-metrics-summary">
      <div className="report-metric-card report-fade-in">
        <div className="report-metric-card-header">
          <div className="report-metric-card-title">Total Orders</div>
          <ClipboardList className="report-metric-card-icon" />
        </div>
        <div className="report-metric-card-body">
          <div className="report-metric-value">1,245</div>
          <p className="report-metric-context">Based on 30 days</p>
        </div>
      </div>
      
      {/* More metric cards... */}
    </div>

    {/* Chart */}
    <div className="report-chart-container report-slide-in">
      <div className="report-chart-header">
        <h3 className="report-chart-title">Data Visualization</h3>
        <p className="report-chart-description">Status distribution</p>
      </div>
      <div className="report-chart-body">
        <div className="report-chart-wrapper">
          {/* Chart component */}
        </div>
      </div>
    </div>

    {/* Data Table */}
    <div className="report-table-container">
      <div className="report-table-header">
        <h3 className="report-table-title">Detailed Data</h3>
        <p className="report-table-description">Showing 50 orders</p>
      </div>
      <div className="report-table-body">
        <div className="report-table-wrapper">
          <table className="report-table">
            {/* Table content */}
          </table>
        </div>
      </div>
    </div>

    {/* Print Footer */}
    <div className="report-print-footer">
      <p>© 2025 Your Company | Confidential</p>
    </div>
  </div>
);

// ============================================
// 15. RESPONSIVE UTILITIES
// ============================================
export const ResponsiveUtilitiesExample = () => (
  <>
    {/* Show only on mobile */}
    <div className="report-mobile-only">
      <button className="report-button">Mobile Menu</button>
    </div>

    {/* Show only on desktop */}
    <div className="report-desktop-only">
      <div className="report-actions">
        <button className="report-button">Desktop Action</button>
      </div>
    </div>
  </>
);

// ============================================
// 16. ANIMATION EXAMPLES
// ============================================
export const AnimationExamples = () => (
  <div className="space-y-4">
    <div className="report-metric-card report-fade-in">
      Fade In Animation
    </div>
    <div className="report-metric-card report-slide-in">
      Slide In Animation
    </div>
    <div className="report-metric-card report-scale-in">
      Scale In Animation
    </div>
  </div>
);

// ============================================
// 17. DIVIDERS
// ============================================
export const DividersExample = () => (
  <div>
    <h3>Section 1</h3>
    <p>Content here...</p>
    
    <div className="report-divider"></div>
    
    <h3>Section 2</h3>
    <p>Content here...</p>
    
    <div className="report-divider-thick"></div>
    
    <h3>Section 3</h3>
    <p>Content here...</p>
  </div>
);

/**
 * USAGE NOTES:
 * 
 * 1. Import required icons from lucide-react
 * 2. Copy any example and customize for your needs
 * 3. All classes are responsive by default
 * 4. Combine with Tailwind utilities as needed
 * 5. Test print functionality with Ctrl+P or Cmd+P
 * 
 * QUICK TIPS:
 * - Use report-fade-in for smooth entrance animations
 * - Use report-button-export for download actions
 * - Use report-badge-efficiency for percentage displays
 * - Use report-status-dot for inline status indicators
 * - Use report-print-header/footer for print-only content
 */
