import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMachines,
  updateMachine,
  deleteMachine,
} from "../../../../redux/create/machine/MachineActions";
import { getMachineTypes } from "../../../../redux/create/machineType/machineTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

// Define interfaces for type safety
interface MachineType {
  _id: string;
  type: string;
  description?: string;
}

interface Machine {
  _id: string;
  machineName: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  machineType: {
    _id: string;
    type: string;
    description?: string;
  };
  branchId: {
    _id: string;
    name: string;
  };
}

interface EditForm {
  machineName: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  machineTypeId: string;
}

const EditMachines: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const machineListState = useSelector((state: RootState) => state.machineList) as any;
  const { machines = [], loading, error } = machineListState;
  
  const machineTypeListState = useSelector((state: RootState) => state.machineTypeList) as any;
  const { items: machineTypes = [] } = machineTypeListState;
  
  const machineUpdateState = useSelector((state: RootState) => state.machineUpdate) as any;
  const { success: updateSuccess } = machineUpdateState;
  
  const machineDeleteState = useSelector((state: RootState) => state.machineDelete) as any;
  const { success: deleteSuccess } = machineDeleteState;

  const [focusedRow, setFocusedRow] = useState<number>(-1);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    machineName: "",
    sizeX: "",
    sizeY: "",
    sizeZ: "",
    machineTypeId: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    dispatch(getMachines());
    dispatch(getMachineTypes());
  }, [dispatch, updateSuccess, deleteSuccess]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
    machine: Machine
  ) => {
    if (e.key === "Enter") openEditor(machine);
    else if (e.key === "ArrowDown")
      setFocusedRow((prev) => Math.min(prev + 1, machines.length - 1));
    else if (e.key === "ArrowUp")
      setFocusedRow((prev) => Math.max(prev - 1, 0));
  };

  const openEditor = (machine: Machine) => {
    setSelectedMachine(machine);
    setEditForm({
      machineName: machine.machineName,
      sizeX: machine.sizeX,
      sizeY: machine.sizeY,
      sizeZ: machine.sizeZ,
      machineTypeId: machine.machineType?._id || "",
    });
  };

  const handleEditChange = (field: keyof EditForm, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleUpdate = () => {
    if (!selectedMachine) return;

    dispatch(
      updateMachine(selectedMachine._id, {
        machineName: editForm.machineName,
        sizeX: editForm.sizeX,
        sizeY: editForm.sizeY,
        sizeZ: editForm.sizeZ,
        machineType: editForm.machineTypeId,
      })
    );
    setSelectedMachine(null);
  };

  const handleDeleteClick = () => {
    setDeleteInput("");
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteInput === "DELETE" && selectedMachine) {
      dispatch(deleteMachine(selectedMachine._id));
      setShowDeleteConfirm(false);
      setSelectedMachine(null);
    } else {
      alert("❌ Type DELETE to confirm deletion");
    }
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

  return (
    <div className="EditMachineType p-4">
      <h2 className="text-xl font-semibold mb-4">Machine List</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!selectedMachine ? (
        <table className="w-full border border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Machine Name</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Size X</th>
              <th className="p-2 border">Size Y</th>
              <th className="p-2 border">Size Z</th>
              <th className="p-2 border">Branch</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine: Machine, index: number) => (
              <tr
                key={machine._id}
                tabIndex={0}
                onClick={() => openEditor(machine)}
                onKeyDown={(e) => handleKeyDown(e, machine)}
                onFocus={() => setFocusedRow(index)}
                className={focusedRow === index ? "bg-blue-100" : ""}
              >
                <td className="p-2 border">{machine.machineName}</td>
                <td className="p-2 border">{machine.machineType?.type}</td>
                <td className="p-2 border">{machine.sizeX}</td>
                <td className="p-2 border">{machine.sizeY}</td>
                <td className="p-2 border">{machine.sizeZ}</td>
                <td className="p-2 border">{machine.branchId?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-white p-4 shadow-md rounded max-w-lg">
          <h3 className="text-lg font-bold mb-2">Edit Machine</h3>

          <label className="block mb-1">Machine Name</label>
          <input
            value={editForm.machineName}
            onChange={(e) => handleEditChange("machineName", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Machine Type</label>
          <select
            value={editForm.machineTypeId}
            onChange={(e) =>
              handleEditChange("machineTypeId", e.target.value)
            }
            className="border p-2 mb-3 w-full"
          >
            <option value="">Select Type</option>
            {machineTypes.map((type: MachineType) => (
              <option key={type._id} value={type._id}>
                {type.type}
              </option>
            ))}
          </select>

          <label className="block mb-1">Size X</label>
          <input
            value={editForm.sizeX}
            onChange={(e) => handleEditChange("sizeX", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Size Y</label>
          <input
            value={editForm.sizeY}
            onChange={(e) => handleEditChange("sizeY", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Size Z</label>
          <input
            value={editForm.sizeZ}
            onChange={(e) => handleEditChange("sizeZ", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={handleDeleteClick}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedMachine(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">
              Type{" "}
              <span className="text-red-600 font-mono">DELETE</span> to confirm
            </h3>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="border p-2 w-full mb-4"
              placeholder="Type DELETE to confirm"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={cancelDelete}
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

export default EditMachines;