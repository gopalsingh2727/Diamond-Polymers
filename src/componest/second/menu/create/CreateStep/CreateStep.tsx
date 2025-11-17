import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { createStep } from "../../../../redux/create/CreateStep/StpeActions";
import { getMachines } from "../../../../redux/create/machine/MachineActions";
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import "./createStep.css";

const CreateStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [stepName, setStepName] = useState("");
  const [machines, setMachines] = useState<{ machineId: string }[]>([{ machineId: "" }]);

  // 🚀 CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  const { machines: machineList, loading } = useSelector(
    (state: RootState) => state.machineList
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

  const handleSubmit = () => {
    const filtered = machines.filter((m) => m.machineId);

    if (!stepName.trim()) {
      toast.error('Validation Error', 'Step name is required');
      return;
    }

    if (filtered.length === 0) {
      toast.error('Validation Error', 'At least one machine is required');
      return;
    }

    const stepData = {
      stepName,
      machines: filtered.map((m, i) => ({
        machineId: m.machineId,
        sequence: i + 1,
      })),
    };

    handleSave(
      () => dispatch(createStep(stepData)),
      {
        successMessage: 'Production step created successfully!',
        onSuccess: () => {
          setStepName("");
          setMachines([{ machineId: "" }]);
        }
      }
    );
  };

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

        <ActionButton
          type="save"
          state={saveState}
          onClick={handleSubmit}
          className="save-button"
        >
          Save Production Step ✓
        </ActionButton>

        {/* Toast notifications */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  );
};

export default CreateStep;
