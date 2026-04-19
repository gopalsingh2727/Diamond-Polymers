import React, { useState, useEffect, useRef } from "react";
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
import HelpDocModal, { HelpButton } from "../../../../../components/shared/HelpDocModal";
import { printTypeHelp } from "../../../../../components/shared/helpContent";
import { uploadTemplateFile, deleteTemplateFile, UploadProgress } from "../../../../../services/firebaseStorage";
import "../orderType/orderType.css";

// ─── Template Variables Guide ─────────────────────────────────────────────────
const GUIDE_S = {
  wrap:    { background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', overflow: 'hidden', marginBottom: 16 } as React.CSSProperties,
  header:  { background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
  title:   { color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 } as React.CSSProperties,
  body:    { padding: '16px 18px', background: '#0f172a' } as React.CSSProperties,
  section: { marginBottom: 16 } as React.CSSProperties,
  sh:      { color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 } as React.CSSProperties,
  code:    { background: '#1e293b', borderRadius: 6, padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0', marginBottom: 8, whiteSpace: 'pre-wrap' as const, wordBreak: 'break-all' as const } as React.CSSProperties,
  tag:     { display: 'inline-block', background: '#312e81', color: '#c7d2fe', fontSize: 11, borderRadius: 4, padding: '2px 7px', margin: '2px 3px', fontFamily: 'monospace', border: '1px solid #4338ca' } as React.CSSProperties,
  note:    { fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.5 } as React.CSSProperties,
};

interface GuideSectionProps { title: string; children: React.ReactNode; defaultOpen?: boolean }
function GuideSection({ title, children, defaultOpen = false }: GuideSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8, border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', background: '#1e293b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setOpen(o => !o)}>
        <span style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 13 }}>{title}</span>
        <span style={{ color: '#64748b', fontSize: 16 }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && <div style={{ padding: '12px 14px', background: '#0f172a' }}>{children}</div>}
    </div>
  );
}

function PrintTemplateGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div style={GUIDE_S.wrap}>
      <div style={GUIDE_S.header} onClick={() => setOpen(o => !o)}>
        <div>
          <p style={GUIDE_S.title}>📋 Print Template Variables Reference</p>
          <p style={{ color: '#c4b5fd', fontSize: 12, margin: '4px 0 0 0' }}>All available {'{{variables}}'}, loops, and conditionals for your print templates</p>
        </div>
        <span style={{ color: '#fff', fontSize: 20 }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && (
        <div style={GUIDE_S.body}>

          <GuideSection title="Order Variables" defaultOpen>
            <div style={GUIDE_S.sh}>Basic Order Fields</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const }}>
              {['{{orderNumber}}','{{orderDate}}','{{orderStatus}}','{{orderType}}','{{grandTotal}}','{{subtotal}}','{{tax}}','{{discount}}','{{totalItems}}','{{totalQuantity}}','{{notes}}'].map(t => <span key={t} style={GUIDE_S.tag}>{t}</span>)}
            </div>
            <div style={GUIDE_S.note}>These come directly from the order document.</div>
          </GuideSection>

          <GuideSection title="Customer Variables">
            <div style={GUIDE_S.sh}>Customer / Bill-To Fields</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const }}>
              {['{{customerName}}','{{customerAddress}}','{{customerPhone}}','{{customerEmail}}','{{customerId}}'].map(t => <span key={t} style={GUIDE_S.tag}>{t}</span>)}
            </div>
          </GuideSection>

          <GuideSection title="Company Variables">
            <div style={GUIDE_S.sh}>Your Company / Branch Fields</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const }}>
              {['{{companyName}}','{{companyAddress}}','{{companyPhone}}','{{companyEmail}}','{{companyGST}}','{{branchName}}'].map(t => <span key={t} style={GUIDE_S.tag}>{t}</span>)}
            </div>
          </GuideSection>

          <GuideSection title="Items Loop — {{#items}}...{{/items}}">
            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Item Fields (inside the loop)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const }}>
              {['{{optionName}}','{{optionCode}}','{{optionType}}','{{quantity}}','{{amount}}','{{@index}}','{{dim.weight}}','{{dim.purity}}','{{dim.rate}}','{{dim.mc_gram}}','{{dim.calculation}}','{{dim.wastage}}'].map(t => <span key={t} style={GUIDE_S.tag}>{t}</span>)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 10 }}>Example</div>
            <div style={GUIDE_S.code}>{`{{#items}}
<tr>
  <td>{{@index}}</td>
  <td>{{optionName}}</td>
  <td>{{quantity}}</td>
  <td>{{dim.weight}}</td>
  <td style="text-align:right">{{amount}}</td>
</tr>
{{/items}}`}</div>
          </GuideSection>

          <GuideSection title="Conditional Blocks — {{#var}}...{{/var}}">
            <div style={GUIDE_S.note}>Show a block only when a value exists / is truthy.</div>
            <div style={GUIDE_S.code}>{`{{#customerAddress}}
<p>Ship To: {{customerAddress}}</p>
{{/customerAddress}}

{{#dim.weight}}
<p>Weight: {{dim.weight}}</p>
{{/dim.weight}}`}</div>
          </GuideSection>

          <GuideSection title="Full Invoice Example">
            <div style={GUIDE_S.code}>{`<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; }
  table { width:100%; border-collapse: collapse; }
  th { background:#1e40af; color:#fff; padding:8px; }
  td { border-bottom:1px solid #ddd; padding:8px; }
  .total { font-size:16px; font-weight:bold; text-align:right; }
</style>
</head>
<body>

<div class="print-header">
  <h1>{{companyName}}</h1>
  <p>{{companyAddress}} | {{companyPhone}}</p>
  <h2>INVOICE #{{orderNumber}}</h2>
</div>

<div class="print-body">
  <p><strong>Bill To:</strong> {{customerName}}, {{customerAddress}}</p>
  <p><strong>Date:</strong> {{orderDate}} | <strong>Status:</strong> {{orderStatus}}</p>

  <table>
    <thead>
      <tr><th>#</th><th>Item</th><th>Qty</th><th>Weight</th><th>Amount</th></tr>
    </thead>
    <tbody>
      {{#items}}
      <tr>
        <td>{{@index}}</td>
        <td>{{optionName}} ({{optionCode}})</td>
        <td>{{quantity}}</td>
        <td>{{dim.weight}}</td>
        <td>{{amount}}</td>
      </tr>
      {{/items}}
    </tbody>
  </table>

  <p class="total">Grand Total: {{grandTotal}}</p>
</div>

<div class="print-footer">
  <p style="text-align:center">Thank you for your business!</p>
</div>

</body>
</html>`}</div>
          </GuideSection>

          <GuideSection title="Upload Tips">
            <div style={GUIDE_S.note}>
              <strong style={{ color: '#94a3b8' }}>HTML Upload:</strong> Upload a full .html file — it gets stored in Firebase Storage (not MongoDB), so there's no size limit or billing impact.<br/><br/>
              <strong style={{ color: '#94a3b8' }}>Section Detection:</strong> The parser looks for elements with class <code style={{ color: '#c7d2fe' }}>.print-header</code>, <code style={{ color: '#c7d2fe' }}>.print-body</code>, <code style={{ color: '#c7d2fe' }}>.print-footer</code>, or HTML5 <code style={{ color: '#c7d2fe' }}>&lt;header&gt;</code> / <code style={{ color: '#c7d2fe' }}>&lt;main&gt;</code> / <code style={{ color: '#c7d2fe' }}>&lt;footer&gt;</code> tags.<br/><br/>
              <strong style={{ color: '#94a3b8' }}>Style tags:</strong> All <code style={{ color: '#c7d2fe' }}>&lt;style&gt;</code> blocks are extracted into the CSS field automatically.
            </div>
          </GuideSection>

        </div>
      )}
    </div>
  );
}

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

  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Linked Order Types
  const [linkedOrderTypes, setLinkedOrderTypes] = useState<string[]>([]);

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // HTML upload & template library
  const [isUploadingHtml, setIsUploadingHtml] = useState(false);
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState("");
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [useSampleData, setUseSampleData] = useState(true);
  const htmlFileRef = useRef<HTMLInputElement>(null);

  // Firebase Storage state
  const [firebaseFileUrl,  setFirebaseFileUrl]  = useState("");
  const [firebaseFileType, setFirebaseFileType] = useState<'html' | 'build' | ''>("");
  const [firebaseFileName, setFirebaseFileName] = useState("");
  const [firebaseFileSize, setFirebaseFileSize] = useState(0);
  const [uploadPct,        setUploadPct]        = useState(0);

  const useFirebaseFile = !!firebaseFileUrl;

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
        dim: { mc_gram: "50", calculation: "5000", wastage: "250", purity: "98%", weight: "5 kg", rate: "₹10.00" },
        amount: "₹1,000.00"
      },
      {
        optionName: "Standard Printing Ink",
        optionType: "Material",
        optionCode: "SPI-002",
        quantity: 50,
        dim: { mc_gram: "25", calculation: "1250", wastage: "125", purity: "95%", weight: "1.25 kg", rate: "₹25.00" },
        amount: "₹1,250.00"
      },
      {
        optionName: "Custom Label",
        optionType: "Printing",
        optionCode: "CL-003",
        quantity: 200,
        dim: { weight: "2 kg", rate: "₹5.00" },
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
        itemRendered = itemRendered.replace(/\{\{@index\}\}/g, String(index + 1));
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

  // Upload HTML file — parses sections for preview AND uploads full file to Firebase
  const handleHtmlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'html' && ext !== 'htm') {
      toast.error('Invalid File', 'Please select an .html or .htm file');
      if (htmlFileRef.current) htmlFileRef.current.value = '';
      return;
    }

    setIsUploadingHtml(true);
    setUploadPct(0);
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });

      // Parse the HTML to extract sections (for preview only)
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      const styleTags = doc.querySelectorAll('style');
      let extractedCss = '';
      styleTags.forEach(tag => { extractedCss += tag.textContent + '\n'; });

      const headerEl = doc.querySelector('.print-header, header, [data-section="header"]');
      const footerEl = doc.querySelector('.print-footer, footer, [data-section="footer"]');
      const bodyEl   = doc.querySelector('.print-body, main, [data-section="body"]');

      if (headerEl || bodyEl || footerEl) {
        if (headerEl) setHeaderTemplate(headerEl.outerHTML);
        if (bodyEl)   setBodyTemplate(bodyEl.outerHTML);
        if (footerEl) setFooterTemplate(footerEl.outerHTML);
      } else {
        const bodyContent = doc.body?.innerHTML || content;
        setBodyTemplate(bodyContent.trim());
        setHeaderTemplate('');
        setFooterTemplate('');
      }
      if (extractedCss.trim()) setCssTemplate(extractedCss.trim());

      setUploadedHtmlFile(file.name);

      // Upload full file to Firebase Storage
      if (firebaseFileUrl) {
        try { await deleteTemplateFile(firebaseFileUrl); } catch (_) {}
      }
      const result = await uploadTemplateFile(
        content, file.name, 'html',
        (p: UploadProgress) => setUploadPct(p.pct),
        'v2/print-type/upload-url',
      );
      setFirebaseFileUrl(result.downloadUrl);
      setFirebaseFileType('html');
      setFirebaseFileName(result.fileName);
      setFirebaseFileSize(result.fileSize);
      setUploadPct(100);

      toast.success('HTML Uploaded', `${file.name} saved to Firebase Storage`);
      if (!showPreview) setShowPreview(true);
    } catch (err: any) {
      toast.error('Upload Error', err?.message || 'Could not upload the HTML file');
      setUploadPct(0);
    } finally {
      setIsUploadingHtml(false);
      if (htmlFileRef.current) htmlFileRef.current.value = '';
    }
  };

  // Remove Firebase file
  const handleClearFirebaseFile = async () => {
    if (firebaseFileUrl) {
      try { await deleteTemplateFile(firebaseFileUrl); } catch (_) {}
    }
    setFirebaseFileUrl('');
    setFirebaseFileType('');
    setFirebaseFileName('');
    setFirebaseFileSize(0);
    setUploadPct(0);
    setUploadedHtmlFile('');
    setHeaderTemplate('');
    setBodyTemplate('');
    setFooterTemplate('');
    setCssTemplate('');
    toast.success('Cleared', 'Firebase file removed');
  };

  // Load template from library
  const loadTemplate = (template: typeof templateLibrary[0]) => {
    setHeaderTemplate(template.headerTemplate);
    setBodyTemplate(template.bodyTemplate);
    setFooterTemplate(template.footerTemplate);
    setCssTemplate(template.cssTemplate);
    setShowTemplateLibrary(false);
    setUploadedHtmlFile('');
    toast.success('Template Loaded', `"${template.name}" has been loaded successfully`);
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

      // Firebase Storage metadata
      if (printTypeData.fileUrl) {
        setFirebaseFileUrl(printTypeData.fileUrl);
        setFirebaseFileType(printTypeData.fileType || '');
        setFirebaseFileName(printTypeData.fileName || '');
        setFirebaseFileSize(printTypeData.fileSize || 0);
      }

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

    // Build print type data
    const branchId = localStorage.getItem('selectedBranch') || '';
    const dataToSave: Record<string, any> = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      paperSize,
      orientation,
      margins,
      // If Firebase file exists, clear inline templates to save MongoDB billing
      headerTemplate: useFirebaseFile ? '' : headerTemplate,
      bodyTemplate:   useFirebaseFile ? '' : bodyTemplate,
      footerTemplate: useFirebaseFile ? '' : footerTemplate,
      cssTemplate:    useFirebaseFile ? '' : cssTemplate,
      // Firebase Storage file metadata
      fileUrl:   firebaseFileUrl  || '',
      fileType:  firebaseFileType || '',
      fileName:  firebaseFileName || '',
      fileSize:  firebaseFileSize || 0,
      linkedOrderTypes,
      branchId,
      isGlobal,
      isDefault,
      isActive
    };

    if (editMode && printTypeId) {
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
      handleSave(
        () => dispatch(createPrintType(dataToSave)),
        {
          successMessage: "Print type created successfully!",
          onSuccess: () => {
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
            setUploadedHtmlFile("");
            setFirebaseFileUrl("");
            setFirebaseFileType("");
            setFirebaseFileName("");
            setFirebaseFileSize(0);
            setUploadPct(0);
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

  const hasTemplateContent = !!(firebaseFileUrl || headerTemplate || bodyTemplate || footerTemplate);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              {!editMode && <HelpButton onClick={() => setShowHelpModal(true)} size="medium" />}
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
                <FieldTooltip content="Select the paper size for printing" position="right" />
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
                <FieldTooltip content="Select page orientation" position="right" />
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

        {/* Template Variables Guide */}
        <PrintTemplateGuide />

        {/* Template Section — Upload HTML + Template Library + Preview */}
        <div className="orderTypeSection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <h3 className="orderTypeSectionTitle" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
              Template
              <FieldTooltip
                content="Upload an HTML file (saved to Firebase Storage) or choose a pre-built template from the library"
                position="right" />
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Upload HTML Button */}
              <input
                ref={htmlFileRef}
                type="file"
                accept=".html,.htm"
                onChange={handleHtmlFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                disabled={isUploadingHtml}
                onClick={() => htmlFileRef.current?.click()}
                style={{
                  padding: '8px 16px',
                  background: '#d97706',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isUploadingHtml ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  opacity: isUploadingHtml ? 0.7 : 1
                }}>
                {isUploadingHtml ? `Uploading ${uploadPct}%…` : 'Upload HTML'}
              </button>

              {/* Template Library Button */}
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
                Template Library
              </button>

              {/* Preview Button */}
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
                {showPreview ? 'Close Preview' : 'Live Preview'}
              </button>
            </div>
          </div>

          {/* Upload progress bar */}
          {isUploadingHtml && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadPct}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: 3, transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Uploading to Firebase Storage… {uploadPct}%</div>
            </div>
          )}

          {/* Firebase file saved banner */}
          {useFirebaseFile && !isUploadingHtml && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, marginBottom: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>Firebase file saved</div>
                <div style={{ fontSize: 11, color: '#15803d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {firebaseFileName} {firebaseFileSize ? `(${(firebaseFileSize / 1024).toFixed(1)} KB)` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearFirebaseFile}
                style={{ padding: '4px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, flexShrink: 0 }}>
                Remove
              </button>
            </div>
          )}

          {/* Show loaded source badge (non-Firebase parsed file) */}
          {uploadedHtmlFile && !useFirebaseFile &&
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: 12, color: '#92400e', fontWeight: 600,
                padding: '6px 12px', background: '#fef3c7', borderRadius: 6,
                border: '1px solid #fcd34d',
              }}>
                HTML: {uploadedHtmlFile}
              </span>
              <button
                type="button"
                onClick={() => {
                  setUploadedHtmlFile('');
                  setHeaderTemplate('');
                  setBodyTemplate('');
                  setFooterTemplate('');
                  setCssTemplate('');
                  toast.success('Cleared', 'HTML file removed');
                }}
                style={{
                  padding: '4px 10px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}>
                Clear
              </button>
            </div>
          }

          {/* Template status */}
          {hasTemplateContent ?
          <div style={{
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#166534'
          }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
              </svg>
              <span>
                Template loaded
                {useFirebaseFile ? ' — Firebase file' : ''}
                {!useFirebaseFile && headerTemplate ? ' — Header' : ''}
                {!useFirebaseFile && bodyTemplate ? ' — Body' : ''}
                {!useFirebaseFile && footerTemplate ? ' — Footer' : ''}
                {cssTemplate ? ' — CSS' : ''}
              </span>
            </div> :

          <div style={{
            padding: '16px',
            background: '#f9fafb',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '13px'
          }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>No template loaded</p>
              <p style={{ margin: 0, fontSize: '12px' }}>
                Upload an HTML file or select a template from the library to get started.
              </p>
            </div>
          }
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
                  <h2 style={{ margin: 0, fontSize: '20px' }}>Template Library</h2>
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
                      transition: 'all 0.2s'
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
                        fontSize: '20px',
                        color: 'white',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                          {template.name.charAt(0)}
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

        {/* Live Preview Popup Modal */}
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
                            // Print failed silently
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
                    Print
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

              {/* Sample Data Toggle */}
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
                  {cssTemplate && <style>{cssTemplate}</style>}

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
                            <p style={{ fontSize: '12px' }}>Upload an HTML file or select a template from the library.</p>
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

      <HelpDocModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        content={printTypeHelp}
      />

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>);

};

export default CreatePrintType;
