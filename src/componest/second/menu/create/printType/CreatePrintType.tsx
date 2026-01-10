import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify';
import { createPrintTypeV2 as createPrintType, updatePrintTypeV2 as updatePrintType, deletePrintTypeV2 as deletePrintType } from "../../../../redux/unifiedV2/printTypeActions";
import { getOrderTypesV2 as getOrderTypes } from "../../../../redux/unifiedV2/orderTypeActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import "../orderType/orderType.css";

interface CreatePrintTypeProps {
  initialData?: any;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreatePrintType: React.FC<CreatePrintTypeProps> = ({ initialData: propInitialData, onCancel, onSaveSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode detection - support both props and location.state
  const { printTypeData: locationData, isEdit } = location.state || {};
  const printTypeData = propInitialData || locationData;
  const editMode = Boolean(propInitialData || isEdit || printTypeData && printTypeData._id);
  const printTypeId = printTypeData?._id;

  // Basic Information
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");

  // Print Configuration
  const [paperSize, setPaperSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [margins, setMargins] = useState({ top: 10, right: 10, bottom: 10, left: 10 });

  // Template Configuration
  const [headerTemplate, setHeaderTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [footerTemplate, setFooterTemplate] = useState("");
  const [cssTemplate, setCssTemplate] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Linked Order Types
  const [linkedOrderTypes, setLinkedOrderTypes] = useState<string[]>([]);

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // New features state
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [useSampleData, setUseSampleData] = useState(true);
  const [activeTemplateField, setActiveTemplateField] = useState<'header' | 'body' | 'footer' | 'css' | null>(null);

  // Refs for cursor position
  const headerRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const footerRef = useRef<HTMLTextAreaElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  // Get user role for conditional rendering
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // Get order types from Redux store
  const rawOrderTypes = useSelector((state: any) => state.v2.orderType?.list);
  const orderTypes = Array.isArray(rawOrderTypes) ? rawOrderTypes : [];

  // Fetch order types on mount
  useEffect(() => {
    dispatch(getOrderTypes());
  }, [dispatch]);

  // Template Library - Pre-built templates
  const templateLibrary = [
  {
    name: "Invoice Template",
    description: "Professional invoice with itemized list",
    headerTemplate: `<div class="print-header">
  <h1>{{companyName}}</h1>
  <p>{{companyAddress}}</p>
  <p>Phone: {{companyPhone}} | Email: {{companyEmail}}</p>
  <h2 style="margin-top: 20px;">INVOICE</h2>
</div>`,
    bodyTemplate: `<div class="print-body">
  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <div>
      <strong>Bill To:</strong><br/>
      {{customerName}}<br/>
      {{customerAddress}}<br/>
      {{customerPhone}}
    </div>
    <div style="text-align: right;">
      <strong>Invoice #:</strong> {{orderNumber}}<br/>
      <strong>Date:</strong> {{orderDate}}<br/>
      <strong>Status:</strong> {{orderStatus}}
    </div>
  </div>

  <table class="print-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Type</th>
        <th>Qty</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr>
        <td>{{optionName}}</td>
        <td>{{optionType}}</td>
        <td>{{quantity}}</td>
        <td style="text-align: right;">{{dim.rate}}</td>
        <td style="text-align: right;">{{amount}}</td>
      </tr>
      {{/items}}
    </tbody>
  </table>

  <div style="text-align: right; margin-top: 20px;">
    <p><strong>Subtotal:</strong> {{subtotal}}</p>
    <p><strong>Tax:</strong> {{tax}}</p>
    <p style="font-size: 18px;"><strong>Grand Total:</strong> {{grandTotal}}</p>
  </div>
</div>`,
    footerTemplate: `<div class="print-footer">
  <p style="text-align: center; margin-top: 30px;">
    <strong>Thank you for your business!</strong>
  </p>
  <p style="font-size: 10px; text-align: center;">
    Terms & Conditions Apply | Payment due within 30 days
  </p>
</div>`,
    cssTemplate: `.print-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
.print-body { padding: 20px 0; }
.print-footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; }
.print-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.print-table th { background: #1e40af; color: white; padding: 10px; text-align: left; }
.print-table td { border-bottom: 1px solid #ddd; padding: 8px; }`
  },
  {
    name: "Packing Slip",
    description: "Simple packing slip for shipments",
    headerTemplate: `<div class="print-header">
  <h2>PACKING SLIP</h2>
  <p>Order #: {{orderNumber}} | Date: {{orderDate}}</p>
</div>`,
    bodyTemplate: `<div class="print-body">
  <div style="margin-bottom: 20px;">
    <strong>Ship To:</strong><br/>
    {{customerName}}<br/>
    {{customerAddress}}
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #f5f5f5;">
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">#</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item Description</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Quantity</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">{{@index}}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">{{optionName}}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">{{quantity}}</td>
      </tr>
      {{/items}}
    </tbody>
  </table>

  <p style="margin-top: 20px;"><strong>Total Items:</strong> {{totalItems}}</p>
</div>`,
    footerTemplate: `<div class="print-footer">
  <p style="text-align: center; font-size: 11px;">
    Please check all items upon delivery. Report any discrepancies within 24 hours.
  </p>
</div>`,
    cssTemplate: `body { font-family: Arial, sans-serif; font-size: 12px; }
.print-header { text-align: center; margin-bottom: 30px; }
.print-body { margin: 20px 0; }
.print-footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; }`
  },
  {
    name: "Product Label",
    description: "Compact label for products",
    headerTemplate: ``,
    bodyTemplate: `<div style="border: 2px solid #000; padding: 15px; max-width: 300px;">
  <div style="text-align: center; margin-bottom: 10px;">
    <h3 style="margin: 0;">{{optionName}}</h3>
    <p style="margin: 5px 0; font-size: 11px;">Code: {{optionCode}}</p>
  </div>

  <div style="font-size: 10px; line-height: 1.6;">
    <p><strong>Type:</strong> {{optionType}}</p>
    <p><strong>Date:</strong> {{orderDate}}</p>
    {{#dim.weight}}
    <p><strong>Weight:</strong> {{dim.weight}}</p>
    {{/dim.weight}}
    {{#dim.purity}}
    <p><strong>Purity:</strong> {{dim.purity}}</p>
    {{/dim.purity}}
  </div>

  <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc;">
    <p style="font-size: 9px; margin: 0;">Order #{{orderNumber}}</p>
  </div>
</div>`,
    footerTemplate: ``,
    cssTemplate: `body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }`
  }];


  // Sample data generator for preview
  const generateSampleData = () => {
    return {
      companyName: "ABC Manufacturing Co.",
      companyAddress: "123 Business Street, City, State - 12345",
      companyPhone: "+91-1234567890",
      companyEmail: "info@abcmanufacturing.com",
      orderNumber: "ORD-2025-001",
      orderDate: new Date().toLocaleDateString(),
      orderType: "Standard Order",
      orderStatus: "Processing",
      customerName: "John Doe",
      customerAddress: "456 Customer Ave, Town, State - 67890",
      customerPhone: "+91-9876543210",
      items: [
      {
        optionName: "Premium Plastic Bag",
        optionType: "Packaging",
        optionCode: "PPB-001",
        quantity: 100,
        dim: {
          mc_gram: "50",
          calculation: "5000",
          wastage: "250",
          purity: "98%",
          weight: "5 kg",
          rate: "₹10.00"
        },
        amount: "₹1,000.00"
      },
      {
        optionName: "Standard Printing Ink",
        optionType: "Material",
        optionCode: "SPI-002",
        quantity: 50,
        dim: {
          mc_gram: "25",
          calculation: "1250",
          wastage: "125",
          purity: "95%",
          weight: "1.25 kg",
          rate: "₹25.00"
        },
        amount: "₹1,250.00"
      },
      {
        optionName: "Custom Label",
        optionType: "Printing",
        optionCode: "CL-003",
        quantity: 200,
        dim: {
          weight: "2 kg",
          rate: "₹5.00"
        },
        amount: "₹1,000.00"
      }],

      subtotal: "₹3,250.00",
      tax: "₹585.00",
      discount: "₹0.00",
      grandTotal: "₹3,835.00",
      totalItems: 3,
      totalQuantity: 350
    };
  };

  // Render template with sample/real data using simple Handlebars-like replacement
  const renderTemplate = (template: string, data: any): string => {
    if (!template) return '';

    let rendered = template;

    // Replace simple variables {{variableName}}
    rendered = rendered.replace(/\{\{([^#\/][^}]+)\}\}/g, (match, key) => {
      const keys = key.trim().split('.');
      let value: any = data;
      for (const k of keys) {
        value = value?.[k];
      }
      return value !== undefined && value !== null ? String(value) : match;
    });

    // Handle simple array iterations {{#items}}...{{/items}}
    rendered = rendered.replace(/\{\{#items\}\}([\s\S]*?)\{\{\/items\}\}/g, (match, itemTemplate) => {
      if (!data.items || !Array.isArray(data.items)) return '';
      return data.items.map((item: any, index: number) => {
        let itemRendered = itemTemplate;
        // Replace @index
        itemRendered = itemRendered.replace(/\{\{@index\}\}/g, String(index + 1));
        // Replace item properties
        itemRendered = itemRendered.replace(/\{\{([^}]+)\}\}/g, (m: string, k: string) => {
          const keys = k.trim().split('.');
          let value: any = item;
          for (const key of keys) {
            value = value?.[key];
          }
          return value !== undefined && value !== null ? String(value) : m;
        });
        return itemRendered;
      }).join('');
    });

    // Handle conditional blocks {{#variableName}}...{{/variableName}}
    rendered = rendered.replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
      const keys = key.trim().split('.');
      let value: any = data;
      for (const k of keys) {
        value = value?.[k];
      }
      return value ? content : '';
    });

    return rendered;
  };

  // Insert variable at cursor position
  const insertVariable = (variable: string, field: 'header' | 'body' | 'footer') => {
    const ref = field === 'header' ? headerRef : field === 'body' ? bodyRef : footerRef;
    const textarea = ref.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + variable + after;

    if (field === 'header') setHeaderTemplate(newText);else
    if (field === 'body') setBodyTemplate(newText);else
    setFooterTemplate(newText);

    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  // Load template from library
  const loadTemplate = (template: typeof templateLibrary[0]) => {
    setHeaderTemplate(template.headerTemplate);
    setBodyTemplate(template.bodyTemplate);
    setFooterTemplate(template.footerTemplate);
    setCssTemplate(template.cssTemplate);
    setShowTemplateLibrary(false);
    toast.success('Template Loaded', `"${template.name}" has been loaded successfully`);
  };

  // Export template as JSON
  const exportTemplate = () => {
    const templateData = {
      typeName,
      typeCode,
      description,
      paperSize,
      orientation,
      margins,
      headerTemplate,
      bodyTemplate,
      footerTemplate,
      cssTemplate,
      linkedOrderTypes,
      isGlobal,
      isDefault,
      isActive,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `print-template-${typeCode || 'export'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Export Success', 'Template exported successfully');
  };

  // Import template from JSON
  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Load all fields from imported data
        if (data.typeName) setTypeName(data.typeName);
        if (data.typeCode) setTypeCode(data.typeCode);
        if (data.description) setDescription(data.description);
        if (data.paperSize) setPaperSize(data.paperSize);
        if (data.orientation) setOrientation(data.orientation);
        if (data.margins) setMargins(data.margins);
        if (data.headerTemplate) setHeaderTemplate(data.headerTemplate);
        if (data.bodyTemplate) setBodyTemplate(data.bodyTemplate);
        if (data.footerTemplate) setFooterTemplate(data.footerTemplate);
        if (data.cssTemplate) setCssTemplate(data.cssTemplate);
        if (data.linkedOrderTypes) setLinkedOrderTypes(data.linkedOrderTypes);
        if (data.isGlobal !== undefined) setIsGlobal(data.isGlobal);
        if (data.isDefault !== undefined) setIsDefault(data.isDefault);
        if (data.isActive !== undefined) setIsActive(data.isActive);

        toast.success('Import Success', 'Template imported successfully');
      } catch (error) {
        toast.error('Import Error', 'Invalid template file format');
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

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
    if (editMode && printTypeData) {


      // Basic Information
      setTypeName(printTypeData.typeName || "");
      setTypeCode(printTypeData.typeCode || "");
      setDescription(printTypeData.description || "");

      // Print Configuration
      setPaperSize(printTypeData.paperSize || "A4");
      setOrientation(printTypeData.orientation || "portrait");
      if (printTypeData.margins) {
        setMargins(printTypeData.margins);
      }

      // Template Configuration
      setHeaderTemplate(printTypeData.headerTemplate || "");
      setBodyTemplate(printTypeData.bodyTemplate || "");
      setFooterTemplate(printTypeData.footerTemplate || "");
      setCssTemplate(printTypeData.cssTemplate || "");

      // Linked Order Types
      if (printTypeData.linkedOrderTypes && Array.isArray(printTypeData.linkedOrderTypes)) {
        const orderTypeIds = printTypeData.linkedOrderTypes.map((ot: any) =>
        typeof ot === 'string' ? ot : ot._id
        );
        setLinkedOrderTypes(orderTypeIds);
      }

      // Global/Default Settings
      setIsGlobal(printTypeData.isGlobal || false);
      setIsDefault(printTypeData.isDefault || false);
      setIsActive(printTypeData.isActive !== false);
    }
  }, [editMode, printTypeData]);

  const handleSubmit = () => {
    // Validation
    if (!typeName.trim() || !typeCode.trim()) {
      toast.error("Validation Error", "Please fill all required fields: Type Name and Type Code");
      return;
    }

    // Template validation - at least one template should have content
    if (!headerTemplate.trim() && !bodyTemplate.trim() && !footerTemplate.trim()) {
      toast.error("Validation Error", "Please provide at least one template (Header, Body, or Footer)");
      return;
    }

    // Basic HTML validation - check for common unclosed tags
    const validateHTML = (html: string, templateName: string) => {
      const openTags = html.match(/<([a-z]+)(?:\s[^>]*)?>/gi) || [];
      const closeTags = html.match(/<\/([a-z]+)>/gi) || [];
      const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link'];

      const openTagNames = openTags.map((tag) => {
        const match = tag.match(/<([a-z]+)/i);
        return match ? match[1].toLowerCase() : '';
      }).filter((tag) => !selfClosingTags.includes(tag));

      const closeTagNames = closeTags.map((tag) => {
        const match = tag.match(/<\/([a-z]+)/i);
        return match ? match[1].toLowerCase() : '';
      });

      // Check if number of open and close tags match for common tags
      const commonTags = ['div', 'span', 'p', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'h1', 'h2', 'h3'];
      for (const tag of commonTags) {
        const openCount = openTagNames.filter((t) => t === tag).length;
        const closeCount = closeTagNames.filter((t) => t === tag).length;
        if (openCount !== closeCount) {
          return `${templateName} has mismatched <${tag}> tags (${openCount} open, ${closeCount} close)`;
        }
      }
      return null;
    };

    // Validate each template
    if (headerTemplate.trim()) {
      const error = validateHTML(headerTemplate, "Header Template");
      if (error) {
        toast.error("Template Validation Error", error);
        return;
      }
    }
    if (bodyTemplate.trim()) {
      const error = validateHTML(bodyTemplate, "Body Template");
      if (error) {
        toast.error("Template Validation Error", error);
        return;
      }
    }
    if (footerTemplate.trim()) {
      const error = validateHTML(footerTemplate, "Footer Template");
      if (error) {
        toast.error("Template Validation Error", error);
        return;
      }
    }

    // Build print type data
    const branchId = localStorage.getItem('selectedBranch') || localStorage.getItem('selectedBranch') || '';
    const dataToSave = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      paperSize,
      orientation,
      margins,
      headerTemplate,
      bodyTemplate,
      footerTemplate,
      cssTemplate,
      linkedOrderTypes,
      branchId,
      isGlobal,
      isDefault,
      isActive
    };

    if (editMode && printTypeId) {
      // Update existing print type
      handleSave(
        () => dispatch(updatePrintType(printTypeId, dataToSave)),
        {
          successMessage: "Print type updated successfully!",
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
      // Create new print type
      handleSave(
        () => dispatch(createPrintType(dataToSave)),
        {
          successMessage: "Print type created successfully!",
          onSuccess: () => {
            // Reset form
            setTypeName("");
            setTypeCode("");
            setDescription("");
            setPaperSize("A4");
            setOrientation("portrait");
            setMargins({ top: 10, right: 10, bottom: 10, left: 10 });
            setHeaderTemplate("");
            setBodyTemplate("");
            setFooterTemplate("");
            setCssTemplate("");
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
    if (!printTypeId) return;

    setDeleting(true);
    try {
      await dispatch(deletePrintType(printTypeId));
      toast.success('Deleted', 'Print type deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete print type');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="orderTypeContainer CreateForm">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm &&
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
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Print Type?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this print type? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>

                Cancel
              </button>
              <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>

                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      }

      <div className="orderTypeHeader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {editMode && onCancel &&
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>

                Back to List
              </button>
            }
            <div>
              <h2 className="orderTypeTitle">
                {editMode ? 'Edit Print Type' : 'Create Print Type'}
              </h2>
              <p className="orderTypeSubtitle">
                {editMode ?
                `Editing: ${printTypeData?.typeName || 'Print Type'}` :
                'Configure a new print type for your system'
                }
              </p>
            </div>
          </div>
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

      <div className="orderTypeFormGrid">
        {/* Basic Information Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Basic Information</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Name *</label>
                <FieldTooltip
                  content="Enter a descriptive name for this print type (e.g., Invoice Print, Label Print, Report Print)"
                  position="right" />

              </div>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="orderTypeFormInput"
                placeholder="e.g., Invoice Print"
                required />

            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Type Code *</label>
                <FieldTooltip
                  content="Short code for this print type (e.g., INV, LBL, RPT). Will be converted to uppercase."
                  position="right" />

              </div>
              <input
                type="text"
                value={typeCode}
                onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
                className="orderTypeFormInput"
                placeholder="e.g., INV"
                maxLength={10}
                required />

            </div>
          </div>

          <div className="orderTypeFormColumn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <label className="orderTypeInputLabel">Description</label>
              <FieldTooltip
                content="Optional description explaining when to use this print type"
                position="right" />

            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder="Describe when to use this print type..."
              rows={3} />

          </div>
        </div>

        {/* Print Configuration Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Print Configuration</h3>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Paper Size</label>
                <FieldTooltip
                  content="Select the paper size for printing"
                  position="right" />

              </div>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="orderTypeFormInput">

                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Orientation</label>
                <FieldTooltip
                  content="Select page orientation"
                  position="right" />

              </div>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="orderTypeFormInput">

                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          <div className="orderTypeFormRow">
            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Margins (mm)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#666' }}>Top</label>
                  <input
                    type="number"
                    value={margins.top}
                    onChange={(e) => setMargins({ ...margins, top: Number(e.target.value) })}
                    className="orderTypeFormInput"
                    min={0} />

                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#666' }}>Right</label>
                  <input
                    type="number"
                    value={margins.right}
                    onChange={(e) => setMargins({ ...margins, right: Number(e.target.value) })}
                    className="orderTypeFormInput"
                    min={0} />

                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#666' }}>Bottom</label>
                  <input
                    type="number"
                    value={margins.bottom}
                    onChange={(e) => setMargins({ ...margins, bottom: Number(e.target.value) })}
                    className="orderTypeFormInput"
                    min={0} />

                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#666' }}>Left</label>
                  <input
                    type="number"
                    value={margins.left}
                    onChange={(e) => setMargins({ ...margins, left: Number(e.target.value) })}
                    className="orderTypeFormInput"
                    min={0} />

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Order Types Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Linked Order Types</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
            <FieldTooltip
              content="Select which order types can use this print type. When an order is created with these order types, this print template will be available for printing."
              position="right" />

          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {linkedOrderTypes.length > 0 ?
              linkedOrderTypes.map((orderTypeId) => {
                const orderType = orderTypes.find((ot: any) => ot._id === orderTypeId);
                return orderType ?
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
                  }}>

                      <span>{orderType.name}</span>
                      <button
                    type="button"
                    onClick={() => setLinkedOrderTypes(linkedOrderTypes.filter((id) => id !== orderTypeId))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#1e40af',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '16px'
                    }}>

                        ×
                      </button>
                    </div> :
                null;
              }) :

              <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                  No order types selected. This print type will be available for all order types.
                </div>
              }
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
                }}>

                <option value="">-- Select Order Type --</option>
                {orderTypes.
                filter((ot: any) => !linkedOrderTypes.includes(ot._id)).
                map((ot: any) =>
                <option key={ot._id} value={ot._id}>
                      {ot.name} {ot.typeCode ? `(${ot.typeCode})` : ''}
                    </option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Template Configuration Section */}
        <div className="orderTypeSection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <h3 className="orderTypeSectionTitle" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
              Template Configuration
              <FieldTooltip
                content="Define HTML and CSS templates for header, body, and footer sections of the print output"
                position="right" />

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
                }}>

                📚 Template Library
              </button>
              <button
                type="button"
                onClick={exportTemplate}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}>

                ⬇ Export
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
                }}>

                ⬆ Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importTemplate}
                  style={{ display: 'none' }} />

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
                }}>

                {showPreview ? '✕ Close Preview' : '👁 Live Preview'}
              </button>
            </div>
          </div>

          {/* CSS Template */}
          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#8b5cf6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>CSS</span>
              CSS Styles
            </label>
            <textarea
              value={cssTemplate}
              onChange={(e) => setCssTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder={`/* Example CSS */
.print-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
.print-body { padding: 20px 0; }
.print-footer { text-align: center; border-top: 1px solid #ccc; padding-top: 10px; font-size: 12px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f5f5f5; }`}
              rows={8}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#1e1e1e', color: '#d4d4d4', border: '1px solid #333' }} />

          </div>

          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>HTML</span>
                Header Template
              </div>
              <button
                type="button"
                onClick={() => setActiveTemplateField(activeTemplateField === 'header' ? null : 'header')}
                style={{
                  padding: '4px 8px',
                  background: activeTemplateField === 'header' ? '#3b82f6' : '#e5e7eb',
                  color: activeTemplateField === 'header' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}>

                {activeTemplateField === 'header' ? '✓ Variables' : '+ Variables'}
              </button>
            </label>
            {activeTemplateField === 'header' &&
            <div style={{ marginBottom: '8px', padding: '8px', background: '#f0f9ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: '#1e40af' }}>Click to insert:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {['{{companyName}}', '{{companyAddress}}', '{{companyPhone}}', '{{orderNumber}}', '{{orderDate}}', '{{customerName}}'].map((v) =>
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v, 'header')}
                  style={{
                    padding: '3px 8px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    border: '1px solid #93c5fd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontFamily: 'monospace'
                  }}>

                      {v}
                    </button>
                )}
                </div>
              </div>
            }
            <textarea
              ref={headerRef}
              value={headerTemplate}
              onChange={(e) => setHeaderTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder={`<div class="print-header">
  <h1>Company Name</h1>
  <p>Address Line 1, City, State - PIN</p>
  <p>Phone: +91-XXXXXXXXXX | Email: info@company.com</p>
</div>`}
              rows={5}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#fefce8', border: '1px solid #eab308' }} />

          </div>

          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>HTML</span>
                Body Template
              </div>
              <button
                type="button"
                onClick={() => setActiveTemplateField(activeTemplateField === 'body' ? null : 'body')}
                style={{
                  padding: '4px 8px',
                  background: activeTemplateField === 'body' ? '#3b82f6' : '#e5e7eb',
                  color: activeTemplateField === 'body' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}>

                {activeTemplateField === 'body' ? '✓ Variables' : '+ Variables'}
              </button>
            </label>
            {activeTemplateField === 'body' &&
            <div style={{ marginBottom: '8px', padding: '8px', background: '#f0f9ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: '#1e40af' }}>Click to insert:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {['{{#items}}', '{{/items}}', '{{optionName}}', '{{optionType}}', '{{quantity}}', '{{dim.weight}}', '{{dim.rate}}', '{{amount}}', '{{subtotal}}', '{{grandTotal}}'].map((v) =>
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v, 'body')}
                  style={{
                    padding: '3px 8px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    border: '1px solid #93c5fd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontFamily: 'monospace'
                  }}>

                      {v}
                    </button>
                )}
                </div>
              </div>
            }
            <textarea
              ref={bodyRef}
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder={`<div class="print-body">
  <h2>Invoice / Bill</h2>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr>
        <td>{{optionName}}</td>
        <td>{{quantity}}</td>
        <td>{{dim.rate}}</td>
        <td>{{amount}}</td>
      </tr>
      {{/items}}
    </tbody>
  </table>
  <p><strong>Total: {{grandTotal}}</strong></p>
</div>`}
              rows={10}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#eff6ff', border: '1px solid #3b82f6' }} />

          </div>

          <div className="orderTypeFormColumn">
            <label className="orderTypeInputLabel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#f97316', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>HTML</span>
                Footer Template
              </div>
              <button
                type="button"
                onClick={() => setActiveTemplateField(activeTemplateField === 'footer' ? null : 'footer')}
                style={{
                  padding: '4px 8px',
                  background: activeTemplateField === 'footer' ? '#3b82f6' : '#e5e7eb',
                  color: activeTemplateField === 'footer' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}>

                {activeTemplateField === 'footer' ? '✓ Variables' : '+ Variables'}
              </button>
            </label>
            {activeTemplateField === 'footer' &&
            <div style={{ marginBottom: '8px', padding: '8px', background: '#f0f9ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: '#1e40af' }}>Click to insert:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {['{{orderNumber}}', '{{orderDate}}', '{{companyName}}', '{{companyPhone}}', '{{totalItems}}'].map((v) =>
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v, 'footer')}
                  style={{
                    padding: '3px 8px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    border: '1px solid #93c5fd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontFamily: 'monospace'
                  }}>

                      {v}
                    </button>
                )}
                </div>
              </div>
            }
            <textarea
              ref={footerRef}
              value={footerTemplate}
              onChange={(e) => setFooterTemplate(e.target.value)}
              className="orderTypeFormTextarea"
              placeholder={`<div class="print-footer">
  <p>Thank you for your business!</p>
  <p>Terms & Conditions Apply</p>
</div>`}
              rows={4}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#fff7ed', border: '1px solid #f97316' }} />

          </div>

          {/* Variable Reference */}
          <div style={{ marginTop: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1', marginBottom: '8px' }}>
              📝 Available Variables (use with {'{{variableName}}'})
            </div>

            {/* Order Variables */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Order Info:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                {['orderNumber', 'orderDate', 'orderType', 'orderStatus', 'customerName', 'customerAddress', 'customerPhone'].map((v) =>
                <code key={v} style={{ background: '#dbeafe', padding: '2px 8px', borderRadius: '4px', color: '#1e40af' }}>
                    {`{{${v}}}`}
                  </code>
                )}
              </div>
            </div>

            {/* Option Variables */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Option Info (per item):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                {['optionName', 'optionType', 'optionCode', 'optionDimensions'].map((v) =>
                <code key={v} style={{ background: '#d1fae5', padding: '2px 8px', borderRadius: '4px', color: '#065f46' }}>
                    {`{{${v}}}`}
                  </code>
                )}
              </div>
            </div>

            {/* Dimension Variables - Dynamic based on Option Type */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Dimension Variables (from Option):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                {['dim.mc_gram', 'dim.calculation', 'dim.wastage', 'dim.purity', 'dim.weight', 'dim.rate'].map((v) =>
                <code key={v} style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', color: '#92400e' }}>
                    {`{{${v}}}`}
                  </code>
                )}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                Use <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: '2px' }}>{'{{dim.YOUR_DIMENSION_NAME}}'}</code> for any dimension
              </div>
            </div>

            {/* Calculation Variables */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Totals & Calculations:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                {['subtotal', 'tax', 'discount', 'grandTotal', 'totalItems', 'totalQuantity'].map((v) =>
                <code key={v} style={{ background: '#fce7f3', padding: '2px 8px', borderRadius: '4px', color: '#9d174d' }}>
                    {`{{${v}}}`}
                  </code>
                )}
              </div>
            </div>

            {/* Loop Variables */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Loop through items:</div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace', background: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
                {'{{#items}}'}<br />
                {'  <tr><td>{{optionName}}</td><td>{{optionType}}</td><td>{{dim.weight}}</td></tr>'}<br />
                {'{{/items}}'}
              </div>
            </div>
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
            onClick={() => setShowTemplateLibrary(false)}>

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
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                color: 'white',
                borderRadius: '12px 12px 0 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '20px' }}>📚 Template Library</h2>
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
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>

                    ×
                  </button>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                  Choose a pre-built template to get started quickly
                </p>
              </div>

              {/* Template Grid */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {templateLibrary.map((template, index) =>
                  <div
                    key={index}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      ':hover': { borderColor: '#8b5cf6', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)' }
                    }}
                    onClick={() => loadTemplate(template)}>

                      <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0
                      }}>
                          📄
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                            {template.name}
                          </h3>
                          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                            {template.description}
                          </p>
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
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500
                      }}>

                        Use This Template
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Live Preview Popup Modal - Using Portal */}
        {showPreview && ReactDOM.createPortal(
          <div
            className="print-preview-modal-overlay"
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
              padding: '20px',
              boxSizing: 'border-box'
            }}
            onClick={() => setShowPreview(false)}>

            <div
              style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                width: '85vw',
                maxWidth: '850px',
                height: '85vh',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}>

              {/* Popup Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: 'white',
                flexShrink: 0
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Print Preview
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      // Generate print HTML
                      const sampleData = generateSampleData();
                      const header = useSampleData ? renderTemplate(headerTemplate, sampleData) : headerTemplate;
                      const body = useSampleData ? renderTemplate(bodyTemplate, sampleData) : bodyTemplate;
                      const footer = useSampleData ? renderTemplate(footerTemplate, sampleData) : footerTemplate;

                      const printHtml = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <meta charset="utf-8">
                          <title>Print Preview - ${typeName || 'Print Type'}</title>
                          <style>
                            @page {
                              size: ${paperSize} ${orientation};
                              margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
                            }
                            body {
                              font-family: Arial, sans-serif;
                              line-height: 1.5;
                              color: #333;
                              margin: 0;
                              padding: 20px;
                            }
                            ${cssTemplate}
                          </style>
                        </head>
                        <body>
                          ${header}
                          ${body}
                          ${footer}
                        </body>
                        </html>
                      `;

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

                        setTimeout(() => {
                          try {
                            printFrame.contentWindow?.focus();
                            printFrame.contentWindow?.print();
                          } catch (e) {

                          }
                          setTimeout(() => {
                            document.body.removeChild(printFrame);
                          }, 1000);
                        }, 250);
                      }
                    }}
                    style={{
                      padding: '6px 14px',
                      background: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}>

                    🖨️ Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    style={{
                      padding: '6px 14px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}>

                    Close
                  </button>
                </div>
              </div>

              {/* Popup Header Controls */}
              <div style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                borderBottom: '1px solid #d1d5db',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={useSampleData}
                    onChange={(e) => setUseSampleData(e.target.checked)} />

                  <span>Use Sample Data</span>
                </label>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                  {useSampleData ? '(Showing with sample values)' : '(Showing raw template)'}
                </span>
              </div>

              {/* Popup Body - Scrollable Paper */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                background: '#374151'
              }}>
                <div style={{
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  borderRadius: '2px',
                  width: '100%',
                  maxWidth: '700px',
                  minHeight: '500px',
                  padding: '30px',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  color: '#333'
                }}>
                  {/* CSS Styles - use style tag directly without DOMPurify for CSS */}
                  {cssTemplate && <style>{cssTemplate}</style>}

                  {/* Render templates */}
                  {(() => {
                    const sampleData = generateSampleData();
                    const headerHtml = useSampleData ? renderTemplate(headerTemplate, sampleData) : headerTemplate;
                    const bodyHtml = useSampleData ? renderTemplate(bodyTemplate, sampleData) : bodyTemplate;
                    const footerHtml = useSampleData ? renderTemplate(footerTemplate, sampleData) : footerTemplate;

                    return (
                      <>
                        {headerHtml &&
                        <div dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(headerHtml, {
                            ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 'img', 'a'],
                            ALLOWED_ATTR: ['style', 'class', 'id', 'src', 'href', 'alt', 'colspan', 'rowspan']
                          })
                        }} />
                        }
                        {bodyHtml &&
                        <div dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(bodyHtml, {
                            ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 'img', 'a'],
                            ALLOWED_ATTR: ['style', 'class', 'id', 'src', 'href', 'alt', 'colspan', 'rowspan']
                          })
                        }} />
                        }
                        {footerHtml &&
                        <div dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(footerHtml, {
                            ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 'img', 'a'],
                            ALLOWED_ATTR: ['style', 'class', 'id', 'src', 'href', 'alt', 'colspan', 'rowspan']
                          })
                        }} />
                        }
                        {!headerHtml && !bodyHtml && !footerHtml &&
                        <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>No template content</p>
                            <p style={{ fontSize: '12px' }}>Add HTML content to Header, Body, or Footer templates to see the preview.</p>
                          </div>
                        }
                      </>);

                  })()}
                </div>
              </div>

              {/* Popup Footer - Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                background: '#e5e7eb',
                borderTop: '1px solid #d1d5db',
                fontSize: '11px',
                color: '#6b7280',
                flexShrink: 0
              }}>
                <div>
                  Paper: <strong>{paperSize}</strong> | Orientation: <strong>{orientation}</strong>
                </div>
                <div>
                  Margins: {margins.top}mm / {margins.right}mm / {margins.bottom}mm / {margins.left}mm
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Global/Default Settings Section */}
        <div className="orderTypeSection">
          <h3 className="orderTypeSectionTitle">Advanced Settings</h3>

          <div className="orderTypeCheckboxGrid">
            {userRole === 'admin' &&
            <label className="orderTypeCheckboxLabel">
                <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => setIsGlobal(e.target.checked)} />

                <span>Global Print Type</span>
                <FieldTooltip
                content="Make this print type available across all branches"
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
                content="Make this the default print type when printing"
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
                  padding: '8px 16px',
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
                  padding: '8px 16px',
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
        <div className="orderTypeFormActions">
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
            className="orderTypeSaveButton"
            disabled={!typeName.trim() || !typeCode.trim()}>

            {editMode ? 'Update Print Type' : 'Create Print Type'}
          </ActionButton>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>);

};

export default CreatePrintType;