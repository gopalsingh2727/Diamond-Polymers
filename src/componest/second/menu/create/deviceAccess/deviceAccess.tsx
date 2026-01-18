import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDeviceAccessList,
  updateDeviceAccess
} from "../../../../redux/deviceAccess/deviceAccessActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import HelpDocModal, { HelpButton } from "../../../../../components/shared/HelpDocModal";
import { deviceMachineAssignHelp } from "../../../../../components/shared/helpContent";
import "./deviceaccess.css";

const DeviceAccess: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { handleSave, saveState, toast } = useCRUD();
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  // 🚀 OPTIMIZED: Get machines from cached form data (no API call!)
  const { machines = [] } = useFormDataCache();
  const machineList = Array.isArray(machines) ? machines : [];

  const rawDeviceList = useSelector(
    (state: RootState) => state.v2.deviceAccess?.list
  );
  const deviceList = Array.isArray(rawDeviceList) ? rawDeviceList : [];

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: RootState) => state.auth?.userData?.selectedBranch);

  useEffect(() => {
    // Only fetch device-specific data
    dispatch(getDeviceAccessList());
  }, [dispatch, selectedBranch]);

  // ✅ Assign machine
  const handleAssignMachine = async () => {
    if (!selectedDeviceId || !machineId) return;

    const selectedMachine = machineList.find((m: any) => m._id === machineId);

    const saveAction = async () => {
      return dispatch(
        updateDeviceAccess(selectedDeviceId, {
          action: "assignMachine",
          machineId,
          machineName: selectedMachine?.machineName,
          machineType:
            selectedMachine?.machineType?.type || selectedMachine?.machineType,
        })
      );
    };

    handleSave(saveAction, {
      successMessage: 'Machine assigned successfully',
      onSuccess: () => {
        setSelectedDeviceId("");
        setMachineId("");
      }
    });
  };




  return (
    <div className="deviceAccess-container">
      <div className="deviceAccess-form">
        <div className="createaccount-title-row">
          <h2 className="deviceAccess-title" style={{ margin: 0, border: 'none', padding: 0 }}>Assign Machine to Device</h2>
          <HelpButton onClick={() => setShowHelpModal(true)} size="medium" />
        </div>

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
          disabled={!selectedDeviceId || !machineId || saveState === 'loading'}
          style={{ opacity: saveState === 'loading' ? 0.7 : 1, transition: "all 0.2s ease" }}
        >
          {saveState === 'loading' ? "ASSIGNING..." : "ASSIGN MACHINE"}
        </button>
        {/* Help Documentation Modal */}
        <HelpDocModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          content={deviceMachineAssignHelp}
        />
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default DeviceAccess;