import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeviceAccess, updateDeviceAccess, deleteDeviceAccess, resetDeviceAccessState, getDeviceAccessList } from "../../../../redux/deviceAccess/deviceAccessActions";
import { AppDispatch, RootState } from "../../../../../store";
import { Copy, Check } from "lucide-react";
import "./deviceaccess.css";

interface DeviceAccessCreateProps {
  initialData?: {
    _id: string;
    deviceName?: string;
    location?: string;
    deviceId?: string;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const DeviceAccessCreate: React.FC<DeviceAccessCreateProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEditMode = !!initialData?._id;

  const { loading, success, error, createdDevice } = useSelector(
    (state: RootState) => state.deviceAccess
  );

  const [showPassword, setShowPassword] = useState(false);
  const [displayedDeviceId, setDisplayedDeviceId] = useState<string | null>(null);
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  // Load data when editing
  useEffect(() => {
    if (initialData && initialData._id) {
      setFormData({
        deviceName: initialData.deviceName || "",
        location: initialData.location || "",
        password: "", // Don't show old password
        confirmPassword: "",
      });
    }
  }, [initialData]);

  // Show device ID only once when device is created (not in edit mode)
  useEffect(() => {
    if (!isEditMode && success && createdDevice && !displayedDeviceId) {
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
  }, [success, createdDevice, displayedDeviceId, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCloseModal = () => {
    setDisplayedDeviceId(null);
    // Clear Redux success state to prevent showing popup again
    dispatch(resetDeviceAccessState());
  };

  const copyDeviceId = async () => {
    if (initialData?._id) {
      try {
        await navigator.clipboard.writeText(initialData._id);
        setCopiedDeviceId(true);
        setTimeout(() => setCopiedDeviceId(false), 2000);
      } catch (err) {
        console.error('Failed to copy device ID:', err);
      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.deviceName.trim()) {
      alert("Device name is required");
      return;
    }

    if (!formData.location.trim()) {
      alert("Device location is required");
      return;
    }

    if (isEditMode) {
      // Update mode - password is optional
      if (formData.password && formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Build update payload - only include password if provided
      const updatePayload: any = {
        deviceName: formData.deviceName,
        location: formData.location,
      };

      if (formData.password && formData.password.trim()) {
        updatePayload.password = formData.password;
      }

      try {
        await dispatch(updateDeviceAccess(initialData!._id, "updateDetails", updatePayload));
        alert("Device access updated successfully!");
        dispatch(getDeviceAccessList());
        if (onSaveSuccess) onSaveSuccess();
      } catch (err) {
        alert("Failed to update device access.");
      }
    } else {
      // Create mode - password is required
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

      dispatch(createDeviceAccess({
        deviceName: formData.deviceName,
        location: formData.location,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }));
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm(`Delete device "${initialData.deviceName}"?`)) return;

    try {
      await dispatch(deleteDeviceAccess(initialData._id));
      alert("Device deleted successfully!");
      dispatch(getDeviceAccessList());
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert("Failed to delete device.");
    }
  };

  const inputType = (field: string) =>
    showPassword && field.includes("password") ? "text" : "password";

  return (
    <div className="createDeviceAccess-container">
      <div className="createDeviceAccess-form">
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

        <h2 className="createDeviceAccess-title">
          {isEditMode ? `Edit: ${initialData?.deviceName}` : 'Create Device Access'}
        </h2>

        <div className="createDeviceAccess-group">
          <label className="createDeviceAccess-label">Device Name *</label>
          <input
            name="deviceName"
            type="text"
            className="createDeviceAccess-input"
            placeholder="Enter device name"
            value={formData.deviceName}
            onChange={handleChange}
          />
        </div>

        <div className="createDeviceAccess-group">
          <label className="createDeviceAccess-label">Device Location *</label>
          <input
            name="location"
            type="text"
            className="createDeviceAccess-input"
            placeholder="Enter location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        {/* Show Device ID only in edit mode */}
        {isEditMode && initialData?._id && (
          <div className="createDeviceAccess-group">
            <label className="createDeviceAccess-label">Device ID</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="createDeviceAccess-input"
                value={initialData._id}
                readOnly
                style={{ backgroundColor: "#f5f5f5", paddingRight: "45px" }}
              />
              <button
                type="button"
                onClick={copyDeviceId}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px"
                }}
                title="Copy Device ID"
              >
                {copiedDeviceId ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        )}

        <div className="createDeviceAccess-group">
          <label className="createDeviceAccess-label">
            {isEditMode ? 'Password (leave blank to keep current)' : 'Password *'}
          </label>
          <div className="createDeviceAccess-passwordWrapper">
            <input
              name="password"
              type={inputType("password")}
              className="createDeviceAccess-input"
              placeholder={isEditMode ? "Enter new password (optional)" : "Enter password (min 6 characters)"}
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="createDeviceAccess-passwordToggle"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <div className="createDeviceAccess-group">
          <label className="createDeviceAccess-label">Confirm Password</label>
          <div className="createDeviceAccess-passwordWrapper">
            <input
              name="confirmPassword"
              type={inputType("confirmPassword")}
              className="createDeviceAccess-input"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="createDeviceAccess-passwordToggle"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="createDeviceAccess-button"
          disabled={loading}
        >
          {loading ? "Saving..." : (isEditMode ? "Update Device" : "Create Device")}
        </button>
          {/* Success Modal Popup - only for create mode */}
          {!isEditMode && displayedDeviceId && (
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
        {error && <div className="createDeviceAccess-error">{error}</div>}
      </div>
    </div>
  );
};

export default DeviceAccessCreate;