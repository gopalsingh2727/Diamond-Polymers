import React, { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateMachineV2 as updateMachine, deleteMachineV2 as deleteMachine } from "../../../../redux/unifiedV2/machineActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { AppDispatch } from "../../../../../store";
import { useMachineTableConfig, TableConfig } from "../../hooks/useMachineTableConfig";
import { MachineTableEditor } from "../../shared/MachineTableEditor";
import { Settings, Eye, Table as TableIcon, Edit2 } from 'lucide-react';
import "./editMachines.css";

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
  tableConfig?: TableConfig;
}

interface EditForm {
  machineName: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  machineTypeId: string;
}

const EditMachineSimplified: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { machines, machineTypes, loading, error } = useFormDataCache();
  const { handleSave, handleUpdate, handleDelete: crudDelete, saveState, updateState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

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
  const [editMode, setEditMode] = useState<'basic' | 'config' | 'preview' | 'data'>('basic');

  // Use shared table config hook
  const tableConfig = useMachineTableConfig();

  // Filter machines
  const filteredMachines = machines.filter((machine: Machine) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      machine.machineName?.toLowerCase().includes(search) ||
      machine.machineType?.type?.toLowerCase().includes(search) ||
      machine.branchId?.name?.toLowerCase().includes(search)
    );
  });

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showDetail || filteredMachines.length === 0) return;
    if (e.key === "ArrowDown") {
      setSelectedRow((prev) => Math.min(prev + 1, filteredMachines.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedRow((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      const selected = filteredMachines[selectedRow];
      if (selected) openEditor(selected);
    }
  }, [filteredMachines, selectedRow, showDetail]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
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

    // Load table config using shared hook
    tableConfig.loadConfig(machine.tableConfig);
    setShowDetail(true);
    setEditMode('basic');
  };

  const handleEditChange = (field: keyof EditForm, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditModeChange = (mode: 'basic' | 'config' | 'preview' | 'data') => {
    if (mode === 'preview') {
      tableConfig.generateTestData();
    }
    setEditMode(mode);
  };

  const handleMachineUpdate = async () => {
    if (!selectedMachine) return;

    if (!editForm.machineName.trim()) {
      toast.error('Validation Error', 'Please enter machine name');
      return;
    }
    if (!editForm.machineTypeId) {
      toast.error('Validation Error', 'Please select machine type');
      return;
    }
    if (!editForm.sizeX || !editForm.sizeY || !editForm.sizeZ) {
      toast.error('Validation Error', 'Please enter all size dimensions');
      return;
    }

    const updateData: any = {
      machineName: editForm.machineName.trim(),
      sizeX: editForm.sizeX,
      sizeY: editForm.sizeY,
      sizeZ: editForm.sizeZ,
      machineType: editForm.machineTypeId,
    };

    // Include table config from shared hook
    const config = tableConfig.getConfig();
    if (config.columns.length > 0) {
      updateData.tableConfig = config;
    }

    handleUpdate(
      () => dispatch(updateMachine(selectedMachine._id, updateData)),
      {
        successMessage: 'Machine updated successfully!',
        errorMessage: 'Failed to update machine.',
        onSuccess: () => {
          setTimeout(() => {
            setShowDetail(false);
            setSelectedMachine(null);
            tableConfig.resetConfig();
          }, 1500);
        }
      }
    );
  };

  const handleMachineDelete = () => {
    if (!selectedMachine) return;

    crudDelete(
      () => dispatch(deleteMachine(selectedMachine._id)),
      {
        confirmTitle: 'Confirm Delete',
        confirmMessage: 'Are you sure you want to delete this machine?',
        successMessage: 'Machine deleted successfully.',
        errorMessage: 'Failed to delete machine.',
        onSuccess: () => {
          setShowDetail(false);
          setSelectedMachine(null);
        }
      }
    );
  };

  return (
    <div className="EditMachineType">
      {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError" style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && machines.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search machines..."
                className="editsectionsTable-searchInput"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="editsectionsTable-searchIcon">search</span>
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="editsectionsTable-clearButton">
                  X
                </button>
              )}
            </div>
            <div className="editsectionsTable-countBadge">
              {filteredMachines.length} of {machines.length} machines
            </div>
          </div>

          {/* Table */}
          {filteredMachines.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Machine Name</th>
                    <th className="editsectionsTable-th">Type</th>
                    <th className="editsectionsTable-th">Size X</th>
                    <th className="editsectionsTable-th">Size Y</th>
                    <th className="editsectionsTable-th">Size Z</th>
                    <th className="editsectionsTable-th">Branch</th>
                    <th className="editsectionsTable-th">Table Config</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredMachines.map((machine: Machine, index: number) => (
                    <tr
                      key={machine._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => {
                        setSelectedRow(index);
                        openEditor(machine);
                      }}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{machine.machineName}</td>
                      <td className="editsectionsTable-td">{machine.machineType?.type || "N/A"}</td>
                      <td className="editsectionsTable-td">{machine.sizeX}</td>
                      <td className="editsectionsTable-td">{machine.sizeY}</td>
                      <td className="editsectionsTable-td">{machine.sizeZ}</td>
                      <td className="editsectionsTable-td">{machine.branchId?.name || "N/A"}</td>
                      <td className="editsectionsTable-td">
                        {machine.tableConfig ? (
                          <span style={{ color: 'green' }}>
                            {machine.tableConfig.columns?.length || 0} cols
                          </span>
                        ) : (
                          <span style={{ color: '#999' }}>No config</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No machines found matching "{searchTerm}"
            </div>
          )}
        </div>
      ) : showDetail && selectedMachine ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleMachineDelete} className="Delete" disabled={deleteState === 'loading'}>
              {deleteState === 'loading' ? 'Deleting...' : 'Delete Machine'}
            </button>
          </div>

          {/* Edit Mode Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
            {[
              { mode: 'basic' as const, icon: <Edit2 size={16} />, label: 'Basic Info' },
              { mode: 'config' as const, icon: <Settings size={16} />, label: 'Configure Table' },
              { mode: 'preview' as const, icon: <Eye size={16} />, label: 'Preview & Test' },
              { mode: 'data' as const, icon: <TableIcon size={16} />, label: `Data (${tableConfig.tableRows.length})` }
            ].map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => handleEditModeChange(mode)}
                style={{
                  padding: '10px 20px',
                  background: editMode === mode ? '#2d89ef' : 'transparent',
                  color: editMode === mode ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Basic Info Form */}
          {editMode === 'basic' && (
            <>
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
                    <option key={type._id} value={type._id}>{type.type}</option>
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
              <div className="info-section">
                <p><strong>Branch:</strong> {selectedMachine.branchId?.name || "N/A"}</p>
                <p><strong>Current Type:</strong> {selectedMachine.machineType?.type || "N/A"}</p>
                <p>
                  <strong>Table Configuration:</strong>{" "}
                  {tableConfig.tableColumns.length > 0 ? (
                    <span style={{ color: 'green' }}>
                      {tableConfig.tableColumns.length} columns configured
                    </span>
                  ) : (
                    <span style={{ color: '#999' }}>No table configuration</span>
                  )}
                </p>
              </div>
            </>
          )}

          {/* Table Editor (Config/Preview/Data modes) - Uses shared component */}
          {editMode !== 'basic' && (
            <MachineTableEditor
              mode={editMode}
              machineName={selectedMachine.machineName}
              tableConfig={tableConfig}
            />
          )}

          {/* Save Button */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              onClick={() => setShowDetail(false)}
              style={{
                padding: '10px 24px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleMachineUpdate}
              disabled={updateState === 'loading'}
              style={{
                padding: '10px 24px',
                background: updateState === 'loading' ? '#9ca3af' : '#2d89ef',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: updateState === 'loading' ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {updateState === 'loading' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{confirmDialog.title}</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={closeConfirmDialog}
                disabled={deleteState === 'loading'}
                style={{
                  padding: '10px 24px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                disabled={deleteState === 'loading'}
                style={{
                  padding: '10px 24px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditMachineSimplified;
