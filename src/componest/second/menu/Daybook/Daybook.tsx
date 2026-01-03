
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../../../allCompones/BackButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../Dispatch/Dispatch.css";
import "../Oders/indexAllOders.css";
import { fetchOrders } from "../../../redux/oders/OdersActions";
import { RootState } from "../../../../store";
import { useFormDataCache } from "../Edit/hooks/useFormDataCache";
import { useDaybookUpdates, useWebSocketStatus } from "../../../../hooks/useWebSocket";
import { ArrowDownTrayIcon, PrinterIcon, ArrowPathIcon, CheckCircleIcon, XMarkIcon, SignalIcon, SignalSlashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { crudAPI } from "../../../../utils/crudHelpers";


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
  status?: string | string[]; // ✅ Support both single and array for multi-select
  startDate?: string;
  endDate?: string;
  search?: string;
  orderTypeId?: string | string[]; // ✅ Support both single and array for multi-select
  priority?: string | string[]; // ✅ ADDED: Priority filter (can be array)
  createdBy?: string | string[]; // ✅ ADDED: Created by filter (can be array)
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
  const location = useLocation();
  const dispatch = useDispatch();

  // State declarations
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set()); // Multi-select for printing

  // Date state - empty by default (no filter)
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Reset page when date changes (for server-side filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

  // ✅ UPDATED: Multi-select filters (arrays instead of single values)
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [orderTypeFilters, setOrderTypeFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [createdByFilters, setCreatedByFilters] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50); // ✅ Load 50 orders per page for performance
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ✅ ADDED: Force refresh trigger

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Dropdown filter state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number;left: number;} | null>(null);

  // Bulk update state
  const [showBulkDropdown, setShowBulkDropdown] = useState<'status' | 'priority' | 'orderType' | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

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

  // ✅ WebSocket status for real-time indicator
  const { isConnected: wsConnected, status: wsStatus } = useWebSocketStatus();

  // Company info
  const companyName = authState?.user?.companyName || "ABC Company";
  const branchName = authState?.user?.branchName || "Main Branch";
  const selectedBranch = useSelector((state: RootState) => state.auth.userData?.selectedBranch);
  const branchId = selectedBranch || authState?.user?.branchId || localStorage.getItem('selectedBranch') || null; // ✅ For WebSocket subscription

  // ✅ Listen for branch changes and refresh daybook
  useEffect(() => {
    if (selectedBranch) {
      console.log('🔄 Daybook refreshing for new branch:', selectedBranch);
      // Reset filters
      setSearchTerm('');
      setStatusFilters([]);
      setOrderTypeFilters([]);
      setFromDate('');
      setToDate('');
      setCurrentPage(1);
      // Fetch fresh data
      dispatch(fetchOrders({}) as any);
    }
  }, [selectedBranch, dispatch]);

  // Status color mapping - matches backend overallStatus enum values
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'in_progress': '#FF6B35', // Backend uses underscore
      'in-progress': '#FF6B35', // Keep for compatibility
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'on-hold': '#6b7280',
      'Wait for Approval': '#f59e0b',
      'approved': '#3b82f6', // Blue for approved
      'dispatched': '#8b5cf6', // Purple for dispatched
      'issue': '#ef4444', // Red for issue
      'unknown': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  function getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'pending': 'Order received and awaiting processing',
      'in_progress': 'Order is being processed', // Backend uses underscore
      'in-progress': 'Order is being processed', // Keep for compatibility
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
  const transformedOrders: Order[] = Array.isArray(reduxOrders) ? reduxOrders.map((order, idx) => {
    // Handle deleted customers - show indicator
    const isDeletedCustomer = (order.customer as any)?.isDeleted === true;
    const customerName = isDeletedCustomer ?
    '(Deleted Customer)' :
    order.customer?.companyName || order.customer?.firstName || 'Unknown Customer';
    const customerPhone = order.customer?.phone1 || '';
    const orderStatus = order.overallStatus || 'unknown';

    // Get order type - handle both populated object and ID reference
    // Backend returns orderType object with typeName, typeCode, color, category
    // Fallback: look up from cached orderTypes if not populated
    let orderTypeObj = order.orderType;
    if (!orderTypeObj && order.orderTypeId) {
      // Fallback: find order type from cached orderTypes
      const orderTypeId = typeof order.orderTypeId === 'object' ? (order.orderTypeId as any)?._id : order.orderTypeId;
      orderTypeObj = orderTypes.find((ot: any) => ot._id === orderTypeId);
    }
    const orderTypeName = orderTypeObj?.typeName || orderTypeObj?.name || '';
    const orderTypeCode = orderTypeObj?.typeCode || orderTypeObj?.code || '';
    const orderTypeColor = orderTypeObj?.color || '';
    const priority = order.priority || 'normal';

    // Debug log first few orders
    if (idx < 2) {








    }

    return {
      ...order,
      id: order._id,
      companyName: customerName,
      name: customerName,
      phone: customerPhone,
      status: orderStatus,
      priority: priority,
      orderType: orderTypeObj,
      orderTypeName: orderTypeName,
      orderTypeCode: orderTypeCode,
      orderTypeColor: orderTypeColor,
      date: new Date(order.createdAt).toISOString().split('T')[0],
      AllStatus: {
        [orderStatus]: {
          color: getStatusColor(orderStatus),
          description: getStatusDescription(orderStatus)
        }
      }
    };
  }) : [];


  // ✅ SIMPLIFIED: All filtering now handled by API server-side for maximum performance
  // Client just receives pre-filtered data from API
  const filteredOrdersUnsorted = transformedOrders;


  // Sort orders
  const filteredOrders = [...filteredOrdersUnsorted].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'createdAt':
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
        break;
      case 'orderId':
        aValue = a.orderId?.toLowerCase() || '';
        bValue = b.orderId?.toLowerCase() || '';
        break;
      case 'companyName':
        aValue = a.companyName?.toLowerCase() || '';
        bValue = b.companyName?.toLowerCase() || '';
        break;
      case 'createdBy':
        aValue = ((a as any).createdByName || (a as any).creator?.username || '').toLowerCase();
        bValue = ((b as any).createdByName || (b as any).creator?.username || '').toLowerCase();
        break;
      case 'status':
        aValue = a.status?.toLowerCase() || '';
        bValue = b.status?.toLowerCase() || '';
        break;
      case 'priority':
        const priorityOrder: Record<string, number> = { 'urgent': 0, 'high': 1, 'normal': 2, 'low': 3 };
        aValue = priorityOrder[(a as any).priority || 'normal'] ?? 2;
        bValue = priorityOrder[(b as any).priority || 'normal'] ?? 2;
        break;
      case 'orderType':
        aValue = ((a as any).orderTypeName || '').toLowerCase();
        bValue = ((b as any).orderTypeName || '').toLowerCase();
        break;
      default:
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle column sort click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Fetch orders helper - ✅ ALL Server-side filtering for maximum performance
  const fetchOrdersData = useCallback(() => {
    const filters: OrderFilters = {
      page: currentPage,
      limit: 50, // ✅ Load only 50 orders per call for performance
      sortBy: sortColumn,
      sortOrder: sortDirection
    };

    // ✅ Send ALL filters to API for server-side filtering
    if (fromDate) filters.startDate = fromDate;
    if (toDate) filters.endDate = toDate;
    if (searchTerm) filters.search = searchTerm;

    // ✅ Debug: Log date filters being sent
    if (fromDate || toDate) {
      console.log('📅 Daybook date filters:', { fromDate, toDate, startDate: filters.startDate, endDate: filters.endDate });
    }

    // ✅ Send multi-select filters as arrays to API
    if (statusFilters.length > 0) {
      filters.status = statusFilters.length === 1 ? statusFilters[0] : statusFilters;
    }
    if (orderTypeFilters.length > 0) {
      filters.orderTypeId = orderTypeFilters.length === 1 ? orderTypeFilters[0] : orderTypeFilters;
    }
    if (priorityFilters.length > 0) {
      filters.priority = priorityFilters.length === 1 ? priorityFilters[0] : priorityFilters;
    }
    if (createdByFilters.length > 0) {
      filters.createdBy = createdByFilters.length === 1 ? createdByFilters[0] : createdByFilters;
    }

    if (typeof fetchOrders === 'function') {
      // ✅ Type cast to 'any' since our local OrderFilters includes new fields (priority, createdBy)
      // that the Redux action type doesn't know about yet, but the API supports them
      dispatch(fetchOrders(filters as any) as any);
    } else {
      console.error('❌ fetchOrders function not available');
    }
  }, [dispatch, currentPage, sortColumn, sortDirection, fromDate, toDate, searchTerm, statusFilters, orderTypeFilters, priorityFilters, createdByFilters]);

  // FIXED: Enhanced handleOrderClick with complete order data structure
  const handleOrderClick = (order: Order) => {


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
        name: order.customer?.firstName && order.customer?.lastName ?
        `${order.customer.firstName} ${order.customer.lastName}`.trim() :
        order.customer?.companyName || order.companyName || '',
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

  // ✅ Effect hooks - Fetch orders when filters change (server-side filtering)
  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData, location.key, refreshTrigger]);

  // ✅ FIXED: Check for order updates on mount and navigation (using state trigger to avoid stale closures)
  useEffect(() => {
    const ordersUpdated = sessionStorage.getItem('orders_updated');

    if (ordersUpdated) {

      sessionStorage.removeItem('orders_updated');
      // Use state to trigger refetch (avoids stale closure issues)
      setRefreshTrigger((prev) => prev + 1);
    }
  }, []); // Run on mount

  // ✅ FIXED: Also check on any location change (for navigate(-1) back button)
  useEffect(() => {
    const ordersUpdated = sessionStorage.getItem('orders_updated');

    if (ordersUpdated) {

      sessionStorage.removeItem('orders_updated');
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [location]); // Trigger on any location change

  // ✅ WebSocket real-time subscription for instant order updates
  // This receives updates immediately when orders change - no polling needed
  const handleOrderUpdate = useCallback(() => {

    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Subscribe to real-time daybook updates via WebSocket
  useDaybookUpdates(branchId, handleOrderUpdate);

  // ✅ Visibility change listener - refresh when user comes back to page if updates occurred
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ordersUpdated = sessionStorage.getItem('orders_updated');
        if (ordersUpdated) {

          sessionStorage.removeItem('orders_updated');
          setRefreshTrigger((prev) => prev + 1);
        }
      }
    };

    const handleWindowFocus = () => {
      const ordersUpdated = sessionStorage.getItem('orders_updated');
      if (ordersUpdated) {

        sessionStorage.removeItem('orders_updated');
        setRefreshTrigger((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown && !(e.target as HTMLElement).closest('.filter-header')) {
        setOpenDropdown(null);
      }
      // Close bulk dropdown when clicking outside
      if (showBulkDropdown && !(e.target as HTMLElement).closest('[data-bulk-dropdown]')) {
        setShowBulkDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown, showBulkDropdown]);

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
        block: "nearest"
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

  const handleRefresh = () => {

    fetchOrdersData();
  };

  const handleClearFilters = () => {
    // ✅ FIXED: Clear ALL filters including dates to show all orders
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setStatusFilters([]);
    setOrderTypeFilters([]);
    setPriorityFilters([]);
    setCreatedByFilters([]);
    setCurrentPage(1);
    setOpenDropdown(null);
  };

  // Toggle dropdown with position calculation
  const toggleDropdown = (column: string, event?: React.MouseEvent<HTMLDivElement>) => {
    if (openDropdown === column) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      setOpenDropdown(column);

      // Calculate dropdown position
      if (event) {
        const target = event.currentTarget;
        const rect = target.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
      }
    }
  };

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if any filter is active
  // ✅ UPDATED: Empty date filters are not considered active
  const hasActiveFilters = fromDate !== '' || toDate !== '' || searchTerm !== '' || statusFilters.length > 0 || orderTypeFilters.length > 0 || priorityFilters.length > 0 || createdByFilters.length > 0;

  // Get unique creators from orders for filter dropdown
  const uniqueCreators = [...new Set(transformedOrders.map((o) =>
  (o as any).createdByName || (o as any).creator?.username || ''
  ).filter(Boolean))];

  // ✅ Multi-select toggle helpers
  const toggleFilterValue = (currentFilters: string[], value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentFilters.includes(value)) {
      setter(currentFilters.filter((f) => f !== value));
    } else {
      setter([...currentFilters, value]);
    }
    setCurrentPage(1);
  };

  const handleKeyNavigation = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (filteredOrders.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
      case "Tab":
        if (!e.shiftKey) {
          e.preventDefault();
          setSelectedOrderIndex((prev) => (prev + 1) % filteredOrders.length);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedOrderIndex((prev) => (prev - 1 + filteredOrders.length) % filteredOrders.length);
        break;
      case "Enter":
        handleOrderClick(filteredOrders[selectedOrderIndex]);
        break;
      case " ": // Space key - toggle selection
        e.preventDefault();
        const currentOrder = filteredOrders[selectedOrderIndex];
        if (currentOrder?._id) {
          setSelectedOrders((prev) => {
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
      setSelectedOrderIndex((prev) => (prev - 1 + filteredOrders.length) % filteredOrders.length);
    }
  };

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
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
    const allIds = filteredOrders.map((o) => o._id);
    setSelectedOrders(new Set(allIds));
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedOrders(new Set());
    setShowBulkDropdown(null);
  };

  // Bulk update for selected orders (status, priority, orderType)
  const handleBulkUpdate = async (updateType: 'status' | 'priority' | 'orderType', value: string, label: string) => {
    if (selectedOrders.size === 0) {
      alert('Please select orders to update');
      return;
    }

    const typeLabels: Record<string, string> = {
      status: 'Status',
      priority: 'Priority',
      orderType: 'Order Type'
    };

    const confirmMessage = `Update ${selectedOrders.size} order(s) ${typeLabels[updateType]} to "${label}"?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setBulkUpdating(true);
    setShowBulkDropdown(null);

    try {
      const orderIds = Array.from(selectedOrders);
      let successCount = 0;
      let failCount = 0;

      // Update each order
      for (const orderId of orderIds) {
        try {
          if (updateType === 'status') {
            await crudAPI.update(`/orders/${orderId}/status`, { status: value });
          } else if (updateType === 'priority') {
            await crudAPI.update(`/orders/${orderId}`, { priority: value });
          } else if (updateType === 'orderType') {
            await crudAPI.update(`/orders/${orderId}`, { orderTypeId: value });
          }
          successCount++;
        } catch (err) {

          failCount++;
        }
      }

      // Show result
      if (failCount === 0) {
        alert(`Updated ${successCount} order(s) ${typeLabels[updateType]} to "${label}"`);
      } else {
        alert(`Updated ${successCount} order(s). Failed: ${failCount}`);
      }

      // Clear selection and refresh
      setSelectedOrders(new Set());
      setRefreshTrigger((prev) => prev + 1);

    } catch (error) {

      alert('Failed to update orders. Please try again.');
    } finally {
      setBulkUpdating(false);
    }
  };

  // Print labels for selected orders (using iframe - no new window)
  const handlePrintSelectedLabels = () => {
    if (selectedOrders.size === 0) {
      alert('Please select orders to print labels');
      return;
    }

    const ordersToprint = filteredOrders.filter((o) => selectedOrders.has(o._id));

    const labelContent = ordersToprint.map((order) => `
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
    fromDate && toDate ?
    `Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}` :
    fromDate ?
    `From: ${new Date(fromDate).toLocaleDateString()}` :
    toDate ?
    `To: ${new Date(toDate).toLocaleDateString()}` :
    "All Records";

    const tableRows = filteredOrders.
    map(
      (order) => `
        <tr>
          <td>${order.date || 'N/A'}</td>
          <td>${order.orderId || 'N/A'}</td>
          <td>${order.companyName || 'N/A'}</td>
          <td>${order.customer?.phone1 || 'N/A'}</td>
          <td>${order.status || 'N/A'}</td>
          <td>${order.materialWeight || 'N/A'}</td>
          <td>${order.branch?.name || 'N/A'}</td>
        </tr>`
    ).
    join("");

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
    const exportData = filteredOrders.map((order) => ({
      Date: order.date || 'N/A',
      OrderID: order.orderId || 'N/A',
      CustomerName: order.companyName || 'N/A',
      Phone: order.customer?.phone1 || 'N/A',
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
          {/* WebSocket Status Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '12px',
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: wsConnected ? '#dcfce7' : '#fef2f2',
              fontSize: '12px',
              fontWeight: 500
            }}
            title={wsConnected ? 'Real-time updates active' : 'Not connected - updates require manual refresh'}>

            {wsConnected ?
            <>
                <SignalIcon style={{ width: '14px', height: '14px', color: '#16a34a' }} />
                <span style={{ color: '#16a34a' }}>Live</span>
              </> :

            <>
                <SignalSlashIcon style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                <span style={{ color: '#dc2626' }}>Offline</span>
              </>
            }
          </div>
          {/* Clear Filters Button - show when any filter is active */}
          {hasActiveFilters &&
          <button
            onClick={handleClearFilters}
            style={{
              padding: '6px 12px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '12px'
            }}
            title="Clear all filters">

              <XMarkIcon style={{ width: '14px', height: '14px' }} />
              Clear
            </button>
          }
        </div>
        <div className="all-orders-header__actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          {/* Selection Controls with Bulk Actions */}
          {selectedOrders.size > 0 &&
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#4338ca', fontSize: '12px' }}>{selectedOrders.size} selected</span>

              {/* Bulk Status Update */}
              <div style={{ position: 'relative' }} data-bulk-dropdown>
                <button
                onClick={() => setShowBulkDropdown(showBulkDropdown === 'status' ? null : 'status')}
                disabled={bulkUpdating}
                style={{
                  padding: '5px 10px',
                  backgroundColor: showBulkDropdown === 'status' ? '#059669' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: bulkUpdating ? 'wait' : 'pointer',
                  fontSize: '11px',
                  fontWeight: 500
                }}>

                  Status ▼
                </button>
                {showBulkDropdown === 'status' &&
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, minWidth: '160px' }}>
                    <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>SET STATUS</div>
                    {[
                { value: 'Wait for Approval', label: 'Wait for Approval', color: '#f59e0b' },
                { value: 'pending', label: 'Pending', color: '#eab308' },
                { value: 'approved', label: 'Approved', color: '#8b5cf6' },
                { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
                { value: 'completed', label: 'Completed', color: '#10b981' },
                { value: 'dispatched', label: 'Dispatched', color: '#06b6d4' },
                { value: 'cancelled', label: 'Cancelled', color: '#6b7280' },
                { value: 'issue', label: 'Issue', color: '#ef4444' }].
                map((s) =>
                <div key={s.value} onClick={() => handleBulkUpdate('status', s.value, s.label)} style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                        {s.label}
                      </div>
                )}
                  </div>
              }
              </div>

              {/* Bulk Priority Update */}
              <div style={{ position: 'relative' }} data-bulk-dropdown>
                <button
                onClick={() => setShowBulkDropdown(showBulkDropdown === 'priority' ? null : 'priority')}
                disabled={bulkUpdating}
                style={{
                  padding: '5px 10px',
                  backgroundColor: showBulkDropdown === 'priority' ? '#c2410c' : '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: bulkUpdating ? 'wait' : 'pointer',
                  fontSize: '11px',
                  fontWeight: 500
                }}>

                  Priority ▼
                </button>
                {showBulkDropdown === 'priority' &&
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, minWidth: '140px' }}>
                    <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>SET PRIORITY</div>
                    {[
                { value: 'urgent', label: 'Urgent', color: '#ef4444' },
                { value: 'high', label: 'High', color: '#f97316' },
                { value: 'normal', label: 'Normal', color: '#3b82f6' },
                { value: 'low', label: 'Low', color: '#6b7280' }].
                map((p) =>
                <div key={p.value} onClick={() => handleBulkUpdate('priority', p.value, p.label)} style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color }} />
                        {p.label}
                      </div>
                )}
                  </div>
              }
              </div>

              {/* Bulk Order Type Update */}
              <div style={{ position: 'relative' }} data-bulk-dropdown>
                <button
                onClick={() => setShowBulkDropdown(showBulkDropdown === 'orderType' ? null : 'orderType')}
                disabled={bulkUpdating}
                style={{
                  padding: '5px 10px',
                  backgroundColor: showBulkDropdown === 'orderType' ? '#4338ca' : '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: bulkUpdating ? 'wait' : 'pointer',
                  fontSize: '11px',
                  fontWeight: 500
                }}>

                  Type ▼
                </button>
                {showBulkDropdown === 'orderType' &&
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, minWidth: '160px', maxHeight: '200px', overflowY: 'auto' }}>
                    <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>SET ORDER TYPE</div>
                    {Array.isArray(orderTypes) && orderTypes.map((t: any) =>
                <div key={t._id} onClick={() => handleBulkUpdate('orderType', t._id, t.typeName)} style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: t.color || '#6366f1' }} />
                        {t.typeName}
                      </div>
                )}
                  </div>
              }
              </div>

              {/* Print Labels */}
              <button onClick={handlePrintSelectedLabels} style={{ width: '28px', height: '28px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Print Labels">
                <PrinterIcon style={{ width: '14px', height: '14px' }} />
              </button>

              {/* Clear Selection */}
              <button onClick={clearSelections} style={{ width: '28px', height: '28px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Clear Selection">
                <XMarkIcon style={{ width: '14px', height: '14px' }} />
              </button>

              {bulkUpdating && <span style={{ fontSize: '11px', color: '#64748b' }}>Updating...</span>}
            </div>
          }
          <button
            style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#10b981', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={selectAllOrders}
            disabled={loading || filteredOrders.length === 0}
            title="Select All Orders">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </button>
          <button
            style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleExportExcel}
            disabled={loading}
            title="Export to Excel">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#8b5cf6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handlePrint}
            disabled={loading}
            title="Print Report">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </button>
          <button
            style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#f59e0b', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh Orders">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'loading-spinner' : ''}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary Cards - Status counts */}
      {statusCounts &&
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
              </div>);

        })}
        </div>
      }

      {/* Orders table */}
      <div ref={contentRef}>
        {loading &&
        <div className="loading-state">
            <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }}></div>
            <p>Loading orders...</p>
          </div>
        }

        {error &&
        <div className="error-state">
            <span className="error-icon" style={{ fontSize: '48px' }}>⚠️</span>
            <p className="error-message">Error: {error}</p>
            <button className="retry-btn" onClick={handleRefresh}>
              🔄 Retry
            </button>
          </div>
        }

        {!loading && !error && filteredOrders.length === 0 &&
        <div className="empty-state">
            <span style={{ fontSize: '48px' }}>📋</span>
            <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No orders found</p>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Try adjusting your filters or navigate to a different page</p>
            <button className="filter-reset-btn" onClick={handleClearFilters} style={{ marginTop: '12px' }}>
              Clear All Filters
            </button>
          </div>
        }

        {!loading && filteredOrders.length > 0 &&
        <div
          className="orders-table-container"
          ref={contentRef}
          tabIndex={0}
          onKeyDown={handleKeyNavigation}
          onClick={() => contentRef.current?.focus()}
          style={{ outline: 'none', paddingBottom: '60px' }}>

            <table className="orders-table orders-table--with-filters">
              <thead>
                {/* Header Row with Dropdown Filters */}
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                    type="checkbox"
                    checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                    onChange={(e) => e.target.checked ? selectAllOrders() : clearSelections()}
                    title="Select all" />

                  </th>
                  <th style={{ width: '50px' }}>No</th>

                  {/* Created - Date Filter */}
                  <th className={`filter-header ${fromDate || toDate ? 'has-filter' : ''}`} style={{ width: '120px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('created', e)}>
                      <span>Created</span>
                      <span className="filter-icon">{fromDate || toDate ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'created' && dropdownPosition &&
                  <div
                    className="header-dropdown header-dropdown--fixed"
                    style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                    onClick={(e) => e.stopPropagation()}>

                        <div className="dropdown-title">Filter by Date</div>
                        <div className="dropdown-item">
                          <label>From:</label>
                          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div className="dropdown-item">
                          <label>To:</label>
                          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => {setFromDate('');setToDate('');}}>Clear</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                  }
                  </th>

                  {/* Order ID - Search Filter */}
                  <th className={`filter-header ${searchTerm ? 'has-filter' : ''}`} style={{ width: '120px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('orderId', e)}>
                      <span>Order ID</span>
                      <span className="filter-icon">{searchTerm ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'orderId' && dropdownPosition &&
                  <div
                    className="header-dropdown header-dropdown--fixed"
                    style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                    onClick={(e) => e.stopPropagation()}>

                        <div className="dropdown-title">Search</div>
                        <div className="dropdown-item">
                          <input
                        type="text"
                        placeholder="Search Order ID, Company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus />

                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => setSearchTerm('')}>Clear</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                  }
                  </th>

                  {/* Company - Search Filter */}
                  <th className={`filter-header ${searchTerm ? 'has-filter' : ''}`}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('company', e)}>
                      <span>Company</span>
                      <span className="filter-icon">{searchTerm ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'company' && dropdownPosition &&
                  <div
                    className="header-dropdown header-dropdown--fixed"
                    style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                    onClick={(e) => e.stopPropagation()}>

                        <div className="dropdown-title">Search Company</div>
                        <div className="dropdown-item">
                          <input
                        type="text"
                        placeholder="Search company name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus />

                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => setSearchTerm('')}>Clear</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                  }
                  </th>

                  {/* Created By - Multi-Select Dropdown Filter */}
                  <th className={`filter-header ${createdByFilters.length > 0 ? 'has-filter' : ''}`} style={{ width: '120px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('createdBy', e)}>
                      <span>Created By {createdByFilters.length > 0 && `(${createdByFilters.length})`}</span>
                      <span className="filter-icon">{createdByFilters.length > 0 ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'createdBy' && dropdownPosition &&
                  <div
                    className="header-dropdown header-dropdown--fixed"
                    style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                    onClick={(e) => e.stopPropagation()}>

                        <div className="dropdown-title">Filter by Creator (Multi-Select)</div>
                        <div className="dropdown-options">
                          {uniqueCreators.map((creator) =>
                      <div
                        key={creator}
                        className={`dropdown-option ${createdByFilters.includes(creator) ? 'selected' : ''}`}
                        onClick={() => toggleFilterValue(createdByFilters, creator, setCreatedByFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                              <input
                          type="checkbox"
                          checked={createdByFilters.includes(creator)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }} />

                              <span>{creator}</span>
                            </div>
                      )}
                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => setCreatedByFilters([])}>Clear All</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                  }
                  </th>

                  {/* Order Status - Multi-Select Dropdown Filter */}
                  <th className={`filter-header ${statusFilters.length > 0 ? 'has-filter' : ''}`} style={{ width: '140px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('status', e)}>
                      <span>Order Status {statusFilters.length > 0 && `(${statusFilters.length})`}</span>
                      <span className="filter-icon">{statusFilters.length > 0 ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'status' && dropdownPosition &&
                  <div
                    className="header-dropdown header-dropdown--fixed"
                    style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                    onClick={(e) => e.stopPropagation()}>

                        <div className="dropdown-title">Filter by Status (Multi-Select)</div>
                        <div className="dropdown-options">
                          {[
                      { value: 'Wait for Approval', label: 'Wait for Approval' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'approved', label: 'Approved' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'dispatched', label: 'Dispatched' },
                      { value: 'cancelled', label: 'Cancelled' },
                      { value: 'issue', label: 'Issue' }].
                      map((status) =>
                      <div
                        key={status.value}
                        className={`dropdown-option ${statusFilters.includes(status.value) ? 'selected' : ''}`}
                        onClick={() => toggleFilterValue(statusFilters, status.value, setStatusFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                              <input
                          type="checkbox"
                          checked={statusFilters.includes(status.value)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }} />

                              <span>{status.label}</span>
                            </div>
                      )}
                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => setStatusFilters([])}>Clear All</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                  }
                  </th>

                  {/* Priority - Multi-Select Dropdown Filter */}
                  <th className={`filter-header ${priorityFilters.length > 0 ? 'has-filter' : ''}`} style={{ width: '100px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('priority', e)}>
                      <span>Priority {priorityFilters.length > 0 && `(${priorityFilters.length})`}</span>
                      <span className="filter-icon">{priorityFilters.length > 0 ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'priority' && dropdownPosition &&
                  <div
                    className="header-dropdown header-dropdown--fixed"
                    style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                    onClick={(e) => e.stopPropagation()}>

                        <div className="dropdown-title">Filter by Priority (Multi-Select)</div>
                        <div className="dropdown-options">
                          {[
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'high', label: 'High' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'low', label: 'Low' }].
                      map((priority) =>
                      <div
                        key={priority.value}
                        className={`dropdown-option ${priorityFilters.includes(priority.value) ? 'selected' : ''}`}
                        onClick={() => toggleFilterValue(priorityFilters, priority.value, setPriorityFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                              <input
                          type="checkbox"
                          checked={priorityFilters.includes(priority.value)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }} />

                              <span>{priority.label}</span>
                            </div>
                      )}
                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => setPriorityFilters([])}>Clear All</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                  }
                  </th>

                  {/* Order Type - Multi-Select Dropdown Filter */}
                  <th className={`filter-header ${orderTypeFilters.length > 0 ? 'has-filter' : ''}`} style={{ width: '150px' }}>
                    <div className="header-filter-btn" onClick={(e) => toggleDropdown('orderType', e)}>
                      <span>Order Type {orderTypeFilters.length > 0 && `(${orderTypeFilters.length})`}</span>
                      <span className="filter-icon">{orderTypeFilters.length > 0 ? '✓' : '▼'}</span>
                    </div>
                    {openDropdown === 'orderType' && dropdownPosition &&
                  <div
                    className="header-dropdown header-dropdown--fixed"
                    style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                    onClick={(e) => e.stopPropagation()}>

                        <div className="dropdown-title">Filter by Order Type (Multi-Select)</div>
                        <div className="dropdown-options">
                          {Array.isArray(orderTypes) && orderTypes.map((type: any) =>
                      <div
                        key={type._id}
                        className={`dropdown-option ${orderTypeFilters.includes(type._id) ? 'selected' : ''}`}
                        onClick={() => toggleFilterValue(orderTypeFilters, type._id, setOrderTypeFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                              <input
                          type="checkbox"
                          checked={orderTypeFilters.includes(type._id)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }} />

                              <span>{type.typeName}</span>
                            </div>
                      )}
                        </div>
                        <div className="dropdown-actions">
                          <button onClick={() => setOrderTypeFilters([])}>Clear All</button>
                          <button className="apply-btn" onClick={() => setOpenDropdown(null)}>Apply</button>
                        </div>
                      </div>
                  }
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                const orderType = (order as any).orderType;
                const orderTypeName = (order as any).orderTypeName || orderType?.typeName || '';
                const orderTypeCode = (order as any).orderTypeCode || orderType?.typeCode || '';
                const orderTypeColor = (order as any).orderTypeColor || orderType?.color || '#374151';
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
                    ref={(el) => ordersRef.current[index] = el as any}
                    className={`clickable-row ${selectedOrderIndex === index ? "row-expanded" : ""} ${isSelected ? "row-selected" : ""}`}
                    onClick={() => handleOrderClick(order)}
                    style={isSelected ? { backgroundColor: '#dbeafe' } : undefined}>

                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOrderSelection(order._id)}
                        onClick={(e) => e.stopPropagation()} />

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
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {(order as any).createdByName || (order as any).creator?.username || (order as any).creator?.name || '-'}
                      </td>
                      <td>
                        <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusBadgeColor(order.status || 'pending') }}>

                          {(() => {
                          const status = order.status || 'Unknown';
                          // Format status: replace underscores with spaces and capitalize words
                          return status.
                          replace(/_/g, ' ').
                          split(' ').
                          map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).
                          join(' ');
                        })()}
                        </span>
                      </td>
                      <td>
                        <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityBadgeColor(priority) }}>

                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>
                      </td>
                      <td>
                        {orderTypeName ?
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        padding: '4px 8px',
                        background: `${orderTypeColor}15`,
                        borderRadius: '4px',
                        border: `1px solid ${orderTypeColor}30`
                      }}>
                            {orderType?.icon && <span>{orderType.icon}</span>}
                            <span style={{
                          color: orderTypeColor,
                          fontWeight: 600
                        }}>
                              {orderTypeName}
                            </span>
                            {orderTypeCode &&
                        <span style={{
                          color: orderTypeColor,
                          fontSize: '10px',
                          opacity: 0.7
                        }}>
                                ({orderTypeCode})
                              </span>
                        }
                          </span> :

                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>
                      }
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>

          </div>
        }

        {/* Pagination - ✅ UPDATED: Fixed at bottom, always visible when orders exist */}
        {!loading && filteredOrders.length > 0 &&
        <div className="pagination" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          padding: '12px 16px',
          borderTop: '2px solid #e2e8f0',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
          zIndex: 10
        }}>
            <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading || !pagination || pagination.totalPages <= 1}>

              <ChevronLeftIcon style={{ width: '16px', height: '16px' }} />
              Previous
            </button>
            <span className="pagination-info">
              {pagination ? (
                <>Page {currentPage} of {pagination.totalPages} ({pagination.totalOrders || 0} orders)</>
              ) : (
                <>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} shown</>
              )}
            </span>
            <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(pagination?.totalPages || 1, prev + 1))}
            disabled={currentPage === (pagination?.totalPages || 1) || loading || !pagination || pagination.totalPages <= 1}>

              Next
              <ChevronRightIcon style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        }
      </div>

      {/* Period Modal */}
      {showPeriodModal &&
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
              onChange={(e) => setFromDate(e.target.value)}
              className="filter-input"
              style={{ width: '100%' }} />

            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>
                To
              </label>
              <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="filter-input"
              style={{ width: '100%' }} />

            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
              onClick={() => setShowPeriodModal(false)}
              className="filter-reset-btn">

                Cancel
              </button>
              <button
              onClick={handleDateFilter}
              className="action-btn action-btn--export">

                Apply
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}