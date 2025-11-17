import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { DateRangeFilter, DateRange } from "../DateRangeFilter";
import { ExportButtons } from "../ExportButtons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FileSpreadsheet, Filter, TrendingUp, Database, Sliders, Eye, Download, Settings2 } from "lucide-react";
import * as XLSX from "xlsx";
import { mockOrders } from "../../lib/mockData";

// Report type options
const REPORT_TYPES = [
  { value: 'machine-performance', label: 'Machine Performance', icon: Settings2 },
  { value: 'order-analysis', label: 'Order Analysis', icon: FileSpreadsheet },
  { value: 'material-usage', label: 'Material Usage', icon: Database },
  { value: 'efficiency-trends', label: 'Efficiency Trends', icon: TrendingUp },
  { value: 'quality-control', label: 'Quality Control', icon: Eye },
  { value: 'step-progress', label: 'Step Progress', icon: Sliders },
  { value: 'custom-formula', label: 'Custom Formula Report', icon: Filter },
];

// Metrics available for selection
const AVAILABLE_METRICS = {
  'machine-performance': [
    { value: 'utilization', label: 'Machine Utilization %' },
    { value: 'efficiency', label: 'Efficiency %' },
    { value: 'wastage', label: 'Total Wastage' },
    { value: 'production', label: 'Total Production' },
    { value: 'downtime', label: 'Downtime Hours' },
    { value: 'quality-rate', label: 'Quality Pass Rate' },
  ],
  'order-analysis': [
    { value: 'total-orders', label: 'Total Orders' },
    { value: 'completion-rate', label: 'Completion Rate %' },
    { value: 'avg-efficiency', label: 'Average Efficiency' },
    { value: 'total-weight', label: 'Total Net Weight' },
    { value: 'total-wastage', label: 'Total Wastage' },
    { value: 'on-time-delivery', label: 'On-Time Delivery %' },
  ],
  'material-usage': [
    { value: 'total-consumption', label: 'Total Consumption' },
    { value: 'wastage-rate', label: 'Wastage Rate %' },
    { value: 'efficiency', label: 'Material Efficiency' },
    { value: 'cost-per-kg', label: 'Average Cost per KG' },
    { value: 'variance', label: 'Planned vs Actual Variance' },
  ],
  'efficiency-trends': [
    { value: 'daily-efficiency', label: 'Daily Efficiency' },
    { value: 'weekly-efficiency', label: 'Weekly Efficiency' },
    { value: 'machine-comparison', label: 'Machine Comparison' },
    { value: 'operator-performance', label: 'Operator Performance' },
  ],
  'quality-control': [
    { value: 'inspection-status', label: 'Inspection Status' },
    { value: 'quality-score', label: 'Average Quality Score' },
    { value: 'defect-rate', label: 'Defect Rate' },
    { value: 'pass-rate', label: 'Quality Pass Rate' },
  ],
  'step-progress': [
    { value: 'completion-rate', label: 'Step Completion Rate' },
    { value: 'avg-duration', label: 'Average Step Duration' },
    { value: 'bottlenecks', label: 'Bottleneck Analysis' },
    { value: 'machine-count', label: 'Machines per Step' },
  ],
};

// Filter options
const STATUS_OPTIONS = ['all', 'pending', 'in_progress', 'dispatched', 'completed', 'cancelled', 'Wait for Approval'];
const PRIORITY_OPTIONS = ['all', 'low', 'normal', 'high', 'urgent'];
const MACHINE_TYPES = ['all', 'Printing Machine', 'Cutting Machine', 'Extruder', 'Mixer', 'Sealing Machine'];

export function CustomReportBuilder() {
  const reportRef = useRef<HTMLDivElement>(null);
  
  // State
  const [reportType, setReportType] = useState<string>('order-analysis');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['total-orders', 'completion-rate', 'avg-efficiency']);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [machineTypeFilter, setMachineTypeFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<string>('status');
  const [chartType, setChartType] = useState<string>('bar');
  const [showReport, setShowReport] = useState<boolean>(false);

  // Filter data
  const filteredOrders = mockOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const inDateRange = orderDate >= dateRange.from && orderDate <= dateRange.to;
    const matchesStatus = statusFilter === 'all' || order.overallStatus === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    
    return inDateRange && matchesStatus && matchesPriority;
  });

  // Toggle metric selection
  const toggleMetric = (metricValue: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricValue) 
        ? prev.filter(m => m !== metricValue)
        : [...prev, metricValue]
    );
  };

  // Calculate metrics based on report type
  const calculateMetrics = () => {
    const metrics: any = {};

    if (reportType === 'order-analysis') {
      metrics.totalOrders = filteredOrders.length;
      metrics.completedOrders = filteredOrders.filter(o => o.overallStatus === 'completed').length;
      metrics.completionRate = metrics.totalOrders > 0 ? (metrics.completedOrders / metrics.totalOrders * 100).toFixed(1) : 0;
      metrics.avgEfficiency = filteredOrders.length > 0 
        ? (filteredOrders.reduce((sum, o) => sum + o.realTimeData.overallEfficiency, 0) / filteredOrders.length).toFixed(1)
        : 0;
      metrics.totalWeight = filteredOrders.reduce((sum, o) => sum + o.realTimeData.totalNetWeight, 0).toFixed(0);
      metrics.totalWastage = filteredOrders.reduce((sum, o) => sum + o.realTimeData.totalWastage, 0).toFixed(0);
      metrics.onTimeDelivery = metrics.totalOrders > 0 ? 85.5 : 0; // Mock data
    }

    if (reportType === 'machine-performance') {
      metrics.utilization = 78.5;
      metrics.efficiency = 82.3;
      metrics.wastage = filteredOrders.reduce((sum, o) => sum + o.realTimeData.totalWastage, 0).toFixed(0);
      metrics.production = filteredOrders.reduce((sum, o) => sum + o.realTimeData.totalNetWeight, 0).toFixed(0);
      metrics.downtime = 12.5;
      metrics.qualityRate = 94.2;
    }

    if (reportType === 'material-usage') {
      metrics.totalConsumption = filteredOrders.reduce((sum, o) => sum + o.materialWeight, 0).toFixed(0);
      metrics.wastageRate = 5.2;
      metrics.efficiency = 94.8;
      metrics.costPerKg = 45.5;
      metrics.variance = 2.8;
    }

    if (reportType === 'efficiency-trends') {
      metrics.dailyEfficiency = 82.5;
      metrics.weeklyEfficiency = 84.3;
      metrics.machineComparison = 'Available';
      metrics.operatorPerformance = 88.7;
    }

    if (reportType === 'quality-control') {
      metrics.inspectionStatus = 'In Progress';
      metrics.qualityScore = 92.5;
      metrics.defectRate = 3.2;
      metrics.passRate = 96.8;
    }

    if (reportType === 'step-progress') {
      metrics.completionRate = 87.3;
      metrics.avgDuration = '2.5 days';
      metrics.bottlenecks = 'Cutting Step';
      metrics.machineCount = 3.2;
    }

    return metrics;
  };

  // Generate chart data based on groupBy
  const generateChartData = () => {
    if (groupBy === 'status') {
      const statusCounts: any = {};
      filteredOrders.forEach(order => {
        statusCounts[order.overallStatus] = (statusCounts[order.overallStatus] || 0) + 1;
      });
      return Object.entries(statusCounts).map(([name, value]) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
      }));
    }

    if (groupBy === 'priority') {
      const priorityCounts: any = {};
      filteredOrders.forEach(order => {
        priorityCounts[order.priority] = (priorityCounts[order.priority] || 0) + 1;
      });
      return Object.entries(priorityCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
    }

    if (groupBy === 'material') {
      const materialCounts: any = {};
      filteredOrders.forEach(order => {
        materialCounts[order.materialType] = (materialCounts[order.materialType] || 0) + 1;
      });
      return Object.entries(materialCounts).map(([name, value]) => ({ name, value }));
    }

    if (groupBy === 'efficiency') {
      return filteredOrders.slice(0, 10).map(order => ({
        name: order.orderId.split('-').pop(),
        value: order.realTimeData.overallEfficiency
      }));
    }

    return [];
  };

  // Get chart colors
  const getChartColors = () => {
    return ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  };

  // Generate report
  const handleGenerateReport = () => {
    setShowReport(true);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const metrics = calculateMetrics();
    const reportData = filteredOrders.map(order => ({
      'Order ID': order.orderId,
      'Customer': order.customerName,
      'Status': order.overallStatus,
      'Priority': order.priority,
      'Material Type': order.materialType,
      'Net Weight (kg)': order.realTimeData.totalNetWeight,
      'Wastage (kg)': order.realTimeData.totalWastage,
      'Efficiency (%)': order.realTimeData.overallEfficiency,
      'Created Date': new Date(order.createdAt).toLocaleDateString(),
    }));

    const metricsData = selectedMetrics.map(metric => {
      const metricLabel = AVAILABLE_METRICS[reportType as keyof typeof AVAILABLE_METRICS]?.find(m => m.value === metric)?.label;
      return {
        'Metric': metricLabel,
        'Value': metrics[metric] || 'N/A'
      };
    });

    const wb = XLSX.utils.book_new();
    const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
    const wsData = XLSX.utils.json_to_sheet(reportData);
    
    XLSX.utils.book_append_sheet(wb, wsMetrics, "Metrics");
    XLSX.utils.book_append_sheet(wb, wsData, "Data");
    
    XLSX.writeFile(wb, `Custom_Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  const metrics = calculateMetrics();
  const chartData = generateChartData();
  const colors = getChartColors();

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Configure your custom report by selecting type, metrics, and filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metrics Selection */}
          <div className="space-y-2">
            <Label>Metrics to Display</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border rounded-lg bg-slate-50">
              {AVAILABLE_METRICS[reportType as keyof typeof AVAILABLE_METRICS]?.map(metric => (
                <div key={metric.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.value}
                    checked={selectedMetrics.includes(metric.value)}
                    onCheckedChange={() => toggleMetric(metric.value)}
                  />
                  <label
                    htmlFor={metric.value}
                    className="text-sm cursor-pointer select-none"
                  >
                    {metric.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DateRangeFilter onDateRangeChange={setDateRange} />
            </div>

            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority Filter</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Machine Type</Label>
              <Select value={machineTypeFilter} onValueChange={setMachineTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MACHINE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visualization Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="material">Material Type</SelectItem>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerateReport} className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Generate Report
            </Button>
            {showReport && (
              <ExportButtons onExportExcel={handleExportExcel} onPrint={handlePrint} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {showReport && (
        <>
          {/* Metrics Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {selectedMetrics.map(metricValue => {
              const metricConfig = AVAILABLE_METRICS[reportType as keyof typeof AVAILABLE_METRICS]?.find(m => m.value === metricValue);
              const value = metrics[metricValue];
              
              return (
                <Card key={metricValue}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">{metricConfig?.label}</CardTitle>
                    <Database className="h-4 w-4 text-slate-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-slate-900">{value}</div>
                    <p className="text-xs text-slate-600 mt-1">
                      Based on {filteredOrders.length} orders
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Data Visualization</CardTitle>
              <CardDescription>
                {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)} distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'bar' && (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}

                {chartType === 'pie' && (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}

                {chartType === 'line' && (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Data</CardTitle>
              <CardDescription>
                Showing {filteredOrders.length} orders matching your criteria
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
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Net Weight</TableHead>
                      <TableHead className="text-right">Wastage</TableHead>
                      <TableHead className="text-right">Efficiency</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.slice(0, 20).map(order => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono text-sm">{order.orderId}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.overallStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{order.materialType}</TableCell>
                        <TableCell className="text-right">{order.realTimeData.totalNetWeight}</TableCell>
                        <TableCell className="text-right">{order.realTimeData.totalWastage}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {order.realTimeData.overallEfficiency}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
