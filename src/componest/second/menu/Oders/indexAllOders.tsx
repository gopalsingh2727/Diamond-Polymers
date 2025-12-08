import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BackButton } from "../../../allCompones/BackButton";
import "./indexAllOders.css";
import { Download, Printer, X, ChevronDown } from "lucide-react";

// Import Redux actions
import { fetchOrders } from "../../../redux/oders/OdersActions";
import { getOrderFormDataIfNeeded } from "../../../redux/oders/orderFormDataActions";
import { RootState } from "../../../redux/rootReducer";
import { AppDispatch } from "../../../../store";

interface OrderFilters {
  status: string;
  priority: string;
  machineTypeIds: string[];
  machineNames: string[];
  operatorIds: string[];
  search: string;
}

const IndexAllOders = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const orderFormData = useSelector((state: RootState) => state.orderFormData);
  const machineTypes = orderFormData?.data?.machineTypes || [];
  const machines = orderFormData?.data?.machines || [];

  const ordersState = useSelector((state: RootState) => state.orders as any);
  const orders = ordersState?.orders || [];
  const ordersLoading = ordersState?.loading || false;

  // Debug logging
  useEffect(() => {
    console.log('📊 Orders State:', ordersState);
    console.log('📊 Orders Array:', orders);
    console.log('📊 Machine Types:', machineTypes);
  }, [ordersState, orders, machineTypes]);

  // Local state for filters
  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    priority: '',
    machineTypeIds: [],
    machineNames: [],
    operatorIds: [],
    search: ''
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Dropdown open states
  const [machineTypeDropdownOpen, setMachineTypeDropdownOpen] = useState(false);
  const [machineNameDropdownOpen, setMachineNameDropdownOpen] = useState(false);
  const [operatorDropdownOpen, setOperatorDropdownOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

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

  // Load orders and form data on component mount
  useEffect(() => {
    // fetchOrders automatically uses branchId from localStorage for non-admin users
    dispatch(fetchOrders({}));
    // Also load machine types and machines
    dispatch(getOrderFormDataIfNeeded());
  }, [dispatch]);

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

  // Get unique operators from orders (based on selected machines)
  const availableOperators = useMemo(() => {
    const operatorSet = new Set<string>();
    const operatorMap = new Map<string, { id: string; name: string }>();

    orders.forEach((order: any) => {
      // Get operator from order
      const operatorName = order.operator || order.assignedOperator || order.operatorName;
      const operatorId = order.operatorId || order.assignedOperatorId || operatorName;

      if (operatorName && !operatorSet.has(operatorName)) {
        operatorSet.add(operatorName);
        operatorMap.set(operatorId, { id: operatorId, name: operatorName });
      }

      // Also check steps for operators
      order.steps?.forEach((step: any) => {
        step.machines?.forEach((machine: any) => {
          const machineOperator = machine.operator || machine.operatorName;
          const machineOperatorId = machine.operatorId || machineOperator;

          if (machineOperator && !operatorSet.has(machineOperator)) {
            operatorSet.add(machineOperator);
            operatorMap.set(machineOperatorId, { id: machineOperatorId, name: machineOperator });
          }
        });
      });
    });

    return Array.from(operatorMap.values());
  }, [orders]);

  // Filter orders based on filters
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    return orders.filter((order: any) => {
      // Status filter
      if (filters.status && order.overallStatus !== filters.status) return false;

      // Priority filter
      if (filters.priority && order.priority !== filters.priority) return false;

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
        const hasMachine = orderMachines.some((m: any) =>
          filters.machineNames.includes(m.machineId) ||
          filters.machineNames.includes(m.machineName) ||
          filters.machineNames.includes(m._id)
        );
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

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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
      search: ''
    });
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
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

  // Get machine names for display
  const getMachineNames = (order: any): string => {
    const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
    if (orderMachines.length === 0) return '-';
    return orderMachines.map((m: any) => m.machineName).filter(Boolean).join(', ') || '-';
  };

  // Get operator name for display
  const getOperatorName = (order: any): string => {
    const operator = order.operator || order.assignedOperator || order.operatorName;
    if (operator) return operator;

    // Check steps for operator
    const stepOperators = order.steps?.flatMap((step: any) =>
      step.machines?.map((m: any) => m.operator || m.operatorName).filter(Boolean) || []
    ) || [];

    return stepOperators[0] || '-';
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredOrders;
    const csv = [
      ["No", "Order ID", "Company", "Status", "Priority", "Machine(s)", "Operator", "Quantity", "Date"],
      ...data.map((order: any, index: number) => [
        index + 1,
        order.orderNumber || order.orderId || order._id?.slice(-8),
        order.customer?.companyName || order.customerId?.companyName || 'Unknown',
        order.overallStatus || 'Unknown',
        order.priority || 'normal',
        getMachineNames(order),
        getOperatorName(order),
        order.totalQuantity || order.quantity || 0,
        new Date(order.createdAt).toLocaleDateString(),
      ]),
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.multi-select-dropdown')) {
        setMachineTypeDropdownOpen(false);
        setMachineNameDropdownOpen(false);
        setOperatorDropdownOpen(false);
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
            <label>Status</label>
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

          <button className="filter-reset-btn" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card__value">{filteredOrders.length}</div>
          <div className="summary-card__label">Total Orders</div>
        </div>
        <div className="summary-card summary-card--completed">
          <div className="summary-card__value">
            {filteredOrders.filter((o: any) => o.overallStatus === 'completed').length}
          </div>
          <div className="summary-card__label">Completed</div>
        </div>
        <div className="summary-card summary-card--pending">
          <div className="summary-card__value">
            {filteredOrders.filter((o: any) => o.overallStatus === 'pending' || o.overallStatus === 'Wait for Approval').length}
          </div>
          <div className="summary-card__label">Pending</div>
        </div>
        <div className="summary-card summary-card--progress">
          <div className="summary-card__value">
            {filteredOrders.filter((o: any) => o.overallStatus === 'in_progress').length}
          </div>
          <div className="summary-card__label">In Progress</div>
        </div>
      </div>

      {/* Orders Table */}
      {ordersLoading ? (
        <div className="loading-state">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found matching the filters</p>
          <button className="filter-reset-btn" onClick={handleResetFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Order ID</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Machine(s)</th>
                  <th>Operator</th>
                  <th>Quantity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order: any, index: number) => (
                  <tr key={order._id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{order.orderNumber || order.orderId || order._id?.slice(-8)}</td>
                    <td>{order.customer?.companyName || order.customerId?.companyName || 'Unknown'}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.overallStatus) }}
                      >
                        {order.overallStatus || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(order.priority) }}
                      >
                        {order.priority || 'normal'}
                      </span>
                    </td>
                    <td className="machine-cell">{getMachineNames(order)}</td>
                    <td>{getOperatorName(order)}</td>
                    <td>{order.totalQuantity || order.quantity || 0}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
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
                Page {currentPage} of {totalPages} ({filteredOrders.length} orders)
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
