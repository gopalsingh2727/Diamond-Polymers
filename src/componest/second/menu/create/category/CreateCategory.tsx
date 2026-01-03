import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
} from "../../../../redux/category/categoryActions";
import { RootState, AppDispatch } from "../../../../../store";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";
import ImportProgressPopup from "../../../../../components/shared/ImportProgressPopup";
import ImportAccountPopup from "../../../../../components/shared/ImportAccountPopup";
import * as XLSX from 'xlsx';
import "./createCategory.css";

type CategoryFormData = {
  name: string;
  description: string;
};

interface CategoryData extends Partial<CategoryFormData> {
  _id?: string;
}

interface LocationState {
  editMode?: boolean;
  initialData?: CategoryData;
  itemId?: string;
}

interface Props {
  initialData?: CategoryData;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

type ValidationErrors = Partial<Record<keyof CategoryFormData, string>>;

const CreateCategory: React.FC<Props> = ({
  initialData: propInitialData = {},
  onCancel,
  onSaveSuccess,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { handleSave, handleDelete: crudDelete, saveState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const locationState = location.state as LocationState | null;
  const initialData: CategoryData = locationState?.initialData || propInitialData;
  const itemId = locationState?.itemId || initialData?._id;
  const editMode = locationState?.editMode || !!initialData?._id;

  const { error: reduxError } = useSelector(
    (state: RootState) => state.v2.category
  );

  const [formValues, setFormValues] = useState<CategoryFormData>({
    name: initialData.name || "",
    description: initialData.description || "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

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

  const handleBackToList = () => {
    if (onSaveSuccess) {
      onSaveSuccess();
    } else if (onCancel) {
      onCancel();
    } else {
      navigate("/menu/edit", { state: { activeComponent: "category" } });
    }
  };

  useInternalBackNavigation(editMode && !confirmDialog.isOpen, handleBackToList);

  useEffect(() => {
    if (initialData && initialData._id) {
      setFormValues({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (saveState === 'success' && !reduxError && formRef.current && !editMode) {
      formRef.current.reset();
      setFormValues({
        name: "",
        description: "",
      });
    }
  }, [saveState, reduxError, editMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formValues.name.trim()) {
      errors.name = "Category name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const branchId = localStorage.getItem('selectedBranch') || "";

    const saveAction = async () => {
      if (editMode && itemId) {
        return dispatch(
          updateCategory(itemId, {
            name: formValues.name.trim(),
            description: formValues.description.trim(),
            branchId,
            isActive: true,
          }) as any
        );
      } else {
        return dispatch(
          createCategory({
            name: formValues.name.trim(),
            description: formValues.description.trim(),
            branchId,
            isActive: true,
          }) as any
        );
      }
    };

    handleSave(saveAction, {
      successMessage: editMode ? 'Category updated successfully' : 'Category created successfully',
      onSuccess: () => {
        if (editMode) {
          setTimeout(() => {
            if (onSaveSuccess) {
              onSaveSuccess();
            } else {
              navigate("/menu/edit", { state: { activeComponent: "category" } });
            }
          }, 1500);
        } else {
          setFormValues({ name: "", description: "" });
        }
      }
    });
  };

  const handleDeleteClick = () => {
    if (!itemId) return;

    crudDelete(
      () => dispatch(deleteCategory(itemId) as any),
      {
        successMessage: 'Category deleted successfully',
        confirmMessage: 'Are you sure you want to delete this category? This action cannot be undone.',
        confirmTitle: 'Delete Category',
        onSuccess: () => {
          // Delay navigation to show toast
          setTimeout(() => {
            if (onSaveSuccess) {
              onSaveSuccess();
            } else {
              navigate("/menu/edit", { state: { activeComponent: "category" } });
            }
          }, 1500);
        }
      }
    );
  };

  // Excel import functions
  const downloadExcelTemplate = () => {
    const instructions = [
      ['Category Bulk Import Template'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Maximum 50 categories per import'],
      ['2. Required fields are marked with * in column headers'],
      ['3. Delete the example rows before adding your data'],
      ['4. Description is optional'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['Category Name * - Required. Name of the category (e.g., "Raw Materials", "Finished Products")'],
      ['Description - Optional. Description of the category'],
    ];

    const templateData = [
      {
        'Category Name *': 'Raw Materials',
        'Description': 'All raw materials and supplies'
      },
      {
        'Category Name *': 'Finished Products',
        'Description': 'Completed manufactured products'
      },
    ];

    const wb = XLSX.utils.book_new();
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');
    XLSX.writeFile(wb, 'Category_Import_Template.xlsx');

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
          message: `Limiting import to first 50 categories (found ${jsonData.length})`,
        });
        jsonData = jsonData.slice(0, 50);
      }

      const validationErrors: string[] = [];
      const processedData: any[] = [];
      const branchId = localStorage.getItem('selectedBranch') || "";

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;
        const errors: string[] = [];

        const name = row['Category Name *']?.toString().trim();
        if (!name) {
          errors.push(`Row ${rowNum}: Missing Category Name`);
        }

        const description = row['Description']?.toString().trim() || '';

        if (errors.length === 0) {
          processedData.push({
            name,
            description,
            branchId,
            isActive: true
          });
        } else {
          validationErrors.push(...errors);
        }
      });

      const validCount = processedData.length;
      const errorCount = validationErrors.length;

      const confirmMessage =
        `Ready to import ${validCount} categories.\n` +
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
        const categoryData = processedData[i];

        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createCategory(categoryData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(
            `Row ${i + 2} (${categoryData.name}): ${errorMsg}`
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
          message: `Successfully imported ${successCount} category/categories`,
        });
        // Refresh categories
        dispatch(getCategories({}));
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
    <div className="createCategory-container">
      <div className="createCategory-form">

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
                  }}
                >
                  {deleteState === 'loading' ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {editMode && (
          <div className="createCategory-header">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: "8px 16px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Back to List
              </button>
            )}
            <h2 className="createCategory-header-title">Edit Category</h2>
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleteState === 'loading'}
              style={{
                padding: "8px 16px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                opacity: deleteState === 'loading' ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
              </svg>
              {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}

        {!editMode ? (
          <div className="createaccount-title-row">
            <h2 className="createCategory-title" style={{ margin: 0, border: 'none', padding: 0 }}>
              Create Category
            </h2>

            <button
              type="button"
              onClick={() => setShowImportPopup(true)}
              className="import-accounts-title-btn"
              disabled={bulkImporting}
            >
              Import Categories
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        ) : null}

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="createCategory-group">
            <label className="createCategory-label">Category Name *</label>
            <input
              className="createCategory-input"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              placeholder="e.g., Products, Materials"
            />
            {validationErrors.name && (
              <small className="createCategory-error">{validationErrors.name}</small>
            )}
          </div>

          <div className="createCategory-group">
            <label className="createCategory-label">Description</label>
            <textarea
              className="createCategory-textarea"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              placeholder="Enter category description..."
            />
          </div>

          {reduxError && <div className="createCategory-message error">{reduxError}</div>}

          <button className="createCategory-button" type="submit" disabled={saveState === 'loading'}>
            {saveState === 'loading' ? "Saving..." : editMode ? "Update Category" : "Create Category"}
          </button>
        </form>
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
        title="Import Categories"
        infoMessage="Bulk import up to 50 categories at once. Download the template first."
        buttonText="Import from Excel"
      />

      {/* Import Progress Popup */}
      <ImportProgressPopup
        isOpen={bulkImporting}
        currentIndex={importProgress.current}
        total={importProgress.total}
        successCount={importProgress.success}
        failedCount={importProgress.failed}
        message={`Importing ${importProgress.current} of ${importProgress.total} categories...`}
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

export default CreateCategory;
