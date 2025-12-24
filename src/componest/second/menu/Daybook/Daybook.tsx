
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../../../allCompones/BackButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../Dispatch/Dispatch.css";
import "../Oders/indexAllOders.css";  // ✅ ADDED: Import All Orders styling
import { fetchOrders } from "../../../redux/oders/OdersActions";
import { RootState } from "../../../../store";
import { useFormDataCache } from "../Edit/hooks/useFormDataCache";  // ✅ ADDED
import { useDaybookUpdates } from "../../../../hooks/useWebSocket";  // ✅ WebSocket real-time updates
import { Download, Printer, RefreshCw } from "lucide-react";  // ✅ ADDED: Icons


interface Order {
  _id: string;
  orderId: string;
  customerId: string;
  materialId: string;
  materialWeight?: number;
  Width?: number;        
  Height?: number;       
  Thickness?: number;  
  SealingType?: string;
  BottomGusset?: string;
  Flap?: string;
  AirHole?: string;
  Printing?: boolean;
  mixMaterial?: any[];
  steps?: {
    stepId: string;
    machines: {
      machineId: string;
      operatorId: string | null;
      status: string;
      startedAt: string | null;
      completedAt: string | null;
      note: string | null;
      reason: string | null;
      _id: string;
    }[];
    _id: string;
  }[];
  currentStepIndex?: number;
  overallStatus: string;
  branchId: string;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    _id: string;
    companyName: string;
    firstName: string;
    lastName: string;
    phone1: string;
    phone2: string;
    whatsapp: string;
    telephone: string;
    address1: string;
    address2: string;
    state: string;
    pinCode: string;
    email: string;
  };
  branch?: {
    _id: string;
    name: string;
    code: string;
  };
  material?: {
    _id: string;
    materialName: string;
    materialType: string;
    materialTypeName: string;
  };
  totalSteps?: number;
  completedSteps?: number;
  progressPercentage?: number;
  Notes?: string;
  
  // Computed properties for component compatibility
  id?: string;
  companyName?: string;
  name?: string;
  phone1?: string;
  date?: string;
  status?: string;
  AllStatus?: {
    [key: string]: {
      color: string;
      description: string;
    };
  };
}

interface OrderFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  orderTypeId?: string;  // ✅ ADDED: Order type filter
}

const defaultOrdersState = {
  orders: [],
  loading: false,
  error: null,
  pagination: null,
  summary: null,
  statusCounts: null
};

export default function DayBook() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State declarations
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set()); // Multi-select for printing
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");  // ✅ ADDED: Order type filter
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);

  // Redux selectors
  const ordersState = useSelector((state: RootState) => {
    return state.orders.list || defaultOrdersState;
  });

  const authState = useSelector((state: RootState) => state.auth);

  const {
    orders: reduxOrders = [],
    loading = false,
    error = null,
    pagination = null,
    summary = null,
    statusCounts = null
  } = ordersState;

  // ✅ ADDED: Get order types from cache
  const { orderTypes = [] } = useFormDataCache();

  // Company info
  const companyName = authState?.user?.companyName || "ABC Company";
  const branchName = authState?.user?.branchName || "Main Branch";
  const branchId = authState?.user?.branchId || localStorage.getItem('branchId') || localStorage.getItem('selectedBranch') || null;  // ✅ For WebSocket subscription

  // Status color mapping - matches backend overallStatus enum values
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'in_progress': '#FF6B35',    // Backend uses underscore
      'in-progress': '#FF6B35',    // Keep for compatibility
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'on-hold': '#6b7280',
      'Wait for Approval': '#f59e0b',
      'approved': '#3b82f6',       // Blue for approved
      'dispatched': '#8b5cf6',     // Purple for dispatched
      'issue': '#ef4444',          // Red for issue
      'unknown': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  function getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'pending': 'Order received and awaiting processing',
      'in_progress': 'Order is being processed',   // Backend uses underscore
      'in-progress': 'Order is being processed',   // Keep for compatibility
      'completed': 'Order has been completed',
      'cancelled': 'Order has been cancelled',
      'on-hold': 'Order is temporarily on hold',
      'Wait for Approval': 'Order is waiting for approval',
      'approved': 'Order has been approved',
      'dispatched': 'Order has been dispatched',
      'issue': 'Order has an issue',
      'unknown': 'Status unknown'
    };
    return descriptions[status] || 'Status unknown';
  }

  // Transform orders for display
  const transformedOrders: Order[] = Array.isArray(reduxOrders) ? reduxOrders.map(order => {
    // Handle deleted customers - show indicator
    const isDeletedCustomer = (order.customer as any)?.isDeleted === true;
    const customerName = isDeletedCustomer
      ? '(Deleted Customer)'
      : (order.customer?.companyName || order.customer?.firstName || 'Unknown Customer');
    const customerPhone = order.customer?.phone1 || '';
    const orderStatus = order.overallStatus || 'unknown';

    // Get order type - could be populated object or ID
    const orderType = order.orderType || order.orderTypeId;
    const orderTypeName = orderType?.typeName || orderType?.name || '';
    const orderTypeCode = orderType?.typeCode || orderType?.code || '';
    const priority = order.priority || 'normal';

    return {
      ...order,
      id: order._id,
      companyName: customerName,
      name: customerName,
      phone: customerPhone,
      status: orderStatus,
      priority: priority,
      orderType: orderType,
      orderTypeName: orderTypeName,
      orderTypeCode: orderTypeCode,
      date: new Date(order.createdAt).toISOString().split('T')[0],
      AllStatus: {
        [orderStatus]: {
          color: getStatusColor(orderStatus),
          description: getStatusDescription(orderStatus)
        }
      }
    };
  }) : [];

  // Filter orders
  const filteredOrders = transformedOrders.filter(order => {
    if (!order.date) return false;
    
    const orderDate = new Date(order.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    
    if (from && orderDate < from) return false;
    if (to && orderDate > to) return false;
    
    if (statusFilter && order.status !== statusFilter) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesOrderId = order.orderId?.toLowerCase().includes(searchLower);
      const matchesCustomer = order.companyName?.toLowerCase().includes(searchLower);
      const matchesPhone = order.customer?.phone1?.toLowerCase().includes(searchLower);
      const matchesNotes = order.Notes?.toLowerCase().includes(searchLower);
      
      if (!matchesOrderId && !matchesCustomer && !matchesPhone && !matchesNotes) {
        return false;
      }
    }
    
    return true;
  });

  // Create filters helper
  const createFilters = (): OrderFilters => {
    const filters: OrderFilters = {
      page: currentPage,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    if (fromDate) filters.startDate = fromDate;
    if (toDate) filters.endDate = toDate;
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter) filters.status = statusFilter;
    if (orderTypeFilter) filters.orderTypeId = orderTypeFilter;  // ✅ ADDED

    return filters;
  };

  // Fetch orders helper
  const fetchOrdersData = () => {
    const filters = createFilters();
    console.log("📋 Filters being sent:", filters);

    if (typeof fetchOrders === 'function') {
      dispatch(fetchOrders(filters) as any);
    } else {
      console.error("❌ fetchOrders function is not available");
    }
  };

  // FIXED: Enhanced handleOrderClick with complete order data structure
  const handleOrderClick = (order: Order) => {
    console.log('🔄 Navigating to CreateOrders with order data:', order);
    
    // Create comprehensive order data structure for edit mode
    const orderDataForEdit = {
      // Core order info
      _id: order._id,
      orderId: order.orderId,
      overallStatus: order.overallStatus,
      status: order.overallStatus, // Alias for compatibility
      
      // Timestamps
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      date: order.date,
      
      // Customer information - properly structured
      customer: {
        _id: order.customer?._id || order.customerId || '',
        name: order.customer?.firstName && order.customer?.lastName 
          ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
          : order.customer?.companyName || order.companyName || '',
        companyName: order.customer?.companyName || order.companyName || '',
        firstName: order.customer?.firstName || '',
        lastName: order.customer?.lastName || '',
        phone: order.customer?.phone1 || order.customer?.telephone || '',
        phone1: order.customer?.phone1 || '',
        phone2: order.customer?.phone2 || '',
        telephone: order.customer?.telephone || '',
        whatsapp: order.customer?.whatsapp || '',
        email: order.customer?.email || '',
        address: order.customer?.address1 || '',
        address1: order.customer?.address1 || '',
        address2: order.customer?.address2 || '',
        state: order.customer?.state || '',
        pinCode: order.customer?.pinCode || '',
        imageUrl: order.customer?.imageUrl || ''
      },
      
      // Legacy customer fields for backward compatibility
      customerId: order.customer?._id || order.customerId || '',
      companyName: order.customer?.companyName || order.companyName || '',
      customerPhone: order.customer?.phone1 || '',

      // ✅ Order Type information - KEPT (still needed for order type dropdown)
      orderType: (order as any).orderType || null,
      orderTypeId: (order as any).orderType?._id || (order as any).orderTypeId || '',

      // ❌ REMOVED: Old material, product, mixing fields (replaced by unified options system)
      // These fields are deprecated and replaced by the options array above
      
      // Steps and workflow
      steps: order.steps || [],
      currentStepIndex: order.currentStepIndex || 0,
      stepsCount: order.totalSteps || 0,
      totalMachines: order.steps?.reduce((total, step) => total + (step.machines?.length || 0), 0) || 0,
      completedSteps: order.completedSteps || 0,
      progressPercentage: order.progressPercentage || 0,
      totalSteps: order.totalSteps || 0,
      
      // Branch information
      branch: order.branch ? {
        _id: order.branch._id,
        name: order.branch.name,
        code: order.branch.code
      } : null,
      branchId: order.branchId || order.branch?._id || '',
      
      // Creator information
      createdBy: order.createdBy || '',
      createdByRole: order.createdByRole || '',
      creator: order.creator || null,
      
      // Notes and additional info
      Notes: order.Notes || '',
      notes: order.Notes || '',

      // ✅ ADDED: Options data (NEW UNIFIED OPTIONS SYSTEM)
      options: (order as any).options || [],
      optionsWithDetails: (order as any).optionsWithDetails || [],

      // Status tracking
      AllStatus: order.AllStatus || {
        [order.overallStatus]: {
          color: getStatusColor(order.overallStatus),
          description: getStatusDescription(order.overallStatus)
        }
      }
    };

    console.log('📋 Complete order data for edit mode:', orderDataForEdit);

    // Navigate to CreateOrders with comprehensive state
    navigate("/menu/orderform", {
      state: {
        isEdit: true,
        orderData: orderDataForEdit,
        
        // Additional legacy support
        isEditMode: true,
        editMode: true,
        mode: 'edit',
        
        // Quick access fields
        orderId: order.orderId,
        customerName: orderDataForEdit.companyName,
        materialType: orderDataForEdit.materialType,
        materialName: orderDataForEdit.materialName
      }
    });
  };

  // Effect hooks - Fetch orders on mount and filter changes
  useEffect(() => {
    console.log("🔄 useEffect triggered - fetching orders");
    fetchOrdersData();

    // ✅ Check if orders were updated while navigating - force refresh
    const ordersUpdated = sessionStorage.getItem('orders_updated');
    if (ordersUpdated) {
      console.log("📡 Orders were updated - forcing refresh");
      sessionStorage.removeItem('orders_updated');
      // Small delay to ensure the fetchOrdersData above completes first
      setTimeout(() => fetchOrdersData(), 100);
    }
  }, [dispatch, currentPage, limit, fromDate, toDate, searchTerm, statusFilter, orderTypeFilter]);

  // ✅ WebSocket real-time subscription for instant order updates
  // This receives updates immediately when orders change - no polling needed
  const handleOrderUpdate = useCallback(() => {
    console.log("📡 WebSocket: Order update received - refreshing");
    fetchOrdersData();
  }, [currentPage, limit, fromDate, toDate, searchTerm, statusFilter, orderTypeFilter]);

  // Subscribe to real-time daybook updates via WebSocket
  useDaybookUpdates(branchId, handleOrderUpdate);

  // Focus content container when orders are loaded for keyboard navigation
  useEffect(() => {
    if (contentRef.current && filteredOrders.length > 0) {
      contentRef.current.focus();
    }
  }, [filteredOrders.length]);

  useEffect(() => {
    const selectedOrder = ordersRef.current[selectedOrderIndex];
    if (selectedOrder) {
      selectedOrder.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedOrderIndex]);

  useEffect(() => {
    if (selectedOrderIndex >= filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIndex(0);
    }
  }, [filteredOrders.length, selectedOrderIndex]);

  // Event handlers
  const handleDateFilter = () => {
    setCurrentPage(1);
    setShowPeriodModal(false);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    fetchOrdersData();
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setStatusFilter('');
    setOrderTypeFilter('');  // ✅ ADDED
    setCurrentPage(1);
  };

  const handleKeyNavigation = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (filteredOrders.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
      case "Tab":
        if (!e.shiftKey) {
          e.preventDefault();
          setSelectedOrderIndex(prev => (prev + 1) % filteredOrders.length);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedOrderIndex(prev => (prev - 1 + filteredOrders.length) % filteredOrders.length);
        break;
      case "Enter":
        handleOrderClick(filteredOrders[selectedOrderIndex]);
        break;
      case " ": // Space key - toggle selection
        e.preventDefault();
        const currentOrder = filteredOrders[selectedOrderIndex];
        if (currentOrder?._id) {
          setSelectedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(currentOrder._id)) {
              newSet.delete(currentOrder._id);
            } else {
              newSet.add(currentOrder._id);
            }
            return newSet;
          });
        }
        break;
      case "Escape":
        // Clear all selections
        setSelectedOrders(new Set());
        break;
    }

    // Handle Shift+Tab separately
    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      setSelectedOrderIndex(prev => (prev - 1 + filteredOrders.length) % filteredOrders.length);
    }
  };

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Select all orders
  const selectAllOrders = () => {
    const allIds = filteredOrders.map(o => o._id);
    setSelectedOrders(new Set(allIds));
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedOrders(new Set());
  };

  // Print labels for selected orders (using iframe - no new window)
  const handlePrintSelectedLabels = () => {
    if (selectedOrders.size === 0) {
      alert('Please select orders to print labels');
      return;
    }

    const ordersToprint = filteredOrders.filter(o => selectedOrders.has(o._id));

    const labelContent = ordersToprint.map(order => `
      <div class="label" style="page-break-after: always; padding: 20px; border: 2px solid #000; margin: 10px; min-height: 200px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px;">
          ${companyName}
        </div>
        <div style="font-size: 14px; margin-bottom: 5px;">
          <strong>Order ID:</strong> ${order.orderId || 'N/A'}
        </div>
        <div style="font-size: 16px; font-weight: bold; margin: 10px 0;">
          ${order.customer?.companyName || order.companyName || 'N/A'}
        </div>
        <div style="font-size: 14px; margin-bottom: 5px;">
          ${order.customer?.firstName || ''} ${order.customer?.lastName || ''}
        </div>
        <div style="font-size: 14px; margin-bottom: 5px;">
          ${order.customer?.address1 || ''} ${order.customer?.address2 || ''}
        </div>
        <div style="font-size: 14px; margin-bottom: 5px;">
          ${order.customer?.state || ''} - ${order.customer?.pinCode || ''}
        </div>
        <div style="font-size: 14px; margin-bottom: 5px;">
          <strong>Phone:</strong> ${order.customer?.phone1 || order.customer?.telephone || 'N/A'}
        </div>
        <div style="font-size: 12px; margin-top: 10px; color: #666;">
          Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    `).join('');

    const printContent = `
      <html>
        <head>
          <title>Print Labels - ${selectedOrders.size} Orders</title>
          <style>
            @media print {
              .label { page-break-after: always; }
              .label:last-child { page-break-after: auto; }
            }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${labelContent}
        </body>
      </html>
    `;

    // Use iframe instead of new window
    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);

    const contentWindow = printFrame.contentWindow;
    if (!contentWindow) {
      console.error("Failed to access print frame content window.");
      document.body.removeChild(printFrame);
      return;
    }

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

  // Print and export handlers (keeping original functionality)
  const handlePrint = () => {
    const currentDate = new Date().toLocaleDateString();
    const periodText =
      fromDate && toDate
        ? `Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`
        : fromDate
        ? `From: ${new Date(fromDate).toLocaleDateString()}`
        : toDate
        ? `To: ${new Date(toDate).toLocaleDateString()}`
        : "All Records";

    const tableRows = filteredOrders
      .map(
        order => `
        <tr>
          <td>${order.date || 'N/A'}</td>
          <td>${order.orderId || 'N/A'}</td>
          <td>${order.companyName || 'N/A'}</td>
          <td>${order.customer?.phone1 || 'N/A'}</td>
          <td>${order.status || 'N/A'}</td>
          <td>${order.materialWeight || 'N/A'}</td>
          <td>${order.branch?.name || 'N/A'}</td>
        </tr>`
      )
      .join("");

    const printContent = `
      <html>
        <head>
          <title>Day Book - Orders</title>
          <style>
            body { font-family: Arial; margin: 40px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .header .meta { font-size: 14px; color: #555; margin: 5px 0; }
            .summary { margin: 20px 0; padding: 10px; background: #f5f5f5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #eee; font-weight: bold; }
            .total { margin-top: 10px; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${companyName}</h1>
            <div class="meta">${branchName}</div>
            <div class="meta">${periodText}</div>
            <div class="meta">Printed: ${currentDate}</div>
          </div>
          
          <div class="summary">
            <strong>Summary:</strong><br>
            Total Orders: ${summary?.totalOrders || filteredOrders.length}<br>
            Total Weight: ${summary?.totalWeight || 'N/A'}<br>
            Average Weight: ${summary?.avgWeight ? summary.avgWeight.toFixed(2) : 'N/A'}
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Weight</th>
                <th>Branch</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="total">Total Records: ${filteredOrders.length}</div>
        </body>
      </html>
    `;

    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);

    const contentWindow = printFrame.contentWindow;
    if (!contentWindow) {
      console.error("Failed to access print frame content window.");
      return;
    }

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

  const handleExportExcel = () => {
    const exportData = filteredOrders.map(order => ({
      Date: order.date || 'N/A',
      OrderID: order.orderId || 'N/A',
      CustomerName: order.companyName || 'N/A',
      Phone: order.customer?.phone1|| 'N/A',
      Status: order.status || 'N/A',
      Weight: order.materialWeight || 'N/A',
      Width: order.Width || 'N/A',
      Height: order.Height || 'N/A',
      Thickness: order.Thickness || 'N/A',
      Branch: order.branch?.name || 'N/A',
      BranchCode: order.branch?.code || 'N/A',
      Material: order.material?.materialName || 'N/A',
      SealingType: order.SealingType || 'N/A',
      BottomGusset: order.BottomGusset || 'N/A',
      Flap: order.Flap || 'N/A',
      AirHole: order.AirHole || 'N/A',
      Printing: order.Printing ? 'Yes' : 'No',
      StepsCount: order.totalSteps || 0,
      CompletedSteps: order.completedSteps || 0,
      TotalMachines: order.totalMachines || 0,
      CreatedBy: order.createdByRole || 'N/A',
      CreatedDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      UpdatedDate: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A',
      Notes: order.Notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DayBook_Orders");
    
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    
    const filename = `DayBook_${fromDate || 'all'}_to_${toDate || 'all'}_${new Date().getTime()}.xlsx`;
    saveAs(blob, filename);
  };

  return (
    <div className="all-orders-page">
      {/* Header */}
      <div className="all-orders-header">
        <div className="all-orders-header__left">
          <BackButton />
          <h1 className="all-orders-title">Day Book</h1>
        </div>
        <div className="all-orders-header__actions">
          {/* Selection Controls */}
          {selectedOrders.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px', padding: '4px 12px', backgroundColor: '#dbeafe', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600, color: '#1d4ed8' }}>{selectedOrders.size} selected</span>
              <button
                onClick={handlePrintSelectedLabels}
                style={{ padding: '4px 8px', backgroundColor: '#FF6B35', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                Print Labels
              </button>
              <button
                onClick={clearSelections}
                style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                Clear
              </button>
            </div>
          )}
          <button
            className="action-btn"
            style={{ backgroundColor: '#10b981', color: 'white' }}
            onClick={selectAllOrders}
            disabled={loading || filteredOrders.length === 0}
          >
            Select All
          </button>
          <button className="action-btn action-btn--export" onClick={handleExportExcel} disabled={loading}>
            <Download size={16} /> Export
          </button>
          <button className="action-btn action-btn--print" onClick={handlePrint} disabled={loading}>
            <Printer size={16} /> Print
          </button>
          <button
            className="action-btn"
            style={{ backgroundColor: '#6366f1', color: 'white' }}
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'loading-spinner' : ''} /> {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="all-orders-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Order ID, Customer, Phone..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => handleStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Wait for Approval">Wait for Approval</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="dispatched">Dispatched</option>
              <option value="cancelled">Cancelled</option>
              <option value="issue">Issue</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order Type</label>
            <select
              className="filter-select"
              value={orderTypeFilter}
              onChange={e => setOrderTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {Array.isArray(orderTypes) && orderTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.typeName} ({type.typeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              className="filter-input"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              className="filter-input"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <button className="filter-reset-btn" onClick={handleClearFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Summary Cards - Status counts */}
      {statusCounts && (
        <div className="summary-cards summary-cards--compact">
          <div className="summary-card summary-card--mini">
            <div className="summary-card__value">{summary?.totalOrders || filteredOrders.length}</div>
            <div className="summary-card__label">Total</div>
          </div>
          {Object.entries(statusCounts).map(([status, count]) => {
            const statusClassMap: Record<string, string> = {
              'Wait for Approval': 'waiting',
              'pending': 'pending',
              'approved': 'approved',
              'in_progress': 'progress',
              'completed': 'completed',
              'dispatched': 'dispatched',
              'issue': 'issue',
              'cancelled': 'cancelled'
            };
            const statusClass = statusClassMap[status] || '';
            return (
              <div key={status} className={`summary-card summary-card--mini summary-card--${statusClass}`}>
                <div className="summary-card__value">{count as number}</div>
                <div className="summary-card__label">{status.replace(/_/g, ' ')}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Orders table */}
      <div ref={contentRef}>
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }}></div>
            <p>Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span className="error-icon" style={{ fontSize: '48px' }}>⚠️</span>
            <p className="error-message">Error: {error}</p>
            <button className="retry-btn" onClick={handleRefresh}>
              🔄 Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: '48px' }}>📋</span>
            <p>No orders found for the selected criteria.</p>
            <button className="filter-reset-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div
            className="orders-table-container"
            ref={contentRef}
            tabIndex={0}
            onKeyDown={handleKeyNavigation}
            onClick={() => contentRef.current?.focus()}
            style={{ outline: 'none' }}
          >
            <table className="orders-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={(e) => e.target.checked ? selectAllOrders() : clearSelections()}
                      title="Select all"
                    />
                  </th>
                  <th style={{ width: '50px' }}>No</th>
                  <th style={{ width: '100px' }}>Created</th>
                  <th style={{ width: '120px' }}>Order ID</th>
                  <th>Company</th>
                  <th style={{ width: '140px' }}>Order Status</th>
                  <th style={{ width: '100px' }}>Priority</th>
                  <th style={{ width: '150px' }}>Order Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const orderType = (order as any).orderType;
                  const orderTypeName = (order as any).orderTypeName || orderType?.typeName || '';
                  const orderTypeCode = (order as any).orderTypeCode || orderType?.typeCode || '';
                  const priority = (order as any).priority || 'normal';

                  // Status color mapping
                  const getStatusBadgeColor = (status: string) => {
                    const colors: Record<string, string> = {
                      'pending': '#f59e0b',
                      'in_progress': '#3b82f6',
                      'in-progress': '#3b82f6',
                      'completed': '#10b981',
                      'cancelled': '#6b7280',
                      'on-hold': '#6b7280',
                      'Wait for Approval': '#f59e0b',
                      'approved': '#8b5cf6',
                      'dispatched': '#06b6d4',
                      'issue': '#ef4444'
                    };
                    return colors[status] || '#6b7280';
                  };

                  // Priority color mapping
                  const getPriorityBadgeColor = (priority: string) => {
                    const colors: Record<string, string> = {
                      'urgent': '#ef4444',
                      'high': '#f97316',
                      'normal': '#3b82f6',
                      'low': '#6b7280'
                    };
                    return colors[priority] || '#3b82f6';
                  };

                  const isSelected = selectedOrders.has(order._id);

                  return (
                    <tr
                      key={`${order._id}-${index}`}
                      ref={el => ordersRef.current[index] = el as any}
                      className={`clickable-row ${selectedOrderIndex === index ? "row-expanded" : ""} ${isSelected ? "row-selected" : ""}`}
                      onClick={() => handleOrderClick(order)}
                      style={isSelected ? { backgroundColor: '#dbeafe' } : undefined}
                    >
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOrderSelection(order._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 500 }}>{index + 1}</td>
                      <td className="date-cell">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit'
                        }) : 'N/A'}
                      </td>
                      <td className="order-id-cell">{order.orderId || 'N/A'}</td>
                      <td style={{ fontWeight: 500 }}>{order.companyName || 'N/A'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusBadgeColor(order.status || 'pending') }}
                        >
                          {order.status?.replace(/_/g, ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityBadgeColor(priority) }}
                        >
                          {priority}
                        </span>
                      </td>
                      <td>
                        {orderTypeName ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px'
                          }}>
                            {orderType?.icon && <span>{orderType.icon}</span>}
                            <span style={{
                              color: orderType?.color || '#374151',
                              fontWeight: 500
                            }}>
                              {orderTypeName}
                            </span>
                            {orderTypeCode && (
                              <span style={{
                                color: '#94a3b8',
                                fontSize: '11px'
                              }}>
                                ({orderTypeCode})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {pagination.totalPages} ({pagination.totalOrders || 0} orders)
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages || loading}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Period Modal */}
      {showPeriodModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '320px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>
              Change Date Period
            </h2>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="filter-input"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="filter-input"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowPeriodModal(false)}
                className="filter-reset-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleDateFilter}
                className="action-btn action-btn--export"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
