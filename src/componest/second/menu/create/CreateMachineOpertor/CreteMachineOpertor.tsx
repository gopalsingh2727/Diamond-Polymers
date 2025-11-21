import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOperator } from "../../../../redux/create/CreateMachineOpertor/MachineOpertorActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import "../CreateStep/createStep.css";
import "../../CreateOders/CreateOders.css";

type OperatorData = {
  username: string;
  pin: string;
  confirmPin: string;
  machineId: string;
};

const CreteMachineOpertor = () => {
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

  useEffect(() => {
    if (success) {
      setFormData({
        username: "",
        pin: "",
        confirmPin: "",
        machineId: "",
      });
    }
  }, [success]);

  const handleChange = (field: keyof OperatorData, value: string) => {
    if (field === 'pin' || field === 'confirmPin') {
      if (value && (!/^\d*$/.test(value) || value.length > 4)) {
        return;
      }
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (formData.pin !== formData.confirmPin) {
      alert("PINs do not match!");
      return;
    }

    if (formData.pin.length !== 4) {
      alert("PIN must be exactly 4 digits!");
      return;
    }

    if (!formData.username || !formData.pin || !formData.machineId) {
      alert("All fields are required!");
      return;
    }

    dispatch(
      createOperator({
        username: formData.username,
        pin: formData.pin,
        machineId: formData.machineId,
      })
    );
  };

  return (
    <div className="create-step-container">
      <div className="step-form-wrapper">
        <h2 className="form-title">Create Machine Operator</h2>

        <div className="step-name-group">
          <label className="form-label">Username *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            className="createDivInput createDivInputwidth"
            placeholder="Enter username"
          />
        </div>

        <div className="step-name-group">
          <label className="form-label">PIN (4 digits) *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPin ? "text" : "password"}
              value={formData.pin}
              onChange={(e) => handleChange("pin", e.target.value)}
              className="createDivInput createDivInputwidth"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              {showPin ? "🙈" : "👁"}
            </button>
          </div>
          <small style={{ color: "#666", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
            {formData.pin.length}/4 digits
          </small>
        </div>

        <div className="step-name-group">
          <label className="form-label">Confirm PIN *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPin ? "text" : "password"}
              value={formData.confirmPin}
              onChange={(e) => handleChange("confirmPin", e.target.value)}
              className="createDivInput createDivInputwidth"
              placeholder="Confirm 4-digit PIN"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
            />
          </div>
          {formData.pin && formData.confirmPin && (
            <small
              style={{
                color: formData.pin === formData.confirmPin ? "green" : "red",
                fontSize: "0.85rem",
                marginTop: "4px",
                display: "block"
              }}
            >
              {formData.pin === formData.confirmPin ? "✓ PINs match" : "✗ PINs do not match"}
            </small>
          )}
        </div>

        <div className="step-name-group">
          <label className="form-label">Machine *</label>
          <select
            value={formData.machineId}
            onChange={(e) => handleChange("machineId", e.target.value)}
            className="createDivInput createDivInputwidth machine-select"
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
          className="save-button"
          disabled={loading || formData.pin.length !== 4 || formData.pin !== formData.confirmPin}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {success && <div className="success-msg">Operator created successfully!</div>}
        {error && <div className="error-msg">{error}</div>}
      </div>
    </div>
  );
};

export default CreteMachineOpertor;
