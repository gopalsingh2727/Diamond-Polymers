import { ReactNode } from 'react';
import '../../styles/report-builder.css';

/**
 * ReportBuilderWrapper
 * 
 * This component provides CSS isolation for the report builder.
 * All report styles are scoped under the .report-builder-scope class
 * to prevent conflicts with other project styles.
 * 
 * Usage:
 * Wrap any report component with this wrapper to ensure proper styling
 * without affecting other parts of your application.
 * 
 * Example:
 * <ReportBuilderWrapper>
 *   <CustomReportBuilder />
 * </ReportBuilderWrapper>
 */

interface ReportBuilderWrapperProps {
  children: ReactNode;
  darkMode?: boolean;
  className?: string;
}

export function ReportBuilderWrapper({ 
  children, 
  darkMode = false,
  className = '' 
}: ReportBuilderWrapperProps) {
  return (
    <div 
      className={`report-builder-scope ${darkMode ? 'dark-mode' : ''} ${className}`}
      style={{
        // Ensure the wrapper doesn't inherit problematic styles
        all: 'initial',
        display: 'block',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * 1. Basic Usage:
 * ```tsx
 * import { ReportBuilderWrapper } from './components/reports/ReportBuilderWrapper';
 * 
 * function MyReport() {
 *   return (
 *     <ReportBuilderWrapper>
 *       <div className="report-container">
 *         <button className="report-button">My Button</button>
 *       </div>
 *     </ReportBuilderWrapper>
 *   );
 * }
 * ```
 * 
 * 2. With Dark Mode:
 * ```tsx
 * <ReportBuilderWrapper darkMode={true}>
 *   <CustomReportBuilder />
 * </ReportBuilderWrapper>
 * ```
 * 
 * 3. With Additional Classes:
 * ```tsx
 * <ReportBuilderWrapper className="my-custom-wrapper">
 *   <CustomReportBuilder />
 * </ReportBuilderWrapper>
 * ```
 */
