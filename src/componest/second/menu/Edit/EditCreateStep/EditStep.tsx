import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../store";
import {
  updateStep,
  deleteStep,
} from "../../../../redux/create/CreateStep/StpeActions";
import { useFormDataCache } from "../hooks/useFormDataCache";

// Define interfaces for type safety
interface Machine {
  _id: string;
  machineName: string;
  machineType: string | { type: string } | null;
}

interface StepMachine {
  machineId: string | { _id: string };
  sequence?: number;
}

interface Step {
  _id: string;
  stepName: string;
  machines?: StepMachine[];
  branchId?: {
    name: string;
  };
}

interface EditFormMachine {
  machineId: string;
}

interface EditForm {
  stepName: string;
  machines: EditFormMachine[];
}

const EditStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { steps, machines, loading, error } = useFormDataCache();

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    stepName: "",
    machines: [{ machineId: "" }],
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter steps based on search term
  const filteredSteps = steps.filter((step: Step) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      step.stepName?.toLowerCase().includes(search) ||
      step.branchId?.name?.toLowerCase().includes(search) ||
      step.machines?.some((m: StepMachine) => {
        const machineId = typeof m.machineId === 'object' ? m.machineId._id : m.machineId;
        const machine = machines.find((ma: Machine) => ma._id === machineId);
        return machine?.machineName?.toLowerCase().includes(search);
      })
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || filteredSteps.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredSteps.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredSteps[selectedRow];
        if (selected) {
          openEditor(selected);
        }
      }
    },
    [filteredSteps, selectedRow, showDetail]
  );
  
  // ✅ No useEffect dispatch needed - data already loaded from cache!

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Reset selected row when search changes
    setSelectedRow(0);
  }, [searchTerm]);

  const openEditor = (step: Step) => {
    setSelectedStep(step);
    setEditForm({
      stepName: step.stepName || "",
      machines:
        step.machines?.map((m: StepMachine) => ({
          machineId: typeof m.machineId === 'object' ? m.machineId._id : m.machineId,
        })) || [{ machineId: "" }],
    });
    setShowDetail(true);
  };

  const handleEditChange = (index: number, value: string) => {
    const updated = [...editForm.machines];
    updated[index].machineId = value;
    setEditForm((prev) => ({ ...prev, machines: updated }));
  };

  const handleAddMachine = () => {
    setEditForm((prev) => ({
      ...prev,
      machines: [...prev.machines, { machineId: "" }],
    }));
  };

  const handleRemoveMachine = (index: number) => {
    if (editForm.machines.length <= 1) return;
    const updated = editForm.machines.filter((_, i) => i !== index);
    setEditForm((prev) => ({ ...prev, machines: updated }));
  };

  const handleUpdate = async () => {
    if (!selectedStep) return;

    const machinesFiltered = editForm.machines.filter((m) => m.machineId);

    if (!editForm.stepName.trim()) {
      alert("Step name is required");
      return;
    }
    if (machinesFiltered.length === 0) {
      alert("At least one machine is required");
      return;
    }

    const updatedStep = {
      stepName: editForm.stepName,
      machines: machinesFiltered.map((m, i) => ({
        machineId: m.machineId,
        sequence: i + 1,
      })),
    };

    try {
      await dispatch(updateStep(selectedStep._id, updatedStep));
      alert("Step updated successfully!");
      setShowDetail(false);
      setSelectedStep(null);
      // ✅ OPTIMIZED: Cache will auto-refresh on next page load
    } catch (err) {
      alert("Failed to update step.");
    }
  };

  const handleDelete = async () => {
    if (!selectedStep) return;

    if (!window.confirm("Are you sure you want to delete this step?"))
      return;

    try {
      await dispatch(deleteStep(selectedStep._id));
      alert("Deleted successfully.");
      setShowDetail(false);
      setSelectedStep(null);
      // ✅ OPTIMIZED: Cache will auto-refresh on next page load
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleRowClick = (index: number, step: Step) => {
    setSelectedRow(index);
    openEditor(step);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="EditMachineType">
      {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError"  style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && steps.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by step name, branch, or machine..."
                value={searchTerm}
                className="editsectionsTable-searchInput"
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
              {filteredSteps.length} of {steps.length} steps
            </div>
          </div>

          {/* Table */}
          {filteredSteps.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Step Name</th>
                    <th className="editsectionsTable-th">Total Machines</th>
                    <th className="editsectionsTable-th">Branch</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredSteps.map((step: Step, index: number) => (
                    <tr
                      key={step._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, step)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{step.stepName}</td>
                      <td className="editsectionsTable-td">{step.machines?.length || 0}</td>
                      <td className="editsectionsTable-td">{step.branchId?.name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No steps found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : showDetail && selectedStep ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDelete} className="Delete">
              Delete
            </button>
          </div>

          <div className="form-section">
            <label>Step Name:</label>
            <input
              type="text"
              value={editForm.stepName}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, stepName: e.target.value }))
              }
            />
          </div>

          <div className="form-section">
            <label>Machines:</label>
            {editForm.machines.map((machine: EditFormMachine, index: number) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select
                  value={machine.machineId}
                  onChange={(e) => handleEditChange(index, e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Select Machine</option>
                  {machines.map((m: Machine) => {
                    let machineTypeDisplay = 'Unknown';
                    
                    if (m.machineType) {
                      if (typeof m.machineType === 'object' && m.machineType.type) {
                        machineTypeDisplay = m.machineType.type;
                      } else if (typeof m.machineType === 'string') {
                        machineTypeDisplay = m.machineType;
                      }
                    }
                    
                    return (
                      <option key={m._id} value={m._id}>
                        {m.machineName} ({machineTypeDisplay})
                      </option>
                    );
                  })}
                </select>
                {editForm.machines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMachine(index)}
                    style={{
                      padding: '8px 12px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddMachine}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              + Add Machine
            </button>
          </div>

          <button
            onClick={handleUpdate}
            className="save-button"
            disabled={
              !editForm.stepName.trim() ||
              editForm.machines.filter((m) => m.machineId).length === 0
            }
          >
            Save
          </button>

          <div className="info-section">
            <p>
              <strong>Total Machines:</strong> {selectedStep.machines?.length || 0}
            </p>
            <p>
              <strong>Branch:</strong> {selectedStep.branchId?.name || "N/A"}
            </p>
          </div>
        </div>
      ) : (
        !loading && <p>No steps available.</p>
      )}
    </div>
  );
};

export default EditStep;