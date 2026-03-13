// ─────────────────────────────────────────────────────────────────────────────
// DashboardTemplateLibrary.tsx  — FULLY INTERACTIVE, REAL DATA BAKED IN
// All 14 templates — no Mustache placeholders, actual order data hardcoded
// Data source: 11 orders, period 01 Feb 2026 – 13 Mar 2026
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import ReactDOM from "react-dom";

// ─────────────────────────────────────────────────────────────────────────────
// REAL DATA (computed from JSON — replace with dynamic computeTemplateVars()
// output when integrating with live API)
// ─────────────────────────────────────────────────────────────────────────────
const D = {
  companyName: "Your Company Name",
  companyAddress: "Your Company Address",
  companyPhone: "+91 00000 00000",
  companyEmail: "info@yourcompany.com",
  branchName: "Main Branch",
  branchCode: "BR-001",
  generatedAt: "13 Mar 2026",
  generatedTime: "12:00 PM",
  periodLabel: "01 Feb 2026 – 13 Mar 2026",
  dateFrom: "01 Feb 2026",
  dateTo: "13 Mar 2026",

  totalOrders: 11,
  completedOrders: 0,
  pendingOrders: 7,
  inProgressOrders: 3,
  approvedOrders: 0,
  dispatchedOrders: 1,
  cancelledOrders: 0,

  urgentOrders: 0,
  highOrders: 0,
  normalOrders: 11,
  lowOrders: 0,

  totalRevenue: "₹0.00",
  completedRevenue: "₹0.00",
  pendingRevenue: "₹0.00",
  avgOrderValue: "₹0.00",
  grandTotal: "₹0.00",
  subtotal: "₹0.00",
  taxAmount: "₹0.00",
  taxRate: "3",
  displayRate: "0",

  totalGrossWeight: "0",
  totalPureWeight: "0",
  totalSilverValue: "₹0.00",
  totalWastageAmount: "₹0.00",
  totalMCAmount: "₹0.00",
  totalPieces: 0,
  hmChargesAmount: "₹0.00",

  totalItems: 12,
  totalQuantity: 12,
  totalMixBatches: 4,
  avgMixTime: "N/A",
  avgTemperature: "N/A",
  avgCompletionDays: "37.1",
  onTimeDeliveryRate: "9%",
  sameDayDispatchCount: 0,
  completedSteps: 3,

  totalCustomers: 5,
  newCustomers: 1,
  repeatCustomers: 4,
  topCustomer: "Kalyan Jewellers - MG Road (3 orders)",

  internalOrders: 11,
  apiOrders: 0,
  websiteOrders: 0,
  mobileOrders: 0,
  forwardedOrders: 0,

  productOptionCount: 12,
  materialOptionCount: 0,
  printingOptionCount: 0,
  packagingOptionCount: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL TBODY ROWS — all 11 orders, hardcoded
// ─────────────────────────────────────────────────────────────────────────────
const TBODY_ROWS = `
<tr data-status="pending"     data-priority="normal" data-type="Inventory Test Type" data-amount="0" data-orderid="so-test-0014"    data-customer="kalyan jewellers - mg road"                    data-rowindex="1">
  <td class="i-muted">1</td><td><code class="i-code">SO-TEST-0014</code></td><td><strong>Kalyan Jewellers - MG Road</strong></td><td>Inventory Test Type</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-pending">pending</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="pending"     data-priority="normal" data-type="mrk"                  data-amount="0" data-orderid="mks-2026-0001"   data-customer="gopal karigar"                                 data-rowindex="2">
  <td class="i-muted">2</td><td><code class="i-code">MKS-2026-0001</code></td><td><strong>gopal Karigar</strong></td><td>mrk</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-pending">pending</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="dispatched"  data-priority="normal" data-type="Mrktn"                data-amount="0" data-orderid="a-2026-0001"     data-customer="mahalaxmi jewellers (vlk)"                     data-rowindex="3">
  <td class="i-muted">3</td><td><code class="i-code">A-2026-0001</code></td><td><strong>Mahalaxmi Jewellers (Vlk)</strong></td><td>Mrktn</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-dispatched">dispatched</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="pending"     data-priority="normal" data-type="90%"                  data-amount="0" data-orderid="o-2026-0001"     data-customer="mahalaxmi gold &amp; diamonds merhcants(old)"  data-rowindex="4">
  <td class="i-muted">4</td><td><code class="i-code">O-2026-0001</code></td><td><strong>Mahalaxmi Gold &amp; Diamonds Merhcants(Old)</strong></td><td>90%</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-pending">pending</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="pending"     data-priority="normal" data-type="mrktn"                data-amount="0" data-orderid="001-2026-0001"   data-customer="mahalaxmi gold &amp; diamonds merhcants(old)"  data-rowindex="5">
  <td class="i-muted">5</td><td><code class="i-code">001-2026-0001</code></td><td><strong>Mahalaxmi Gold &amp; Diamonds Merhcants(Old)</strong></td><td>mrktn</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-pending">pending</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="pending"     data-priority="normal" data-type="MBKTN"                data-amount="0" data-orderid="none-2026-0001"  data-customer="mahalaxmi jewellers (vlk)"                     data-rowindex="6">
  <td class="i-muted">6</td><td><code class="i-code">NONE-2026-0001</code></td><td><strong>Mahalaxmi Jewellers (Vlk)</strong></td><td>MBKTN</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-pending">pending</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="in-progress" data-priority="normal" data-type="mrka"                 data-amount="0" data-orderid="3323-2026-0013"  data-customer="kalyan jewellers - mg road"                    data-rowindex="7">
  <td class="i-muted">7</td><td><code class="i-code">3323-2026-0013</code></td><td><strong>Kalyan Jewellers - MG Road</strong></td><td>mrka</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-in-progress">in-progress</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="in-progress" data-priority="normal" data-type="mrka"                 data-amount="0" data-orderid="3323-2026-0012"  data-customer="aishwaryam jewellers"                          data-rowindex="8">
  <td class="i-muted">8</td><td><code class="i-code">3323-2026-0012</code></td><td><strong>Aishwaryam jewellers</strong></td><td>mrka</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-in-progress">in-progress</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="in-progress" data-priority="normal" data-type="mrka"                 data-amount="0" data-orderid="3323-2026-0011"  data-customer="aishwaryam jewellers"                          data-rowindex="9">
  <td class="i-muted">9</td><td><code class="i-code">3323-2026-0011</code></td><td><strong>Aishwaryam jewellers</strong></td><td>mrka</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-in-progress">in-progress</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="pending"     data-priority="normal" data-type="mrka"                 data-amount="0" data-orderid="3323-2026-0010"  data-customer="kalyan jewellers - mg road"                    data-rowindex="10">
  <td class="i-muted">10</td><td><code class="i-code">3323-2026-0010</code></td><td><strong>Kalyan Jewellers - MG Road</strong></td><td>mrka</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-pending">pending</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>
<tr data-status="pending"     data-priority="normal" data-type="mrka"                 data-amount="0" data-orderid="3323-2026-0009"  data-customer="aishwaryam jewellers"                          data-rowindex="11">
  <td class="i-muted">11</td><td><code class="i-code">3323-2026-0009</code></td><td><strong>Aishwaryam jewellers</strong></td><td>mrka</td><td><strong>₹0.00</strong></td><td><span class="i-st i-st-pending">pending</span></td><td><span class="i-pr i-pr-normal">normal</span></td>
</tr>`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INTERACTIVE JS
// ─────────────────────────────────────────────────────────────────────────────
const SHARED_INTERACTIVE_JS = `
(function() {
  window._iState = { page: 'home', sortCol: null, sortAsc: true };

  document.addEventListener('DOMContentLoaded', function() {
    _buildTypeFilters();
    _animateBars();
    _updateCount();
  });

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
    _animateBars();
  };

  function _openDrill(label, context) {
    document.getElementById('i-page-home').style.display  = 'none';
    document.getElementById('i-page-drill').style.display = '';
    window._iState.page = 'drill';
    var el = document.getElementById('i-bc-label');   if (el) el.textContent = label;
    var tl = document.getElementById('i-drill-title');if (tl) tl.textContent = label;
    var cx = document.getElementById('i-ctx');        if (cx) cx.textContent = context;
    _buildTypeFilters();
  }

  window.applyFilters = function() { _applyFilters(); };
  function _applyFilters() {
    var status   = Array.from(document.querySelectorAll('.i-chk-status:checked')).map(function(c){return c.value;});
    var priority = Array.from(document.querySelectorAll('.i-chk-priority:checked')).map(function(c){return c.value;});
    var types    = Array.from(document.querySelectorAll('.i-chk-type:checked')).map(function(c){return c.value;});
    var search   = document.getElementById('i-search')      ? document.getElementById('i-search').value.toLowerCase()      : '';
    var customer = document.getElementById('i-cust-search') ? document.getElementById('i-cust-search').value.toLowerCase() : '';
    var count = 0;
    document.querySelectorAll('#i-tbody tr').forEach(function(row) {
      var st  = (row.dataset.status   || '').toLowerCase();
      var pr  = (row.dataset.priority || '').toLowerCase();
      var tp  = (row.dataset.type     || '');
      var oid = (row.dataset.orderid  || '').toLowerCase();
      var cus = (row.dataset.customer || '').toLowerCase();
      var matchSt  = status.length   === 0 || status.includes(st);
      var matchPr  = priority.length === 0 || priority.includes(pr);
      var matchTp  = types.length    === 0 || types.includes(tp);
      var matchSr  = !search   || oid.includes(search) || cus.includes(search) || tp.toLowerCase().includes(search);
      var matchCus = !customer || cus.includes(customer);
      var show = matchSt && matchPr && matchTp && matchSr && matchCus;
      row.style.display = show ? '' : 'none';
      if (show) count++;
    });
    _updateCount(count);
    var nr = document.getElementById('i-no-results');
    if (nr) nr.style.display = count === 0 ? '' : 'none';
  }

  window.resetFilters = function() { _resetFilters(true); };
  function _resetFilters(reApply) {
    document.querySelectorAll('.i-chk-status,.i-chk-priority,.i-chk-type').forEach(function(c){ c.checked = false; });
    var s  = document.getElementById('i-search');      if (s)  s.value  = '';
    var cs = document.getElementById('i-cust-search'); if (cs) cs.value = '';
    if (reApply !== false) {
      document.querySelectorAll('#i-tbody tr').forEach(function(r){ r.style.display = ''; });
      _updateCount();
      var nr = document.getElementById('i-no-results'); if (nr) nr.style.display = 'none';
    }
  }

  var _sortState = {};
  window.sortBy = function(col) {
    _sortState[col] = !_sortState[col];
    var asc = _sortState[col];
    document.querySelectorAll('.i-sort-icon').forEach(function(el){ el.textContent = ''; });
    var ic = document.getElementById('i-sort-' + col); if (ic) ic.textContent = asc ? ' ▲' : ' ▼';
    var tbody = document.getElementById('i-tbody'); if (!tbody) return;
    var rows = Array.from(tbody.querySelectorAll('tr'));
    var pOrder = {urgent:0,high:1,normal:2,low:3};
    rows.sort(function(a, b) {
      if (col === 'priority') {
        var pa = pOrder[a.dataset.priority] !== undefined ? pOrder[a.dataset.priority] : 9;
        var pb = pOrder[b.dataset.priority] !== undefined ? pOrder[b.dataset.priority] : 9;
        return asc ? pa - pb : pb - pa;
      }
      var map = {index:'rowindex',orderId:'orderid',customerName:'customer',orderTypeName:'type',totalAmount:'amount',overallStatus:'status'};
      var key = map[col] || col;
      var va = a.dataset[key] || '', vb = b.dataset[key] || '';
      if (col === 'totalAmount' || col === 'index') {
        var na = parseFloat(va.replace(/[^0-9.]/g,'')) || 0;
        var nb = parseFloat(vb.replace(/[^0-9.]/g,'')) || 0;
        return asc ? na - nb : nb - na;
      }
      return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    rows.forEach(function(r){ tbody.appendChild(r); });
    _applyFilters();
  };

  window.exportCSV = function() {
    var rows = Array.from(document.querySelectorAll('#i-tbody tr'));
    var visible = rows.filter(function(r){ return r.style.display !== 'none'; });
    var lines = ['#,Order ID,Customer,Type,Amount,Status,Priority'];
    visible.forEach(function(r, i) {
      lines.push([i+1,r.dataset.orderid||'','"'+(r.dataset.customer||'').replace(/"/g,'""')+'"','"'+(r.dataset.type||'').replace(/"/g,'""')+'"',r.dataset.amount||'',r.dataset.status||'',r.dataset.priority||''].join(','));
    });
    var blob = new Blob([lines.join('\\n')], {type:'text/csv'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders_export.csv'; a.click();
  };

  function _buildTypeFilters() {
    var container = document.getElementById('i-type-filters');
    if (!container || container.children.length > 0) return;
    var types = new Set();
    document.querySelectorAll('#i-tbody tr').forEach(function(r){ if (r.dataset.type) types.add(r.dataset.type); });
    types.forEach(function(t) {
      var lbl = document.createElement('label');
      lbl.className = 'i-filter-check';
      lbl.innerHTML = '<input type="checkbox" class="i-chk-type" value="' + t + '" onchange="applyFilters()"> ' + t;
      container.appendChild(lbl);
    });
  }
  function _updateCount(n) {
    var badge = document.getElementById('i-count'); if (!badge) return;
    if (n === undefined) n = document.querySelectorAll('#i-tbody tr').length;
    badge.textContent = n;
  }
  function _cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function _animateBars() {
    document.querySelectorAll('[data-bar]').forEach(function(bar) {
      var target = bar.getAttribute('data-bar');
      bar.style.width = '0'; bar.style.transition = 'width .7s ease';
      setTimeout(function(){ bar.style.width = target; }, 120);
    });
  }
})();
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INTERACTIVE CSS
// ─────────────────────────────────────────────────────────────────────────────
const SHARED_INTERACTIVE_CSS = `
.i-clickable{cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease!important}
.i-clickable:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,.2)!important}
.i-drill-wrap{padding:0 24px 24px}
.i-drill-topbar{display:flex;align-items:center;gap:10px;padding:12px 0 16px;flex-wrap:wrap}
.i-back-btn{background:#1e1b4b;color:#fff;border:none;padding:8px 16px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s}
.i-back-btn:hover{background:#3730a3}
.i-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:#6b7280}
.i-bc-home{cursor:pointer;color:#6366f1;font-weight:600}.i-bc-home:hover{text-decoration:underline}
.i-bc-sep{color:#d1d5db}.i-bc-cur{font-weight:700;color:#111827}
.i-toolbar-right{margin-left:auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.i-search-box{border:1px solid #e5e7eb;border-radius:7px;padding:7px 12px;font-size:12px;width:240px;outline:none}
.i-search-box:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12)}
.i-cust-box{border:1px solid #e5e7eb;border-radius:6px;padding:6px 10px;font-size:11.5px;width:100%;outline:none;margin-top:4px}
.i-cust-box:focus{border-color:#6366f1}
.i-csv-btn{background:linear-gradient(135deg,#059669,#047857);color:#fff;border:none;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap}
.i-csv-btn:hover{opacity:.9}
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
.i-orders-tbl tbody tr{transition:background .12s}
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
`;

// ─────────────────────────────────────────────────────────────────────────────
// DRILL PAGE HTML (shared by all templates)
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
      <span class="i-count-wrap">Showing <span class="i-count-badge" id="i-count">0</span> orders</span>
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
          <tbody id="i-tbody">${TBODY_ROWS}</tbody>
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
// CATEGORY BREAKDOWN HTML (reused across templates)
// ─────────────────────────────────────────────────────────────────────────────
const CAT_TBODY = `
<tr class="i-clickable" onclick="drillCategory('Product')">
  <td class="tbl-muted">1</td>
  <td><strong>Product</strong> <span class="i-arrow-hint">→</span></td>
  <td style="text-align:center">11</td>
  <td style="text-align:center"><span class="pct-badge">100%</span></td>
  <td><strong>₹0.00</strong></td>
</tr>`;

// ─────────────────────────────────────────────────────────────────────────────
// STEP PERFORMANCE HTML (reused across templates)
// ─────────────────────────────────────────────────────────────────────────────
const STEP_TBODY = `
<tr>
  <td class="tbl-muted">1</td>
  <td><strong>testme</strong></td>
  <td style="text-align:center">3</td>
  <td style="text-align:center">5.0 d</td>
  <td><div class="bar-wrap"><div class="bar-fill" data-bar="75%"></div></div></td>
</tr>`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
export const DASHBOARD_TEMPLATE_LIBRARY = [

  // ══════════════════════════════════════════════════════════
  // 1. EXECUTIVE SUMMARY DASHBOARD
  // ══════════════════════════════════════════════════════════
  {
    name: "Executive Summary Dashboard",
    description: "8 KPI cards, revenue breakdown, category table — fully interactive drill-down, filters, search & CSV export",
    icon: "📊",
    htmlHeader: `<header class="exec-header">
  <div class="exec-brand"><h1>${D.companyName}</h1><p>${D.companyAddress}</p><p>${D.companyPhone} · ${D.companyEmail}</p></div>
  <div class="exec-meta"><div class="exec-badge">EXECUTIVE DASHBOARD</div><p><strong>Period:</strong> ${D.periodLabel}</p><p><strong>Branch:</strong> ${D.branchName} (${D.branchCode})</p><p><strong>Generated:</strong> ${D.generatedAt} ${D.generatedTime}</p></div>
</header>`,
    htmlBody: wrap(`<section class="exec-body">
  <div class="exec-kpi-grid">
    <div class="exec-kpi exec-kpi-blue   i-clickable" onclick="drillStatus('all')">       <div class="exec-kpi-icon">📦</div><div class="exec-kpi-val">${D.totalOrders}</div>      <div class="exec-kpi-label">Total Orders <span class="i-arrow-hint">→</span></div></div>
    <div class="exec-kpi exec-kpi-green  i-clickable" onclick="drillStatus('completed')"> <div class="exec-kpi-icon">✅</div><div class="exec-kpi-val">${D.completedOrders}</div>   <div class="exec-kpi-label">Completed <span class="i-arrow-hint">→</span></div></div>
    <div class="exec-kpi exec-kpi-amber  i-clickable" onclick="drillStatus('pending')">   <div class="exec-kpi-icon">⏳</div><div class="exec-kpi-val">${D.pendingOrders}</div>     <div class="exec-kpi-label">Pending <span class="i-arrow-hint">→</span></div></div>
    <div class="exec-kpi exec-kpi-indigo i-clickable" onclick="drillStatus('in-progress')"><div class="exec-kpi-icon">🔵</div><div class="exec-kpi-val">${D.inProgressOrders}</div><div class="exec-kpi-label">In Progress <span class="i-arrow-hint">→</span></div></div>
    <div class="exec-kpi exec-kpi-teal   i-clickable" onclick="drillStatus('dispatched')"><div class="exec-kpi-icon">🚚</div><div class="exec-kpi-val">${D.dispatchedOrders}</div> <div class="exec-kpi-label">Dispatched <span class="i-arrow-hint">→</span></div></div>
    <div class="exec-kpi exec-kpi-rose">  <div class="exec-kpi-icon">⚡</div><div class="exec-kpi-val">${D.onTimeDeliveryRate}</div><div class="exec-kpi-label">On-Time Rate</div></div>
    <div class="exec-kpi exec-kpi-purple"><div class="exec-kpi-icon">💰</div><div class="exec-kpi-val">${D.totalRevenue}</div>    <div class="exec-kpi-label">Total Revenue</div></div>
    <div class="exec-kpi exec-kpi-slate"> <div class="exec-kpi-icon">👥</div><div class="exec-kpi-val">${D.totalCustomers}</div>  <div class="exec-kpi-label">Customers</div></div>
  </div>
  <div class="exec-row-2">
    <div class="exec-card">
      <h4 class="exec-card-title">💰 Revenue Breakdown</h4>
      <div class="exec-rev-list">
        <div class="exec-rev-item"><span>Total Revenue</span><strong class="exec-c-indigo">${D.totalRevenue}</strong></div>
        <div class="exec-rev-item"><span>Completed Revenue</span><strong class="exec-c-green">${D.completedRevenue}</strong></div>
        <div class="exec-rev-item"><span>Pending Revenue</span><strong class="exec-c-amber">${D.pendingRevenue}</strong></div>
        <div class="exec-rev-item"><span>Avg Order Value</span><strong>${D.avgOrderValue}</strong></div>
        <div class="exec-rev-item"><span>Period</span><strong>${D.dateFrom} – ${D.dateTo}</strong></div>
      </div>
    </div>
    <div class="exec-card">
      <h4 class="exec-card-title">📊 Orders by Category <small style="font-weight:400;color:#9ca3af;">— click row</small></h4>
      <table class="exec-table">
        <thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
        <tbody>${CAT_TBODY}</tbody>
      </table>
    </div>
  </div>
  <div class="exec-card exec-card-full">
    <h4 class="exec-card-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click to drill down</small></h4>
    <div class="exec-prio-strip">
      <div class="exec-prio-item exec-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>⚡ Urgent</span><strong>${D.urgentOrders}</strong><span class="i-arrow-hint">→</span></div>
      <div class="exec-prio-item exec-pr-high   i-clickable" onclick="drillPriority('high')">  <span>🔴 High</span>  <strong>${D.highOrders}</strong>  <span class="i-arrow-hint">→</span></div>
      <div class="exec-prio-item exec-pr-normal i-clickable" onclick="drillPriority('normal')"><span>🔵 Normal</span><strong>${D.normalOrders}</strong><span class="i-arrow-hint">→</span></div>
      <div class="exec-prio-item exec-pr-low    i-clickable" onclick="drillPriority('low')">   <span>⚪ Low</span>   <strong>${D.lowOrders}</strong>   <span class="i-arrow-hint">→</span></div>
    </div>
  </div>
</section>`),
    htmlFooter: `<footer class="exec-footer"><p>${D.companyName} · ${D.branchName} · Period: ${D.dateFrom} to ${D.dateTo} · Generated: ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.exec-header{display:flex;justify-content:space-between;align-items:flex-start;padding:24px 28px 18px;background:linear-gradient(135deg,#1e1b4b,#312e81);color:#fff;margin-bottom:20px}
.exec-brand h1{font-size:18px;font-weight:700;margin-bottom:5px}.exec-brand p{opacity:.65;font-size:10.5px;margin-top:2px}
.exec-meta{text-align:right}.exec-badge{background:#6366f1;color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.exec-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.exec-body{padding:0 28px 20px}
.exec-kpi-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:10px;margin-bottom:18px}
.exec-kpi{border-radius:8px;padding:12px 8px;text-align:center;border:1.5px solid transparent}
.exec-kpi-icon{font-size:18px;margin-bottom:5px}.exec-kpi-val{font-size:16px;font-weight:700;margin-bottom:3px}
.exec-kpi-label{font-size:9.5px;font-weight:500;opacity:.75;text-transform:uppercase;letter-spacing:.4px}
.exec-kpi-blue{background:#eff6ff;color:#1d4ed8}.exec-kpi-green{background:#f0fdf4;color:#15803d}
.exec-kpi-amber{background:#fffbeb;color:#b45309}.exec-kpi-indigo{background:#eef2ff;color:#4338ca}
.exec-kpi-teal{background:#f0fdfa;color:#0f766e}.exec-kpi-rose{background:#fff1f2;color:#be123c}
.exec-kpi-purple{background:#faf5ff;color:#7e22ce}.exec-kpi-slate{background:#f8fafc;color:#334155}
.exec-row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.exec-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}
.exec-card-full{margin-bottom:14px}
.exec-card-title{font-size:11px;font-weight:700;color:#1e1b4b;margin-bottom:10px;padding-left:8px;border-left:3px solid #6366f1;text-transform:uppercase;letter-spacing:.6px}
.exec-rev-list{display:flex;flex-direction:column;gap:7px}
.exec-rev-item{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#f9fafb;border-radius:5px;border:1px solid #f3f4f6;font-size:11.5px}
.exec-c-indigo{color:#4338ca;font-size:14px}.exec-c-green{color:#059669}.exec-c-amber{color:#d97706}
.exec-table{width:100%;border-collapse:collapse;font-size:11px}
.exec-table thead tr{background:#1e1b4b;color:#fff}
.exec-table th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.5px}
.exec-table td{padding:5px 8px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
.exec-table tbody tr:hover{background:#eef2ff}
.tbl-muted{color:#9ca3af}.pct-badge{background:#e0e7ff;color:#4338ca;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:600}
.exec-prio-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.exec-prio-item{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.exec-pr-urgent{background:#fef2f2;color:#7f1d1d}.exec-pr-high{background:#fefce8;color:#713f12}
.exec-pr-normal{background:#eff6ff;color:#1e40af}.exec-pr-low{background:#f9fafb;color:#6b7280}
.exec-footer{padding:10px 28px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#6366f1,#4f46e5);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 2. PENDING ALERT DASHBOARD
  // ══════════════════════════════════════════════════════════
  {
    name: "Pending Alert Dashboard",
    description: "Focuses on overdue & pending orders — alert cards, priority urgency view — fully interactive",
    icon: "⚠️",
    htmlHeader: `<header class="pal-header">
  <div class="pal-brand"><h1>${D.companyName}</h1><p>${D.companyAddress} · ${D.companyPhone}</p></div>
  <div class="pal-meta"><div class="pal-badge">⚠️ PENDING ALERT</div><p><strong>Period:</strong> ${D.periodLabel}</p><p><strong>Branch:</strong> ${D.branchName} (${D.branchCode})</p><p><strong>Generated:</strong> ${D.generatedAt}</p></div>
</header>`,
    htmlBody: wrap(`<div class="pal-body">
  <div class="pal-kpi-strip">
    <div class="pal-kpi pal-kpi-red    i-clickable" onclick="drillStatus('pending')">     <div class="pal-kpi-icon">⏳</div><div class="pal-kpi-val">${D.pendingOrders}</div>    <div class="pal-kpi-lbl">Pending <span class="i-arrow-hint">→</span></div></div>
    <div class="pal-kpi pal-kpi-orange i-clickable" onclick="drillStatus('in-progress')"><div class="pal-kpi-icon">🔄</div><div class="pal-kpi-val">${D.inProgressOrders}</div><div class="pal-kpi-lbl">In Progress <span class="i-arrow-hint">→</span></div></div>
    <div class="pal-kpi pal-kpi-urgent i-clickable" onclick="drillPriority('urgent')">   <div class="pal-kpi-icon">⚡</div><div class="pal-kpi-val">${D.urgentOrders}</div>    <div class="pal-kpi-lbl">Urgent <span class="i-arrow-hint">→</span></div></div>
    <div class="pal-kpi pal-kpi-green  i-clickable" onclick="drillStatus('completed')">  <div class="pal-kpi-icon">✅</div><div class="pal-kpi-val">${D.completedOrders}</div>  <div class="pal-kpi-lbl">Completed <span class="i-arrow-hint">→</span></div></div>
    <div class="pal-kpi pal-kpi-total  i-clickable" onclick="drillStatus('all')">         <div class="pal-kpi-icon">📦</div><div class="pal-kpi-val">${D.totalOrders}</div>     <div class="pal-kpi-lbl">Total <span class="i-arrow-hint">→</span></div></div>
    <div class="pal-kpi pal-kpi-rev">  <div class="pal-kpi-icon">💰</div><div class="pal-kpi-val">${D.pendingRevenue}</div><div class="pal-kpi-lbl">Pending Revenue</div></div>
  </div>
  <div class="pal-alert-banner">
    <span class="pal-alert-icon">🚨</span>
    <div><div class="pal-alert-title">Action Required</div><div class="pal-alert-sub">${D.pendingOrders} orders are pending — ${D.urgentOrders} are urgent priority</div></div>
    <button class="pal-view-all-btn i-clickable" onclick="drillStatus('pending')">View All Pending →</button>
  </div>
  <div class="pal-row-2">
    <div class="pal-card">
      <h4 class="pal-title">🔥 Priority Queue <small style="font-weight:400;color:#9ca3af;">— click to filter</small></h4>
      <div class="pal-pr-list">
        <div class="pal-pr-row pal-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>⚡ Urgent</span><strong>${D.urgentOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="pal-pr-row pal-pr-high   i-clickable" onclick="drillPriority('high')">  <span>🔴 High</span>  <strong>${D.highOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="pal-pr-row pal-pr-normal i-clickable" onclick="drillPriority('normal')"><span>🔵 Normal</span><strong>${D.normalOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="pal-pr-row pal-pr-low    i-clickable" onclick="drillPriority('low')">   <span>⚪ Low</span>   <strong>${D.lowOrders} <span class="i-arrow-hint">→</span></strong></div>
      </div>
    </div>
    <div class="pal-card">
      <h4 class="pal-title">📊 Category Breakdown <small style="font-weight:400;color:#9ca3af;">— click row</small></h4>
      <table class="pal-tbl"><thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
      <tbody>${CAT_TBODY}</tbody></table>
    </div>
  </div>
  <div class="pal-card pal-card-full">
    <h4 class="pal-title">📦 Full Status Overview <small style="font-weight:400;color:#9ca3af;">— click to filter</small></h4>
    <div class="pal-status-grid">
      <div class="pal-st-item i-clickable" onclick="drillStatus('completed')">  <span>✅ Completed</span>  <strong>${D.completedOrders}</strong></div>
      <div class="pal-st-item i-clickable" onclick="drillStatus('pending')">    <span>⏳ Pending</span>    <strong>${D.pendingOrders}</strong></div>
      <div class="pal-st-item i-clickable" onclick="drillStatus('in-progress')"><span>🔵 In Progress</span><strong>${D.inProgressOrders}</strong></div>
      <div class="pal-st-item i-clickable" onclick="drillStatus('approved')">   <span>✔ Approved</span>   <strong>${D.approvedOrders}</strong></div>
      <div class="pal-st-item i-clickable" onclick="drillStatus('dispatched')"> <span>🚚 Dispatched</span> <strong>${D.dispatchedOrders}</strong></div>
      <div class="pal-st-item i-clickable" onclick="drillStatus('cancelled')">  <span>❌ Cancelled</span>  <strong>${D.cancelledOrders}</strong></div>
    </div>
  </div>
</div>`),
    htmlFooter: `<footer class="pal-footer"><p>${D.companyName} · Pending Alert · ${D.periodLabel} · ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.pal-header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 24px 14px;background:linear-gradient(135deg,#7f1d1d,#991b1b);color:#fff;margin-bottom:18px}
.pal-brand h1{font-size:17px;font-weight:700;margin-bottom:5px}.pal-brand p{opacity:.6;font-size:10.5px}
.pal-meta{text-align:right}.pal-badge{background:#fca5a5;color:#7f1d1d;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.pal-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.pal-body{padding:0 24px 18px}
.pal-kpi-strip{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px}
.pal-kpi{border-radius:10px;padding:14px 10px;text-align:center;border:1.5px solid transparent}
.pal-kpi-icon{font-size:20px;margin-bottom:6px}.pal-kpi-val{font-size:20px;font-weight:700;margin-bottom:3px}.pal-kpi-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.4px;opacity:.7}
.pal-kpi-red{background:#fee2e2;color:#7f1d1d;border-color:#fca5a5}.pal-kpi-orange{background:#ffedd5;color:#9a3412;border-color:#fed7aa}
.pal-kpi-urgent{background:#fef9c3;color:#713f12;border-color:#fde047}.pal-kpi-green{background:#f0fdf4;color:#15803d;border-color:#bbf7d0}
.pal-kpi-total{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}.pal-kpi-rev{background:#faf5ff;color:#7e22ce;border-color:#ddd6fe}
.pal-alert-banner{display:flex;align-items:center;gap:14px;background:#7f1d1d;color:#fff;border-radius:10px;padding:14px 18px;margin-bottom:16px}
.pal-alert-icon{font-size:28px;flex-shrink:0}.pal-alert-title{font-size:13px;font-weight:700;margin-bottom:3px}.pal-alert-sub{font-size:11px;opacity:.8}
.pal-view-all-btn{margin-left:auto;background:#fff;color:#7f1d1d;border:none;padding:8px 16px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}
.pal-view-all-btn:hover{background:#fee2e2}
.pal-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.pal-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}
.pal-card-full{margin-bottom:14px}
.pal-title{font-size:11px;font-weight:700;color:#7f1d1d;border-left:3px solid #ef4444;padding-left:8px;margin-bottom:10px}
.pal-pr-list{display:flex;flex-direction:column;gap:7px}
.pal-pr-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.pal-pr-urgent{background:#fecaca;color:#7f1d1d}.pal-pr-high{background:#fef08a;color:#713f12}
.pal-pr-normal{background:#e0f2fe;color:#0c4a6e}.pal-pr-low{background:#f3f4f6;color:#6b7280}
.pal-tbl{width:100%;border-collapse:collapse;font-size:11px}
.pal-tbl thead tr{background:#7f1d1d;color:#fff}
.pal-tbl th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
.pal-tbl td{padding:5px 8px;border-bottom:1px solid #f3f4f6}
.pal-tbl tbody tr:hover{background:#fff1f2}
.pct-badge{background:#fee2e2;color:#7f1d1d;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:600}.tbl-muted{color:#9ca3af}
.pal-status-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.pal-st-item{border:1px solid #e5e7eb;border-radius:8px;padding:10px;text-align:center;background:#f9fafb}
.pal-st-item:hover{background:#fee2e2;border-color:#fca5a5}
.pal-st-item span{font-size:9.5px;display:block;margin-bottom:4px;color:#6b7280}
.pal-st-item strong{font-size:16px;font-weight:700;color:#111827}
.pal-footer{padding:10px 24px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#ef4444,#dc2626);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 3. OPERATIONS OVERVIEW DASHBOARD
  // ══════════════════════════════════════════════════════════
  {
    name: "Operations Overview Dashboard",
    description: "Summary strip, priority breakdown, step performance with bars — interactive drill-down, filters, search & CSV export",
    icon: "⚙️",
    htmlHeader: `<header class="ops-header">
  <div class="ops-left"><div class="ops-company">${D.companyName}</div><div class="ops-branch">${D.branchName} (${D.branchCode})</div></div>
  <div class="ops-center"><h1>OPERATIONS OVERVIEW</h1><div class="ops-period">${D.periodLabel}</div></div>
  <div class="ops-right"><p>Generated: <strong>${D.generatedAt}</strong></p><p>Total Orders: <strong>${D.totalOrders}</strong></p></div>
</header>`,
    htmlBody: wrap(`<div class="ops-body">
  <div class="ops-strip">
    <div class="ops-strip-item i-clickable" onclick="drillStatus('completed')">  <span>Completed</span>  <strong>${D.completedOrders}</strong></div>
    <div class="ops-strip-item i-clickable" onclick="drillStatus('in-progress')"><span>In Progress</span><strong>${D.inProgressOrders}</strong></div>
    <div class="ops-strip-item i-clickable" onclick="drillStatus('pending')">    <span>Pending</span>    <strong>${D.pendingOrders}</strong></div>
    <div class="ops-strip-item i-clickable" onclick="drillStatus('dispatched')"> <span>Dispatched</span> <strong>${D.dispatchedOrders}</strong></div>
    <div class="ops-strip-item i-clickable" onclick="drillStatus('approved')">   <span>Approved</span>   <strong>${D.approvedOrders}</strong></div>
    <div class="ops-strip-item i-clickable" onclick="drillStatus('cancelled')">  <span>Cancelled</span>  <strong>${D.cancelledOrders}</strong></div>
    <div class="ops-strip-item"><span>Revenue</span>  <strong>${D.totalRevenue}</strong></div>
    <div class="ops-strip-item"><span>On-Time</span>  <strong>${D.onTimeDeliveryRate}</strong></div>
    <div class="ops-strip-item"><span>Avg Days</span> <strong>${D.avgCompletionDays}</strong></div>
    <div class="ops-strip-item"><span>Same-Day</span> <strong>${D.sameDayDispatchCount}</strong></div>
  </div>
  <div class="ops-row-3">
    <div class="ops-card">
      <h4 class="ops-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click to filter</small></h4>
      <div class="ops-priority-list">
        <div class="ops-pr-row ops-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>Urgent</span><span class="ops-pr-count">${D.urgentOrders} <span class="i-arrow-hint">→</span></span></div>
        <div class="ops-pr-row ops-pr-high   i-clickable" onclick="drillPriority('high')">  <span>High</span>  <span class="ops-pr-count">${D.highOrders} <span class="i-arrow-hint">→</span></span></div>
        <div class="ops-pr-row ops-pr-normal i-clickable" onclick="drillPriority('normal')"><span>Normal</span><span class="ops-pr-count">${D.normalOrders} <span class="i-arrow-hint">→</span></span></div>
        <div class="ops-pr-row ops-pr-low    i-clickable" onclick="drillPriority('low')">   <span>Low</span>   <span class="ops-pr-count">${D.lowOrders} <span class="i-arrow-hint">→</span></span></div>
      </div>
    </div>
    <div class="ops-card">
      <h4 class="ops-title">👤 Customer Summary</h4>
      <div class="ops-info-list">
        <div class="ops-info-row"><span>Total Customers</span><strong>${D.totalCustomers}</strong></div>
        <div class="ops-info-row"><span>New Customers</span>   <strong>${D.newCustomers}</strong></div>
        <div class="ops-info-row"><span>Repeat Customers</span><strong>${D.repeatCustomers}</strong></div>
        <div class="ops-info-row"><span>Avg Order Value</span> <strong>${D.avgOrderValue}</strong></div>
      </div>
      <div class="ops-top-cust">⭐ Top: <strong>${D.topCustomer}</strong></div>
    </div>
    <div class="ops-card">
      <h4 class="ops-title">⚗️ Mixing Stats</h4>
      <div class="ops-info-list">
        <div class="ops-info-row"><span>Total Batches</span>  <strong>${D.totalMixBatches}</strong></div>
        <div class="ops-info-row"><span>Avg Mix Time</span>   <strong>${D.avgMixTime} min</strong></div>
        <div class="ops-info-row"><span>Avg Temperature</span><strong>${D.avgTemperature}°C</strong></div>
        <div class="ops-info-row"><span>Total Items</span>    <strong>${D.totalItems}</strong></div>
        <div class="ops-info-row"><span>Total Quantity</span> <strong>${D.totalQuantity}</strong></div>
      </div>
    </div>
  </div>
  <div class="ops-card ops-card-full">
    <h4 class="ops-title">⚙️ Step Performance</h4>
    <table class="ops-table">
      <thead><tr><th>#</th><th>Step Name</th><th>Completed</th><th>Avg Days</th><th>Performance</th></tr></thead>
      <tbody>${STEP_TBODY}</tbody>
    </table>
  </div>
  <div class="ops-card ops-card-full">
    <h4 class="ops-title">📊 Category <small style="font-weight:400;color:#9ca3af;">— click to drill down</small></h4>
    <table class="ops-table"><thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
    <tbody>${CAT_TBODY}</tbody></table>
  </div>
</div>`),
    htmlFooter: `<footer class="ops-footer"><p>${D.companyName} · ${D.branchName} · ${D.dateFrom} – ${D.dateTo} · ${D.generatedAt}</p></footer>`,
    css: `*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11.5px;color:#1a1a1a;background:#f1f5f9}
.ops-header{display:flex;justify-content:space-between;align-items:center;padding:14px 22px;background:#0f4c75;color:#fff;margin-bottom:16px}
.ops-company{font-size:16px;font-weight:700}.ops-branch{font-size:10px;opacity:.65;margin-top:2px}
.ops-center{text-align:center}.ops-center h1{font-size:18px;letter-spacing:3px;font-weight:700}
.ops-period{font-size:11px;opacity:.75;margin-top:4px}
.ops-right{text-align:right;font-size:10.5px}.ops-right p{margin-top:3px;opacity:.85}
.ops-body{padding:0 22px 16px}
.ops-strip{display:grid;grid-template-columns:repeat(10,1fr);gap:7px;margin-bottom:14px}
.ops-strip-item{background:#eff6ff;border:1px solid #bfdbfe;border-radius:7px;padding:9px 6px;text-align:center}
.ops-strip-item:hover{background:#dbeafe}.ops-strip-item span{font-size:9px;color:#6b7280;display:block;margin-bottom:3px;text-transform:uppercase}
.ops-strip-item strong{font-size:13px;font-weight:700;color:#1e3a5f}
.ops-row-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:13px}
.ops-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:13px}
.ops-card-full{margin-bottom:13px}
.ops-title{font-size:11px;font-weight:700;color:#0f4c75;border-left:3px solid #0f4c75;padding-left:7px;margin-bottom:10px}
.ops-priority-list{display:flex;flex-direction:column;gap:6px}
.ops-pr-row{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.ops-pr-urgent{background:#fecaca;color:#7f1d1d}.ops-pr-high{background:#fef08a;color:#713f12}
.ops-pr-normal{background:#e0f2fe;color:#0c4a6e}.ops-pr-low{background:#f3f4f6;color:#6b7280}
.ops-pr-count{font-size:17px;font-weight:700}
.ops-info-list{display:flex;flex-direction:column;gap:6px}
.ops-info-row{display:flex;justify-content:space-between;padding:5px 8px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:5px;font-size:11.5px}
.ops-top-cust{background:#fefce8;border:1px solid #fef08a;border-radius:6px;padding:7px 10px;font-size:11px;margin-top:7px}
.ops-table{width:100%;border-collapse:collapse;font-size:11px}
.ops-table thead tr{background:#0f4c75;color:#fff}
.ops-table th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
.ops-table td{padding:5px 8px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
.ops-table tbody tr:hover{background:#e0f2fe}
.tbl-muted{color:#9ca3af}.pct-badge{background:#e0e7ff;color:#4338ca;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:600}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#0f4c75,#1e88e5);height:100%;border-radius:4px}
.ops-footer{padding:10px 22px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 4. FINANCE & REVENUE DASHBOARD
  // ══════════════════════════════════════════════════════════
  {
    name: "Finance & Revenue Dashboard",
    description: "Revenue hero cards, category revenue table, status mix — interactive drill-down, filters, search & CSV export",
    icon: "💰",
    htmlHeader: `<header class="fin-header">
  <div class="fin-brand"><h1>${D.companyName}</h1><p>${D.companyAddress}</p><p>${D.companyPhone} · ${D.companyEmail}</p></div>
  <div class="fin-meta"><div class="fin-badge">FINANCE DASHBOARD</div><p><strong>Period:</strong> ${D.dateFrom} — ${D.dateTo}</p><p><strong>Branch:</strong> ${D.branchName} (${D.branchCode})</p><p><strong>Generated:</strong> ${D.generatedAt}</p></div>
</header>`,
    htmlBody: wrap(`<div class="fin-body">
  <div class="fin-rev-cards">
    <div class="fin-rev-hero i-clickable" onclick="drillStatus('all')">
      <div class="fin-rev-hero-label">Total Revenue <span class="i-arrow-hint">→</span></div>
      <div class="fin-rev-hero-val">${D.totalRevenue}</div>
      <div class="fin-rev-hero-sub">${D.totalOrders} orders · ${D.periodLabel}</div>
    </div>
    <div class="fin-rev-card i-clickable" onclick="drillStatus('completed')">
      <div class="fin-rev-card-label">Completed Revenue <span class="i-arrow-hint">→</span></div>
      <div class="fin-rev-card-val fin-c-green">${D.completedRevenue}</div>
      <div class="fin-rev-card-sub">${D.completedOrders} orders</div>
    </div>
    <div class="fin-rev-card i-clickable" onclick="drillStatus('pending')">
      <div class="fin-rev-card-label">Pending Revenue <span class="i-arrow-hint">→</span></div>
      <div class="fin-rev-card-val fin-c-amber">${D.pendingRevenue}</div>
      <div class="fin-rev-card-sub">${D.pendingOrders} orders</div>
    </div>
    <div class="fin-rev-card">
      <div class="fin-rev-card-label">Avg Order Value</div>
      <div class="fin-rev-card-val fin-c-blue">${D.avgOrderValue}</div>
      <div class="fin-rev-card-sub">per order</div>
    </div>
  </div>
  <div class="fin-row-2">
    <div class="fin-card">
      <h3 class="fin-card-title">📊 Revenue by Category <small style="font-weight:400;color:#9ca3af;">— click row</small></h3>
      <table class="fin-table"><thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
      <tbody>${CAT_TBODY}</tbody></table>
    </div>
    <div class="fin-card">
      <h3 class="fin-card-title">📦 Order Status Mix <small style="font-weight:400;color:#9ca3af;">— click to filter</small></h3>
      <div class="fin-status-list">
        <div class="fin-s-row i-clickable" onclick="drillStatus('completed')">  <span>✅ Completed</span> <strong class="fin-c-green">${D.completedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="fin-s-row i-clickable" onclick="drillStatus('pending')">    <span>⏳ Pending</span>   <strong class="fin-c-amber">${D.pendingOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="fin-s-row i-clickable" onclick="drillStatus('in-progress')"><span>🔵 In Progress</span><strong class="fin-c-blue">${D.inProgressOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="fin-s-row i-clickable" onclick="drillStatus('approved')">   <span>✔ Approved</span>  <strong>${D.approvedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="fin-s-row i-clickable" onclick="drillStatus('dispatched')"> <span>🚚 Dispatched</span><strong>${D.dispatchedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="fin-s-row i-clickable" onclick="drillStatus('cancelled')">  <span>❌ Cancelled</span> <strong class="fin-c-red">${D.cancelledOrders} <span class="i-arrow-hint">→</span></strong></div>
      </div>
    </div>
  </div>
  <div class="fin-card fin-card-full">
    <h3 class="fin-card-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click to drill down</small></h3>
    <div class="fin-prio-strip">
      <div class="fin-prio-item fin-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>⚡ Urgent</span><strong>${D.urgentOrders}</strong><span class="i-arrow-hint">→</span></div>
      <div class="fin-prio-item fin-pr-high   i-clickable" onclick="drillPriority('high')">  <span>🔴 High</span>  <strong>${D.highOrders}</strong>  <span class="i-arrow-hint">→</span></div>
      <div class="fin-prio-item fin-pr-normal i-clickable" onclick="drillPriority('normal')"><span>🔵 Normal</span><strong>${D.normalOrders}</strong><span class="i-arrow-hint">→</span></div>
      <div class="fin-prio-item fin-pr-low    i-clickable" onclick="drillPriority('low')">   <span>⚪ Low</span>   <strong>${D.lowOrders}</strong>   <span class="i-arrow-hint">→</span></div>
    </div>
  </div>
</div>`),
    htmlFooter: `<footer class="fin-footer"><p>${D.companyName} · Finance Dashboard · ${D.periodLabel} · Generated ${D.generatedAt} at ${D.generatedTime}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Outfit',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.fin-header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 24px 14px;background:linear-gradient(135deg,#064e3b,#065f46);color:#fff;margin-bottom:18px}
.fin-brand h1{font-size:17px;font-weight:700;margin-bottom:5px}.fin-brand p{opacity:.65;font-size:10.5px;margin-top:2px}
.fin-meta{text-align:right}.fin-badge{background:#10b981;color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.fin-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.fin-body{padding:0 24px 18px}
.fin-rev-cards{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:12px;margin-bottom:16px}
.fin-rev-hero{background:linear-gradient(135deg,#064e3b,#065f46);color:#fff;border-radius:10px;padding:18px;cursor:pointer}
.fin-rev-hero-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.7;margin-bottom:6px}
.fin-rev-hero-val{font-size:22px;font-weight:700;margin-bottom:5px}.fin-rev-hero-sub{font-size:10px;opacity:.6}
.fin-rev-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px}
.fin-rev-card-label{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#9ca3af;margin-bottom:5px}
.fin-rev-card-val{font-size:18px;font-weight:700;margin-bottom:4px}.fin-rev-card-sub{font-size:10px;color:#9ca3af}
.fin-c-green{color:#059669}.fin-c-amber{color:#d97706}.fin-c-blue{color:#2563eb}.fin-c-red{color:#dc2626}
.fin-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.fin-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}
.fin-card-full{margin-bottom:12px}
.fin-card-title{font-size:11px;font-weight:700;color:#064e3b;border-left:3px solid #10b981;padding-left:8px;margin-bottom:10px}
.fin-table{width:100%;border-collapse:collapse;font-size:11px}
.fin-table thead tr{background:#064e3b;color:#fff}
.fin-table th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
.fin-table td{padding:5px 8px;border-bottom:1px solid #f3f4f6}
.fin-table tbody tr:hover{background:#ecfdf5}
.tbl-muted{color:#9ca3af}.pct-badge{background:#d1fae5;color:#065f46;padding:1px 7px;border-radius:8px;font-size:10px;font-weight:600}
.fin-status-list{display:flex;flex-direction:column;gap:6px}
.fin-s-row{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:6px;font-size:12px}
.fin-s-row:hover{background:#f0fdf4}
.fin-prio-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.fin-prio-item{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.fin-pr-urgent{background:#fef2f2;color:#7f1d1d}.fin-pr-high{background:#fefce8;color:#713f12}
.fin-pr-normal{background:#eff6ff;color:#1e40af}.fin-pr-low{background:#f9fafb;color:#6b7280}
.fin-footer{padding:10px 24px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#10b981,#059669);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 5. CUSTOMER ANALYTICS DASHBOARD
  // ══════════════════════════════════════════════════════════
  {
    name: "Customer Analytics Dashboard",
    description: "Customer KPIs, category table, priority grid — interactive drill-down, filters, search & CSV export",
    icon: "👥",
    htmlHeader: `<header class="cust-header">
  <div class="cust-left"><div class="cust-company">${D.companyName}</div><div class="cust-branch">${D.branchName} · ${D.branchCode}</div></div>
  <div class="cust-center"><h1>CUSTOMER ANALYTICS</h1><div class="cust-period">${D.periodLabel}</div></div>
  <div class="cust-right"><p>Generated: <strong>${D.generatedAt}</strong></p><p>Range: <strong>${D.dateFrom} – ${D.dateTo}</strong></p></div>
</header>`,
    htmlBody: wrap(`<div class="cust-body">
  <div class="cust-kpi-row">
    <div class="cust-kpi i-clickable" onclick="drillStatus('all')">            <div class="cust-kpi-val">${D.totalCustomers}</div>  <div class="cust-kpi-lbl">Total Customers <span class="i-arrow-hint">→</span></div></div>
    <div class="cust-kpi cust-kpi-new">                                         <div class="cust-kpi-val">${D.newCustomers}</div>    <div class="cust-kpi-lbl">New This Period</div></div>
    <div class="cust-kpi cust-kpi-repeat">                                      <div class="cust-kpi-val">${D.repeatCustomers}</div> <div class="cust-kpi-lbl">Repeat Customers</div></div>
    <div class="cust-kpi i-clickable" onclick="drillStatus('all')">            <div class="cust-kpi-val">${D.totalOrders}</div>    <div class="cust-kpi-lbl">Total Orders <span class="i-arrow-hint">→</span></div></div>
    <div class="cust-kpi">                                                        <div class="cust-kpi-val">${D.avgOrderValue}</div>  <div class="cust-kpi-lbl">Avg Order Value</div></div>
    <div class="cust-kpi">                                                        <div class="cust-kpi-val">${D.totalRevenue}</div>   <div class="cust-kpi-lbl">Total Revenue</div></div>
    <div class="cust-kpi">                                                        <div class="cust-kpi-val">${D.onTimeDeliveryRate}</div><div class="cust-kpi-lbl">On-Time Delivery</div></div>
  </div>
  <div class="cust-top-bar">⭐ Top Customer this period: <strong>${D.topCustomer}</strong></div>
  <div class="cust-row-2">
    <div class="cust-card">
      <h3 class="cust-title">📊 Orders by Category <small style="font-weight:400;color:#9ca3af;">— click row</small></h3>
      <table class="cust-table"><thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
      <tbody>${CAT_TBODY}</tbody></table>
    </div>
    <div class="cust-card">
      <h3 class="cust-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click to filter</small></h3>
      <div class="cust-pr-list">
        <div class="cust-pr-row cust-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>Urgent</span><strong>${D.urgentOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="cust-pr-row cust-pr-high   i-clickable" onclick="drillPriority('high')">  <span>High</span>  <strong>${D.highOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="cust-pr-row cust-pr-normal i-clickable" onclick="drillPriority('normal')"><span>Normal</span><strong>${D.normalOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="cust-pr-row cust-pr-low    i-clickable" onclick="drillPriority('low')">   <span>Low</span>   <strong>${D.lowOrders} <span class="i-arrow-hint">→</span></strong></div>
      </div>
    </div>
  </div>
</div>`),
    htmlFooter: `<footer class="cust-footer"><p>${D.companyName} · Customer Analytics · ${D.periodLabel} · ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'IBM Plex Sans',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.cust-header{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:#1a1a2e;color:#fff;margin-bottom:18px}
.cust-company{font-size:15px;font-weight:700}.cust-branch{font-size:10px;opacity:.6;margin-top:2px}
.cust-center{text-align:center}.cust-center h1{font-size:18px;letter-spacing:4px;font-weight:700}.cust-period{font-size:11px;opacity:.7;margin-top:3px}
.cust-right{text-align:right;font-size:10.5px}.cust-right p{margin-top:3px;opacity:.85}
.cust-body{padding:0 24px 18px}
.cust-kpi-row{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-bottom:14px}
.cust-kpi{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center}
.cust-kpi-new{background:#f0fdf4;border-color:#bbf7d0}.cust-kpi-repeat{background:#eff6ff;border-color:#bfdbfe}
.cust-kpi-val{font-size:17px;font-weight:700;color:#1a1a2e;margin-bottom:4px}.cust-kpi-lbl{font-size:9.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}
.cust-top-bar{background:#fefce8;border:1px solid #fef08a;border-radius:8px;padding:9px 14px;margin-bottom:14px;font-size:12px}
.cust-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.cust-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}
.cust-title{font-size:11px;font-weight:700;color:#1a1a2e;border-left:3px solid #6366f1;padding-left:8px;margin-bottom:10px}
.cust-table{width:100%;border-collapse:collapse;font-size:11px}
.cust-table thead tr{background:#1a1a2e;color:#fff}
.cust-table th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
.cust-table td{padding:5px 8px;border-bottom:1px solid #f3f4f6}
.cust-table tbody tr:hover{background:#eef2ff}
.tbl-muted{color:#9ca3af}.pct-badge{background:#ede9fe;color:#5b21b6;padding:1px 7px;border-radius:8px;font-size:10px;font-weight:600}
.cust-pr-list{display:flex;flex-direction:column;gap:7px}
.cust-pr-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.cust-pr-urgent{background:#fecaca;color:#7f1d1d}.cust-pr-high{background:#fef08a;color:#713f12}
.cust-pr-normal{background:#e0f2fe;color:#0c4a6e}.cust-pr-low{background:#f3f4f6;color:#6b7280}
.cust-footer{padding:10px 24px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#6366f1,#4f46e5);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 6. PRODUCTION & QUALITY DASHBOARD
  // ══════════════════════════════════════════════════════════
  {
    name: "Production & Quality Dashboard",
    description: "Production KPI strip, step performance, mixing stats — interactive drill-down, filters, search & CSV export",
    icon: "🏭",
    htmlHeader: `<header class="prod-header">
  <div class="prod-brand"><h1>${D.companyName}</h1><p>${D.companyAddress}</p><p>${D.companyPhone} · ${D.companyEmail}</p></div>
  <div class="prod-meta"><div class="prod-badge">PRODUCTION DASHBOARD</div><p><strong>Period:</strong> ${D.periodLabel}</p><p><strong>Branch:</strong> ${D.branchName} (${D.branchCode})</p><p><strong>Generated:</strong> ${D.generatedAt}</p></div>
</header>`,
    htmlBody: wrap(`<div class="prod-body">
  <div class="prod-strip">
    <div class="prod-strip-item prod-strip-blue   i-clickable" onclick="drillStatus('all')">        <span>Total Orders</span><strong>${D.totalOrders}</strong></div>
    <div class="prod-strip-item prod-strip-green  i-clickable" onclick="drillStatus('completed')">  <span>Completed</span>   <strong>${D.completedOrders}</strong></div>
    <div class="prod-strip-item prod-strip-amber  i-clickable" onclick="drillStatus('in-progress')"><span>In Progress</span><strong>${D.inProgressOrders}</strong></div>
    <div class="prod-strip-item prod-strip-slate"><span>Total Items</span> <strong>${D.totalItems}</strong></div>
    <div class="prod-strip-item prod-strip-slate"><span>Total Qty</span>   <strong>${D.totalQuantity}</strong></div>
    <div class="prod-strip-item prod-strip-teal"><span>On-Time Rate</span><strong>${D.onTimeDeliveryRate}</strong></div>
    <div class="prod-strip-item prod-strip-slate"><span>Avg Days</span>    <strong>${D.avgCompletionDays}</strong></div>
    <div class="prod-strip-item prod-strip-indigo"><span>Mix Batches</span><strong>${D.totalMixBatches}</strong></div>
    <div class="prod-strip-item prod-strip-slate"><span>Avg Mix Time</span><strong>${D.avgMixTime} min</strong></div>
    <div class="prod-strip-item prod-strip-rose i-clickable" onclick="drillPriority('urgent')"><span>Urgent</span><strong>${D.urgentOrders}</strong></div>
  </div>
  <div class="prod-card prod-card-full">
    <h4 class="prod-title">⚙️ Step Performance</h4>
    <table class="prod-table"><thead><tr><th>#</th><th>Step Name</th><th>Completed</th><th>Avg Days</th><th>Performance Bar</th></tr></thead>
    <tbody>${STEP_TBODY}</tbody></table>
  </div>
  <div class="prod-row-2">
    <div class="prod-card">
      <h4 class="prod-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click to filter</small></h4>
      <div class="prod-pr-list">
        <div class="prod-pr-row prod-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>Urgent</span><strong>${D.urgentOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="prod-pr-row prod-pr-high   i-clickable" onclick="drillPriority('high')">  <span>High</span>  <strong>${D.highOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="prod-pr-row prod-pr-normal i-clickable" onclick="drillPriority('normal')"><span>Normal</span><strong>${D.normalOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="prod-pr-row prod-pr-low    i-clickable" onclick="drillPriority('low')">   <span>Low</span>   <strong>${D.lowOrders} <span class="i-arrow-hint">→</span></strong></div>
      </div>
    </div>
    <div class="prod-card">
      <h4 class="prod-title">📦 Order Status <small style="font-weight:400;color:#9ca3af;">— click to filter</small></h4>
      <div class="prod-info-list">
        <div class="prod-info-row i-clickable" onclick="drillStatus('completed')">  <span>Completed</span>  <strong class="prod-c-green">${D.completedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="prod-info-row i-clickable" onclick="drillStatus('in-progress')"><span>In Progress</span><strong class="prod-c-blue">${D.inProgressOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="prod-info-row i-clickable" onclick="drillStatus('pending')">    <span>Pending</span>    <strong class="prod-c-amber">${D.pendingOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="prod-info-row i-clickable" onclick="drillStatus('dispatched')"> <span>Dispatched</span> <strong>${D.dispatchedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="prod-info-row i-clickable" onclick="drillStatus('approved')">   <span>Approved</span>   <strong>${D.approvedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="prod-info-row i-clickable" onclick="drillStatus('cancelled')">  <span>Cancelled</span>  <strong class="prod-c-red">${D.cancelledOrders} <span class="i-arrow-hint">→</span></strong></div>
      </div>
    </div>
  </div>
  <div class="prod-card prod-card-full">
    <h4 class="prod-title">📊 Category <small style="font-weight:400;color:#9ca3af;">— click row</small></h4>
    <table class="prod-table"><thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
    <tbody>${CAT_TBODY}</tbody></table>
  </div>
</div>`),
    htmlFooter: `<footer class="prod-footer"><p>${D.companyName} · Production Dashboard · ${D.periodLabel} · Generated: ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.prod-header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 24px 14px;background:linear-gradient(135deg,#1c1917,#292524);color:#fff;margin-bottom:18px}
.prod-brand h1{font-size:17px;font-weight:700;margin-bottom:5px}.prod-brand p{opacity:.65;font-size:10.5px;margin-top:2px}
.prod-meta{text-align:right}.prod-badge{background:#f97316;color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.prod-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.prod-body{padding:0 24px 18px}
.prod-strip{display:grid;grid-template-columns:repeat(10,1fr);gap:7px;margin-bottom:14px}
.prod-strip-item{border-radius:7px;padding:9px 6px;text-align:center;border:1px solid #e5e7eb}
.prod-strip-item span{font-size:8.5px;display:block;margin-bottom:3px;text-transform:uppercase;opacity:.7}
.prod-strip-item strong{font-size:14px;font-weight:700;display:block}
.prod-strip-blue{background:#eff6ff;color:#1d4ed8}.prod-strip-green{background:#f0fdf4;color:#15803d}
.prod-strip-amber{background:#fffbeb;color:#b45309}.prod-strip-teal{background:#f0fdfa;color:#0f766e}
.prod-strip-indigo{background:#eef2ff;color:#4338ca}.prod-strip-rose{background:#fff1f2;color:#be123c}.prod-strip-slate{background:#f8fafc;color:#334155}
.prod-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.prod-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}
.prod-card-full{margin-bottom:14px}
.prod-title{font-size:11px;font-weight:700;color:#1c1917;border-left:3px solid #f97316;padding-left:7px;margin-bottom:10px}
.prod-table{width:100%;border-collapse:collapse;font-size:11px}
.prod-table thead tr{background:#1c1917;color:#fff}
.prod-table th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
.prod-table td{padding:5px 8px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
.prod-table tbody tr:hover{background:#fff7ed}
.tbl-muted{color:#9ca3af}.pct-badge{background:#ffedd5;color:#c2410c;padding:1px 7px;border-radius:8px;font-size:10px;font-weight:600}
.prod-pr-list{display:flex;flex-direction:column;gap:6px}
.prod-pr-row{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.prod-pr-urgent{background:#fecaca;color:#7f1d1d}.prod-pr-high{background:#fef08a;color:#713f12}
.prod-pr-normal{background:#e0f2fe;color:#0c4a6e}.prod-pr-low{background:#f3f4f6;color:#6b7280}
.prod-info-list{display:flex;flex-direction:column;gap:6px}
.prod-info-row{display:flex;justify-content:space-between;padding:5px 8px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:5px;font-size:11.5px}
.prod-info-row:hover{background:#fff7ed}.prod-c-green{color:#059669}.prod-c-blue{color:#2563eb}.prod-c-amber{color:#d97706}.prod-c-red{color:#dc2626}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden;display:inline-block;width:70%;vertical-align:middle}
.bar-fill{background:linear-gradient(90deg,#f97316,#fb923c);height:100%;border-radius:4px}
.prod-footer{padding:10px 24px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 7. MANAGEMENT SUMMARY DASHBOARD
  // ══════════════════════════════════════════════════════════
  {
    name: "Management Summary Dashboard",
    description: "Status bar, 3-card summary, category, step performance — interactive drill-down, filters, search & CSV export",
    icon: "📋",
    htmlHeader: `<header class="mgmt-header">
  <div class="mgmt-brand"><h1>${D.companyName}</h1><p>${D.companyAddress} · ${D.companyPhone}</p></div>
  <div class="mgmt-title-block"><div class="mgmt-badge">MANAGEMENT REPORT</div><h2>${D.periodLabel}</h2><p>${D.branchName} (${D.branchCode}) · ${D.generatedAt}</p></div>
</header>`,
    htmlBody: wrap(`<div class="mgmt-body">
  <div class="mgmt-status-bar">
    <div class="mgmt-sb-item               i-clickable" onclick="drillStatus('all')">        <small>Total</small>      <strong>${D.totalOrders}</strong></div>
    <div class="mgmt-sb-item mgmt-sb-green  i-clickable" onclick="drillStatus('completed')">  <small>Completed</small>  <strong>${D.completedOrders}</strong></div>
    <div class="mgmt-sb-item mgmt-sb-blue   i-clickable" onclick="drillStatus('in-progress')"><small>In Progress</small><strong>${D.inProgressOrders}</strong></div>
    <div class="mgmt-sb-item mgmt-sb-amber  i-clickable" onclick="drillStatus('pending')">    <small>Pending</small>    <strong>${D.pendingOrders}</strong></div>
    <div class="mgmt-sb-item mgmt-sb-teal   i-clickable" onclick="drillStatus('dispatched')"> <small>Dispatched</small> <strong>${D.dispatchedOrders}</strong></div>
    <div class="mgmt-sb-item               i-clickable" onclick="drillStatus('approved')">    <small>Approved</small>   <strong>${D.approvedOrders}</strong></div>
    <div class="mgmt-sb-item mgmt-sb-red    i-clickable" onclick="drillStatus('cancelled')">  <small>Cancelled</small>  <strong>${D.cancelledOrders}</strong></div>
    <div class="mgmt-sb-item mgmt-sb-purple"><small>Revenue</small><strong>${D.totalRevenue}</strong></div>
  </div>
  <div class="mgmt-summary-row">
    <div class="mgmt-sum-card">
      <h4 class="mgmt-sum-title">👥 Customers</h4>
      <div class="mgmt-sum-big">${D.totalCustomers}</div>
      <div class="mgmt-sum-subs">
        <span>New: <strong>${D.newCustomers}</strong></span>
        <span>Repeat: <strong>${D.repeatCustomers}</strong></span>
        <span>Top: <strong>${D.topCustomer}</strong></span>
      </div>
    </div>
    <div class="mgmt-sum-card">
      <h4 class="mgmt-sum-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click</small></h4>
      <div class="mgmt-prio-grid">
        <div class="mgmt-prio-pill mgmt-prio-urgent i-clickable" onclick="drillPriority('urgent')">Urgent <strong>${D.urgentOrders}</strong> <span class="i-arrow-hint">→</span></div>
        <div class="mgmt-prio-pill mgmt-prio-high   i-clickable" onclick="drillPriority('high')">  High   <strong>${D.highOrders}</strong>   <span class="i-arrow-hint">→</span></div>
        <div class="mgmt-prio-pill mgmt-prio-normal i-clickable" onclick="drillPriority('normal')">Normal <strong>${D.normalOrders}</strong> <span class="i-arrow-hint">→</span></div>
        <div class="mgmt-prio-pill mgmt-prio-low    i-clickable" onclick="drillPriority('low')">   Low    <strong>${D.lowOrders}</strong>    <span class="i-arrow-hint">→</span></div>
      </div>
    </div>
    <div class="mgmt-sum-card">
      <h4 class="mgmt-sum-title">⚗️ Production</h4>
      <div class="mgmt-sum-subs mgmt-sum-subs-col">
        <span>Items: <strong>${D.totalItems}</strong></span>
        <span>Quantity: <strong>${D.totalQuantity}</strong></span>
        <span>Mix Batches: <strong>${D.totalMixBatches}</strong></span>
        <span>Avg Mix Time: <strong>${D.avgMixTime} min</strong></span>
        <span>On-Time: <strong>${D.onTimeDeliveryRate}</strong></span>
        <span>Avg Days: <strong>${D.avgCompletionDays}</strong></span>
      </div>
    </div>
  </div>
  <div class="mgmt-row-2">
    <div class="mgmt-card">
      <h4 class="mgmt-card-title">📊 Category <small style="font-weight:400;color:#9ca3af;">— click row</small></h4>
      <table class="mgmt-table"><thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
      <tbody>${CAT_TBODY}</tbody></table>
    </div>
    <div class="mgmt-card">
      <h4 class="mgmt-card-title">⚙️ Step Performance</h4>
      <table class="mgmt-table"><thead><tr><th>#</th><th>Step</th><th>Done</th><th>Avg Days</th></tr></thead>
      <tbody>
        <tr><td class="mgmt-muted">1</td><td><strong>testme</strong></td><td style="text-align:center">3</td><td style="text-align:center">5.0d</td></tr>
      </tbody></table>
    </div>
  </div>
</div>`),
    htmlFooter: `<footer class="mgmt-footer">
  <div class="mgmt-footer-sigs">
    <div><p>Prepared By</p><div class="mgmt-sig"></div><small>________________________</small></div>
    <div><p>Branch Manager</p><div class="mgmt-sig"></div><small>________________________</small></div>
    <div><p>Reviewed By</p><div class="mgmt-sig"></div><small>________________________</small></div>
  </div>
  <p class="mgmt-fine">${D.companyName} · ${D.branchName} · ${D.periodLabel} · Generated: ${D.generatedAt}</p>
</footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.mgmt-header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 24px 14px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;margin-bottom:18px}
.mgmt-brand h1{font-size:18px;font-weight:700;margin-bottom:5px}.mgmt-brand p{opacity:.55;font-size:10.5px}
.mgmt-title-block{text-align:right}.mgmt-badge{background:#3b82f6;color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.mgmt-title-block h2{font-size:16px;font-weight:700}.mgmt-title-block p{font-size:10.5px;opacity:.7;margin-top:3px}
.mgmt-body{padding:0 24px 18px}
.mgmt-status-bar{display:grid;grid-template-columns:repeat(8,1fr);gap:0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px;background:#fff}
.mgmt-sb-item{padding:10px 8px;text-align:center;border-right:1px solid #e5e7eb}.mgmt-sb-item:last-child{border-right:none}.mgmt-sb-item:hover{opacity:.85}
.mgmt-sb-item small{font-size:9px;text-transform:uppercase;color:#9ca3af;display:block;margin-bottom:3px}
.mgmt-sb-item strong{font-size:14px;font-weight:700;display:block}
.mgmt-sb-green{background:#f0fdf4}.mgmt-sb-green strong{color:#15803d}.mgmt-sb-blue{background:#eff6ff}.mgmt-sb-blue strong{color:#1d4ed8}
.mgmt-sb-amber{background:#fffbeb}.mgmt-sb-amber strong{color:#b45309}.mgmt-sb-teal{background:#f0fdfa}.mgmt-sb-teal strong{color:#0f766e}
.mgmt-sb-red{background:#fff1f2}.mgmt-sb-red strong{color:#be123c}.mgmt-sb-purple{background:#faf5ff}.mgmt-sb-purple strong{color:#7e22ce}
.mgmt-summary-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}
.mgmt-sum-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}
.mgmt-sum-title{font-size:10.5px;font-weight:700;color:#0f172a;border-left:3px solid #3b82f6;padding-left:7px;margin-bottom:8px}
.mgmt-sum-big{font-size:28px;font-weight:700;color:#0f172a;margin-bottom:8px}
.mgmt-sum-subs{display:flex;flex-wrap:wrap;gap:5px 16px;font-size:11px;color:#4b5563}.mgmt-sum-subs-col{flex-direction:column;gap:5px}
.mgmt-prio-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px}
.mgmt-prio-pill{padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;display:flex;justify-content:space-between;align-items:center;border:1.5px solid transparent}
.mgmt-prio-urgent{background:#fecaca;color:#7f1d1d}.mgmt-prio-high{background:#fef08a;color:#713f12}
.mgmt-prio-normal{background:#e0f2fe;color:#0c4a6e}.mgmt-prio-low{background:#f3f4f6;color:#6b7280}
.mgmt-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.mgmt-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}
.mgmt-card-title{font-size:11px;font-weight:700;color:#0f172a;border-left:3px solid #3b82f6;padding-left:8px;margin-bottom:10px}
.mgmt-table{width:100%;border-collapse:collapse;font-size:11px}
.mgmt-table thead tr{background:#0f172a;color:#fff}
.mgmt-table th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
.mgmt-table td{padding:5px 8px;border-bottom:1px solid #f3f4f6}
.mgmt-table tbody tr:hover{background:#eff6ff}
.mgmt-muted{color:#9ca3af}.tbl-muted{color:#9ca3af}.pct-badge{background:#e0e7ff;color:#4338ca;padding:1px 7px;border-radius:8px;font-size:10px;font-weight:600}
.mgmt-footer{padding:14px 24px 0;border-top:1px solid #e5e7eb;margin-top:20px;background:#fff}
.mgmt-footer-sigs{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:12px}
.mgmt-footer-sigs div{text-align:center}.mgmt-footer-sigs p{font-size:10px;color:#6b7280;margin-bottom:22px}
.mgmt-sig{border-bottom:1px solid #374151;margin:0 10px 4px}.mgmt-footer-sigs small{font-size:9.5px;color:#9ca3af}
.mgmt-fine{font-size:9.5px;text-align:center;color:#9ca3af;margin-top:6px;padding-bottom:10px}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#3b82f6,#2563eb);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 8. BILLING & INVOICE SUMMARY
  // ══════════════════════════════════════════════════════════
  {
    name: "Billing & Invoice Summary",
    description: "Invoice totals, GST breakdown, hallmark, silver value — interactive drill-down, filters, search & CSV export",
    icon: "🧾",
    htmlHeader: `<header class="bill-header">
  <div class="bill-brand"><h1>${D.companyName}</h1><p>${D.companyAddress}</p><p>${D.companyPhone} · ${D.companyEmail}</p></div>
  <div class="bill-meta"><div class="bill-badge">BILLING SUMMARY</div><p><strong>Period:</strong> ${D.dateFrom} — ${D.dateTo}</p><p><strong>Branch:</strong> ${D.branchName} (${D.branchCode})</p><p><strong>Generated:</strong> ${D.generatedAt}</p></div>
</header>`,
    htmlBody: wrap(`<div class="bill-body">
  <div class="bill-hero-grid">
    <div class="bill-hero bill-hero-dark i-clickable" onclick="drillStatus('all')">
      <div class="bill-hero-label">Grand Total <span class="i-arrow-hint">→</span></div>
      <div class="bill-hero-val">${D.grandTotal}</div>
      <div class="bill-hero-sub">incl. ${D.taxRate}% GST</div>
    </div>
    <div class="bill-hero bill-hero-green">
      <div class="bill-hero-label">Silver Value</div>
      <div class="bill-hero-val">${D.totalSilverValue}</div>
      <div class="bill-hero-sub">Pure weight: ${D.totalPureWeight}g</div>
    </div>
    <div class="bill-hero bill-hero-amber">
      <div class="bill-hero-label">Making Charges</div>
      <div class="bill-hero-val">${D.totalMCAmount}</div>
      <div class="bill-hero-sub">Total pieces: ${D.totalPieces}</div>
    </div>
    <div class="bill-hero bill-hero-slate">
      <div class="bill-hero-label">Tax Amount</div>
      <div class="bill-hero-val">${D.taxAmount}</div>
      <div class="bill-hero-sub">@ ${D.taxRate}% GST</div>
    </div>
  </div>
  <div class="bill-row-2">
    <div class="bill-card">
      <h4 class="bill-title">🧮 Billing Breakdown</h4>
      <div class="bill-calc-list">
        <div class="bill-calc-row"><span>Total Gross Weight</span><strong>${D.totalGrossWeight} g</strong></div>
        <div class="bill-calc-row"><span>Total Pure Weight</span> <strong>${D.totalPureWeight} g</strong></div>
        <div class="bill-calc-row"><span>Silver Value</span>      <strong>${D.totalSilverValue}</strong></div>
        <div class="bill-calc-row"><span>Wastage Amount</span>    <strong>${D.totalWastageAmount}</strong></div>
        <div class="bill-calc-row"><span>Making Charges</span>    <strong>${D.totalMCAmount}</strong></div>
        <div class="bill-calc-row bill-calc-sub"><span>Subtotal</span><strong>${D.subtotal}</strong></div>
        <div class="bill-calc-row"><span>Hallmark Charges</span>  <strong>${D.hmChargesAmount}</strong></div>
        <div class="bill-calc-row"><span>GST (${D.taxRate}%)</span><strong>${D.taxAmount}</strong></div>
        <div class="bill-calc-row bill-calc-total"><span>Grand Total</span><strong>${D.grandTotal}</strong></div>
      </div>
    </div>
    <div class="bill-card">
      <h4 class="bill-title">📊 Orders Summary <small style="font-weight:400;color:#9ca3af;">— click status</small></h4>
      <div class="bill-calc-list">
        <div class="bill-calc-row i-clickable" onclick="drillStatus('all')">       <span>Total Orders</span>       <strong>${D.totalOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="bill-calc-row i-clickable" onclick="drillStatus('completed')"> <span>Completed</span>           <strong>${D.completedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="bill-calc-row i-clickable" onclick="drillStatus('pending')">   <span>Pending</span>             <strong>${D.pendingOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="bill-calc-row"><span>Revenue</span>              <strong>${D.totalRevenue}</strong></div>
        <div class="bill-calc-row"><span>Avg Order Value</span>      <strong>${D.avgOrderValue}</strong></div>
        <div class="bill-calc-row"><span>Display Rate</span>         <strong>${D.displayRate}/g</strong></div>
      </div>
    </div>
  </div>
  <div class="bill-card bill-card-full">
    <h4 class="bill-title">📊 Category <small style="font-weight:400;color:#9ca3af;">— click row</small></h4>
    <table class="bill-table"><thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
    <tbody>${CAT_TBODY}</tbody></table>
  </div>
</div>`),
    htmlFooter: `<footer class="bill-footer"><p>${D.companyName} · Billing Summary · ${D.periodLabel} · Generated: ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.bill-header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 26px 14px;background:linear-gradient(135deg,#111827,#1f2937);color:#fff;margin-bottom:18px}
.bill-brand h1{font-size:17px;font-weight:700;margin-bottom:5px}.bill-brand p{opacity:.6;font-size:10.5px;margin-top:2px}
.bill-meta{text-align:right}.bill-badge{background:#f59e0b;color:#111827;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.bill-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.bill-body{padding:0 26px 18px}
.bill-hero-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.bill-hero{border-radius:10px;padding:16px 14px}.bill-hero-label{font-size:9.5px;text-transform:uppercase;letter-spacing:1px;opacity:.7;margin-bottom:6px}
.bill-hero-val{font-size:20px;font-weight:700;margin-bottom:4px}.bill-hero-sub{font-size:10px;opacity:.65}
.bill-hero-dark{background:#111827;color:#f9fafb}.bill-hero-green{background:#f0fdf4;color:#15803d}
.bill-hero-amber{background:#fffbeb;color:#b45309}.bill-hero-slate{background:#fff;color:#374151;border:1px solid #e5e7eb}
.bill-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.bill-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}.bill-card-full{margin-bottom:14px}
.bill-title{font-size:11px;font-weight:700;color:#111827;border-left:3px solid #f59e0b;padding-left:8px;margin-bottom:11px}
.bill-calc-list{display:flex;flex-direction:column;gap:5px}
.bill-calc-row{display:flex;justify-content:space-between;align-items:center;padding:5px 9px;background:#f9fafb;border-radius:5px;border:1px solid #f3f4f6;font-size:11.5px}
.bill-calc-row:hover{background:#fef3c7}
.bill-calc-sub{border-top:2px solid #e5e7eb;margin-top:4px;background:#f0fdf4!important}
.bill-calc-total{background:#111827!important;color:#fff!important;border-radius:6px;margin-top:4px}
.bill-calc-total strong{color:#fbbf24!important;font-size:14px}
.bill-table{width:100%;border-collapse:collapse;font-size:10.5px}
.bill-table thead tr{background:#111827;color:#fff}
.bill-table th{padding:6px 7px;text-align:left;font-size:9px;text-transform:uppercase}
.bill-table td{padding:5px 7px;border-bottom:1px solid #f3f4f6}
.bill-table tbody tr:hover{background:#fef3c7}
.tbl-muted{color:#9ca3af}.pct-badge{background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:600}
.bill-footer{padding:10px 26px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#f59e0b,#d97706);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 9. ORDER SOURCE & API TRACKING
  // ══════════════════════════════════════════════════════════
  {
    name: "Order Source & API Tracking",
    description: "Order source breakdown, status mix, priority — interactive drill-down, filters, search & CSV export",
    icon: "🌐",
    htmlHeader: `<header class="src-header">
  <div class="src-left"><div class="src-company">${D.companyName}</div><div class="src-branch">${D.branchName} (${D.branchCode})</div></div>
  <div class="src-center"><h1>SOURCE &amp; API TRACKING</h1><div class="src-period">${D.periodLabel}</div></div>
  <div class="src-right"><p>Generated: <strong>${D.generatedAt}</strong></p><p>Total Orders: <strong>${D.totalOrders}</strong></p></div>
</header>`,
    htmlBody: wrap(`<div class="src-body">
  <div class="src-type-grid">
    <div class="src-type-card src-internal i-clickable" onclick="drillStatus('all')"><div class="src-type-icon">🏢</div><div class="src-type-label">Internal Orders</div><div class="src-type-val">${D.internalOrders}</div><div class="src-type-sub">Created in-house <span class="i-arrow-hint">→</span></div></div>
    <div class="src-type-card src-api">    <div class="src-type-icon">🔌</div><div class="src-type-label">External API</div>   <div class="src-type-val">${D.apiOrders}</div>      <div class="src-type-sub">Via API keys</div></div>
    <div class="src-type-card src-web">    <div class="src-type-icon">🌐</div><div class="src-type-label">Website Orders</div> <div class="src-type-val">${D.websiteOrders}</div>  <div class="src-type-sub">From web portal</div></div>
    <div class="src-type-card src-mobile"> <div class="src-type-icon">📱</div><div class="src-type-label">Mobile App</div>     <div class="src-type-val">${D.mobileOrders}</div>   <div class="src-type-sub">From mobile app</div></div>
    <div class="src-type-card src-forward"><div class="src-type-icon">🔄</div><div class="src-type-label">Forwarded (B2B)</div><div class="src-type-val">${D.forwardedOrders}</div><div class="src-type-sub">Cross-company</div></div>
    <div class="src-type-card src-total i-clickable" onclick="drillStatus('all')"><div class="src-type-icon">📦</div><div class="src-type-label">Total Orders</div><div class="src-type-val">${D.totalOrders}</div><div class="src-type-sub">View All <span class="i-arrow-hint">→</span></div></div>
  </div>
  <div class="src-row-3">
    <div class="src-card">
      <h4 class="src-title">📦 Order Status <small style="font-weight:400;color:#9ca3af;">— click</small></h4>
      <div class="src-info-list">
        <div class="src-info-row i-clickable" onclick="drillStatus('completed')">  <span>✅ Completed</span> <strong class="src-c-green">${D.completedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="src-info-row i-clickable" onclick="drillStatus('pending')">    <span>⏳ Pending</span>   <strong class="src-c-amber">${D.pendingOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="src-info-row i-clickable" onclick="drillStatus('in-progress')"><span>🔵 In Progress</span><strong class="src-c-blue">${D.inProgressOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="src-info-row i-clickable" onclick="drillStatus('approved')">   <span>✔ Approved</span>  <strong>${D.approvedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="src-info-row i-clickable" onclick="drillStatus('dispatched')"> <span>🚚 Dispatched</span><strong>${D.dispatchedOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="src-info-row i-clickable" onclick="drillStatus('cancelled')">  <span>❌ Cancelled</span> <strong class="src-c-red">${D.cancelledOrders} <span class="i-arrow-hint">→</span></strong></div>
      </div>
    </div>
    <div class="src-card">
      <h4 class="src-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click</small></h4>
      <div class="src-pr-list">
        <div class="src-pr-row src-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>Urgent</span><strong>${D.urgentOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="src-pr-row src-pr-high   i-clickable" onclick="drillPriority('high')">  <span>High</span>  <strong>${D.highOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="src-pr-row src-pr-normal i-clickable" onclick="drillPriority('normal')"><span>Normal</span><strong>${D.normalOrders} <span class="i-arrow-hint">→</span></strong></div>
        <div class="src-pr-row src-pr-low    i-clickable" onclick="drillPriority('low')">   <span>Low</span>   <strong>${D.lowOrders} <span class="i-arrow-hint">→</span></strong></div>
      </div>
    </div>
    <div class="src-card">
      <h4 class="src-title">💰 Revenue KPIs</h4>
      <div class="src-info-list">
        <div class="src-info-row"><span>Total Revenue</span>      <strong>${D.totalRevenue}</strong></div>
        <div class="src-info-row"><span>Completed Revenue</span>  <strong class="src-c-green">${D.completedRevenue}</strong></div>
        <div class="src-info-row"><span>Avg Order Value</span>    <strong>${D.avgOrderValue}</strong></div>
        <div class="src-info-row"><span>On-Time Rate</span>       <strong>${D.onTimeDeliveryRate}</strong></div>
        <div class="src-info-row"><span>Same-Day Dispatch</span>  <strong>${D.sameDayDispatchCount}</strong></div>
      </div>
    </div>
  </div>
</div>`),
    htmlFooter: `<footer class="src-footer"><p>${D.companyName} · Source Tracking · ${D.periodLabel} · ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.src-header{display:flex;justify-content:space-between;align-items:center;padding:14px 24px;background:linear-gradient(135deg,#0369a1,#0284c7);color:#fff;margin-bottom:18px}
.src-company{font-size:16px;font-weight:700}.src-branch{font-size:10px;opacity:.65;margin-top:2px}
.src-center{text-align:center}.src-center h1{font-size:17px;letter-spacing:3px;font-weight:700}.src-period{font-size:11px;opacity:.75;margin-top:3px}
.src-right{text-align:right;font-size:10.5px}.src-right p{margin-top:3px;opacity:.85}
.src-body{padding:0 24px 18px}
.src-type-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px}
.src-type-card{border-radius:9px;padding:13px 10px;text-align:center;border:1px solid #e5e7eb;background:#fff}
.src-type-icon{font-size:22px;margin-bottom:5px}.src-type-label{font-size:9px;text-transform:uppercase;letter-spacing:.5px;opacity:.65;margin-bottom:4px}
.src-type-val{font-size:20px;font-weight:700;margin-bottom:2px}.src-type-sub{font-size:9px;opacity:.55}
.src-internal{background:#f0fdf4;color:#15803d}.src-api{background:#eff6ff;color:#1d4ed8}
.src-web{background:#f0fdfa;color:#0f766e}.src-mobile{background:#faf5ff;color:#7e22ce}
.src-forward{background:#fefce8;color:#a16207}.src-total{background:#f8fafc;color:#334155;border:2px solid #94a3b8}
.src-row-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}
.src-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:13px}
.src-title{font-size:11px;font-weight:700;color:#0369a1;border-left:3px solid #0369a1;padding-left:7px;margin-bottom:10px}
.src-info-list{display:flex;flex-direction:column;gap:5px}
.src-info-row{display:flex;justify-content:space-between;padding:5px 8px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:5px;font-size:11.5px}
.src-info-row:hover{background:#e0f2fe}
.src-c-green{color:#059669}.src-c-amber{color:#d97706}.src-c-blue{color:#2563eb}.src-c-red{color:#dc2626}
.src-pr-list{display:flex;flex-direction:column;gap:6px}
.src-pr-row{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.src-pr-urgent{background:#fecaca;color:#7f1d1d}.src-pr-high{background:#fef08a;color:#713f12}
.src-pr-normal{background:#e0f2fe;color:#0c4a6e}.src-pr-low{background:#f3f4f6;color:#6b7280}
.src-footer{padding:10px 24px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#0369a1,#0284c7);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 10. DISPATCH & DELIVERY TRACKING
  // ══════════════════════════════════════════════════════════
  {
    name: "Dispatch & Delivery Tracking",
    description: "Dispatch KPIs, step performance, delivery stats — interactive drill-down, filters, search & CSV export",
    icon: "🚚",
    htmlHeader: `<header class="dsp-header">
  <div class="dsp-brand"><div class="dsp-logo">🚚</div><div><h1>${D.companyName}</h1><p>${D.companyAddress} · ${D.companyPhone}</p></div></div>
  <div class="dsp-meta"><div class="dsp-badge">DISPATCH TRACKER</div><p><strong>Period:</strong> ${D.periodLabel}</p><p><strong>Branch:</strong> ${D.branchName} (${D.branchCode})</p><p><strong>Generated:</strong> ${D.generatedAt} ${D.generatedTime}</p></div>
</header>`,
    htmlBody: wrap(`<div class="dsp-body">
  <div class="dsp-kpi-strip">
    <div class="dsp-kpi dsp-kpi-teal   i-clickable" onclick="drillStatus('dispatched')"> <div class="dsp-kpi-val">${D.dispatchedOrders}</div> <div class="dsp-kpi-lbl">🚚 Dispatched <span class="i-arrow-hint">→</span></div></div>
    <div class="dsp-kpi dsp-kpi-green">  <div class="dsp-kpi-val">${D.onTimeDeliveryRate}</div><div class="dsp-kpi-lbl">⏱ On-Time Rate</div></div>
    <div class="dsp-kpi dsp-kpi-blue">   <div class="dsp-kpi-val">${D.sameDayDispatchCount}</div><div class="dsp-kpi-lbl">⚡ Same-Day</div></div>
    <div class="dsp-kpi dsp-kpi-indigo i-clickable" onclick="drillStatus('completed')">  <div class="dsp-kpi-val">${D.completedOrders}</div>   <div class="dsp-kpi-lbl">✅ Completed <span class="i-arrow-hint">→</span></div></div>
    <div class="dsp-kpi dsp-kpi-amber  i-clickable" onclick="drillStatus('pending')">    <div class="dsp-kpi-val">${D.pendingOrders}</div>     <div class="dsp-kpi-lbl">⏳ Pending <span class="i-arrow-hint">→</span></div></div>
    <div class="dsp-kpi dsp-kpi-slate">  <div class="dsp-kpi-val">${D.avgCompletionDays}</div><div class="dsp-kpi-lbl">📅 Avg Days</div></div>
    <div class="dsp-kpi dsp-kpi-purple i-clickable" onclick="drillStatus('all')">        <div class="dsp-kpi-val">${D.totalOrders}</div>      <div class="dsp-kpi-lbl">📦 Total Orders <span class="i-arrow-hint">→</span></div></div>
    <div class="dsp-kpi dsp-kpi-rose   i-clickable" onclick="drillPriority('urgent')">   <div class="dsp-kpi-val">${D.urgentOrders}</div>     <div class="dsp-kpi-lbl">🔥 Urgent <span class="i-arrow-hint">→</span></div></div>
  </div>
  <div class="dsp-row-2">
    <div class="dsp-card">
      <h4 class="dsp-title">⚙️ Step Performance</h4>
      <table class="dsp-table"><thead><tr><th>#</th><th>Step</th><th>Completed</th><th>Avg Days</th><th>Progress</th></tr></thead>
      <tbody>${STEP_TBODY}</tbody></table>
    </div>
    <div class="dsp-card">
      <h4 class="dsp-title">👤 Delivery Customer Stats</h4>
      <div class="dsp-info-list">
        <div class="dsp-info-row"><span>Total Customers</span>  <strong>${D.totalCustomers}</strong></div>
        <div class="dsp-info-row"><span>New Customers</span>    <strong>${D.newCustomers}</strong></div>
        <div class="dsp-info-row"><span>Repeat Customers</span> <strong>${D.repeatCustomers}</strong></div>
        <div class="dsp-info-row"><span>Top Customer</span>     <strong>${D.topCustomer}</strong></div>
        <div class="dsp-info-row"><span>Total Revenue</span>    <strong>${D.totalRevenue}</strong></div>
        <div class="dsp-info-row"><span>Avg Order Value</span>  <strong>${D.avgOrderValue}</strong></div>
      </div>
    </div>
  </div>
</div>`),
    htmlFooter: `<footer class="dsp-footer"><p>${D.companyName} · Dispatch &amp; Delivery · ${D.periodLabel} · ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Outfit',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.dsp-header{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:linear-gradient(135deg,#0f766e,#0d9488);color:#fff;margin-bottom:18px}
.dsp-brand{display:flex;align-items:center;gap:12px}.dsp-logo{font-size:30px}
.dsp-brand h1{font-size:16px;font-weight:700;margin-bottom:3px}.dsp-brand p{font-size:10px;opacity:.65}
.dsp-meta{text-align:right}.dsp-badge{background:#99f6e4;color:#0f766e;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.dsp-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.dsp-body{padding:0 24px 18px}
.dsp-kpi-strip{display:grid;grid-template-columns:repeat(8,1fr);gap:9px;margin-bottom:16px}
.dsp-kpi{border-radius:9px;padding:12px 8px;text-align:center}
.dsp-kpi-val{font-size:18px;font-weight:700;margin-bottom:4px}.dsp-kpi-lbl{font-size:9px;opacity:.7;text-transform:uppercase;letter-spacing:.4px}
.dsp-kpi-teal{background:#f0fdfa;color:#0f766e}.dsp-kpi-green{background:#f0fdf4;color:#15803d}
.dsp-kpi-blue{background:#eff6ff;color:#1d4ed8}.dsp-kpi-indigo{background:#eef2ff;color:#4338ca}
.dsp-kpi-amber{background:#fffbeb;color:#b45309}.dsp-kpi-slate{background:#f8fafc;color:#334155}
.dsp-kpi-purple{background:#faf5ff;color:#7e22ce}.dsp-kpi-rose{background:#fff1f2;color:#be123c}
.dsp-row-2{display:grid;grid-template-columns:3fr 2fr;gap:12px;margin-bottom:14px}
.dsp-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}
.dsp-title{font-size:11px;font-weight:700;color:#0f766e;border-left:3px solid #0d9488;padding-left:7px;margin-bottom:10px}
.dsp-table{width:100%;border-collapse:collapse;font-size:11px}
.dsp-table thead tr{background:#0f766e;color:#fff}
.dsp-table th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
.dsp-table td{padding:5px 8px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
.dsp-table tbody tr:hover{background:#f0fdfa}
.tbl-muted{color:#9ca3af}
.dsp-info-list{display:flex;flex-direction:column;gap:6px}
.dsp-info-row{display:flex;justify-content:space-between;padding:5px 8px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:5px;font-size:11.5px}
.dsp-footer{padding:10px 24px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#0f766e,#0d9488);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 11. OPTIONS & PRODUCT CATEGORY REPORT
  // ══════════════════════════════════════════════════════════
  {
    name: "Options & Product Category Report",
    description: "Product/material/printing/packaging options — interactive drill-down, filters, search & CSV export",
    icon: "🗂️",
    htmlHeader: `<header class="opt-header">
  <div class="opt-brand"><h1>${D.companyName}</h1><p>${D.companyAddress} · ${D.companyEmail}</p></div>
  <div class="opt-meta"><div class="opt-badge">OPTIONS REPORT</div><p><strong>Period:</strong> ${D.periodLabel}</p><p><strong>Branch:</strong> ${D.branchName} (${D.branchCode})</p><p><strong>Generated:</strong> ${D.generatedAt}</p></div>
</header>`,
    htmlBody: wrap(`<div class="opt-body">
  <div class="opt-cat-row">
    <div class="opt-cat-card opt-cat-product i-clickable"  onclick="drillCategory('Product')">  <div class="opt-cat-icon">🏷️</div><div class="opt-cat-name">Product</div>  <div class="opt-cat-count">${D.productOptionCount}</div>  <div class="opt-cat-sub">View Orders <span class="i-arrow-hint">→</span></div></div>
    <div class="opt-cat-card opt-cat-material i-clickable" onclick="drillCategory('Material')"> <div class="opt-cat-icon">⚗️</div><div class="opt-cat-name">Material</div> <div class="opt-cat-count">${D.materialOptionCount}</div> <div class="opt-cat-sub">View Orders <span class="i-arrow-hint">→</span></div></div>
    <div class="opt-cat-card opt-cat-printing i-clickable" onclick="drillCategory('Printing')"> <div class="opt-cat-icon">🖨️</div><div class="opt-cat-name">Printing</div> <div class="opt-cat-count">${D.printingOptionCount}</div> <div class="opt-cat-sub">View Orders <span class="i-arrow-hint">→</span></div></div>
    <div class="opt-cat-card opt-cat-packaging i-clickable"onclick="drillCategory('Packaging')"><div class="opt-cat-icon">📦</div><div class="opt-cat-name">Packaging</div><div class="opt-cat-count">${D.packagingOptionCount}</div><div class="opt-cat-sub">View Orders <span class="i-arrow-hint">→</span></div></div>
    <div class="opt-cat-card opt-cat-total i-clickable"    onclick="drillStatus('all')">         <div class="opt-cat-icon">📊</div><div class="opt-cat-name">Total Orders</div><div class="opt-cat-count">${D.totalOrders}</div>      <div class="opt-cat-sub">View All <span class="i-arrow-hint">→</span></div></div>
    <div class="opt-cat-card opt-cat-qty">                                                       <div class="opt-cat-icon">🔢</div><div class="opt-cat-name">Total Quantity</div><div class="opt-cat-count">${D.totalQuantity}</div>     <div class="opt-cat-sub">units</div></div>
  </div>
  <div class="opt-row-2">
    <div class="opt-card">
      <h4 class="opt-title">📊 Category Revenue <small style="font-weight:400;color:#9ca3af;">— click row</small></h4>
      <table class="opt-table"><thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
      <tbody>${CAT_TBODY}</tbody></table>
    </div>
    <div class="opt-card">
      <h4 class="opt-title">⚙️ Production Overview</h4>
      <div class="opt-info-list">
        <div class="opt-info-row"><span>Total Items</span>       <strong>${D.totalItems}</strong></div>
        <div class="opt-info-row"><span>Total Quantity</span>    <strong>${D.totalQuantity}</strong></div>
        <div class="opt-info-row"><span>Mix Batches</span>       <strong>${D.totalMixBatches}</strong></div>
        <div class="opt-info-row"><span>Avg Mix Time</span>      <strong>${D.avgMixTime} min</strong></div>
        <div class="opt-info-row"><span>Avg Temperature</span>   <strong>${D.avgTemperature}°C</strong></div>
        <div class="opt-info-row"><span>On-Time Rate</span>      <strong>${D.onTimeDeliveryRate}</strong></div>
      </div>
    </div>
  </div>
  <div class="opt-card opt-card-full">
    <h4 class="opt-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click to drill</small></h4>
    <div class="opt-prio-strip">
      <div class="opt-prio-item opt-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>⚡ Urgent</span><strong>${D.urgentOrders}</strong><span class="i-arrow-hint">→</span></div>
      <div class="opt-prio-item opt-pr-high   i-clickable" onclick="drillPriority('high')">  <span>🔴 High</span>  <strong>${D.highOrders}</strong>  <span class="i-arrow-hint">→</span></div>
      <div class="opt-prio-item opt-pr-normal i-clickable" onclick="drillPriority('normal')"><span>🔵 Normal</span><strong>${D.normalOrders}</strong><span class="i-arrow-hint">→</span></div>
      <div class="opt-prio-item opt-pr-low    i-clickable" onclick="drillPriority('low')">   <span>⚪ Low</span>   <strong>${D.lowOrders}</strong>   <span class="i-arrow-hint">→</span></div>
    </div>
  </div>
</div>`),
    htmlFooter: `<footer class="opt-footer"><p>${D.companyName} · Options Report · ${D.periodLabel} · ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'IBM Plex Sans',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.opt-header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 24px 14px;background:linear-gradient(135deg,#4c1d95,#5b21b6);color:#fff;margin-bottom:18px}
.opt-brand h1{font-size:17px;font-weight:700;margin-bottom:5px}.opt-brand p{opacity:.65;font-size:10.5px}
.opt-meta{text-align:right}.opt-badge{background:#a78bfa;color:#2e1065;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.opt-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.opt-body{padding:0 24px 18px}
.opt-cat-row{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px}
.opt-cat-card{border-radius:9px;padding:13px 8px;text-align:center;border:1px solid #e5e7eb;background:#fff}
.opt-cat-icon{font-size:22px;margin-bottom:5px}.opt-cat-name{font-size:9px;text-transform:uppercase;letter-spacing:.5px;opacity:.7;margin-bottom:4px}
.opt-cat-count{font-size:20px;font-weight:700;margin-bottom:2px}.opt-cat-sub{font-size:8.5px;opacity:.55}
.opt-cat-product{background:#eff6ff;color:#1d4ed8}.opt-cat-material{background:#f0fdf4;color:#15803d}
.opt-cat-printing{background:#fff7ed;color:#c2410c}.opt-cat-packaging{background:#faf5ff;color:#7e22ce}
.opt-cat-total{background:#f8fafc;color:#334155;border:2px solid #94a3b8}.opt-cat-qty{background:#fefce8;color:#a16207}
.opt-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.opt-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}.opt-card-full{margin-bottom:14px}
.opt-title{font-size:11px;font-weight:700;color:#4c1d95;border-left:3px solid #7c3aed;padding-left:7px;margin-bottom:10px}
.opt-table{width:100%;border-collapse:collapse;font-size:11px}
.opt-table thead tr{background:#4c1d95;color:#fff}
.opt-table th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
.opt-table td{padding:5px 8px;border-bottom:1px solid #f3f4f6}
.opt-table tbody tr:hover{background:#faf5ff}
.tbl-muted{color:#9ca3af}.pct-badge{background:#ede9fe;color:#5b21b6;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:600}
.opt-info-list{display:flex;flex-direction:column;gap:6px}
.opt-info-row{display:flex;justify-content:space-between;padding:5px 8px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:5px;font-size:11.5px}
.opt-prio-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.opt-prio-item{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.opt-pr-urgent{background:#fef2f2;color:#7f1d1d}.opt-pr-high{background:#fefce8;color:#713f12}
.opt-pr-normal{background:#eff6ff;color:#1e40af}.opt-pr-low{background:#f9fafb;color:#6b7280}
.opt-footer{padding:10px 24px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#7c3aed,#6d28d9);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 12. MACHINE OPERATOR PERFORMANCE
  // ══════════════════════════════════════════════════════════
  {
    name: "Machine Operator Performance",
    description: "Operator sessions, step completion, mix stats — interactive drill-down, filters, search & CSV export",
    icon: "🔧",
    htmlHeader: `<header class="mop-header">
  <div class="mop-brand"><h1>${D.companyName}</h1><p>${D.companyAddress} · ${D.companyPhone}</p></div>
  <div class="mop-meta"><div class="mop-badge">OPERATOR PERFORMANCE</div><p><strong>Period:</strong> ${D.periodLabel}</p><p><strong>Branch:</strong> ${D.branchName} (${D.branchCode})</p><p><strong>Generated:</strong> ${D.generatedAt}</p></div>
</header>`,
    htmlBody: wrap(`<div class="mop-body">
  <div class="mop-kpi-grid">
    <div class="mop-kpi mop-kpi-blue   i-clickable" onclick="drillStatus('all')">        <div class="mop-kpi-val">${D.totalOrders}</div>       <div class="mop-kpi-lbl">Total Orders <span class="i-arrow-hint">→</span></div></div>
    <div class="mop-kpi mop-kpi-green  i-clickable" onclick="drillStatus('completed')">  <div class="mop-kpi-val">${D.completedOrders}</div>    <div class="mop-kpi-lbl">Completed <span class="i-arrow-hint">→</span></div></div>
    <div class="mop-kpi mop-kpi-amber  i-clickable" onclick="drillStatus('in-progress')"><div class="mop-kpi-val">${D.inProgressOrders}</div><div class="mop-kpi-lbl">In Progress <span class="i-arrow-hint">→</span></div></div>
    <div class="mop-kpi mop-kpi-teal">   <div class="mop-kpi-val">${D.completedSteps}</div>   <div class="mop-kpi-lbl">Steps Done</div></div>
    <div class="mop-kpi mop-kpi-slate">  <div class="mop-kpi-val">${D.totalItems}</div>        <div class="mop-kpi-lbl">Total Items</div></div>
    <div class="mop-kpi mop-kpi-indigo"> <div class="mop-kpi-val">${D.totalMixBatches}</div>   <div class="mop-kpi-lbl">Mix Batches</div></div>
    <div class="mop-kpi mop-kpi-rose">   <div class="mop-kpi-val">${D.avgMixTime} min</div>    <div class="mop-kpi-lbl">Avg Mix Time</div></div>
    <div class="mop-kpi mop-kpi-purple"> <div class="mop-kpi-val">${D.avgCompletionDays}d</div><div class="mop-kpi-lbl">Avg Completion</div></div>
  </div>
  <div class="mop-card mop-card-full">
    <h4 class="mop-title">⚙️ Step Performance Analysis</h4>
    <table class="mop-table">
      <thead><tr><th>#</th><th>Step Name</th><th>Completed</th><th>Avg Days</th><th>Throughput</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td class="mop-muted">1</td><td><strong>testme</strong></td><td style="text-align:center">3</td><td style="text-align:center">5.0 d</td><td><div class="mop-bar-wrap"><div class="mop-bar-fill" data-bar="75%"></div></div></td><td><span class="mop-step-badge">Active</span></td></tr>
      </tbody>
    </table>
  </div>
  <div class="mop-row-2">
    <div class="mop-card">
      <h4 class="mop-title">⚗️ Mixing &amp; Material Stats</h4>
      <div class="mop-info-list">
        <div class="mop-info-row"><span>Total Mix Batches</span>  <strong>${D.totalMixBatches}</strong></div>
        <div class="mop-info-row"><span>Avg Mix Time</span>       <strong>${D.avgMixTime} min</strong></div>
        <div class="mop-info-row"><span>Avg Temperature</span>    <strong>${D.avgTemperature}°C</strong></div>
        <div class="mop-info-row"><span>Total Quantity</span>     <strong>${D.totalQuantity}</strong></div>
        <div class="mop-info-row"><span>Same-Day Dispatch</span>  <strong>${D.sameDayDispatchCount} orders</strong></div>
        <div class="mop-info-row"><span>On-Time Delivery</span>   <strong>${D.onTimeDeliveryRate}</strong></div>
      </div>
    </div>
    <div class="mop-card">
      <h4 class="mop-title">🔥 Priority Queue <small style="font-weight:400;color:#9ca3af;">— click</small></h4>
      <div class="mop-pr-list">
        <div class="mop-pr-row mop-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>⚡ Urgent</span><div class="mop-pr-right"><strong>${D.urgentOrders}</strong><span class="i-arrow-hint">→</span></div></div>
        <div class="mop-pr-row mop-pr-high   i-clickable" onclick="drillPriority('high')">  <span>🔴 High</span>  <div class="mop-pr-right"><strong>${D.highOrders}</strong><span class="i-arrow-hint">→</span></div></div>
        <div class="mop-pr-row mop-pr-normal i-clickable" onclick="drillPriority('normal')"><span>🔵 Normal</span><div class="mop-pr-right"><strong>${D.normalOrders}</strong><span class="i-arrow-hint">→</span></div></div>
        <div class="mop-pr-row mop-pr-low    i-clickable" onclick="drillPriority('low')">   <span>⚪ Low</span>   <div class="mop-pr-right"><strong>${D.lowOrders}</strong><span class="i-arrow-hint">→</span></div></div>
      </div>
    </div>
  </div>
</div>`),
    htmlFooter: `<footer class="mop-footer"><p>${D.companyName} · Operator Performance · ${D.periodLabel} · Generated: ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9}
.mop-header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 24px 14px;background:linear-gradient(135deg,#1c1917,#44403c);color:#fff;margin-bottom:18px}
.mop-brand h1{font-size:17px;font-weight:700;margin-bottom:5px}.mop-brand p{opacity:.6;font-size:10.5px;margin-top:2px}
.mop-meta{text-align:right}.mop-badge{background:#fb923c;color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.mop-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.mop-body{padding:0 24px 18px}
.mop-kpi-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:9px;margin-bottom:16px}
.mop-kpi{border-radius:8px;padding:12px 8px;text-align:center}
.mop-kpi-val{font-size:17px;font-weight:700;margin-bottom:4px}.mop-kpi-lbl{font-size:9px;opacity:.7;text-transform:uppercase;letter-spacing:.4px}
.mop-kpi-blue{background:#eff6ff;color:#1d4ed8}.mop-kpi-green{background:#f0fdf4;color:#15803d}
.mop-kpi-amber{background:#fffbeb;color:#b45309}.mop-kpi-teal{background:#f0fdfa;color:#0f766e}
.mop-kpi-slate{background:#f8fafc;color:#334155}.mop-kpi-indigo{background:#eef2ff;color:#4338ca}
.mop-kpi-rose{background:#fff1f2;color:#be123c}.mop-kpi-purple{background:#faf5ff;color:#7e22ce}
.mop-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.mop-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px}.mop-card-full{margin-bottom:14px}
.mop-title{font-size:11px;font-weight:700;color:#1c1917;border-left:3px solid #fb923c;padding-left:7px;margin-bottom:10px}
.mop-table{width:100%;border-collapse:collapse;font-size:11px}
.mop-table thead tr{background:#1c1917;color:#fff}
.mop-table th{padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase}
.mop-table td{padding:5px 8px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
.mop-table tbody tr:hover{background:#fff7ed}
.mop-muted{color:#9ca3af}.mop-step-badge{background:#d1fae5;color:#065f46;padding:2px 7px;border-radius:8px;font-size:9.5px;font-weight:600}
.mop-bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}
.mop-bar-fill{background:linear-gradient(90deg,#fb923c,#f97316);height:100%;border-radius:4px}
.mop-info-list{display:flex;flex-direction:column;gap:6px}
.mop-info-row{display:flex;justify-content:space-between;padding:5px 8px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:5px;font-size:11.5px}
.mop-pr-list{display:flex;flex-direction:column;gap:7px}
.mop-pr-row{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:6px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.mop-pr-right{display:flex;align-items:center;gap:8px}
.mop-pr-urgent{background:#fecaca;color:#7f1d1d}.mop-pr-high{background:#fef08a;color:#713f12}
.mop-pr-normal{background:#e0f2fe;color:#0c4a6e}.mop-pr-low{background:#f3f4f6;color:#6b7280}
.mop-footer{padding:10px 24px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#fb923c,#f97316);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 13. WEEKLY SNAPSHOT (PRINT-OPTIMIZED)
  // ══════════════════════════════════════════════════════════
  {
    name: "Weekly Snapshot (Print-Optimized)",
    description: "Single-page print view with all KPIs — interactive drill-down, filters, search & CSV export",
    icon: "📑",
    htmlHeader: `<header class="snap-header">
  <div class="snap-left"><div class="snap-company">${D.companyName}</div><div class="snap-addr">${D.companyAddress} · ${D.companyPhone}</div></div>
  <div class="snap-center"><div class="snap-title">WEEKLY SNAPSHOT</div><div class="snap-period">${D.periodLabel}</div></div>
  <div class="snap-right"><div class="snap-branch">${D.branchName} (${D.branchCode})</div><div class="snap-gen">Generated: ${D.generatedAt}</div></div>
</header>`,
    htmlBody: wrap(`<div class="snap-body">
  <div class="snap-strip">
    <div class="snap-s snap-s-blue   i-clickable" onclick="drillStatus('all')">        <b>${D.totalOrders}</b>        <span>Total <span class="i-arrow-hint">→</span></span></div>
    <div class="snap-s snap-s-green  i-clickable" onclick="drillStatus('completed')">  <b>${D.completedOrders}</b>    <span>Completed <span class="i-arrow-hint">→</span></span></div>
    <div class="snap-s snap-s-amber  i-clickable" onclick="drillStatus('pending')">    <b>${D.pendingOrders}</b>      <span>Pending <span class="i-arrow-hint">→</span></span></div>
    <div class="snap-s snap-s-indigo i-clickable" onclick="drillStatus('in-progress')"><b>${D.inProgressOrders}</b>  <span>In Progress <span class="i-arrow-hint">→</span></span></div>
    <div class="snap-s snap-s-teal   i-clickable" onclick="drillStatus('dispatched')"> <b>${D.dispatchedOrders}</b>   <span>Dispatched <span class="i-arrow-hint">→</span></span></div>
    <div class="snap-s snap-s-purple"><b>${D.totalRevenue}</b>       <span>Revenue</span></div>
    <div class="snap-s snap-s-rose   i-clickable" onclick="drillPriority('urgent')">   <b>${D.urgentOrders}</b>      <span>Urgent <span class="i-arrow-hint">→</span></span></div>
    <div class="snap-s snap-s-slate"><b>${D.onTimeDeliveryRate}</b>  <span>On-Time</span></div>
    <div class="snap-s snap-s-slate"><b>${D.totalCustomers}</b>       <span>Customers</span></div>
    <div class="snap-s snap-s-slate"><b>${D.avgCompletionDays}d</b>  <span>Avg Days</span></div>
  </div>
  <div class="snap-mini-row">
    <div class="snap-mini">
      <div class="snap-mini-title">💰 Revenue</div>
      <div class="snap-mini-row2">
        <span>Total: <b>${D.totalRevenue}</b></span>
        <span>Completed: <b>${D.completedRevenue}</b></span>
        <span>Pending: <b>${D.pendingRevenue}</b></span>
        <span>Avg: <b>${D.avgOrderValue}</b></span>
      </div>
    </div>
    <div class="snap-mini">
      <div class="snap-mini-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click</small></div>
      <div class="snap-prio-row">
        <span class="snap-p snap-p-urgent i-clickable" onclick="drillPriority('urgent')">Urgent ${D.urgentOrders} <span class="i-arrow-hint">→</span></span>
        <span class="snap-p snap-p-high   i-clickable" onclick="drillPriority('high')">  High ${D.highOrders} <span class="i-arrow-hint">→</span></span>
        <span class="snap-p snap-p-normal i-clickable" onclick="drillPriority('normal')">Normal ${D.normalOrders} <span class="i-arrow-hint">→</span></span>
        <span class="snap-p snap-p-low    i-clickable" onclick="drillPriority('low')">   Low ${D.lowOrders} <span class="i-arrow-hint">→</span></span>
      </div>
    </div>
    <div class="snap-mini">
      <div class="snap-mini-title">👥 Customers</div>
      <div class="snap-mini-row2">
        <span>Total: <b>${D.totalCustomers}</b></span>
        <span>New: <b>${D.newCustomers}</b></span>
        <span>Repeat: <b>${D.repeatCustomers}</b></span>
        <span>Top: <b>${D.topCustomer}</b></span>
      </div>
    </div>
    <div class="snap-mini">
      <div class="snap-mini-title">⚗️ Production</div>
      <div class="snap-mini-row2">
        <span>Items: <b>${D.totalItems}</b></span>
        <span>Qty: <b>${D.totalQuantity}</b></span>
        <span>Batches: <b>${D.totalMixBatches}</b></span>
        <span>Temp: <b>${D.avgTemperature}°C</b></span>
      </div>
    </div>
  </div>
  <div class="snap-tables-row">
    <div class="snap-tbl-wrap">
      <div class="snap-tbl-title">📊 Category <small style="font-weight:400;color:#9ca3af;">— click row</small></div>
      <table class="snap-tbl"><thead><tr><th>#</th><th>Category</th><th>Orders</th><th>Share</th><th>Revenue</th></tr></thead>
      <tbody>${CAT_TBODY}</tbody></table>
    </div>
    <div class="snap-tbl-wrap">
      <div class="snap-tbl-title">⚙️ Step Performance</div>
      <table class="snap-tbl"><thead><tr><th>#</th><th>Step</th><th>Done</th><th>Avg Days</th></tr></thead>
      <tbody>
        <tr><td class="snap-muted">1</td><td><b>testme</b></td><td style="text-align:center">3</td><td style="text-align:center">5.0d</td></tr>
      </tbody></table>
    </div>
  </div>
</div>`),
    htmlFooter: `<footer class="snap-footer"><p>${D.companyName} · ${D.branchName} · Weekly Snapshot · ${D.periodLabel} · ${D.generatedAt}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;font-size:10.5px;color:#111827;background:#f1f5f9}
.snap-header{display:flex;justify-content:space-between;align-items:center;padding:12px 22px;background:#0f172a;color:#fff;margin-bottom:14px}
.snap-company{font-size:14px;font-weight:700}.snap-addr{font-size:9.5px;opacity:.55;margin-top:2px}
.snap-center{text-align:center}.snap-title{font-size:16px;font-weight:700;letter-spacing:4px}.snap-period{font-size:10px;opacity:.65;margin-top:2px}
.snap-right{text-align:right}.snap-branch{font-size:11px;font-weight:600}.snap-gen{font-size:9.5px;opacity:.6;margin-top:2px}
.snap-body{padding:0 22px 14px}
.snap-strip{display:grid;grid-template-columns:repeat(10,1fr);gap:6px;margin-bottom:10px}
.snap-s{border-radius:7px;padding:8px 5px;text-align:center;background:#fff;border:1px solid #e5e7eb}
.snap-s b{font-size:13px;font-weight:700;display:block;margin-bottom:2px}.snap-s span{font-size:8px;text-transform:uppercase;opacity:.65;display:block}
.snap-s:hover{opacity:.85}
.snap-s-blue{background:#eff6ff;color:#1d4ed8}.snap-s-green{background:#f0fdf4;color:#15803d}
.snap-s-amber{background:#fffbeb;color:#b45309}.snap-s-indigo{background:#eef2ff;color:#4338ca}
.snap-s-teal{background:#f0fdfa;color:#0f766e}.snap-s-purple{background:#faf5ff;color:#7e22ce}
.snap-s-rose{background:#fff1f2;color:#be123c}.snap-s-slate{background:#f8fafc;color:#334155}
.snap-mini-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}
.snap-mini{background:#fff;border:1px solid #e5e7eb;border-radius:7px;padding:10px}
.snap-mini-title{font-size:10px;font-weight:700;color:#374151;border-left:2px solid #6366f1;padding-left:6px;margin-bottom:8px}
.snap-mini-row2{display:flex;flex-direction:column;gap:4px;font-size:10.5px;color:#4b5563}
.snap-prio-row{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}
.snap-p{padding:3px 8px;border-radius:6px;font-size:10.5px;font-weight:600;cursor:pointer}
.snap-p-urgent{background:#fecaca;color:#7f1d1d}.snap-p-high{background:#fef08a;color:#713f12}
.snap-p-normal{background:#e0f2fe;color:#0c4a6e}.snap-p-low{background:#f3f4f6;color:#6b7280}
.snap-tables-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
.snap-tbl-wrap{background:#fff;border:1px solid #e5e7eb;border-radius:7px;padding:10px}
.snap-tbl-title{font-size:10px;font-weight:700;color:#374151;margin-bottom:7px;border-left:2px solid #6366f1;padding-left:6px}
.snap-tbl{width:100%;border-collapse:collapse;font-size:10px}
.snap-tbl thead tr{background:#0f172a;color:#fff}
.snap-tbl th{padding:5px 7px;text-align:left;font-size:8.5px;text-transform:uppercase}
.snap-tbl td{padding:4px 7px;border-bottom:1px solid #f3f4f6}
.snap-tbl tbody tr:hover{background:#eef2ff}
.snap-muted{color:#9ca3af}.tbl-muted{color:#9ca3af}.pct-badge{background:#e0e7ff;color:#4338ca;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:600}
.snap-footer{padding:8px 22px;border-top:1px solid #e5e7eb;text-align:center;font-size:9px;color:#9ca3af;background:#fff}
@media print{body{font-size:9px}.snap-strip{gap:4px}.snap-mini-row{gap:5px}.i-drill-wrap{display:none!important}}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#6366f1,#4f46e5);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

  // ══════════════════════════════════════════════════════════
  // 14. INTERACTIVE DRILL-DOWN DASHBOARD
  // ══════════════════════════════════════════════════════════
  {
    name: "Interactive Drill-Down Dashboard",
    description: "Click Category/Status/Priority → filtered order list with sidebar filters, search, customer search, sortable columns & CSV export",
    icon: "🔍",
    htmlHeader: `<header class="idd-header">
  <div class="idd-brand"><h1>${D.companyName}</h1><p>${D.companyAddress} · ${D.companyPhone}</p></div>
  <div class="idd-meta"><div class="idd-badge">INTERACTIVE DASHBOARD</div><p><strong>Period:</strong> ${D.periodLabel}</p><p><strong>Branch:</strong> ${D.branchName} (${D.branchCode})</p><p><strong>Generated:</strong> ${D.generatedAt} ${D.generatedTime}</p></div>
</header>`,
    htmlBody: wrap(`<div class="idd-overview-body">
  <div class="idd-section-label">📦 Orders by Status — <em>click any card</em></div>
  <div class="idd-status-strip">
    <div class="idd-ss-card idd-ss-all        i-clickable" onclick="drillStatus('all')">        <div class="idd-ss-val">${D.totalOrders}</div>       <div class="idd-ss-lbl">All Orders</div>    <div class="idd-ss-arrow">→</div></div>
    <div class="idd-ss-card idd-ss-completed  i-clickable" onclick="drillStatus('completed')">  <div class="idd-ss-val">${D.completedOrders}</div>    <div class="idd-ss-lbl">✅ Completed</div>  <div class="idd-ss-arrow">→</div></div>
    <div class="idd-ss-card idd-ss-pending    i-clickable" onclick="drillStatus('pending')">    <div class="idd-ss-val">${D.pendingOrders}</div>      <div class="idd-ss-lbl">⏳ Pending</div>    <div class="idd-ss-arrow">→</div></div>
    <div class="idd-ss-card idd-ss-inprogress i-clickable" onclick="drillStatus('in-progress')"><div class="idd-ss-val">${D.inProgressOrders}</div>  <div class="idd-ss-lbl">🔵 In Progress</div><div class="idd-ss-arrow">→</div></div>
    <div class="idd-ss-card idd-ss-approved   i-clickable" onclick="drillStatus('approved')">   <div class="idd-ss-val">${D.approvedOrders}</div>     <div class="idd-ss-lbl">✔ Approved</div>   <div class="idd-ss-arrow">→</div></div>
    <div class="idd-ss-card idd-ss-dispatched i-clickable" onclick="drillStatus('dispatched')"> <div class="idd-ss-val">${D.dispatchedOrders}</div>   <div class="idd-ss-lbl">🚚 Dispatched</div><div class="idd-ss-arrow">→</div></div>
    <div class="idd-ss-card idd-ss-cancelled  i-clickable" onclick="drillStatus('cancelled')">  <div class="idd-ss-val">${D.cancelledOrders}</div>    <div class="idd-ss-lbl">❌ Cancelled</div>  <div class="idd-ss-arrow">→</div></div>
  </div>
  <div class="idd-section-label" style="margin-top:20px;">💰 Category Revenue — <em>click a category</em></div>
  <div class="idd-cat-grid">
    <div class="idd-cat-card i-clickable" onclick="drillCategory('Product')">
      <div class="idd-cat-top"><div class="idd-cat-name">Product</div><div class="idd-cat-count">11 orders</div></div>
      <div class="idd-cat-revenue">₹0.00</div>
      <div class="idd-cat-bar-wrap"><div class="idd-cat-bar-fill" data-bar="100%"></div></div>
      <div class="idd-cat-footer"><span class="idd-cat-pct">100%</span><span class="idd-cat-cta">View Orders →</span></div>
    </div>
  </div>
  <div class="idd-row-2" style="margin-top:20px;">
    <div class="idd-card">
      <h4 class="idd-card-title">💰 Revenue Summary</h4>
      <div class="idd-rev-list">
        <div class="idd-rev-row"><span>Total Revenue</span>      <strong class="idd-c-purple">${D.totalRevenue}</strong></div>
        <div class="idd-rev-row"><span>Completed Revenue</span>  <strong class="idd-c-green">${D.completedRevenue}</strong></div>
        <div class="idd-rev-row"><span>Pending Revenue</span>    <strong class="idd-c-amber">${D.pendingRevenue}</strong></div>
        <div class="idd-rev-row"><span>Avg Order Value</span>    <strong>${D.avgOrderValue}</strong></div>
        <div class="idd-rev-row"><span>On-Time Rate</span>       <strong class="idd-c-teal">${D.onTimeDeliveryRate}</strong></div>
        <div class="idd-rev-row"><span>Total Customers</span>    <strong>${D.totalCustomers}</strong></div>
      </div>
    </div>
    <div class="idd-card">
      <h4 class="idd-card-title">🔥 Priority <small style="font-weight:400;color:#9ca3af;">— click to filter</small></h4>
      <div class="idd-pr-list">
        <div class="idd-pr-row idd-pr-urgent i-clickable" onclick="drillPriority('urgent')"><span>⚡ Urgent</span><div class="idd-pr-right"><strong>${D.urgentOrders}</strong><span class="idd-pr-cta">→</span></div></div>
        <div class="idd-pr-row idd-pr-high   i-clickable" onclick="drillPriority('high')">  <span>🔴 High</span>  <div class="idd-pr-right"><strong>${D.highOrders}</strong>  <span class="idd-pr-cta">→</span></div></div>
        <div class="idd-pr-row idd-pr-normal i-clickable" onclick="drillPriority('normal')"><span>🔵 Normal</span><div class="idd-pr-right"><strong>${D.normalOrders}</strong><span class="idd-pr-cta">→</span></div></div>
        <div class="idd-pr-row idd-pr-low    i-clickable" onclick="drillPriority('low')">   <span>⚪ Low</span>   <div class="idd-pr-right"><strong>${D.lowOrders}</strong>   <span class="idd-pr-cta">→</span></div></div>
      </div>
    </div>
  </div>
  <div class="idd-card idd-card-full" style="margin-top:16px;">
    <h4 class="idd-card-title">⚙️ Step Performance</h4>
    <table class="idd-tbl">
      <thead><tr><th>#</th><th>Step Name</th><th>Completed</th><th>Avg Days</th><th>Performance</th></tr></thead>
      <tbody>
        <tr><td class="idd-muted">1</td><td><strong>testme</strong></td><td style="text-align:center">3</td><td style="text-align:center">5.0d</td><td><div class="idd-bar-wrap"><div class="idd-bar-fill" data-bar="75%"></div></div></td></tr>
      </tbody>
    </table>
  </div>
</div>`),
    htmlFooter: `<footer class="idd-footer"><p>${D.companyName} · ${D.branchName} · ${D.periodLabel} · Generated: ${D.generatedAt} ${D.generatedTime}</p></footer>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;font-size:11.5px;color:#111827;background:#f1f5f9;min-height:100vh}
.idd-header{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 28px 16px;background:linear-gradient(135deg,#1e1b4b,#3730a3 60%,#4f46e5);color:#fff;margin-bottom:20px;box-shadow:0 4px 20px rgba(30,27,75,.35)}
.idd-brand h1{font-size:18px;font-weight:700;margin-bottom:5px}.idd-brand p{opacity:.6;font-size:10.5px;margin-top:2px}
.idd-meta{text-align:right}.idd-badge{background:#6366f1;color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px;border-radius:3px;display:inline-block;margin-bottom:7px}
.idd-meta p{font-size:10.5px;margin-top:3px;opacity:.85}
.idd-overview-body{padding:0 24px 24px}
.idd-section-label{font-size:11px;font-weight:600;color:#374151;margin-bottom:10px;padding-left:10px;border-left:3px solid #6366f1}
.idd-section-label em{font-style:normal;color:#9ca3af;font-weight:400}
.idd-status-strip{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-bottom:6px}
.idd-ss-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;padding:14px 10px 10px;text-align:center;position:relative}
.idd-ss-card:hover{border-color:#6366f1}
.idd-ss-val{font-size:22px;font-weight:700;margin-bottom:4px}.idd-ss-lbl{font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;opacity:.7}
.idd-ss-arrow{position:absolute;bottom:7px;right:10px;font-size:13px;opacity:0;transition:opacity .15s;color:#6366f1;font-weight:700}
.idd-ss-card:hover .idd-ss-arrow{opacity:1}
.idd-ss-all{background:linear-gradient(135deg,#eef2ff,#e0e7ff);color:#3730a3;border-color:#c7d2fe}
.idd-ss-completed{background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#15803d;border-color:#bbf7d0}
.idd-ss-pending{background:linear-gradient(135deg,#fffbeb,#fef3c7);color:#b45309;border-color:#fde68a}
.idd-ss-inprogress{background:linear-gradient(135deg,#eff6ff,#dbeafe);color:#1d4ed8;border-color:#bfdbfe}
.idd-ss-approved{background:linear-gradient(135deg,#faf5ff,#ede9fe);color:#6d28d9;border-color:#ddd6fe}
.idd-ss-dispatched{background:linear-gradient(135deg,#f0fdfa,#ccfbf1);color:#0f766e;border-color:#99f6e4}
.idd-ss-cancelled{background:linear-gradient(135deg,#fff1f2,#fee2e2);color:#be123c;border-color:#fecdd3}
.idd-cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.idd-cat-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;padding:14px}
.idd-cat-card:hover{border-color:#6366f1}
.idd-cat-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
.idd-cat-name{font-size:13px;font-weight:700;color:#1e1b4b}
.idd-cat-count{font-size:10px;color:#9ca3af;background:#f3f4f6;padding:2px 7px;border-radius:8px}
.idd-cat-revenue{font-size:17px;font-weight:700;color:#4f46e5;margin-bottom:8px}
.idd-cat-bar-wrap{background:#e5e7eb;border-radius:4px;height:6px;overflow:hidden;margin-bottom:7px}
.idd-cat-bar-fill{background:linear-gradient(90deg,#6366f1,#4f46e5);height:100%;border-radius:4px}
.idd-cat-footer{display:flex;justify-content:space-between;align-items:center}
.idd-cat-pct{background:#eef2ff;color:#4338ca;padding:1px 8px;border-radius:8px;font-size:10px;font-weight:600}
.idd-cat-cta{font-size:10.5px;color:#6366f1;font-weight:600;opacity:0;transition:opacity .15s}
.idd-cat-card:hover .idd-cat-cta{opacity:1}
.idd-row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.idd-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px}.idd-card-full{margin-bottom:14px}
.idd-card-title{font-size:11px;font-weight:700;color:#1e1b4b;border-left:3px solid #6366f1;padding-left:8px;margin-bottom:12px;text-transform:uppercase;letter-spacing:.6px}
.idd-rev-list{display:flex;flex-direction:column;gap:7px}
.idd-rev-row{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#f9fafb;border-radius:6px;border:1px solid #f3f4f6;font-size:11.5px}
.idd-c-purple{color:#7c3aed}.idd-c-green{color:#059669}.idd-c-amber{color:#d97706}.idd-c-teal{color:#0f766e}
.idd-pr-list{display:flex;flex-direction:column;gap:8px}
.idd-pr-row{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px solid transparent}
.idd-pr-right{display:flex;align-items:center;gap:6px}
.idd-pr-cta{font-size:14px;color:inherit;opacity:0;transition:opacity .15s}
.idd-pr-row:hover .idd-pr-cta{opacity:1}
.idd-pr-urgent{background:#fef2f2;color:#7f1d1d}.idd-pr-high{background:#fefce8;color:#713f12}
.idd-pr-normal{background:#eff6ff;color:#1e40af}.idd-pr-low{background:#f9fafb;color:#6b7280}
.idd-tbl{width:100%;border-collapse:collapse;font-size:11px}
.idd-tbl thead tr{background:#1e1b4b;color:#fff}
.idd-tbl th{padding:7px 9px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.5px}
.idd-tbl td{padding:6px 9px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
.idd-tbl tbody tr:hover{background:#f5f3ff}
.idd-muted{color:#9ca3af}
.idd-bar-wrap{background:#e5e7eb;border-radius:4px;height:6px;overflow:hidden}
.idd-bar-fill{background:linear-gradient(90deg,#6366f1,#4f46e5);height:100%;border-radius:4px}
.idd-footer{padding:12px 28px;border-top:1px solid #e5e7eb;text-align:center;font-size:9.5px;color:#9ca3af;background:#fff}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#6366f1,#4f46e5);height:100%;border-radius:4px}
${SHARED_INTERACTIVE_CSS}`,
    js: SHARED_INTERACTIVE_JS,
  },

]; // ← DASHBOARD_TEMPLATE_LIBRARY

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export interface DashboardTemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: (typeof DASHBOARD_TEMPLATE_LIBRARY)[number]) => void;
}

const DashboardTemplateLibrary: React.FC<DashboardTemplateLibraryProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <>
      <style>{`
        .dtl-overlay{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,.7)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:999999!important;padding:20px!important;box-sizing:border-box!important;overflow:hidden!important}
        .dtl-modal{background:#fff!important;border-radius:12px!important;width:90%!important;max-width:1000px!important;max-height:88vh!important;overflow-y:auto!important;box-shadow:0 25px 60px rgba(0,0,0,.4)!important;display:flex!important;flex-direction:column!important;position:relative!important}
        .dtl-header{position:sticky!important;top:0!important;background:#fff!important;z-index:1!important;padding:18px 24px!important;border-bottom:1px solid #e5e7eb!important;display:flex!important;justify-content:space-between!important;align-items:center!important}
        .dtl-header h2{font-size:18px;color:#111827;margin:0}.dtl-header p{font-size:11px;color:#9ca3af;margin-top:4px}
        .dtl-close-btn{background:#f3f4f6!important;border:none!important;color:#6b7280!important;width:32px!important;height:32px!important;border-radius:50%!important;cursor:pointer!important;font-size:20px!important;line-height:1!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important}
        .dtl-close-btn:hover{background:#e5e7eb!important}
        .dtl-grid{padding:24px!important;display:grid!important;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))!important;gap:16px!important}
        .dtl-card{background:#f9fafb!important;border:1px solid #e5e7eb!important;border-radius:10px!important;padding:16px!important;display:flex!important;flex-direction:column!important;cursor:pointer!important;transition:all 0.2s!important}
        .dtl-card:hover{border-color:#6366f1!important;box-shadow:0 4px 16px rgba(99,102,241,.15)!important;transform:translateY(-2px)!important}
        .dtl-icon{font-size:32px;margin-bottom:10px}.dtl-name{font-size:14px;font-weight:700;color:#111827;margin:0 0 6px}
        .dtl-desc{font-size:11px;color:#9ca3af;flex:1;margin-bottom:12px;line-height:1.5}
        .dtl-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px}
        .dtl-tag{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:700}
        .dtl-tag-i{background:#f0fdf4;color:#059669;border:1px solid #bbf7d0!important}
        .dtl-use-btn{width:100%!important;padding:9px 0!important;background:linear-gradient(135deg,#6366f1,#4f46e5)!important;color:#fff!important;border:none!important;border-radius:6px!important;font-size:13px!important;font-weight:600!important;cursor:pointer!important;transition:opacity 0.15s!important}
        .dtl-use-btn:hover{opacity:.9!important}
      `}</style>
      <div className="dtl-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <div className="dtl-modal" onClick={(e) => e.stopPropagation()}>
          <div className="dtl-header">
            <div>
              <h2>📊 Dashboard Template Library</h2>
              <p>All 14 templates — real data baked in · fully interactive: click status/category/priority → drill-down · search · filters · sortable columns · CSV export</p>
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
                  <span className="dtl-tag dtl-tag-i">🔍 Interactive</span>
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