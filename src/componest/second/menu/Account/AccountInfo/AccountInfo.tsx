import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { RootState } from "../../../../redux/rootReducer";

import { BackButton } from "../../../../allCompones/BackButton";
import { getAccountOrders } from "../../../../redux/oders/OdersActions";

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
  AllStatus?: Record<string, { color: string; description: string }>;
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
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const accountData = location.state?.accountData;

  // IMPORTANT: ALL useState hooks must be declared FIRST
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [fromDate, setFromDate] = useState(propFromDate || "");
  const [toDate, setToDate] = useState(propToDate || "");
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50); // Removed setLimit since it's not used

  // Refs - must be declared before useEffect
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Redux selectors
  const ordersState = useSelector((state: RootState) => {
    console.log("🔍 Account Orders Redux state:", state.accountOrders);
    return state.accountOrders || defaultOrdersState;
  });

  const authState = useSelector((state: RootState) => state.auth);

  // Destructure after selector
  const {
    orders: reduxOrders = [],
    loading = false,
    error = null,
    pagination = null,
    summary = null,
    statusCounts = null
  } = ordersState;

  console.log("📊 Account Info Component state values:", {
    accountId: accountData?._id,
    ordersCount: reduxOrders.length,
    loading,
    error,
  });

  // Company info with safe access
  const companyName = (authState as any)?.user?.companyName || "ABC Company";
  const branchName = (authState as any)?.user?.branchName || "Main Branch";

  // Check if accountData exists
  if (!accountData) {
    return (
      <div className="container">
        <BackButton />
        <div className="text-center py-8 text-red-500">
          <h2>No Account Selected</h2>
          <p>Please select an account to view orders.</p>
        </div>
      </div>
    );
  }

  // Status color and description functions
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'in-progress': '#3b82f6',
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'on-hold': '#6b7280',
      'Wait for Approval': '#f59e0b',
      'unknown': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  function getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'pending': 'Order received and awaiting processing',
      'in-progress': 'Order is being processed',
      'completed': 'Order has been completed',
      'cancelled': 'Order has been cancelled',
      'on-hold': 'Order is temporarily on hold',
      'Wait for Approval': 'Order is waiting for approval',
      'unknown': 'Status unknown'
    };
    return descriptions[status] || 'Status unknown';
  }

  // Transform orders to match component needs
  const transformedOrders: Order[] = Array.isArray(reduxOrders) ? reduxOrders.map((order: any) => {
    const customerName = order.customer?.companyName || order.customer?.name || accountData.name || 'Unknown Customer';
    const customerPhone = order.customer?.phone1 || order.customer?.phone || accountData.phone || '';
    const orderStatus = order.overallStatus || order.status || 'unknown';

    return {
      ...order,
      id: order._id,
      companyName: customerName,
      name: customerName,
      phone: customerPhone,
      phone1: customerPhone,
      status: orderStatus,
      overallStatus: orderStatus,
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
  const filteredOrders = transformedOrders.filter(order => {
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
      accountId: accountData._id, // Added required accountId
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

  // Helper function to fetch account orders
  const fetchAccountOrdersData = () => {
    if (accountData?._id) {
      const filters = createFilters();
      console.log("📋 Account Orders - Filters being sent:", filters);
      dispatch(getAccountOrders(accountData._id, filters) as any);
    }
  };

  // useEffect hooks - AFTER all state and selectors are declared

  // Fetch orders when component mounts or filters change
  useEffect(() => {
    console.log("🔄 AccountInfo useEffect triggered - fetching account orders");
    fetchAccountOrdersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, accountData?._id, currentPage, limit, fromDate, toDate, searchTerm, statusFilter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Account Orders Auto-refresh triggered");
      fetchAccountOrdersData();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData?._id, currentPage, limit, fromDate, toDate, searchTerm, statusFilter]);

  // Focus scroll wrapper on mount
  useEffect(() => {
    if (scrollWrapperRef.current) {
      scrollWrapperRef.current.focus();
    }
  }, []);

  // Scroll to selected order
  useEffect(() => {
    const selectedOrder = ordersRef.current[selectedOrderIndex];
    if (selectedOrder) {
      selectedOrder.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedOrderIndex]);

  // Reset selected index when orders change
  useEffect(() => {
    if (selectedOrderIndex >= filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIndex(0);
    }
  }, [filteredOrders.length, selectedOrderIndex]);

  // Handle order click to navigate to edit
  const handleOrderClick = (order: Order) => {
    console.log('🔄 Navigating to CreateOrders with account order data:', order);

    const orderDataForEdit = {
      _id: order._id,
      orderId: order.orderId,

      // Customer information - use accountData as primary source
      customer: {
        _id: accountData._id || order.customer?._id || '',
        name: accountData.name || order.customer?.name || order.customer?.companyName || '',
        companyName: accountData.companyName || order.customer?.companyName || accountData.name || '',
        phone: accountData.phone || order.customer?.phone1 || order.customer?.phone || '',
        email: accountData.email || order.customer?.email || '',
        address: accountData.address || order.customer?.address1 || '',
        whatsapp: accountData.whatsapp || order.customer?.whatsapp || '',
        phone2: accountData.phone2 || order.customer?.phone2 || '',
        pinCode: accountData.pinCode || order.customer?.pinCode || '',
        state: accountData.state || order.customer?.state || '',
        imageUrl: accountData.imageUrl || order.customer?.imageUrl || '',
        address1: accountData.address1 || order.customer?.address1 || '',
        address2: accountData.address2 || order.customer?.address2 || '',
        phone1: accountData.phone1 || accountData.phone || order.customer?.phone1 || '',
        telephone: accountData.telephone || order.customer?.telephone || '',
        firstName: accountData.firstName || order.customer?.firstName || '',
        lastName: accountData.lastName || order.customer?.lastName || ''
      },

      // Order details
      status: order.overallStatus,
      overallStatus: order.overallStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      // Material information
      material: order.material ? {
        _id: order.material._id || '',
        name: order.material.name || '',
        type: order.material.type || ''
      } : null,
      materialId: order.materialId,

      // Order specifications
      materialWeight: order.materialWeight,
      Width: order.Width,
      Height: order.Height,
      Thickness: order.Thickness,

      // Additional fields
      SealingType: order.SealingType || '',
      BottomGusset: order.BottomGusset || '',
      Flap: order.Flap || '',
      AirHole: order.AirHole || '',
      Printing: order.Printing || false,
      mixMaterial: order.mixMaterial || [],

      // Steps information
      steps: order.steps || [],
      currentStepIndex: order.currentStepIndex || 0,
      stepsCount: order.stepsCount || 0,
      totalMachines: order.totalMachines || 0,
      completedSteps: order.completedSteps || 0,

      // Branch information
      branch: order.branch || null,
      branchId: order.branchId,

      // Creator information
      createdBy: order.createdBy,
      createdByRole: order.createdByRole,

      // Notes
      Notes: order.Notes || ''
    };

    navigate("/menu/orderform", {
      state: {
        isEdit: true,
        orderData: orderDataForEdit,
        fromAccountInfo: true,
        accountData: accountData,

        // Legacy compatibility
        companyName: accountData.name || order.customer?.companyName || 'Unknown Customer',
        customerPhone: accountData.phone || order.customer?.phone1 || '',
        customerId: accountData._id || order.customer?._id || '',
        orderDate: order.date || '',
        status: order.overallStatus || order.status || '',
        orderId: order.orderId,

        // All other order data...
        customer: orderDataForEdit.customer,
        material: orderDataForEdit.material,
        Width: order.Width || 0,
        Height: order.Height || 0,
        Thickness: order.Thickness || 0,
        materialWeight: order.materialWeight || 0,
        SealingType: order.SealingType || '',
        BottomGusset: order.BottomGusset || '',
        Flap: order.Flap || '',
        AirHole: order.AirHole || '',
        Printing: order.Printing || false,
        mixMaterial: order.mixMaterial || [],
        steps: order.steps || [],
        stepsCount: order.stepsCount || 0,
        totalMachines: order.totalMachines || 0,
        completedSteps: order.completedSteps || 0,
        currentStepIndex: order.currentStepIndex ?? 0,
        Notes: order.Notes || '',
        createdAt: order.createdAt || '',
        updatedAt: order.updatedAt || '',
        branch: order.branch || null,
        branchId: order.branchId || order.branch?._id || '',
        creator: order.creator || null,
        createdBy: order.createdBy || '',
        createdByRole: order.createdByRole || '',
        AllStatus: order.AllStatus || {},
        id: order.id || order._id
      }
    });
  };

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
    console.log("🔄 Account Orders Manual refresh triggered");
    fetchAccountOrdersData();
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleDelete = () => {
    const orderToDelete = filteredOrders[selectedOrderIndex];
    console.log("🗑️ Delete order requested:", orderToDelete);
    // dispatch(deleteOrder(orderToDelete.id)); // Implement if needed
    setExpandedOrder(null);
    setSelectedOrderIndex(0);
  };

  // Print functionality
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
          <td>${order.productName || order.materialName || 'N/A'}</td>
          <td>${order.quantity || 'N/A'}</td>
          <td>${order.status || 'N/A'}</td>
          <td>${order.createdBy || 'N/A'}</td>
          <td>${order.materialWeight || 'N/A'}</td>
        </tr>`
      )
      .join("");

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
            Total Orders: ${summary?.totalOrders || filteredOrders.length}<br>
            Total Weight: ${summary?.totalWeight || 'N/A'}<br>
            Average Weight: ${summary?.avgWeight ? summary.avgWeight.toFixed(2) : 'N/A'}
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

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredOrders.map(order => ({
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
        setSelectedOrderIndex(prev => Math.max(prev - 1, 0));
        break;
      case "ArrowDown":
        event.preventDefault();
        setSelectedOrderIndex(prev => Math.min(prev + 1, filteredOrders.length - 1));
        break;
      case "Enter":
        if (event.shiftKey) {
          setExpandedOrder(prev => (prev === selectedOrderIndex ? null : selectedOrderIndex));
        } else {
          handleOrderClick(filteredOrders[selectedOrderIndex]);
        }
        break;
    }
  };

  return (
    <div className="container">
      {/* Header with account info and filters */}
      <div className="item">
        <BackButton />
        <div className="flex flex-col gap-4">
          {/* Account Information */}
          <div className="bg-blue-50 p-4 rounded border">
            <h2 className="text-xl font-bold mb-2">Orders for {accountData.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Phone:</strong> {accountData.phone || 'N/A'}</p>
                <p><strong>Name:</strong> {accountData.firstName} {accountData.lastName}</p>
              </div>
              <div>
                <p><strong>Company:</strong> {accountData.companyName || 'N/A'}</p>
                <p><strong>Email:</strong> {accountData.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center flex-wrap">
            <div>
              <label>From:
                <input
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
            </div>

            <div>
              <label>Search:
                <input
                  type="text"
                  placeholder="Order ID, Product, Status, Notes..."
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                  className="ml-2 px-2 py-1 border rounded"
                />
              </label>
            </div>

            <div>
              <label>Status:
                <select
                  value={statusFilter}
                  onChange={e => handleStatusFilter(e.target.value)}
                  className="ml-2 px-2 py-1 border rounded"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="on-hold">On Hold</option>
                  <option value="Wait for Approval">Wait for Approval</option>
                </select>
              </label>
            </div>
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
            No orders found for this account with the selected criteria.
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="DispatchTabale">
            <div className="ordersHeaderDispatch">
              <span>Date</span>
              <span>Order ID</span>
              <span>Product/Material</span>
              <span>Quantity</span>
              <span>Status</span>
              <span>Created By</span>
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
                    <span>{order.productName || order.materialName || 'N/A'}</span>
                    <span>{order.quantity || 'N/A'}</span>
                    <span>{order.status || 'Unknown'}</span>
                    <span>{order.createdBy || 'N/A'}</span>
                  </div>

                  {expandedOrder === index && (
                    <div className="status-list">
                      {order.AllStatus && Object.entries(order.AllStatus).map(([status, statusData]) => (
                        <div
                          key={status}
                          className="status-item p-2 m-1 rounded text-white text-sm"
                          style={{ backgroundColor: statusData.color }}
                        >
                          <strong>{status}:</strong> <span>{statusData.description}</span>
                        </div>
                      ))}
                      <div className="p-2 text-xs text-gray-600">
                        <div>Order ID: {order.orderId}</div>
                        <div>Material Weight: {order.materialWeight || 'N/A'}</div>
                        <div>Dimensions: {order.Width && order.Height && order.Thickness
                          ? `${order.Width}×${order.Height}×${order.Thickness}`
                          : 'N/A'
                        }</div>
                        <div>Steps: {order.completedSteps || 0}/{order.stepsCount || 0}</div>
                        <div>Machines: {order.totalMachines || 0}</div>
                        <div>Branch: {order.branch?.name || 'N/A'} ({order.branch?.code || 'N/A'})</div>
                        <div>Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
                        <div>Updated: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}</div>
                        {order.SealingType && <div>Sealing: {order.SealingType}</div>}
                        {order.BottomGusset && <div>Bottom Gusset: {order.BottomGusset}</div>}
                        {order.Flap && <div>Flap: {order.Flap}</div>}
                        {order.AirHole && <div>Air Hole: {order.AirHole}</div>}
                        {order.Printing && <div>Printing: Yes</div>}
                        {order.Notes && <div>Notes: {order.Notes}</div>}
                        <div className="mt-2">
                          <button 
                            onClick={() => handleOrderClick(order)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs mr-2 hover:bg-blue-600"
                          >
                            Edit Order
                          </button>
                          <button 
                            onClick={handleDelete}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
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
                <span key={status}><strong>{status}:</strong> {String(count)}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Orders count info */}
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredOrders.length} orders for {accountData.name}
          {fromDate && toDate && ` from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`}
        </div>
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legacy expanded order details popup (if needed for compatibility) */}
      {expandedOrder !== null && expandedOrder >= 0 && filteredOrders[expandedOrder] && (
        <div className="order-details-popup fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Order Details</h3>
              <button
                onClick={() => setExpandedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <p><strong>Order ID:</strong> {filteredOrders[expandedOrder].orderId}</p>
              <p><strong>Product:</strong> {filteredOrders[expandedOrder].productName || filteredOrders[expandedOrder].materialName}</p>
              <p><strong>Date:</strong> {filteredOrders[expandedOrder].date}</p>
              <p><strong>Quantity:</strong> {filteredOrders[expandedOrder].quantity}</p>
              <p><strong>Total Amount:</strong> {filteredOrders[expandedOrder].totalAmount}</p>
              <p><strong>Status:</strong> {filteredOrders[expandedOrder].status}</p>
              <p><strong>Created By:</strong> {filteredOrders[expandedOrder].createdBy}</p>
              <p><strong>Material Weight:</strong> {filteredOrders[expandedOrder].materialWeight || 'N/A'}</p>
              <p><strong>Dimensions:</strong> {
                filteredOrders[expandedOrder].Width && filteredOrders[expandedOrder].Height && filteredOrders[expandedOrder].Thickness
                  ? `${filteredOrders[expandedOrder].Width}×${filteredOrders[expandedOrder].Height}×${filteredOrders[expandedOrder].Thickness}`
                  : 'N/A'
              }</p>
              {filteredOrders[expandedOrder].Notes && (
                <p><strong>Notes:</strong> {filteredOrders[expandedOrder].Notes}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setExpandedOrder(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => handleOrderClick(filteredOrders[expandedOrder])}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Order
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountInfo;