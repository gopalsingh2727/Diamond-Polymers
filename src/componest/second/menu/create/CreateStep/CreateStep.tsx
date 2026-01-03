import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../store";
import { createStepV2, updateStepV2, deleteStepV2 } from "../../../../redux/unifiedV2";
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import ImportProgressPopup from '../../../../../components/shared/ImportProgressPopup';
import ImportAccountPopup from '../../../../../components/shared/ImportAccountPopup';
import * as XLSX from 'xlsx';
import "./createStep.css";

interface CreateStepProps {
  initialData?: {
    _id: string;
    stepName: string;
    machines?: { machineId: string; sequence?: number }[];
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateStep: React.FC<CreateStepProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch<AppDispatch>();
  const [stepName, setStepName] = useState("");
  const [machines, setMachines] = useState<{ machineId: string }[]>([{ machineId: "" }]);

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

  const { saveState, handleSave, toast } = useCRUD();
  const { machines: machineList } = useFormDataCache();

  useEffect(() => {
    if (initialData) {
      setStepName(initialData.stepName || "");
      if (initialData.machines && initialData.machines.length > 0) {
        setMachines(initialData.machines.map(m => ({ machineId: m.machineId })));
      }
    }
  }, [initialData]);

  const handleChange = (index: number, value: string) => {
    const updated = [...machines];
    updated[index].machineId = value;
    setMachines(updated);
  };

  const handleAddMachine = () => {
    setMachines([...machines, { machineId: "" }]);
  };

  const handleRemoveMachine = (index: number) => {
    if (machines.length <= 1) return;
    setMachines(machines.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const filtered = machines.filter((m) => m.machineId);

    if (!stepName.trim()) {
      toast.error('Validation Error', 'Step name is required');
      return;
    }

    if (filtered.length === 0) {
      toast.error('Validation Error', 'At least one machine is required');
      return;
    }

    const stepData = {
      stepName,
      machines: filtered.map((m, i) => ({ machineId: m.machineId, sequence: i + 1 })),
    };

    const saveAction = isEditMode
      ? () => dispatch(updateStepV2(initialData!._id, stepData))
      : () => dispatch(createStepV2(stepData));

    handleSave(saveAction, {
      successMessage: isEditMode ? 'Step updated!' : 'Production step created!',
      onSuccess: () => {
        setStepName("");
        setMachines([{ machineId: "" }]);
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
    if (!window.confirm("Delete this step?")) return;
    try {
      await dispatch(deleteStepV2(initialData._id));
      toast.success('Deleted', 'Step deleted');
      setTimeout(() => onSaveSuccess?.(), 1000);
    } catch {
      toast.error('Error', 'Failed to delete');
    }
  };

  // Excel import functions
  const downloadExcelTemplate = () => {
    const instructions = [
      ['Production Step Bulk Import Template'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Maximum 50 production steps per import'],
      ['2. Required fields are marked with * in column headers'],
      ['3. Delete the example rows before adding your data'],
      ['4. Machine Names should be comma-separated if multiple (e.g., "CNC Machine 1, Lathe Machine")'],
      ['5. Each machine name must exactly match an existing machine name'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['Step Name * - Required. Name of the production step (e.g., "Cutting", "Assembly")'],
      ['Machine Names * - Required. Comma-separated list of machine names (e.g., "CNC Machine 1, Lathe Machine")'],
    ];

    const templateData = [
      {
        'Step Name *': 'Cutting',
        'Machine Names *': 'CNC Machine 1, CNC Machine 2'
      },
      {
        'Step Name *': 'Assembly',
        'Machine Names *': 'Assembly Station 1'
      },
    ];

    const wb = XLSX.utils.book_new();
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');
    XLSX.writeFile(wb, 'Production_Step_Import_Template.xlsx');

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
          message: `Limiting import to first 50 steps (found ${jsonData.length})`,
        });
        jsonData = jsonData.slice(0, 50);
      }

      const validationErrors: string[] = [];
      const processedData: any[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;
        const errors: string[] = [];

        const stepName = row['Step Name *']?.toString().trim();
        if (!stepName) {
          errors.push(`Row ${rowNum}: Missing Step Name`);
        }

        const machineNamesStr = row['Machine Names *']?.toString().trim();
        const machineIds: { machineId: string; sequence: number }[] = [];

        if (!machineNamesStr) {
          errors.push(`Row ${rowNum}: Missing Machine Names`);
        } else {
          // Split by comma and trim each machine name
          const machineNames = machineNamesStr.split(',').map((name: string) => name.trim()).filter((name: string) => name);

          if (machineNames.length === 0) {
            errors.push(`Row ${rowNum}: No valid machine names found`);
          } else {
            // Lookup each machine name
            machineNames.forEach((machineName: string, idx: number) => {
              const machine = machineList.find(
                (m: any) => m.machineName.toLowerCase() === machineName.toLowerCase()
              );

              if (!machine) {
                errors.push(`Row ${rowNum}: Machine "${machineName}" not found`);
              } else {
                machineIds.push({
                  machineId: machine._id,
                  sequence: idx + 1
                });
              }
            });
          }
        }

        if (errors.length === 0) {
          processedData.push({
            stepName,
            machines: machineIds
          });
        } else {
          validationErrors.push(...errors);
        }
      });

      const validCount = processedData.length;
      const errorCount = validationErrors.length;

      const confirmMessage =
        `Ready to import ${validCount} production steps.\n` +
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
        const stepData = processedData[i];

        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createStepV2(stepData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(
            `Row ${i + 2} (${stepData.stepName}): ${errorMsg}`
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
          message: `Successfully imported ${successCount} production step(s)`,
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
    <div className="productionsstep-container">
      <div className="productionsstep-form">
        {isEditMode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button type="button" onClick={onCancel} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              ← Back to List
            </button>
            <button type="button" onClick={handleDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        )}

        {!isEditMode ? (
          <div className="createaccount-title-row">
            <h2 className="productionsstep-title" style={{ margin: 0, border: 'none', padding: 0 }}>
              Create Production Step
            </h2>

            <button
              type="button"
              onClick={() => setShowImportPopup(true)}
              className="import-accounts-title-btn"
              disabled={bulkImporting}
            >
              Import Steps
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        ) : (
          <h2 className="productionsstep-title">
            Edit: {initialData?.stepName}
          </h2>
        )}

        <div className="productionsstep-group">
          <label className="productionsstep-label">Step Name *</label>
          <input type="text" value={stepName} onChange={(e) => setStepName(e.target.value)} className="productionsstep-input" placeholder="Enter Step Name" />
        </div>

        <div className="productionsstep-group">
          <div className="productionsstep-machineHeader">
            <label className="productionsstep-label">Machines *</label>
            <button type="button" className="productionsstep-addBtn" onClick={handleAddMachine}>+ Add Machine</button>
          </div>

          {machines.map((machine, index) => (
            <div className="productionsstep-machineRow" key={index}>
              <div className="productionsstep-inputWrapper">
                <select className="productionsstep-select" value={machine.machineId} onChange={(e) => handleChange(index, e.target.value)}>
                  <option value="">Select Machine</option>
                  {machineList.map((m: any) => (
                    <option key={m._id} value={m._id}>{m.machineName} ({m.machineType?.type || m.machineType})</option>
                  ))}
                </select>
              </div>
              {machines.length > 1 && (
                <button type="button" className="productionsstep-removeBtn" onClick={() => handleRemoveMachine(index)}>×</button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="productionsstep-button" onClick={handleSubmit} disabled={saveState === 'loading'}>
          {saveState === 'loading' ? 'Saving...' : isEditMode ? 'Update Step' : 'Save Production Step'}
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
          title="Import Production Steps"
          infoMessage="Bulk import up to 50 production steps at once. Download the template first."
          buttonText="Import from Excel"
        />

        {/* Import Progress Popup */}
        <ImportProgressPopup
          isOpen={bulkImporting}
          currentIndex={importProgress.current}
          total={importProgress.total}
          successCount={importProgress.success}
          failedCount={importProgress.failed}
          message={`Importing ${importProgress.current} of ${importProgress.total} production steps...`}
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
    </div>
  );
};

export default CreateStep;
