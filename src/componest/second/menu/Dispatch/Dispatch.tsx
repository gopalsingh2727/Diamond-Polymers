import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../../../allCompones/BackButton"; 
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../Dispatch/Dispatch.css";
import { fetchOrders } from "../../../redux/oders/OdersActions";
import { RootState } from "../../../../store";

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
    imageUrl?: string;
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
    mol?: number;
  };
  creator?: any;
  totalSteps?: number;
  completedSteps?: number;
  progressPercentage?: number;
  Notes?: string;
  
  // Dispatch-specific fields
  dispatchDate?: string;
  dispatchStatus?: string;
  carrier?: string;
  trackingNumber?: string;
  
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
}

const defaultOrdersState = {
  orders: [],
  loading: false,
  error: null,
  pagination: null,
  summary: null,
  statusCounts: null
};

// Dispatch-specific status values
const DISPATCH_STATUSES = [
  'ready-for-dispatch',
  'dispatched', 
  'in-transit',
  'delivered',
  'dispatch-pending',
  'completed'
];

export default function Dispatch() {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);

  // Redux selectors
  const ordersState = useSelector((state: RootState) => {
    return state.orders?.list || defaultOrdersState;
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

  // Company info - safe access with type assertion
  const companyName = (authState as any)?.user?.companyName || "ABC Company";
  const branchName = (authState as any)?.user?.branchName || "Main Branch";

  // Status color mapping for dispatch
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'ready-for-dispatch': '#f59e0b',
      'dispatched': '#FF6B35',
      'in-transit': '#FFA500',
      'delivered': '#10b981',
      'dispatch-pending': '#f59e0b',
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'on-hold': '#6b7280',
      'pending': '#f59e0b',
      'in-progress': '#FF6B35',
      'Wait for Approval': '#f59e0b',
      'unknown': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  function getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'ready-for-dispatch': 'Order is ready to be dispatched',
      'dispatched': 'Order has been dispatched',
      'in-transit': 'Order is in transit to customer',
      'delivered': 'Order has been delivered to customer',
      'dispatch-pending': 'Dispatch is pending approval',
      'completed': 'Order completed and ready for dispatch',
      'cancelled': 'Order has been cancelled',
      'on-hold': 'Dispatch is on hold',
      'pending': 'Order received and awaiting processing',
      'in-progress': 'Order is being processed',
      'Wait for Approval': 'Order is waiting for approval',
      'unknown': 'Status unknown'
    };
    return descriptions[status] || 'Status unknown';
  }

  // Transform orders and filter for dispatch-relevant orders
  const transformedOrders: Order[] = Array.isArray(reduxOrders) 
    ? reduxOrders
        .filter((order: any) => {
          // Filter for dispatch-relevant orders
          const status = order.overallStatus?.toLowerCase() || '';
          
          // Include orders that are completed, ready for dispatch, or already dispatched
          return DISPATCH_STATUSES.some(dispatchStatus => 
            status.includes(dispatchStatus.toLowerCase()) || 
            status === 'completed' ||
            status === 'ready' ||
            order.completedSteps === order.totalSteps
          );
        })
        .map((order: any) => {
          const customerName = order.customer?.companyName || order.customer?.firstName || 'Unknown Customer';
          const customerPhone = order.customer?.phone1 || '';
          
          // Determine dispatch status
          let dispatchStatus = order.overallStatus || 'unknown';
          if (order.completedSteps === order.totalSteps && order.totalSteps > 0 && order.overallStatus === 'completed') {
            dispatchStatus = 'ready-for-dispatch';
          }
          
          return {
            ...order,
            id: order._id,
            companyName: customerName,
            name: customerName,
            phone: customerPhone,
            phone1: customerPhone,
            status: dispatchStatus,
            date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '',
            AllStatus: {
              [dispatchStatus]: {
                color: getStatusColor(dispatchStatus),
                description: getStatusDescription(dispatchStatus)
              }
            }
          };
        })
    : [];

  // Filter orders based on search and date criteria
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
      const matchesTrackingNumber = order.trackingNumber?.toLowerCase().includes(searchLower);
      
      if (!matchesOrderId && !matchesCustomer && !matchesPhone && !matchesNotes && !matchesTrackingNumber) {
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

    return filters;
  };

  // Fetch orders helper
  const fetchOrdersData = () => {
    const filters = createFilters();
    console.log("🚚 Dispatch filters being sent:", filters);

    if (typeof fetchOrders === 'function') {
      dispatch(fetchOrders(filters) as any);
    } else {
      console.error("❌ fetchOrders function is not available");
    }
  };

  // Handle order click - navigate to order form with complete data
  const handleOrderClick = (order: Order) => {
    console.log('🚚 Navigating to CreateOrders with dispatch order data:', order);
    
    // Create comprehensive order data structure for edit mode
    const orderDataForEdit = {
      // Core order info
      _id: order._id,
      orderId: order.orderId,
      overallStatus: order.overallStatus,
      status: order.overallStatus,
      
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
      
      // Material information - complete structure
      material: {
        _id: order.material?._id || order.materialId || '',
        name: order.material?.materialName || '',
        materialName: order.material?.materialName || '',
        type: order.material?.materialType || '',
        materialType: order.material?.materialType || '',
        materialTypeName: order.material?.materialTypeName || '',
        mol: order.material?.mol || 0
      },
      materialId: order.material?._id || order.materialId || '',
      materialType: order.material?.materialTypeName || '',
      materialName: order.material?.materialName || '',
      
      // Physical specifications
      materialWeight: order.materialWeight || 0,
      Width: order.Width || 0,
      Height: order.Height || 0,
      Thickness: order.Thickness || 0,
      width: order.Width?.toString() || '',
      height: order.Height?.toString() || '',
      gauge: order.Thickness?.toString() || '',
      totalWeight: order.materialWeight?.toString() || '',
      
      // Additional product features
      SealingType: order.SealingType || '',
      BottomGusset: order.BottomGusset || '',
      Flap: order.Flap || '',
      AirHole: order.AirHole || '',
      Printing: order.Printing || false,
      
      // Mixing materials
      mixMaterial: order.mixMaterial || [],
      mixingData: order.mixMaterial || [],
      mixing: (order.mixMaterial && order.mixMaterial.length > 0) ? 'yes' : 'no',
      
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
      
      // Dispatch specific fields
      dispatchDate: order.dispatchDate || '',
      dispatchStatus: order.dispatchStatus || order.status,
      carrier: order.carrier || '',
      trackingNumber: order.trackingNumber || '',
      
      // Status tracking
      AllStatus: order.AllStatus || {
        [order.overallStatus]: {
          color: getStatusColor(order.overallStatus),
          description: getStatusDescription(order.overallStatus)
        }
      }
    };

    console.log('🚚 Complete order data for edit mode:', orderDataForEdit);

    // Navigate to CreateOrders with comprehensive state
    navigate("/menu/orderform", {
      state: {
        isEdit: true,
        isDispatch: true, // Flag to indicate this is from dispatch
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

  // Effect hooks
  useEffect(() => {
    console.log("🚚 Dispatch useEffect triggered - fetching orders");
    fetchOrdersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentPage, limit, fromDate, toDate, searchTerm, statusFilter]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🚚 Dispatch auto-refresh triggered");
      fetchOrdersData();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, fromDate, toDate, searchTerm, statusFilter]);

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
    console.log("🚚 Dispatch manual refresh triggered");
    fetchOrdersData();
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setStatusFilter('');
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
          <td>${order.trackingNumber || 'N/A'}</td>
        </tr>`
      )
      .join("");

    const printContent = `
      <html>
        <head>
          <title>Dispatch Report - Orders</title>
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
            <h1>${companyName} - Dispatch Report</h1>
            <div class="meta">${branchName}</div>
            <div class="meta">${periodText}</div>
            <div class="meta">Printed: ${currentDate}</div>
          </div>
          
          <div class="summary">
            <strong>Dispatch Summary:</strong><br>
            Total Orders: ${summary?.totalOrders || filteredOrders.length}<br>
            Ready for Dispatch: ${filteredOrders.filter(o => o.status === 'ready-for-dispatch').length}<br>
            Dispatched: ${filteredOrders.filter(o => o.status === 'dispatched').length}<br>
            In Transit: ${filteredOrders.filter(o => o.status === 'in-transit').length}<br>
            Delivered: ${filteredOrders.filter(o => o.status === 'delivered').length}
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
                <th>Tracking #</th>
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
      DispatchStatus: order.status || 'N/A',
      Weight: order.materialWeight || 'N/A',
      Width: order.Width || 'N/A',
      Height: order.Height || 'N/A',
      Thickness: order.Thickness || 'N/A',
      Branch: order.branch?.name || 'N/A',
      BranchCode: order.branch?.code || 'N/A',
      Material: order.material?.materialName || 'N/A',
      TrackingNumber: order.trackingNumber || 'N/A',
      Carrier: order.carrier || 'N/A',
      DispatchDate: order.dispatchDate || 'N/A',
      StepsCompleted: `${order.completedSteps || 0}/${order.totalSteps || 0}`,
      CreatedBy: order.createdByRole || 'N/A',
      CreatedDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      UpdatedDate: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A',
      Notes: order.Notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dispatch_Orders");
    
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    
    const filename = `Dispatch_${fromDate || 'all'}_to_${toDate || 'all'}_${new Date().getTime()}.xlsx`;
    saveAs(blob, filename);
  };

  return (
    <div className="container">
      {/* Header with filters */}
      <div className="item">
        <BackButton />
        <div className="flex gap-4 items-center">
          <div>
            <label>Search:
              <input 
                type="text"
                style={{background:"#fff", color:"#000"}}
                placeholder="Order ID, Customer, Phone, Tracking..."
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className="ml-2 px-2 py-1 border rounded"
              />
            </label>
          </div>

          <div>
            <label>Dispatch Status:
              <select 
                style={{background:"#fff", color:"#000"}}
                value={statusFilter} 
                onChange={e => handleStatusFilter(e.target.value)}
                className="ml-2 px-2 py-1 border rounded"
              >
                <option value="">All Status</option>
                <option value="ready-for-dispatch">Ready for Dispatch</option>
                <option value="dispatched">Dispatched</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="dispatch-pending">Dispatch Pending</option>
                <option value="completed">Completed</option>
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
            Print Dispatch Report
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
        {loading && <div className="text-center py-4">Loading dispatch orders...</div>}
        {error && <div className="text-red-500 text-center py-4">Error: {error}</div>}
        
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No dispatch orders found for the selected criteria.
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="DispatchTabale">
            <div className="ordersHeaderDispatch">
              <span>Date</span>
              <span>Order ID</span>
              <span>Company Name</span>
              <span>Dispatch Status</span>
              <span>Weight</span>
              <span>Tracking #</span>
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
                    className={`orderItem ordersTable ${selectedOrderIndex === index ? "selected" : ""}`}
                    onClick={() => setSelectedOrderIndex(index)}
                    onDoubleClick={() => handleOrderClick(order)}
                    style={{ cursor: "pointer" }}
                  >
                    <span>{order.date || 'N/A'}</span>
                    <span>{order.orderId || 'N/A'}</span>
                    <span>{order.companyName || 'N/A'}</span>
                    <span 
                      style={{ 
                        color: getStatusColor(order.status || ''),
                        fontWeight: 'bold'
                      }}
                    >
                      {order.status || 'Unknown'}
                    </span>
                    <span>{order.materialWeight || 'N/A'}</span>
                    <span>{order.trackingNumber || 'N/A'}</span>
                  </div>

                  {expandedOrder === index && order.AllStatus && (
                    <div className="status-list">
                      {Object.entries(order.AllStatus).map(([status, statusData]) => (
                        <div 
                          key={status} 
                          className="status-item p-2 m-1 rounded text-white text-sm"
                          style={{ backgroundColor: statusData.color }}
                        >
                          <strong>{status}:</strong> <span>{statusData.description}</span>
                        </div>
                      ))}
                      <div className="p-2 text-xs text-gray-600">
                        <div>Steps: {order.completedSteps || 0}/{order.totalSteps || 0}</div>
                        <div>Dimensions: {order.Width && order.Height && order.Thickness 
                          ? `${order.Width}×${order.Height}×${order.Thickness}`
                          : 'N/A'
                        }</div>
                        <div>Branch: {order.branch?.name || 'N/A'} ({order.branch?.code || 'N/A'})</div>
                        <div>Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
                        <div>Created By: {order.createdByRole || 'N/A'}</div>
                        {order.dispatchDate && <div>Dispatch Date: {new Date(order.dispatchDate).toLocaleString()}</div>}
                        {order.carrier && <div>Carrier: {order.carrier}</div>}
                        {order.SealingType && <div>Sealing: {order.SealingType}</div>}
                        {order.BottomGusset && <div>Bottom Gusset: {order.BottomGusset}</div>}
                        {order.Flap && <div>Flap: {order.Flap}</div>}
                        {order.AirHole && <div>Air Hole: {order.AirHole}</div>}
                        {order.Printing && <div>Printing: Yes</div>}
                        {order.Notes && <div>Notes: {order.Notes}</div>}
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
              <span><strong>Total Dispatch Orders:</strong> {filteredOrders.length}</span>
              <span><strong>Ready for Dispatch:</strong> {filteredOrders.filter(o => o.status === 'ready-for-dispatch').length}</span>
              <span><strong>Dispatched:</strong> {filteredOrders.filter(o => o.status === 'dispatched').length}</span>
              <span><strong>In Transit:</strong> {filteredOrders.filter(o => o.status === 'in-transit').length}</span>
              <span><strong>Delivered:</strong> {filteredOrders.filter(o => o.status === 'delivered').length}</span>
              <span><strong>Total Weight:</strong> {summary.totalWeight?.toFixed(2) || 'N/A'}</span>
              <span><strong>Avg Weight:</strong> {summary.avgWeight?.toFixed(2) || 'N/A'}</span>
              {statusCounts && Object.entries(statusCounts).map(([status, count]) => (
                <span key={status}><strong>{status}:</strong> {String(count)}</span>
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