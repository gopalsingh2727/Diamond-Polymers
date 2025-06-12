import React from 'react';
import './progress.css';

const Progress: React.FC<{ percent?: number }> = ({ percent = 0 }) => {
  return (
    <div className="update-progress">
      <div className="update-progress-pr">
        <div
          className="update-progress-rate"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
        />
      </div>
      <span className="update-progress-num">
        {percent.toFixed(1)}%
      </span>
    </div>
  );
};

export default Progress;