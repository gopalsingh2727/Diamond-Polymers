import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Package, Filter, Calendar, User, AlertCircle, CheckCircle, Clock, XCircle, TrendingUp, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DateRangeFilter, DateRange } from "../DateRangeFilter";
import { getDefaultDateRange } from "../../lib/dateUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ExportButtons } from "../ExportButtons";
import * as XLSX from "xlsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchOrdersReport } from "../../../../../redux/reports/reports/reportActions";
import type { RootState } from "../../../../../../store";

export function OrdersReport() {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const reportRef = useRef<HTMLDivElement>(null);

  // Get data from Redux store
  const { orders, loading, error } = useSelector((state: RootState) => state.reports);
  const ordersData = orders?.orders || [];

  // Fetch report data when filters change
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const filters: any = {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      };
      if (selectedStatus !== "all") filters.status = selectedStatus;
      if (selectedPriority !== "all") filters.priority = selectedPriority;
      dispatch(fetchOrdersReport(filters) as any);
    }
  }, [dispatch, dateRange.from, dateRange.to, selectedStatus, selectedPriority]);

  // Filter orders by date range and filters
  let filteredOrders = ordersData.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    const matchesDate = orderDate >= dateRange.from && orderDate <= dateRange.to;
    const matchesStatus = selectedStatus === "all" || order.overallStatus === selectedStatus;
    const matchesPriority = selectedPriority === "all" || order.priority === selectedPriority;
    return matchesDate && matchesStatus && matchesPriority;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading orders report...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  // Calculate metrics
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter((o: any) => o.overallStatus === "completed").length;
  const inProgressOrders = filteredOrders.filter(o => o.overallStatus === "in_progress").length;
  const pendingOrders = filteredOrders.filter(o => o.overallStatus === "pending").length;
  const dispatchedOrders = filteredOrders.filter(o => o.overallStatus === "dispatched").length;
  const cancelledOrders = filteredOrders.filter(o => o.overallStatus === "cancelled").length;
  const waitingApprovalOrders = filteredOrders.filter(o => o.overallStatus === "Wait for Approval").length;

  const urgentOrders = filteredOrders.filter(o => o.priority === "urgent").length;
  const highOrders = filteredOrders.filter(o => o.priority === "high").length;
  const normalOrders = filteredOrders.filter(o => o.priority === "normal").length;
  const lowOrders = filteredOrders.filter(o => o.priority === "low").length;

  // Status distribution data
  const statusData = [
    { name: "Completed", value: completedOrders, color: "#10b981" },
    { name: "In Progress", value: inProgressOrders, color: "#FF6B35" },
    { name: "Pending", value: pendingOrders, color: "#f59e0b" },
    { name: "Dispatched", value: dispatchedOrders, color: "#FFA500" },
    { name: "Wait for Approval", value: waitingApprovalOrders, color: "#FF6B35" },
    { name: "Cancelled", value: cancelledOrders, color: "#ef4444" }
  ].filter(d => d.value > 0);

  // Priority distribution data
  const priorityData = [
    { name: "Urgent", value: urgentOrders, color: "#dc2626" },
    { name: "High", value: highOrders, color: "#f59e0b" },
    { name: "Normal", value: normalOrders, color: "#FF6B35" },
    { name: "Low", value: lowOrders, color: "#64748b" }
  ].filter(d => d.value > 0);

  const COLORS = ["#10b981", "#FF6B35", "#f59e0b", "#FFA500", "#FF6B35", "#ef4444"];

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, className: string }> = {
      completed: { variant: "default", icon: CheckCircle, className: "bg-green-100 text-green-800 hover:bg-green-100" },
      in_progress: { variant: "default", icon: Clock, className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
      pending: { variant: "default", icon: AlertCircle, className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
      dispatched: { variant: "default", icon: TrendingUp, className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
      cancelled: { variant: "destructive", icon: XCircle, className: "bg-red-100 text-red-800 hover:bg-red-100" },
      "Wait for Approval": { variant: "default", icon: Pause, className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status === "in_progress" ? "In Progress" : status === "Wait for Approval" ? "Waiting Approval" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { className: string }> = {
      urgent: { className: "bg-red-100 text-red-800 hover:bg-red-100" },
      high: { className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
      normal: { className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
      low: { className: "bg-slate-100 text-slate-800 hover:bg-slate-100" }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;

    return (
      <Badge variant="default" className={config.className}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  // Export to Excel function
  const handleExportExcel = () => {
    const ordersData = filteredOrders.map(order => ({
      'Order ID': order.orderId,
      'Customer': order.customerName,
      'Status': order.overallStatus,
      'Priority': order.priority,
      'Material Type': order.materialType,
      'Material Weight (kg)': order.materialWeight,
      'Net Weight (kg)': order.realTimeData.totalNetWeight,
      'Wastage (kg)': order.realTimeData.totalWastage,
      'Efficiency (%)': order.realTimeData.overallEfficiency,
      'Created Date': new Date(order.createdAt).toLocaleDateString(),
      'Start Date': order.actualStartDate ? new Date(order.actualStartDate).toLocaleDateString() : 'N/A',
      'End Date': order.actualEndDate ? new Date(order.actualEndDate).toLocaleDateString() : 'N/A',
      'Operator': order.operatorName
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Header with Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-slate-900">Orders Report</h2>
            <p className="text-slate-600">Complete order tracking and management</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <ExportButtons onExportExcel={handleExportExcel} onPrint={handlePrint} />
            <DateRangeFilter onDateRangeChange={setDateRange} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filter by Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="Wait for Approval">Wait for Approval</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filter by Priority" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{totalOrders}</div>
            <p className="text-xs text-slate-600 mt-1">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{completedOrders}</div>
            <p className="text-xs text-slate-600 mt-1">
              {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-[#FF6B35]" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{inProgressOrders}</div>
            <p className="text-xs text-slate-600 mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Urgent Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{urgentOrders}</div>
            <p className="text-xs text-slate-600 mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Orders by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" fill="#FF6B35" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Material Type</TableHead>
                  <TableHead className="text-right">Weight (kg)</TableHead>
                  <TableHead className="text-right">Efficiency</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Operator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                      No orders found matching the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-sm">{order.orderId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          {order.customerName}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.overallStatus)}</TableCell>
                      <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                      <TableCell className="text-sm text-slate-600">{order.materialType}</TableCell>
                      <TableCell className="text-right">
                        {order.realTimeData.totalNetWeight > 0 
                          ? order.realTimeData.totalNetWeight.toFixed(0) 
                          : order.materialWeight.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.realTimeData.overallEfficiency > 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {order.realTimeData.overallEfficiency.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{order.operatorName}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
