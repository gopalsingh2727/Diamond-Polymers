import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./EditMachineyType.css";
import { useDispatch } from "react-redux";
import {
  updateMachineType,
  deleteMachineType,
} from "../../../../redux/create/machineType/machineTypeActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { AppDispatch } from "../../../../../store";
import { formatDate } from "../../../../../utils/dateUtils";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";

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
  const { handleUpdate, handleDelete: crudDelete, updateState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { machineTypes: cachedMachineTypes, machines: cachedMachines, loading, error } = useFormDataCache();

  // Group machines by machine type
  const machineTypes = useMemo(() => {
    return cachedMachineTypes.map((type: any) => ({
      ...type,
      machines: cachedMachines.filter((machine: any) =>
        (machine.machineType?._id === type._id || machine.machineTypeId === type._id)
      )
    }));
  }, [cachedMachineTypes, cachedMachines]);

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

  // ✅ No useEffect dispatch needed - data already loaded from cache!

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
      toast.error('Validation Error', 'Type cannot be empty');
      return;
    }

    if (!editId) return;

    await handleUpdate(
      () => dispatch(updateMachineType(editId, editType, editDescription)),
      {
        successMessage: 'Machine Type updated successfully!',
        onSuccess: () => {
          setTimeout(() => {
            setShowDetail(false);
            // ✅ OPTIMIZED: Cache will auto-refresh on next page load
          }, 1500);
        }
      }
    );
  };

  const handleDeleteClick = async () => {
    if (!editId) return;

    await crudDelete(
      () => dispatch(deleteMachineType(editId)),
      {
        confirmTitle: 'Delete Machine Type',
        confirmMessage: 'Are you sure you want to delete this machine type?',
        successMessage: 'Deleted successfully.',
        onSuccess: () => {
          setShowDetail(false);
          // ✅ OPTIMIZED: Cache will auto-refresh on next page load
        }
      }
    );
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
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by machine type, description, branch, or machine name..."
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
              {filteredMachineTypes.length} of {machineTypes.length} types
            </div>
          </div>

          {/* Table */}
          {filteredMachineTypes.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Machine Type</th>
                    <th className="editsectionsTable-th">Total Machines</th>
                    <th className="editsectionsTable-th">Branch</th>
                    <th className="editsectionsTable-th">Created</th>
                    <th className="editsectionsTable-th">Updated</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredMachineTypes.map((item: MachineType, index: number) => (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, item)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{item.type}</td>
                      <td className="editsectionsTable-td">{item.machines?.length ?? 0}</td>
                      <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                      <td className="editsectionsTable-td">{formatDate(item.createdAt)}</td>
                      <td className="editsectionsTable-td">{formatDate(item.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No machine types found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : showDetail && selectedItem ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button
              onClick={handleDeleteClick}
              className="Delete"
              disabled={deleteState === 'loading'}
            >
              {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
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
              updateState === 'loading' ||
              (editType === selectedItem.type &&
              editDescription === selectedItem.description)
            }
          >
            {updateState === 'loading' ? 'Saving...' : 'Save'}
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
              {formatDate(selectedItem.createdAt)}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {formatDate(selectedItem.updatedAt)}
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

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">{confirmDialog.title}</h3>
            <p className="mb-4">{confirmDialog.message}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDialog.onConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={closeConfirmDialog}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditMachineType;