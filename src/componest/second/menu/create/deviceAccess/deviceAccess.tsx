import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMachines } from "../../../../redux/create/machine/MachineActions";
import {
  getDeviceAccessList,
  updateDeviceAccess
} from "../../../../redux/deviceAccess/deviceAccessActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import "./deviceaccess.css";

const DeviceAccess: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [machineId, setMachineId] = useState("");

  const { machines: machineList } = useSelector(
    (state: RootState) => state.machineList
  );
  const { devices: deviceList, loading} = useSelector(
    (state: RootState) => state.deviceAccess
  );

  useEffect(() => {
    dispatch(getMachines());
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
    <div className="device-access-container">
      <h3>Assign Machine to Device</h3>
      <div className="form-grid">
        <div className="form-input-group">
          <label className="input-label">Select Device</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="form-input"
          >
            <option value="">Select device</option>
            {deviceList.map((d: any) => (
              <option key={d._id} value={d._id}>
                {d.deviceName} - {d.location}
              </option>
            ))}
          </select>

          <label className="input-label">Select Machine</label>
          <select
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            className="form-input"
          >
            <option value="">Select machine</option>
            {machineList.map((m: any) => (
              <option key={m._id} value={m._id}>
                {m.machineName} ({m.machineType?.type || m.machineType})
              </option>
            ))}
          </select>

          <button
            className="save-button"
            onClick={handleAssignMachine}
            disabled={!selectedDeviceId || !machineId || loading}
          >
            {loading ? "ASSIGNING..." : "ASSIGN MACHINE"}
          </button>
        </div>
      </div>

     
    </div>
  );
};

export default DeviceAccess;