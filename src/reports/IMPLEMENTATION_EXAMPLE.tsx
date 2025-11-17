/**
 * COMPLETE IMPLEMENTATION EXAMPLE
 * 
 * This file shows how to use the scoped report CSS in your second project
 * to avoid CSS conflicts and button color issues.
 */

// ============================================
// EXAMPLE 1: Basic Setup in Second Project
// ============================================

// File: App.tsx (Second Project)
import './styles/report-builder.css'; // Import scoped CSS once
import { ReportBuilderWrapper } from './components/reports/ReportBuilderWrapper';
import { CustomReportBuilder } from './components/reports/CustomReportBuilder';

export function App() {
  return (
    <div className="app">
      {/* Your project content - NOT affected by report CSS */}
      <header>
        <h1>My Application</h1>
        <button className="my-header-button">Login</button>
      </header>

      {/* Report section - completely isolated */}
      <main>
        <ReportBuilderWrapper>
          <CustomReportBuilder />
        </ReportBuilderWrapper>
      </main>

      {/* Footer - NOT affected by report CSS */}
      <footer>
        <button className="my-footer-button">Contact</button>
      </footer>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Multiple Reports on Same Page
// ============================================

import { ProductionReport } from './components/reports/ProductionReport';
import { MachineReport } from './components/reports/MachineReport';
import { OrdersReport } from './components/reports/OrdersReport';

export function DashboardPage() {
  return (
    <div className="dashboard">
      <h1>Analytics Dashboard</h1>
      
      {/* Each report wrapped separately */}
      <section className="report-section">
        <h2>Production Overview</h2>
        <ReportBuilderWrapper>
          <ProductionReport />
        </ReportBuilderWrapper>
      </section>

      <section className="report-section">
        <h2>Machine Status</h2>
        <ReportBuilderWrapper>
          <MachineReport />
        </ReportBuilderWrapper>
      </section>

      <section className="report-section">
        <h2>Order Analysis</h2>
        <ReportBuilderWrapper>
          <OrdersReport />
        </ReportBuilderWrapper>
      </section>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Conditional Rendering
// ============================================

import { useState } from 'react';

export function ReportsPage() {
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState<string>('orders');

  return (
    <div>
      {/* Project controls - normal styling */}
      <div className="controls">
        <button onClick={() => setShowReport(!showReport)}>
          Toggle Report
        </button>
        <select onChange={(e) => setReportType(e.target.value)}>
          <option value="orders">Orders</option>
          <option value="production">Production</option>
          <option value="machines">Machines</option>
        </select>
      </div>

      {/* Report section - only rendered when needed */}
      {showReport && (
        <ReportBuilderWrapper>
          {reportType === 'orders' && <OrdersReport />}
          {reportType === 'production' && <ProductionReport />}
          {reportType === 'machines' && <MachineReport />}
        </ReportBuilderWrapper>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 4: With Dark Mode
// ============================================

export function ReportPageWithDarkMode() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div>
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Dark Mode
      </button>

      <ReportBuilderWrapper darkMode={darkMode}>
        <CustomReportBuilder />
      </ReportBuilderWrapper>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Custom Wrapper with Additional Features
// ============================================

interface CustomReportWrapperProps {
  children: React.ReactNode;
  title?: string;
  showExportButton?: boolean;
  onExport?: () => void;
}

export function CustomReportWrapper({ 
  children, 
  title,
  showExportButton = false,
  onExport 
}: CustomReportWrapperProps) {
  return (
    <div className="custom-report-section">
      {/* Your project's header - normal styling */}
      {title && (
        <div className="report-header">
          <h2>{title}</h2>
          {showExportButton && (
            <button onClick={onExport} className="export-btn">
              Export
            </button>
          )}
        </div>
      )}

      {/* Report content - scoped styling */}
      <ReportBuilderWrapper>
        {children}
      </ReportBuilderWrapper>
    </div>
  );
}

// Usage:
export function CustomReportPage() {
  const handleExport = () => {
    console.log('Exporting report...');
  };

  return (
    <CustomReportWrapper 
      title="Monthly Production Report"
      showExportButton={true}
      onExport={handleExport}
    >
      <ProductionReport />
    </CustomReportWrapper>
  );
}

// ============================================
// EXAMPLE 6: Using Report Classes Correctly
// ============================================

export function ManualReportComponent() {
  return (
    <div className="report-builder-scope">
      {/* Now you can use all report classes */}
      
      {/* Metric Cards */}
      <div className="report-metrics-summary">
        <div className="report-metric-card">
          <div className="report-metric-card-header">
            <div className="report-metric-card-title">Total Orders</div>
          </div>
          <div className="report-metric-card-body">
            <div className="report-metric-value">1,245</div>
            <p className="report-metric-context">This month</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="report-actions">
        <button className="report-button">Primary Action</button>
        <button className="report-button-export">Export</button>
        <button className="report-button-print">Print</button>
      </div>

      {/* Badges */}
      <div>
        <span className="report-badge report-badge-status">Active</span>
        <span className="report-badge report-badge-priority">High</span>
        <span className="report-badge report-badge-efficiency">94%</span>
      </div>

      {/* Data Table */}
      <div className="report-table-container">
        <div className="report-table-header">
          <h3 className="report-table-title">Orders</h3>
        </div>
        <div className="report-table-body">
          <table className="report-table">
            <thead className="report-table-head">
              <tr>
                <th className="report-table-header-cell">ID</th>
                <th className="report-table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="report-table-row">
                <td className="report-table-cell-mono">ORD-001</td>
                <td className="report-table-cell">
                  <span className="report-badge report-badge-status">
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Integration with Routing
// ============================================

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

export function AppWithRouting() {
  return (
    <BrowserRouter>
      <div>
        {/* Navigation - your project's styling */}
        <nav>
          <Link to="/">Home</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/settings">Settings</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<ReportsPageWithScoping />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function ReportsPageWithScoping() {
  return (
    <div className="page">
      <h1>Reports</h1>
      
      {/* Report section - scoped */}
      <ReportBuilderWrapper>
        <CustomReportBuilder />
      </ReportBuilderWrapper>
    </div>
  );
}

function HomePage() {
  return (
    <div className="page">
      <h1>Home</h1>
      {/* Your project content - not affected */}
      <button className="cta-button">Get Started</button>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="page">
      <h1>Settings</h1>
      {/* Your project content - not affected */}
      <button className="save-button">Save Settings</button>
    </div>
  );
}

// ============================================
// EXAMPLE 8: Testing Button Colors
// ============================================

export function ButtonColorTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Button Color Test</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2>Project Buttons (Should Keep Original Colors)</h2>
        <button className="my-red-button" style={{ background: 'red', color: 'white', padding: '10px' }}>
          My Red Button (Should Stay Red)
        </button>
        <button className="my-green-button" style={{ background: 'green', color: 'white', padding: '10px' }}>
          My Green Button (Should Stay Green)
        </button>
        <button className="report-button">
          This button should NOT be blue (no wrapper)
        </button>
      </section>

      <section>
        <h2>Report Buttons (Should Be Blue)</h2>
        <ReportBuilderWrapper>
          <div className="report-actions">
            <button className="report-button">
              This button SHOULD be blue
            </button>
            <button className="report-button-export">
              This button SHOULD be green
            </button>
            <button className="report-button-print">
              This button SHOULD be gray
            </button>
          </div>
        </ReportBuilderWrapper>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Mixed Content Test</h2>
        <button className="report-button">
          Outside wrapper (NOT blue)
        </button>
        
        <ReportBuilderWrapper>
          <button className="report-button">
            Inside wrapper (BLUE)
          </button>
        </ReportBuilderWrapper>
        
        <button className="report-button">
          Outside wrapper again (NOT blue)
        </button>
      </section>
    </div>
  );
}

// ============================================
// EXAMPLE 9: Custom Styled Report Section
// ============================================

export function CustomStyledReportSection() {
  return (
    <div className="my-custom-section">
      {/* Your custom wrapper with project styling */}
      <div className="section-header">
        <h2>Production Analytics</h2>
        <p className="section-description">Real-time manufacturing insights</p>
      </div>

      {/* Scoped report content */}
      <ReportBuilderWrapper className="my-report-theme">
        <div className="report-container">
          {/* Configuration Panel */}
          <div className="report-config-panel">
            <div className="report-config-header">
              <h3 className="report-config-title">Report Settings</h3>
            </div>
            <div className="report-config-body">
              {/* Filter options */}
              <div className="report-filters-section">
                <div className="report-filter-group">
                  <label className="report-filter-label">Date Range</label>
                  {/* Date picker */}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="report-actions">
                <button className="report-button">Generate Report</button>
                <button className="report-button-export">Export Excel</button>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="report-metrics-summary">
            <div className="report-metric-card">
              <div className="report-metric-card-header">
                <div className="report-metric-card-title">Total Production</div>
              </div>
              <div className="report-metric-card-body">
                <div className="report-metric-value">15,482 units</div>
              </div>
            </div>
          </div>
        </div>
      </ReportBuilderWrapper>

      {/* Your custom footer with project styling */}
      <div className="section-footer">
        <button className="my-project-button">Back to Dashboard</button>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 10: Error Boundaries for Safety
// ============================================

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ReportErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Report Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="report-builder-scope">
          <div className="report-empty">
            <h3 className="report-empty-title">Unable to load report</h3>
            <p className="report-empty-description">
              An error occurred while loading the report. Please try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage with error boundary:
export function SafeReportPage() {
  return (
    <ReportErrorBoundary>
      <ReportBuilderWrapper>
        <CustomReportBuilder />
      </ReportBuilderWrapper>
    </ReportErrorBoundary>
  );
}

// ============================================
// SUMMARY OF KEY POINTS
// ============================================

/**
 * KEY TAKEAWAYS:
 * 
 * 1. ALWAYS wrap reports with <ReportBuilderWrapper> or 
 *    <div className="report-builder-scope">
 * 
 * 2. Import report-builder.css ONCE in your App.tsx
 * 
 * 3. Project buttons outside wrapper keep their colors
 * 
 * 4. Report buttons inside wrapper get report colors
 * 
 * 5. No more CSS conflicts!
 * 
 * CORRECT USAGE:
 * ✅ <ReportBuilderWrapper><Report /></ReportBuilderWrapper>
 * ✅ <div className="report-builder-scope"><Report /></div>
 * 
 * INCORRECT USAGE:
 * ❌ <Report /> (no wrapper - will have wrong colors)
 * ❌ Copying CSS to globals.css (causes global conflicts)
 */

export default App;
