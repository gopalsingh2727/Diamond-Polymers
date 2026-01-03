import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createMachineV2, updateMachineV2, deleteMachineV2 } from "../../../../redux/unifiedV2";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import ImportProgressPopup from "../../../../../components/shared/ImportProgressPopup";
import ImportAccountPopup from "../../../../../components/shared/ImportAccountPopup";
import * as XLSX from 'xlsx';
import "./createMachine.css";

// Props interface for edit mode support
interface CreateMachineProps {
  initialData?: {
    _id: string;
    machineName: string;
    machineType: { _id: string; type: string };
    isActive?: boolean;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateMachine: React.FC<CreateMachineProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  // Edit mode detection
  const isEditMode = !!initialData;
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [isActive, setIsActive] = useState(true);

  // CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Get data from cached form data
  const { machineTypes, loading } = useFormDataCache();

  // Excel import state
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    success: 0,
    failed: 0,
    percentage: 0,
  });
  const [importSummary, setImportSummary] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // EDIT MODE: Populate form with initialData when editing
  useEffect(() => {
    if (initialData) {
      setMachineName(initialData.machineName || "");
      setMachineType(initialData.machineType?._id || "");
      setIsActive(initialData.isActive ?? true);
    }
  }, [initialData]);

  useEffect(() => {
    containerRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const isValidForm = () => {
    return machineName.trim().length > 0 && machineType;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isValidForm()) {
      toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    const newMachine = {
      machineName: machineName.trim(),
      machineType,
      isActive
    };

    // Use updateMachineV2 for edit mode, createMachineV2 for new
    const saveAction = isEditMode
      ? () => dispatch(updateMachineV2(initialData!._id, newMachine))
      : () => dispatch(createMachineV2(newMachine));

    const successMsg = isEditMode
      ? 'Machine updated successfully!'
      : 'Machine created successfully!';

    handleSave(saveAction, {
      successMessage: successMsg,
      onSuccess: () => {
        setTimeout(() => {
          resetForm();
          if (onSaveSuccess) {
            onSaveSuccess();
          } else {
            navigate(-1);
          }
        }, 1500);
      }
    });
  };

  // Handle delete (only in edit mode)
  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Are you sure you want to delete this machine?")) return;

    try {
      await dispatch(deleteMachineV2(initialData._id));
      toast.success('Deleted', 'Machine deleted successfully');
      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete machine');
    }
  };

  const resetForm = () => {
    setMachineName("");
    setMachineType("");
    setIsActive(true);
  };

  // Excel import functions
  const downloadExcelTemplate = () => {
    // Create instructions sheet data
    const instructions = [
      ['Machine Bulk Import Template'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Maximum 50 machines per import'],
      ['2. Required fields are marked with * in column headers'],
      ['3. Delete the example rows before adding your data'],
      ['4. Machine Type must match exactly (see available types below)'],
      ['5. Status must be either "Active" or "Inactive" (case-insensitive)'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['Machine Name * - Required. Machine name (1-200 characters)'],
      ['Machine Type * - Required. Must match one of your existing machine types'],
      ['Status - Optional. Either "Active" or "Inactive" (default: Active)'],
      [''],
      ['AVAILABLE MACHINE TYPES:'],
      [Array.isArray(machineTypes) ? machineTypes.map((t: any) => t.type).join(', ') : 'Loading...'],
      [''],
      ['VALIDATION RULES:'],
      ['- Machine Name: Required, must be unique'],
      ['- Machine Type: Must match exactly from available types list'],
      ['- Status: Must be "Active" or "Inactive" (default is Active if not specified)'],
    ];

    // Create template sheet with example data
    const templateData = [
      {
        'Machine Name *': 'Injection Molding Machine - 01',
        'Machine Type *': Array.isArray(machineTypes) && machineTypes.length > 0 ? machineTypes[0].type : 'Example Type',
        'Status': 'Active',
      },
      {
        'Machine Name *': 'CNC Lathe - 02',
        'Machine Type *': Array.isArray(machineTypes) && machineTypes.length > 0 ? machineTypes[0].type : 'Example Type',
        'Status': 'Inactive',
      },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add Instructions sheet
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Add Template sheet
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');

    // Download file
    XLSX.writeFile(wb, 'Machine_Import_Template.xlsx');

    toast.success('Success', 'Template downloaded successfully');
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Read file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // Check if Template sheet exists
      if (!workbook.Sheets['Template']) {
        toast.error('Import Error', 'Template sheet not found. Please use the downloaded template.');
        return;
      }

      // Parse Template sheet
      const worksheet = workbook.Sheets['Template'];
      let jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('Import Error', 'No data found in Template sheet');
        return;
      }

      // Limit to 50 machines
      if (jsonData.length > 50) {
        toast.warning('Import Limit', `Limiting import to first 50 machines (found ${jsonData.length})`);
        jsonData = jsonData.slice(0, 50);
      }

      // Validate and process data
      const validationErrors: string[] = [];
      const processedData: any[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2; // Excel row number (header is row 1)
        const errors: string[] = [];

        // Required: Machine Name
        const machineName = row['Machine Name *']?.toString().trim();
        if (!machineName) {
          errors.push(`Row ${rowNum}: Missing Machine Name`);
        }

        // Required: Machine Type
        const machineTypeName = row['Machine Type *']?.toString().trim();
        if (!machineTypeName) {
          errors.push(`Row ${rowNum}: Missing Machine Type`);
        }

        // If there are validation errors, skip this row
        if (errors.length > 0) {
          validationErrors.push(...errors);
          return;
        }

        // Auto-lookup machineType by name (case-insensitive)
        const machineTypeObj = Array.isArray(machineTypes)
          ? machineTypes.find((t: any) => t.type.toLowerCase() === machineTypeName.toLowerCase())
          : null;

        if (!machineTypeObj) {
          validationErrors.push(`Row ${rowNum}: Machine Type "${machineTypeName}" not found. Must match exactly from available types.`);
          return;
        }

        // Parse Status (default: Active)
        const statusStr = row['Status']?.toString().trim().toLowerCase() || 'active';
        const isActive = statusStr === 'active';

        // Build machine data object
        const machineData: any = {
          machineName: machineName,
          machineType: machineTypeObj._id,
          isActive: isActive,
        };

        processedData.push(machineData);
      });

      // Show confirmation dialog
      const validCount = processedData.length;
      const errorCount = validationErrors.length;

      const confirmMessage =
        `Ready to import ${validCount} machines.\n` +
        (errorCount > 0 ? `${errorCount} validation issues found (see console for details).\n` : '') +
        '\nProceed with import?';

      if (errorCount > 0) {
        console.warn('Import Validation Errors:', validationErrors);
      }

      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }

      // Start bulk import
      setBulkImporting(true);
      let successCount = 0;
      let failCount = 0;
      const importErrors: string[] = [];

      for (let i = 0; i < processedData.length; i++) {
        const machineData = processedData[i];

        // Update progress
        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createMachineV2(machineData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(
            `Row ${i + 2} (${machineData.machineName}): ${errorMsg}`
          );
        }

        // Rate limiting prevention (50ms delay = 20 machines/second)
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setBulkImporting(false);

      // Show summary modal
      setImportSummary({
        total: processedData.length,
        success: successCount,
        failed: failCount,
        errors: importErrors,
      });

      // Show toast
      if (successCount > 0) {
        toast.success('Import Complete', `Successfully imported ${successCount} machine(s)`);
      }
    } catch (error: any) {
      console.error('Excel import error:', error);
      toast.error('Import Failed', `Failed to import Excel file: ${error.message}`);
      setBulkImporting(false);
    }
  };

  return (
    <div ref={containerRef} className="createMachineCss" aria-labelledby="CreateMachineFormTitle">
      {/* Import Machine Popup */}
      <ImportAccountPopup
        isOpen={showImportPopup}
        onClose={() => setShowImportPopup(false)}
        onDownloadTemplate={downloadExcelTemplate}
        onFileSelect={(e) => {
          handleExcelImport(e);
          setShowImportPopup(false);
        }}
        isImporting={bulkImporting}
        title="Import Machines"
        infoMessage="Bulk import up to 50 machines at once. Download the template first."
        buttonText="Import from Excel"
      />

      {/* Import Progress Popup */}
      <ImportProgressPopup
        isOpen={bulkImporting}
        currentIndex={importProgress.current}
        total={importProgress.total}
        successCount={importProgress.success}
        failedCount={importProgress.failed}
      />

      <form onSubmit={handleSubmit} className="CreateMachineForm">
        {/* Header with Back/Delete buttons for edit mode */}
        {isEditMode ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ← Back to List
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Delete Machine
            </button>
          </div>
        ) : (
          <div className="createaccount-title-row">
            <h2 id="CreateMachineFormTitle" className="CreateMachineFormTitle" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
              Create Machine
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', verticalAlign: 'middle', color: '#FF6B35' }}>
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
            </h2>

            {/* Import Button on same line - Only in Create Mode */}
            <button
              type="button"
              onClick={() => setShowImportPopup(true)}
              className="import-accounts-title-btn"
              disabled={bulkImporting}
            >
              Import Machines
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        )}

        {isEditMode && (
          <h2 id="CreateMachineFormTitle" className="CreateMachineFormTitle">
            Edit Machine: {initialData?.machineName}
          </h2>
        )}

        <div className="CreateMachineFormGroup">
          <label htmlFor="CreateMachineMachineType" className="CreateMachineFormLabel">
            Machine Type *
          </label>
          <select
            id="CreateMachineMachineType"
            value={machineType}
            onChange={(e) => setMachineType(e.target.value)}
            className="createDivInput"
            aria-required="true"
          >
            <option value="">Select Machine Type</option>
            {loading ? (
              <option disabled>Loading...</option>
            ) : (
              Array.isArray(machineTypes) && machineTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.type}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="CreateMachineFormGroup">
          <label htmlFor="CreateMachineMachineName" className="CreateMachineFormLabel">
            Machine Name *
          </label>
          <input
            id="CreateMachineMachineNamemargin-left"
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className="createDivInput"
            placeholder="Enter machine name"
            aria-required="true"
          />
        </div>

        <div className="CreateMachineFormGroup">
          <label className="CreateMachineFormLabel">Status</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsActive(true)}
              style={{
                padding: '8px 16px',
                background: isActive ? '#22c55e' : '#e5e7eb',
                color: isActive ? 'white' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: isActive ? '600' : '400'
              }}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setIsActive(false)}
              style={{
                padding: '8px 16px',
                background: !isActive ? '#ef4444' : '#e5e7eb',
                color: !isActive ? 'white' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: !isActive ? '600' : '400'
              }}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="CreateMachineFormActions">
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
            disabled={!isValidForm()}
            className="CreateMachineSaveButton"
          >
            {isEditMode ? 'Update Machine' : 'Create Machine'}
          </ActionButton>
        </div>
      </form>

      {/* Import Summary Modal */}
      {importSummary && (
        <div
          className="import-summary-overlay"
          onClick={() => setImportSummary(null)}
        >
          <div
            className="import-summary-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 24px 0', textAlign: 'center', fontSize: '1.5rem' }}>
              Import Complete
            </h3>

            <div className="summary-stats">
              <div className="stat-box success">
                <div className="stat-number">{importSummary.success}</div>
                <div className="stat-label">Successful</div>
              </div>
              <div className="stat-box failed">
                <div className="stat-number">{importSummary.failed}</div>
                <div className="stat-label">Failed</div>
              </div>
            </div>

            {importSummary.errors.length > 0 && (
              <div className="error-list">
                <h4 style={{ margin: '20px 0 12px 0', fontSize: '1rem' }}>Errors:</h4>
                <ul style={{ margin: 0, padding: '0 0 0 20px', maxHeight: '200px', overflowY: 'auto' }}>
                  {importSummary.errors.slice(0, 10).map((err, i) => (
                    <li key={i} style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>
                      {err}
                    </li>
                  ))}
                  {importSummary.errors.length > 10 && (
                    <li style={{ marginTop: '8px', fontWeight: 'bold', color: '#333' }}>
                      ...and {importSummary.errors.length - 10} more errors
                    </li>
                  )}
                </ul>
              </div>
            )}

            <button
              onClick={() => setImportSummary(null)}
              style={{
                marginTop: '24px',
                padding: '12px 32px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateMachine;
