import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Settings, Activity, AlertCircle, CheckCircle2, Layers, Filter } from "lucide-react";
import { Badge } from "../ui/badge";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DateRangeFilter, DateRange } from "../DateRangeFilter";
import { getDefaultDateRange } from "../../lib/dateUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ExportButtons } from "../ExportButtons";
import * as XLSX from "xlsx";
import { fetchMachinesReport } from "../../../../../redux/reports/reports/reportActions";
import type { RootState } from "../../../../../../store";

export function MachineReport() {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [selectedMachineType, setSelectedMachineType] = useState<string>("all");
  const reportRef = useRef<HTMLDivElement>(null);

  // Get data from Redux store
  const { machines, loading, error } = useSelector((state: RootState) => state.reports);
  const machinesData = machines?.machines || [];
  const machineUtilizationData = machines?.machineUtilization || [];

  // Fetch report data when component mounts or filters change
  useEffect(() => {
    const filters: any = {};
    if (selectedMachineType !== "all") {
      filters.machineType = selectedMachineType;
    }
    dispatch(fetchMachinesReport(filters) as any);
  }, [dispatch, selectedMachineType]);

  // Calculate machine metrics
  const totalMachines = machinesData.length;
  const activeMachines = machinesData.filter((m: any) => m.status === 'active').length;
  const maintenanceMachines = machinesData.filter((m: any) => m.status === 'maintenance').length;

  const avgUtilization = machineUtilizationData.length > 0
    ? machineUtilizationData.reduce((sum: number, m: any) => sum + (m.utilization || 0), 0) / machineUtilizationData.length
    : 0;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading machine report...</div>
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

  // Machine type breakdown
  const machineTypeBreakdown = Object.values(
    machinesData.reduce((acc: any, machine: any) => {
      const type = machine.machineType || machine.type || 'Unknown';
      if (!acc[type]) {
        acc[type] = {
          type,
          total: 0,
          active: 0,
          maintenance: 0
        };
      }
      acc[type].total += 1;
      if (machine.status === 'active') acc[type].active += 1;
      if (machine.status === 'maintenance') acc[type].maintenance += 1;
      return acc;
    }, {} as Record<string, any>)
  );

  // Utilization by machine type
  const utilizationByType = Object.values(
    machineUtilizationData.reduce((acc: any, machine: any) => {
      const type = machine.machineType || machine.type || 'Unknown';
      if (!acc[type]) {
        acc[type] = {
          type,
          totalUtilization: 0,
          totalOrders: 0,
          count: 0,
          machines: []
        };
      }
      acc[type].totalUtilization += machine.utilization;
      acc[type].totalOrders += machine.ordersProcessed;
      acc[type].count += 1;
      acc[type].machines.push({
        name: machine.machine,
        utilization: machine.utilization,
        orders: machine.ordersProcessed,
        status: machine.status
      });
      return acc;
    }, {} as Record<string, any>)
  ).map(item => ({
    ...item,
    avgUtilization: item.count > 0 ? item.totalUtilization / item.count : 0
  })).sort((a, b) => b.avgUtilization - a.avgUtilization);

  // Top performing machines (by utilization)
  const topMachines = [...machineUtilizationData]
    .filter(m => m.status === 'active')
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 10);

  // Low performing machines (by utilization, excluding maintenance)
  const lowMachines = [...machineUtilizationData]
    .filter(m => m.status === 'active')
    .sort((a, b) => a.utilization - b.utilization)
    .slice(0, 10);

  // Machine type distribution for pie chart
  const typeDistribution = machineTypeBreakdown.map(item => ({
    name: item.type.replace(' Machine', ''),
    value: item.total,
    active: item.active,
    maintenance: item.maintenance
  }));

  const COLORS = ['#FF6B35', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  // Most productive machine type
  const mostProductiveType = utilizationByType[0];

  // Get unique machine types
  const machineTypes = Array.from(new Set(machinesData.map(m => m.machineType)));
  
  // Filter machines by selected type
  const filteredMachinesByType = selectedMachineType === "all" 
    ? machineUtilizationData 
    : machineUtilizationData.filter(m => m.machineType === selectedMachineType);

  // Export to Excel function
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Machine Summary Sheet
    const summaryData = machineUtilizationData.map(m => ({
      'Machine': m.machine,
      'Type': m.machineType,
      'Utilization (%)': m.utilization,
      'Orders Processed': m.ordersProcessed,
      'Status': m.status
    }));
    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Machine Summary");
    
    // Machine Type Analysis Sheet
    const typeData = utilizationByType.map(t => ({
      'Machine Type': t.type,
      'Number of Machines': t.count,
      'Avg Utilization (%)': t.avgUtilization.toFixed(1),
      'Total Orders': t.totalOrders
    }));
    const ws2 = XLSX.utils.json_to_sheet(typeData);
    XLSX.utils.book_append_sheet(wb, ws2, "Type Analysis");
    
    XLSX.writeFile(wb, `Machine_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-slate-900">Machine Report</h2>
          <p className="text-slate-600">Machine performance, utilization, and type analysis</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <ExportButtons onExportExcel={handleExportExcel} onPrint={handlePrint} />
          <DateRangeFilter onDateRangeChange={setDateRange} />
        </div>
      </div>

      {/* Machine Type Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter by Machine Type
              </CardTitle>
              <CardDescription>Select a machine type to view detailed breakdown</CardDescription>
            </div>
            <Select value={selectedMachineType} onValueChange={setSelectedMachineType}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select machine type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Machine Types</SelectItem>
                {machineTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Machines</CardTitle>
            <Settings className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{totalMachines}</div>
            <p className="text-xs text-green-600 mt-1">
              {activeMachines} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Machine Types</CardTitle>
            <Layers className="h-4 w-4 text-[#FF6B35]" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{machineTypeBreakdown.length}</div>
            <p className="text-xs text-slate-600 mt-1">
              Different types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Utilization</CardTitle>
            <Activity className="h-4 w-4 text-[#FF6B35]" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{avgUtilization.toFixed(1)}%</div>
            <p className="text-xs text-slate-600 mt-1">
              Overall usage rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Maintenance</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{maintenanceMachines}</div>
            <p className="text-xs text-slate-600 mt-1">
              Currently offline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Operational</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{activeMachines}</div>
            <p className="text-xs text-green-600 mt-1">
              {((activeMachines / totalMachines) * 100).toFixed(0)}% uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Machines by Selected Type */}
      {selectedMachineType !== "all" && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Machines - {selectedMachineType}</CardTitle>
            <CardDescription>Utilization by individual machine</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredMachinesByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="machine" 
                  stroke="#64748b" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                          <p className="font-medium">{data.machine}</p>
                          <p className="text-sm text-[#FF6B35]">Utilization: {data.utilization}%</p>
                          <p className="text-sm text-green-600">Orders: {data.ordersProcessed}</p>
                          <p className="text-sm text-slate-600">Status: {data.status}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="utilization" fill="#FF6B35" name="Utilization %" />
                <Bar dataKey="ordersProcessed" fill="#10b981" name="Orders Processed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Machine Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Machine Type Distribution</CardTitle>
            <CardDescription>Breakdown by machine type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-slate-600">Total: {data.value}</p>
                          <p className="text-sm text-green-600">Active: {data.active}</p>
                          <p className="text-sm text-orange-600">Maintenance: {data.maintenance}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization by Machine Type */}
        <Card>
          <CardHeader>
            <CardTitle>Average Utilization by Type</CardTitle>
            <CardDescription>Performance comparison by machine type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="type" 
                  stroke="#64748b"
                  tickFormatter={(value) => value.replace(' Machine', '')}
                />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                          <p className="font-medium">{data.type}</p>
                          <p className="text-sm text-[#FF6B35]">Avg Utilization: {data.avgUtilization.toFixed(1)}%</p>
                          <p className="text-sm text-green-600">Total Orders: {data.totalOrders}</p>
                          <p className="text-sm text-slate-600">Machines: {data.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="avgUtilization" fill="#3b82f6" name="Avg Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Machines */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Machines by Utilization</CardTitle>
          <CardDescription>Highest performing machines</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topMachines}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="machine" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                        <p className="font-medium">{data.machine}</p>
                        <p className="text-sm text-slate-600">Type: {data.machineType}</p>
                        <p className="text-sm text-[#FF6B35]">Utilization: {data.utilization}%</p>
                        <p className="text-sm text-green-600">Orders: {data.ordersProcessed}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="utilization" fill="#10b981" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Performing Machines */}
      <Card>
        <CardHeader>
          <CardTitle>Underutilized Machines (Bottom 10)</CardTitle>
          <CardDescription>Machines with lowest utilization rates</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={lowMachines}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="machine" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                        <p className="font-medium">{data.machine}</p>
                        <p className="text-sm text-slate-600">Type: {data.machineType}</p>
                        <p className="text-sm text-orange-600">Utilization: {data.utilization}%</p>
                        <p className="text-sm text-green-600">Orders: {data.ordersProcessed}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="utilization" fill="#ef4444" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Machine Type Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Type Detailed Analysis</CardTitle>
          <CardDescription>Performance metrics by machine type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {utilizationByType.map((typeData, typeIndex) => (
              <div key={typeIndex} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-slate-900">{typeData.type}</h3>
                    <p className="text-sm text-slate-600">
                      {typeData.count} machines • {typeData.totalOrders} total orders • 
                      <span className="text-[#FF6B35] ml-1">{typeData.avgUtilization.toFixed(1)}% avg utilization</span>
                    </p>
                  </div>
                  <Badge variant={typeData.avgUtilization >= 85 ? "default" : "secondary"}>
                    {typeData.avgUtilization >= 85 ? "High Performance" : "Standard"}
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm">
                        <th className="text-left p-2 text-slate-600">Machine</th>
                        <th className="text-right p-2 text-slate-600">Utilization</th>
                        <th className="text-right p-2 text-slate-600">Orders</th>
                        <th className="text-left p-2 text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeData.machines.map((machine: any, idx: number) => (
                        <tr key={idx} className="border-b text-sm hover:bg-slate-50">
                          <td className="p-2">{machine.name}</td>
                          <td className="p-2 text-right">
                            <span className={`px-2 py-1 rounded text-xs ${
                              machine.utilization >= 90 ? 'bg-green-100 text-green-700' :
                              machine.utilization >= 80 ? 'bg-orange-100 text-orange-700' :
                              machine.utilization >= 70 ? 'bg-orange-100 text-orange-700' :
                              machine.utilization > 0 ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {machine.utilization}%
                            </span>
                          </td>
                          <td className="p-2 text-right text-slate-600">{machine.orders}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              machine.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {machine.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Machines Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Machines Overview</CardTitle>
          <CardDescription>Complete machine inventory and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-slate-600">Machine</th>
                  <th className="text-left p-3 text-slate-600">Type</th>
                  <th className="text-right p-3 text-slate-600">Utilization</th>
                  <th className="text-right p-3 text-slate-600">Orders Processed</th>
                  <th className="text-left p-3 text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {machineUtilizationData
                  .sort((a, b) => b.utilization - a.utilization)
                  .map((machine, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-3">{machine.machine}</td>
                      <td className="p-3 text-slate-600">{machine.machineType}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          machine.utilization >= 90 ? 'bg-green-100 text-green-700' :
                          machine.utilization >= 80 ? 'bg-orange-100 text-orange-700' :
                          machine.utilization >= 70 ? 'bg-orange-100 text-orange-700' :
                          machine.utilization > 0 ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {machine.utilization}%
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-600">{machine.ordersProcessed}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          machine.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {machine.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
