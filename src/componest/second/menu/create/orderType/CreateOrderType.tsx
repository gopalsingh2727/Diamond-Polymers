import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrderType, updateOrderType, deleteOrderType } from "../../../../redux/create/orderType/orderTypeActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { getPrintTypes } from "../../../../redux/create/printType/printTypeActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import "./orderType.css";

// Section configuration types
type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'suggestions';
  required: boolean;
  enabled: boolean;
};

type SectionConfig = {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  fields: FieldConfig[];
};

// Default section configurations
const defaultSections: SectionConfig[] = [
  {
    id: 'options',
    name: 'Options',
    enabled: true,
    order: 1,
    fields: []
  },
  {
    id: 'steps',
    name: 'Manufacturing Steps',
    enabled: true,
    order: 2,
    fields: [
      { name: 'stepName', label: 'Step Name', type: 'suggestions', required: true, enabled: true },
      { name: 'machines', label: 'Machines', type: 'select', required: false, enabled: true },
      { name: 'operators', label: 'Operators', type: 'select', required: false, enabled: true },
      { name: 'startTime', label: 'Start Time', type: 'text', required: false, enabled: true },
      { name: 'endTime', label: 'End Time', type: 'text', required: false, enabled: true },
      { name: 'notes', label: 'Notes', type: 'text', required: false, enabled: true },
    ]
  },
];

interface CreateOrderTypeProps {
  initialData?: any;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateOrderType: React.FC<CreateOrderTypeProps> = ({ initialData: propInitialData, onCancel, onSaveSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode detection - support both props and location.state
  const { orderTypeData: locationData, isEdit } = location.state || {};
  const orderTypeData = propInitialData || locationData;
  const editMode = Boolean(propInitialData || isEdit || (orderTypeData && orderTypeData._id));
  const orderTypeId = orderTypeData?._id;

  // Basic Information
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");

  // Numbering Configuration
  const [numberPrefix, setNumberPrefix] = useState("");
  const [numberFormat, setNumberFormat] = useState("PREFIX-{YYYY}-{SEQ}");
  const [sequencePadding, setSequencePadding] = useState(4);

  // Allowed Option Types
  const [allowedOptionTypes, setAllowedOptionTypes] = useState<string[]>([]);

  // Linked Print Types
  const [linkedPrintTypes, setLinkedPrintTypes] = useState<string[]>([]);

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [projectBase, setProjectBase] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Section Configuration
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast} = useCRUD();

  // Get user role for conditional rendering
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // Get option types from Redux store
  const optionTypes = useSelector((state: any) => state.optionType?.optionTypes || []);

  // Get print types from Redux store
  const printTypes = useSelector((state: any) => state.printTypeList?.printTypes || []);

  // Fetch option types and print types on mount
  useEffect(() => {
    dispatch(getOptionTypes());
    dispatch(getPrintTypes());
  }, [dispatch]);

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
    if (editMode && orderTypeData) {
      console.log('📝 Edit mode - Loading order type data:', orderTypeData);

      // Basic Information
      setTypeName(orderTypeData.typeName || "");
      setTypeCode(orderTypeData.typeCode || "");
      setDescription(orderTypeData.description || "");

      // Numbering Configuration
      setNumberPrefix(orderTypeData.numberPrefix || "");
      setNumberFormat(orderTypeData.numberFormat || "PREFIX-{YYYY}-{SEQ}");
      setSequencePadding(orderTypeData.sequencePadding || 4);

      // Allowed Option Types
      if (orderTypeData.allowedOptionTypes && Array.isArray(orderTypeData.allowedOptionTypes)) {
        // Extract IDs from populated objects or use IDs directly
        const optionTypeIds = orderTypeData.allowedOptionTypes.map((ot: any) =>
          typeof ot === 'string' ? ot : ot._id
        );
        setAllowedOptionTypes(optionTypeIds);
      }

      // Linked Print Types
      if (orderTypeData.linkedPrintTypes && Array.isArray(orderTypeData.linkedPrintTypes)) {
        const printTypeIds = orderTypeData.linkedPrintTypes.map((pt: any) =>
          typeof pt === 'string' ? pt : pt._id
        );
        setLinkedPrintTypes(printTypeIds);
      }

      // Global/Default Settings
      setIsGlobal(orderTypeData.isGlobal || false);
      setIsDefault(orderTypeData.isDefault || false);
      setProjectBase(orderTypeData.projectBase || false);
      setIsActive(orderTypeData.isActive !== false); // Default to true if not set

      // Section Configuration
      if (orderTypeData.sections && orderTypeData.sections.length > 0) {
        setSections(orderTypeData.sections);
      }
    }
  }, [editMode, orderTypeData]);

  // Section configuration handlers
  const handleSectionToggle = (sectionId: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  const handleSectionOrderChange = (sectionId: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex(s => s.id === sectionId);
      if (direction === 'up' && index > 0) {
        const temp = sorted[index].order;
        sorted[index].order = sorted[index - 1].order;
        sorted[index - 1].order = temp;
      } else if (direction === 'down' && index < sorted.length - 1) {
        const temp = sorted[index].order;
        sorted[index].order = sorted[index + 1].order;
        sorted[index + 1].order = temp;
      }
      return sorted;
    });
  };

  const handleFieldToggle = (sectionId: string, fieldName: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.name === fieldName
                ? { ...field, enabled: !field.enabled }
                : field
            )
          }
        : section
    ));
  };

  const handleFieldRequiredToggle = (sectionId: string, fieldName: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.name === fieldName
                ? { ...field, required: !field.required }
                : field
            )
          }
        : section
    ));
  };

  const handleSubmit = () => {
    // Validation
    if (!typeName.trim() || !typeCode.trim() || !numberPrefix.trim()) {
      toast.error("Validation Error", "Please fill all required fields: Type Name, Type Code, and Number Prefix");
      return;
    }

    // Build order type data
    const dataToSave = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      numberPrefix,
      numberFormat,
      sequencePadding: Number(sequencePadding),
      allowedOptionTypes,
      linkedPrintTypes,
      isGlobal,
      isDefault,
      projectBase,
      isActive,
      // Section configuration for dynamic form rendering - only save enabled sections, sorted by order
      sections: sections
        .filter(section => section.enabled)
        .sort((a, b) => a.order - b.order)
        .map(section => ({
          id: section.id,
          name: section.name,
          enabled: section.enabled,
          order: section.order,
          fields: section.fields
            .filter(field => field.enabled)
            .map(field => ({
              name: field.name,
              label: field.label,
              type: field.type,
              required: field.required,
              enabled: field.enabled
            }))
        }))
    };

    if (editMode && orderTypeId) {
      // Update existing order type
      handleSave(
        () => dispatch(updateOrderType(orderTypeId, dataToSave)),
        {
          successMessage: "Order type updated successfully!",
          onSuccess: () => {
            // Call callback or navigate back after successful update
            if (onSaveSuccess) {
              onSaveSuccess();
            } else {
              navigate(-1);
            }
          }
        }
      );
    } else {
      // Create new order type
      handleSave(
        () => dispatch(createOrderType(dataToSave)),
        {
          successMessage: "Order type created successfully!",
          onSuccess: () => {
            // Reset form
            setTypeName("");
            setTypeCode("");
            setDescription("");
            setNumberPrefix("");
            setNumberFormat("PREFIX-{YYYY}-{SEQ}");
            setSequencePadding(4);
            setAllowedOptionTypes([]);
            setLinkedPrintTypes([]);
            setIsGlobal(false);
            setIsDefault(false);
            setSections(defaultSections);
            setExpandedSection(null);
          }
        }
      );
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!orderTypeId) return;

    setDeleting(true);
    try {
      await dispatch(deleteOrderType(orderTypeId));
      toast.success('Deleted', 'Order type deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete order type');
    } finally {
      setDeleting(false);
    }
  };

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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Order Type?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this order type? This action cannot be undone.
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
                ← Back to List
              </button>
            )}
            <div>
              <h2 className="orderTypeTitle">
                {editMode ? 'Edit Order Type' : 'Create Order Type'}
              </h2>
              <p className="orderTypeSubtitle">
                {editMode
                  ? `Editing: ${orderTypeData?.typeName || 'Order Type'}`
                  : 'Configure a new order type for your manufacturing system'
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
                  content="Enter a descriptive name for this order type (e.g., Sample Order, Production Order, Trial Order)"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., Sample Order"
                required
              />
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Code *</label>
                <FieldTooltip
                  content="Short code for this order type (e.g., SAMPLE, PROD, TRIAL). Will be converted to uppercase."
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeCode}
                onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
                className="orderTypeFormInput"
                placeholder="e.g., SAMPLE"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="orderTypeFormColumn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <label className="orderTypeInputLabel">Description</label>
              <FieldTooltip
                content="Optional description explaining when to use this order type"
                position="right"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder="Describe when to use this order type..."
              rows={3}
            />
          </div>
        </div>

        {/* Numbering Configuration Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Order Numbering</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Number Prefix *</label>
                <FieldTooltip
                  content="Prefix for order numbers (e.g., SAM for Sample orders, PROD for Production)"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={numberPrefix}
                onChange={(e) => setNumberPrefix(e.target.value.toUpperCase())}
                className="orderTypeFormInput"
                placeholder="e.g., SAM"
                maxLength={10}
                required
              />
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Number Format</label>
                <FieldTooltip
                  title="Format Variables"
                  content="{YYYY} = Year, {MM} = Month, {DD} = Day, {SEQ} = Sequence number"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={numberFormat}
                onChange={(e) => setNumberFormat(e.target.value)}
                className="orderTypeFormInput"
                placeholder="PREFIX-{YYYY}-{SEQ}"
              />
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Sequence Padding</label>
                <FieldTooltip
                  content="Number of digits for sequence (e.g., 4 = 0001, 0002, etc.)"
                  position="right"
                />
              </div>
              <input
                type="number"
                value={sequencePadding}
                onChange={(e) => setSequencePadding(Number(e.target.value))}
                className="orderTypeFormInput"
                min={1}
                max={10}
              />
            </div>
          </div>

          <div className="orderTypeFormatPreview">
            <strong>Preview:</strong> {numberPrefix}-{new Date().getFullYear()}-{String(1).padStart(sequencePadding, '0')}
          </div>
        </div>

        {/* Allowed Option Types Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Allowed Option Types
            <FieldTooltip
              content="Select which option types can be used when creating orders of this type. Leave empty to allow all option types."
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
                        checked={allowedOptionTypes.includes(optionType._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAllowedOptionTypes([...allowedOptionTypes, optionType._id]);
                          } else {
                            setAllowedOptionTypes(allowedOptionTypes.filter(id => id !== optionType._id));
                          }
                        }}
                        style={{ marginTop: '0.25rem', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{optionType.name}</div>
                        {optionType.description && (
                          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.125rem' }}>
                            {optionType.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {optionTypes.length > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                  {allowedOptionTypes.length === 0
                    ? "No option types selected (all option types will be allowed)"
                    : `${allowedOptionTypes.length} option type(s) selected`
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Linked Print Types Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Linked Print Types
            <FieldTooltip
              content="Select which print types can be used when printing orders of this type. Leave empty to allow all print types."
              position="right"
            />
          </h3>

          <div className="orderTypeFormRow">
            <div style={{ width: '100%' }}>
              {printTypes.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No print types available. Create print types first.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                  {printTypes.map((printType: any) => (
                    <label
                      key={printType._id}
                      className="orderTypeCheckboxLabel"
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={linkedPrintTypes.includes(printType._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLinkedPrintTypes([...linkedPrintTypes, printType._id]);
                          } else {
                            setLinkedPrintTypes(linkedPrintTypes.filter(id => id !== printType._id));
                          }
                        }}
                        style={{ marginTop: '0.25rem', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{printType.typeName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          Code: {printType.typeCode} | Paper: {printType.paperSize} | {printType.orientation}
                        </div>
                        {printType.description && (
                          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.125rem' }}>
                            {printType.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {printTypes.length > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                  {linkedPrintTypes.length === 0
                    ? "No print types selected (all print types will be allowed)"
                    : `${linkedPrintTypes.length} print type(s) selected`
                  }
                </div>
              )}
            </div>
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
                <span>Global Order Type</span>
                <FieldTooltip
                  content="Make this order type available across all branches"
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
                content="Make this the default order type when creating new orders"
                position="right"
              />
            </label>

            <label className="orderTypeCheckboxLabel">
              <input
                type="checkbox"
                checked={projectBase}
                onChange={(e) => setProjectBase(e.target.checked)}
              />
              <span>Project Base</span>
              <FieldTooltip
                content="Enable project-based order tracking. When enabled, orders will support project workflows. When disabled, orders follow standard manufacturing workflows."
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

        {/* Form Sections Configuration */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Form Sections Configuration
            <FieldTooltip
              content="Configure which sections and fields appear in the order creation form"
              position="right"
            />
          </h3>

          <div className="orderTypeSectionsConfig">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div key={section.id} className="orderTypeSectionConfigItem">
                  <div className="orderTypeSectionConfigHeader">
                    <div className="orderTypeSectionConfigLeft">
                      <label className="orderTypeCheckboxLabel">
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={() => handleSectionToggle(section.id)}
                        />
                        <span className="orderTypeSectionName">{section.name}</span>
                      </label>
                    </div>

                    <div className="orderTypeSectionConfigRight">
                      <span className="orderTypeSectionOrder">Order: {section.order}</span>
                      <button
                        type="button"
                        className="orderTypeOrderBtn"
                        onClick={() => handleSectionOrderChange(section.id, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="orderTypeOrderBtn"
                        onClick={() => handleSectionOrderChange(section.id, 'down')}
                        disabled={index === sections.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="orderTypeExpandBtn"
                        onClick={() => setExpandedSection(
                          expandedSection === section.id ? null : section.id
                        )}
                      >
                        {expandedSection === section.id ? '−' : '+'}
                      </button>
                    </div>
                  </div>

                  {expandedSection === section.id && section.enabled && (
                    <div className="orderTypeSectionFieldsConfig">
                      <div className="orderTypeFieldsHeader">
                        <span>Field</span>
                        <span>Enabled</span>
                        <span>Required</span>
                      </div>
                      {section.fields.map(field => (
                        <div key={field.name} className="orderTypeFieldConfigRow">
                          <span className="orderTypeFieldLabel">{field.label}</span>
                          <input
                            type="checkbox"
                            checked={field.enabled}
                            onChange={() => handleFieldToggle(section.id, field.name)}
                          />
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={() => handleFieldRequiredToggle(section.id, field.name)}
                            disabled={!field.enabled}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="orderTypeFormActions">
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
            className="orderTypeSaveButton"
            disabled={!typeName.trim() || !typeCode.trim() || !numberPrefix.trim()}
          >
            {editMode ? 'Update Order Type' : 'Create Order Type'}
          </ActionButton>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateOrderType;
