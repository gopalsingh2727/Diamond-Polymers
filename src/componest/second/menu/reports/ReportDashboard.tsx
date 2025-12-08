import React from 'react';
import { BackButton } from '../../../allCompones/BackButton';

const ReportDashboard: React.FC = () => {
  return (
    <div className="report-dashboard">
      <div className="report-dashboard-header">
        <BackButton />
        <h2>Report Dashboard</h2>
      </div>
      <div className="report-dashboard-content" style={{ padding: '20px' }}>
        <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '50px' }}>
          Report Dashboard - Coming Soon
        </p>
      </div>
    </div>
  );
};

export default ReportDashboard;
