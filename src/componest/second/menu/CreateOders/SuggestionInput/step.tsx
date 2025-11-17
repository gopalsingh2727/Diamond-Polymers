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
  
  if (loading) return <div className="suggestion-loading">Loading suggestions...</div>;
  if (error) return <div className="suggestion-error">Error loading suggestions</div>;
  if (filtered.length === 0) return null;

  return (
    <ul className="suggestion-list">
      {filtered.map((step) => (
        <li
          key={step._id}
          className="suggestionItem"
          onClick={() => onSelect(step)}
        >
          {step.stepName}
        </li>
      ))}
    </ul>
  );
};

export default StepSuggestions;