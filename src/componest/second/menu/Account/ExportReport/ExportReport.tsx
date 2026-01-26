import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { RootState } from "../../../../redux/rootReducer";
import { BackButton } from "../../../../allCompones/BackButton";
import { useFormDataCache } from "../../Edit/hooks/useFormDataCache";
import { fetchOrders } from "../../../../redux/oders/OdersActions";
import "./ExportReport.css";

// Interfaces
interface Order {
  _id: string;
  orderId?: string;
  orderType?: any;
  orderTypeId?: string;
  orderTypeName?: string;
  orderTypeCode?: string;
  options?: any[];
  optionsWithDetails?: any[];
  status: string;
  overallStatus?: string;
  createdAt?: string | Date;
  createdBy?: string;
  createdByRole?: string;
  customer?: {
    _id?: string;
    companyName?: string;
    name?: string;
  };
  materialWeight?: string | number;
  quantity?: number | string;
  Width?: number;
  Height?: number;
  Thickness?: number;
}

interface ReportFilters {
  orderTypeId: string;
  optionTypeId: string;
  optionId: string;
  specName: string;
  fromDate: string;
  toDate: string;
  createdBy: string;
}

interface ReportSummary {
  totalOrders: number;
  totalQuantity: number;
  byOrderType: Record<string, { count: number; quantity: number }>;
  byOptionType: Record<string, { count: number; quantity: number }>;
  byOption: Record<string, { count: number; quantity: number; specs: Record<string, number> }>;
  byUser: Record<string, { count: number; quantity: number }>;
  bySpec: Record<string, { count: number; values: any[] }>;
}

const ExportReport: React.FC = () => {
  const dispatch = useDispatch();

  // Get form data cache (order types, options, specs, etc.)
  const {
    orderTypes,
    optionTypes,
    options,
    optionSpecs,
    customers,
    loading: formDataLoading,
    isReady
  } = useFormDataCache();

  // Get all orders from Redux - orders are in state.orders.list
  const ordersState = useSelector((state: RootState) => (state.orders as any)?.list || { orders: [], loading: false });
  const orders: Order[] = ordersState?.orders || [];
  const ordersLoading = ordersState?.loading || false;

  // Auth state for company info
  const authState = useSelector((state: RootState) => state.auth);
  const companyName = (authState as any)?.user?.companyName || "Company";

  // Report state
  const [reportName, setReportName] = useState("");
  const [filters, setFilters] = useState<ReportFilters>({
    orderTypeId: "",
    optionTypeId: "",
    optionId: "",
    specName: "",
    fromDate: "",
    toDate: "",
    createdBy: ""
  });

  // Fetch orders when component mounts or date filters change
  useEffect(() => {
    const fetchFilters: any = {
      limit: 1000, // Fetch more orders for reporting
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    if (filters.fromDate) fetchFilters.startDate = filters.fromDate;
    if (filters.toDate) fetchFilters.endDate = filters.toDate;

    dispatch(fetchOrders(fetchFilters) as any);
  }, [dispatch, filters.fromDate, filters.toDate]);

  // Get unique users from orders
  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    orders.forEach(order => {
      if (order.createdBy) {
        users.add(order.createdBy);
      }
      if (order.createdByRole) {
        users.add(order.createdByRole);
      }
    });
    return Array.from(users);
  }, [orders]);

  // Filter options based on selected option type
  const filteredOptions = useMemo(() => {
    if (!filters.optionTypeId) return options;
    return options.filter((opt: any) =>
      opt.optionTypeId === filters.optionTypeId ||
      opt.optionTypeId?._id === filters.optionTypeId
    );
  }, [options, filters.optionTypeId]);

  // Get specs for selected option
  const filteredSpecs = useMemo(() => {
    if (!filters.optionId) return optionSpecs;
    return optionSpecs.filter((spec: any) =>
      spec.optionId === filters.optionId ||
      spec.optionId?._id === filters.optionId
    );
  }, [optionSpecs, filters.optionId]);

  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Date filter
      if (filters.fromDate) {
        const orderDate = new Date(order.createdAt || "");
        const fromDate = new Date(filters.fromDate);
        if (orderDate < fromDate) return false;
      }
      if (filters.toDate) {
        const orderDate = new Date(order.createdAt || "");
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59);
        if (orderDate > toDate) return false;
      }

      // Order type filter
      if (filters.orderTypeId) {
        const orderTypeId = order.orderTypeId || order.orderType?._id || order.orderType;
        if (orderTypeId !== filters.orderTypeId) return false;
      }

      // Option type filter
      if (filters.optionTypeId && order.options) {
        const hasOptionType = order.options.some((opt: any) =>
          opt.optionTypeId === filters.optionTypeId ||
          opt.optionTypeId?._id === filters.optionTypeId
        );
        if (!hasOptionType) return false;
      }

      // Option filter
      if (filters.optionId && order.options) {
        const hasOption = order.options.some((opt: any) =>
          opt.optionId === filters.optionId ||
          opt._id === filters.optionId
        );
        if (!hasOption) return false;
      }

      // Spec filter
      if (filters.specName && order.options) {
        const hasSpec = order.options.some((opt: any) =>
          opt.specificationValues?.some((spec: any) => spec.name === filters.specName)
        );
        if (!hasSpec) return false;
      }

      // Created by filter
      if (filters.createdBy) {
        if (order.createdBy !== filters.createdBy && order.createdByRole !== filters.createdBy) {
          return false;
        }
      }

      return true;
    });
  }, [orders, filters]);

  // Calculate report summary
  const reportSummary = useMemo((): ReportSummary => {
    const summary: ReportSummary = {
      totalOrders: filteredOrders.length,
      totalQuantity: 0,
      byOrderType: {},
      byOptionType: {},
      byOption: {},
      byUser: {},
      bySpec: {}
    };

    filteredOrders.forEach(order => {
      // Calculate quantity
      const qty = typeof order.materialWeight === 'number' ? order.materialWeight :
                  parseFloat(order.materialWeight as string) || 1;
      summary.totalQuantity += qty;

      // By Order Type
      const orderTypeName = order.orderTypeName || order.orderType?.typeName || "Unknown";
      if (!summary.byOrderType[orderTypeName]) {
        summary.byOrderType[orderTypeName] = { count: 0, quantity: 0 };
      }
      summary.byOrderType[orderTypeName].count++;
      summary.byOrderType[orderTypeName].quantity += qty;

      // By User
      const user = order.createdBy || order.createdByRole || "Unknown";
      if (!summary.byUser[user]) {
        summary.byUser[user] = { count: 0, quantity: 0 };
      }
      summary.byUser[user].count++;
      summary.byUser[user].quantity += qty;

      // By Options
      if (order.options && Array.isArray(order.options)) {
        order.options.forEach((opt: any) => {
          // Option Type
          const optTypeName = opt.optionTypeName || opt.optionType?.name || "Unknown";
          if (!summary.byOptionType[optTypeName]) {
            summary.byOptionType[optTypeName] = { count: 0, quantity: 0 };
          }
          summary.byOptionType[optTypeName].count++;
          summary.byOptionType[optTypeName].quantity += qty;

          // Option
          const optName = opt.optionName || opt.name || "Unknown";
          if (!summary.byOption[optName]) {
            summary.byOption[optName] = { count: 0, quantity: 0, specs: {} };
          }
          summary.byOption[optName].count++;
          summary.byOption[optName].quantity += qty;

          // Specs
          if (opt.specificationValues && Array.isArray(opt.specificationValues)) {
            opt.specificationValues.forEach((spec: any) => {
              const specKey = `${spec.name}: ${spec.value}${spec.unit ? ' ' + spec.unit : ''}`;
              if (!summary.bySpec[specKey]) {
                summary.bySpec[specKey] = { count: 0, values: [] };
              }
              summary.bySpec[specKey].count++;
              summary.bySpec[specKey].values.push(spec.value);

              // Also add to option specs
              if (!summary.byOption[optName].specs[spec.name]) {
                summary.byOption[optName].specs[spec.name] = 0;
              }
              summary.byOption[optName].specs[spec.name]++;
            });
          }
        });
      }
    });

    return summary;
  }, [filteredOrders]);

  // Handle filter changes
  const handleFilterChange = (field: keyof ReportFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };

      // Reset dependent filters
      if (field === 'optionTypeId') {
        newFilters.optionId = "";
        newFilters.specName = "";
      }
      if (field === 'optionId') {
        newFilters.specName = "";
      }

      return newFilters;
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      orderTypeId: "",
      optionTypeId: "",
      optionId: "",
      specName: "",
      fromDate: "",
      toDate: "",
      createdBy: ""
    });
    setReportName("");
  };

  // Export to Excel
  const handleExportExcel = () => {
    // Prepare main orders data
    const ordersData = filteredOrders.map((order, index) => {
      const baseData: any = {
        "No": index + 1,
        "Date": order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A",
        "Order ID": order.orderId || "N/A",
        "Order Type": order.orderTypeName || order.orderType?.typeName || "N/A",
        "Customer": order.customer?.companyName || order.customer?.name || "N/A",
        "Status": order.overallStatus || order.status || "N/A",
        "Created By": order.createdBy || order.createdByRole || "N/A",
        "Quantity/Weight": order.materialWeight || order.quantity || "N/A",
        "Width": order.Width || "N/A",
        "Height": order.Height || "N/A",
        "Thickness": order.Thickness || "N/A"
      };

      // Add options data
      if (order.options && order.options.length > 0) {
        order.options.forEach((opt: any, optIndex: number) => {
          baseData[`Option ${optIndex + 1} Type`] = opt.optionTypeName || "N/A";
          baseData[`Option ${optIndex + 1} Name`] = opt.optionName || opt.name || "N/A";

          // Add specs
          if (opt.specificationValues) {
            opt.specificationValues.forEach((spec: any) => {
              baseData[`${opt.optionTypeName || 'Option'} - ${spec.name}`] =
                `${spec.value}${spec.unit ? ' ' + spec.unit : ''}`;
            });
          }
        });
      }

      return baseData;
    });

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();

    // Sheet 1: Orders Data
    const wsOrders = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, wsOrders, "Orders");

    // Sheet 2: Summary by Order Type
    const orderTypeSummary = Object.entries(reportSummary.byOrderType).map(([type, data]) => ({
      "Order Type": type,
      "Total Orders": data.count,
      "Total Quantity": data.quantity.toFixed(2)
    }));
    if (orderTypeSummary.length > 0) {
      const wsOrderType = XLSX.utils.json_to_sheet(orderTypeSummary);
      XLSX.utils.book_append_sheet(wb, wsOrderType, "By Order Type");
    }

    // Sheet 3: Summary by Option Type
    const optionTypeSummary = Object.entries(reportSummary.byOptionType).map(([type, data]) => ({
      "Option Type": type,
      "Total Orders": data.count,
      "Total Quantity": data.quantity.toFixed(2)
    }));
    if (optionTypeSummary.length > 0) {
      const wsOptionType = XLSX.utils.json_to_sheet(optionTypeSummary);
      XLSX.utils.book_append_sheet(wb, wsOptionType, "By Option Type");
    }

    // Sheet 4: Summary by Option
    const optionSummary = Object.entries(reportSummary.byOption).map(([name, data]) => ({
      "Option Name": name,
      "Total Orders": data.count,
      "Total Quantity": data.quantity.toFixed(2),
      "Specs Count": Object.keys(data.specs).length
    }));
    if (optionSummary.length > 0) {
      const wsOption = XLSX.utils.json_to_sheet(optionSummary);
      XLSX.utils.book_append_sheet(wb, wsOption, "By Option");
    }

    // Sheet 5: Summary by User
    const userSummary = Object.entries(reportSummary.byUser).map(([user, data]) => ({
      "User": user,
      "Total Orders": data.count,
      "Total Quantity": data.quantity.toFixed(2)
    }));
    if (userSummary.length > 0) {
      const wsUser = XLSX.utils.json_to_sheet(userSummary);
      XLSX.utils.book_append_sheet(wb, wsUser, "By User");
    }

    // Sheet 6: Summary by Spec
    const specSummary = Object.entries(reportSummary.bySpec).map(([spec, data]) => ({
      "Specification": spec,
      "Count": data.count
    }));
    if (specSummary.length > 0) {
      const wsSpec = XLSX.utils.json_to_sheet(specSummary);
      XLSX.utils.book_append_sheet(wb, wsSpec, "By Spec");
    }

    // Generate filename
    const fileName = reportName || `Report_${companyName}`;
    const dateStr = new Date().toISOString().split('T')[0];
    const fullFileName = `${fileName}_${dateStr}.xlsx`;

    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fullFileName);
  };

  // Print report
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${reportName || 'Export Report'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #1f2937; }
            .header p { color: #6b7280; margin: 5px 0; }
            .summary-section { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
            .summary-section h3 { margin: 0 0 15px 0; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .summary-card { background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .summary-card .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .summary-card .value { font-size: 24px; font-weight: bold; color: #FF6B35; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 12px; }
            th { background: #f1f5f9; font-weight: 600; }
            .totals-table { margin-top: 30px; }
            .totals-table th { background: #FF6B35; color: white; }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${companyName}</h1>
            <p>${reportName || 'Orders Report'}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
            ${filters.fromDate || filters.toDate ? `<p>Period: ${filters.fromDate || 'Start'} to ${filters.toDate || 'End'}</p>` : ''}
          </div>

          <div class="summary-section">
            <h3>Report Summary</h3>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="label">Total Orders</div>
                <div class="value">${reportSummary.totalOrders}</div>
              </div>
              <div class="summary-card">
                <div class="label">Total Quantity</div>
                <div class="value">${reportSummary.totalQuantity.toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <div class="label">Order Types</div>
                <div class="value">${Object.keys(reportSummary.byOrderType).length}</div>
              </div>
            </div>
          </div>

          ${Object.keys(reportSummary.byOrderType).length > 0 ? `
          <div class="summary-section">
            <h3>By Order Type</h3>
            <table>
              <thead>
                <tr><th>Order Type</th><th>Count</th><th>Quantity</th></tr>
              </thead>
              <tbody>
                ${Object.entries(reportSummary.byOrderType).map(([type, data]) => `
                  <tr><td>${type}</td><td>${data.count}</td><td>${data.quantity.toFixed(2)}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${Object.keys(reportSummary.byOptionType).length > 0 ? `
          <div class="summary-section">
            <h3>By Option Type</h3>
            <table>
              <thead>
                <tr><th>Option Type</th><th>Count</th><th>Quantity</th></tr>
              </thead>
              <tbody>
                ${Object.entries(reportSummary.byOptionType).map(([type, data]) => `
                  <tr><td>${type}</td><td>${data.count}</td><td>${data.quantity.toFixed(2)}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${Object.keys(reportSummary.byOption).length > 0 ? `
          <div class="summary-section">
            <h3>By Option (with Specs)</h3>
            <table>
              <thead>
                <tr><th>Option Name</th><th>Count</th><th>Quantity</th><th>Specs</th></tr>
              </thead>
              <tbody>
                ${Object.entries(reportSummary.byOption).map(([name, data]) => `
                  <tr>
                    <td>${name}</td>
                    <td>${data.count}</td>
                    <td>${data.quantity.toFixed(2)}</td>
                    <td>${Object.entries(data.specs).map(([s, c]) => `${s}: ${c}`).join(', ') || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${Object.keys(reportSummary.byUser).length > 0 ? `
          <div class="summary-section">
            <h3>By User</h3>
            <table class="totals-table">
              <thead>
                <tr><th>User</th><th>Orders Created</th><th>Total Quantity</th></tr>
              </thead>
              <tbody>
                ${Object.entries(reportSummary.byUser).map(([user, data]) => `
                  <tr><td>${user}</td><td>${data.count}</td><td>${data.quantity.toFixed(2)}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${Object.keys(reportSummary.bySpec).length > 0 ? `
          <div class="summary-section">
            <h3>By Specification</h3>
            <table>
              <thead>
                <tr><th>Specification</th><th>Count</th></tr>
              </thead>
              <tbody>
                ${Object.entries(reportSummary.bySpec).map(([spec, data]) => `
                  <tr><td>${spec}</td><td>${data.count}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
        </body>
      </html>
    `;

    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);

    const contentWindow = printFrame.contentWindow;
    if (!contentWindow) return;

    const printDocument = contentWindow.document;
    printDocument.open();
    printDocument.write(printContent);
    printDocument.close();

    printFrame.onload = () => {
      if (printFrame.contentWindow) {
        printFrame.contentWindow.print();
      }
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    };
  };

  return (
    <div className="export-report-page">
      {/* Header */}
      <div className="export-report-header">
        <div className="export-report-header__left">
          <BackButton />
          <h1 className="export-report-title">Export Report</h1>
        </div>
        <div className="export-report-header__actions">
          <button
            className="export-report-btn export-report-btn--print"
            onClick={handlePrint}
            disabled={filteredOrders.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
          <button
            className="export-report-btn export-report-btn--export"
            onClick={handleExportExcel}
            disabled={filteredOrders.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Name Input */}
      <div className="export-report-name-section">
        <label className="export-report-label">Report Name</label>
        <input
          type="text"
          className="export-report-name-input"
          placeholder="Enter report name (optional)"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
        />
      </div>

      {/* Filters Section */}
      <div className="export-report-filters">
        <div className="export-report-filters-header">
          <h3>Filter Options</h3>
          <button className="export-report-clear-btn" onClick={handleClearFilters}>
            Clear All
          </button>
        </div>

        <div className="export-report-filters-grid">
          {/* Date Range */}
          <div className="export-report-filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            />
          </div>
          <div className="export-report-filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
            />
          </div>

          {/* Order Type */}
          <div className="export-report-filter-group">
            <label>Order Type</label>
            <select
              value={filters.orderTypeId}
              onChange={(e) => handleFilterChange('orderTypeId', e.target.value)}
            >
              <option value="">All Order Types</option>
              {orderTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.typeName} {type.typeCode ? `(${type.typeCode})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Option Type */}
          <div className="export-report-filter-group">
            <label>Option Type</label>
            <select
              value={filters.optionTypeId}
              onChange={(e) => handleFilterChange('optionTypeId', e.target.value)}
            >
              <option value="">All Option Types</option>
              {optionTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.name || type.typeName}
                </option>
              ))}
            </select>
          </div>

          {/* Option */}
          <div className="export-report-filter-group">
            <label>Option</label>
            <select
              value={filters.optionId}
              onChange={(e) => handleFilterChange('optionId', e.target.value)}
              disabled={!filters.optionTypeId && filteredOptions.length === 0}
            >
              <option value="">All Options</option>
              {filteredOptions.map((opt: any) => (
                <option key={opt._id} value={opt._id}>
                  {opt.name || opt.optionName}
                </option>
              ))}
            </select>
          </div>

          {/* Spec */}
          <div className="export-report-filter-group">
            <label>Specification</label>
            <select
              value={filters.specName}
              onChange={(e) => handleFilterChange('specName', e.target.value)}
            >
              <option value="">All Specs</option>
              {filteredSpecs.map((spec: any) => (
                <option key={spec._id || spec.name} value={spec.name || spec.specName}>
                  {spec.name || spec.specName}
                </option>
              ))}
            </select>
          </div>

          {/* Created By */}
          <div className="export-report-filter-group">
            <label>Created By</label>
            <select
              value={filters.createdBy}
              onChange={(e) => handleFilterChange('createdBy', e.target.value)}
            >
              <option value="">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="export-report-summary">
        <div className="export-report-summary-card export-report-summary-card--total">
          <div className="export-report-summary-value">{reportSummary.totalOrders}</div>
          <div className="export-report-summary-label">Total Orders</div>
        </div>
        <div className="export-report-summary-card export-report-summary-card--quantity">
          <div className="export-report-summary-value">{reportSummary.totalQuantity.toFixed(2)}</div>
          <div className="export-report-summary-label">Total Quantity</div>
        </div>
        <div className="export-report-summary-card export-report-summary-card--types">
          <div className="export-report-summary-value">{Object.keys(reportSummary.byOrderType).length}</div>
          <div className="export-report-summary-label">Order Types</div>
        </div>
        <div className="export-report-summary-card export-report-summary-card--options">
          <div className="export-report-summary-value">{Object.keys(reportSummary.byOption).length}</div>
          <div className="export-report-summary-label">Options</div>
        </div>
        <div className="export-report-summary-card export-report-summary-card--users">
          <div className="export-report-summary-value">{Object.keys(reportSummary.byUser).length}</div>
          <div className="export-report-summary-label">Users</div>
        </div>
      </div>

      {/* Loading State */}
      {(ordersLoading || formDataLoading) && (
        <div className="export-report-loading">Loading data...</div>
      )}

      {/* Report Tables */}
      {!ordersLoading && !formDataLoading && (
        <div className="export-report-tables">
          {/* By Order Type */}
          {Object.keys(reportSummary.byOrderType).length > 0 && (
            <div className="export-report-table-section">
              <h3>Summary by Order Type</h3>
              <table className="export-report-table">
                <thead>
                  <tr>
                    <th>Order Type</th>
                    <th>Orders</th>
                    <th>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportSummary.byOrderType).map(([type, data]) => (
                    <tr key={type}>
                      <td>{type}</td>
                      <td>{data.count}</td>
                      <td>{data.quantity.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* By Option Type */}
          {Object.keys(reportSummary.byOptionType).length > 0 && (
            <div className="export-report-table-section">
              <h3>Summary by Option Type</h3>
              <table className="export-report-table">
                <thead>
                  <tr>
                    <th>Option Type</th>
                    <th>Count</th>
                    <th>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportSummary.byOptionType).map(([type, data]) => (
                    <tr key={type}>
                      <td>{type}</td>
                      <td>{data.count}</td>
                      <td>{data.quantity.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* By Option with Specs */}
          {Object.keys(reportSummary.byOption).length > 0 && (
            <div className="export-report-table-section">
              <h3>Summary by Option (with Specs)</h3>
              <table className="export-report-table">
                <thead>
                  <tr>
                    <th>Option Name</th>
                    <th>Count</th>
                    <th>Total Quantity</th>
                    <th>Specifications</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportSummary.byOption).map(([name, data]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{data.count}</td>
                      <td>{data.quantity.toFixed(2)}</td>
                      <td>
                        {Object.entries(data.specs).length > 0 ? (
                          <div className="export-report-specs-list">
                            {Object.entries(data.specs).map(([specName, specCount]) => (
                              <span key={specName} className="export-report-spec-badge">
                                {specName}: {specCount}
                              </span>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* By User */}
          {Object.keys(reportSummary.byUser).length > 0 && (
            <div className="export-report-table-section">
              <h3>Summary by User</h3>
              <table className="export-report-table export-report-table--users">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Orders Created</th>
                    <th>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportSummary.byUser).map(([user, data]) => (
                    <tr key={user}>
                      <td>{user}</td>
                      <td>{data.count}</td>
                      <td>{data.quantity.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* By Spec */}
          {Object.keys(reportSummary.bySpec).length > 0 && (
            <div className="export-report-table-section">
              <h3>Summary by Specification</h3>
              <table className="export-report-table">
                <thead>
                  <tr>
                    <th>Specification</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportSummary.bySpec).map(([spec, data]) => (
                    <tr key={spec}>
                      <td>{spec}</td>
                      <td>{data.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="export-report-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p>No orders found with selected filters.</p>
              <p className="export-report-empty-hint">Try adjusting your filter criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportReport;
