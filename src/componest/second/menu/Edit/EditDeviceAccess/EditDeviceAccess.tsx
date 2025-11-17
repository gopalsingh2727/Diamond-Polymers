import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMachines } from "../../../../redux/create/machine/MachineActions";
import {
  getDeviceAccessList,
  updateDeviceAccess,
  deleteDeviceAccess,
} from "../../../../redux/deviceAccess/deviceAccessActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  branchId?: {
    _id: string;
    branchName: string;
  };
  machines?: Array<{
    machineId: string;
    machineName: string;
    machineType: string;
  }>;
}

const EditDeviceAccess: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [machineId, setMachineId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { machines: machineList } = useSelector(
    (state: RootState) => state.machineList
  );
  const { devices: deviceList, loading, error } = useSelector(
    (state: RootState) => state.deviceAccess
  );

  // Filter devices based on search term
  const filteredDevices = deviceList.filter((device: Device) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const branchName = typeof device.branchId === 'object' ? device.branchId?.branchName : '';
    
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

  useEffect(() => {
    dispatch(getMachines());
    dispatch(getDeviceAccessList());
  }, [dispatch]);

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

    try {
      await dispatch(
        updateDeviceAccess(selectedDevice._id, "assignMachine", {
          machineId,
          machineName: selectedMachine?.machineName,
          machineType:
            selectedMachine?.machineType?.type || selectedMachine?.machineType,
        })
      );
      alert("Machine added successfully!");
      dispatch(getDeviceAccessList());
      setMachineId("");
    } catch (err) {
      alert("Failed to add machine.");
    }
  };

  const handleRemoveMachine = async (machineId: string) => {
    if (!selectedDevice) return;
    
    if (!window.confirm("Remove this machine from device?")) return;

    try {
      await dispatch(
        updateDeviceAccess(selectedDevice._id, "removeMachine", { machineId })
      );
      alert("Machine removed successfully!");
      dispatch(getDeviceAccessList());
    } catch (err) {
      alert("Failed to remove machine.");
    }
  };

  const handleDelete = async () => {
    if (!selectedDevice) return;

    if (!window.confirm(`Are you sure you want to delete device "${selectedDevice.deviceName}"?`))
      return;

    try {
      await dispatch(deleteDeviceAccess(selectedDevice._id));
      alert("Deleted successfully.");
      setShowDetail(false);
      setSelectedDevice(null);
      dispatch(getDeviceAccessList());
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getBranchName = (branchId: any) => {
    if (typeof branchId === 'object' && branchId?.branchName) {
      return branchId.branchName;
    }
    return "N/A";
  };

  return (
    <div className="EditMachineType">
       {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError" style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && deviceList.length > 0 ? (
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
                placeholder="Search by device ID, name, branch, location, or machine..."
                                className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
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
              {filteredDevices.length} of {deviceList.length} devices
            </div>
          </div>

          {/* Table */}
          {filteredDevices.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Device ID</th>
                  <th>Device Name</th>
                  <th>Branch Name</th>
                  <th>Location</th>
                  <th>Machines</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device: Device, index: number) => (
                  <tr
                    key={device._id}
                    className={selectedRow === index ? "bg-blue-100" : ""}
                    onClick={() => handleRowClick(index, device)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                      {device.deviceId || "N/A"}
                    </td>
                    <td>{device.deviceName}</td>
                    <td>{getBranchName(device.branchId)}</td>
                    <td>{device.location || "N/A"}</td>
                    <td>{device.machines?.length || 0}</td>
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
      ) : showDetail && selectedDevice ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDelete} className="Delete">
              Delete Device
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
                disabled={!machineId || loading}
                style={{
                  padding: '8px 16px',
                  background: machineId ? '#2196F3' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: machineId ? 'pointer' : 'not-allowed',
                }}
              >
                Add Machine
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
    </div>
  );
};

export default EditDeviceAccess;