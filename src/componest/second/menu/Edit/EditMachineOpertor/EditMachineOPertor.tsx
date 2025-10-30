import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listOperators,
  updateOperator,
  deleteOperator,
} from "../../../../redux/create/CreateMachineOpertor/MachineOpertorActions";
import { getMachines } from "../../../../redux/create/machine/MachineActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

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

  const { operators = [], loading, error } = useSelector(
    (state: RootState) => state.operatorList || {}
  );
  const { machines = [] } = useSelector(
    (state: RootState) => state.machineList || {}
  );

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    machineId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

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
    dispatch(listOperators());
    dispatch(getMachines());
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
      password: "",
      confirmPassword: "",
      machineId: operator.machineId || "",
    });
    setShowDetail(true);
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!selectedOperator) return;
    
    if (!editForm.username.trim()) {
      alert("Username is required");
      return;
    }

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      alert("Password and Confirm Password do not match");
      return;
    }

    const payload: any = {
      username: editForm.username,
      machineId: editForm.machineId,
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password;
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
        <>
          {/* Search Bar */}
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by username, machine, or branch..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  fontSize: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2d89ef'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#666',
              }}>
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '4px 8px',
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div style={{
              padding: '12px 16px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              whiteSpace: 'nowrap',
            }}>
              {filteredOperators.length} of {operators.length} operators
            </div>
          </div>

          {/* Table */}
          {filteredOperators.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Username</th>
                  <th>Machine</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperators.map((operator: Operator, index: number) => {
                  const machine = machines.find((m: any) => m._id === operator.machineId);
                  return (
                    <tr
                      key={operator._id}
                      className={selectedRow === index ? "bg-blue-100" : ""}
                      onClick={() => handleRowClick(index, operator)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{index + 1}</td>
                      <td>{operator.username}</td>
                      <td>{machine?.machineName || "N/A"}</td>
                      <td>{operator.branchId?.name || "N/A"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999',
              fontSize: '16px',
            }}>
              No operators found matching "{searchTerm}"
            </div>
          )}
        </>
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
            <label>Password (leave blank to keep current):</label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => handleEditChange("password", e.target.value)}
              placeholder="Enter new password or leave blank"
            />
          </div>

          <div className="form-section">
            <label>Confirm Password:</label>
            <input
              type="password"
              value={editForm.confirmPassword}
              onChange={(e) => handleEditChange("confirmPassword", e.target.value)}
              placeholder="Confirm new password"
            />
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
              (editForm.password && editForm.password !== editForm.confirmPassword)
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