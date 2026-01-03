import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { getPrintTypes, getPrintTypesByOrderType } from '../../../redux/create/printType/printTypeActions';
import { getExcelExportTypes } from '../../../redux/create/excelExportType/excelExportTypeActions';

// Print Type interface
interface PrintType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  paperSize: string;
  orientation: string;
  margins?: {top: number;right: number;bottom: number;left: number;};
  headerTemplate?: string;
  bodyTemplate?: string;
  footerTemplate?: string;
  isDefault?: boolean;
  linkedOrderTypes?: string[];
}

// Excel Export Type interface
interface ExcelExportType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  columns: {key: string;label: string;selected: boolean;}[];
  includeHeaders: boolean;
  sheetName: string;
  fileNamePrefix: string;
  isDefault?: boolean;
}

interface PrintExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'print' | 'excel';
  orderData: any;
  orderTypeId?: string;
  onSendEmail?: (emailAddress: string, content: string, subject: string, attachments?: any[]) => void;
  onSendWhatsApp?: (phoneNumber: string, message: string, document?: any) => void;
}

const PrintExcelModal: React.FC<PrintExcelModalProps> = ({
  isOpen,
  onClose,
  mode,
  orderData,
  orderTypeId,
  onSendEmail,
  onSendWhatsApp
}) => {
  const dispatch = useDispatch<any>();
  const printContentRef = useRef<HTMLDivElement>(null);

  // State for print types
  const [printTypes, setPrintTypes] = useState<PrintType[]>([]);
  const [selectedPrintType, setSelectedPrintType] = useState<PrintType | null>(null);
  const [loadingPrintTypes, setLoadingPrintTypes] = useState(false);

  // State for excel export types
  const [excelTypes, setExcelTypes] = useState<ExcelExportType[]>([]);
  const [selectedExcelType, setSelectedExcelType] = useState<ExcelExportType | null>(null);
  const [loadingExcelTypes, setLoadingExcelTypes] = useState(false);

  // State for preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // State for send options
  const [showSendOptions, setShowSendOptions] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState('');

  // Fetch print types
  useEffect(() => {
    if (isOpen && mode === 'print') {
      fetchPrintTypes();
    }
  }, [isOpen, mode, orderTypeId]);

  // Fetch excel export types
  useEffect(() => {
    if (isOpen && mode === 'excel') {
      fetchExcelTypes();
    }
  }, [isOpen, mode]);

  const fetchPrintTypes = async () => {
    setLoadingPrintTypes(true);
    try {
      let result;
      if (orderTypeId) {
        result = await dispatch(getPrintTypesByOrderType(orderTypeId));
      } else {
        result = await dispatch(getPrintTypes());
      }



      // Handle both old format (result.printTypes) and new format (result.data or result directly)
      const printTypesData = result?.printTypes || result?.data || (Array.isArray(result) ? result : []);

      if (printTypesData && printTypesData.length > 0) {
        setPrintTypes(printTypesData);
        const defaultType = printTypesData.find((pt: PrintType) => pt.isDefault);
        setSelectedPrintType(defaultType || printTypesData[0]);
      } else {
        setPrintTypes([]);
      }
    } catch (error) {

      setPrintTypes([]);
    } finally {
      setLoadingPrintTypes(false);
    }
  };

  const fetchExcelTypes = async () => {
    setLoadingExcelTypes(true);
    try {
      const result = await dispatch(getExcelExportTypes());


      // Handle both old format (result.excelExportTypes) and new format (result.data or result directly)
      const excelTypesData = result?.excelExportTypes || result?.data || (Array.isArray(result) ? result : []);

      if (excelTypesData && excelTypesData.length > 0) {
        setExcelTypes(excelTypesData);
        const defaultType = excelTypesData.find((et: ExcelExportType) => et.isDefault);
        setSelectedExcelType(defaultType || excelTypesData[0]);
      } else {
        setExcelTypes([]);
      }
    } catch (error) {

      setExcelTypes([]);
    } finally {
      setLoadingExcelTypes(false);
    }
  };

  // Helper function to convert specificationValues array to object
  const specsToObject = (specs: any): Record<string, any> => {
    if (!specs) return {};
    // If already an object (not array), return as-is
    if (!Array.isArray(specs)) return specs;
    // Convert array format to object format
    const obj: Record<string, any> = {};
    specs.forEach((spec: any) => {
      if (spec && spec.name !== undefined) {
        obj[spec.name] = spec.value;
      }
    });
    return obj;
  };

  // Generate print HTML from template
  const generatePrintHtml = (printType: PrintType) => {
    const customer = orderData?.customer || orderData?.account || {};
    const options = orderData?.options || [];

    // Debug: Log orderData to check if createdBy and dates are present









    // Get first option for single-item templates
    const firstOption = options[0] || {};
    // Convert specificationValues from array to object if needed
    const firstSpecs = specsToObject(firstOption.specificationValues);
    const firstDims = firstOption.dim || firstOption.dimensions || firstSpecs || {};

    // Replace placeholders in templates with Handlebars-like syntax support
    const replacePlaceholders = (template: string) => {
      if (!template) return '';

      let result = template;

      // Handle {{#items}}...{{/items}} loop
      result = result.replace(/\{\{#items\}\}([\s\S]*?)\{\{\/items\}\}/g, (match, itemTemplate) => {
        if (!options || options.length === 0) return '';
        return options.map((item: any, index: number) => {
          let itemResult = itemTemplate;
          // Replace @index
          itemResult = itemResult.replace(/\{\{@index\}\}/g, String(index + 1));
          // Replace item properties
          itemResult = itemResult.replace(/\{\{optionName\}\}/g, item.optionName || item.name || 'N/A');
          itemResult = itemResult.replace(/\{\{optionType\}\}/g, item.optionTypeName || item.optionType || item.category || 'N/A');
          itemResult = itemResult.replace(/\{\{optionCode\}\}/g, item.optionCode || 'N/A');
          itemResult = itemResult.replace(/\{\{quantity\}\}/g, String(item.quantity || 1));
          itemResult = itemResult.replace(/\{\{amount\}\}/g, item.amount || item.total || 'N/A');

          // Replace dimension variables - convert array to object if needed
          const itemSpecs = specsToObject(item.specificationValues);
          const dims = item.dim || item.dimensions || itemSpecs || {};

          // Handle conditional blocks {{#dim.variable}}...{{/dim.variable}}
          itemResult = itemResult.replace(/\{\{#dim\.([^}]+)\}\}([\s\S]*?)\{\{\/dim\.\1\}\}/g, (m: string, key: string, content: string) => {
            const value = dims[key];
            if (value !== undefined && value !== null && value !== '') {
              return content.replace(/\{\{dim\.\w+\}\}/g, String(value));
            }
            return '';
          });

          // Replace dim.* variables
          itemResult = itemResult.replace(/\{\{dim\.([^}]+)\}\}/g, (m: string, key: string) => {
            return dims[key] !== undefined ? String(dims[key]) : '';
          });

          // Replace direct dimension variables
          itemResult = itemResult.replace(/\{\{wt\}\}/g, dims.wt || dims.weight || item.wt || '');
          itemResult = itemResult.replace(/\{\{wastage\}\}/g, dims.wastage || item.wastage || '');
          itemResult = itemResult.replace(/\{\{calculation\}\}/g, dims.calculation || item.calculation || '');
          itemResult = itemResult.replace(/\{\{mc_gram\}\}/g, dims.mc_gram || item.mc_gram || '');
          itemResult = itemResult.replace(/\{\{purity\}\}/g, dims.purity || item.purity || '');
          itemResult = itemResult.replace(/\{\{rate\}\}/g, dims.rate || item.rate || '');
          itemResult = itemResult.replace(/\{\{weight\}\}/g, dims.weight || dims.wt || item.weight || '');

          return itemResult;
        }).join('');
      });

      // Handle conditional blocks at order level {{#dim.variable}}...{{/dim.variable}}
      result = result.replace(/\{\{#dim\.([^}]+)\}\}([\s\S]*?)\{\{\/dim\.\1\}\}/g, (m: string, key: string, content: string) => {
        const value = firstDims[key];
        if (value !== undefined && value !== null && value !== '') {
          return content.replace(/\{\{dim\.\w+\}\}/g, String(value));
        }
        return '';
      });

      // Handle conditional blocks {{#variable}}...{{/variable}} for any variable
      result = result.replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (m: string, key: string, content: string) => {
        let value;
        // Check in firstDims first
        if (key.startsWith('dim.')) {
          value = firstDims[key.replace('dim.', '')];
        } else {
          value = firstOption[key] || firstDims[key] || orderData?.[key] || customer[key];
        }
        if (value !== undefined && value !== null && value !== '') {
          // Replace the variable inside the content
          return content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
        }
        return '';
      });

      // Replace order-level option placeholders (for single-item templates)
      result = result.
      replace(/\{\{optionName\}\}/g, firstOption.optionName || firstOption.name || '').
      replace(/\{\{optionType\}\}/g, firstOption.optionTypeName || firstOption.optionType || firstOption.category || '').
      replace(/\{\{optionCode\}\}/g, firstOption.optionCode || '');

      // Replace dim.* variables at order level
      result = result.replace(/\{\{dim\.([^}]+)\}\}/g, (m: string, key: string) => {
        return firstDims[key] !== undefined ? String(firstDims[key]) : '';
      });

      // Replace direct dimension variables at order level
      result = result.
      replace(/\{\{wt\}\}/g, firstDims.wt || firstDims.weight || firstOption.wt || '').
      replace(/\{\{wastage\}\}/g, firstDims.wastage || firstOption.wastage || '').
      replace(/\{\{calculation\}\}/g, firstDims.calculation || firstOption.calculation || '').
      replace(/\{\{mc_gram\}\}/g, firstDims.mc_gram || firstOption.mc_gram || '').
      replace(/\{\{purity\}\}/g, firstDims.purity || firstOption.purity || '').
      replace(/\{\{rate\}\}/g, firstDims.rate || firstOption.rate || '').
      replace(/\{\{weight\}\}/g, firstDims.weight || firstDims.wt || firstOption.weight || '');

      // Replace order-level placeholders
      result = result.
      replace(/\{\{orderId\}\}/g, orderData?.orderId || '').
      replace(/\{\{orderNumber\}\}/g, orderData?.orderId || orderData?.orderNumber || '').
      replace(/\{\{orderDate\}\}/g, new Date(orderData?.createdAt || Date.now()).toLocaleDateString('en-IN')).
      replace(/\{\{date\}\}/g, new Date(orderData?.createdAt || Date.now()).toLocaleDateString('en-IN')).
      replace(/\{\{createdAt\}\}/g, orderData?.createdAt ? new Date(orderData.createdAt).toLocaleString('en-IN') : '').
      replace(/\{\{createdDate\}\}/g, orderData?.createdAt ? new Date(orderData.createdAt).toLocaleString('en-IN') : '').
      replace(/\{\{createdBy\}\}/g, orderData?.createdBy?.username || orderData?.createdBy?.name || orderData?.createdByName || '').
      replace(/\{\{createdByName\}\}/g, orderData?.createdBy?.username || orderData?.createdBy?.name || orderData?.createdByName || '').
      replace(/\{\{updatedAt\}\}/g, orderData?.updatedAt ? new Date(orderData.updatedAt).toLocaleString('en-IN') : '').
      replace(/\{\{orderStatus\}\}/g, orderData?.status || orderData?.overallStatus || 'Pending').
      replace(/\{\{status\}\}/g, orderData?.status || orderData?.overallStatus || 'Pending').
      replace(/\{\{orderType\}\}/g, orderData?.orderTypeName || orderData?.orderType?.name || '').
      replace(/\{\{priority\}\}/g, orderData?.priority || 'Normal').
      replace(/\{\{notes\}\}/g, orderData?.notes || '').
      replace(/\{\{totalOptions\}\}/g, String(options.length)).
      replace(/\{\{totalItems\}\}/g, String(options.length)).
      replace(/\{\{totalQuantity\}\}/g, String(options.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0))).
      replace(/\{\{companyName\}\}/g, '27 Manufacturing').
      replace(/\{\{companyAddress\}\}/g, '').
      replace(/\{\{companyPhone\}\}/g, '').
      replace(/\{\{companyEmail\}\}/g, '')
      // Customer placeholders
      .replace(/\{\{customerName\}\}/g, customer.name || customer.accountName || '').
      replace(/\{\{customerPhone\}\}/g, customer.phone || customer.mobile || '').
      replace(/\{\{customerEmail\}\}/g, customer.email || '').
      replace(/\{\{customerAddress\}\}/g, customer.address || '')
      // Totals
      .replace(/\{\{subtotal\}\}/g, orderData?.subtotal || '').
      replace(/\{\{tax\}\}/g, orderData?.tax || '').
      replace(/\{\{discount\}\}/g, orderData?.discount || '').
      replace(/\{\{grandTotal\}\}/g, orderData?.grandTotal || orderData?.total || '');

      return result;
    };

    // Build options table with summary
    // Get creator name from multiple possible sources







    const creatorName = orderData?.createdByName ||
    orderData?.createdBy?.username ||
    orderData?.createdBy?.name || (
    typeof orderData?.createdBy === 'string' ? orderData.createdBy : null) ||
    'N/A';

    const createdDate = orderData?.createdAt ? new Date(orderData.createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : 'N/A';



    const optionsHtml = options.length > 0 ? `
      <div style="margin: 20px 0;">
        <div style="background: #fffbeb; padding: 15px; border: 2px solid #FF6B35; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #1f2937;">
            <div>
              <strong style="color: #FF6B35;">Created By:</strong> <span style="font-weight: 600;">${creatorName}</span>
            </div>
            <div>
              <strong style="color: #FF6B35;">Created Date:</strong> <span style="font-weight: 600;">${createdDate}</span>
            </div>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-weight: 600;">#</th>
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-weight: 600;">Option</th>
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-weight: 600;">Type</th>
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-weight: 600;">Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${options.map((opt: any, idx: number) => `
              <tr>
                <td style="border: 1px solid #e5e7eb; padding: 10px;">${idx + 1}</td>
                <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: 500;">${opt.optionName || 'N/A'}</td>
                <td style="border: 1px solid #e5e7eb; padding: 10px;">${opt.optionTypeName || opt.category || 'N/A'}</td>
                <td style="border: 1px solid #e5e7eb; padding: 10px;">
                  ${opt.specificationValues ? Object.entries(opt.specificationValues).map(([k, v]) => `${k}: ${v}`).join(', ') : 'N/A'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '<p>No options added</p>';

    // Default templates if not provided
    const defaultHeader = `
      <div style="text-align: center; padding: 20px; border-bottom: 2px solid #FF6B35;">
        <h1 style="margin: 0; color: #FF6B35;">27 Infinity Manufacturing</h1>
        <p style="margin: 5px 0; color: #6b7280;">Order: {{orderId}}</p>
      </div>
    `;

    const defaultBody = `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h3 style="margin: 0 0 10px 0;">Customer Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> {{customerName}}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> {{customerPhone}}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{customerEmail}}</p>
          </div>
          <div>
            <h3 style="margin: 0 0 10px 0;">Order Info</h3>
            <p style="margin: 5px 0;"><strong>Created Date:</strong> {{createdDate}}</p>
            <p style="margin: 5px 0;"><strong>Created By:</strong> {{createdBy}}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> {{status}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{priority}}</p>
          </div>
        </div>
        <h3>Order Items</h3>
        ${optionsHtml}
        ${orderData?.notes ? `<div style="margin-top: 20px;"><strong>Notes:</strong> ${orderData.notes}</div>` : ''}
      </div>
    `;

    const defaultFooter = `
      <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        <p>Thank you for your business!</p>
        <p>27 Infinity Manufacturing - Quality Products, Trusted Service</p>
      </div>
    `;

    const header = replacePlaceholders(printType.headerTemplate || defaultHeader);
    const body = replacePlaceholders(printType.bodyTemplate || defaultBody);
    const footer = replacePlaceholders(printType.footerTemplate || defaultFooter);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order ${orderData?.orderId || ''}</title>
        <style>
          @page {
            size: ${printType.paperSize || 'A4'} ${printType.orientation || 'portrait'};
            margin: ${printType.margins?.top || 10}mm ${printType.margins?.right || 10}mm ${printType.margins?.bottom || 10}mm ${printType.margins?.left || 10}mm;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
          }
        </style>
      </head>
      <body>
        ${header}
        ${body}
        ${footer}
      </body>
      </html>
    `;
  };

  // Handle print - using iframe for Electron compatibility
  const handlePrint = () => {
    if (!selectedPrintType && printTypes.length > 0) {
      setSelectedPrintType(printTypes[0]);
    }

    const printHtml = generatePrintHtml(selectedPrintType || {
      _id: 'default',
      typeName: 'Default',
      typeCode: 'DEFAULT',
      paperSize: 'A4',
      orientation: 'portrait'
    });

    // Use iframe for Electron compatibility (window.open is blocked)
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    printFrame.style.visibility = 'hidden';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(printHtml);
      frameDoc.close();

      // Wait for content to load then print
      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (e) {

        }
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 250);
    }

    onClose();
  };

  // Handle Excel export using Excel Export Type configuration
  const handleExcelExport = () => {
    const exportType = selectedExcelType;
    const customer = orderData?.customer || orderData?.account || {};
    const options = orderData?.options || [];

    // Get selected columns from export type or use defaults
    const selectedColumns = exportType?.columns?.filter((c: any) => c.selected) || [
    { key: 'orderId', label: 'Order ID' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'overallStatus', label: 'Status' },
    { key: 'date', label: 'Date' }];


    // Get all unique specification keys from options (convert array to object first)
    const allSpecKeys = new Set<string>();
    options.forEach((opt: any) => {
      // Convert specificationValues from array to object if needed
      const specs = specsToObject(opt.specificationValues) || opt.dim || opt.dimensions || {};
      Object.keys(specs).forEach((key) => allSpecKeys.add(key));
    });
    const specKeys = Array.from(allSpecKeys);

    // Helper to get value for a column key
    const getColumnValue = (key: string) => {
      switch (key) {
        case 'orderId':
        case 'orderNumber':
          return orderData?.orderId || '';
        case 'date':
        case 'orderDate':
          return new Date(orderData?.createdAt || Date.now()).toLocaleDateString('en-IN');
        case 'overallStatus':
        case 'status':
          return orderData?.status || orderData?.overallStatus || 'Pending';
        case 'priority':
          return orderData?.priority || 'Normal';
        case 'orderType':
          return orderData?.orderTypeName || orderData?.orderType?.name || '';
        case 'customerName':
          return customer.name || customer.accountName || '';
        case 'phone':
          return customer.phone || customer.mobile || '';
        case 'email':
          return customer.email || '';
        case 'address':
          return customer.address || '';
        case 'whatsapp':
          return customer.whatsapp || customer.phone || customer.mobile || '';
        case 'allOptions':
          return options.map((o: any) => o.optionName || o.name).join(', ');
        case 'productOptions':
        case 'materialOptions':
          return options.map((o: any) => o.optionName || o.name).join(', ');
        case 'optionQuantity':
        case 'totalQuantity':
          return options.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0);
        case 'totalItems':
        case 'totalOptions':
          return options.length;
        case 'notes':
          return orderData?.notes || '';
        case 'createdAt':
          return orderData?.createdAt ? new Date(orderData.createdAt).toLocaleDateString('en-IN') : '';
        case 'updatedAt':
          return orderData?.updatedAt ? new Date(orderData.updatedAt).toLocaleDateString('en-IN') : '';
        case 'branch':
          return orderData?.branchName || orderData?.branch?.name || '';
        default:
          return orderData?.[key] || '';
      }
    };

    // Build header row with order info using selected columns
    const headerRows: any[][] = [
    [`${exportType?.typeName || 'Order Export'} - 27 Infinity Manufacturing`],
    []];


    // Add selected column values as header info
    selectedColumns.forEach((col: any) => {
      const value = getColumnValue(col.key);
      if (value) {
        headerRows.push([`${col.label}:`, value]);
      }
    });

    headerRows.push([]);
    headerRows.push(['ITEMS']);
    headerRows.push([]);

    // Build items table header with specification keys
    const itemHeaders = ['#', 'Option Name', 'Option Type', 'Quantity', ...specKeys];

    // Build items rows with all specifications (convert array to object)
    const itemRows = options.map((opt: any, index: number) => {
      const specs = specsToObject(opt.specificationValues) || opt.dim || opt.dimensions || {};
      return [
      index + 1,
      opt.optionName || opt.name || 'N/A',
      opt.optionTypeName || opt.optionType || opt.category || 'N/A',
      opt.quantity || 1,
      ...specKeys.map((key) => {
        const val = specs[key];
        return val !== undefined && val !== null ? val : 'N/A';
      })];

    });

    // Summary rows
    const summaryRows = [
    [],
    ['Total Items:', options.length],
    ['Total Quantity:', options.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0)]];


    if (orderData?.notes) {
      summaryRows.push([]);
      summaryRows.push(['Notes:', orderData.notes]);
    }

    // Combine all rows
    const allRows = [
    ...headerRows,
    itemHeaders,
    ...itemRows,
    ...summaryRows];


    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Set column widths
    ws['!cols'] = [
    { wch: 5 }, // #
    { wch: 25 }, // Option Name
    { wch: 20 }, // Option Type
    { wch: 10 }, // Quantity
    ...specKeys.map(() => ({ wch: 15 })) // Spec columns
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, exportType?.sheetName || 'Order');

    // Generate file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `${exportType?.fileNamePrefix || 'Order'}_${orderData?.orderId || 'export'}.xlsx`;
    saveAs(data, filename);

    onClose();
  };

  // Handle preview
  const handlePreview = () => {
    if (mode === 'print' && selectedPrintType) {
      setPreviewHtml(generatePrintHtml(selectedPrintType));
      setShowPreview(true);
    }
  };

  // Handle send via email
  const handleSendEmail = async () => {
    const customer = orderData?.customer || orderData?.account || {};
    const emailAddress = sendEmail || customer.email || '';

    if (!emailAddress) {
      alert('Please enter an email address');
      return;
    }

    const subject = `Order ${orderData?.orderId || ''} - 27 Infinity Manufacturing`;
    let content = '';
    let attachments: any[] = [];

    if (mode === 'print') {
      // Generate HTML content
      content = generatePrintHtml(selectedPrintType || {
        _id: 'default',
        typeName: 'Default',
        typeCode: 'DEFAULT',
        paperSize: 'A4',
        orientation: 'portrait'
      });

      // Generate PDF from HTML
      try {
        const printType = selectedPrintType || { paperSize: 'A4', orientation: 'portrait' };
        const orientation = (printType.orientation === 'landscape' ? 'landscape' : 'portrait') as 'portrait' | 'landscape';
        const opt = {
          margin: [10, 10, 10, 10] as [number, number, number, number],
          filename: `Order_${orderData?.orderId || 'print'}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: {
            unit: 'mm',
            format: printType.paperSize?.toLowerCase() || 'a4',
            orientation: orientation
          }
        };

        // Create an iframe to properly render the full HTML document
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '210mm'; // A4 width
        iframe.style.height = '297mm'; // A4 height
        document.body.appendChild(iframe);

        // Write the HTML content to the iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(content);
          iframeDoc.close();

          // Wait for iframe to load
          await new Promise(resolve => setTimeout(resolve, 500));

          // Generate PDF from iframe body
          const pdfBlob = await html2pdf()
            .from(iframeDoc.body)
            .set(opt)
            .outputPdf('blob');

          // Remove iframe
          document.body.removeChild(iframe);

          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64data = reader.result as string;
              // Remove data:application/pdf;base64, prefix
              const base64 = base64data.split(',')[1];
              resolve(base64);
            };
            reader.readAsDataURL(pdfBlob);
          });

          const base64 = await base64Promise;

          // Create PDF attachment
          attachments = [{
            filename: `Order_${orderData?.orderId || 'print'}.pdf`,
            content: base64,
            encoding: 'base64',
            contentType: 'application/pdf'
          }];
        } else {
          throw new Error('Failed to access iframe document');
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Email will be sent without attachment.');
      }
    } else {
      // For Excel, generate the file
      const exportType = selectedExcelType;
      const options = orderData?.options || [];

      // Get selected columns from export type or use defaults
      const selectedColumns = exportType?.columns?.filter((c: any) => c.selected) || [
        { key: 'orderId', label: 'Order ID' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'overallStatus', label: 'Status' },
        { key: 'date', label: 'Date' }
      ];

      // Get all unique specification keys from options
      const allSpecKeys = new Set<string>();
      options.forEach((opt: any) => {
        const specs = specsToObject(opt.specificationValues) || opt.dim || opt.dimensions || {};
        Object.keys(specs).forEach((key) => allSpecKeys.add(key));
      });
      const specKeys = Array.from(allSpecKeys);

      // Helper to get value for a column key
      const getColumnValue = (key: string) => {
        switch (key) {
          case 'orderId':
          case 'orderNumber':
            return orderData?.orderId || '';
          case 'date':
          case 'orderDate':
            return new Date(orderData?.createdAt || Date.now()).toLocaleDateString('en-IN');
          case 'overallStatus':
          case 'status':
            return orderData?.status || orderData?.overallStatus || 'Pending';
          case 'priority':
            return orderData?.priority || 'Normal';
          case 'orderType':
            return orderData?.orderTypeName || orderData?.orderType?.name || '';
          case 'customerName':
            return customer.name || customer.accountName || '';
          case 'phone':
            return customer.phone || customer.mobile || '';
          case 'email':
            return customer.email || '';
          case 'address':
            return customer.address || '';
          case 'whatsapp':
            return customer.whatsapp || customer.phone || customer.mobile || '';
          case 'allOptions':
            return options.map((o: any) => o.optionName || o.name).join(', ');
          case 'productOptions':
          case 'materialOptions':
            return options.map((o: any) => o.optionName || o.name).join(', ');
          case 'optionQuantity':
          case 'totalQuantity':
            return options.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0);
          case 'totalItems':
          case 'totalOptions':
            return options.length;
          case 'notes':
            return orderData?.notes || '';
          case 'createdAt':
            return orderData?.createdAt ? new Date(orderData.createdAt).toLocaleDateString('en-IN') : '';
          case 'updatedAt':
            return orderData?.updatedAt ? new Date(orderData.updatedAt).toLocaleDateString('en-IN') : '';
          case 'branch':
            return orderData?.branchName || orderData?.branch?.name || '';
          default:
            return orderData?.[key] || '';
        }
      };

      // Build header row with order info
      const headerRows: any[][] = [
        [`${exportType?.typeName || 'Order Export'} - 27 Infinity Manufacturing`],
        []
      ];

      // Add selected column values as header info
      selectedColumns.forEach((col: any) => {
        const value = getColumnValue(col.key);
        if (value) {
          headerRows.push([`${col.label}:`, value]);
        }
      });

      headerRows.push([]);
      headerRows.push(['ITEMS']);
      headerRows.push([]);

      // Build items table header
      const itemHeaders = ['#', 'Option Name', 'Option Type', 'Quantity', ...specKeys];

      // Build items rows
      const itemRows = options.map((opt: any, index: number) => {
        const specs = specsToObject(opt.specificationValues) || opt.dim || opt.dimensions || {};
        return [
          index + 1,
          opt.optionName || opt.name || 'N/A',
          opt.optionTypeName || opt.optionType || opt.category || 'N/A',
          opt.quantity || 1,
          ...specKeys.map((key) => {
            const val = specs[key];
            return val !== undefined && val !== null ? val : 'N/A';
          })
        ];
      });

      // Summary rows
      const summaryRows = [
        [],
        ['Total Items:', options.length],
        ['Total Quantity:', options.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0)]
      ];

      if (orderData?.notes) {
        summaryRows.push([]);
        summaryRows.push(['Notes:', orderData.notes]);
      }

      // Combine all rows
      const allRows = [
        ...headerRows,
        itemHeaders,
        ...itemRows,
        ...summaryRows
      ];

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(allRows);

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },
        { wch: 25 },
        { wch: 20 },
        { wch: 10 },
        ...specKeys.map(() => ({ wch: 15 }))
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, exportType?.sheetName || 'Order');

      // Generate Excel buffer and convert to base64
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const base64 = btoa(
        new Uint8Array(excelBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const filename = `${exportType?.fileNamePrefix || 'Order'}_${orderData?.orderId || 'export'}.xlsx`;

      // Create attachment object
      attachments = [{
        filename,
        content: base64,
        encoding: 'base64',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }];

      // Create email content
      content = `
        <h2>Order Details - 27 Infinity Manufacturing</h2>
        <p><strong>Order ID:</strong> ${orderData?.orderId || 'N/A'}</p>
        <p><strong>Customer:</strong> ${customer.name || customer.accountName || 'N/A'}</p>
        <p><strong>Phone:</strong> ${customer.phone || customer.mobile || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(orderData?.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
        <p><strong>Status:</strong> ${orderData?.status || orderData?.overallStatus || 'Pending'}</p>
        <br>
        <p>Please find the order details in the attached Excel file.</p>
      `;
    }

    if (onSendEmail) {
      onSendEmail(emailAddress, content, subject, attachments);
    }

    setShowSendOptions(false);
    onClose();
  };

  // Handle send via WhatsApp
  const handleSendWhatsApp = async () => {
    const customer = orderData?.customer || orderData?.account || {};
    const phone = sendWhatsApp || customer.phone || customer.mobile || customer.whatsapp || '';

    if (!phone) {
      alert('Please enter a phone number');
      return;
    }

    const message = `Order ${orderData?.orderId || ''} - 27 Infinity Manufacturing`;
    let document: any = null;

    if (mode === 'print') {
      // Generate PDF for WhatsApp
      try {
        const printType = selectedPrintType || { paperSize: 'A4', orientation: 'portrait' };
        const orientation = (printType.orientation === 'landscape' ? 'landscape' : 'portrait') as 'portrait' | 'landscape';
        const opt = {
          margin: [10, 10, 10, 10] as [number, number, number, number],
          filename: `Order_${orderData?.orderId || 'print'}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: {
            unit: 'mm',
            format: printType.paperSize?.toLowerCase() || 'a4',
            orientation: orientation
          }
        };

        const content = generatePrintHtml(selectedPrintType || {
          _id: 'default',
          typeName: 'Default',
          typeCode: 'DEFAULT',
          paperSize: 'A4',
          orientation: 'portrait'
        });

        // Create iframe for rendering
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '210mm';
        iframe.style.height = '297mm';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(content);
          iframeDoc.close();

          await new Promise(resolve => setTimeout(resolve, 500));

          const pdfBlob = await html2pdf()
            .from(iframeDoc.body)
            .set(opt)
            .outputPdf('blob');

          document.body.removeChild(iframe);

          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64data = reader.result as string;
              const base64 = base64data.split(',')[1];
              resolve(base64);
            };
            reader.readAsDataURL(pdfBlob);
          });

          const base64 = await base64Promise;

          document = {
            filename: `Order_${orderData?.orderId || 'print'}.pdf`,
            content: base64,
            contentType: 'application/pdf'
          };
        }
      } catch (error) {
        console.error('Error generating PDF for WhatsApp:', error);
        alert('Failed to generate PDF for WhatsApp');
        return;
      }
    } else if (mode === 'excel') {
      // Generate Excel for WhatsApp
      try {
        const exportType = selectedExcelType;
        if (!exportType) {
          alert('Please select an Excel export type');
          return;
        }

        const selectedColumns = exportType.columns?.filter((c: any) => c.selected) || [];
        const options = orderData?.options || orderData?.items || [];

        // Get all specification keys
        const specsToObject = (specValues: any) => {
          if (!specValues || !Array.isArray(specValues)) return null;
          const obj: any = {};
          specValues.forEach((spec: any) => {
            if (spec.fieldName && spec.value !== undefined) {
              obj[spec.fieldName] = spec.value;
            }
          });
          return obj;
        };

        let allSpecs: any = {};
        options.forEach((opt: any) => {
          const specs = specsToObject(opt.specificationValues) || opt.dim || opt.dimensions || {};
          Object.assign(allSpecs, specs);
        });
        const specKeys = Object.keys(allSpecs);

        // Helper to get column value
        const getColumnValue = (key: string) => {
          switch (key) {
            case 'orderId':
              return orderData?.orderId || '';
            case 'orderType':
              return orderData?.orderTypeName || orderData?.orderType || '';
            case 'customerName':
            case 'customer':
              return customer.name || customer.accountName || '';
            case 'phone':
            case 'mobile':
              return customer.phone || customer.mobile || '';
            case 'email':
              return customer.email || '';
            case 'address':
              return customer.address || '';
            case 'whatsapp':
              return customer.whatsapp || customer.phone || customer.mobile || '';
            default:
              return orderData?.[key] || '';
          }
        };

        // Build header rows
        const headerRows: any[][] = [
          [`${exportType?.typeName || 'Order Export'} - 27 Infinity Manufacturing`],
          []
        ];

        selectedColumns.forEach((col: any) => {
          const value = getColumnValue(col.key);
          if (value) {
            headerRows.push([`${col.label}:`, value]);
          }
        });

        headerRows.push([]);
        headerRows.push(['ITEMS']);
        headerRows.push([]);

        // Build items table
        const itemHeaders = ['#', 'Option Name', 'Option Type', 'Quantity', ...specKeys];
        const itemRows = options.map((opt: any, index: number) => {
          const specs = specsToObject(opt.specificationValues) || opt.dim || opt.dimensions || {};
          return [
            index + 1,
            opt.optionName || opt.name || 'N/A',
            opt.optionTypeName || opt.optionType || opt.category || 'N/A',
            opt.quantity || 1,
            ...specKeys.map((key) => {
              const val = specs[key];
              return val !== undefined && val !== null ? val : 'N/A';
            })
          ];
        });

        // Summary rows
        const summaryRows = [
          [],
          ['Total Items:', options.length],
          ['Total Quantity:', options.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0)]
        ];

        if (orderData?.notes) {
          summaryRows.push([]);
          summaryRows.push(['Notes:', orderData.notes]);
        }

        // Combine all rows
        const allRows = [...headerRows, itemHeaders, ...itemRows, ...summaryRows];

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(allRows);
        ws['!cols'] = [
          { wch: 5 },
          { wch: 25 },
          { wch: 20 },
          { wch: 10 },
          ...specKeys.map(() => ({ wch: 15 }))
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, exportType?.sheetName || 'Order');

        // Generate Excel and convert to base64
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const base64 = btoa(
          new Uint8Array(excelBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        document = {
          filename: `${exportType?.fileNamePrefix || 'Order'}_${orderData?.orderId || 'export'}.xlsx`,
          content: base64,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
      } catch (error) {
        console.error('Error generating Excel for WhatsApp:', error);
        alert('Failed to generate Excel for WhatsApp');
        return;
      }
    }

    if (onSendWhatsApp && document) {
      await onSendWhatsApp(phone, message, document);
    } else if (document) {
      alert('WhatsApp functionality not configured. Please contact administrator.');
    } else {
      // Fallback to text message only (old behavior)
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }

    setShowSendOptions(false);
    onClose();
  };

  if (!isOpen) return null;

  const customer = orderData?.customer || {};

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: mode === 'print' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #10b981, #059669)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>{mode === 'print' ? '🖨️' : '📊'}</span>
            <div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>
                {mode === 'print' ? 'Print Order' : 'Export to Excel'}
              </h3>
              <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                Order: {orderData?.orderId || 'New Order'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>

            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {/* Customer Summary */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>Customer</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#6b7280' }}>Name: </span>
                <span style={{ color: '#1f2937', fontWeight: 500 }}>{customer.name || customer.accountName || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Phone: </span>
                <span style={{ color: '#1f2937', fontWeight: 500 }}>{customer.phone || customer.mobile || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Email: </span>
                <span style={{ color: '#1f2937', fontWeight: 500 }}>{customer.email || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Status: </span>
                <span style={{ color: '#1f2937', fontWeight: 500 }}>{orderData?.status || orderData?.overallStatus || 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Type Selection */}
          {mode === 'print' ?
          <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
                Select Print Type
              </h4>
              {loadingPrintTypes ?
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Loading print types...
                </div> :
            printTypes.length > 0 ?
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {printTypes.map((pt) =>
              <button
                key={pt._id}
                onClick={() => setSelectedPrintType(pt)}
                style={{
                  padding: '12px 16px',
                  border: selectedPrintType?._id === pt._id ? '2px solid #6366f1' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: selectedPrintType?._id === pt._id ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>

                      <div>
                        <div style={{ fontWeight: 500, color: '#1f2937' }}>{pt.typeName}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {pt.paperSize} • {pt.orientation}
                        </div>
                      </div>
                      {pt.isDefault &&
                <span style={{
                  padding: '4px 8px',
                  background: '#10b981',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                          Default
                        </span>
                }
                    </button>
              )}
                </div> :

            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#fef3c7',
              borderRadius: '8px',
              color: '#92400e'
            }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
                  <p style={{ margin: 0 }}>No print types configured for this order type.</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Default print format will be used.</p>
                </div>
            }
            </div> :

          <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
                Select Export Type
              </h4>
              {loadingExcelTypes ?
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Loading export types...
                </div> :
            excelTypes.length > 0 ?
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {excelTypes.map((et) =>
              <button
                key={et._id}
                onClick={() => setSelectedExcelType(et)}
                style={{
                  padding: '12px 16px',
                  border: selectedExcelType?._id === et._id ? '2px solid #10b981' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: selectedExcelType?._id === et._id ? '#ecfdf5' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>

                      <div>
                        <div style={{ fontWeight: 500, color: '#1f2937' }}>{et.typeName}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {et.columns?.filter((c) => c.selected).length || 0} columns • {et.sheetName || 'Sheet1'}
                        </div>
                      </div>
                      {et.isDefault &&
                <span style={{
                  padding: '4px 8px',
                  background: '#10b981',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                          Default
                        </span>
                }
                    </button>
              )}
                </div> :

            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#fef3c7',
              borderRadius: '8px',
              color: '#92400e'
            }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                  <p style={{ margin: 0 }}>No export types configured.</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Default export format will be used.</p>
                </div>
            }
            </div>
          }

          {/* Send Options */}
          {showSendOptions &&
          <div style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
                Send Options
              </h4>

              {/* Email */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                  type="email"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  placeholder={customer.email || 'Enter email address'}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }} />

                  <button
                  onClick={handleSendEmail}
                  disabled={!sendEmail && !customer.email}
                  style={{
                    padding: '10px 16px',
                    background: sendEmail || customer.email ? '#FF6B35' : '#e5e7eb',
                    color: sendEmail || customer.email ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: sendEmail || customer.email ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>

                    Send
                  </button>
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  WhatsApp Number
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                  type="tel"
                  value={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.value)}
                  placeholder={customer.phone || customer.mobile || 'Enter phone number'}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }} />

                  <button
                  onClick={handleSendWhatsApp}
                  disabled={!sendWhatsApp && !customer.phone && !customer.mobile}
                  style={{
                    padding: '10px 16px',
                    background: sendWhatsApp || customer.phone || customer.mobile ? '#25D366' : '#e5e7eb',
                    color: sendWhatsApp || customer.phone || customer.mobile ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: sendWhatsApp || customer.phone || customer.mobile ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>

                    Send
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f9fafb'
        }}>
          <button
            onClick={() => setShowSendOptions(!showSendOptions)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#374151'
            }}>

            <span>📤</span>
            {showSendOptions ? 'Hide Send Options' : 'Send via Email/WhatsApp'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {mode === 'print' &&
            <button
              onClick={handlePreview}
              style={{
                padding: '10px 20px',
                border: '1px solid #6366f1',
                borderRadius: '8px',
                background: 'white',
                color: '#6366f1',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}>

                Preview
              </button>
            }
            <button
              onClick={mode === 'print' ? handlePrint : handleExcelExport}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '8px',
                background: mode === 'print' ? '#6366f1' : '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>

              {mode === 'print' ?
              <>
                  <span>🖨️</span> Print Now
                </> :

              <>
                  <span>📥</span> Export Excel
                </>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview &&
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001
      }}>
          <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
            <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
              <h4 style={{ margin: 0, color: '#1f2937' }}>Print Preview</h4>
              <button
              onClick={() => setShowPreview(false)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                background: '#6b7280',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px'
              }}>

                Close
              </button>
            </div>
            <div
            ref={printContentRef}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px',
              background: '#f3f4f6'
            }}>

              <div
              style={{
                background: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                margin: '0 auto',
                maxWidth: '600px',
                minHeight: '400px'
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }} />

            </div>
          </div>
        </div>
      }
    </div>);

};

export default PrintExcelModal;