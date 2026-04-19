import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { BackButton } from "../../../allCompones/BackButton";
import "./indexAllOders.css";
import { ArrowDownTrayIcon, PrinterIcon, XMarkIcon, ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon, ArrowPathIcon, SignalIcon, SignalSlashIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircle2, Circle, PlayCircle, PauseCircle, AlertTriangle, Loader2, AlertCircle, Clock, X, RefreshCw, Share2 } from "lucide-react";
import CustomSelect from "../../../../components/shared/CustomSelect";
import ForwardOrderModal from "../OrderForward/components/ForwardOrderModal";
import OrderDetailsModal from "./OrderDetailsModal";

// Import Redux actions
import { fetchOrders, fetchOrderDetails } from "../../../redux/oders/OdersActions";
import { getOrderFormDataIfNeeded } from "../../../redux/oders/orderFormDataActions";
import { RootState } from "../../../redux/rootReducer";
import { AppDispatch } from "../../../../store";
import { useDaybookUpdates, useWebSocketStatus } from "../../../../hooks/useWebSocket";

interface OrderFilters {
  status: string;
  priority: string;
  machineTypeIds: string[];
  machineNames: string[];
  operatorIds: string[];
  orderTypeId: string;
  stepNames: string[];
  machineStatus: string;
  search: string;
}


// ── Portal Menu: renders outside any overflow/stacking context ──────────
const PortalMenu: React.FC<{
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  children: React.ReactNode;
  minWidth?: number;
}> = ({ open, anchorEl, children, minWidth = 180 }) => {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (open && anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      setPos({ top: r.bottom + 3, left: r.left, width: Math.max(r.width, minWidth) });
    }
  }, [open, anchorEl, minWidth]);

  if (!open) return null;
  return createPortal(
    <div
      className="multi-select-menu"
      style={{ top: pos.top, left: pos.left, width: pos.width, position: "fixed", zIndex: 99999 }}
    >
      {children}
    </div>,
    document.body
  );
};

const IndexAllOders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const orderFormData = useSelector((state: RootState) => state.orderFormData);
  const machineTypes = orderFormData?.data?.machineTypes || [];
  const machines = orderFormData?.data?.machines || [];
  const orderTypes = orderFormData?.data?.orderTypes || [];
  const operators = orderFormData?.data?.operators || [];
  const stepsFromFormData = orderFormData?.data?.steps || [];

  const ordersState = useSelector((state: RootState) => state.orders as any);
  const orders = ordersState?.list?.orders || ordersState?.orders || [];
  const ordersLoading = ordersState?.list?.loading || ordersState?.loading || false;
  const ordersError = ordersState?.list?.error || ordersState?.error || null;

  const statusCounts = null; // removed summary cards
  const summary = null;      // removed summary cards
  const pagination = ordersState?.list?.pagination || null;

  // Filters state
  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    priority: '',
    machineTypeIds: [],
    machineNames: [],
    operatorIds: [],
    orderTypeId: '',
    stepNames: [],
    machineStatus: '',
    search: ''
  });

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Dropdown state + anchor refs for portal positioning
  const [machineTypeDropdownOpen, setMachineTypeDropdownOpen] = useState(false);
  const [machineNameDropdownOpen, setMachineNameDropdownOpen] = useState(false);
  const [operatorDropdownOpen, setOperatorDropdownOpen] = useState(false);
  const [stepNameDropdownOpen, setStepNameDropdownOpen] = useState(false);
  const machineTypeAnchor = useRef<HTMLButtonElement | null>(null);
  const machineNameAnchor = useRef<HTMLButtonElement | null>(null);
  const operatorAnchor    = useRef<HTMLButtonElement | null>(null);
  const stepNameAnchor    = useRef<HTMLButtonElement | null>(null);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Forward order modal state
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedOrderForForward, setSelectedOrderForForward] = useState<{id: string; number: string} | null>(null);

  // Order details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Edit loading state (same as Daybook)
  const [editLoading, setEditLoading] = useState(false);

  // ✅ FIX: Pagination — page is purely for server-side requests
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // ✅ Ref to prevent double-fetch when resetting page and filters simultaneously
  const isFetchingRef = useRef(false);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Wait for Approval', label: 'Wait for Approval' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'issue', label: 'Issue' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low' },
  ];

  const machineStatusOptions = [
    { value: '', label: 'All Machine Status' },
    { value: 'none', label: 'None' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' },
    { value: 'error', label: 'Error' },
    { value: 'issue', label: 'Issue' },
  ];

  // ✅ FIX: Single unified fetch function — no duplicate triggers
  const fetchOrdersData = useCallback((overridePage?: number) => {
    const page = overridePage ?? currentPage;
    const apiFilters: any = {
      page,
      limit: itemsPerPage,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (fromDate) apiFilters.startDate = fromDate;
    if (toDate) apiFilters.endDate = toDate;
    if (filters.search) apiFilters.search = filters.search;
    if (filters.status) apiFilters.status = filters.status;
    if (filters.priority) apiFilters.priority = filters.priority;
    if (filters.orderTypeId) apiFilters.orderTypeId = filters.orderTypeId;

    dispatch(fetchOrders(apiFilters));
  }, [dispatch, currentPage, itemsPerPage, fromDate, toDate, filters.search, filters.status, filters.priority, filters.orderTypeId]);

  const authState = useSelector((state: RootState) => state.auth);
  const selectedBranch = useSelector((state: RootState) => state.auth.userData?.selectedBranch);
  const branchId = selectedBranch || (authState as any)?.user?.branchId || localStorage.getItem('selectedBranch') || null;

  const { isConnected: wsConnected } = useWebSocketStatus();

  // ✅ FIX: Branch change — reset and fetch once (page 1)
  const lastBranchRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedBranch && selectedBranch !== lastBranchRef.current) {
      lastBranchRef.current = selectedBranch;
      setFilters({
        status: '', priority: '', machineTypeIds: [], machineNames: [],
        operatorIds: [], orderTypeId: '', stepNames: [], machineStatus: '', search: '',
      });
      setFromDate('');
      setToDate('');
      setCurrentPage(1);
      dispatch(fetchOrders({ page: 1, limit: itemsPerPage, sortBy: 'createdAt', sortOrder: 'desc' }));
    }
  }, [selectedBranch, dispatch]);

  // ✅ FIX: Fetch on page change only (filters have their own effect below)
  useEffect(() => {
    fetchOrdersData();
    dispatch(getOrderFormDataIfNeeded());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ✅ FIX: Fetch on filter changes — reset to page 1 and fetch in ONE effect (no double fetch)
  const filtersKey = `${fromDate}|${toDate}|${filters.status}|${filters.priority}|${filters.orderTypeId}|${filters.search}`;
  const prevFiltersKeyRef = useRef(filtersKey);
  useEffect(() => {
    if (filtersKey === prevFiltersKeyRef.current) return; // no change
    prevFiltersKeyRef.current = filtersKey;
    // Reset to page 1 and fetch with page=1 directly (avoids double-fetch from page change effect)
    setCurrentPage(1);
    const apiFilters: any = {
      page: 1,
      limit: itemsPerPage,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    if (fromDate) apiFilters.startDate = fromDate;
    if (toDate) apiFilters.endDate = toDate;
    if (filters.search) apiFilters.search = filters.search;
    if (filters.status) apiFilters.status = filters.status;
    if (filters.priority) apiFilters.priority = filters.priority;
    if (filters.orderTypeId) apiFilters.orderTypeId = filters.orderTypeId;
    dispatch(fetchOrders(apiFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // WebSocket subscription
  useDaybookUpdates(branchId, undefined);

  // Machines for selected types
  const machinesForSelectedTypes = useMemo(() => {
    if (filters.machineTypeIds.length === 0) return machines;
    const filteredMachines: any[] = [];
    filters.machineTypeIds.forEach((typeId) => {
      const selectedType = machineTypes.find((mt: any) => mt._id === typeId);
      if (selectedType?.machines) {
        filteredMachines.push(...selectedType.machines);
      } else {
        filteredMachines.push(...machines.filter((m: any) => m.machineType?._id === typeId));
      }
    });
    return filteredMachines;
  }, [filters.machineTypeIds, machineTypes, machines]);

  // Available operators
  const availableOperators = useMemo(() => {
    const operatorMap = new Map<string, {id: string; name: string}>();
    operators.forEach((op: any) => {
      if (op._id && op.operatorName) operatorMap.set(op._id, { id: op._id, name: op.operatorName });
    });
    orders.forEach((order: any) => {
      order.steps?.forEach((step: any) => {
        step.machines?.forEach((machine: any) => {
          const name = machine.operator || machine.operatorName;
          const id = machine.operatorId || name;
          if (name && id && !operatorMap.has(id)) operatorMap.set(id, { id, name });
        });
      });
    });
    return Array.from(operatorMap.values());
  }, [operators, orders]);

  // ✅ FIX: Client-side filters (machine type/name/operator/step/machineStatus) applied to current page data
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    return orders.filter((order: any) => {
      // Machine Type filter
      if (filters.machineTypeIds.length > 0) {
        const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
        const hasMachineType = orderMachines.some((m: any) =>
          filters.machineTypeIds.includes(m.machineType) ||
          filters.machineTypeIds.some((typeId) =>
            machineTypes.find((mt: any) => mt._id === typeId)?.type === m.machineType
          )
        );
        if (!hasMachineType) return false;
      }

      // Machine Name filter
      if (filters.machineNames.length > 0) {
        const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
        const hasMachine = orderMachines.some((m: any) => {
          const machineIdStr = typeof m.machineId === 'object'
            ? m.machineId?._id?.toString() || m.machineId?.toString()
            : m.machineId?.toString();
          return filters.machineNames.includes(machineIdStr) ||
            filters.machineNames.includes(m.machineName) ||
            (m.machineId?._id && filters.machineNames.includes(m.machineId._id.toString()));
        });
        if (!hasMachine) return false;
      }

      // Operator filter
      if (filters.operatorIds.length > 0) {
        const stepOperators = order.steps?.flatMap((step: any) =>
          step.machines?.map((m: any) => m.operator || m.operatorName || m.operatorId) || []
        ) || [];
        const allOperators = [order.operatorId, ...stepOperators].filter(Boolean);
        if (!allOperators.some((op) => filters.operatorIds.includes(op))) return false;
      }

      // Step Name filter
      if (filters.stepNames.length > 0) {
        const orderStepNames = order.steps?.map((step: any, idx: number) =>
          step.stepName || step.name || step.stepId?.stepName || `Step ${idx + 1}`
        ) || [];
        if (!orderStepNames.some((name: string) => filters.stepNames.includes(name))) return false;
      }

      // Machine Status filter
      if (filters.machineStatus) {
        const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
        if (!orderMachines.some((m: any) => m.status === filters.machineStatus)) return false;
      }

      return true;
    });
  }, [orders, filters, machineTypes]);

  // ✅ FIX: Flatten rows AND attach orderIndex for correct "No" column numbering
  const flattenedOrderRows = useMemo(() => {
    const rows: any[] = [];
    let orderIdx = 0;

    filteredOrders.forEach((order: any) => {
      const steps = order.steps || [];
      if (steps.length === 0) {
        rows.push({
          order, step: null, stepIndex: -1,
          isFirstRow: true, totalSteps: 0,
          rowKey: `${order._id}-no-step`,
          orderIndex: orderIdx,
        });
        orderIdx++;
      } else {
        steps.forEach((step: any, stepIndex: number) => {
          rows.push({
            order, step, stepIndex,
            isFirstRow: stepIndex === 0,
            totalSteps: steps.length,
            rowKey: `${order._id}-step-${stepIndex}`,
            orderIndex: orderIdx,
          });
        });
        orderIdx++;
      }
    });

    return rows;
  }, [filteredOrders]);

  // ✅ FIX: No client-side slicing — API already returns the correct page of data
  // paginatedRows = all rows from current API page
  const paginatedRows = flattenedOrderRows;

  // ✅ FIX: Total pages from API pagination
  const totalPages = pagination?.totalPages || 1;
  const totalOrderCount = pagination?.totalOrders || filteredOrders.length;

  // Multi-select handlers
  const toggleMachineType = (typeId: string) => {
    setFilters((prev) => ({
      ...prev,
      machineTypeIds: prev.machineTypeIds.includes(typeId)
        ? prev.machineTypeIds.filter((id) => id !== typeId)
        : [...prev.machineTypeIds, typeId],
      machineNames: [],
    }));
  };

  const toggleMachineName = (machineId: string) => {
    setFilters((prev) => ({
      ...prev,
      machineNames: prev.machineNames.includes(machineId)
        ? prev.machineNames.filter((id) => id !== machineId)
        : [...prev.machineNames, machineId],
    }));
  };

  const toggleOperator = (operatorId: string) => {
    setFilters((prev) => ({
      ...prev,
      operatorIds: prev.operatorIds.includes(operatorId)
        ? prev.operatorIds.filter((id) => id !== operatorId)
        : [...prev.operatorIds, operatorId],
    }));
  };

  const toggleStepName = (stepName: string) => {
    setFilters((prev) => ({
      ...prev,
      stepNames: prev.stepNames.includes(stepName)
        ? prev.stepNames.filter((n) => n !== stepName)
        : [...prev.stepNames, stepName],
    }));
  };

  const handleFilterChange = (field: 'status' | 'priority', value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: '', priority: '', machineTypeIds: [], machineNames: [],
      operatorIds: [], orderTypeId: '', stepNames: [], machineStatus: '', search: '',
    });
    setFromDate('');
    setToDate('');
    // fetch will trigger via filtersKey effect
  };

  // Status/priority colors
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'completed': '#22c55e', 'pending': '#eab308', 'in_progress': '#3b82f6',
      'issue': '#ef4444', 'cancelled': '#94a3b8', 'dispatched': '#10b981',
      'approved': '#6366f1', 'Wait for Approval': '#f97316',
    };
    return colors[status] || '#94a3b8';
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      'urgent': '#ef4444', 'high': '#f97316', 'normal': '#3b82f6', 'low': '#94a3b8',
    };
    return colors[priority] || '#94a3b8';
  };

  const getMachineStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'completed': '#22c55e', 'in-progress': '#3b82f6', 'in_progress': '#3b82f6',
      'paused': '#f59e0b', 'pending': '#94a3b8', 'error': '#ef4444',
      'issue': '#ef4444', 'none': '#e2e8f0',
    };
    return colors[status] || '#e2e8f0';
  };

  const getMachineStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="status-icon status-icon--completed" />;
      case 'in-progress':
      case 'in_progress': return <PlayCircle size={16} className="status-icon status-icon--progress" />;
      case 'paused': return <PauseCircle size={16} className="status-icon status-icon--paused" />;
      case 'pending': return <Clock size={16} className="status-icon status-icon--pending" />;
      case 'error':
      case 'issue': return <AlertTriangle size={16} className="status-icon status-icon--error" />;
      default: return <Circle size={16} className="status-icon status-icon--none" />;
    }
  };

  const getStepProgress = (order: any) => {
    if (!order.steps || order.steps.length === 0) return { completed: 0, total: 0, percentage: 0 };
    let totalMachines = 0, completedMachines = 0;
    order.steps.forEach((step: any) => {
      if (step.machines?.length > 0) {
        totalMachines += step.machines.length;
        completedMachines += step.machines.filter((m: any) => m.status === 'completed').length;
      }
    });
    const percentage = totalMachines > 0 ? Math.round(completedMachines / totalMachines * 100) : 0;
    return { completed: completedMachines, total: totalMachines, percentage };
  };

  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes || minutes === 0) return '-';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const availableStepNames = useMemo(() => {
    if (stepsFromFormData?.length > 0) {
      return [...new Set(stepsFromFormData.map((s: any) => s.stepName || s.name).filter(Boolean))].sort() as string[];
    }
    const stepNameSet = new Set<string>();
    orders.forEach((order: any) => {
      order.steps?.forEach((step: any, index: number) => {
        const name = step.stepName || step.name || step.stepId?.stepName || `Step ${index + 1}`;
        if (name) stepNameSet.add(name);
      });
    });
    return Array.from(stepNameSet).sort();
  }, [stepsFromFormData, orders]);

  // Export
  const exportToExcel = () => {
    const csv = [
      ["No", "Order ID", "Company", "Status", "Priority", "Created Date"],
      ...filteredOrders.map((order: any, index: number) => [
        index + 1,
        order.orderNumber || order.orderId || order._id?.slice(-8),
        order.customer?.companyName || order.customerId?.companyName || 'Unknown',
        order.overallStatus || 'Unknown',
        order.priority || 'normal',
        new Date(order.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleRetry = useCallback(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  // ✅ FIX: Navigate to edit — fetch FULL order details first (same as Daybook)
  const handleOrderNavigate = useCallback(async (order: any) => {
    setEditLoading(true);
    try {
      const fullOrderData = await dispatch(fetchOrderDetails(order._id) as any) as any;
      const data = fullOrderData || order;

      navigate('/menu/orderform', {
        state: {
          isEdit: true,
          orderData: data,
          isEditMode: true,
          editMode: true,
          mode: 'edit',
          orderId: data.orderId || data._id,
          customerName: data.customer?.companyName || data.customerId?.companyName,
        },
      });
    } catch {
      // Fallback: navigate with list data if fetch fails
      navigate('/menu/orderform', {
        state: {
          isEdit: true,
          orderData: order,
          isEditMode: true,
          editMode: true,
          mode: 'edit',
          orderId: order.orderId || order._id,
          customerName: order.customer?.companyName || order.customerId?.companyName,
        },
      });
    } finally {
      setEditLoading(false);
    }
  }, [navigate, dispatch]);

  // ✅ FIX: Row click now NAVIGATES (like Daybook) — expand is chevron-button only
  const handleRowClick = useCallback((order: any) => {
    handleOrderNavigate(order);
  }, [handleOrderNavigate]);

  // ✅ Keep expand toggle for the chevron button only
  const toggleExpand = useCallback((orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close if click is outside any trigger button AND outside a portal menu
      const inTrigger = target.closest('.multi-select-dropdown');
      const inMenu = target.closest('.multi-select-menu');
      if (!inTrigger && !inMenu) {
        setMachineTypeDropdownOpen(false);
        setMachineNameDropdownOpen(false);
        setOperatorDropdownOpen(false);
        setStepNameDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedMachineTypesLabel = () => {
    if (filters.machineTypeIds.length === 0) return 'All Machine Types';
    if (filters.machineTypeIds.length === 1) {
      return machineTypes.find((mt: any) => mt._id === filters.machineTypeIds[0])?.type || '1 selected';
    }
    return `${filters.machineTypeIds.length} selected`;
  };

  const getSelectedMachineNamesLabel = () => {
    if (filters.machineNames.length === 0) return 'All Machines';
    if (filters.machineNames.length === 1) {
      return machinesForSelectedTypes.find((m: any) => m._id === filters.machineNames[0] || m.machineName === filters.machineNames[0])?.machineName || '1 selected';
    }
    return `${filters.machineNames.length} selected`;
  };

  const getSelectedOperatorsLabel = () => {
    if (filters.operatorIds.length === 0) return 'All Operators';
    if (filters.operatorIds.length === 1) {
      return availableOperators.find((op) => op.id === filters.operatorIds[0])?.name || '1 selected';
    }
    return `${filters.operatorIds.length} selected`;
  };

  const getSelectedStepNamesLabel = () => {
    if (filters.stepNames.length === 0) return 'All Steps';
    if (filters.stepNames.length === 1) return filters.stepNames[0];
    return `${filters.stepNames.length} selected`;
  };

  // ✅ FIX: Pagination handlers — change page then useEffect [currentPage] fetches
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <div className="all-orders-page">
      {/* Header */}
      <div className="all-orders-header">
        <div className="all-orders-header__left">
          <BackButton />
          <h1 className="all-orders-title">All Orders</h1>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px',
              padding: '4px 10px', borderRadius: '12px',
              backgroundColor: wsConnected ? '#dcfce7' : '#fef2f2',
              fontSize: '12px', fontWeight: 500,
            }}
            title={wsConnected ? 'Real-time updates active' : 'Not connected'}
          >
            {wsConnected ? (
              <><SignalIcon style={{ width: '14px', height: '14px', color: '#16a34a' }} /><span style={{ color: '#16a34a' }}>Live</span></>
            ) : (
              <><SignalSlashIcon style={{ width: '14px', height: '14px', color: '#dc2626' }} /><span style={{ color: '#dc2626' }}>Offline</span></>
            )}
          </div>
        </div>
        <div className="all-orders-header__actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={exportToExcel} title="Export to Excel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#8b5cf6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => window.print()} title="Print Report">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          </button>
          <button style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#f59e0b', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => fetchOrdersData()} title="Refresh Orders">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="all-orders-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Search</label>
            <input type="text" placeholder="Order ID, Company..." value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} className="filter-input" />
          </div>
          <div className="filter-group">
            <label>Order Status</label>
            <select className="filter-native-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Priority</label>
            <select className="filter-native-select" value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)}>
              {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Machine Status</label>
            <select className="filter-native-select" value={filters.machineStatus} onChange={(e) => setFilters((prev) => ({ ...prev, machineStatus: e.target.value }))}>
              {machineStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Order Type</label>
            <select className="filter-native-select" value={filters.orderTypeId} onChange={(e) => setFilters((prev) => ({ ...prev, orderTypeId: e.target.value }))}>
              <option value="">All Order Types</option>
              {orderTypes.map((ot: any) => <option key={ot._id} value={ot._id}>{ot.typeName || ot.name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="filter-input" />
          </div>
          <div className="filter-group">
            <label>To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="filter-input" />
          </div>
        </div>

        <div className="filter-row">
          {/* Machine Type Multi-Select */}
          <div className="filter-group">
            <label>Machine Type</label>
            <div className="multi-select-dropdown">
              <button ref={machineTypeAnchor} className="multi-select-trigger" onClick={() => { setMachineTypeDropdownOpen(p => !p); setMachineNameDropdownOpen(false); setOperatorDropdownOpen(false); setStepNameDropdownOpen(false); }}>
                <span>{getSelectedMachineTypesLabel()}</span>
                <ChevronDownIcon style={{ width: '16px', height: '16px' }} />
              </button>
              <PortalMenu open={machineTypeDropdownOpen} anchorEl={machineTypeAnchor.current}>
                  {machineTypes?.map((mt: any) => (
                    <label key={mt._id} className="multi-select-option">
                      <input type="checkbox" checked={filters.machineTypeIds.includes(mt._id)} onChange={() => toggleMachineType(mt._id)} />
                      <span>{mt.type}</span>
                    </label>
                  ))}
                  {machineTypes?.length === 0 && <div className="multi-select-empty">No machine types available</div>}
              </PortalMenu>
            </div>
            {filters.machineTypeIds.length > 0 && (
              <div className="selected-tags">
                {filters.machineTypeIds.map((typeId) => {
                  const type = machineTypes.find((mt: any) => mt._id === typeId);
                  return <span key={typeId} className="selected-tag">{type?.type}<XMarkIcon style={{ width: '12px', height: '12px' }} onClick={() => toggleMachineType(typeId)} /></span>;
                })}
              </div>
            )}
          </div>

          {/* Machine Name Multi-Select */}
          <div className="filter-group">
            <label>Machine Name</label>
            <div className="multi-select-dropdown">
              <button ref={machineNameAnchor} className="multi-select-trigger" onClick={() => { setMachineNameDropdownOpen(p => !p); setMachineTypeDropdownOpen(false); setOperatorDropdownOpen(false); setStepNameDropdownOpen(false); }}>
                <span>{getSelectedMachineNamesLabel()}</span>
                <ChevronDownIcon style={{ width: '16px', height: '16px' }} />
              </button>
              <PortalMenu open={machineNameDropdownOpen} anchorEl={machineNameAnchor.current}>
                  {machinesForSelectedTypes?.map((m: any) => (
                    <label key={m._id} className="multi-select-option">
                      <input type="checkbox" checked={filters.machineNames.includes(m._id) || filters.machineNames.includes(m.machineName)} onChange={() => toggleMachineName(m._id)} />
                      <span>{m.machineName}</span>
                    </label>
                  ))}
                  {machinesForSelectedTypes?.length === 0 && <div className="multi-select-empty">No machines available</div>}
              </PortalMenu>
            </div>
            {filters.machineNames.length > 0 && (
              <div className="selected-tags">
                {filters.machineNames.map((machineId) => {
                  const machine = machinesForSelectedTypes.find((m: any) => m._id === machineId || m.machineName === machineId);
                  return <span key={machineId} className="selected-tag">{machine?.machineName || machineId}<X size={12} onClick={() => toggleMachineName(machineId)} /></span>;
                })}
              </div>
            )}
          </div>

          {/* Operator Multi-Select */}
          <div className="filter-group">
            <label>Operator</label>
            <div className="multi-select-dropdown">
              <button ref={operatorAnchor} className="multi-select-trigger" onClick={() => { setOperatorDropdownOpen(p => !p); setMachineTypeDropdownOpen(false); setMachineNameDropdownOpen(false); setStepNameDropdownOpen(false); }}>
                <span>{getSelectedOperatorsLabel()}</span>
                <ChevronDownIcon style={{ width: '16px', height: '16px' }} />
              </button>
              <PortalMenu open={operatorDropdownOpen} anchorEl={operatorAnchor.current}>
                  {availableOperators.map((op) => (
                    <label key={op.id} className="multi-select-option">
                      <input type="checkbox" checked={filters.operatorIds.includes(op.id)} onChange={() => toggleOperator(op.id)} />
                      <span>{op.name}</span>
                    </label>
                  ))}
                  {availableOperators.length === 0 && <div className="multi-select-empty">No operators available</div>}
              </PortalMenu>
            </div>
            {filters.operatorIds.length > 0 && (
              <div className="selected-tags">
                {filters.operatorIds.map((opId) => {
                  const operator = availableOperators.find((op) => op.id === opId);
                  return <span key={opId} className="selected-tag">{operator?.name || opId}<XMarkIcon style={{ width: '12px', height: '12px' }} onClick={() => toggleOperator(opId)} /></span>;
                })}
              </div>
            )}
          </div>

          {/* Step Name Multi-Select */}
          <div className="filter-group">
            <label>Step Name</label>
            <div className="multi-select-dropdown">
              <button ref={stepNameAnchor} className="multi-select-trigger" onClick={() => { setStepNameDropdownOpen(p => !p); setMachineTypeDropdownOpen(false); setMachineNameDropdownOpen(false); setOperatorDropdownOpen(false); }}>
                <span>{getSelectedStepNamesLabel()}</span>
                <ChevronDownIcon style={{ width: '16px', height: '16px' }} />
              </button>
              <PortalMenu open={stepNameDropdownOpen} anchorEl={stepNameAnchor.current}>
                  {availableStepNames.map((stepName) => (
                    <label key={stepName} className="multi-select-option">
                      <input type="checkbox" checked={filters.stepNames.includes(stepName)} onChange={() => toggleStepName(stepName)} />
                      <span>{stepName}</span>
                    </label>
                  ))}
                  {availableStepNames.length === 0 && <div className="multi-select-empty">No steps available</div>}
              </PortalMenu>
            </div>
            {filters.stepNames.length > 0 && (
              <div className="selected-tags">
                {filters.stepNames.map((name) => (
                  <span key={name} className="selected-tag">{name}<X size={12} onClick={() => toggleStepName(name)} /></span>
                ))}
              </div>
            )}
          </div>

          <button className="filter-reset-btn" onClick={handleResetFilters}>Reset Filters</button>
        </div>
      </div>

      {/* Orders Table */}
      {ordersLoading ? (
        <div className="loading-state">
          <Loader2 size={32} className="loading-spinner" />
          <p>Loading orders...</p>
        </div>
      ) : ordersError ? (
        <div className="error-state">
          <AlertCircle size={32} className="error-icon" />
          <p className="error-message">{ordersError}</p>
          <button className="retry-btn" onClick={handleRetry}><RefreshCw size={16} /> Retry</button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>{orders.length === 0 ? 'No orders found. Create your first order to get started.' : 'No orders match the current filters.'}</p>
          {orders.length > 0 && <button className="filter-reset-btn" onClick={handleResetFilters}>Clear Filters</button>}
          {orders.length === 0 && <button className="retry-btn" onClick={handleRetry}><RefreshCw size={16} /> Refresh</button>}
        </div>
      ) : (
        <>
          <div className="orders-table-container">
            <table className="orders-table orders-table--step-view">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}></th>
                  <th>No</th>
                  <th>Order ID</th>
                  <th>Company</th>
                  <th>Created By</th>
                  <th>Order Status</th>
                  <th>Priority</th>
                  <th>Step</th>
                  <th>Step Status</th>
                  <th>M. Type</th>
                  <th>Machine</th>
                  <th>M. Status</th>
                  <th>Operator</th>
                  <th>Created</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Forward</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row: any) => {
                  const { order, step, stepIndex, isFirstRow, totalSteps, rowKey, orderIndex } = row;
                  const isExpanded = expandedRows.has(order._id);

                  const stepMachines = step?.machines || [];
                  const uniqueStepTypes = [...new Set(stepMachines.map((m: any) => m.machineType || m.machineTypeName).filter(Boolean))] as string[];
                  const stepMachineNames = stepMachines.map((m: any) => m.machineName).filter(Boolean) as string[];
                  const stepOperators = [...new Set(stepMachines.map((m: any) => m.operatorName || m.operator).filter(Boolean))] as string[];
                  const uniqueStatuses = [...new Set(stepMachines.map((m: any) => m.status).filter(Boolean))] as string[];
                  const stepProgress = getStepProgress(order);

                  const displayOrderNo = isFirstRow ? (currentPage - 1) * itemsPerPage + orderIndex + 1 : '';

                  return (
                    <React.Fragment key={rowKey}>
                      <tr
                        onClick={() => isFirstRow && handleRowClick(order)}
                        className={`clickable-row ${isExpanded ? 'row-expanded' : ''} ${!isFirstRow ? 'row-continuation' : 'row-first'}`}
                        title="Click to open order"
                        style={{ cursor: isFirstRow ? 'pointer' : 'default' }}
                      >
                        <td className="expand-cell">
                          {isFirstRow && (
                            <button className="expand-btn" onClick={(e) => toggleExpand(order._id, e)} title={isExpanded ? 'Collapse' : 'Expand steps'}>
                              {isExpanded ? <ChevronDownIcon style={{ width: '18px', height: '18px' }} /> : <ChevronRightIcon style={{ width: '18px', height: '18px' }} />}
                            </button>
                          )}
                        </td>
                        <td className={!isFirstRow ? 'cell-continuation' : ''}>{displayOrderNo}</td>
                        <td className={`order-id-cell ${!isFirstRow ? 'cell-continuation' : ''}`}>
                          {isFirstRow && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{order.orderNumber || order.orderId || order._id?.slice(-8)}</span>
                              <button
                                className="view-details-btn"
                                onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order._id); setDetailsModalOpen(true); }}
                                title="View full order details"
                                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}
                              >
                                View
                              </button>
                            </div>
                          )}
                        </td>
                        <td className={!isFirstRow ? 'cell-continuation' : ''}>{isFirstRow ? order.customer?.companyName || order.customerId?.companyName || 'Unknown' : ''}</td>
                        <td className={!isFirstRow ? 'cell-continuation' : ''} style={{ fontSize: '12px', color: '#64748b' }}>{isFirstRow ? order.createdByName || order.creator?.username || order.creator?.name || '-' : ''}</td>
                        <td className={!isFirstRow ? 'cell-continuation' : ''}>
                          {isFirstRow && <span className="status-badge" style={{ backgroundColor: getStatusColor(order.overallStatus) }}>{order.overallStatus || 'Unknown'}</span>}
                        </td>
                        <td className={!isFirstRow ? 'cell-continuation' : ''}>
                          {isFirstRow && <span className="priority-badge" style={{ backgroundColor: getPriorityColor(order.priority) }}>{order.priority || 'normal'}</span>}
                        </td>
                        <td className="step-cell">
                          {step ? (
                            <span className="step-name-badge">
                              <span className="step-number">{stepIndex + 1}/{totalSteps}</span>
                              {step.stepName || step.name || step.stepId?.stepName || step.stepId?.name || `Step ${stepIndex + 1}`}
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          {step && <span className="status-badge status-badge--small" style={{ backgroundColor: getMachineStatusColor(step.stepStatus || 'pending') }}>{step.stepStatus || 'pending'}</span>}
                        </td>
                        <td className="type-cell">
                          {uniqueStepTypes.length > 0
                            ? uniqueStepTypes.length === 1 ? uniqueStepTypes[0]
                              : <span title={uniqueStepTypes.join(', ')}>{uniqueStepTypes[0]} <span className="type-count">+{uniqueStepTypes.length - 1}</span></span>
                            : '-'}
                        </td>
                        <td className="machine-cell">
                          {stepMachineNames.length > 0
                            ? stepMachineNames.length === 1 ? stepMachineNames[0]
                              : <span title={stepMachineNames.join(', ')}>{stepMachineNames[0]} <span className="machine-count">+{stepMachineNames.length - 1}</span></span>
                            : '-'}
                        </td>
                        <td>
                          {uniqueStatuses.length > 0
                            ? <span className="status-badge status-badge--small" style={{ backgroundColor: getMachineStatusColor(uniqueStatuses[0]) }} title={uniqueStatuses.join(', ')}>
                                {uniqueStatuses[0]}{uniqueStatuses.length > 1 && <span className="status-count"> +{uniqueStatuses.length - 1}</span>}
                              </span>
                            : '-'}
                        </td>
                        <td>
                          {stepOperators.length > 0
                            ? stepOperators.length === 1 ? stepOperators[0]
                              : <span title={stepOperators.join(', ')}>{stepOperators[0]} <span className="operator-count">+{stepOperators.length - 1}</span></span>
                            : '-'}
                        </td>
                        <td className="date-cell">{isFirstRow ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                        <td style={{ textAlign: 'center' }} className={!isFirstRow ? 'cell-continuation' : ''}>
                          {isFirstRow && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              {order.isForwarded && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 6px', borderRadius: '4px', backgroundColor: order.forwardAcceptanceStatus === 'accepted' ? '#d1fae5' : order.forwardAcceptanceStatus === 'denied' ? '#fee2e2' : '#fef3c7' }} title={`Forwarded: ${order.forwardAcceptanceStatus || 'Pending'}`}>
                                  {order.forwardAcceptanceStatus === 'accepted' ? <CheckCircle2 size={14} style={{ color: '#10b981' }} /> : order.forwardAcceptanceStatus === 'denied' ? <X size={14} style={{ color: '#ef4444' }} /> : <Clock size={14} style={{ color: '#f59e0b' }} />}
                                </div>
                              )}
                              {/* ✅ FIX: Forward button - correct variable name (was selectedOrderForForForward) */}
                              <button
                                className="forward-order-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderForForward({
                                    id: order._id,
                                    number: order.orderNumber || order.orderId || order._id?.slice(-8),
                                  });
                                  setForwardModalOpen(true);
                                }}
                                title="Forward this order"
                                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '13px', fontWeight: '500' }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                              >
                                <Share2 size={14} />
                                Forward
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {isExpanded && isFirstRow && (
                        <tr key={`${order._id}-expanded`} className="expanded-row">
                          <td colSpan={15}>
                            <div className="order-details-expanded">
                              <div className="order-details-grid">
                                {/* Customer Info */}
                                <div className="detail-section">
                                  <h5 className="detail-section-title">Order Information</h5>
                                  <div className="detail-items">
                                    <div className="detail-item"><span className="detail-label">Order ID:</span><span className="detail-value">{order.orderNumber || order.orderId || order._id?.slice(-8)}</span></div>
                                    <div className="detail-item"><span className="detail-label">Customer:</span><span className="detail-value">{order.customer?.companyName || order.customerId?.companyName || 'Unknown'}</span></div>
                                    {(order.customer?.phone1 || order.customer?.telephone) && <div className="detail-item"><span className="detail-label">Phone:</span><span className="detail-value">{order.customer?.phone1 || order.customer?.telephone}</span></div>}
                                    {order.customer?.email && <div className="detail-item"><span className="detail-label">Email:</span><span className="detail-value">{order.customer.email}</span></div>}
                                    {order.orderType && <div className="detail-item"><span className="detail-label">Order Type:</span><span className="detail-value">{order.orderType?.typeName || order.orderType?.name || '-'}</span></div>}
                                  </div>
                                </div>
                                {/* Production Progress */}
                                <div className="detail-section">
                                  <h5 className="detail-section-title">Production Progress</h5>
                                  <div className="detail-items">
                                    <div className="detail-item"><span className="detail-label">Steps:</span><span className="detail-value">{stepProgress.completed}/{stepProgress.total} ({stepProgress.percentage}%)</span></div>
                                    <div className="detail-item"><span className="detail-label">Created:</span><span className="detail-value">{new Date(order.createdAt).toLocaleString()}</span></div>
                                    {order.updatedAt && <div className="detail-item"><span className="detail-label">Updated:</span><span className="detail-value">{new Date(order.updatedAt).toLocaleString()}</span></div>}
                                    {order.Notes && <div className="detail-item detail-item--full"><span className="detail-label">Notes:</span><span className="detail-value">{order.Notes}</span></div>}
                                  </div>
                                </div>
                              </div>

                              {/* Workflow Steps */}
                              {order.steps?.length > 0 && (
                                <div className="step-workflow">
                                  <h5 className="step-workflow-title">Workflow Steps</h5>
                                  <div className="step-flow-container">
                                    {order.steps.map((s: any, sIdx: number) => (
                                      <div key={s._id || sIdx} className="step-card">
                                        <div className="step-header">
                                          <span className="step-number">Step {sIdx + 1}</span>
                                          <span className="step-name">{s.stepName || s.name || `Step ${sIdx + 1}`}</span>
                                        </div>
                                        <div className="step-machines">
                                          {s.machines?.length > 0
                                            ? s.machines.map((machine: any, mIdx: number) => (
                                                <div key={machine._id || mIdx} className="machine-item" style={{ borderLeftColor: getMachineStatusColor(machine.status || 'none') }}>
                                                  <div className="machine-info">
                                                    <div className="machine-status-row">
                                                      {getMachineStatusIcon(machine.status || 'none')}
                                                      <span className="machine-name-text">{machine.machineName || machine.machineId?.machineName || 'Machine'}</span>
                                                    </div>
                                                    <div className="machine-details">
                                                      {(machine.operatorName || machine.operator) && <span className="machine-operator">{machine.operatorName || machine.operator}</span>}
                                                      {(machine.estimatedTime || machine.actualTime) && (
                                                        <span className="machine-time">
                                                          <Clock size={12} />
                                                          {machine.actualTime ? formatDuration(machine.actualTime) : formatDuration(machine.estimatedTime)}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <span className="machine-status-text" style={{ color: getMachineStatusColor(machine.status || 'none') }}>{machine.status || 'none'}</span>
                                                </div>
                                              ))
                                            : <div className="no-machines">No machines assigned</div>}
                                        </div>
                                        {sIdx < order.steps.length - 1 && <div className="step-arrow"><ChevronRightIcon style={{ width: '24px', height: '24px' }} /></div>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="edit-hint">Double-click order row to edit</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ FIX: Pagination — uses server totalPages, buttons update currentPage which triggers fetch */}
          <div className="pagination">
            <button className="pagination-btn" onClick={handlePrevPage} disabled={currentPage === 1 || ordersLoading}>
              <ChevronLeftIcon style={{ width: '16px', height: '16px' }} />
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages} &nbsp;|&nbsp; {orders.length} orders loaded &nbsp;|&nbsp; {totalOrderCount} total
            </span>
            <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage >= totalPages || ordersLoading}>
              Next
              <ChevronRightIcon style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </>
      )}

      {/* ✅ Loading Overlay for row-click navigation */}
      {editLoading && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: 'white', padding: '24px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>Loading order...</span>
          </div>
        </div>
      )}

      <style>{`
        @media print { .all-orders-header__actions, .all-orders-filters, .pagination { display: none !important; } .orders-table { border: 1px solid #000; } .orders-table th, .orders-table td { border: 1px solid #000 !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* ✅ FIX: Forward Order Modal — fixed variable name (was selectedOrderForForForward typo) */}
      {selectedOrderForForward && (
        <ForwardOrderModal
          isOpen={forwardModalOpen}
          onClose={() => { setForwardModalOpen(false); setSelectedOrderForForward(null); }}
          orderId={selectedOrderForForward.id}
          orderNumber={selectedOrderForForward.number}
          onSuccess={() => fetchOrdersData()}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrderId && (
        <OrderDetailsModal
          isOpen={detailsModalOpen}
          orderId={selectedOrderId}
          onClose={() => { setDetailsModalOpen(false); setSelectedOrderId(null); }}
        />
      )}
    </div>
  );
};

export default IndexAllOders;