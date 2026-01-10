import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createExcelExportTypeV2 as createExcelExportType, updateExcelExportTypeV2 as updateExcelExportType, deleteExcelExportTypeV2 as deleteExcelExportType } from "../../../../redux/unifiedV2/excelExportTypeActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { AppDispatch } from "../../../../../store";
import { RootState } from "../../../../redux/rootReducer";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import * as XLSX from 'xlsx';
import "../orderType/orderType.css";

// Default columns configuration matching backend model
const DEFAULT_COLUMNS = [
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
{ key: 'notes', label: 'Notes', selected: false, category: 'other' }];


const COLUMN_CATEGORIES = [
{ key: 'basic', label: 'Basic Order Info', color: '#3B82F6' },
{ key: 'customer', label: 'Customer Details', color: '#10B981' },
{ key: 'material', label: 'Products & Materials', color: '#F59E0B' },
{ key: 'status', label: 'Status & Progress', color: '#8B5CF6' },
{ key: 'dates', label: 'Dates', color: '#EC4899' },
{ key: 'other', label: 'Other', color: '#6B7280' }];


interface Column {
  key: string;
  label: string;
  selected: boolean;
  category: string;
}

interface CreateExcelExportTypeProps {
  initialData?: any;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateExcelExportType: React.FC<CreateExcelExportTypeProps> = ({ initialData: propInitialData, onCancel, onSaveSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Edit mode detection
  const { excelExportTypeData: locationData, isEdit } = location.state || {};
  const excelExportTypeData = propInitialData || locationData;
  const editMode = Boolean(propInitialData || isEdit || excelExportTypeData && excelExportTypeData._id);
  const excelExportTypeId = excelExportTypeData?._id;

  // Basic Information
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");

  // Column Configuration
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    basic: true,
    customer: true,
    material: true,
    status: false,
    dates: false,
    other: false
  });

  // Linked Types
  const [linkedOptionTypes, setLinkedOptionTypes] = useState<string[]>([]);
  const [linkedOrderTypes, setLinkedOrderTypes] = useState<string[]>([]);

  // Export Settings
  const [sheetName, setSheetName] = useState("Orders");
  const [fileNamePrefix, setFileNamePrefix] = useState("Export");
  const [includeHeaders, setIncludeHeaders] = useState(true);

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Preview Mode
  const [showPreview, setShowPreview] = useState(false);

  // Excel Import Preview
  const [importedExcelData, setImportedExcelData] = useState<any[]>([]);
  const [importedExcelColumns, setImportedExcelColumns] = useState<string[]>([]);
  const [showExcelPreview, setShowExcelPreview] = useState(false);

  // Excel Column to Option Type Mapping
  const [columnOptionTypeMapping, setColumnOptionTypeMapping] = useState<Record<string, string>>({});

  // Excel Column to Specification Mapping (optionTypeId:specName)
  const [columnSpecMapping, setColumnSpecMapping] = useState<Record<string, string>>({});

  // Expanded OptionType specs view
  const [expandedOptionTypeSpecs, setExpandedOptionTypeSpecs] = useState<Record<string, boolean>>({});

  // Expanded OrderType details view
  const [expandedOrderTypeDetails, setExpandedOrderTypeDetails] = useState<Record<string, boolean>>({});

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  // Get data from Redux
  const optionTypeState = useSelector((state: RootState) => state.v2.optionType);
  const rawOptionTypes = optionTypeState?.list;
  const optionTypes = Array.isArray(rawOptionTypes) ? rawOptionTypes : [];
  const optionTypesLoading = optionTypeState?.loading;
  const orderTypeState = useSelector((state: RootState) => state.v2.orderType);
  const rawOrderTypes = orderTypeState?.list;
  const orderTypes = Array.isArray(rawOrderTypes) ? rawOrderTypes : [];
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // Handle ESC key to go back
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

  // Load data on mount
  useEffect(() => {
    dispatch(getOptionTypes({}));
    // Note: orderTypes are loaded from Redux v2
  }, [dispatch]);

  // Load existing data when editing
  useEffect(() => {
    if (editMode && excelExportTypeData) {
      setTypeName(excelExportTypeData.typeName || "");
      setTypeCode(excelExportTypeData.typeCode || "");
      setDescription(excelExportTypeData.description || "");
      setSheetName(excelExportTypeData.sheetName || "Orders");
      setFileNamePrefix(excelExportTypeData.fileNamePrefix || "Export");
      setIncludeHeaders(excelExportTypeData.includeHeaders !== false);
      setIsGlobal(excelExportTypeData.isGlobal || false);
      setIsDefault(excelExportTypeData.isDefault || false);
      setIsActive(excelExportTypeData.isActive !== false);

      // Load columns if available
      if (excelExportTypeData.columns && excelExportTypeData.columns.length > 0) {
        setColumns(excelExportTypeData.columns);
      }

      // Load linked option types
      if (excelExportTypeData.linkedOptionTypes) {
        const ids = excelExportTypeData.linkedOptionTypes.map((ot: any) =>
        typeof ot === 'string' ? ot : ot._id
        );
        setLinkedOptionTypes(ids);
      }

      // Load linked order types
      if (excelExportTypeData.linkedOrderTypes) {
        const ids = excelExportTypeData.linkedOrderTypes.map((ot: any) =>
        typeof ot === 'string' ? ot : ot._id
        );
        setLinkedOrderTypes(ids);
      }
    }
  }, [editMode, excelExportTypeData]);

  // Toggle column selection
  const toggleColumn = (key: string) => {
    setColumns((prev) => prev.map((col) =>
    col.key === key ? { ...col, selected: !col.selected } : col
    ));
  };

  // Toggle all columns in a category
  const toggleCategory = (category: string) => {
    const categoryColumns = columns.filter((c) => c.category === category);
    const allSelected = categoryColumns.every((c) => c.selected);

    setColumns((prev) => prev.map((col) =>
    col.category === category ? { ...col, selected: !allSelected } : col
    ));
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Toggle option type selection
  const toggleOptionType = (optionTypeId: string) => {
    setLinkedOptionTypes((prev) =>
    prev.includes(optionTypeId) ?
    prev.filter((id) => id !== optionTypeId) :
    [...prev, optionTypeId]
    );
  };

  // Toggle order type selection
  const toggleOrderType = (orderTypeId: string) => {
    setLinkedOrderTypes((prev) =>
    prev.includes(orderTypeId) ?
    prev.filter((id) => id !== orderTypeId) :
    [...prev, orderTypeId]
    );
  };

  // Get selected columns count
  const selectedColumnsCount = columns.filter((c) => c.selected).length;

  // Get specifications from linked OptionTypes
  const getLinkedOptionTypeSpecs = () => {
    if (!optionTypes || linkedOptionTypes.length === 0) return [];

    const specs: Array<{optionTypeId: string;optionTypeName: string;specName: string;unit?: string;dataType: string;}> = [];

    linkedOptionTypes.forEach((otId) => {
      const ot = optionTypes.find((o: any) => o._id === otId);
      if (ot && ot.specifications) {
        ot.specifications.forEach((spec: any) => {
          specs.push({
            optionTypeId: ot._id,
            optionTypeName: ot.name,
            specName: spec.name,
            unit: spec.unit,
            dataType: spec.dataType || 'string'
          });
        });
      }
    });

    return specs;
  };

  // Get suggested OptionTypes from selected OrderTypes (allowedOptionTypes)
  const getSuggestedOptionTypes = () => {
    if (!orderTypes || linkedOrderTypes.length === 0) return [];

    const suggested = new Set<string>();

    linkedOrderTypes.forEach((orderTypeId) => {
      const ot = orderTypes.find((o: any) => o._id === orderTypeId);
      if (ot && ot.allowedOptionTypes) {
        ot.allowedOptionTypes.forEach((allowedId: string) => {
          suggested.add(typeof allowedId === 'string' ? allowedId : (allowedId as any)?._id);
        });
      }
    });

    return Array.from(suggested);
  };

  const suggestedOptionTypes = getSuggestedOptionTypes();
  const linkedSpecs = getLinkedOptionTypeSpecs();

  // Get all data from selected OrderTypes
  const getOrderTypeDetails = (orderTypeId: string) => {
    const ot = orderTypes?.find((o: any) => o._id === orderTypeId);
    if (!ot) return null;

    return {
      allowedOptionTypes: ot.allowedOptionTypes || [],
      selectedSpecs: ot.selectedSpecs || [],
      dynamicCalculations: ot.dynamicCalculations || [],
      sections: ot.sections || []
    };
  };

  // Get all dynamic calculations from linked OrderTypes
  const getAllDynamicCalculations = () => {
    const calculations: Array<{orderTypeId: string;orderTypeName: string;name: string;formula: string;unit?: string;}> = [];

    linkedOrderTypes.forEach((otId) => {
      const ot = orderTypes?.find((o: any) => o._id === otId);
      if (ot && ot.dynamicCalculations) {
        ot.dynamicCalculations.forEach((calc: any) => {
          if (calc.enabled !== false) {
            calculations.push({
              orderTypeId: ot._id,
              orderTypeName: ot.typeName,
              name: calc.name,
              formula: calc.formula,
              unit: calc.unit
            });
          }
        });
      }
    });

    return calculations;
  };

  // Get all selectedSpecs from linked OrderTypes
  const getAllSelectedSpecs = () => {
    const specs: Array<{orderTypeId: string;orderTypeName: string;optionTypeName: string;specName: string;varName: string;unit?: string;}> = [];

    linkedOrderTypes.forEach((otId) => {
      const ot = orderTypes?.find((o: any) => o._id === otId);
      if (ot && ot.selectedSpecs) {
        ot.selectedSpecs.forEach((spec: any) => {
          specs.push({
            orderTypeId: ot._id,
            orderTypeName: ot.typeName,
            optionTypeName: spec.optionTypeName,
            specName: spec.specName,
            varName: spec.varName,
            unit: spec.unit
          });
        });
      }
    });

    return specs;
  };

  const allDynamicCalculations = getAllDynamicCalculations();
  const allSelectedSpecs = getAllSelectedSpecs();

  // Toggle OrderType details expansion
  const toggleOrderTypeDetails = (orderTypeId: string) => {
    setExpandedOrderTypeDetails((prev) => ({
      ...prev,
      [orderTypeId]: !prev[orderTypeId]
    }));
  };

  // Add dynamic calculation columns
  const addCalculationColumns = () => {
    const newColumns: Column[] = allDynamicCalculations.map((calc) => ({
      key: `calc_${calc.orderTypeId}_${calc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      label: `${calc.name}${calc.unit ? ` (${calc.unit})` : ''}`,
      selected: true,
      category: 'other'
    }));

    const existingKeys = new Set(columns.map((c) => c.key));
    const columnsToAdd = newColumns.filter((c) => !existingKeys.has(c.key));

    if (columnsToAdd.length > 0) {
      setColumns([...columns, ...columnsToAdd]);
      toast.success('Added', `${columnsToAdd.length} calculation columns added`);
    } else {
      toast.info('Info', 'All calculation columns already exist');
    }
  };

  // Add selectedSpecs columns
  const addSelectedSpecsColumns = () => {
    const newColumns: Column[] = allSelectedSpecs.map((spec) => ({
      key: `selspec_${spec.varName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      label: `${spec.optionTypeName}: ${spec.specName}${spec.unit ? ` (${spec.unit})` : ''}`,
      selected: true,
      category: 'material'
    }));

    const existingKeys = new Set(columns.map((c) => c.key));
    const columnsToAdd = newColumns.filter((c) => !existingKeys.has(c.key));

    if (columnsToAdd.length > 0) {
      setColumns([...columns, ...columnsToAdd]);
      toast.success('Added', `${columnsToAdd.length} spec columns added`);
    } else {
      toast.info('Info', 'All spec columns already exist');
    }
  };

  // Toggle OptionType spec expansion
  const toggleOptionTypeSpecsExpansion = (optionTypeId: string) => {
    setExpandedOptionTypeSpecs((prev) => ({
      ...prev,
      [optionTypeId]: !prev[optionTypeId]
    }));
  };

  // Add spec columns from OptionType
  const addSpecColumnsFromOptionType = (optionTypeId: string) => {
    const ot = optionTypes?.find((o: any) => o._id === optionTypeId);
    if (!ot || !ot.specifications) return;

    const newColumns: Column[] = ot.specifications.map((spec: any) => ({
      key: `spec_${optionTypeId}_${spec.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      label: `${ot.name}: ${spec.name}${spec.unit ? ` (${spec.unit})` : ''}`,
      selected: true,
      category: 'material'
    }));

    // Add only columns that don't exist
    const existingKeys = new Set(columns.map((c) => c.key));
    const columnsToAdd = newColumns.filter((c) => !existingKeys.has(c.key));

    if (columnsToAdd.length > 0) {
      setColumns([...columns, ...columnsToAdd]);
      toast.success('Added', `${columnsToAdd.length} spec columns added from ${ot.name}`);
    } else {
      toast.info('Info', 'All spec columns already exist');
    }
  };

  // Export configuration to JSON
  const handleExportConfig = () => {
    const config = {
      typeName,
      typeCode,
      description,
      columns,
      linkedOptionTypes,
      linkedOrderTypes,
      sheetName,
      fileNamePrefix,
      includeHeaders,
      isGlobal,
      isDefault,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excel-export-type-${typeCode || 'config'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported', 'Configuration exported successfully');
  };

  // Import configuration from JSON
  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);

        // Apply imported configuration
        if (config.typeName) setTypeName(config.typeName);
        if (config.typeCode) setTypeCode(config.typeCode);
        if (config.description) setDescription(config.description);
        if (config.columns) setColumns(config.columns);
        if (config.linkedOptionTypes) setLinkedOptionTypes(config.linkedOptionTypes);
        if (config.linkedOrderTypes) setLinkedOrderTypes(config.linkedOrderTypes);
        if (config.sheetName) setSheetName(config.sheetName);
        if (config.fileNamePrefix) setFileNamePrefix(config.fileNamePrefix);
        if (config.includeHeaders !== undefined) setIncludeHeaders(config.includeHeaders);
        if (config.isGlobal !== undefined) setIsGlobal(config.isGlobal);
        if (config.isDefault !== undefined) setIsDefault(config.isDefault);

        toast.success('Imported', 'Configuration imported successfully');
      } catch (error) {
        toast.error('Error', 'Failed to parse configuration file');
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Excel file import
  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          toast.error('Error', 'Excel file is empty');
          return;
        }

        // First row is headers
        const headers = (jsonData[0] as string[]).map((h) => String(h || '').trim());

        // Rest is data (take first 10 rows for preview)
        const rows = jsonData.slice(1, 11).map((row: any) => {
          const rowData: Record<string, any> = {};
          headers.forEach((header, idx) => {
            rowData[header] = row[idx] || '';
          });
          return rowData;
        });

        setImportedExcelColumns(headers);
        setImportedExcelData(rows);
        setColumnOptionTypeMapping({}); // Reset mapping
        setShowExcelPreview(true);

        // Auto-set sheet name from imported file
        if (sheetName && sheetName !== 'Sheet1') {
          setSheetName(sheetName);
        }

        toast.success('Imported', `Loaded ${jsonData.length - 1} rows with ${headers.length} columns`);
      } catch (error) {

        toast.error('Error', 'Failed to parse Excel file');
      }
    };
    reader.readAsBinaryString(file);

    // Reset file input
    if (excelInputRef.current) {
      excelInputRef.current.value = '';
    }
  };

  // Apply imported Excel columns and Option Type mappings
  const applyImportedColumns = () => {
    // Get unique Option Type IDs from the mapping (handle both "id" and "id:specName" formats)
    const mappedOptionTypeIds = [...new Set(
      Object.values(columnOptionTypeMapping).
      filter((id) => id && id !== '').
      map((id) => id.includes(':') ? id.split(':')[0] : id)
    )];

    // Update linked option types
    setLinkedOptionTypes((prev) => [...new Set([...prev, ...mappedOptionTypeIds])]);

    // Create spec columns from mappings
    const specColumns: Column[] = [];
    Object.entries(columnOptionTypeMapping).forEach(([excelCol, mapping]) => {
      if (mapping && mapping.includes(':')) {
        const [optionTypeId, specName] = mapping.split(':');
        const ot = optionTypes?.find((o: any) => o._id === optionTypeId);
        if (ot) {
          const spec = ot.specifications?.find((s: any) => s.name === specName);
          specColumns.push({
            key: `spec_${optionTypeId}_${specName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            label: `${ot.name}: ${specName}${spec?.unit ? ` (${spec.unit})` : ''}`,
            selected: true,
            category: 'material'
          });
        }
      }
    });

    // Map imported columns to our column structure
    const newColumns = importedExcelColumns.map((col) => ({
      key: col.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      label: col,
      selected: true,
      category: 'other'
    }));

    // Merge with existing columns - prioritize imported ones
    const existingKeys = new Set(columns.map((c) => c.key));
    const mergedColumns = [
    ...columns.map((c) => ({
      ...c,
      selected: importedExcelColumns.some(
        (imp) => imp.toLowerCase().replace(/[^a-z0-9]/g, '_') === c.key ||
        imp.toLowerCase() === c.label.toLowerCase()
      )
    })),
    ...newColumns.filter((nc) => !existingKeys.has(nc.key)),
    ...specColumns.filter((sc) => !existingKeys.has(sc.key))];


    setColumns(mergedColumns);
    setShowExcelPreview(false);

    const linkCount = mappedOptionTypeIds.length;
    const specCount = specColumns.length;
    toast.success('Applied', `Linked ${linkCount} option type${linkCount !== 1 ? 's' : ''}, ${specCount} spec column${specCount !== 1 ? 's' : ''} added`);
  };

  // Update column to option type mapping
  const updateColumnMapping = (columnName: string, optionTypeId: string) => {
    setColumnOptionTypeMapping((prev) => ({
      ...prev,
      [columnName]: optionTypeId
    }));
  };

  // Handle submit
  const handleSubmit = () => {
    if (!typeName.trim() || !typeCode.trim()) {
      toast.error("Validation Error", "Please fill all required fields: Type Name and Type Code");
      return;
    }

    if (selectedColumnsCount === 0) {
      toast.error("Validation Error", "Please select at least one column to export");
      return;
    }

    const branchId = localStorage.getItem('selectedBranch') || localStorage.getItem('selectedBranch') || '';
    const dataToSave = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      columns,
      linkedOptionTypes,
      linkedOrderTypes,
      sheetName,
      fileNamePrefix,
      includeHeaders,
      branchId,
      isGlobal,
      isDefault,
      isActive
    };

    if (editMode && excelExportTypeId) {
      handleSave(
        () => dispatch(updateExcelExportType(excelExportTypeId, dataToSave)),
        {
          successMessage: "Excel export type updated successfully!",
          onSuccess: () => {
            setTimeout(() => {
              if (onSaveSuccess) {
                onSaveSuccess();
              } else {
                navigate(-1);
              }
            }, 1500);
          }
        }
      );
    } else {
      handleSave(
        () => dispatch(createExcelExportType(dataToSave)),
        {
          successMessage: "Excel export type created successfully!",
          onSuccess: () => {
            setTypeName("");
            setTypeCode("");
            setDescription("");
            setColumns(DEFAULT_COLUMNS);
            setLinkedOptionTypes([]);
            setLinkedOrderTypes([]);
            setSheetName("Orders");
            setFileNamePrefix("Export");
            setIncludeHeaders(true);
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

  // Generate preview data
  const generatePreviewData = () => {
    const selectedCols = columns.filter((c) => c.selected);
    const sampleData = [
    {
      orderId: 'ORD-2024-001',
      date: '2024-01-15',
      overallStatus: 'In Progress',
      priority: 'High',
      orderType: 'Manufacturing',
      customerName: 'ABC Industries',
      phone: '+91 98765 43210',
      email: 'contact@abc.com',
      address: '123 Industrial Area',
      whatsapp: '+91 98765 43210',
      productOptions: 'HDPE Bags - 50kg',
      materialOptions: 'Premium Material',
      printingOptions: '4-Color Print',
      packagingOptions: 'Standard Box',
      optionQuantity: '1000',
      allOptions: 'HDPE, Premium, 4-Color',
      currentStep: 'Printing',
      currentStepIndex: '2',
      machineStatus: 'Running',
      completedMachines: '1',
      totalMachines: '3',
      machineProgress: '33%',
      stepsCompleted: '1',
      totalSteps: '4',
      stepProgress: '25%',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-15',
      scheduledStart: '2024-01-15',
      scheduledEnd: '2024-01-20',
      actualStart: '2024-01-15',
      actualEnd: '-',
      dispatchedDate: '-',
      branch: 'Main Branch',
      branchCode: 'MB001',
      sameDayDispatch: 'No',
      createdBy: 'Admin',
      assignedManager: 'John Doe',
      notes: 'Rush order'
    }];


    return { selectedCols, sampleData };
  };

  return (
    <div className="orderTypeContainer CreateForm">
      {/* Hidden file input for JSON config import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleImportConfig}
        style={{ display: 'none' }} />


      {/* Hidden file input for Excel import */}
      <input
        type="file"
        ref={excelInputRef}
        accept=".xlsx,.xls"
        onChange={handleExcelImport}
        style={{ display: 'none' }} />


      {/* Delete Confirmation Modal */}
      {showDeleteConfirm &&
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
          <div style={{
          background: '#ffffff',
          padding: '32px',
          borderRadius: '16px',
          maxWidth: '420px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#111827', fontSize: '1.25rem', fontWeight: 700 }}>Delete Excel Export Type?</h3>
            <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '15px', lineHeight: 1.5 }}>
              Are you sure you want to delete this export configuration? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: '12px 28px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px'
              }}>

                Cancel
              </button>
              <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: '12px 28px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(239,68,68,0.3)'
              }}>

                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Preview Modal */}
      {showPreview &&
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
          <div style={{
          background: '#ffffff',
          padding: '28px',
          borderRadius: '16px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
              <div>
                <h3 style={{ margin: 0, color: '#111827', fontSize: '1.25rem', fontWeight: 700 }}>📊 Excel Export Preview</h3>
                <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  Sheet: <strong>{sheetName}</strong> | File: <strong>{fileNamePrefix}_{new Date().toISOString().split('T')[0]}.xlsx</strong> | <strong>{selectedColumnsCount}</strong> columns
                </p>
              </div>
              <button
              onClick={() => setShowPreview(false)}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px'
              }}>

                Close
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                {includeHeaders &&
              <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      {generatePreviewData().selectedCols.map((col, idx) =>
                  <th key={idx} style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid #e5e7eb'
                  }}>
                          {col.label}
                        </th>
                  )}
                    </tr>
                  </thead>
              }
                <tbody>
                  {generatePreviewData().sampleData.map((row: any, rowIdx) =>
                <tr key={rowIdx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      {generatePreviewData().selectedCols.map((col, colIdx) =>
                  <td key={colIdx} style={{
                    padding: '10px 12px',
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid #f3f4f6'
                  }}>
                          {row[col.key] || '-'}
                        </td>
                  )}
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px',
              background: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              fontSize: '13px',
              color: '#1e40af'
            }}>
                <strong>Linked Option Types:</strong> {linkedOptionTypes.length > 0 ?
              optionTypes?.filter((ot: any) => linkedOptionTypes.includes(ot._id)).map((ot: any) => ot.name).join(', ') :
              'All'}
              </div>
              <div style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px',
              background: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #86efac',
              fontSize: '13px',
              color: '#166534'
            }}>
                <strong>Linked Order Types:</strong> {linkedOrderTypes.length > 0 ?
              orderTypes?.filter((ot: any) => linkedOrderTypes.includes(ot._id)).map((ot: any) => ot.typeName).join(', ') :
              'All'}
              </div>
            </div>
          </div>
        </div>
      }

      {/* Excel Import Preview Modal */}
      {showExcelPreview &&
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
          <div style={{
          background: '#ffffff',
          padding: '28px',
          borderRadius: '16px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          overflow: 'auto',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
              <div>
                <h3 style={{ margin: 0, color: '#111827', fontSize: '1.25rem', fontWeight: 700 }}>📥 Imported Excel Preview</h3>
                <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  <strong>{importedExcelColumns.length}</strong> columns detected • <strong>{importedExcelData.length}</strong> rows shown (preview)
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                onClick={applyImportedColumns}
                style={{
                  padding: '10px 20px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(16,185,129,0.3)'
                }}>

                  ✓ Apply Columns
                </button>
                <button
                onClick={() => setShowExcelPreview(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>

                  Close
                </button>
              </div>
            </div>

            {/* Column to Option Type Mapping */}
            <div style={{
            marginBottom: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, #fff5f0 0%, #fef3cd 100%)',
            borderRadius: '12px',
            border: '2px solid #fed7c3'
          }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <strong style={{ color: '#9a3412', fontSize: '15px' }}>🔗 Link Excel Columns → Option Types</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#78350f' }}>
                    Map each column to an Option Type to include its specifications in exports
                  </p>
                </div>
                <span style={{
                fontSize: '13px',
                color: '#166534',
                background: '#dcfce7',
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: 600
              }}>
                  {Object.values(columnOptionTypeMapping).filter((v) => v).length} linked
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                {importedExcelColumns.map((col, idx) =>
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: columnOptionTypeMapping[col] ? '#dcfce7' : '#ffffff',
                borderRadius: '8px',
                border: columnOptionTypeMapping[col] ? '2px solid #86efac' : '1px solid #d1d5db',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                    <span style={{
                  flex: '0 0 auto',
                  padding: '6px 10px',
                  background: '#FF6B35',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} title={col}>
                      {col}
                    </span>
                    <span style={{ color: '#9ca3af' }}>→</span>
                    <select
                  value={columnOptionTypeMapping[col] || ''}
                  onChange={(e) => updateColumnMapping(col, e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '8px 10px',
                    height: '36px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#374151',
                    background: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'auto',
                    WebkitAppearance: 'menulist'
                  }}>

                      <option value="">-- Select Option Type --</option>
                      {optionTypes && optionTypes.map((ot: any) =>
                  <optgroup key={ot._id} label={`${ot.name}${ot.category?.name ? ` (${ot.category.name})` : ''}`}>
                          <option value={ot._id}>
                            ▸ {ot.name} (All)
                          </option>
                          {ot.specifications?.map((spec: any, sIdx: number) =>
                    <option key={`${ot._id}_${sIdx}`} value={`${ot._id}:${spec.name}`}>
                              └ {spec.name}{spec.unit ? ` (${spec.unit})` : ''}
                            </option>
                    )}
                        </optgroup>
                  )}
                    </select>
                  </div>
              )}
              </div>
            </div>

            {/* Data preview table */}
            <div style={{ overflowX: 'auto', border: '2px solid #e5e7eb', borderRadius: '10px', marginTop: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{
                    padding: '12px 10px',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: '#6b7280',
                    borderRight: '1px solid #e5e7eb',
                    width: '50px',
                    background: '#f3f4f6'
                  }}>
                      #
                    </th>
                    {importedExcelColumns.map((col, idx) =>
                  <th key={idx} style={{
                    padding: '12px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#1f2937',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid #e5e7eb',
                    background: columnOptionTypeMapping[col] ? '#dcfce7' : 'transparent'
                  }}>
                        {col}
                        {columnOptionTypeMapping[col] && <span style={{ marginLeft: '6px', color: '#16a34a' }}>✓</span>}
                      </th>
                  )}
                  </tr>
                </thead>
                <tbody>
                  {importedExcelData.map((row: any, rowIdx) =>
                <tr key={rowIdx} style={{
                  borderBottom: '1px solid #e5e7eb',
                  background: rowIdx % 2 === 0 ? '#ffffff' : '#fafafa'
                }}>
                      <td style={{
                    padding: '10px 8px',
                    color: '#9ca3af',
                    textAlign: 'center',
                    borderRight: '1px solid #e5e7eb',
                    fontWeight: 600,
                    background: '#f9fafb'
                  }}>
                        {rowIdx + 1}
                      </td>
                      {importedExcelColumns.map((col, colIdx) =>
                  <td key={colIdx} style={{
                    padding: '10px 14px',
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid #f3f4f6',
                    maxWidth: '220px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    background: columnOptionTypeMapping[col] ? 'rgba(220, 252, 231, 0.3)' : 'transparent'
                  }}>
                          {String(row[col] || '-')}
                        </td>
                  )}
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '10px',
            border: '2px solid #93c5fd',
            fontSize: '14px',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>How it works:</strong>
                Map each Excel column to an Option Type using the dropdowns above. You can select specific specifications for more precise mapping.
                Click "<strong>Apply Columns</strong>" to link these Option Types to your export configuration.
              </div>
            </div>
          </div>
        </div>
      }

      {/* Header */}
      <div className="orderTypeHeader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {editMode && onCancel &&
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>

                ← Back to List
              </button>
            }
            <div>
              <h2 className="orderTypeTitle">
                {editMode ? 'Edit Excel Export Type' : 'Create Excel Export Type'}
              </h2>
              <p className="orderTypeSubtitle">
                {editMode ?
                `Editing: ${excelExportTypeData?.typeName || 'Excel Export Type'}` :
                'Configure columns and settings for Excel order exports'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Import Excel Button */}
            <button
              type="button"
              onClick={() => excelInputRef.current?.click()}
              style={{
                padding: '8px 16px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h2l2 3 2-6h2" />
              </svg>
              Import Excel
            </button>

            {/* Import Config Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 16px',
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Import Config
            </button>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExportConfig}
              style={{
                padding: '8px 16px',
                background: '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>

            {/* Preview Button */}
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              style={{
                padding: '8px 16px',
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </button>

            {editMode &&
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
              }}>

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                </svg>
                Delete
              </button>
            }
          </div>
        </div>
      </div>

      <div className="orderTypeFormGrid">
        {/* Option Type Specifications Quick Access */}
        {linkedSpecs.length > 0 && (
          <div className="orderTypeSection" style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #F59E0B',
            boxShadow: '0 4px 6px rgba(245, 158, 11, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 className="orderTypeSectionTitle" style={{ margin: 0, color: '#92400e' }}>
                  📐 Option Type Specifications & Dimensions
                </h3>
                <p style={{ fontSize: '13px', color: '#78350f', marginTop: '4px' }}>
                  {linkedSpecs.length} specification{linkedSpecs.length !== 1 ? 's' : ''} from linked Option Types - Custom data fields for each option
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  // Add all specifications as columns
                  const newColumns: typeof columns = linkedSpecs.map((spec) => ({
                    key: `spec_${spec.optionTypeId}_${spec.specName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                    label: `${spec.optionTypeName}: ${spec.specName}${spec.unit ? ` (${spec.unit})` : ''}`,
                    selected: true,
                    category: 'material'
                  }));

                  const existingKeys = new Set(columns.map((c) => c.key));
                  const columnsToAdd = newColumns.filter((c) => !existingKeys.has(c.key));

                  if (columnsToAdd.length > 0) {
                    setColumns([...columns, ...columnsToAdd]);
                    toast.success('Added', `${columnsToAdd.length} specification columns added`);
                  } else {
                    toast.info('Info', 'All specification columns already exist');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: '#F59E0B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add All {linkedSpecs.length} Specifications
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px'
            }}>
              {linkedSpecs.map((spec, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #fed7aa',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <strong style={{ color: '#92400e', fontSize: '14px' }}>{spec.specName}</strong>
                    {spec.unit && (
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        background: '#fed7aa',
                        borderRadius: '4px',
                        color: '#92400e',
                        fontWeight: 600
                      }}>
                        {spec.unit}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    background: '#f9fafb',
                    padding: '6px 8px',
                    borderRadius: '4px'
                  }}>
                    Type: {spec.dataType || 'string'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                    From: {spec.optionTypeName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Specs from Order Types Quick Access */}
        {allSelectedSpecs.length > 0 && (
          <div className="orderTypeSection" style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            border: '2px solid #8B5CF6',
            boxShadow: '0 4px 6px rgba(139, 92, 246, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 className="orderTypeSectionTitle" style={{ margin: 0, color: '#6b21a8' }}>
                  📋 Selected Specs from Order Types
                </h3>
                <p style={{ fontSize: '13px', color: '#7c3aed', marginTop: '4px' }}>
                  {allSelectedSpecs.length} spec{allSelectedSpecs.length !== 1 ? 's' : ''} used in formulas - Variables for calculations
                </p>
              </div>
              <button
                type="button"
                onClick={addSelectedSpecsColumns}
                style={{
                  padding: '10px 20px',
                  background: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add All {allSelectedSpecs.length} Specs
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px'
            }}>
              {allSelectedSpecs.map((spec, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e9d5ff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <strong style={{ color: '#6b21a8', fontSize: '14px' }}>{spec.specName}</strong>
                    {spec.unit && (
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        background: '#e9d5ff',
                        borderRadius: '4px',
                        color: '#6b21a8',
                        fontWeight: 600
                      }}>
                        {spec.unit}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    background: '#f9fafb',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                    var: {spec.varName}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                    {spec.optionTypeName} • From: {spec.orderTypeName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Calculations Quick Access */}
        {allDynamicCalculations.length > 0 && (
          <div className="orderTypeSection" style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #10B981',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 className="orderTypeSectionTitle" style={{ margin: 0, color: '#166534' }}>
                  🔢 Dynamic Calculations Available
                </h3>
                <p style={{ fontSize: '13px', color: '#15803d', marginTop: '4px' }}>
                  {allDynamicCalculations.length} calculation{allDynamicCalculations.length !== 1 ? 's' : ''} from selected Order Types - Click to add to export
                </p>
              </div>
              <button
                type="button"
                onClick={addCalculationColumns}
                style={{
                  padding: '10px 20px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add All {allDynamicCalculations.length} Calculations
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {allDynamicCalculations.map((calc, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #d1fae5',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <strong style={{ color: '#166534', fontSize: '14px' }}>{calc.name}</strong>
                    {calc.unit && (
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        background: '#d1fae5',
                        borderRadius: '4px',
                        color: '#166534',
                        fontWeight: 600
                      }}>
                        {calc.unit}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontFamily: 'monospace',
                    background: '#f9fafb',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={calc.formula}>
                    = {calc.formula}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                    From: {calc.orderTypeName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Basic Information Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Basic Information</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Name *</label>
                <FieldTooltip
                  content="Enter a descriptive name for this export type (e.g., Basic Export, Dispatch Report)"
                  position="right" />

              </div>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., Production Report"
                required />

            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Code *</label>
                <FieldTooltip
                  content="Short code for this export type (e.g., PROD, DISP). Will be converted to uppercase."
                  position="right" />

              </div>
              <input
                type="text"
                value={typeCode}
                onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
                className="orderTypeFormInput"
                placeholder="e.g., PROD"
                maxLength={20}
                required />

            </div>
          </div>

          <div className="orderTypeFormColumn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <label className="orderTypeInputLabel">Description</label>
              <FieldTooltip
                content="Optional description explaining when to use this export type"
                position="right" />

            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder="Describe when to use this export type..."
              rows={2} />

          </div>
        </div>

        {/* Link Order Types Section with Details */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Link to Order Types
            <span style={{ marginLeft: '10px', fontSize: '13px', fontWeight: 400, color: '#6b7280' }}>
              ({linkedOrderTypes.length} selected)
            </span>
          </h3>

          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
            Select order types to link. Click to expand and see Options, Specs & Calculations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orderTypes && orderTypes.map((orderType: any) => {
              const isLinked = linkedOrderTypes.includes(orderType._id);
              const isExpanded = expandedOrderTypeDetails[orderType._id];
              const details = getOrderTypeDetails(orderType._id);
              const allowedCount = details?.allowedOptionTypes?.length || 0;
              const specsCount = details?.selectedSpecs?.length || 0;
              const calcsCount = details?.dynamicCalculations?.filter((c: any) => c.enabled !== false)?.length || 0;

              return (
                <div key={orderType._id} style={{
                  border: isLinked ? '2px solid #10B981' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: isLinked ? '#f0fdf4' : '#ffffff',
                  overflow: 'hidden'
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    gap: '12px'
                  }}>
                    <input
                      type="checkbox"
                      checked={isLinked}
                      onChange={() => toggleOrderType(orderType._id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }} />

                    <div style={{ flex: 1 }}>
                      <strong style={{ color: isLinked ? '#166534' : '#374151' }}>{orderType.typeName}</strong>
                      {orderType.typeCode &&
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '11px',
                        padding: '2px 6px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        color: '#6b7280'
                      }}>
                          {orderType.typeCode}
                        </span>
                      }
                      {orderType.orderCategory &&
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: orderType.orderCategory === 'billing' ? '#fef3c7' : '#dbeafe',
                        borderRadius: '4px',
                        color: orderType.orderCategory === 'billing' ? '#92400e' : '#1e40af'
                      }}>
                          {orderType.orderCategory}
                        </span>
                      }
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {allowedCount} Options • {specsCount} Specs • {calcsCount} Calculations
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleOrderTypeDetails(orderType._id)}
                      style={{
                        padding: '6px 12px',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>

                      {isExpanded ? '▼ Hide Details' : '▶ Show Details'}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && details &&
                  <div style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                      {/* Allowed Option Types */}
                      {details.allowedOptionTypes.length > 0 &&
                    <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '13px', color: '#374151' }}>
                              📦 Allowed Option Types ({details.allowedOptionTypes.length})
                            </strong>
                            <button
                          type="button"
                          onClick={() => {
                            const ids = details.allowedOptionTypes.map((ot: any) => typeof ot === 'string' ? ot : ot._id);
                            setLinkedOptionTypes((prev) => [...new Set([...prev, ...ids])]);
                            toast.success('Linked', `${ids.length} option types linked`);
                          }}
                          style={{
                            padding: '4px 10px',
                            background: '#FF6B35',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}>

                              + Link All to Export
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {details.allowedOptionTypes.map((allowedOt: any, idx: number) => {
                          const otId = typeof allowedOt === 'string' ? allowedOt : allowedOt._id;
                          const ot = optionTypes?.find((o: any) => o._id === otId);
                          const isOptionLinked = linkedOptionTypes.includes(otId);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleOptionType(otId)}
                              style={{
                                padding: '4px 10px',
                                background: isOptionLinked ? '#FF6B35' : '#fff',
                                color: isOptionLinked ? 'white' : '#374151',
                                border: isOptionLinked ? 'none' : '1px solid #e5e7eb',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}>

                                  {isOptionLinked ? '✓ ' : ''}{ot?.name || allowedOt?.name || otId}
                                </button>);

                        })}
                          </div>
                        </div>
                    }

                      {/* Selected Specs */}
                      {details.selectedSpecs.length > 0 &&
                    <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '13px', color: '#374151' }}>
                              📐 Selected Specs for Formulas ({details.selectedSpecs.length})
                            </strong>
                            <button
                          type="button"
                          onClick={addSelectedSpecsColumns}
                          style={{
                            padding: '4px 10px',
                            background: '#8B5CF6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}>

                              + Add as Export Columns
                            </button>
                          </div>
                          <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '8px'
                      }}>
                            {details.selectedSpecs.map((spec: any, idx: number) =>
                        <div key={idx} style={{
                          padding: '8px 12px',
                          background: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12px'
                        }}>
                                <div style={{ fontWeight: 500, color: '#374151' }}>
                                  {spec.optionTypeName}: {spec.specName}
                                </div>
                                <div style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace' }}>
                                  var: {spec.varName} {spec.unit && `| ${spec.unit}`}
                                </div>
                              </div>
                        )}
                          </div>
                        </div>
                    }

                      {/* Dynamic Calculations */}
                      {details.dynamicCalculations.filter((c: any) => c.enabled !== false).length > 0 &&
                    <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '13px', color: '#374151' }}>
                              🔢 Dynamic Calculations ({details.dynamicCalculations.filter((c: any) => c.enabled !== false).length})
                            </strong>
                            <button
                          type="button"
                          onClick={addCalculationColumns}
                          style={{
                            padding: '4px 10px',
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}>

                              + Add as Export Columns
                            </button>
                          </div>
                          <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '8px'
                      }}>
                            {details.dynamicCalculations.filter((c: any) => c.enabled !== false).map((calc: any, idx: number) =>
                        <div key={idx} style={{
                          padding: '10px 12px',
                          background: 'white',
                          borderRadius: '6px',
                          border: '1px solid #d1fae5',
                          fontSize: '12px'
                        }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <strong style={{ color: '#166534' }}>{calc.name}</strong>
                                  {calc.unit &&
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              background: '#d1fae5',
                              borderRadius: '4px',
                              color: '#166534'
                            }}>
                                      {calc.unit}
                                    </span>
                            }
                                </div>
                                <div style={{
                            fontSize: '10px',
                            color: '#6b7280',
                            fontFamily: 'monospace',
                            background: '#f3f4f6',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                                  = {calc.formula}
                                </div>
                              </div>
                        )}
                          </div>
                        </div>
                    }

                      {/* Empty state */}
                      {details.allowedOptionTypes.length === 0 && details.selectedSpecs.length === 0 && details.dynamicCalculations.length === 0 &&
                    <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                          No options, specs or calculations configured for this order type.
                        </div>
                    }
                    </div>
                  }
                </div>);

            })}
          </div>

          {linkedOrderTypes.length === 0 &&
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #86efac',
            fontSize: '13px',
            color: '#166534'
          }}>
              💡 No order types selected. This export template will be available for all order types.
            </div>
          }

          {/* Summary of linked data */}
          {(allDynamicCalculations.length > 0 || allSelectedSpecs.length > 0) &&
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#1e40af', fontSize: '13px' }}>
                  📊 From Selected Order Types:
                </strong>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {allSelectedSpecs.length > 0 &&
                <button
                  type="button"
                  onClick={addSelectedSpecsColumns}
                  style={{
                    padding: '4px 10px',
                    background: '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}>

                      + Add {allSelectedSpecs.length} Specs
                    </button>
                }
                  {allDynamicCalculations.length > 0 &&
                <button
                  type="button"
                  onClick={addCalculationColumns}
                  style={{
                    padding: '4px 10px',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}>

                      + Add {allDynamicCalculations.length} Calculations
                    </button>
                }
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {allSelectedSpecs.map((spec, idx) =>
              <span key={`spec-${idx}`} style={{
                padding: '3px 8px',
                background: '#e9d5ff',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#7c3aed'
              }}>
                    {spec.optionTypeName}: {spec.specName}
                  </span>
              )}
                {allDynamicCalculations.map((calc, idx) =>
              <span key={`calc-${idx}`} style={{
                padding: '3px 8px',
                background: '#d1fae5',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#166534'
              }}>
                    🔢 {calc.name}
                  </span>
              )}
              </div>
            </div>
          }
        </div>

        {/* Link Option Types Section with Specifications */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Link to Option Types & Specifications
            <span style={{ marginLeft: '10px', fontSize: '13px', fontWeight: 400, color: '#6b7280' }}>
              ({linkedOptionTypes.length} selected, {linkedSpecs.length} specs)
            </span>
          </h3>

          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
            Select option types to link. Click on an option type to see its specifications and add them as export columns.
          </p>

          {/* Suggested from OrderTypes */}
          {suggestedOptionTypes.length > 0 &&
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
              <strong style={{ color: '#1e40af', fontSize: '13px' }}>
                💡 Suggested from selected Order Types:
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {suggestedOptionTypes.map((sugId) => {
                const ot = optionTypes?.find((o: any) => o._id === sugId);
                if (!ot) return null;
                const isLinked = linkedOptionTypes.includes(sugId);
                return (
                  <button
                    key={sugId}
                    type="button"
                    onClick={() => toggleOptionType(sugId)}
                    style={{
                      padding: '4px 10px',
                      background: isLinked ? '#FF6B35' : '#dbeafe',
                      color: isLinked ? 'white' : '#1e40af',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}>

                      {isLinked ? '✓ ' : '+ '}{ot.name}
                    </button>);

              })}
              </div>
            </div>
          }

          {optionTypesLoading ?
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              Loading option types...
            </div> :

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {optionTypes && optionTypes.map((optionType: any) => {
              const isLinked = linkedOptionTypes.includes(optionType._id);
              const isExpanded = expandedOptionTypeSpecs[optionType._id];
              const specs = optionType.specifications || [];

              return (
                <div key={optionType._id} style={{
                  border: isLinked ? '2px solid #FF6B35' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: isLinked ? '#fff5f0' : '#ffffff',
                  overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    gap: '12px'
                  }}>
                      <input
                      type="checkbox"
                      checked={isLinked}
                      onChange={() => toggleOptionType(optionType._id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }} />

                      <div style={{ flex: 1 }}>
                        <strong style={{ color: isLinked ? '#9a3412' : '#374151' }}>{optionType.name}</strong>
                        {optionType.category?.name &&
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '11px',
                        padding: '2px 6px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        color: '#6b7280'
                      }}>
                            {optionType.category.name}
                          </span>
                      }
                        {specs.length > 0 &&
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '11px',
                        color: '#9ca3af'
                      }}>
                            ({specs.length} specs)
                          </span>
                      }
                      </div>
                      {specs.length > 0 &&
                    <>
                          {isLinked &&
                      <button
                        type="button"
                        onClick={() => addSpecColumnsFromOptionType(optionType._id)}
                        style={{
                          padding: '4px 10px',
                          background: '#10B981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}>

                              + Add Specs to Export
                            </button>
                      }
                          <button
                        type="button"
                        onClick={() => toggleOptionTypeSpecsExpansion(optionType._id)}
                        style={{
                          padding: '4px 8px',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}>

                            {isExpanded ? '▼' : '▶'} Specs
                          </button>
                        </>
                    }
                    </div>

                    {/* Specifications */}
                    {isExpanded && specs.length > 0 &&
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                        <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '8px'
                    }}>
                          {specs.map((spec: any, idx: number) =>
                      <div key={idx} style={{
                        padding: '8px 12px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}>
                              <div style={{ fontWeight: 500, color: '#374151' }}>{spec.name}</div>
                              <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                Type: {spec.dataType || 'string'}
                                {spec.unit && ` | Unit: ${spec.unit}`}
                                {spec.required && ' | Required'}
                              </div>
                            </div>
                      )}
                        </div>
                      </div>
                  }
                  </div>);

            })}
            </div>
          }

          {linkedOptionTypes.length === 0 && !optionTypesLoading &&
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#fff5f0',
            borderRadius: '8px',
            border: '1px solid #fed7c3',
            fontSize: '13px',
            color: '#9a3412'
          }}>
              💡 No option types selected. This export template will be available for all orders.
            </div>
          }

          {/* Linked Specs Summary */}
          {linkedSpecs.length > 0 &&
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #86efac'
          }}>
              <strong style={{ color: '#166534', fontSize: '13px' }}>
                📋 Linked Specifications ({linkedSpecs.length}):
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {linkedSpecs.map((spec, idx) =>
              <span key={idx} style={{
                padding: '3px 8px',
                background: '#dcfce7',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#166534'
              }}>
                    {spec.optionTypeName}: {spec.specName}
                    {spec.unit && ` (${spec.unit})`}
                  </span>
              )}
              </div>
            </div>
          }
        </div>

        {/* Column Configuration Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">
            Export Columns Configuration
            <span style={{
              marginLeft: '10px',
              fontSize: '13px',
              fontWeight: 400,
              color: selectedColumnsCount > 0 ? '#10B981' : '#ef4444'
            }}>
              ({selectedColumnsCount} columns selected)
            </span>
          </h3>

          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
            Select which columns to include in the Excel export. Click on category headers to expand/collapse.
          </p>

          <div className="orderTypeSectionsConfig">
            {COLUMN_CATEGORIES.map((category) => {
              const categoryColumns = columns.filter((c) => c.category === category.key);
              const selectedCount = categoryColumns.filter((c) => c.selected).length;
              const allSelected = categoryColumns.every((c) => c.selected);
              const isExpanded = expandedCategories[category.key];

              return (
                <div key={category.key} className="orderTypeSectionConfigItem">
                  <div className="orderTypeSectionConfigHeader">
                    <div className="orderTypeSectionConfigLeft">
                      <label className="orderTypeCheckboxLabel" style={{ border: 'none', padding: '0.5rem', background: 'none' }}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleCategory(category.key)} />

                      </label>
                      <span
                        className="orderTypeSectionName"
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onClick={() => toggleCategoryExpansion(category.key)}>

                        <span style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          background: category.color,
                          display: 'inline-block'
                        }}></span>
                        {category.label}
                      </span>
                    </div>
                    <div className="orderTypeSectionConfigRight">
                      <span className="orderTypeSectionOrder">
                        {selectedCount}/{categoryColumns.length}
                      </span>
                      <button
                        type="button"
                        className="orderTypeExpandBtn"
                        onClick={() => toggleCategoryExpansion(category.key)}>

                        {isExpanded ? '−' : '+'}
                      </button>
                    </div>
                  </div>

                  {isExpanded &&
                  <div className="orderTypeSectionFieldsConfig">
                      <div className="orderTypeFieldsHeader">
                        <span>Column Name</span>
                        <span style={{ textAlign: 'center' }}>Include</span>
                        <span style={{ textAlign: 'center' }}>Key</span>
                      </div>
                      {categoryColumns.map((col) =>
                    <div key={col.key} className="orderTypeFieldConfigRow">
                          <span className="orderTypeFieldLabel">{col.label}</span>
                          <input
                        type="checkbox"
                        checked={col.selected}
                        onChange={() => toggleColumn(col.key)} />

                          <span style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        fontFamily: 'monospace',
                        textAlign: 'center'
                      }}>
                            {col.key}
                          </span>
                        </div>
                    )}
                    </div>
                  }
                </div>);

            })}
          </div>
        </div>

        {/* Export Settings Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Export Settings</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Sheet Name</label>
                <FieldTooltip
                  content="Name of the Excel sheet (max 31 characters)"
                  position="right" />

              </div>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="orderTypeFormInput"
                placeholder="Orders"
                maxLength={31} />

            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">File Name Prefix</label>
                <FieldTooltip
                  content="Prefix for the exported file name (e.g., Export_2024-01-15.xlsx)"
                  position="right" />

              </div>
              <input
                type="text"
                value={fileNamePrefix}
                onChange={(e) => setFileNamePrefix(e.target.value)}
                className="orderTypeFormInput"
                placeholder="Export"
                maxLength={50} />

            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label className="orderTypeCheckboxLabel" style={{ display: 'inline-flex', width: 'auto' }}>
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)} />

              <span>Include Column Headers in Export</span>
            </label>
          </div>

          <div className="orderTypeFormatPreview" style={{ marginTop: '1rem' }}>
            <strong>Preview File Name:</strong> {fileNamePrefix}_{new Date().toISOString().split('T')[0]}.xlsx
          </div>
        </div>

        {/* Advanced Settings Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Advanced Settings</h3>

          <div className="orderTypeCheckboxGrid">
            {(userRole === 'admin' || userRole === 'master_admin') &&
            <label className="orderTypeCheckboxLabel">
                <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => setIsGlobal(e.target.checked)} />

                <span>Global Export Type</span>
                <FieldTooltip
                content="Make this export type available across all branches"
                position="right" />

              </label>
            }

            <label className="orderTypeCheckboxLabel">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)} />

              <span>Set as Default</span>
              <FieldTooltip
                content="Make this the default export type when exporting orders to Excel"
                position="right" />

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
                  padding: '8px 20px',
                  background: isActive ? '#22c55e' : '#e5e7eb',
                  color: isActive ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: isActive ? '600' : '400'
                }}>

                Active
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                style={{
                  padding: '8px 20px',
                  background: !isActive ? '#ef4444' : '#e5e7eb',
                  color: !isActive ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: !isActive ? '600' : '400'
                }}>

                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="orderTypeFormActions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
            className="orderTypeSaveButton"
            disabled={!typeName.trim() || !typeCode.trim() || selectedColumnsCount === 0}>

            {editMode ? 'Update Excel Export Type' : 'Save Excel Export Type'}
          </ActionButton>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            {selectedColumnsCount > 0 ?
            <span style={{ color: '#10b981', fontWeight: 500 }}>
                ✓ {selectedColumnsCount} columns
                {linkedOrderTypes.length > 0 && ` • ${linkedOrderTypes.length} order types`}
                {linkedOptionTypes.length > 0 && ` • ${linkedOptionTypes.length} option types`}
              </span> :

            <span style={{ color: '#ef4444' }}>Select at least one column</span>
            }
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>);

};

export default CreateExcelExportType;