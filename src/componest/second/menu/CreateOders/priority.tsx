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
    <div className="PrioritySection">
      <label>Priority:</label>
      <select
        name="priority"
        value={priority}
        onChange={handlePriorityChange}
        style={{
          borderColor: getPriorityColor(),
          color: getPriorityColor()
        }}
      >
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
    </div>
  );
};

export default Priority;
