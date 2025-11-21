import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrderType, updateOrderType } from "../../../../redux/create/orderType/orderTypeActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { BackButton } from "../../../../allCompones/BackButton";
import { useFormDataCache } from "../../Edit/hooks/useFormDataCache";
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
    id: 'product',
    name: 'Product Information',
    enabled: true,
    order: 1,
    fields: [
      { name: 'productType', label: 'Product Type', type: 'suggestions', required: true, enabled: true },
      { name: 'productName', label: 'Product Name', type: 'suggestions', required: true, enabled: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true, enabled: true },
    ]
  },
  {
    id: 'material',
    name: 'Material Information',
    enabled: true,
    order: 2,
    fields: [
      { name: 'materialType', label: 'Material Type', type: 'suggestions', required: true, enabled: true },
      { name: 'materialName', label: 'Material Name', type: 'suggestions', required: true, enabled: true },
      { name: 'mixing', label: 'Mixing', type: 'select', required: false, enabled: true },
    ]
  },
  {
    id: 'printing',
    name: 'Printing Options',
    enabled: true,
    order: 3,
    fields: [
      { name: 'printEnabled', label: 'Print', type: 'select', required: false, enabled: true },
      { name: 'printLength', label: 'Print Length', type: 'number', required: false, enabled: true },
      { name: 'printWidth', label: 'Print Width', type: 'number', required: false, enabled: true },
      { name: 'printType', label: 'Print Type', type: 'select', required: false, enabled: true },
      { name: 'printColor', label: 'Print Color', type: 'text', required: false, enabled: true },
      { name: 'printImage', label: 'Print Image', type: 'text', required: false, enabled: true },
    ]
  },
  {
    id: 'steps',
    name: 'Manufacturing Steps',
    enabled: true,
    order: 4,
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

const CreateOrderType = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode detection
  const { orderTypeData, isEdit } = location.state || {};
  const editMode = Boolean(isEdit || (orderTypeData && orderTypeData._id));
  const orderTypeId = orderTypeData?._id;

  // Basic Information
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");

  // Numbering Configuration
  const [numberPrefix, setNumberPrefix] = useState("");
  const [numberFormat, setNumberFormat] = useState("PREFIX-{YYYY}-{SEQ}");
  const [sequencePadding, setSequencePadding] = useState(4);

  // Approval Settings
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [autoApproveBelow, setAutoApproveBelow] = useState("");

  // Validation Rules
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  // Section Configuration
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Restrictions Configuration
  const [allowedProductTypes, setAllowedProductTypes] = useState<string[]>([]);
  const [allowedMaterialTypes, setAllowedMaterialTypes] = useState<string[]>([]);

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

      // Approval Settings
      setRequiresApproval(orderTypeData.requiresApproval || false);
      setAutoApproveBelow(orderTypeData.autoApproveBelow?.toString() || "");

      // Validation Rules
      setMinQuantity(orderTypeData.validationRules?.minQuantity?.toString() || "");
      setMaxQuantity(orderTypeData.validationRules?.maxQuantity?.toString() || "");

      // Global/Default Settings
      setIsGlobal(orderTypeData.isGlobal || false);
      setIsDefault(orderTypeData.isDefault || false);

      // Section Configuration
      if (orderTypeData.sections && orderTypeData.sections.length > 0) {
        setSections(orderTypeData.sections);
      }

      // Restrictions Configuration
      if (orderTypeData.restrictions) {
        setAllowedProductTypes(orderTypeData.restrictions.allowedProductTypes?.map((id: any) =>
          typeof id === 'object' ? id._id : id
        ) || []);
        setAllowedMaterialTypes(orderTypeData.restrictions.allowedMaterialTypes?.map((id: any) =>
          typeof id === 'object' ? id._id : id
        ) || []);
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

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { productTypes: cachedProductTypes, materialTypes: cachedMaterialTypes, products: cachedProducts, materials: cachedMaterials } = useFormDataCache();

  // Group products and materials by types for restrictions dropdowns
  const productTypes = useMemo(() => {
    return cachedProductTypes.map((type: any) => ({
      ...type,
      products: cachedProducts.filter((product: any) =>
        (product.productType?._id === type._id || product.productTypeId === type._id)
      )
    }));
  }, [cachedProductTypes, cachedProducts]);

  const materialTypes = useMemo(() => {
    return cachedMaterialTypes.map((type: any) => ({
      ...type,
      materials: cachedMaterials.filter((material: any) =>
        (material.materialType?._id === type._id || material.materialTypeId === type._id)
      )
    }));
  }, [cachedMaterialTypes, cachedMaterials]);

  // Get user role for conditional rendering
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // ✅ No useEffect dispatch needed - data already loaded from cache!

  const handleSubmit = () => {
    // Validation
    if (!typeName.trim() || !typeCode.trim() || !numberPrefix.trim()) {
      toast.error("Validation Error", "Please fill all required fields: Type Name, Type Code, and Number Prefix");
      return;
    }

    // Build validation rules
    const validationRules: any = {};
    if (minQuantity) validationRules.minQuantity = Number(minQuantity);
    if (maxQuantity) validationRules.maxQuantity = Number(maxQuantity);

    // Build order type data
    const dataToSave = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      numberPrefix,
      numberFormat,
      sequencePadding: Number(sequencePadding),
      requiresApproval,
      autoApproveBelow: autoApproveBelow ? Number(autoApproveBelow) : undefined,
      validationRules: Object.keys(validationRules).length > 0 ? validationRules : undefined,
      isGlobal,
      isDefault,
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
        })),
      // Restrictions configuration
      restrictions: {
        allowedProductTypes,
        allowedMaterialTypes
      }
    };

    if (editMode && orderTypeId) {
      // Update existing order type
      handleSave(
        () => dispatch(updateOrderType(orderTypeId, dataToSave)),
        {
          successMessage: "Order type updated successfully!",
          onSuccess: () => {
            // Navigate back after successful update
            navigate(-1);
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
            setRequiresApproval(false);
            setAutoApproveBelow("");
            setMinQuantity("");
            setMaxQuantity("");
            setIsGlobal(false);
            setIsDefault(false);
            setSections(defaultSections);
            setExpandedSection(null);
            // Reset restrictions
            setAllowedProductTypes([]);
            setAllowedMaterialTypes([]);
          }
        }
      );
    }
  };

  return (
    <div className="orderTypeContainer">
      <div className="orderTypeHeader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BackButton />
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

        {/* Approval Settings Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Approval Settings</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <label className="orderTypeCheckboxLabel">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                />
                <span>Requires Approval</span>
                <FieldTooltip
                  content="Orders of this type need approval before processing"
                  position="right"
                />
              </label>
            </div>

            {requiresApproval && (
              <div className="orderTypeFormColumn">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <label className="orderTypeInputLabel">Auto-Approve Below Quantity</label>
                  <FieldTooltip
                    content="Automatically approve orders below this quantity (optional)"
                    position="right"
                  />
                </div>
                <input
                  type="number"
                  value={autoApproveBelow}
                  onChange={(e) => setAutoApproveBelow(e.target.value)}
                  className="orderTypeFormInput"
                  placeholder="e.g., 100"
                  min={1}
                />
              </div>
            )}
          </div>
        </div>

        {/* Validation Rules Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Quantity Validation</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Minimum Quantity</label>
                <FieldTooltip
                  content="Minimum allowed quantity for orders of this type (optional)"
                  position="right"
                />
              </div>
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., 100"
                min={1}
              />
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Maximum Quantity</label>
                <FieldTooltip
                  content="Maximum allowed quantity for orders of this type (optional)"
                  position="right"
                />
              </div>
              <input
                type="number"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., 10000"
                min={1}
              />
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
          </div>
        </div>

        {/* Restrictions Configuration Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Restrictions
            <FieldTooltip
              content="Select which product types and material types can be used with this order type. If none selected, all are allowed."
              position="right"
            />
          </h3>

          {/* Allowed Product Types - Checkboxes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <label className="orderTypeInputLabel" style={{ margin: 0, fontWeight: 600 }}>Allowed Product Types</label>
              <FieldTooltip
                content="Check the product types that can be used with this order type. Unchecked items will not be available."
                position="right"
              />
              <span style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: allowedProductTypes.length === 0 ? '#10b981' : '#3b82f6',
                color: 'white',
                borderRadius: '0.25rem'
              }}>
                {allowedProductTypes.length === 0 ? 'All Allowed' : `${allowedProductTypes.length} Selected`}
              </span>
              {/* Select All / Clear All buttons */}
              <button
                type="button"
                onClick={() => {
                  if (productTypes?.length > 0) {
                    setAllowedProductTypes(productTypes.map((pt: any) => pt._id));
                  }
                }}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setAllowedProductTypes([])}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {productTypes?.length > 0 ? productTypes.map((pt: any) => (
                <label key={pt._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  backgroundColor: allowedProductTypes.includes(pt._id) ? '#dbeafe' : 'white',
                  borderRadius: '0.25rem',
                  border: allowedProductTypes.includes(pt._id) ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>
                  <input
                    type="checkbox"
                    checked={allowedProductTypes.includes(pt._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAllowedProductTypes([...allowedProductTypes, pt._id]);
                      } else {
                        setAllowedProductTypes(allowedProductTypes.filter(id => id !== pt._id));
                      }
                    }}
                    style={{ accentColor: '#FF6B35' }}
                  />
                  {pt.productTypeName || pt.name || pt.typeName}
                </label>
              )) : (
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>No product types available</span>
              )}
            </div>
          </div>

          {/* Allowed Material Types - Checkboxes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <label className="orderTypeInputLabel" style={{ margin: 0, fontWeight: 600 }}>Allowed Material Types</label>
              <FieldTooltip
                content="Check the material types that can be used with this order type. Unchecked items will not be available."
                position="right"
              />
              <span style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: allowedMaterialTypes.length === 0 ? '#10b981' : '#3b82f6',
                color: 'white',
                borderRadius: '0.25rem'
              }}>
                {allowedMaterialTypes.length === 0 ? 'All Allowed' : `${allowedMaterialTypes.length} Selected`}
              </span>
              {/* Select All / Clear All buttons */}
              <button
                type="button"
                onClick={() => {
                  if (materialTypes?.length > 0) {
                    setAllowedMaterialTypes(materialTypes.map((mt: any) => mt._id));
                  }
                }}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setAllowedMaterialTypes([])}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {materialTypes?.length > 0 ? materialTypes.map((mt: any) => (
                <label key={mt._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  backgroundColor: allowedMaterialTypes.includes(mt._id) ? '#dbeafe' : 'white',
                  borderRadius: '0.25rem',
                  border: allowedMaterialTypes.includes(mt._id) ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>
                  <input
                    type="checkbox"
                    checked={allowedMaterialTypes.includes(mt._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAllowedMaterialTypes([...allowedMaterialTypes, mt._id]);
                      } else {
                        setAllowedMaterialTypes(allowedMaterialTypes.filter(id => id !== mt._id));
                      }
                    }}
                    style={{ accentColor: '#FF6B35' }}
                  />
                  {mt.materialTypeName || mt.name || mt.typeName}
                </label>
              )) : (
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>No material types available</span>
              )}
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
