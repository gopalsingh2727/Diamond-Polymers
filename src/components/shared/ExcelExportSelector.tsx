import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getExcelExportTypesV2 as getExcelExportTypes, getExcelExportTypesByOptionTypeV2 as getExcelExportTypesByOptionType } from '../../componest/redux/unifiedV2/excelExportTypeActions';

// Define available export columns
export interface ExportColumn {
  key: string;
  label: string;
  selected: boolean;
  category: 'basic' | 'customer' | 'material' | 'status' | 'dates' | 'other';
}

// Saved export type from backend
export interface SavedExportType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  columns: ExportColumn[];
  includeHeaders: boolean;
  sheetName: string;
  fileNamePrefix: string;
  isDefault?: boolean;
}

// Predefined export templates (fallback)
export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  columns: string[];
}

const DEFAULT_TEMPLATES: ExportTemplate[] = [
{
  id: 'basic',
  name: 'Basic Export',
  description: 'Order ID, Customer, Status, Date',
  columns: ['orderId', 'customerName', 'status', 'date', 'weight']
},
{
  id: 'detailed',
  name: 'Detailed Export',
  description: 'All order details with material info',
  columns: ['orderId', 'date', 'customerName', 'phone', 'status', 'weight', 'width', 'height', 'thickness', 'material', 'branch', 'notes']
},
{
  id: 'dispatch',
  name: 'Dispatch Report',
  description: 'Dispatch and delivery information',
  columns: ['orderId', 'customerName', 'phone', 'dispatchStatus', 'trackingNumber', 'carrier', 'dispatchDate', 'weight']
},
{
  id: 'production',
  name: 'Production Report',
  description: 'Manufacturing and steps information',
  columns: ['orderId', 'customerName', 'status', 'stepsCompleted', 'totalSteps', 'material', 'weight', 'width', 'height']
},
{
  id: 'custom',
  name: 'Custom Export',
  description: 'Select your own columns',
  columns: []
}];


// All available columns - updated with options, machine status, and steps
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
{ key: 'notes', label: 'Notes', selected: false, category: 'other' }];


interface ExcelExportSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
  defaultFilename?: string;
  optionTypeId?: string;
  onExport?: (data: any[], filename: string) => void;
}

const ExcelExportSelector: React.FC<ExcelExportSelectorProps> = ({
  isOpen,
  onClose,
  orders,
  defaultFilename = 'Orders_Export',
  optionTypeId,
  onExport
}) => {
  const dispatch = useDispatch<any>();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('detailed');
  const [columns, setColumns] = useState<ExportColumn[]>(ALL_COLUMNS);
  const [filename, setFilename] = useState(defaultFilename);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [sheetName, setSheetName] = useState('Orders');

  // Saved export types from backend
  const [savedExportTypes, setSavedExportTypes] = useState<SavedExportType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [usingSavedType, setUsingSavedType] = useState(false);

  // Fetch saved export types when component opens
  useEffect(() => {
    if (isOpen) {
      fetchExportTypes();
    }
  }, [isOpen, optionTypeId]);

  const fetchExportTypes = async () => {
    setLoadingTypes(true);
    try {
      let result;
      if (optionTypeId) {
        result = await dispatch(getExcelExportTypesByOptionType(optionTypeId));
      } else {
        result = await dispatch(getExcelExportTypes());
      }

      if (result?.excelExportTypes && result.excelExportTypes.length > 0) {
        setSavedExportTypes(result.excelExportTypes);
        // Auto-select default export type if available
        const defaultType = result.excelExportTypes.find((t: SavedExportType) => t.isDefault);
        if (defaultType) {
          applyExportType(defaultType);
        }
      }
    } catch (error) {

      // Fall back to default templates
      setSavedExportTypes([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  // Apply a saved export type
  const applyExportType = (exportType: SavedExportType) => {
    setSelectedTemplate(exportType._id);
    setUsingSavedType(true);
    setFilename(exportType.fileNamePrefix || defaultFilename);
    setIncludeHeaders(exportType.includeHeaders);
    setSheetName(exportType.sheetName || 'Orders');

    // Apply columns from the saved type
    if (exportType.columns && exportType.columns.length > 0) {
      const savedColumnKeys = exportType.columns.
      filter((c) => c.selected).
      map((c) => c.key);

      setColumns(ALL_COLUMNS.map((col) => ({
        ...col,
        selected: savedColumnKeys.includes(col.key)
      })));
    }
  };

  // Update columns when template changes
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);

    // Check if it's a saved export type
    const savedType = savedExportTypes.find((t) => t._id === templateId);
    if (savedType) {
      applyExportType(savedType);
      return;
    }

    // Otherwise, it's a default template
    setUsingSavedType(false);

    if (templateId === 'custom') {
      return; // Keep current selection for custom
    }

    const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setColumns(columns.map((col) => ({
        ...col,
        selected: template.columns.includes(col.key)
      })));
    }
  };

  // Toggle column selection
  const toggleColumn = (key: string) => {
    setSelectedTemplate('custom');
    setUsingSavedType(false);
    setColumns(columns.map((col) =>
    col.key === key ? { ...col, selected: !col.selected } : col
    ));
  };

  // Select all columns in a category
  const toggleCategory = (category: string, selected: boolean) => {
    setSelectedTemplate('custom');
    setUsingSavedType(false);
    setColumns(columns.map((col) =>
    col.category === category ? { ...col, selected } : col
    ));
  };

  // Helper functions for extracting options data
  const getOptionsByCategory = (options: any[], category: string): string => {
    if (!options || !Array.isArray(options)) return 'N/A';
    const filtered = options.filter((opt: any) => opt.category === category);
    if (filtered.length === 0) return 'N/A';
    return filtered.map((opt: any) => `${opt.optionName || opt.optionCode}${opt.quantity ? ` (${opt.quantity})` : ''}`).join(', ');
  };

  const getAllOptions = (options: any[]): string => {
    if (!options || !Array.isArray(options)) return 'N/A';
    if (options.length === 0) return 'N/A';
    return options.map((opt: any) => `${opt.optionName || opt.optionCode} [${opt.category}]${opt.quantity ? ` x${opt.quantity}` : ''}`).join('; ');
  };

  const getTotalQuantity = (options: any[]): number => {
    if (!options || !Array.isArray(options)) return 0;
    return options.reduce((sum: number, opt: any) => sum + (opt.quantity || 0), 0);
  };

  // Helper functions for machine status
  const getCurrentStepMachineStatus = (steps: any[], currentStepIndex: number): string => {
    if (!steps || !Array.isArray(steps) || steps.length === 0) return 'N/A';
    const currentStep = steps[currentStepIndex] || steps[0];
    if (!currentStep?.machines || currentStep.machines.length === 0) return 'N/A';
    return currentStep.machines.map((m: any) => `${m.operatorName || 'Machine'}: ${m.status || 'none'}`).join(', ');
  };

  const getCompletedMachinesCount = (steps: any[]): number => {
    if (!steps || !Array.isArray(steps)) return 0;
    let count = 0;
    steps.forEach((step: any) => {
      if (step.machines) {
        count += step.machines.filter((m: any) => m.status === 'completed').length;
      }
    });
    return count;
  };

  const getTotalMachinesCount = (steps: any[]): number => {
    if (!steps || !Array.isArray(steps)) return 0;
    return steps.reduce((sum: number, step: any) => sum + (step.machines?.length || 0), 0);
  };

  const getCompletedStepsCount = (steps: any[]): number => {
    if (!steps || !Array.isArray(steps)) return 0;
    return steps.filter((step: any) => step.stepCompletedAt).length;
  };

  // Get data value from order based on column key
  const getOrderValue = (order: any, key: string): any => {
    const steps = order.steps || [];
    const options = order.options || [];
    const currentStepIndex = order.currentStepIndex || 0;

    switch (key) {
      // Basic
      case 'orderId':return order.orderId || order._id || 'N/A';
      case 'date':return order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A');
      case 'overallStatus':return order.overallStatus || order.status || 'N/A';
      case 'priority':return order.priority || 'normal';
      case 'orderType':return order.orderTypeId?.typeName || order.orderType?.typeName || 'N/A';

      // Customer
      case 'customerName':return order.customerId?.name || order.customer?.name || order.companyName || 'N/A';
      case 'phone':return order.customerId?.phone1 || order.customer?.phone1 || order.customer?.phone || 'N/A';
      case 'email':return order.customerId?.email || order.customer?.email || 'N/A';
      case 'address':return order.customerId?.address || order.customer?.address || 'N/A';
      case 'whatsapp':return order.customerId?.whatsapp || order.customer?.whatsapp || 'N/A';

      // Options (Products/Materials)
      case 'productOptions':return getOptionsByCategory(options, 'product');
      case 'materialOptions':return getOptionsByCategory(options, 'material');
      case 'printingOptions':return getOptionsByCategory(options, 'printing');
      case 'packagingOptions':return getOptionsByCategory(options, 'packaging');
      case 'optionQuantity':return getTotalQuantity(options);
      case 'allOptions':return getAllOptions(options);

      // Machine Status
      case 'currentStep':
        if (steps.length === 0) return 'N/A';
        const step = steps[currentStepIndex];
        return step?.stepId?.stepName || step?.stepName || `Step ${currentStepIndex + 1}`;
      case 'currentStepIndex':return currentStepIndex + 1;
      case 'machineStatus':return getCurrentStepMachineStatus(steps, currentStepIndex);
      case 'completedMachines':return getCompletedMachinesCount(steps);
      case 'totalMachines':return getTotalMachinesCount(steps);
      case 'machineProgress':{
          const total = getTotalMachinesCount(steps);
          const completed = getCompletedMachinesCount(steps);
          return total > 0 ? `${completed}/${total}` : 'N/A';
        }

      // Steps Progress
      case 'stepsCompleted':return getCompletedStepsCount(steps);
      case 'totalSteps':return steps.length;
      case 'stepProgress':{
          const total = steps.length;
          const completed = getCompletedStepsCount(steps);
          return total > 0 ? `${Math.round(completed / total * 100)}%` : 'N/A';
        }

      // Dates
      case 'createdAt':return order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
      case 'updatedAt':return order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A';
      case 'scheduledStart':return order.scheduledStartDate ? new Date(order.scheduledStartDate).toLocaleDateString() : 'N/A';
      case 'scheduledEnd':return order.scheduledEndDate ? new Date(order.scheduledEndDate).toLocaleDateString() : 'N/A';
      case 'actualStart':return order.actualStartDate ? new Date(order.actualStartDate).toLocaleDateString() : 'N/A';
      case 'actualEnd':return order.actualEndDate ? new Date(order.actualEndDate).toLocaleDateString() : 'N/A';
      case 'dispatchedDate':return order.dispatchedDate ? new Date(order.dispatchedDate).toLocaleDateString() : 'N/A';

      // Other
      case 'branch':return order.branchId?.name || order.branch?.name || 'N/A';
      case 'branchCode':return order.branchId?.code || order.branch?.code || 'N/A';
      case 'sameDayDispatch':return order.sameDayDispatch ? 'Yes' : 'No';
      case 'createdBy':return order.createdByRole || order.createdBy || 'N/A';
      case 'assignedManager':return order.assignedManager?.name || 'N/A';
      case 'notes':{
          const notes = order.notes || [];
          if (Array.isArray(notes)) {
            return notes.map((n: any) => n.message || n).join('; ');
          }
          return notes || '';
        }

      default:return 'N/A';
    }
  };

  // Export to Excel
  const handleExport = () => {
    const selectedColumns = columns.filter((col) => col.selected);

    if (selectedColumns.length === 0) {
      alert('Please select at least one column to export');
      return;
    }

    // Build export data
    const exportData = orders.map((order) => {
      const row: any = {};
      selectedColumns.forEach((col) => {
        row[col.label] = getOrderValue(order, col.key);
      });
      return row;
    });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData, {
      header: includeHeaders ? selectedColumns.map((c) => c.label) : undefined
    });

    // Set column widths
    const colWidths = selectedColumns.map((col) => ({ wch: Math.max(col.label.length + 2, 15) }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, finalFilename);

    // Callback
    if (onExport) {
      onExport(exportData, finalFilename);
    }

    onClose();
  };

  if (!isOpen) return null;

  const categories = ['basic', 'customer', 'material', 'status', 'dates', 'other'];
  const categoryLabels: Record<string, string> = {
    basic: 'Basic Info',
    customer: 'Customer',
    material: 'Material',
    status: 'Status',
    dates: 'Dates',
    other: 'Other'
  };

  // Combine saved types with default templates
  const allTemplates = [
  ...savedExportTypes.map((t) => ({
    id: t._id,
    name: t.typeName,
    description: t.description || `${t.columns?.filter((c) => c.selected).length || 0} columns`,
    isDefault: t.isDefault,
    isSaved: true
  })),
  ...DEFAULT_TEMPLATES.map((t) => ({
    ...t,
    isDefault: false,
    isSaved: false
  }))];


  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>Export to Excel</h3>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Template Selection */}
          <div style={sectionStyle}>
            <label style={labelStyle}>
              Export Template
              {loadingTypes && <span style={{ marginLeft: '10px', color: '#6b7280', fontSize: '12px' }}>Loading...</span>}
            </label>
            <div style={templateGridStyle}>
              {allTemplates.map((template) =>
              <div
                key={template.id}
                onClick={() => handleTemplateChange(template.id)}
                style={{
                  ...templateItemStyle,
                  borderColor: selectedTemplate === template.id ? '#FF6B35' : '#e5e7eb',
                  backgroundColor: selectedTemplate === template.id ? '#FFF5F2' : '#fff'
                }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{template.name}</span>
                    {template.isDefault &&
                  <span style={defaultBadgeStyle}>Default</span>
                  }
                    {template.isSaved &&
                  <span style={savedBadgeStyle}>Saved</span>
                  }
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{template.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Column Selection */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Select Columns ({columns.filter((c) => c.selected).length} selected)</label>
            <div style={columnsContainerStyle}>
              {categories.map((category) => {
                const categoryColumns = columns.filter((c) => c.category === category);
                const allSelected = categoryColumns.every((c) => c.selected);
                const someSelected = categoryColumns.some((c) => c.selected);

                return (
                  <div key={category} style={categoryStyle}>
                    <div
                      style={categoryHeaderStyle}
                      onClick={() => toggleCategory(category, !allSelected)}>

                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = someSelected && !allSelected;
                        }}
                        onChange={() => toggleCategory(category, !allSelected)}
                        style={{ marginRight: '8px' }} />

                      <span style={{ fontWeight: '600' }}>{categoryLabels[category]}</span>
                    </div>
                    <div style={columnListStyle}>
                      {categoryColumns.map((col) =>
                      <label key={col.key} style={columnItemStyle}>
                          <input
                          type="checkbox"
                          checked={col.selected}
                          onChange={() => toggleColumn(col.key)}
                          style={{ marginRight: '6px' }} />

                          {col.label}
                        </label>
                      )}
                    </div>
                  </div>);

              })}
            </div>
          </div>

          {/* Filename & Sheet Name */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ ...sectionStyle, flex: 1 }}>
              <label style={labelStyle}>Filename</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                style={inputStyle}
                placeholder="Enter filename" />

            </div>
            <div style={{ ...sectionStyle, flex: 1 }}>
              <label style={labelStyle}>Sheet Name</label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                style={inputStyle}
                placeholder="Sheet name"
                maxLength={31} />

            </div>
          </div>

          {/* Options */}
          <div style={sectionStyle}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                style={{ marginRight: '8px' }} />

              Include column headers
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            {orders.length} orders to export
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button onClick={handleExport} style={exportBtnStyle}>
              Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>);

};

// Styles
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  borderBottom: '1px solid #e5e7eb'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#6b7280'
};

const contentStyle: React.CSSProperties = {
  padding: '20px',
  overflowY: 'auto',
  flex: 1
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '20px'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px'
};

const templateGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '10px'
};

const templateItemStyle: React.CSSProperties = {
  padding: '12px',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const defaultBadgeStyle: React.CSSProperties = {
  backgroundColor: '#10b981',
  color: 'white',
  fontSize: '10px',
  padding: '2px 6px',
  borderRadius: '4px',
  fontWeight: '500'
};

const savedBadgeStyle: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: 'white',
  fontSize: '10px',
  padding: '2px 6px',
  borderRadius: '4px',
  fontWeight: '500'
};

const columnsContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '15px',
  maxHeight: '250px',
  overflowY: 'auto',
  padding: '10px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px'
};

const categoryStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '10px',
  border: '1px solid #e5e7eb'
};

const categoryHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
  cursor: 'pointer',
  color: '#374151'
};

const columnListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const columnItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '13px',
  color: '#4b5563',
  cursor: 'pointer'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px'
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  color: '#374151',
  cursor: 'pointer'
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 20px',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb'
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#fff',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500'
};

const exportBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500'
};

export default ExcelExportSelector;