import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../../../allCompones/BackButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../Dispatch/Dispatch.css";
import "../Oders/indexAllOders.css";  // ✅ Import All Orders styling
import { fetchOrders, updateOrder } from "../../../redux/oders/OdersActions";
import { RootState } from "../../../../store";
import { useDaybookUpdates } from "../../../../hooks/useWebSocket";  // ✅ WebSocket real-time updates
import ExcelExportSelector from "../../../../components/shared/ExcelExportSelector";
import { Download, Printer, RefreshCw, Tag } from "lucide-react";  // ✅ Icons

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
  deliveryDate?: string;
  deliveryStatus?: string;
  deliveryNotes?: string;
  
  // Computed properties for component compatibility
  id?: string;
  companyName?: string;
  name?: string;
  phone1?: string;
  date?: string;
  status?: string;
  priority?: string;
  orderType?: any;
  orderTypeName?: string;
  orderTypeCode?: string;
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

// Backend status values: 'Wait for Approval', 'pending', 'approved', 'in_progress', 'completed', 'dispatched', 'cancelled', 'issue'
// Dispatch-specific status values - ONLY orders with these statuses should appear in Dispatch view
const DISPATCH_STATUSES = [
  'completed',      // Production completed, ready for dispatch
  'dispatched'      // Already dispatched
];

export default function Dispatch() {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);
  const [showExcelExportSelector, setShowExcelExportSelector] = useState(false);

  // Dispatch status modal state
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
  const [newDispatchStatus, setNewDispatchStatus] = useState("");
  const [newDeliveryDate, setNewDeliveryDate] = useState("");
  const [newTrackingNumber, setNewTrackingNumber] = useState("");
  const [newCarrier, setNewCarrier] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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
  const branchId = (authState as any)?.user?.branchId || localStorage.getItem('branchId') || localStorage.getItem('selectedBranch') || null;  // ✅ For WebSocket subscription

  // Status color mapping for dispatch - matches backend overallStatus enum values
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Wait for Approval': '#f59e0b',
      'pending': '#f59e0b',
      'approved': '#3b82f6',
      'in_progress': '#FF6B35',
      'completed': '#10b981',      // Green - ready for dispatch
      'dispatched': '#8b5cf6',     // Purple - already dispatched
      'cancelled': '#ef4444',
      'issue': '#ef4444',
      'unknown': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  function getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'Wait for Approval': 'Order is waiting for approval',
      'pending': 'Order received and awaiting processing',
      'approved': 'Order has been approved',
      'in_progress': 'Order is being processed',
      'completed': 'Production completed - Ready for dispatch',
      'dispatched': 'Order has been dispatched',
      'cancelled': 'Order has been cancelled',
      'issue': 'Order has an issue',
      'unknown': 'Status unknown'
    };
    return descriptions[status] || 'Status unknown';
  }

  // Priority badge color function
  function getPriorityBadgeColor(priority: string): string {
    const colors: Record<string, string> = {
      'urgent': '#ef4444',
      'high': '#f97316',
      'normal': '#3b82f6',
      'low': '#6b7280'
    };
    return colors[priority] || '#3b82f6';
  }

  // Transform orders and filter for dispatch-relevant orders
  const transformedOrders: Order[] = Array.isArray(reduxOrders)
    ? reduxOrders
        .filter((order: any) => {
          // Filter for dispatch-relevant orders
          const status = order.overallStatus || '';

          // ONLY show orders with 'completed' or 'dispatched' status
          // These are the only orders relevant for dispatch management
          return DISPATCH_STATUSES.includes(status);
        })
        .map((order: any) => {
          const customerName = order.customer?.companyName || order.customer?.firstName || 'Unknown Customer';
          const customerPhone = order.customer?.phone1 || '';

          // Determine dispatch status
          let dispatchStatus = order.overallStatus || 'unknown';
          if (order.completedSteps === order.totalSteps && order.totalSteps > 0 && order.overallStatus === 'completed') {
            dispatchStatus = 'ready-for-dispatch';
          }

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
            phone1: customerPhone,
            status: dispatchStatus,
            priority: priority,
            orderType: orderType,
            orderTypeName: orderTypeName,
            orderTypeCode: orderTypeCode,
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

      // ✅ Order Type information - CRITICAL for showing order details
      orderType: (order as any).orderType || null,
      orderTypeId: (order as any).orderType?._id || (order as any).orderTypeId || '',

      // ✅ Options data - CRITICAL for edit mode to show order details
      options: (order as any).options || [],
      optionsWithDetails: (order as any).optionsWithDetails || [],

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
      deliveryDate: order.deliveryDate || '',
      deliveryStatus: order.deliveryStatus || '',
      deliveryNotes: order.deliveryNotes || '',
      
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
        materialName: orderDataForEdit.materialName,

        // ✅ Order Type - CRITICAL for showing order details
        orderType: (order as any).orderType,
        orderTypeId: (order as any).orderType?._id || (order as any).orderTypeId || '',

        // ✅ Options - CRITICAL for edit mode
        options: (order as any).options || [],
        optionsWithDetails: (order as any).optionsWithDetails || []
      }
    });
  };

  // Effect hooks - Fetch orders on mount and filter changes
  useEffect(() => {
    console.log("🚚 Dispatch useEffect triggered - fetching orders");
    fetchOrdersData();

    // ✅ Check if orders were updated while navigating - force refresh
    const ordersUpdated = sessionStorage.getItem('orders_updated');
    if (ordersUpdated) {
      console.log("📡 Orders were updated - forcing refresh");
      sessionStorage.removeItem('orders_updated');
      setTimeout(() => fetchOrdersData(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentPage, limit, fromDate, toDate, searchTerm, statusFilter]);

  // ✅ WebSocket real-time subscription for instant order updates
  const handleOrderUpdate = useCallback(() => {
    console.log("📡 WebSocket: Dispatch update received - refreshing");
    fetchOrdersData();
  }, [currentPage, limit, fromDate, toDate, searchTerm, statusFilter]);

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

  // Open dispatch status modal
  const handleOpenDispatchModal = (order: Order) => {
    setSelectedOrderForDispatch(order);
    setNewDispatchStatus(order.status || order.dispatchStatus || 'ready-for-dispatch');
    setNewDeliveryDate(order.deliveryDate || '');
    setNewTrackingNumber(order.trackingNumber || '');
    setNewCarrier(order.carrier || '');
    setDispatchNotes(order.Notes || '');
    setShowDispatchModal(true);
  };

  // Close dispatch modal
  const handleCloseDispatchModal = () => {
    setShowDispatchModal(false);
    setSelectedOrderForDispatch(null);
    setNewDispatchStatus('');
    setNewDeliveryDate('');
    setNewTrackingNumber('');
    setNewCarrier('');
    setDispatchNotes('');
  };

  // Update dispatch status
  const handleUpdateDispatchStatus = async () => {
    if (!selectedOrderForDispatch?._id) {
      alert('No order selected');
      return;
    }

    setIsUpdating(true);

    try {
      const updateData: any = {
        overallStatus: newDispatchStatus,
        dispatchStatus: newDispatchStatus,
      };

      // Add dispatch date if status is 'dispatched' and not already set
      if (newDispatchStatus === 'dispatched' && !selectedOrderForDispatch.dispatchDate) {
        updateData.dispatchDate = new Date().toISOString();
      }

      // Add delivery date if provided
      if (newDeliveryDate) {
        updateData.deliveryDate = newDeliveryDate;
      }

      // Add delivery date automatically when status is 'delivered'
      if (newDispatchStatus === 'delivered' && !newDeliveryDate) {
        updateData.deliveryDate = new Date().toISOString().split('T')[0];
      }

      // Add tracking number and carrier if provided
      if (newTrackingNumber) {
        updateData.trackingNumber = newTrackingNumber;
      }
      if (newCarrier) {
        updateData.carrier = newCarrier;
      }
      if (dispatchNotes) {
        updateData.Notes = dispatchNotes;
      }

      console.log('🚚 Updating dispatch status:', {
        orderId: selectedOrderForDispatch._id,
        updateData
      });

      const result = await dispatch(updateOrder(selectedOrderForDispatch._id, updateData) as any);

      if (result && !result.error) {
        alert(`Order ${selectedOrderForDispatch.orderId} status updated to: ${newDispatchStatus}`);
        handleCloseDispatchModal();
        fetchOrdersData(); // Refresh the list
      } else {
        alert(`Failed to update order: ${result?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error updating dispatch status:', error);
      alert(`Error updating dispatch status: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
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
        setSelectedOrders(new Set());
        break;
    }

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

    const ordersToPrint = filteredOrders.filter(o => selectedOrders.has(o._id));

    const labelContent = ordersToPrint.map(order => `
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
          <td>${order.status === 'completed' ? 'Ready for Dispatch' : order.status || 'N/A'}</td>
          <td>${order.materialWeight || 'N/A'}</td>
          <td>${order.branch?.name || 'N/A'}</td>
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
            Completed (Ready for Dispatch): ${filteredOrders.filter(o => o.status === 'completed').length}<br>
            Dispatched: ${filteredOrders.filter(o => o.status === 'dispatched').length}
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
      Phone: order.customer?.phone1 || 'N/A',
      Status: order.status === 'completed' ? 'Ready for Dispatch' : order.status || 'N/A',
      Weight: order.materialWeight || 'N/A',
      Width: order.Width || 'N/A',
      Height: order.Height || 'N/A',
      Thickness: order.Thickness || 'N/A',
      Branch: order.branch?.name || 'N/A',
      BranchCode: order.branch?.code || 'N/A',
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

  // Print Address Labels - Multiple labels per A4 page (10 labels per page)
  const handlePrintAddressLabels = () => {
    const currentDate = new Date().toLocaleDateString();

    // Generate address labels HTML
    const addressLabels = filteredOrders.map(order => {
      const customer = (order.customer || {}) as any;
      const customerName = order.companyName || customer?.companyName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Unknown';
      const address1 = customer?.address1 || '';
      const address2 = customer?.address2 || '';
      const state = customer?.state || '';
      const pinCode = customer?.pinCode || '';
      const phone = customer?.phone1 || '';

      return `
        <div class="address-label">
          <div class="label-header">
            <div class="from-section">
              <strong>FROM:</strong><br>
              <span class="company-name">${companyName}</span><br>
              <span>${branchName}</span>
            </div>
          </div>
          <div class="to-section">
            <strong>TO:</strong><br>
            <span class="customer-name">${customerName}</span><br>
            ${address1 ? `<span>${address1}</span><br>` : ''}
            ${address2 ? `<span>${address2}</span><br>` : ''}
            <span>${state} ${pinCode}</span><br>
            ${phone ? `<span>Ph: ${phone}</span>` : ''}
          </div>
          <div class="label-footer">
            <span class="order-id">Order: ${order.orderId}</span>
            <span class="date">${order.date || currentDate}</span>
          </div>
        </div>
      `;
    }).join('');

    const printContent = `
      <html>
        <head>
          <title>Address Labels - Dispatch</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10px;
              line-height: 1.3;
            }
            .labels-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 5mm;
              width: 100%;
            }
            .address-label {
              border: 1px solid #333;
              padding: 8px;
              height: 55mm;
              width: 95mm;
              page-break-inside: avoid;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .label-header {
              border-bottom: 1px dashed #999;
              padding-bottom: 5px;
              margin-bottom: 5px;
            }
            .from-section {
              font-size: 9px;
              color: #555;
            }
            .from-section .company-name {
              font-weight: bold;
              font-size: 10px;
              color: #000;
            }
            .to-section {
              flex: 1;
              padding: 5px 0;
            }
            .to-section .customer-name {
              font-weight: bold;
              font-size: 12px;
              display: block;
              margin-bottom: 3px;
            }
            .label-footer {
              border-top: 1px dashed #999;
              padding-top: 5px;
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #666;
            }
            .order-id {
              font-weight: bold;
            }
            @media print {
              .labels-container {
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${addressLabels}
          </div>
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

  // Print Single Address Label (for selected order)
  const handlePrintSingleAddress = (order: Order) => {
    const customer = (order.customer || {}) as any;
    const customerName = order.companyName || customer?.companyName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Unknown';
    const address1 = customer?.address1 || '';
    const address2 = customer?.address2 || '';
    const state = customer?.state || '';
    const pinCode = customer?.pinCode || '';
    const phone = customer?.phone1 || '';
    const currentDate = new Date().toLocaleDateString();

    const printContent = `
      <html>
        <head>
          <title>Shipping Label - ${order.orderId}</title>
          <style>
            @page {
              size: 100mm 150mm;
              margin: 5mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
            }
            .shipping-label {
              border: 2px solid #000;
              padding: 10px;
              width: 90mm;
              height: 140mm;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 10px;
            }
            .header h1 {
              font-size: 14px;
              margin: 0;
            }
            .from-section {
              background: #f5f5f5;
              padding: 8px;
              margin-bottom: 10px;
              border: 1px solid #ddd;
            }
            .from-section .label {
              font-size: 10px;
              color: #666;
              font-weight: bold;
            }
            .from-section .company {
              font-size: 12px;
              font-weight: bold;
            }
            .to-section {
              padding: 10px;
              border: 2px solid #000;
              min-height: 60mm;
            }
            .to-section .label {
              font-size: 10px;
              color: #666;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .to-section .name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .to-section .address {
              font-size: 12px;
              line-height: 1.5;
            }
            .footer {
              margin-top: 10px;
              padding-top: 8px;
              border-top: 1px dashed #999;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
            }
            .order-info {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="shipping-label">
            <div class="header">
              <h1>SHIPPING LABEL</h1>
            </div>

            <div class="from-section">
              <div class="label">FROM:</div>
              <div class="company">${companyName}</div>
              <div>${branchName}</div>
            </div>

            <div class="to-section">
              <div class="label">SHIP TO:</div>
              <div class="name">${customerName}</div>
              <div class="address">
                ${address1 ? `${address1}<br>` : ''}
                ${address2 ? `${address2}<br>` : ''}
                ${state} ${pinCode}<br>
                ${phone ? `Phone: ${phone}` : ''}
              </div>
            </div>

            <div class="footer">
              <span class="order-info">Order: ${order.orderId}</span>
              <span>Date: ${order.date || currentDate}</span>
            </div>
          </div>
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

  return (
    <div className="all-orders-page">
      {/* Header */}
      <div className="all-orders-header">
        <div className="all-orders-header__left">
          <BackButton />
          <h1 className="all-orders-title">Dispatch</h1>
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
          <button className="action-btn action-btn--export" onClick={() => setShowExcelExportSelector(true)} disabled={loading}>
            <Download size={16} /> Export
          </button>
          <button className="action-btn action-btn--print" onClick={handlePrint} disabled={loading}>
            <Printer size={16} /> Print Report
          </button>
          <button className="action-btn" onClick={handlePrintAddressLabels} disabled={loading || filteredOrders.length === 0}>
            <Tag size={16} /> Print All Labels
          </button>
          <button className="action-btn" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> {loading ? 'Refreshing...' : 'Refresh'}
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
              <option value="completed">Completed (Ready)</option>
              <option value="dispatched">Dispatched</option>
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

      {/* Status Summary Cards */}
      <div className="summary-cards summary-cards--compact">
        <div className="summary-card summary-card--mini">
          <div className="summary-card__value">{filteredOrders.length}</div>
          <div className="summary-card__label">Total</div>
        </div>
        <div className="summary-card summary-card--mini summary-card--completed">
          <div className="summary-card__value">{filteredOrders.filter(o => o.status === 'completed' || o.status === 'ready-for-dispatch').length}</div>
          <div className="summary-card__label">Ready</div>
        </div>
        <div className="summary-card summary-card--mini summary-card--dispatched">
          <div className="summary-card__value">{filteredOrders.filter(o => o.status === 'dispatched').length}</div>
          <div className="summary-card__label">Dispatched</div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <p>Loading dispatch orders...</p>
        </div>
      )}
      {error && <div className="orders-error">Error: {error}</div>}

      {/* Orders Table */}
      {!loading && filteredOrders.length === 0 && (
        <div className="orders-empty">
          <p>No dispatch orders found for the selected criteria.</p>
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
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => {
                const isSelected = selectedOrders.has(order._id);
                return (
                <tr
                  key={order._id || index}
                  ref={el => ordersRef.current[index] = el as any}
                  className={`clickable-row ${selectedOrderIndex === index ? 'row-expanded' : ''} ${isSelected ? 'row-selected' : ''}`}
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
                      style={{ backgroundColor: getStatusColor(order.status || '') }}
                    >
                      {order.status === 'completed' ? 'Ready' : order.status?.replace(/_/g, ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityBadgeColor(order.priority || 'normal') }}
                    >
                      {order.priority || 'normal'}
                    </span>
                  </td>
                  <td>
                    {order.orderTypeName ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 500 }}>{order.orderTypeName}</span>
                        {order.orderTypeCode && (
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>({order.orderTypeCode})</span>
                        )}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button
                        className="btn btn--sm btn--primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDispatchModal(order);
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          backgroundColor: '#FF6B35',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {order.status === 'completed' ? 'Dispatch' : 'View'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintSingleAddress(order);
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Print shipping label"
                      >
                        <Tag size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="orders-pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages || loading}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

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

      {/* Excel Export Selector */}
      <ExcelExportSelector
        isOpen={showExcelExportSelector}
        onClose={() => setShowExcelExportSelector(false)}
        orders={filteredOrders}
        defaultFilename={`Dispatch_${fromDate || 'all'}_to_${toDate || 'all'}`}
        onExport={(data, filename) => {
          console.log(`Exported ${data.length} orders to ${filename}`);
        }}
      />

      {/* Dispatch Status Update Modal */}
      {showDispatchModal && selectedOrderForDispatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Update Dispatch Status</h2>
            <p className="text-sm text-gray-600 mb-4">
              Order: <strong>{selectedOrderForDispatch.orderId}</strong><br />
              Customer: <strong>{selectedOrderForDispatch.companyName}</strong>
            </p>

            <label className="block mb-3">
              <span className="text-sm font-medium">Dispatch Status:</span>
              <select
                value={newDispatchStatus}
                onChange={e => setNewDispatchStatus(e.target.value)}
                className="border w-full p-2 rounded mt-1"
                style={{ background: '#fff', color: '#000' }}
              >
                <option value="completed">Completed (Ready for Dispatch)</option>
                <option value="dispatched">Dispatched</option>
              </select>
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium">Tracking Number:</span>
              <input
                type="text"
                value={newTrackingNumber}
                onChange={e => setNewTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="border w-full p-2 rounded mt-1"
                style={{ background: '#fff', color: '#000' }}
              />
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium">Carrier:</span>
              <input
                type="text"
                value={newCarrier}
                onChange={e => setNewCarrier(e.target.value)}
                placeholder="e.g., FedEx, DHL, BlueDart"
                className="border w-full p-2 rounded mt-1"
                style={{ background: '#fff', color: '#000' }}
              />
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium">Delivery Date:</span>
              <input
                type="date"
                value={newDeliveryDate}
                onChange={e => setNewDeliveryDate(e.target.value)}
                className="border w-full p-2 rounded mt-1"
                style={{ background: '#fff', color: '#000' }}
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm font-medium">Notes:</span>
              <textarea
                value={dispatchNotes}
                onChange={e => setDispatchNotes(e.target.value)}
                placeholder="Add any dispatch notes..."
                className="border w-full p-2 rounded mt-1"
                style={{ background: '#fff', color: '#000', minHeight: '60px' }}
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseDispatchModal}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDispatchStatus}
                className="bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#E55A2B]"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}