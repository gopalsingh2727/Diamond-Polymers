import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDeviceAccessList,
  updateDeviceAccess
} from "../../../../redux/deviceAccess/deviceAccessActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import "./deviceaccess.css";

const DeviceAccess: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [machineId, setMachineId] = useState("");

  // 🚀 OPTIMIZED: Get machines from cached form data (no API call!)
  const { machines: machineList } = useFormDataCache();

  const { devices: deviceList, loading} = useSelector(
    (state: RootState) => state.deviceAccess
  );

  useEffect(() => {
    // Only fetch device-specific data
    dispatch(getDeviceAccessList());
  }, [dispatch]);

  // ✅ Assign machine
  const handleAssignMachine = () => {
    if (!selectedDeviceId || !machineId) return;

    const selectedMachine = machineList.find((m: any) => m._id === machineId);

    dispatch(
      updateDeviceAccess(selectedDeviceId, "assignMachine", {
        machineId,
        machineName: selectedMachine?.machineName,
        machineType:
          selectedMachine?.machineType?.type || selectedMachine?.machineType,
      })
    );

    setSelectedDeviceId("");
    setMachineId("");
  };




  return (
    <div className="deviceAccess-container">
      <div className="deviceAccess-form">
        <h2 className="deviceAccess-title">Assign Machine to Device</h2>

        <div className="deviceAccess-group">
          <label className="deviceAccess-label">Select Device</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="deviceAccess-select"
          >
            <option value="">Select device</option>
            {deviceList.map((d: any) => (
              <option key={d._id} value={d._id}>
                {d.deviceName} - {d.location}
              </option>
            ))}
          </select>
        </div>

        <div className="deviceAccess-group">
          <label className="deviceAccess-label">Select Machine</label>
          <select
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            className="deviceAccess-select"
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
          className="deviceAccess-button"
          onClick={handleAssignMachine}
          disabled={!selectedDeviceId || !machineId || loading}
        >
          {loading ? "ASSIGNING..." : "ASSIGN MACHINE"}
        </button>
      </div>
    </div>
  );
};

export default DeviceAccess;