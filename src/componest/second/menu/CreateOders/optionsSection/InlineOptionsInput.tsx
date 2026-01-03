import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Eye, Printer, FileSpreadsheet } from 'lucide-react';
import { useOrderFormData } from '../useOrderFormData';

import './optionsSection.css';

// OptionType specification template from backend
type SpecificationTemplate = {
  name: string;
  unit?: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'file' | 'link' | 'refer' | 'dropdown';
  defaultValue?: any;
  required?: boolean;
  allowFormula?: boolean;
  dropdownOptions?: string[];
  referenceTo?: string;
};

// Single option item type
export type OptionItem = {
  id: string;
  optionTypeId: string;
  optionTypeName: string;
  optionId: string;
  optionName: string;
  specificationValues: {[key: string]: any;};
};

// Export type for backward compatibility - now returns array
export type OptionData = OptionItem[];

// OptionType data structure from allowedOptionTypes
interface AllowedOptionType {
  _id: string;
  name: string;
  code?: string;
  category?: string;
  specifications?: SpecificationTemplate[];
}

interface CustomerInfo {
  name?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  companyName?: string;
}

interface InlineOptionsInputProps {
  orderTypeId?: string;
  title: string;
  onDataChange: (data: OptionItem[]) => void;
  initialData?: OptionItem[];
  isEditMode?: boolean;
  isBillingOrder?: boolean;
  allowedOptionTypes?: AllowedOptionType[];
  orderId?: string;
  customerInfo?: CustomerInfo;
  createdByName?: string;
  createdAt?: string;
  dynamicCalculations?: any[];
  calculatedValues?: {[key: string]: number | string;};
  onBackspace?: () => void;
}

// Ref interface for parent component access
export interface InlineOptionsInputRef {
  focus: () => void;
}

// Generate unique ID for option items
const generateId = () => `option_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

// Create empty option item
const createEmptyOption = (): OptionItem => ({
  id: generateId(),
  optionTypeId: '',
  optionTypeName: '',
  optionId: '',
  optionName: '',
  specificationValues: {}
});

// Helper function to check if a value is a file object
const isFileValue = (value: any): boolean => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return !!(value.fileName || value.name || value.fileSize || value.fileType || value.file);
  }
  return false;
};

// Helper function to get file URL for preview
const getFilePreviewUrl = (value: any): string | null => {









  if (!value) {

    return null;
  }

  // Priority 1: If it has a fileUrl (Base64 or server URL)
  if (value.fileUrl) {

    return value.fileUrl;
  }

  // Priority 2: If it has a url property
  if (value.url) {

    return value.url;
  }

  // Priority 3: If it's a File object, create object URL
  if (value.file instanceof File) {
    const objectUrl = URL.createObjectURL(value.file);

    return objectUrl;
  }

  // Priority 4: If value itself is a File object
  if (value instanceof File) {
    const objectUrl = URL.createObjectURL(value);

    return objectUrl;
  }


  return null;
};

// Helper function to get filename
const getFileName = (value: any): string => {
  if (value.fileName) return value.fileName;
  if (value.name) return value.name;
  if (value.filename) return value.filename;
  return 'file';
};

// Helper function to get file type
const getFileType = (value: any): string => {
  if (value.fileType) return value.fileType;
  if (value.type) return value.type;

  // Fallback: guess from filename extension
  const filename = getFileName(value);
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') return 'application/pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image/*';
  if (['doc', 'docx'].includes(ext || '')) return 'application/msword';
  if (['xls', 'xlsx'].includes(ext || '')) return 'application/vnd.ms-excel';

  return 'application/octet-stream';
};

// Helper function to check if file is an image
const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

// Helper function to check if file is a PDF
const isPdfFile = (fileType: string): boolean => {
  return fileType === 'application/pdf' || fileType.includes('pdf');
};

// Helper function to safely render specification values
const renderSpecValue = (value: any): string => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  // Handle boolean first (before object check)
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle file objects - return empty string (will be handled by renderSpecCell)
  if (isFileValue(value)) {
    return '';
  }

  // Handle other objects
  if (typeof value === 'object' && !Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Object]';
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Handle everything else
  return String(value);
};

const InlineOptionsInput = forwardRef<InlineOptionsInputRef, InlineOptionsInputProps>(({
  orderTypeId,
  title,
  onDataChange,
  initialData = [],
  isEditMode = false,
  isBillingOrder = false,
  allowedOptionTypes = [],
  orderId,
  customerInfo,
  createdByName,
  createdAt,
  dynamicCalculations = [],
  calculatedValues = {},
  onBackspace
}, ref) => {
  // ✅ OPTIMIZED: Use cached form data instead of making separate API calls
  const { options: cachedOptions, optionSpecs: cachedOptionSpecs } = useOrderFormData();

  // Use cached data (already filtered by branch)
  const options = cachedOptions || [];
  const optionSpecs = cachedOptionSpecs || [];

  // Saved options list
  const [selectedOptions, setSelectedOptions] = useState<OptionItem[]>([]);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);

  // Current option being edited in popup
  const [currentOption, setCurrentOption] = useState<OptionItem>(createEmptyOption());

  // Suggestions state
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  // Selected backend option for loading specs
  const [selectedBackendOption, setSelectedBackendOption] = useState<any>(null);

  // File preview modal state
  const [filePreview, setFilePreview] = useState<{url: string;name: string;type: string;} | null>(null);

  // Option type view popup state
  const [viewOptionTypePopup, setViewOptionTypePopup] = useState<{
    show: boolean;
    typeId: string;
    typeName: string;
    options: OptionItem[];
    specKeys: string[];
  } | null>(null);

  // View All Options popup state
  const [showAllOptionsPopup, setShowAllOptionsPopup] = useState(false);

  // Refs for Enter key navigation
  const typeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // ✅ FIXED: Track if this is the initial mount to prevent infinite loops
  const isInitialMount = useRef(true);
  const hasLoadedInitialData = useRef(false);

  // Expose focus method to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      setCurrentOption(createEmptyOption());
      setShowPopup(true);
      setTimeout(() => typeRef.current?.focus(), 100);
    }
  }));

  // ✅ REMOVED: No longer need to fetch options/optionSpecs separately
  // Data is now provided by useOrderFormData() hook which uses cached data from /order/form-data API

  // ✅ REMOVED: WebSocket updates are now handled by useOrderFormData() hook
  // which automatically refetches all form data when reference data is invalidated

  // Debug: Log options data
  useEffect(() => {

    if (options.length > 0) {



    }
  }, [options]);

  // Load initial data for edit mode (only once)
  useEffect(() => {







    // Only load initial data once in edit mode
    if (isEditMode && initialData && initialData.length > 0 && !hasLoadedInitialData.current) {

      setSelectedOptions(initialData);
      hasLoadedInitialData.current = true;
    } else {






    }
  }, [isEditMode, initialData]);

  // Notify parent of data changes (skip on initial mount in edit mode)
  useEffect(() => {
    // Skip on initial mount to prevent loop
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }


    onDataChange(selectedOptions);
  }, [selectedOptions, onDataChange]);

  // Get unique option types - prioritize allowedOptionTypes from order type config



  const optionTypes = allowedOptionTypes.length > 0 ?
  allowedOptionTypes.map((ot) => ot.name).filter(Boolean) as string[] :
  Array.from(
    new Set(
      options.map((opt: any) => opt.optionTypeId?.name || '')
    )
  ).filter(Boolean) as string[];



  // Get option type data by name (for specs from allowedOptionTypes)
  const getOptionTypeByName = (typeName: string): AllowedOptionType | undefined => {
    return allowedOptionTypes.find((ot) => ot.name === typeName);
  };

  // Filter options by type name
  const getOptionsByType = (typeName: string) => {




    const filtered = options.filter((opt: any) => {
      const hasMatch = opt.optionTypeId?.name === typeName;
      if (!hasMatch && options.length > 0) {








      }
      return hasMatch;
    });


    return filtered;
  };

  // Open popup
  const openPopup = () => {
    setCurrentOption(createEmptyOption());
    setShowPopup(true);
    // Focus first field after popup opens
    setTimeout(() => typeRef.current?.focus(), 100);
  };

  // Handle Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent, field: 'type' | 'name' | 'spec') => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (field === 'type') {
        // Move to option name
        nameRef.current?.focus();
      } else if (field === 'name' || field === 'spec') {
        // Check if row is empty (end list)
        if (!currentOption.optionTypeName && !currentOption.optionName) {
          // Empty row - close popup
          setShowPopup(false);
        } else if (currentOption.optionTypeName && currentOption.optionName) {
          // Save current option and start new row
          setSelectedOptions((prev) => {
            const updated = [...prev, { ...currentOption, id: generateId() }];
            // onDataChange will be called by useEffect
            return updated;
          });
          setCurrentOption(createEmptyOption());
          setSelectedBackendOption(null);
          // Focus back to first field
          typeRef.current?.focus();
        } else {
          // Missing required fields - move to first empty field
          if (!currentOption.optionTypeName) {
            typeRef.current?.focus();
          } else if (!currentOption.optionName) {
            nameRef.current?.focus();
          }
        }
      }
    }
  };

  // Update current option field
  const updateCurrentOption = (field: keyof OptionItem, value: any) => {
    setCurrentOption((prev) => ({ ...prev, [field]: value }));
  };

  // Update specification value
  const updateSpecificationValue = (dimensionName: string, value: any) => {
    setCurrentOption((prev) => ({
      ...prev,
      specificationValues: {
        ...prev.specificationValues,
        [dimensionName]: value
      }
    }));
  };

  // Option Type Selection Handler
  const handleTypeSelect = (selectedType: any) => {
    const typeName = selectedType.name || selectedType.optionTypeName || selectedType;

    setCurrentOption((prev) => ({
      ...prev,
      optionTypeName: typeName,
      optionId: '',
      optionName: '',
      specificationValues: {}
    }));
    setSelectedBackendOption(null);
    setShowTypeSuggestions(false);
    // Focus on name field
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  // Option Name Selection Handler
  const handleNameSelect = (selectedOption: any) => {







    const optName = selectedOption.name || selectedOption.optionName || '';
    const optId = selectedOption._id || selectedOption.optionId || '';
    const typeId = selectedOption.optionTypeId?._id || selectedOption.optionTypeId || currentOption.optionTypeId || '';
    const typeName = selectedOption.optionTypeId?.name || currentOption.optionTypeName || '';

    // MERGE STRATEGY: Combine specs from all sources
    // 1. Start with Option's dimensions (if any)
    // 2. ADD OptionSpec specifications (linked or by OptionType match)
    // 3. ADD OptionType template specs (if not already present)
    let specs: any[] = [];
    const specNames = new Set<string>(); // Track which spec names we've added

    // Helper to add specs without duplicates
    const addSpecs = (newSpecs: any[], source: string) => {
      if (!newSpecs || !Array.isArray(newSpecs)) return;
      newSpecs.forEach((spec: any) => {
        if (!specNames.has(spec.name)) {
          specs.push(spec);
          specNames.add(spec.name);

        }
      });
    };

    // 1. Add Option's own dimensions first (has actual values)
    if (selectedOption.dimensions && selectedOption.dimensions.length > 0) {
      addSpecs(selectedOption.dimensions, 'Option dimensions');
    }

    // 2. Add linked OptionSpec specifications
    if (selectedOption.optionSpecId?.specifications && selectedOption.optionSpecId.specifications.length > 0) {
      addSpecs(selectedOption.optionSpecId.specifications, 'Linked OptionSpec');
    }

    // 3. Add OptionSpec matching the same OptionType
    const matchingOptionSpec = Array.isArray(optionSpecs) ?
    optionSpecs.find((spec: any) => {
      const specTypeId = spec.optionTypeId?._id || spec.optionTypeId;
      return specTypeId === typeId;
    }) :
    null;

    if (matchingOptionSpec?.specifications && matchingOptionSpec.specifications.length > 0) {
      addSpecs(matchingOptionSpec.specifications, `OptionSpec "${matchingOptionSpec.name}"`);
    }

    // 4. Add OptionType template specs (fallback)
    if (selectedOption.optionTypeId?.specifications && selectedOption.optionTypeId.specifications.length > 0) {
      addSpecs(selectedOption.optionTypeId.specifications, 'OptionType template');
    }



    // Initialize spec values from template or dimensions
    // For dimensions: use 'value' field directly
    // For OptionSpec: use 'value' field if exists, otherwise use 'defaultValue'
    // For OptionType: use 'defaultValue' (template)
    const specValues = specs.reduce((acc: any, spec: any) => {
      // Use 'value' field if it exists (from dimensions or OptionSpec), otherwise use 'defaultValue' (from template)
      acc[spec.name] = spec.value !== undefined ? spec.value : spec.defaultValue || '';
      return acc;
    }, {});




    setCurrentOption((prev) => ({
      ...prev,
      optionId: optId,
      optionName: optName,
      optionTypeId: typeId || prev.optionTypeId,
      optionTypeName: typeName || prev.optionTypeName,
      specificationValues: specValues
    }));

    setSelectedBackendOption(selectedOption);
    setShowNameSuggestions(false);
  };

  // Remove option from list
  const handleRemoveOption = (index: number) => {
    const updated = selectedOptions.filter((_, i) => i !== index);
    setSelectedOptions(updated);
    // onDataChange will be called by useEffect
  };

  // Double-click to reopen popup
  const handleListDoubleClick = () => {
    openPopup();
  };

  // Handle print for option type view using iframe (no popup blocker issues)
  const handlePrintOptionType = (typeName: string, optionsToPrint: OptionItem[], specKeys: string[]) => {
    const currentDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${typeName} - Print</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            font-size: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #333;
          }
          .header-left h1 {
            font-size: 18px;
            margin-bottom: 5px;
            color: #1e293b;
          }
          .header-left .date {
            font-size: 11px;
            color: #666;
          }
          .customer-info {
            text-align: right;
            font-size: 11px;
            line-height: 1.5;
          }
          .customer-info strong {
            color: #1e293b;
          }
          .order-badge {
            display: inline-block;
            background: #fef3c7;
            color: #d97706;
            padding: 4px 10px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 12px;
            margin-bottom: 10px;
            border: 1px solid #f59e0b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px 10px;
            text-align: left;
            font-size: 11px;
          }
          th {
            background: #f8fafc;
            font-weight: 600;
            color: #475569;
          }
          tr:nth-child(even) {
            background: #fafafa;
          }
          @media print {
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            ${orderId ? `<div class="order-badge">${orderId}</div>` : ''}
            <h1>${typeName}</h1>
            <div class="date">${currentDate}</div>
            ${createdByName ? `<div class="date" style="margin-top: 5px;"><strong>${createdByName}</strong></div>` : ''}
          </div>
          ${customerInfo ? `
            <div class="customer-info">
              ${customerInfo.name ? `<div><strong>${customerInfo.name}</strong></div>` : ''}
              ${customerInfo.companyName ? `<div>${customerInfo.companyName}</div>` : ''}
              ${customerInfo.address ? `<div>${customerInfo.address}</div>` : ''}
              ${customerInfo.phone || customerInfo.whatsapp ? `<div>Ph: ${customerInfo.phone || customerInfo.whatsapp}</div>` : ''}
            </div>
          ` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px">#</th>
              <th>Option Name</th>
              ${specKeys.map((key) => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${optionsToPrint.map((opt, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${opt.optionName}</strong></td>
                ${specKeys.map((key) => {
      const value = opt.specificationValues?.[key];
      const displayValue = isFileValue(value) ? '📎 File' : renderSpecValue(value);
      return `<td>${displayValue}</td>`;
    }).join('')}
              </tr>
            `).join('')}
          </tbody>
          ${(() => {
      // Calculate totals for print
      const firstOpt = optionsToPrint[0];
      const backendOpt = options.find((o: any) => o._id === firstOpt?.optionId);
      const specDefs: Record<string, any> = {};
      backendOpt?.dimensions?.forEach((d: any) => {if (!specDefs[d.name]) specDefs[d.name] = { ...d };});
      backendOpt?.optionSpecId?.specifications?.forEach((s: any) => {
        if (specDefs[s.name]) {specDefs[s.name].includeInTotal = s.includeInTotal;specDefs[s.name].dataType = s.dataType;} else
        specDefs[s.name] = { ...s };
      });
      const tId = backendOpt?.optionTypeId?._id || backendOpt?.optionTypeId || firstOpt?.optionTypeId;
      const mSpec = Array.isArray(optionSpecs) ? optionSpecs.find((s: any) => (s.optionTypeId?._id || s.optionTypeId) === tId) : null;
      mSpec?.specifications?.forEach((s: any) => {
        if (specDefs[s.name] && specDefs[s.name].includeInTotal === undefined) specDefs[s.name].includeInTotal = s.includeInTotal;
        if (!specDefs[s.name]) specDefs[s.name] = { ...s };
      });

      const hasTotal = specKeys.some((k) => {
        const sp = specDefs[k];
        const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(optionsToPrint[0]?.specificationValues?.[k]));
        return isNum && sp?.includeInTotal !== false;
      });
      if (!hasTotal) return '';

      const totals: Record<string, number> = {};
      const showT: Record<string, boolean> = {};
      specKeys.forEach((k) => {
        const sp = specDefs[k];
        const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(optionsToPrint[0]?.specificationValues?.[k]));
        if (isNum && sp?.includeInTotal !== false) {
          showT[k] = true;
          totals[k] = optionsToPrint.reduce((sum, o) => sum + (parseFloat(o.specificationValues?.[k]) || 0), 0);
        }
      });

      return `<tfoot><tr style="background:#fef3c7;border-top:2px solid #f59e0b;font-weight:700;color:#92400e;">
              <td></td><td>Total</td>
              ${specKeys.map((k) => `<td>${showT[k] ? totals[k]?.toLocaleString() || '0' : '-'}</td>`).join('')}
            </tr></tfoot>`;
    })()}
        </table>
      </body>
      </html>
    `;

    // Create hidden iframe for printing (Electron compatible)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.zIndex = '-1';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();

      // For Electron: trigger print after a short delay
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {

          // Don't use window.open as it's blocked in Electron
          alert('Print failed. Please try again.');
        }
        // Remove iframe after printing
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 500);
    }
  };

  // Handle Excel export for option type
  const handleExportExcelOptionType = (typeName: string, optionsToExport: OptionItem[], specKeys: string[]) => {
    // Create CSV content
    const headers = ['#', 'Option Name', ...specKeys];
    const rows = optionsToExport.map((opt, idx) => [
    idx + 1,
    opt.optionName,
    ...specKeys.map((key) => {
      const value = opt.specificationValues?.[key];
      if (isFileValue(value)) return '📎 File';
      return renderSpecValue(value);
    })]
    );

    // Calculate Total row
    const firstOpt = optionsToExport[0];
    const backendOpt = options.find((o: any) => o._id === firstOpt?.optionId);
    const specDefs: Record<string, any> = {};
    backendOpt?.dimensions?.forEach((d: any) => {if (!specDefs[d.name]) specDefs[d.name] = { ...d };});
    backendOpt?.optionSpecId?.specifications?.forEach((s: any) => {
      if (specDefs[s.name]) {specDefs[s.name].includeInTotal = s.includeInTotal;specDefs[s.name].dataType = s.dataType;} else
      specDefs[s.name] = { ...s };
    });
    const tId = backendOpt?.optionTypeId?._id || backendOpt?.optionTypeId || firstOpt?.optionTypeId;
    const mSpec = Array.isArray(optionSpecs) ? optionSpecs.find((s: any) => (s.optionTypeId?._id || s.optionTypeId) === tId) : null;
    mSpec?.specifications?.forEach((s: any) => {
      if (specDefs[s.name] && specDefs[s.name].includeInTotal === undefined) specDefs[s.name].includeInTotal = s.includeInTotal;
      if (!specDefs[s.name]) specDefs[s.name] = { ...s };
    });

    const hasTotal = specKeys.some((k) => {
      const sp = specDefs[k];
      const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(optionsToExport[0]?.specificationValues?.[k]));
      return isNum && sp?.includeInTotal !== false;
    });

    let totalRow: (string | number)[] = [];
    if (hasTotal) {
      const totals: Record<string, number> = {};
      const showT: Record<string, boolean> = {};
      specKeys.forEach((k) => {
        const sp = specDefs[k];
        const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(optionsToExport[0]?.specificationValues?.[k]));
        if (isNum && sp?.includeInTotal !== false) {
          showT[k] = true;
          totals[k] = optionsToExport.reduce((sum, o) => sum + (parseFloat(o.specificationValues?.[k]) || 0), 0);
        }
      });
      totalRow = ['', 'TOTAL', ...specKeys.map((k) => showT[k] ? String(totals[k] || 0) : '-')];
    }

    // Add header info
    const headerInfo = [
    [`${typeName} - Options Export`],
    [''],
    orderId ? ['Order ID:', orderId] : [],
    customerInfo?.name ? ['Customer:', customerInfo.name] : [],
    customerInfo?.companyName ? ['Company:', customerInfo.companyName] : [],
    customerInfo?.address ? ['Address:', customerInfo.address] : [],
    ['Generated:', new Date().toLocaleString()],
    [''],
    headers,
    ...rows,
    ...(totalRow.length > 0 ? [totalRow] : [])].
    filter((row) => row.length > 0);

    // Convert to CSV
    const csvContent = headerInfo.map((row) =>
    row.map((cell) => {
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `Options_${typeName}_${orderId || 'new'}_${new Date().toISOString().slice(0, 10)}.csv`;

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Handle file preview
  const handleViewFile = (value: any) => {

    const url = getFilePreviewUrl(value);

    const name = getFileName(value);

    const type = getFileType(value);

    if (url) {
      setFilePreview({ url, name, type });
    } else {

      const errorDetails = `
File Preview Error:
- Has fileUrl: ${!!value?.fileUrl}
- Has url: ${!!value?.url}
- Has file: ${value?.file instanceof File}
- File name: ${name}
- File type: ${type}

This file was likely saved without a preview URL.
For files uploaded in this session, they should work.
For old files, you need to re-upload them.
      `.trim();
      alert(errorDetails);









    }
  };

  const getOptionData = (): OptionData => {
    return selectedOptions.map((option) => ({
      id: option.id,
      optionTypeId: option.optionTypeId,
      optionTypeName: option.optionTypeName,
      optionId: option.optionId,
      optionName: option.optionName,
      specificationValues: option.specificationValues
    }));
  };

  return (
    <div>
      {/* Show trigger only when no options */}
      {selectedOptions.length === 0 &&
      <div
        onClick={openPopup}
        style={{
          cursor: 'pointer',
          padding: '10px 15px',
          color: '#666',
          fontSize: '14px'
        }}>

          Click to add options
        </div>
      }

      {/* Options list display - grouped by Option Type */}
      {selectedOptions.length > 0 && (() => {
        // Group options by optionTypeId
        const groupedOptions: Record<string, OptionItem[]> = {};
        selectedOptions.forEach((option) => {
          const typeKey = option.optionTypeId;
          if (!groupedOptions[typeKey]) {
            groupedOptions[typeKey] = [];
          }
          groupedOptions[typeKey].push(option);
        });

        return (
          <div onDoubleClick={handleListDoubleClick} style={{ cursor: 'pointer' }}>
            {/* View All Options Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              marginBottom: '8px',
              background: '#fef3c7',
              borderRadius: '6px',
              border: '1px solid #fcd34d'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '13px', color: '#92400e' }}>
                  All Options
                </span>
                <span style={{
                  background: '#fbbf24',
                  color: '#78350f',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {selectedOptions.length} total • {Object.keys(groupedOptions).length} types
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllOptionsPopup(true);
                }}
                style={{
                  background: '#f59e0b',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}
                title="View all options details">

                <Eye size={14} />
                View All
              </button>
            </div>
            {Object.entries(groupedOptions).map(([typeId, optionsInGroup], groupIndex) => {
              // Get unique specification keys for THIS group only
              const groupSpecKeys = Array.from(
                new Set(
                  optionsInGroup.flatMap((opt) => Object.keys(opt.specificationValues || {}))
                )
              );

              // Get option type name from first option in group
              const optionTypeName = optionsInGroup[0]?.optionTypeName || 'Unknown Type';

              return (
                <div
                  key={typeId}
                  className="SaveMixing"
                  style={{
                    marginBottom: groupIndex < Object.keys(groupedOptions).length - 1 ? '12px' : '0',
                    overflowX: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0'
                  }}>

                  {/* Option Type Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        color: '#1e293b',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>
                        {optionTypeName}
                      </span>
                      <span style={{
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {optionsInGroup.length} item{optionsInGroup.length > 1 ? 's' : ''} • {groupSpecKeys.length} specs
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewOptionTypePopup({
                          show: true,
                          typeId,
                          typeName: optionTypeName,
                          options: optionsInGroup,
                          specKeys: groupSpecKeys
                        });
                      }}
                      style={{
                        background: '#f59e0b',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}
                      title={`View ${optionTypeName} specifications`}>

                      <Eye size={14} />
                      View
                    </button>
                  </div>

                  <div className="SaveMixingDisplay" style={{ border: 'none' }}>
                    {/* Table Header */}
                    <div className="SaveMixingHeaderRow" style={{
                      display: 'grid',
                      gridTemplateColumns: `30px 100px 100px ${groupSpecKeys.map(() => '90px').join(' ')} 30px`,
                      gap: '4px',
                      padding: '6px 8px',
                      background: '#f8fafc',
                      borderRadius: '4px 4px 0 0',
                      fontSize: '11px'
                    }}>
                      <strong>#</strong>
                      <strong>Type</strong>
                      <strong>Name</strong>
                      {groupSpecKeys.map((key) =>
                      <strong key={key} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{key}</strong>
                      )}
                      <strong></strong>
                    </div>

                    {optionsInGroup.map((option, groupRowIndex) => {
                      // Find original index for delete functionality
                      const originalIndex = selectedOptions.findIndex((o) => o.id === option.id);

                      return (
                        <div key={option.id} className="SaveMixingstepRow" style={{
                          display: 'grid',
                          gridTemplateColumns: `30px 100px 100px ${groupSpecKeys.map(() => '90px').join(' ')} 30px`,
                          gap: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderBottom: '1px solid #f1f5f9'
                        }}>
                          <span>{groupRowIndex + 1}</span>
                          <span>{option.optionTypeName}</span>
                          <span>{option.optionName}</span>
                          {groupSpecKeys.map((key) => {
                            const value = option.specificationValues?.[key];
                            const isFile = isFileValue(value);

                            // Debug: Log the value structure
                            if (isFile) {

                            }

                            return (
                              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isFile ?
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    handleViewFile(value);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px'
                                  }}
                                  title="View file">

                                    <Eye size={18} />
                                  </button> :

                                renderSpecValue(value)
                                }
                              </span>);

                          })}
                          <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveOption(originalIndex);
                              }}
                              style={{
                                background: '#fee2e2',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: '#dc2626',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                              }}
                              title="Remove">

                              ×
                            </button>
                          </span>
                        </div>);

                    })}

                    {/* Total Row - Calculate totals for number specs with includeInTotal */}
                    {(() => {
                      // Get spec definitions from backend option data (not selectedOptions which only has values)
                      const firstSelectedOption = optionsInGroup[0];
                      // Look up the actual backend option using optionId
                      const backendOption = options.find((opt: any) => opt._id === firstSelectedOption?.optionId);

                      const getSpecDefinitions = () => {
                        const specDefs: Record<string, any> = {};

                        // IMPORTANT: Get includeInTotal from OptionSpec (has the checkbox setting)
                        // Priority: OptionSpec > OptionType template > Option dimensions (dimensions don't have includeInTotal)

                        // 1. First collect all spec NAMES from Option's dimensions (for dataType detection)
                        backendOption?.dimensions?.forEach((dim: any) => {
                          if (!specDefs[dim.name]) {
                            specDefs[dim.name] = { ...dim };
                          }
                        });

                        // 2. From linked OptionSpec - MERGE includeInTotal and totalFormula
                        backendOption?.optionSpecId?.specifications?.forEach((spec: any) => {
                          if (specDefs[spec.name]) {
                            // Merge: OptionSpec has includeInTotal setting, copy it
                            specDefs[spec.name].includeInTotal = spec.includeInTotal;
                            specDefs[spec.name].totalFormula = spec.totalFormula;
                            if (spec.dataType) specDefs[spec.name].dataType = spec.dataType;
                          } else {
                            specDefs[spec.name] = { ...spec };
                          }
                        });

                        // 3. From OptionSpec by OptionType match - MERGE includeInTotal
                        const typeId = backendOption?.optionTypeId?._id || backendOption?.optionTypeId || firstSelectedOption?.optionTypeId;
                        const matchingSpec = Array.isArray(optionSpecs) ?
                        optionSpecs.find((spec: any) => (spec.optionTypeId?._id || spec.optionTypeId) === typeId) :
                        null;
                        matchingSpec?.specifications?.forEach((spec: any) => {
                          if (specDefs[spec.name]) {
                            // Merge: OptionSpec has includeInTotal setting, copy it if not already set
                            if (specDefs[spec.name].includeInTotal === undefined) {
                              specDefs[spec.name].includeInTotal = spec.includeInTotal;
                            }
                            if (specDefs[spec.name].totalFormula === undefined) {
                              specDefs[spec.name].totalFormula = spec.totalFormula;
                            }
                            if (!specDefs[spec.name].dataType && spec.dataType) {
                              specDefs[spec.name].dataType = spec.dataType;
                            }
                          } else {
                            specDefs[spec.name] = { ...spec };
                          }
                        });

                        // 4. From OptionType template - fallback only
                        backendOption?.optionTypeId?.specifications?.forEach((spec: any) => {
                          if (!specDefs[spec.name]) {
                            specDefs[spec.name] = { ...spec };
                          }
                        });

                        return specDefs;
                      };

                      const specDefs = getSpecDefinitions();



                      // Check if any spec should show total (number type with includeInTotal !== false)
                      // includeInTotal: true = show total, false = hide total, undefined = default to true
                      const hasAnyTotal = groupSpecKeys.some((key) => {
                        const spec = specDefs[key];
                        // For specs without dataType defined, check if value looks numeric
                        const isNumeric = spec?.dataType === 'number' ||
                        spec?.dataType === undefined && !isNaN(parseFloat(optionsInGroup[0]?.specificationValues?.[key]));
                        // Only show total if includeInTotal is true or undefined (default true), NOT if false
                        const shouldInclude = spec?.includeInTotal !== false;

                        return isNumeric && shouldInclude;
                      });


                      if (!hasAnyTotal) return null;

                      // Calculate totals - track which specs should show totals
                      const totals: Record<string, number> = {};
                      const showTotalFor: Record<string, boolean> = {};

                      groupSpecKeys.forEach((key) => {
                        const spec = specDefs[key];
                        // Same logic as hasAnyTotal check
                        const isNumeric = spec?.dataType === 'number' ||
                        spec?.dataType === undefined && !isNaN(parseFloat(optionsInGroup[0]?.specificationValues?.[key]));
                        const shouldInclude = spec?.includeInTotal !== false;

                        if (isNumeric && shouldInclude) {
                          showTotalFor[key] = true;
                          totals[key] = optionsInGroup.reduce((sum, opt) => {
                            const val = parseFloat(opt.specificationValues?.[key]) || 0;
                            return sum + val;
                          }, 0);
                        }
                      });



                      return (
                        <div className="SaveMixingstepRow" style={{
                          display: 'grid',
                          gridTemplateColumns: `30px 100px 100px ${groupSpecKeys.map(() => '90px').join(' ')} 30px`,
                          gap: '4px',
                          padding: '6px 8px',
                          fontSize: '12px',
                          background: '#fef3c7',
                          borderTop: '2px solid #f59e0b',
                          fontWeight: '600'
                        }}>
                          <span></span>
                          <span></span>
                          <span style={{ color: '#92400e' }}>Total</span>
                          {groupSpecKeys.map((key) =>
                          <span key={key} style={{ color: '#92400e' }}>
                              {showTotalFor[key] ? totals[key]?.toLocaleString() || '0' : '-'}
                            </span>
                          )}
                          <span></span>
                        </div>);

                    })()}

                  </div>
                </div>);

            })}
          </div>);

      })()}

      {/* Popup for adding options */}
      {showPopup &&
      <div
        className="createorderstartsections-popup-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}
        onClick={() => setShowPopup(false)}>

          <div
          className="createorderstartsections-popup"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '25px',
            minWidth: '800px',
            width: '95vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>

              {/* Close Button */}
              <button
            type="button"
            onClick={() => setShowPopup(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1,
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>

                ×
              </button>
              <h3 style={{ marginBottom: '10px', color: '#1e293b', textAlign: 'center', fontSize: '18px', fontWeight: '600' }}>
                Add Options
              </h3>

              {/* Info Box */}
              <div style={{
            padding: '10px 15px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '12px',
            color: '#1565c0'
          }}>
                Press Enter to move to next field. Enter on empty row to finish.
              </div>

              {/* Saved Options Rows */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
                {selectedOptions.map((option, index) =>
            <div key={option.id} className="createorderstartsections-popupitemall" style={{
              gridTemplateColumns: '150px 150px auto 40px',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb',
              alignItems: 'center'
            }}>
                    <span style={{ fontSize: '13px' }}>{option.optionTypeName}</span>
                    <span style={{ fontSize: '13px' }}>{option.optionName}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {Object.entries(option.specificationValues || {}).map(([key, value]) =>
                <span key={key} style={{ marginRight: '10px' }}>
                          {key}: <strong>{renderSpecValue(value)}</strong>
                        </span>
                )}
                    </span>
                    <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="createorderstartsections-btn-remove"
                title="Remove">

                      ×
                    </button>
                  </div>
            )}
              </div>

              {/* Current Input Row */}
              <div style={{
            display: 'grid',
            gridTemplateColumns: '150px 150px auto',
            gap: '10px',
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
                {/* Option Type */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Type</label>
                  <input
                ref={typeRef}
                type="text"
                value={currentOption.optionTypeName}
                onChange={(e) => updateCurrentOption('optionTypeName', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'type')}
                placeholder="Select type"
                onFocus={() => setShowTypeSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
                className="createorderstartsections-tableInput" />

                  {showTypeSuggestions &&
              <div className="createorderstartsections-suggestion-list">
                      {optionTypes.length === 0 ?
                <div className="createorderstartsections-suggestionItem" style={{ color: '#999', fontStyle: 'italic' }}>
                          No option types available
                        </div> :

                optionTypes.
                filter((type) =>
                !currentOption.optionTypeName ||
                type.toLowerCase().includes(currentOption.optionTypeName.toLowerCase())
                ).
                map((type, i) =>
                <div
                  key={i}
                  className="createorderstartsections-suggestionItem"
                  onMouseDown={() => handleTypeSelect({ name: type })}>

                              {type}
                            </div>
                )
                }
                    </div>
              }
                </div>

                {/* Option Name */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Name</label>
                  <input
                ref={nameRef}
                type="text"
                value={currentOption.optionName}
                onChange={(e) => updateCurrentOption('optionName', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'name')}
                placeholder="Select option"
                onFocus={() => setShowNameSuggestions(true)}
                onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                className="createorderstartsections-tableInput" />

                  {showNameSuggestions && currentOption.optionTypeName &&
              <div className="createorderstartsections-suggestion-list">
                      {getOptionsByType(currentOption.optionTypeName).length === 0 ?
                <div className="createorderstartsections-suggestionItem" style={{ color: '#999', fontStyle: 'italic' }}>
                          No options available for this type
                        </div> :

                getOptionsByType(currentOption.optionTypeName).
                filter((opt: any) =>
                !currentOption.optionName ||
                opt.name.toLowerCase().includes(currentOption.optionName.toLowerCase())
                ).
                slice(0, 10).
                map((opt: any, i: number) =>
                <div
                  key={i}
                  className="createorderstartsections-suggestionItem"
                  onMouseDown={() => handleNameSelect(opt)}>

                              <div style={{ fontWeight: 500 }}>{opt.name}</div>
                              {opt.code &&
                  <div style={{ fontSize: '11px', color: '#666' }}>Code: {opt.code}</div>
                  }
                            </div>
                )
                }
                    </div>
              }
                </div>

                {/* Specifications Section - dynamically loaded */}
                {/* MERGE: Option dimensions + OptionSpec specs + OptionType specs */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  {selectedBackendOption && (() => {
                // Merge specs from all sources (same logic as handleNameSelect)
                const getMergedSpecs = () => {
                  const specs: any[] = [];
                  const specNames = new Set<string>();

                  const addSpecs = (newSpecs: any[]) => {
                    if (!newSpecs || !Array.isArray(newSpecs)) return;
                    newSpecs.forEach((spec: any) => {
                      if (!specNames.has(spec.name)) {
                        specs.push(spec);
                        specNames.add(spec.name);
                      }
                    });
                  };

                  // 1. Add Option's dimensions
                  addSpecs(selectedBackendOption.dimensions);

                  // 2. Add linked OptionSpec specs
                  addSpecs(selectedBackendOption.optionSpecId?.specifications);

                  // 3. Add OptionSpec by OptionType match
                  const typeId = selectedBackendOption.optionTypeId?._id || selectedBackendOption.optionTypeId;
                  const matchingSpec = Array.isArray(optionSpecs) ?
                  optionSpecs.find((spec: any) => (spec.optionTypeId?._id || spec.optionTypeId) === typeId) :
                  null;
                  addSpecs(matchingSpec?.specifications);

                  // 4. Add OptionType template specs
                  addSpecs(selectedBackendOption.optionTypeId?.specifications);

                  return specs;
                };
                const specs = getMergedSpecs();
                return specs && specs.length > 0;
              })() &&
              <>
                      {(() => {
                  // Same merge logic for rendering
                  const getMergedSpecs = () => {
                    const specs: any[] = [];
                    const specNames = new Set<string>();

                    const addSpecs = (newSpecs: any[]) => {
                      if (!newSpecs || !Array.isArray(newSpecs)) return;
                      newSpecs.forEach((spec: any) => {
                        if (!specNames.has(spec.name)) {
                          specs.push(spec);
                          specNames.add(spec.name);
                        }
                      });
                    };

                    addSpecs(selectedBackendOption.dimensions);
                    addSpecs(selectedBackendOption.optionSpecId?.specifications);

                    const typeId = selectedBackendOption.optionTypeId?._id || selectedBackendOption.optionTypeId;
                    const matchingSpec = Array.isArray(optionSpecs) ?
                    optionSpecs.find((spec: any) => (spec.optionTypeId?._id || spec.optionTypeId) === typeId) :
                    null;
                    addSpecs(matchingSpec?.specifications);
                    addSpecs(selectedBackendOption.optionTypeId?.specifications);

                    return specs;
                  };
                  return getMergedSpecs();
                })().map((spec: SpecificationTemplate, index: number) =>
                <div key={index} style={{ minWidth: '120px', flex: '1' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                            {spec.name} {spec.unit ? `(${spec.unit})` : ''}
                          </label>
                          {spec.dataType === 'number' ?
                  <input
                    type="number"
                    value={currentOption.specificationValues[spec.name] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '-' || !isNaN(parseFloat(value))) {
                        updateSpecificationValue(spec.name, value === '' ? '' : parseFloat(value) || value);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, 'spec')}
                    placeholder={spec.name}
                    className="createorderstartsections-tableInput" /> :

                  spec.dataType === 'boolean' ?
                  <select
                    value={currentOption.specificationValues[spec.name]?.toString() || 'false'}
                    onChange={(e) => updateSpecificationValue(spec.name, e.target.value === 'true')}
                    onKeyDown={(e) => handleKeyDown(e, 'spec')}
                    className="createorderstartsections-tableInput">

                              <option value="false">No</option>
                              <option value="true">Yes</option>
                            </select> :
                  spec.dataType === 'date' ?
                  <input
                    type="date"
                    value={currentOption.specificationValues[spec.name] || ''}
                    onChange={(e) => updateSpecificationValue(spec.name, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'spec')}
                    className="createorderstartsections-tableInput" /> :

                  spec.dataType === 'file' ?
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const maxSizeInBytes = 50 * 1024 * 1024;
                        if (file.size > maxSizeInBytes) {
                          alert(`File too large! Max 50MB.`);
                          e.target.value = '';
                          return;
                        }
                        updateSpecificationValue(spec.name, file);
                      }}
                      style={{ display: 'none' }}
                      id={`file-${spec.name}-${index}`} />

                              <label
                      htmlFor={`file-${spec.name}-${index}`}
                      className="createorderstartsections-addProductBtn"
                      style={{ cursor: 'pointer' }}>

                                Choose
                              </label>
                              {currentOption.specificationValues[spec.name]?.name &&
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  {currentOption.specificationValues[spec.name].name.substring(0, 15)}...
                                </span>
                    }
                            </div> :
                  spec.dataType === 'link' ?
                  <input
                    type="url"
                    value={currentOption.specificationValues[spec.name] || ''}
                    onChange={(e) => updateSpecificationValue(spec.name, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'spec')}
                    placeholder="https://..."
                    className="createorderstartsections-tableInput" /> :

                  spec.dataType === 'dropdown' ?
                  <select
                    value={currentOption.specificationValues[spec.name] || ''}
                    onChange={(e) => updateSpecificationValue(spec.name, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'spec')}
                    className="createorderstartsections-tableInput">

                              <option value="">Select</option>
                              {spec.dropdownOptions?.map((option: any, idx: number) =>
                    <option key={idx} value={typeof option === 'object' ? option.value : option}>
                                  {typeof option === 'object' ? option.label : option}
                                </option>
                    )}
                            </select> :

                  <input
                    type="text"
                    value={currentOption.specificationValues[spec.name] || ''}
                    onChange={(e) => updateSpecificationValue(spec.name, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'spec')}
                    placeholder={spec.name}
                    className="createorderstartsections-tableInput" />

                  }
                        </div>
                )}
                    </>
              }
                </div>
              </div>

              {/* Add Option Button */}
              <button
            type="button"
            onClick={() => {
              if (currentOption.optionTypeName && currentOption.optionName) {
                setSelectedOptions((prev) => [...prev, { ...currentOption, id: generateId() }]);
                setCurrentOption(createEmptyOption());
                setSelectedBackendOption(null);
                typeRef.current?.focus();
              }
            }}
            className="createorderstartsections-addProductBtn"
            style={{ alignSelf: 'center', padding: '8px 20px', fontSize: '13px', marginBottom: '15px' }}>

                + Add Option
              </button>

          </div>
        </div>
      }

      {/* Option Type View Popup */}
      {viewOptionTypePopup?.show &&
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}
        onClick={() => setViewOptionTypePopup(null)}>

          <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '95vw',
            maxHeight: '85vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: '600' }}>
                  {viewOptionTypePopup.typeName}
                </h3>
                <span style={{
                background: '#dbeafe',
                color: '#1d4ed8',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                  {viewOptionTypePopup.options.length} item{viewOptionTypePopup.options.length > 1 ? 's' : ''} • {viewOptionTypePopup.specKeys.length} specifications
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                onClick={() => handlePrintOptionType(
                  viewOptionTypePopup.typeName,
                  viewOptionTypePopup.options,
                  viewOptionTypePopup.specKeys
                )}
                style={{
                  background: '#f59e0b',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Print this table">

                  <Printer size={16} />
                  Print
                </button>
                <button
                onClick={() => handleExportExcelOptionType(
                  viewOptionTypePopup.typeName,
                  viewOptionTypePopup.options,
                  viewOptionTypePopup.specKeys
                )}
                style={{
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Export to Excel (CSV)">

                  <FileSpreadsheet size={16} />
                  Excel
                </button>
                <button
                onClick={() => setViewOptionTypePopup(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  fontSize: '14px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>

                  ✕ Close
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div style={{ padding: '16px', overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(85vh - 70px)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>#</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Name</th>
                    {viewOptionTypePopup.specKeys.map((key) =>
                  <th key={key} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        {key}
                      </th>
                  )}
                  </tr>
                </thead>
                <tbody>
                  {viewOptionTypePopup.options.map((option, index) =>
                <tr key={option.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{index + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '500', color: '#1e293b' }}>{option.optionName}</td>
                      {viewOptionTypePopup.specKeys.map((key) => {
                    const value = option.specificationValues?.[key];
                    const isFile = isFileValue(value);
                    return (
                      <td key={key} style={{ padding: '10px 12px', color: '#334155' }}>
                            {isFile ?
                        <button
                          type="button"
                          onClick={() => handleViewFile(value)}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            fontSize: '12px'
                          }}>

                                <Eye size={14} /> View
                              </button> :

                        renderSpecValue(value)
                        }
                          </td>);

                  })}
                    </tr>
                )}
                </tbody>
                {/* Total Row for viewOptionTypePopup */}
                {(() => {
                const popupOptions = viewOptionTypePopup.options;
                const popupSpecKeys = viewOptionTypePopup.specKeys;
                const firstOpt = popupOptions[0];
                const backendOpt = options.find((opt: any) => opt._id === firstOpt?.optionId);

                // Get spec definitions with includeInTotal
                const specDefs: Record<string, any> = {};
                backendOpt?.dimensions?.forEach((dim: any) => {if (!specDefs[dim.name]) specDefs[dim.name] = { ...dim };});
                backendOpt?.optionSpecId?.specifications?.forEach((spec: any) => {
                  if (specDefs[spec.name]) {
                    specDefs[spec.name].includeInTotal = spec.includeInTotal;
                    specDefs[spec.name].dataType = spec.dataType;
                  } else specDefs[spec.name] = { ...spec };
                });
                const typeId = backendOpt?.optionTypeId?._id || backendOpt?.optionTypeId || firstOpt?.optionTypeId;
                const matchingSpec = Array.isArray(optionSpecs) ? optionSpecs.find((s: any) => (s.optionTypeId?._id || s.optionTypeId) === typeId) : null;
                matchingSpec?.specifications?.forEach((spec: any) => {
                  if (specDefs[spec.name] && specDefs[spec.name].includeInTotal === undefined) specDefs[spec.name].includeInTotal = spec.includeInTotal;
                  if (!specDefs[spec.name]) specDefs[spec.name] = { ...spec };
                });

                // Check if any totals
                const hasTotal = popupSpecKeys.some((key) => {
                  const spec = specDefs[key];
                  const isNumeric = spec?.dataType === 'number' || !spec?.dataType && !isNaN(parseFloat(popupOptions[0]?.specificationValues?.[key]));
                  return isNumeric && spec?.includeInTotal !== false;
                });

                if (!hasTotal) return null;

                // Calculate totals
                const totals: Record<string, number> = {};
                const showTotal: Record<string, boolean> = {};
                popupSpecKeys.forEach((key) => {
                  const spec = specDefs[key];
                  const isNumeric = spec?.dataType === 'number' || !spec?.dataType && !isNaN(parseFloat(popupOptions[0]?.specificationValues?.[key]));
                  if (isNumeric && spec?.includeInTotal !== false) {
                    showTotal[key] = true;
                    totals[key] = popupOptions.reduce((sum, opt) => sum + (parseFloat(opt.specificationValues?.[key]) || 0), 0);
                  }
                });

                return (
                  <tfoot>
                      <tr style={{ backgroundColor: '#fef3c7', borderTop: '2px solid #f59e0b' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#92400e' }}></td>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#92400e' }}>Total</td>
                        {popupSpecKeys.map((key) =>
                      <td key={key} style={{ padding: '10px 12px', fontWeight: '700', color: '#92400e' }}>
                            {showTotal[key] ? totals[key]?.toLocaleString() || '0' : '-'}
                          </td>
                      )}
                      </tr>
                    </tfoot>);

              })()}
              </table>
            </div>
          </div>
        </div>
      }

      {/* File Preview Modal */}
      {filePreview &&
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}
        onClick={() => setFilePreview(null)}>

          <div
          style={{
            position: 'relative',
            width: isPdfFile(filePreview.type) ? '90vw' : 'auto',
            maxWidth: '90vw',
            height: isPdfFile(filePreview.type) ? '90vh' : 'auto',
            maxHeight: '90vh',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
              flexShrink: 0
            }}>

              <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
                {filePreview.name}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Download button */}
                <a
                href={filePreview.url}
                download={filePreview.name}
                style={{
                  padding: '6px 12px',
                  background: '#10b981',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                title="Download file">

                  Download
                </a>
                <button
                onClick={() => setFilePreview(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px 8px',
                  lineHeight: 1
                }}
                title="Close">

                  ×
                </button>
              </div>
            </div>

            {/* File content */}
            <div
            style={{
              padding: isImageFile(filePreview.type) ? '20px' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              overflow: 'auto',
              minHeight: 0
            }}>

              {isImageFile(filePreview.type) ?
            // Image preview
            <img
              src={filePreview.url}
              alt={filePreview.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }} /> :

            isPdfFile(filePreview.type) ?
            // PDF preview using iframe
            <iframe
              src={filePreview.url}
              title={filePreview.name}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }} /> :


            // Other file types - show message and download option
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                  <p style={{ fontSize: '16px', marginBottom: '8px', color: '#1f2937' }}>
                    {filePreview.name}
                  </p>
                  <p style={{ fontSize: '14px', marginBottom: '20px' }}>
                    Preview not available for this file type
                  </p>
                  <a
                href={filePreview.url}
                download={filePreview.name}
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  display: 'inline-block'
                }}>

                    Download File
                  </a>
                </div>
            }
            </div>
          </div>
        </div>
      }

      {/* View All Options Popup */}
      {showAllOptionsPopup && selectedOptions.length > 0 && (() => {
        // Group options by optionTypeId for the popup
        const groupedOptions: Record<string, OptionItem[]> = {};
        selectedOptions.forEach((option) => {
          const typeKey = option.optionTypeId;
          if (!groupedOptions[typeKey]) {
            groupedOptions[typeKey] = [];
          }
          groupedOptions[typeKey].push(option);
        });

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '20px'
            }}
            onClick={() => setShowAllOptionsPopup(false)}>

            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '95vw',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '600px'
              }}
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#fef3c7'
                }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {orderId &&
                  <span style={{
                    background: '#f59e0b',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                      {orderId}
                    </span>
                  }
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#92400e', fontWeight: '600' }}>
                    All Options Summary
                  </h3>
                  <span style={{
                    background: '#fbbf24',
                    color: '#78350f',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {selectedOptions.length} options • {Object.keys(groupedOptions).length} types
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      // Print all options
                      const printContent = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>All Options - Print</title>
                          <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                            .header { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #333; }
                            .header h1 { font-size: 18px; margin-bottom: 5px; }
                            .order-badge { display: inline-block; background: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 12px; margin-bottom: 10px; border: 1px solid #f59e0b; }
                            .customer-info { font-size: 11px; margin-top: 10px; }
                            .type-section { margin-bottom: 20px; }
                            .type-header { background: #f0f9ff; padding: 8px 12px; border-radius: 4px; margin-bottom: 8px; font-weight: 600; color: #0369a1; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 11px; }
                            th { background: #f8fafc; font-weight: 600; }
                            @media print { body { padding: 10px; } }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            ${orderId ? `<div class="order-badge">${orderId}</div>` : ''}
                            <h1>All Options Summary</h1>
                            ${customerInfo ? `
                              <div class="customer-info">
                                ${customerInfo.name ? `<strong>${customerInfo.name}</strong>` : ''}
                                ${customerInfo.companyName ? ` - ${customerInfo.companyName}` : ''}
                                ${customerInfo.address ? `<br/>${customerInfo.address}` : ''}
                                ${customerInfo.phone || customerInfo.whatsapp ? `<br/>Ph: ${customerInfo.phone || customerInfo.whatsapp}` : ''}
                              </div>
                            ` : ''}
                            ${createdByName || createdAt ? `
                              <div class="customer-info" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                                ${createdByName ? `<strong>${createdByName}</strong>` : ''}
                                ${createdAt ? `${createdByName ? ' | ' : ''}${new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                              </div>
                            ` : ''}
                          </div>
                          ${Object.entries(groupedOptions).map(([typeId, opts]) => {
                        const typeName = opts[0]?.optionTypeName || 'Unknown';
                        const specKeys = Array.from(new Set(opts.flatMap((o) => Object.keys(o.specificationValues || {}))));
                        return `
                              <div class="type-section">
                                <div class="type-header">${typeName} (${opts.length} items)</div>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>#</th>
                                      <th>Option Name</th>
                                      ${specKeys.map((k) => `<th>${k}</th>`).join('')}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${opts.map((opt, idx) => `
                                      <tr>
                                        <td>${idx + 1}</td>
                                        <td><strong>${opt.optionName}</strong></td>
                                        ${specKeys.map((k) => {
                          const val = opt.specificationValues?.[k];
                          return `<td>${isFileValue(val) ? '📎 File' : renderSpecValue(val)}</td>`;
                        }).join('')}
                                      </tr>
                                    `).join('')}
                                  </tbody>
                                  ${(() => {
                          // Calculate totals for print
                          const firstOpt = opts[0];
                          const backendOpt = options.find((o: any) => o._id === firstOpt?.optionId);
                          const specDefs: Record<string, any> = {};
                          backendOpt?.dimensions?.forEach((d: any) => {if (!specDefs[d.name]) specDefs[d.name] = { ...d };});
                          backendOpt?.optionSpecId?.specifications?.forEach((s: any) => {
                            if (specDefs[s.name]) {specDefs[s.name].includeInTotal = s.includeInTotal;specDefs[s.name].dataType = s.dataType;} else
                            specDefs[s.name] = { ...s };
                          });
                          const tId = backendOpt?.optionTypeId?._id || backendOpt?.optionTypeId || firstOpt?.optionTypeId;
                          const mSpec = Array.isArray(optionSpecs) ? optionSpecs.find((s: any) => (s.optionTypeId?._id || s.optionTypeId) === tId) : null;
                          mSpec?.specifications?.forEach((s: any) => {
                            if (specDefs[s.name] && specDefs[s.name].includeInTotal === undefined) specDefs[s.name].includeInTotal = s.includeInTotal;
                            if (!specDefs[s.name]) specDefs[s.name] = { ...s };
                          });

                          const hasTotal = specKeys.some((k) => {
                            const sp = specDefs[k];
                            const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(opts[0]?.specificationValues?.[k]));
                            return isNum && sp?.includeInTotal !== false;
                          });
                          if (!hasTotal) return '';

                          const totals: Record<string, number> = {};
                          const showT: Record<string, boolean> = {};
                          specKeys.forEach((k) => {
                            const sp = specDefs[k];
                            const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(opts[0]?.specificationValues?.[k]));
                            if (isNum && sp?.includeInTotal !== false) {
                              showT[k] = true;
                              totals[k] = opts.reduce((sum, o) => sum + (parseFloat(o.specificationValues?.[k]) || 0), 0);
                            }
                          });

                          return `<tfoot><tr style="background:#fef3c7;border-top:2px solid #f59e0b;font-weight:700;color:#92400e;">
                                      <td></td><td>Total</td>
                                      ${specKeys.map((k) => `<td>${showT[k] ? totals[k]?.toLocaleString() || '0' : '-'}</td>`).join('')}
                                    </tr></tfoot>`;
                        })()}
                                </table>
                              </div>
                            `;
                      }).join('')}

                          ${dynamicCalculations && dynamicCalculations.length > 0 ? `
                            <div class="type-section" style="margin-top: 24px; border-top: 2px solid #e5e7eb; padding-top: 16px;">
                              <div class="type-header">📊 Dynamic Calculations (${dynamicCalculations.filter((c) => c.enabled).length} calculations)</div>
                              <table>
                                <thead>
                                  <tr>
                                    <th style="width: 40px">#</th>
                                    <th>Calculation Name</th>
                                    <th style="width: 150px; text-align: right;">Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${dynamicCalculations.
                      filter((c) => c.enabled).
                      sort((a, b) => (a.order || 0) - (b.order || 0)).
                      map((calc, idx) => {
                        const value = calculatedValues[calc.name] || '-';
                        const rowBg = calc.columnFormat === 'highlight' ? '#fef3c7' :
                        calc.columnFormat === 'summary' ? '#dbeafe' :
                        idx % 2 === 0 ? '#ffffff' : '#f9fafb';
                        return `
                                        <tr style="background: ${rowBg};">
                                          <td>${idx + 1}</td>
                                          <td>
                                            ${calc.name}
                                            ${calc.unit ? `<span style="font-size: 10px; color: #6b7280;"> (${calc.unit})</span>` : ''}
                                          </td>
                                          <td style="text-align: right; font-weight: 700;">${value}</td>
                                        </tr>
                                      `;
                      }).join('')}
                                </tbody>
                              </table>
                            </div>
                          ` : ''}
                        </body>
                        </html>
                      `;

                      const iframe = document.createElement('iframe');
                      iframe.style.cssText = 'position:fixed;width:100%;height:100%;border:none;left:-9999px;top:0;z-index:-1';
                      document.body.appendChild(iframe);
                      const doc = iframe.contentWindow?.document;
                      if (doc) {
                        doc.open();
                        doc.write(printContent);
                        doc.close();
                        setTimeout(() => {
                          iframe.contentWindow?.focus();
                          iframe.contentWindow?.print();
                          setTimeout(() => document.body.removeChild(iframe), 1000);
                        }, 500);
                      }
                    }}
                    style={{
                      background: '#f59e0b',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: 'white',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>

                    <Printer size={14} />
                    Print All
                  </button>
                  <button
                    onClick={() => {
                      // Export all options to Excel
                      const csvRows: string[][] = [
                      ['All Options Export'],
                      [''],
                      orderId ? ['Order ID:', orderId] : [],
                      customerInfo?.name ? ['Customer:', customerInfo.name] : [],
                      customerInfo?.companyName ? ['Company:', customerInfo.companyName] : [],
                      ['Generated:', new Date().toLocaleString()],
                      ['']].
                      filter((r) => r.length > 0);

                      Object.entries(groupedOptions).forEach(([typeId, opts]) => {
                        const typeName = opts[0]?.optionTypeName || 'Unknown';
                        const specKeys = Array.from(new Set(opts.flatMap((o) => Object.keys(o.specificationValues || {}))));

                        csvRows.push([`--- ${typeName} (${opts.length} items) ---`]);
                        csvRows.push(['#', 'Option Name', ...specKeys]);

                        opts.forEach((opt, idx) => {
                          csvRows.push([
                          String(idx + 1),
                          opt.optionName,
                          ...specKeys.map((k) => {
                            const val = opt.specificationValues?.[k];
                            return isFileValue(val) ? 'File' : renderSpecValue(val);
                          })]
                          );
                        });

                        // Add Total row to Excel
                        const firstOpt = opts[0];
                        const backendOpt = options.find((o: any) => o._id === firstOpt?.optionId);
                        const specDefs: Record<string, any> = {};
                        backendOpt?.dimensions?.forEach((d: any) => {if (!specDefs[d.name]) specDefs[d.name] = { ...d };});
                        backendOpt?.optionSpecId?.specifications?.forEach((s: any) => {
                          if (specDefs[s.name]) {specDefs[s.name].includeInTotal = s.includeInTotal;specDefs[s.name].dataType = s.dataType;} else
                          specDefs[s.name] = { ...s };
                        });
                        const tId = backendOpt?.optionTypeId?._id || backendOpt?.optionTypeId || firstOpt?.optionTypeId;
                        const mSpec = Array.isArray(optionSpecs) ? optionSpecs.find((s: any) => (s.optionTypeId?._id || s.optionTypeId) === tId) : null;
                        mSpec?.specifications?.forEach((s: any) => {
                          if (specDefs[s.name] && specDefs[s.name].includeInTotal === undefined) specDefs[s.name].includeInTotal = s.includeInTotal;
                          if (!specDefs[s.name]) specDefs[s.name] = { ...s };
                        });

                        const hasTotal = specKeys.some((k) => {
                          const sp = specDefs[k];
                          const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(opts[0]?.specificationValues?.[k]));
                          return isNum && sp?.includeInTotal !== false;
                        });

                        if (hasTotal) {
                          const totals: Record<string, number> = {};
                          const showT: Record<string, boolean> = {};
                          specKeys.forEach((k) => {
                            const sp = specDefs[k];
                            const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(opts[0]?.specificationValues?.[k]));
                            if (isNum && sp?.includeInTotal !== false) {
                              showT[k] = true;
                              totals[k] = opts.reduce((sum, o) => sum + (parseFloat(o.specificationValues?.[k]) || 0), 0);
                            }
                          });

                          csvRows.push([
                          '',
                          'TOTAL',
                          ...specKeys.map((k) => showT[k] ? String(totals[k] || 0) : '-')]
                          );
                        }

                        csvRows.push(['']);
                      });

                      // Add Dynamic Calculations to Excel export
                      if (dynamicCalculations && dynamicCalculations.length > 0) {
                        csvRows.push(['--- Dynamic Calculations ---']);
                        csvRows.push(['#', 'Calculation Name', 'Value']);

                        dynamicCalculations.
                        filter((c) => c.enabled).
                        sort((a, b) => (a.order || 0) - (b.order || 0)).
                        forEach((calc, idx) => {
                          const value = calculatedValues[calc.name] || '';
                          const nameWithUnit = calc.unit ? `${calc.name} (${calc.unit})` : calc.name;
                          csvRows.push([
                          String(idx + 1),
                          nameWithUnit,
                          String(value)]
                          );
                        });

                        csvRows.push(['']);
                      }

                      const csvContent = csvRows.map((row) =>
                      row.map((cell) => {
                        const s = String(cell);
                        return s.includes(',') || s.includes('"') || s.includes('\n') ?
                        `"${s.replace(/"/g, '""')}"` :
                        s;
                      }).join(',')
                      ).join('\n');

                      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `All_Options_${orderId || 'new'}_${new Date().toISOString().slice(0, 10)}.csv`;
                      link.click();
                      URL.revokeObjectURL(link.href);
                    }}
                    style={{
                      background: '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: 'white',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>

                    <FileSpreadsheet size={14} />
                    Excel All
                  </button>
                  <button
                    onClick={() => setShowAllOptionsPopup(false)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>

                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Content - Grouped by Type */}
              <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
                {/* Customer Info Card */}
                {customerInfo &&
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px'
                }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      {customerInfo.name &&
                    <div>
                          <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '600', textTransform: 'uppercase' }}>Customer</div>
                          <div style={{ fontSize: '13px', color: '#0c4a6e', fontWeight: '500' }}>{customerInfo.name}</div>
                        </div>
                    }
                      {customerInfo.companyName &&
                    <div>
                          <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '600', textTransform: 'uppercase' }}>Company</div>
                          <div style={{ fontSize: '13px', color: '#0c4a6e' }}>{customerInfo.companyName}</div>
                        </div>
                    }
                      {customerInfo.address &&
                    <div>
                          <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '600', textTransform: 'uppercase' }}>Address</div>
                          <div style={{ fontSize: '13px', color: '#0c4a6e' }}>{customerInfo.address}</div>
                        </div>
                    }
                      {(customerInfo.phone || customerInfo.whatsapp) &&
                    <div>
                          <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '600', textTransform: 'uppercase' }}>Phone</div>
                          <div style={{ fontSize: '13px', color: '#0c4a6e' }}>{customerInfo.phone || customerInfo.whatsapp}</div>
                        </div>
                    }
                    </div>
                  </div>
                }

                {/* Creator Info Card */}
                {(createdByName || createdAt) &&
                <div style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px'
                }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      {createdByName &&
                    <div>
                          <div style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{createdByName}</div>
                        </div>
                    }
                      {createdAt &&
                    <div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            {new Date(createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                          </div>
                        </div>
                    }
                    </div>
                  </div>
                }

                {/* Options by Type */}
                {Object.entries(groupedOptions).map(([typeId, opts], groupIdx) => {
                  const typeName = opts[0]?.optionTypeName || 'Unknown';
                  const specKeys = Array.from(new Set(opts.flatMap((o) => Object.keys(o.specificationValues || {}))));

                  return (
                    <div key={typeId} style={{ marginBottom: groupIdx < Object.keys(groupedOptions).length - 1 ? '20px' : 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px',
                        padding: '8px 12px',
                        background: '#f0f9ff',
                        borderRadius: '6px'
                      }}>
                        <span style={{ fontWeight: '600', color: '#0369a1', fontSize: '14px' }}>{typeName}</span>
                        <span style={{
                          background: '#0ea5e9',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px'
                        }}>
                          {opts.length} item{opts.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>#</th>
                              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Name</th>
                              {specKeys.map((key) =>
                              <th key={key} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                                  {key}
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {opts.map((opt, idx) =>
                            <tr key={opt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                                <td style={{ padding: '8px 10px', fontWeight: '500', color: '#1e293b' }}>{opt.optionName}</td>
                                {specKeys.map((key) => {
                                const value = opt.specificationValues?.[key];
                                const isFile = isFileValue(value);
                                return (
                                  <td key={key} style={{ padding: '8px 10px', color: '#334155' }}>
                                      {isFile ?
                                    <button
                                      type="button"
                                      onClick={() => handleViewFile(value)}
                                      style={{
                                        background: '#eff6ff',
                                        border: '1px solid #bfdbfe',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: '#2563eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 6px',
                                        fontSize: '11px'
                                      }}>

                                          <Eye size={12} /> View
                                        </button> :

                                    renderSpecValue(value)
                                    }
                                    </td>);

                              })}
                              </tr>
                            )}
                          </tbody>
                          {/* Total Row for showAllOptionsPopup */}
                          {(() => {
                            const firstOpt = opts[0];
                            const backendOpt = options.find((o: any) => o._id === firstOpt?.optionId);

                            // Get spec definitions
                            const specDefs: Record<string, any> = {};
                            backendOpt?.dimensions?.forEach((d: any) => {if (!specDefs[d.name]) specDefs[d.name] = { ...d };});
                            backendOpt?.optionSpecId?.specifications?.forEach((s: any) => {
                              if (specDefs[s.name]) {specDefs[s.name].includeInTotal = s.includeInTotal;specDefs[s.name].dataType = s.dataType;} else
                              specDefs[s.name] = { ...s };
                            });
                            const tId = backendOpt?.optionTypeId?._id || backendOpt?.optionTypeId || firstOpt?.optionTypeId;
                            const mSpec = Array.isArray(optionSpecs) ? optionSpecs.find((s: any) => (s.optionTypeId?._id || s.optionTypeId) === tId) : null;
                            mSpec?.specifications?.forEach((s: any) => {
                              if (specDefs[s.name] && specDefs[s.name].includeInTotal === undefined) specDefs[s.name].includeInTotal = s.includeInTotal;
                              if (!specDefs[s.name]) specDefs[s.name] = { ...s };
                            });

                            const hasTotal = specKeys.some((k) => {
                              const sp = specDefs[k];
                              const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(opts[0]?.specificationValues?.[k]));
                              return isNum && sp?.includeInTotal !== false;
                            });
                            if (!hasTotal) return null;

                            const totals: Record<string, number> = {};
                            const showT: Record<string, boolean> = {};
                            specKeys.forEach((k) => {
                              const sp = specDefs[k];
                              const isNum = sp?.dataType === 'number' || !sp?.dataType && !isNaN(parseFloat(opts[0]?.specificationValues?.[k]));
                              if (isNum && sp?.includeInTotal !== false) {
                                showT[k] = true;
                                totals[k] = opts.reduce((sum, o) => sum + (parseFloat(o.specificationValues?.[k]) || 0), 0);
                              }
                            });

                            return (
                              <tfoot>
                                <tr style={{ backgroundColor: '#fef3c7', borderTop: '2px solid #f59e0b' }}>
                                  <td style={{ padding: '8px 10px', fontWeight: '700', color: '#92400e' }}></td>
                                  <td style={{ padding: '8px 10px', fontWeight: '700', color: '#92400e' }}>Total</td>
                                  {specKeys.map((k) =>
                                  <td key={k} style={{ padding: '8px 10px', fontWeight: '700', color: '#92400e' }}>
                                      {showT[k] ? totals[k]?.toLocaleString() || '0' : '-'}
                                    </td>
                                  )}
                                </tr>
                              </tfoot>);

                          })()}
                        </table>
                      </div>
                    </div>);

                })}

                {/* Dynamic Calculations Section */}
                {dynamicCalculations && dynamicCalculations.length > 0 &&
                <div style={{ marginTop: '20px' }}>
                    <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                    padding: '8px 12px',
                    background: '#f0f9ff',
                    borderRadius: '6px'
                  }}>
                      <span style={{
                      background: '#0ea5e9',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                        📊
                      </span>
                      <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0369a1'
                    }}>
                        Dynamic Calculations
                      </span>
                      <span style={{
                      background: '#bae6fd',
                      color: '#0c4a6e',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                        {dynamicCalculations.filter((c) => c.enabled).length} calculations
                      </span>
                    </div>

                    <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                      <table style={{
                      width: '100%',
                      borderCollapse: 'collapse'
                    }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{
                            padding: '8px 10px',
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#475569',
                            width: '40px'
                          }}>
                              #
                            </th>
                            <th style={{
                            padding: '8px 10px',
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#475569'
                          }}>
                              Calculation Name
                            </th>
                            <th style={{
                            padding: '8px 10px',
                            textAlign: 'right',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#475569',
                            width: '150px'
                          }}>
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dynamicCalculations.
                        filter((c) => c.enabled).
                        sort((a, b) => (a.order || 0) - (b.order || 0)).
                        map((calc, idx) => {
                          const value = calculatedValues[calc.name] || '-';
                          const rowBg = calc.columnFormat === 'highlight' ? '#fef3c7' :
                          calc.columnFormat === 'summary' ? '#dbeafe' :
                          idx % 2 === 0 ? '#ffffff' : '#f9fafb';

                          return (
                            <tr
                              key={idx}
                              style={{
                                backgroundColor: rowBg,
                                borderBottom: idx < dynamicCalculations.filter((c) => c.enabled).length - 1 ? '1px solid #e5e7eb' : 'none'
                              }}>

                                  <td style={{
                                padding: '8px 10px',
                                fontSize: '11px',
                                color: '#64748b',
                                fontWeight: '500'
                              }}>
                                    {idx + 1}
                                  </td>
                                  <td style={{
                                padding: '8px 10px',
                                fontSize: '12px',
                                color: '#1f2937',
                                fontWeight: '500'
                              }}>
                                    {calc.name}
                                    {calc.unit &&
                                <span style={{
                                  fontSize: '10px',
                                  color: '#6b7280',
                                  marginLeft: '6px'
                                }}>
                                        ({calc.unit})
                                      </span>
                                }
                                  </td>
                                  <td style={{
                                padding: '8px 10px',
                                fontSize: '13px',
                                color: '#0f172a',
                                fontWeight: '700',
                                textAlign: 'right'
                              }}>
                                    {value}
                                  </td>
                                </tr>);

                        })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>);

      })()}
    </div>);

});

InlineOptionsInput.displayName = 'InlineOptionsInput';

export default InlineOptionsInput;