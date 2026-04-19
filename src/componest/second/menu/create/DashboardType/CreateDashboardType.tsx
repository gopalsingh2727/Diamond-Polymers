import React, { useState, useEffect, useRef, useCallback } from "react";
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
import {
  resetOrders,
  getWindowXScript,
  handleIframeQuery,
} from "@/componest/redux/graphql/graphqlOrderActions";
import {
  uploadTemplateFile,
  deleteTemplateFile,
} from "@/services/firebaseStorage";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface BuildFolderFile {
  name:     string;
  path:     string;
  size:     number;
  type:     string;
  content?: string;   // text files (html / css / js / json / xml)
  dataUri?: string;   // binary files (images / fonts) encoded as base64 data URI
}

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
// Live Preview hook
// ─────────────────────────────────────────────
interface PreviewState {
  hasLoaded:      boolean;
  loadedSections: Set<string>;
}

function useLivePreview() {
  const [ps, setPs] = useState<PreviewState>({
    hasLoaded:      false,
    loadedSections: new Set(),
  });

  const markReady = useCallback(() => {
    setPs({ hasLoaded: true, loadedSections: new Set(["summary"]) });
  }, []);

  const reset = useCallback(() => {
    setPs({ hasLoaded: false, loadedSections: new Set() });
  }, []);

  return { ps, markReady, reset };
}

// ─────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────
const TABS = [
  { id: "info",      label: "📋 Basic Info" },
  { id: "templates", label: "🖊️ Templates"  },
];

// ─────────────────────────────────────────────
// Build Folder Explorer Component
// ─────────────────────────────────────────────
function BuildFolderExplorer({
  isOpen,
  onClose,
  files,
  folderName,
}: {
  isOpen: boolean;
  onClose: () => void;
  files: BuildFolderFile[];
  folderName: string;
}) {
  const [selectedFile, setSelectedFile] = useState<BuildFolderFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const fileTree = useCallback(() => {
    const tree: Record<string, BuildFolderFile[]> = {};
    files.forEach(file => {
      const dir = file.path.split('/').slice(0, -1).join('/') || 'root';
      if (!tree[dir]) tree[dir] = [];
      tree[dir].push(file);
    });
    return tree;
  }, [files]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <style>{`
        .build-explorer-overlay{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.75)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:9999997!important;padding:20px!important;box-sizing:border-box!important}
        .build-explorer-box{background:#fff!important;border-radius:12px!important;width:100%!important;max-width:900px!important;height:80vh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;box-shadow:0 20px 50px rgba(0,0,0,.4)!important;font-family:system-ui,sans-serif!important}
        .build-explorer-header{padding:16px 20px!important;border-bottom:1px solid #e5e7eb!important;background:#f9fafb!important;flex-shrink:0!important}
        .build-explorer-title{font-size:16px!important;font-weight:700!important;color:#111827!important;margin:0!important}
        .build-explorer-body{display:flex!important;flex:1!important;overflow:hidden!important}
        .build-explorer-tree{flex:0 0 35%!important;border-right:1px solid #e5e7eb!important;overflow-y:auto!important;background:#fafafa!important;padding:12px!important}
        .build-explorer-preview{flex:1!important;overflow:auto!important;padding:16px!important;background:#fff!important}
        .build-tree-item{padding:6px 8px!important;margin:2px 0!important;border-radius:5px!important;cursor:pointer!important;font-size:12px!important;color:#374151!important;transition:background .15s!important}
        .build-tree-item:hover{background:#e5e7eb!important}
        .build-tree-item.selected{background:#3b82f6!important;color:#fff!important;font-weight:600!important}
        .build-tree-folder{font-weight:600!important;color:#1f2937!important;margin-top:8px!important;padding:8px!important;background:#e5e7eb!important;border-radius:4px!important;cursor:pointer!important}
        .build-tree-folder:hover{background:#d1d5db!important}
        .build-preview-header{font-size:13px!important;font-weight:700!important;color:#111827!important;margin-bottom:12px!important;padding-bottom:8px!important;border-bottom:2px solid #3b82f6!important}
        .build-preview-meta{font-size:11px!important;color:#6b7280!important;margin-bottom:12px!important}
        .build-preview-content{font-family:monospace!important;font-size:11px!important;background:#f3f4f6!important;padding:12px!important;border-radius:6px!important;max-height:400px!important;overflow-y:auto!important;line-height:1.5!important;white-space:pre-wrap!important;word-break:break-all!important;color:#1f2937!important}
        .build-explorer-footer{padding:12px 16px!important;border-top:1px solid #e5e7eb!important;background:#f9fafb!important;display:flex!important;justify-content:space-between!important;align-items:center!important;flex-shrink:0!important}
        .build-stats{font-size:11px!important;color:#6b7280!important}
        .build-close-btn{background:#ef4444!important;color:#fff!important;border:none!important;border-radius:6px!important;padding:8px 16px!important;font-size:12px!important;font-weight:600!important;cursor:pointer!important}
        .build-close-btn:hover{opacity:.88!important}
      `}</style>
      <div className="build-explorer-overlay" onClick={onClose}>
        <div className="build-explorer-box" onClick={(e) => e.stopPropagation()}>
          <div className="build-explorer-header">
            <div className="build-explorer-title">📁 Build Folder Explorer — {folderName}</div>
          </div>

          <div className="build-explorer-body">
            <div className="build-explorer-tree">
              {Object.entries(fileTree()).map(([dir, dirFiles]) => (
                <div key={dir}>
                  <div
                    className="build-tree-folder"
                    onClick={() => toggleFolder(dir)}
                  >
                    {expandedFolders.has(dir) ? '▼' : '▶'} {dir === 'root' ? 'Root' : dir}
                  </div>
                  {expandedFolders.has(dir) && dirFiles.map(file => (
                    <div
                      key={file.path}
                      className={`build-tree-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
                      onClick={() => setSelectedFile(file)}
                    >
                      {file.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="build-explorer-preview">
              {selectedFile ? (
                <>
                  <div className="build-preview-header">{selectedFile.name}</div>
                  <div className="build-preview-meta">
                    📄 Type: {selectedFile.type} | Size: {formatSize(selectedFile.size)}
                  </div>
                  {selectedFile.dataUri && selectedFile.type.startsWith('image/') ? (
                    <img
                      src={selectedFile.dataUri}
                      alt={selectedFile.name}
                      style={{ maxWidth: '100%', borderRadius: 6 }}
                    />
                  ) : (
                    <div className="build-preview-content">
                      {selectedFile.content || '(Binary file — no text preview)'}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', paddingTop: '40px' }}>
                  📂 Select a file to preview
                </div>
              )}
            </div>
          </div>

          <div className="build-explorer-footer">
            <span className="build-stats">Total Files: {files.length}</span>
            <button className="build-close-btn" onClick={onClose}>✕ Close</button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ─────────────────────────────────────────────
// Helper: read a File as text — uses file.text() with FileReader fallback
// ─────────────────────────────────────────────
function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text().catch(() => readFileAsTextFallback(file));
  }
  return readFileAsTextFallback(file);
}

function readFileAsTextFallback(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("FileReader failed for: " + file.name));
    reader.readAsText(file, "utf-8");
  });
}

// ─────────────────────────────────────────────
// Helper: read a File as base64 data URI
// ─────────────────────────────────────────────
function readFileAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────
// WindowXGuide — comprehensive API step-by-step panel
// ─────────────────────────────────────────────
const CODE = {
  mono: { fontFamily: "'SF Mono','Fira Code','Cascadia Code',monospace" } as React.CSSProperties,
  block: {
    background: "#0d0c1e",
    borderRadius: 8,
    padding: "12px 16px",
    fontFamily: "'SF Mono','Fira Code','Cascadia Code',monospace",
    fontSize: 11,
    color: "#c4b5fd",
    overflowX: "auto" as const,
    lineHeight: 1.75,
    whiteSpace: "pre" as const,
    margin: "6px 0 14px",
    border: "1px solid #312e81",
  } as React.CSSProperties,
  pill: (bg: string, fg: string) => ({
    display: "inline-block",
    background: bg,
    color: fg,
    padding: "1px 8px",
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
    marginRight: 6,
  } as React.CSSProperties),
};

function GuideSection({ step, title, sub, children }: { step: string; title: string; sub?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(step === "1");
  return (
    <div style={{ marginBottom: 6, borderRadius: 8, border: "1px solid #312e81", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          background: open ? "#1e1b4b" : "#16144a",
          border: "none", padding: "10px 14px", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ ...CODE.pill("#6366f1", "#fff"), minWidth: 22, textAlign: "center" }}>{step}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#e0e7ff", flex: 1 }}>{title}</span>
        {sub && <span style={{ fontSize: 10, color: "#818cf8" }}>{sub}</span>}
        <span style={{ fontSize: 10, color: "#6366f1" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ background: "#13123a", padding: "14px 16px", fontSize: 11, color: "#a5b4fc", lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function WindowXGuide() {
  return (
    <div style={{ margin: "0 0 16px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px 10px",
        background: "linear-gradient(135deg, #1e1b4b, #312e81)",
        borderRadius: "10px 10px 0 0",
        borderBottom: "2px solid #4f46e5",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
            window.x — Dashboard Data API
          </span>
          <span style={CODE.pill("#22c55e22", "#4ade80")}>Secure</span>
          <span style={CODE.pill("#6366f122", "#a5b4fc")}>Auto-injected</span>
        </div>
        <div style={{ fontSize: 10, color: "#818cf8" }}>
          Your HTML file gets <code style={{ color: "#c4b5fd" }}>window.x</code> automatically injected.
          No API keys, no tokens needed in your HTML — security is handled by the platform.
        </div>
      </div>

      <div style={{ background: "#0f0e2a", borderRadius: "0 0 10px 10px", padding: "12px 12px 6px" }}>

        {/* Step 1 — Security */}
        <GuideSection step="1" title="Security — how it works" sub="Read first">
          <div style={{ marginBottom: 8 }}>
            Your HTML file runs inside a <strong style={{ color: "#f9a8d4" }}>sandboxed iframe</strong>.
            The platform injects <code style={CODE.mono}>window.x</code> automatically — it acts as a
            secure bridge between your HTML and the backend. Your HTML never holds API keys or tokens.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10 }}>
            {[
              ["🔑 API Key check", "✅ Verified by server", "#22c55e22", "#4ade80"],
              ["🪪 JWT check", "✅ Verified by server", "#22c55e22", "#4ade80"],
              ["🌿 Branch isolation", "✅ Only your branch data", "#22c55e22", "#4ade80"],
              ["🔒 iframe sandbox", "✅ allow-scripts only", "#22c55e22", "#4ade80"],
            ].map(([label, val, bg, fg]) => (
              <div key={label} style={{ background: bg, border: `1px solid ${fg}22`, borderRadius: 6, padding: "6px 10px" }}>
                <div style={{ color: fg, fontWeight: 700 }}>{val}</div>
                <div style={{ color: "#94a3b8", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: "8px 10px", background: "#7c3aed22", border: "1px solid #7c3aed44", borderRadius: 6 }}>
            <strong style={{ color: "#c4b5fd" }}>window.x is injected before &lt;/body&gt;</strong> — it is always the
            last script to load, so it is available everywhere in your HTML.
          </div>
        </GuideSection>

        {/* Step 2 — Quick start */}
        <GuideSection step="2" title="Quick start — first query" sub="Copy & paste">
          <div>Add this inside a <code style={CODE.mono}>&lt;script&gt;</code> tag in your HTML:</div>
          <div style={CODE.block}>{`(async () => {
  // Get all orders for your branch
  const orders = await window.x.getAllOrders();

  document.getElementById('count').textContent =
    'Total orders: ' + orders.length;

  // Render one row per order
  const list = document.getElementById('list');
  orders.forEach(o => {
    const row = document.createElement('div');
    row.textContent = o.orderId + ' — ' + o.overallStatus;
    list.appendChild(row);
  });
})();`}</div>
          <div style={{ marginTop: -4, fontSize: 10, color: "#818cf8" }}>
            HTML: <code style={CODE.mono}>{"<div id='count'></div><div id='list'></div>"}</code>
          </div>
        </GuideSection>

        {/* Step 3 — All order queries */}
        <GuideSection step="3" title="Order queries — all variants" sub="Filter by status, date, priority">
          <div style={CODE.block}>{`// All orders (no filter)
const all = await window.x.getAllOrders();

// By status
const dispatched = await window.x.getOrdersByStatus('dispatched');
const completed  = await window.x.getOrdersByStatus('completed');
const pending    = await window.x.getOrdersByStatus('pending');

// By priority
const urgent = await window.x.getOrdersByPriority('urgent');
const high   = await window.x.getOrdersByPriority('high');

// By date range
const jan = await window.x.getOrdersByDateRange('2026-01-01','2026-01-31');

// Fetch multiple datasets at once (most efficient)
const data = await window.x.fetch({
  all:       { type: 'all' },
  completed: { type: 'byStatus', status: 'completed' },
  urgent:    { type: 'byPriority', priority: 'urgent' },
  thisMonth: { type: 'byDateRange',
               fromDate: '2026-04-01',
               toDate:   '2026-04-30' },
});
// data.all, data.completed, data.urgent, data.thisMonth`}</div>
        </GuideSection>

        {/* Step 4 — Order fields */}
        <GuideSection step="4" title="Order object — available fields">
          <div style={CODE.block}>{`order = {
  _id, orderId,
  overallStatus,      // 'pending' | 'in_progress' | 'completed' | 'dispatched'
  priority,           // 'low' | 'normal' | 'high' | 'urgent'
  createdAt, updatedAt,
  createdByName,
  Notes,

  customer: {
    companyName, firstName, lastName,
    phone1, email, address1, state, pinCode,
    gstNumber,
    category:      { name },    // customer category
    parentCompany: { name },    // parent company
  },

  options: [{
    optionName, optionTypeName, quantity,
    specificationValues: [{ name, value, unit, dataType }]
  }],

  machineTableData: [{
    machineId, templateId,
    targetValue, currentValue, progress,
    isComplete, completedAt, totalProductionTime,
    machine: { machineName, machineType: { type } },
    rows: [{ rowNumber, createdAt, createdByName,
             values: [{ columnName, value, unit }] }]
  }]
}`}</div>
        </GuideSection>

        {/* Step 5 — Aggregates */}
        <GuideSection step="5" title="Aggregates — totals, counts, production stats" sub="specTotals + machine analytics">
          <div style={{ marginBottom: 8 }}>Pre-aggregated server-side — much faster than summing in JS.</div>
          <div style={CODE.block}>{`// Spec aggregates (total quantity per option type)
const specs = await window.x.query('specAggregates', {
  fromDate: '2026-01-01',
  toDate:   '2026-04-30',
  // overallStatus: ['completed'],  // optional filter
});
// specs = [{ optionTypeName, optionName, totalQuantity,
//            orderCount, avgQuantity }]

// Machine table aggregates
// (completed count, total production time, progress per machine)
const machines = await window.x.query('machineAggregates', {
  fromDate: '2026-01-01',
  toDate:   '2026-04-30',
});
// machines = [{ machineId, machine { machineName },
//               completedCount, totalOrders, totalProductionTime,
//               avgProgress, columnTotals: [...] }]

// Machine column totals
// (total weight, total length, waste per machine column)
const cols = await window.x.query('machineColumnAggregates', {
  fromDate:   '2026-01-01',
  toDate:     '2026-04-30',
  machineIds: ['<machineId1>', '<machineId2>'],  // optional
});
// cols = [{ machineId, machine { machineName },
//           columnName, unit,
//           totalValue, count, average, orderCount }]`}</div>
        </GuideSection>

        {/* Step 6 — Helper functions */}
        <GuideSection step="6" title="Helper functions — quick calculations" sub="Built-in utilities">
          <div style={CODE.block}>{`// Sum all values of a column across machines
const totalWeight = window.x.sumColumn(cols, 'Weight');

// Get the total for a specific column on one machine row
const mWeight = window.x.getMachineColumnTotal(machineRow, 'Weight');

// Find a column entry by name (case-insensitive)
const weightCol = window.x.findColumn(cols, 'weight');

// Format a number as local currency
const price = window.x.formatCurrency(125000);   // ₹1,25,000

// Format a number with commas
const qty = window.x.formatNumber(9999.5, 1);    // 9,999.5

// Format a date string for display
const dt = window.x.formatDate('2026-04-16T10:30:00Z');`}</div>
        </GuideSection>

        {/* Step 7 — Output report */}
        <GuideSection step="7" title="Output report & summary" sub="Production output data">
          <div style={CODE.block}>{`// Output report (production quantities)
const output = await window.x.query('outputReport', {
  fromDate: '2026-01-01',
  toDate:   '2026-04-30',
  groupBy:  'day',  // 'day' | 'week' | 'month'
});

// Output summary (totals)
const summary = await window.x.query('outputSummary', {
  fromDate: '2026-01-01',
  toDate:   '2026-04-30',
});`}</div>
        </GuideSection>

        {/* Step 8 — Full dashboard example */}
        <GuideSection step="8" title="Full example — KPI dashboard" sub="Copy-paste ready">
          <div style={CODE.block}>{`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .kpi { display: flex; gap: 16px; flex-wrap: wrap; }
    .card { background: #fff; border-radius: 10px; padding: 20px 24px;
            box-shadow: 0 1px 4px rgba(0,0,0,.08); min-width: 140px; }
    .card h3 { margin: 0 0 6px; font-size: 12px; color: #64748b; }
    .card p  { margin: 0; font-size: 28px; font-weight: 800; color: #1e293b; }
  </style>
</head>
<body>
  <h2>📊 Dashboard</h2>
  <div class="kpi">
    <div class="card"><h3>Total Orders</h3><p id="total">…</p></div>
    <div class="card"><h3>Completed</h3><p id="done">…</p></div>
    <div class="card"><h3>In Progress</h3><p id="wip">…</p></div>
    <div class="card"><h3>Urgent</h3><p id="urg">…</p></div>
  </div>
  <script>
  (async () => {
    const { all, completed, urgent } = await window.x.fetch({
      all:       { type: 'all' },
      completed: { type: 'byStatus', status: 'completed' },
      urgent:    { type: 'byPriority', priority: 'urgent' },
    });
    document.getElementById('total').textContent = all.length;
    document.getElementById('done').textContent  = completed.length;
    document.getElementById('wip').textContent   =
      all.filter(o => o.overallStatus === 'in_progress').length;
    document.getElementById('urg').textContent   = urgent.length;
  })();
  <\/script>
</body>
</html>`}</div>
        </GuideSection>

        {/* Step 9 — Errors */}
        <GuideSection step="9" title="Error handling" sub="Best practice">
          <div style={CODE.block}>{`(async () => {
  try {
    const orders = await window.x.getAllOrders();
    render(orders);
  } catch (err) {
    console.error('Dashboard data error:', err);
    document.body.innerHTML =
      '<div style="color:red;padding:20px">⚠ ' + err.message + '</div>';
  }
})();

// Check if window.x is available (fallback for older files)
if (window.x && window.x.getAllOrders) {
  // proceed
} else {
  console.warn('window.x not available — check injection');
}`}</div>
        </GuideSection>

      </div>
    </div>
  );
}

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

  const { dashboardTypeData: locationData, isEdit } = (location.state || {}) as any;
  const dashboardTypeData = propInitialData || locationData;
  const editMode          = Boolean(propInitialData || isEdit || dashboardTypeData?._id);
  const dashboardTypeId   = dashboardTypeData?._id;

  const [typeName,    setTypeName]    = useState("");
  const [typeCode,    setTypeCode]    = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("analytics");
  const [htmlHeader,  setHtmlHeader]  = useState("");
  const [htmlBody,    setHtmlBody]    = useState("");
  const [htmlFooter,  setHtmlFooter]  = useState("");
  const [css,         setCss]         = useState("");
  const [js,          setJs]          = useState("");
  const [buildFolder, setBuildFolder] = useState<string>("");
  const [buildFiles,  setBuildFiles]  = useState<BuildFolderFile[]>([]);

  // ── HTML file upload state ────────────────
  const [uploadedHtmlFile,    setUploadedHtmlFile]    = useState<string>("");   // file name
  const [uploadedHtmlContent, setUploadedHtmlContent] = useState<string>("");  // raw HTML (preview only)
  const [isUploadingHtml,     setIsUploadingHtml]     = useState(false);

  // ── Firebase upload state ─────────────────
  // fileUrl is what gets saved to MongoDB — just a URL string, not the content
  const [firebaseFileUrl,  setFirebaseFileUrl]  = useState<string>("");  // saved download URL
  const [firebaseFileType, setFirebaseFileType] = useState<"html"|"build"|"">("");
  const [firebaseFileName, setFirebaseFileName] = useState<string>("");
  const [firebaseFileSize, setFirebaseFileSize] = useState<number>(0);
  const [uploadPct,        setUploadPct]        = useState<number>(0);   // 0-100 while uploading

  const [activeTab,         setActiveTab]         = useState("info");
  const [showPreview,       setShowPreview]       = useState(false);
  const [showLibrary,       setShowLibrary]       = useState(false);
  const [showBuildExplorer, setShowBuildExplorer] = useState(false);
  const [previewKey,        setPreviewKey]        = useState(0);
  const [previewHtml,       setPreviewHtml]       = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting,        setIsDeleting]        = useState(false);

  const { ps, markReady, reset: resetPreview } = useLivePreview();

  const printFrameRef  = useRef<HTMLIFrameElement>(null);
  const buildFolderRef = useRef<HTMLInputElement>(null);
  // ── NEW: ref for the HTML file input ──────
  const htmlFileRef    = useRef<HTMLInputElement>(null);

  // ── Load existing data on mount ───────────
  useEffect(() => {
    if (editMode && dashboardTypeData) {
      setTypeName(   dashboardTypeData.typeName    || "");
      setTypeCode(   dashboardTypeData.typeCode    || "");
      setDescription(dashboardTypeData.description || "");
      setCategory(   dashboardTypeData.category    || "analytics");
      setHtmlHeader( dashboardTypeData.htmlHeader  || "");
      setHtmlBody(   dashboardTypeData.htmlBody    || "");
      setHtmlFooter( dashboardTypeData.htmlFooter  || "");
      setCss(        dashboardTypeData.css         || "");
      setJs(         dashboardTypeData.js          || "");
      // Restore Firebase file metadata if saved
      if (dashboardTypeData.fileUrl) {
        setFirebaseFileUrl(  dashboardTypeData.fileUrl   || "");
        setFirebaseFileType((dashboardTypeData.fileType  || "") as "html"|"build"|"");
        setFirebaseFileName( dashboardTypeData.fileName  || "");
        setFirebaseFileSize( dashboardTypeData.fileSize  || 0);
      }
    }
  }, [editMode, dashboardTypeData]);

  // ── Cleanup on unmount ────────────────────
  useEffect(() => {
    return () => { dispatch(resetOrders()); };
  }, [dispatch]);

  // ── postMessage bridge ────────────────────
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      handleIframeQuery(e);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // ── ESC key ───────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (showPreview)         { setShowPreview(false);                                return; }
    if (showDeleteConfirm)   { setShowDeleteConfirm(false); setDeleteConfirmText(""); return; }
    if (showLibrary)         { setShowLibrary(false);                                return; }
    if (showBuildExplorer)   { setShowBuildExplorer(false);                          return; }
  }, [showPreview, showDeleteConfirm, showLibrary, showBuildExplorer]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ─────────────────────────────────────────────────────────────────────────
  // handleBuildFolderSelect — ROBUST VERSION
  // ─────────────────────────────────────────────────────────────────────────
  const handleBuildFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      toast.warning("No Folder", "Please select a build folder");
      return;
    }

    try {
      const firstRelPath = files[0].webkitRelativePath || files[0].name;
      const folderName   = firstRelPath.split("/")[0] || "build-folder";

      console.group(`[BuildFolder] Loading: ${folderName} (${files.length} files)`);

      const processedFiles: BuildFolderFile[] = [];

      const TEXT_EXTS  = new Set(["html","htm","js","jsx","ts","tsx","css","json",
                                   "xml","svg","txt","map","md","csv","env","mjs","cjs"]);
      const BIN_EXTS   = new Set(["png","jpg","jpeg","gif","webp","ico",
                                   "woff","woff2","ttf","otf","eot"]);

      const getExt = (name: string) => (name.split(".").pop() ?? "").toLowerCase().split("?")[0];

      const isText = (mime: string, name: string) => {
        const ext = getExt(name);
        if (TEXT_EXTS.has(ext)) return true;
        return mime.startsWith("text/") ||
               mime.includes("javascript") ||
               mime.includes("json") ||
               mime.includes("xml")  ||
               mime.includes("svg");
      };

      const isBin = (mime: string, name: string) => {
        const ext = getExt(name);
        if (BIN_EXTS.has(ext)) return true;
        return mime.startsWith("image/") ||
               mime.startsWith("font/")  ||
               mime.includes("woff")     ||
               mime.includes("ttf");
      };

      for (let i = 0; i < files.length; i++) {
        const file     = files[i];
        const fullPath = file.webkitRelativePath || file.name;
        const fileName = file.name;
        const mimeType = file.type || "application/octet-stream";

        let content: string | undefined = undefined;
        let dataUri: string | undefined = undefined;

        if (isText(mimeType, fileName)) {
          try {
            content = await readFileAsText(file);
            console.log(`  ✓ text  [${i+1}] ${fullPath} — ${content.length} chars`);
          } catch (err) {
            console.warn(`  ✗ text  [${i+1}] ${fullPath}`, err);
          }
        } else if (isBin(mimeType, fileName)) {
          try {
            dataUri = await readFileAsDataUri(file);
            console.log(`  ✓ bin   [${i+1}] ${fullPath} — ${dataUri.length} chars`);
          } catch (err) {
            console.warn(`  ✗ bin   [${i+1}] ${fullPath}`, err);
          }
        } else {
          console.log(`  — skip  [${i+1}] ${fullPath} (mime: ${mimeType})`);
        }

        processedFiles.push({ name: fileName, path: fullPath, size: file.size, type: mimeType, content, dataUri });
      }

      const indexFile = processedFiles
        .filter(f => f.name === "index.html" && f.content !== undefined)
        .sort((a, b) => a.path.split("/").length - b.path.split("/").length)[0];

      if (!indexFile) {
        toast.warning("No index.html", "Loaded but no index.html found — preview uses manual template");
      } else {
        console.log(`[BuildFolder] ✅ index.html: ${indexFile.path} (${indexFile.content!.length} chars)`);
      }

      console.groupEnd();

      setBuildFolder(folderName);
      setBuildFiles(processedFiles);
      // Clear any previously uploaded HTML file when a build folder is loaded
      setUploadedHtmlFile(""); setUploadedHtmlContent("");
      toast.success("Folder Loaded", `${folderName} — ${processedFiles.length} files`);
      setShowBuildExplorer(true);

      // Upload inlined build HTML to Firebase Storage
      const indexFile2 = processedFiles
        .filter(f => f.name === "index.html" && f.content !== undefined)
        .sort((a, b) => a.path.split("/").length - b.path.split("/").length)[0];
      if (indexFile2) {
        try {
          setUploadPct(0);
          const inlined = injectWindowX(indexFile2.content!);
          toast.success("Uploading build…", "Sending to Firebase Storage");
          const result = await uploadTemplateFile(inlined, `${folderName}.html`, "build", (p) => {
            setUploadPct(p.pct);
          });
          if (firebaseFileUrl && firebaseFileUrl !== result.downloadUrl) {
            deleteTemplateFile(firebaseFileUrl).catch(() => {});
          }
          setFirebaseFileUrl(result.downloadUrl);
          setFirebaseFileType("build");
          setFirebaseFileName(result.fileName);
          setFirebaseFileSize(result.fileSize);
          setUploadPct(100);
          toast.success("Build Uploaded", `${folderName} → Firebase (${(result.fileSize / 1024).toFixed(0)} KB)`);
        } catch (err: any) {
          console.error("[BuildFolder] Firebase upload error:", err);
          toast.error("Upload Failed", err?.message || "Could not upload build to Firebase");
          setUploadPct(0);
        }
      }

    } catch (error) {
      console.error("[BuildFolder] Fatal error:", error);
      toast.error("Folder Error", "Failed to load build folder");
    }

    if (buildFolderRef.current) buildFolderRef.current.value = "";
  };

  // ─────────────────────────────────────────────────────────────────────────
  // injectWindowX — inject window.x bridge into raw HTML content
  // Inserts before </body> if present, otherwise appends.
  // Skips injection if the script is already present.
  // ─────────────────────────────────────────────────────────────────────────
  const injectWindowX = useCallback((html: string): string => {
    if (html.includes("wx-iframe") || html.includes("window.x =")) return html;
    const tag = `\n<script>\n${getWindowXScript()}\n</script>\n`;
    if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${tag}</body>`);
    return html + tag;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // handleHtmlFileSelect — upload a single .html file for live preview
  // Automatically injects window.x bridge so uploaded files can call
  // window.x.query() without the user needing to add it manually.
  // ─────────────────────────────────────────────────────────────────────────
  const handleHtmlFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "html" && ext !== "htm") {
      toast.error("Invalid File", "Please select an .html or .htm file");
      if (htmlFileRef.current) htmlFileRef.current.value = "";
      return;
    }

    setIsUploadingHtml(true);
    setUploadPct(0);
    try {
      const raw     = await readFileAsText(file);
      const content = injectWindowX(raw);

      // Show content in local preview immediately
      setUploadedHtmlFile(file.name);
      setUploadedHtmlContent(content);
      setBuildFolder(""); setBuildFiles([]);
      if (showPreview) { setPreviewHtml(content); setPreviewKey(k => k + 1); }

      // Upload to Firebase Storage — saves URL, not the content, to MongoDB
      toast.success("Uploading…", `Sending ${file.name} to Firebase Storage`);
      const result = await uploadTemplateFile(content, file.name, "html", (p) => {
        setUploadPct(p.pct);
      });

      // Delete old Firebase file if replacing
      if (firebaseFileUrl && firebaseFileUrl !== result.downloadUrl) {
        deleteTemplateFile(firebaseFileUrl).catch(() => {});
      }

      setFirebaseFileUrl(result.downloadUrl);
      setFirebaseFileType("html");
      setFirebaseFileName(result.fileName);
      setFirebaseFileSize(result.fileSize);
      setUploadPct(100);
      toast.success("Uploaded", `${file.name} → Firebase (${(result.fileSize / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      console.error("[HtmlFile] Upload error:", err);
      toast.error("Upload Failed", err?.message || "Could not upload to Firebase");
      setUploadPct(0);
    } finally {
      setIsUploadingHtml(false);
    }

    if (htmlFileRef.current) htmlFileRef.current.value = "";
  };

  // ── Clear Firebase file ───────────────────
  const handleClearFirebaseFile = async () => {
    if (firebaseFileUrl) {
      deleteTemplateFile(firebaseFileUrl).catch(() => {});
    }
    setFirebaseFileUrl(""); setFirebaseFileType(""); setFirebaseFileName(""); setFirebaseFileSize(0);
    setUploadedHtmlFile(""); setUploadedHtmlContent("");
    setBuildFolder(""); setBuildFiles([]);
    setUploadPct(0);
    toast.success("Cleared", "Firebase file removed");
  };

  // ── Template library ─────────────────────
  const handleSelectTemplate = (tpl: (typeof DASHBOARD_TEMPLATE_LIBRARY)[number]) => {
    dispatch(resetOrders());
    setHtmlHeader(tpl.htmlHeader);
    setHtmlBody(  tpl.htmlBody);
    setHtmlFooter(tpl.htmlFooter);
    setCss(tpl.css);
    setJs( tpl.js);
    setShowLibrary(false);
    setActiveTab("templates");
    toast.success("Template Loaded", `"${tpl.name}" applied`);
  };

  // ── buildFullHtml — manual template editor output ─────────────────────
  const buildFullHtml = useCallback((): string => `<!DOCTYPE html>
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
${htmlHeader}
${htmlBody}
${htmlFooter}
<script>
${getWindowXScript()}
${js}
<\/script>
</body>
</html>`, [typeName, css, htmlHeader, htmlBody, htmlFooter, js]);

  // ─────────────────────────────────────────────────────────────────────────
  // buildPreviewHtml — React / Vite / Next.js aware asset inliner
  // ─────────────────────────────────────────────────────────────────────────
  const buildPreviewHtml = useCallback((): string => {
    if (!buildFiles.length) return buildFullHtml();

    const indexFile = buildFiles
      .filter(f => f.name === "index.html" && f.content !== undefined)
      .sort((a, b) => a.path.split("/").length - b.path.split("/").length)[0];

    if (!indexFile) {
      console.warn("[BuildPreview] No readable index.html — falling back to template");
      return buildFullHtml();
    }
    console.log(`[BuildPreview] Using: ${indexFile.path} (${indexFile.content!.length} chars)`);

    const textMap: Record<string, string> = {};
    const binMap:  Record<string, string> = {};

    buildFiles.forEach(file => {
      const segs    = file.path.split("/");
      const noRoot  = segs.slice(1).join("/");
      const noRootQ = noRoot.replace(/[?#].*$/, "");
      const bare    = file.name.replace(/[?#].*$/, "");
      const absForm = "/" + noRootQ;

      const keys = new Set([
        file.path,
        noRoot,
        file.name,
        file.path.replace(/^\.?\//, ""),
        noRootQ,
        bare,
        absForm,
      ].filter(Boolean));

      keys.forEach(k => {
        if (file.content !== undefined) textMap[k] = file.content;
        if (file.dataUri !== undefined) binMap[k]  = file.dataUri;
      });
    });

    console.log(`[BuildPreview] Maps — text: ${Object.keys(textMap).length} keys, bin: ${Object.keys(binMap).length} keys`);

    const candidates = (href: string): string[] => {
      if (!href || href.startsWith("data:") || href.startsWith("blob:")) return [];
      const noQ      = href.replace(/[?#].*$/, "");
      const noLead   = noQ.replace(/^\.?\//, "");
      const bare     = noLead.split("/").pop() ?? "";
      const noParent = noLead.replace(/\.\.?\//g, "");
      const absForm  = noQ.startsWith("/") ? noQ : "/" + noLead;
      return [...new Set([href, noQ, noLead, bare, noParent, absForm])].filter(Boolean);
    };

    const resolveText = (href: string): string | null => {
      if (/^https?:\/\//i.test(href)) return null;
      for (const k of candidates(href)) {
        if (textMap[k] !== undefined) {
          console.log(`[BuildPreview] ✓ JS/CSS "${href}" → "${k}"`);
          return textMap[k];
        }
      }
      console.warn(`[BuildPreview] ✗ miss "${href}"`);
      return null;
    };

    const resolveBin = (href: string): string | null => {
      if (/^https?:\/\//i.test(href)) return null;
      for (const k of candidates(href)) {
        if (binMap[k] !== undefined) {
          console.log(`[BuildPreview] ✓ bin  "${href}" → "${k}"`);
          return binMap[k];
        }
      }
      return null;
    };

    let html = indexFile.content!;

    if (/<base[^>]+href/i.test(html)) {
      html = html.replace(/<base[^>]*>/gi, "<!-- base-href removed for sandbox -->");
      console.log("[BuildPreview] Removed <base href> (CRA fix)");
    }

    const sandboxHelper = `<script>
/* === Build Preview Sandbox Helper === */
(function () {
  var _f = window.fetch;
  window.fetch = function (url, o) {
    if (typeof url === 'string' && /^\\/(?!\\/)/.test(url)) {
      return Promise.resolve(new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return _f ? _f.apply(this, arguments) : Promise.reject(new Error('no fetch'));
  };

  var _x = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, url) {
    if (typeof url === 'string' && /^\\/(?!\\/)/.test(url)) {
      url = 'data:application/json,{}';
    }
    return _x.apply(this, arguments);
  };

  if (!window.matchMedia) {
    window.matchMedia = function (q) {
      return {
        matches: false, media: q, onchange: null,
        addListener: function(){}, removeListener: function(){},
        addEventListener: function(){}, removeEventListener: function(){},
        dispatchEvent: function(){ return false; }
      };
    };
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = function (cb) {
      return { observe: function(){}, unobserve: function(){}, disconnect: function(){} };
    };
  }

  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {
    supportsFiber: true,
    inject: function(){},
    onCommitFiberRoot: function(){},
    onCommitFiberUnmount: function(){},
    onPostCommitFiberRoot: function(){}
  };

  console.info('[Preview] Sandbox helper ready');
})();
<\/script>`;

    html = /<head/i.test(html)
      ? html.replace(/<head([^>]*)>/i, `<head$1>${sandboxHelper}`)
      : sandboxHelper + html;

    html = html.replace(/<link([^>]+)>/gi, (match, attrs: string) => {
      if (!/rel=["']stylesheet["']/i.test(attrs)) return match;
      const m = attrs.match(/href=["']([^"']+)["']/i);
      if (!m) return match;
      const resolved = resolveText(m[1]);
      return resolved != null ? `<style data-src="${m[1]}">${resolved}</style>` : match;
    });

    const collectedScripts: Array<{ src: string; code: string }> = [];
    const htmlScriptSrcs = new Set<string>();

    html = html.replace(
      /<script([^>]*)src=["']([^"']+)["']([^>]*)><\/script>/gi,
      (match, _pre: string, src: string, _post: string) => {
        if (/^https?:\/\//i.test(src)) return match;
        const resolved = resolveText(src);
        if (resolved == null) return match;
        htmlScriptSrcs.add(src);
        console.log(`[BuildPreview] Queued HTML script: ${src} (${resolved.length} chars)`);
        collectedScripts.push({ src, code: resolved });
        return `<!-- inlined: ${src} -->`;
      }
    );

    const chunkFiles = buildFiles.filter(f => {
      if (!f.content) return false;
      const name = f.name.toLowerCase();
      const path = f.path.toLowerCase();
      const isChunk = /\d+\.[a-f0-9]+\.chunk\.js$/.test(name) ||
                      (/\.(chunk|vendor|runtime).*\.js$/.test(name)) ||
                      (path.includes('/static/js/') && name.endsWith('.js') && !name.endsWith('.map'));
      if (!isChunk) return false;
      const absPath = "/" + f.path.split("/").slice(1).join("/");
      return !htmlScriptSrcs.has(f.path) &&
             !htmlScriptSrcs.has(absPath) &&
             !htmlScriptSrcs.has(f.name);
    });

    chunkFiles.forEach(f => {
      const absPath = "/" + f.path.split("/").slice(1).join("/");
      console.log(`[BuildPreview] Pre-loading chunk: ${f.path} (${f.content!.length} chars)`);
      collectedScripts.unshift({ src: absPath, code: f.content! });
    });

    collectedScripts.sort((a, b) => {
      const aIsMain = /main\.[a-f0-9]+\.js$/.test(a.src) || a.src.includes("main.");
      const bIsMain = /main\.[a-f0-9]+\.js$/.test(b.src) || b.src.includes("main.");
      if (aIsMain && !bIsMain) return 1;
      if (!aIsMain && bIsMain) return -1;
      return 0;
    });

    if (collectedScripts.length) {
      const parts = collectedScripts.map(s => `/* === ${s.src} === */\n${s.code}`);
      const bundle = `<script data-inlined="build-preview">\n${parts.join("\n\n")}\n<\/script>`;
      if (/<\/body>/i.test(html)) {
        html = html.replace(/<\/body>/i, `${bundle}\n</body>`);
      } else {
        html += bundle;
      }
      console.log(`[BuildPreview] Injected ${collectedScripts.length} script(s) before </body>`);
    }

    html = html.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, href: string) => {
      if (/^https?:\/\//i.test(href) || href.startsWith("data:")) return match;
      const resolved = resolveBin(href);
      return resolved != null ? `url('${resolved}')` : match;
    });

    html = html.replace(
      /(<(?:img|image|source|video|audio)[^>]+)src=["']([^"']+)["']([^>]*>)/gi,
      (match, pre: string, src: string, post: string) => {
        if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return match;
        const resolved = resolveBin(src) ?? resolveText(src);
        return resolved != null ? `${pre}src="${resolved}"${post}` : match;
      }
    );

    html = html.replace(/srcset=["']([^"']+)["']/gi, (match, srcset: string) => {
      const replaced = srcset.replace(/([^\s,]+)(\s+\d+[wx])?/g, (part, url, descriptor) => {
        if (!url || /^https?:\/\//i.test(url) || url.startsWith("data:")) return part;
        const r = resolveBin(url);
        return r != null ? `${r}${descriptor ?? ""}` : part;
      });
      return `srcset="${replaced}"`;
    });

    html = html.replace(
      /(<link[^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]+)href=["']([^"']+)["']([^>]*>)/gi,
      (match, pre: string, href: string, post: string) => {
        if (/^https?:\/\//i.test(href) || href.startsWith("data:")) return match;
        const resolved = resolveBin(href) ?? resolveText(href);
        return resolved != null ? `${pre}href="${resolved}"${post}` : match;
      }
    );

    console.log(`[BuildPreview] Done — ${html.length} chars`);
    return html;
  }, [buildFiles, buildFullHtml]);

  // ─────────────────────────────────────────────────────────────────────────
  // getPreviewHtml — priority:
  //   1. Uploaded single .html file  ← NEW (highest priority)
  //   2. Build folder index.html
  //   3. Manual template (header + body + footer)
  // ─────────────────────────────────────────────────────────────────────────
  const getPreviewHtml = useCallback((): string => {
    if (uploadedHtmlContent) return uploadedHtmlContent;   // ① single HTML file wins
    if (buildFiles.length)   return buildPreviewHtml();    // ② build folder next
    return buildFullHtml();                                // ③ manual template fallback
  }, [uploadedHtmlContent, buildFiles, buildPreviewHtml, buildFullHtml]);

  // ── Preview ───────────────────────────────
  const handleOpenPreview = () => {
    dispatch(resetOrders());
    resetPreview();
    const html = getPreviewHtml();
    setPreviewHtml(html);
    setPreviewKey(k => k + 1);
    setShowPreview(true);
    markReady();

    const msg = uploadedHtmlContent
      ? `HTML file: ${uploadedHtmlFile}`
      : buildFiles.length
        ? `Build folder: ${buildFolder} (${buildFiles.length} files)`
        : "Template preview — no build folder loaded";
    toast.success("Preview Ready", msg);
  };

  const handleRefresh = () => {
    dispatch(resetOrders());
    const html = getPreviewHtml();
    setPreviewHtml(html);
    setPreviewKey(k => k + 1);

    const msg = uploadedHtmlContent
      ? `Reloaded: ${uploadedHtmlFile}`
      : buildFiles.length
        ? `Reloaded build: ${buildFolder}`
        : "window.x bridge active";
    toast.success("Refreshed", msg);
  };

  // ── Print ─────────────────────────────────
  const handlePrint = () => {
    const frame = printFrameRef.current;
    if (!frame) return;
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(previewHtml || getPreviewHtml()); doc.close();
    setTimeout(() => {
      try { frame.contentWindow?.focus(); frame.contentWindow?.print(); }
      catch { toast.error("Print Error", "Could not open print dialog"); }
    }, 350);
  };

  // ── Submit ────────────────────────────────
  const handleSubmit = () => {
    if (!typeName.trim() || !typeCode.trim()) {
      toast.error("Validation", "Dashboard Name and Code are required");
      return;
    }
    // Allow save if Firebase file uploaded, build folder loaded, or manual content present
    if (
      !firebaseFileUrl &&
      !htmlHeader.trim() && !htmlBody.trim() && !htmlFooter.trim()
    ) {
      toast.error("Validation", "Add HTML content, upload an HTML file, or upload a build folder");
      return;
    }
    const branchId    = localStorage.getItem("selectedBranch") || "";
    const hasFirebase = !!firebaseFileUrl;

    // When a Firebase file exists:
    //   → save the URL + metadata to MongoDB (tiny string, zero billing impact)
    //   → clear htmlBody / css / js so MongoDB doesn't store the 50 MB content
    // When using manual template fields (no Firebase file):
    //   → save htmlHeader/htmlBody/htmlFooter/css/js as before
    const dataToSave = {
      typeName, typeCode: typeCode.toUpperCase(), description, category,
      htmlHeader: hasFirebase ? "" : htmlHeader,
      htmlBody:   hasFirebase ? "" : htmlBody,
      htmlFooter: hasFirebase ? "" : htmlFooter,
      css:        hasFirebase ? "" : css,
      js:         hasFirebase ? "" : js,
      // Firebase fields — only populated when a file was uploaded
      fileUrl:    firebaseFileUrl,
      fileType:   firebaseFileType,
      fileName:   firebaseFileName,
      fileSize:   firebaseFileSize,
      branchId,
    };
    if (editMode && dashboardTypeId) {
      handleSave(
        () => dispatch(updateDashboardType(dashboardTypeId, dataToSave)) as unknown as Promise<void>,
        {
          onSuccess: () => {
            dispatch(resetOrders());
            toast.success("Updated", "Dashboard type updated successfully");
            setTimeout(() => { if (onSaveSuccess) onSaveSuccess(); else navigate(-1); }, 1500);
          },
        }
      );
    } else {
      handleSave(
        () => dispatch(createDashboardType(dataToSave)) as unknown as Promise<void>,
        {
          onSuccess: () => {
            dispatch(resetOrders());
            toast.success("Created", "Dashboard type created successfully");
            setTypeName(""); setTypeCode(""); setDescription(""); setCategory("analytics");
            setHtmlHeader(""); setHtmlBody(""); setHtmlFooter(""); setCss(""); setJs("");
            setBuildFolder(""); setBuildFiles([]);
            setUploadedHtmlFile(""); setUploadedHtmlContent("");
            setFirebaseFileUrl(""); setFirebaseFileType(""); setFirebaseFileName(""); setFirebaseFileSize(0); setUploadPct(0);
          },
        }
      );
    }
  };

  // ── Delete ────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== typeName.trim().toLowerCase()) {
      toast.error("Name Mismatch", `Type "${typeName}" to confirm deletion`);
      return;
    }
    if (!dashboardTypeId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteDashboardType(dashboardTypeId));
      dispatch(resetOrders());
      toast.success("Deleted", `"${typeName}" has been deleted`);
      setShowDeleteConfirm(false);
      setTimeout(() => { if (onSaveSuccess) onSaveSuccess(); else navigate(-1); }, 1000);
    } catch {
      toast.error("Delete Failed", "Something went wrong — please try again");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Derived labels ─────────────────────────
  const previewSourceLabel = uploadedHtmlContent
    ? `🌐 HTML: ${uploadedHtmlFile}`
    : buildFiles.length
      ? `📦 Build: ${buildFolder}`
      : "📝 Template";

  // ── Preview badge to show in modal ────────
  const renderPreviewBadge = () => {
    if (uploadedHtmlContent) {
      return (
        <span className="rtp-data-badge" style={{
          background: "#78350f22", color: "#d97706",
          border: "1px solid #78350f44", fontSize: 10,
          padding: "2px 8px", borderRadius: 4, fontWeight: 600,
        }}>
          🌐 {uploadedHtmlFile}
        </span>
      );
    }
    if (buildFiles.length > 0) {
      return (
        <span className="rtp-data-badge rtp-data-badge-build">
          📦 {buildFolder} ({buildFiles.length} files)
        </span>
      );
    }
    return (
      <span className="rtp-data-badge rtp-data-badge-bridge">⚡ postMessage bridge active</span>
    );
  };

  // ── Tab content ───────────────────────────
  const tabContent: Record<string, React.ReactNode> = {

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

    templates: (
      <>
        {/* ── Toolbar ── */}
        <div className="reporttype-export-bar">
          <button className="reporttype-btn reporttype-btn-purple" onClick={() => setShowLibrary(true)}>
            📊 Template Library
          </button>
          <button className="reporttype-btn reporttype-btn-blue" onClick={handleOpenPreview}>
            👁 Live Preview
          </button>
          {/* ── Upload single HTML file ── */}
          <input
            ref={htmlFileRef}
            type="file"
            accept=".html,.htm"
            onChange={handleHtmlFileSelect}
            style={{ display: "none" }}
          />
          <button
            className="reporttype-btn reporttype-btn-amber"
            style={{ background: "#d97706" }}
            disabled={isUploadingHtml}
            onClick={() => htmlFileRef.current?.click()}
          >
            {isUploadingHtml ? "⏳ Loading..." : "🌐 Upload HTML"}
          </button>

          {/* Show badge + clear button when an HTML file is loaded */}
          {uploadedHtmlFile && (
            <>
              <span style={{
                fontSize: 12, color: "#92400e", fontWeight: 600,
                padding: "6px 12px", background: "#fef3c7", borderRadius: 6,
                border: "1px solid #fcd34d",
              }}>
                🌐 {uploadedHtmlFile}
              </span>
              <button
                className="reporttype-btn reporttype-btn-danger"
                onClick={() => {
                  setUploadedHtmlFile("");
                  setUploadedHtmlContent("");
                  toast.success("Cleared", "HTML file removed");
                }}
                style={{ fontSize: 11, padding: "6px 12px" }}
              >
                ✕ Clear
              </button>
            </>
          )}

          {/* ── Build Folder ── */}
          <input
            ref={buildFolderRef}
            type="file"
            onChange={handleBuildFolderSelect}
            style={{ display: "none" }}
            {...{ webkitdirectory: "true", directory: "true" } as any}
          />
          <button
            className="reporttype-btn reporttype-btn-teal"
            onClick={() => buildFolderRef.current?.click()}
          >
            📁 Build Folder
          </button>
          {buildFolder && (
            <>
              <span style={{ fontSize: 12, color: "#059669", fontWeight: 600, padding: "6px 12px", background: "#d1fae5", borderRadius: 6 }}>
                ✓ {buildFolder} ({buildFiles.length} files)
              </span>
              <button
                className="reporttype-btn reporttype-btn-teal"
                onClick={() => setShowBuildExplorer(true)}
                style={{ fontSize: 11, padding: "6px 12px" }}
              >
                🔍 View Files
              </button>
              <button
                className="reporttype-btn reporttype-btn-danger"
                onClick={() => { setBuildFolder(""); setBuildFiles([]); toast.success("Cleared", "Build folder removed"); }}
                style={{ fontSize: 11, padding: "6px 12px" }}
              >
                ✕ Clear
              </button>
            </>
          )}
        </div>

        {/* ── Upload progress bar ── */}
        {isUploadingHtml && uploadPct > 0 && uploadPct < 100 && (
          <div style={{ margin: "0 0 12px", padding: "10px 14px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#0369a1", marginBottom: 6 }}>
              <span>⬆ Uploading to Firebase Storage…</span>
              <span>{uploadPct}%</span>
            </div>
            <div style={{ height: 6, background: "#e0f2fe", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${uploadPct}%`, background: "#0ea5e9", borderRadius: 4, transition: "width 0.3s" }} />
            </div>
          </div>
        )}

        {/* ── Firebase file saved banner ── */}
        {firebaseFileUrl && (
          <div style={{
            margin: "0 0 12px", padding: "10px 14px",
            background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8,
            fontSize: 12, color: "#15803d", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          }}>
            <div>
              <strong>✅ {firebaseFileType === "build" ? "📦 Build" : "🌐 HTML"} saved to Firebase</strong>
              {" — "}
              <code style={{ background: "#dcfce7", padding: "1px 5px", borderRadius: 3 }}>{firebaseFileName}</code>
              {firebaseFileSize > 0 && (
                <span style={{ marginLeft: 6, color: "#16a34a" }}>({(firebaseFileSize / 1024).toFixed(1)} KB)</span>
              )}
              <div style={{ marginTop: 3, fontSize: 10, color: "#4ade80", wordBreak: "break-all" }}>
                {firebaseFileUrl.substring(0, 80)}…
              </div>
            </div>
            <button
              style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#dc2626", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
              onClick={handleClearFirebaseFile}
            >
              ✕ Remove
            </button>
          </div>
        )}

        {/* ── Active source info banners (local preview only) ── */}

        {/* HTML file banner */}
        {uploadedHtmlContent && !firebaseFileUrl && (
          <div style={{
            margin: "0 0 16px", padding: "12px 16px",
            background: "#fffbeb", border: "1px solid #fcd34d",
            borderRadius: 8, fontSize: 12, color: "#92400e", lineHeight: 1.6,
          }}>
            <strong>🌐 HTML file loaded</strong> — uploading to Firebase…{" "}
            <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 3 }}>{uploadedHtmlFile}</code>
          </div>
        )}

        {/* Build folder banner */}
        {buildFiles.length > 0 && !uploadedHtmlContent && !firebaseFileUrl && (
          <div style={{
            margin: "0 0 16px", padding: "12px 16px",
            background: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: 8, fontSize: 12, color: "#1d4ed8", lineHeight: 1.6,
          }}>
            <strong>📦 Build folder loaded</strong> — uploading to Firebase…{" "}
            <code style={{ background: "#dbeafe", padding: "1px 5px", borderRadius: 3 }}>index.html</code>
          </div>
        )}

        {/* ── window.x Step-by-Step API Guide ── */}
        <WindowXGuide />
      </>
    ),
  };

  const saveBtnLabel =
    saveState === "saving" ? "⏳ Saving..." :
    saveState === "saved"  ? "✓ Saved!"    :
    editMode               ? "Update Dashboard Type" :
                             "Create Dashboard Type";

  const saveBtnClass = `reporttype-save-btn reporttype-save-btn-${saveState === "idle" ? "idle" : saveState}`;

  return (
    <div id="reporttype-container-css">

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

      <div className="reporttype-container">
        <div className="reporttype-form">
          {tabContent[activeTab]}
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

      <DashboardTemplateLibrary
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleSelectTemplate}
      />

      <BuildFolderExplorer
        isOpen={showBuildExplorer}
        onClose={() => setShowBuildExplorer(false)}
        files={buildFiles}
        folderName={buildFolder}
      />

      {/* ── Delete Modal ── */}
      {showDeleteConfirm && ReactDOM.createPortal(
        <>
          <style>{`
            .rtp-delete-overlay{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.75)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:9999998!important;padding:20px!important;box-sizing:border-box!important}
            .rtp-delete-box{background:#fff!important;border-radius:12px!important;width:100%!important;max-width:420px!important;padding:28px 24px!important;box-shadow:0 20px 50px rgba(0,0,0,.4)!important}
            .rtp-delete-icon{font-size:40px;text-align:center;margin-bottom:12px}
            .rtp-delete-title{font-size:17px;font-weight:700;color:#111827;text-align:center;margin-bottom:6px;font-family:system-ui,sans-serif}
            .rtp-delete-sub{font-size:12px;color:#6b7280;text-align:center;margin-bottom:18px;font-family:system-ui,sans-serif;line-height:1.5}
            .rtp-delete-label{font-size:12px;font-weight:600;color:#374151;margin-bottom:6px;font-family:system-ui,sans-serif}
            .rtp-delete-input{width:100%!important;padding:9px 12px!important;border:1.5px solid #e5e7eb!important;border-radius:7px!important;font-size:13px!important;outline:none!important;font-family:system-ui,sans-serif!important;box-sizing:border-box!important;margin-bottom:18px!important}
            .rtp-delete-input:focus{border-color:#ef4444!important;box-shadow:0 0 0 3px rgba(239,68,68,.12)!important}
            .rtp-delete-actions{display:flex;gap:10px;justify-content:flex-end}
            .rtp-delete-cancel-btn{padding:9px 20px!important;background:#f3f4f6!important;color:#374151!important;border:none!important;border-radius:7px!important;font-size:13px!important;font-weight:600!important;cursor:pointer!important}
            .rtp-delete-cancel-btn:hover{background:#e5e7eb!important}
            .rtp-delete-confirm-btn{padding:9px 20px!important;background:#ef4444!important;color:#fff!important;border:none!important;border-radius:7px!important;font-size:13px!important;font-weight:600!important;cursor:pointer!important;transition:opacity .15s!important}
            .rtp-delete-confirm-btn:disabled{opacity:.5!important;cursor:not-allowed!important}
            .rtp-delete-confirm-btn:not(:disabled):hover{opacity:.88!important}
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
                autoFocus className="rtp-delete-input" value={deleteConfirmText}
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

      {/* ── Preview Modal ── */}
      {showPreview && ReactDOM.createPortal(
        <>
          <style>{`
            .rtp-preview-overlay{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.88)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:999999!important;padding:20px!important;box-sizing:border-box!important}
            .rtp-preview-box{background:#1e293b!important;border-radius:12px!important;width:95vw!important;max-width:1100px!important;height:90vh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;box-shadow:0 25px 60px rgba(0,0,0,.6)!important}
            .rtp-preview-topbar{padding:10px 16px!important;background:#0f172a!important;border-bottom:1px solid #334155!important;display:flex!important;align-items:center!important;justify-content:space-between!important;flex-shrink:0!important;gap:10px!important;flex-wrap:wrap!important}
            .rtp-preview-topbar-title{color:#e2e8f0!important;font-weight:700!important;font-size:13px!important;font-family:system-ui,sans-serif!important}
            .rtp-preview-controls{display:flex!important;gap:8px!important;align-items:center!important;flex-wrap:wrap!important}
            .rtp-preview-info-bar{padding:7px 16px!important;background:#0f172a!important;border-bottom:1px solid #1e293b!important;font-size:11px!important;color:#64748b!important;flex-shrink:0!important;font-family:system-ui,sans-serif!important;line-height:1.6!important}
            .rtp-data-badge{font-size:10px!important;padding:2px 8px!important;border-radius:4px!important;font-weight:600!important;font-family:system-ui,sans-serif!important;flex-shrink:0!important}
            .rtp-data-badge-bridge{background:#6366f122!important;color:#818cf8!important;border:1px solid #6366f144!important}
            .rtp-data-badge-build{background:#05966922!important;color:#34d399!important;border:1px solid #05966944!important}
            .rtp-preview-print-btn{background:#22c55e!important;color:#fff!important;border:none!important;border-radius:6px!important;padding:6px 14px!important;font-size:12px!important;font-weight:600!important;cursor:pointer!important}
            .rtp-preview-print-btn:hover{opacity:.88!important}
            .rtp-refresh-btn{background:#6366f1!important;color:#fff!important;border:none!important;border-radius:6px!important;padding:6px 14px!important;font-size:12px!important;font-weight:600!important;cursor:pointer!important}
            .rtp-refresh-btn:hover{opacity:.88!important}
            .rtp-preview-close-btn{background:#ef4444!important;color:#fff!important;border:none!important;border-radius:6px!important;padding:6px 14px!important;font-size:12px!important;font-weight:600!important;cursor:pointer!important}
            .rtp-preview-body{flex:1!important;overflow:auto!important;background:#374151!important;padding:20px!important;display:flex!important;justify-content:center!important}
            .rtp-preview-paper{background:#fff!important;width:100%!important;min-height:500px!important;border-radius:4px!important;box-shadow:0 4px 24px rgba(0,0,0,.4)!important}
            .rtp-preview-paper iframe{width:100%!important;height:100%!important;min-height:700px!important;border:none!important;border-radius:4px!important;display:block!important}
            .rtp-preview-footer{padding:6px 16px!important;background:#0f172a!important;border-top:1px solid #334155!important;font-size:10px!important;color:#475569!important;display:flex!important;justify-content:space-between!important;flex-shrink:0!important;font-family:system-ui,sans-serif!important}
          `}</style>
          <div className="rtp-preview-overlay" onClick={() => setShowPreview(false)}>
            <div className="rtp-preview-box" onClick={(e) => e.stopPropagation()}>

              <div className="rtp-preview-topbar">
                <span className="rtp-preview-topbar-title">
                  👁 Preview — {typeName || "Untitled Dashboard"}
                </span>
                <div className="rtp-preview-controls">
                  {renderPreviewBadge()}
                  <button className="rtp-refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
                  <button className="rtp-preview-print-btn" onClick={handlePrint}>🖨️ Print</button>
                  <button className="rtp-preview-close-btn" onClick={() => setShowPreview(false)}>✕ Close</button>
                </div>
              </div>

              <div className="rtp-preview-info-bar">
                {uploadedHtmlContent
                  ? `🌐 Rendering uploaded HTML file: ${uploadedHtmlFile} — displayed exactly as-is inside a sandboxed iframe.`
                  : buildFiles.length > 0
                    ? `📦 Rendering build folder — CSS, JS, and images fully inlined. Dynamic imports and CDN scripts load normally. Check browser console for [BuildPreview] logs.`
                    : `💡 Template calls window.x.fetch({"{...}"}) — parent fetches with real token, data sent back securely.`
                }
              </div>

              <div className="rtp-preview-body">
                <div className="rtp-preview-paper">
                  <iframe
                    key={previewKey}
                    title="dashboard-preview"
                    srcDoc={previewHtml}
                    sandbox="allow-scripts allow-forms allow-popups allow-modals"
                  />
                </div>
              </div>

              <div className="rtp-preview-footer">
                <span>{typeName || "Untitled"} · {category} · {previewSourceLabel}{editMode ? " · Saved" : " · Unsaved draft"}</span>
                <span style={{ opacity: .5 }}>Press ESC to close</span>
              </div>

            </div>
          </div>
        </>,
        document.body
      )}

      <iframe
        ref={printFrameRef}
        title="print-frame"
        style={{ position:"fixed", right:0, bottom:0, width:0, height:0, border:"none", visibility:"hidden" }}
      />

      <Toast toasts={toast.toasts} remove={toast.remove} />
    </div>
  );
};

export default CreateDashboardType;