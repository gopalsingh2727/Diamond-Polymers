import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createMachineTypeV2, updateMachineTypeV2, deleteMachineTypeV2 } from "../../../../redux/unifiedV2";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import ImportProgressPopup from "../../../../../components/shared/ImportProgressPopup";
import ImportAccountPopup from "../../../../../components/shared/ImportAccountPopup";
import * as XLSX from 'xlsx';
import "./createMachineType.css";

interface CreateMachineTypeProps {
  initialData?: {
    _id: string;
    type: string;
    description: string;
    isActive?: boolean;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateMachineType: React.FC<CreateMachineTypeProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const [machineTypeName, setMachineTypeName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  const { loading } = useSelector(
    (state: RootState) => state.v2.machineType
  );

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

  // Load data in edit mode
  useEffect(() => {
    if (initialData) {
      setMachineTypeName(initialData.type || "");
      setDescription(initialData.description || "");
      setIsActive(initialData.isActive ?? true);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!machineTypeName.trim() || !description.trim()) {
      toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    const saveAction = isEditMode
      ? () => dispatch(updateMachineTypeV2(initialData!._id, { type: machineTypeName, description, isActive }))
      : () => dispatch(createMachineTypeV2({ type: machineTypeName, description, isActive }));

    const successMsg = isEditMode ? 'Machine type updated!' : 'Machine type added!';

    handleSave(saveAction, {
      successMessage: successMsg,
      onSuccess: () => {
        setMachineTypeName("");
        setDescription("");
        setIsActive(true);
        if (onSaveSuccess) {
          setTimeout(() => {
            onSaveSuccess();
          }, 1500);
        }
      }
    });
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Delete this machine type?")) return;

    try {
      await dispatch(deleteMachineTypeV2(initialData._id));
      toast.success('Deleted', 'Machine type deleted');
      setTimeout(() => onSaveSuccess?.(), 1000);
    } catch {
      toast.error('Error', 'Failed to delete');
    }
  };

  // Excel import functions
  const downloadExcelTemplate = () => {
    const instructions = [
      ['Machine Type Bulk Import Template'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Maximum 50 machine types per import'],
      ['2. Required fields are marked with * in column headers'],
      ['3. Delete the example rows before adding your data'],
      ['4. Status must be "Active" or "Inactive"'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['Machine Type Name * - Required. Name of the machine type (1-200 characters)'],
      ['Description * - Required. Description of the machine type'],
      ['Status - Optional. Must be "Active" or "Inactive" (defaults to Active)'],
    ];

    const templateData = [
      {
        'Machine Type Name *': 'CNC Machine',
        'Description *': 'Computer Numerical Control Machine',
        'Status': 'Active',
      },
      {
        'Machine Type Name *': 'Lathe Machine',
        'Description *': 'Metal cutting lathe machine',
        'Status': 'Active',
      },
    ];

    const wb = XLSX.utils.book_new();
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');
    XLSX.writeFile(wb, 'MachineType_Import_Template.xlsx');

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
          message: `Limiting import to first 50 machine types (found ${jsonData.length})`,
        });
        jsonData = jsonData.slice(0, 50);
      }

      const validationErrors: string[] = [];
      const processedData: any[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;
        const errors: string[] = [];

        const type = row['Machine Type Name *']?.toString().trim();
        if (!type) {
          errors.push(`Row ${rowNum}: Missing Machine Type Name`);
        }

        const description = row['Description *']?.toString().trim();
        if (!description) {
          errors.push(`Row ${rowNum}: Missing Description`);
        }

        const statusStr = row['Status']?.toString().trim();
        let isActive = true;
        if (statusStr) {
          if (statusStr === 'Active') {
            isActive = true;
          } else if (statusStr === 'Inactive') {
            isActive = false;
          } else {
            errors.push(`Row ${rowNum}: Invalid status "${statusStr}". Must be "Active" or "Inactive".`);
          }
        }

        if (errors.length > 0) {
          validationErrors.push(...errors);
          return;
        }

        processedData.push({
          type,
          description,
          isActive,
        });
      });

      const validCount = processedData.length;
      const errorCount = validationErrors.length;

      const confirmMessage =
        `Ready to import ${validCount} machine types.\n` +
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
        const machineTypeData = processedData[i];

        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createMachineTypeV2(machineTypeData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(
            `Row ${i + 2} (${machineTypeData.type}): ${errorMsg}`
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
          message: `Successfully imported ${successCount} machine type(s)`,
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
    <div className="createMachineType-container">
      <div className="createMachineType-form">
        {/* Header with Back/Delete for edit mode */}
        {isEditMode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              ← Back to List
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        )}

        {!isEditMode ? (
          <div className="createMachineType-title-row">
            <h2 className="createMachineType-title">
              Create Machine Type
            </h2>

            <button
              type="button"
              onClick={() => setShowImportPopup(true)}
              className="import-machinetype-btn"
              disabled={bulkImporting}
            >
              Import Machine Types
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        ) : (
          <h2 className="createMachineType-title">
            Edit: {initialData?.type}
          </h2>
        )}

        <div className="createMachineType-group">
          <label className="createMachineType-label">Machine Type Name *</label>
          <input
            type="text"
            value={machineTypeName}
            onChange={(e) => setMachineTypeName(e.target.value)}
            className="createMachineType-input"
            placeholder="Enter Machine Type"
          />
        </div>

        <div className="createMachineType-group">
          <label className="createMachineType-label">Description *</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="createMachineType-input"
            placeholder="Enter Description"
          />
        </div>

        <div className="createMachineType-group">
          <label className="createMachineType-label">Status</label>
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

        <button
          className="createMachineType-button"
          onClick={handleSubmit}
          disabled={!machineTypeName.trim() || !description.trim() || saveState === 'loading'}
        >
          {saveState === 'loading' ? 'Saving...' : isEditMode ? 'Update' : 'Add Machine Type'}
        </button>

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
          title="Import Machine Types"
          infoMessage="Bulk import up to 50 machine types at once. Download the template first."
          buttonText="Import from Excel"
        />

        {/* Import Progress Popup */}
        <ImportProgressPopup
          isOpen={bulkImporting}
          currentIndex={importProgress.current}
          total={importProgress.total}
          successCount={importProgress.success}
          failedCount={importProgress.failed}
          message={`Importing ${importProgress.current} of ${importProgress.total} machine types...`}
        />

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

        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  );
};

export default CreateMachineType;
