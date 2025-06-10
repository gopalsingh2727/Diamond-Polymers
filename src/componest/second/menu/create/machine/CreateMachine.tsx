import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./createMachine.css";

// Type definitions
type MachineSize = {
  x: string;
  y: string;
  z: string;
};

type MachineData = {
  machineName: string;
  machineType: MachineType;
  size: MachineSize;
};

enum MachineType {
  CREATE = "create",
  BOTTOM = "bottom",
  STITCHING = "stitching",
  CUT = "cut"
}

const CreateMachine = () => {
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState<MachineType>(MachineType.CREATE);
  const [size, setSize] = useState<MachineSize>({ x: "", y: "", z: "" });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Form validation
  const isValidForm = () => {
    return (
      machineName.trim().length > 0 &&
      Object.values(size).every(val => val.trim().length > 0)
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!isValidForm()) {
      alert("Please fill all required fields");
      return;
    }

    const newMachine: MachineData = {
      machineName: machineName.trim(),
      machineType,
      size: {
        x: size.x.trim(),
        y: size.y.trim(),
        z: size.z.trim()
      }
    };

    console.log("Saved Machine:", newMachine);
    resetForm();
    navigate(-1);
  };

  const resetForm = () => {
    setMachineName("");
    setMachineType(MachineType.CREATE);
    setSize({ x: "", y: "", z: "" });
    setHasUnsavedChanges(false);
    localStorage.removeItem("machineDraft");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (hasUnsavedChanges) {
        confirm("Discard changes?") && navigate(-1);
      } else {
        navigate(-1);
      }
    }
  };

  // Save draft to localStorage
  useEffect(() => {
    const draft = localStorage.getItem("machineDraft");
    if (draft) {
      const parsed: MachineData = JSON.parse(draft);
      setMachineName(parsed.machineName);
      setMachineType(parsed.machineType);
      setSize(parsed.size);
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (machineName || Object.values(size).some(Boolean)) {
        localStorage.setItem(
          "machineDraft",
          JSON.stringify({ machineName, machineType, size })
        );
        setHasUnsavedChanges(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [machineName, machineType, size]);

  // Focus management
  useEffect(() => {
    containerRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="create-step-container"
     
      aria-labelledby="machineFormTitle"
    >
      <form 
        onSubmit={handleSubmit}
        className="step-form-wrapper"
      >
        <h2 id="machineFormTitle" className="form-title">
          Create Machine
        </h2>

        <div className="form-group">
          <label htmlFor="machineName" className="form-label">
            Machine Name *
          </label>
          <input
            id="machineName"
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className="form-input"
            placeholder="Enter machine name"
            aria-required="true"
          />
          
        </div>

        <div className="form-group">
          <label htmlFor="machineType" className="form-label">
            Machine Type *
          </label>
          <select
            id="machineType"
            value={machineType}
            onChange={(e) => setMachineType(e.target.value as MachineType)}
            className="form-input machine-select"
            aria-required="true"
          >
            {Object.values(MachineType).map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="form-group">
          <legend className="form-label">Size (X, Y, Z) *</legend>
          <div className="size-inputs">
            {(["x", "y", "z"] as const).map((axis) => (
              <input
                key={axis}
                type="number"
                min="0"
                step="0.1"
                placeholder={`Size ${axis.toUpperCase()}`}
                value={size[axis]}
                onChange={(e) => 
                  setSize(prev => ({
                    ...prev,
                    [axis]: e.target.value
                  }))
                }
                className="form-input"
                aria-label={`Size ${axis.toUpperCase()} dimension`}
                aria-required="true"
              />
            ))}
          </div>
        </fieldset>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => {
              if (hasUnsavedChanges) {
                confirm("Discard changes?") && navigate(-1);
              } else {
                navigate(-1);
              }
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={!isValidForm()}
          >
            Save Machine
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMachine;