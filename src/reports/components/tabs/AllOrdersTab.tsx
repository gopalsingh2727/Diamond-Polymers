import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../componest/redux/rootReducer';
import { AppDispatch } from '../../../store';
import { fetchOrders } from '../../../componest/redux/oders/OdersActions';
import { getAllMachineTypes } from '../../../componest/redux/create/machineType/machineTypeActions';
import { exportExcel } from '../../../componest/redux/reports/reportActions';

interface AllOrdersTabProps {
  dateRange: {
    fromDate: string;
    toDate: string;
  };
}

interface OrderFilters {
  status: string;
  priority: string;
  machineTypeId: string;
  machineName: string;
  search: string;
}

const AllOrdersTab: React.FC<AllOrdersTabProps> = ({ dateRange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const branchId = localStorage.getItem('branchId') || '';

  // Redux state
  const ordersState = useSelector((state: RootState) => state.orders);
  const orders = (ordersState as any)?.orders || [];
  const ordersLoading = (ordersState as any)?.loading || false;
  const machineTypeList = useSelector((state: RootState) => state.machineTypeList);
  const machineTypes = (machineTypeList as any)?.items || [];
  const { exporting } = useSelector((state: RootState) => state.reports);

  // Local state for filters
  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    priority: '',
    machineTypeId: '',
    machineName: '',
    search: ''
  });

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

  // Fetch orders and machine types on mount
  useEffect(() => {
    if (branchId) {
      dispatch(fetchOrders({
        branchId,
        startDate: dateRange.fromDate || undefined,
        endDate: dateRange.toDate || undefined,
        status: filters.status || undefined,
        limit: 1000,
      }));
    }
    dispatch(getAllMachineTypes());
  }, [dispatch, branchId, dateRange.fromDate, dateRange.toDate]);

  // Get machines for selected machine type
  const machinesForSelectedType = useMemo(() => {
    if (!filters.machineTypeId || !machineTypes) return [];
    const selectedType = machineTypes.find((mt: any) => mt._id === filters.machineTypeId);
    return selectedType?.machines || [];
  }, [filters.machineTypeId, machineTypes]);

  // Filter orders based on filters
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    return orders.filter((order: any) => {
      // Status filter
      if (filters.status && order.overallStatus !== filters.status) return false;

      // Priority filter
      if (filters.priority && order.priority !== filters.priority) return false;

      // Machine Type filter
      if (filters.machineTypeId) {
        const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
        const hasMachineType = orderMachines.some((m: any) =>
          m.machineType === filters.machineTypeId ||
          machineTypes.find((mt: any) => mt._id === filters.machineTypeId)?.type === m.machineType
        );
        if (!hasMachineType) return false;
      }

      // Machine Name filter
      if (filters.machineName) {
        const orderMachines = order.steps?.flatMap((step: any) => step.machines || []) || [];
        const hasMachine = orderMachines.some((m: any) =>
          m.machineId === filters.machineName || m.machineName === filters.machineName
        );
        if (!hasMachine) return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(searchLower);
        const matchesCompany = order.customerId?.companyName?.toLowerCase().includes(searchLower);
        const matchesId = order._id?.toLowerCase().includes(searchLower);
        if (!matchesOrderNumber && !matchesCompany && !matchesId) return false;
      }

      return true;
    });
  }, [orders, filters, machineTypes]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Handle filter changes
  const handleFilterChange = (field: keyof OrderFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      // Reset machine name when machine type changes
      if (field === 'machineTypeId') {
        newFilters.machineName = '';
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      machineTypeId: '',
      machineName: '',
      search: ''
    });
    setCurrentPage(1);
  };

  // Export to Excel
  const handleExport = () => {
    dispatch(exportExcel({
      reportType: 'allOrders',
      branchId,
      ...dateRange
    }));
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
    const machines = order.steps?.flatMap((step: any) => step.machines || []) || [];
    if (machines.length === 0) return '-';
    return machines.map((m: any) => m.machineName).filter(Boolean).join(', ') || '-';
  };

  return (
    <div className="all-orders-tab">
      <div className="tab-header">
        <h2>All Orders</h2>
        <button
          className="report-export-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>
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
              onChange={(e) => handleFilterChange('search', e.target.value)}
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
            <label>Machine Type</label>
            <select
              value={filters.machineTypeId}
              onChange={(e) => handleFilterChange('machineTypeId', e.target.value)}
              className="filter-select"
            >
              <option value="">All Machine Types</option>
              {machineTypes?.map((mt: any) => (
                <option key={mt._id} value={mt._id}>{mt.type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Machine Name</label>
            <select
              value={filters.machineName}
              onChange={(e) => handleFilterChange('machineName', e.target.value)}
              className="filter-select"
              disabled={!filters.machineTypeId}
            >
              <option value="">All Machines</option>
              {machinesForSelectedType.map((m: any) => (
                <option key={m._id} value={m._id}>{m.machineName}</option>
              ))}
            </select>
          </div>

          <button className="filter-reset-btn" onClick={handleResetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="report-summary-cards">
        <div className="report-summary-card">
          <div className="report-summary-card__value">{filteredOrders.length}</div>
          <div className="report-summary-card__label">Total Orders</div>
        </div>
        <div className="report-summary-card report-summary-card--completed">
          <div className="report-summary-card__value">
            {filteredOrders.filter((o: any) => o.overallStatus === 'completed').length}
          </div>
          <div className="report-summary-card__label">Completed</div>
        </div>
        <div className="report-summary-card report-summary-card--pending">
          <div className="report-summary-card__value">
            {filteredOrders.filter((o: any) => o.overallStatus === 'pending' || o.overallStatus === 'Wait for Approval').length}
          </div>
          <div className="report-summary-card__label">Pending</div>
        </div>
        <div className="report-summary-card report-summary-card--progress">
          <div className="report-summary-card__value">
            {filteredOrders.filter((o: any) => o.overallStatus === 'in_progress').length}
          </div>
          <div className="report-summary-card__label">In Progress</div>
        </div>
      </div>

      {/* Orders Table */}
      {ordersLoading ? (
        <div className="loading">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="report-empty">No orders found matching the filters</div>
      ) : (
        <>
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Order ID</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Machine(s)</th>
                  <th>Quantity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order: any, index: number) => (
                  <tr key={order._id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{order.orderNumber || order._id?.slice(-8)}</td>
                    <td>{order.customerId?.companyName || 'Unknown'}</td>
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
    </div>
  );
};

export default AllOrdersTab;
