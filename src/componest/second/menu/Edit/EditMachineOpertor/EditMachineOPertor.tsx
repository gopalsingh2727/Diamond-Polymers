import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listOperators,
  updateOperator,
  deleteOperator,
} from "../../../../redux/create/CreateMachineOpertor/MachineOpertorActions";
import { getMachines } from "../../../../redux/create/machine/MachineActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store"; // Add this import

interface Operator {
  _id: string;
  username: string;
  machineId: string;
  branchId: {
    name?: string;
  };
}



const EditMachineOpertor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Type the dispatch

  const { operators = [], loading, error } = useSelector(
    (state: RootState) => state.operatorList || {}
  );
  const { machines = [] } = useSelector(
    (state: RootState) => state.machineList || {}
  );
  const { success: updateSuccess } = useSelector(
    (state: RootState) => state.operatorUpdate || {}
  );
  const { success: deleteSuccess } = useSelector(
    (state: RootState) => state.operatorDelete || {}
  );

  const [focusedRow, setFocusedRow] = useState<number>(-1);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    machineId: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    dispatch(listOperators());
    dispatch(getMachines());
  }, [dispatch, updateSuccess, deleteSuccess]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
    operator: Operator
  ) => {
    if (e.key === "Enter") openEditor(operator);
    else if (e.key === "ArrowDown")
      setFocusedRow((prev) => Math.min(prev + 1, operators.length - 1));
    else if (e.key === "ArrowUp")
      setFocusedRow((prev) => Math.max(prev - 1, 0));
  };

  const openEditor = (operator: Operator) => {
    setSelectedOperator(operator);
    setEditForm({
      username: operator.username,
      password: "",
      confirmPassword: "",
      machineId: operator.machineId || "",
    });
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    if (!selectedOperator) return;
    if (editForm.password !== editForm.confirmPassword) {
      alert("❌ Password and Confirm Password do not match");
      return;
    }

    const payload: any = {
      username: editForm.username,
      machineId: editForm.machineId,
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password;
    }

    dispatch(updateOperator(selectedOperator._id, payload));
    setSelectedOperator(null);
  };

  const handleDeleteClick = () => {
    setDeleteInput("");
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteInput === "DELETE" && selectedOperator) {
      dispatch(deleteOperator(selectedOperator._id));
      setShowDeleteConfirm(false);
      setSelectedOperator(null);
    } else {
      alert("❌ Type DELETE to confirm deletion");
    }
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

  return (
    <div className="EditOperators p-4">
      <h2 className="text-xl font-semibold mb-4">Machine Operators</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!selectedOperator ? (
        <table className="w-full border border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Machine</th>
              <th className="p-2 border">Branch ID</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((operator, index) => (
              <tr
                key={operator._id}
                tabIndex={0}
                onClick={() => openEditor(operator)}
                onKeyDown={(e) => handleKeyDown(e, operator)}
                onFocus={() => setFocusedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  focusedRow === index ? "bg-blue-100" : ""
                }`}
              >
                <td className="p-2 border">{operator.username}</td>
                <td className="p-2 border">
                  {machines.find((m) => m._id === operator.machineId)?.machineName || "—"}
                </td>
                <td className="p-2 border">{operator.branchId?.name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-white p-4 shadow-md rounded max-w-lg">
          <h3 className="text-lg font-bold mb-2">Edit Operator</h3>

          <label className="block mb-1">Username</label>
          <input
            value={editForm.username}
            onChange={(e) => handleEditChange("username", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Password (leave blank to keep current)</label>
          <input
            type="password"
            value={editForm.password}
            onChange={(e) => handleEditChange("password", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Confirm Password</label>
          <input
            type="password"
            value={editForm.confirmPassword}
            onChange={(e) => handleEditChange("confirmPassword", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Assigned Machine</label>
          <select
            value={editForm.machineId}
            onChange={(e) => handleEditChange("machineId", e.target.value)}
            className="border p-2 mb-3 w-full"
          >
            <option value="">Select Machine</option>
            {machines.map((m) => (
              <option key={m._id} value={m._id}>
                {m.machineName}
              </option>
            ))}
          </select>

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
              onClick={() => setSelectedOperator(null)}
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
              Type <span className="text-red-600 font-mono">DELETE</span> to confirm
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

export default EditMachineOpertor;