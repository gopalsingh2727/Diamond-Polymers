import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeviceAccess, resetDeviceAccessState } from "../../../../redux/deviceAccess/deviceAccessActions";
import { AppDispatch, RootState } from "../../../../../store";

const DeviceAccessCreate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error, createdDevice } = useSelector(
    (state: RootState) => state.deviceAccess
  );

  const [showPassword, setShowPassword] = useState(false);
  const [displayedDeviceId, setDisplayedDeviceId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    deviceName: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  // Show device ID only once when device is created
  useEffect(() => {
    if (success && createdDevice && !displayedDeviceId) {
      // Store the device ID from the response
      const deviceId = (createdDevice as any).deviceId || createdDevice._id;
      
      if (deviceId) {
        setDisplayedDeviceId(deviceId);
        
        setFormData({
          deviceName: "",
          location: "",
          password: "",
          confirmPassword: "",
        });
      }
    }
  }, [success, createdDevice, displayedDeviceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseModal = () => {
    setDisplayedDeviceId(null);
    // Clear Redux success state to prevent showing popup again
    dispatch(resetDeviceAccessState());
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.deviceName.trim()) {
      alert("Device name is required");
      return;
    }

    if (!formData.location.trim()) {
      alert("Device location is required");
      return;
    }

    if (!formData.password) {
      alert("Password is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    dispatch(createDeviceAccess(formData));
  };

  const inputType = (field: string) =>
    showPassword && field.includes("password") ? "text" : "password";

  return (
    <div className="form-grid">
      {/* Column 1: Device Name + Location */}
      <div className="form-column">
        <div className="form-input-group">
          <label className="input-label">Device Name *</label>
          <input
            name="deviceName"
            type="text"
            className="form-input"
            placeholder="Enter device name"
            value={formData.deviceName}
            onChange={handleChange}
          />
          <small style={{ color: "#666", fontSize: "0.85rem" }}>
            Device ID will be auto-generated
          </small>
        </div>
        <div className="form-input-group">
          <label className="input-label">Device Location *</label>
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
          <label className="input-label">Password *</label>
          <div style={{ position: "relative" }}>
            <input
              name="password"
              type={inputType("password")}
              className="form-input"
              placeholder="Enter password (min 6 characters)"
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
          <label className="input-label">Confirm Password *</label>
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

      {/* Column 3: Submit + Feedback */}
      <div className="form-column">
        <div className="form-input-group">
          <button
            type="button"
            onClick={handleSubmit}
            className="save-button"
            disabled={loading}
          >
            {loading ? "Creating Device..." : "Create Device"}
          </button>
          {/* Success Modal Popup */}
          {displayedDeviceId && (
            <>
              {/* Backdrop */}
              <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 9998,
              }              } onClick={handleCloseModal} />
              
              {/* Modal */}
              <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                zIndex: 9999,
                minWidth: "400px",
                maxWidth: "90%",
              }}>
                {/* Close Button */}
                <button
                  onClick={handleCloseModal}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#666",
                    lineHeight: "1",
                    padding: "4px 8px",
                  }}
                  title="Close"
                >
                  ×
                </button>

                {/* Success Content */}
                <div style={{ textAlign: "center", marginTop: "8px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
                    ✅
                  </div>
                  <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#059669", marginBottom: "16px" }}>
                    Device Created Successfully!
                  </div>
                  
                  <div style={{ 
                    background: "#f0f9ff", 
                    border: "2px solid #0ea5e9", 
                    borderRadius: "8px", 
                    padding: "16px",
                    marginBottom: "16px"
                  }}>
                    <div style={{ fontSize: "0.9rem", color: "#0369a1", marginBottom: "8px", fontWeight: "600" }}>
                      Device ID:
                    </div>
                    <div style={{ 
                      fontSize: "1.4rem", 
                      fontWeight: "700", 
                      color: "#0c4a6e",
                      fontFamily: "monospace",
                      letterSpacing: "1px",
                      marginBottom: "12px"
                    }}>
                      {displayedDeviceId}
                    </div>
                    <div style={{ 
                      fontSize: "0.9rem", 
                      color: "#0369a1",
                      fontStyle: "italic"
                    }}>
                      💡 Use this ID to login to the device
                    </div>
                  </div>

                  {/* Close Button at Bottom */}
                  <button
                    onClick={handleCloseModal}
                    style={{
                      backgroundColor: "#0ea5e9",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 24px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
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