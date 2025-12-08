import { useState, useEffect } from "react";

interface StatusProps {
  onStatusChange?: (status: string) => void;
  initialStatus?: string;
  isEditMode?: boolean;
}

const Status = ({ onStatusChange, initialStatus }: StatusProps) => {
  const [status, setStatus] = useState<string>(initialStatus || 'pending');

  // Initialize status from initial data
  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  // Call the parent callback whenever status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const getStatusLabel = (value: string) => {
    switch (value) {
      case 'Wait for Approval':
        return 'Wait for Approval';
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'dispatched':
        return 'Dispatched';
      case 'cancelled':
        return 'Cancelled';
      case 'issue':
        return 'Issue';
      default:
        return value;
    }
  };

  return (
    <div className="Notes">
      <span style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>Status</span>
      <select
        name="overallStatus"
        value={status}
        onChange={handleStatusChange}
        style={{
          padding: '8px 12px',
          fontSize: '13px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: 'white',
          color: '#333',
          cursor: 'pointer',
          minWidth: '110px',
          height: '38px'
        }}
      >
        <option value="Wait for Approval">{getStatusLabel('Wait for Approval')}</option>
        <option value="pending">{getStatusLabel('pending')}</option>
        <option value="approved">{getStatusLabel('approved')}</option>
        <option value="in_progress">{getStatusLabel('in_progress')}</option>
        <option value="completed">{getStatusLabel('completed')}</option>
        <option value="dispatched">{getStatusLabel('dispatched')}</option>
        <option value="cancelled">{getStatusLabel('cancelled')}</option>
        <option value="issue">{getStatusLabel('issue')}</option>
      </select>
    </div>
  );
};

export default Status;
