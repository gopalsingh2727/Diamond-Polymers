import React, { useEffect, useState, useCallback } from "react";
import "./EditMachineyType.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllMachineTypes,
  updateMachineType,
  deleteMachineType,
} from "../../../../redux/create/machineType/machineTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

interface Branch {
  _id: string;
  name: string;
  location?: string;
}

interface Machine {
  _id: string;
  machineName: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  branchId?: Branch;
}

interface MachineType {
  _id: string;
  type: string;
  description: string;
  machines: Machine[];
  createdAt: string;
  updatedAt: string;
  branchId: {
    _id: string;
    name: string;
  };
}

const EditMachineType: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: machineTypes = [], loading, error } = useSelector(
    (state: RootState) => state.machineTypeList || {}
  );

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editType, setEditType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter machine types based on search term
  const filteredMachineTypes = machineTypes.filter((machineType: MachineType) => {
  if (!searchTerm) return true;

  const search = searchTerm.toLowerCase();

  return (
    machineType.type?.toLowerCase().includes(search) ||
    machineType.description?.toLowerCase().includes(search) ||
    machineType.branchId?.name?.toLowerCase().includes(search) ||
    machineType.machines?.some((m: Machine) =>
      m.machineName?.toLowerCase().includes(search)
    )
  );
});

  const selectedItem = filteredMachineTypes[selectedRow];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || filteredMachineTypes.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredMachineTypes.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredMachineTypes[selectedRow];
        if (selected) {
          setEditId(selected._id);
          setEditType(selected.type);
          setEditDescription(selected.description);
          setShowDetail(true);
        }
      }
    },
    [filteredMachineTypes, selectedRow, showDetail]
  );

  useEffect(() => {
    dispatch(getAllMachineTypes());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Reset selected row when search changes
    setSelectedRow(0);
  }, [searchTerm]);

  const handleEditSave = async () => {
    if (!editType.trim()) {
      alert("Type cannot be empty");
      return;
    }

    if (!editId) return;

    try {
      await dispatch(updateMachineType(editId, editType, editDescription));
      alert("Machine Type updated successfully!");
      setShowDetail(false);
      dispatch(getAllMachineTypes()); // Refresh list
    } catch (err) {
      alert("Failed to update Machine Type.");
    }
  };

  const handleDelete = async () => {
    if (!editId) return;

    if (!window.confirm("Are you sure you want to delete this machine type?"))
      return;

    try {
      await dispatch(deleteMachineType(editId));
      alert("Deleted successfully.");
      setShowDetail(false);
      dispatch(getAllMachineTypes());
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleRowClick = (index: number, item: MachineType) => {
    setSelectedRow(index);
    setEditId(item._id);
    setEditType(item.type);
    setEditDescription(item.description);
    setShowDetail(true);
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

      {!showDetail && !loading && machineTypes.length > 0 ? (
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
                placeholder="Search by machine type, description, branch, or machine name..."
                value={searchTerm}
                className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
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
              {filteredMachineTypes.length} of {machineTypes.length} types
            </div>
          </div>

          {/* Table */}
          {filteredMachineTypes.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Machine Type</th>
                  <th>Total Machines</th>
                  <th>Branch</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachineTypes.map((item: MachineType, index: number) => (
                  <tr
                    key={item._id}
                    className={selectedRow === index ? "bg-blue-100" : ""}
                    onClick={() => handleRowClick(index, item)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{item.type}</td>
                    <td>{item.machines?.length ?? 0}</td>
                    <td>{item.branchId?.name || "N/A"}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{new Date(item.updatedAt).toLocaleString()}</td>
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
              No machine types found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : showDetail && selectedItem ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDelete} className="Delete">
              Delete
            </button>
          </div>

          <div className="form-section">
            <label>Machine Type:</label>
            <input
              type="text"
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Description:</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
            />
          </div>

          <button
            onClick={handleEditSave}
            className="save-button"
            disabled={
              editType === selectedItem.type &&
              editDescription === selectedItem.description
            }
          >
            Save
          </button>

          <div className="info-section">
            <p>
              <strong>Total Machines:</strong>{" "}
              {selectedItem?.machines?.length ?? 0}
            </p>
            <p>
              <strong>Branch:</strong> {selectedItem.branchId?.name || "N/A"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(selectedItem.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {new Date(selectedItem.updatedAt).toLocaleString()}
            </p>
          </div>

          <table className="machine-details-table">
            <thead>
              <tr>
                <th>Machine Name</th>
                <th>Size X</th>
                <th>Size Y</th>
                <th>Size Z</th>
                <th>Branch</th>
              </tr>
            </thead>
            <tbody>
              {selectedItem?.machines.map((m: Machine, idx: number) => (
                <tr key={idx}>
                  <td>{m.machineName}</td>
                  <td>{m.sizeX}</td>
                  <td>{m.sizeY}</td>
                  <td>{m.sizeZ}</td>
                  <td>{m.branchId?.name || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p>No machine types available.</p>
      )}
    </div>
  );
};

export default EditMachineType;