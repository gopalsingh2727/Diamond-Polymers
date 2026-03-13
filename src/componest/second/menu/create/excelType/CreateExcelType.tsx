import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createExcelTypeV2 as createExcelType, updateExcelTypeV2 as updateExcelType, deleteExcelTypeV2 as deleteExcelType } from "../../../../redux/unifiedV2/excelTypeActions";
import { getOrderTypesV2 as getOrderTypes } from "../../../../redux/unifiedV2/orderTypeActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import "../orderType/orderType.css";

interface Column {
  fieldName: string;
  headerName: string;
  dataField: string;
  width: number;
  format: 'text' | 'number' | 'currency' | 'date' | 'percentage' | 'boolean';
  alignment: 'left' | 'center' | 'right';
  formula?: string;
  isVisible: boolean;
  order: number;
}

interface SheetConfig {
  sheetName: string;
  columns: Column[];
  freezeRows: number;
  freezeColumns: number;
  autoFilter: boolean;
  showGridLines: boolean;
  styling: {
    headerBgColor: string;
    headerTextColor: string;
    headerFontSize: number;
    headerFontBold: boolean;
    rowBgColor: string;
    rowAltBgColor: string;
    rowTextColor: string;
    rowFontSize: number;
    borderColor: string;
    borderStyle: 'thin' | 'medium' | 'thick' | 'none';
  };
}

interface CreateExcelTypeProps {
  initialData?: any;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateExcelType: React.FC<CreateExcelTypeProps> = ({ initialData: propInitialData, onCancel, onSaveSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode detection
  const { excelTypeData: locationData, isEdit } = location.state || {};
  const excelTypeData = propInitialData || locationData;
  const editMode = Boolean(propInitialData || isEdit || excelTypeData && excelTypeData._id);
  const excelTypeId = excelTypeData?._id;

  // Basic Information
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");

  // Category
  const [category, setCategory] = useState<'account' | 'manufacturing'>('manufacturing');
  const [subCategory, setSubCategory] = useState("");

  // Excel Configuration
  const [fileName, setFileName] = useState("export");
  const [fileNamePattern, setFileNamePattern] = useState("{{typeName}}_{{date}}");
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'xls'>('xlsx');

  // Sheet Configuration
  const [sheets, setSheets] = useState<SheetConfig[]>([{
    sheetName: 'Sheet1',
    columns: [],
    freezeRows: 1,
    freezeColumns: 0,
    autoFilter: true,
    showGridLines: true,
    styling: {
      headerBgColor: '#1e40af',
      headerTextColor: '#ffffff',
      headerFontSize: 12,
      headerFontBold: true,
      rowBgColor: '#ffffff',
      rowAltBgColor: '#f3f4f6',
      rowTextColor: '#1f2937',
      rowFontSize: 11,
      borderColor: '#d1d5db',
      borderStyle: 'thin'
    }
  }]);

  // Active sheet for editing
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  // Totals Configuration
  const [showTotalsRow, setShowTotalsRow] = useState(true);

  // Linked Order Types
  const [linkedOrderTypes, setLinkedOrderTypes] = useState<string[]>([]);

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Template Library modal
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  // Get user role
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // Get order types from Redux
  const rawOrderTypes = useSelector((state: any) => state.v2.orderType?.list);
  const orderTypes = Array.isArray(rawOrderTypes) ? rawOrderTypes : [];

  // Fetch order types on mount
  useEffect(() => {
    dispatch(getOrderTypes());
  }, [dispatch]);

  // Sub-categories based on main category
  const subCategories = category === 'account'
    ? [
        { value: 'billing', label: 'Billing' },
        { value: 'invoice', label: 'Invoice' },
        { value: 'financial_report', label: 'Financial Report' },
        { value: 'tax_report', label: 'Tax Report' },
        { value: 'payment_report', label: 'Payment Report' },
      ]
    : [
        { value: 'production', label: 'Production' },
        { value: 'orders', label: 'Orders' },
        { value: 'machine_report', label: 'Machine Report' },
        { value: 'operator_report', label: 'Operator Report' },
        { value: 'inventory', label: 'Inventory' },
        { value: 'bill', label: 'Bill' },
        { value: 'quality_report', label: 'Quality Report' },
      ];

  // Available data fields for columns
  const availableFields = [
    { field: 'orderId', label: 'Order ID', format: 'text' },
    { field: 'orderNumber', label: 'Order Number', format: 'text' },
    { field: 'date', label: 'Order Date', format: 'date' },
    { field: 'customerName', label: 'Customer Name', format: 'text' },
    { field: 'customerPhone', label: 'Customer Phone', format: 'text' },
    { field: 'customerEmail', label: 'Customer Email', format: 'text' },
    { field: 'customerAddress', label: 'Customer Address', format: 'text' },
    { field: 'optionName', label: 'Product/Option Name', format: 'text' },
    { field: 'optionType', label: 'Option Type', format: 'text' },
    { field: 'optionCode', label: 'Option Code', format: 'text' },
    { field: 'quantity', label: 'Quantity', format: 'number' },
    { field: 'rate', label: 'Rate', format: 'currency' },
    { field: 'amount', label: 'Amount', format: 'currency' },
    { field: 'subtotal', label: 'Subtotal', format: 'currency' },
    { field: 'tax', label: 'Tax', format: 'currency' },
    { field: 'discount', label: 'Discount', format: 'currency' },
    { field: 'grandTotal', label: 'Grand Total', format: 'currency' },
    { field: 'status', label: 'Status', format: 'text' },
    { field: 'priority', label: 'Priority', format: 'text' },
    { field: 'branch', label: 'Branch', format: 'text' },
    { field: 'createdAt', label: 'Created Date', format: 'date' },
    { field: 'updatedAt', label: 'Updated Date', format: 'date' },
    { field: 'weight', label: 'Weight', format: 'number' },
    { field: 'purity', label: 'Purity', format: 'percentage' },
  ];

  // Template Library
  const templateLibrary = [
    {
      name: "Invoice Export",
      description: "Standard invoice export with customer and item details",
      category: 'account',
      subCategory: 'invoice',
      sheets: [{
        sheetName: 'Invoice',
        columns: [
          { fieldName: 'orderNumber', headerName: 'Invoice #', dataField: 'orderNumber', width: 15, format: 'text' as const, alignment: 'left' as const, isVisible: true, order: 0 },
          { fieldName: 'date', headerName: 'Date', dataField: 'date', width: 12, format: 'date' as const, alignment: 'center' as const, isVisible: true, order: 1 },
          { fieldName: 'customerName', headerName: 'Customer', dataField: 'customerName', width: 25, format: 'text' as const, alignment: 'left' as const, isVisible: true, order: 2 },
          { fieldName: 'optionName', headerName: 'Item', dataField: 'optionName', width: 30, format: 'text' as const, alignment: 'left' as const, isVisible: true, order: 3 },
          { fieldName: 'quantity', headerName: 'Qty', dataField: 'quantity', width: 10, format: 'number' as const, alignment: 'right' as const, isVisible: true, order: 4 },
          { fieldName: 'rate', headerName: 'Rate', dataField: 'rate', width: 12, format: 'currency' as const, alignment: 'right' as const, isVisible: true, order: 5 },
          { fieldName: 'amount', headerName: 'Amount', dataField: 'amount', width: 15, format: 'currency' as const, alignment: 'right' as const, isVisible: true, order: 6 },
        ],
        freezeRows: 1,
        freezeColumns: 0,
        autoFilter: true,
        showGridLines: true,
        styling: {
          headerBgColor: '#1e40af',
          headerTextColor: '#ffffff',
          headerFontSize: 12,
          headerFontBold: true,
          rowBgColor: '#ffffff',
          rowAltBgColor: '#f3f4f6',
          rowTextColor: '#1f2937',
          rowFontSize: 11,
          borderColor: '#d1d5db',
          borderStyle: 'thin' as const
        }
      }]
    },
    {
      name: "Orders Report",
      description: "Manufacturing orders with status and progress",
      category: 'manufacturing',
      subCategory: 'orders',
      sheets: [{
        sheetName: 'Orders',
        columns: [
          { fieldName: 'orderId', headerName: 'Order ID', dataField: 'orderId', width: 15, format: 'text' as const, alignment: 'left' as const, isVisible: true, order: 0 },
          { fieldName: 'date', headerName: 'Date', dataField: 'date', width: 12, format: 'date' as const, alignment: 'center' as const, isVisible: true, order: 1 },
          { fieldName: 'customerName', headerName: 'Customer', dataField: 'customerName', width: 25, format: 'text' as const, alignment: 'left' as const, isVisible: true, order: 2 },
          { fieldName: 'optionName', headerName: 'Product', dataField: 'optionName', width: 25, format: 'text' as const, alignment: 'left' as const, isVisible: true, order: 3 },
          { fieldName: 'quantity', headerName: 'Quantity', dataField: 'quantity', width: 12, format: 'number' as const, alignment: 'right' as const, isVisible: true, order: 4 },
          { fieldName: 'status', headerName: 'Status', dataField: 'status', width: 15, format: 'text' as const, alignment: 'center' as const, isVisible: true, order: 5 },
          { fieldName: 'priority', headerName: 'Priority', dataField: 'priority', width: 12, format: 'text' as const, alignment: 'center' as const, isVisible: true, order: 6 },
        ],
        freezeRows: 1,
        freezeColumns: 1,
        autoFilter: true,
        showGridLines: true,
        styling: {
          headerBgColor: '#059669',
          headerTextColor: '#ffffff',
          headerFontSize: 12,
          headerFontBold: true,
          rowBgColor: '#ffffff',
          rowAltBgColor: '#ecfdf5',
          rowTextColor: '#1f2937',
          rowFontSize: 11,
          borderColor: '#d1d5db',
          borderStyle: 'thin' as const
        }
      }]
    },
    {
      name: "Bill Export",
      description: "Detailed bill with all charges",
      category: 'manufacturing',
      subCategory: 'bill',
      sheets: [{
        sheetName: 'Bill',
        columns: [
          { fieldName: 'orderNumber', headerName: 'Bill #', dataField: 'orderNumber', width: 15, format: 'text' as const, alignment: 'left' as const, isVisible: true, order: 0 },
          { fieldName: 'date', headerName: 'Date', dataField: 'date', width: 12, format: 'date' as const, alignment: 'center' as const, isVisible: true, order: 1 },
          { fieldName: 'customerName', headerName: 'Customer', dataField: 'customerName', width: 25, format: 'text' as const, alignment: 'left' as const, isVisible: true, order: 2 },
          { fieldName: 'optionName', headerName: 'Item', dataField: 'optionName', width: 30, format: 'text' as const, alignment: 'left' as const, isVisible: true, order: 3 },
          { fieldName: 'quantity', headerName: 'Qty', dataField: 'quantity', width: 10, format: 'number' as const, alignment: 'right' as const, isVisible: true, order: 4 },
          { fieldName: 'rate', headerName: 'Rate', dataField: 'rate', width: 12, format: 'currency' as const, alignment: 'right' as const, isVisible: true, order: 5 },
          { fieldName: 'amount', headerName: 'Amount', dataField: 'amount', width: 15, format: 'currency' as const, alignment: 'right' as const, isVisible: true, order: 6 },
          { fieldName: 'tax', headerName: 'Tax', dataField: 'tax', width: 12, format: 'currency' as const, alignment: 'right' as const, isVisible: true, order: 7 },
          { fieldName: 'grandTotal', headerName: 'Total', dataField: 'grandTotal', width: 15, format: 'currency' as const, alignment: 'right' as const, isVisible: true, order: 8 },
        ],
        freezeRows: 1,
        freezeColumns: 0,
        autoFilter: true,
        showGridLines: true,
        styling: {
          headerBgColor: '#7c3aed',
          headerTextColor: '#ffffff',
          headerFontSize: 12,
          headerFontBold: true,
          rowBgColor: '#ffffff',
          rowAltBgColor: '#f5f3ff',
          rowTextColor: '#1f2937',
          rowFontSize: 11,
          borderColor: '#d1d5db',
          borderStyle: 'thin' as const
        }
      }]
    }
  ];

  // Load template from library
  const loadTemplate = (template: typeof templateLibrary[0]) => {
    setCategory(template.category as 'account' | 'manufacturing');
    setSubCategory(template.subCategory);
    setSheets(template.sheets);
    setShowTemplateLibrary(false);
    toast.success('Template Loaded', `"${template.name}" has been loaded successfully`);
  };

  // Add new sheet
  const addSheet = () => {
    const newSheet: SheetConfig = {
      sheetName: `Sheet${sheets.length + 1}`,
      columns: [],
      freezeRows: 1,
      freezeColumns: 0,
      autoFilter: true,
      showGridLines: true,
      styling: {
        headerBgColor: '#1e40af',
        headerTextColor: '#ffffff',
        headerFontSize: 12,
        headerFontBold: true,
        rowBgColor: '#ffffff',
        rowAltBgColor: '#f3f4f6',
        rowTextColor: '#1f2937',
        rowFontSize: 11,
        borderColor: '#d1d5db',
        borderStyle: 'thin'
      }
    };
    setSheets([...sheets, newSheet]);
    setActiveSheetIndex(sheets.length);
  };

  // Remove sheet
  const removeSheet = (index: number) => {
    if (sheets.length <= 1) {
      toast.error('Error', 'At least one sheet is required');
      return;
    }
    const newSheets = sheets.filter((_, i) => i !== index);
    setSheets(newSheets);
    if (activeSheetIndex >= newSheets.length) {
      setActiveSheetIndex(newSheets.length - 1);
    }
  };

  // Update sheet
  const updateSheet = (index: number, updates: Partial<SheetConfig>) => {
    const newSheets = [...sheets];
    newSheets[index] = { ...newSheets[index], ...updates };
    setSheets(newSheets);
  };

  // Add column to active sheet
  const addColumn = () => {
    const currentSheet = sheets[activeSheetIndex];
    const newColumn: Column = {
      fieldName: '',
      headerName: '',
      dataField: '',
      width: 15,
      format: 'text',
      alignment: 'left',
      isVisible: true,
      order: currentSheet.columns.length
    };
    updateSheet(activeSheetIndex, {
      columns: [...currentSheet.columns, newColumn]
    });
  };

  // Update column
  const updateColumn = (columnIndex: number, updates: Partial<Column>) => {
    const currentSheet = sheets[activeSheetIndex];
    const newColumns = [...currentSheet.columns];
    newColumns[columnIndex] = { ...newColumns[columnIndex], ...updates };
    updateSheet(activeSheetIndex, { columns: newColumns });
  };

  // Remove column
  const removeColumn = (columnIndex: number) => {
    const currentSheet = sheets[activeSheetIndex];
    const newColumns = currentSheet.columns.filter((_, i) => i !== columnIndex);
    updateSheet(activeSheetIndex, { columns: newColumns });
  };

  // Quick add column from available fields
  const quickAddColumn = (field: typeof availableFields[0]) => {
    const currentSheet = sheets[activeSheetIndex];
    const newColumn: Column = {
      fieldName: field.field,
      headerName: field.label,
      dataField: field.field,
      width: 15,
      format: field.format as Column['format'],
      alignment: field.format === 'number' || field.format === 'currency' || field.format === 'percentage' ? 'right' : 'left',
      isVisible: true,
      order: currentSheet.columns.length
    };
    updateSheet(activeSheetIndex, {
      columns: [...currentSheet.columns, newColumn]
    });
    toast.success('Column Added', `"${field.label}" column added`);
  };

  // Export configuration as JSON
  const exportConfig = () => {
    const configData = {
      typeName,
      typeCode,
      description,
      category,
      subCategory,
      fileName,
      fileNamePattern,
      exportFormat,
      sheets,
      showTotalsRow,
      linkedOrderTypes,
      isGlobal,
      isDefault,
      isActive,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excel-type-${typeCode || 'export'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Export Success', 'Configuration exported successfully');
  };

  // Import configuration from JSON
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.typeName) setTypeName(data.typeName);
        if (data.typeCode) setTypeCode(data.typeCode);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        if (data.subCategory) setSubCategory(data.subCategory);
        if (data.fileName) setFileName(data.fileName);
        if (data.fileNamePattern) setFileNamePattern(data.fileNamePattern);
        if (data.exportFormat) setExportFormat(data.exportFormat);
        if (data.sheets) setSheets(data.sheets);
        if (data.showTotalsRow !== undefined) setShowTotalsRow(data.showTotalsRow);
        if (data.linkedOrderTypes) setLinkedOrderTypes(data.linkedOrderTypes);
        if (data.isGlobal !== undefined) setIsGlobal(data.isGlobal);
        if (data.isDefault !== undefined) setIsDefault(data.isDefault);
        if (data.isActive !== undefined) setIsActive(data.isActive);

        toast.success('Import Success', 'Configuration imported successfully');
      } catch (error) {
        toast.error('Import Error', 'Invalid configuration file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Handle back navigation
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
    if (editMode && excelTypeData) {
      setTypeName(excelTypeData.typeName || "");
      setTypeCode(excelTypeData.typeCode || "");
      setDescription(excelTypeData.description || "");
      setCategory(excelTypeData.category || 'manufacturing');
      setSubCategory(excelTypeData.subCategory || "");
      setFileName(excelTypeData.fileName || "export");
      setFileNamePattern(excelTypeData.fileNamePattern || "{{typeName}}_{{date}}");
      setExportFormat(excelTypeData.exportFormat || 'xlsx');

      if (excelTypeData.sheets && Array.isArray(excelTypeData.sheets)) {
        setSheets(excelTypeData.sheets);
      }

      setShowTotalsRow(excelTypeData.showTotalsRow !== false);

      if (excelTypeData.linkedOrderTypes && Array.isArray(excelTypeData.linkedOrderTypes)) {
        const orderTypeIds = excelTypeData.linkedOrderTypes.map((ot: any) =>
          typeof ot === 'string' ? ot : ot._id
        );
        setLinkedOrderTypes(orderTypeIds);
      }

      setIsGlobal(excelTypeData.isGlobal || false);
      setIsDefault(excelTypeData.isDefault || false);
      setIsActive(excelTypeData.isActive !== false);
    }
  }, [editMode, excelTypeData]);

  const handleSubmit = () => {
    // Validation
    if (!typeName.trim() || !typeCode.trim()) {
      toast.error("Validation Error", "Please fill all required fields: Type Name and Type Code");
      return;
    }

    // Check at least one sheet has columns
    const hasColumns = sheets.some(sheet => sheet.columns.length > 0);
    if (!hasColumns) {
      toast.error("Validation Error", "Please add at least one column to a sheet");
      return;
    }

    const branchId = localStorage.getItem('selectedBranch') || '';
    const dataToSave = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      category,
      subCategory: subCategory || undefined,
      fileName,
      fileNamePattern,
      exportFormat,
      sheets,
      showTotalsRow,
      linkedOrderTypes,
      branchId,
      isGlobal,
      isDefault,
      isActive
    };

    if (editMode && excelTypeId) {
      handleSave(
        () => dispatch(updateExcelType(excelTypeId, dataToSave)),
        {
          successMessage: "Excel type updated successfully!",
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
        () => dispatch(createExcelType(dataToSave)),
        {
          successMessage: "Excel type created successfully!",
          onSuccess: () => {
            setTypeName("");
            setTypeCode("");
            setDescription("");
            setCategory('manufacturing');
            setSubCategory("");
            setFileName("export");
            setFileNamePattern("{{typeName}}_{{date}}");
            setExportFormat('xlsx');
            setSheets([{
              sheetName: 'Sheet1',
              columns: [],
              freezeRows: 1,
              freezeColumns: 0,
              autoFilter: true,
              showGridLines: true,
              styling: {
                headerBgColor: '#1e40af',
                headerTextColor: '#ffffff',
                headerFontSize: 12,
                headerFontBold: true,
                rowBgColor: '#ffffff',
                rowAltBgColor: '#f3f4f6',
                rowTextColor: '#1f2937',
                rowFontSize: 11,
                borderColor: '#d1d5db',
                borderStyle: 'thin'
              }
            }]);
            setShowTotalsRow(true);
            setLinkedOrderTypes([]);
            setIsGlobal(false);
            setIsDefault(false);
          }
        }
      );
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!excelTypeId) return;

    setDeleting(true);
    try {
      await dispatch(deleteExcelType(excelTypeId));
      toast.success('Deleted', 'Excel type deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete excel type');
    } finally {
      setDeleting(false);
    }
  };

  const activeSheet = sheets[activeSheetIndex];

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
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Excel Type?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this excel type? This action cannot be undone.
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
                {editMode ? 'Edit Excel Type' : 'Create Excel Type'}
              </h2>
              <p className="orderTypeSubtitle">
                {editMode
                  ? `Editing: ${excelTypeData?.typeName || 'Excel Type'}`
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
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
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
                  content="Enter a descriptive name for this excel type (e.g., Invoice Export, Orders Report)"
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., Invoice Export"
                required
              />
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Code *</label>
                <FieldTooltip
                  content="Short code for this excel type (e.g., INV_EXP, ORD_RPT). Will be converted to uppercase."
                  position="right"
                />
              </div>
              <input
                type="text"
                value={typeCode}
                onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
                className="orderTypeFormInput"
                placeholder="e.g., INV_EXP"
                maxLength={20}
                required
              />
            </div>
          </div>

          <div className="orderTypeFormColumn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <label className="orderTypeInputLabel">Description</label>
              <FieldTooltip
                content="Optional description explaining when to use this excel type"
                position="right"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder="Describe when to use this excel type..."
              rows={3}
            />
          </div>
        </div>

        {/* Category Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Category</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Main Category *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setCategory('account'); setSubCategory(''); }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: category === 'account' ? '#1e40af' : '#e5e7eb',
                    color: category === 'account' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: category === 'account' ? 600 : 400,
                    transition: 'all 0.2s'
                  }}
                >
                  Account
                  <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                    Billing, Invoices, Financial
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setCategory('manufacturing'); setSubCategory(''); }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: category === 'manufacturing' ? '#059669' : '#e5e7eb',
                    color: category === 'manufacturing' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: category === 'manufacturing' ? 600 : 400,
                    transition: 'all 0.2s'
                  }}
                >
                  Manufacturing
                  <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                    Orders, Production, Bills
                  </div>
                </button>
              </div>
            </div>

            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Sub-Category</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="orderTypeFormInput"
              >
                <option value="">-- Select Sub-Category --</option>
                {subCategories.map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Export Configuration */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Export Configuration</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">File Name Prefix</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="orderTypeFormInput"
                placeholder="export"
              />
            </div>

            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'xlsx' | 'csv' | 'xls')}
                className="orderTypeFormInput"
              >
                <option value="xlsx">XLSX (Excel 2007+)</option>
                <option value="csv">CSV</option>
                <option value="xls">XLS (Legacy)</option>
              </select>
            </div>
          </div>

          <div className="orderTypeFormColumn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <label className="orderTypeInputLabel">File Name Pattern</label>
              <FieldTooltip
                content="Use {{typeName}}, {{date}}, {{timestamp}} as placeholders"
                position="right"
              />
            </div>
            <input
              type="text"
              value={fileNamePattern}
              onChange={(e) => setFileNamePattern(e.target.value)}
              className="orderTypeFormInput"
              placeholder="{{typeName}}_{{date}}"
            />
          </div>
        </div>

        {/* Sheet Configuration */}
        <div className="orderTypeSection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="orderTypeSectionTitle" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
              Sheet & Column Configuration
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowTemplateLibrary(true)}
                style={{
                  padding: '8px 16px',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Template Library
              </button>
              <button
                type="button"
                onClick={exportConfig}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Export
              </button>
              <label
                style={{
                  padding: '8px 16px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'inline-block'
                }}
              >
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfig}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                style={{
                  padding: '8px 16px',
                  background: showPreview ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                {showPreview ? 'Close Preview' : 'Preview'}
              </button>
            </div>
          </div>

          {/* Sheet Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {sheets.map((sheet, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  background: activeSheetIndex === index ? '#1e40af' : '#e5e7eb',
                  color: activeSheetIndex === index ? 'white' : '#374151',
                  borderRadius: '6px 6px 0 0',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
                onClick={() => setActiveSheetIndex(index)}
              >
                <span>{sheet.sheetName}</span>
                {sheets.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSheet(index); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: activeSheetIndex === index ? 'white' : '#374151',
                      cursor: 'pointer',
                      padding: '0 4px',
                      fontSize: '16px'
                    }}
                  >
                    x
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSheet}
              style={{
                padding: '8px 12px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              + Add Sheet
            </button>
          </div>

          {/* Active Sheet Configuration */}
          <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '16px', background: '#f9fafb' }}>
            <div className="orderTypeFormRow">
              <div className="orderTypeFormColumn">
                <label className="orderTypeInputLabel">Sheet Name</label>
                <input
                  type="text"
                  value={activeSheet.sheetName}
                  onChange={(e) => updateSheet(activeSheetIndex, { sheetName: e.target.value })}
                  className="orderTypeFormInput"
                  maxLength={31}
                />
              </div>
              <div className="orderTypeFormColumn">
                <label className="orderTypeInputLabel">Freeze Rows</label>
                <input
                  type="number"
                  value={activeSheet.freezeRows}
                  onChange={(e) => updateSheet(activeSheetIndex, { freezeRows: Number(e.target.value) })}
                  className="orderTypeFormInput"
                  min={0}
                  max={10}
                />
              </div>
              <div className="orderTypeFormColumn">
                <label className="orderTypeInputLabel">Freeze Columns</label>
                <input
                  type="number"
                  value={activeSheet.freezeColumns}
                  onChange={(e) => updateSheet(activeSheetIndex, { freezeColumns: Number(e.target.value) })}
                  className="orderTypeFormInput"
                  min={0}
                  max={5}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activeSheet.autoFilter}
                  onChange={(e) => updateSheet(activeSheetIndex, { autoFilter: e.target.checked })}
                />
                Auto Filter
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activeSheet.showGridLines}
                  onChange={(e) => updateSheet(activeSheetIndex, { showGridLines: e.target.checked })}
                />
                Show Grid Lines
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showTotalsRow}
                  onChange={(e) => setShowTotalsRow(e.target.checked)}
                />
                Show Totals Row
              </label>
            </div>

            {/* Quick Add Columns */}
            <div style={{ marginBottom: '16px' }}>
              <label className="orderTypeInputLabel" style={{ marginBottom: '8px', display: 'block' }}>Quick Add Columns</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {availableFields.slice(0, 12).map((field) => (
                  <button
                    key={field.field}
                    type="button"
                    onClick={() => quickAddColumn(field)}
                    style={{
                      padding: '4px 10px',
                      background: '#dbeafe',
                      color: '#1e40af',
                      border: '1px solid #93c5fd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    + {field.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="orderTypeInputLabel">Columns ({activeSheet.columns.length})</label>
                <button
                  type="button"
                  onClick={addColumn}
                  style={{
                    padding: '6px 12px',
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Add Column
                </button>
              </div>

              {activeSheet.columns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', background: '#f3f4f6', borderRadius: '8px', color: '#6b7280' }}>
                  No columns added yet. Use "Quick Add" or "Add Column" to add columns.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeSheet.columns.map((column, colIndex) => (
                    <div
                      key={colIndex}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 80px 100px 80px 40px',
                        gap: '8px',
                        alignItems: 'center',
                        padding: '8px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <input
                        type="text"
                        value={column.headerName}
                        onChange={(e) => updateColumn(colIndex, { headerName: e.target.value })}
                        placeholder="Header Name"
                        style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                      />
                      <select
                        value={column.dataField}
                        onChange={(e) => {
                          const field = availableFields.find(f => f.field === e.target.value);
                          updateColumn(colIndex, {
                            dataField: e.target.value,
                            fieldName: e.target.value,
                            format: (field?.format || 'text') as Column['format']
                          });
                        }}
                        style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                      >
                        <option value="">Select Field</option>
                        {availableFields.map((field) => (
                          <option key={field.field} value={field.field}>{field.label}</option>
                        ))}
                      </select>
                      <select
                        value={column.format}
                        onChange={(e) => updateColumn(colIndex, { format: e.target.value as Column['format'] })}
                        style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="currency">Currency</option>
                        <option value="date">Date</option>
                        <option value="percentage">Percentage</option>
                        <option value="boolean">Yes/No</option>
                      </select>
                      <input
                        type="number"
                        value={column.width}
                        onChange={(e) => updateColumn(colIndex, { width: Number(e.target.value) })}
                        placeholder="Width"
                        min={5}
                        max={100}
                        style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                      />
                      <select
                        value={column.alignment}
                        onChange={(e) => updateColumn(colIndex, { alignment: e.target.value as Column['alignment'] })}
                        style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                        <input
                          type="checkbox"
                          checked={column.isVisible}
                          onChange={(e) => updateColumn(colIndex, { isVisible: e.target.checked })}
                        />
                        Visible
                      </label>
                      <button
                        type="button"
                        onClick={() => removeColumn(colIndex)}
                        style={{
                          padding: '4px 8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Styling Section */}
            <div style={{ marginTop: '20px', padding: '12px', background: '#f0f9ff', borderRadius: '8px' }}>
              <label className="orderTypeInputLabel" style={{ marginBottom: '12px', display: 'block' }}>Header Styling</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#666' }}>Background</label>
                  <input
                    type="color"
                    value={activeSheet.styling.headerBgColor}
                    onChange={(e) => updateSheet(activeSheetIndex, {
                      styling: { ...activeSheet.styling, headerBgColor: e.target.value }
                    })}
                    style={{ width: '100%', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#666' }}>Text Color</label>
                  <input
                    type="color"
                    value={activeSheet.styling.headerTextColor}
                    onChange={(e) => updateSheet(activeSheetIndex, {
                      styling: { ...activeSheet.styling, headerTextColor: e.target.value }
                    })}
                    style={{ width: '100%', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#666' }}>Row Alt Color</label>
                  <input
                    type="color"
                    value={activeSheet.styling.rowAltBgColor}
                    onChange={(e) => updateSheet(activeSheetIndex, {
                      styling: { ...activeSheet.styling, rowAltBgColor: e.target.value }
                    })}
                    style={{ width: '100%', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#666' }}>Border</label>
                  <select
                    value={activeSheet.styling.borderStyle}
                    onChange={(e) => updateSheet(activeSheetIndex, {
                      styling: { ...activeSheet.styling, borderStyle: e.target.value as SheetConfig['styling']['borderStyle'] }
                    })}
                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                  >
                    <option value="thin">Thin</option>
                    <option value="medium">Medium</option>
                    <option value="thick">Thick</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Order Types */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Linked Order Types</h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {linkedOrderTypes.length > 0 ? (
                linkedOrderTypes.map((orderTypeId) => {
                  const orderType = orderTypes.find((ot: any) => ot._id === orderTypeId);
                  return orderType ? (
                    <div
                      key={orderTypeId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      <span>{orderType.typeName || orderType.name}</span>
                      <button
                        type="button"
                        onClick={() => setLinkedOrderTypes(linkedOrderTypes.filter((id) => id !== orderTypeId))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#1e40af',
                          cursor: 'pointer',
                          padding: '2px',
                          fontSize: '16px'
                        }}
                      >
                        x
                      </button>
                    </div>
                  ) : null;
                })
              ) : (
                <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                  No order types selected. This excel type will be available for all order types.
                </div>
              )}
            </div>

            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Add Order Type</label>
              <select
                className="orderTypeFormInput"
                value=""
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (selectedId && !linkedOrderTypes.includes(selectedId)) {
                    setLinkedOrderTypes([...linkedOrderTypes, selectedId]);
                  }
                }}
              >
                <option value="">-- Select Order Type --</option>
                {orderTypes
                  .filter((ot: any) => !linkedOrderTypes.includes(ot._id))
                  .map((ot: any) => (
                    <option key={ot._id} value={ot._id}>
                      {ot.typeName || ot.name} {ot.typeCode ? `(${ot.typeCode})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
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
                <span>Global Excel Type</span>
                <FieldTooltip
                  content="Make this excel type available across all branches"
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
                content="Make this the default excel type for the selected category"
                position="right"
              />
            </label>
          </div>

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
            disabled={!typeName.trim() || !typeCode.trim()}
          >
            {editMode ? 'Update Excel Type' : 'Create Excel Type'}
          </ActionButton>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999998,
            padding: '20px'
          }}
          onClick={() => setShowTemplateLibrary(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: 'white',
              borderRadius: '12px 12px 0 0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Excel Template Library</h2>
                <button
                  type="button"
                  onClick={() => setShowTemplateLibrary(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  x
                </button>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                Choose a pre-built template to get started quickly
              </p>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {templateLibrary.map((template, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => loadTemplate(template)}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                        {template.name}
                      </h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        {template.description}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          background: template.category === 'account' ? '#dbeafe' : '#d1fae5',
                          color: template.category === 'account' ? '#1e40af' : '#059669',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 500
                        }}>
                          {template.category}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          background: '#f3f4f6',
                          color: '#6b7280',
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          {template.sheets[0].columns.length} columns
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadTemplate(template);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Preview Modal */}
      {showPreview && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px'
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '1000px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '16px 20px',
              background: '#1e40af',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>Excel Preview - {activeSheet.sheetName}</h2>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '6px 14px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Close
              </button>
            </div>

            <div style={{ padding: '20px', overflow: 'auto' }}>
              {activeSheet.columns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No columns configured. Add columns to see the preview.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {activeSheet.columns.filter(c => c.isVisible).map((column, index) => (
                        <th
                          key={index}
                          style={{
                            padding: '10px 8px',
                            background: activeSheet.styling.headerBgColor,
                            color: activeSheet.styling.headerTextColor,
                            fontWeight: activeSheet.styling.headerFontBold ? 'bold' : 'normal',
                            fontSize: `${activeSheet.styling.headerFontSize}px`,
                            textAlign: column.alignment,
                            border: `1px solid ${activeSheet.styling.borderColor}`,
                            minWidth: `${column.width * 8}px`
                          }}
                        >
                          {column.headerName || column.fieldName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((row) => (
                      <tr key={row}>
                        {activeSheet.columns.filter(c => c.isVisible).map((column, index) => (
                          <td
                            key={index}
                            style={{
                              padding: '8px',
                              background: row % 2 === 0 ? activeSheet.styling.rowAltBgColor : activeSheet.styling.rowBgColor,
                              color: activeSheet.styling.rowTextColor,
                              fontSize: `${activeSheet.styling.rowFontSize}px`,
                              textAlign: column.alignment,
                              border: `1px solid ${activeSheet.styling.borderColor}`
                            }}
                          >
                            {column.format === 'currency' ? '₹1,000.00' :
                             column.format === 'number' ? '100' :
                             column.format === 'date' ? '29/01/2026' :
                             column.format === 'percentage' ? '95%' :
                             `Sample ${column.headerName}`}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {showTotalsRow && (
                      <tr>
                        {activeSheet.columns.filter(c => c.isVisible).map((column, index) => (
                          <td
                            key={index}
                            style={{
                              padding: '8px',
                              background: '#f3f4f6',
                              fontWeight: 'bold',
                              textAlign: column.alignment,
                              border: `1px solid ${activeSheet.styling.borderColor}`
                            }}
                          >
                            {index === 0 ? 'Total' :
                             (column.format === 'currency' || column.format === 'number') ? '3,000.00' : ''}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateExcelType;
