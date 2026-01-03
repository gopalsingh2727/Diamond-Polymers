import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeviceAccess, updateDeviceAccess, deleteDeviceAccess, resetDeviceAccessState, getDeviceAccessList } from "../../../../redux/deviceAccess/deviceAccessActions";
import { AppDispatch, RootState } from "../../../../../store";
import { Copy, Check } from "lucide-react";
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import ImportProgressPopup from "../../../../../components/shared/ImportProgressPopup";
import ImportAccountPopup from "../../../../../components/shared/ImportAccountPopup";
import * as XLSX from 'xlsx';
import "./deviceaccess.css";

interface DeviceAccessCreateProps {
  initialData?: {
    _id: string;
    deviceName?: string;
    location?: string;
    deviceId?: string;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const DeviceAccessCreate: React.FC<DeviceAccessCreateProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEditMode = !!initialData?._id;
  const { handleSave, handleDelete: crudDelete, saveState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const { error } = useSelector(
    (state: RootState) => state.v2.deviceAccess
  );
  const [createdDevice, setCreatedDevice] = useState<any>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [displayedDeviceId, setDisplayedDeviceId] = useState<string | null>(null);
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: "",
    location: "",
    password: "",
    confirmPassword: ""
  });

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

  // Load data when editing
  useEffect(() => {
    if (initialData && initialData._id) {
      setFormData({
        deviceName: initialData.deviceName || "",
        location: initialData.location || "",
        password: "", // Don't show old password
        confirmPassword: ""
      });
    }
  }, [initialData]);

  // Show device ID only once when device is created (not in edit mode)
  useEffect(() => {
    if (!isEditMode && saveState === 'success' && createdDevice && !displayedDeviceId) {
      // Store the device ID from the response
      const deviceId = (createdDevice as any).deviceId || createdDevice._id;

      if (deviceId) {
        setDisplayedDeviceId(deviceId);

        setFormData({
          deviceName: "",
          location: "",
          password: "",
          confirmPassword: ""
        });
      }
    }
  }, [saveState, createdDevice, displayedDeviceId, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCloseModal = () => {
    setDisplayedDeviceId(null);
    setCreatedDevice(null);
    // Clear Redux success state to prevent showing popup again
    dispatch(resetDeviceAccessState());
  };

  const copyDeviceId = async () => {
    if (initialData?._id) {
      try {
        await navigator.clipboard.writeText(initialData._id);
        setCopiedDeviceId(true);
        setTimeout(() => setCopiedDeviceId(false), 2000);
      } catch (err) {

      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.deviceName.trim()) {
      toast.error('Validation Error', 'Device name is required');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Validation Error', 'Device location is required');
      return;
    }

    if (isEditMode) {
      // Update mode - password is optional
      if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error('Validation Error', 'Passwords do not match');
        return;
      }

      // Build update payload - only include password if provided
      const updatePayload: any = {
        deviceName: formData.deviceName,
        location: formData.location
      };

      if (formData.password && formData.password.trim()) {
        updatePayload.password = formData.password;
      }

      const saveAction = async () => {
        return dispatch(updateDeviceAccess(initialData!._id, updatePayload));
      };

      handleSave(saveAction, {
        successMessage: 'Device access updated successfully',
        onSuccess: () => {
          dispatch(getDeviceAccessList());
          if (onSaveSuccess) onSaveSuccess();
        }
      });
    } else {
      // Create mode - password is required
      if (!formData.password) {
        toast.error('Validation Error', 'Password is required');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Validation Error', 'Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Validation Error', 'Password must be at least 6 characters long');
        return;
      }

      const saveAction = async () => {
        const result = await dispatch(createDeviceAccess({
          deviceName: formData.deviceName,
          location: formData.location,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }));
        // Set created device for modal
        setCreatedDevice(result);
        return result;
      };

      handleSave(saveAction, {
        successMessage: 'Device created successfully',
        showToast: false // We'll show the modal instead
      });
    }
  };

  const handleDeleteClick = () => {
    if (!isEditMode || !initialData) return;

    crudDelete(
      () => dispatch(deleteDeviceAccess(initialData._id)),
      {
        successMessage: 'Device deleted successfully',
        confirmMessage: `Are you sure you want to delete device "${initialData.deviceName}"? This action cannot be undone.`,
        confirmTitle: 'Delete Device',
        onSuccess: () => {
          // Delay navigation to show toast
          setTimeout(() => {
            dispatch(getDeviceAccessList());
            if (onSaveSuccess) onSaveSuccess();
          }, 1500);
        }
      }
    );
  };

  const inputType = (field: string) =>
  showPassword && field.includes("password") ? "text" : "password";

  // Excel import functions
  const downloadExcelTemplate = () => {
    const instructions = [
      ['Device Access Bulk Import Template'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Maximum 50 devices per import'],
      ['2. Required fields are marked with * in column headers'],
      ['3. Delete the example rows before adding your data'],
      ['4. Password must be at least 6 characters'],
      ['5. Password and Confirm Password must match'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['Device Name * - Required. Name of the device (e.g., "Tablet-01", "Machine Control Panel-A")'],
      ['Device Location * - Required. Physical location of the device (e.g., "Factory Floor A", "Production Line 2")'],
      ['Password * - Required. Password for device login (minimum 6 characters)'],
      ['Confirm Password * - Required. Must match the Password field exactly'],
    ];

    const templateData = [
      {
        'Device Name *': 'Tablet-01',
        'Device Location *': 'Factory Floor A',
        'Password *': 'device123',
        'Confirm Password *': 'device123',
      },
      {
        'Device Name *': 'Control Panel-02',
        'Device Location *': 'Production Line 2',
        'Password *': 'secure456',
        'Confirm Password *': 'secure456',
      },
    ];

    const wb = XLSX.utils.book_new();
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');
    XLSX.writeFile(wb, 'DeviceAccess_Import_Template.xlsx');

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
          message: `Limiting import to first 50 devices (found ${jsonData.length})`,
        });
        jsonData = jsonData.slice(0, 50);
      }

      const validationErrors: string[] = [];
      const processedData: any[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;
        const errors: string[] = [];

        const deviceName = row['Device Name *']?.toString().trim();
        if (!deviceName) {
          errors.push(`Row ${rowNum}: Missing Device Name`);
        }

        const location = row['Device Location *']?.toString().trim();
        if (!location) {
          errors.push(`Row ${rowNum}: Missing Device Location`);
        }

        const password = row['Password *']?.toString().trim();
        if (!password) {
          errors.push(`Row ${rowNum}: Missing Password`);
        } else if (password.length < 6) {
          errors.push(`Row ${rowNum}: Password must be at least 6 characters`);
        }

        const confirmPassword = row['Confirm Password *']?.toString().trim();
        if (!confirmPassword) {
          errors.push(`Row ${rowNum}: Missing Confirm Password`);
        }

        if (password && confirmPassword && password !== confirmPassword) {
          errors.push(`Row ${rowNum}: Password and Confirm Password do not match`);
        }

        if (errors.length > 0) {
          validationErrors.push(...errors);
          return;
        }

        processedData.push({
          deviceName,
          location,
          password,
          confirmPassword,
        });
      });

      const validCount = processedData.length;
      const errorCount = validationErrors.length;

      const confirmMessage =
        `Ready to import ${validCount} devices.\n` +
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
        const deviceData = processedData[i];

        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createDeviceAccess(deviceData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(
            `Row ${i + 2} (${deviceData.deviceName}): ${errorMsg}`
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
          message: `Successfully imported ${successCount} device(s)`,
        });
        // Refresh the device list
        dispatch(getDeviceAccessList());
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
    <div className="createDeviceAccess-container">
      <div className="createDeviceAccess-form">
        {/* Delete Confirmation Modal */}
        {confirmDialog.isOpen &&
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
            zIndex: 1000
          }}>

            <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center"
            }}>

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
                  cursor: "pointer"
                }}>

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
                  transition: "all 0.2s ease"
                }}>

                  {deleteState === 'loading' ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        }

        {/* Header with Back/Delete for edit mode */}
        {isEditMode &&
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
            type="button"
            onClick={onCancel}
            style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>

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
            }}>

              {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }

        {!isEditMode ? (
          <div className="createaccount-title-row">
            <h2 className="createDeviceAccess-title" style={{ margin: 0, border: 'none', padding: 0 }}>
              Create Device Access
            </h2>

            <button
              type="button"
              onClick={() => setShowImportPopup(true)}
              className="import-accounts-title-btn"
              disabled={bulkImporting}
            >
              Import Devices
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        ) : (
          <h2 className="createDeviceAccess-title">
            Edit: {initialData?.deviceName}
          </h2>
        )}

        <div className="createDeviceAccess-group">
          <label className="createDeviceAccess-label">Device Name *</label>
          <input
            name="deviceName"
            type="text"
            className="createDeviceAccess-input"
            placeholder="Enter device name"
            value={formData.deviceName}
            onChange={handleChange} />

        </div>

        <div className="createDeviceAccess-group">
          <label className="createDeviceAccess-label">Device Location *</label>
          <input
            name="location"
            type="text"
            className="createDeviceAccess-input"
            placeholder="Enter location"
            value={formData.location}
            onChange={handleChange} />

        </div>

        {/* Show Device ID only in edit mode */}
        {isEditMode && initialData?._id &&
        <div className="createDeviceAccess-group">
            <label className="createDeviceAccess-label">Device ID</label>
            <div style={{ position: "relative" }}>
              <input
              type="text"
              className="createDeviceAccess-input"
              value={initialData._id}
              readOnly
              style={{ backgroundColor: "#f5f5f5", paddingRight: "45px" }} />

              <button
              type="button"
              onClick={copyDeviceId}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px"
              }}
              title="Copy Device ID">

                {copiedDeviceId ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        }

        <div className="createDeviceAccess-group">
          <label className="createDeviceAccess-label">
            {isEditMode ? 'Password (leave blank to keep current)' : 'Password *'}
          </label>
          <div className="createDeviceAccess-passwordWrapper">
            <input
              name="password"
              type={inputType("password")}
              className="createDeviceAccess-input"
              placeholder={isEditMode ? "Enter new password (optional)" : "Enter password (min 6 characters)"}
              value={formData.password}
              onChange={handleChange} />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="createDeviceAccess-passwordToggle">

              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <div className="createDeviceAccess-group">
          <label className="createDeviceAccess-label">Confirm Password</label>
          <div className="createDeviceAccess-passwordWrapper">
            <input
              name="confirmPassword"
              type={inputType("confirmPassword")}
              className="createDeviceAccess-input"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange} />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="createDeviceAccess-passwordToggle">

              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="createDeviceAccess-button"
          disabled={saveState === 'loading'}
          style={{ opacity: saveState === 'loading' ? 0.7 : 1, transition: "all 0.2s ease" }}>

          {saveState === 'loading' ? "Saving..." : isEditMode ? "Update Device" : "Create Device"}
        </button>
          {/* Success Modal Popup - only for create mode */}
          {!isEditMode && displayedDeviceId &&
        <>
              {/* Backdrop */}
              <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9998
          }} onClick={handleCloseModal} />
              
              {/* Modal */}
              <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            zIndex: 9999,
            minWidth: "400px",
            maxWidth: "90%"
          }}>
                {/* Close Button */}
                <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
                lineHeight: "1",
                padding: "4px 8px"
              }}
              title="Close">

                  ×
                </button>

                {/* Success Content */}
                <div style={{ textAlign: "center", marginTop: "8px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
                    ✅
                  </div>
                  <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#059669", marginBottom: "16px" }}>
                    Device Created Successfully!
                  </div>
                  
                  <div style={{
                background: "#f0f9ff",
                border: "2px solid #0ea5e9",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                    <div style={{ fontSize: "0.9rem", color: "#0369a1", marginBottom: "8px", fontWeight: "600" }}>
                      Device ID:
                    </div>
                    <div style={{
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  color: "#0c4a6e",
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                  marginBottom: "12px"
                }}>
                      {displayedDeviceId}
                    </div>
                    <div style={{
                  fontSize: "0.9rem",
                  color: "#0369a1",
                  fontStyle: "italic"
                }}>
                      💡 Use this ID to login to the device
                    </div>
                  </div>

                  {/* Close Button at Bottom */}
                  <button
                onClick={handleCloseModal}
                style={{
                  backgroundColor: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 24px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%"
                }}>

                    Close
                  </button>
                </div>
              </div>
            </>
        }

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
          title="Import Device Access"
          infoMessage="Bulk import up to 50 devices at once. Download the template first."
          buttonText="Import from Excel"
        />

        {/* Import Progress Popup */}
        <ImportProgressPopup
          isOpen={bulkImporting}
          currentIndex={importProgress.current}
          total={importProgress.total}
          successCount={importProgress.success}
          failedCount={importProgress.failed}
          message={`Importing ${importProgress.current} of ${importProgress.total} devices...`}
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

        {error && <div className="createDeviceAccess-error">{error}</div>}
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>);

};

export default DeviceAccessCreate;