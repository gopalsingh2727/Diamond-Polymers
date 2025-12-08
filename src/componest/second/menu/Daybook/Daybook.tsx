
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../../../allCompones/BackButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../Dispatch/Dispatch.css";
import { fetchOrders } from "../../../redux/oders/OdersActions";
import { RootState } from "../../../../store";
import { useFormDataCache } from "../Edit/hooks/useFormDataCache";  // ✅ ADDED
import { useDaybookUpdates } from "../../../../hooks/useWebSocket";  // ✅ WebSocket real-time updates


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
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
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
  const branchId = authState?.user?.branchId || null;  // ✅ For WebSocket subscription

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
    
    return {
      ...order,
      id: order._id,
      companyName: customerName,
      name: customerName,
      phone: customerPhone,
      status: orderStatus, 
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

  // Effect hooks - Fetch orders
  useEffect(() => {
    console.log("🔄 useEffect triggered - fetching orders");
    fetchOrdersData();
  }, [dispatch, currentPage, limit, fromDate, toDate, searchTerm, statusFilter, orderTypeFilter]);

  // ✅ REPLACED: 30-second polling with WebSocket real-time subscription
  // This subscribes to the daybook room and receives instant updates when orders change
  const handleOrderUpdate = useCallback(() => {
    console.log("📡 WebSocket: Order update received - refreshing");
    fetchOrdersData();
  }, [currentPage, limit, fromDate, toDate, searchTerm, statusFilter, orderTypeFilter]);

  // Subscribe to real-time daybook updates via WebSocket
  useDaybookUpdates(branchId, handleOrderUpdate);

  useEffect(() => {
    if (scrollWrapperRef.current) {
      scrollWrapperRef.current.focus();
    }
  }, []);

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
        e.preventDefault();
        setSelectedOrderIndex(prev => (prev + 1) % filteredOrders.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedOrderIndex(prev => (prev - 1 + filteredOrders.length) % filteredOrders.length);
        break;
      case "Enter":
        if (e.shiftKey) {
          setExpandedOrder(prev => (prev === selectedOrderIndex ? null : selectedOrderIndex));
        } else {
          handleOrderClick(filteredOrders[selectedOrderIndex]);
        }
        break;
    }
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
    <div className="container">
      {/* Header with filters */}
      <div className="item">
        <BackButton />
        <div className="flex gap-4 items-center">
          {/* <div>
            <label>From:
              <input
              //  style={{
              //   background:"#fff",
              //   color:"#000",
              //   borderRadius
              //  }}
                type="date" 
                value={fromDate} 
                onChange={e => setFromDate(e.target.value)} 
              />
            </label>
            <label className="ml-4">To:
              <input 
                type="date" 
                value={toDate} 
                onChange={e => setToDate(e.target.value)} 
              />
            </label>
          </div> */}
          
          <div>
            <label>Search:
              <input 
                type="text" 
                style={{background:"#fff" , color:"#000"}}
                placeholder="Order ID, Customer, Phone, Notes..."
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className="ml-2 px-2 py-1 border rounded"
              />
            </label>
          </div>

          <div >
            <label>Status:
              <select
                style={{background:"#fff", color:"#000"}}
                value={statusFilter}
                onChange={e => handleStatusFilter(e.target.value)}
                className="ml-2 px-2 py-1 border rounded"
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
            </label>
          </div>

          {/* ✅ ADDED: Order Type Filter */}
          <div>
            <label>Order Type:
              <select
                style={{background:"#fff", color:"#000"}}
                value={orderTypeFilter}
                onChange={e => setOrderTypeFilter(e.target.value)}
                className="ml-2 px-2 py-1 border rounded"
              >
                <option value="">All Types</option>
                {Array.isArray(orderTypes) && orderTypes.map((type: any) => (
                  <option key={type._id} value={type._id}>
                    {type.typeName} ({type.typeCode})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="item item-2">
        <div className="ButtonInDispatchDiv">
          <button 
            className="ButtonINDispatch bottom-borders-menu" 
            onClick={() => setShowPeriodModal(true)}
          >
            Change Period
          </button>
          <button 
            className="ButtonINDispatch" 
            onClick={handlePrint}
            disabled={loading}
          >
            Print
          </button>
          <button 
            className="ButtonINDispatch bottom-borders-menu" 
            onClick={handleExportExcel}
            disabled={loading}
          >
            Export to Excel
          </button>
          <button 
            className="ButtonINDispatch" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            className="ButtonINDispatch" 
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders table */}
      <div className="item item-3" ref={contentRef}>
        {loading && <div className="text-center py-4">Loading orders...</div>}
        {error && <div className="text-red-500 text-center py-4">Error: {error}</div>}
        
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found for the selected criteria.
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="DispatchTabale">
            <div className="ordersHeaderDispatch">
              <span>Date</span>
              <span>Order ID</span>
              <span>Company Name</span>
              <span>Status</span>
              <span>Weight</span>
              <span>Dimensions</span>
            </div>

            <div
              className="orders-scroll-wrapper"
              ref={scrollWrapperRef}
              tabIndex={0}
              onKeyDown={handleKeyNavigation}
            >
              {filteredOrders.map((order, index) => (
                <div key={`${order._id}-${index}`}>
                  <div
                    ref={el => ordersRef.current[index] = el}
                    className={`orderItem  ordersTable ${selectedOrderIndex === index ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedOrderIndex(index);
                      // Toggle expand on single click
                      setExpandedOrder(expandedOrder === index ? null : index);
                    }}
                    onDoubleClick={() => handleOrderClick(order)}
                    style={{ cursor: "pointer" }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {expandedOrder === index ? '▼' : '▶'} {order.date || 'N/A'}
                    </span>
                    <span>{order.orderId || 'N/A'}</span>
                    <span>{order.companyName || 'N/A'}</span>
                    <span>{order.status || 'Unknown'}</span>
                    <span>{order.materialWeight || 'N/A'}</span>
                    <span>
                      {order.Width && order.Height && order.Thickness
                        ? `${order.Width}×${order.Height}×${order.Thickness}`
                        : 'N/A'
                      }
                    </span>
                  </div>

                  {expandedOrder === index && (
                    <div className="status-list" style={{ backgroundColor: '#f9fafb', padding: '16px', margin: '8px 0', borderRadius: '8px' }}>
                      {/* Order Status */}
                      {order.AllStatus && Object.entries(order.AllStatus).length > 0 && (
                        <div className="mb-3">
                          <strong className="block mb-2 text-sm text-gray-700">Status History:</strong>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(order.AllStatus).map(([status, { color, description }]) => (
                              <div
                                key={status}
                                className="status-item p-2 rounded text-white text-xs"
                                style={{ backgroundColor: color }}
                              >
                                <strong>{status}:</strong> <span>{description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customer & Order Info */}
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <strong className="text-gray-700">📋 Order Information</strong>
                          <div className="mt-1 space-y-1 text-xs text-gray-600">
                            <div><strong>Order ID:</strong> {order.orderId || 'N/A'}</div>
                            <div><strong>Customer:</strong> {order.companyName || 'N/A'}</div>
                            {order.customer?.contactPerson && <div><strong>Contact:</strong> {order.customer.contactPerson}</div>}
                            {order.customer?.phoneNumber && <div><strong>Phone:</strong> {order.customer.phoneNumber}</div>}
                            {order.orderType && order.orderType[0] && (
                              <div><strong>Order Type:</strong> {order.orderType[0].typeName} ({order.orderType[0].typeCode})</div>
                            )}
                          </div>
                        </div>

                        <div>
                          <strong className="text-gray-700">📦 Options & Products</strong>
                          <div className="mt-1 space-y-1 text-xs text-gray-600">
                            {/* New unified options display */}
                            {order.options && order.options.length > 0 ? (
                              order.options.map((opt: any, idx: number) => (
                                <div key={idx}>
                                  <strong>{opt.optionTypeName || opt.category || 'Option'}:</strong> {opt.optionName}
                                </div>
                              ))
                            ) : (
                              <>
                                {/* Legacy fields fallback */}
                                {order.material?.materialName && <div><strong>Material:</strong> {order.material.materialName}</div>}
                                {order.materialType && <div><strong>Material Type:</strong> {order.materialType}</div>}
                                <div><strong>Weight:</strong> {order.materialWeight || 'N/A'} kg</div>
                                {order.product?.productName && <div><strong>Product:</strong> {order.product.productName}</div>}
                                {order.productType && <div><strong>Product Type:</strong> {order.productType}</div>}
                              </>
                            )}
                            {order.Width && order.Height && (
                              <div><strong>Dimensions:</strong> {order.Width} × {order.Height} {order.Thickness ? `× ${order.Thickness}` : ''}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Product Specifications */}
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <strong className="text-gray-700">🔧 Product Specifications</strong>
                          <div className="mt-1 space-y-1 text-xs text-gray-600">
                            {order.SealingType && <div><strong>Sealing:</strong> {order.SealingType}</div>}
                            {order.BottomGusset && <div><strong>Bottom Gusset:</strong> {order.BottomGusset}</div>}
                            {order.Flap && <div><strong>Flap:</strong> {order.Flap}</div>}
                            {order.AirHole && <div><strong>Air Hole:</strong> {order.AirHole}</div>}
                            {order.Printing && <div><strong>Printing:</strong> Yes</div>}
                          </div>
                        </div>

                        <div>
                          <strong className="text-gray-700">⚙️ Production Progress</strong>
                          <div className="mt-1 space-y-1 text-xs text-gray-600">
                            <div><strong>Steps:</strong> {order.completedSteps || 0}/{order.totalSteps || 0}</div>
                            <div><strong>Machines:</strong> {order.totalMachines || 0}</div>
                            <div><strong>Progress:</strong> {order.progressPercentage || 0}%</div>
                            <div><strong>Branch:</strong> {order.branch?.name || 'N/A'} ({order.branch?.code || 'N/A'})</div>
                          </div>
                        </div>
                      </div>

                      {/* Timestamps & Notes */}
                      <div className="text-xs text-gray-600 border-t pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div><strong>Created:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
                            <div><strong>Created By:</strong> {order.createdByRole || 'N/A'}</div>
                          </div>
                          {order.Notes && (
                            <div>
                              <strong>Notes:</strong> {order.Notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Double-click hint */}
                      <div className="text-xs text-gray-400 italic mt-2 text-center">
                        💡 Double-click order row to edit
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages || loading}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="item">
        {summary && (
          <div className="item bg-gray-100 p-4 rounded">
            <div className="flex gap-6 text-sm">
              <span><strong>Total Orders:</strong> {summary.totalOrders}</span>
              <span><strong>Total Weight:</strong> {summary.totalWeight?.toFixed(2) || 'N/A'}</span>
              <span><strong>Avg Weight:</strong> {summary.avgWeight?.toFixed(2) || 'N/A'}</span>
              {statusCounts && Object.entries(statusCounts).map(([status, count]) => (
                <span key={status}><strong>{status}:</strong> {count}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Period Modal */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Change Date Period</h2>
            <label className="block mb-2">
              From:
              <input 
                type="date" 
                value={fromDate} 
                onChange={e => setFromDate(e.target.value)} 
                className="border w-full p-2 rounded" 
              />
            </label>
            <label className="block mb-4">
              To:
              <input 
                type="date" 
                value={toDate} 
                onChange={e => setToDate(e.target.value)} 
                className="border w-full p-2 rounded" 
              />
            </label>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowPeriodModal(false)} 
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button 
                onClick={handleDateFilter} 
                className="bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#E55A2B]"
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
