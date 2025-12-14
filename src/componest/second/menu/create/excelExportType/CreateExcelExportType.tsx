import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createExcelExportType, updateExcelExportType, deleteExcelExportType } from "../../../../redux/create/excelExportType/excelExportTypeActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { getOptionSpecs } from "../../../../redux/create/optionSpec/optionSpecActions";
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

  // Linked Option Types
  const [linkedOptionTypes, setLinkedOptionTypes] = useState<string[]>([]);

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  // Get user role for conditional rendering
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // Get option types from Redux store
  const optionTypes = useSelector((state: any) => state.optionType?.optionTypes || []);

  // Get option specs from Redux store (contains actual specifications with values)
  const optionSpecs = useSelector((state: any) => state.optionSpec?.optionSpecs || []);

  // Fetch option types and option specs on mount
  useEffect(() => {
    dispatch(getOptionTypes());
    dispatch(getOptionSpecs());
  }, [dispatch]);

  // Get all specifications from linked option types (from OptionSpecs)
  const getLinkedOptionTypesSpecs = () => {
    const allSpecs: { optionTypeName: string; optionTypeId: string; specs: any[] }[] = [];

    linkedOptionTypes.forEach((optionTypeId) => {
      const optionType = optionTypes.find((ot: any) => ot._id === optionTypeId);
      if (optionType) {
        // Get all OptionSpecs that belong to this OptionType
        const relatedSpecs = optionSpecs.filter((spec: any) =>
          spec.optionTypeId === optionTypeId ||
          (spec.optionTypeId && spec.optionTypeId._id === optionTypeId)
        );

        // Collect all unique specifications from these OptionSpecs
        const allSpecsFromOptionSpecs: any[] = [];
        relatedSpecs.forEach((optionSpec: any) => {
          if (optionSpec.specifications && Array.isArray(optionSpec.specifications)) {
            optionSpec.specifications.forEach((spec: any) => {
              // Check if we already have this spec name (avoid duplicates)
              if (!allSpecsFromOptionSpecs.some(existing => existing.name === spec.name)) {
                allSpecsFromOptionSpecs.push({
                  ...spec,
                  fromOptionSpec: optionSpec.name,
                  fromOptionSpecCode: optionSpec.code
                });
              }
            });
          }
        });

        if (allSpecsFromOptionSpecs.length > 0) {
          allSpecs.push({
            optionTypeName: optionType.name,
            optionTypeId: optionType._id,
            specs: allSpecsFromOptionSpecs,
          });
        }
      }
    });

    return allSpecs;
  };

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

      // Linked Option Types
      if (excelExportTypeData.linkedOptionTypes && Array.isArray(excelExportTypeData.linkedOptionTypes)) {
        const optionTypeIds = excelExportTypeData.linkedOptionTypes.map((ot: any) =>
          typeof ot === 'string' ? ot : ot._id
        );
        setLinkedOptionTypes(optionTypeIds);
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
    const dataToSave = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      columns,
      includeHeaders,
      sheetName,
      fileNamePrefix,
      linkedOptionTypes,
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
            setLinkedOptionTypes([]);
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
              <FieldTooltip
                content="Select which columns to include in the export"
                position="right"
              />
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

        {/* Linked Option Types Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Linked Option Types
            <FieldTooltip
              content="Select which option types can use this export type. Leave empty to allow all option types."
              position="right"
            />
          </h3>

          <div className="orderTypeFormRow">
            <div style={{ width: '100%' }}>
              {optionTypes.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Loading option types...</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                  {optionTypes.map((optionType: any) => (
                    <label
                      key={optionType._id}
                      className="orderTypeCheckboxLabel"
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={linkedOptionTypes.includes(optionType._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLinkedOptionTypes([...linkedOptionTypes, optionType._id]);
                          } else {
                            setLinkedOptionTypes(linkedOptionTypes.filter(id => id !== optionType._id));
                          }
                        }}
                        style={{ marginTop: '0.25rem', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{optionType.typeName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          Code: {optionType.typeCode}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {optionTypes.length > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                  {linkedOptionTypes.length === 0
                    ? "No option types selected (all option types will be allowed)"
                    : `${linkedOptionTypes.length} option type(s) selected`
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Specifications from Linked Option Types */}
        {linkedOptionTypes.length > 0 && (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">
              Available Specifications
              <FieldTooltip
                content="These are the specifications available from the linked option types. They can be included in your export."
                position="right"
              />
            </h3>

            {getLinkedOptionTypesSpecs().length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '24px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                No specifications found in the linked option types.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getLinkedOptionTypesSpecs().map((typeGroup, groupIndex) => {
                  const numberSpecs = typeGroup.specs.filter((s: any) => s.dataType === 'number');
                  const otherSpecs = typeGroup.specs.filter((s: any) => s.dataType !== 'number');
                  return (
                    <div key={groupIndex} style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#0ea5e9', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                          {typeGroup.optionTypeName}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          ({typeGroup.specs.length} specs)
                        </span>
                      </div>

                      {/* Number specifications */}
                      {numberSpecs.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#059669', marginBottom: '4px', fontWeight: 500 }}>
                            Number Specifications:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {numberSpecs.map((spec: any, specIndex: number) => (
                              <span
                                key={specIndex}
                                style={{
                                  padding: '4px 10px',
                                  background: '#d1fae5',
                                  border: '1px solid #10b981',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  color: '#065f46'
                                }}
                              >
                                {spec.name} {spec.unit && <span style={{ opacity: 0.7 }}>({spec.unit})</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other specifications */}
                      {otherSpecs.length > 0 && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                            Other Specifications:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {otherSpecs.map((spec: any, specIndex: number) => (
                              <span
                                key={specIndex}
                                style={{
                                  padding: '4px 8px',
                                  background: '#f3f4f6',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  color: '#6b7280'
                                }}
                              >
                                {spec.name} <span style={{ opacity: 0.6 }}>({spec.dataType})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
        <div className="orderTypeFormActions">
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

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateExcelExportType;
