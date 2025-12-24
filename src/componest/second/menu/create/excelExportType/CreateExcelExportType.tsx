import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createExcelExportType, updateExcelExportType, deleteExcelExportType } from "../../../../redux/create/excelExportType/excelExportTypeActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import "../orderType/orderType.css";

// Column interface matching ExcelExportSelector
interface ExportColumn {
  key: string;
  label: string;
  selected: boolean;
  category: 'basic' | 'customer' | 'material' | 'status' | 'dates' | 'other';
}

// All available columns - same as ExcelExportSelector
const ALL_COLUMNS: ExportColumn[] = [
  // Basic Order Info
  { key: 'orderId', label: 'Order ID', selected: true, category: 'basic' },
  { key: 'date', label: 'Order Date', selected: true, category: 'basic' },
  { key: 'overallStatus', label: 'Overall Status', selected: true, category: 'basic' },
  { key: 'priority', label: 'Priority', selected: false, category: 'basic' },
  { key: 'orderType', label: 'Order Type', selected: false, category: 'basic' },

  // Customer
  { key: 'customerName', label: 'Customer Name', selected: true, category: 'customer' },
  { key: 'phone', label: 'Phone', selected: true, category: 'customer' },
  { key: 'email', label: 'Email', selected: false, category: 'customer' },
  { key: 'address', label: 'Address', selected: false, category: 'customer' },
  { key: 'whatsapp', label: 'WhatsApp', selected: false, category: 'customer' },

  // Options (Products/Materials)
  { key: 'productOptions', label: 'Products', selected: true, category: 'material' },
  { key: 'materialOptions', label: 'Materials', selected: false, category: 'material' },
  { key: 'printingOptions', label: 'Printing', selected: false, category: 'material' },
  { key: 'packagingOptions', label: 'Packaging', selected: false, category: 'material' },
  { key: 'optionQuantity', label: 'Total Quantity', selected: true, category: 'material' },
  { key: 'allOptions', label: 'All Options', selected: false, category: 'material' },

  // Machine Status
  { key: 'currentStep', label: 'Current Step', selected: true, category: 'status' },
  { key: 'currentStepIndex', label: 'Step Number', selected: false, category: 'status' },
  { key: 'machineStatus', label: 'Machine Status', selected: true, category: 'status' },
  { key: 'completedMachines', label: 'Completed Machines', selected: false, category: 'status' },
  { key: 'totalMachines', label: 'Total Machines', selected: false, category: 'status' },
  { key: 'machineProgress', label: 'Machine Progress', selected: false, category: 'status' },

  // Steps Progress
  { key: 'stepsCompleted', label: 'Steps Completed', selected: false, category: 'status' },
  { key: 'totalSteps', label: 'Total Steps', selected: false, category: 'status' },
  { key: 'stepProgress', label: 'Step Progress %', selected: false, category: 'status' },

  // Dates
  { key: 'createdAt', label: 'Created Date', selected: false, category: 'dates' },
  { key: 'updatedAt', label: 'Updated Date', selected: false, category: 'dates' },
  { key: 'scheduledStart', label: 'Scheduled Start', selected: false, category: 'dates' },
  { key: 'scheduledEnd', label: 'Scheduled End', selected: false, category: 'dates' },
  { key: 'actualStart', label: 'Actual Start', selected: false, category: 'dates' },
  { key: 'actualEnd', label: 'Actual End', selected: false, category: 'dates' },
  { key: 'dispatchedDate', label: 'Dispatched Date', selected: false, category: 'dates' },

  // Other
  { key: 'branch', label: 'Branch', selected: false, category: 'other' },
  { key: 'branchCode', label: 'Branch Code', selected: false, category: 'other' },
  { key: 'sameDayDispatch', label: 'Same Day Dispatch', selected: false, category: 'other' },
  { key: 'createdBy', label: 'Created By', selected: false, category: 'other' },
  { key: 'assignedManager', label: 'Assigned Manager', selected: false, category: 'other' },
  { key: 'notes', label: 'Notes', selected: false, category: 'other' }
];

const CATEGORY_LABELS: Record<string, string> = {
  basic: 'Basic Info',
  customer: 'Customer',
  material: 'Material',
  status: 'Status',
  dates: 'Dates',
  other: 'Other'
};

interface CreateExcelExportTypeProps {
  initialData?: any;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateExcelExportType: React.FC<CreateExcelExportTypeProps> = ({ initialData: propInitialData, onCancel, onSaveSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode detection - support both props and location.state
  const { excelExportTypeData: locationData, isEdit } = location.state || {};
  const excelExportTypeData = propInitialData || locationData;
  const editMode = Boolean(propInitialData || isEdit || (excelExportTypeData && excelExportTypeData._id));
  const excelExportTypeId = excelExportTypeData?._id;

  // Basic Information
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");

  // Excel Configuration
  const [columns, setColumns] = useState<ExportColumn[]>(ALL_COLUMNS);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [sheetName, setSheetName] = useState("Orders");
  const [fileNamePrefix, setFileNamePrefix] = useState("Export");

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Excel Preview
  const [showPreview, setShowPreview] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  // Get user role for conditional rendering
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // Handle ESC key to go back to list in edit mode
  const handleBackToList = () => {
    if (onSaveSuccess) {
      onSaveSuccess();
    } else if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  useInternalBackNavigation(editMode && !showDeleteConfirm, handleBackToList);

  // Load existing data when editing
  useEffect(() => {
    if (editMode && excelExportTypeData) {
      console.log('Edit mode - Loading excel export type data:', excelExportTypeData);

      // Basic Information
      setTypeName(excelExportTypeData.typeName || "");
      setTypeCode(excelExportTypeData.typeCode || "");
      setDescription(excelExportTypeData.description || "");

      // Excel Configuration
      setIncludeHeaders(excelExportTypeData.includeHeaders !== false);
      setSheetName(excelExportTypeData.sheetName || "Orders");
      setFileNamePrefix(excelExportTypeData.fileNamePrefix || "Export");

      // Columns - merge saved columns with all available columns
      if (excelExportTypeData.columns && Array.isArray(excelExportTypeData.columns)) {
        const savedColumnKeys = excelExportTypeData.columns
          .filter((c: ExportColumn) => c.selected)
          .map((c: ExportColumn) => c.key);

        setColumns(ALL_COLUMNS.map(col => ({
          ...col,
          selected: savedColumnKeys.includes(col.key)
        })));
      }

      // Global/Default Settings
      setIsGlobal(excelExportTypeData.isGlobal || false);
      setIsDefault(excelExportTypeData.isDefault || false);
      setIsActive(excelExportTypeData.isActive !== false);
    }
  }, [editMode, excelExportTypeData]);

  // Toggle column selection
  const toggleColumn = (key: string) => {
    setColumns(columns.map(col =>
      col.key === key ? { ...col, selected: !col.selected } : col
    ));
  };

  // Toggle all columns in a category
  const toggleCategory = (category: string, selected: boolean) => {
    setColumns(columns.map(col =>
      col.category === category ? { ...col, selected } : col
    ));
  };

  // Select all columns
  const selectAllColumns = () => {
    setColumns(columns.map(col => ({ ...col, selected: true })));
  };

  // Deselect all columns
  const deselectAllColumns = () => {
    setColumns(columns.map(col => ({ ...col, selected: false })));
  };

  const handleSubmit = () => {
    // Validation
    if (!typeName.trim() || !typeCode.trim()) {
      toast.error("Validation Error", "Please fill all required fields: Type Name and Type Code");
      return;
    }

    const selectedColumns = columns.filter(col => col.selected);
    if (selectedColumns.length === 0) {
      toast.error("Validation Error", "Please select at least one column to export");
      return;
    }

    // Build excel export type data
    const branchId = localStorage.getItem('branchId') || localStorage.getItem('selectedBranch') || '';
    const dataToSave = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      columns,
      includeHeaders,
      sheetName,
      fileNamePrefix,
      branchId,
      isGlobal,
      isDefault,
      isActive
    };

    if (editMode && excelExportTypeId) {
      // Update existing excel export type
      handleSave(
        () => dispatch(updateExcelExportType(excelExportTypeId, dataToSave)),
        {
          successMessage: "Excel export type updated successfully!",
          onSuccess: () => {
            if (onSaveSuccess) {
              onSaveSuccess();
            } else {
              navigate(-1);
            }
          }
        }
      );
    } else {
      // Create new excel export type
      handleSave(
        () => dispatch(createExcelExportType(dataToSave)),
        {
          successMessage: "Excel export type created successfully!",
          onSuccess: () => {
            // Reset form
            setTypeName("");
            setTypeCode("");
            setDescription("");
            setColumns(ALL_COLUMNS);
            setIncludeHeaders(true);
            setSheetName("Orders");
            setFileNamePrefix("Export");
            setIsGlobal(false);
            setIsDefault(false);
          }
        }
      );
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!excelExportTypeId) return;

    setDeleting(true);
    try {
      await dispatch(deleteExcelExportType(excelExportTypeId));
      toast.success('Deleted', 'Excel export type deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete excel export type');
    } finally {
      setDeleting(false);
    }
  };

  const selectedCount = columns.filter(c => c.selected).length;
  const categories = ['basic', 'customer', 'material', 'status', 'dates', 'other'];

  return (
    <div className="orderTypeContainer CreateForm">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>Warning</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Excel Export Type?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this excel export type? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="orderTypeHeader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {editMode && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Back to List
              </button>
            )}
            <div>
              <h2 className="orderTypeTitle">
                {editMode ? 'Edit Excel Export Type' : 'Create Excel Export Type'}
              </h2>
              <p className="orderTypeSubtitle">
                {editMode
                  ? `Editing: ${excelExportTypeData?.typeName || 'Excel Export Type'}`
                  : 'Configure a new excel export type for your system'
                }
              </p>
            </div>
          </div>
          {editMode && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="orderTypeFormGrid">
        {/* Basic Information Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Basic Information</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Name *</label>
                <FieldTooltip
                  content="Enter a descriptive name for this export type (e.g., Basic Export, Dispatch Report)"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., Basic Export"
                required
              />
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Code *</label>
                <FieldTooltip
                  content="Short code for this export type (e.g., BASIC, DISP). Will be converted to uppercase."
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeCode}
                onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
                className="orderTypeFormInput"
                placeholder="e.g., BASIC"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="orderTypeFormColumn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <label className="orderTypeInputLabel">Description</label>
              <FieldTooltip
                content="Optional description explaining when to use this export type"
                position="right"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder="Describe when to use this export type..."
              rows={3}
            />
          </div>
        </div>

        {/* Export Configuration Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Export Configuration</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">File Name Prefix</label>
                <FieldTooltip
                  content="Prefix for the exported file name (e.g., Orders, Report)"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={fileNamePrefix}
                onChange={(e) => setFileNamePrefix(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., Orders"
                maxLength={50}
              />
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Sheet Name</label>
                <FieldTooltip
                  content="Name of the sheet in the Excel file (max 31 characters)"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., Orders"
                maxLength={31}
              />
            </div>
          </div>

          <div className="orderTypeCheckboxGrid" style={{ marginTop: '1rem' }}>
            <label className="orderTypeCheckboxLabel">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
              />
              <span>Include Column Headers</span>
              <FieldTooltip
                content="Include column headers in the first row of the export"
                position="right"
              />
            </label>
          </div>
        </div>

        {/* Column Selection Section */}
        <div className="orderTypeSection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="orderTypeSectionTitle" style={{ marginBottom: 0 }}>
              Select Columns ({selectedCount} selected)
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={selectAllColumns}
                style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAllColumns}
                style={{ padding: '6px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                Deselect All
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            {categories.map(category => {
              const categoryColumns = columns.filter(c => c.category === category);
              const allSelected = categoryColumns.every(c => c.selected);
              const someSelected = categoryColumns.some(c => c.selected);

              return (
                <div key={category} style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      color: '#374151'
                    }}
                    onClick={() => toggleCategory(category, !allSelected)}
                  >
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={() => toggleCategory(category, !allSelected)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontWeight: '600' }}>{CATEGORY_LABELS[category]}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {categoryColumns.map(col => (
                      <label key={col.key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '13px',
                        color: '#4b5563',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={col.selected}
                          onChange={() => toggleColumn(col.key)}
                          style={{ marginRight: '6px' }}
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global/Default Settings Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Advanced Settings</h3>

          <div className="orderTypeCheckboxGrid">
            {userRole === 'admin' && (
              <label className="orderTypeCheckboxLabel">
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                />
                <span>Global Export Type</span>
                <FieldTooltip
                  content="Make this export type available across all branches"
                  position="right"
                />
              </label>
            )}

            <label className="orderTypeCheckboxLabel">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <span>Set as Default</span>
              <FieldTooltip
                content="Make this the default export type when exporting to Excel"
                position="right"
              />
            </label>
          </div>

          {/* Active/Inactive Status */}
          <div style={{ marginTop: '1rem' }}>
            <label className="orderTypeInputLabel" style={{ marginBottom: '0.5rem', display: 'block' }}>Status</label>
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
        </div>

        {/* Submit Button */}
        <div className="orderTypeFormActions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={selectedCount === 0}
            style={{
              padding: '10px 20px',
              background: selectedCount === 0 ? '#9ca3af' : '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Preview Excel
          </button>
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
            className="orderTypeSaveButton"
            disabled={!typeName.trim() || !typeCode.trim() || selectedCount === 0}
          >
            {editMode ? 'Update Excel Export Type' : 'Create Excel Export Type'}
          </ActionButton>
        </div>
      </div>

      {/* Excel Preview Popup */}
      {showPreview && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowPreview(false)}
        >
          {/* Popup Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#f3f4f6',
              borderRadius: '12px',
              width: '90vw',
              maxWidth: '1000px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Popup Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: 'white'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                Excel Preview: {typeName || 'Untitled Export'}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Close
              </button>
            </div>

            {/* Export Info */}
            <div style={{
              padding: '12px 20px',
              background: '#e5e7eb',
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              fontSize: '13px'
            }}>
              <span><strong>File Name:</strong> {fileNamePrefix || 'Export'}_YYYY-MM-DD.xlsx</span>
              <span><strong>Sheet Name:</strong> {sheetName || 'Orders'}</span>
              <span><strong>Include Headers:</strong> {includeHeaders ? 'Yes' : 'No'}</span>
              <span><strong>Columns:</strong> {selectedCount} selected</span>
            </div>

            {/* Excel Preview Body */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px',
              background: '#fff'
            }}>
              {/* Excel Table Preview */}
              <div style={{
                overflowX: 'auto',
                border: '1px solid #d1d5db',
                borderRadius: '8px'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  minWidth: '600px'
                }}>
                  {/* Header Row */}
                  {includeHeaders && (
                    <thead>
                      <tr style={{ background: '#059669', color: 'white' }}>
                        {columns.filter(c => c.selected).map((col, idx) => (
                          <th key={idx} style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontWeight: 600,
                            borderRight: idx < columns.filter(c => c.selected).length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            whiteSpace: 'nowrap'
                          }}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  {/* Sample Data Rows */}
                  <tbody>
                    {[1, 2, 3, 4, 5].map((rowNum) => (
                      <tr key={rowNum} style={{ background: rowNum % 2 === 0 ? '#f9fafb' : '#fff' }}>
                        {columns.filter(c => c.selected).map((col, idx) => (
                          <td key={idx} style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: idx < columns.filter(c => c.selected).length - 1 ? '1px solid #e5e7eb' : 'none',
                            whiteSpace: 'nowrap'
                          }}>
                            {getSampleData(col.key, rowNum)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #86efac'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#166534' }}>Selected Columns by Category</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {['basic', 'customer', 'material', 'status', 'dates', 'other'].map(category => {
                    const categoryColumns = columns.filter(c => c.selected && c.category === category);
                    if (categoryColumns.length === 0) return null;
                    return (
                      <div key={category} style={{
                        padding: '8px 12px',
                        background: '#dcfce7',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}>
                        <strong style={{ textTransform: 'capitalize' }}>{category}:</strong>{' '}
                        {categoryColumns.map(c => c.label).join(', ')}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

// Helper function to generate sample data
const getSampleData = (key: string, rowNum: number): string => {
  const sampleData: Record<string, string[]> = {
    orderId: ['ORD-001', 'ORD-002', 'ORD-003', 'ORD-004', 'ORD-005'],
    date: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'],
    overallStatus: ['Pending', 'In Progress', 'Completed', 'Dispatched', 'Pending'],
    priority: ['High', 'Medium', 'Low', 'High', 'Medium'],
    orderType: ['Standard', 'Express', 'Standard', 'Custom', 'Express'],
    customerName: ['John Smith', 'Jane Doe', 'Robert Johnson', 'Emily Brown', 'Michael Davis'],
    phone: ['+91 9876543210', '+91 9876543211', '+91 9876543212', '+91 9876543213', '+91 9876543214'],
    email: ['john@email.com', 'jane@email.com', 'robert@email.com', 'emily@email.com', 'michael@email.com'],
    address: ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm St', '654 Maple Dr'],
    whatsapp: ['+91 9876543210', '+91 9876543211', '+91 9876543212', '+91 9876543213', '+91 9876543214'],
    productOptions: ['Gold Ring - 5g', 'Silver Chain - 20g', 'Gold Bracelet - 10g', 'Diamond Pendant', 'Gold Necklace - 15g'],
    materialOptions: ['22K Gold', '925 Silver', '18K Gold', 'Platinum', '24K Gold'],
    printingOptions: ['Engraved', 'Plain', 'Engraved', 'Plain', 'Engraved'],
    packagingOptions: ['Gift Box', 'Standard', 'Premium Box', 'Gift Box', 'Standard'],
    optionQuantity: ['1', '2', '1', '3', '1'],
    allOptions: ['Ring, Chain', 'Bracelet', 'Pendant, Ring', 'Necklace', 'Ring, Bracelet'],
    currentStep: ['Polishing', 'Casting', 'Finishing', 'Quality Check', 'Packing'],
    currentStepIndex: ['3', '2', '4', '5', '6'],
    machineStatus: ['Running', 'Idle', 'Running', 'Completed', 'Running'],
    completedMachines: ['2', '1', '3', '4', '5'],
    totalMachines: ['5', '4', '5', '5', '6'],
    machineProgress: ['40%', '25%', '60%', '80%', '83%'],
    stepsCompleted: ['3', '2', '4', '5', '6'],
    totalSteps: ['7', '6', '7', '7', '8'],
    stepProgress: ['43%', '33%', '57%', '71%', '75%'],
    createdAt: ['2024-01-10', '2024-01-11', '2024-01-12', '2024-01-13', '2024-01-14'],
    updatedAt: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'],
    scheduledStart: ['2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15', '2024-01-16'],
    scheduledEnd: ['2024-01-20', '2024-01-21', '2024-01-22', '2024-01-23', '2024-01-24'],
    actualStart: ['2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15', '2024-01-16'],
    actualEnd: ['-', '-', '2024-01-18', '2024-01-19', '-'],
    dispatchedDate: ['-', '-', '-', '2024-01-19', '-'],
    branch: ['Main Branch', 'North Branch', 'South Branch', 'Main Branch', 'East Branch'],
    branchCode: ['MB001', 'NB001', 'SB001', 'MB001', 'EB001'],
    sameDayDispatch: ['No', 'Yes', 'No', 'Yes', 'No'],
    createdBy: ['Admin', 'Manager', 'Staff', 'Admin', 'Manager'],
    assignedManager: ['Rahul K', 'Priya S', 'Amit P', 'Neha R', 'Vijay M'],
    notes: ['Urgent order', 'Handle with care', '-', 'Special packaging', 'Priority delivery']
  };

  const data = sampleData[key];
  if (data) {
    return data[rowNum - 1] || '-';
  }
  return '-';
};

export default CreateExcelExportType;
