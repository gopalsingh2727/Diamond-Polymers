import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOperator, updateOperator, deleteOperator } from "../../../../redux/create/CreateMachineOpertor/MachineOpertorActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import "./machineOperator.css";

type OperatorData = {
  username: string;
  pin: string;
  confirmPin: string;
  machineId: string;
};

interface CreteMachineOpertorProps {
  initialData?: {
    _id: string;
    username: string;
    machineId: string;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreteMachineOpertor: React.FC<CreteMachineOpertorProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<OperatorData>({
    username: "",
    pin: "",
    confirmPin: "",
    machineId: "",
  });
  const { success, error, loading } = useSelector(
    (state: RootState) => state.operatorCreate
  );

  const [showPin, setShowPin] = useState(false);

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { machines: machineList } = useFormDataCache();

  // Load data in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || "",
        pin: "",
        confirmPin: "",
        machineId: initialData.machineId || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (success) {
      setFormData({
        username: "",
        pin: "",
        confirmPin: "",
        machineId: "",
      });
      if (onSaveSuccess) onSaveSuccess();
    }
  }, [success, onSaveSuccess]);

  const handleChange = (field: keyof OperatorData, value: string) => {
    if (field === 'pin' || field === 'confirmPin') {
      if (value && (!/^\d*$/.test(value) || value.length > 4)) {
        return;
      }
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    // In edit mode, PIN is optional (only update if provided)
    if (formData.pin || formData.confirmPin) {
      if (formData.pin !== formData.confirmPin) {
        alert("PINs do not match!");
        return;
      }
      if (formData.pin.length !== 4) {
        alert("PIN must be exactly 4 digits!");
        return;
      }
    }

    if (!formData.username || !formData.machineId) {
      alert("Username and Machine are required!");
      return;
    }

    // For create mode, PIN is required
    if (!isEditMode && !formData.pin) {
      alert("PIN is required!");
      return;
    }

    const operatorData: any = {
      username: formData.username,
      machineId: formData.machineId,
    };

    // Only include PIN if provided
    if (formData.pin) {
      operatorData.pin = formData.pin;
    }

    if (isEditMode) {
      dispatch(updateOperator(initialData!._id, operatorData) as any);
    } else {
      dispatch(createOperator(operatorData));
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Delete this operator?")) return;
    try {
      await dispatch(deleteOperator(initialData._id) as any);
      alert("Operator deleted");
      if (onSaveSuccess) onSaveSuccess();
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="createMachineOperator-container">
      <div className="createMachineOperator-form">
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

        <h2 className="createMachineOperator-title">
          {isEditMode ? `Edit: ${initialData?.username}` : 'Create Machine Operator'}
        </h2>

        <div className="createMachineOperator-group">
          <label className="createMachineOperator-label">Username *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            className="createMachineOperator-input"
            placeholder="Enter username"
          />
        </div>

        <div className="createMachineOperator-group">
          <label className="createMachineOperator-label">
            PIN (4 digits) {isEditMode ? '(leave empty to keep current)' : '*'}
          </label>
          <div className="createMachineOperator-pinWrapper">
            <input
              type={showPin ? "text" : "password"}
              value={formData.pin}
              onChange={(e) => handleChange("pin", e.target.value)}
              className="createMachineOperator-input"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="createMachineOperator-pinToggle"
            >
              {showPin ? "🙈" : "👁"}
            </button>
          </div>
          <span className="createMachineOperator-hint">
            {formData.pin.length}/4 digits
          </span>
        </div>

        <div className="createMachineOperator-group">
          <label className="createMachineOperator-label">Confirm PIN *</label>
          <div className="createMachineOperator-pinWrapper">
            <input
              type={showPin ? "text" : "password"}
              value={formData.confirmPin}
              onChange={(e) => handleChange("confirmPin", e.target.value)}
              className="createMachineOperator-input"
              placeholder="Confirm 4-digit PIN"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
            />
          </div>
          {formData.pin && formData.confirmPin && (
            <span className={`createMachineOperator-hint ${formData.pin === formData.confirmPin ? 'success' : 'error'}`}>
              {formData.pin === formData.confirmPin ? "✓ PINs match" : "✗ PINs do not match"}
            </span>
          )}
        </div>

        <div className="createMachineOperator-group">
          <label className="createMachineOperator-label">Machine *</label>
          <select
            value={formData.machineId}
            onChange={(e) => handleChange("machineId", e.target.value)}
            className="createMachineOperator-select"
          >
            <option value="">Select machine</option>
            {machineList.map((machine: any) => (
              <option key={machine._id} value={machine._id}>
                {machine.machineName} ({machine.machineType?.type || machine.machineType})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="createMachineOperator-button"
          disabled={loading || (!isEditMode && formData.pin.length !== 4) || (formData.pin && formData.pin !== formData.confirmPin)}
        >
          {loading ? "Submitting..." : isEditMode ? "Update Operator" : "Create Operator"}
        </button>

        {success && <div className="createMachineOperator-success">{isEditMode ? 'Operator updated successfully!' : 'Operator created successfully!'}</div>}
        {error && <div className="createMachineOperator-error">{error}</div>}
      </div>
    </div>
  );
};

export default CreteMachineOpertor;
