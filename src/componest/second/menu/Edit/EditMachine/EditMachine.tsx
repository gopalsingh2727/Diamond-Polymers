import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMachines,
  updateMachine,
  deleteMachine,
} from "../../../../redux/create/machine/MachineActions";
import { getMachineTypes } from "../../../../redux/create/machineType/machineTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import "./editMachines.css";

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
  tableConfig?: {
    columns: any[];
    formulas: any;
    settings: any;
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

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    machineName: "",
    sizeX: "",
    sizeY: "",
    sizeZ: "",
    machineTypeId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter machines based on search term
  const filteredMachines = machines.filter((machine: Machine) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      machine.machineName?.toLowerCase().includes(search) ||
      machine.machineType?.type?.toLowerCase().includes(search) ||
      machine.branchId?.name?.toLowerCase().includes(search) ||
      machine.sizeX?.toLowerCase().includes(search) ||
      machine.sizeY?.toLowerCase().includes(search) ||
      machine.sizeZ?.toLowerCase().includes(search)
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || filteredMachines.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredMachines.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredMachines[selectedRow];
        if (selected) {
          openEditor(selected);
        }
      }
    },
    [filteredMachines, selectedRow, showDetail]
  );

  useEffect(() => {
    dispatch(getMachines());
    dispatch(getMachineTypes());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Reset selected row when search changes
    setSelectedRow(0);
  }, [searchTerm]);

  const openEditor = (machine: Machine) => {
    setSelectedMachine(machine);
    setEditForm({
      machineName: machine.machineName,
      sizeX: machine.sizeX,
      sizeY: machine.sizeY,
      sizeZ: machine.sizeZ,
      machineTypeId: machine.machineType?._id || "",
    });
    setShowDetail(true);
  };

  const handleEditChange = (field: keyof EditForm, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleUpdate = async () => {
    if (!selectedMachine) return;

    if (!editForm.machineName.trim()) {
      alert("Please enter machine name");
      return;
    }

    if (!editForm.machineTypeId) {
      alert("Please select machine type");
      return;
    }

    if (!editForm.sizeX || !editForm.sizeY || !editForm.sizeZ) {
      alert("Please enter all size dimensions");
      return;
    }

    try {
      await dispatch(
        updateMachine(selectedMachine._id, {
          machineName: editForm.machineName.trim(),
          sizeX: editForm.sizeX,
          sizeY: editForm.sizeY,
          sizeZ: editForm.sizeZ,
          machineType: editForm.machineTypeId,
        })
      );
      alert("Machine updated successfully!");
      setShowDetail(false);
      setSelectedMachine(null);
      dispatch(getMachines());
    } catch (err) {
      alert("Failed to update machine.");
    }
  };

  const handleDelete = async () => {
    if (!selectedMachine) return;

    if (!window.confirm("Are you sure you want to delete this machine?"))
      return;

    try {
      await dispatch(deleteMachine(selectedMachine._id));
      alert("Deleted successfully.");
      setShowDetail(false);
      setSelectedMachine(null);
      dispatch(getMachines());
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleRowClick = (index: number, machine: Machine) => {
    setSelectedRow(index);
    openEditor(machine);
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

      {!showDetail && !loading && machines.length > 0 ? (
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
                placeholder="Search by machine name, type, branch, or size..."
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
              {filteredMachines.length} of {machines.length} machines
            </div>
          </div>

          {/* Table */}
          {filteredMachines.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Machine Name</th>
                  <th>Type</th>
                  <th>Size X</th>
                  <th>Size Y</th>
                  <th>Size Z</th>
                  <th>Branch</th>
                  <th>Table Config</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((machine: Machine, index: number) => (
                  <tr
                    key={machine._id}
                    className={selectedRow === index ? "bg-blue-100" : ""}
                    onClick={() => handleRowClick(index, machine)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{machine.machineName}</td>
                    <td>{machine.machineType?.type || "N/A"}</td>
                    <td>{machine.sizeX}</td>
                    <td>{machine.sizeY}</td>
                    <td>{machine.sizeZ}</td>
                    <td>{machine.branchId?.name || "N/A"}</td>
                    <td>
                      {machine.tableConfig ? (
                        <span style={{ color: 'green' }}>
                          ✅ {machine.tableConfig.columns?.length || 0} cols
                        </span>
                      ) : (
                        <span style={{ color: '#999' }}>❌ No config</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999',
              fontSize: '16px',
            }}>
              No machines found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : showDetail && selectedMachine ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDelete} className="Delete">
              Delete
            </button>
          </div>

          <div className="form-section">
            <label>Machine Name:</label>
            <input
              type="text"
              value={editForm.machineName}
              onChange={(e) => handleEditChange("machineName", e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Machine Type:</label>
            <select
              value={editForm.machineTypeId}
              onChange={(e) => handleEditChange("machineTypeId", e.target.value)}
            >
              <option value="">Select Type</option>
              {machineTypes.map((type: MachineType) => (
                <option key={type._id} value={type._id}>
                  {type.type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label>Size X:</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={editForm.sizeX}
              onChange={(e) => handleEditChange("sizeX", e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Size Y:</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={editForm.sizeY}
              onChange={(e) => handleEditChange("sizeY", e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Size Z:</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={editForm.sizeZ}
              onChange={(e) => handleEditChange("sizeZ", e.target.value)}
            />
          </div>

          <button
            onClick={handleUpdate}
            className="save-button"
            disabled={
              !editForm.machineName.trim() || 
              !editForm.machineTypeId ||
              (editForm.machineName === selectedMachine.machineName &&
               editForm.sizeX === selectedMachine.sizeX &&
               editForm.sizeY === selectedMachine.sizeY &&
               editForm.sizeZ === selectedMachine.sizeZ &&
               editForm.machineTypeId === selectedMachine.machineType?._id)
            }
          >
            Save
          </button>

          <div className="info-section">
            <p>
              <strong>Branch:</strong> {selectedMachine.branchId?.name || "N/A"}
            </p>
            <p>
              <strong>Current Type:</strong> {selectedMachine.machineType?.type || "N/A"}
            </p>
            <p>
              <strong>Table Configuration:</strong>{" "}
              {selectedMachine.tableConfig ? (
                <span style={{ color: 'green' }}>
                  ✅ {selectedMachine.tableConfig.columns?.length || 0} columns configured
                </span>
              ) : (
                <span style={{ color: '#999' }}>❌ No table configuration</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        !loading && <p>No machines available.</p>
      )}
    </div>
  );
};

export default EditMachines;