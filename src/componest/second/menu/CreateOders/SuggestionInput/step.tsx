import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/rootReducer";
import { getSteps } from "../../../../redux/create/CreateStep/StpeActions";
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
  const dispatch = useDispatch();

  const { steps = [], loading, error } = useSelector(
    (state: RootState) => state.stepList
  );
 
  
  const [filtered, setFiltered] = useState<Step[]>([]);

  useEffect(() => {
    if (steps.length === 0 && !loading) {
      dispatch(getSteps() as any);
    }
  }, [dispatch, steps.length, loading]);

  useEffect(() => {
    if (stepName.trim().length > 0 && Array.isArray(steps)) {
      const searchTerm = stepName.toLowerCase();
      const results = steps.filter((step) =>
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