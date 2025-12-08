import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createMachine, updateMachine, deleteMachine } from "../../../../redux/create/machine/MachineActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import "./createMachine.css";

// Props interface for edit mode support
interface CreateMachineProps {
  initialData?: {
    _id: string;
    machineName: string;
    machineType: { _id: string; type: string };
    isActive?: boolean;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateMachine: React.FC<CreateMachineProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  // Edit mode detection
  const isEditMode = !!initialData;
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [isActive, setIsActive] = useState(true);

  // CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Get data from cached form data
  const { machineTypes, loading } = useFormDataCache();

  // EDIT MODE: Populate form with initialData when editing
  useEffect(() => {
    if (initialData) {
      setMachineName(initialData.machineName || "");
      setMachineType(initialData.machineType?._id || "");
      setIsActive(initialData.isActive ?? true);
    }
  }, [initialData]);

  useEffect(() => {
    containerRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const isValidForm = () => {
    return machineName.trim().length > 0 && machineType;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isValidForm()) {
      toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    const newMachine = {
      machineName: machineName.trim(),
      machineType,
      isActive
    };

    // Use updateMachine for edit mode, createMachine for new
    const saveAction = isEditMode
      ? () => dispatch(updateMachine(initialData!._id, newMachine))
      : () => dispatch(createMachine(newMachine));

    const successMsg = isEditMode
      ? 'Machine updated successfully!'
      : 'Machine created successfully!';

    handleSave(saveAction, {
      successMessage: successMsg,
      onSuccess: () => {
        setTimeout(() => {
          resetForm();
          if (onSaveSuccess) {
            onSaveSuccess();
          } else {
            navigate(-1);
          }
        }, 1500);
      }
    });
  };

  // Handle delete (only in edit mode)
  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Are you sure you want to delete this machine?")) return;

    try {
      await dispatch(deleteMachine(initialData._id));
      toast.success('Deleted', 'Machine deleted successfully');
      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete machine');
    }
  };

  const resetForm = () => {
    setMachineName("");
    setMachineType("");
    setIsActive(true);
  };

  return (
    <div ref={containerRef} className="createMachineCss" aria-labelledby="CreateMachineFormTitle">
      <form onSubmit={handleSubmit} className="CreateMachineForm">
        {/* Header with Back/Delete buttons for edit mode */}
        {isEditMode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ← Back to List
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Delete Machine
            </button>
          </div>
        )}

        <h2 id="CreateMachineFormTitle" className="CreateMachineFormTitle">
          {isEditMode ? `Edit Machine: ${initialData?.machineName}` : 'Create Machine'}
        </h2>

        <div className="CreateMachineFormGroup">
          <label htmlFor="CreateMachineMachineType" className="CreateMachineFormLabel">
            Machine Type *
          </label>
          <select
            id="CreateMachineMachineType"
            value={machineType}
            onChange={(e) => setMachineType(e.target.value)}
            className="createDivInput"
            aria-required="true"
          >
            <option value="">Select Machine Type</option>
            {loading ? (
              <option disabled>Loading...</option>
            ) : (
              Array.isArray(machineTypes) && machineTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.type}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="CreateMachineFormGroup">
          <label htmlFor="CreateMachineMachineName" className="CreateMachineFormLabel">
            Machine Name *
          </label>
          <input
            id="CreateMachineMachineName"
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className="createDivInput"
            placeholder="Enter machine name"
            aria-required="true"
          />
        </div>

        <div className="CreateMachineFormGroup">
          <label className="CreateMachineFormLabel">Status</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsActive(true)}
              style={{
                padding: '8px 16px',
                background: isActive ? '#22c55e' : '#e5e7eb',
                color: isActive ? 'white' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: isActive ? '600' : '400'
              }}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setIsActive(false)}
              style={{
                padding: '8px 16px',
                background: !isActive ? '#ef4444' : '#e5e7eb',
                color: !isActive ? 'white' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: !isActive ? '600' : '400'
              }}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="CreateMachineFormActions">
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
            disabled={!isValidForm()}
            className="CreateMachineSaveButton"
          >
            {isEditMode ? 'Update Machine' : 'Create Machine'}
          </ActionButton>
        </div>
      </form>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateMachine;
