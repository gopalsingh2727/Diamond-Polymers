import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMachines } from "../../../../redux/create/machine/MachineActions";
import { createOperator } from "../../../../redux/create/CreateMachineOpertor/MachineOpertorActions";
import { RootState } from "../../../../redux/rootReducer";
// import "./createMachineOpertor.css"
import { AppDispatch } from "../../../../../store";

type OperatorData = {
  username: string;
  password: string;
  confirmPassword: string;
  machineId: string;
};

const CreteMachineOpertor = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<OperatorData>({
    username: "",
    password: "",
    confirmPassword: "",
    machineId: "",
  });
  const { success, error, loading } = useSelector(
    (state: RootState) => state.operatorCreate
  );

  const [showPassword, setShowPassword] = useState(false);

  const { machines: machineList } = useSelector(
    (state: RootState) => state.machineList
  );

  useEffect(() => {
    dispatch(getMachines());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        machineId: "",
      });
    }
  }, [success]);

  const handleChange = (field: keyof OperatorData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.username || !formData.password || !formData.machineId) {
      alert("All fields are required!");
      return;
    }

    dispatch(
      createOperator({
        username: formData.username,
        password: formData.password,
        machineId: formData.machineId,
      })
    );
  };

  return (
    <div className="form-grid">
      {/* Row 1: Username */}
      <div className="form-column">
        <div className="form-input-group">
          <label className="input-label">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            className="form-input"
            placeholder="Enter username"
          />
        </div>
      </div>

      {/* Row 2: Password + Confirm Password */}
      <div className="form-column">
        <div className="form-input-group">
          <label className="input-label">Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="form-input"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>
        <div className="form-input-group">
          <label className="input-label">Confirm Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="form-input"
              placeholder="Confirm password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Machine Name Dropdown */}
      <div className="form-column">
        <div className="form-input-group">
          <label className="input-label">Machine</label>
          <select
            value={formData.machineId}
            onChange={(e) => handleChange("machineId", e.target.value)}
            className="form-input"
          >
            <option value="">Select machine</option>
            {machineList.map((machine: any) => (
              <option key={machine._id} value={machine._id}>
                {machine.machineName} ({machine.machineType?.type || machine.machineType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="form-column">
        <div className="form-input-group">
          <button type="button" onClick={handleSubmit} className="save-button" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
          {success && <div className="success-msg">Operator created successfully!</div>}
          {error && <div className="error-msg">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default CreteMachineOpertor;
