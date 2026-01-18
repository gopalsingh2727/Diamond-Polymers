import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDeviceAccessList,
  updateDeviceAccess,
  deleteDeviceAccess,
  createDeviceAccess,
} from "../../../../redux/deviceAccess/deviceAccessActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { ToastContainer } from "../../../../../components/shared/Toast";
import "./editDeviceAccess.css";

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  branchId?: {
    _id: string;
    name: string;
  };
  machines?: Array<{
    machineId: string;
    machineName: string;
    machineType: string;
  }>;
}

const EditDeviceAccess: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { handleSave, handleUpdate, handleDelete: crudDelete, saveState, updateState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  // Get machines from cached form data
  const { machines: machineList } = useFormDataCache();

  // Keep device access from Redux
  const deviceAccessState = useSelector(
    (state: RootState) => state.v2.deviceAccess
  );
  const rawDeviceList = deviceAccessState?.list;
  const deviceList = Array.isArray(rawDeviceList) ? rawDeviceList : [];
  const loading = deviceAccessState?.loading;
  const error = deviceAccessState?.error;

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [machineId, setMachineId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Editable form fields
  const [editDeviceName, setEditDeviceName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Filter devices based on search term
  const filteredDevices = deviceList.filter((device: Device) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    const branchName = typeof device.branchId === 'object' ? device.branchId?.name : '';

    return (
      device.deviceId?.toLowerCase().includes(search) ||
      device.deviceName?.toLowerCase().includes(search) ||
      device.location?.toLowerCase().includes(search) ||
      branchName?.toLowerCase().includes(search) ||
      device.machines?.some((m: any) =>
        m.machineName?.toLowerCase().includes(search) ||
        m.machineType?.toLowerCase().includes(search)
      )
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || isCreateMode || filteredDevices.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredDevices.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredDevices[selectedRow];
        if (selected) {
          handleRowClick(selectedRow, selected);
        }
      }
    },
    [filteredDevices, selectedRow, showDetail, isCreateMode]
  );

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: RootState) => state.auth?.userData?.selectedBranch);

  useEffect(() => {
    dispatch(getDeviceAccessList());
  }, [dispatch, selectedBranch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedRow(0);
  }, [searchTerm]);

  const handleRowClick = (index: number, device: Device) => {
    setSelectedRow(index);
    setSelectedDevice(device);
    setEditDeviceName(device.deviceName || "");
    setEditLocation(device.location || "");
    setEditPassword("");
    setConfirmPassword("");
    setShowDetail(true);
    setIsCreateMode(false);
    setMachineId("");
  };

  const handleCreateNew = () => {
    setIsCreateMode(true);
    setShowDetail(false);
    setSelectedDevice(null);
    setEditDeviceName("");
    setEditLocation("");
    setEditPassword("");
    setConfirmPassword("");
    setMachineId("");
  };

  const handleCreateDevice = async () => {
    if (!editDeviceName.trim()) {
      toast.error("Validation Error", "Device name is required");
      return;
    }
    if (!editLocation.trim()) {
      toast.error("Validation Error", "Location is required");
      return;
    }
    if (!editPassword.trim()) {
      toast.error("Validation Error", "Password is required");
      return;
    }
    if (editPassword !== confirmPassword) {
      toast.error("Validation Error", "Passwords do not match");
      return;
    }

    await handleSave(
      () => dispatch(createDeviceAccess({
        deviceName: editDeviceName.trim(),
        location: editLocation.trim(),
        password: editPassword,
      })),
      {
        successMessage: "Device created successfully!",
        errorMessage: "Failed to create device.",
        onSuccess: () => {
          setIsCreateMode(false);
          setEditDeviceName("");
          setEditLocation("");
          setEditPassword("");
          setConfirmPassword("");
          dispatch(getDeviceAccessList());
        }
      }
    );
  };

  const handleUpdateDevice = async () => {
    if (!selectedDevice) return;

    if (!editDeviceName.trim()) {
      toast.error("Validation Error", "Device name is required");
      return;
    }

    if (editPassword && editPassword !== confirmPassword) {
      toast.error("Validation Error", "Passwords do not match");
      return;
    }

    const updatePayload: any = {
      deviceName: editDeviceName.trim(),
      location: editLocation.trim(),
    };

    if (editPassword.trim()) {
      updatePayload.password = editPassword;
    }

    await handleUpdate(
      async () => {
        const result = await dispatch(updateDeviceAccess(selectedDevice._id, updatePayload));
        if (result) {
          setSelectedDevice({ ...selectedDevice, deviceName: editDeviceName, location: editLocation });
        }
        return result;
      },
      {
        successMessage: "Device updated successfully!",
        errorMessage: "Failed to update device.",
        onSuccess: () => {
          setEditPassword("");
          setConfirmPassword("");
          dispatch(getDeviceAccessList());
        }
      }
    );
  };

  const handleAddMachine = async () => {
    if (!selectedDevice || !machineId) return;

    const selectedMachine = machineList.find((m: any) => m._id === machineId);

    await handleSave(
      async () => {
        const result = await dispatch(
          updateDeviceAccess(selectedDevice._id, {
            action: "assignMachine",
            machineId,
            machineName: selectedMachine?.machineName,
            machineType: selectedMachine?.machineType?.type || selectedMachine?.machineType,
          })
        );
        // Update selected device with new machine
        if (result?.machines) {
          setSelectedDevice({ ...selectedDevice, machines: result.machines });
        }
        return result;
      },
      {
        successMessage: "Machine added successfully!",
        errorMessage: "Failed to add machine.",
        onSuccess: () => {
          dispatch(getDeviceAccessList());
          setMachineId("");
        }
      }
    );
  };

  const handleRemoveMachine = async (machineIdToRemove: string) => {
    if (!selectedDevice) return;

    await crudDelete(
      async () => {
        const result = await dispatch(
          updateDeviceAccess(selectedDevice._id, { action: "removeMachine", machineId: machineIdToRemove })
        );
        // Update selected device with removed machine
        if (result?.machines) {
          setSelectedDevice({ ...selectedDevice, machines: result.machines });
        }
        return result;
      },
      {
        confirmTitle: "Remove Machine",
        confirmMessage: "Remove this machine from device?",
        successMessage: "Machine removed successfully!",
        errorMessage: "Failed to remove machine.",
        onSuccess: () => {
          dispatch(getDeviceAccessList());
        }
      }
    );
  };

  const handleDeleteClick = async () => {
    if (!selectedDevice) return;

    await crudDelete(
      () => dispatch(deleteDeviceAccess(selectedDevice._id)),
      {
        confirmTitle: "Delete Device",
        confirmMessage: `Are you sure you want to delete device "${selectedDevice.deviceName}"?`,
        successMessage: "Deleted successfully.",
        errorMessage: "Failed to delete.",
        onSuccess: () => {
          setShowDetail(false);
          setSelectedDevice(null);
          dispatch(getDeviceAccessList());
        }
      }
    );
  };

  const handleRegenerateDeviceId = async () => {
    if (!selectedDevice) return;

    await handleUpdate(
      async () => {
        const result = await dispatch(updateDeviceAccess(selectedDevice._id, { action: "regenerateDeviceId" }));
        if (result?.deviceId) {
          setSelectedDevice({ ...selectedDevice, deviceId: result.deviceId });
        }
        return result;
      },
      {
        successMessage: "Device ID regenerated successfully!",
        errorMessage: "Failed to regenerate Device ID.",
        onSuccess: () => {
          dispatch(getDeviceAccessList());
        }
      }
    );
  };

  const handleBack = () => {
    setShowDetail(false);
    setIsCreateMode(false);
    setSelectedDevice(null);
    setEditPassword("");
    setConfirmPassword("");
  };

  const getBranchName = (branchId: any) => {
    if (typeof branchId === 'object' && branchId?.name) {
      return branchId.name;
    }
    return "N/A";
  };

  // Helper to get machine type - handles both object and string formats
  const getMachineType = (machine: any) => {
    // First check if machineType is an object with a type property
    if (typeof machine.machineType === 'object' && machine.machineType?.type) {
      return machine.machineType.type;
    }
    // If machineType is a string, return it directly
    if (typeof machine.machineType === 'string' && machine.machineType) {
      return machine.machineType;
    }
    // Try to look up from machineList using machineId
    const machineFromList = machineList.find((m: any) => m._id === machine.machineId);
    if (machineFromList) {
      if (typeof machineFromList.machineType === 'object' && machineFromList.machineType?.type) {
        return machineFromList.machineType.type;
      }
      if (typeof machineFromList.machineType === 'string' && machineFromList.machineType) {
        return machineFromList.machineType;
      }
    }
    return "N/A";
  };

  // Get machines not already assigned to this device
  const availableMachines = machineList.filter((m: any) =>
    !selectedDevice?.machines?.some((dm: any) => dm.machineId === m._id)
  );

  return (
    <div className="EditDeviceAccess">
      {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError" style={{ color: "red" }}>{error}</p>}

      {/* LIST VIEW */}
      {!showDetail && !isCreateMode && !loading && (
        <div className="editsectionsTable-container">
          {/* Header with Create Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Device Access Management</h3>
            <button
              onClick={handleCreateNew}
              style={{
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              + Create New Device
            </button>
          </div>

          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by device ID, name, branch, location, or machine..."
                className="editsectionsTable-searchInput"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="editsectionsTable-searchIcon">🔍</span>
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">✕</button>
              )}
            </div>
            <div className="editsectionsTable-countBadge">
              {filteredDevices.length} of {deviceList.length} devices
            </div>
          </div>

          {/* Table */}
          {filteredDevices.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Device ID</th>
                    <th className="editsectionsTable-th">Device Name</th>
                    <th className="editsectionsTable-th">Branch</th>
                    <th className="editsectionsTable-th">Location</th>
                    <th className="editsectionsTable-th">Machines</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredDevices.map((device: Device, index: number) => (
                    <tr
                      key={device._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, device)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td" style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                        {device.deviceId || "N/A"}
                      </td>
                      <td className="editsectionsTable-td">{device.deviceName}</td>
                      <td className="editsectionsTable-td">{getBranchName(device.branchId)}</td>
                      <td className="editsectionsTable-td">{device.location || "N/A"}</td>
                      <td className="editsectionsTable-td">
                        {device.machines && device.machines.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {device.machines.slice(0, 2).map((m: any, i: number) => (
                              <span key={i} style={{
                                background: '#e3f2fd',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '12px',
                              }}>
                                {m.machineName}
                              </span>
                            ))}
                            {device.machines.length > 2 && (
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                +{device.machines.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#999' }}>None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : deviceList.length === 0 ? (
            <div className="editsectionsTable-empty">No devices available. Click "Create New Device" to add one.</div>
          ) : (
            <div className="editsectionsTable-empty">No devices found matching "{searchTerm}"</div>
          )}
        </div>
      )}

      {/* CREATE MODE */}
      {isCreateMode && (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={handleBack}>Back</button>
          </div>

          <h3 style={{ marginBottom: '20px' }}>Create New Device Access</h3>

          <div className="form-section">
            <label>Device Name: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter device name"
              value={editDeviceName}
              onChange={(e) => setEditDeviceName(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Location: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter location"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Password: <span style={{ color: 'red' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem'
                }}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="form-section">
            <label>Confirm Password: <span style={{ color: 'red' }}>*</span></label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleCreateDevice}
            className="save-button"
            disabled={saveState === 'loading' || !editDeviceName.trim() || !editLocation.trim() || !editPassword.trim()}
            style={{
              padding: '12px 24px',
              background: saveState === 'loading' ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: saveState === 'loading' ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              marginTop: '16px',
            }}
          >
            {saveState === 'loading' ? 'Creating...' : 'Create Device'}
          </button>
        </div>
      )}

      {/* DETAIL/EDIT VIEW */}
      {showDetail && selectedDevice && (
        <div className="edit-device-container">
          <div className="TopButtonEdit">
            <button onClick={handleBack}>Back</button>
            <button onClick={handleDeleteClick} className="Delete" disabled={deleteState === 'loading'}>
              {deleteState === 'loading' ? 'Deleting...' : 'Delete Device'}
            </button>
          </div>

          {/* Device ID Section */}
          <div className="form-section device-id-section">
            <label>Device ID:</label>
            <div className="device-id-row">
              <input
                type="text"
                value={selectedDevice.deviceId || "N/A"}
                readOnly
                className="device-id-input"
              />
              <button
                onClick={handleRegenerateDeviceId}
                disabled={updateState === 'loading'}
                className="regenerate-btn"
              >
                {updateState === 'loading' ? '...' : 'Regenerate ID'}
              </button>
            </div>
          </div>

          {/* Device Name & Location in one row */}
          <div className="form-row">
            <div className="form-section">
              <label>Device Name: <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Enter device name"
                value={editDeviceName}
                onChange={(e) => setEditDeviceName(e.target.value)}
              />
            </div>
            <div className="form-section">
              <label>Location: <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Enter location"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Password Update */}
          <div className="form-row">
            <div className="form-section">
              <label>New Password:</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave blank to keep current"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password-btn"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            {editPassword && (
              <div className="form-section">
                <label>Confirm Password:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleUpdateDevice}
            disabled={updateState === 'loading' || !editDeviceName.trim()}
            className="save-btn"
          >
            {updateState === 'loading' ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Add Machine Section */}
          <div className="add-machine-section">
            <h4>Add Machine to Device</h4>
            <div className="add-machine-row">
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
              >
                <option value="">Select machine to add</option>
                {availableMachines.map((m: any) => (
                  <option key={m._id} value={m._id}>
                    {m.machineName} ({m.machineType?.type || m.machineType || 'No Type'})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddMachine}
                disabled={!machineId || saveState === 'loading'}
                className="add-machine-btn"
              >
                {saveState === 'loading' ? 'Adding...' : 'Add Machine'}
              </button>
            </div>
          </div>

          {/* Machine List */}
          <div style={{ marginTop: '24px' }}>
            <div className="machines-header">
              <h4>Assigned Machines</h4>
              <span className="machines-count">{selectedDevice.machines?.length || 0}</span>
            </div>
            {selectedDevice.machines && selectedDevice.machines.length > 0 ? (
              <div className="machine-table-wrapper">
                <table className="machine-details-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Machine Name</th>
                      <th>Machine Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDevice.machines.map((machine: any, index: number) => (
                      <tr key={machine.machineId}>
                        <td>{index + 1}</td>
                        <td>{machine.machineName || 'N/A'}</td>
                        <td>{getMachineType(machine)}</td>
                        <td>
                          <button
                            onClick={() => handleRemoveMachine(machine.machineId)}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-machines-message">
                No machines assigned to this device. Use the dropdown above to add machines.
              </div>
            )}
          </div>

          {/* Branch Info */}
          <div className="branch-info">
            <p>
              <strong>Branch:</strong> {getBranchName(selectedDevice.branchId)}
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white', padding: '24px', borderRadius: '8px',
            maxWidth: '400px', width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{confirmDialog.title}</h3>
            <p style={{ marginBottom: '24px', color: '#666' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeConfirmDialog}
                style={{
                  padding: '8px 16px', border: '1px solid #ddd',
                  borderRadius: '4px', background: 'white', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '4px',
                  background: '#dc2626', color: 'white', cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditDeviceAccess;
