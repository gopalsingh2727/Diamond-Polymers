import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listOperators,
  updateOperator,
  deleteOperator,
} from "../../../../redux/create/CreateMachineOpertor/MachineOpertorActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import "./EditMachineOpertor.css";

interface Operator {
  _id: string;
  username: string;
  machineId: string;
  branchId: {
    name?: string;
  };
}

const EditMachineOpertor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 🚀 OPTIMIZED: Get machines from cached form data (no API call!)
  const { machines } = useFormDataCache();

  // Keep operators from Redux (operators list needs separate fetch)
  const { operators = [], loading, error } = useSelector(
    (state: RootState) => state.operatorList || {}
  );

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    pin: "",
    confirmPin: "",
    machineId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Filter operators based on search term
  const filteredOperators = operators.filter((operator: Operator) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const machine = machines.find((m: any) => m._id === operator.machineId);
    
    return (
      operator.username?.toLowerCase().includes(search) ||
      machine?.machineName?.toLowerCase().includes(search) ||
      operator.branchId?.name?.toLowerCase().includes(search)
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || filteredOperators.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredOperators.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredOperators[selectedRow];
        if (selected) {
          openEditor(selected);
        }
      }
    },
    [filteredOperators, selectedRow, showDetail]
  );

  useEffect(() => {
    // ✅ OPTIMIZED: Machines come from cache, only fetch operators
    dispatch(listOperators());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Reset selected row when search changes
    setSelectedRow(0);
  }, [searchTerm]);

  const openEditor = (operator: Operator) => {
    setSelectedOperator(operator);
    setEditForm({
      username: operator.username,
      pin: "",
      confirmPin: "",
      machineId: operator.machineId || "",
    });
    setShowDetail(true);
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    // For PIN fields, only allow digits and max 4 characters
    if (field === 'pin' || field === 'confirmPin') {
      if (value && (!/^\d*$/.test(value) || value.length > 4)) {
        return;
      }
    }
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!selectedOperator) return;
    
    if (!editForm.username.trim()) {
      alert("Username is required");
      return;
    }

    if (editForm.pin && editForm.pin !== editForm.confirmPin) {
      alert("PIN and Confirm PIN do not match");
      return;
    }

    if (editForm.pin && editForm.pin.length !== 4) {
      alert("PIN must be exactly 4 digits");
      return;
    }

    const payload: any = {
      username: editForm.username,
      machineId: editForm.machineId,
    };

    if (editForm.pin.trim()) {
      payload.pin = editForm.pin;
    }

    try {
      await dispatch(updateOperator(selectedOperator._id, payload));
      alert("Operator updated successfully!");
      setShowDetail(false);
      setSelectedOperator(null);
      dispatch(listOperators());
    } catch (err) {
      alert("Failed to update operator.");
    }
  };

  const handleDelete = async () => {
    if (!selectedOperator) return;

    if (!window.confirm("Are you sure you want to delete this operator?"))
      return;

    try {
      await dispatch(deleteOperator(selectedOperator._id));
      alert("Deleted successfully.");
      setShowDetail(false);
      setSelectedOperator(null);
      dispatch(listOperators());
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleRowClick = (index: number, operator: Operator) => {
    setSelectedRow(index);
    openEditor(operator);
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

      {!showDetail && !loading && operators.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by username, machine, or branch..."
                className="editsectionsTable-searchInput"
                value={searchTerm}
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
              {filteredOperators.length} of {operators.length} operators
            </div>
          </div>

          {/* Table */}
          {filteredOperators.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Username</th>
                    <th className="editsectionsTable-th">Machine</th>
                    <th className="editsectionsTable-th">Branch</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredOperators.map((operator: Operator, index: number) => {
                    const machine = machines.find((m: any) => m._id === operator.machineId);
                    return (
                      <tr
                        key={operator._id}
                        className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                        onClick={() => handleRowClick(index, operator)}
                      >
                        <td className="editsectionsTable-td">{index + 1}</td>
                        <td className="editsectionsTable-td">{operator.username}</td>
                        <td className="editsectionsTable-td">{machine?.machineName || "N/A"}</td>
                        <td className="editsectionsTable-td">{operator.branchId?.name || "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No operators found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : showDetail && selectedOperator ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDelete} className="Delete">
              Delete
            </button>
          </div>

          <div className="form-section">
            <label>Username:</label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => handleEditChange("username", e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>New PIN (leave blank to keep current):</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPin ? "text" : "password"}
                value={editForm.pin}
                onChange={(e) => handleEditChange("pin", e.target.value)}
                placeholder="Enter new 4-digit PIN or leave blank"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                {showPin ? "🙈" : "👁"}
              </button>
            </div>
            {editForm.pin && (
              <small style={{ color: "#666", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                {editForm.pin.length}/4 digits
              </small>
            )}
          </div>

          <div className="form-section">
            <label>Confirm PIN:</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPin ? "text" : "password"}
                value={editForm.confirmPin}
                onChange={(e) => handleEditChange("confirmPin", e.target.value)}
                placeholder="Confirm new PIN"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                {showPin ? "🙈" : "👁"}
              </button>
            </div>
            {editForm.pin && editForm.confirmPin && (
              <small 
                style={{ 
                  color: editForm.pin === editForm.confirmPin ? "green" : "red",
                  fontSize: "0.85rem",
                  marginTop: "4px",
                  display: "block"
                }}
              >
                {editForm.pin === editForm.confirmPin ? "✓ PINs match" : "✗ PINs do not match"}
              </small>
            )}
          </div>

          <div className="form-section">
            <label>Assigned Machine:</label>
            <select
              value={editForm.machineId}
              onChange={(e) => handleEditChange("machineId", e.target.value)}
            >
              <option value="">Select Machine</option>
              {machines.map((m: any) => (
                <option key={m._id} value={m._id}>
                  {m.machineName}
                </option>
              ))}
            </select>
          </div>

         <button
  onClick={handleUpdate}
  className="save-button"
  disabled={
    !editForm.username.trim() ||
    (!!editForm.pin && editForm.pin !== editForm.confirmPin) ||
    (!!editForm.pin && editForm.pin.length !== 4)
  }
>
  Save
</button>

          <div className="info-section">
            <p>
              <strong>Current Machine:</strong>{" "}
              {machines.find((m: any) => m._id === selectedOperator.machineId)?.machineName || "N/A"}
            </p>
            <p>
              <strong>Branch:</strong> {selectedOperator.branchId?.name || "N/A"}
            </p>
          </div>
        </div>
      ) : (
        !loading && <p>No operators available.</p>
      )}
    </div>
  );
};

export default EditMachineOpertor;