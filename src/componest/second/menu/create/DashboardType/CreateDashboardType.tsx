import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createDashboardTypeV2 as createDashboardType,
  updateDashboardTypeV2 as updateDashboardType,
  deleteDashboardTypeV2 as deleteDashboardType,
} from "../../../../redux/dashbroadtype/dashboardTypeActions";
import { AppDispatch } from "../../../../../store";
import DashboardTemplateLibrary, { DASHBOARD_TEMPLATE_LIBRARY } from "./DashboardTemplateLibrary";
import './reporttype.css';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface CreateDashboardTypeProps {
  initialData?:   any;
  onCancel?:      () => void;
  onSaveSuccess?: () => void;
}

// ─────────────────────────────────────────────
// useSaveState — tracks save lifecycle
// ─────────────────────────────────────────────
const useSaveState = () => {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const save = async (fn: () => Promise<void>, { onSuccess }: { onSuccess?: () => void } = {}) => {
    setState("saving");
    try {
      await fn();
      setState("saved");
      onSuccess?.();
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };
  return { state, save };
};

// ─────────────────────────────────────────────
// Sample data for live preview
// ─────────────────────────────────────────────
const SAMPLE_DATA = {
  companyName: "ABC Manufacturing Co.",
  companyAddress: "Plot 7, MIDC Industrial Area, Pune - 411019",
  companyPhone: "+91-20-1234 5678",
  companyEmail: "info@abcmfg.com",
  branchName: "Pune Main Branch",
  branchCode: "PUN",
  generatedAt: new Date().toLocaleDateString("en-IN"),
  generatedTime: new Date().toLocaleTimeString("en-IN"),
  dateFrom: "01/01/2025",
  dateTo: "31/01/2025",
  periodLabel: "January 2025",
  totalOrders: 148,
  pendingOrders: 23,
  inProgressOrders: 41,
  completedOrders: 76,
  cancelledOrders: 8,
  dispatchedOrders: 34,
  approvedOrders: 112,
  totalRevenue: "₹42,86,500.00",
  pendingRevenue: "₹8,12,400.00",
  completedRevenue: "₹34,74,100.00",
  avgOrderValue: "₹28,962.00",
  totalItems: 892,
  totalQuantity: 14650,
  onTimeDeliveryRate: "87%",
  avgCompletionDays: 4.2,
  sameDayDispatchCount: 18,
  completedSteps: 342,
  pendingSteps: 108,
  inProgressSteps: 56,
  urgentOrders: 12,
  highOrders: 55,
  normalOrders: 71,
  lowOrders: 10,
  totalCustomers: 64,
  newCustomers: 11,
  repeatCustomers: 53,
  topCustomer: "Rajesh Kumar Jewellers",
  totalMixBatches: 28,
  avgMixTime: 42,
  avgTemperature: 868,
  grandTotal: "₹45,92,400.00",
  totalSilverValue: "₹38,14,200.00",
  totalMCAmount: "₹4,82,600.00",
  totalWastageAmount: "₹1,22,800.00",
  totalGrossWeight: "1,248.50",
  totalPureWeight: "998.80",
  totalPieces: 342,
  subtotal: "₹44,19,600.00",
  taxableAmount: "₹44,31,570.00",
  taxAmount: "₹1,32,947.00",
  taxRate: "3",
  displayRate: "₹36,776/g",
  hmChargesAmount: "₹11,970.00",
  hmRatePerPiece: "35",
  hmTotalPieces: 342,
  internalOrders: 94,
  apiOrders: 28,
  websiteOrders: 18,
  mobileOrders: 8,
  forwardedOrders: 0,
  productOptionCount: 186,
  materialOptionCount: 97,
  printingOptionCount: 43,
  packagingOptionCount: 22,
  categoryBreakdown: [
    { categoryName: "Product",   count: 58, percentage: "39.2%", revenue: "₹22,14,200.00" },
    { categoryName: "Material",  count: 47, percentage: "31.8%", revenue: "₹12,08,300.00" },
    { categoryName: "Printing",  count: 28, percentage: "18.9%", revenue: "₹5,32,000.00"  },
    { categoryName: "Packaging", count: 15, percentage: "10.1%", revenue: "₹3,32,000.00"  },
  ],
  topOrders: [
    { orderId: "ORD-PUN-250101-001", customerName: "Rajesh Kumar Jewellers", orderTypeName: "Manufacturing", totalAmount: "₹2,06,772.00", overallStatus: "completed",   priority: "high"   },
    { orderId: "ORD-PUN-250108-012", customerName: "Mehta Gold Works",        orderTypeName: "Work Order",   totalAmount: "₹1,84,500.00", overallStatus: "in-progress", priority: "urgent" },
    { orderId: "ORD-PUN-250115-031", customerName: "Shah Silver House",       orderTypeName: "Manufacturing", totalAmount: "₹1,52,000.00", overallStatus: "approved",    priority: "high"   },
    { orderId: "ORD-PUN-250120-044", customerName: "Patel Jewels Pvt Ltd",    orderTypeName: "Work Order",   totalAmount: "₹1,21,300.00", overallStatus: "pending",     priority: "normal" },
    { orderId: "ORD-PUN-250125-058", customerName: "Kumar & Sons",            orderTypeName: "Manufacturing", totalAmount: "₹98,400.00",  overallStatus: "dispatched",  priority: "high"   },
  ],
  stepPerformance: [
    { stepName: "Design Approval",  completedCount: 98, avgDays: 0.8 },
    { stepName: "Melting",          completedCount: 86, avgDays: 1.2 },
    { stepName: "Rolling",          completedCount: 80, avgDays: 0.9 },
    { stepName: "Filing & Shaping", completedCount: 76, avgDays: 1.5 },
    { stepName: "Polishing",        completedCount: 72, avgDays: 1.1 },
    { stepName: "QC Check",         completedCount: 76, avgDays: 0.7 },
  ],
};

// ─────────────────────────────────────────────
// Template renderer (Handlebars-like)
// ─────────────────────────────────────────────
function renderTemplate(tpl: string, data: any): string {
  if (!tpl) return "";
  let out = tpl;
  const resolve = (obj: any, path: string) =>
    path.trim().split(".").reduce((o: any, k) => o?.[k], obj);

  out = out.replace(/\{\{([^#\/][^}]+)\}\}/g, (m, key) => {
    const val = resolve(data, key);
    return val != null ? String(val) : m;
  });

  const LOOP_ARRAYS = ["categoryBreakdown", "topOrders", "stepPerformance", "rows"];
  for (const arrayKey of LOOP_ARRAYS) {
    const re = new RegExp(`\\{\\{#${arrayKey}\\}\\}([\\s\\S]*?)\\{\\{\\/${arrayKey}\\}\\}`, "g");
    out = out.replace(re, (_: string, itemTpl: string) => {
      const arr = resolve(data, arrayKey);
      if (!Array.isArray(arr)) return "";
      return arr.map((item: any, i: number) => {
        let r = itemTpl.replace(/\{\{@index\}\}/g, String(i + 1));
        r = r.replace(/\{\{([^}]+)\}\}/g, (m2: string, k: string) => {
          const v = resolve(item, k);
          return v != null ? String(v) : m2;
        });
        return r;
      }).join("");
    });
  }

  out = out.replace(
    /\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_: string, key: string, content: string) => (resolve(data, key) ? content : "")
  );
  return out;
}

// ─────────────────────────────────────────────
// Variable Groups
// ─────────────────────────────────────────────
const VAR_GROUPS: Record<string, string[]> = {
  "🏢 Company / Branch": [
    "{{companyName}}", "{{companyAddress}}", "{{companyPhone}}", "{{companyEmail}}",
    "{{branchName}}", "{{branchCode}}", "{{generatedAt}}", "{{generatedTime}}",
  ],
  "📅 Period / Date Range": ["{{dateFrom}}", "{{dateTo}}", "{{periodLabel}}"],
  "📦 Orders Summary": [
    "{{totalOrders}}", "{{pendingOrders}}", "{{inProgressOrders}}",
    "{{completedOrders}}", "{{cancelledOrders}}", "{{dispatchedOrders}}", "{{approvedOrders}}",
  ],
  "💰 Revenue": [
    "{{totalRevenue}}", "{{pendingRevenue}}", "{{completedRevenue}}", "{{avgOrderValue}}",
  ],
  "⚙️ Production KPIs": [
    "{{totalItems}}", "{{totalQuantity}}", "{{onTimeDeliveryRate}}",
    "{{avgCompletionDays}}", "{{sameDayDispatchCount}}", "{{completedSteps}}",
    "{{pendingSteps}}", "{{inProgressSteps}}",
  ],
  "🔥 Priority Breakdown": [
    "{{urgentOrders}}", "{{highOrders}}", "{{normalOrders}}", "{{lowOrders}}",
  ],
  "👤 Customers": [
    "{{totalCustomers}}", "{{newCustomers}}", "{{repeatCustomers}}", "{{topCustomer}}",
  ],
  "⚗️ Mix / Material": [
    "{{totalMixBatches}}", "{{avgMixTime}}", "{{avgTemperature}}",
  ],
  "🔁 Category Breakdown Loop": [
    "{{#categoryBreakdown}}", "{{/categoryBreakdown}}", "{{@index}}",
    "{{categoryName}}", "{{count}}", "{{percentage}}", "{{revenue}}",
  ],
  "📋 Top Orders Loop": [
    "{{#topOrders}}", "{{/topOrders}}", "{{@index}}",
    "{{orderId}}", "{{customerName}}", "{{orderTypeName}}",
    "{{totalAmount}}", "{{overallStatus}}", "{{priority}}",
  ],
  "🧾 Billing Calculations": [
    "{{grandTotal}}", "{{totalSilverValue}}", "{{totalMCAmount}}", "{{totalWastageAmount}}",
    "{{totalGrossWeight}}", "{{totalPureWeight}}", "{{totalPieces}}", "{{subtotal}}",
    "{{taxableAmount}}", "{{taxAmount}}", "{{taxRate}}", "{{displayRate}}",
    "{{hmChargesAmount}}", "{{hmRatePerPiece}}", "{{hmTotalPieces}}",
  ],
  "🌐 Order Source Tracking": [
    "{{internalOrders}}", "{{apiOrders}}", "{{websiteOrders}}",
    "{{mobileOrders}}", "{{forwardedOrders}}",
  ],
  "🗂️ Options Category Counts": [
    "{{productOptionCount}}", "{{materialOptionCount}}",
    "{{printingOptionCount}}", "{{packagingOptionCount}}",
  ],
  "🔩 Step Performance Loop": [
    "{{#stepPerformance}}", "{{/stepPerformance}}", "{{@index}}",
    "{{stepName}}", "{{completedCount}}", "{{avgDays}}",
  ],
};

// ─────────────────────────────────────────────
// Variable Pills
// ─────────────────────────────────────────────
function VariablePills({ onInsert }: { onInsert: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 10 }}>
      <button type="button" className="reporttype-var-toggle-btn" onClick={() => setOpen(!open)}>
        {open ? "▲ Hide Variables" : "▼ Insert Variable"}
      </button>
      {open && (
        <div className="reporttype-var-panel">
          {Object.entries(VAR_GROUPS).map(([group, vars]) => (
            <div key={group}>
              <div className="reporttype-var-group-label">{group}</div>
              <div className="reporttype-var-pills-row">
                {vars.map((v) => (
                  <button key={v} type="button" className="reporttype-var-pill" onClick={() => onInsert(v)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Toast Hook + Component
// ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<any[]>([]);
  const add = (type: string, title: string, message?: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, title, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  return {
    toasts,
    remove:  (id: number) => setToasts((p) => p.filter((t) => t.id !== id)),
    success: (title: string, msg?: string) => add("success", title, msg),
    error:   (title: string, msg?: string) => add("error",   title, msg),
    warning: (title: string, msg?: string) => add("warning", title, msg),
  };
}

function Toast({ toasts, remove }: { toasts: any[]; remove: (id: number) => void }) {
  const bgMap: Record<string, string> = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b" };
  return ReactDOM.createPortal(
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map((t) => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          pointerEvents: "all", background: bgMap[t.type] || "#374151",
          color: "#fff", padding: "10px 16px", borderRadius: 8, minWidth: 240, maxWidth: 360,
          boxShadow: "0 4px 16px rgba(0,0,0,.25)", cursor: "pointer", fontSize: 13, fontFamily: "system-ui,sans-serif",
        }}>
          <div style={{ fontWeight: 700 }}>{t.title}</div>
          {t.message && <div style={{ fontSize: 11, marginTop: 2, opacity: .9 }}>{t.message}</div>}
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────
// Code Editor (HTML / CSS / JS textarea)
// ─────────────────────────────────────────────
function CodeEditor({
  label, language = "html", value, onChange,
  rows = 8, placeholder, hint, textareaRef,
}: {
  label: string; language?: "html" | "css" | "js"; value: string;
  onChange: (v: string) => void; rows?: number; placeholder?: string;
  hint?: string; textareaRef?: React.RefObject<HTMLTextAreaElement>;
}) {
  const badgeMap = { html: "HTML", css: "CSS", js: "JS" };
  return (
    <div className="reporttype-code-editor-wrap">
      <div className="reporttype-code-editor-label-row">
        <span className={`reporttype-code-badge reporttype-code-badge-${language}`}>{badgeMap[language]}</span>
        <span className="reporttype-code-label">{label}</span>
        {hint && <span className="reporttype-code-hint">{hint}</span>}
      </div>
      <textarea
        ref={textareaRef} value={value} onChange={(e) => onChange(e.target.value)}
        rows={rows} placeholder={placeholder} spellCheck={false}
        className={`reporttype-code-textarea reporttype-code-textarea-${language}`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────
const TABS = [
  { id: "info",      label: "📋 Basic Info" },
  { id: "templates", label: "🖊️ Templates"  },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const CreateDashboardType = ({
  initialData: propInitialData,
  onCancel,
  onSaveSuccess,
}: CreateDashboardTypeProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const toast    = useToast();
  const { state: saveState, save: handleSave } = useSaveState();

  // ── Edit mode — supports props OR router location.state ──
  const { dashboardTypeData: locationData, isEdit } = (location.state || {}) as any;
  const dashboardTypeData = propInitialData || locationData;
  const editMode          = Boolean(propInitialData || isEdit || dashboardTypeData?._id);
  const dashboardTypeId   = dashboardTypeData?._id;

  // ── Basic Info ────────────────────────────
  const [typeName,    setTypeName]    = useState("");
  const [typeCode,    setTypeCode]    = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("analytics");

  // ── Template Code ─────────────────────────
  const [htmlHeader, setHtmlHeader] = useState("");
  const [htmlBody,   setHtmlBody]   = useState("");
  const [htmlFooter, setHtmlFooter] = useState("");
  const [css,        setCss]        = useState("");
  const [js,         setJs]         = useState("");

  // ── UI State ──────────────────────────────
  const [activeTab,         setActiveTab]         = useState("info");
  const [showPreview,       setShowPreview]       = useState(false);
  const [useSampleData,     setUseSampleData]     = useState(true);
  const [showLibrary,       setShowLibrary]       = useState(false);
  const [activeInsertField, setActiveInsertField] = useState<string | null>(null);

  // ── Delete state ──────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting,        setIsDeleting]        = useState(false);

  // ── Refs ──────────────────────────────────
  const headerRef     = useRef<HTMLTextAreaElement>(null);
  const bodyRef       = useRef<HTMLTextAreaElement>(null);
  const footerRef     = useRef<HTMLTextAreaElement>(null);
  const cssRef        = useRef<HTMLTextAreaElement>(null);
  const jsRef         = useRef<HTMLTextAreaElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  // ── Load existing data on mount ───────────
  useEffect(() => {
    if (editMode && dashboardTypeData) {
      setTypeName(dashboardTypeData.typeName    || "");
      setTypeCode(dashboardTypeData.typeCode    || "");
      setDescription(dashboardTypeData.description || "");
      setCategory(dashboardTypeData.category    || "analytics");
      setHtmlHeader(dashboardTypeData.htmlHeader  || "");
      setHtmlBody(dashboardTypeData.htmlBody    || "");
      setHtmlFooter(dashboardTypeData.htmlFooter  || "");
      setCss(dashboardTypeData.css           || "");
      setJs(dashboardTypeData.js            || "");
    }
  }, [editMode, dashboardTypeData]);

  // ── ESC key: close modals in priority order ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (showPreview)       { setShowPreview(false);                                return; }
    if (showDeleteConfirm) { setShowDeleteConfirm(false); setDeleteConfirmText(""); return; }
    if (showLibrary)       { setShowLibrary(false);                                return; }
  }, [showPreview, showDeleteConfirm, showLibrary]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Cursor-aware variable insertion ───────
  const insertAtCursor = (text: string, field: string) => {
    const refMap: Record<string, React.RefObject<HTMLTextAreaElement>> = {
      header: headerRef, body: bodyRef, footer: footerRef, css: cssRef, js: jsRef,
    };
    const setMap: Record<string, (v: string) => void> = {
      header: setHtmlHeader, body: setHtmlBody, footer: setHtmlFooter, css: setCss, js: setJs,
    };
    const el = refMap[field]?.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const newVal = el.value.slice(0, s) + text + el.value.slice(e);
    setMap[field](newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + text.length, s + text.length); }, 0);
  };

  // ── Template library ─────────────────────
  const handleSelectTemplate = (tpl: (typeof DASHBOARD_TEMPLATE_LIBRARY)[number]) => {
    setHtmlHeader(tpl.htmlHeader);
    setHtmlBody(tpl.htmlBody);
    setHtmlFooter(tpl.htmlFooter);
    setCss(tpl.css);
    setJs(tpl.js);
    setShowLibrary(false);
    setActiveTab("templates");
    toast.success("Template Loaded", `"${tpl.name}" applied`);
  };

  // ── Build full HTML for preview / print ───
  const buildFullHtml = (withSampleData = false) => {
    const data   = withSampleData ? SAMPLE_DATA : {};
    const header = withSampleData ? renderTemplate(htmlHeader, data) : htmlHeader;
    const body   = withSampleData ? renderTemplate(htmlBody,   data) : htmlBody;
    const footer = withSampleData ? renderTemplate(htmlFooter, data) : htmlFooter;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${typeName || "Dashboard"}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 0; }
${css}
  </style>
</head>
<body>
${header}
${body}
${footer}
<script>
${js}
</script>
</body>
</html>`;
  };

  // ── Export template as JSON ───────────────
  const handleExportJSON = () => {
    const payload = {
      typeName, typeCode, description, category,
      htmlHeader, htmlBody, htmlFooter, css, js,
      exportedAt: new Date().toISOString(), version: "1.0",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `dashboard-template-${typeCode || "export"}-${Date.now()}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success("Exported", "Template saved as JSON");
  };

  // ── Import template from JSON ─────────────
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target?.result as string);
        if (d.typeName)              setTypeName(d.typeName);
        if (d.typeCode)              setTypeCode(d.typeCode);
        if (d.description)           setDescription(d.description);
        if (d.category)              setCategory(d.category);
        if (d.htmlHeader !== undefined) setHtmlHeader(d.htmlHeader);
        if (d.htmlBody   !== undefined) setHtmlBody(d.htmlBody);
        if (d.htmlFooter !== undefined) setHtmlFooter(d.htmlFooter);
        if (d.css        !== undefined) setCss(d.css);
        if (d.js         !== undefined) setJs(d.js);
        setActiveTab("templates");
        toast.success("Imported", "Template loaded from JSON");
      } catch {
        toast.error("Import Failed", "Invalid or corrupt JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Print via hidden iframe ───────────────
  const handlePrint = () => {
    const frame = printFrameRef.current;
    if (!frame) return;
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(buildFullHtml(useSampleData)); doc.close();
    setTimeout(() => {
      try { frame.contentWindow?.focus(); frame.contentWindow?.print(); }
      catch { toast.error("Print Error", "Could not open print dialog"); }
    }, 350);
  };

  // ── Submit → Redux create / update ───────
  const handleSubmit = () => {
    if (!typeName.trim() || !typeCode.trim()) {
      toast.error("Validation", "Dashboard Name and Code are required");
      return;
    }
    if (!htmlHeader.trim() && !htmlBody.trim() && !htmlFooter.trim()) {
      toast.error("Validation", "At least one HTML section must have content");
      return;
    }

    const branchId   = localStorage.getItem("selectedBranch") || "";
    const dataToSave = {
      typeName, typeCode: typeCode.toUpperCase(), description, category,
      htmlHeader, htmlBody, htmlFooter, css, js, branchId,
    };

    if (editMode && dashboardTypeId) {
      // ── UPDATE ──────────────────────────────
      handleSave(
        () => dispatch(updateDashboardType(dashboardTypeId, dataToSave)) as unknown as Promise<void>,
        {
          onSuccess: () => {
            toast.success("Updated", "Dashboard type updated successfully");
            setTimeout(() => { if (onSaveSuccess) onSaveSuccess(); else navigate(-1); }, 1500);
          },
        }
      );
    } else {
      // ── CREATE ──────────────────────────────
      handleSave(
        () => dispatch(createDashboardType(dataToSave)) as unknown as Promise<void>,
        {
          onSuccess: () => {
            toast.success("Created", "Dashboard type created successfully");
            setTypeName(""); setTypeCode(""); setDescription(""); setCategory("analytics");
            setHtmlHeader(""); setHtmlBody(""); setHtmlFooter(""); setCss(""); setJs("");
          },
        }
      );
    }
  };

  // ── Delete → Redux delete ─────────────────
  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== typeName.trim().toLowerCase()) {
      toast.error("Name Mismatch", `Type "${typeName}" to confirm deletion`);
      return;
    }
    if (!dashboardTypeId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteDashboardType(dashboardTypeId));
      toast.success("Deleted", `"${typeName}" has been deleted`);
      setShowDeleteConfirm(false);
      setTimeout(() => { if (onSaveSuccess) onSaveSuccess(); else navigate(-1); }, 1000);
    } catch {
      toast.error("Delete Failed", "Something went wrong — please try again");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── HTML section editor helper ─────────────
  const renderHtmlSection = (
    sectionKey: string, label: string, value: string,
    onChange: (v: string) => void, ref: React.RefObject<HTMLTextAreaElement>,
    rows: number, placeholder: string
  ) => (
    <div style={{ marginBottom: 20 }}>
      <div className="reporttype-code-editor-label-row">
        <span className="reporttype-code-badge reporttype-code-badge-html">HTML</span>
        <span className="reporttype-code-label">{label}</span>
        <button
          type="button"
          className="reporttype-var-toggle-btn"
          style={{ marginLeft: "auto", fontSize: 11, padding: "3px 8px" }}
          onClick={() => setActiveInsertField(activeInsertField === sectionKey ? null : sectionKey)}
        >
          {activeInsertField === sectionKey ? "▲ Variables" : "▼ Variables"}
        </button>
      </div>
      {activeInsertField === sectionKey && (
        <VariablePills onInsert={(v) => insertAtCursor(v, sectionKey)} />
      )}
      <textarea
        ref={ref} value={value} onChange={(e) => onChange(e.target.value)}
        rows={rows} placeholder={placeholder} spellCheck={false}
        className="reporttype-code-textarea reporttype-code-textarea-html"
      />
    </div>
  );

  // ─────────────────────────────────────────────
  // Tab content
  // ─────────────────────────────────────────────
  const tabContent: Record<string, React.ReactNode> = {

    // ══ INFO ══════════════════════════════════
    info: (
      <div className="reporttype-section">
        <h3 className="reporttype-section-title">Basic Information</h3>
        <div className="reporttype-row">
          <div className="reporttype-field">
            <label>Dashboard Name *</label>
            <input
              className="reporttype-input" value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="e.g. Monthly Operations Dashboard"
            />
          </div>
          <div className="reporttype-field">
            <label>Dashboard Code *</label>
            <input
              className="reporttype-input" value={typeCode}
              onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
              placeholder="e.g. MOD" maxLength={10}
            />
          </div>
        </div>
        <div className="reporttype-field" style={{ marginBottom: 12 }}>
          <label>Category</label>
          <select className="reporttype-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {["analytics","operations","finance","customer","production","management","inventory","other"].map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="reporttype-field">
          <label>Description</label>
          <textarea
            className="reporttype-input" rows={3}
            style={{ resize: "vertical", lineHeight: 1.6 }}
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this dashboard shows and when to use it..."
          />
        </div>
      </div>
    ),

    // ══ TEMPLATES ══════════════════════════════
    templates: (
      <>
        {/* Action bar */}
        <div className="reporttype-export-bar">
          <button className="reporttype-btn reporttype-btn-purple" onClick={() => setShowLibrary(true)}>
            📊 Template Library
          </button>
          <button className="reporttype-btn reporttype-btn-blue" onClick={() => setShowPreview(true)}>
            👁 Live Preview
          </button>
          <button className="reporttype-btn reporttype-btn-green" onClick={handleExportJSON}>
            ⬇ Export JSON
          </button>
          <label className="reporttype-btn reporttype-btn-amber" style={{ cursor: "pointer" }}>
            ⬆ Import JSON
            <input type="file" accept=".json,application/json" onChange={handleImportJSON} style={{ display: "none" }} />
          </label>
        </div>

        {/* CSS */}
        <div className="reporttype-section">
          <h3 className="reporttype-section-title">CSS Styles</h3>
          <CodeEditor
            language="css" label="Stylesheet" value={css} onChange={setCss}
            rows={10} textareaRef={cssRef}
            placeholder={`.db-header { background: #1e1b4b; color: #fff; padding: 20px 24px; }\n.db-kpi-grid { display: grid; grid-template-columns: repeat(8,1fr); gap: 10px; }\n.db-kpi { border-radius: 8px; padding: 12px; text-align: center; }`}
          />
        </div>

        {/* HTML Sections */}
        <div className="reporttype-section">
          <h3 className="reporttype-section-title">HTML Templates</h3>
          {renderHtmlSection("header","Header",htmlHeader,setHtmlHeader,headerRef,6,
            `<header>\n  <h1>{{companyName}}</h1>\n  <p>{{periodLabel}} · {{branchName}} · Generated: {{generatedAt}}</p>\n</header>`)}
          {renderHtmlSection("body","Body (Dashboard Content)",htmlBody,setHtmlBody,bodyRef,16,
            `<div class="db-kpi-grid">\n  <div class="db-kpi"><div>{{totalOrders}}</div><div>Total Orders</div></div>\n</div>\n{{#categoryBreakdown}}\n<tr><td>{{categoryName}}</td><td>{{count}}</td><td>{{revenue}}</td></tr>\n{{/categoryBreakdown}}`)}
          {renderHtmlSection("footer","Footer",htmlFooter,setHtmlFooter,footerRef,5,
            `<footer>\n  <p>{{companyName}} · {{branchName}} · {{periodLabel}} · Generated: {{generatedAt}}</p>\n</footer>`)}
        </div>

        {/* JavaScript */}
        <div className="reporttype-section">
          <h3 className="reporttype-section-title">JavaScript</h3>
          <div className="reporttype-info-bar">
            💡 Runs inside the generated HTML. Use{" "}
            <code>document.addEventListener('DOMContentLoaded', ...)</code> for DOM ops.
          </div>
          <CodeEditor
            language="js" label="Script" value={js} onChange={setJs}
            rows={10} textareaRef={jsRef}
            placeholder={`document.addEventListener('DOMContentLoaded', () => {\n  document.querySelectorAll('.db-kpi').forEach((card, i) => {\n    card.style.opacity = '0';\n    card.style.transition = \`opacity .3s \${i * 60}ms\`;\n    setTimeout(() => card.style.opacity = '1', 50);\n  });\n});`}
          />
        </div>
      </>
    ),
  };

  // ─────────────────────────────────────────────
  // Save button
  // ─────────────────────────────────────────────
  const saveBtnLabel =
    saveState === "saving" ? "⏳ Saving..." :
    saveState === "saved"  ? "✓ Saved!"    :
    editMode               ? "Update Dashboard Type" :
                             "Create Dashboard Type";

  const saveBtnClass = `reporttype-save-btn reporttype-save-btn-${saveState === "idle" ? "idle" : saveState}`;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div id="reporttype-container-css">

      {/* ── Title Row ── */}
      <div className="reporttype-title-row">
        <h6>{editMode ? "✏️ Edit Dashboard Type" : "➕ Create Dashboard Type"}</h6>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {editMode && dashboardTypeId && (
            <button
              className="reporttype-btn reporttype-btn-danger"
              onClick={() => { setDeleteConfirmText(""); setShowDeleteConfirm(true); }}
            >
              🗑 Delete
            </button>
          )}
          {onCancel && (
            <button className="reporttype-btn reporttype-btn-secondary" onClick={onCancel}>
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="reporttype-tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`reporttype-tab ${activeTab === t.id ? "reporttype-tab-active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="reporttype-container">
        <div className="reporttype-form">
          {tabContent[activeTab]}

          {/* Save row */}
          <div className="reporttype-submit">
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              {onCancel && (
                <button className="reporttype-btn reporttype-btn-secondary" onClick={onCancel}>
                  Cancel
                </button>
              )}
              <button className={saveBtnClass} onClick={handleSubmit} disabled={saveState === "saving"}>
                {saveBtnLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Template Library Modal ── */}
      <DashboardTemplateLibrary
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleSelectTemplate}
      />

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && ReactDOM.createPortal(
        <>
          <style>{`
            .rtp-delete-overlay {
              position:fixed !important;inset:0 !important;width:100vw !important;height:100vh !important;
              background:rgba(0,0,0,0.75) !important;display:flex !important;align-items:center !important;
              justify-content:center !important;z-index:9999998 !important;padding:20px !important;box-sizing:border-box !important;
            }
            .rtp-delete-box {
              background:#fff !important;border-radius:12px !important;width:100% !important;
              max-width:420px !important;padding:28px 24px !important;box-shadow:0 20px 50px rgba(0,0,0,.4) !important;
            }
            .rtp-delete-icon  { font-size:40px;text-align:center;margin-bottom:12px; }
            .rtp-delete-title { font-size:17px;font-weight:700;color:#111827;text-align:center;margin-bottom:6px;font-family:system-ui,sans-serif; }
            .rtp-delete-sub   { font-size:12px;color:#6b7280;text-align:center;margin-bottom:18px;font-family:system-ui,sans-serif;line-height:1.5; }
            .rtp-delete-label { font-size:12px;font-weight:600;color:#374151;margin-bottom:6px;font-family:system-ui,sans-serif; }
            .rtp-delete-input {
              width:100% !important;padding:9px 12px !important;border:1.5px solid #e5e7eb !important;
              border-radius:7px !important;font-size:13px !important;outline:none !important;
              font-family:system-ui,sans-serif !important;box-sizing:border-box !important;margin-bottom:18px !important;
            }
            .rtp-delete-input:focus { border-color:#ef4444 !important;box-shadow:0 0 0 3px rgba(239,68,68,.12) !important; }
            .rtp-delete-actions { display:flex;gap:10px;justify-content:flex-end; }
            .rtp-delete-cancel-btn  { padding:9px 20px !important;background:#f3f4f6 !important;color:#374151 !important;border:none !important;border-radius:7px !important;font-size:13px !important;font-weight:600 !important;cursor:pointer !important; }
            .rtp-delete-cancel-btn:hover { background:#e5e7eb !important; }
            .rtp-delete-confirm-btn { padding:9px 20px !important;background:#ef4444 !important;color:#fff !important;border:none !important;border-radius:7px !important;font-size:13px !important;font-weight:600 !important;cursor:pointer !important;transition:opacity .15s !important; }
            .rtp-delete-confirm-btn:disabled { opacity:.5 !important;cursor:not-allowed !important; }
            .rtp-delete-confirm-btn:not(:disabled):hover { opacity:.88 !important; }
          `}</style>
          <div className="rtp-delete-overlay" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
            <div className="rtp-delete-box" onClick={(e) => e.stopPropagation()}>
              <div className="rtp-delete-icon">⚠️</div>
              <div className="rtp-delete-title">Delete Dashboard Type?</div>
              <div className="rtp-delete-sub">
                This action <strong>cannot be undone</strong>.<br />
                Type <strong>{typeName}</strong> below to confirm.
              </div>
              <div className="rtp-delete-label">Type the dashboard name to confirm</div>
              <input
                autoFocus
                className="rtp-delete-input"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={typeName}
                onKeyDown={(e) => { if (e.key === "Enter") handleDeleteConfirm(); }}
              />
              <div className="rtp-delete-actions">
                <button className="rtp-delete-cancel-btn" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                  Cancel
                </button>
                <button
                  className="rtp-delete-confirm-btn"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting || deleteConfirmText.trim().toLowerCase() !== typeName.trim().toLowerCase()}
                >
                  {isDeleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ── Live Preview Modal ── */}
      {showPreview && ReactDOM.createPortal(
        <>
          <style>{`
            .rtp-preview-overlay {
              position:fixed !important;inset:0 !important;width:100vw !important;height:100vh !important;
              background:rgba(0,0,0,0.88) !important;display:flex !important;align-items:center !important;
              justify-content:center !important;z-index:999999 !important;padding:20px !important;box-sizing:border-box !important;
            }
            .rtp-preview-box {
              background:#1e293b !important;border-radius:12px !important;width:95vw !important;
              max-width:1100px !important;height:90vh !important;display:flex !important;
              flex-direction:column !important;overflow:hidden !important;box-shadow:0 25px 60px rgba(0,0,0,.6) !important;
            }
            .rtp-preview-topbar {
              padding:12px 20px !important;background:#0f172a !important;border-bottom:1px solid #334155 !important;
              display:flex !important;align-items:center !important;justify-content:space-between !important;
              flex-shrink:0 !important;gap:12px !important;
            }
            .rtp-preview-topbar-title { color:#e2e8f0 !important;font-weight:700 !important;font-size:14px !important;font-family:system-ui,sans-serif !important; }
            .rtp-preview-controls { display:flex !important;gap:10px !important;align-items:center !important; }
            .rtp-preview-sample-label { display:flex !important;align-items:center !important;gap:6px !important;font-size:12px !important;color:#94a3b8 !important;cursor:pointer !important;font-family:system-ui,sans-serif !important; }
            .rtp-preview-print-btn { background:#22c55e !important;color:#fff !important;border:none !important;border-radius:6px !important;padding:6px 14px !important;font-size:12px !important;font-weight:600 !important;cursor:pointer !important; }
            .rtp-preview-print-btn:hover { opacity:.88 !important; }
            .rtp-preview-close-btn { background:#ef4444 !important;color:#fff !important;border:none !important;border-radius:6px !important;padding:6px 14px !important;font-size:12px !important;font-weight:600 !important;cursor:pointer !important; }
            .rtp-preview-body { flex:1 !important;overflow:auto !important;background:#374151 !important;padding:24px !important;display:flex !important;justify-content:center !important; }
            .rtp-preview-paper { background:#fff !important;width:100% !important;min-height:500px !important;border-radius:4px !important;box-shadow:0 4px 24px rgba(0,0,0,.4) !important; }
            .rtp-preview-paper iframe { width:100% !important;height:100% !important;min-height:700px !important;border:none !important;border-radius:4px !important;display:block !important; }
            .rtp-preview-footer { padding:8px 20px !important;background:#0f172a !important;border-top:1px solid #334155 !important;font-size:11px !important;color:#475569 !important;display:flex !important;justify-content:space-between !important;flex-shrink:0 !important;font-family:system-ui,sans-serif !important; }
          `}</style>
          <div className="rtp-preview-overlay" onClick={() => setShowPreview(false)}>
            <div className="rtp-preview-box" onClick={(e) => e.stopPropagation()}>
              <div className="rtp-preview-topbar">
                <span className="rtp-preview-topbar-title">
                  👁 Live Preview — {typeName || "Untitled Dashboard"}
                </span>
                <div className="rtp-preview-controls">
                  <label className="rtp-preview-sample-label">
                    <input type="checkbox" checked={useSampleData} onChange={(e) => setUseSampleData(e.target.checked)} />
                    Sample Data
                  </label>
                  <button className="rtp-preview-print-btn" onClick={handlePrint}>🖨️ Print</button>
                  <button className="rtp-preview-close-btn" onClick={() => setShowPreview(false)}>✕ Close</button>
                </div>
              </div>
              <div className="rtp-preview-body">
                <div className="rtp-preview-paper">
                  <iframe title="dashboard-preview" srcDoc={buildFullHtml(useSampleData)} sandbox="allow-scripts" />
                </div>
              </div>
              <div className="rtp-preview-footer">
                <span>Live Preview · {typeName || "Untitled"} · {category}</span>
                <span style={{ opacity: .5 }}>Press ESC to close</span>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ── Hidden print iframe ── */}
      <iframe
        ref={printFrameRef}
        title="print-frame"
        style={{ position: "fixed", right: 0, bottom: 0, width: 0, height: 0, border: "none", visibility: "hidden" }}
      />

      <Toast toasts={toast.toasts} remove={toast.remove} />
    </div>
  );
};

export default CreateDashboardType;