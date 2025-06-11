import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMachineTypes } from "../../../../redux/create/machineType/machineTypeActions";
import { createMachine } from "../../../../redux/create/machine/MachineActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import "./createMachine.css";

type MachineSize = { x: string; y: string; z: string };

const CreateMachine: React.FC = () => {
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [size, setSize] = useState<MachineSize>({ x: "", y: "", z: "" });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: machineTypes, loading } = useSelector(
    (state: RootState) => state.machineTypeList
  );

  useEffect(() => {
    dispatch(getMachineTypes());
  }, [dispatch]);

  useEffect(() => {
    const draft = localStorage.getItem("machineDraft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setMachineName(parsed.machineName);
      setMachineType(parsed.machineType);
      setSize(parsed.size);
    }
  }, []);

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

  useEffect(() => {
    containerRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (hasUnsavedChanges) {
          confirm("Discard changes?") && navigate(-1);
        } else {
          navigate(-1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges, navigate]);

  const isValidForm = () => {
    return (
      machineName.trim().length > 0 &&
      machineType &&
      Object.values(size).every(val => val.trim().length > 0)
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isValidForm()) {
      alert("Please fill all required fields");
      return;
    }

    const newMachine = {
      machineName: machineName.trim(),
      machineType,
      size: {
        x: size.x.trim(),
        y: size.y.trim(),
        z: size.z.trim()
      }
    };

    dispatch(createMachine(newMachine));
    setSavedMessage("✅ Machine saved successfully.");
    resetForm();
  };

  const resetForm = () => {
    setMachineName("");
    setMachineType("");
    setSize({ x: "", y: "", z: "" });
    setHasUnsavedChanges(false);
    localStorage.removeItem("machineDraft");
  };

  return (
    <div ref={containerRef} className="create-step-container" aria-labelledby="machineFormTitle">
      <form onSubmit={handleSubmit} className="step-form-wrapper">
        <h2 id="machineFormTitle" className="form-title">Create Machine</h2>

        {savedMessage && <div className="success-msg">{savedMessage}</div>}

        <div className="form-group">
          <label htmlFor="machineName" className="form-label">Machine Name *</label>
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
          <label htmlFor="machineType" className="form-label">Machine Type *</label>
          <select
            id="machineType"
            value={machineType}
            onChange={(e) => setMachineType(e.target.value)}
            className="form-input machine-select"
            aria-required="true"
          >
            <option value="">Select Machine Type</option>
            {loading ? (
              <option disabled>Loading...</option>
            ) : (
              machineTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.type}
                </option>
              ))
            )}
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
                  setSize((prev) => ({
                    ...prev,
                    [axis]: e.target.value,
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
          <button type="submit" className="save-button" disabled={!isValidForm()}>
            Save Machine
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMachine;