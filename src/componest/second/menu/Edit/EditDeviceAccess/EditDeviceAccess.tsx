import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDeviceAccessList,
  updateDeviceAccess,
  deleteDeviceAccess,
} from "../../../../redux/deviceAccess/deviceAccessActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { ToastContainer } from "../../../../../components/shared/Toast";

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

  // 🚀 OPTIMIZED: Get machines from cached form data (no API call!)
  const { machines: machineList } = useFormDataCache();

  // Keep device access from Redux (not in cache)
  const deviceAccessState = useSelector(
    (state: RootState) => state.v2.deviceAccess
  );
  const rawDeviceList = deviceAccessState?.list;
  const deviceList = Array.isArray(rawDeviceList) ? rawDeviceList : [];
  const loading = deviceAccessState?.loading;
  const error = deviceAccessState?.error;

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [machineId, setMachineId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
      if (showDetail || filteredDevices.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredDevices.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredDevices[selectedRow];
        if (selected) {
          setSelectedDevice(selected);
          setShowDetail(true);
        }
      }
    },
    [filteredDevices, selectedRow, showDetail]
  );

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: RootState) => state.auth?.userData?.selectedBranch);

  useEffect(() => {
    // ✅ OPTIMIZED: Machines come from cache, only fetch device access
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
    setShowDetail(true);
    setMachineId("");
  };

  const handleAddMachine = async () => {
    if (!selectedDevice || !machineId) return;

    const selectedMachine = machineList.find((m: any) => m._id === machineId);

    await handleSave(
      () => dispatch(
        updateDeviceAccess(selectedDevice._id, "assignMachine", {
          machineId,
          machineName: selectedMachine?.machineName,
          machineType:
            selectedMachine?.machineType?.type || selectedMachine?.machineType,
        })
      ),
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
      () => dispatch(
        updateDeviceAccess(selectedDevice._id, "removeMachine", { machineId: machineIdToRemove })
      ),
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getBranchName = (branchId: any) => {
    if (typeof branchId === 'object' && branchId?.name) {
      return branchId.name;
    }
    return "N/A";
  };

  return (
    <div className="EditMachineType">
       {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError" style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && deviceList.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by device ID, name, branch, location, or machine..."
                className="editsectionsTable-searchInput"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <span className="editsectionsTable-searchIcon">🔍</span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="editsectionsTable-clearButton"
                  title="Clear search"
                >
                  ✕
                </button>
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
                    <th className="editsectionsTable-th">Branch Name</th>
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
                      <td className="editsectionsTable-td">{device.machines?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No devices found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : showDetail && selectedDevice ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDeleteClick} className="Delete" disabled={deleteState === 'loading'}>
              {deleteState === 'loading' ? 'Deleting...' : 'Delete Device'}
            </button>
          </div>

          <div className="form-section">
            <label>Add Machine to Device:</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select machine</option>
                  {machineList.map((m: any) => (
                    <option key={m._id} value={m._id}>
                      {m.machineName} ({m.machineType?.type || m.machineType})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddMachine}
                disabled={!machineId || saveState === 'loading'}
                style={{
                  padding: '8px 16px',
                  background: machineId && saveState !== 'loading' ? '#FF6B35' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: machineId && saveState !== 'loading' ? 'pointer' : 'not-allowed',
                }}
              >
                {saveState === 'loading' ? 'Adding...' : 'Add Machine'}
              </button>
            </div>
          </div>

          <div className="info-section">
            <h4>Device Information</h4>
            <p>
              <strong>Device ID:</strong> {selectedDevice.deviceId || "N/A"}
            </p>
            <p>
              <strong>Device Name:</strong> {selectedDevice.deviceName}
            </p>
            <p>
              <strong>Branch Name:</strong> {getBranchName(selectedDevice.branchId)}
            </p>
            <p>
              <strong>Location:</strong> {selectedDevice.location || "N/A"}
            </p>
            <p>
              <strong>Total Machines:</strong> {selectedDevice.machines?.length || 0}
            </p>
          </div>

          {selectedDevice.machines && selectedDevice.machines.length > 0 ? (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Assigned Machines</h4>
              <table className="machine-details-table">
                <thead>
                  <tr>
                    <th>Machine Name</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDevice.machines.map((machine: any) => (
                    <tr key={machine.machineId}>
                      <td>{machine.machineName}</td>
                      <td>{machine.machineType}</td>
                      <td>
                        <button
                          onClick={() => handleRemoveMachine(machine.machineId)}
                          style={{
                            padding: '6px 12px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
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
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: '#f5f5f5',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
            }}>
              No machines assigned to this device.
            </div>
          )}
        </div>
      ) : (
        !loading && <p>No devices available.</p>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{confirmDialog.title}</h3>
            <p style={{ marginBottom: '24px', color: '#666' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeConfirmDialog}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#dc2626',
                  color: 'white',
                  cursor: 'pointer'
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