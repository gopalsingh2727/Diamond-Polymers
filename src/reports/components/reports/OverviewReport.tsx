/**
 * Overview Report - Pure CSS Version
 * NO TAILWIND - NO SHADCN
 */

import { Card, CardContent, CardHeader, CardTitle } from "../pure";
import {
  Package,
  TrendingUp,
  Weight,
  Clock,
  ArrowUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DateRangeFilter, DateRange } from "../DateRangeFilter";
import { getDefaultDateRange } from "../../lib/dateUtils";
import { ExportButtons } from "../ExportButtons";
import * as XLSX from "xlsx";
import { fetchOverviewReport } from "../../../../../redux/reports/reports/reportActions";
import type { RootState } from "../../../../../../store";

export function OverviewReport() {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const reportRef = useRef<HTMLDivElement>(null);

  // Get data from Redux store
  const { overview, loading, error } = useSelector((state: RootState) => state.reports);
  const orders = overview?.orders || [];
  const efficiencyTrendsData = overview?.efficiencyTrends || [];
  const productionOutputData = overview?.productionOutput || [];

  // Fetch report data when component mounts or date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      dispatch(fetchOverviewReport({ from: dateRange.from, to: dateRange.to }) as any);
    }
  }, [dispatch, dateRange.from, dateRange.to]);

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= dateRange.from && orderDate <= dateRange.to;
  });
  
  // Calculate key metrics
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(o => o.overallStatus === "completed").length;
  const inProgressOrders = filteredOrders.filter(o => o.overallStatus === "in_progress").length;
  const pendingOrders = filteredOrders.filter(o => o.overallStatus === "pending").length;
  
  const totalMaterialInput = filteredOrders.reduce((sum, o) => sum + o.materialWeight, 0);
  const totalCost = filteredOrders.reduce((sum, o) => sum + (o.financial.actualCost || 0), 0);
  
  const avgEfficiency = filteredOrders
    .filter(o => o.realTimeData.overallEfficiency > 0)
    .reduce((sum, o) => sum + o.realTimeData.overallEfficiency, 0) / 
    (filteredOrders.filter(o => o.realTimeData.overallEfficiency > 0).length || 1);

  const totalNetWeight = filteredOrders.reduce((sum, o) => sum + o.realTimeData.totalNetWeight, 0);
  const totalWastage = filteredOrders.reduce((sum, o) => sum + o.realTimeData.totalWastage, 0);

  // Status distribution
  const statusData = [
    { name: "Completed", value: completedOrders, color: "#10b981" },
    { name: "In Progress", value: inProgressOrders, color: "#FF6B35" },
    { name: "Pending", value: pendingOrders, color: "#f59e0b" },
    { name: "Dispatched", value: filteredOrders.filter(o => o.overallStatus === "dispatched").length, color: "#8b5cf6" }
  ];

  // Use data from Redux
  const filteredEfficiencyTrends = efficiencyTrendsData;
  const filteredProductionOutput = productionOutputData;

  const COLORS = ["#10b981", "#FF6B35", "#f59e0b", "#8b5cf6"];

  // Export to Excel function
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Overview Summary Sheet
    const summaryData = [{
      'Total Orders': totalOrders,
      'Completed Orders': completedOrders,
      'In Progress': inProgressOrders,
      'Pending Orders': pendingOrders,
      'Total Production (kg)': totalNetWeight.toFixed(0),
      'Material Input (kg)': totalMaterialInput.toFixed(0),
      'Total Wastage (kg)': totalWastage.toFixed(0),
      'Avg Efficiency (%)': avgEfficiency.toFixed(1)
    }];
    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Overview Summary");
    
    // Efficiency Trends Sheet
    const efficiencyData = filteredEfficiencyTrends.map(e => ({
      'Date': e.date,
      'Efficiency (%)': e.efficiency,
      'Orders': e.orders
    }));
    const ws2 = XLSX.utils.json_to_sheet(efficiencyData);
    XLSX.utils.book_append_sheet(wb, ws2, "Efficiency Trends");
    
    // Production Output Sheet
    const productionData = filteredProductionOutput.map(p => ({
      'Date': p.date,
      'Net Weight (kg)': p.netWeight,
      'Wastage (kg)': p.wastage
    }));
    const ws3 = XLSX.utils.json_to_sheet(productionData);
    XLSX.utils.book_append_sheet(wb, ws3, "Production Output");
    
    XLSX.writeFile(wb, `Overview_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading report data...</div>
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

  return (
    <div ref={reportRef}>
      {/* Header with Date Filter */}
      <div className="flex justify-between items-start mb-6 gap-4" style={{ flexWrap: 'wrap' }}>
        <div>
          <h2 className="text-slate-900 mb-2">Overview Report</h2>
          <p className="text-slate-600">Key performance metrics and trends</p>
        </div>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <ExportButtons onExportExcel={handleExportExcel} onPrint={handlePrint} />
          <DateRangeFilter onDateRangeChange={setDateRange} />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-secondary">Total Orders</span>
              <Package style={{ width: '1rem', height: '1rem', color: 'var(--color-slate-600)' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">{totalOrders}</div>
            <p className="text-xs text-secondary">
              <span style={{ color: '#10b981' }} className="inline-flex items-center gap-1">
                <CheckCircle style={{ width: '0.75rem', height: '0.75rem' }} />
                {completedOrders} completed
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-secondary">Avg Efficiency</span>
              <TrendingUp style={{ width: '1rem', height: '1rem', color: 'var(--color-slate-600)' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">{avgEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-secondary">
              <span style={{ color: '#10b981' }} className="inline-flex items-center gap-1">
                <ArrowUp style={{ width: '0.75rem', height: '0.75rem' }} />
                Above target 90%
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-secondary">Material Input</span>
              <Weight style={{ width: '1rem', height: '1rem', color: '#FF6B35' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">{totalMaterialInput.toFixed(0)} kg</div>
            <p className="text-xs text-secondary">
              Total material planned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-secondary">Production Output</span>
              <Clock style={{ width: '1rem', height: '1rem', color: 'var(--color-slate-600)' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">{totalNetWeight.toFixed(0)} kg</div>
            <p className="text-xs text-secondary">
              <span style={{ color: '#f59e0b' }} className="inline-flex items-center gap-1">
                <AlertCircle style={{ width: '0.75rem', height: '0.75rem' }} />
                Wastage: {totalWastage.toFixed(0)} kg
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* Efficiency Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Trend (Last 7 Days)</CardTitle>
            <p className="text-sm text-secondary mt-1">Daily average efficiency percentage</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredEfficiencyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" domain={[85, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  dot={{ fill: '#FF6B35', r: 4 }}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <p className="text-sm text-secondary mt-1">Current order breakdown</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Production Output Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Production Output (Last 7 Days)</CardTitle>
          <p className="text-sm text-secondary mt-1">Net weight vs wastage comparison</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredProductionOutput}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#64748b"
              />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Bar dataKey="netWeight" fill="#10b981" name="Net Weight (kg)" />
              <Bar dataKey="wastage" fill="#ef4444" name="Wastage (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
