import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import {
  getSteps,
  updateStep,
  deleteStep,
} from "../../../../redux/create/CreateStep/StpeActions";
import { getMachines } from "../../../../redux/create/machine/MachineActions";

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

// Remove the StepListState interface since we'll handle typing differently

const EditStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [focusedRow, setFocusedRow] = useState<number>(-1);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    stepName: "",
    machines: [{ machineId: "" }],
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const stepListState = useSelector((state: RootState) => state.stepList) as any;
  const steps: Step[] = stepListState?.steps?.steps || stepListState?.steps || [];
  const updateSuccess = stepListState?.success;

  const machineListState = useSelector((state: RootState) => state.machineList) as any;
  const machines: Machine[] = machineListState?.machines || [];

  useEffect(() => {
    dispatch(getSteps());
    dispatch(getMachines());
  }, [dispatch, updateSuccess]);

  const openEditor = (step: Step) => {
    setSelectedStep(step);
    setEditForm({
      stepName: step.stepName || "",
      machines:
        step.machines?.map((m: StepMachine) => ({
          machineId: typeof m.machineId === 'object' ? m.machineId._id : m.machineId,
        })) || [{ machineId: "" }],
    });
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

  const handleUpdate = () => {
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

    dispatch(updateStep(selectedStep._id, updatedStep));
    setSelectedStep(null);
  };

  const confirmDelete = () => {
    if (deleteInput === "DELETE" && selectedStep) {
      dispatch(deleteStep(selectedStep._id));
      setDeleteConfirm(false);
      setSelectedStep(null);
    } else {
      alert("❌ Type DELETE to confirm");
    }
  };

  return (
    <div className="edit-step-container p-4">
      <h2 className="text-xl font-bold mb-4">Edit Production Steps</h2>

      {!selectedStep ? (
        <table className="w-full border border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Step Name</th>
              <th className="p-2 border">Total Machines</th>
              <th className="p-2 border">Branch</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step: Step, index: number) => (
              <tr
                key={step._id}
                tabIndex={0}
                onClick={() => openEditor(step)}
                onFocus={() => setFocusedRow(index)}
                className={focusedRow === index ? "bg-blue-100" : ""}
              >
                <td className="p-2 border">{step.stepName}</td>
                <td className="p-2 border">{step.machines?.length || 0}</td>
                <td className="p-2 border">{step.branchId?.name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-white p-4 shadow-md rounded max-w-xl">
          <h3 className="text-lg font-semibold mb-2">Edit Step</h3>

          <label className="block mb-1">Step Name *</label>
          <input
            value={editForm.stepName}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, stepName: e.target.value }))
            }
            className="border p-2 w-full mb-3"
          />

          <label className="block mb-1">Machines *</label>
          {editForm.machines.map((machine: EditFormMachine, index: number) => (
            <div key={index} className="flex items-center mb-2 gap-2">
              <select
                value={machine.machineId}
                onChange={(e) => handleEditChange(index, e.target.value)}
                className="border p-2 w-full"
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
                  className="text-red-600 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddMachine}
            className="text-blue-600 mb-4"
          >
            + Add Machine
          </button>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Update
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedStep(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">
              Type <span className="text-red-600 font-mono">DELETE</span> to confirm deletion
            </h3>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="border p-2 w-full mb-4"
              placeholder="DELETE"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditStep;