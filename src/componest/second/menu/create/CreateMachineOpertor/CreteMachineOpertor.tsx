import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOperatorV2, updateOperatorV2, deleteOperatorV2 } from "../../../../redux/unifiedV2";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import ImportProgressPopup from '../../../../../components/shared/ImportProgressPopup';
import ImportAccountPopup from '../../../../../components/shared/ImportAccountPopup';
import * as XLSX from 'xlsx';
import "./machineOperator.css";

type OperatorData = {
  username: string;
  pin: string;
  confirmPin: string;
  machineId: string;
};

interface CreteMachineOpertorProps {
  initialData?: {
    _id: string;
    username: string;
    machineId: string;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreteMachineOpertor: React.FC<CreteMachineOpertorProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch<AppDispatch>();
  const { handleSave, handleDelete: crudDelete, saveState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();
  const [formData, setFormData] = useState<OperatorData>({
    username: "",
    pin: "",
    confirmPin: "",
    machineId: "",
  });
  const { error } = useSelector(
    (state: RootState) => state.v2.operator
  );

  const [showPin, setShowPin] = useState(false);

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

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { machines: machineList } = useFormDataCache();

  // Load data in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || "",
        pin: "",
        confirmPin: "",
        machineId: initialData.machineId || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (saveState === 'success' && !isEditMode) {
      setFormData({
        username: "",
        pin: "",
        confirmPin: "",
        machineId: "",
      });
    }
  }, [saveState, isEditMode]);

  const handleChange = (field: keyof OperatorData, value: string) => {
    if (field === 'pin' || field === 'confirmPin') {
      if (value && (!/^\d*$/.test(value) || value.length > 4)) {
        return;
      }
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    // In edit mode, PIN is optional (only update if provided)
    if (formData.pin || formData.confirmPin) {
      if (formData.pin !== formData.confirmPin) {
        toast.error('Validation Error', 'PINs do not match!');
        return;
      }
      if (formData.pin.length !== 4) {
        toast.error('Validation Error', 'PIN must be exactly 4 digits!');
        return;
      }
    }

    if (!formData.username || !formData.machineId) {
      toast.error('Validation Error', 'Username and Machine are required!');
      return;
    }

    // For create mode, PIN is required
    if (!isEditMode && !formData.pin) {
      toast.error('Validation Error', 'PIN is required!');
      return;
    }

    const operatorData: any = {
      username: formData.username,
      machineId: formData.machineId,
    };

    // Only include PIN if provided
    if (formData.pin) {
      operatorData.pin = formData.pin;
    }

    const saveAction = async () => {
      if (isEditMode) {
        return dispatch(updateOperatorV2(initialData!._id, operatorData) as any);
      } else {
        return dispatch(createOperatorV2(operatorData) as any);
      }
    };

    handleSave(saveAction, {
      successMessage: isEditMode ? 'Operator updated successfully' : 'Operator created successfully',
      onSuccess: () => {
        if (isEditMode && onSaveSuccess) {
          setTimeout(() => {
            onSaveSuccess();
          }, 1500);
        }
      }
    });
  };

  const handleDeleteClick = () => {
    if (!isEditMode || !initialData) return;

    crudDelete(
      () => dispatch(deleteOperatorV2(initialData._id) as any),
      {
        successMessage: 'Operator deleted successfully',
        confirmMessage: 'Are you sure you want to delete this operator? This action cannot be undone.',
        confirmTitle: 'Delete Operator',
        onSuccess: () => {
          // Delay navigation to show toast
          setTimeout(() => {
            if (onSaveSuccess) onSaveSuccess();
          }, 1500);
        }
      }
    );
  };

  // Excel import functions
  const downloadExcelTemplate = () => {
    const instructions = [
      ['Machine Operator Bulk Import Template'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Maximum 50 operators per import'],
      ['2. Required fields are marked with * in column headers'],
      ['3. Delete the example rows before adding your data'],
      ['4. PIN must be exactly 4 numeric digits'],
      ['5. PIN and Confirm PIN must match'],
      ['6. Machine Name must exactly match an existing machine name'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['Username * - Required. Operator username (e.g., "John Doe", "Operator 1")'],
      ['PIN * - Required. Exactly 4 numeric digits (e.g., "1234", "5678")'],
      ['Confirm PIN * - Required. Must match PIN exactly'],
      ['Machine Name * - Required. Must match an existing machine name (e.g., "CNC Machine 1")'],
    ];

    const templateData = [
      {
        'Username *': 'John Doe',
        'PIN *': '1234',
        'Confirm PIN *': '1234',
        'Machine Name *': 'CNC Machine 1'
      },
      {
        'Username *': 'Jane Smith',
        'PIN *': '5678',
        'Confirm PIN *': '5678',
        'Machine Name *': 'Injection Molding Machine'
      },
    ];

    const wb = XLSX.utils.book_new();
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');
    XLSX.writeFile(wb, 'Machine_Operator_Import_Template.xlsx');

    toast.addToast({
      type: 'success',
      title: 'Success',
      message: 'Template downloaded successfully',
    });
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      if (!workbook.Sheets['Template']) {
        toast.addToast({
          type: 'error',
          title: 'Import Error',
          message: 'Template sheet not found. Please use the downloaded template.',
        });
        return;
      }

      const worksheet = workbook.Sheets['Template'];
      let jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.addToast({
          type: 'error',
          title: 'Import Error',
          message: 'No data found in Template sheet',
        });
        return;
      }

      if (jsonData.length > 50) {
        toast.addToast({
          type: 'warning',
          title: 'Import Limit',
          message: `Limiting import to first 50 operators (found ${jsonData.length})`,
        });
        jsonData = jsonData.slice(0, 50);
      }

      const validationErrors: string[] = [];
      const processedData: any[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;
        const errors: string[] = [];

        const username = row['Username *']?.toString().trim();
        if (!username) {
          errors.push(`Row ${rowNum}: Missing Username`);
        }

        const pin = row['PIN *']?.toString().trim();
        if (!pin) {
          errors.push(`Row ${rowNum}: Missing PIN`);
        } else if (!/^\d{4}$/.test(pin)) {
          errors.push(`Row ${rowNum}: PIN must be exactly 4 numeric digits`);
        }

        const confirmPin = row['Confirm PIN *']?.toString().trim();
        if (!confirmPin) {
          errors.push(`Row ${rowNum}: Missing Confirm PIN`);
        } else if (pin && confirmPin !== pin) {
          errors.push(`Row ${rowNum}: PIN and Confirm PIN do not match`);
        }

        const machineName = row['Machine Name *']?.toString().trim();
        let machineId = '';
        if (!machineName) {
          errors.push(`Row ${rowNum}: Missing Machine Name`);
        } else {
          const machine = machineList.find(
            (m: any) => m.machineName.toLowerCase() === machineName.toLowerCase()
          );
          if (!machine) {
            errors.push(`Row ${rowNum}: Machine "${machineName}" not found`);
          } else {
            machineId = machine._id;
          }
        }

        if (errors.length === 0) {
          processedData.push({
            username,
            pin,
            machineId
          });
        } else {
          validationErrors.push(...errors);
        }
      });

      const validCount = processedData.length;
      const errorCount = validationErrors.length;

      const confirmMessage =
        `Ready to import ${validCount} operators.\n` +
        (errorCount > 0 ? `${errorCount} validation issues found (see console for details).\n` : '') +
        '\nProceed with import?';

      if (errorCount > 0) {
        console.warn('Import Validation Errors:', validationErrors);
      }

      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }

      setBulkImporting(true);
      let successCount = 0;
      let failCount = 0;
      const importErrors: string[] = [];

      for (let i = 0; i < processedData.length; i++) {
        const operatorData = processedData[i];

        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createOperatorV2(operatorData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(
            `Row ${i + 2} (${operatorData.username}): ${errorMsg}`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setBulkImporting(false);

      setImportSummary({
        total: processedData.length,
        success: successCount,
        failed: failCount,
        errors: importErrors,
      });

      if (successCount > 0) {
        toast.addToast({
          type: 'success',
          title: 'Import Complete',
          message: `Successfully imported ${successCount} operator(s)`,
        });
      }
    } catch (error: any) {
      console.error('Excel import error:', error);
      toast.addToast({
        type: 'error',
        title: 'Import Failed',
        message: `Failed to import Excel file: ${error.message}`,
      });
      setBulkImporting(false);
    }
  };

  return (
    <div className="createMachineOperator-container">
      <div className="createMachineOperator-form">
        {/* Delete Confirmation Modal */}
        {confirmDialog.isOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                maxWidth: "400px",
                width: "90%",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>Warning</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>{confirmDialog.title}</h3>
              <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                {confirmDialog.message}
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={closeConfirmDialog}
                  style={{
                    padding: "10px 24px",
                    background: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  disabled={deleteState === 'loading'}
                  style={{
                    padding: "10px 24px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    opacity: deleteState === 'loading' ? 0.7 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {deleteState === 'loading' ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditMode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Back to List
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleteState === 'loading'}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                opacity: deleteState === 'loading' ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}
            >
              {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}

        {!isEditMode ? (
          <div className="createaccount-title-row">
            <h2 className="createMachineOperator-title" style={{ margin: 0, border: 'none', padding: 0 }}>
              Create Machine Operator
            </h2>

            <button
              type="button"
              onClick={() => setShowImportPopup(true)}
              className="import-accounts-title-btn"
              disabled={bulkImporting}
            >
              Import Operators
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        ) : (
          <h2 className="createMachineOperator-title">
            Edit: {initialData?.username}
          </h2>
        )}

        <div className="createMachineOperator-group">
          <label className="createMachineOperator-label">Username *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            className="createMachineOperator-input"
            placeholder="Enter username"
          />
        </div>

        <div className="createMachineOperator-group">
          <label className="createMachineOperator-label">
            PIN (4 digits) {isEditMode ? '(leave empty to keep current)' : '*'}
          </label>
          <div className="createMachineOperator-pinWrapper">
            <input
              type={showPin ? "text" : "password"}
              value={formData.pin}
              onChange={(e) => handleChange("pin", e.target.value)}
              className="createMachineOperator-input"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="createMachineOperator-pinToggle"
            >
              {showPin ? "🙈" : "👁"}
            </button>
          </div>
          <span className="createMachineOperator-hint">
            {formData.pin.length}/4 digits
          </span>
        </div>

        <div className="createMachineOperator-group">
          <label className="createMachineOperator-label">Confirm PIN *</label>
          <div className="createMachineOperator-pinWrapper">
            <input
              type={showPin ? "text" : "password"}
              value={formData.confirmPin}
              onChange={(e) => handleChange("confirmPin", e.target.value)}
              className="createMachineOperator-input"
              placeholder="Confirm 4-digit PIN"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
            />
          </div>
          {formData.pin && formData.confirmPin && (
            <span className={`createMachineOperator-hint ${formData.pin === formData.confirmPin ? 'success' : 'error'}`}>
              {formData.pin === formData.confirmPin ? "✓ PINs match" : "✗ PINs do not match"}
            </span>
          )}
        </div>

        <div className="createMachineOperator-group">
          <label className="createMachineOperator-label">Machine *</label>
          <select
            value={formData.machineId}
            onChange={(e) => handleChange("machineId", e.target.value)}
            className="createMachineOperator-select"
          >
            <option value="">Select machine</option>
            {machineList.map((machine: any) => (
              <option key={machine._id} value={machine._id}>
                {machine.machineName} ({machine.machineType?.type || machine.machineType})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="createMachineOperator-button"
          disabled={saveState === 'loading' || (!isEditMode && formData.pin.length !== 4) || (formData.pin && formData.pin !== formData.confirmPin)}
          style={{ opacity: saveState === 'loading' ? 0.7 : 1, transition: "all 0.2s ease" }}
        >
          {saveState === 'loading' ? "Saving..." : isEditMode ? "Update Operator" : "Create Operator"}
        </button>

        {error && <div className="createMachineOperator-error">{error}</div>}
      </div>

      {/* Import Account Popup */}
      <ImportAccountPopup
        isOpen={showImportPopup}
        onClose={() => setShowImportPopup(false)}
        onDownloadTemplate={downloadExcelTemplate}
        onFileSelect={(e) => {
          handleExcelImport(e);
          setShowImportPopup(false);
        }}
        isImporting={bulkImporting}
        title="Import Machine Operators"
        infoMessage="Bulk import up to 50 operators at once. Download the template first."
        buttonText="Import from Excel"
      />

      {/* Import Progress Popup */}
      <ImportProgressPopup
        isOpen={bulkImporting}
        currentIndex={importProgress.current}
        total={importProgress.total}
        successCount={importProgress.success}
        failedCount={importProgress.failed}
        message={`Importing ${importProgress.current} of ${importProgress.total} operators...`}
      />

      {/* Import Summary Modal */}
      {importSummary && (
        <div className="import-summary-overlay" onClick={() => setImportSummary(null)}>
          <div className="import-summary-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', color: '#1f2937', textAlign: 'center' }}>
              Import Complete
            </h2>

            <div className="summary-stats">
              <div className="stat-box success">
                <div className="stat-number">{importSummary.success}</div>
                <div className="stat-label">Success</div>
              </div>
              <div className="stat-box failed">
                <div className="stat-number">{importSummary.failed}</div>
                <div className="stat-label">Failed</div>
              </div>
            </div>

            {importSummary.errors.length > 0 && (
              <div className="error-list">
                <h4 style={{ margin: '0 0 12px 0', color: '#dc2626', fontWeight: 600 }}>Errors:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                  {importSummary.errors.map((err, idx) => (
                    <li key={idx} style={{ marginBottom: '8px', color: '#991b1b', fontSize: '0.875rem' }}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setImportSummary(null)}
              style={{
                width: '100%',
                padding: '12px 24px',
                marginTop: '24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreteMachineOpertor;
