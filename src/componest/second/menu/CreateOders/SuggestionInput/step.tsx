import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/rootReducer";

interface Step {
  _id: string;
  stepName: string;
  branchId: {
    _id: string;
    name: string;
    location: string;
  };
  machines: {
    _id: string;
    status: string;
    reason: string;
    machineId: {
      _id: string;
      machineName: string;
      machineType: {
      type: string;
      };
      sizeX: string;
      sizeY: string;
      sizeZ: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Props {
  stepName: string;
  onSelect: (step: Step) => void;
}

const StepSuggestions: React.FC<Props> = ({ stepName, onSelect }) => {
  // ✅ OPTIMIZED: Use cached data from orderFormData
  const orderFormData = useSelector((state: RootState) => state.orderFormData);
  const steps = orderFormData?.data?.steps || [];
  const loading = orderFormData?.loading || false;
  const error = orderFormData?.error || null;

  const [filtered, setFiltered] = useState<Step[]>([]);

  useEffect(() => {
    if (stepName.trim().length > 0 && Array.isArray(steps)) {
      const searchTerm = stepName.toLowerCase();
      const results = steps.filter((step: any) =>
        step.stepName.toLowerCase().includes(searchTerm)
      );
      setFiltered(results.slice(0, 5));
    } else {
      setFiltered([]);
    }
  }, [stepName, steps]);
  
  if (loading) return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0 0 6px 6px',
      padding: '10px',
      fontSize: '12px',
      color: '#6b7280',
      zIndex: 1000
    }}>
      Loading steps...
    </div>
  );

  if (error) return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '0 0 6px 6px',
      padding: '10px',
      fontSize: '12px',
      color: '#dc2626',
      zIndex: 1000
    }}>
      Error loading steps
    </div>
  );

  if (filtered.length === 0) {
    // Show "no results" message if user is typing
    if (stepName.trim().length > 0) {
      return (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0 0 6px 6px',
          padding: '10px',
          fontSize: '12px',
          color: '#6b7280',
          zIndex: 1000
        }}>
          No steps found for "{stepName}"
        </div>
      );
    }
    return null;
  }

  return (
    <ul style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      maxHeight: '200px',
      overflowY: 'auto',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderTop: 'none',
      borderRadius: '0 0 6px 6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      listStyle: 'none',
      margin: 0,
      padding: 0
    }}>
      {filtered.map((step) => (
        <li
          key={step._id}
          style={{
            padding: '10px 12px',
            cursor: 'pointer',
            borderBottom: '1px solid #f3f4f6',
            fontSize: '13px',
            color: '#1f2937',
            transition: 'background 0.1s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          onClick={() => onSelect(step)}
        >
          <div style={{ fontWeight: '500' }}>{step.stepName}</div>
          {step.machines && step.machines.length > 0 && (
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              {step.machines.length} machine{step.machines.length > 1 ? 's' : ''}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default StepSuggestions;