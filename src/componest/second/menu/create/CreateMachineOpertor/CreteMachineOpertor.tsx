import { useState } from "react";
import "./CreateMachineOpertor.css";

type OperatorData = {
  username: string;
  password: string;
  confirmPassword: string;
  pin: string;
  confirmPin: string;
  machineName: string;
};

const CreteMachineOpertor = () => {
  const [formData, setFormData] = useState<OperatorData>({
    username: "",
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: "",
    machineName: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: keyof OperatorData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (formData.pin !== formData.confirmPin) {
      alert("PINs do not match!");
      return;
    }

    // dispatch(addOperator(formData));
    
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      pin: "",
      confirmPin: "",
      machineName: "",
    });
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
    
      {/* Row 3: PIN + Confirm PIN */}
      <div className="form-column">
        <div className="form-input-group">
          <label className="input-label">PIN</label>
          <input
            type="text"
            value={formData.pin}
            onChange={(e) => handleChange("pin", e.target.value)}
            className="form-input"
            placeholder="Enter PIN"
          />
        </div>
        <div className="form-input-group">
          <label className="input-label">Confirm PIN</label>
          <input
            type="text"
            value={formData.confirmPin}
            onChange={(e) => handleChange("confirmPin", e.target.value)}
            className="form-input"
            placeholder="Confirm PIN"
          />
        </div>
      </div>
    
      {/* Row 4: Machine Name */}
      <div className="form-column">
        <div className="form-input-group">
          <label className="input-label">Machine Name</label>
          <input
            type="text"
            value={formData.machineName}
            onChange={(e) => handleChange("machineName", e.target.value)}
            className="form-input"
            placeholder="Enter machine name"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="form-column">
        <div className="form-input-group">
          <button
            type="button"
            onClick={handleSubmit}
            className="save-button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreteMachineOpertor;