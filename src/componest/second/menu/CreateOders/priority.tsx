import { useState, useEffect } from "react";

interface PriorityProps {
  onPriorityChange?: (priority: 'low' | 'normal' | 'high' | 'urgent') => void;
  initialPriority?: 'low' | 'normal' | 'high' | 'urgent';
  isEditMode?: boolean;
}

const Priority = ({ onPriorityChange, initialPriority }: PriorityProps) => {
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>(initialPriority || 'normal');

  // Initialize priority from initial data
  useEffect(() => {
    if (initialPriority) {
      setPriority(initialPriority);
    }
  }, [initialPriority]);

  // Call the parent callback whenever priority changes
  useEffect(() => {
    if (onPriorityChange) {
      onPriorityChange(priority);
    }
  }, [priority, onPriorityChange]);

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as 'low' | 'normal' | 'high' | 'urgent');
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent':
        return '#dc3545';
      case 'high':
        return '#fd7e14';
      case 'normal':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };



  return (
    <div>
      <div className="Notes" style={{ marginTop: '15px' }}>
        <h3 className="ManufacturingStepsTitel" >Priority</h3>
        <div className="ManufacturingStepsTitel" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
     
          <select
            name="priority"
            value={priority}
            onChange={handlePriorityChange}
            style={{
              padding: '10px',
              fontSize: '14px',
              borderRadius: '4px',
              border: `2px solid ${getPriorityColor()}`,
              backgroundColor: 'white',
              color: getPriorityColor(),
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1,
              maxWidth: '300px'
            }}
          >
            <option value="low">Low Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent Priority</option>
          </select>
        </div>
      
        

      </div>
    </div>
  );
};

export default Priority;
