import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrderType, updateOrderType, deleteOrderType } from "../../../../redux/create/orderType/orderTypeActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { getOptionSpecs } from "../../../../redux/create/optionSpec/optionSpecActions";
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
  // Enhanced fields
  showInOrder?: boolean; // Show this field in order view (Yes/No)
  columnFormat?: 'standard' | 'highlight' | 'summary' | 'hidden'; // How to display
};

type SectionConfig = {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  fields: FieldConfig[];
  // Enhanced fields
  showInOrder?: boolean; // Show this section in order view (Yes/No)
  columnFormat?: 'standard' | 'highlight' | 'summary' | 'hidden'; // How to display
};

// Selected specification for formulas
type SelectedSpecification = {
  optionTypeId: string;
  optionTypeName: string;
  specName: string;
  unit?: string;
  varName: string; // e.g., "Product_Price"
};

// Dynamic calculation configuration type
type DynamicCalculationConfig = {
  name: string;
  formula: string; // Custom formula expression using specifications from allowed option types
  unit?: string;
  enabled: boolean;
  // New fields for enhanced functionality
  order: number; // For up/down reordering
  showInOrder: boolean; // Show this calculation in order view (Yes/No)
  autoPopulate: boolean; // Auto-calculate when option specs are selected
  columnFormat: 'standard' | 'highlight' | 'summary' | 'hidden'; // How to display in orders
  rule?: {
    type: 'always' | 'conditional' | 'manual';
    condition?: string; // e.g., "Product_Quantity > 0"
    triggerOnOptionType?: string; // Auto-run when this option type is selected
  };
};

// Default section configurations
const defaultSections: SectionConfig[] = [
  {
    id: 'steps',
    name: 'Manufacturing Steps',
    enabled: true,
    order: 1,
    showInOrder: true,
    columnFormat: 'standard',
    fields: [
      { name: 'stepName', label: 'Step Name', type: 'suggestions', required: true, enabled: true, showInOrder: true, columnFormat: 'standard' },
      { name: 'machines', label: 'Machines', type: 'select', required: false, enabled: true, showInOrder: true, columnFormat: 'standard' },
      { name: 'operators', label: 'Operators', type: 'select', required: false, enabled: true, showInOrder: true, columnFormat: 'standard' },
      { name: 'startTime', label: 'Start Time', type: 'text', required: false, enabled: true, showInOrder: true, columnFormat: 'standard' },
      { name: 'endTime', label: 'End Time', type: 'text', required: false, enabled: true, showInOrder: true, columnFormat: 'standard' },
      { name: 'notes', label: 'Notes', type: 'text', required: false, enabled: true, showInOrder: true, columnFormat: 'standard' },
    ]
  },
  {
    id: 'options',
    name: 'Options',
    enabled: true,
    order: 2,
    showInOrder: true,
    columnFormat: 'standard',
    fields: []
  },
  {
    id: 'dynamicColumns',
    name: 'Dynamic Columns',
    enabled: true,
    order: 3,
    showInOrder: true,
    columnFormat: 'highlight',
    fields: []
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

  // Dynamic Calculations Configuration
  const [dynamicCalculations, setDynamicCalculations] = useState<DynamicCalculationConfig[]>([]);

  // Selected specifications for formulas (from Allowed Option Types)
  const [selectedSpecs, setSelectedSpecs] = useState<SelectedSpecification[]>([]);

  // Active formula field index for click-to-insert
  const [activeFormulaIndex, setActiveFormulaIndex] = useState<number | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast} = useCRUD();

  // Get user role for conditional rendering
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // Get option types from Redux store
  const optionTypes = useSelector((state: any) => state.optionType?.optionTypes || []);

  // Get option specs from Redux store (contains actual specifications with values)
  const optionSpecs = useSelector((state: any) => state.optionSpec?.optionSpecs || []);

  // Get print types from Redux store
  const printTypes = useSelector((state: any) => state.printTypeList?.printTypes || []);

  // Fetch option types, option specs, and print types on mount
  useEffect(() => {
    dispatch(getOptionTypes());
    dispatch(getOptionSpecs());
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

      // Dynamic Calculations Configuration
      if (orderTypeData.dynamicCalculations && Array.isArray(orderTypeData.dynamicCalculations)) {
        setDynamicCalculations(orderTypeData.dynamicCalculations.map((calc: any, index: number) => ({
          name: calc.name || '',
          formula: calc.formula || '',
          unit: calc.unit || '',
          enabled: calc.enabled !== false,
          order: calc.order || index + 1,
          showInOrder: calc.showInOrder !== false,
          autoPopulate: calc.autoPopulate !== false,
          columnFormat: calc.columnFormat || 'standard',
          rule: calc.rule || { type: 'always', condition: '', triggerOnOptionType: '' }
        })));
      }

      // Selected Specifications for formulas
      if (orderTypeData.selectedSpecs && Array.isArray(orderTypeData.selectedSpecs)) {
        setSelectedSpecs(orderTypeData.selectedSpecs);
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

  // Update section property (showInOrder, columnFormat)
  const updateSectionProperty = (sectionId: string, property: keyof SectionConfig, value: any) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, [property]: value }
        : section
    ));
  };

  // Update field property (showInOrder, columnFormat)
  const updateFieldProperty = (sectionId: string, fieldName: string, property: keyof FieldConfig, value: any) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.name === fieldName
                ? { ...field, [property]: value }
                : field
            )
          }
        : section
    ));
  };

  // Dynamic calculations handlers
  const addDynamicCalculation = () => {
    setDynamicCalculations([
      ...dynamicCalculations,
      {
        name: '',
        formula: '',
        unit: '',
        enabled: true,
        order: dynamicCalculations.length + 1,
        showInOrder: true,
        autoPopulate: true,
        columnFormat: 'standard',
        rule: {
          type: 'always',
          condition: '',
          triggerOnOptionType: ''
        }
      },
    ]);
  };

  // Insert specification into formula
  const insertIntoFormula = (index: number, specName: string) => {
    const updated = [...dynamicCalculations];
    const currentFormula = updated[index].formula || '';
    updated[index].formula = currentFormula + specName;
    setDynamicCalculations(updated);
  };

  const updateDynamicCalculation = (index: number, field: keyof DynamicCalculationConfig, value: any) => {
    const updated = [...dynamicCalculations];
    updated[index] = { ...updated[index], [field]: value };
    setDynamicCalculations(updated);
  };

  const removeDynamicCalculation = (index: number) => {
    const filtered = dynamicCalculations.filter((_, i) => i !== index);
    // Reorder remaining calculations
    setDynamicCalculations(filtered.map((calc, i) => ({ ...calc, order: i + 1 })));
  };

  // Move calculation up/down
  const moveCalculation = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === dynamicCalculations.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...dynamicCalculations];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    // Update order numbers
    setDynamicCalculations(updated.map((calc, i) => ({ ...calc, order: i + 1 })));
  };

  // Get all specifications from all allowed option types (from OptionSpecs)
  const getAllAllowedSpecifications = () => {
    const allSpecs: { optionTypeName: string; optionTypeId: string; specs: any[] }[] = [];

    allowedOptionTypes.forEach((optionTypeId) => {
      const optionType = optionTypes.find((ot: any) => ot._id === optionTypeId);
      if (optionType) {
        // Get all OptionSpecs that belong to this OptionType
        const relatedSpecs = optionSpecs.filter((spec: any) =>
          spec.optionTypeId === optionTypeId ||
          (spec.optionTypeId && spec.optionTypeId._id === optionTypeId)
        );

        // Collect all number-type specifications from these OptionSpecs
        const numberSpecsFromOptionSpecs: any[] = [];
        relatedSpecs.forEach((optionSpec: any) => {
          if (optionSpec.specifications && Array.isArray(optionSpec.specifications)) {
            const numberSpecs = optionSpec.specifications.filter((s: any) => s.dataType === 'number');
            numberSpecs.forEach((spec: any) => {
              // Add optionSpec info for context
              if (!numberSpecsFromOptionSpecs.some(existing => existing.name === spec.name)) {
                numberSpecsFromOptionSpecs.push({
                  ...spec,
                  fromOptionSpec: optionSpec.name,
                  fromOptionSpecCode: optionSpec.code
                });
              }
            });
          }
        });

        if (numberSpecsFromOptionSpecs.length > 0) {
          allSpecs.push({
            optionTypeName: optionType.name,
            optionTypeId: optionType._id,
            specs: numberSpecsFromOptionSpecs,
          });
        }
      }
    });

    return allSpecs;
  };

  // Get ALL specifications (all types) from allowed option types - for display (from OptionSpecs)
  const getAllSpecificationsAllTypes = () => {
    const allSpecs: { optionTypeName: string; optionTypeId: string; specs: any[] }[] = [];

    allowedOptionTypes.forEach((optionTypeId) => {
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

  // Check if a specification is selected
  const isSpecSelected = (optionTypeId: string, specName: string) => {
    return selectedSpecs.some(s => s.optionTypeId === optionTypeId && s.specName === specName);
  };

  // Toggle specification selection
  const toggleSpecSelection = (optionTypeId: string, optionTypeName: string, specName: string, unit?: string) => {
    const varName = `${optionTypeName.replace(/\s+/g, '_')}_${specName.replace(/\s+/g, '_')}`;

    if (isSpecSelected(optionTypeId, specName)) {
      // Remove
      setSelectedSpecs(prev => prev.filter(s => !(s.optionTypeId === optionTypeId && s.specName === specName)));
    } else {
      // Add
      setSelectedSpecs(prev => [...prev, { optionTypeId, optionTypeName, specName, unit, varName }]);
    }
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
      // Section configuration for dynamic form rendering - save all sections sorted by order
      sections: sections
        .sort((a, b) => a.order - b.order)
        .map(section => ({
          id: section.id,
          name: section.name,
          enabled: section.enabled,
          order: section.order,
          showInOrder: section.showInOrder,
          columnFormat: section.columnFormat,
          fields: section.fields.map(field => ({
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required,
            enabled: field.enabled,
            showInOrder: field.showInOrder,
            columnFormat: field.columnFormat
          }))
        })),
      // Dynamic calculations configuration - filter out empty ones, include all enhanced fields
      dynamicCalculations: dynamicCalculations
        .filter(calc => calc.name && calc.name.trim() !== '')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((calc, index) => ({
          name: calc.name,
          formula: calc.formula || '',
          unit: calc.unit || undefined,
          enabled: calc.enabled,
          order: index + 1,
          showInOrder: calc.showInOrder,
          autoPopulate: calc.autoPopulate,
          columnFormat: calc.columnFormat,
          rule: calc.rule
        })),
      // Selected specifications for formulas
      selectedSpecs: selectedSpecs
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
            setDynamicCalculations([]);
            setSelectedSpecs([]);
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

        {/* Dynamic Calculations - Based on Allowed Option Types */}
        <div className="orderTypeSection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="orderTypeSectionTitle" style={{ marginBottom: 0 }}>
              Dynamic Calculations
              <FieldTooltip
                content="1. Select specifications from Allowed Option Types. 2. Create formulas using selected specifications. Only selected specs can be used in formulas."
                position="right"
              />
            </h3>
            <button
              type="button"
              onClick={addDynamicCalculation}
              disabled={selectedSpecs.length === 0}
              style={{
                padding: '8px 16px',
                background: selectedSpecs.length === 0 ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: selectedSpecs.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px'
              }}
            >
              + Add Calculation
            </button>
          </div>

          {/* Show available specifications from allowed option types */}
          {allowedOptionTypes.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '24px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
              Please select at least one Allowed Option Type above to see available specifications for calculations.
            </p>
          ) : (
            <>
              {/* Step 1: Select Specifications */}
              <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #0ea5e9', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1', marginBottom: '12px' }}>
                  Step 1: Select Specifications for Formulas (Check to include)
                </div>
                {getAllSpecificationsAllTypes().length === 0 ? (
                  <div style={{ color: '#6b7280', fontSize: '12px', padding: '16px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #fbbf24' }}>
                    <strong>No specifications found</strong> in the selected option types.
                    <br />
                    <span style={{ fontSize: '11px' }}>Make sure the selected Option Types have specifications defined.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {getAllSpecificationsAllTypes().map((typeGroup, groupIndex) => {
                      const numberSpecs = typeGroup.specs.filter((s: any) => s.dataType === 'number');
                      const otherSpecs = typeGroup.specs.filter((s: any) => s.dataType !== 'number');
                      return (
                        <div key={groupIndex} style={{ background: '#e0f2fe', padding: '12px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ background: '#0ea5e9', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                              {typeGroup.optionTypeName}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              ({typeGroup.specs.length} specs: {numberSpecs.length} number, {otherSpecs.length} other)
                            </span>
                          </div>

                          {/* Number specifications (can be used in formulas) */}
                          {numberSpecs.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ fontSize: '11px', color: '#059669', marginBottom: '4px', fontWeight: 500 }}>
                                Number Specifications (for formulas):
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {numberSpecs.map((spec: any, specIndex: number) => {
                                  const isSelected = isSpecSelected(typeGroup.optionTypeId, spec.name);
                                  return (
                                    <label
                                      key={specIndex}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        background: isSelected ? '#0ea5e9' : 'white',
                                        border: isSelected ? '2px solid #0369a1' : '1px solid #bae6fd',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '12px',
                                        fontWeight: isSelected ? 600 : 400,
                                        color: isSelected ? 'white' : '#0369a1'
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSpecSelection(typeGroup.optionTypeId, typeGroup.optionTypeName, spec.name, spec.unit)}
                                        style={{ accentColor: '#0ea5e9' }}
                                      />
                                      <span>{spec.name}</span>
                                      {spec.unit && <span style={{ opacity: 0.7, fontSize: '11px' }}>({spec.unit})</span>}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Other specifications (info only) */}
                          {otherSpecs.length > 0 && (
                            <div>
                              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                                Other Specifications (not available for formulas):
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

                          {numberSpecs.length === 0 && (
                            <div style={{ fontSize: '11px', color: '#dc2626', fontStyle: 'italic' }}>
                              No number specifications in this option type. Only number types can be used in formulas.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#0369a1', background: '#bae6fd', padding: '8px 12px', borderRadius: '6px' }}>
                  <strong>{selectedSpecs.length}</strong> specification(s) selected for formulas
                </div>
              </div>

              {/* Step 2: Selected Specifications for Click-to-Insert */}
              {selectedSpecs.length > 0 && (
                <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #10b981', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#065f46', marginBottom: '12px' }}>
                    Step 2: Selected Specifications (Click to insert into formula)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedSpecs.map((spec, idx) => (
                      <span
                        key={idx}
                        onClick={() => {
                          if (activeFormulaIndex !== null) {
                            insertIntoFormula(activeFormulaIndex, spec.varName);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          background: activeFormulaIndex !== null ? '#10b981' : '#a7f3d0',
                          border: '1px solid #059669',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: activeFormulaIndex !== null ? 'pointer' : 'default',
                          fontWeight: 500,
                          color: activeFormulaIndex !== null ? 'white' : '#065f46',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (activeFormulaIndex !== null) {
                            e.currentTarget.style.background = '#047857';
                            e.currentTarget.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeFormulaIndex !== null) {
                            e.currentTarget.style.background = '#10b981';
                            e.currentTarget.style.color = 'white';
                          } else {
                            e.currentTarget.style.background = '#a7f3d0';
                            e.currentTarget.style.color = '#065f46';
                          }
                        }}
                        title={activeFormulaIndex !== null ? `Click to insert "${spec.varName}"` : 'Focus on a formula input to insert'}
                      >
                        <strong>{spec.varName}</strong>
                        {spec.unit && <span style={{ marginLeft: '4px', opacity: 0.7 }}>({spec.unit})</span>}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#065f46' }}>
                    {activeFormulaIndex !== null
                      ? 'Click on any specification above to insert it into the active formula field'
                      : 'Click on a formula input field below, then click specifications to insert them'}
                  </div>
                </div>
              )}

              {/* Step 3: Create Calculations */}
              {selectedSpecs.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '24px', background: '#f9fafb', borderRadius: '8px' }}>
                  Select specifications above (Step 1) to create calculations.
                </p>
              ) : (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                    Step 3: Create Calculations ({dynamicCalculations.length} configured)
                  </div>

                  {dynamicCalculations.length === 0 && (
                    <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '24px', background: '#f9fafb', borderRadius: '8px' }}>
                      No calculations configured. Click "+ Add Calculation" to create formulas.
                    </p>
                  )}

                  {dynamicCalculations
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((calc, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      marginBottom: '12px',
                      background: calc.showInOrder ? '#f8fafc' : '#fef2f2',
                      borderRadius: '8px',
                      border: calc.showInOrder ? '1px solid #e2e8f0' : '1px solid #fecaca'
                    }}>
                      {/* Header Row: Order controls, Name, Actions */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                        {/* Order controls (up/down arrows) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button
                            type="button"
                            onClick={() => moveCalculation(index, 'up')}
                            disabled={index === 0}
                            style={{
                              padding: '4px 8px',
                              background: index === 0 ? '#e5e7eb' : '#3b82f6',
                              color: index === 0 ? '#9ca3af' : 'white',
                              border: 'none',
                              borderRadius: '4px 4px 0 0',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCalculation(index, 'down')}
                            disabled={index === dynamicCalculations.length - 1}
                            style={{
                              padding: '4px 8px',
                              background: index === dynamicCalculations.length - 1 ? '#e5e7eb' : '#3b82f6',
                              color: index === dynamicCalculations.length - 1 ? '#9ca3af' : 'white',
                              border: 'none',
                              borderRadius: '0 0 4px 4px',
                              cursor: index === dynamicCalculations.length - 1 ? 'not-allowed' : 'pointer',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>
                        <span style={{ fontSize: '11px', color: '#6b7280', background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          #{calc.order || index + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Calculation Name (e.g., Total Price)"
                          value={calc.name}
                          onChange={(e) => updateDynamicCalculation(index, 'name', e.target.value)}
                          style={{ flex: 2, minWidth: '180px', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={calc.unit || ''}
                          onChange={(e) => updateDynamicCalculation(index, 'unit', e.target.value)}
                          style={{ width: '80px', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeDynamicCalculation(index)}
                          style={{ padding: '10px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                        >
                          ✕
                        </button>
                      </div>

                      {/* Row 2: Options - Show in Order (Yes/No), Auto-Populate, Column Format */}
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap', background: '#f1f5f9', padding: '10px 12px', borderRadius: '6px' }}>
                        {/* Show in Order - Yes/No Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Show in Order:</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => updateDynamicCalculation(index, 'showInOrder', true)}
                              style={{
                                padding: '6px 12px',
                                background: calc.showInOrder ? '#22c55e' : '#e5e7eb',
                                color: calc.showInOrder ? 'white' : '#6b7280',
                                border: 'none',
                                borderRadius: '4px 0 0 4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: calc.showInOrder ? 600 : 400
                              }}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => updateDynamicCalculation(index, 'showInOrder', false)}
                              style={{
                                padding: '6px 12px',
                                background: !calc.showInOrder ? '#ef4444' : '#e5e7eb',
                                color: !calc.showInOrder ? 'white' : '#6b7280',
                                border: 'none',
                                borderRadius: '0 4px 4px 0',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: !calc.showInOrder ? 600 : 400
                              }}
                            >
                              No
                            </button>
                          </div>
                        </div>

                        {/* Auto-Populate Toggle */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={calc.autoPopulate !== false}
                            onChange={(e) => updateDynamicCalculation(index, 'autoPopulate', e.target.checked)}
                            style={{ accentColor: '#8b5cf6' }}
                          />
                          <span style={{ color: calc.autoPopulate !== false ? '#7c3aed' : '#6b7280', fontWeight: 500 }}>
                            Auto-Populate
                          </span>
                        </label>

                        {/* Enabled Toggle */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={calc.enabled}
                            onChange={(e) => updateDynamicCalculation(index, 'enabled', e.target.checked)}
                            style={{ accentColor: '#10b981' }}
                          />
                          <span style={{ color: calc.enabled ? '#059669' : '#6b7280', fontWeight: 500 }}>
                            {calc.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>

                        {/* Column Format Selection */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Format:</span>
                          <select
                            value={calc.columnFormat || 'standard'}
                            onChange={(e) => updateDynamicCalculation(index, 'columnFormat', e.target.value)}
                            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                          >
                            <option value="standard">Standard</option>
                            <option value="highlight">Highlight</option>
                            <option value="summary">Summary</option>
                            <option value="hidden">Hidden</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Rule Configuration */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap', background: '#eff6ff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>Rule:</span>
                        <select
                          value={calc.rule?.type || 'always'}
                          onChange={(e) => updateDynamicCalculation(index, 'rule', { ...calc.rule, type: e.target.value })}
                          style={{ padding: '6px 10px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', background: 'white' }}
                        >
                          <option value="always">Always Calculate</option>
                          <option value="conditional">Conditional</option>
                          <option value="manual">Manual Only</option>
                        </select>

                        {calc.rule?.type === 'conditional' && (
                          <input
                            type="text"
                            placeholder="Condition (e.g., Product_Quantity > 0)"
                            value={calc.rule?.condition || ''}
                            onChange={(e) => updateDynamicCalculation(index, 'rule', { ...calc.rule, condition: e.target.value })}
                            style={{ flex: 1, minWidth: '200px', padding: '6px 10px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                          />
                        )}

                        {/* Trigger on Option Type */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#1e40af' }}>Trigger on:</span>
                          <select
                            value={calc.rule?.triggerOnOptionType || ''}
                            onChange={(e) => updateDynamicCalculation(index, 'rule', { ...calc.rule, triggerOnOptionType: e.target.value })}
                            style={{ padding: '6px 10px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', background: 'white', maxWidth: '150px' }}
                          >
                            <option value="">Any Option</option>
                            {allowedOptionTypes.map((optTypeId) => {
                              const optType = optionTypes.find((ot: any) => ot._id === optTypeId);
                              return optType ? (
                                <option key={optTypeId} value={optTypeId}>{optType.name}</option>
                              ) : null;
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Row 4: Formula Input */}
                      <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #fdba74' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#9a3412' }}>Formula:</span>
                          <span style={{ fontSize: '11px', color: '#c2410c' }}>
                            Use operators: + - * / ( ) and selected specification names
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g., Product_Price * Product_Quantity + Product_GST"
                          value={calc.formula}
                          onChange={(e) => updateDynamicCalculation(index, 'formula', e.target.value)}
                          onFocus={() => setActiveFormulaIndex(index)}
                          onBlur={() => {
                            // Delay to allow click-to-insert to work
                            setTimeout(() => setActiveFormulaIndex(null), 200);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: activeFormulaIndex === index ? '2px solid #f97316' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontFamily: 'monospace'
                          }}
                        />
                        {activeFormulaIndex === index && (
                          <div style={{ marginTop: '8px', fontSize: '11px', color: '#9a3412' }}>
                            Click on any specification in the green box above (Step 2) to insert it into this formula
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Form Sections Configuration */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Form Sections Configuration
            <FieldTooltip
              content="Configure which sections and fields appear in the order creation form. Use up/down arrows to reorder, toggle visibility, and select display format."
              position="right"
            />
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div
                  key={section.id}
                  style={{
                    padding: '16px',
                    background: section.showInOrder !== false ? '#f8fafc' : '#fef2f2',
                    borderRadius: '8px',
                    border: section.showInOrder !== false ? '1px solid #e2e8f0' : '1px solid #fecaca'
                  }}
                >
                  {/* Section Header Row */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    {/* Order controls (up/down arrows) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => handleSectionOrderChange(section.id, 'up')}
                        disabled={index === 0}
                        style={{
                          padding: '4px 8px',
                          background: index === 0 ? '#e5e7eb' : '#3b82f6',
                          color: index === 0 ? '#9ca3af' : 'white',
                          border: 'none',
                          borderRadius: '4px 4px 0 0',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSectionOrderChange(section.id, 'down')}
                        disabled={index === sections.length - 1}
                        style={{
                          padding: '4px 8px',
                          background: index === sections.length - 1 ? '#e5e7eb' : '#3b82f6',
                          color: index === sections.length - 1 ? '#9ca3af' : 'white',
                          border: 'none',
                          borderRadius: '0 0 4px 4px',
                          cursor: index === sections.length - 1 ? 'not-allowed' : 'pointer',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    <span style={{ fontSize: '11px', color: '#6b7280', background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      #{section.order}
                    </span>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => handleSectionToggle(section.id)}
                        style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '14px', color: section.enabled ? '#374151' : '#9ca3af' }}>
                        {section.name}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                      style={{
                        padding: '6px 12px',
                        background: expandedSection === section.id ? '#3b82f6' : '#e5e7eb',
                        color: expandedSection === section.id ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {expandedSection === section.id ? '− Fields' : '+ Fields'}
                    </button>
                  </div>

                  {/* Section Options Row */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', background: '#f1f5f9', padding: '10px 12px', borderRadius: '6px', marginBottom: expandedSection === section.id && section.enabled ? '12px' : '0' }}>
                    {/* Show in Order - Yes/No Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Show in Order:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => updateSectionProperty(section.id, 'showInOrder', true)}
                          style={{
                            padding: '6px 12px',
                            background: section.showInOrder !== false ? '#22c55e' : '#e5e7eb',
                            color: section.showInOrder !== false ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '4px 0 0 4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: section.showInOrder !== false ? 600 : 400
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSectionProperty(section.id, 'showInOrder', false)}
                          style={{
                            padding: '6px 12px',
                            background: section.showInOrder === false ? '#ef4444' : '#e5e7eb',
                            color: section.showInOrder === false ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '0 4px 4px 0',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: section.showInOrder === false ? 600 : 400
                          }}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Column Format Selection */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Format:</span>
                      <select
                        value={section.columnFormat || 'standard'}
                        onChange={(e) => updateSectionProperty(section.id, 'columnFormat', e.target.value)}
                        style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        <option value="standard">Standard</option>
                        <option value="highlight">Highlight</option>
                        <option value="summary">Summary</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>

                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {section.id === 'dynamicColumns'
                        ? `${dynamicCalculations.length} calculation(s)`
                        : `${section.fields.length} field(s)`
                      }
                    </span>
                  </div>

                  {/* Expanded Fields Configuration */}
                  {expandedSection === section.id && section.enabled && section.fields.length > 0 && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      {/* Fields Header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 100px 120px', gap: '8px', padding: '10px 12px', background: '#f1f5f9', fontWeight: 600, fontSize: '11px', color: '#4b5563', borderBottom: '1px solid #e2e8f0' }}>
                        <span>Field Name</span>
                        <span style={{ textAlign: 'center' }}>Enabled</span>
                        <span style={{ textAlign: 'center' }}>Required</span>
                        <span style={{ textAlign: 'center' }}>Show</span>
                        <span style={{ textAlign: 'center' }}>Format</span>
                      </div>
                      {/* Field Rows */}
                      {section.fields.map((field, fieldIndex) => (
                        <div
                          key={field.name}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 80px 80px 100px 120px',
                            gap: '8px',
                            padding: '10px 12px',
                            alignItems: 'center',
                            background: field.showInOrder === false ? '#fef2f2' : (fieldIndex % 2 === 0 ? '#fff' : '#f9fafb'),
                            borderBottom: fieldIndex < section.fields.length - 1 ? '1px solid #e2e8f0' : 'none'
                          }}
                        >
                          <span style={{ fontSize: '13px', color: field.enabled ? '#374151' : '#9ca3af' }}>{field.label}</span>
                          <div style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={field.enabled}
                              onChange={() => handleFieldToggle(section.id, field.name)}
                              style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={() => handleFieldRequiredToggle(section.id, field.name)}
                              disabled={!field.enabled}
                              style={{ accentColor: '#f59e0b', width: '16px', height: '16px', cursor: field.enabled ? 'pointer' : 'not-allowed' }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                            <button
                              type="button"
                              onClick={() => updateFieldProperty(section.id, field.name, 'showInOrder', true)}
                              style={{
                                padding: '4px 8px',
                                background: field.showInOrder !== false ? '#22c55e' : '#e5e7eb',
                                color: field.showInOrder !== false ? 'white' : '#6b7280',
                                border: 'none',
                                borderRadius: '3px 0 0 3px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                fontWeight: field.showInOrder !== false ? 600 : 400
                              }}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => updateFieldProperty(section.id, field.name, 'showInOrder', false)}
                              style={{
                                padding: '4px 8px',
                                background: field.showInOrder === false ? '#ef4444' : '#e5e7eb',
                                color: field.showInOrder === false ? 'white' : '#6b7280',
                                border: 'none',
                                borderRadius: '0 3px 3px 0',
                                cursor: 'pointer',
                                fontSize: '10px',
                                fontWeight: field.showInOrder === false ? 600 : 400
                              }}
                            >
                              No
                            </button>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <select
                              value={field.columnFormat || 'standard'}
                              onChange={(e) => updateFieldProperty(section.id, field.name, 'columnFormat', e.target.value)}
                              style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', width: '100%' }}
                            >
                              <option value="standard">Standard</option>
                              <option value="highlight">Highlight</option>
                              <option value="summary">Summary</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Columns - Show Dynamic Calculations */}
                  {expandedSection === section.id && section.id === 'dynamicColumns' && section.enabled && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      {dynamicCalculations.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', padding: '16px', background: '#fef3c7', borderRadius: '6px', margin: '0' }}>
                          No dynamic calculations configured. Add calculations in the "Dynamic Calculations" section above.
                        </p>
                      ) : (
                        <>
                          {/* Dynamic Columns Header */}
                          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 120px', gap: '8px', padding: '10px 12px', background: '#fef3c7', fontWeight: 600, fontSize: '11px', color: '#92400e', borderBottom: '1px solid #fbbf24' }}>
                            <span style={{ textAlign: 'center' }}>#</span>
                            <span>Calculation Name</span>
                            <span style={{ textAlign: 'center' }}>Formula</span>
                            <span style={{ textAlign: 'center' }}>Show</span>
                            <span style={{ textAlign: 'center' }}>Format</span>
                          </div>
                          {/* Dynamic Calculation Rows */}
                          {dynamicCalculations
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((calc, calcIndex) => (
                            <div
                              key={calcIndex}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '40px 1fr 100px 100px 120px',
                                gap: '8px',
                                padding: '10px 12px',
                                alignItems: 'center',
                                background: calc.showInOrder === false ? '#fef2f2' : (calcIndex % 2 === 0 ? '#fffbeb' : '#fef9c3'),
                                borderBottom: calcIndex < dynamicCalculations.length - 1 ? '1px solid #fde68a' : 'none'
                              }}
                            >
                              <span style={{ textAlign: 'center', fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
                                #{calc.order || calcIndex + 1}
                              </span>
                              <div>
                                <span style={{ fontSize: '13px', color: calc.enabled ? '#374151' : '#9ca3af', fontWeight: 500 }}>
                                  {calc.name || '(unnamed)'}
                                </span>
                                {calc.unit && (
                                  <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px' }}>({calc.unit})</span>
                                )}
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    color: calc.formula ? '#059669' : '#dc2626',
                                    background: calc.formula ? '#d1fae5' : '#fee2e2',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}
                                  title={calc.formula || 'No formula'}
                                >
                                  {calc.formula ? 'Set' : 'Empty'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                                <button
                                  type="button"
                                  onClick={() => updateDynamicCalculation(calcIndex, 'showInOrder', true)}
                                  style={{
                                    padding: '4px 8px',
                                    background: calc.showInOrder !== false ? '#22c55e' : '#e5e7eb',
                                    color: calc.showInOrder !== false ? 'white' : '#6b7280',
                                    border: 'none',
                                    borderRadius: '3px 0 0 3px',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    fontWeight: calc.showInOrder !== false ? 600 : 400
                                  }}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateDynamicCalculation(calcIndex, 'showInOrder', false)}
                                  style={{
                                    padding: '4px 8px',
                                    background: calc.showInOrder === false ? '#ef4444' : '#e5e7eb',
                                    color: calc.showInOrder === false ? 'white' : '#6b7280',
                                    border: 'none',
                                    borderRadius: '0 3px 3px 0',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    fontWeight: calc.showInOrder === false ? 600 : 400
                                  }}
                                >
                                  No
                                </button>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <select
                                  value={calc.columnFormat || 'standard'}
                                  onChange={(e) => updateDynamicCalculation(calcIndex, 'columnFormat', e.target.value)}
                                  style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', width: '100%' }}
                                >
                                  <option value="standard">Standard</option>
                                  <option value="highlight">Highlight</option>
                                  <option value="summary">Summary</option>
                                  <option value="hidden">Hidden</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Empty fields message for other sections */}
                  {expandedSection === section.id && section.id !== 'dynamicColumns' && section.enabled && section.fields.length === 0 && (
                    <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
                      No fields configured for this section.
                    </p>
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
