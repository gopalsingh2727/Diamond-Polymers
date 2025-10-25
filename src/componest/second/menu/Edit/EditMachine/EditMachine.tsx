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
import { Edit, Trash2, Save, X, Search, Filter } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(getMachines());
    dispatch(getMachineTypes());
  }, [dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      setSuccessMessage("✅ Machine updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      dispatch(getMachines());
    }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    if (deleteSuccess) {
      setSuccessMessage("✅ Machine deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      dispatch(getMachines());
    }
  }, [deleteSuccess, dispatch]);

  const filteredMachines = machines.filter((machine: Machine) => {
    const matchesSearch = machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.machineType?.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.branchId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterType || machine.machineType?._id === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
    machine: Machine
  ) => {
    if (e.key === "Enter") openEditor(machine);
    else if (e.key === "ArrowDown")
      setFocusedRow((prev) => Math.min(prev + 1, filteredMachines.length - 1));
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

    dispatch(
      updateMachine(selectedMachine._id, {
        machineName: editForm.machineName.trim(),
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

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
  };

  return (
    <div className="EditMachinesCss">
      <div className="EditMachinesContainer">
        <div className="EditMachinesHeader">
          <h2 className="EditMachinesTitle">Machine Management</h2>
          {successMessage && (
            <div className="EditMachinesSuccessMessage">{successMessage}</div>
          )}
        </div>

        {loading && <div className="EditMachinesLoading">Loading machines...</div>}
        {error && <div className="EditMachinesError">Error: {error}</div>}

        {!selectedMachine ? (
          <div className="EditMachinesTableSection">
            {/* Search and Filter Controls */}
            <div className="EditMachinesControls">
              <div className="EditMachinesSearchGroup">
                <Search size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search machines..."
                  className="EditMachinesSearchInput"
                />
              </div>
              <div className="EditMachinesFilterGroup">
                <Filter size={20} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="EditMachinesFilterSelect"
                >
                  <option value="">All Types</option>
                  {machineTypes.map((type: MachineType) => (
                    <option key={type._id} value={type._id}>
                      {type.type}
                    </option>
                  ))}
                </select>
              </div>
              {(searchTerm || filterType) && (
                <button onClick={clearFilters} className="EditMachinesClearFiltersBtn">
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Summary */}
            <div className="EditMachinesResultsSummary">
              Showing {filteredMachines.length} of {machines.length} machines
            </div>

            {/* Machines Table */}
            <div className="EditMachinesTableWrapper">
              <table className="EditMachinesTable">
                <thead className="EditMachinesTableHeader">
                  <tr>
                    <th className="EditMachinesTableHeaderCell">Machine Name</th>
                    <th className="EditMachinesTableHeaderCell">Type</th>
                    <th className="EditMachinesTableHeaderCell">Size X</th>
                    <th className="EditMachinesTableHeaderCell">Size Y</th>
                    <th className="EditMachinesTableHeaderCell">Size Z</th>
                    <th className="EditMachinesTableHeaderCell">Branch</th>
                    <th className="EditMachinesTableHeaderCell">Table Config</th>
                    <th className="EditMachinesTableHeaderCell">Actions</th>
                  </tr>
                </thead>
                <tbody className="EditMachinesTableBody">
                  {filteredMachines.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="EditMachinesEmptyRow">
                        {searchTerm || filterType ? "No machines match your filters" : "No machines found"}
                      </td>
                    </tr>
                  ) : (
                    filteredMachines.map((machine: Machine, index: number) => (
                      <tr
                        key={machine._id}
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyDown(e, machine)}
                        onFocus={() => setFocusedRow(index)}
                        className={`EditMachinesTableRow ${
                          focusedRow === index ? "EditMachinesTableRowFocused" : ""
                        }`}
                      >
                        <td className="EditMachinesTableCell EditMachinesMachineNameCell">
                          <div className="EditMachinesMachineNameContent">
                            {machine.machineName}
                          </div>
                        </td>
                        <td className="EditMachinesTableCell">
                          <span className="EditMachinesMachineTypeTag">
                            {machine.machineType?.type || "N/A"}
                          </span>
                        </td>
                        <td className="EditMachinesTableCell EditMachinesSizeCell">
                          {machine.sizeX}
                        </td>
                        <td className="EditMachinesTableCell EditMachinesSizeCell">
                          {machine.sizeY}
                        </td>
                        <td className="EditMachinesTableCell EditMachinesSizeCell">
                          {machine.sizeZ}
                        </td>
                        <td className="EditMachinesTableCell">
                          {machine.branchId?.name || "N/A"}
                        </td>
                        <td className="EditMachinesTableCell">
                          <div className="EditMachinesTableConfigIndicator">
                            {machine.tableConfig ? (
                              <span className="EditMachinesTableConfigYes">
                                ✅ {machine.tableConfig.columns?.length || 0} columns
                              </span>
                            ) : (
                              <span className="EditMachinesTableConfigNo">❌ Not configured</span>
                            )}
                          </div>
                        </td>
                        <td className="EditMachinesTableCell">
                          <div className="EditMachinesTableActions">
                            <button
                              onClick={() => openEditor(machine)}
                              className="EditMachinesEditBtn"
                              title="Edit machine"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="EditMachinesEditForm">
            <div className="EditMachinesEditHeader">
              <h3 className="EditMachinesEditTitle">Edit Machine</h3>
              <button
                onClick={() => setSelectedMachine(null)}
                className="EditMachinesCloseBtn"
                title="Close editor"
              >
                <X size={20} />
              </button>
            </div>

            <div className="EditMachinesFormGrid">
              <div className="EditMachinesFormGroup">
                <label className="EditMachinesFormLabel">Machine Name *</label>
                <input
                  type="text"
                  value={editForm.machineName}
                  onChange={(e) => handleEditChange("machineName", e.target.value)}
                  className="EditMachinesFormInput"
                  placeholder="Enter machine name"
                />
              </div>

              <div className="EditMachinesFormGroup">
                <label className="EditMachinesFormLabel">Machine Type *</label>
                <select
                  value={editForm.machineTypeId}
                  onChange={(e) => handleEditChange("machineTypeId", e.target.value)}
                  className="EditMachinesFormSelect"
                >
                  <option value="">Select Type</option>
                  {machineTypes.map((type: MachineType) => (
                    <option key={type._id} value={type._id}>
                      {type.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="EditMachinesFormGroup">
                <label className="EditMachinesFormLabel">Size X *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editForm.sizeX}
                  onChange={(e) => handleEditChange("sizeX", e.target.value)}
                  className="EditMachinesFormInput"
                  placeholder="Enter X dimension"
                />
              </div>

              <div className="EditMachinesFormGroup">
                <label className="EditMachinesFormLabel">Size Y *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editForm.sizeY}
                  onChange={(e) => handleEditChange("sizeY", e.target.value)}
                  className="EditMachinesFormInput"
                  placeholder="Enter Y dimension"
                />
              </div>

              <div className="EditMachinesFormGroup">
                <label className="EditMachinesFormLabel">Size Z *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editForm.sizeZ}
                  onChange={(e) => handleEditChange("sizeZ", e.target.value)}
                  className="EditMachinesFormInput"
                  placeholder="Enter Z dimension"
                />
              </div>
            </div>

            {/* Current Machine Info */}
            <div className="EditMachinesCurrentInfo">
              <h4 className="EditMachinesCurrentInfoTitle">Current Machine Information</h4>
              <div className="EditMachinesCurrentInfoGrid">
                <div className="EditMachinesInfoItem">
                  <span className="EditMachinesInfoLabel">Branch:</span>
                  <span className="EditMachinesInfoValue">{selectedMachine.branchId?.name || "N/A"}</span>
                </div>
                <div className="EditMachinesInfoItem">
                  <span className="EditMachinesInfoLabel">Table Configuration:</span>
                  <span className="EditMachinesInfoValue">
                    {selectedMachine.tableConfig ? (
                      <span className="EditMachinesTableConfigYes">
                        ✅ {selectedMachine.tableConfig.columns?.length || 0} columns configured
                      </span>
                    ) : (
                      <span className="EditMachinesTableConfigNo">❌ No table configuration</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="EditMachinesFormActions">
              <button
                onClick={handleUpdate}
                className="EditMachinesSaveBtn"
                disabled={!editForm.machineName.trim() || !editForm.machineTypeId}
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={handleDeleteClick}
                className="EditMachinesDeleteBtn"
              >
                <Trash2 size={16} />
                Delete Machine
              </button>
              <button
                onClick={() => setSelectedMachine(null)}
                className="EditMachinesCancelBtn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="EditMachinesModal">
            <div className="EditMachinesModalContent">
              <h3 className="EditMachinesModalTitle">
                Confirm Machine Deletion
              </h3>
              <div className="EditMachinesModalBody">
                <p className="EditMachinesModalText">
                  You are about to delete the machine: <strong>{selectedMachine?.machineName}</strong>
                </p>
                <p className="EditMachinesModalWarning">
                  This action cannot be undone. Type{" "}
                  <span className="EditMachinesDeleteKeyword">DELETE</span> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="EditMachinesModalInput"
                  placeholder="Type DELETE to confirm"
                  autoFocus
                />
              </div>
              <div className="EditMachinesModalActions">
                <button
                  onClick={confirmDelete}
                  className="EditMachinesModalConfirmBtn"
                  disabled={deleteInput !== "DELETE"}
                >
                  Confirm Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="EditMachinesModalCancelBtn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditMachines;