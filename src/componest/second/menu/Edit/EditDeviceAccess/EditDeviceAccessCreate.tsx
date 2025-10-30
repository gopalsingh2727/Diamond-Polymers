import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDeviceAccessList,
  updateDeviceAccess,
} from "../../../../redux/deviceAccess/deviceAccessActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

interface DeviceAccessCreate {
  _id: string;
  deviceName?: string;
  location?: string;
  password?: string;
  pin?: string;
  createdAt?: string;
  updatedAt?: string;
}

const EditDeviceAccessCreate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { devices = [], loading, error } = useSelector(
    (state: RootState) => state.deviceAccess || {}
  );

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [form, setForm] = useState<Partial<DeviceAccessCreate>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter devices based on search term
  const filteredDevices = devices.filter((device: DeviceAccessCreate) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      device.deviceName?.toLowerCase().includes(search) ||
      device.location?.toLowerCase().includes(search)
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || filteredDevices.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredDevices.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredDevices[selectedRow];
        if (selected) {
          setForm(selected);
          setShowDetail(true);
        }
      }
    },
    [filteredDevices, selectedRow, showDetail]
  );

  useEffect(() => {
    dispatch(getDeviceAccessList());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Reset selected row when search changes
    setSelectedRow(0);
  }, [searchTerm]);

  const handleFormChange = (key: keyof DeviceAccessCreate, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form._id) return;

    if (!form.deviceName?.trim()) {
      alert("Device name is required");
      return;
    }

    if (form.password && form.password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (form.pin && form.pin !== confirmPin) {
      alert("PINs do not match");
      return;
    }

    try {
      await dispatch(updateDeviceAccess(form._id, "updateDevice", form));
      alert("Device access updated successfully!");
      setShowDetail(false);
      setConfirmPassword("");
      setConfirmPin("");
      dispatch(getDeviceAccessList());
    } catch (err) {
      alert("Failed to update device access.");
    }
  };

  const handleRowClick = (index: number, item: DeviceAccessCreate) => {
    setSelectedRow(index);
    setForm(item);
    setShowDetail(true);
    setConfirmPassword("");
    setConfirmPin("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="EditMachineType">
       {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError"  style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && devices.length > 0 ? (
        <>
          {/* Search Bar */}
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by device name or location..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  fontSize: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2d89ef'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#666',
              }}>
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '4px 8px',
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div style={{
              padding: '12px 16px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              whiteSpace: 'nowrap',
            }}>
              {filteredDevices.length} of {devices.length} devices
            </div>
          </div>

          {/* Table */}
          {filteredDevices.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Device Name</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((item: DeviceAccessCreate, index: number) => (
                  <tr
                    key={item._id}
                    className={selectedRow === index ? "bg-blue-100" : ""}
                    onClick={() => handleRowClick(index, item)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{item.deviceName || "N/A"}</td>
                    <td>{item.location || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999',
              fontSize: '16px',
            }}>
              No devices found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : showDetail && form ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => {
              setShowDetail(false);
              setConfirmPassword("");
              setConfirmPin("");
            }}>
              Back
            </button>
          </div>

          <div className="form-section">
            <label>Device Name:</label>
            <input
              name="deviceName"
              type="text"
              placeholder="Enter device name"
              value={form.deviceName || ""}
              onChange={(e) => handleFormChange("deviceName", e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Device Location:</label>
            <input
              name="location"
              type="text"
              placeholder="Enter location"
              value={form.location || ""}
              onChange={(e) => handleFormChange("location", e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Password (leave blank to keep current):</label>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password (optional)"
                value={form.password || ""}
                onChange={(e) => handleFormChange("password", e.target.value)}
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

          <div className="form-section">
            <label>Confirm Password:</label>
            <div style={{ position: "relative" }}>
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

          <div className="form-section">
            <label>Pin (leave blank to keep current):</label>
            <div style={{ position: "relative" }}>
              <input
                name="pin"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new pin (optional)"
                value={form.pin || ""}
                onChange={(e) => handleFormChange("pin", e.target.value)}
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

          <div className="form-section">
            <label>Confirm Pin:</label>
            <div style={{ position: "relative" }}>
              <input
                name="confirmPin"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm pin"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
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

          <button
            onClick={handleSave}
            className="save-button"
            disabled={
              loading ||
              !form.deviceName?.trim() ||
              (form.password && form.password !== confirmPassword) ||
              (form.pin && form.pin !== confirmPin)
            }
          >
            Save
          </button>

          <div className="info-section">
            <p>
              <strong>Created:</strong>{" "}
              {form.createdAt && new Date(form.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated:</strong>{" "}
              {form.updatedAt && new Date(form.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        !loading && <p>No devices available.</p>
      )}
    </div>
  );
};

export default EditDeviceAccessCreate;