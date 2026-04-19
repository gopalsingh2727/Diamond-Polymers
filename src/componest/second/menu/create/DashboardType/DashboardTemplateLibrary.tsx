// ─────────────────────────────────────────────────────────────────────────────
// DashboardTemplateLibrary.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import ReactDOM from "react-dom";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INTERACTIVE JS
// ─────────────────────────────────────────────────────────────────────────────
const SHARED_INTERACTIVE_JS = `
(function() {
  window._iState = { page: 'home', sortCol: null, sortAsc: true };

  window.drillStatus = function(status) {
    _resetFilters(false);
    if (status !== 'all') {
      var chk = document.querySelector('.i-chk-status[value="' + status + '"]');
      if (chk) chk.checked = true;
    }
    var label = status === 'all' ? 'All Orders' : _cap(status) + ' Orders';
    _openDrill(label, 'Status: ' + (status === 'all' ? 'All' : status));
    _applyFilters();
  };

  window.drillCategory = function(cat) {
    _resetFilters(false);
    var chk = document.querySelector('.i-chk-type[value="' + cat + '"]');
    if (chk) chk.checked = true;
    _openDrill(cat + ' Orders', 'Category: ' + cat);
    _applyFilters();
  };

  window.drillPriority = function(pr) {
    _resetFilters(false);
    var chk = document.querySelector('.i-chk-priority[value="' + pr + '"]');
    if (chk) chk.checked = true;
    _openDrill(_cap(pr) + ' Priority', 'Priority: ' + pr);
    _applyFilters();
  };

  window.goHome = function() {
    _resetFilters(false);
    document.getElementById('i-page-home').style.display  = '';
    document.getElementById('i-page-drill').style.display = 'none';
    window._iState.page = 'home';
    window._animateBars && window._animateBars();
  };

  function _openDrill(label, context) {
    document.getElementById('i-page-home').style.display  = 'none';
    document.getElementById('i-page-drill').style.display = '';
    window._iState.page = 'drill';
    var el = document.getElementById('i-bc-label');    if (el) el.textContent = label;
    var tl = document.getElementById('i-drill-title'); if (tl) tl.textContent = label;
    var cx = document.getElementById('i-ctx');         if (cx) cx.textContent = context;
  }

  window.applyFilters = function() { _applyFilters(); };
  function _applyFilters() {
    var status   = Array.from(document.querySelectorAll('.i-chk-status:checked')).map(function(c){return c.value;});
    var priority = Array.from(document.querySelectorAll('.i-chk-priority:checked')).map(function(c){return c.value;});
    var types    = Array.from(document.querySelectorAll('.i-chk-type:checked')).map(function(c){return c.value;});
    var search   = (document.getElementById('i-search')      || {}).value || '';
    var customer = (document.getElementById('i-cust-search') || {}).value || '';
    search   = search.toLowerCase();
    customer = customer.toLowerCase();
    var count = 0;
    document.querySelectorAll('#i-tbody tr').forEach(function(row) {
      var st  = (row.dataset.status   || '').toLowerCase();
      var pr  = (row.dataset.priority || '').toLowerCase();
      var tp  = (row.dataset.type     || '');
      var oid = (row.dataset.orderid  || '').toLowerCase();
      var cus = (row.dataset.customer || '').toLowerCase();
      var show = (status.length   === 0 || status.includes(st))
              && (priority.length === 0 || priority.includes(pr))
              && (types.length    === 0 || types.includes(tp))
              && (!search   || oid.includes(search) || cus.includes(search) || tp.toLowerCase().includes(search))
              && (!customer || cus.includes(customer));
      row.style.display = show ? '' : 'none';
      if (show) count++;
    });
    window._updateCount && window._updateCount(count);
    var nr = document.getElementById('i-no-results');
    if (nr) nr.style.display = count === 0 ? '' : 'none';
  }

  window.resetFilters = function() { _resetFilters(true); };
  function _resetFilters(reApply) {
    document.querySelectorAll('.i-chk-status,.i-chk-priority,.i-chk-type').forEach(function(c){ c.checked = false; });
    var s  = document.getElementById('i-search');      if (s)  s.value = '';
    var cs = document.getElementById('i-cust-search'); if (cs) cs.value = '';
    if (reApply !== false) {
      document.querySelectorAll('#i-tbody tr').forEach(function(r){ r.style.display = ''; });
      window._updateCount && window._updateCount();
      var nr = document.getElementById('i-no-results'); if (nr) nr.style.display = 'none';
    }
  }

  var _sortState = {};
  window.sortBy = function(col) {
    _sortState[col] = !_sortState[col];
    var asc = _sortState[col];
    document.querySelectorAll('.i-sort-icon').forEach(function(el){ el.textContent = ''; });
    var ic = document.getElementById('i-sort-' + col); if (ic) ic.textContent = asc ? ' \u25b2' : ' \u25bc';
    var tbody = document.getElementById('i-tbody'); if (!tbody) return;
    var rows  = Array.from(tbody.querySelectorAll('tr'));
    var pOrder = { urgent:0, high:1, normal:2, low:3 };
    rows.sort(function(a, b) {
      if (col === 'priority') {
        var pa = pOrder[a.dataset.priority] !== undefined ? pOrder[a.dataset.priority] : 9;
        var pb = pOrder[b.dataset.priority] !== undefined ? pOrder[b.dataset.priority] : 9;
        return asc ? pa - pb : pb - pa;
      }
      var map = { index:'rowindex', orderId:'orderid', customerName:'customer', orderTypeName:'type', totalAmount:'amount', overallStatus:'status' };
      var key = map[col] || col;
      var va  = a.dataset[key] || '', vb = b.dataset[key] || '';
      if (col === 'totalAmount' || col === 'index') {
        return asc ? (parseFloat(va)||0)-(parseFloat(vb)||0) : (parseFloat(vb)||0)-(parseFloat(va)||0);
      }
      return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    rows.forEach(function(r){ tbody.appendChild(r); });
    _applyFilters();
  };

  window.exportCSV = function() {
    var rows    = Array.from(document.querySelectorAll('#i-tbody tr'));
    var visible = rows.filter(function(r){ return r.style.display !== 'none'; });
    var lines   = ['#,Order ID,Customer,Type,Amount,Status,Priority'];
    visible.forEach(function(r, i) {
      lines.push([
        i+1,
        r.dataset.orderid   || '',
        '"'+(r.dataset.customer||'').replace(/"/g,'""')+'"',
        '"'+(r.dataset.type   ||'').replace(/"/g,'""')+'"',
        r.dataset.amount   || '',
        r.dataset.status   || '',
        r.dataset.priority || '',
      ].join(','));
    });
    var blob = new Blob([lines.join('\\n')], { type:'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'orders_export.csv';
    a.click();
  };

  window._updateCount = function(n) {
    var badge = document.getElementById('i-count'); if (!badge) return;
    if (n === undefined) n = document.querySelectorAll('#i-tbody tr').length;
    badge.textContent = n;
  };

  window._animateBars = function() {
    document.querySelectorAll('[data-bar]').forEach(function(bar) {
      var target = bar.getAttribute('data-bar');
      bar.style.width = '0';
      bar.style.transition = 'width .7s ease';
      setTimeout(function(){ bar.style.width = target; }, 120);
    });
  };

  function _cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
})();
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INTERACTIVE CSS
// ─────────────────────────────────────────────────────────────────────────────
const SHARED_INTERACTIVE_CSS = `
.i-clickable{cursor:pointer;transition:transform .18s ease,box-shadow .18s ease!important}
.i-clickable:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,.2)!important}
.i-drill-wrap{padding:0 24px 24px}
.i-drill-topbar{display:flex;align-items:center;gap:10px;padding:12px 0 16px;flex-wrap:wrap}
.i-back-btn{background:#1e1b4b;color:#fff;border:none;padding:8px 16px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer}
.i-back-btn:hover{background:#3730a3}
.i-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:#6b7280}
.i-bc-home{cursor:pointer;color:#6366f1;font-weight:600}.i-bc-home:hover{text-decoration:underline}
.i-bc-sep{color:#d1d5db}.i-bc-cur{font-weight:700;color:#111827}
.i-toolbar-right{margin-left:auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.i-search-box{border:1px solid #e5e7eb;border-radius:7px;padding:7px 12px;font-size:12px;width:240px;outline:none}
.i-search-box:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12)}
.i-cust-box{border:1px solid #e5e7eb;border-radius:6px;padding:6px 10px;font-size:11.5px;width:100%;outline:none;margin-top:4px}
.i-csv-btn{background:linear-gradient(135deg,#059669,#047857);color:#fff;border:none;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer}
.i-count-wrap{font-size:12px;color:#6b7280;white-space:nowrap}
.i-count-badge{background:#4f46e5;color:#fff;padding:2px 10px;border-radius:10px;font-weight:700;font-size:12px;margin:0 3px}
.i-drill-layout{display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:flex-start}
.i-sidebar{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;position:sticky;top:16px}
.i-sb-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;font-size:12px;font-weight:700;color:#1e1b4b}
.i-reset-btn{background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;padding:4px 10px;border-radius:5px;font-size:10.5px;font-weight:600;cursor:pointer}
.i-reset-btn:hover{background:#e5e7eb}
.i-filter-group{margin-bottom:14px}
.i-fg-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#6b7280;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #f3f4f6}
.i-filter-check{display:flex;align-items:center;gap:7px;font-size:11.5px;color:#374151;margin-bottom:6px;cursor:pointer;user-select:none}
.i-filter-check input[type="checkbox"]{width:14px;height:14px;accent-color:#6366f1;cursor:pointer}
.i-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}
.i-dot-u{background:#ef4444}.i-dot-h{background:#eab308}.i-dot-n{background:#3b82f6}.i-dot-l{background:#d1d5db}
.i-ctx-box{background:#f9fafb;border-radius:7px;padding:10px}
.i-ctx-text{font-size:11px;color:#4b5563;line-height:1.6}
.i-table-area{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}
.i-tbl-toolbar{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #f3f4f6;background:#fafafa}
.i-tbl-title{font-size:13px;font-weight:700;color:#1e1b4b}
.i-tbl-hint{font-size:10.5px;color:#9ca3af;font-style:italic}
.i-orders-tbl{width:100%;border-collapse:collapse;font-size:11.5px}
.i-orders-tbl thead tr{background:#1e1b4b;color:#fff}
.i-sortable{padding:8px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;cursor:pointer;user-select:none;white-space:nowrap}
.i-sortable:hover{background:#3730a3}
.i-sort-icon{font-size:9px;margin-left:4px;opacity:.7}
.i-orders-tbl td{padding:8px 10px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
.i-orders-tbl tbody tr:hover{background:#f5f3ff}
.i-orders-tbl tbody tr:nth-child(even){background:#fafafa}
.i-orders-tbl tbody tr:nth-child(even):hover{background:#f5f3ff}
.i-code{font-family:'JetBrains Mono',monospace;font-size:10px;background:#e5e7eb;padding:2px 6px;border-radius:4px;color:#374151}
.i-muted{color:#9ca3af}
.i-st{padding:3px 9px;border-radius:8px;font-size:10px;font-weight:600;text-transform:capitalize;white-space:nowrap}
.i-st-completed{background:#d1fae5;color:#065f46}
.i-st-pending{background:#fef3c7;color:#92400e}
.i-st-in-progress{background:#dbeafe;color:#1e40af}
.i-st-approved{background:#ede9fe;color:#5b21b6}
.i-st-dispatched{background:#f0fdfa;color:#0f766e}
.i-st-cancelled{background:#fee2e2;color:#991b1b}
.i-pr{padding:3px 9px;border-radius:8px;font-size:9.5px;font-weight:700;text-transform:uppercase}
.i-pr-urgent{background:#fecaca;color:#7f1d1d}
.i-pr-high{background:#fef08a;color:#713f12}
.i-pr-normal{background:#e0f2fe;color:#0c4a6e}
.i-pr-low{background:#f3f4f6;color:#6b7280}
.i-no-results{text-align:center;padding:40px 20px;color:#9ca3af;font-size:13px}
.i-arrow-hint{opacity:0;transition:opacity .15s;color:#6366f1;font-weight:700;margin-left:4px;font-size:13px}
.i-clickable:hover .i-arrow-hint{opacity:1}
.i-loading-row td{text-align:center;padding:40px;color:#9ca3af;font-size:12px}
`;

// ─────────────────────────────────────────────────────────────────────────────
// DRILL PAGE HTML
// ─────────────────────────────────────────────────────────────────────────────
const drillPage = () => `
<div id="i-page-drill" style="display:none;" class="i-drill-wrap">
  <div class="i-drill-topbar">
    <button class="i-back-btn" onclick="goHome()">← Back to Overview</button>
    <div class="i-breadcrumb">
      <span class="i-bc-home" onclick="goHome()">📊 Overview</span>
      <span class="i-bc-sep">›</span>
      <span class="i-bc-cur" id="i-bc-label">Orders</span>
    </div>
    <div class="i-toolbar-right">
      <input id="i-search" class="i-search-box" type="text" placeholder="🔍 Search order ID / customer / type…" oninput="applyFilters()">
      <button class="i-csv-btn" onclick="exportCSV()">⬇ Export CSV</button>
      <span class="i-count-wrap">Showing <span class="i-count-badge" id="i-count">—</span> orders</span>
    </div>
  </div>
  <div class="i-drill-layout">
    <aside class="i-sidebar">
      <div class="i-sb-head"><span>🎛️ Filters</span><button class="i-reset-btn" onclick="resetFilters()">Reset</button></div>
      <div class="i-filter-group">
        <div class="i-fg-title">🔍 Customer Search</div>
        <input id="i-cust-search" class="i-cust-box" type="text" placeholder="Customer name…" oninput="applyFilters()">
      </div>
      <div class="i-filter-group">
        <div class="i-fg-title">📦 Status</div>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-status" value="completed"   onchange="applyFilters()"> ✅ Completed</label>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-status" value="pending"     onchange="applyFilters()"> ⏳ Pending</label>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-status" value="in-progress" onchange="applyFilters()"> 🔵 In Progress</label>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-status" value="approved"    onchange="applyFilters()"> ✔ Approved</label>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-status" value="dispatched"  onchange="applyFilters()"> 🚚 Dispatched</label>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-status" value="cancelled"   onchange="applyFilters()"> ❌ Cancelled</label>
      </div>
      <div class="i-filter-group">
        <div class="i-fg-title">🔥 Priority</div>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-priority" value="urgent" onchange="applyFilters()"> <span class="i-dot i-dot-u"></span> Urgent</label>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-priority" value="high"   onchange="applyFilters()"> <span class="i-dot i-dot-h"></span> High</label>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-priority" value="normal" onchange="applyFilters()"> <span class="i-dot i-dot-n"></span> Normal</label>
        <label class="i-filter-check"><input type="checkbox" class="i-chk-priority" value="low"    onchange="applyFilters()"> <span class="i-dot i-dot-l"></span> Low</label>
      </div>
      <div class="i-filter-group">
        <div class="i-fg-title">🗂️ Order Type</div>
        <div id="i-type-filters"></div>
      </div>
      <div class="i-filter-group i-ctx-box">
        <div class="i-fg-title">ℹ️ Context</div>
        <div id="i-ctx" class="i-ctx-text">All orders</div>
      </div>
    </aside>
    <div class="i-table-area">
      <div class="i-tbl-toolbar">
        <div class="i-tbl-title" id="i-drill-title">Orders</div>
        <div class="i-tbl-hint">Click column headers to sort</div>
      </div>
      <div style="overflow-x:auto;">
        <table class="i-orders-tbl">
          <thead>
            <tr>
              <th onclick="sortBy('index')"        class="i-sortable"># <span class="i-sort-icon" id="i-sort-index"></span></th>
              <th onclick="sortBy('orderId')"       class="i-sortable">Order ID <span class="i-sort-icon" id="i-sort-orderId"></span></th>
              <th onclick="sortBy('customerName')"  class="i-sortable">Customer <span class="i-sort-icon" id="i-sort-customerName"></span></th>
              <th onclick="sortBy('orderTypeName')" class="i-sortable">Type <span class="i-sort-icon" id="i-sort-orderTypeName"></span></th>
              <th onclick="sortBy('totalAmount')"   class="i-sortable">Amount <span class="i-sort-icon" id="i-sort-totalAmount"></span></th>
              <th onclick="sortBy('overallStatus')" class="i-sortable">Status <span class="i-sort-icon" id="i-sort-overallStatus"></span></th>
              <th onclick="sortBy('priority')"      class="i-sortable">Priority <span class="i-sort-icon" id="i-sort-priority"></span></th>
            </tr>
          </thead>
          <tbody id="i-tbody">
            <tr class="i-loading-row"><td colspan="7">⏳ Loading orders...</td></tr>
          </tbody>
        </table>
        <div id="i-no-results" class="i-no-results" style="display:none;">
          <div style="font-size:36px;margin-bottom:10px;">🔍</div>
          <div>No orders match the current filters</div>
          <button class="i-reset-btn" onclick="resetFilters()" style="margin-top:10px;">Clear Filters</button>
        </div>
      </div>
    </div>
  </div>
</div>`;

function wrap(homeBody: string): string {
  return `<div id="i-page-home">${homeBody}</div>${drillPage()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD HELPER
// ─────────────────────────────────────────────────────────────────────────────
const kpiCard = (cls: string, icon: string, label: string, clickHandler?: string) => {
  const clickAttr = clickHandler ? ` onclick="${clickHandler}"` : "";
  const clickCls  = clickHandler ? " i-clickable" : "";
  const arrow     = clickHandler ? `<span class="i-arrow-hint">→</span>` : "";
  return `<div class="exec-kpi ${cls}${clickCls}"${clickAttr}>
  <div class="exec-kpi-icon">${icon}</div>
  <div class="exec-kpi-val" id="kpi-${label.toLowerCase().replace(/\s+/g, '-')}">—</div>
  <div class="exec-kpi-label">${label} ${arrow}</div>
</div>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
export const DASHBOARD_TEMPLATE_LIBRARY = [
  {
    name: "Executive Summary Dashboard",
    description: "KPI cards with drill-down table, filters, search & CSV export. Data loaded via window.x postMessage bridge — no API key in template.",
    icon: "📊",

    htmlHeader: `<header class="exec-header">
  <div class="exec-brand">
    <h1>Order Dashboard</h1>
  </div>
  <div class="exec-meta">
    <div class="exec-badge">EXECUTIVE DASHBOARD</div>
    <p><strong>Generated:</strong> <span id="generatedAt">—</span> <span id="generatedTime">—</span></p>
  </div>
</header>`,

    htmlBody: wrap(`<section class="exec-body">
  <div class="exec-kpi-grid">
    ${kpiCard("exec-kpi-blue",   "📦", "Total Orders",   "drillStatus('all')")}
    ${kpiCard("exec-kpi-green",  "✅", "Completed",      "drillStatus('completed')")}
    ${kpiCard("exec-kpi-amber",  "⏳", "Pending",        "drillStatus('pending')")}
    ${kpiCard("exec-kpi-indigo", "🔵", "In Progress",    "drillStatus('in-progress')")}
    ${kpiCard("exec-kpi-teal",   "🚚", "Dispatched",     "drillStatus('dispatched')")}
    ${kpiCard("exec-kpi-rose",   "⚡", "On-Time Rate")}
    ${kpiCard("exec-kpi-purple", "💰", "Total Revenue")}
    ${kpiCard("exec-kpi-slate",  "👥", "Customers")}
  </div>
  <div class="exec-row-2">
    <div class="exec-card">
      <h4 class="exec-card-title">💰 Revenue Breakdown</h4>
      <div class="exec-rev-list">
        <div class="exec-rev-item"><span>Total Revenue</span>    <strong class="exec-c-indigo" id="totalRevenue">—</strong></div>
        <div class="exec-rev-item"><span>Completed Revenue</span><strong class="exec-c-green"  id="completedRevenue">—</strong></div>
        <div class="exec-rev-item"><span>Pending Revenue</span>  <strong class="exec-c-amber"  id="pendingRevenue">—</strong></div>
        <div class="exec-rev-item"><span>Avg Order Value</span>  <strong id="avgOrderValue">—</strong></div>
      </div>
    </div>
    <div class="exec-card">
      <h4 class="exec-card-title">👤 Customer Summary</h4>
      <div class="exec-rev-list">
        <div class="exec-rev-item"><span>Total Customers</span><strong id="totalCustomers">—</strong></div>
        <div class="exec-rev-item"><span>Top Customer</span>   <strong id="topCustomer">—</strong></div>
        <div class="exec-rev-item"><span>Total Items</span>    <strong id="totalItems">—</strong></div>
        <div class="exec-rev-item"><span>Total Qty</span>      <strong id="totalQuantity">—</strong></div>
      </div>
    </div>
  </div>
  <div class="exec-card exec-card-full">
    <h4 class="exec-card-title">🔥 Priority Distribution <small style="font-weight:400;color:#9ca3af;">— click to drill down</small></h4>
    <div class="exec-prio-strip">
      <div class="exec-prio-item exec-pr-urgent i-clickable" onclick="drillPriority('urgent')">
        <span>⚡ Urgent</span><strong id="urgentOrders">—</strong><span class="i-arrow-hint">→</span>
      </div>
      <div class="exec-prio-item exec-pr-high i-clickable" onclick="drillPriority('high')">
        <span>🔴 High</span><strong id="highOrders">—</strong><span class="i-arrow-hint">→</span>
      </div>
      <div class="exec-prio-item exec-pr-normal i-clickable" onclick="drillPriority('normal')">
        <span>🔵 Normal</span><strong id="normalOrders">—</strong><span class="i-arrow-hint">→</span>
      </div>
      <div class="exec-prio-item exec-pr-low i-clickable" onclick="drillPriority('low')">
        <span>⚪ Low</span><strong id="lowOrders">—</strong><span class="i-arrow-hint">→</span>
      </div>
    </div>
  </div>
  <div class="exec-card exec-card-full">
    <h4 class="exec-card-title">📡 Order Source Breakdown</h4>
    <div class="exec-prio-strip">
      <div class="exec-prio-item" style="background:#f0f9ff;color:#0c4a6e;"><span>🏢 Internal</span><strong id="internalOrders">—</strong></div>
      <div class="exec-prio-item" style="background:#fdf4ff;color:#7e22ce;"><span>🔌 API</span><strong id="apiOrders">—</strong></div>
      <div class="exec-prio-item" style="background:#f0fdf4;color:#14532d;"><span>🌐 Website</span><strong id="websiteOrders">—</strong></div>
      <div class="exec-prio-item" style="background:#fff7ed;color:#7c2d12;"><span>📱 Mobile</span><strong id="mobileOrders">—</strong></div>
    </div>
  </div>
</section>`),

    htmlFooter: `<footer class="exec-footer">
  <p>Generated: <span id="generatedAtFooter">—</span></p>
</footer>`,

    css: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.exec-header{display:flex;justify-content:space-between;align-items:flex-start;padding:24px 28px 18px;background:linear-gradient(135deg,#1e1b4b,#312e81);color:#fff;margin-bottom:20px}
.exec-brand h1{font-size:18px;font-weight:700}
.exec-meta{text-align:right}
.exec-badge{background:#6366f1;color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.exec-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.exec-body{padding:0 28px 20px}
.exec-kpi-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:10px;margin-bottom:18px}
.exec-kpi{border-radius:8px;padding:12px 8px;text-align:center;border:1.5px solid transparent}
.exec-kpi-icon{font-size:18px;margin-bottom:5px}
.exec-kpi-val{font-size:16px;font-weight:700;margin-bottom:3px}
.exec-kpi-label{font-size:9.5px;font-weight:500;opacity:.75;text-transform:uppercase;letter-spacing:.4px}
.exec-kpi-blue{background:#eff6ff;color:#1d4ed8}
.exec-kpi-green{background:#f0fdf4;color:#15803d}
.exec-kpi-amber{background:#fffbeb;color:#b45309}
.exec-kpi-indigo{background:#eef2ff;color:#4338ca}
.exec-kpi-teal{background:#f0fdfa;color:#0f766e}
.exec-kpi-rose{background:#fff1f2;color:#be123c}
.exec-kpi-purple{background:#faf5ff;color:#7e22ce}
.exec-kpi-slate{background:#f8fafc;color:#334155}
.exec-row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.exec-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-bottom:14px}
.exec-card-full{margin-bottom:14px}
.exec-card-title{font-size:11px;font-weight:700;color:#1e1b4b;margin-bottom:10px;padding-left:8px;border-left:3px solid #6366f1;text-transform:uppercase;letter-spacing:.6px}
.exec-rev-list{display:flex;flex-direction:column;gap:7px}
.exec-rev-item{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#f9fafb;border-radius:5px;border:1px solid #f3f4f6;font-size:11.5px}
.exec-c-indigo{color:#4338ca;font-size:14px}
.exec-c-green{color:#059669}
.exec-c-amber{color:#d97706}
.exec-prio-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.exec-prio-item{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.exec-pr-urgent{background:#fef2f2;color:#7f1d1d}
.exec-pr-high{background:#fefce8;color:#713f12}
.exec-pr-normal{background:#eff6ff;color:#1e40af}
.exec-pr-low{background:#f9fafb;color:#6b7280}
.exec-footer{padding:10px 28px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
${SHARED_INTERACTIVE_CSS}`,

  js: `
document.addEventListener('DOMContentLoaded', async function() {

  // Set timestamps
  var now = new Date();
  var dateStr = now.toLocaleDateString('en-IN');
  var timeStr = now.toLocaleTimeString('en-IN');
  document.querySelectorAll('#generatedAt').forEach(function(el){ el.textContent = dateStr; });
  document.querySelectorAll('#generatedTime').forEach(function(el){ el.textContent = timeStr; });
  var footer = document.getElementById('generatedAtFooter');
  if (footer) footer.textContent = dateStr + ' ' + timeStr;

  try {
    var data = await window.x.fetch({
      all:        { type: 'all' },
      completed:  { type: 'byStatus',   status: 'completed' },
      pending:    { type: 'byStatus',   status: 'pending' },
      inprogress: { type: 'byStatus',   status: 'in-progress' },
      dispatched: { type: 'byStatus',   status: 'dispatched' },
      approved:   { type: 'byStatus',   status: 'approved' },
      cancelled:  { type: 'byStatus',   status: 'cancelled' },
      urgent:     { type: 'byPriority', priority: 'urgent' },
      high:       { type: 'byPriority', priority: 'high' },
      normal:     { type: 'byPriority', priority: 'normal' },
      low:        { type: 'byPriority', priority: 'low' },
    });

    var all        = data.all        || [];
    var completed  = data.completed  || [];
    var pending    = data.pending    || [];
    var inprogress = data.inprogress || [];
    var dispatched = data.dispatched || [];
    var approved   = data.approved   || [];
    var cancelled  = data.cancelled  || [];

    // ── Helpers ──────────────────────────────────────────────────
    function set(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    function fmt(n) {
      return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    }

    function calcRevenue(orders) {
      return orders.reduce(function(sum, o) {
        var opts = Array.isArray(o.options) ? o.options : [];
        return sum + opts.reduce(function(s, op) {
          return s + (parseFloat(op.totalAmount) || 0);
        }, 0);
      }, 0);
    }

    // ── FIXED: safely convert any source value to string ─────────
    // o.source may be a string, object, array, or null — handle all
    function sourceToString(source) {
      if (!source) return '';
      if (typeof source === 'string') return source.toLowerCase();
      if (Array.isArray(source))      return source.join(' ').toLowerCase();
      if (typeof source === 'object') return JSON.stringify(source).toLowerCase();
      return String(source).toLowerCase();
    }

    // ── KPI Cards ────────────────────────────────────────────────
    set('kpi-total-orders', all.length);
    set('kpi-completed',    completed.length);
    set('kpi-pending',      pending.length);
    set('kpi-in-progress',  inprogress.length);
    set('kpi-dispatched',   dispatched.length);

    // On-time rate
    var onTime = completed.filter(function(o) {
      return o.scheduledEndDate && o.dispatchedDate &&
        new Date(o.dispatchedDate) <= new Date(o.scheduledEndDate);
    });
    set('kpi-on-time-rate', all.length
      ? Math.round(onTime.length / all.length * 100) + '%'
      : '—');

    // Revenue
    var totalRev     = calcRevenue(all);
    var completedRev = calcRevenue(completed);
    var pendingRev   = calcRevenue(pending);
    set('kpi-total-revenue', fmt(totalRev));
    set('totalRevenue',      fmt(totalRev));
    set('completedRevenue',  fmt(completedRev));
    set('pendingRevenue',    fmt(pendingRev));
    set('avgOrderValue',     all.length ? fmt(totalRev / all.length) : '—');

    // Customers
    var custMap = {};
    all.forEach(function(o) {
      if (o.customerName) custMap[o.customerName] = (custMap[o.customerName] || 0) + 1;
    });
    var custList = Object.keys(custMap);
    set('kpi-customers',  custList.length);
    set('totalCustomers', custList.length);
    var topCust = custList.sort(function(a, b) { return custMap[b] - custMap[a]; })[0];
    set('topCustomer', topCust || '—');

    // Items and quantity
    var totalItems = 0, totalQty = 0;
    all.forEach(function(o) {
      var opts = Array.isArray(o.options) ? o.options : [];
      totalItems += opts.length;
      opts.forEach(function(op) { totalQty += (parseInt(op.quantity) || 0); });
    });
    set('totalItems',    totalItems);
    set('totalQuantity', totalQty);

    // Priority
    set('urgentOrders', (data.urgent || []).length);
    set('highOrders',   (data.high   || []).length);
    set('normalOrders', (data.normal || []).length);
    set('lowOrders',    (data.low    || []).length);

    // ── Source breakdown — FIXED with sourceToString() ───────────
    var src = { internal: 0, api: 0, website: 0, mobile: 0 };
    all.forEach(function(o) {
      var s = sourceToString(o.source);
      if      (s.includes('internal'))                     src.internal++;
      else if (s.includes('api'))                          src.api++;
      else if (s.includes('web'))                          src.website++;
      else if (s.includes('mobile') || s.includes('app')) src.mobile++;
    });
    set('internalOrders', src.internal);
    set('apiOrders',      src.api);
    set('websiteOrders',  src.website);
    set('mobileOrders',   src.mobile);

    // ── Drill-down table ─────────────────────────────────────────
    var tbody = document.getElementById('i-tbody');
    if (tbody && all.length) {
      tbody.innerHTML = '';
      all.forEach(function(o, i) {
        var opts   = Array.isArray(o.options) ? o.options : [];
        var amount = opts.reduce(function(s, op) { return s + (parseFloat(op.totalAmount) || 0); }, 0);
        var st     = (o.overallStatus || '').toLowerCase().replace(/_/g, '-');
        var pr     = (o.priority || 'normal').toLowerCase();
        var tr     = document.createElement('tr');
        tr.dataset.rowindex  = String(i + 1);
        tr.dataset.orderid   = o.orderId       || '';
        tr.dataset.customer  = o.customerName  || '';
        tr.dataset.type      = o.orderTypeName || '';
        tr.dataset.amount    = String(amount);
        tr.dataset.status    = st;
        tr.dataset.priority  = pr;
        tr.innerHTML = [
          '<td>' + (i + 1) + '</td>',
          '<td><span class="i-code">' + (o.orderId || '—') + '</span></td>',
          '<td>' + (o.customerName  || '<span class="i-muted">—</span>') + '</td>',
          '<td>' + (o.orderTypeName || '<span class="i-muted">—</span>') + '</td>',
          '<td>' + (amount > 0 ? fmt(amount) : '<span class="i-muted">—</span>') + '</td>',
          '<td><span class="i-st i-st-' + st + '">' + (o.overallStatus || '—') + '</span></td>',
          '<td><span class="i-pr i-pr-' + pr + '">' + pr + '</span></td>',
        ].join('');
        tbody.appendChild(tr);
      });
      window._updateCount && window._updateCount(all.length);
    }

    // ── Order type filter chips ───────────────────────────────────
    var typeMap = {};
    all.forEach(function(o) { if (o.orderTypeName) typeMap[o.orderTypeName] = true; });
    var tf = document.getElementById('i-type-filters');
    if (tf) {
      tf.innerHTML = '';
      Object.keys(typeMap).forEach(function(t) {
        var label = document.createElement('label');
        label.className = 'i-filter-check';
        label.innerHTML = '<input type="checkbox" class="i-chk-type" value="' + t + '" onchange="applyFilters()"> ' + t;
        tf.appendChild(label);
      });
    }

    window._animateBars && window._animateBars();

  } catch (err) {
    console.error('[dashboard] window.x fetch failed:', err);
    var tbody = document.getElementById('i-tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ef4444;">⚠️ Failed to load data: ' + (err.message || 'unknown error') + '</td></tr>';
    }
  }

});
` + SHARED_INTERACTIVE_JS,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component — no Redux, no dispatch, no resetOrders
// Parent (CreateDashboardType) owns all data concerns
// ─────────────────────────────────────────────────────────────────────────────
export interface DashboardTemplateLibraryProps {
  isOpen:   boolean;
  onClose:  () => void;
  onSelect: (template: (typeof DASHBOARD_TEMPLATE_LIBRARY)[number]) => void;
}

const DashboardTemplateLibrary: React.FC<DashboardTemplateLibraryProps> = ({
  isOpen, onClose, onSelect,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <style>{`
        .dtl-overlay{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,.7)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:999999!important;padding:20px!important;box-sizing:border-box!important;overflow:hidden!important}
        .dtl-modal{background:#fff!important;border-radius:12px!important;width:90%!important;max-width:1000px!important;max-height:88vh!important;overflow-y:auto!important;box-shadow:0 25px 60px rgba(0,0,0,.4)!important;display:flex!important;flex-direction:column!important;position:relative!important}
        .dtl-header{position:sticky!important;top:0!important;background:#fff!important;z-index:1!important;padding:18px 24px!important;border-bottom:1px solid #e5e7eb!important;display:flex!important;justify-content:space-between!important;align-items:center!important}
        .dtl-header h2{font-size:18px;color:#111827;margin:0}
        .dtl-header p{font-size:11px;color:#9ca3af;margin-top:4px}
        .dtl-close-btn{background:#f3f4f6!important;border:none!important;color:#6b7280!important;width:32px!important;height:32px!important;border-radius:50%!important;cursor:pointer!important;font-size:20px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important}
        .dtl-close-btn:hover{background:#e5e7eb!important}
        .dtl-grid{padding:24px!important;display:grid!important;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))!important;gap:16px!important}
        .dtl-card{background:#f9fafb!important;border:1px solid #e5e7eb!important;border-radius:10px!important;padding:16px!important;display:flex!important;flex-direction:column!important;cursor:pointer!important;transition:all 0.2s!important}
        .dtl-card:hover{border-color:#6366f1!important;box-shadow:0 4px 16px rgba(99,102,241,.15)!important;transform:translateY(-2px)!important}
        .dtl-icon{font-size:32px;margin-bottom:10px}
        .dtl-name{font-size:14px;font-weight:700;color:#111827;margin:0 0 6px}
        .dtl-desc{font-size:11px;color:#9ca3af;flex:1;margin-bottom:12px;line-height:1.5}
        .dtl-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px}
        .dtl-tag{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:700}
        .dtl-tag-bridge{background:#f0fdf4;color:#166534;border:1px solid #bbf7d0!important}
        .dtl-use-btn{width:100%!important;padding:9px 0!important;background:linear-gradient(135deg,#6366f1,#4f46e5)!important;color:#fff!important;border:none!important;border-radius:6px!important;font-size:13px!important;font-weight:600!important;cursor:pointer!important;transition:opacity 0.15s!important}
        .dtl-use-btn:hover{opacity:.9!important}
      `}</style>
      <div className="dtl-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <div className="dtl-modal" onClick={(e) => e.stopPropagation()}>
          <div className="dtl-header">
            <div>
              <h2>📊 Dashboard Template Library</h2>
              <p>Templates use window.x postMessage bridge — API key and token stay in parent app, never in template.</p>
            </div>
            <button className="dtl-close-btn" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className="dtl-grid">
            {DASHBOARD_TEMPLATE_LIBRARY.map((tpl, i) => (
              <div key={i} className="dtl-card">
                <div className="dtl-icon">{tpl.icon}</div>
                <h3 className="dtl-name">{tpl.name}</h3>
                <p className="dtl-desc">{tpl.description}</p>
                <div className="dtl-tags">
                  {["HTML", "CSS", "JS"].map((tag) => (
                    <span key={tag} className="dtl-tag">{tag}</span>
                  ))}
                  <span className="dtl-tag dtl-tag-bridge">⚡ postMessage bridge</span>
                </div>
                <button className="dtl-use-btn" onClick={() => onSelect(tpl)}>
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default DashboardTemplateLibrary;