import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../store";
import { useFormDataCache } from "../../Edit/hooks/useFormDataCache";
import { getOrderFormDataIfNeeded } from "../../../../redux/oders/orderFormDataActions";
import { getOptionSpecs } from "../../../../redux/create/optionSpec/optionSpecActions";
import { createMachineTemplate, updateMachineTemplate } from "../../../../redux/machineTemplate/machineTemplateActions";
import { ChevronLeft, ChevronRight, Plus, Trash2, Eye, Save, Copy, Loader2, AlertTriangle, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import "./ViewTemplateWizard.css";

// Types
type ColumnDataType = 'text' | 'number' | 'formula' | 'dropdown' | 'boolean' | 'date' | 'image' | 'file' | 'audio';
type FormulaType = 'SUM' | 'AVERAGE' | 'COUNT' | 'MULTIPLY' | 'DIVIDE' | 'CUSTOM';

interface ColumnConfig {
  id: string;
  name: string;
  label: string;
  dataType: ColumnDataType;
  isRequired: boolean;
  isReadOnly: boolean;
  isVisible: boolean;
  order: number;
  width: number;
  unit?: string;
  // Formula config
  formula?: {
    type: FormulaType;
    expression: string;
    dependencies: string[];
  };
  // Dropdown config
  dropdownOptions?: { label: string; value: string }[];
  // Source config - where data comes from
  sourceType: 'manual' | 'order' | 'customer' | 'optionSpec' | 'calculated';
  sourceField?: string;
  // OptionSpec source fields
  optionTypeId?: string;
  optionTypeName?: string;
  optionSpecId?: string;  // NEW: Selected OptionSpec ID
  optionSpecName?: string; // NEW: Selected OptionSpec name
  specField?: string;
  specFieldUnit?: string;
}

interface CustomerFieldsConfig {
  showName: boolean;
  showAlias: boolean;
  showAddress: boolean;
  showOrderId: boolean;
  showOrderDate: boolean;
  showImage: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showQuantity: boolean;
  showInstructions: boolean;
}

interface TotalsConfig {
  columnName: string;
  formula: FormulaType;
  label: string;
}

// Display Item Config for Step 3 - Dynamic Display Builder
type DisplayItemType = 'text' | 'number' | 'formula' | 'boolean' | 'image';

interface DisplayItemConfig {
  id: string;
  label: string;
  displayType: DisplayItemType;
  sourceType: 'optionSpec' | 'order' | 'customer' | 'formula';
  // For optionSpec source
  optionTypeId?: string;
  optionTypeName?: string;
  optionSpecId?: string;
  optionSpecName?: string;
  specField?: string;
  unit?: string;
  // For formula
  formula?: {
    expression: string;
    dependencies: string[];
  };
  // For order/customer source
  sourceField?: string;
  order: number;
  isVisible: boolean;
}

interface ViewTemplateConfig {
  templateName: string;
  description: string;
  machineTypeId: string;
  machineId: string;
  orderTypeId: string;
  optionTypeIds: string[];
  columns: ColumnConfig[];
  customerFields: CustomerFieldsConfig;
  displayItems: DisplayItemConfig[];  // NEW: Dynamic display items for Step 3
  totalsConfig: TotalsConfig[];
  settings: {
    autoStartTime: boolean;
    autoEndTime: boolean;
    requireOperator: boolean;
    requireHelper: boolean;
    requireApproval: boolean;
    allowVoiceNote: boolean;
    allowImageUpload: boolean;
  };
}

// Default values
const defaultColumn: ColumnConfig = {
  id: '',
  name: '',
  label: '',
  dataType: 'text',
  isRequired: false,
  isReadOnly: false,
  isVisible: true,
  order: 0,
  width: 150,
  sourceType: 'manual'
};

const defaultCustomerFields: CustomerFieldsConfig = {
  showName: true,
  showAlias: true,
  showAddress: false,
  showOrderId: true,
  showOrderDate: true,
  showImage: true,
  showPhone: false,
  showEmail: false,
  showQuantity: true,
  showInstructions: true
};

const defaultSettings = {
  autoStartTime: true,
  autoEndTime: true,
  requireOperator: true,
  requireHelper: false,
  requireApproval: false,
  allowVoiceNote: true,
  allowImageUpload: true
};

// Predefined formula templates for common calculations
const formulaTemplates = [
  // Material formulas
  { name: 'Per Bag Gram (LLDPE)', expression: '(width * length * gauge) / 3300', description: 'For LLDPE material' },
  { name: 'Per Bag Gram (PP)', expression: '(width * length * gauge) / 3600', description: 'For PP material' },
  { name: 'Per Bag Gram (HM)', expression: '(width * length * gauge) / 3265', description: 'For HM material' },
  { name: 'No of Bags per KG', expression: '1000 / perBagGram', description: 'Calculate bags per kg' },

  // Weight calculations
  { name: 'Net Weight', expression: 'grossWt - coreWt', description: 'Gross - Core weight' },
  { name: 'Difference Qty', expression: 'targetQty - netWt', description: 'Remaining quantity' },
  { name: 'Percentage', expression: '(value / total) * 100', description: 'Calculate percentage' },

  // Size calculations
  { name: 'Roll Size (B/S)', expression: 'width', description: 'For Bottom Sealing' },
  { name: 'Roll Size (S/S)', expression: 'length', description: 'For Side Sealing' },
  { name: 'Garment Roll Size', expression: 'length + flap + gusset + innerLip', description: 'L + Flap + Gusset + Inner Lip' },
  { name: 'Per Piece Check Gauge', expression: '(width * gauge) / 100', description: 'Gauge check formula' },

  // Math operations
  { name: 'Addition', expression: 'a + b', description: 'Add two values' },
  { name: 'Subtraction', expression: 'a - b', description: 'Subtract two values' },
  { name: 'Multiplication', expression: 'a * b', description: 'Multiply two values' },
  { name: 'Division', expression: 'a / b', description: 'Divide two values' },

  { name: 'Custom', expression: '', description: 'Write your own formula' }
];

// Predefined column templates
const columnTemplates = [
  { name: 'Serial Number', dataType: 'number' as ColumnDataType, isReadOnly: true, sourceType: 'calculated' as const },
  { name: 'Gross Weight', dataType: 'number' as ColumnDataType, unit: 'kg', isRequired: true },
  { name: 'Core Weight', dataType: 'number' as ColumnDataType, unit: 'kg', isRequired: true },
  { name: 'Net Weight', dataType: 'formula' as ColumnDataType, unit: 'kg', isReadOnly: true, formula: { type: 'CUSTOM' as FormulaType, expression: 'grossWt - coreWt', dependencies: [] as string[] } },
  { name: 'Quality Grade', dataType: 'dropdown' as ColumnDataType, dropdownOptions: [{ label: 'A Grade', value: 'a' }, { label: 'B Grade', value: 'b' }, { label: 'Rejected', value: 'rejected' }] },
  { name: 'Gauge Check', dataType: 'boolean' as ColumnDataType },
  { name: 'Remarks', dataType: 'text' as ColumnDataType },
  { name: 'Production Date', dataType: 'date' as ColumnDataType },
  { name: 'Image/Photo', dataType: 'image' as ColumnDataType },
];

const ViewTemplateWizard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Use cached form data
  const { machineTypes, machines, orderTypes, optionTypes, loading, isReady } = useFormDataCache();

  // Load form data if not already present
  useEffect(() => {
    if (!isReady && !loading) {
      console.log('ViewTemplateWizard - Loading form data...');
      dispatch(getOrderFormDataIfNeeded());
    }
  }, [dispatch, isReady, loading]);

  // Debug: Log data availability
  useEffect(() => {
    console.log('ViewTemplateWizard - Data check:', {
      machineTypesCount: machineTypes.length,
      machinesCount: machines.length,
      orderTypesCount: orderTypes.length,
      optionTypesCount: optionTypes.length,
      loading,
      isReady,
      machineTypes,
      machines
    });

    // Debug: Check Order Types and their allowedOptionTypes
    if (orderTypes.length > 0) {
      console.log('📊 OrderTypes with allowedOptionTypes:');
      orderTypes.forEach((ot: any) => {
        console.log(`  - ${ot.typeName}:`, {
          _id: ot._id,
          allowedOptionTypes: ot.allowedOptionTypes,
          allowedCount: ot.allowedOptionTypes?.length || 0,
          firstOptionSpecs: ot.allowedOptionTypes?.[0]?.specifications
        });
      });
    }
  }, [machineTypes, machines, orderTypes, optionTypes, loading, isReady]);

  // Current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Template config state
  const [config, setConfig] = useState<ViewTemplateConfig>({
    templateName: '',
    description: '',
    machineTypeId: '',
    machineId: '',
    orderTypeId: '',
    optionTypeIds: [],
    columns: [{ ...defaultColumn, id: `col_${Date.now()}`, order: 0 }],
    customerFields: defaultCustomerFields,
    displayItems: [],  // Dynamic display items for Step 3
    totalsConfig: [],
    settings: defaultSettings
  });

  // UI state
  const [expandedColumn, setExpandedColumn] = useState<number | null>(0);
  const [showFormulaHelper, setShowFormulaHelper] = useState(false);
  const [selectedFormulaColumn, setSelectedFormulaColumn] = useState<number | null>(null);
  const [existingTemplates, setExistingTemplates] = useState<any[]>([]);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Rule: One Order Type = One View Template per Machine
  const [existingTemplateForOrderType, setExistingTemplateForOrderType] = useState<any>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [checkingExistingTemplate, setCheckingExistingTemplate] = useState(false);

  // OptionSpecs state - grouped by OptionType ID
  const [optionSpecsByType, setOptionSpecsByType] = useState<Record<string, any[]>>({});
  const [loadingOptionSpecs, setLoadingOptionSpecs] = useState<Record<string, boolean>>({});

  // Edit Sections View mode - for editing existing templates in sections
  const [showEditSectionsView, setShowEditSectionsView] = useState(false);
  const [expandedEditSection, setExpandedEditSection] = useState<'display' | 'columns' | 'totals' | null>(null);
  const [savingSectionName, setSavingSectionName] = useState<string | null>(null);

  // Fetch OptionSpecs for an OptionType
  const fetchOptionSpecsForType = useCallback(async (optionTypeId: string) => {
    if (optionSpecsByType[optionTypeId] || loadingOptionSpecs[optionTypeId]) {
      return; // Already loaded or loading
    }

    setLoadingOptionSpecs(prev => ({ ...prev, [optionTypeId]: true }));

    try {
      const result = await dispatch(getOptionSpecs({ optionTypeId }));
      console.log(`📦 OptionSpecs for ${optionTypeId}:`, result);
      setOptionSpecsByType(prev => ({ ...prev, [optionTypeId]: result || [] }));
    } catch (error) {
      console.error(`Error fetching OptionSpecs for ${optionTypeId}:`, error);
      setOptionSpecsByType(prev => ({ ...prev, [optionTypeId]: [] }));
    } finally {
      setLoadingOptionSpecs(prev => ({ ...prev, [optionTypeId]: false }));
    }
  }, [dispatch, optionSpecsByType, loadingOptionSpecs]);

  // Check for existing template when Machine + OrderType is selected
  // Rule: One Order Type = One View Template per Machine
  const checkExistingTemplate = useCallback(async (machineId: string, orderTypeId: string) => {
    if (!machineId || !orderTypeId) {
      setExistingTemplateForOrderType(null);
      setIsEditingExisting(false);
      return;
    }

    setCheckingExistingTemplate(true);
    try {
      // TODO: Call API to check if template exists for this machine + orderType
      // const response = await dispatch(getViewTemplate({ machineId, orderTypeId }));
      // For now, check in existingTemplates array
      const existing = existingTemplates.find(
        (t: any) => t.machineId === machineId && t.orderTypeId === orderTypeId
      );

      if (existing) {
        setExistingTemplateForOrderType(existing);
        setIsEditingExisting(true);
        // Auto-load existing template config
        setConfig(prev => ({
          ...prev,
          templateName: existing.templateName || '',
          description: existing.description || '',
          optionTypeIds: existing.optionTypeIds || [],
          columns: existing.columns || prev.columns,
          customerFields: existing.customerFields || prev.customerFields,
          displayItems: existing.displayItems || [],
          totalsConfig: existing.totalsConfig || [],
          settings: existing.settings || prev.settings
        }));
        console.log('📋 Existing template found, loading for edit:', existing);
      } else {
        setExistingTemplateForOrderType(null);
        setIsEditingExisting(false);
      }
    } catch (error) {
      console.error('Error checking existing template:', error);
      setExistingTemplateForOrderType(null);
      setIsEditingExisting(false);
    } finally {
      setCheckingExistingTemplate(false);
    }
  }, [existingTemplates]);

  // Filter machines by selected machine type
  const filteredMachines = config.machineTypeId
    ? machines.filter((m: any) => {
        // Machine has machineType as populated object with _id
        // Convert to string for comparison since MongoDB ObjectId may not match string directly
        const machineTypeId = m.machineType?._id?.toString?.() || m.machineType?._id || m.machineType?.toString?.() || m.machineType || m.machineTypeId;
        const selectedId = config.machineTypeId;
        const isMatch = String(machineTypeId) === String(selectedId);
        return isMatch;
      })
    : machines;

  // Generate unique ID
  const generateId = () => `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Update config helper
  const updateConfig = (field: keyof ViewTemplateConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Column operations
  const addColumn = () => {
    const newColumn: ColumnConfig = {
      ...defaultColumn,
      id: generateId(),
      order: config.columns.length
    };
    setConfig(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn]
    }));
    setExpandedColumn(config.columns.length);
  };

  const removeColumn = (index: number) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index).map((col, i) => ({ ...col, order: i }))
    }));
    setExpandedColumn(null);
  };

  const updateColumn = (index: number, field: keyof ColumnConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === index ? { ...col, [field]: value } : col
      )
    }));
  };

  const duplicateColumn = (index: number) => {
    const columnToCopy = config.columns[index];
    const newColumn: ColumnConfig = {
      ...columnToCopy,
      id: generateId(),
      name: `${columnToCopy.name}_copy`,
      label: `${columnToCopy.label} (Copy)`,
      order: config.columns.length
    };
    setConfig(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn]
    }));
  };

  // Totals operations
  const addTotal = () => {
    setConfig(prev => ({
      ...prev,
      totalsConfig: [...prev.totalsConfig, { columnName: '', formula: 'SUM', label: '' }]
    }));
  };

  const removeTotal = (index: number) => {
    setConfig(prev => ({
      ...prev,
      totalsConfig: prev.totalsConfig.filter((_, i) => i !== index)
    }));
  };

  const updateTotal = (index: number, field: keyof TotalsConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      totalsConfig: prev.totalsConfig.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  // Display Item operations (Step 3 - Display Builder)
  const addDisplayItem = () => {
    const newItem: DisplayItemConfig = {
      id: `display_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: '',
      displayType: 'text',
      sourceType: 'optionSpec',
      order: config.displayItems.length,
      isVisible: true
    };
    setConfig(prev => ({
      ...prev,
      displayItems: [...prev.displayItems, newItem]
    }));
  };

  const removeDisplayItem = (index: number) => {
    setConfig(prev => ({
      ...prev,
      displayItems: prev.displayItems.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i }))
    }));
  };

  const updateDisplayItem = (index: number, field: keyof DisplayItemConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      displayItems: prev.displayItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Apply formula template
  const applyFormulaTemplate = (template: typeof formulaTemplates[0], columnIndex: number) => {
    updateColumn(columnIndex, 'formula', {
      type: template.name === 'Custom' ? 'CUSTOM' : 'CUSTOM',
      expression: template.expression,
      dependencies: []
    });
    updateColumn(columnIndex, 'dataType', 'formula');
    updateColumn(columnIndex, 'isReadOnly', true);
    setShowFormulaHelper(false);
  };

  // Copy from existing template
  const copyFromTemplate = (template: any) => {
    setConfig(prev => ({
      ...prev,
      columns: template.columns || prev.columns,
      customerFields: template.customerFields || prev.customerFields,
      displayItems: template.displayItems || prev.displayItems,
      totalsConfig: template.totalsConfig || prev.totalsConfig,
      settings: template.settings || prev.settings
    }));
    setShowCopyModal(false);
  };

  // Validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!config.machineTypeId && !!config.machineId;
      case 2:
        return !!config.orderTypeId;
      case 3:
        return true; // Customer fields are optional
      case 4:
        return config.columns.length > 0 && config.columns.some(col => col.name.trim());
      case 5:
        return !!config.templateName.trim();
      default:
        return false;
    }
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Save template
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!isStepValid(5)) {
      alert('Please fill in all required fields');
      return;
    }

    if (!config.machineId) {
      alert('Please select a machine');
      return;
    }

    setIsSaving(true);
    try {
      // Rule: One Order Type = One View Template per Machine
      // If editing existing, update it. Otherwise, create new.
      if (isEditingExisting && existingTemplateForOrderType?._id) {
        console.log('Updating existing template:', existingTemplateForOrderType._id, config);
        await dispatch(updateMachineTemplate(existingTemplateForOrderType._id, config));
        alert('Template updated successfully!');
      } else {
        console.log('Creating new template:', config);
        await dispatch(createMachineTemplate(config));
        alert('Template saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(error.message || 'Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save individual section (for Edit Sections View)
  const handleSaveSection = async (section: 'display' | 'columns' | 'totals') => {
    if (!existingTemplateForOrderType?._id) {
      alert('No template to update. Please save the template first.');
      return;
    }

    setSavingSectionName(section);
    try {
      const sectionData = section === 'display' ? { displayItems: config.displayItems } :
                          section === 'columns' ? { columns: config.columns } :
                          { totalsConfig: config.totalsConfig };

      console.log(`Saving ${section} section:`, {
        templateId: existingTemplateForOrderType._id,
        section,
        data: sectionData
      });

      // Update the template with the section data
      await dispatch(updateMachineTemplate(existingTemplateForOrderType._id, {
        ...config,
        ...sectionData
      }));

      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} section saved successfully!`);
    } catch (error: any) {
      console.error('Error saving section:', error);
      alert(error.message || `Failed to save ${section} section. Please try again.`);
    } finally {
      setSavingSectionName(null);
    }
  };

  // Toggle section expansion in Edit Sections View
  const toggleEditSection = (section: 'display' | 'columns' | 'totals') => {
    setExpandedEditSection(prev => prev === section ? null : section);
  };

  // Get numeric columns for totals
  const numericColumns = config.columns.filter(col =>
    col.dataType === 'number' || col.dataType === 'formula'
  );

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="viewTemplateWizard-steps">
      {[1, 2, 3, 4, 5].map(step => (
        <div
          key={step}
          className={`viewTemplateWizard-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
          onClick={() => isStepValid(step - 1) || step < currentStep ? setCurrentStep(step) : null}
        >
          <div className="viewTemplateWizard-stepNumber">{step}</div>
          <div className="viewTemplateWizard-stepLabel">
            {step === 1 && 'Machine'}
            {step === 2 && 'Order Type'}
            {step === 3 && 'Display'}
            {step === 4 && 'Columns'}
            {step === 5 && 'Save'}
          </div>
        </div>
      ))}
    </div>
  );

  // Step 1: Machine Selection
  const renderStep1 = () => (
    <div className="viewTemplateWizard-stepContent">
      <h3>Step 1: Select Machine</h3>
      <p className="viewTemplateWizard-stepDesc">Choose the machine type and specific machine for this template</p>

      {loading && (
        <div className="viewTemplateWizard-loading">Loading data...</div>
      )}

      <div className="viewTemplateWizard-formGroup">
        <label>Machine Type * ({machineTypes.length} types)</label>
        <select
          value={config.machineTypeId}
          onChange={(e) => {
            const selectedTypeId = e.target.value;
            console.log('Machine Type Selected:', selectedTypeId);
            console.log('All machines count:', machines.length);
            console.log('First machine structure:', machines[0]);
            const filtered = machines.filter((m: any) => {
              const machineTypeId = m.machineType?._id?.toString?.() || m.machineType?._id || m.machineType?.toString?.() || m.machineType || m.machineTypeId;
              const isMatch = String(machineTypeId) === String(selectedTypeId);
              console.log('Machine:', m.machineName, 'TypeId:', machineTypeId, 'Selected:', selectedTypeId, 'Match:', isMatch);
              return isMatch;
            });
            console.log('Filtered machines count:', filtered.length);
            updateConfig('machineTypeId', selectedTypeId);
            updateConfig('machineId', ''); // Reset machine when type changes
          }}
          disabled={loading}
        >
          <option value="">Select Machine Type</option>
          {machineTypes.map((mt: any) => (
            <option key={mt._id} value={mt._id}>{mt.machineTypeName || mt.type}</option>
          ))}
        </select>
      </div>

      <div className="viewTemplateWizard-formGroup">
        <label>Machine * ({filteredMachines.length} available)</label>
        <select
          value={config.machineId}
          onChange={(e) => updateConfig('machineId', e.target.value)}
          disabled={!config.machineTypeId || loading}
        >
          <option value="">Select Machine</option>
          {filteredMachines.map((m: any) => (
            <option key={m._id} value={m._id}>
              {m.machineName}
            </option>
          ))}
        </select>
        {config.machineTypeId && filteredMachines.length === 0 && !loading && (
          <p className="viewTemplateWizard-hint">
            No machines found for this type.
            {machines.filter((m: any) => !m.machineType).length > 0 && (
              <> ({machines.filter((m: any) => !m.machineType).length} machines have no type assigned)</>
            )}
          </p>
        )}
      </div>
    </div>
  );

  // Get selected order type's allowed option types
  const selectedOrderType = orderTypes.find((ot: any) => ot._id === config.orderTypeId);
  const allowedOptionTypes = selectedOrderType?.allowedOptionTypes || [];

  // Step 2: Order Type Selection
  const renderStep2 = () => (
    <div className="viewTemplateWizard-stepContent">
      <h3>Step 2: Select Order Type & Option Types</h3>
      <p className="viewTemplateWizard-stepDesc">Choose which order type and option types to use for this template</p>

      <div className="viewTemplateWizard-formGroup">
        <label>Order Type *</label>
        <select
          value={config.orderTypeId}
          onChange={(e) => {
            updateConfig('orderTypeId', e.target.value);
            updateConfig('optionTypeIds', []); // Reset option types when order type changes
            // Check for existing template - Rule: One Order Type = One View Template
            if (config.machineId && e.target.value) {
              checkExistingTemplate(config.machineId, e.target.value);
            }
          }}
        >
          <option value="">Select Order Type</option>
          {orderTypes.map((ot: any) => (
            <option key={ot._id} value={ot._id}>{ot.typeName}</option>
          ))}
        </select>
      </div>

      {/* Warning: Existing Template Found - One Order Type = One Template Rule */}
      {checkingExistingTemplate && (
        <div className="viewTemplateWizard-info">
          <Loader2 size={16} className="spinning" /> Checking for existing template...
        </div>
      )}
      {existingTemplateForOrderType && !checkingExistingTemplate && (
        <div className="viewTemplateWizard-warning existingTemplate">
          <AlertTriangle size={18} />
          <div>
            <strong>Template already exists for this Order Type!</strong>
            <p>
              A template "{existingTemplateForOrderType.templateName}" was found for this Machine + Order Type combination.
              <br />
              <strong>Rule:</strong> Each Order Type can have only ONE view template per machine.
              <br />
              You are now editing the existing template. Changes will update this template.
            </p>
          </div>
        </div>
      )}

      {config.orderTypeId && (
        <div className="viewTemplateWizard-section">
          <h4>Available Option Types</h4>
          <p className="viewTemplateWizard-hint">
            Select option types to load their OptionSpecs and use specifications as column data sources
          </p>

          {allowedOptionTypes.length === 0 ? (
            <div className="viewTemplateWizard-emptyState">
              No option types configured for this order type.
            </div>
          ) : (
            <div className="viewTemplateWizard-optionTypesList">
              {allowedOptionTypes.map((opt: any) => {
                const isSelected = config.optionTypeIds.includes(opt._id);
                const isLoading = loadingOptionSpecs[opt._id];
                const optionSpecs = optionSpecsByType[opt._id] || [];

                return (
                  <div key={opt._id} className={`viewTemplateWizard-optionTypeCard ${isSelected ? 'selected' : ''}`}>
                    <label className="viewTemplateWizard-optionTypeHeader">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateConfig('optionTypeIds', [...config.optionTypeIds, opt._id]);
                            // Fetch OptionSpecs for this OptionType
                            fetchOptionSpecsForType(opt._id);
                          } else {
                            updateConfig('optionTypeIds', config.optionTypeIds.filter((id: string) => id !== opt._id));
                          }
                        }}
                      />
                      <span className="viewTemplateWizard-optionTypeName">{opt.name}</span>
                      {opt.category && (
                        <span className="viewTemplateWizard-optionTypeCategory">{opt.category}</span>
                      )}
                    </label>

                    {/* Show loading indicator */}
                    {isLoading && (
                      <div className="viewTemplateWizard-loading">
                        <Loader2 size={16} className="spinning" /> Loading OptionSpecs...
                      </div>
                    )}

                    {/* Show OptionSpecs with their specifications */}
                    {isSelected && !isLoading && optionSpecs.length > 0 && (
                      <div className="viewTemplateWizard-optionSpecsList">
                        <span className="viewTemplateWizard-specsLabel">OptionSpecs ({optionSpecs.length}):</span>
                        {optionSpecs.map((spec: any) => (
                          <div key={spec._id} className="viewTemplateWizard-optionSpecItem">
                            <span className="viewTemplateWizard-optionSpecName">{spec.name}</span>
                            <span className="viewTemplateWizard-optionSpecCode">{spec.code}</span>
                            {spec.specifications && spec.specifications.length > 0 && (
                              <div className="viewTemplateWizard-specsTags">
                                {spec.specifications.slice(0, 5).map((s: any, idx: number) => (
                                  <span key={idx} className="viewTemplateWizard-specTag">
                                    {s.name}
                                    {s.unit && <small> ({s.unit})</small>}
                                    <span className="viewTemplateWizard-specType">{s.dataType}</span>
                                  </span>
                                ))}
                                {spec.specifications.length > 5 && (
                                  <span className="viewTemplateWizard-specTag more">
                                    +{spec.specifications.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No OptionSpecs found */}
                    {isSelected && !isLoading && optionSpecs.length === 0 && (
                      <div className="viewTemplateWizard-emptySpecs">
                        No OptionSpecs found for this type. Create OptionSpecs first.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {config.optionTypeIds.length > 0 && (
        <div className="viewTemplateWizard-selectedSummary">
          <strong>Selected: </strong>
          {config.optionTypeIds.map((id: string) => {
            const opt = allowedOptionTypes.find((o: any) => o._id === id);
            return opt?.name;
          }).filter(Boolean).join(', ')}
        </div>
      )}
    </div>
  );

  // Step 3: Specification Display Items
  const renderStep3 = () => (
    <div className="viewTemplateWizard-stepContent">
      <h3>Step 3: Specification Display Items</h3>
      <p className="viewTemplateWizard-stepDesc">Configure what specification values to show operators in the info section</p>

      {/* Specification Display Items Builder */}
      <div className="viewTemplateWizard-section">
        <div className="viewTemplateWizard-sectionHeader">
          <h4>Specification Display Items</h4>
          <button
            type="button"
            className="viewTemplateWizard-smallBtn"
            onClick={addDisplayItem}
            disabled={config.optionTypeIds.length === 0}
          >
            <Plus size={14} /> Add Display Item
          </button>
        </div>

        {config.optionTypeIds.length === 0 ? (
          <p className="viewTemplateWizard-hint">
            Please select Option Types in Step 2 first to add display items.
          </p>
        ) : config.displayItems.length === 0 ? (
          <p className="viewTemplateWizard-hint">
            Add display items to show specification values (gauge, width, images, etc.) in the operator info section.
          </p>
        ) : (
          <div className="viewTemplateWizard-displayItems">
            {config.displayItems.map((item, index) => (
              <div key={item.id} className="viewTemplateWizard-displayItem">
                <div className="viewTemplateWizard-displayItemHeader">
                  <span className="viewTemplateWizard-displayItemNum">{index + 1}</span>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateDisplayItem(index, 'label', e.target.value)}
                    placeholder="Display Label"
                    className="viewTemplateWizard-displayItemLabel"
                  />
                  <button
                    type="button"
                    className="viewTemplateWizard-iconBtn danger"
                    onClick={() => removeDisplayItem(index)}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="viewTemplateWizard-displayItemBody">
                  <div className="viewTemplateWizard-formRow">
                    {/* Display Type */}
                    <div className="viewTemplateWizard-formGroup">
                      <label>Display Type</label>
                      <select
                        value={item.displayType}
                        onChange={(e) => updateDisplayItem(index, 'displayType', e.target.value as DisplayItemType)}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="formula">Formula</option>
                        <option value="boolean">Yes/No</option>
                        <option value="image">Image</option>
                      </select>
                    </div>

                    {/* Data Source */}
                    <div className="viewTemplateWizard-formGroup">
                      <label>Data Source</label>
                      <select
                        value={item.sourceType}
                        onChange={(e) => {
                          updateDisplayItem(index, 'sourceType', e.target.value);
                          // Reset related fields
                          updateDisplayItem(index, 'optionTypeId', undefined);
                          updateDisplayItem(index, 'optionSpecId', undefined);
                          updateDisplayItem(index, 'specField', undefined);
                          updateDisplayItem(index, 'sourceField', undefined);
                        }}
                      >
                        <option value="optionSpec">From Option Specification</option>
                        <option value="customer">From Customer</option>
                      </select>
                    </div>

                    {/* Unit (for number type) */}
                    {item.displayType === 'number' && (
                      <div className="viewTemplateWizard-formGroup">
                        <label>Unit</label>
                        <input
                          type="text"
                          value={item.unit || ''}
                          onChange={(e) => updateDisplayItem(index, 'unit', e.target.value)}
                          placeholder="e.g., mm, kg"
                        />
                      </div>
                    )}
                  </div>

                  {/* OptionSpec Source Configuration */}
                  {item.sourceType === 'optionSpec' && (
                    <>
                    <div className="viewTemplateWizard-formRow">
                      {/* Option Type */}
                      <div className="viewTemplateWizard-formGroup">
                        <label>Option Type</label>
                        <select
                          value={item.optionTypeId || ''}
                          onChange={(e) => {
                            const selectedOptType = allowedOptionTypes.find((o: any) => o._id === e.target.value);
                            updateDisplayItem(index, 'optionTypeId', e.target.value);
                            updateDisplayItem(index, 'optionTypeName', selectedOptType?.name || '');
                            updateDisplayItem(index, 'optionSpecId', '');
                            updateDisplayItem(index, 'specField', '');
                          }}
                        >
                          <option value="">Select Option Type</option>
                          {allowedOptionTypes
                            .filter((opt: any) => config.optionTypeIds.includes(opt._id))
                            .map((opt: any) => (
                              <option key={opt._id} value={opt._id}>{opt.name}</option>
                            ))}
                        </select>
                      </div>

                      {/* Option Spec */}
                      <div className="viewTemplateWizard-formGroup">
                        <label>Option Spec</label>
                        <select
                          value={item.optionSpecId || ''}
                          onChange={(e) => {
                            const optionSpecs = optionSpecsByType[item.optionTypeId || ''] || [];
                            const selectedSpec = optionSpecs.find((s: any) => s._id === e.target.value);
                            updateDisplayItem(index, 'optionSpecId', e.target.value);
                            updateDisplayItem(index, 'optionSpecName', selectedSpec?.name || '');
                            updateDisplayItem(index, 'specField', '');
                          }}
                          disabled={!item.optionTypeId}
                        >
                          <option value="">Select Option Spec</option>
                          {item.optionTypeId && (optionSpecsByType[item.optionTypeId] || []).map((spec: any) => (
                            <option key={spec._id} value={spec._id}>
                              {spec.name} ({spec.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Spec Field - show for non-formula types OR when not using formula mode */}
                      {item.displayType !== 'formula' && !item.formula?.expression && (
                        <div className="viewTemplateWizard-formGroup">
                          <label>Spec Field</label>
                          <select
                            value={item.specField || ''}
                            onChange={(e) => {
                              const optionSpecs = optionSpecsByType[item.optionTypeId || ''] || [];
                              const selectedOptionSpec = optionSpecs.find((s: any) => s._id === item.optionSpecId);
                              const selectedSpec = selectedOptionSpec?.specifications?.find((s: any) => s.name === e.target.value);

                              updateDisplayItem(index, 'specField', e.target.value);
                              if (selectedSpec?.unit) {
                                updateDisplayItem(index, 'unit', selectedSpec.unit);
                              }
                              // Auto-set label if empty
                              if (!item.label && e.target.value) {
                                updateDisplayItem(index, 'label', e.target.value);
                              }
                              // Auto-set displayType based on spec dataType
                              if (selectedSpec?.dataType) {
                                const typeMap: Record<string, DisplayItemType> = {
                                  'string': 'text',
                                  'number': 'number',
                                  'boolean': 'boolean',
                                  'file': 'image',
                                  'link': 'text'
                                };
                                updateDisplayItem(index, 'displayType', typeMap[selectedSpec.dataType] || 'text');
                              }
                            }}
                            disabled={!item.optionSpecId}
                          >
                            <option value="">Select Spec Field</option>
                            {item.optionSpecId && (() => {
                              const optionSpecs = optionSpecsByType[item.optionTypeId || ''] || [];
                              const selectedOptionSpec = optionSpecs.find((s: any) => s._id === item.optionSpecId);
                              return selectedOptionSpec?.specifications?.map((spec: any, idx: number) => (
                                <option key={idx} value={spec.name}>
                                  {spec.name} {spec.unit ? `(${spec.unit})` : ''} - {spec.dataType}
                                </option>
                              )) || null;
                            })()}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Use Formula Toggle - for number display type */}
                    {(item.displayType === 'number' || item.displayType === 'formula') && (
                      <div className="viewTemplateWizard-formulaToggle">
                        <label className="viewTemplateWizard-checkbox">
                          <input
                            type="checkbox"
                            checked={item.displayType === 'formula' || !!item.formula?.expression}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateDisplayItem(index, 'displayType', 'formula');
                                updateDisplayItem(index, 'specField', undefined);
                              } else {
                                updateDisplayItem(index, 'displayType', 'number');
                                updateDisplayItem(index, 'formula', undefined);
                              }
                            }}
                          />
                          Use Formula (combine multiple spec fields)
                        </label>
                      </div>
                    )}

                    {/* Formula Builder - when formula type or checkbox checked */}
                    {(item.displayType === 'formula' || item.formula?.expression) && item.sourceType === 'optionSpec' && (
                      <div className="viewTemplateWizard-formulaBuilder">
                        <div className="viewTemplateWizard-formGroup" style={{ flex: 1 }}>
                          <label>Formula Expression</label>
                          <input
                            type="text"
                            value={item.formula?.expression || ''}
                            onChange={(e) => updateDisplayItem(index, 'formula', {
                              expression: e.target.value,
                              dependencies: []
                            })}
                            placeholder="e.g., (gauge * width * length) / 3300"
                            className="viewTemplateWizard-formulaInput"
                          />
                        </div>

                        {/* Available Spec Fields for Formula */}
                        <div className="viewTemplateWizard-formulaFields">
                          <label>Available Spec Fields (click to add):</label>
                          <div className="viewTemplateWizard-fieldsList">
                            {config.optionTypeIds.map((typeId: string) => {
                              const optType = allowedOptionTypes.find((o: any) => o._id === typeId);
                              const optionSpecs = optionSpecsByType[typeId] || [];

                              return optionSpecs.flatMap((optSpec: any) =>
                                optSpec.specifications
                                  ?.filter((s: any) => s.dataType === 'number')
                                  .map((spec: any, idx: number) => (
                                    <button
                                      key={`${optSpec._id}-${idx}`}
                                      type="button"
                                      className="viewTemplateWizard-fieldBtn spec"
                                      onClick={() => {
                                        const fieldRef = spec.name;
                                        const currentExpr = item.formula?.expression || '';
                                        updateDisplayItem(index, 'formula', {
                                          expression: currentExpr + fieldRef,
                                          dependencies: [...(item.formula?.dependencies || []), fieldRef]
                                        });
                                      }}
                                      title={`${optType?.name || 'Unknown'} - ${spec.name}`}
                                    >
                                      {spec.name}
                                      {spec.unit && <small> ({spec.unit})</small>}
                                      <span className="viewTemplateWizard-fieldType">{optType?.name}</span>
                                    </button>
                                  )) || []
                              );
                            })}

                          </div>
                        </div>
                      </div>
                    )}
                    </>
                  )}

                  {/* Customer Source */}
                  {item.sourceType === 'customer' && (
                    <div className="viewTemplateWizard-formRow">
                      <div className="viewTemplateWizard-formGroup">
                        <label>Customer Field</label>
                        <select
                          value={item.sourceField || ''}
                          onChange={(e) => {
                            updateDisplayItem(index, 'sourceField', e.target.value);
                            if (!item.label && e.target.value) {
                              updateDisplayItem(index, 'label', e.target.value.split('.').pop() || '');
                            }
                          }}
                        >
                          <option value="">Select Field</option>
                          <option value="customer.name">Customer Name</option>
                          <option value="customer.company">Company Name</option>
                          <option value="customer.phone">Phone</option>
                          <option value="customer.email">Email</option>
                          <option value="customer.address">Address</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  {item.specField && item.sourceType === 'optionSpec' && (
                    <div className="viewTemplateWizard-displayItemPreview">
                      <strong>Source:</strong> {item.optionTypeName} → {item.optionSpecName}.{item.specField}
                      {item.unit && <span className="unit"> ({item.unit})</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Step 4: Column Builder
  const renderStep4 = () => (
    <div className="viewTemplateWizard-stepContent">
      <h3>Step 4: Configure Table Columns</h3>
      <p className="viewTemplateWizard-stepDesc">Define the columns for data entry</p>

      <div className="viewTemplateWizard-columnActions">
        <button type="button" className="viewTemplateWizard-addBtn" onClick={addColumn}>
          <Plus size={16} /> Add Column
        </button>
        <button type="button" className="viewTemplateWizard-copyBtn" onClick={() => setShowCopyModal(true)}>
          <Copy size={16} /> Copy from Template
        </button>
      </div>

      {/* Quick Add Column Templates */}
      <div className="viewTemplateWizard-quickAdd">
        <span>Quick Add:</span>
        {columnTemplates.map((tpl, idx) => (
          <button
            key={idx}
            type="button"
            className="viewTemplateWizard-quickBtn"
            onClick={() => {
              const newColumn: ColumnConfig = {
                ...defaultColumn,
                id: generateId(),
                name: tpl.name.toLowerCase().replace(/\s+/g, ''),
                label: tpl.name,
                dataType: tpl.dataType,
                isReadOnly: tpl.isReadOnly || false,
                isRequired: tpl.isRequired || false,
                unit: tpl.unit,
                formula: tpl.formula,
                dropdownOptions: tpl.dropdownOptions,
                sourceType: tpl.sourceType || 'manual',
                order: config.columns.length
              };
              setConfig(prev => ({
                ...prev,
                columns: [...prev.columns, newColumn]
              }));
            }}
          >
            {tpl.name}
          </button>
        ))}
      </div>

      <div className="viewTemplateWizard-columns">
        {config.columns.map((col, index) => (
          <div key={col.id} className="viewTemplateWizard-columnItem">
            <div
              className="viewTemplateWizard-columnHeader"
              onClick={() => setExpandedColumn(expandedColumn === index ? null : index)}
            >
              <span className="viewTemplateWizard-columnName">
                {col.label || col.name || `Column ${index + 1}`}
              </span>
              <div className="viewTemplateWizard-columnMeta">
                <span className="viewTemplateWizard-columnType">{col.dataType}</span>
                {col.isRequired && <span className="viewTemplateWizard-required">Required</span>}
                <button
                  type="button"
                  className="viewTemplateWizard-iconBtn"
                  onClick={(e) => { e.stopPropagation(); duplicateColumn(index); }}
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                {config.columns.length > 1 && (
                  <button
                    type="button"
                    className="viewTemplateWizard-iconBtn danger"
                    onClick={(e) => { e.stopPropagation(); removeColumn(index); }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {expandedColumn === index && (
              <div className="viewTemplateWizard-columnBody">
                <div className="viewTemplateWizard-formRow">
                  <div className="viewTemplateWizard-formGroup">
                    <label>Column Name *</label>
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                      placeholder="e.g., grossWeight"
                    />
                  </div>
                  <div className="viewTemplateWizard-formGroup">
                    <label>Display Label</label>
                    <input
                      type="text"
                      value={col.label}
                      onChange={(e) => updateColumn(index, 'label', e.target.value)}
                      placeholder="e.g., Gross Weight"
                    />
                  </div>
                </div>

                <div className="viewTemplateWizard-formRow">
                  <div className="viewTemplateWizard-formGroup">
                    <label>Data Type</label>
                    <select
                      value={col.dataType}
                      onChange={(e) => updateColumn(index, 'dataType', e.target.value as ColumnDataType)}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="formula">Formula (Auto-calculated)</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="boolean">Yes/No</option>
                      <option value="date">Date</option>
                      <option value="image">Image/Photo</option>
                      <option value="audio">Voice Note/Audio</option>
                      <option value="file">File</option>
                    </select>
                  </div>
                  <div className="viewTemplateWizard-formGroup">
                    <label>Unit</label>
                    <input
                      type="text"
                      value={col.unit || ''}
                      onChange={(e) => updateColumn(index, 'unit', e.target.value)}
                      placeholder="e.g., kg, g, mm"
                    />
                  </div>
                  <div className="viewTemplateWizard-formGroup">
                    <label>Width (px)</label>
                    <input
                      type="number"
                      value={col.width}
                      onChange={(e) => updateColumn(index, 'width', parseInt(e.target.value) || 150)}
                      min="50"
                      max="500"
                    />
                  </div>
                </div>

                {/* Formula configuration */}
                {col.dataType === 'formula' && (
                  <div className="viewTemplateWizard-formulaSection">
                    <div className="viewTemplateWizard-formGroup">
                      <label>Formula Expression</label>
                      <div className="viewTemplateWizard-formulaInput">
                        <input
                          type="text"
                          value={col.formula?.expression || ''}
                          onChange={(e) => updateColumn(index, 'formula', {
                            ...col.formula,
                            type: 'CUSTOM',
                            expression: e.target.value
                          })}
                          placeholder="e.g., (Material.gauge * Product.width) / 3300"
                        />
                        <button
                          type="button"
                          className="viewTemplateWizard-helpBtn"
                          onClick={() => {
                            setSelectedFormulaColumn(index);
                            setShowFormulaHelper(true);
                          }}
                        >
                          Templates
                        </button>
                      </div>
                    </div>

                    {/* Available fields for formula */}
                    <div className="viewTemplateWizard-formulaFields">
                      <label>Available Fields:</label>
                      <div className="viewTemplateWizard-fieldsList">
                        {/* Manual columns */}
                        {config.columns.filter(c => c.name && c.id !== col.id && c.dataType !== 'formula').length > 0 && (
                          <div className="viewTemplateWizard-fieldsGroup">
                            <span className="viewTemplateWizard-fieldsGroupLabel">Manual Columns:</span>
                            {config.columns
                              .filter(c => c.name && c.id !== col.id && c.dataType !== 'formula')
                              .map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  className="viewTemplateWizard-fieldBtn"
                                  onClick={() => {
                                    const currentExpr = col.formula?.expression || '';
                                    updateColumn(index, 'formula', {
                                      ...col.formula,
                                      type: 'CUSTOM',
                                      expression: currentExpr + c.name
                                    });
                                  }}
                                >
                                  {c.name}
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Option Spec fields from loaded OptionSpecs */}
                        {config.optionTypeIds.length > 0 && (
                          <div className="viewTemplateWizard-fieldsGroup">
                            <span className="viewTemplateWizard-fieldsGroupLabel">Option Specs:</span>
                            {config.optionTypeIds.map((typeId: string) => {
                              const optType = allowedOptionTypes.find((o: any) => o._id === typeId);
                              const optionSpecs = optionSpecsByType[typeId] || [];

                              return optionSpecs.flatMap((optSpec: any) =>
                                optSpec.specifications
                                  ?.filter((s: any) => s.dataType === 'number')
                                  .map((spec: any, idx: number) => (
                                    <button
                                      key={`${optSpec._id}-${idx}`}
                                      type="button"
                                      className="viewTemplateWizard-fieldBtn spec"
                                      onClick={() => {
                                        const fieldRef = `${optType?.name || 'Unknown'}.${spec.name}`;
                                        const currentExpr = col.formula?.expression || '';
                                        updateColumn(index, 'formula', {
                                          ...col.formula,
                                          type: 'CUSTOM',
                                          expression: currentExpr + fieldRef
                                        });
                                      }}
                                    >
                                      {optType?.name}.{spec.name}
                                    </button>
                                  )) || []
                              );
                            })}
                          </div>
                        )}

                        {/* Operators */}
                        <div className="viewTemplateWizard-fieldsGroup operators">
                          <span className="viewTemplateWizard-fieldsGroupLabel">Operators:</span>
                          {['+', '-', '*', '/', '(', ')', '.'].map(op => (
                            <button
                              key={op}
                              type="button"
                              className="viewTemplateWizard-fieldBtn operator"
                              onClick={() => {
                                const currentExpr = col.formula?.expression || '';
                                updateColumn(index, 'formula', {
                                  ...col.formula,
                                  type: 'CUSTOM',
                                  expression: currentExpr + ` ${op} `
                                });
                              }}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dropdown options */}
                {col.dataType === 'dropdown' && (
                  <div className="viewTemplateWizard-dropdownSection">
                    <label>Dropdown Options</label>
                    <textarea
                      value={col.dropdownOptions?.map(o => o.label).join('\n') || ''}
                      onChange={(e) => {
                        const options = e.target.value.split('\n').filter(v => v.trim()).map(v => ({
                          label: v.trim(),
                          value: v.trim().toLowerCase().replace(/\s+/g, '_')
                        }));
                        updateColumn(index, 'dropdownOptions', options);
                      }}
                      placeholder="Enter one option per line"
                      rows={4}
                    />
                  </div>
                )}

                {/* Source configuration */}
                <div className="viewTemplateWizard-formRow">
                  <div className="viewTemplateWizard-formGroup">
                    <label>Data Source</label>
                    <select
                      value={col.sourceType}
                      onChange={(e) => {
                        updateColumn(index, 'sourceType', e.target.value as any);
                        // Reset related fields when source type changes
                        if (e.target.value !== 'optionSpec') {
                          updateColumn(index, 'optionTypeId', undefined);
                          updateColumn(index, 'optionTypeName', undefined);
                          updateColumn(index, 'specField', undefined);
                          updateColumn(index, 'specFieldUnit', undefined);
                        }
                      }}
                    >
                      <option value="manual">Manual Entry</option>
                      <option value="order">From Order</option>
                      <option value="customer">From Customer</option>
                      <option value="optionSpec">From Option Spec</option>
                      <option value="calculated">Auto Calculated</option>
                    </select>
                  </div>
                </div>

                {/* Option Spec configuration - show when optionSpec is selected */}
                {col.sourceType === 'optionSpec' && (
                  <div className="viewTemplateWizard-optionSpecConfig">
                    <div className="viewTemplateWizard-formRow">
                      {/* Step 1: Select Option Type */}
                      <div className="viewTemplateWizard-formGroup">
                        <label>Option Type *</label>
                        <select
                          value={col.optionTypeId || ''}
                          onChange={(e) => {
                            const selectedOptType = allowedOptionTypes.find((o: any) => o._id === e.target.value);
                            updateColumn(index, 'optionTypeId', e.target.value);
                            updateColumn(index, 'optionTypeName', selectedOptType?.name || '');
                            updateColumn(index, 'optionSpecId', ''); // Reset OptionSpec
                            updateColumn(index, 'optionSpecName', '');
                            updateColumn(index, 'specField', ''); // Reset spec field
                            updateColumn(index, 'specFieldUnit', '');
                          }}
                        >
                          <option value="">Select Option Type</option>
                          {/* Only show option types selected in Step 2 */}
                          {allowedOptionTypes
                            .filter((opt: any) => config.optionTypeIds.includes(opt._id))
                            .map((opt: any) => (
                              <option key={opt._id} value={opt._id}>{opt.name}</option>
                            ))}
                        </select>
                        {config.optionTypeIds.length === 0 && (
                          <p className="viewTemplateWizard-warning">
                            Please select option types in Step 2 first
                          </p>
                        )}
                      </div>

                      {/* Step 2: Select OptionSpec */}
                      <div className="viewTemplateWizard-formGroup">
                        <label>Option Spec *</label>
                        <select
                          value={col.optionSpecId || ''}
                          onChange={(e) => {
                            const optionSpecs = optionSpecsByType[col.optionTypeId || ''] || [];
                            const selectedSpec = optionSpecs.find((s: any) => s._id === e.target.value);
                            updateColumn(index, 'optionSpecId', e.target.value);
                            updateColumn(index, 'optionSpecName', selectedSpec?.name || '');
                            updateColumn(index, 'specField', ''); // Reset spec field when OptionSpec changes
                            updateColumn(index, 'specFieldUnit', '');
                          }}
                          disabled={!col.optionTypeId}
                        >
                          <option value="">Select Option Spec</option>
                          {col.optionTypeId && (optionSpecsByType[col.optionTypeId] || []).map((spec: any) => (
                            <option key={spec._id} value={spec._id}>
                              {spec.name} ({spec.code})
                            </option>
                          ))}
                        </select>
                        {col.optionTypeId && (optionSpecsByType[col.optionTypeId] || []).length === 0 && (
                          <p className="viewTemplateWizard-warning">
                            No OptionSpecs found. Create OptionSpecs for this type first.
                          </p>
                        )}
                      </div>

                      {/* Step 3: Select Spec Field from OptionSpec.specifications */}
                      <div className="viewTemplateWizard-formGroup">
                        <label>Spec Field *</label>
                        <select
                          value={col.specField || ''}
                          onChange={(e) => {
                            const optionSpecs = optionSpecsByType[col.optionTypeId || ''] || [];
                            const selectedOptionSpec = optionSpecs.find((s: any) => s._id === col.optionSpecId);
                            const selectedSpec = selectedOptionSpec?.specifications?.find((s: any) => s.name === e.target.value);

                            updateColumn(index, 'specField', e.target.value);
                            updateColumn(index, 'specFieldUnit', selectedSpec?.unit || '');

                            // Auto-set column name and label
                            if (e.target.value && !col.name) {
                              const specName = e.target.value.toLowerCase().replace(/\s+/g, '');
                              updateColumn(index, 'name', specName);
                              updateColumn(index, 'label', e.target.value);
                            }
                            // Auto-set unit from spec
                            if (selectedSpec?.unit) {
                              updateColumn(index, 'unit', selectedSpec.unit);
                            }
                            // Auto-set dataType based on spec dataType
                            if (selectedSpec?.dataType) {
                              const typeMap: Record<string, ColumnDataType> = {
                                'string': 'text',
                                'number': 'number',
                                'boolean': 'boolean',
                                'date': 'date',
                                'file': 'file',
                                'dropdown': 'dropdown'
                              };
                              const mappedType = typeMap[selectedSpec.dataType] || 'text';
                              updateColumn(index, 'dataType', mappedType);
                              // If dropdown, also copy options
                              if (selectedSpec.dataType === 'dropdown' && selectedSpec.dropdownOptions) {
                                updateColumn(index, 'dropdownOptions',
                                  selectedSpec.dropdownOptions.map((opt: any) => {
                                    if (typeof opt === 'string') {
                                      return { label: opt, value: opt.toLowerCase().replace(/\s+/g, '_') };
                                    }
                                    return { label: opt.label || opt, value: opt.value || opt.label?.toLowerCase().replace(/\s+/g, '_') };
                                  })
                                );
                              }
                            }
                            // Mark as readonly since it comes from option spec
                            updateColumn(index, 'isReadOnly', true);
                          }}
                          disabled={!col.optionSpecId}
                        >
                          <option value="">Select Spec Field</option>
                          {col.optionSpecId && (() => {
                            const optionSpecs = optionSpecsByType[col.optionTypeId || ''] || [];
                            const selectedOptionSpec = optionSpecs.find((s: any) => s._id === col.optionSpecId);
                            return selectedOptionSpec?.specifications?.map((spec: any, idx: number) => (
                              <option key={idx} value={spec.name}>
                                {spec.name} {spec.unit ? `(${spec.unit})` : ''} - {spec.dataType}
                              </option>
                            )) || null;
                          })()}
                        </select>
                      </div>
                    </div>

                    {col.optionTypeId && col.optionSpecId && col.specField && (
                      <div className="viewTemplateWizard-specPreview">
                        <strong>Source:</strong> {col.optionTypeName} → {col.optionSpecName}.{col.specField}
                        {col.specFieldUnit && <span className="unit"> ({col.specFieldUnit})</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Flags */}
                <div className="viewTemplateWizard-flags">
                  <label className="viewTemplateWizard-checkbox">
                    <input
                      type="checkbox"
                      checked={col.isRequired}
                      onChange={(e) => updateColumn(index, 'isRequired', e.target.checked)}
                    />
                    Required
                  </label>
                  <label className="viewTemplateWizard-checkbox">
                    <input
                      type="checkbox"
                      checked={col.isReadOnly}
                      onChange={(e) => updateColumn(index, 'isReadOnly', e.target.checked)}
                    />
                    Read Only
                  </label>
                  <label className="viewTemplateWizard-checkbox">
                    <input
                      type="checkbox"
                      checked={col.isVisible}
                      onChange={(e) => updateColumn(index, 'isVisible', e.target.checked)}
                    />
                    Visible
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Totals Configuration */}
      <div className="viewTemplateWizard-section">
        <div className="viewTemplateWizard-sectionHeader">
          <h4>Totals Row</h4>
          <button
            type="button"
            className="viewTemplateWizard-smallBtn"
            onClick={addTotal}
            disabled={numericColumns.length === 0}
          >
            <Plus size={14} /> Add Total
          </button>
        </div>

        {numericColumns.length === 0 ? (
          <p className="viewTemplateWizard-hint">Add numeric or formula columns to configure totals</p>
        ) : (
          config.totalsConfig.map((tc, index) => (
            <div key={index} className="viewTemplateWizard-totalItem">
              <select
                value={tc.columnName}
                onChange={(e) => updateTotal(index, 'columnName', e.target.value)}
              >
                <option value="">Select Column</option>
                {numericColumns.map(col => (
                  <option key={col.id} value={col.name}>{col.label || col.name}</option>
                ))}
              </select>
              <select
                value={tc.formula}
                onChange={(e) => updateTotal(index, 'formula', e.target.value as FormulaType)}
              >
                <option value="SUM">SUM</option>
                <option value="AVERAGE">AVERAGE</option>
                <option value="COUNT">COUNT</option>
              </select>
              <input
                type="text"
                value={tc.label}
                onChange={(e) => updateTotal(index, 'label', e.target.value)}
                placeholder="Label (e.g., Total)"
              />
              <button
                type="button"
                className="viewTemplateWizard-iconBtn danger"
                onClick={() => removeTotal(index)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Formula Helper Modal */}
      {showFormulaHelper && (
        <div className="viewTemplateWizard-modal">
          <div className="viewTemplateWizard-modalContent">
            <h4>Formula Templates</h4>
            <div className="viewTemplateWizard-formulaList">
              {formulaTemplates.map((template, idx) => (
                <div
                  key={idx}
                  className="viewTemplateWizard-formulaItem"
                  onClick={() => selectedFormulaColumn !== null && applyFormulaTemplate(template, selectedFormulaColumn)}
                >
                  <strong>{template.name}</strong>
                  <code>{template.expression || 'Custom expression'}</code>
                  <span>{template.description}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="viewTemplateWizard-closeBtn"
              onClick={() => setShowFormulaHelper(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Step 5: Save Template
  const renderStep5 = () => (
    <div className="viewTemplateWizard-stepContent">
      <h3>Step 5: {isEditingExisting ? 'Update Template' : 'Save Template'}</h3>
      <p className="viewTemplateWizard-stepDesc">Review and {isEditingExisting ? 'update' : 'save'} your template configuration</p>

      {/* Edit vs Create indicator */}
      {isEditingExisting && existingTemplateForOrderType && (
        <div className="viewTemplateWizard-warning existingTemplate">
          <AlertTriangle size={18} />
          <div>
            <strong>Updating Existing Template</strong>
            <p>
              You are updating the existing template for this Machine + Order Type.
              <br />
              <strong>Rule:</strong> Each Order Type can only have ONE view template per machine.
            </p>
          </div>
        </div>
      )}

      <div className="viewTemplateWizard-formGroup">
        <label>Template Name *</label>
        <input
          type="text"
          value={config.templateName}
          onChange={(e) => updateConfig('templateName', e.target.value)}
          placeholder="e.g., Extrusion Weight Tracking"
        />
      </div>

      <div className="viewTemplateWizard-formGroup">
        <label>Description</label>
        <textarea
          value={config.description}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Optional description of this template"
          rows={3}
        />
      </div>

      {/* Summary */}
      <div className="viewTemplateWizard-summary">
        <h4>Template Summary</h4>
        <div className="viewTemplateWizard-summaryGrid">
          <div className="viewTemplateWizard-summaryItem">
            <span>Machine Type:</span>
            <strong>{(() => {
              const mt = machineTypes.find((mt: any) => mt._id === config.machineTypeId);
              return mt?.machineTypeName || mt?.type || '-';
            })()}</strong>
          </div>
          <div className="viewTemplateWizard-summaryItem">
            <span>Machine:</span>
            <strong>
              {(() => {
                const machine = machines.find((m: any) => m._id === config.machineId);
                const machineType = machineTypes.find((mt: any) => mt._id === config.machineTypeId);
                if (machine && machineType) {
                  return `${machineType.machineTypeName} - ${machine.machineName}`;
                }
                return machine?.machineName || '-';
              })()}
            </strong>
          </div>
          <div className="viewTemplateWizard-summaryItem">
            <span>Order Type:</span>
            <strong>{orderTypes.find((ot: any) => ot._id === config.orderTypeId)?.typeName || '-'}</strong>
          </div>
          <div className="viewTemplateWizard-summaryItem">
            <span>Columns:</span>
            <strong>{config.columns.filter(c => c.name).length}</strong>
          </div>
          <div className="viewTemplateWizard-summaryItem">
            <span>Totals:</span>
            <strong>{config.totalsConfig.length}</strong>
          </div>
          <div className="viewTemplateWizard-summaryItem">
            <span>Display Items:</span>
            <strong>{config.displayItems.length}</strong>
          </div>
        </div>

        {/* Display Items Preview */}
        {config.displayItems.length > 0 && (
          <>
            <h5>Display Items Preview</h5>
            <div className="viewTemplateWizard-displayPreview">
              {config.displayItems.filter(item => item.isVisible).map(item => (
                <div key={item.id} className="viewTemplateWizard-displayPreviewItem">
                  <span className="label">{item.label}:</span>
                  <span className="type">{item.displayType}</span>
                  {item.sourceType === 'optionSpec' && item.optionTypeName && (
                    <span className="source">{item.optionTypeName}.{item.specField || 'name'}</span>
                  )}
                  {item.sourceType === 'formula' && (
                    <span className="source">Formula</span>
                  )}
                  {item.unit && <span className="unit">({item.unit})</span>}
                </div>
              ))}
            </div>
          </>
        )}

        <h5>Columns Preview</h5>
        <div className="viewTemplateWizard-previewTable">
          <table>
            <thead>
              <tr>
                {config.columns.filter(c => c.name && c.isVisible).map(col => (
                  <th key={col.id} style={{ width: col.width }}>
                    {col.label || col.name}
                    {col.unit && <span className="unit">({col.unit})</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {config.columns.filter(c => c.name && c.isVisible).map(col => (
                  <td key={col.id}>
                    {col.dataType === 'formula' ? <em>Auto</em> : '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="viewTemplateWizard-saveActions">
        <button type="button" className="viewTemplateWizard-previewBtn">
          <Eye size={16} /> Preview
        </button>
        <button type="button" className="viewTemplateWizard-saveBtn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <><Loader2 size={16} className="spin" /> Saving...</> : <><Save size={16} /> {isEditingExisting ? 'Update Template' : 'Save Template'}</>}
        </button>
      </div>
    </div>
  );

  // Edit Sections View - shows when editing existing template
  const renderEditSectionsView = () => (
    <div className="viewTemplateWizard-editSectionsView">
      <div className="viewTemplateWizard-editSectionsHeader">
        <h3>Edit Template Sections</h3>
        <p className="viewTemplateWizard-stepDesc">
          Click on a section to expand and edit. Save each section individually.
        </p>
        <button
          type="button"
          className="viewTemplateWizard-switchModeBtn"
          onClick={() => setShowEditSectionsView(false)}
        >
          <ChevronLeft size={14} /> Back to Wizard View
        </button>
      </div>

      {/* Display Items Section */}
      <div className={`viewTemplateWizard-sectionCard ${expandedEditSection === 'display' ? 'expanded' : ''}`}>
        <div
          className="viewTemplateWizard-sectionCardHeader"
          onClick={() => toggleEditSection('display')}
        >
          <div className="viewTemplateWizard-sectionCardTitle">
            <Eye size={18} />
            <span>Display Items</span>
            <span className="viewTemplateWizard-sectionBadge">
              {config.displayItems.length} items
            </span>
          </div>
          <div className="viewTemplateWizard-sectionCardActions">
            {expandedEditSection !== 'display' && (
              <button type="button" className="viewTemplateWizard-editBtn">
                <Edit2 size={14} /> Edit
              </button>
            )}
            {expandedEditSection === 'display' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Section Summary (when collapsed) */}
        {expandedEditSection !== 'display' && config.displayItems.length > 0 && (
          <div className="viewTemplateWizard-sectionSummary">
            {config.displayItems.slice(0, 4).map((item, idx) => (
              <span key={item.id} className="viewTemplateWizard-summaryTag">
                {item.label || `Item ${idx + 1}`}
              </span>
            ))}
            {config.displayItems.length > 4 && (
              <span className="viewTemplateWizard-summaryTag more">
                +{config.displayItems.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Expanded Content - Step 3 Display Builder with full edit menu */}
        {expandedEditSection === 'display' && (
          <div className="viewTemplateWizard-sectionCardBody">
            <div className="viewTemplateWizard-stepContent">
              {/* Action Buttons */}
              <div className="viewTemplateWizard-columnActions">
                <button
                  type="button"
                  className="viewTemplateWizard-addBtn"
                  onClick={addDisplayItem}
                  disabled={config.optionTypeIds.length === 0}
                >
                  <Plus size={16} /> Add Display Item
                </button>
              </div>

              {/* Quick Add Display Item Templates */}
              <div className="viewTemplateWizard-quickAdd">
                <span>Quick Add:</span>
                {[
                  { label: 'Material Name', displayType: 'text', sourceType: 'optionSpec' },
                  { label: 'Gauge', displayType: 'number', sourceType: 'optionSpec', unit: 'μ' },
                  { label: 'Width', displayType: 'number', sourceType: 'optionSpec', unit: 'mm' },
                  { label: 'Length', displayType: 'number', sourceType: 'optionSpec', unit: 'mm' },
                  { label: 'Weight', displayType: 'number', sourceType: 'optionSpec', unit: 'kg' },
                  { label: 'Is Printed', displayType: 'boolean', sourceType: 'optionSpec' },
                  { label: 'Design Image', displayType: 'image', sourceType: 'optionSpec' },
                  { label: 'Customer Name', displayType: 'text', sourceType: 'customer' },
                ].map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="viewTemplateWizard-quickBtn"
                    onClick={() => {
                      const newItem: DisplayItemConfig = {
                        id: generateId(),
                        label: tpl.label,
                        displayType: tpl.displayType as DisplayItemType,
                        sourceType: tpl.sourceType as 'optionSpec' | 'customer' | 'formula',
                        unit: tpl.unit,
                        order: config.displayItems.length,
                        isVisible: true
                      };
                      setConfig(prev => ({
                        ...prev,
                        displayItems: [...prev.displayItems, newItem]
                      }));
                    }}
                    disabled={config.optionTypeIds.length === 0 && tpl.sourceType === 'optionSpec'}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              {config.optionTypeIds.length === 0 ? (
                <p className="viewTemplateWizard-hint">
                  Please select Option Types in Step 2 first to add display items.
                </p>
              ) : config.displayItems.length === 0 ? (
                <p className="viewTemplateWizard-hint">
                  Add display items to show specification values (gauge, width, images, etc.) in the operator info section.
                </p>
              ) : (
                <div className="viewTemplateWizard-displayItems">
                  {config.displayItems.map((item, index) => (
                    <div key={item.id} className="viewTemplateWizard-displayItem">
                      <div className="viewTemplateWizard-displayItemHeader">
                        <span className="viewTemplateWizard-displayItemNum">{index + 1}</span>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateDisplayItem(index, 'label', e.target.value)}
                          placeholder="Display Label"
                          className="viewTemplateWizard-displayItemLabel"
                        />
                        <button
                          type="button"
                          className="viewTemplateWizard-iconBtn danger"
                          onClick={() => removeDisplayItem(index)}
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="viewTemplateWizard-displayItemBody">
                        <div className="viewTemplateWizard-formRow">
                          {/* Display Type */}
                          <div className="viewTemplateWizard-formGroup">
                            <label>Display Type</label>
                            <select
                              value={item.displayType}
                              onChange={(e) => updateDisplayItem(index, 'displayType', e.target.value as DisplayItemType)}
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="formula">Formula</option>
                              <option value="boolean">Yes/No</option>
                              <option value="image">Image</option>
                            </select>
                          </div>

                          {/* Data Source */}
                          <div className="viewTemplateWizard-formGroup">
                            <label>Data Source</label>
                            <select
                              value={item.sourceType}
                              onChange={(e) => {
                                updateDisplayItem(index, 'sourceType', e.target.value);
                                updateDisplayItem(index, 'optionTypeId', undefined);
                                updateDisplayItem(index, 'optionSpecId', undefined);
                                updateDisplayItem(index, 'specField', undefined);
                                updateDisplayItem(index, 'sourceField', undefined);
                              }}
                            >
                              <option value="optionSpec">From Option Specification</option>
                              <option value="customer">From Customer</option>
                            </select>
                          </div>

                          {/* Unit (for number type) */}
                          {item.displayType === 'number' && (
                            <div className="viewTemplateWizard-formGroup">
                              <label>Unit</label>
                              <input
                                type="text"
                                value={item.unit || ''}
                                onChange={(e) => updateDisplayItem(index, 'unit', e.target.value)}
                                placeholder="e.g., mm, kg"
                              />
                            </div>
                          )}
                        </div>

                        {/* Option Spec Source */}
                        {item.sourceType === 'optionSpec' && (
                          <div className="viewTemplateWizard-formRow">
                            <div className="viewTemplateWizard-formGroup">
                              <label>Option Type *</label>
                              <select
                                value={item.optionTypeId || ''}
                                onChange={(e) => {
                                  const selectedOptType = allowedOptionTypes.find((o: any) => o._id === e.target.value);
                                  updateDisplayItem(index, 'optionTypeId', e.target.value);
                                  updateDisplayItem(index, 'optionTypeName', selectedOptType?.name || '');
                                  updateDisplayItem(index, 'optionSpecId', '');
                                  updateDisplayItem(index, 'specField', '');
                                }}
                              >
                                <option value="">Select Option Type</option>
                                {allowedOptionTypes
                                  .filter((opt: any) => config.optionTypeIds.includes(opt._id))
                                  .map((opt: any) => (
                                    <option key={opt._id} value={opt._id}>{opt.name}</option>
                                  ))}
                              </select>
                            </div>

                            <div className="viewTemplateWizard-formGroup">
                              <label>Spec Field *</label>
                              <select
                                value={item.specField || ''}
                                onChange={(e) => {
                                  updateDisplayItem(index, 'specField', e.target.value);
                                  if (e.target.value && !item.label) {
                                    updateDisplayItem(index, 'label', e.target.value);
                                  }
                                }}
                                disabled={!item.optionTypeId}
                              >
                                <option value="">Select Spec Field</option>
                                {item.optionTypeId && (optionSpecsByType[item.optionTypeId] || []).flatMap((spec: any) =>
                                  (spec.specifications || []).map((s: any) => (
                                    <option key={`${spec._id}-${s.name}`} value={s.name}>
                                      {s.name} {s.unit ? `(${s.unit})` : ''} - {s.dataType}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Customer Source */}
                        {item.sourceType === 'customer' && (
                          <div className="viewTemplateWizard-formRow">
                            <div className="viewTemplateWizard-formGroup">
                              <label>Customer Field *</label>
                              <select
                                value={item.sourceField || ''}
                                onChange={(e) => {
                                  updateDisplayItem(index, 'sourceField', e.target.value);
                                  if (e.target.value && !item.label) {
                                    const fieldName = e.target.value.replace('customer.', '');
                                    updateDisplayItem(index, 'label', fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
                                  }
                                }}
                              >
                                <option value="">Select Field</option>
                                <option value="customer.name">Customer Name</option>
                                <option value="customer.alias">Alias</option>
                                <option value="customer.phone">Phone</option>
                                <option value="customer.email">Email</option>
                                <option value="customer.address">Address</option>
                                <option value="customer.companyName">Company Name</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Formula Builder (for number display type with formula toggle) */}
                        {item.displayType === 'number' && (
                          <div className="viewTemplateWizard-formulaToggle">
                            <label className="viewTemplateWizard-checkbox">
                              <input
                                type="checkbox"
                                checked={item.sourceType === 'formula'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updateDisplayItem(index, 'sourceType', 'formula');
                                    updateDisplayItem(index, 'formula', { expression: '', dependencies: [] });
                                  } else {
                                    updateDisplayItem(index, 'sourceType', 'optionSpec');
                                    updateDisplayItem(index, 'formula', undefined);
                                  }
                                }}
                              />
                              Use Formula (calculate value)
                            </label>
                          </div>
                        )}

                        {/* Formula Builder */}
                        {item.sourceType === 'formula' && (
                          <div className="viewTemplateWizard-formulaBuilder">
                            <div className="viewTemplateWizard-formGroup">
                              <label>Formula Expression</label>
                              <input
                                type="text"
                                value={item.formula?.expression || ''}
                                onChange={(e) => updateDisplayItem(index, 'formula', {
                                  ...item.formula,
                                  expression: e.target.value,
                                  dependencies: []
                                })}
                                placeholder="e.g., Material.gauge * Product.width / 1000"
                                className="viewTemplateWizard-formulaInput"
                              />
                            </div>

                            {/* Available Fields for Formula */}
                            <div className="viewTemplateWizard-formulaFields">
                              <label>Click to insert field:</label>
                              <div className="viewTemplateWizard-fieldsList">
                                {config.optionTypeIds.map(optTypeId => {
                                  const optType = allowedOptionTypes.find((o: any) => o._id === optTypeId);
                                  const specs = optionSpecsByType[optTypeId] || [];
                                  const allSpecFields = specs.flatMap((spec: any) =>
                                    (spec.specifications || [])
                                      .filter((s: any) => s.dataType === 'number')
                                      .map((s: any) => ({
                                        name: s.name,
                                        optTypeName: optType?.name || 'Unknown',
                                        unit: s.unit
                                      }))
                                  );

                                  if (allSpecFields.length === 0) return null;

                                  return (
                                    <div key={optTypeId} className="viewTemplateWizard-fieldsGroup">
                                      <span className="viewTemplateWizard-fieldsGroupLabel">{optType?.name}:</span>
                                      {allSpecFields.map((field: any, fIdx: number) => (
                                        <button
                                          key={fIdx}
                                          type="button"
                                          className="viewTemplateWizard-fieldBtn spec"
                                          onClick={() => {
                                            const fieldRef = `${field.optTypeName}.${field.name}`;
                                            const currentExpr = item.formula?.expression || '';
                                            updateDisplayItem(index, 'formula', {
                                              ...item.formula,
                                              expression: currentExpr + fieldRef,
                                              dependencies: [...(item.formula?.dependencies || []), fieldRef]
                                            });
                                          }}
                                        >
                                          {field.name}
                                          {field.unit && <small> ({field.unit})</small>}
                                        </button>
                                      ))}
                                    </div>
                                  );
                                })}

                                {/* Operators */}
                                <div className="viewTemplateWizard-fieldsGroup operators">
                                  <span className="viewTemplateWizard-operatorLabel">Operators:</span>
                                  {['+', '-', '*', '/', '(', ')', '.'].map(op => (
                                    <button
                                      key={op}
                                      type="button"
                                      className="viewTemplateWizard-fieldBtn operator"
                                      onClick={() => {
                                        const currentExpr = item.formula?.expression || '';
                                        updateDisplayItem(index, 'formula', {
                                          ...item.formula,
                                          expression: currentExpr + ` ${op} `
                                        });
                                      }}
                                    >
                                      {op}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Visibility Toggle */}
                        <div className="viewTemplateWizard-flags">
                          <label className="viewTemplateWizard-checkbox">
                            <input
                              type="checkbox"
                              checked={item.isVisible}
                              onChange={(e) => updateDisplayItem(index, 'isVisible', e.target.checked)}
                            />
                            Visible
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="viewTemplateWizard-sectionSaveRow">
              <button
                type="button"
                className="viewTemplateWizard-saveSectionBtn"
                onClick={() => handleSaveSection('display')}
                disabled={savingSectionName === 'display'}
              >
                {savingSectionName === 'display' ? (
                  <><Loader2 size={14} className="spinning" /> Saving...</>
                ) : (
                  <><Save size={14} /> Save Display Items</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Columns Section */}
      <div className={`viewTemplateWizard-sectionCard ${expandedEditSection === 'columns' ? 'expanded' : ''}`}>
        <div
          className="viewTemplateWizard-sectionCardHeader"
          onClick={() => toggleEditSection('columns')}
        >
          <div className="viewTemplateWizard-sectionCardTitle">
            <Copy size={18} />
            <span>Table Columns</span>
            <span className="viewTemplateWizard-sectionBadge">
              {config.columns.filter(c => c.name).length} columns
            </span>
          </div>
          <div className="viewTemplateWizard-sectionCardActions">
            {expandedEditSection !== 'columns' && (
              <button type="button" className="viewTemplateWizard-editBtn">
                <Edit2 size={14} /> Edit
              </button>
            )}
            {expandedEditSection === 'columns' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Section Summary (when collapsed) */}
        {expandedEditSection !== 'columns' && config.columns.filter(c => c.name).length > 0 && (
          <div className="viewTemplateWizard-sectionSummary">
            {config.columns.filter(c => c.name).slice(0, 5).map((col) => (
              <span key={col.id} className="viewTemplateWizard-summaryTag">
                {col.label || col.name}
                <small className="viewTemplateWizard-summaryTagType">{col.dataType}</small>
              </span>
            ))}
            {config.columns.filter(c => c.name).length > 5 && (
              <span className="viewTemplateWizard-summaryTag more">
                +{config.columns.filter(c => c.name).length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Expanded Content - Step 4 Column Builder with full edit menu */}
        {expandedEditSection === 'columns' && (
          <div className="viewTemplateWizard-sectionCardBody">
            <div className="viewTemplateWizard-stepContent">
              <div className="viewTemplateWizard-columnActions">
                <button type="button" className="viewTemplateWizard-addBtn" onClick={addColumn}>
                  <Plus size={16} /> Add Column
                </button>
                <button type="button" className="viewTemplateWizard-copyBtn" onClick={() => setShowCopyModal(true)}>
                  <Copy size={16} /> Copy from Template
                </button>
              </div>

              {/* Quick Add Column Templates */}
              <div className="viewTemplateWizard-quickAdd">
                <span>Quick Add:</span>
                {columnTemplates.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="viewTemplateWizard-quickBtn"
                    onClick={() => {
                      const newColumn: ColumnConfig = {
                        ...defaultColumn,
                        id: generateId(),
                        name: tpl.name.toLowerCase().replace(/\s+/g, ''),
                        label: tpl.name,
                        dataType: tpl.dataType,
                        isReadOnly: tpl.isReadOnly || false,
                        isRequired: tpl.isRequired || false,
                        unit: tpl.unit,
                        formula: tpl.formula,
                        dropdownOptions: tpl.dropdownOptions,
                        sourceType: tpl.sourceType || 'manual',
                        order: config.columns.length
                      };
                      setConfig(prev => ({
                        ...prev,
                        columns: [...prev.columns, newColumn]
                      }));
                    }}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>

              <div className="viewTemplateWizard-columns">
                {config.columns.map((col, index) => (
                  <div key={col.id} className="viewTemplateWizard-columnItem">
                    <div
                      className="viewTemplateWizard-columnHeader"
                      onClick={() => setExpandedColumn(expandedColumn === index ? null : index)}
                    >
                      <span className="viewTemplateWizard-columnName">
                        {col.label || col.name || `Column ${index + 1}`}
                      </span>
                      <div className="viewTemplateWizard-columnMeta">
                        <span className="viewTemplateWizard-columnType">{col.dataType}</span>
                        {col.isRequired && <span className="viewTemplateWizard-required">Required</span>}
                        <button
                          type="button"
                          className="viewTemplateWizard-iconBtn"
                          onClick={(e) => { e.stopPropagation(); duplicateColumn(index); }}
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        {config.columns.length > 1 && (
                          <button
                            type="button"
                            className="viewTemplateWizard-iconBtn danger"
                            onClick={(e) => { e.stopPropagation(); removeColumn(index); }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Column Edit Body - shows when expanded */}
                    {expandedColumn === index && (
                      <div className="viewTemplateWizard-columnBody">
                        <div className="viewTemplateWizard-formRow">
                          <div className="viewTemplateWizard-formGroup">
                            <label>Column Name *</label>
                            <input
                              type="text"
                              value={col.name}
                              onChange={(e) => updateColumn(index, 'name', e.target.value)}
                              placeholder="e.g., grossWeight"
                            />
                          </div>
                          <div className="viewTemplateWizard-formGroup">
                            <label>Display Label</label>
                            <input
                              type="text"
                              value={col.label}
                              onChange={(e) => updateColumn(index, 'label', e.target.value)}
                              placeholder="e.g., Gross Weight"
                            />
                          </div>
                        </div>

                        <div className="viewTemplateWizard-formRow">
                          <div className="viewTemplateWizard-formGroup">
                            <label>Data Type</label>
                            <select
                              value={col.dataType}
                              onChange={(e) => updateColumn(index, 'dataType', e.target.value as ColumnDataType)}
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="formula">Formula (Auto-calculated)</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="boolean">Yes/No</option>
                              <option value="date">Date</option>
                              <option value="image">Image/Photo</option>
                              <option value="audio">Voice Note/Audio</option>
                              <option value="file">File</option>
                            </select>
                          </div>
                          <div className="viewTemplateWizard-formGroup">
                            <label>Unit</label>
                            <input
                              type="text"
                              value={col.unit || ''}
                              onChange={(e) => updateColumn(index, 'unit', e.target.value)}
                              placeholder="e.g., kg, g, mm"
                            />
                          </div>
                          <div className="viewTemplateWizard-formGroup">
                            <label>Width (px)</label>
                            <input
                              type="number"
                              value={col.width}
                              onChange={(e) => updateColumn(index, 'width', parseInt(e.target.value) || 150)}
                              min="50"
                              max="500"
                            />
                          </div>
                        </div>

                        {/* Formula configuration */}
                        {col.dataType === 'formula' && (
                          <div className="viewTemplateWizard-formulaSection">
                            <div className="viewTemplateWizard-formGroup">
                              <label>Formula Expression</label>
                              <div className="viewTemplateWizard-formulaInput">
                                <input
                                  type="text"
                                  value={col.formula?.expression || ''}
                                  onChange={(e) => updateColumn(index, 'formula', {
                                    ...col.formula,
                                    type: 'CUSTOM',
                                    expression: e.target.value
                                  })}
                                  placeholder="e.g., grossWt - coreWt"
                                />
                                <button
                                  type="button"
                                  className="viewTemplateWizard-helpBtn"
                                  onClick={() => {
                                    setSelectedFormulaColumn(index);
                                    setShowFormulaHelper(true);
                                  }}
                                >
                                  Templates
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Dropdown options */}
                        {col.dataType === 'dropdown' && (
                          <div className="viewTemplateWizard-dropdownSection">
                            <label>Dropdown Options</label>
                            <textarea
                              value={col.dropdownOptions?.map(o => o.label).join('\n') || ''}
                              onChange={(e) => {
                                const options = e.target.value.split('\n').filter(v => v.trim()).map(v => ({
                                  label: v.trim(),
                                  value: v.trim().toLowerCase().replace(/\s+/g, '_')
                                }));
                                updateColumn(index, 'dropdownOptions', options);
                              }}
                              placeholder="Enter one option per line"
                              rows={4}
                            />
                          </div>
                        )}

                        {/* Source configuration */}
                        <div className="viewTemplateWizard-formRow">
                          <div className="viewTemplateWizard-formGroup">
                            <label>Data Source</label>
                            <select
                              value={col.sourceType}
                              onChange={(e) => {
                                updateColumn(index, 'sourceType', e.target.value as any);
                                if (e.target.value !== 'optionSpec') {
                                  updateColumn(index, 'optionTypeId', undefined);
                                  updateColumn(index, 'optionTypeName', undefined);
                                  updateColumn(index, 'specField', undefined);
                                  updateColumn(index, 'specFieldUnit', undefined);
                                }
                              }}
                            >
                              <option value="manual">Manual Entry</option>
                              <option value="order">From Order</option>
                              <option value="customer">From Customer</option>
                              <option value="optionSpec">From Option Spec</option>
                              <option value="calculated">Auto Calculated</option>
                            </select>
                          </div>
                        </div>

                        {/* Option Spec configuration */}
                        {col.sourceType === 'optionSpec' && (
                          <div className="viewTemplateWizard-optionSpecConfig">
                            <div className="viewTemplateWizard-formRow">
                              <div className="viewTemplateWizard-formGroup">
                                <label>Option Type *</label>
                                <select
                                  value={col.optionTypeId || ''}
                                  onChange={(e) => {
                                    const selectedOptType = allowedOptionTypes.find((o: any) => o._id === e.target.value);
                                    updateColumn(index, 'optionTypeId', e.target.value);
                                    updateColumn(index, 'optionTypeName', selectedOptType?.name || '');
                                    updateColumn(index, 'optionSpecId', '');
                                    updateColumn(index, 'optionSpecName', '');
                                    updateColumn(index, 'specField', '');
                                    updateColumn(index, 'specFieldUnit', '');
                                  }}
                                >
                                  <option value="">Select Option Type</option>
                                  {allowedOptionTypes
                                    .filter((opt: any) => config.optionTypeIds.includes(opt._id))
                                    .map((opt: any) => (
                                      <option key={opt._id} value={opt._id}>{opt.name}</option>
                                    ))}
                                </select>
                              </div>

                              <div className="viewTemplateWizard-formGroup">
                                <label>Option Spec *</label>
                                <select
                                  value={col.optionSpecId || ''}
                                  onChange={(e) => {
                                    const optionSpecs = optionSpecsByType[col.optionTypeId || ''] || [];
                                    const selectedSpec = optionSpecs.find((s: any) => s._id === e.target.value);
                                    updateColumn(index, 'optionSpecId', e.target.value);
                                    updateColumn(index, 'optionSpecName', selectedSpec?.name || '');
                                    updateColumn(index, 'specField', '');
                                    updateColumn(index, 'specFieldUnit', '');
                                  }}
                                  disabled={!col.optionTypeId}
                                >
                                  <option value="">Select Option Spec</option>
                                  {col.optionTypeId && (optionSpecsByType[col.optionTypeId] || []).map((spec: any) => (
                                    <option key={spec._id} value={spec._id}>
                                      {spec.name} ({spec.code})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="viewTemplateWizard-formGroup">
                                <label>Spec Field *</label>
                                <select
                                  value={col.specField || ''}
                                  onChange={(e) => {
                                    const optionSpecs = optionSpecsByType[col.optionTypeId || ''] || [];
                                    const selectedOptionSpec = optionSpecs.find((s: any) => s._id === col.optionSpecId);
                                    const selectedSpec = selectedOptionSpec?.specifications?.find((s: any) => s.name === e.target.value);
                                    updateColumn(index, 'specField', e.target.value);
                                    updateColumn(index, 'specFieldUnit', selectedSpec?.unit || '');
                                    if (e.target.value && !col.name) {
                                      updateColumn(index, 'name', e.target.value.toLowerCase().replace(/\s+/g, ''));
                                      updateColumn(index, 'label', e.target.value);
                                    }
                                    if (selectedSpec?.unit) {
                                      updateColumn(index, 'unit', selectedSpec.unit);
                                    }
                                    updateColumn(index, 'isReadOnly', true);
                                  }}
                                  disabled={!col.optionSpecId}
                                >
                                  <option value="">Select Spec Field</option>
                                  {col.optionSpecId && (() => {
                                    const optionSpecs = optionSpecsByType[col.optionTypeId || ''] || [];
                                    const selectedOptionSpec = optionSpecs.find((s: any) => s._id === col.optionSpecId);
                                    return selectedOptionSpec?.specifications?.map((spec: any, idx: number) => (
                                      <option key={idx} value={spec.name}>
                                        {spec.name} {spec.unit ? `(${spec.unit})` : ''} - {spec.dataType}
                                      </option>
                                    )) || null;
                                  })()}
                                </select>
                              </div>
                            </div>

                            {col.optionTypeId && col.optionSpecId && col.specField && (
                              <div className="viewTemplateWizard-specPreview">
                                <strong>Source:</strong> {col.optionTypeName} → {col.optionSpecName}.{col.specField}
                                {col.specFieldUnit && <span className="unit"> ({col.specFieldUnit})</span>}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Flags */}
                        <div className="viewTemplateWizard-flags">
                          <label className="viewTemplateWizard-checkbox">
                            <input
                              type="checkbox"
                              checked={col.isRequired}
                              onChange={(e) => updateColumn(index, 'isRequired', e.target.checked)}
                            />
                            Required
                          </label>
                          <label className="viewTemplateWizard-checkbox">
                            <input
                              type="checkbox"
                              checked={col.isReadOnly}
                              onChange={(e) => updateColumn(index, 'isReadOnly', e.target.checked)}
                            />
                            Read Only
                          </label>
                          <label className="viewTemplateWizard-checkbox">
                            <input
                              type="checkbox"
                              checked={col.isVisible}
                              onChange={(e) => updateColumn(index, 'isVisible', e.target.checked)}
                            />
                            Visible
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="viewTemplateWizard-sectionSaveRow">
              <button
                type="button"
                className="viewTemplateWizard-saveSectionBtn"
                onClick={() => handleSaveSection('columns')}
                disabled={savingSectionName === 'columns'}
              >
                {savingSectionName === 'columns' ? (
                  <><Loader2 size={14} className="spinning" /> Saving...</>
                ) : (
                  <><Save size={14} /> Save Columns</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Totals Section */}
      <div className={`viewTemplateWizard-sectionCard ${expandedEditSection === 'totals' ? 'expanded' : ''}`}>
        <div
          className="viewTemplateWizard-sectionCardHeader"
          onClick={() => toggleEditSection('totals')}
        >
          <div className="viewTemplateWizard-sectionCardTitle">
            <span className="viewTemplateWizard-totalsIcon">Σ</span>
            <span>Totals Configuration</span>
            <span className="viewTemplateWizard-sectionBadge">
              {config.totalsConfig.length} totals
            </span>
          </div>
          <div className="viewTemplateWizard-sectionCardActions">
            {expandedEditSection !== 'totals' && (
              <button type="button" className="viewTemplateWizard-editBtn">
                <Edit2 size={14} /> Edit
              </button>
            )}
            {expandedEditSection === 'totals' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Section Summary (when collapsed) */}
        {expandedEditSection !== 'totals' && config.totalsConfig.length > 0 && (
          <div className="viewTemplateWizard-sectionSummary">
            {config.totalsConfig.map((tc, idx) => (
              <span key={idx} className="viewTemplateWizard-summaryTag">
                {tc.label || tc.columnName} ({tc.formula})
              </span>
            ))}
          </div>
        )}

        {/* Expanded Content - Totals Config */}
        {expandedEditSection === 'totals' && (
          <div className="viewTemplateWizard-sectionCardBody">
            <div className="viewTemplateWizard-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
              <div className="viewTemplateWizard-sectionHeader">
                <h4>Totals Row</h4>
                <button
                  type="button"
                  className="viewTemplateWizard-smallBtn"
                  onClick={addTotal}
                  disabled={numericColumns.length === 0}
                >
                  <Plus size={14} /> Add Total
                </button>
              </div>

              {numericColumns.length === 0 ? (
                <p className="viewTemplateWizard-hint">Add numeric or formula columns to configure totals</p>
              ) : (
                config.totalsConfig.map((tc, index) => (
                  <div key={index} className="viewTemplateWizard-totalItem">
                    <select
                      value={tc.columnName}
                      onChange={(e) => updateTotal(index, 'columnName', e.target.value)}
                    >
                      <option value="">Select Column</option>
                      {numericColumns.map(col => (
                        <option key={col.id} value={col.name}>{col.label || col.name}</option>
                      ))}
                    </select>
                    <select
                      value={tc.formula}
                      onChange={(e) => updateTotal(index, 'formula', e.target.value as FormulaType)}
                    >
                      <option value="SUM">SUM</option>
                      <option value="AVERAGE">AVERAGE</option>
                      <option value="COUNT">COUNT</option>
                    </select>
                    <input
                      type="text"
                      value={tc.label}
                      onChange={(e) => updateTotal(index, 'label', e.target.value)}
                      placeholder="Label (e.g., Total)"
                    />
                    <button
                      type="button"
                      className="viewTemplateWizard-iconBtn danger"
                      onClick={() => removeTotal(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="viewTemplateWizard-sectionSaveRow">
              <button
                type="button"
                className="viewTemplateWizard-saveSectionBtn"
                onClick={() => handleSaveSection('totals')}
                disabled={savingSectionName === 'totals'}
              >
                {savingSectionName === 'totals' ? (
                  <><Loader2 size={14} className="spinning" /> Saving...</>
                ) : (
                  <><Save size={14} /> Save Totals</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="viewTemplateWizard">
      <div className="viewTemplateWizard-header">
        <h2>{isEditingExisting ? 'Edit View Template' : 'Create View Template'}</h2>
        <p>Configure operator view for machine production entry</p>
        {/* Show Edit Sections button when editing existing template */}
        {isEditingExisting && !showEditSectionsView && currentStep >= 2 && (
          <button
            type="button"
            className="viewTemplateWizard-editSectionsBtn"
            onClick={() => setShowEditSectionsView(true)}
          >
            <Edit2 size={16} /> Edit Sections View
          </button>
        )}
      </div>

      {/* Show Edit Sections View or Wizard View */}
      {showEditSectionsView ? (
        <div className="viewTemplateWizard-content">
          {renderEditSectionsView()}
        </div>
      ) : (
        <>
          {renderStepIndicator()}

          <div className="viewTemplateWizard-content">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

          <div className="viewTemplateWizard-navigation">
            <button
              type="button"
              className="viewTemplateWizard-navBtn prev"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft size={18} /> Back
            </button>
            {currentStep < totalSteps ? (
              <button
                type="button"
                className="viewTemplateWizard-navBtn next"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="viewTemplateWizard-navBtn save"
                onClick={handleSave}
                disabled={!isStepValid(currentStep) || isSaving}
              >
                {isSaving ? <><Loader2 size={18} className="spin" /> Saving...</> : <><Save size={18} /> {isEditingExisting ? 'Update Template' : 'Save Template'}</>}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewTemplateWizard;
