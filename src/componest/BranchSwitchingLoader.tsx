import React from 'react';
import { useSelector } from 'react-redux';
import './BranchSwitchingLoader.css';

interface RootState {
  auth: {
    branchSwitching?: boolean;
  };
}

/**
 * Global loading overlay that appears when switching branches
 * Shows during master_admin and admin branch changes to indicate data is being refreshed
 */
const BranchSwitchingLoader: React.FC = () => {
  const branchSwitching = useSelector((state: RootState) => state.auth.branchSwitching);

  if (!branchSwitching) return null;

  return (
    <div className="branch-switching-overlay">
      <div className="branch-switching-loader">
        <div className="loader-spinner"></div>
        <h2>Switching Branch...</h2>
        <p>Clearing cache and loading fresh data</p>
        <div className="loader-steps">
          <div className="loader-step">
            <span className="step-icon">🗑️</span>
            <span>Clearing local cache</span>
          </div>
          <div className="loader-step">
            <span className="step-icon">🔄</span>
            <span>Updating branch context</span>
          </div>
          <div className="loader-step">
            <span className="step-icon">📥</span>
            <span>Fetching fresh data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchSwitchingLoader;
