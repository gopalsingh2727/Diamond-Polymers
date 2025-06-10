import React, { useState } from "react";
import "./CreateStep.css"; // Assuming you have a CSS file for styles
type MachineDetail = {
  machineType: string;
  machineName: string;
};

const machineTypes = ["buttom", "side", "create", "print"];

const CreateStep = () => {
  const [stepName, setStepName] = useState("");
  const [machines, setMachines] = useState<MachineDetail[]>([
    { machineType: "", machineName: "" },
  ]);

  const handleChange = (
    index: number,
    field: keyof MachineDetail,
    value: string
  ) => {
    const updated = [...machines];
    updated[index][field] = value;
    setMachines(updated);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      const current = machines[index];
      const isLast = index === machines.length - 1;

      if (current.machineType && current.machineName && isLast) {
        setMachines([...machines, { machineType: "", machineName: "" }]);
      }
    }
  };

  const handleSave = () => {
    const filtered = machines.filter(
      (m) => m.machineType && m.machineName
    );

    if (!stepName.trim()) {
      alert("Step name required");
      return;
    }

    if (filtered.length === 0) {
      alert("At least one machine is required");
      return;
    }

    const stepData = {
      stepName,
      machines: filtered,
    };

    console.log("Step Data:", stepData);
    alert("Step saved successfully!");

    setStepName("");
    setMachines([{ machineType: "", machineName: "" }]);
  };

  return (
   <div className="create-step-container">
  <div className="step-form-wrapper">
    <h2 className="form-title">Create Production Step</h2>
    
    <div className="step-name-group">
      <label className="form-label">Step Name</label>
      <input
        type="text"
        value={stepName}
        onChange={(e) => setStepName(e.target.value)}
        className="form-input"
        placeholder="Enter Step Name"
      />
    </div>

    <div className="machine-group">
      {machines.map((machine, index) => (
        <div className="machine-row" key={index}>
          <div className="input-wrapper">
            <select
              className="form-input machine-select"
              value={machine.machineType}
              onChange={(e) => handleChange(index, "machineType", e.target.value)}
            >
              <option value="" disabled>Machine Type</option>
              {machineTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="Machine Name"
              value={machine.machineName}
              onChange={(e) => handleChange(index, "machineName", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
            {index === machines.length - 1 && (
              <span className="enter-hint">⏎</span>
            )}
          </div>
        </div>
      ))}
    </div>

    {machines[machines.length - 1].machineType === "" &&
    machines[machines.length - 1].machineName === "" ? (
      <button className="save-button" onClick={handleSave}>
        Save Production Step
        <span>✓</span>
      </button>
    ) : null}
  </div>
</div>
  );
};

export default CreateStep;