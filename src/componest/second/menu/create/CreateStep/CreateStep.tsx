import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { createStep } from "../../../../redux/create/CreateStep/StpeActions";
import { getMachines } from "../../../../redux/create/machine/MachineActions";
import "./createStep.css";

const CreateStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [stepName, setStepName] = useState("");
  const [machines, setMachines] = useState<{ machineId: string }[]>([{ machineId: "" }]);

  const { machines: machineList, loading, error: machineError } = useSelector(
    (state: RootState) => state.machineList
  );
 

  const { success, error: stepError } = useSelector(
    (state: RootState) => state.stepCreate
  );

  useEffect(() => {
    dispatch(getMachines());
  }, [dispatch]);

  const handleChange = (index: number, value: string) => {
    const updated = [...machines];
    updated[index].machineId = value;
    setMachines(updated);
  };

  const handleAddMachine = () => {
    setMachines([...machines, { machineId: "" }]);
  };

  const handleRemoveMachine = (index: number) => {
    if (machines.length <= 1) return;
    const updated = machines.filter((_, i) => i !== index);
    setMachines(updated);
  };

  const handleSave = () => {
    const filtered = machines.filter((m) => m.machineId);

    if (!stepName.trim()) {
      alert("Step name is required");
      return;
    }

    if (filtered.length === 0) {
      alert("At least one machine is required");
      return;
    }

    const stepData = {
      stepName,
      machines: filtered.map((m, i) => ({
        machineId: m.machineId,
        sequence: i + 1,
      })),
    };

    dispatch(createStep(stepData));
  };

  useEffect(() => {
    if (success) {
      setStepName("");
      setMachines([{ machineId: "" }]);
    }
  }, [success]);

  return (
    <div className="create-step-container">
      <div className="step-form-wrapper">
        <h2 className="form-title">Create Production Step</h2>

        <div className="step-name-group">
          <label className="form-label">Step Name *</label>
          <input
            type="text"
            value={stepName}
            onChange={(e) => setStepName(e.target.value)}
            className="form-input"
            placeholder="Enter Step Name"
          />
        </div>

        <div className="machine-group">
          <div className="machine-header">
            <label className="form-label">Machines *</label>
            <button
              type="button"
              className="add-machine-btn"
              onClick={handleAddMachine}
            >
              + Add Machine
            </button>
          </div>

          {machines.map((machine, index) => (
            <div className="machine-row" key={index}>
              <div className="input-wrapper">
                <select
                  className="form-input machine-select"
                  value={machine.machineId}
                  onChange={(e) => handleChange(index, e.target.value)}
                >
                  <option value="">Select Machine</option>
                  {machineList.map((m: any) => (
                    <option key={m._id} value={m._id}>
                      {m.machineName} ({m.machineType?.type || m.machineType})
                    </option>
                  ))}
                </select>
                {machines.length > 1 && (
                  <button
                    type="button"
                    className="remove-machine-btn"
                    onClick={() => handleRemoveMachine(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          className="save-button"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Production Step ✓"}
        </button>

        {machineError && <div className="error-msg">{machineError}</div>}
        {success && <div className="success-msg">Step saved successfully!</div>}
        {stepError && <div className="error-msg">{stepError}</div>}
      </div>
    </div>
  );
};

export default CreateStep;
