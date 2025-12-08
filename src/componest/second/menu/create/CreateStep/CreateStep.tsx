import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../store";
import { createStep, updateStep, deleteStep } from "../../../../redux/create/CreateStep/StpeActions";
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import "./createStep.css";

interface CreateStepProps {
  initialData?: {
    _id: string;
    stepName: string;
    machines?: { machineId: string; sequence?: number }[];
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateStep: React.FC<CreateStepProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch<AppDispatch>();
  const [stepName, setStepName] = useState("");
  const [machines, setMachines] = useState<{ machineId: string }[]>([{ machineId: "" }]);

  const { saveState, handleSave, toast } = useCRUD();
  const { machines: machineList } = useFormDataCache();

  useEffect(() => {
    if (initialData) {
      setStepName(initialData.stepName || "");
      if (initialData.machines && initialData.machines.length > 0) {
        setMachines(initialData.machines.map(m => ({ machineId: m.machineId })));
      }
    }
  }, [initialData]);

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
    setMachines(machines.filter((_, i) => i !== index));
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
      machines: filtered.map((m, i) => ({ machineId: m.machineId, sequence: i + 1 })),
    };

    const saveAction = isEditMode
      ? () => dispatch(updateStep(initialData!._id, stepData))
      : () => dispatch(createStep(stepData));

    handleSave(saveAction, {
      successMessage: isEditMode ? 'Step updated!' : 'Production step created!',
      onSuccess: () => {
        setStepName("");
        setMachines([{ machineId: "" }]);
        if (onSaveSuccess) onSaveSuccess();
      }
    });
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Delete this step?")) return;
    try {
      await dispatch(deleteStep(initialData._id));
      toast.success('Deleted', 'Step deleted');
      setTimeout(() => onSaveSuccess?.(), 1000);
    } catch {
      toast.error('Error', 'Failed to delete');
    }
  };

  return (
    <div className="productionsstep-container">
      <div className="productionsstep-form">
        {isEditMode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button type="button" onClick={onCancel} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              ← Back to List
            </button>
            <button type="button" onClick={handleDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        )}

        <h2 className="productionsstep-title">{isEditMode ? `Edit: ${initialData?.stepName}` : 'Create Production Step'}</h2>

        <div className="productionsstep-group">
          <label className="productionsstep-label">Step Name *</label>
          <input type="text" value={stepName} onChange={(e) => setStepName(e.target.value)} className="productionsstep-input" placeholder="Enter Step Name" />
        </div>

        <div className="productionsstep-group">
          <div className="productionsstep-machineHeader">
            <label className="productionsstep-label">Machines *</label>
            <button type="button" className="productionsstep-addBtn" onClick={handleAddMachine}>+ Add Machine</button>
          </div>

          {machines.map((machine, index) => (
            <div className="productionsstep-machineRow" key={index}>
              <div className="productionsstep-inputWrapper">
                <select className="productionsstep-select" value={machine.machineId} onChange={(e) => handleChange(index, e.target.value)}>
                  <option value="">Select Machine</option>
                  {machineList.map((m: any) => (
                    <option key={m._id} value={m._id}>{m.machineName} ({m.machineType?.type || m.machineType})</option>
                  ))}
                </select>
              </div>
              {machines.length > 1 && (
                <button type="button" className="productionsstep-removeBtn" onClick={() => handleRemoveMachine(index)}>×</button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="productionsstep-button" onClick={handleSubmit} disabled={saveState === 'loading'}>
          {saveState === 'loading' ? 'Saving...' : isEditMode ? 'Update Step' : 'Save Production Step'}
        </button>

        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  );
};

export default CreateStep;
