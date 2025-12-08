import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMachineType, updateMachineType, deleteMachineType } from "../../../../redux/create/machineType/machineTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import "./createMachineType.css";

interface CreateMachineTypeProps {
  initialData?: {
    _id: string;
    type: string;
    description: string;
    isActive?: boolean;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateMachineType: React.FC<CreateMachineTypeProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const [machineTypeName, setMachineTypeName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  const { loading } = useSelector(
    (state: RootState) => state.machineTypeCreate
  );

  // Load data in edit mode
  useEffect(() => {
    if (initialData) {
      setMachineTypeName(initialData.type || "");
      setDescription(initialData.description || "");
      setIsActive(initialData.isActive ?? true);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!machineTypeName.trim() || !description.trim()) {
      toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    const saveAction = isEditMode
      ? () => dispatch(updateMachineType(initialData!._id, machineTypeName, description, isActive))
      : () => dispatch(addMachineType(machineTypeName, description, isActive));

    const successMsg = isEditMode ? 'Machine type updated!' : 'Machine type added!';

    handleSave(saveAction, {
      successMessage: successMsg,
      onSuccess: () => {
        setMachineTypeName("");
        setDescription("");
        setIsActive(true);
        if (onSaveSuccess) onSaveSuccess();
      }
    });
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Delete this machine type?")) return;

    try {
      await dispatch(deleteMachineType(initialData._id));
      toast.success('Deleted', 'Machine type deleted');
      setTimeout(() => onSaveSuccess?.(), 1000);
    } catch {
      toast.error('Error', 'Failed to delete');
    }
  };

  return (
    <div className="createMachineType-container">
      <div className="createMachineType-form">
        {/* Header with Back/Delete for edit mode */}
        {isEditMode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              ← Back to List
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        )}

        <h2 className="createMachineType-title">
          {isEditMode ? `Edit: ${initialData?.type}` : 'Create Machine Type'}
        </h2>

        <div className="createMachineType-group">
          <label className="createMachineType-label">Machine Type Name *</label>
          <input
            type="text"
            value={machineTypeName}
            onChange={(e) => setMachineTypeName(e.target.value)}
            className="createMachineType-input"
            placeholder="Enter Machine Type"
          />
        </div>

        <div className="createMachineType-group">
          <label className="createMachineType-label">Description *</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="createMachineType-input"
            placeholder="Enter Description"
          />
        </div>

        <div className="createMachineType-group">
          <label className="createMachineType-label">Status</label>
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

        <button
          className="createMachineType-button"
          onClick={handleSubmit}
          disabled={!machineTypeName.trim() || !description.trim() || saveState === 'saving'}
        >
          {saveState === 'saving' ? 'Saving...' : isEditMode ? 'Update' : 'Add Machine Type'}
        </button>

        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  );
};

export default CreateMachineType;
