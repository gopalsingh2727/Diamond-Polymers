import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { BackButton } from "../../../allCompones/BackButton";
import "./indexAllOders.css";
import { Download, Printer, X, ChevronDown, ChevronRight, Loader2, AlertCircle, RefreshCw, Clock, CheckCircle2, Circle, PlayCircle, PauseCircle, AlertTriangle, Wifi, WifiOff } from "lucide-react";

// Import Redux actions
import { fetchOrders } from "../../../redux/oders/OdersActions";
import { getOrderFormDataIfNeeded } from "../../../redux/oders/orderFormDataActions";
import { RootState } from "../../../redux/rootReducer";
import { AppDispatch } from "../../../../store";
import { useDaybookUpdates, useWebSocketStatus } from "../../../../hooks/useWebSocket";  // ✅ WebSocket real-time updates

interface OrderFilters {
  status: string;
  priority: string;
  machineTypeIds: string[];
  machineNames: string[];
  operatorIds: string[];
  orderTypeId: string;
  stepNames: string[];
  machineStatus: string;  // Machine-level status filter
  search: string;
}

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
  // Orders are in state.orders.list (orderListReducer)
  const orders = ordersState?.list?.orders || ordersState?.orders || [];
  const ordersLoading = ordersState?.list?.loading || ordersState?.loading || false;
  const ordersError = ordersState?.list?.error || ordersState?.error || null;

  // Debug logging
  useEffect(() => {
    console.log('📊 Orders State:', ordersState);
    console.log('📊 Orders Array:', orders?.length, 'orders');
    console.log('📊 Order Form Data:', orderFormData);
    console.log('📊 Machine Types:', machineTypes?.length, 'types', machineTypes);
    console.log('📊 Machines:', machines?.length, 'machines', machines);
    console.log('📊 Operators:', operators?.length, 'operators', operators);
    console.log('📊 Order Types:', orderTypes?.length, 'types', orderTypes);
    console.log('📊 Steps from Form Data:', stepsFromFormData?.length, 'steps', stepsFromFormData);
  }, [ordersState, orders, machineTypes, machines, operators, orderTypes, orderFormData, stepsFromFormData]);

  // Local state for filters
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

  // Date range filters - empty by default to show all orders
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Dropdown open states
  const [machineTypeDropdownOpen, setMachineTypeDropdownOpen] = useState(false);
  const [machineNameDropdownOpen, setMachineNameDropdownOpen] = useState(false);
  const [operatorDropdownOpen, setOperatorDropdownOpen] = useState(false);
  const [stepNameDropdownOpen, setStepNameDropdownOpen] = useState(false);

  // Expanded rows for step details
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ✅ ADDED: Force refresh trigger

  // Status and Priority options
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

  // Machine status options (step machine level)
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

  // Helper function to fetch orders
  const fetchOrdersData = useCallback(() => {
    console.log("📋 All Orders - Fetching orders data");
    dispatch(fetchOrders({}));
  }, [dispatch]);

  // Get branchId from auth state for WebSocket subscription
  const authState = useSelector((state: RootState) => state.auth);
  const branchId = (authState as any)?.user?.branchId || localStorage.getItem('branchId') || localStorage.getItem('selectedBranch') || null;

  // ✅ WebSocket status for real-time indicator
  const { isConnected: wsConnected, status: wsStatus } = useWebSocketStatus();

  // Load orders and form data on component mount and navigation back to page
  useEffect(() => {
    console.log("📋 All Orders useEffect triggered - fetching orders (location.key:", location.key, ", refreshTrigger:", refreshTrigger, ")");
    // fetchOrders automatically uses branchId from localStorage for non-admin users
    // Fetch all orders without date filter - client-side filtering will handle dates
    fetchOrdersData();
    // Also load machine types and machines
    dispatch(getOrderFormDataIfNeeded());
  }, [dispatch, fetchOrdersData, location.key, refreshTrigger]);

  // ✅ FIXED: Check for order updates on mount (using state trigger to avoid stale closures)
  useEffect(() => {
    const ordersUpdated = sessionStorage.getItem('orders_updated');
    if (ordersUpdated) {
      console.log("📡 [All Orders] Orders were updated on MOUNT - triggering refresh");
      sessionStorage.removeItem('orders_updated');
      setRefreshTrigger(prev => prev + 1);
    }
  }, []); // Run on mount

  // ✅ FIXED: Also check on any location change (for navigate(-1) back button)
  useEffect(() => {
    const ordersUpdated = sessionStorage.getItem('orders_updated');
    if (ordersUpdated) {
      console.log("📡 [All Orders] Orders were updated on LOCATION CHANGE - triggering refresh");
      sessionStorage.removeItem('orders_updated');
      setRefreshTrigger(prev => prev + 1);
    }
  }, [location]); // Trigger on any location change

  // ✅ WebSocket real-time subscription for live order updates
  const handleOrderUpdate = useCallback(() => {
    console.log("📡 WebSocket: All Orders update received - triggering refresh");
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Subscribe to real-time daybook updates via WebSocket
  useDaybookUpdates(branchId, handleOrderUpdate);

  // ✅ Visibility change listener - refresh when user comes back to page if updates occurred
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ordersUpdated = sessionStorage.getItem('orders_updated');
        if (ordersUpdated) {
          console.log("📡 Page visible + orders were updated - triggering All Orders refresh");
          sessionStorage.removeItem('orders_updated');
          setRefreshTrigger(prev => prev + 1);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Get machines for selected machine types (multiple)
  const machinesForSelectedTypes = useMemo(() => {
    if (filters.machineTypeIds.length === 0) return machines;

    const filteredMachines: any[] = [];
    filters.machineTypeIds.forEach(typeId => {
      const selectedType = machineTypes.find((mt: any) => mt._id === typeId);
      if (selectedType?.machines) {
        filteredMachines.push(...selectedType.machines);
      } else {
        const typeMachines = machines.filter((m: any) => m.machineType?._id === typeId);
        filteredMachines.push(...typeMachines);
      }
    });
    return filteredMachines;
  }, [filters.machineTypeIds, machineTypes, machines]);

  // Get operators - combine API data with operators from orders
  const availableOperators = useMemo(() => {
    const operatorMap = new Map<string, { id: string; name: string }>();

    // First add operators from API (orderFormData)
    operators.forEach((op: any) => {
      if (op._id && op.operatorName) {
        operatorMap.set(op._id, { id: op._id, name: op.operatorName });
      }
    });

    // Also extract operators from orders (in case some are not in the API list)
    orders.forEach((order: any) => {
      const operatorName = order.operator || order.assignedOperator || order.operatorName;
      const operatorId = order.operatorId || order.assignedOperatorId || operatorName;

      if (operatorName && operatorId && !operatorMap.has(operatorId)) {
        operatorMap.set(operatorId, { id: operatorId, name: operatorName });
      }

      // Also check steps for operators
      order.steps?.forEach((step: any) => {
        step.machines?.forEach((machine: any) => {
          const machineOperator = machine.operator || machine.operatorName;
          const machineOperatorId = machine.operatorId || machineOperator;

          if (machineOperator && machineOperatorId && !operatorMap.has(machineOperatorId)) {
            operatorMap.set(machineOperatorId, { id: machineOperatorId, name: machineOperator });
          }
        });
      });
    });

    return Array.from(operatorMap.values());
  }, [operators, orders]);

  // Filter orders based on filters
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    return orders.filter((order: any, index: number) => {
      // Status filter
      if (filters.status && order.overallStatus !== filters.status) return false;

      // Priority filter
      if (filters.priority && order.priority !== filters.priority) return false;

      // Order Type filter
      if (filters.orderTypeId && order.orderTypeId !== filters.orderTypeId &&
          order.orderTypeId?._id !== filters.orderTypeId) return false;

      // Machine Type filter (multiple)
      if (filters.machineTypeIds.length > 0) {
        const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
        const hasMachineType = orderMachines.some((m: any) =>
          filters.machineTypeIds.includes(m.machineType) ||
          filters.machineTypeIds.some(typeId =>
            machineTypes.find((mt: any) => mt._id === typeId)?.type === m.machineType
          )
        );
        if (!hasMachineType) return false;
      }

      // Machine Name filter (multiple)
      if (filters.machineNames.length > 0) {
        const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];

        // Debug: Log first order's machines for troubleshooting
        if (index === 0) {
          console.log('🔍 Machine Filter Debug:', {
            filterMachineNames: filters.machineNames,
            orderMachines: orderMachines.map((m: any) => ({
              machineId: m.machineId,
              machineIdType: typeof m.machineId,
              machineIdStr: m.machineId?.toString?.(),
              machineName: m.machineName,
              _id: m._id
            }))
          });
        }

        const hasMachine = orderMachines.some((m: any) => {
          // Get the machine ID - could be ObjectId, string, or populated object
          const machineIdStr = typeof m.machineId === 'object'
            ? (m.machineId?._id?.toString() || m.machineId?.toString())
            : m.machineId?.toString();

          return filters.machineNames.includes(machineIdStr) ||
            filters.machineNames.includes(m.machineName) ||
            filters.machineNames.includes(m._id?.toString()) ||
            // Also check if the machineId object has a matching _id
            (m.machineId?._id && filters.machineNames.includes(m.machineId._id.toString()));
        });
        if (!hasMachine) return false;
      }

      // Operator filter (multiple)
      if (filters.operatorIds.length > 0) {
        const orderOperator = order.operator || order.assignedOperator || order.operatorName || order.operatorId;
        const stepOperators = order.steps?.flatMap((step: any) =>
          step.machines?.map((m: any) => m.operator || m.operatorName || m.operatorId) || []
        ) || [];

        const allOperators = [orderOperator, ...stepOperators].filter(Boolean);
        const hasOperator = allOperators.some(op => filters.operatorIds.includes(op));
        if (!hasOperator) return false;
      }

      // Step Name filter (multiple)
      if (filters.stepNames.length > 0) {
        const orderStepNames = order.steps?.map((step: any, idx: number) =>
          step.stepName || step.name || step.stepId?.stepName || step.stepId?.name || `Step ${idx + 1}`
        ) || [];
        const hasStepName = orderStepNames.some((name: string) => filters.stepNames.includes(name));
        if (!hasStepName) return false;
      }

      // Machine Status filter (filters orders that have at least one machine with selected status)
      if (filters.machineStatus) {
        const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
        const hasMachineWithStatus = orderMachines.some((m: any) => m.status === filters.machineStatus);
        if (!hasMachineWithStatus) return false;
      }

      // Date range filter
      if (fromDate) {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (orderDate < fromDate) return false;
      }
      if (toDate) {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (orderDate > toDate) return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.orderId?.toLowerCase().includes(searchLower);
        const matchesCompany = order.customer?.companyName?.toLowerCase().includes(searchLower) ||
          order.customerId?.companyName?.toLowerCase().includes(searchLower);
        const matchesId = order._id?.toLowerCase().includes(searchLower);
        if (!matchesOrderNumber && !matchesCompany && !matchesId) return false;
      }

      return true;
    });
  }, [orders, filters, machineTypes, fromDate, toDate]);

  // Flatten orders to show each step as a separate row
  const flattenedOrderRows = useMemo(() => {
    const rows: any[] = [];

    filteredOrders.forEach((order: any) => {
      const steps = order.steps || [];

      if (steps.length === 0) {
        // Order has no steps - show as single row
        rows.push({
          order,
          step: null,
          stepIndex: -1,
          isFirstRow: true,
          totalSteps: 0,
          rowKey: `${order._id}-no-step`
        });
      } else {
        // Order has steps - create a row for each step
        steps.forEach((step: any, stepIndex: number) => {
          rows.push({
            order,
            step,
            stepIndex,
            isFirstRow: stepIndex === 0,
            totalSteps: steps.length,
            rowKey: `${order._id}-step-${stepIndex}`
          });
        });
      }
    });

    return rows;
  }, [filteredOrders]);

  // Paginated rows (now step-based)
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return flattenedOrderRows.slice(startIndex, startIndex + itemsPerPage);
  }, [flattenedOrderRows, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(flattenedOrderRows.length / itemsPerPage);

  // Handle multi-select toggle for Machine Type
  const toggleMachineType = (typeId: string) => {
    setFilters(prev => {
      const newTypes = prev.machineTypeIds.includes(typeId)
        ? prev.machineTypeIds.filter(id => id !== typeId)
        : [...prev.machineTypeIds, typeId];
      return { ...prev, machineTypeIds: newTypes, machineNames: [] }; // Reset machine names when type changes
    });
    setCurrentPage(1);
  };

  // Handle multi-select toggle for Machine Name
  const toggleMachineName = (machineId: string) => {
    setFilters(prev => {
      const newMachines = prev.machineNames.includes(machineId)
        ? prev.machineNames.filter(id => id !== machineId)
        : [...prev.machineNames, machineId];
      return { ...prev, machineNames: newMachines };
    });
    setCurrentPage(1);
  };

  // Handle multi-select toggle for Operator
  const toggleOperator = (operatorId: string) => {
    setFilters(prev => {
      const newOperators = prev.operatorIds.includes(operatorId)
        ? prev.operatorIds.filter(id => id !== operatorId)
        : [...prev.operatorIds, operatorId];
      return { ...prev, operatorIds: newOperators };
    });
    setCurrentPage(1);
  };

  // Handle single select filter change
  const handleFilterChange = (field: 'status' | 'priority', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
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
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    // Re-fetch orders
    dispatch(fetchOrders({}));
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'completed': '#22c55e',
      'pending': '#eab308',
      'in_progress': '#3b82f6',
      'issue': '#ef4444',
      'cancelled': '#94a3b8',
      'dispatched': '#10b981',
      'approved': '#6366f1',
      'Wait for Approval': '#f97316',
    };
    return colors[status] || '#94a3b8';
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      'urgent': '#ef4444',
      'high': '#f97316',
      'normal': '#3b82f6',
      'low': '#94a3b8',
    };
    return colors[priority] || '#94a3b8';
  };

  // Get machine names for display - shows count if many machines
  const getMachineNames = (order: any): React.ReactNode => {
    const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
    if (orderMachines.length === 0) return '-';

    const machineNames: string[] = orderMachines.map((m: any) => m.machineName).filter(Boolean);
    const uniqueMachines: string[] = [...new Set(machineNames)];

    if (uniqueMachines.length === 0) return '-';
    if (uniqueMachines.length <= 2) {
      return uniqueMachines.join(', ');
    }
    // Show first machine + count of others
    return (
      <span title={uniqueMachines.join(', ')}>
        {uniqueMachines[0]} <span className="machine-count">+{uniqueMachines.length - 1}</span>
      </span>
    );
  };

  // Get operator names for display - shows all unique operators
  const getOperatorName = (order: any): React.ReactNode => {
    // Collect all operators from order and steps
    const allOperators: string[] = [];

    // Main order operator
    const mainOperator = order.operator || order.assignedOperator || order.operatorName;
    if (mainOperator) allOperators.push(mainOperator);

    // Step machine operators
    order.steps?.forEach((step: any) => {
      step.machines?.forEach((m: any) => {
        const op = m.operator || m.operatorName;
        if (op && !allOperators.includes(op)) {
          allOperators.push(op);
        }
      });
    });

    if (allOperators.length === 0) return '-';
    if (allOperators.length === 1) return allOperators[0];

    // Show first operator + count of others
    return (
      <span title={allOperators.join(', ')}>
        {allOperators[0]} <span className="operator-count">+{allOperators.length - 1}</span>
      </span>
    );
  };

  // Get step/machine summary for display
  const getStepMachineSummary = (order: any): { steps: number; machines: number; completed: number } => {
    const steps = order.steps?.length || 0;
    let machines = 0;
    let completed = 0;

    order.steps?.forEach((step: any) => {
      const stepMachines = step.machines || [];
      machines += stepMachines.length;
      completed += stepMachines.filter((m: any) => m.status === 'completed').length;
    });

    return { steps, machines, completed };
  };

  // Get step names for display
  const getStepNames = (order: any): React.ReactNode => {
    const steps = order.steps || [];
    if (steps.length === 0) return '-';

    const stepNames = steps.map((s: any) => s.stepName || s.name).filter(Boolean);
    if (stepNames.length === 0) return '-';
    if (stepNames.length === 1) return stepNames[0];

    return (
      <span title={stepNames.join(' → ')}>
        {stepNames[0]} <span className="step-count">+{stepNames.length - 1}</span>
      </span>
    );
  };

  // Get machine types for display
  const getMachineTypes = (order: any): React.ReactNode => {
    const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
    if (orderMachines.length === 0) return '-';

    const types: string[] = orderMachines.map((m: any) => m.machineType || m.machineTypeName).filter(Boolean);
    const uniqueTypes: string[] = [...new Set(types)];

    if (uniqueTypes.length === 0) return '-';
    if (uniqueTypes.length === 1) return uniqueTypes[0];

    return (
      <span title={uniqueTypes.join(', ')}>
        {uniqueTypes[0]} <span className="type-count">+{uniqueTypes.length - 1}</span>
      </span>
    );
  };

  // Get available step names from form data (all steps for the branch) or from orders
  const availableStepNames = useMemo(() => {
    // First try to get steps from form data API (all available steps for the branch)
    if (stepsFromFormData && stepsFromFormData.length > 0) {
      const stepNames = stepsFromFormData
        .map((s: any) => s.stepName || s.name)
        .filter(Boolean);
      return [...new Set(stepNames)].sort() as string[];
    }

    // Fallback: extract step names from orders
    const stepNameSet = new Set<string>();
    orders.forEach((order: any) => {
      order.steps?.forEach((step: any, index: number) => {
        // Try to get actual step name, or use populated stepId name, or generate one
        const name = step.stepName || step.name || step.stepId?.stepName || step.stepId?.name || `Step ${index + 1}`;
        if (name) stepNameSet.add(name);
      });
    });
    return Array.from(stepNameSet).sort();
  }, [stepsFromFormData, orders]);

  // Debug log for step names
  useEffect(() => {
    console.log('📋 Available Step Names:', availableStepNames);
    console.log('📋 Steps from Form Data:', stepsFromFormData?.length, stepsFromFormData);
    if (orders?.[0]?.steps?.[0]) {
      console.log('📋 Sample order step FULL:', JSON.stringify(orders[0].steps[0], null, 2));
      console.log('📋 Step keys:', Object.keys(orders[0].steps[0]));
    }
  }, [availableStepNames, stepsFromFormData, orders]);

  // Toggle step name filter
  const toggleStepName = (stepName: string) => {
    setFilters(prev => {
      const newStepNames = prev.stepNames.includes(stepName)
        ? prev.stepNames.filter(n => n !== stepName)
        : [...prev.stepNames, stepName];
      return { ...prev, stepNames: newStepNames };
    });
    setCurrentPage(1);
  };

  // Get selected step names label
  const getSelectedStepNamesLabel = () => {
    if (filters.stepNames.length === 0) return 'All Steps';
    if (filters.stepNames.length === 1) return filters.stepNames[0];
    return `${filters.stepNames.length} selected`;
  };

  // Format duration in minutes to display string (e.g., 30m, 1h 15m)
  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes || minutes === 0) return '-';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get machine status icon
  const getMachineStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="status-icon status-icon--completed" />;
      case 'in-progress':
      case 'in_progress':
        return <PlayCircle size={16} className="status-icon status-icon--progress" />;
      case 'paused':
        return <PauseCircle size={16} className="status-icon status-icon--paused" />;
      case 'pending':
        return <Clock size={16} className="status-icon status-icon--pending" />;
      case 'error':
      case 'issue':
        return <AlertTriangle size={16} className="status-icon status-icon--error" />;
      default:
        return <Circle size={16} className="status-icon status-icon--none" />;
    }
  };

  // Get machine status color
  const getMachineStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'completed': '#22c55e',
      'in-progress': '#3b82f6',
      'in_progress': '#3b82f6',
      'paused': '#f59e0b',
      'pending': '#94a3b8',
      'error': '#ef4444',
      'issue': '#ef4444',
      'none': '#e2e8f0',
    };
    return colors[status] || '#e2e8f0';
  };

  // Calculate step progress
  const getStepProgress = (order: any): { completed: number; total: number; percentage: number } => {
    if (!order.steps || order.steps.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    let totalMachines = 0;
    let completedMachines = 0;

    order.steps.forEach((step: any) => {
      if (step.machines && step.machines.length > 0) {
        totalMachines += step.machines.length;
        completedMachines += step.machines.filter((m: any) =>
          m.status === 'completed'
        ).length;
      }
    });

    const percentage = totalMachines > 0 ? Math.round((completedMachines / totalMachines) * 100) : 0;
    return { completed: completedMachines, total: totalMachines, percentage };
  };

  // Helper for export - get all machine names as string
  const getMachineNamesForExport = (order: any): string => {
    const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
    const machineNames = orderMachines.map((m: any) => m.machineName).filter(Boolean);
    return [...new Set(machineNames)].join(', ') || '-';
  };

  // Helper for export - get all operator names as string
  const getOperatorNamesForExport = (order: any): string => {
    const allOperators: string[] = [];
    const mainOperator = order.operator || order.assignedOperator || order.operatorName;
    if (mainOperator) allOperators.push(mainOperator);
    order.steps?.forEach((step: any) => {
      step.machines?.forEach((m: any) => {
        const op = m.operator || m.operatorName;
        if (op && !allOperators.includes(op)) allOperators.push(op);
      });
    });
    return allOperators.join(', ') || '-';
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredOrders;
    const csv = [
      ["No", "Order ID", "Company", "Status", "Priority", "Steps", "Machines", "Operators", "End Date", "Created Date"],
      ...data.map((order: any, index: number) => {
        const summary = getStepMachineSummary(order);
        return [
          index + 1,
          order.orderNumber || order.orderId || order._id?.slice(-8),
          order.customer?.companyName || order.customerId?.companyName || 'Unknown',
          order.overallStatus || 'Unknown',
          order.priority || 'normal',
          `${summary.steps} steps`,
          getMachineNamesForExport(order),
          getOperatorNamesForExport(order),
          order.endDate || order.expectedEndDate || order.dueDate
            ? new Date(order.endDate || order.expectedEndDate || order.dueDate).toLocaleDateString()
            : '-',
          new Date(order.createdAt).toLocaleDateString(),
        ];
      }),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Retry loading orders
  const handleRetry = useCallback(() => {
    dispatch(fetchOrders({}));
  }, [dispatch]);

  // Navigate to order details/edit (on double-click)
  const handleOrderDoubleClick = useCallback((order: any) => {
    navigate("/menu/orderform", {
      state: {
        isEdit: true,
        orderData: order,
        isEditMode: true,
        editMode: true,
        mode: 'edit',
        orderId: order.orderId || order._id,
        customerName: order.customer?.companyName || order.customerId?.companyName
      }
    });
  }, [navigate]);

  // Handle row click - toggle expand
  const handleRowClick = useCallback((orderId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.multi-select-dropdown')) {
        setMachineTypeDropdownOpen(false);
        setMachineNameDropdownOpen(false);
        setOperatorDropdownOpen(false);
        setStepNameDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected labels for display
  const getSelectedMachineTypesLabel = () => {
    if (filters.machineTypeIds.length === 0) return 'All Machine Types';
    if (filters.machineTypeIds.length === 1) {
      const type = machineTypes.find((mt: any) => mt._id === filters.machineTypeIds[0]);
      return type?.type || '1 selected';
    }
    return `${filters.machineTypeIds.length} selected`;
  };

  const getSelectedMachineNamesLabel = () => {
    if (filters.machineNames.length === 0) return 'All Machines';
    if (filters.machineNames.length === 1) {
      const machine = machinesForSelectedTypes.find((m: any) => m._id === filters.machineNames[0] || m.machineName === filters.machineNames[0]);
      return machine?.machineName || '1 selected';
    }
    return `${filters.machineNames.length} selected`;
  };

  const getSelectedOperatorsLabel = () => {
    if (filters.operatorIds.length === 0) return 'All Operators';
    if (filters.operatorIds.length === 1) {
      const operator = availableOperators.find(op => op.id === filters.operatorIds[0]);
      return operator?.name || '1 selected';
    }
    return `${filters.operatorIds.length} selected`;
  };

  return (
    <div className="all-orders-page">
      {/* Header */}
      <div className="all-orders-header">
        <div className="all-orders-header__left">
          <BackButton />
          <h1 className="all-orders-title">All Orders</h1>
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
            title={wsConnected ? 'Real-time updates active' : 'Not connected - updates require manual refresh'}
          >
            {wsConnected ? (
              <>
                <Wifi size={14} style={{ color: '#16a34a' }} />
                <span style={{ color: '#16a34a' }}>Live</span>
              </>
            ) : (
              <>
                <WifiOff size={14} style={{ color: '#dc2626' }} />
                <span style={{ color: '#dc2626' }}>Offline</span>
              </>
            )}
          </div>
        </div>
        <div className="all-orders-header__actions">
          <button className="action-btn action-btn--export" onClick={exportToExcel}>
            <Download size={16} /> Export
          </button>
          <button className="action-btn action-btn--print" onClick={handlePrint}>
            <Printer size={16} /> Print
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
              placeholder="Order ID, Company..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Order Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Machine Status</label>
            <select
              value={filters.machineStatus}
              onChange={(e) => { setFilters(prev => ({ ...prev, machineStatus: e.target.value })); setCurrentPage(1); }}
              className="filter-select"
            >
              {machineStatusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Order Type</label>
            <select
              value={filters.orderTypeId}
              onChange={(e) => setFilters(prev => ({ ...prev, orderTypeId: e.target.value }))}
              className="filter-select"
            >
              <option value="">All Order Types</option>
              {orderTypes.map((ot: any) => (
                <option key={ot._id} value={ot._id}>{ot.typeName || ot.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filter-row">
          {/* Machine Type Multi-Select */}
          <div className="filter-group">
            <label>Machine Type</label>
            <div className="multi-select-dropdown">
              <button
                className="multi-select-trigger"
                onClick={() => {
                  setMachineTypeDropdownOpen(!machineTypeDropdownOpen);
                  setMachineNameDropdownOpen(false);
                  setOperatorDropdownOpen(false);
                }}
              >
                <span>{getSelectedMachineTypesLabel()}</span>
                <ChevronDown size={16} />
              </button>
              {machineTypeDropdownOpen && (
                <div className="multi-select-menu">
                  {machineTypes?.map((mt: any) => (
                    <label key={mt._id} className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={filters.machineTypeIds.includes(mt._id)}
                        onChange={() => toggleMachineType(mt._id)}
                      />
                      <span>{mt.type}</span>
                    </label>
                  ))}
                  {machineTypes?.length === 0 && (
                    <div className="multi-select-empty">No machine types available</div>
                  )}
                </div>
              )}
            </div>
            {filters.machineTypeIds.length > 0 && (
              <div className="selected-tags">
                {filters.machineTypeIds.map(typeId => {
                  const type = machineTypes.find((mt: any) => mt._id === typeId);
                  return (
                    <span key={typeId} className="selected-tag">
                      {type?.type}
                      <X size={12} onClick={() => toggleMachineType(typeId)} />
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Machine Name Multi-Select */}
          <div className="filter-group">
            <label>Machine Name</label>
            <div className="multi-select-dropdown">
              <button
                className="multi-select-trigger"
                onClick={() => {
                  setMachineNameDropdownOpen(!machineNameDropdownOpen);
                  setMachineTypeDropdownOpen(false);
                  setOperatorDropdownOpen(false);
                }}
              >
                <span>{getSelectedMachineNamesLabel()}</span>
                <ChevronDown size={16} />
              </button>
              {machineNameDropdownOpen && (
                <div className="multi-select-menu">
                  {machinesForSelectedTypes?.map((m: any) => (
                    <label key={m._id} className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={filters.machineNames.includes(m._id) || filters.machineNames.includes(m.machineName)}
                        onChange={() => toggleMachineName(m._id)}
                      />
                      <span>{m.machineName}</span>
                    </label>
                  ))}
                  {machinesForSelectedTypes?.length === 0 && (
                    <div className="multi-select-empty">No machines available</div>
                  )}
                </div>
              )}
            </div>
            {filters.machineNames.length > 0 && (
              <div className="selected-tags">
                {filters.machineNames.map(machineId => {
                  const machine = machinesForSelectedTypes.find((m: any) => m._id === machineId || m.machineName === machineId);
                  return (
                    <span key={machineId} className="selected-tag">
                      {machine?.machineName || machineId}
                      <X size={12} onClick={() => toggleMachineName(machineId)} />
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operator Multi-Select */}
          <div className="filter-group">
            <label>Operator</label>
            <div className="multi-select-dropdown">
              <button
                className="multi-select-trigger"
                onClick={() => {
                  setOperatorDropdownOpen(!operatorDropdownOpen);
                  setMachineTypeDropdownOpen(false);
                  setMachineNameDropdownOpen(false);
                }}
              >
                <span>{getSelectedOperatorsLabel()}</span>
                <ChevronDown size={16} />
              </button>
              {operatorDropdownOpen && (
                <div className="multi-select-menu">
                  {availableOperators.map((op) => (
                    <label key={op.id} className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={filters.operatorIds.includes(op.id)}
                        onChange={() => toggleOperator(op.id)}
                      />
                      <span>{op.name}</span>
                    </label>
                  ))}
                  {availableOperators.length === 0 && (
                    <div className="multi-select-empty">No operators available</div>
                  )}
                </div>
              )}
            </div>
            {filters.operatorIds.length > 0 && (
              <div className="selected-tags">
                {filters.operatorIds.map(opId => {
                  const operator = availableOperators.find(op => op.id === opId);
                  return (
                    <span key={opId} className="selected-tag">
                      {operator?.name || opId}
                      <X size={12} onClick={() => toggleOperator(opId)} />
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step Name Multi-Select */}
          <div className="filter-group">
            <label>Step Name</label>
            <div className="multi-select-dropdown">
              <button
                className="multi-select-trigger"
                onClick={() => {
                  setStepNameDropdownOpen(!stepNameDropdownOpen);
                  setMachineTypeDropdownOpen(false);
                  setMachineNameDropdownOpen(false);
                  setOperatorDropdownOpen(false);
                }}
              >
                <span>{getSelectedStepNamesLabel()}</span>
                <ChevronDown size={16} />
              </button>
              {stepNameDropdownOpen && (
                <div className="multi-select-menu">
                  {availableStepNames.map((stepName) => (
                    <label key={stepName} className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={filters.stepNames.includes(stepName)}
                        onChange={() => toggleStepName(stepName)}
                      />
                      <span>{stepName}</span>
                    </label>
                  ))}
                  {availableStepNames.length === 0 && (
                    <div className="multi-select-empty">No steps available</div>
                  )}
                </div>
              )}
            </div>
            {filters.stepNames.length > 0 && (
              <div className="selected-tags">
                {filters.stepNames.map(name => (
                  <span key={name} className="selected-tag">
                    {name}
                    <X size={12} onClick={() => toggleStepName(name)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <button className="filter-reset-btn" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Summary Cards - Compact with all statuses - Clickable to filter */}
      <div className="summary-cards summary-cards--compact">
        <div
          className={`summary-card summary-card--mini summary-card--clickable ${filters.status === '' ? 'summary-card--active' : ''}`}
          onClick={() => { handleFilterChange('status', ''); setCurrentPage(1); }}
          title="Show all orders"
        >
          <div className="summary-card__value">{orders.length}</div>
          <div className="summary-card__label">Total</div>
        </div>
        <div
          className={`summary-card summary-card--mini summary-card--waiting summary-card--clickable ${filters.status === 'Wait for Approval' ? 'summary-card--active' : ''}`}
          onClick={() => { handleFilterChange('status', 'Wait for Approval'); setCurrentPage(1); }}
          title="Filter: Wait for Approval"
        >
          <div className="summary-card__value">
            {orders.filter((o: any) => o.overallStatus === 'Wait for Approval').length}
          </div>
          <div className="summary-card__label">Waiting</div>
        </div>
        <div
          className={`summary-card summary-card--mini summary-card--pending summary-card--clickable ${filters.status === 'pending' ? 'summary-card--active' : ''}`}
          onClick={() => { handleFilterChange('status', 'pending'); setCurrentPage(1); }}
          title="Filter: Pending"
        >
          <div className="summary-card__value">
            {orders.filter((o: any) => o.overallStatus === 'pending').length}
          </div>
          <div className="summary-card__label">Pending</div>
        </div>
        <div
          className={`summary-card summary-card--mini summary-card--approved summary-card--clickable ${filters.status === 'approved' ? 'summary-card--active' : ''}`}
          onClick={() => { handleFilterChange('status', 'approved'); setCurrentPage(1); }}
          title="Filter: Approved"
        >
          <div className="summary-card__value">
            {orders.filter((o: any) => o.overallStatus === 'approved').length}
          </div>
          <div className="summary-card__label">Approved</div>
        </div>
        <div
          className={`summary-card summary-card--mini summary-card--progress summary-card--clickable ${filters.status === 'in_progress' ? 'summary-card--active' : ''}`}
          onClick={() => { handleFilterChange('status', 'in_progress'); setCurrentPage(1); }}
          title="Filter: In Progress"
        >
          <div className="summary-card__value">
            {orders.filter((o: any) => o.overallStatus === 'in_progress').length}
          </div>
          <div className="summary-card__label">In Progress</div>
        </div>
        <div
          className={`summary-card summary-card--mini summary-card--completed summary-card--clickable ${filters.status === 'completed' ? 'summary-card--active' : ''}`}
          onClick={() => { handleFilterChange('status', 'completed'); setCurrentPage(1); }}
          title="Filter: Completed"
        >
          <div className="summary-card__value">
            {orders.filter((o: any) => o.overallStatus === 'completed').length}
          </div>
          <div className="summary-card__label">Completed</div>
        </div>
        <div
          className={`summary-card summary-card--mini summary-card--dispatched summary-card--clickable ${filters.status === 'dispatched' ? 'summary-card--active' : ''}`}
          onClick={() => { handleFilterChange('status', 'dispatched'); setCurrentPage(1); }}
          title="Filter: Dispatched"
        >
          <div className="summary-card__value">
            {orders.filter((o: any) => o.overallStatus === 'dispatched').length}
          </div>
          <div className="summary-card__label">Dispatched</div>
        </div>
        <div
          className={`summary-card summary-card--mini summary-card--issue summary-card--clickable ${filters.status === 'issue' ? 'summary-card--active' : ''}`}
          onClick={() => { handleFilterChange('status', 'issue'); setCurrentPage(1); }}
          title="Filter: Issue"
        >
          <div className="summary-card__value">
            {orders.filter((o: any) => o.overallStatus === 'issue').length}
          </div>
          <div className="summary-card__label">Issue</div>
        </div>
        <div
          className={`summary-card summary-card--mini summary-card--cancelled summary-card--clickable ${filters.status === 'cancelled' ? 'summary-card--active' : ''}`}
          onClick={() => { handleFilterChange('status', 'cancelled'); setCurrentPage(1); }}
          title="Filter: Cancelled"
        >
          <div className="summary-card__value">
            {orders.filter((o: any) => o.overallStatus === 'cancelled').length}
          </div>
          <div className="summary-card__label">Cancelled</div>
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
          <button className="retry-btn" onClick={handleRetry}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>{orders.length === 0 ? 'No orders found. Create your first order to get started.' : 'No orders found matching the filters'}</p>
          {orders.length > 0 && (
            <button className="filter-reset-btn" onClick={handleResetFilters}>
              Clear Filters
            </button>
          )}
          {orders.length === 0 && (
            <button className="retry-btn" onClick={handleRetry}>
              <RefreshCw size={16} /> Refresh
            </button>
          )}
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
                  <th>Order Status</th>
                  <th>Priority</th>
                  <th>Step</th>
                  <th>Step Status</th>
                  <th>M. Type</th>
                  <th>Machine</th>
                  <th>M. Status</th>
                  <th>Operator</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row: any, index: number) => {
                  const { order, step, stepIndex, isFirstRow, totalSteps, rowKey } = row;
                  const isExpanded = expandedRows.has(order._id);

                  // Get machines from step
                  const stepMachines = step?.machines || [];

                  // Get machine types from this step's machines
                  const stepMachineTypes = stepMachines
                    .map((m: any) => m.machineType || m.machineTypeName)
                    .filter(Boolean) as string[];
                  const uniqueStepTypes = [...new Set(stepMachineTypes)] as string[];

                  // Get machine names from this step
                  const stepMachineNames = stepMachines
                    .map((m: any) => m.machineName)
                    .filter(Boolean) as string[];

                  // Get operators from this step's machines
                  const stepOperators = stepMachines
                    .map((m: any) => m.operatorName || m.operator)
                    .filter(Boolean) as string[];
                  const uniqueStepOperators = [...new Set(stepOperators)] as string[];

                  // Get machine statuses from this step
                  const machineStatuses = stepMachines
                    .map((m: any) => m.status)
                    .filter(Boolean) as string[];
                  const uniqueStatuses = [...new Set(machineStatuses)] as string[];

                  // Calculate step progress for expanded view
                  const stepProgress = getStepProgress(order);

                  // Check if order has steps for expanded view
                  const hasSteps = order.steps && order.steps.length > 0;

                  return (
                    <React.Fragment key={rowKey}>
                      <tr
                        onClick={() => handleRowClick(order._id)}
                        onDoubleClick={() => handleOrderDoubleClick(order)}
                        className={`clickable-row ${isExpanded ? 'row-expanded' : ''} ${!isFirstRow ? 'row-continuation' : 'row-first'}`}
                        title="Click to expand, Double-click to edit"
                      >
                        <td className="expand-cell">
                          {isFirstRow && (
                            <button
                              className="expand-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(order._id);
                              }}
                              title={isExpanded ? 'Collapse' : 'Expand details'}
                            >
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                          )}
                        </td>
                        <td className={!isFirstRow ? 'cell-continuation' : ''}>
                          {isFirstRow ? (currentPage - 1) * itemsPerPage + index + 1 : ''}
                        </td>
                        <td className={`order-id-cell ${!isFirstRow ? 'cell-continuation' : ''}`}>
                          {isFirstRow ? (order.orderNumber || order.orderId || order._id?.slice(-8)) : ''}
                        </td>
                        <td className={!isFirstRow ? 'cell-continuation' : ''}>
                          {isFirstRow ? (order.customer?.companyName || order.customerId?.companyName || 'Unknown') : ''}
                        </td>
                        <td className={!isFirstRow ? 'cell-continuation' : ''}>
                          {isFirstRow ? (
                            <span
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(order.overallStatus) }}
                            >
                              {order.overallStatus || 'Unknown'}
                            </span>
                          ) : ''}
                        </td>
                        <td className={!isFirstRow ? 'cell-continuation' : ''}>
                          {isFirstRow ? (
                            <span
                              className="priority-badge"
                              style={{ backgroundColor: getPriorityColor(order.priority) }}
                            >
                              {order.priority || 'normal'}
                            </span>
                          ) : ''}
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
                          {step ? (
                            <span
                              className="status-badge status-badge--small"
                              style={{ backgroundColor: getMachineStatusColor(step.stepStatus || 'pending') }}
                            >
                              {step.stepStatus || 'pending'}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="type-cell">
                          {uniqueStepTypes.length > 0 ? (
                            uniqueStepTypes.length === 1 ? uniqueStepTypes[0] : (
                              <span title={uniqueStepTypes.join(', ')}>
                                {uniqueStepTypes[0]} <span className="type-count">+{uniqueStepTypes.length - 1}</span>
                              </span>
                            )
                          ) : '-'}
                        </td>
                        <td className="machine-cell">
                          {stepMachineNames.length > 0 ? (
                            stepMachineNames.length === 1 ? stepMachineNames[0] : (
                              <span title={stepMachineNames.join(', ')}>
                                {stepMachineNames[0]} <span className="machine-count">+{stepMachineNames.length - 1}</span>
                              </span>
                            )
                          ) : '-'}
                        </td>
                        <td>
                          {uniqueStatuses.length > 0 ? (
                            <span
                              className="status-badge status-badge--small"
                              style={{ backgroundColor: getMachineStatusColor(uniqueStatuses[0] || 'none') }}
                              title={uniqueStatuses.join(', ')}
                            >
                              {uniqueStatuses[0]}
                              {uniqueStatuses.length > 1 && <span className="status-count"> +{uniqueStatuses.length - 1}</span>}
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          {uniqueStepOperators.length > 0 ? (
                            uniqueStepOperators.length === 1 ? uniqueStepOperators[0] : (
                              <span title={uniqueStepOperators.join(', ')}>
                                {uniqueStepOperators[0]} <span className="operator-count">+{uniqueStepOperators.length - 1}</span>
                              </span>
                            )
                          ) : '-'}
                        </td>
                        <td className="date-cell">
                          {isFirstRow ? new Date(order.createdAt).toLocaleDateString() : ''}
                        </td>
                      </tr>

                      {/* Expanded Row - Order Details - Only show on first row of each order */}
                      {isExpanded && isFirstRow && (
                        <tr key={`${order._id}-expanded`} className="expanded-row">
                          <td colSpan={13}>
                            <div className="order-details-expanded">
                              {/* Order Info Grid */}
                              <div className="order-details-grid">
                                {/* Customer & Order Info */}
                                <div className="detail-section">
                                  <h5 className="detail-section-title">Order Information</h5>
                                  <div className="detail-items">
                                    <div className="detail-item">
                                      <span className="detail-label">Order ID:</span>
                                      <span className="detail-value">{order.orderNumber || order.orderId || order._id?.slice(-8)}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Customer:</span>
                                      <span className="detail-value">{order.customer?.companyName || order.customerId?.companyName || 'Unknown'}</span>
                                    </div>
                                    {(order.customer?.phone1 || order.customer?.telephone) && (
                                      <div className="detail-item">
                                        <span className="detail-label">Phone:</span>
                                        <span className="detail-value">{order.customer?.phone1 || order.customer?.telephone}</span>
                                      </div>
                                    )}
                                    {order.customer?.email && (
                                      <div className="detail-item">
                                        <span className="detail-label">Email:</span>
                                        <span className="detail-value">{order.customer.email}</span>
                                      </div>
                                    )}
                                    {order.orderType && (
                                      <div className="detail-item">
                                        <span className="detail-label">Order Type:</span>
                                        <span className="detail-value">{order.orderType?.typeName || order.orderType?.name || '-'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Options & Specifications */}
                                <div className="detail-section">
                                  <h5 className="detail-section-title">Options & Specifications</h5>
                                  <div className="detail-items">
                                    {order.options && order.options.length > 0 ? (
                                      order.options.map((opt: any, idx: number) => (
                                        <div key={idx} className="detail-item">
                                          <span className="detail-label">{opt.optionTypeName || opt.category || 'Option'}:</span>
                                          <span className="detail-value">{opt.optionName || opt.value}</span>
                                        </div>
                                      ))
                                    ) : (
                                      <>
                                        {order.material?.materialName && (
                                          <div className="detail-item">
                                            <span className="detail-label">Material:</span>
                                            <span className="detail-value">{order.material.materialName}</span>
                                          </div>
                                        )}
                                        {order.materialWeight && (
                                          <div className="detail-item">
                                            <span className="detail-label">Weight:</span>
                                            <span className="detail-value">{order.materialWeight} kg</span>
                                          </div>
                                        )}
                                        {(order.Width || order.Height) && (
                                          <div className="detail-item">
                                            <span className="detail-label">Dimensions:</span>
                                            <span className="detail-value">
                                              {order.Width} × {order.Height} {order.Thickness ? `× ${order.Thickness}` : ''}
                                            </span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {order.totalQuantity && (
                                      <div className="detail-item">
                                        <span className="detail-label">Quantity:</span>
                                        <span className="detail-value">{order.totalQuantity}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Production Progress */}
                                <div className="detail-section">
                                  <h5 className="detail-section-title">Production Progress</h5>
                                  <div className="detail-items">
                                    <div className="detail-item">
                                      <span className="detail-label">Steps:</span>
                                      <span className="detail-value">{stepProgress.completed}/{stepProgress.total} ({stepProgress.percentage}%)</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Created:</span>
                                      <span className="detail-value">{new Date(order.createdAt).toLocaleString()}</span>
                                    </div>
                                    {order.updatedAt && (
                                      <div className="detail-item">
                                        <span className="detail-label">Updated:</span>
                                        <span className="detail-value">{new Date(order.updatedAt).toLocaleString()}</span>
                                      </div>
                                    )}
                                    {order.Notes && (
                                      <div className="detail-item detail-item--full">
                                        <span className="detail-label">Notes:</span>
                                        <span className="detail-value">{order.Notes}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Step Workflow - only if has steps */}
                              {hasSteps && (
                                <div className="step-workflow">
                                  <h5 className="step-workflow-title">Workflow Steps</h5>
                                  <div className="step-flow-container">
                                    {order.steps.map((step: any, stepIndex: number) => (
                                      <div key={step._id || stepIndex} className="step-card">
                                        <div className="step-header">
                                          <span className="step-number">Step {stepIndex + 1}</span>
                                          <span className="step-name">{step.stepName || step.name || `Step ${stepIndex + 1}`}</span>
                                        </div>
                                        <div className="step-machines">
                                          {step.machines && step.machines.length > 0 ? (
                                            step.machines.map((machine: any, machineIndex: number) => (
                                              <div
                                                key={machine._id || machineIndex}
                                                className="machine-item"
                                                style={{ borderLeftColor: getMachineStatusColor(machine.status || 'none') }}
                                              >
                                                <div className="machine-info">
                                                  <div className="machine-status-row">
                                                    {getMachineStatusIcon(machine.status || 'none')}
                                                    <span className="machine-name-text">
                                                      {machine.machineName || machine.machineId?.machineName || 'Machine'}
                                                    </span>
                                                  </div>
                                                  <div className="machine-details">
                                                    {machine.operatorName || machine.operator ? (
                                                      <span className="machine-operator">
                                                        {machine.operatorName || machine.operator}
                                                      </span>
                                                    ) : null}
                                                    {(machine.estimatedTime || machine.actualTime) && (
                                                      <span className="machine-time">
                                                        <Clock size={12} />
                                                        {machine.actualTime
                                                          ? formatDuration(machine.actualTime)
                                                          : formatDuration(machine.estimatedTime)}
                                                        {machine.actualTime && machine.estimatedTime && (
                                                          <span className={`time-diff ${machine.actualTime > machine.estimatedTime ? 'over' : 'under'}`}>
                                                            ({machine.actualTime > machine.estimatedTime ? '+' : '-'}
                                                            {formatDuration(Math.abs(machine.actualTime - machine.estimatedTime))})
                                                          </span>
                                                        )}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                                <span
                                                  className="machine-status-text"
                                                  style={{ color: getMachineStatusColor(machine.status || 'none') }}
                                                >
                                                  {machine.status || 'none'}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="no-machines">No machines assigned</div>
                                          )}
                                        </div>
                                        {/* Flow Arrow */}
                                        {stepIndex < order.steps.length - 1 && (
                                          <div className="step-arrow">
                                            <ChevronRight size={24} />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Edit Hint */}
                              <div className="edit-hint">
                                Double-click order row to edit
                              </div>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({filteredOrders.length} orders, {flattenedOrderRows.length} rows)
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </button>
            </div>
          )}
        </>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .all-orders-header__actions,
          .all-orders-filters,
          .pagination { display: none !important; }
          .orders-table { border: 1px solid #000; }
          .orders-table th, .orders-table td { border: 1px solid #000 !important; }
        }
      `}</style>
    </div>
  );
};

export default IndexAllOders;
