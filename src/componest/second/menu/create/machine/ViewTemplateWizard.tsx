import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../store";
import { useFormDataCache } from "../../Edit/hooks/useFormDataCache";
import { getOrderFormDataIfNeeded } from "../../../../redux/oders/orderFormDataActions";
import { getOptionSpecsV2 as getOptionSpecs } from "../../../../redux/unifiedV2/optionSpecActions";
// ✅ MIGRATED TO V2 API
import { createTemplateV2, updateTemplateV2 } from "../../../../redux/unifiedV2/templateActions";
import { ChevronLeft, ChevronRight, Plus, Trash2, Eye, Save, Copy, Loader2, AlertTriangle, Edit2, ChevronDown, ChevronUp, X, Layers } from 'lucide-react';
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
  dropdownOptions?: {label: string;value: string;}[];
  // Source config - where data comes from
  sourceType: 'manual' | 'order' | 'customer' | 'optionSpec' | 'calculated';
  sourceField?: string;
  // OptionSpec source fields
  optionTypeId?: string;
  optionTypeName?: string;
  optionSpecId?: string; // NEW: Selected OptionSpec ID
  optionSpecName?: string; // NEW: Selected OptionSpec name
  specField?: string;
  specFieldUnit?: string;
}

interface CustomerFieldsConfig {
  // Customer Identity
  showName: boolean; // Full Name (firstName + lastName)
  showFirstName: boolean; // First Name only
  showLastName: boolean; // Last Name only
  showCompanyName: boolean; // Company Name
  showAlias: boolean; // Customer Alias
  showImage: boolean; // Customer Image

  // Contact Information
  showPhone: boolean; // Phone 1
  showPhone2: boolean; // Phone 2
  showWhatsapp: boolean; // WhatsApp
  showTelephone: boolean; // Telephone
  showEmail: boolean; // Email

  // Address Information
  showAddress: boolean; // Address 1
  showAddress2: boolean; // Address 2
  showState: boolean; // State
  showPinCode: boolean; // Pin Code
  showFullAddress: boolean; // Full Address (combined)

  // Order Information
  showOrderId: boolean;
  showOrderDate: boolean;
  showQuantity: boolean;
  showInstructions: boolean;
  showOrderImage: boolean; // Order specific image

  // Verification
  showVerification: boolean; // Verification status
}

// Props interface for edit mode support
interface ViewTemplateWizardProps {
  initialData?: any;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

interface TotalsConfig {
  id: string;
  columnName: string;
  formula: FormulaType;
  label: string;
  unit?: string;
  isVisible: boolean;
}

// Calculation Rule - for same option type calculations (when same option type appears multiple times)
interface CalculationRule {
  id: string;
  name: string;
  description?: string;
  optionTypeId: string;
  optionTypeName?: string;
  specField: string; // Which specification field to calculate (e.g., "quantity", "price", "weight")
  calculationType: 'DIFFERENCE' | 'PERCENTAGE_DIFF' | 'SUM' | 'AVERAGE' | 'MIN' | 'MAX' | 'MULTIPLY';
  // When same option type appears multiple times, how to handle
  multipleOccurrence: 'FIRST_MINUS_SECOND' | 'SECOND_MINUS_FIRST' | 'ALL_SUM' | 'AVERAGE_ALL' | 'MULTIPLY_ALL';
  resultLabel?: string; // Column name for result (e.g., "Total Quantity", "Total Price")
  resultUnit?: string;
  showInSummary: boolean;
  isActive: boolean;
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

// Selected Specification Config - which spec fields to show
interface SelectedSpecificationConfig {
  optionSpecId: string;
  fields: string[];
  showYesNo: boolean;
}

interface ViewTemplateConfig {
  templateName: string;
  description: string;
  machineTypeId: string;
  machineId: string;
  orderTypeId: string;
  optionTypeIds: string[];
  optionSpecIds: string[]; // Selected OptionSpec IDs
  selectedSpecifications: SelectedSpecificationConfig[]; // Which fields from each spec
  calculationRules: CalculationRule[]; // Rules for calculating same option type totals
  columns: ColumnConfig[];
  customerFields: CustomerFieldsConfig;
  displayItems: DisplayItemConfig[]; // NEW: Dynamic display items for Step 3
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
  // Customer Identity
  showName: true,
  showFirstName: false,
  showLastName: false,
  showCompanyName: true,
  showAlias: false,
  showImage: true,

  // Contact Information
  showPhone: true,
  showPhone2: false,
  showWhatsapp: false,
  showTelephone: false,
  showEmail: false,

  // Address Information
  showAddress: true,
  showAddress2: false,
  showState: false,
  showPinCode: false,
  showFullAddress: false,

  // Order Information
  showOrderId: true,
  showOrderDate: true,
  showQuantity: true,
  showInstructions: true,
  showOrderImage: true,

  // Verification
  showVerification: false
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

{ name: 'Custom', expression: '', description: 'Write your own formula' }];


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
{ name: 'Image/Photo', dataType: 'image' as ColumnDataType }];


const ViewTemplateWizard: React.FC<ViewTemplateWizardProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Edit mode detection from props
  const editMode = Boolean(initialData && initialData._id);
  const templateId = initialData?._id;

  // Use cached form data
  const { machineTypes, machines, orderTypes, optionTypes, loading, isReady } = useFormDataCache();

  // Load form data if not already present
  useEffect(() => {
    if (!isReady && !loading) {

      dispatch(getOrderFormDataIfNeeded());
    }
  }, [dispatch, isReady, loading]);

  // Debug: Log data availability
  useEffect(() => {











    // Debug: Check Order Types and their allowedOptionTypes
    if (orderTypes.length > 0) {

      orderTypes.forEach((ot: any) => {






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
    optionSpecIds: [],
    selectedSpecifications: [],
    calculationRules: [],
    columns: [{ ...defaultColumn, id: `col_${Date.now()}`, order: 0 }],
    customerFields: defaultCustomerFields,
    displayItems: [], // Dynamic display items for Step 3
    totalsConfig: [],
    settings: defaultSettings
  });

  // Selected specifications state for UI - { specId: [fieldName1, fieldName2] }
  const [selectedSpecFields, setSelectedSpecFields] = useState<Record<string, string[]>>({});
  // Show Yes/No toggle per spec - { specId: boolean }
  const [specShowYesNo, setSpecShowYesNo] = useState<Record<string, boolean>>({});

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
  const [expandedEditSection, setExpandedEditSection] = useState<'display' | 'columns' | 'totals' | 'calculationRules' | null>(null);
  const [savingSectionName, setSavingSectionName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showProductionInfo, setShowProductionInfo] = useState(false);

  // Load initial data when editing (from props)
  useEffect(() => {
    if (initialData && initialData._id) {


      // Get machineId from populated object or string
      const machineIdValue = typeof initialData.machineId === 'object' ?
      initialData.machineId._id :
      initialData.machineId;

      // Get orderTypeId from populated object or string
      const orderTypeIdValue = typeof initialData.orderTypeId === 'object' ?
      initialData.orderTypeId._id :
      initialData.orderTypeId;

      // Get machineTypeId if available
      const machineTypeIdValue = initialData.machine?.machineType?._id ||
      initialData.machineId?.machineType?._id ||
      '';

      setConfig((prev) => ({
        ...prev,
        templateName: initialData.templateName || '',
        description: initialData.description || '',
        machineTypeId: machineTypeIdValue,
        machineId: machineIdValue || '',
        orderTypeId: orderTypeIdValue || '',
        optionTypeIds: initialData.optionTypeIds || [],
        optionSpecIds: initialData.optionSpecIds || [],
        selectedSpecifications: initialData.selectedSpecifications || [],
        calculationRules: initialData.calculationRules || [],
        columns: initialData.columns?.length > 0 ?
        initialData.columns.map((col: any, idx: number) => ({
          ...defaultColumn,
          ...col,
          id: col.id || `col_${Date.now()}_${idx}`,
          order: col.order ?? idx
        })) :
        prev.columns,
        customerFields: { ...defaultCustomerFields, ...initialData.customerFields },
        displayItems: initialData.displayItems || [],
        totalsConfig: initialData.totalsConfig || [],
        settings: { ...defaultSettings, ...initialData.settings }
      }));

      // Load selectedSpecifications into UI state
      if (initialData.selectedSpecifications?.length > 0) {
        const specsMap: Record<string, string[]> = {};
        const yesNoMap: Record<string, boolean> = {};
        initialData.selectedSpecifications.forEach((item: any) => {
          const specId = typeof item.optionSpecId === 'object' ? item.optionSpecId._id : item.optionSpecId;
          specsMap[specId] = item.fields || [];
          yesNoMap[specId] = item.showYesNo || false;
        });
        setSelectedSpecFields(specsMap);
        setSpecShowYesNo(yesNoMap);
      }

      // Set to editing existing mode
      setIsEditingExisting(true);
      setExistingTemplateForOrderType(initialData);

      // Go to edit sections view directly for existing templates
      setShowEditSectionsView(true);
    }
  }, [initialData]);

  // Fetch OptionSpecs for an OptionType
  const fetchOptionSpecsForType = useCallback(async (optionTypeId: string) => {
    if (optionSpecsByType[optionTypeId] || loadingOptionSpecs[optionTypeId]) {
      return; // Already loaded or loading
    }

    setLoadingOptionSpecs((prev) => ({ ...prev, [optionTypeId]: true }));

    try {
      const result = await dispatch(getOptionSpecs({ optionTypeId }));

      setOptionSpecsByType((prev) => ({ ...prev, [optionTypeId]: result || [] }));
    } catch (error) {

      setOptionSpecsByType((prev) => ({ ...prev, [optionTypeId]: [] }));
    } finally {
      setLoadingOptionSpecs((prev) => ({ ...prev, [optionTypeId]: false }));
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
        setConfig((prev) => ({
          ...prev,
          templateName: existing.templateName || '',
          description: existing.description || '',
          optionTypeIds: existing.optionTypeIds || [],
          optionSpecIds: existing.optionSpecIds || [],
          selectedSpecifications: existing.selectedSpecifications || [],
          calculationRules: existing.calculationRules || [],
          columns: existing.columns || prev.columns,
          customerFields: existing.customerFields || prev.customerFields,
          displayItems: existing.displayItems || [],
          totalsConfig: existing.totalsConfig || [],
          settings: existing.settings || prev.settings
        }));
        // Load selectedSpecifications into UI state
        if (existing.selectedSpecifications && existing.selectedSpecifications.length > 0) {
          const specsMap: Record<string, string[]> = {};
          const yesNoMap: Record<string, boolean> = {};
          existing.selectedSpecifications.forEach((item: any) => {
            const specId = typeof item.optionSpecId === 'object' ? item.optionSpecId._id : item.optionSpecId;
            specsMap[specId] = item.fields || [];
            yesNoMap[specId] = item.showYesNo || false;
          });
          setSelectedSpecFields(specsMap);
          setSpecShowYesNo(yesNoMap);
        }

      } else {
        setExistingTemplateForOrderType(null);
        setIsEditingExisting(false);
      }
    } catch (error) {

      setExistingTemplateForOrderType(null);
      setIsEditingExisting(false);
    } finally {
      setCheckingExistingTemplate(false);
    }
  }, [existingTemplates]);

  // Filter machines by selected machine type
  const filteredMachines = config.machineTypeId ?
  machines.filter((m: any) => {
    // Machine has machineType as populated object with _id
    // Convert to string for comparison since MongoDB ObjectId may not match string directly
    const machineTypeId = m.machineType?._id?.toString?.() || m.machineType?._id || m.machineType?.toString?.() || m.machineType || m.machineTypeId;
    const selectedId = config.machineTypeId;
    const isMatch = String(machineTypeId) === String(selectedId);
    return isMatch;
  }) :
  machines;

  // Generate unique ID
  const generateId = () => `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Update config helper
  const updateConfig = (field: keyof ViewTemplateConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Column operations
  const addColumn = () => {
    const newColumn: ColumnConfig = {
      ...defaultColumn,
      id: generateId(),
      order: config.columns.length
    };
    setConfig((prev) => ({
      ...prev,
      columns: [...prev.columns, newColumn]
    }));
    setExpandedColumn(config.columns.length);
  };

  const removeColumn = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index).map((col, i) => ({ ...col, order: i }))
    }));
    setExpandedColumn(null);
  };

  const updateColumn = (index: number, field: keyof ColumnConfig, value: any) => {
    setConfig((prev) => ({
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
    setConfig((prev) => ({
      ...prev,
      columns: [...prev.columns, newColumn]
    }));
  };

  // Totals operations
  const addTotal = () => {
    setConfig((prev) => ({
      ...prev,
      totalsConfig: [...prev.totalsConfig, {
        id: `total_${Date.now()}`,
        columnName: '',
        formula: 'SUM' as FormulaType,
        label: '',
        isVisible: true
      }]
    }));
  };

  const removeTotal = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      totalsConfig: prev.totalsConfig.filter((_, i) => i !== index)
    }));
  };

  const updateTotal = (index: number, field: keyof TotalsConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      totalsConfig: prev.totalsConfig.map((tc, i) =>
      i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  // Calculation Rules operations (for same option type calculations)
  const addCalculationRule = () => {
    const newRule: CalculationRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      optionTypeId: '',
      specField: '',
      calculationType: 'SUM',
      multipleOccurrence: 'ALL_SUM',
      resultLabel: '',
      showInSummary: true,
      isActive: true
    };
    setConfig((prev) => ({
      ...prev,
      calculationRules: [...prev.calculationRules, newRule]
    }));
  };

  const removeCalculationRule = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      calculationRules: prev.calculationRules.filter((_, i) => i !== index)
    }));
  };

  const updateCalculationRule = (index: number, field: keyof CalculationRule, value: any) => {
    setConfig((prev) => ({
      ...prev,
      calculationRules: prev.calculationRules.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
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
    setConfig((prev) => ({
      ...prev,
      displayItems: [...prev.displayItems, newItem]
    }));
  };

  const removeDisplayItem = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      displayItems: prev.displayItems.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i }))
    }));
  };

  const updateDisplayItem = (index: number, field: keyof DisplayItemConfig, value: any) => {
    setConfig((prev) => ({
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
    setConfig((prev) => ({
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
        return config.columns.length > 0 && config.columns.some((col) => col.name.trim());
      case 5:
        return !!config.templateName.trim();
      default:
        return false;
    }
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Save template
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
      // Convert selectedSpecFields to selectedSpecifications array format
      const selectedSpecificationsArray: SelectedSpecificationConfig[] = Object.entries(selectedSpecFields).map(([specId, fields]) => ({
        optionSpecId: specId,
        fields: fields,
        showYesNo: specShowYesNo[specId] || false
      }));

      // Create final config with selectedSpecifications
      const finalConfig = {
        ...config,
        selectedSpecifications: selectedSpecificationsArray
      };

      // Rule: One Order Type = One View Template per Machine
      // If editing existing, update it. Otherwise, create new.
      if (isEditingExisting && existingTemplateForOrderType?._id || editMode && templateId) {
        const idToUpdate = existingTemplateForOrderType?._id || templateId;

        // ✅ USING V2 API
        await dispatch(updateTemplateV2(idToUpdate, finalConfig as any));
        alert('Template updated successfully!');
      } else {

        // ✅ USING V2 API
        await dispatch(createTemplateV2(finalConfig as any));
        alert('Template saved successfully!');
      }

      // Call onSaveSuccess callback if provided (from EditIndex)
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {

      alert(error.message || 'Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save individual section (for Edit Sections View)
  const handleSaveSection = async (section: 'display' | 'columns' | 'totals' | 'calculationRules') => {
    if (!existingTemplateForOrderType?._id) {
      alert('No template to update. Please save the template first.');
      return;
    }

    setSavingSectionName(section);
    try {
      const sectionData = section === 'display' ? { displayItems: config.displayItems } :
      section === 'columns' ? { columns: config.columns } :
      section === 'calculationRules' ? { calculationRules: config.calculationRules } :
      { totalsConfig: config.totalsConfig };







      // Update the template with the section data
      // ✅ USING V2 API
      await dispatch(updateTemplateV2(existingTemplateForOrderType._id, {
        ...config,
        ...sectionData
      } as any));

      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} section saved successfully!`);
    } catch (error: any) {

      alert(error.message || `Failed to save ${section} section. Please try again.`);
    } finally {
      setSavingSectionName(null);
    }
  };

  // Toggle section expansion in Edit Sections View
  const toggleEditSection = (section: 'display' | 'columns' | 'totals' | 'calculationRules') => {
    setExpandedEditSection((prev) => prev === section ? null : section);
  };

  // Get numeric columns for totals
  const numericColumns = config.columns.filter((col) =>
  col.dataType === 'number' || col.dataType === 'formula'
  );

  // Render step indicator
  const renderStepIndicator = () =>
  <div className="viewTemplateWizard-steps">
      {[1, 2, 3, 4, 5].map((step) =>
    <div
      key={step}
      className={`viewTemplateWizard-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
      onClick={() => isStepValid(step - 1) || step < currentStep ? setCurrentStep(step) : null}>

          <div className="viewTemplateWizard-stepNumber">{step}</div>
          <div className="viewTemplateWizard-stepLabel">
            {step === 1 && 'Machine'}
            {step === 2 && 'Order Type'}
            {step === 3 && 'Display'}
            {step === 4 && 'Columns'}
            {step === 5 && 'Save'}
          </div>
        </div>
    )}
    </div>;


  // Step 1: Machine Selection
  const renderStep1 = () =>
  <div className="viewTemplateWizard-stepContent">
      <h3>Step 1: Select Machine</h3>
      <p className="viewTemplateWizard-stepDesc">Choose the machine type and specific machine for this template</p>

      {loading &&
    <div className="viewTemplateWizard-loading">Loading data...</div>
    }

      <div className="viewTemplateWizard-formGroup">
        <label>Machine Type * ({machineTypes.length} types)</label>
        <select
        value={config.machineTypeId}
        onChange={(e) => {
          const selectedTypeId = e.target.value;



          const filtered = machines.filter((m: any) => {
            const machineTypeId = m.machineType?._id?.toString?.() || m.machineType?._id || m.machineType?.toString?.() || m.machineType || m.machineTypeId;
            const isMatch = String(machineTypeId) === String(selectedTypeId);

            return isMatch;
          });

          updateConfig('machineTypeId', selectedTypeId);
          updateConfig('machineId', ''); // Reset machine when type changes
        }}
        disabled={loading}>

          <option value="">Select Machine Type</option>
          {machineTypes.map((mt: any) =>
        <option key={mt._id} value={mt._id}>{mt.machineTypeName || mt.type}</option>
        )}
        </select>
      </div>

      <div className="viewTemplateWizard-formGroup">
        <label>Machine * ({filteredMachines.length} available)</label>
        <select
        value={config.machineId}
        onChange={(e) => updateConfig('machineId', e.target.value)}
        disabled={!config.machineTypeId || loading}>

          <option value="">Select Machine</option>
          {filteredMachines.map((m: any) =>
        <option key={m._id} value={m._id}>
              {m.machineName}
            </option>
        )}
        </select>
        {config.machineTypeId && filteredMachines.length === 0 && !loading &&
      <p className="viewTemplateWizard-hint">
            No machines found for this type.
            {machines.filter((m: any) => !m.machineType).length > 0 &&
        <> ({machines.filter((m: any) => !m.machineType).length} machines have no type assigned)</>
        }
          </p>
      }
      </div>
    </div>;


  // Get selected order type's allowed option types
  const selectedOrderType = orderTypes.find((ot: any) => ot._id === config.orderTypeId);
  const allowedOptionTypes = selectedOrderType?.allowedOptionTypes || [];

  // Step 2: Order Type Selection
  const renderStep2 = () =>
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
        }}>

          <option value="">Select Order Type</option>
          {orderTypes.map((ot: any) =>
        <option key={ot._id} value={ot._id}>{ot.typeName}</option>
        )}
        </select>
      </div>

      {/* Warning: Existing Template Found - One Order Type = One Template Rule */}
      {checkingExistingTemplate &&
    <div className="viewTemplateWizard-info">
          <Loader2 size={16} className="spinning" /> Checking for existing template...
        </div>
    }
      {existingTemplateForOrderType && !checkingExistingTemplate &&
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
    }

      {config.orderTypeId &&
    <div className="viewTemplateWizard-section">
          <div style={{
        background: '#fef3c7',
        border: '1px solid #fcd34d',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>
              <strong>📋 Production Specifications</strong> - These Option Types are configured for order creation.
              <br />
              <strong>👁 Operator View</strong> - Select which of these to show operators in their work view.
            </p>
          </div>

          <h4>Available Option Types (Production Specifications)</h4>
          <p className="viewTemplateWizard-hint">
            ✓ Check option types to include in the Operator View Template. Operators will see the selected specifications.
          </p>

          {allowedOptionTypes.length === 0 ?
      <div className="viewTemplateWizard-emptyState">
              No option types configured for this order type. Configure them in Order Type settings first.
            </div> :

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
                  }} />

                      <span className="viewTemplateWizard-optionTypeName">{opt.name}</span>
                      {opt.category &&
                <span className="viewTemplateWizard-optionTypeCategory">{opt.category}</span>
                }
                    </label>

                    {/* Show loading indicator */}
                    {isLoading &&
              <div className="viewTemplateWizard-loading">
                        <Loader2 size={16} className="spinning" /> Loading OptionSpecs...
                      </div>
              }

                    {/* Show OptionSpecs with their specifications - with checkboxes */}
                    {isSelected && !isLoading && optionSpecs.length > 0 &&
              <div className="viewTemplateWizard-optionSpecsList">
                        <span className="viewTemplateWizard-specsLabel">OptionSpecs ({optionSpecs.length}):</span>
                        {optionSpecs.map((spec: any) => {
                  const isSpecSelected = config.optionSpecIds.includes(spec._id);
                  return (
                    <div key={spec._id} className="viewTemplateWizard-optionSpecItem" style={{
                      border: isSpecSelected ? '2px solid #10b981' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '8px',
                      background: isSpecSelected ? '#ecfdf5' : 'white'
                    }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                  <input
                            type="checkbox"
                            checked={isSpecSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateConfig('optionSpecIds', [...config.optionSpecIds, spec._id]);
                              } else {
                                updateConfig('optionSpecIds', config.optionSpecIds.filter((id: string) => id !== spec._id));
                                // Clear selected fields for this spec
                                setSelectedSpecFields((prev) => {
                                  const { [spec._id]: _, ...rest } = prev;
                                  return rest;
                                });
                                setSpecShowYesNo((prev) => {
                                  const { [spec._id]: _, ...rest } = prev;
                                  return rest;
                                });
                              }
                            }}
                            style={{ accentColor: '#10b981', width: '16px', height: '16px' }} />

                                  <span style={{ fontWeight: '600', color: '#374151' }}>{spec.name}</span>
                                  {spec.code && <span style={{ fontSize: '12px', color: '#6b7280', background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>{spec.code}</span>}
                                </label>
                                {isSpecSelected &&
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                                    <input
                            type="checkbox"
                            checked={specShowYesNo[spec._id] || false}
                            onChange={(e) => setSpecShowYesNo((prev) => ({ ...prev, [spec._id]: e.target.checked }))}
                            style={{ accentColor: '#8b5cf6', width: '14px', height: '14px' }} />

                                    <span style={{ background: specShowYesNo[spec._id] ? '#ddd6fe' : '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: specShowYesNo[spec._id] ? '#7c3aed' : '#6b7280' }}>
                                      Show as Yes/No
                                    </span>
                                  </label>
                        }
                              </div>
                              {/* Specification fields with checkboxes */}
                              {spec.specifications && spec.specifications.length > 0 &&
                      <div className="viewTemplateWizard-specsTags" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {spec.specifications.map((s: any, idx: number) => {
                          const isFieldSelected = selectedSpecFields[spec._id]?.includes(s.name);
                          return (
                            <label key={idx} style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              padding: '4px 8px',
                              background: isFieldSelected ? '#dcfce7' : '#f9fafb',
                              border: isFieldSelected ? '2px solid #22c55e' : '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}>
                                        <input
                                type="checkbox"
                                checked={isFieldSelected}
                                onChange={(e) => {
                                  const specId = spec._id;
                                  const fieldName = s.name;
                                  setSelectedSpecFields((prev) => {
                                    const currentFields = prev[specId] || [];
                                    if (e.target.checked) {
                                      return { ...prev, [specId]: [...currentFields, fieldName] };
                                    } else {
                                      const newFields = currentFields.filter((f) => f !== fieldName);
                                      if (newFields.length === 0) {
                                        const { [specId]: _, ...rest } = prev;
                                        return rest;
                                      }
                                      return { ...prev, [specId]: newFields };
                                    }
                                  });
                                  // Auto-select the OptionSpec if not already
                                  if (e.target.checked && !config.optionSpecIds.includes(specId)) {
                                    updateConfig('optionSpecIds', [...config.optionSpecIds, specId]);
                                  }
                                }}
                                style={{ accentColor: '#22c55e', width: '12px', height: '12px' }} />

                                        <strong>{s.name}</strong>
                                        {s.unit && <span style={{ color: '#6b7280' }}>({s.unit})</span>}
                                        <span style={{
                                fontSize: '9px',
                                background: isFieldSelected ? '#bbf7d0' : '#e5e7eb',
                                padding: '1px 4px',
                                borderRadius: '2px',
                                color: '#6b7280',
                                textTransform: 'uppercase'
                              }}>{s.dataType}</span>
                                      </label>);

                        })}
                                </div>
                      }
                            </div>);

                })}
                      </div>
              }

                    {/* No OptionSpecs found */}
                    {isSelected && !isLoading && optionSpecs.length === 0 &&
              <div className="viewTemplateWizard-emptySpecs">
                        No OptionSpecs found for this type. Create OptionSpecs first.
                      </div>
              }
                  </div>);

        })}
            </div>
      }
        </div>
    }

      {/* Selected Options Management Panel */}
      {config.optionTypeIds.length > 0 &&
    <div className="viewTemplateWizard-selectedPanel" style={{
      marginTop: '20px',
      padding: '16px',
      background: '#f0fdf4',
      border: '2px solid #10b981',
      borderRadius: '12px'
    }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, color: '#065f46', fontSize: '14px' }}>
              👁 Selected for Operator View
            </h4>
            <button
          type="button"
          onClick={() => {
            updateConfig('optionTypeIds', []);
            updateConfig('optionSpecIds', []);
            setSelectedSpecFields({});
            setSpecShowYesNo({});
          }}
          style={{
            padding: '6px 12px',
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}>

              Clear All Selections
            </button>
          </div>

          {/* Selected Option Types with their specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {config.optionTypeIds.map((typeId: string) => {
          const optType = allowedOptionTypes.find((o: any) => o._id === typeId);
          const optionSpecs = optionSpecsByType[typeId] || [];
          const selectedSpecsForType = config.optionSpecIds.filter((specId: string) =>
          optionSpecs.some((os: any) => os._id === specId)
          );

          return (
            <div key={typeId} style={{
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1fae5'
            }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>{optType?.name || 'Unknown'}</span>
                      <span style={{
                    fontSize: '11px',
                    background: '#dcfce7',
                    color: '#166534',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                        {selectedSpecsForType.length}/{optionSpecs.length} specs
                      </span>
                      {Object.keys(selectedSpecFields).filter((sid) => optionSpecs.some((os: any) => os._id === sid)).length > 0 &&
                  <span style={{
                    fontSize: '11px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                          {Object.entries(selectedSpecFields).
                    filter(([sid]) => optionSpecs.some((os: any) => os._id === sid)).
                    reduce((sum, [, fields]) => sum + fields.length, 0)} fields
                        </span>
                  }
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Select All Specs button */}
                      <button
                    type="button"
                    onClick={() => {
                      const allSpecIds = optionSpecs.map((os: any) => os._id);
                      const currentSpecIds = config.optionSpecIds.filter((id: string) => !allSpecIds.includes(id));
                      updateConfig('optionSpecIds', [...currentSpecIds, ...allSpecIds]);
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#d1fae5',
                      color: '#065f46',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                    title="Select all specs for this type">

                        All
                      </button>
                      {/* Deselect All Specs button */}
                      <button
                    type="button"
                    onClick={() => {
                      const allSpecIds = optionSpecs.map((os: any) => os._id);
                      updateConfig('optionSpecIds', config.optionSpecIds.filter((id: string) => !allSpecIds.includes(id)));
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#fef3c7',
                      color: '#92400e',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                    title="Deselect all specs for this type">

                        None
                      </button>
                      {/* Remove Option Type button */}
                      <button
                    type="button"
                    onClick={() => {
                      updateConfig('optionTypeIds', config.optionTypeIds.filter((id: string) => id !== typeId));
                      // Also remove all specs for this type
                      const allSpecIds = optionSpecs.map((os: any) => os._id);
                      updateConfig('optionSpecIds', config.optionSpecIds.filter((id: string) => !allSpecIds.includes(id)));
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                    title="Remove this option type">

                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Show selected specs as tags */}
                  {selectedSpecsForType.length > 0 &&
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {selectedSpecsForType.map((specId: string) => {
                  const spec = optionSpecs.find((os: any) => os._id === specId);
                  const fieldsCount = selectedSpecFields[specId]?.length || 0;
                  return (
                    <span key={specId} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      background: '#ecfdf5',
                      color: '#065f46',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #a7f3d0'
                    }}>
                            {spec?.name || 'Unknown'}
                            {fieldsCount > 0 && <span style={{ color: '#0369a1' }}>({fieldsCount})</span>}
                            <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateConfig('optionSpecIds', config.optionSpecIds.filter((id: string) => id !== specId));
                          // Clear selected fields for this spec
                          setSelectedSpecFields((prev) => {
                            const { [specId]: _, ...rest } = prev;
                            return rest;
                          });
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '0',
                          marginLeft: '2px',
                          fontSize: '12px',
                          lineHeight: 1
                        }}>

                              ×
                            </button>
                          </span>);

                })}
                    </div>
              }
                </div>);

        })}
          </div>

          {/* Summary */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #d1fae5', fontSize: '12px', color: '#065f46' }}>
            <strong>Total: </strong>
            {config.optionTypeIds.length} Option Types, {' '}
            {config.optionSpecIds.length} OptionSpecs, {' '}
            {Object.values(selectedSpecFields).flat().length} Fields selected
          </div>
        </div>
    }
    </div>;


  // Step 3: Specification Display Items
  const renderStep3 = () =>
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
          disabled={config.optionTypeIds.length === 0}>

            <Plus size={14} /> Add Display Item
          </button>
        </div>

        {config.optionTypeIds.length === 0 ?
      <p className="viewTemplateWizard-hint">
            Please select Option Types in Step 2 first to add display items.
          </p> :
      config.displayItems.length === 0 ?
      <p className="viewTemplateWizard-hint">
            Add display items to show specification values (gauge, width, images, etc.) in the operator info section.
          </p> :

      <div className="viewTemplateWizard-displayItems">
            {config.displayItems.map((item, index) =>
        <div key={item.id} className="viewTemplateWizard-displayItem">
                <div className="viewTemplateWizard-displayItemHeader">
                  <span className="viewTemplateWizard-displayItemNum">{index + 1}</span>
                  <input
              type="text"
              value={item.label}
              onChange={(e) => updateDisplayItem(index, 'label', e.target.value)}
              placeholder="Display Label"
              className="viewTemplateWizard-displayItemLabel" />

                  <button
              type="button"
              className="viewTemplateWizard-iconBtn danger"
              onClick={() => removeDisplayItem(index)}
              title="Remove">

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
                  onChange={(e) => updateDisplayItem(index, 'displayType', e.target.value as DisplayItemType)}>

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
                    updateDisplayItem(index, 'formula', undefined);
                    // Set displayType to formula if formula source selected
                    if (e.target.value === 'formula') {
                      updateDisplayItem(index, 'displayType', 'formula');
                    }
                  }}>

                        <option value="customer">Customer</option>
                        <option value="optionSpec">Option Specifications</option>
                        <option value="order">Order</option>
                        <option value="formula">Formula (combine multiple fields)</option>
                      </select>
                    </div>

                    {/* Unit (for number type) */}
                    {item.displayType === 'number' &&
              <div className="viewTemplateWizard-formGroup">
                        <label>Unit</label>
                        <input
                  type="text"
                  value={item.unit || ''}
                  onChange={(e) => updateDisplayItem(index, 'unit', e.target.value)}
                  placeholder="e.g., mm, kg" />

                      </div>
              }
                  </div>

                  {/* OptionSpec Source Configuration */}
                  {item.sourceType === 'optionSpec' &&
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
                    }}>

                          <option value="">Select Option Type</option>
                          {allowedOptionTypes.
                    filter((opt: any) => config.optionTypeIds.includes(opt._id)).
                    map((opt: any) =>
                    <option key={opt._id} value={opt._id}>{opt.name}</option>
                    )}
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
                    disabled={!item.optionTypeId}>

                          <option value="">Select Option Spec</option>
                          {item.optionTypeId && (optionSpecsByType[item.optionTypeId] || []).map((spec: any) =>
                    <option key={spec._id} value={spec._id}>
                              {spec.name} ({spec.code})
                            </option>
                    )}
                        </select>
                      </div>

                      {/* Spec Field - show for non-formula types OR when not using formula mode */}
                      {item.displayType !== 'formula' && !item.formula?.expression &&
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
                    disabled={!item.optionSpecId}>

                            <option value="">Select Spec Field</option>
                            {item.optionSpecId && (() => {
                      const optionSpecs = optionSpecsByType[item.optionTypeId || ''] || [];
                      const selectedOptionSpec = optionSpecs.find((s: any) => s._id === item.optionSpecId);
                      return selectedOptionSpec?.specifications?.map((spec: any, idx: number) =>
                      <option key={idx} value={spec.name}>
                                  {spec.name} {spec.unit ? `(${spec.unit})` : ''} - {spec.dataType}
                                </option>
                      ) || null;
                    })()}
                          </select>
                        </div>
                }
                    </div>

                    {/* Use Formula Toggle - for number display type */}
                    {(item.displayType === 'number' || item.displayType === 'formula') &&
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
                    }} />

                          Use Formula (combine multiple spec fields)
                        </label>
                      </div>
              }

                    {/* Formula Builder - when formula type or checkbox checked */}
                    {(item.displayType === 'formula' || item.formula?.expression) && item.sourceType === 'optionSpec' &&
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
                    className="viewTemplateWizard-formulaInput" />

                        </div>

                        {/* Available Spec Fields for Formula */}
                        <div className="viewTemplateWizard-formulaFields">
                          <label>Available Spec Fields (click to add):</label>
                          <div className="viewTemplateWizard-fieldsList">
                            {config.optionTypeIds.map((typeId: string) => {
                      const optType = allowedOptionTypes.find((o: any) => o._id === typeId);
                      const optionSpecs = optionSpecsByType[typeId] || [];

                      return optionSpecs.flatMap((optSpec: any) =>
                      optSpec.specifications?.
                      filter((s: any) => s.dataType === 'number').
                      map((spec: any, idx: number) =>
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
                        title={`${optType?.name || 'Unknown'} - ${spec.name}`}>

                                      {spec.name}
                                      {spec.unit && <small> ({spec.unit})</small>}
                                      <span className="viewTemplateWizard-fieldType">{optType?.name}</span>
                                    </button>
                      ) || []
                      );
                    })}

                          </div>
                        </div>
                      </div>
              }
                    </>
            }

                  {/* Customer Source */}
                  {item.sourceType === 'customer' &&
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
                  }}>

                          <option value="">Select Field</option>
                          <optgroup label="Customer Identity">
                            <option value="customer.name">Full Name</option>
                            <option value="customer.firstName">First Name</option>
                            <option value="customer.lastName">Last Name</option>
                            <option value="customer.companyName">Company Name</option>
                            <option value="customer.imageUrl">Customer Image</option>
                          </optgroup>
                          <optgroup label="Contact Information">
                            <option value="customer.phone1">Phone 1</option>
                            <option value="customer.phone2">Phone 2</option>
                            <option value="customer.whatsapp">WhatsApp</option>
                            <option value="customer.telephone">Telephone</option>
                            <option value="customer.email">Email</option>
                          </optgroup>
                          <optgroup label="Address">
                            <option value="customer.address1">Address 1</option>
                            <option value="customer.address2">Address 2</option>
                            <option value="customer.state">State</option>
                            <option value="customer.pinCode">Pin Code</option>
                            <option value="customer.fullAddress">Full Address</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
            }

                  {/* Order Source */}
                  {item.sourceType === 'order' &&
            <div className="viewTemplateWizard-formRow">
                      <div className="viewTemplateWizard-formGroup">
                        <label>Order Field</label>
                        <select
                  value={item.sourceField || ''}
                  onChange={(e) => {
                    updateDisplayItem(index, 'sourceField', e.target.value);
                    if (!item.label && e.target.value) {
                      updateDisplayItem(index, 'label', e.target.value.split('.').pop() || '');
                    }
                  }}>

                          <option value="">Select Field</option>
                          <optgroup label="Order Details">
                            <option value="order.orderId">Order ID</option>
                            <option value="order.orderDate">Order Date</option>
                            <option value="order.deliveryDate">Delivery Date</option>
                            <option value="order.quantity">Quantity</option>
                            <option value="order.instructions">Instructions</option>
                          </optgroup>
                          <optgroup label="Order Status">
                            <option value="order.status">Status</option>
                            <option value="order.priority">Priority</option>
                          </optgroup>
                          <optgroup label="Order Media">
                            <option value="order.imageUrl">Order Image</option>
                            <option value="order.attachments">Attachments</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
            }

                  {/* Formula Source - Combine multiple spec fields */}
                  {item.sourceType === 'formula' &&
            <div className="viewTemplateWizard-formulaBuilder" style={{ marginTop: '12px' }}>
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
                  className="viewTemplateWizard-formulaInput" />

                      </div>

                      {/* Available Spec Fields for Formula */}
                      <div className="viewTemplateWizard-formulaFields">
                        <label>Click fields to add to formula:</label>
                        <div className="viewTemplateWizard-fieldsList">
                          {config.optionTypeIds.map((typeId: string) => {
                    const optType = allowedOptionTypes.find((o: any) => o._id === typeId);
                    const optionSpecs = optionSpecsByType[typeId] || [];

                    return optionSpecs.flatMap((optSpec: any) =>
                    optSpec.specifications?.
                    filter((s: any) => s.dataType === 'number').
                    map((spec: any, idx: number) =>
                    <button
                      key={`formula-${optSpec._id}-${idx}`}
                      type="button"
                      className="viewTemplateWizard-fieldBtn spec"
                      onClick={() => {
                        const fieldRef = `${optType?.name}.${spec.name}`;
                        const currentExpr = item.formula?.expression || '';
                        updateDisplayItem(index, 'formula', {
                          expression: currentExpr + fieldRef,
                          dependencies: [...(item.formula?.dependencies || []), fieldRef]
                        });
                      }}
                      title={`${optType?.name || 'Unknown'} - ${spec.name}`}>

                                    {optType?.name}.{spec.name}
                                    {spec.unit && <small> ({spec.unit})</small>}
                                  </button>
                    ) || []
                    );
                  })}

                          {/* Operators */}
                          <div className="viewTemplateWizard-fieldsGroup operators" style={{ marginTop: '8px' }}>
                            <span className="viewTemplateWizard-fieldsGroupLabel">Operators:</span>
                            {['+', '-', '*', '/', '(', ')'].map((op) =>
                    <button
                      key={op}
                      type="button"
                      className="viewTemplateWizard-fieldBtn operator"
                      onClick={() => {
                        const currentExpr = item.formula?.expression || '';
                        updateDisplayItem(index, 'formula', {
                          expression: currentExpr + ` ${op} `,
                          dependencies: item.formula?.dependencies || []
                        });
                      }}>

                                {op}
                              </button>
                    )}
                          </div>
                        </div>
                      </div>

                      {/* Unit for formula result */}
                      <div className="viewTemplateWizard-formGroup" style={{ marginTop: '12px' }}>
                        <label>Result Unit</label>
                        <input
                  type="text"
                  value={item.unit || ''}
                  onChange={(e) => updateDisplayItem(index, 'unit', e.target.value)}
                  placeholder="e.g., kg, mm, pcs" />

                      </div>
                    </div>
            }

                  {/* Preview */}
                  {item.specField && item.sourceType === 'optionSpec' &&
            <div className="viewTemplateWizard-displayItemPreview">
                      <strong>Source:</strong> {item.optionTypeName} → {item.optionSpecName}.{item.specField}
                      {item.unit && <span className="unit"> ({item.unit})</span>}
                    </div>
            }
                  {item.sourceField && item.sourceType === 'customer' &&
            <div className="viewTemplateWizard-displayItemPreview">
                      <strong>Source:</strong> Customer → {item.sourceField.replace('customer.', '')}
                    </div>
            }
                  {item.sourceField && item.sourceType === 'order' &&
            <div className="viewTemplateWizard-displayItemPreview">
                      <strong>Source:</strong> Order → {item.sourceField.replace('order.', '')}
                    </div>
            }
                  {item.formula?.expression && item.sourceType === 'formula' &&
            <div className="viewTemplateWizard-displayItemPreview">
                      <strong>Formula:</strong> {item.formula.expression}
                      {item.unit && <span className="unit"> = Result ({item.unit})</span>}
                    </div>
            }
                </div>
              </div>
        )}
          </div>
      }
      </div>

      {/* Calculation Rules Section - For Same Option Type Calculations */}
      <div className="viewTemplateWizard-section" style={{ marginTop: '24px', border: '2px solid #10b981', borderRadius: '12px', background: '#f0fdf4' }}>
        <div className="viewTemplateWizard-sectionHeader" style={{ background: '#d1fae5', padding: '12px 16px', borderRadius: '10px 10px 0 0', marginBottom: '16px' }}>
          <h4 style={{ color: '#065f46', margin: 0 }}>📊 Calculation Rules (Same Option Type Totals)</h4>
          <button
          type="button"
          className="viewTemplateWizard-smallBtn"
          onClick={addCalculationRule}
          disabled={config.optionTypeIds.length === 0}
          style={{ background: '#10b981', color: 'white' }}>

            <Plus size={14} /> Add Rule
          </button>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <p className="viewTemplateWizard-hint" style={{ marginBottom: '16px', color: '#065f46' }}>
            When the same Option Type appears multiple times in an order (e.g., Product with qty=27, price=70 and Product with qty=20, price=80), calculate totals like Total Qty=47, Total Price=150.
          </p>

          {config.optionTypeIds.length === 0 ?
        <p className="viewTemplateWizard-hint">
              Please select Option Types in Step 2 first to add calculation rules.
            </p> :
        config.calculationRules.length === 0 ?
        <p className="viewTemplateWizard-hint">
              No calculation rules defined. Add rules to calculate totals when same option type appears multiple times.
            </p> :

        <div className="viewTemplateWizard-calculationRules">
              {config.calculationRules.map((rule, index) =>
          <div key={rule.id} style={{
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px'
          }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '600', color: '#374151' }}>Rule {index + 1}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label className="viewTemplateWizard-checkbox" style={{ marginRight: '12px' }}>
                        <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={(e) => updateCalculationRule(index, 'isActive', e.target.checked)} />

                        Active
                      </label>
                      <button
                  type="button"
                  className="viewTemplateWizard-iconBtn danger"
                  onClick={() => removeCalculationRule(index)}
                  title="Remove Rule">

                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="viewTemplateWizard-formRow">
                    {/* Rule Name */}
                    <div className="viewTemplateWizard-formGroup">
                      <label>Rule Name</label>
                      <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => updateCalculationRule(index, 'name', e.target.value)}
                  placeholder="e.g., Total Product Quantity" />

                    </div>

                    {/* Option Type */}
                    <div className="viewTemplateWizard-formGroup">
                      <label>Option Type</label>
                      <select
                  value={rule.optionTypeId}
                  onChange={(e) => {
                    const selectedOptType = allowedOptionTypes.find((o: any) => o._id === e.target.value);
                    updateCalculationRule(index, 'optionTypeId', e.target.value);
                    updateCalculationRule(index, 'optionTypeName', selectedOptType?.name || '');
                    updateCalculationRule(index, 'specField', '');
                  }}>

                        <option value="">Select Option Type</option>
                        {allowedOptionTypes.
                  filter((opt: any) => config.optionTypeIds.includes(opt._id)).
                  map((opt: any) =>
                  <option key={opt._id} value={opt._id}>{opt.name}</option>
                  )}
                      </select>
                    </div>
                  </div>

                  <div className="viewTemplateWizard-formRow">
                    {/* Spec Field to Calculate */}
                    <div className="viewTemplateWizard-formGroup">
                      <label>Spec Field to Calculate</label>
                      <select
                  value={rule.specField}
                  onChange={(e) => updateCalculationRule(index, 'specField', e.target.value)}
                  disabled={!rule.optionTypeId}>

                        <option value="">Select Field</option>
                        {rule.optionTypeId && (optionSpecsByType[rule.optionTypeId] || []).flatMap((optSpec: any) =>
                  optSpec.specifications?.
                  filter((s: any) => s.dataType === 'number').
                  map((spec: any, idx: number) =>
                  <option key={`${optSpec._id}-${idx}`} value={spec.name}>
                                {spec.name} {spec.unit ? `(${spec.unit})` : ''} - {optSpec.name}
                              </option>
                  ) || []
                  )}
                      </select>
                    </div>

                    {/* Calculation Type */}
                    <div className="viewTemplateWizard-formGroup">
                      <label>Calculation Type</label>
                      <select
                  value={rule.calculationType}
                  onChange={(e) => updateCalculationRule(index, 'calculationType', e.target.value)}>

                        <option value="SUM">SUM (Add All)</option>
                        <option value="AVERAGE">AVERAGE</option>
                        <option value="MULTIPLY">MULTIPLY</option>
                        <option value="MIN">MIN (Smallest)</option>
                        <option value="MAX">MAX (Largest)</option>
                        <option value="DIFFERENCE">DIFFERENCE</option>
                        <option value="PERCENTAGE_DIFF">PERCENTAGE DIFFERENCE</option>
                      </select>
                    </div>
                  </div>

                  <div className="viewTemplateWizard-formRow">
                    {/* Multiple Occurrence Handling */}
                    <div className="viewTemplateWizard-formGroup">
                      <label>Multiple Occurrence Handling</label>
                      <select
                  value={rule.multipleOccurrence}
                  onChange={(e) => updateCalculationRule(index, 'multipleOccurrence', e.target.value)}>

                        <option value="ALL_SUM">SUM All Occurrences</option>
                        <option value="AVERAGE_ALL">Average All</option>
                        <option value="MULTIPLY_ALL">Multiply All</option>
                        <option value="FIRST_MINUS_SECOND">First - Second</option>
                        <option value="SECOND_MINUS_FIRST">Second - First</option>
                      </select>
                    </div>

                    {/* Result Label */}
                    <div className="viewTemplateWizard-formGroup">
                      <label>Result Column Name</label>
                      <input
                  type="text"
                  value={rule.resultLabel || ''}
                  onChange={(e) => updateCalculationRule(index, 'resultLabel', e.target.value)}
                  placeholder="e.g., Total Quantity, Total Price" />

                    </div>

                    {/* Result Unit */}
                    <div className="viewTemplateWizard-formGroup">
                      <label>Unit</label>
                      <input
                  type="text"
                  value={rule.resultUnit || ''}
                  onChange={(e) => updateCalculationRule(index, 'resultUnit', e.target.value)}
                  placeholder="e.g., kg, pcs, ₹" />

                    </div>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <label className="viewTemplateWizard-checkbox">
                      <input
                  type="checkbox"
                  checked={rule.showInSummary}
                  onChange={(e) => updateCalculationRule(index, 'showInSummary', e.target.checked)} />

                      Show in Summary Section
                    </label>
                  </div>

                  {/* Preview */}
                  {rule.specField && rule.resultLabel &&
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#4b5563'
            }}>
                      <strong>Preview:</strong> Calculate <strong>{rule.calculationType}</strong> of "{rule.specField}" from all "{rule.optionTypeName}" occurrences → Show as "<strong>{rule.resultLabel}</strong>" {rule.resultUnit && `(${rule.resultUnit})`}
                    </div>
            }
                </div>
          )}
            </div>
        }
        </div>
      </div>
    </div>;


  // Step 4: Column Builder
  const renderStep4 = () =>
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
        {columnTemplates.map((tpl, idx) =>
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
          setConfig((prev) => ({
            ...prev,
            columns: [...prev.columns, newColumn]
          }));
        }}>

            {tpl.name}
          </button>
      )}
      </div>

      <div className="viewTemplateWizard-columns">
        {config.columns.map((col, index) =>
      <div key={col.id} className="viewTemplateWizard-columnItem">
            <div
          className="viewTemplateWizard-columnHeader"
          onClick={() => setExpandedColumn(expandedColumn === index ? null : index)}>

              <span className="viewTemplateWizard-columnName">
                {col.label || col.name || `Column ${index + 1}`}
              </span>
              <div className="viewTemplateWizard-columnMeta">
                <span className="viewTemplateWizard-columnType">{col.dataType}</span>
                {col.isRequired && <span className="viewTemplateWizard-required">Required</span>}
                <button
              type="button"
              className="viewTemplateWizard-iconBtn"
              onClick={(e) => {e.stopPropagation();duplicateColumn(index);}}
              title="Duplicate">

                  <Copy size={14} />
                </button>
                {config.columns.length > 1 &&
            <button
              type="button"
              className="viewTemplateWizard-iconBtn danger"
              onClick={(e) => {e.stopPropagation();removeColumn(index);}}
              title="Delete">

                    <Trash2 size={14} />
                  </button>
            }
              </div>
            </div>

            {expandedColumn === index &&
        <div className="viewTemplateWizard-columnBody">
                <div className="viewTemplateWizard-formRow">
                  <div className="viewTemplateWizard-formGroup">
                    <label>Column Name *</label>
                    <input
                type="text"
                value={col.name}
                onChange={(e) => updateColumn(index, 'name', e.target.value)}
                placeholder="e.g., grossWeight" />

                  </div>
                  <div className="viewTemplateWizard-formGroup">
                    <label>Display Label</label>
                    <input
                type="text"
                value={col.label}
                onChange={(e) => updateColumn(index, 'label', e.target.value)}
                placeholder="e.g., Gross Weight" />

                  </div>
                </div>

                <div className="viewTemplateWizard-formRow">
                  <div className="viewTemplateWizard-formGroup">
                    <label>Data Type</label>
                    <select
                value={col.dataType}
                onChange={(e) => updateColumn(index, 'dataType', e.target.value as ColumnDataType)}>

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
                placeholder="e.g., kg, g, mm" />

                  </div>
                  <div className="viewTemplateWizard-formGroup">
                    <label>Width (px)</label>
                    <input
                type="number"
                value={col.width}
                onChange={(e) => updateColumn(index, 'width', parseInt(e.target.value) || 150)}
                min="50"
                max="500" />

                  </div>
                </div>

                {/* Formula configuration */}
                {col.dataType === 'formula' &&
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
                  placeholder="e.g., (Material.gauge * Product.width) / 3300" />

                        <button
                  type="button"
                  className="viewTemplateWizard-helpBtn"
                  onClick={() => {
                    setSelectedFormulaColumn(index);
                    setShowFormulaHelper(true);
                  }}>

                          Templates
                        </button>
                      </div>
                    </div>

                    {/* Available fields for formula */}
                    <div className="viewTemplateWizard-formulaFields">
                      <label>Available Fields:</label>
                      <div className="viewTemplateWizard-fieldsList">
                        {/* Manual columns */}
                        {config.columns.filter((c) => c.name && c.id !== col.id && c.dataType !== 'formula').length > 0 &&
                <div className="viewTemplateWizard-fieldsGroup">
                            <span className="viewTemplateWizard-fieldsGroupLabel">Manual Columns:</span>
                            {config.columns.
                  filter((c) => c.name && c.id !== col.id && c.dataType !== 'formula').
                  map((c) =>
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
                    }}>

                                  {c.name}
                                </button>
                  )}
                          </div>
                }

                        {/* Option Spec fields from loaded OptionSpecs */}
                        {config.optionTypeIds.length > 0 &&
                <div className="viewTemplateWizard-fieldsGroup">
                            <span className="viewTemplateWizard-fieldsGroupLabel">Option Specs:</span>
                            {config.optionTypeIds.map((typeId: string) => {
                    const optType = allowedOptionTypes.find((o: any) => o._id === typeId);
                    const optionSpecs = optionSpecsByType[typeId] || [];

                    return optionSpecs.flatMap((optSpec: any) =>
                    optSpec.specifications?.
                    filter((s: any) => s.dataType === 'number').
                    map((spec: any, idx: number) =>
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
                      }}>

                                      {optType?.name}.{spec.name}
                                    </button>
                    ) || []
                    );
                  })}
                          </div>
                }

                        {/* Operators */}
                        <div className="viewTemplateWizard-fieldsGroup operators">
                          <span className="viewTemplateWizard-fieldsGroupLabel">Operators:</span>
                          {['+', '-', '*', '/', '(', ')', '.'].map((op) =>
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
                    }}>

                              {op}
                            </button>
                  )}
                        </div>
                      </div>
                    </div>
                  </div>
          }

                {/* Dropdown options */}
                {col.dataType === 'dropdown' &&
          <div className="viewTemplateWizard-dropdownSection">
                    <label>Dropdown Options</label>
                    <textarea
              value={col.dropdownOptions?.map((o) => o.label).join('\n') || ''}
              onChange={(e) => {
                const options = e.target.value.split('\n').filter((v) => v.trim()).map((v) => ({
                  label: v.trim(),
                  value: v.trim().toLowerCase().replace(/\s+/g, '_')
                }));
                updateColumn(index, 'dropdownOptions', options);
              }}
              placeholder="Enter one option per line"
              rows={4} />

                  </div>
          }

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
                }}>

                      <option value="manual">Manual Entry</option>
                      <option value="order">From Order</option>
                      <option value="customer">From Customer</option>
                      <option value="optionSpec">From Option Spec</option>
                      <option value="calculated">Auto Calculated</option>
                    </select>
                  </div>
                </div>

                {/* Option Spec configuration - show when optionSpec is selected */}
                {col.sourceType === 'optionSpec' &&
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
                  }}>

                          <option value="">Select Option Type</option>
                          {/* Only show option types selected in Step 2 */}
                          {allowedOptionTypes.
                  filter((opt: any) => config.optionTypeIds.includes(opt._id)).
                  map((opt: any) =>
                  <option key={opt._id} value={opt._id}>{opt.name}</option>
                  )}
                        </select>
                        {config.optionTypeIds.length === 0 &&
                <p className="viewTemplateWizard-warning">
                            Please select option types in Step 2 first
                          </p>
                }
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
                  disabled={!col.optionTypeId}>

                          <option value="">Select Option Spec</option>
                          {col.optionTypeId && (optionSpecsByType[col.optionTypeId] || []).map((spec: any) =>
                  <option key={spec._id} value={spec._id}>
                              {spec.name} ({spec.code})
                            </option>
                  )}
                        </select>
                        {col.optionTypeId && (optionSpecsByType[col.optionTypeId] || []).length === 0 &&
                <p className="viewTemplateWizard-warning">
                            No OptionSpecs found. Create OptionSpecs for this type first.
                          </p>
                }
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
                  disabled={!col.optionSpecId}>

                          <option value="">Select Spec Field</option>
                          {col.optionSpecId && (() => {
                    const optionSpecs = optionSpecsByType[col.optionTypeId || ''] || [];
                    const selectedOptionSpec = optionSpecs.find((s: any) => s._id === col.optionSpecId);
                    return selectedOptionSpec?.specifications?.map((spec: any, idx: number) =>
                    <option key={idx} value={spec.name}>
                                {spec.name} {spec.unit ? `(${spec.unit})` : ''} - {spec.dataType}
                              </option>
                    ) || null;
                  })()}
                        </select>
                      </div>
                    </div>

                    {col.optionTypeId && col.optionSpecId && col.specField &&
            <div className="viewTemplateWizard-specPreview">
                        <strong>Source:</strong> {col.optionTypeName} → {col.optionSpecName}.{col.specField}
                        {col.specFieldUnit && <span className="unit"> ({col.specFieldUnit})</span>}
                      </div>
            }
                  </div>
          }

                {/* Flags */}
                <div className="viewTemplateWizard-flags">
                  <label className="viewTemplateWizard-checkbox">
                    <input
                type="checkbox"
                checked={col.isRequired}
                onChange={(e) => updateColumn(index, 'isRequired', e.target.checked)} />

                    Required
                  </label>
                  <label className="viewTemplateWizard-checkbox">
                    <input
                type="checkbox"
                checked={col.isReadOnly}
                onChange={(e) => updateColumn(index, 'isReadOnly', e.target.checked)} />

                    Read Only
                  </label>
                  <label className="viewTemplateWizard-checkbox">
                    <input
                type="checkbox"
                checked={col.isVisible}
                onChange={(e) => updateColumn(index, 'isVisible', e.target.checked)} />

                    Visible
                  </label>
                </div>
              </div>
        }
          </div>
      )}
      </div>

      {/* Totals Configuration */}
      <div className="viewTemplateWizard-section" style={{
      background: '#f0fdf4',
      border: '2px solid #22c55e',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '24px'
    }}>
        <div className="viewTemplateWizard-sectionHeader" style={{ marginBottom: '12px' }}>
          <h4 style={{ color: '#166534', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Totals Configuration
          </h4>
          <button
          type="button"
          className="viewTemplateWizard-smallBtn"
          onClick={addTotal}
          style={{
            background: '#22c55e',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>

            <Plus size={14} /> Add Total
          </button>
        </div>

        {config.totalsConfig.length === 0 ?
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0' }}>
            Click "Add Total" to configure summary calculations for your columns (SUM, AVERAGE, MIN, MAX, etc.)
          </p> :

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {config.totalsConfig.map((tc, index) =>
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #d1d5db'
        }}>
                <span style={{ fontWeight: '600', color: '#374151', minWidth: '20px' }}>{index + 1}.</span>
                <select
            value={tc.columnName}
            onChange={(e) => updateTotal(index, 'columnName', e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>

                  <option value="">Select Column</option>
                  {config.columns.map((col) =>
            <option key={col.id} value={col.name}>{col.label || col.name} ({col.dataType})</option>
            )}
                </select>
                <select
            value={tc.formula}
            onChange={(e) => updateTotal(index, 'formula', e.target.value as FormulaType)}
            style={{ width: '140px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>

                  <option value="SUM">SUM (Total)</option>
                  <option value="AVERAGE">AVERAGE (Mean)</option>
                  <option value="COUNT">COUNT (Qty)</option>
                  <option value="MULTIPLY">MULTIPLY</option>
                  <option value="DIVIDE">DIVIDE</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
                <input
            type="text"
            value={tc.label}
            onChange={(e) => updateTotal(index, 'label', e.target.value)}
            placeholder="Label (e.g., Total Weight)"
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />

                <button
            type="button"
            onClick={() => removeTotal(index)}
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              padding: '8px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>

                  <Trash2 size={16} />
                </button>
              </div>
        )}
          </div>
      }
      </div>

      {/* Formula Helper Modal */}
      {showFormulaHelper &&
    <div className="viewTemplateWizard-modal">
          <div className="viewTemplateWizard-modalContent">
            <h4>Formula Templates</h4>
            <div className="viewTemplateWizard-formulaList">
              {formulaTemplates.map((template, idx) =>
          <div
            key={idx}
            className="viewTemplateWizard-formulaItem"
            onClick={() => selectedFormulaColumn !== null && applyFormulaTemplate(template, selectedFormulaColumn)}>

                  <strong>{template.name}</strong>
                  <code>{template.expression || 'Custom expression'}</code>
                  <span>{template.description}</span>
                </div>
          )}
            </div>
            <button
          type="button"
          className="viewTemplateWizard-closeBtn"
          onClick={() => setShowFormulaHelper(false)}>

              Close
            </button>
          </div>
        </div>
    }
    </div>;


  // Step 5: Save Template
  const renderStep5 = () =>
  <div className="viewTemplateWizard-stepContent">
      <h3>Step 5: {isEditingExisting ? 'Update Template' : 'Save Template'}</h3>
      <p className="viewTemplateWizard-stepDesc">Review and {isEditingExisting ? 'update' : 'save'} your template configuration</p>

      {/* Edit vs Create indicator */}
      {isEditingExisting && existingTemplateForOrderType &&
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
    }

      <div className="viewTemplateWizard-formGroup">
        <label>Template Name *</label>
        <input
        type="text"
        value={config.templateName}
        onChange={(e) => updateConfig('templateName', e.target.value)}
        placeholder="e.g., Extrusion Weight Tracking" />

      </div>

      <div className="viewTemplateWizard-formGroup">
        <label>Description</label>
        <textarea
        value={config.description}
        onChange={(e) => updateConfig('description', e.target.value)}
        placeholder="Optional description of this template"
        rows={3} />

      </div>

      {/* Production Information Section */}
      <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', border: '1px solid #fcd34d', marginTop: '20px' }}>
        <h4 style={{ color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} />
          Production Information
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Machine</span>
            <div style={{ fontWeight: '600', color: '#1f2937' }}>
              {machines.find((m: any) => m._id === config.machineId)?.machineName || 'Not selected'}
            </div>
          </div>
          <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Order Type</span>
            <div style={{ fontWeight: '600', color: '#1f2937' }}>
              {orderTypes.find((ot: any) => ot._id === config.orderTypeId)?.typeName || 'Not selected'}
            </div>
          </div>
        </div>

        {/* Selected Option Types */}
        {config.optionTypeIds.length > 0 &&
      <div>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#92400e' }}>
              Selected Option Types ({config.optionTypeIds.length})
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {config.optionTypeIds.map((typeId) => {
            const ot = optionTypes.find((t: any) => t._id === typeId);
            const specsForThisType = optionSpecsByType[typeId] || [];
            const selectedSpecsForType = config.selectedSpecifications.filter((s) =>
            specsForThisType.some((os: any) => os._id === s.optionSpecId)
            );
            return ot ?
            <div key={typeId} style={{
              padding: '8px 12px',
              background: 'white',
              borderRadius: '6px',
              border: '1px solid #fcd34d'
            }}>
                    <strong style={{ color: '#92400e' }}>{ot.optionTypeName}</strong>
                    <span style={{ fontSize: '11px', marginLeft: '8px', color: '#666' }}>
                      ({selectedSpecsForType.length} specs)
                    </span>
                  </div> :
            null;
          })}
            </div>
          </div>
      }

        {/* Selected Option Specs */}
        {config.selectedSpecifications.length > 0 &&
      <div style={{ marginTop: '12px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#92400e' }}>
              Selected Option Specs ({config.selectedSpecifications.length})
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {config.selectedSpecifications.map((spec) => {
            // Find the optionSpec across all types
            let foundSpec: any = null;
            for (const typeId of Object.keys(optionSpecsByType)) {
              const found = optionSpecsByType[typeId]?.find((os: any) => os._id === spec.optionSpecId);
              if (found) {foundSpec = found;break;}
            }
            return foundSpec ?
            <span key={spec.optionSpecId} style={{
              padding: '4px 8px',
              fontSize: '12px',
              background: 'white',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              color: '#374151'
            }}>
                    {foundSpec.optionSpecName}
                    {spec.fields.length > 0 &&
              <span style={{ marginLeft: '4px', color: '#9ca3af' }}>
                        [{spec.fields.join(', ')}]
                      </span>
              }
                    {spec.showYesNo &&
              <span style={{ marginLeft: '4px', color: '#16a34a' }}>✓Y/N</span>
              }
                  </span> :
            null;
          })}
            </div>
          </div>
      }
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
            <strong>{config.columns.filter((c) => c.name).length}</strong>
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
        {config.displayItems.length > 0 &&
      <>
            <h5>Display Items Preview</h5>
            <div className="viewTemplateWizard-displayPreview">
              {config.displayItems.filter((item) => item.isVisible).map((item) =>
          <div key={item.id} className="viewTemplateWizard-displayPreviewItem">
                  <span className="label">{item.label}:</span>
                  <span className="type">{item.displayType}</span>
                  {item.sourceType === 'optionSpec' && item.optionTypeName &&
            <span className="source">{item.optionTypeName}.{item.specField || 'name'}</span>
            }
                  {item.sourceType === 'formula' &&
            <span className="source">Formula</span>
            }
                  {item.unit && <span className="unit">({item.unit})</span>}
                </div>
          )}
            </div>
          </>
      }

        <h5>Columns Preview</h5>
        <div className="viewTemplateWizard-previewTable">
          <table>
            <thead>
              <tr>
                {config.columns.filter((c) => c.name && c.isVisible).map((col) =>
              <th key={col.id} style={{ width: col.width }}>
                    {col.label || col.name}
                    {col.unit && <span className="unit">({col.unit})</span>}
                  </th>
              )}
              </tr>
            </thead>
            <tbody>
              <tr>
                {config.columns.filter((c) => c.name && c.isVisible).map((col) =>
              <td key={col.id}>
                    {col.dataType === 'formula' ? <em>Auto</em> : '-'}
                  </td>
              )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>;


  // Edit Sections View - shows when editing existing template
  const renderEditSectionsView = () =>
  <div className="viewTemplateWizard-editSectionsView">
      <div className="viewTemplateWizard-editSectionsHeader">
        <h3>Edit Template Sections</h3>
        <p className="viewTemplateWizard-stepDesc">
          Click on a section to expand and edit. Save each section individually.
        </p>
        <button
        type="button"
        className="viewTemplateWizard-switchModeBtn"
        onClick={() => setShowEditSectionsView(false)}>

          <ChevronLeft size={14} /> Back to Wizard View
        </button>
      </div>

      {/* Display Items Section */}
      <div className={`viewTemplateWizard-sectionCard ${expandedEditSection === 'display' ? 'expanded' : ''}`}>
        <div
        className="viewTemplateWizard-sectionCardHeader"
        onClick={() => toggleEditSection('display')}>

          <div className="viewTemplateWizard-sectionCardTitle">
            <Eye size={18} />
            <span>Display Items</span>
            <span className="viewTemplateWizard-sectionBadge">
              {config.displayItems.length} items
            </span>
          </div>
          <div className="viewTemplateWizard-sectionCardActions">
            {expandedEditSection !== 'display' &&
          <button type="button" className="viewTemplateWizard-editBtn">
                <Edit2 size={14} /> Edit
              </button>
          }
            {expandedEditSection === 'display' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Section Summary (when collapsed) */}
        {expandedEditSection !== 'display' && config.displayItems.length > 0 &&
      <div className="viewTemplateWizard-sectionSummary">
            {config.displayItems.slice(0, 4).map((item, idx) =>
        <span key={item.id} className="viewTemplateWizard-summaryTag">
                {item.label || `Item ${idx + 1}`}
              </span>
        )}
            {config.displayItems.length > 4 &&
        <span className="viewTemplateWizard-summaryTag more">
                +{config.displayItems.length - 4} more
              </span>
        }
          </div>
      }

        {/* Expanded Content - Step 3 Display Builder with full edit menu */}
        {expandedEditSection === 'display' &&
      <div className="viewTemplateWizard-sectionCardBody">
            <div className="viewTemplateWizard-stepContent">
              {/* Action Buttons */}
              <div className="viewTemplateWizard-columnActions">
                <button
              type="button"
              className="viewTemplateWizard-addBtn"
              onClick={addDisplayItem}
              disabled={config.optionTypeIds.length === 0}>

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
            { label: 'Customer Name', displayType: 'text', sourceType: 'customer' }].
            map((tpl, idx) =>
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
                setConfig((prev) => ({
                  ...prev,
                  displayItems: [...prev.displayItems, newItem]
                }));
              }}
              disabled={config.optionTypeIds.length === 0 && tpl.sourceType === 'optionSpec'}>

                    {tpl.label}
                  </button>
            )}
              </div>

              {config.optionTypeIds.length === 0 ?
          <p className="viewTemplateWizard-hint">
                  Please select Option Types in Step 2 first to add display items.
                </p> :
          config.displayItems.length === 0 ?
          <p className="viewTemplateWizard-hint">
                  Add display items to show specification values (gauge, width, images, etc.) in the operator info section.
                </p> :

          <div className="viewTemplateWizard-displayItems">
                  {config.displayItems.map((item, index) =>
            <div key={item.id} className="viewTemplateWizard-displayItem">
                      <div className="viewTemplateWizard-displayItemHeader">
                        <span className="viewTemplateWizard-displayItemNum">{index + 1}</span>
                        <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateDisplayItem(index, 'label', e.target.value)}
                  placeholder="Display Label"
                  className="viewTemplateWizard-displayItemLabel" />

                        <button
                  type="button"
                  className="viewTemplateWizard-iconBtn danger"
                  onClick={() => removeDisplayItem(index)}
                  title="Remove">

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
                      onChange={(e) => updateDisplayItem(index, 'displayType', e.target.value as DisplayItemType)}>

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
                      }}>

                              <option value="optionSpec">From Option Specification</option>
                              <option value="customer">From Customer</option>
                            </select>
                          </div>

                          {/* Unit (for number type) */}
                          {item.displayType === 'number' &&
                  <div className="viewTemplateWizard-formGroup">
                              <label>Unit</label>
                              <input
                      type="text"
                      value={item.unit || ''}
                      onChange={(e) => updateDisplayItem(index, 'unit', e.target.value)}
                      placeholder="e.g., mm, kg" />

                            </div>
                  }
                        </div>

                        {/* Option Spec Source */}
                        {item.sourceType === 'optionSpec' &&
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
                      }}>

                                <option value="">Select Option Type</option>
                                {allowedOptionTypes.
                      filter((opt: any) => config.optionTypeIds.includes(opt._id)).
                      map((opt: any) =>
                      <option key={opt._id} value={opt._id}>{opt.name}</option>
                      )}
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
                      disabled={!item.optionTypeId}>

                                <option value="">Select Spec Field</option>
                                {item.optionTypeId && (optionSpecsByType[item.optionTypeId] || []).flatMap((spec: any) =>
                      (spec.specifications || []).map((s: any) =>
                      <option key={`${spec._id}-${s.name}`} value={s.name}>
                                      {s.name} {s.unit ? `(${s.unit})` : ''} - {s.dataType}
                                    </option>
                      )
                      )}
                              </select>
                            </div>
                          </div>
                }

                        {/* Customer Source */}
                        {item.sourceType === 'customer' &&
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
                      }}>

                                <option value="">Select Field</option>
                                <optgroup label="Customer Identity">
                                  <option value="customer.name">Full Name</option>
                                  <option value="customer.firstName">First Name</option>
                                  <option value="customer.lastName">Last Name</option>
                                  <option value="customer.companyName">Company Name</option>
                                  <option value="customer.imageUrl">Customer Image</option>
                                </optgroup>
                                <optgroup label="Contact Information">
                                  <option value="customer.phone1">Phone 1</option>
                                  <option value="customer.phone2">Phone 2</option>
                                  <option value="customer.whatsapp">WhatsApp</option>
                                  <option value="customer.telephone">Telephone</option>
                                  <option value="customer.email">Email</option>
                                </optgroup>
                                <optgroup label="Address">
                                  <option value="customer.address1">Address 1</option>
                                  <option value="customer.address2">Address 2</option>
                                  <option value="customer.state">State</option>
                                  <option value="customer.pinCode">Pin Code</option>
                                  <option value="customer.fullAddress">Full Address</option>
                                </optgroup>
                              </select>
                            </div>
                          </div>
                }

                        {/* Formula Builder (for number display type with formula toggle) */}
                        {item.displayType === 'number' &&
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
                      }} />

                              Use Formula (calculate value)
                            </label>
                          </div>
                }

                        {/* Formula Builder */}
                        {item.sourceType === 'formula' &&
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
                      className="viewTemplateWizard-formulaInput" />

                            </div>

                            {/* Available Fields for Formula */}
                            <div className="viewTemplateWizard-formulaFields">
                              <label>Click to insert field:</label>
                              <div className="viewTemplateWizard-fieldsList">
                                {config.optionTypeIds.map((optTypeId) => {
                        const optType = allowedOptionTypes.find((o: any) => o._id === optTypeId);
                        const specs = optionSpecsByType[optTypeId] || [];
                        const allSpecFields = specs.flatMap((spec: any) =>
                        (spec.specifications || []).
                        filter((s: any) => s.dataType === 'number').
                        map((s: any) => ({
                          name: s.name,
                          optTypeName: optType?.name || 'Unknown',
                          unit: s.unit
                        }))
                        );

                        if (allSpecFields.length === 0) return null;

                        return (
                          <div key={optTypeId} className="viewTemplateWizard-fieldsGroup">
                                      <span className="viewTemplateWizard-fieldsGroupLabel">{optType?.name}:</span>
                                      {allSpecFields.map((field: any, fIdx: number) =>
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
                              }}>

                                          {field.name}
                                          {field.unit && <small> ({field.unit})</small>}
                                        </button>
                            )}
                                    </div>);

                      })}

                                {/* Operators */}
                                <div className="viewTemplateWizard-fieldsGroup operators">
                                  <span className="viewTemplateWizard-operatorLabel">Operators:</span>
                                  {['+', '-', '*', '/', '(', ')', '.'].map((op) =>
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
                          }}>

                                      {op}
                                    </button>
                        )}
                                </div>
                              </div>
                            </div>
                          </div>
                }

                        {/* Visibility Toggle */}
                        <div className="viewTemplateWizard-flags">
                          <label className="viewTemplateWizard-checkbox">
                            <input
                      type="checkbox"
                      checked={item.isVisible}
                      onChange={(e) => updateDisplayItem(index, 'isVisible', e.target.checked)} />

                            Visible
                          </label>
                        </div>
                      </div>
                    </div>
            )}
                </div>
          }
            </div>
            <div className="viewTemplateWizard-sectionSaveRow">
              <button
            type="button"
            className="viewTemplateWizard-saveSectionBtn"
            onClick={() => handleSaveSection('display')}
            disabled={savingSectionName === 'display'}>

                {savingSectionName === 'display' ?
            <><Loader2 size={14} className="spinning" /> Saving...</> :

            <><Save size={14} /> Save Display Items</>
            }
              </button>
            </div>
          </div>
      }
      </div>

      {/* Columns Section */}
      <div className={`viewTemplateWizard-sectionCard ${expandedEditSection === 'columns' ? 'expanded' : ''}`}>
        <div
        className="viewTemplateWizard-sectionCardHeader"
        onClick={() => toggleEditSection('columns')}>

          <div className="viewTemplateWizard-sectionCardTitle">
            <Copy size={18} />
            <span>Table Columns</span>
            <span className="viewTemplateWizard-sectionBadge">
              {config.columns.filter((c) => c.name).length} columns
            </span>
          </div>
          <div className="viewTemplateWizard-sectionCardActions">
            {expandedEditSection !== 'columns' &&
          <button type="button" className="viewTemplateWizard-editBtn">
                <Edit2 size={14} /> Edit
              </button>
          }
            {expandedEditSection === 'columns' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Section Summary (when collapsed) */}
        {expandedEditSection !== 'columns' && config.columns.filter((c) => c.name).length > 0 &&
      <div className="viewTemplateWizard-sectionSummary">
            {config.columns.filter((c) => c.name).slice(0, 5).map((col) =>
        <span key={col.id} className="viewTemplateWizard-summaryTag">
                {col.label || col.name}
                <small className="viewTemplateWizard-summaryTagType">{col.dataType}</small>
              </span>
        )}
            {config.columns.filter((c) => c.name).length > 5 &&
        <span className="viewTemplateWizard-summaryTag more">
                +{config.columns.filter((c) => c.name).length - 5} more
              </span>
        }
          </div>
      }

        {/* Expanded Content - Step 4 Column Builder with full edit menu */}
        {expandedEditSection === 'columns' &&
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
                {columnTemplates.map((tpl, idx) =>
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
                setConfig((prev) => ({
                  ...prev,
                  columns: [...prev.columns, newColumn]
                }));
              }}>

                    {tpl.name}
                  </button>
            )}
              </div>

              <div className="viewTemplateWizard-columns">
                {config.columns.map((col, index) =>
            <div key={col.id} className="viewTemplateWizard-columnItem">
                    <div
                className="viewTemplateWizard-columnHeader"
                onClick={() => setExpandedColumn(expandedColumn === index ? null : index)}>

                      <span className="viewTemplateWizard-columnName">
                        {col.label || col.name || `Column ${index + 1}`}
                      </span>
                      <div className="viewTemplateWizard-columnMeta">
                        <span className="viewTemplateWizard-columnType">{col.dataType}</span>
                        {col.isRequired && <span className="viewTemplateWizard-required">Required</span>}
                        <button
                    type="button"
                    className="viewTemplateWizard-iconBtn"
                    onClick={(e) => {e.stopPropagation();duplicateColumn(index);}}
                    title="Duplicate">

                          <Copy size={14} />
                        </button>
                        {config.columns.length > 1 &&
                  <button
                    type="button"
                    className="viewTemplateWizard-iconBtn danger"
                    onClick={(e) => {e.stopPropagation();removeColumn(index);}}
                    title="Delete">

                            <Trash2 size={14} />
                          </button>
                  }
                      </div>
                    </div>

                    {/* Column Edit Body - shows when expanded */}
                    {expandedColumn === index &&
              <div className="viewTemplateWizard-columnBody">
                        <div className="viewTemplateWizard-formRow">
                          <div className="viewTemplateWizard-formGroup">
                            <label>Column Name *</label>
                            <input
                      type="text"
                      value={col.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                      placeholder="e.g., grossWeight" />

                          </div>
                          <div className="viewTemplateWizard-formGroup">
                            <label>Display Label</label>
                            <input
                      type="text"
                      value={col.label}
                      onChange={(e) => updateColumn(index, 'label', e.target.value)}
                      placeholder="e.g., Gross Weight" />

                          </div>
                        </div>

                        <div className="viewTemplateWizard-formRow">
                          <div className="viewTemplateWizard-formGroup">
                            <label>Data Type</label>
                            <select
                      value={col.dataType}
                      onChange={(e) => updateColumn(index, 'dataType', e.target.value as ColumnDataType)}>

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
                      placeholder="e.g., kg, g, mm" />

                          </div>
                          <div className="viewTemplateWizard-formGroup">
                            <label>Width (px)</label>
                            <input
                      type="number"
                      value={col.width}
                      onChange={(e) => updateColumn(index, 'width', parseInt(e.target.value) || 150)}
                      min="50"
                      max="500" />

                          </div>
                        </div>

                        {/* Formula configuration */}
                        {col.dataType === 'formula' &&
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
                        placeholder="e.g., grossWt - coreWt" />

                                <button
                        type="button"
                        className="viewTemplateWizard-helpBtn"
                        onClick={() => {
                          setSelectedFormulaColumn(index);
                          setShowFormulaHelper(true);
                        }}>

                                  Templates
                                </button>
                              </div>
                            </div>
                          </div>
                }

                        {/* Dropdown options */}
                        {col.dataType === 'dropdown' &&
                <div className="viewTemplateWizard-dropdownSection">
                            <label>Dropdown Options</label>
                            <textarea
                    value={col.dropdownOptions?.map((o) => o.label).join('\n') || ''}
                    onChange={(e) => {
                      const options = e.target.value.split('\n').filter((v) => v.trim()).map((v) => ({
                        label: v.trim(),
                        value: v.trim().toLowerCase().replace(/\s+/g, '_')
                      }));
                      updateColumn(index, 'dropdownOptions', options);
                    }}
                    placeholder="Enter one option per line"
                    rows={4} />

                          </div>
                }

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
                      }}>

                              <option value="manual">Manual Entry</option>
                              <option value="order">From Order</option>
                              <option value="customer">From Customer</option>
                              <option value="optionSpec">From Option Spec</option>
                              <option value="calculated">Auto Calculated</option>
                            </select>
                          </div>
                        </div>

                        {/* Option Spec configuration */}
                        {col.sourceType === 'optionSpec' &&
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
                        }}>

                                  <option value="">Select Option Type</option>
                                  {allowedOptionTypes.
                        filter((opt: any) => config.optionTypeIds.includes(opt._id)).
                        map((opt: any) =>
                        <option key={opt._id} value={opt._id}>{opt.name}</option>
                        )}
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
                        disabled={!col.optionTypeId}>

                                  <option value="">Select Option Spec</option>
                                  {col.optionTypeId && (optionSpecsByType[col.optionTypeId] || []).map((spec: any) =>
                        <option key={spec._id} value={spec._id}>
                                      {spec.name} ({spec.code})
                                    </option>
                        )}
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
                        disabled={!col.optionSpecId}>

                                  <option value="">Select Spec Field</option>
                                  {col.optionSpecId && (() => {
                          const optionSpecs = optionSpecsByType[col.optionTypeId || ''] || [];
                          const selectedOptionSpec = optionSpecs.find((s: any) => s._id === col.optionSpecId);
                          return selectedOptionSpec?.specifications?.map((spec: any, idx: number) =>
                          <option key={idx} value={spec.name}>
                                        {spec.name} {spec.unit ? `(${spec.unit})` : ''} - {spec.dataType}
                                      </option>
                          ) || null;
                        })()}
                                </select>
                              </div>
                            </div>

                            {col.optionTypeId && col.optionSpecId && col.specField &&
                  <div className="viewTemplateWizard-specPreview">
                                <strong>Source:</strong> {col.optionTypeName} → {col.optionSpecName}.{col.specField}
                                {col.specFieldUnit && <span className="unit"> ({col.specFieldUnit})</span>}
                              </div>
                  }
                          </div>
                }

                        {/* Flags */}
                        <div className="viewTemplateWizard-flags">
                          <label className="viewTemplateWizard-checkbox">
                            <input
                      type="checkbox"
                      checked={col.isRequired}
                      onChange={(e) => updateColumn(index, 'isRequired', e.target.checked)} />

                            Required
                          </label>
                          <label className="viewTemplateWizard-checkbox">
                            <input
                      type="checkbox"
                      checked={col.isReadOnly}
                      onChange={(e) => updateColumn(index, 'isReadOnly', e.target.checked)} />

                            Read Only
                          </label>
                          <label className="viewTemplateWizard-checkbox">
                            <input
                      type="checkbox"
                      checked={col.isVisible}
                      onChange={(e) => updateColumn(index, 'isVisible', e.target.checked)} />

                            Visible
                          </label>
                        </div>
                      </div>
              }
                  </div>
            )}
              </div>
            </div>
            <div className="viewTemplateWizard-sectionSaveRow">
              <button
            type="button"
            className="viewTemplateWizard-saveSectionBtn"
            onClick={() => handleSaveSection('columns')}
            disabled={savingSectionName === 'columns'}>

                {savingSectionName === 'columns' ?
            <><Loader2 size={14} className="spinning" /> Saving...</> :

            <><Save size={14} /> Save Columns</>
            }
              </button>
            </div>
          </div>
      }
      </div>

      {/* Totals Section */}
      <div className={`viewTemplateWizard-sectionCard ${expandedEditSection === 'totals' ? 'expanded' : ''}`}>
        <div
        className="viewTemplateWizard-sectionCardHeader"
        onClick={() => toggleEditSection('totals')}>

          <div className="viewTemplateWizard-sectionCardTitle">
            <span className="viewTemplateWizard-totalsIcon">Σ</span>
            <span>Totals Configuration</span>
            <span className="viewTemplateWizard-sectionBadge">
              {config.totalsConfig.length} totals
            </span>
          </div>
          <div className="viewTemplateWizard-sectionCardActions">
            {expandedEditSection !== 'totals' &&
          <button type="button" className="viewTemplateWizard-editBtn">
                <Edit2 size={14} /> Edit
              </button>
          }
            {expandedEditSection === 'totals' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Section Summary (when collapsed) */}
        {expandedEditSection !== 'totals' && config.totalsConfig.length > 0 &&
      <div className="viewTemplateWizard-sectionSummary">
            {config.totalsConfig.map((tc, idx) =>
        <span key={idx} className="viewTemplateWizard-summaryTag">
                {tc.label || tc.columnName} ({tc.formula})
              </span>
        )}
          </div>
      }

        {/* Expanded Content - Totals Config */}
        {expandedEditSection === 'totals' &&
      <div className="viewTemplateWizard-sectionCardBody">
            <div style={{
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '12px',
          padding: '16px'
        }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ color: '#166534', margin: 0 }}>📊 Totals Configuration</h4>
                <button
              type="button"
              onClick={addTotal}
              style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>

                  <Plus size={14} /> Add Total
                </button>
              </div>

              {config.totalsConfig.length === 0 ?
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0' }}>
                  Click "Add Total" to configure summary calculations
                </p> :

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {config.totalsConfig.map((tc, index) =>
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}>
                      <span style={{ fontWeight: '600', color: '#374151', minWidth: '20px' }}>{index + 1}.</span>
                      <select
                value={tc.columnName}
                onChange={(e) => updateTotal(index, 'columnName', e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>

                        <option value="">Select Column</option>
                        {config.columns.map((col) =>
                <option key={col.id} value={col.name}>{col.label || col.name} ({col.dataType})</option>
                )}
                      </select>
                      <select
                value={tc.formula}
                onChange={(e) => updateTotal(index, 'formula', e.target.value as FormulaType)}
                style={{ width: '140px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>

                        <option value="SUM">SUM (Total)</option>
                        <option value="AVERAGE">AVERAGE (Mean)</option>
                        <option value="COUNT">COUNT (Qty)</option>
                        <option value="MULTIPLY">MULTIPLY</option>
                        <option value="DIVIDE">DIVIDE</option>
                        <option value="CUSTOM">CUSTOM</option>
                      </select>
                      <input
                type="text"
                value={tc.label}
                onChange={(e) => updateTotal(index, 'label', e.target.value)}
                placeholder="Label (e.g., Total Weight)"
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />

                      <button
                type="button"
                onClick={() => removeTotal(index)}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>

                        <Trash2 size={16} />
                      </button>
                    </div>
            )}
                </div>
          }
            </div>
            <div className="viewTemplateWizard-sectionSaveRow">
              <button
            type="button"
            className="viewTemplateWizard-saveSectionBtn"
            onClick={() => handleSaveSection('totals')}
            disabled={savingSectionName === 'totals'}>

                {savingSectionName === 'totals' ?
            <><Loader2 size={14} className="spinning" /> Saving...</> :

            <><Save size={14} /> Save Totals</>
            }
              </button>
            </div>
          </div>
      }
      </div>

      {/* Calculation Rules Section */}
      <div className={`viewTemplateWizard-sectionCard ${expandedEditSection === 'calculationRules' ? 'expanded' : ''}`}>
        <div
        className="viewTemplateWizard-sectionCardHeader"
        onClick={() => toggleEditSection('calculationRules')}
        style={{ background: expandedEditSection === 'calculationRules' ? '#d1fae5' : undefined }}>

          <div className="viewTemplateWizard-sectionCardTitle">
            <span style={{ fontSize: '18px' }}>📊</span>
            <span>Calculation Rules</span>
            <span className="viewTemplateWizard-sectionBadge" style={{ background: '#10b981', color: 'white' }}>
              {config.calculationRules.length} rules
            </span>
          </div>
          <div className="viewTemplateWizard-sectionCardActions">
            {expandedEditSection !== 'calculationRules' &&
          <button type="button" className="viewTemplateWizard-editBtn" style={{ background: '#d1fae5', color: '#065f46' }}>
                <Edit2 size={14} /> Edit
              </button>
          }
            {expandedEditSection === 'calculationRules' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Section Summary (when collapsed) */}
        {expandedEditSection !== 'calculationRules' && config.calculationRules.length > 0 &&
      <div className="viewTemplateWizard-sectionSummary">
            {config.calculationRules.filter((r) => r.isActive).map((rule, idx) =>
        <span key={rule.id} className="viewTemplateWizard-summaryTag" style={{ background: '#d1fae5', color: '#065f46' }}>
                {rule.resultLabel || rule.name} ({rule.calculationType})
              </span>
        )}
          </div>
      }

        {/* Expanded Content - Calculation Rules */}
        {expandedEditSection === 'calculationRules' &&
      <div className="viewTemplateWizard-sectionCardBody">
            <div style={{
          background: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: '12px',
          padding: '16px'
        }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ color: '#065f46', margin: '0 0 4px 0' }}>📊 Calculation Rules (Same Option Type Totals)</h4>
                  <p style={{ color: '#059669', fontSize: '13px', margin: 0 }}>
                    Calculate totals when same option type appears multiple times (e.g., Product qty=27 + Product qty=20 → Total=47)
                  </p>
                </div>
                <button
              type="button"
              onClick={addCalculationRule}
              disabled={config.optionTypeIds.length === 0}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: config.optionTypeIds.length === 0 ? 'not-allowed' : 'pointer',
                opacity: config.optionTypeIds.length === 0 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>

                  <Plus size={14} /> Add Rule
                </button>
              </div>

              {config.optionTypeIds.length === 0 ?
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0', textAlign: 'center', padding: '20px' }}>
                  Please select Option Types in Step 2 first to add calculation rules.
                </p> :
          config.calculationRules.length === 0 ?
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0', textAlign: 'center', padding: '20px' }}>
                  No calculation rules defined. Click "Add Rule" to create one.
                </p> :

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {config.calculationRules.map((rule, index) =>
            <div key={rule.id} style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '16px'
            }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '600', color: '#374151' }}>Rule {index + 1}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <label className="viewTemplateWizard-checkbox" style={{ marginRight: '12px' }}>
                            <input
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={(e) => updateCalculationRule(index, 'isActive', e.target.checked)} />

                            Active
                          </label>
                          <button
                    type="button"
                    onClick={() => removeCalculationRule(index)}
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>

                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="viewTemplateWizard-formRow">
                        <div className="viewTemplateWizard-formGroup">
                          <label>Rule Name</label>
                          <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => updateCalculationRule(index, 'name', e.target.value)}
                    placeholder="e.g., Total Product Quantity" />

                        </div>
                        <div className="viewTemplateWizard-formGroup">
                          <label>Option Type</label>
                          <select
                    value={rule.optionTypeId}
                    onChange={(e) => {
                      const selectedOptType = allowedOptionTypes.find((o: any) => o._id === e.target.value);
                      updateCalculationRule(index, 'optionTypeId', e.target.value);
                      updateCalculationRule(index, 'optionTypeName', selectedOptType?.name || '');
                      updateCalculationRule(index, 'specField', '');
                    }}>

                            <option value="">Select Option Type</option>
                            {allowedOptionTypes.
                    filter((opt: any) => config.optionTypeIds.includes(opt._id)).
                    map((opt: any) =>
                    <option key={opt._id} value={opt._id}>{opt.name}</option>
                    )}
                          </select>
                        </div>
                      </div>

                      <div className="viewTemplateWizard-formRow">
                        <div className="viewTemplateWizard-formGroup">
                          <label>Spec Field to Calculate</label>
                          <select
                    value={rule.specField}
                    onChange={(e) => updateCalculationRule(index, 'specField', e.target.value)}
                    disabled={!rule.optionTypeId}>

                            <option value="">Select Field</option>
                            {rule.optionTypeId && (optionSpecsByType[rule.optionTypeId] || []).flatMap((optSpec: any) =>
                    optSpec.specifications?.
                    filter((s: any) => s.dataType === 'number').
                    map((spec: any, idx: number) =>
                    <option key={`${optSpec._id}-${idx}`} value={spec.name}>
                                    {spec.name} {spec.unit ? `(${spec.unit})` : ''} - {optSpec.name}
                                  </option>
                    ) || []
                    )}
                          </select>
                        </div>
                        <div className="viewTemplateWizard-formGroup">
                          <label>Calculation Type</label>
                          <select
                    value={rule.calculationType}
                    onChange={(e) => updateCalculationRule(index, 'calculationType', e.target.value)}>

                            <option value="SUM">SUM (Add All)</option>
                            <option value="AVERAGE">AVERAGE</option>
                            <option value="MULTIPLY">MULTIPLY</option>
                            <option value="MIN">MIN (Smallest)</option>
                            <option value="MAX">MAX (Largest)</option>
                            <option value="DIFFERENCE">DIFFERENCE</option>
                            <option value="PERCENTAGE_DIFF">PERCENTAGE DIFF</option>
                          </select>
                        </div>
                      </div>

                      <div className="viewTemplateWizard-formRow">
                        <div className="viewTemplateWizard-formGroup">
                          <label>Multiple Occurrence</label>
                          <select
                    value={rule.multipleOccurrence}
                    onChange={(e) => updateCalculationRule(index, 'multipleOccurrence', e.target.value)}>

                            <option value="ALL_SUM">SUM All Occurrences</option>
                            <option value="AVERAGE_ALL">Average All</option>
                            <option value="MULTIPLY_ALL">Multiply All</option>
                            <option value="FIRST_MINUS_SECOND">First - Second</option>
                            <option value="SECOND_MINUS_FIRST">Second - First</option>
                          </select>
                        </div>
                        <div className="viewTemplateWizard-formGroup">
                          <label>Result Column Name</label>
                          <input
                    type="text"
                    value={rule.resultLabel || ''}
                    onChange={(e) => updateCalculationRule(index, 'resultLabel', e.target.value)}
                    placeholder="e.g., Total Quantity" />

                        </div>
                        <div className="viewTemplateWizard-formGroup">
                          <label>Unit</label>
                          <input
                    type="text"
                    value={rule.resultUnit || ''}
                    onChange={(e) => updateCalculationRule(index, 'resultUnit', e.target.value)}
                    placeholder="e.g., kg, pcs"
                    style={{ width: '80px' }} />

                        </div>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <label className="viewTemplateWizard-checkbox">
                          <input
                    type="checkbox"
                    checked={rule.showInSummary}
                    onChange={(e) => updateCalculationRule(index, 'showInSummary', e.target.checked)} />

                          Show in Summary Section
                        </label>
                      </div>

                      {rule.specField && rule.resultLabel &&
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#f0fdf4',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#065f46'
              }}>
                          <strong>Preview:</strong> {rule.calculationType} of "{rule.specField}" from all "{rule.optionTypeName}" → "<strong>{rule.resultLabel}</strong>" {rule.resultUnit && `(${rule.resultUnit})`}
                        </div>
              }
                    </div>
            )}
                </div>
          }
            </div>
            <div className="viewTemplateWizard-sectionSaveRow">
              <button
            type="button"
            className="viewTemplateWizard-saveSectionBtn"
            onClick={() => handleSaveSection('calculationRules')}
            disabled={savingSectionName === 'calculationRules'}
            style={{ background: '#10b981' }}>

                {savingSectionName === 'calculationRules' ?
            <><Loader2 size={14} className="spinning" /> Saving...</> :

            <><Save size={14} /> Save Calculation Rules</>
            }
              </button>
            </div>
          </div>
      }
      </div>
    </div>;


  return (
    <div className="viewTemplateWizard">
      <div className="viewTemplateWizard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Back button when editing from EditIndex */}
            {onCancel &&
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>

                <ChevronLeft size={16} /> Back to List
              </button>
            }
            <div>
              <h2 style={{ margin: 0 }}>{isEditingExisting || editMode ? 'Edit View Template' : 'Create View Template'}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                {editMode ? `Editing: ${config.templateName || 'Template'}` : 'Configure operator view for machine production entry'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Production Info button - quick view of selections */}
            <button
              type="button"
              onClick={() => setShowProductionInfo(true)}
              style={{
                padding: '8px 16px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}>

              📋 Production Info
            </button>
            {/* Preview button - always visible */}
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}>

              <Eye size={16} /> Preview
            </button>
            {/* Show Edit Sections button when editing existing template */}
            {(isEditingExisting || editMode) && !showEditSectionsView && currentStep >= 2 &&
            <button
              type="button"
              className="viewTemplateWizard-editSectionsBtn"
              onClick={() => setShowEditSectionsView(true)}>

                <Edit2 size={16} /> Edit Sections View
              </button>
            }
          </div>
        </div>
      </div>

      {/* Show Edit Sections View or Wizard View */}
      {showEditSectionsView ?
      <div className="viewTemplateWizard-content">
          {renderEditSectionsView()}
        </div> :

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
            disabled={currentStep === 1}>

              <ChevronLeft size={18} /> Back
            </button>
            {currentStep < totalSteps ?
          <button
            type="button"
            className="viewTemplateWizard-navBtn next"
            onClick={nextStep}
            disabled={!isStepValid(currentStep)}>

                Next <ChevronRight size={18} />
              </button> :

          <button
            type="button"
            className="viewTemplateWizard-navBtn save"
            onClick={handleSave}
            disabled={!isStepValid(currentStep) || isSaving}>

                  {isSaving ? <><Loader2 size={18} className="spin" /> Saving...</> : <><Save size={18} /> {isEditingExisting ? 'Update Template' : 'Save Template'}</>}
                </button>
          }
          </div>
        </>
      }

      {/* Preview Modal */}
      {showPreview &&
      <div className="viewTemplateWizard-previewModal">
          <div className="viewTemplateWizard-previewModalContent">
            <div className="viewTemplateWizard-previewModalHeader">
              <h3>Template Preview: {config.templateName || 'Untitled'}</h3>
              <button type="button" className="viewTemplateWizard-closeBtn" onClick={() => setShowPreview(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="viewTemplateWizard-previewModalBody">
              {/* Production Information Section - Step 1 & 2 selections */}
              <div className="viewTemplateWizard-previewSection" style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                <h4 style={{ color: '#92400e' }}>📋 Production Information (Machine & Order Type)</h4>
                <div className="viewTemplateWizard-previewGrid">
                  <div className="viewTemplateWizard-previewItem">
                    <span className="label">Machine</span>
                    <span className="value">{machines.find((m: any) => m._id === config.machineId)?.machineName || 'Not selected'}</span>
                  </div>
                  <div className="viewTemplateWizard-previewItem">
                    <span className="label">Order Type</span>
                    <span className="value">{orderTypes.find((ot: any) => ot._id === config.orderTypeId)?.typeName || 'Not selected'}</span>
                  </div>
                </div>

                {/* Selected Option Types */}
                {config.optionTypeIds.length > 0 &&
              <div style={{ marginTop: '16px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#92400e' }}>Selected Option Types ({config.optionTypeIds.length})</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {config.optionTypeIds.map((typeId: string) => {
                    const optType = allowedOptionTypes.find((o: any) => o._id === typeId);
                    const optionSpecs = optionSpecsByType[typeId] || [];
                    const selectedSpecsCount = config.optionSpecIds.filter((sid: string) =>
                    optionSpecs.some((os: any) => os._id === sid)
                    ).length;
                    return (
                      <div key={typeId} style={{
                        background: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #fcd34d'
                      }}>
                            <strong style={{ color: '#374151' }}>{optType?.name || 'Unknown'}</strong>
                            <span style={{
                          marginLeft: '8px',
                          fontSize: '11px',
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                              {selectedSpecsCount} specs
                            </span>
                          </div>);

                  })}
                    </div>
                  </div>
              }

                {/* Selected OptionSpecs */}
                {config.optionSpecIds.length > 0 &&
              <div style={{ marginTop: '12px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#92400e' }}>Selected OptionSpecs ({config.optionSpecIds.length})</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {config.optionSpecIds.map((specId: string) => {
                    // Find which optionType this spec belongs to
                    let specName = 'Unknown';
                    let typeName = '';
                    for (const typeId of Object.keys(optionSpecsByType)) {
                      const spec = optionSpecsByType[typeId]?.find((os: any) => os._id === specId);
                      if (spec) {
                        specName = spec.name;
                        const optType = allowedOptionTypes.find((o: any) => o._id === typeId);
                        typeName = optType?.name || '';
                        break;
                      }
                    }
                    const fieldsCount = selectedSpecFields[specId]?.length || 0;
                    return (
                      <span key={specId} style={{
                        fontSize: '11px',
                        background: '#ecfdf5',
                        color: '#065f46',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #a7f3d0'
                      }}>
                            {typeName && <span style={{ color: '#6b7280' }}>{typeName} → </span>}
                            {specName}
                            {fieldsCount > 0 && <span style={{ color: '#0369a1', marginLeft: '4px' }}>({fieldsCount} fields)</span>}
                          </span>);

                  })}
                    </div>
                  </div>
              }
              </div>

              {/* Customer Display Section */}
              {config.displayItems.filter((d) => d.sourceType === 'customer').length > 0 &&
            <div className="viewTemplateWizard-previewSection">
                  <h4>Customer Information</h4>
                  <div className="viewTemplateWizard-previewGrid">
                    {config.displayItems.filter((d) => d.sourceType === 'customer').map((item) =>
                <div key={item.id} className="viewTemplateWizard-previewItem">
                        <span className="label">{item.label}</span>
                        <span className="value">Sample Data</span>
                      </div>
                )}
                  </div>
                </div>
            }

              {/* Order Display Section */}
              {config.displayItems.filter((d) => d.sourceType === 'order').length > 0 &&
            <div className="viewTemplateWizard-previewSection">
                  <h4>Order Information</h4>
                  <div className="viewTemplateWizard-previewGrid">
                    {config.displayItems.filter((d) => d.sourceType === 'order').map((item) =>
                <div key={item.id} className="viewTemplateWizard-previewItem">
                        <span className="label">{item.label}</span>
                        <span className="value">Sample Data</span>
                      </div>
                )}
                  </div>
                </div>
            }

              {/* Option Specs Display Section */}
              {config.displayItems.filter((d) => d.sourceType === 'optionSpec').length > 0 &&
            <div className="viewTemplateWizard-previewSection">
                  <h4>Option Specifications</h4>
                  <div className="viewTemplateWizard-previewGrid">
                    {config.displayItems.filter((d) => d.sourceType === 'optionSpec').map((item) =>
                <div key={item.id} className="viewTemplateWizard-previewItem">
                        <span className="label">{item.label}</span>
                        <span className="value">{item.optionTypeName}.{item.specField} {item.unit && `(${item.unit})`}</span>
                      </div>
                )}
                  </div>
                </div>
            }

              {/* Formula Display Section */}
              {config.displayItems.filter((d) => d.sourceType === 'formula').length > 0 &&
            <div className="viewTemplateWizard-previewSection">
                  <h4>Calculated Fields (Formulas)</h4>
                  <div className="viewTemplateWizard-previewGrid">
                    {config.displayItems.filter((d) => d.sourceType === 'formula').map((item) =>
                <div key={item.id} className="viewTemplateWizard-previewItem">
                        <span className="label">{item.label}</span>
                        <span className="value" style={{ fontSize: '11px', color: '#6b7280' }}>
                          {item.formula?.expression || 'No formula'} {item.unit && `= (${item.unit})`}
                        </span>
                      </div>
                )}
                  </div>
                </div>
            }

              {/* Columns Table Preview */}
              <div className="viewTemplateWizard-previewSection">
                <h4>Columns ({config.columns.filter((c) => c.name && c.isVisible).length})</h4>
                <div className="viewTemplateWizard-previewTableWrapper">
                  <table className="viewTemplateWizard-previewModalTable">
                    <thead>
                      <tr>
                        {config.columns.filter((c) => c.name && c.isVisible).map((col) =>
                      <th key={col.id} style={{ width: col.width }}>
                            {col.label || col.name}
                            {col.unit && <span className="unit"> ({col.unit})</span>}
                          </th>
                      )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {config.columns.filter((c) => c.name && c.isVisible).map((col) =>
                      <td key={col.id}>
                            {col.dataType === 'formula' ? <em>Auto</em> : '—'}
                          </td>
                      )}
                      </tr>
                      <tr>
                        {config.columns.filter((c) => c.name && c.isVisible).map((col) =>
                      <td key={col.id}>
                            {col.dataType === 'formula' ? <em>Auto</em> : '—'}
                          </td>
                      )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              {config.totalsConfig.filter((t) => t.isVisible).length > 0 &&
            <div className="viewTemplateWizard-previewSection">
                  <h4>Totals ({config.totalsConfig.filter((t) => t.isVisible).length})</h4>
                  <div className="viewTemplateWizard-previewGrid">
                    {config.totalsConfig.filter((t) => t.isVisible).map((total) =>
                <div key={total.id} className="viewTemplateWizard-previewItem">
                        <span className="label">{total.label || total.columnName}</span>
                        <span className="value">0.00 {total.unit && `(${total.unit})`}</span>
                      </div>
                )}
                  </div>
                </div>
            }

              {/* Calculation Rules Section */}
              {config.calculationRules.length > 0 &&
            <div className="viewTemplateWizard-previewSection">
                  <h4>Calculation Rules ({config.calculationRules.length})</h4>
                  <div className="viewTemplateWizard-previewRules">
                    {config.calculationRules.map((rule) =>
                <div key={rule.id} className="viewTemplateWizard-previewRule">
                        <span className="ruleName">{rule.name}</span>
                        <span className="ruleType">{rule.calculationType} of {rule.specField}</span>
                      </div>
                )}
                  </div>
                </div>
            }
            </div>

            <div className="viewTemplateWizard-previewModalFooter">
              <button type="button" className="viewTemplateWizard-closePreviewBtn" onClick={() => setShowPreview(false)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      }

      {/* Production Info Modal - Quick view of selections */}
      {showProductionInfo &&
      <div className="viewTemplateWizard-previewModal">
          <div className="viewTemplateWizard-previewModalContent" style={{ maxWidth: '700px' }}>
            <div className="viewTemplateWizard-previewModalHeader" style={{ background: '#fef3c7' }}>
              <h3 style={{ color: '#92400e' }}>📋 Production Information</h3>
              <button type="button" className="viewTemplateWizard-closeBtn" onClick={() => setShowProductionInfo(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="viewTemplateWizard-previewModalBody">
              {/* Machine & Order Type */}
              <div className="viewTemplateWizard-previewSection">
                <h4>Machine & Order Type</h4>
                <div className="viewTemplateWizard-previewGrid">
                  <div className="viewTemplateWizard-previewItem">
                    <span className="label">Machine Type</span>
                    <span className="value">{machineTypes.find((mt: any) => mt._id === config.machineTypeId)?.machineTypeName || 'Not selected'}</span>
                  </div>
                  <div className="viewTemplateWizard-previewItem">
                    <span className="label">Machine</span>
                    <span className="value">{machines.find((m: any) => m._id === config.machineId)?.machineName || 'Not selected'}</span>
                  </div>
                  <div className="viewTemplateWizard-previewItem">
                    <span className="label">Order Type</span>
                    <span className="value">{orderTypes.find((ot: any) => ot._id === config.orderTypeId)?.typeName || 'Not selected'}</span>
                  </div>
                </div>
              </div>

              {/* Selected Option Types */}
              <div className="viewTemplateWizard-previewSection">
                <h4>Selected Option Types ({config.optionTypeIds.length})</h4>
                {config.optionTypeIds.length === 0 ?
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No option types selected. Go to Step 2 to select.</p> :

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {config.optionTypeIds.map((typeId: string) => {
                  const optType = allowedOptionTypes.find((o: any) => o._id === typeId);
                  const optionSpecs = optionSpecsByType[typeId] || [];
                  const selectedSpecs = config.optionSpecIds.filter((sid: string) =>
                  optionSpecs.some((os: any) => os._id === sid)
                  );

                  return (
                    <div key={typeId} style={{
                      background: '#f0fdf4',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <strong style={{ color: '#166534' }}>{optType?.name || 'Unknown'}</strong>
                            <span style={{
                          fontSize: '11px',
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                              {selectedSpecs.length}/{optionSpecs.length} specs selected
                            </span>
                          </div>

                          {/* Show selected specs for this type */}
                          {selectedSpecs.length > 0 &&
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {selectedSpecs.map((specId: string) => {
                          const spec = optionSpecs.find((os: any) => os._id === specId);
                          const fields = selectedSpecFields[specId] || [];
                          return (
                            <span key={specId} style={{
                              fontSize: '12px',
                              background: 'white',
                              color: '#374151',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db'
                            }}>
                                    {spec?.name || 'Unknown'}
                                    {fields.length > 0 &&
                              <span style={{ color: '#0369a1', marginLeft: '4px' }}>
                                        ({fields.length} fields: {fields.slice(0, 3).join(', ')}{fields.length > 3 ? '...' : ''})
                                      </span>
                              }
                                  </span>);

                        })}
                            </div>
                      }
                        </div>);

                })}
                  </div>
              }
              </div>

              {/* Summary */}
              <div style={{
              background: '#f3f4f6',
              padding: '12px 16px',
              borderRadius: '8px',
              marginTop: '16px'
            }}>
                <strong style={{ color: '#374151' }}>Summary: </strong>
                <span style={{ color: '#6b7280' }}>
                  {config.optionTypeIds.length} Option Types, {' '}
                  {config.optionSpecIds.length} OptionSpecs, {' '}
                  {Object.values(selectedSpecFields).flat().length} Fields selected
                </span>
              </div>
            </div>

            <div className="viewTemplateWizard-previewModalFooter">
              <button
              type="button"
              onClick={() => {
                setShowProductionInfo(false);
                setShowPreview(true);
              }}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginRight: '8px'
              }}>

                <Eye size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Full Preview
              </button>
              <button type="button" className="viewTemplateWizard-closePreviewBtn" onClick={() => setShowProductionInfo(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default ViewTemplateWizard;