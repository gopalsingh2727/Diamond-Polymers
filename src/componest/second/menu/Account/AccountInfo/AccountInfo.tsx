import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { RootState } from "../../../../redux/rootReducer";

import { BackButton } from "../../../../allCompones/BackButton";
import { getAccountOrders, fetchOrderDetails } from "../../../../redux/oders/OdersActions";
import { AppDispatch } from "../../../../../store";
import { useDaybookUpdates } from "../../../../../hooks/useWebSocket"; // ✅ WebSocket real-time updates
import "../../Oders/indexAllOders.css"; // ✅ Import All Orders styling
import "../../Edit/EditMachineType/EditMachineyType.css"; // ✅ Import Table styling
import "./accountInfo.css"; // ✅ Import AccountInfo specific styling

// Define Order interface
interface Order {
  _id: string;
  id?: string;
  orderId?: string;
  companyName?: string;
  name?: string;
  phone?: string;
  phone1?: string;
  status: string;
  overallStatus?: string;
  date: string;
  productName?: string;
  materialName?: string;
  quantity?: string | number;
  totalAmount?: string | number;
  materialWeight?: string | number;
  createdBy?: string;
  createdByRole?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  Width?: number;
  Height?: number;
  Thickness?: number;
  SealingType?: string;
  BottomGusset?: string;
  Flap?: string;
  AirHole?: string;
  Printing?: boolean;
  mixMaterial?: any[];
  steps?: any[];
  currentStepIndex?: number;
  stepsCount?: number;
  totalMachines?: number;
  completedSteps?: number;
  branch?: any;
  branchId?: string;
  Notes?: string;
  material?: {
    _id?: string;
    name?: string;
    materialName?: string;
    type?: string;
  };
  materialId?: string;
  customer?: {
    _id?: string;
    name?: string;
    companyName?: string;
    phone?: string;
    phone1?: string;
    email?: string;
    address?: string;
    address1?: string;
    address2?: string;
    whatsapp?: string;
    phone2?: string;
    pinCode?: string;
    state?: string;
    imageUrl?: string;
    telephone?: string;
    firstName?: string;
    lastName?: string;
  };
  AllStatus?: Record<string, {color: string;description: string;}>;
  // Order type and options - for edit mode
  orderType?: any;
  orderTypeId?: string;
  orderTypeName?: string;
  orderTypeCode?: string;
  priority?: string;
  options?: any[];
  optionsWithDetails?: any[];
}

interface AccountInfoProps {
  accountData?: {
    id: string;
    name: string;
    phone: string;
  };
  fromDate: string;
  toDate: string;
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
  accountId: string; // Added required field
}

// Define default values for Redux state
const defaultOrdersState = {
  orders: [],
  loading: false,
  error: null,
  pagination: null,
  summary: null,
  statusCounts: null
};

const AccountInfo: React.FC<AccountInfoProps> = ({ fromDate: propFromDate, toDate: propToDate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get accountData from location.state or sessionStorage (for persistence when navigating back)
  const getAccountData = () => {
    if (location.state?.accountData) {
      // Store in sessionStorage for persistence
      sessionStorage.setItem('currentAccountData', JSON.stringify(location.state.accountData));
      return location.state.accountData;
    }
    // Try to get from sessionStorage if location.state is empty
    const storedData = sessionStorage.getItem('currentAccountData');
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {

      }
    }
    return null;
  };

  const accountData = getAccountData();

  // IMPORTANT: ALL useState hooks must be declared FIRST
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set()); // Multi-select for printing
  const [fromDate, setFromDate] = useState(propFromDate || "");
  const [toDate, setToDate] = useState(propToDate || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // ✅ Pagination state
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ✅ ADDED: Force refresh trigger
  const [showAccountModal, setShowAccountModal] = useState(false); // ✅ Account info modal
  const [editLoading, setEditLoading] = useState(false); // ✅ Loading state for edit

  // Refs - must be declared before useEffect
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true); // Track initial mount to skip unnecessary fetch
  const lastRefreshTrigger = useRef(0); // Track last refreshTrigger to detect actual updates

  // Redux selectors
  const ordersState = useSelector((state: RootState) => {

    return state.accountOrders || defaultOrdersState;
  });

  const authState = useSelector((state: RootState) => state.auth);

  // Destructure after selector
  const {
    orders: reduxOrders = [],
    loading = false,
    error = null
  } = ordersState;

  // Get pagination, statusCounts, and summary from state
  const pagination = (ordersState as any)?.pagination || null;
  const statusCounts = (ordersState as any)?.statusCounts || null;
  const summary = (ordersState as any)?.summary || null;





  // Company info with safe access
  const companyName = (authState as any)?.user?.companyName || "ABC Company";
  const branchName = (authState as any)?.user?.branchName || "Main Branch";
  const branchId = (authState as any)?.user?.branchId || localStorage.getItem('selectedBranch') || null; // ✅ For WebSocket subscription

  // Check if accountData exists
  if (!accountData) {
    return (
      <div className="container">
        <BackButton />
        <div className="text-center py-8 text-red-500">
          <h2>No Account Selected</h2>
          <p>Please select an account to view orders.</p>
        </div>
      </div>);

  }

  // Status color and description functions
  function getStatusColor(status: string): string {
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
      'issue': '#ef4444',
      'unknown': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  function getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'pending': 'Order received and awaiting processing',
      'in_progress': 'Order is being processed',
      'in-progress': 'Order is being processed',
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

  // Transform orders to match component needs
  const transformedOrders: Order[] = Array.isArray(reduxOrders) ? reduxOrders.map((order: any) => {
    // Fix: Check all possible customer name fields including accountData.companyName
    const customerName = order.customer?.companyName || order.customer?.name || order.companyName || accountData?.companyName || accountData?.name || (accountData?.firstName && accountData?.lastName ? `${accountData.firstName} ${accountData.lastName}` : null) || 'Unknown Customer';
    const customerPhone = order.customer?.phone1 || order.customer?.phone || order.phone || accountData?.phone || '';
    const orderStatus = order.overallStatus || order.status || 'unknown';

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
      status: orderStatus,
      overallStatus: orderStatus,
      priority: priority,
      orderType: orderType,
      orderTypeName: orderTypeName,
      orderTypeCode: orderTypeCode,
      date: new Date(order.createdAt).toISOString().split('T')[0],
      productName: order.material?.name || order.material?.materialName || 'N/A',
      materialName: order.material?.name || order.material?.materialName || 'N/A',
      quantity: order.materialWeight || 'N/A',
      totalAmount: order.materialWeight || 'N/A',
      createdBy: order.createdByRole || order.createdBy || 'N/A',
      AllStatus: {
        [orderStatus]: {
          color: getStatusColor(orderStatus),
          description: getStatusDescription(orderStatus)
        }
      }
    };
  }) : [];

  // Filter orders based on search and status
  const filteredOrders = transformedOrders.filter((order) => {
    // Date filtering
    if (!order.date) return false;

    const orderDate = new Date(order.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && orderDate < from) return false;
    if (to && orderDate > to) return false;

    // Status filtering
    if (statusFilter && order.status !== statusFilter) return false;

    // Search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesOrderId = order.orderId?.toLowerCase().includes(searchLower);
      const matchesProduct = order.productName?.toLowerCase().includes(searchLower);
      const matchesStatus = order.status?.toLowerCase().includes(searchLower);
      const matchesNotes = order.Notes?.toLowerCase().includes(searchLower);

      if (!matchesOrderId && !matchesProduct && !matchesStatus && !matchesNotes) {
        return false;
      }
    }

    return true;
  });

  // Helper function to create filters
  const createFilters = (): OrderFilters => {
    const filters: OrderFilters = {
      accountId: accountData._id,
      page: currentPage, // ✅ Use current page for pagination
      limit: 50, // ✅ Load only 50 orders per page for performance
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    if (fromDate) filters.startDate = fromDate;
    if (toDate) filters.endDate = toDate;
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter) filters.status = statusFilter;

    return filters;
  };

  // Helper function to fetch account orders
  const fetchAccountOrdersData = () => {
    if (accountData?._id) {
      const filters = createFilters();

      dispatch(getAccountOrders(accountData._id, filters) as any);
    }
  };

  // useEffect hooks - AFTER all state and selectors are declared

  // ✅ Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, searchTerm, statusFilter]);

  // ✅ Initial load - fetch if no cached data or incomplete data
  useEffect(() => {
    lastRefreshTrigger.current = refreshTrigger;
    // Fetch if no cached orders OR cached orders < 50 AND more exist
    const needsFetch = reduxOrders.length === 0 ||
      (reduxOrders.length < 50 && pagination && pagination.total > reduxOrders.length);

    if (needsFetch) {
      fetchAccountOrdersData();
    }
    // Mark initialization complete after first render cycle
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Handle refreshTrigger changes (from WebSocket updates or sessionStorage flag)
  useEffect(() => {
    if (!isInitialMount.current && refreshTrigger !== lastRefreshTrigger.current) {
      lastRefreshTrigger.current = refreshTrigger;
      fetchAccountOrdersData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // ✅ Handle filter/pagination changes (user interactions)
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchAccountOrdersData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fromDate, toDate, searchTerm, statusFilter]);

  // ✅ FIXED: Check for order updates on mount (using state trigger to avoid stale closures)
  useEffect(() => {
    const ordersUpdated = sessionStorage.getItem('orders_updated');
    if (ordersUpdated) {

      sessionStorage.removeItem('orders_updated');
      setRefreshTrigger((prev) => prev + 1);
    }
  }, []); // Run on mount

  // Note: Removed location-based effect to prevent unnecessary API calls on navigation
  // The mount effect above + WebSocket updates handle all necessary refreshes

  // ✅ WebSocket real-time subscription for instant order updates
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

  // Focus content container when orders are loaded for keyboard navigation
  useEffect(() => {
    if (contentRef.current && filteredOrders.length > 0) {
      contentRef.current.focus();
    }
  }, [filteredOrders.length]);

  // Scroll to selected order
  useEffect(() => {
    const selectedOrder = ordersRef.current[selectedOrderIndex];
    if (selectedOrder) {
      selectedOrder.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [selectedOrderIndex]);

  // Reset selected index when orders change
  useEffect(() => {
    if (selectedOrderIndex >= filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIndex(0);
    }
  }, [filteredOrders.length, selectedOrderIndex]);

  // Handle order click to navigate to edit - FETCH FULL ORDER DETAILS FIRST
  const handleOrderClick = async (order: Order) => {
    setEditLoading(true);

    try {
      // Fetch complete order details from API
      const fullOrderData = await dispatch(fetchOrderDetails(order._id));

      if (!fullOrderData) {
        console.error('Failed to fetch order details for edit');
        alert('Failed to load order details. Please try again.');
        setEditLoading(false);
        return;
      }

      // Use the full order data from API
      const orderDataForEdit = {
        _id: fullOrderData._id,
        orderId: fullOrderData.orderId,
        overallStatus: fullOrderData.overallStatus,
        status: fullOrderData.overallStatus,
        createdAt: fullOrderData.createdAt,
        updatedAt: fullOrderData.updatedAt,

        // Customer - merge with accountData
        customer: fullOrderData.customer || {
          _id: accountData?._id || fullOrderData.customerId || '',
          companyName: accountData?.companyName || fullOrderData.customerDetails?.customerName || '',
          phone1: accountData?.phone || fullOrderData.customer?.phone1 || '',
          email: accountData?.email || fullOrderData.customer?.email || ''
        },
        customerId: fullOrderData.customer?._id || fullOrderData.customerId || '',

        // Order Type
        orderType: fullOrderData.orderType || null,
        orderTypeId: fullOrderData.orderType?._id || fullOrderData.orderTypeId || '',

        // Steps and workflow - FULL DATA
        steps: fullOrderData.steps || [],
        stepProgress: fullOrderData.stepProgress || [],
        currentStepIndex: fullOrderData.currentStepIndex || 0,
        totalSteps: fullOrderData.totalSteps || fullOrderData.steps?.length || 0,
        completedSteps: fullOrderData.completedSteps || 0,

        // Branch
        branch: fullOrderData.branch || null,
        branchId: fullOrderData.branchId || fullOrderData.branch?._id || '',

        // Creator
        createdBy: fullOrderData.createdBy || '',
        createdByName: fullOrderData.createdByName || '',
        createdByRole: fullOrderData.createdByRole || '',

        // Notes
        Notes: fullOrderData.Notes || fullOrderData.notes || '',

        // Options - FULL DATA
        options: fullOrderData.options || [],
        optionsWithDetails: fullOrderData.optionsWithDetails || [],

        // Billing
        billingDetails: fullOrderData.billingDetails || {},
        quantity: fullOrderData.quantity || 1,
        priority: fullOrderData.priority || 'normal',

        // Dynamic values
        dynamicValues: fullOrderData.dynamicValues || {}
      };

      console.log('📝 Navigating to edit with full order data:', orderDataForEdit);

      navigate("/menu/orderform", {
        state: {
          isEdit: true,
          orderData: orderDataForEdit,
          fromAccountInfo: true,
          accountData: accountData,
          orderId: fullOrderData.orderId,
          companyName: accountData?.companyName || fullOrderData.customer?.companyName || ''
        }
      });
    } catch (error) {
      console.error('Error fetching order for edit:', error);
      alert('Error loading order. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setStatusFilter('');
  };

  // Print functionality
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
          <td>${order.productName || order.materialName || 'N/A'}</td>
          <td>${order.quantity || 'N/A'}</td>
          <td>${order.status || 'N/A'}</td>
          <td>${order.createdBy || 'N/A'}</td>
          <td>${order.materialWeight || 'N/A'}</td>
        </tr>`
    ).
    join("");

    const printContent = `
      <html>
        <head>
          <title>Account Orders - ${accountData.name}</title>
          <style>
            body { font-family: Arial; margin: 40px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .header .meta { font-size: 14px; color: #555; margin: 5px 0; }
            .account-info { margin: 20px 0; padding: 10px; background: #f0f8ff; border: 1px solid #ddd; }
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
            <div class="meta">Account Orders Report</div>
            <div class="meta">${periodText}</div>
            <div class="meta">Printed: ${currentDate}</div>
          </div>
          
          <div class="account-info">
            <strong>Account Information:</strong><br>
            Name: ${accountData.name || 'N/A'}<br>
            Phone: ${accountData.phone || 'N/A'}<br>
            Email: ${accountData.email || 'N/A'}<br>
            Company: ${accountData.companyName || 'N/A'}
          </div>

          <div class="summary">
            <strong>Summary:</strong><br>
            Total Orders: ${filteredOrders.length}<br>
            Total Weight: ${'N/A'}<br>
            Average Weight: ${'N/A'}
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Product/Material</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Weight</th>
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

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredOrders.map((order) => ({
      Date: order.date || 'N/A',
      OrderID: order.orderId || 'N/A',
      Product: order.productName || order.materialName || 'N/A',
      Quantity: order.quantity || 'N/A',
      Status: order.status || 'N/A',
      CreatedBy: order.createdBy || 'N/A',
      Weight: order.materialWeight || 'N/A',
      Width: order.Width || 'N/A',
      Height: order.Height || 'N/A',
      Thickness: order.Thickness || 'N/A',
      Branch: order.branch?.name || 'N/A',
      BranchCode: order.branch?.code || 'N/A',
      Material: order.material?.name || 'N/A',
      SealingType: order.SealingType || 'N/A',
      BottomGusset: order.BottomGusset || 'N/A',
      Flap: order.Flap || 'N/A',
      AirHole: order.AirHole || 'N/A',
      Printing: order.Printing ? 'Yes' : 'No',
      StepsCount: order.stepsCount || 0,
      CompletedSteps: order.completedSteps || 0,
      TotalMachines: order.totalMachines || 0,
      CreatedDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      UpdatedDate: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A',
      Notes: order.Notes || '',
      CustomerName: accountData.name || 'N/A',
      CustomerPhone: accountData.phone || 'N/A',
      CustomerEmail: accountData.email || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Account_Orders");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const filename = `Account_${accountData.name}_Orders_${fromDate || 'all'}_to_${toDate || 'all'}_${new Date().getTime()}.xlsx`;
    saveAs(blob, filename);
  };

  // Keyboard navigation
  const handleKeyNavigation = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (filteredOrders.length === 0) return;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        setSelectedOrderIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "ArrowDown":
      case "Tab":
        if (!event.shiftKey) {
          event.preventDefault();
          setSelectedOrderIndex((prev) => Math.min(prev + 1, filteredOrders.length - 1));
        }
        break;
      case "Enter":
        handleOrderClick(filteredOrders[selectedOrderIndex]);
        break;
      case " ": // Space key - toggle selection
        event.preventDefault();
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
        setSelectedOrders(new Set());
        break;
    }

    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      setSelectedOrderIndex((prev) => Math.max(prev - 1, 0));
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
  };

  // Print labels for selected orders (using iframe - no new window)
  const handlePrintSelectedLabels = () => {
    if (selectedOrders.size === 0) {
      alert('Please select orders to print labels');
      return;
    }

    const ordersToPrint = filteredOrders.filter((o) => selectedOrders.has(o._id));

    const labelContent = ordersToPrint.map((order) => `
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
          Date: ${order.createdAt ? new Date(order.createdAt as string).toLocaleDateString() : 'N/A'}
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

  return (
    <div className="all-orders-page">
      {/* Header */}
      <div className="all-orders-header">
        <div className="all-orders-header__left">
          <BackButton />
          <h1 className="all-orders-title">Account Orders</h1>
          <span className="all-orders-subtitle">
            {accountData.companyName || accountData.firstName + ' ' + accountData.lastName}
          </span>
        </div>
        <div className="all-orders-header__actions">
          <button className="action-btn" onClick={() => setShowAccountModal(true)} title="Account Info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="2" style={{ display: 'inline' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
          <button className="action-btn action-btn--export" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      {filteredOrders.length > 0 &&
      <div className={`accountinfoorders__selection ${selectedOrders.size > 0 ? 'accountinfoorders__selection--active' : ''}`}>
          {selectedOrders.size > 0 && (
            <>
              <span className="accountinfoorders__selection-text">
                {`${selectedOrders.size} order${selectedOrders.size > 1 ? 's' : ''} selected`}
              </span>
              <div className="accountinfoorders__selection-spacer"></div>
              <button
              onClick={clearSelections}
              className="accountinfoorders__btn accountinfoorders__btn--clear">

                Clear
              </button>
            </>
          )}
        </div>
      }

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
              onChange={(e) => handleSearch(e.target.value)} />

          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}>

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
            <label>From Date</label>
            <input
              type="date"
              className="filter-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)} />

          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              className="filter-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)} />

          </div>

          <button className="filter-reset-btn" onClick={handleClearFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      {statusCounts && (
        <div className="editsectionsTable-summary editsectionsTable-summary--compact">
          <div className="editsectionsTable-summaryCard editsectionsTable-summaryCard--mini">
            <div className="editsectionsTable-summaryCard__value">{summary?.totalOrders || filteredOrders.length}</div>
            <div className="editsectionsTable-summaryCard__label">Total</div>
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
              <div key={status} className={`editsectionsTable-summaryCard editsectionsTable-summaryCard--mini editsectionsTable-summaryCard--${statusClass}`}>
                <div className="editsectionsTable-summaryCard__value">{count as number}</div>
                <div className="editsectionsTable-summaryCard__label">{status.replace(/_/g, ' ')}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading & Error States */}
      {loading &&
      <p className="loadingAndError">Loading orders...</p>
      }
      {error &&
      <p className="loadingAndError" style={{ color: 'red' }}>Error: {error}</p>
      }

      {/* Orders Table */}
      <div className="editsectionsTable-container">
        {!loading && filteredOrders.length === 0 &&
        <div className="editsectionsTable-empty">
            <p>No orders found for this account with the selected criteria.</p>
          </div>
        }

        {!loading && filteredOrders.length > 0 &&
        <div
          className="editsectionsTable-wrapper"
          ref={contentRef}
          tabIndex={0}
          onKeyDown={handleKeyNavigation}
          onClick={() => contentRef.current?.focus()}
          style={{ outline: 'none' }}>

            <table className="editsectionsTable-table">
            <thead className="editsectionsTable-thead">
              <tr>
                <th className="editsectionsTable-th" style={{ width: '40px', textAlign: 'center' }}>
                  <input
                  type="checkbox"
                  checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      selectAllOrders();
                    } else {
                      clearSelections();
                    }
                  }}
                  className="accountinfoorders__checkbox" />

                </th>
                <th className="editsectionsTable-th" style={{ width: '50px' }}>No</th>
                <th className="editsectionsTable-th" style={{ width: '100px' }}>Created</th>
                <th className="editsectionsTable-th" style={{ width: '120px' }}>Order ID</th>
                <th className="editsectionsTable-th">Company</th>
                <th className="editsectionsTable-th" style={{ width: '140px' }}>Order Status</th>
                <th className="editsectionsTable-th" style={{ width: '100px' }}>Priority</th>
                <th className="editsectionsTable-th" style={{ width: '150px' }}>Order Type</th>
              </tr>
            </thead>
            <tbody className="editsectionsTable-tbody">
              {filteredOrders.map((order, index) =>
            <tr
              key={order._id || index}
              ref={(el) => ordersRef.current[index] = el as any}
              className={`editsectionsTable-tr ${selectedOrders.has(order._id) ? 'editsectionsTable-trSelected' : ''}`}
              onClick={() => handleOrderClick(order)}>

                  <td className="editsectionsTable-td" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <input
                  type="checkbox"
                  checked={selectedOrders.has(order._id)}
                  onChange={() => toggleOrderSelection(order._id)}
                  className="accountinfoorders__checkbox" />

                  </td>
                  <td className="editsectionsTable-td" style={{ textAlign: 'center', fontWeight: 500 }}>{index + 1}</td>
                  <td className="editsectionsTable-td date-cell">
                    {order.createdAt ? new Date(order.createdAt as string).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit'
                }) : 'N/A'}
                  </td>
                  <td className="editsectionsTable-td order-id-cell">{order.orderId || 'N/A'}</td>
                  <td className="editsectionsTable-td" style={{ fontWeight: 500 }}>{order.companyName || 'N/A'}</td>
                  <td className="editsectionsTable-td">
                    <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status || '') }}>

                      {order.status?.replace(/_/g, ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="editsectionsTable-td">
                    <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityBadgeColor(order.priority || 'normal') }}>

                      {order.priority || 'normal'}
                    </span>
                  </td>
                  <td className="editsectionsTable-td">
                    {order.orderTypeName ?
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 500 }}>{order.orderTypeName}</span>
                        {order.orderTypeCode &&
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>({order.orderTypeCode})</span>
                  }
                      </span> :

                <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>
                }
                  </td>
                </tr>
            )}
            </tbody>
          </table>


        </div>
      }

        {/* Pagination bar at bottom */}
        {!loading && filteredOrders.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '12px 16px',
            borderTop: '2px solid #e2e8f0',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            flexShrink: 0
          }}>
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 1 ? '#e2e8f0' : '#3b82f6',
                color: currentPage === 1 ? '#94a3b8' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}>
              ← Previous
            </button>

            {/* Page Info */}
            <span style={{ color: '#64748b', fontSize: '14px' }}>
              Page {currentPage} of {pagination?.totalPages || '?'} pages | Showing {reduxOrders.length} of {pagination?.totalOrders || filteredOrders.length} total orders
            </span>

            {/* Next Button - disabled based on pagination info or if we got less than 50 orders */}
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={pagination?.hasNextPage === false || (!pagination && reduxOrders.length < 50) || loading}
              style={{
                padding: '8px 16px',
                backgroundColor: (pagination?.hasNextPage === false || (!pagination && reduxOrders.length < 50)) ? '#e2e8f0' : '#3b82f6',
                color: (pagination?.hasNextPage === false || (!pagination && reduxOrders.length < 50)) ? '#94a3b8' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (pagination?.hasNextPage === false || (!pagination && reduxOrders.length < 50)) ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}>
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Account Info Modal */}
      {showAccountModal && (
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
            width: '400px',
            maxWidth: '90vw'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>Account Information</h2>
              <button onClick={() => setShowAccountModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</label>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>{accountData.companyName || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</label>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>{accountData.firstName} {accountData.lastName}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</label>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>{accountData.phone || accountData.phone1 || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>{accountData.email || 'N/A'}</p>
              </div>
            </div>

            <button onClick={() => setShowAccountModal(false)} style={{
              width: '100%',
              marginTop: '20px',
              padding: '10px 16px',
              backgroundColor: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>);

};

export default AccountInfo;