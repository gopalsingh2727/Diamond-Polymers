import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMachineType } from "../../../../redux/create/machineType/machineTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';

const CreateMachineType: React.FC = () => {
  const [machineTypeName, setMachineTypeName] = useState("");
  const [description, setDescription] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  // 🚀 CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  const { loading } = useSelector(
    (state: RootState) => state.machineTypeCreate
  );

  const handleAddMachineType = () => {
    if (!machineTypeName.trim() || !description.trim()) {
      toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    handleSave(
      () => dispatch(addMachineType(machineTypeName, description)),
      {
        successMessage: 'Machine type added successfully!',
        onSuccess: () => {
          setMachineTypeName("");
          setDescription("");
        }
      }
    );
  };

  return (
    <div className="form-grid">
      <h2 className="input-label">Machine Type</h2>
      <div className="form-column">
        <div className="form-input-group">
          <input
            value={machineTypeName}
            onChange={(e) => setMachineTypeName(e.target.value)}
            className="form-input"
            placeholder="Enter Machine Type"
          />
        </div>
        <div className="form-input-group">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            placeholder="Enter Description"
          />
        </div>
        <ActionButton
          type="save"
          state={saveState}
          onClick={handleAddMachineType}
          className="save-button"
          disabled={!machineTypeName.trim() || !description.trim()}
        >
          Add Machine Type
        </ActionButton>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateMachineType;