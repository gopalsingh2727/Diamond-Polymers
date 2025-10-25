import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeviceAccess } from "../../../../redux/deviceAccess/deviceAccessActions";
import { AppDispatch, RootState } from "../../../../../store";

const DeviceAccessCreate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector(
    (state: RootState) => state.deviceAccess
  );

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: "",
    location: "",
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.deviceName.trim()) {
      alert("Device name is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      alert("PINs do not match");
      return;
    }

    dispatch(createDeviceAccess(formData));
  };

  const inputType = (field: string) =>
    showPassword && (field.includes("password") || field.includes("pin"))
      ? "text"
      : field.includes("password") || field.includes("pin")
      ? "password"
      : "text";

  return (
    <div className="form-grid">
      {/* Column 1: Device Name + Location */}
      <div className="form-column">
        <div className="form-input-group">
          <label className="input-label">Device Name</label>
          <input
            name="deviceName"
            type="text"
            className="form-input"
            placeholder="Enter device name"
            value={formData.deviceName}
            onChange={handleChange}
          />
        </div>
        <div className="form-input-group">
          <label className="input-label">Device Location</label>
          <input
            name="location"
            type="text"
            className="form-input"
            placeholder="Enter location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Column 2: Password + Confirm Password */}
      <div className="form-column">
        <div className="form-input-group">
          <label className="input-label">Password</label>
          <div style={{ position: "relative" }}>
            <input
              name="password"
              type={inputType("password")}
              className="form-input"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={toggleBtnStyle}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>
        <div className="form-input-group">
          <label className="input-label">Confirm Password</label>
          <div style={{ position: "relative" }}>
            <input
              name="confirmPassword"
              type={inputType("confirmPassword")}
              className="form-input"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={toggleBtnStyle}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>
      </div>

      {/* Column 3: Pin + Confirm Pin */}
      <div className="form-column">
        <div className="form-input-group">
          <label className="input-label">Pin</label>
          <div style={{ position: "relative" }}>
            <input
              name="pin"
              type={inputType("pin")}
              className="form-input"
              placeholder="Enter pin"
              value={formData.pin}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={toggleBtnStyle}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>
        <div className="form-input-group">
          <label className="input-label">Confirm Pin</label>
          <div style={{ position: "relative" }}>
            <input
              name="confirmPin"
              type={inputType("confirmPin")}
              className="form-input"
              placeholder="Confirm pin"
              value={formData.confirmPin}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={toggleBtnStyle}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>
      </div>

      {/* Column 4: Submit + Feedback */}
      <div className="form-column">
        <div className="form-input-group">
          <button
            type="button"
            onClick={handleSubmit}
            className="save-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          {success && <div className="success-msg">Device created successfully!</div>}
          {error && <div className="error-msg">{error}</div>}
        </div>
      </div>
    </div>
  );
};

const toggleBtnStyle: React.CSSProperties = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
};

export default DeviceAccessCreate;