import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../../../allCompones/BackButton";
import * as XLSX from "xlsx"; 
import { saveAs } from "file-saver";
import "../Dispatch/Dispatch.css";
import "../Oders/indexAllOders.css";
import { fetchOrders, updateOrder, fetchOrderDetails } from "../../../redux/oders/OdersActions";
import { RootState, AppDispatch } from "../../../../store";
import { useDispatchUpdates, useWebSocketStatus } from "../../../../hooks/useWebSocket";
import ExcelExportSelector from "../../../../components/shared/ExcelExportSelector";
import { ArrowDownTrayIcon, PrinterIcon, ArrowPathIcon, TagIcon, SignalIcon, SignalSlashIcon, CheckCircleIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Tag } from "lucide-react";
import { useFormDataCache } from "../Edit/hooks/useFormDataCache";

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
  orderTypeColor?: string;
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

const DISPATCH_STATUSES = ['completed', 'dispatched'];

export default function Dispatch() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // ✅ FIX: No default date filter — show ALL completed/dispatched orders like DayBook
  // User can still filter by date via the Created column dropdown
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [orderTypeFilters, setOrderTypeFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [createdByFilters, setCreatedByFilters] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);
  const [showExcelExportSelector, setShowExcelExportSelector] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number; left: number} | null>(null);

  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
  const [newDispatchStatus, setNewDispatchStatus] = useState("");
  const [newDeliveryDate, setNewDeliveryDate] = useState("");
  const [newTrackingNumber, setNewTrackingNumber] = useState("");
  const [newCarrier, setNewCarrier] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ FIX: Added editLoading state (same as DayBook)
  const [editLoading, setEditLoading] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<(HTMLDivElement | null)[]>([]);

  const ordersState = useSelector((state: RootState) => state.orders?.list || defaultOrdersState);
  const authState = useSelector((state: RootState) => state.auth);

  const {
    orders: reduxOrders = [],
    loading = false,
    error = null,
    pagination = null,
    summary = null,
    statusCounts = null
  } = ordersState;

  const { orderTypes = [] } = useFormDataCache();

  const companyName = (authState as any)?.user?.companyName || "ABC Company";
  const branchName = (authState as any)?.user?.branchName || "Main Branch";
  const selectedBranch = useSelector((state: RootState) => state.auth.userData?.selectedBranch);
  const branchId = selectedBranch || (authState as any)?.user?.branchId || localStorage.getItem('selectedBranch') || null;

  // ✅ FIX: On branch change, reset filters and refetch — no date wipe since dates start empty
  useEffect(() => {
    if (selectedBranch) {
      setSearchTerm('');
      setStatusFilters([]);
      setOrderTypeFilters([]);
      setPriorityFilters([]);
      setCreatedByFilters([]);
      setCurrentPage(1);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [selectedBranch]);

  const { isConnected: wsConnected } = useWebSocketStatus();

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Wait for Approval': '#f59e0b', 'pending': '#f59e0b', 'approved': '#3b82f6',
      'in_progress': '#FF6B35', 'completed': '#10b981', 'dispatched': '#8b5cf6',
      'cancelled': '#ef4444', 'issue': '#ef4444', 'unknown': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  function getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'Wait for Approval': 'Order is waiting for approval', 'pending': 'Order received and awaiting processing',
      'approved': 'Order has been approved', 'in_progress': 'Order is being processed',
      'completed': 'Production completed - Ready for dispatch', 'dispatched': 'Order has been dispatched',
      'cancelled': 'Order has been cancelled', 'issue': 'Order has an issue', 'unknown': 'Status unknown'
    };
    return descriptions[status] || 'Status unknown';
  }

  function getPriorityBadgeColor(priority: string): string {
    const colors: Record<string, string> = {
      'urgent': '#ef4444', 'high': '#f97316', 'normal': '#3b82f6', 'low': '#6b7280'
    };
    return colors[priority] || '#3b82f6';
  }

  const transformedOrders: Order[] = Array.isArray(reduxOrders)
    ? reduxOrders
        .filter((order: any) => DISPATCH_STATUSES.includes(order.overallStatus || ''))
        .map((order: any) => {
          const customerName = order.customer?.companyName || order.customer?.firstName || 'Unknown Customer';
          const customerPhone = order.customer?.phone1 || '';

          let dispatchStatus = order.overallStatus || 'unknown';
          if (order.completedSteps === order.totalSteps && order.totalSteps > 0 && order.overallStatus === 'completed') {
            dispatchStatus = 'ready-for-dispatch';
          }

          let orderTypeObj = order.orderType;
          if (!orderTypeObj && order.orderTypeId) {
            const orderTypeId = typeof order.orderTypeId === 'object' ? (order.orderTypeId as any)?._id : order.orderTypeId;
            orderTypeObj = orderTypes.find((ot: any) => ot._id === orderTypeId);
          }
          const orderTypeName = orderTypeObj?.typeName || orderTypeObj?.name || '';
          const orderTypeCode = orderTypeObj?.typeCode || orderTypeObj?.code || '';
          const orderTypeColor = orderTypeObj?.color || '#374151';
          const priority = order.priority || 'normal';

          return {
            ...order,
            id: order._id,
            companyName: customerName,
            name: customerName,
            phone: customerPhone,
            phone1: customerPhone,
            status: dispatchStatus,
            priority,
            orderType: orderTypeObj,
            orderTypeName,
            orderTypeCode,
            orderTypeColor,
            date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '',
            AllStatus: {
              [dispatchStatus]: { color: getStatusColor(dispatchStatus), description: getStatusDescription(dispatchStatus) }
            }
          };
        })
    : [];

  const filteredOrders = transformedOrders.filter((order) => {
    if (statusFilters.length > 1 && !statusFilters.includes(order.status || '')) return false;
    if (priorityFilters.length > 0 && !priorityFilters.includes((order as any).priority || 'normal')) return false;
    if (orderTypeFilters.length > 0) {
      const orderTypeId = (order as any).orderType?._id || (order as any).orderTypeId;
      if (!orderTypeFilters.includes(orderTypeId)) return false;
    }
    if (createdByFilters.length > 0) {
      const createdByName = (order as any).createdByName || (order as any).creator?.username || '';
      if (!createdByFilters.includes(createdByName)) return false;
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!order.orderId?.toLowerCase().includes(s) &&
          !order.companyName?.toLowerCase().includes(s) &&
          !order.customer?.phone1?.toLowerCase().includes(s) &&
          !order.Notes?.toLowerCase().includes(s) &&
          !order.trackingNumber?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const fetchOrdersData = useCallback(() => {
    const filters: OrderFilters = {
      page: currentPage, limit: 50, sortBy: 'createdAt', sortOrder: 'desc'
    };
    if (fromDate) filters.startDate = fromDate;
    if (toDate) filters.endDate = toDate;
    if (searchTerm) filters.search = searchTerm;
    if (statusFilters.length > 0) filters.status = statusFilters[0];
    dispatch(fetchOrders(filters) as any);
  }, [dispatch, currentPage, fromDate, toDate, searchTerm, statusFilters]);

  // ✅ FIX: Replaced manual data construction with fetchOrderDetails API call (same as DayBook)
  const handleOrderClick = async (order: Order) => {
    setEditLoading(true);
    try {
      const fullOrderData = await dispatch(fetchOrderDetails(order._id) as any);

      if (!fullOrderData) {
        alert('Failed to load order details. Please try again.');
        setEditLoading(false);
        return;
      }

      navigate("/menu/orderform", {
        state: {
          isEdit: true,
          isDispatch: true,
          orderData: fullOrderData,
          isEditMode: true,
          editMode: true,
          mode: 'edit',
          orderId: fullOrderData.orderId,
          customerName: fullOrderData.customer?.companyName || '',
          orderType: fullOrderData.orderType,
          orderTypeId: fullOrderData.orderType?._id || fullOrderData.orderTypeId || '',
          options: fullOrderData.options || [],
          optionsWithDetails: fullOrderData.optionsWithDetails || []
        }
      });
    } catch (error: any) {
      alert('Error loading order. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const uniqueCreators = [...new Set(transformedOrders.map((o) =>
    (o as any).createdByName || (o as any).creator?.username || ''
  ).filter(Boolean))];

  const toggleFilterValue = (currentFilters: string[], value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(currentFilters.includes(value)
      ? currentFilters.filter((f) => f !== value)
      : [...currentFilters, value]);
    setCurrentPage(1);
  };

  const toggleDropdown = (column: string, event?: React.MouseEvent<HTMLDivElement>) => {
    if (openDropdown === column) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      setOpenDropdown(column);
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect();
        setDropdownPosition({ top: rect.bottom + 3, left: rect.left });
      }
    }
  };

  useEffect(() => {
    fetchOrdersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentPage, fromDate, toDate, searchTerm, statusFilters, location.key, refreshTrigger]);

  useEffect(() => {
    const ordersUpdated = sessionStorage.getItem('orders_updated');
    if (ordersUpdated) { sessionStorage.removeItem('orders_updated'); setRefreshTrigger((prev) => prev + 1); }
  }, []);

  useEffect(() => {
    const ordersUpdated = sessionStorage.getItem('orders_updated');
    if (ordersUpdated) { sessionStorage.removeItem('orders_updated'); setRefreshTrigger((prev) => prev + 1); }
  }, [location]);

  const handleOrderUpdate = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useDispatchUpdates(branchId, handleOrderUpdate);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ordersUpdated = sessionStorage.getItem('orders_updated');
        if (ordersUpdated) { sessionStorage.removeItem('orders_updated'); setRefreshTrigger((prev) => prev + 1); }
      }
    };
    const handleWindowFocus = () => {
      const ordersUpdated = sessionStorage.getItem('orders_updated');
      if (ordersUpdated) { sessionStorage.removeItem('orders_updated'); setRefreshTrigger((prev) => prev + 1); }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  useEffect(() => {
    if (contentRef.current && filteredOrders.length > 0) contentRef.current.focus();
  }, [filteredOrders.length]);

  useEffect(() => {
    if (selectedOrderIndex >= filteredOrders.length && filteredOrders.length > 0) setSelectedOrderIndex(0);
  }, [filteredOrders.length, selectedOrderIndex]);

  useEffect(() => { setCurrentPage(1); }, [fromDate, toDate, searchTerm, statusFilters, orderTypeFilters, priorityFilters, createdByFilters]);

  const handleDateFilter = () => { setCurrentPage(1); setShowPeriodModal(false); };
  const handleRefresh = () => { fetchOrdersData(); };
  const handleClearFilters = () => {
    setFromDate(''); setToDate(''); setSearchTerm('');
    setStatusFilters([]); setOrderTypeFilters([]); setPriorityFilters([]); setCreatedByFilters([]);
    setCurrentPage(1); setOpenDropdown(null);
  };

  const handleOpenDispatchModal = (order: Order) => {
    setSelectedOrderForDispatch(order);
    setNewDispatchStatus(order.status || order.dispatchStatus || 'ready-for-dispatch');
    setNewDeliveryDate(order.deliveryDate || '');
    setNewTrackingNumber(order.trackingNumber || '');
    setNewCarrier(order.carrier || '');
    setDispatchNotes(order.Notes || '');
    setShowDispatchModal(true);
  };

  const handleCloseDispatchModal = () => {
    setShowDispatchModal(false); setSelectedOrderForDispatch(null);
    setNewDispatchStatus(''); setNewDeliveryDate(''); setNewTrackingNumber(''); setNewCarrier(''); setDispatchNotes('');
  };

  const handleUpdateDispatchStatus = async () => {
    if (!selectedOrderForDispatch?._id) { alert('No order selected'); return; }
    setIsUpdating(true);
    try {
      const updateData: any = { overallStatus: newDispatchStatus, dispatchStatus: newDispatchStatus };
      if (newDispatchStatus === 'dispatched' && !selectedOrderForDispatch.dispatchDate) updateData.dispatchDate = new Date().toISOString();
      if (newDeliveryDate) updateData.deliveryDate = newDeliveryDate;
      if (newDispatchStatus === 'delivered' && !newDeliveryDate) updateData.deliveryDate = new Date().toISOString().split('T')[0];
      if (newTrackingNumber) updateData.trackingNumber = newTrackingNumber;
      if (newCarrier) updateData.carrier = newCarrier;
      if (dispatchNotes) updateData.Notes = dispatchNotes;

      const result = await dispatch(updateOrder(selectedOrderForDispatch._id, updateData) as any);
      if (result && !result.error) {
        alert(`Order ${selectedOrderForDispatch.orderId} status updated to: ${newDispatchStatus}`);
        handleCloseDispatchModal();
        fetchOrdersData();
      } else {
        alert(`Failed to update order: ${result?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
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
        if (!e.shiftKey) { e.preventDefault(); setSelectedOrderIndex((prev) => (prev + 1) % filteredOrders.length); }
        break;
      case "ArrowUp":
        e.preventDefault(); setSelectedOrderIndex((prev) => (prev - 1 + filteredOrders.length) % filteredOrders.length);
        break;
      case "Enter": handleOrderClick(filteredOrders[selectedOrderIndex]); break;
      case " ":
        e.preventDefault();
        const currentOrder = filteredOrders[selectedOrderIndex];
        if (currentOrder?._id) {
          setSelectedOrders((prev) => { const s = new Set(prev); s.has(currentOrder._id) ? s.delete(currentOrder._id) : s.add(currentOrder._id); return s; });
        }
        break;
      case "Escape": setSelectedOrders(new Set()); break;
    }
    if (e.key === "Tab" && e.shiftKey) { e.preventDefault(); setSelectedOrderIndex((prev) => (prev - 1 + filteredOrders.length) % filteredOrders.length); }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => { const s = new Set(prev); s.has(orderId) ? s.delete(orderId) : s.add(orderId); return s; });
  };
  const selectAllOrders = () => setSelectedOrders(new Set(filteredOrders.map((o) => o._id)));
  const clearSelections = () => setSelectedOrders(new Set());

  const handlePrintSelectedLabels = () => {
    if (selectedOrders.size === 0) { alert('Please select orders to print labels'); return; }
    const ordersToPrint = filteredOrders.filter((o) => selectedOrders.has(o._id));
    const labelContent = ordersToPrint.map((order) => `
      <div style="page-break-after:always;padding:20px;border:2px solid #000;margin:10px;min-height:200px;">
        <div style="font-size:18px;font-weight:bold;margin-bottom:10px;border-bottom:2px solid #000;padding-bottom:5px;">${companyName}</div>
        <div style="font-size:14px;margin-bottom:5px;"><strong>Order ID:</strong> ${order.orderId || 'N/A'}</div>
        <div style="font-size:16px;font-weight:bold;margin:10px 0;">${order.customer?.companyName || order.companyName || 'N/A'}</div>
        <div style="font-size:14px;margin-bottom:5px;">${order.customer?.address1 || ''} ${order.customer?.address2 || ''}</div>
        <div style="font-size:14px;margin-bottom:5px;">${order.customer?.state || ''} - ${order.customer?.pinCode || ''}</div>
        <div style="font-size:14px;margin-bottom:5px;"><strong>Phone:</strong> ${order.customer?.phone1 || order.customer?.telephone || 'N/A'}</div>
        <div style="font-size:12px;margin-top:10px;color:#666;">Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</div>
      </div>`).join('');
    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);
    const cw = printFrame.contentWindow;
    if (!cw) { document.body.removeChild(printFrame); return; }
    cw.document.open();
    cw.document.write(`<html><head><title>Labels</title><style>body{font-family:Arial;margin:0;padding:0;}</style></head><body>${labelContent}</body></html>`);
    cw.document.close();
    printFrame.onload = () => { cw.print(); setTimeout(() => document.body.removeChild(printFrame), 1000); };
  };

  const handlePrint = () => {
    const currentDate = new Date().toLocaleDateString();
    const periodText = fromDate && toDate ? `Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}` : "All Records";
    const tableRows = filteredOrders.map((order) => `<tr><td>${order.date || 'N/A'}</td><td>${order.orderId || 'N/A'}</td><td>${order.companyName || 'N/A'}</td><td>${order.customer?.phone1 || 'N/A'}</td><td>${order.status === 'completed' ? 'Ready for Dispatch' : order.status || 'N/A'}</td><td>${order.materialWeight || 'N/A'}</td><td>${order.branch?.name || 'N/A'}</td></tr>`).join('');
    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);
    const cw = printFrame.contentWindow;
    if (!cw) return;
    cw.document.open();
    cw.document.write(`<html><head><title>Dispatch Report</title><style>body{font-family:Arial;margin:40px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:8px;font-size:12px;}th{background:#eee;}</style></head><body><h1>${companyName} - Dispatch Report</h1><p>${branchName} | ${periodText} | Printed: ${currentDate}</p><table><thead><tr><th>Date</th><th>Order ID</th><th>Customer</th><th>Phone</th><th>Status</th><th>Weight</th><th>Branch</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`);
    cw.document.close();
    printFrame.onload = () => { cw.print(); setTimeout(() => document.body.removeChild(printFrame), 1000); };
  };

  const handleExportExcel = () => {
    const exportData = filteredOrders.map((order) => ({
      Date: order.date || 'N/A', OrderID: order.orderId || 'N/A',
      CustomerName: order.companyName || 'N/A', Phone: order.customer?.phone1 || 'N/A',
      Status: order.status === 'completed' ? 'Ready for Dispatch' : order.status || 'N/A',
      Weight: order.materialWeight || 'N/A', Branch: order.branch?.name || 'N/A',
      Notes: order.Notes || ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dispatch_Orders");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `Dispatch_${fromDate || 'all'}_to_${toDate || 'all'}_${Date.now()}.xlsx`);
  };

  const handlePrintAddressLabels = () => {
    const addressLabels = filteredOrders.map((order) => {
      const c = (order.customer || {}) as any;
      return `<div class="address-label"><div class="label-header"><strong>FROM:</strong><br>${companyName}<br>${branchName}</div><div class="to-section"><strong>TO:</strong><br><strong>${order.companyName || 'Unknown'}</strong><br>${c.address1 || ''}<br>${c.state || ''} ${c.pinCode || ''}<br>${c.phone1 || ''}</div><div class="label-footer"><span>Order: ${order.orderId}</span><span>${order.date || ''}</span></div></div>`;
    }).join('');
    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);
    const cw = printFrame.contentWindow;
    if (!cw) return;
    cw.document.open();
    cw.document.write(`<html><head><title>Address Labels</title><style>body{font-family:Arial;font-size:10px;}.labels-container{display:grid;grid-template-columns:repeat(2,1fr);gap:5mm;}.address-label{border:1px solid #333;padding:8px;height:55mm;display:flex;flex-direction:column;justify-content:space-between;page-break-inside:avoid;}.label-header{border-bottom:1px dashed #999;padding-bottom:5px;margin-bottom:5px;font-size:9px;}.to-section{flex:1;padding:5px 0;}.label-footer{border-top:1px dashed #999;padding-top:5px;display:flex;justify-content:space-between;font-size:8px;}</style></head><body><div class="labels-container">${addressLabels}</div></body></html>`);
    cw.document.close();
    printFrame.onload = () => { cw.print(); setTimeout(() => document.body.removeChild(printFrame), 1000); };
  };

  const handlePrintSingleAddress = (order: Order) => {
    const c = (order.customer || {}) as any;
    const customerName = order.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown';
    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);
    const cw = printFrame.contentWindow;
    if (!cw) return;
    cw.document.open();
    cw.document.write(`<html><head><title>Shipping Label - ${order.orderId}</title><style>body{font-family:Arial;font-size:12px;}.shipping-label{border:2px solid #000;padding:10px;}.header{text-align:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:10px;}.from-section{background:#f5f5f5;padding:8px;margin-bottom:10px;}.to-section{padding:10px;border:2px solid #000;min-height:60mm;}.name{font-size:16px;font-weight:bold;margin-bottom:8px;}.footer{margin-top:10px;padding-top:8px;border-top:1px dashed #999;display:flex;justify-content:space-between;font-size:10px;}</style></head><body><div class="shipping-label"><div class="header"><h1>SHIPPING LABEL</h1></div><div class="from-section"><strong>FROM:</strong><br>${companyName}<br>${branchName}</div><div class="to-section"><strong>SHIP TO:</strong><br><div class="name">${customerName}</div>${c.address1 || ''}<br>${c.state || ''} ${c.pinCode || ''}<br>${c.phone1 ? `Phone: ${c.phone1}` : ''}</div><div class="footer"><span>Order: ${order.orderId}</span><span>Date: ${order.date || new Date().toLocaleDateString()}</span></div></div></body></html>`);
    cw.document.close();
    printFrame.onload = () => { cw.print(); setTimeout(() => document.body.removeChild(printFrame), 1000); };
  };

  return (
    <div className="all-orders-page">
      {/* Header */}
      <div className="all-orders-header">
        <div className="all-orders-header__left">
          <BackButton />
          <h1 className="all-orders-title">Dispatch</h1>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', padding: '4px 10px', borderRadius: '12px', backgroundColor: wsConnected ? '#dcfce7' : '#fef2f2', fontSize: '12px', fontWeight: 500 }}
            title={wsConnected ? 'Real-time updates active' : 'Not connected'}>
            {wsConnected
              ? <><SignalIcon style={{ width: '14px', height: '14px', color: '#16a34a' }} /><span style={{ color: '#16a34a' }}>Live</span></>
              : <><SignalSlashIcon style={{ width: '14px', height: '14px', color: '#dc2626' }} /><span style={{ color: '#dc2626' }}>Offline</span></>}
          </div>
        </div>
        <div className="all-orders-header__actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {selectedOrders.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#e0e7ff', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600, color: '#4338ca', fontSize: '12px' }}>{selectedOrders.size} selected</span>
              <button onClick={handlePrintSelectedLabels} style={{ width: '32px', height: '32px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Print Labels">
                <PrinterIcon style={{ width: '18px', height: '18px' }} />
              </button>
              <button onClick={clearSelections} style={{ width: '32px', height: '32px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Clear Selection">
                <XMarkIcon style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          )}
          <button style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#10b981', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={selectAllOrders} disabled={loading || filteredOrders.length === 0} title="Select All">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </button>
          <button style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowExcelExportSelector(true)} disabled={loading} title="Export to Excel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#8b5cf6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handlePrint} disabled={loading} title="Print Report">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          </button>
          <button style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#ec4899', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handlePrintAddressLabels} disabled={loading || filteredOrders.length === 0} title="Print Address Labels">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          </button>
          <button style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#f59e0b', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleRefresh} disabled={loading} title="Refresh">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
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
          <div className="summary-card__value">{filteredOrders.filter((o) => o.status === 'completed' || o.status === 'ready-for-dispatch').length}</div>
          <div className="summary-card__label">Ready</div>
        </div>
        <div className="summary-card summary-card--mini summary-card--dispatched">
          <div className="summary-card__value">{filteredOrders.filter((o) => o.status === 'dispatched').length}</div>
          <div className="summary-card__label">Dispatched</div>
        </div>
      </div>

      {loading && <div className="loading-state"><p>Loading dispatch orders...</p></div>}
      {error && <div className="error-state"><p className="error-message">Error: {error}</p></div>}
      {!loading && filteredOrders.length === 0 && <div className="empty-state"><p>No dispatch orders found for the selected criteria.</p></div>}

      {!loading && filteredOrders.length > 0 && (
        <>
          <div className="orders-table-container" ref={contentRef} tabIndex={0} onKeyDown={handleKeyNavigation} onClick={() => contentRef.current?.focus()} style={{ outline: 'none' }}>
            <table className="orders-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input type="checkbox" checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0} onChange={(e) => e.target.checked ? selectAllOrders() : clearSelections()} title="Select all" />
                  </th>
                  <th style={{ width: '50px' }}>No</th>

                  {/* Created - Date Filter */}
                  <th className={`filter-header ${fromDate || toDate ? 'has-filter' : ''}`} style={{ width: '100px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('created', e)}>
                      <span>Created</span>
                      <span className="filter-icon">{fromDate || toDate ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'created' && dropdownPosition && (
                      <div className="header-dropdown header-dropdown--fixed"
                        style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, zIndex: 99999 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="dropdown-title">Filter by Date</div>
                        <div className="dropdown-item"><label>From:</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
                        <div className="dropdown-item"><label>To:</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
                        <div className="dropdown-actions">
                          <button onClick={() => { setFromDate(''); setToDate(''); }}>Clear</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Order ID - Search Filter */}
                  <th className={`filter-header ${searchTerm ? 'has-filter' : ''}`} style={{ width: '120px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('orderId', e)}>
                      <span>Order ID</span>
                      <span className="filter-icon">{searchTerm ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'orderId' && dropdownPosition && (
                      <div className="header-dropdown header-dropdown--fixed"
                        style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, zIndex: 99999 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="dropdown-title">Search</div>
                        <div className="dropdown-item"><input type="text" placeholder="Search Order ID, Company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus /></div>
                        <div className="dropdown-actions">
                          <button onClick={() => setSearchTerm('')}>Clear</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Company - Search Filter */}
                  <th className={`filter-header ${searchTerm ? 'has-filter' : ''}`}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('company', e)}>
                      <span>Company</span>
                      <span className="filter-icon">{searchTerm ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'company' && dropdownPosition && (
                      <div className="header-dropdown header-dropdown--fixed"
                        style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, zIndex: 99999 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="dropdown-title">Search Company</div>
                        <div className="dropdown-item"><input type="text" placeholder="Search company name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus /></div>
                        <div className="dropdown-actions">
                          <button onClick={() => setSearchTerm('')}>Clear</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Order Status */}
                  <th className={`filter-header ${statusFilters.length > 0 ? 'has-filter' : ''}`} style={{ width: '140px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('status', e)}>
                      <span>Order Status {statusFilters.length > 0 && `(${statusFilters.length})`}</span>
                      <span className="filter-icon">{statusFilters.length > 0 ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'status' && dropdownPosition && (
                      <div className="header-dropdown header-dropdown--fixed"
                        style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, zIndex: 99999 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="dropdown-title">Filter by Status</div>
                        <div className="dropdown-options">
                          {[{ value: 'completed', label: 'Completed (Ready for Dispatch)' }, { value: 'dispatched', label: 'Dispatched' }].map((s) => (
                            <div key={s.value} className={`dropdown-option ${statusFilters.includes(s.value) ? 'selected' : ''}`} onClick={() => toggleFilterValue(statusFilters, s.value, setStatusFilters)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input type="checkbox" checked={statusFilters.includes(s.value)} onChange={() => {}} onClick={(e) => e.stopPropagation()} style={{ width: '16px', height: '16px' }} />
                              <span>{s.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => setStatusFilters([])}>Clear All</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Priority */}
                  <th className={`filter-header ${priorityFilters.length > 0 ? 'has-filter' : ''}`} style={{ width: '100px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('priority', e)}>
                      <span>Priority {priorityFilters.length > 0 && `(${priorityFilters.length})`}</span>
                      <span className="filter-icon">{priorityFilters.length > 0 ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'priority' && dropdownPosition && (
                      <div className="header-dropdown header-dropdown--fixed"
                        style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, zIndex: 99999 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="dropdown-title">Filter by Priority</div>
                        <div className="dropdown-options">
                          {[{ value: 'urgent', label: 'Urgent' }, { value: 'high', label: 'High' }, { value: 'normal', label: 'Normal' }, { value: 'low', label: 'Low' }].map((p) => (
                            <div key={p.value} className={`dropdown-option ${priorityFilters.includes(p.value) ? 'selected' : ''}`} onClick={() => toggleFilterValue(priorityFilters, p.value, setPriorityFilters)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input type="checkbox" checked={priorityFilters.includes(p.value)} onChange={() => {}} onClick={(e) => e.stopPropagation()} style={{ width: '16px', height: '16px' }} />
                              <span>{p.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => setPriorityFilters([])}>Clear All</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Order Type */}
                  <th className={`filter-header ${orderTypeFilters.length > 0 ? 'has-filter' : ''}`} style={{ width: '150px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('orderType', e)}>
                      <span>Order Type {orderTypeFilters.length > 0 && `(${orderTypeFilters.length})`}</span>
                      <span className="filter-icon">{orderTypeFilters.length > 0 ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'orderType' && dropdownPosition && (
                      <div className="header-dropdown header-dropdown--fixed"
                        style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, zIndex: 99999 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="dropdown-title">Filter by Order Type</div>
                        <div className="dropdown-options">
                          {Array.isArray(orderTypes) && orderTypes.map((type: any) => (
                            <div key={type._id} className={`dropdown-option ${orderTypeFilters.includes(type._id) ? 'selected' : ''}`} onClick={() => toggleFilterValue(orderTypeFilters, type._id, setOrderTypeFilters)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input type="checkbox" checked={orderTypeFilters.includes(type._id)} onChange={() => {}} onClick={(e) => e.stopPropagation()} style={{ width: '16px', height: '16px' }} />
                              <span>{type.typeName}</span>
                            </div>
                          ))}
                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => setOrderTypeFilters([])}>Clear All</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                    )}
                  </th>

                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const isSelected = selectedOrders.has(order._id);
                  return (
                    <tr key={order._id || index} ref={(el) => ordersRef.current[index] = el as any}
                      className={`clickable-row ${selectedOrderIndex === index ? 'row-expanded' : ''} ${isSelected ? 'row-selected' : ''}`}
                      onClick={() => handleOrderClick(order)}
                      style={isSelected ? { backgroundColor: '#dbeafe' } : undefined}>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOrderSelection(order._id)} onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 500 }}>{index + 1}</td>
                      <td className="date-cell">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="order-id-cell">{order.orderId || 'N/A'}</td>
                      <td style={{ fontWeight: 500 }}>{order.companyName || 'N/A'}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status || '') }}>
                          {order.status === 'completed' ? 'Ready' : order.status?.replace(/_/g, ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className="priority-badge" style={{ backgroundColor: getPriorityBadgeColor(order.priority || 'normal') }}>
                          {order.priority || 'normal'}
                        </span>
                      </td>
                      <td>
                        {order.orderTypeName
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 8px', background: `${order.orderTypeColor || '#374151'}15`, borderRadius: '4px', border: `1px solid ${order.orderTypeColor || '#374151'}30` }}>
                              <span style={{ fontWeight: 600, color: order.orderTypeColor || '#374151' }}>{order.orderTypeName}</span>
                              {order.orderTypeCode && <span style={{ color: order.orderTypeColor || '#374151', fontSize: '10px', opacity: 0.7 }}>({order.orderTypeCode})</span>}
                            </span>
                          : <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <button onClick={(e) => { e.stopPropagation(); handleOpenDispatchModal(order); }}
                            style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#FF6B35', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {order.status === 'completed' ? 'Dispatch' : 'View'}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handlePrintSingleAddress(order); }}
                            style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Print shipping label">
                            <Tag size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1 || loading} className="pagination-btn">
              <ChevronLeftIcon style={{ width: '16px', height: '16px' }} /> Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {pagination?.totalPages || Math.ceil(filteredOrders.length / limit) || 1} | {filteredOrders.length} of {pagination?.total || filteredOrders.length} orders
            </span>
            <button onClick={() => setCurrentPage((prev) => Math.min(pagination?.totalPages || 1, prev + 1))} disabled={currentPage === (pagination?.totalPages || 1) || loading} className="pagination-btn">
              Next <ChevronRightIcon style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </>
      )}

      {/* Excel Export Selector */}
      <ExcelExportSelector
        isOpen={showExcelExportSelector}
        onClose={() => setShowExcelExportSelector(false)}
        orders={filteredOrders}
        defaultFilename={`Dispatch_${fromDate || 'all'}_to_${toDate || 'all'}`}
        onExport={(data, filename) => {}} />

      {/* Dispatch Status Update Modal */}
      {showDispatchModal && selectedOrderForDispatch && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '384px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Update Dispatch Status</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Order: <strong>{selectedOrderForDispatch.orderId}</strong><br />
              Customer: <strong>{selectedOrderForDispatch.companyName}</strong>
            </p>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Dispatch Status:</label>
              <select value={newDispatchStatus} onChange={(e) => setNewDispatchStatus(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff', color: '#000' }}>
                <option value="completed">Completed (Ready for Dispatch)</option>
                <option value="dispatched">Dispatched</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Tracking Number:</label>
              <input type="text" value={newTrackingNumber} onChange={(e) => setNewTrackingNumber(e.target.value)} placeholder="Enter tracking number" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff', color: '#000', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Carrier:</label>
              <input type="text" value={newCarrier} onChange={(e) => setNewCarrier(e.target.value)} placeholder="e.g., FedEx, DHL, BlueDart" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff', color: '#000', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Delivery Date:</label>
              <input type="date" value={newDeliveryDate} onChange={(e) => setNewDeliveryDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff', color: '#000', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Notes:</label>
              <textarea value={dispatchNotes} onChange={(e) => setDispatchNotes(e.target.value)} placeholder="Add any dispatch notes..." style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff', color: '#000', minHeight: '60px', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={handleCloseDispatchModal} disabled={isUpdating} style={{ padding: '8px 16px', backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUpdateDispatchStatus} disabled={isUpdating} style={{ padding: '8px 16px', backgroundColor: '#FF6B35', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIX: Loading overlay while fetching full order details (same as DayBook) */}
      {editLoading && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 150
        }}>
          <div style={{
            backgroundColor: 'white', padding: '24px 32px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '24px', height: '24px',
              border: '3px solid #e2e8f0', borderTop: '3px solid #FF6B35',
              borderRadius: '50%', animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>
              Loading order for editing...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}