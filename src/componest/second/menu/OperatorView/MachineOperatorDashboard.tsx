import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../../store";
import { RootState } from "../../../redux/rootReducer";
import { getMachinesIfNeeded } from "../../../redux/create/machine/MachineActions";
import MachineOperatorView from "./MachineOperatorView";
import "./operatorView.css";
import { BackButton } from "../../../allCompones/BackButton";

interface Machine {
  _id: string;
  machineName: string;
  machineType?: string;
}

const MachineOperatorDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");

  // Get machines from store
  const machines: Machine[] = useSelector((state: any) => state.machineList?.machines || []);
  const machinesLoading = useSelector((state: any) => state.machineList?.loading || false);

  // Fetch machines on mount if not already loaded
  useEffect(() => {
    dispatch(getMachinesIfNeeded());
  }, [dispatch]);

  // Get selected machine info
  const selectedMachine = machines.find((m: Machine) => m._id === selectedMachineId);

  return (
    <div className="machineOperatorDashboard">
       <BackButton /> 
      {/* Dashboard Header with Machine Selector */}
      <div className="dashboardHeader">
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
          Machine Operator Dashboard
        </h2>

        <select
          value={selectedMachineId}
          onChange={(e) => setSelectedMachineId(e.target.value)}
          disabled={machinesLoading}
        >
          <option value="">-- Select Machine --</option>
          {machines.map((machine: Machine) => (
            <option key={machine._id} value={machine._id}>
              {machine.machineName} {machine.machineType ? `(${machine.machineType})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {!selectedMachineId ? (
        <div className="operatorViewEmpty" style={{ marginTop: '2rem' }}>
          <p>Please select a machine to view orders.</p>
        </div>
      ) : (
        <MachineOperatorView machineIdProp={selectedMachineId} />
      )}
    </div>
  );
};

export default MachineOperatorDashboard;
