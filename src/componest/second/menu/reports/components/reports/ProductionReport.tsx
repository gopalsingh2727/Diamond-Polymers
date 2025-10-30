import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { mockOrders, mockProductionOutput, mockMaterials } from "../../lib/mockData";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Package, Weight, AlertTriangle, TrendingUp, Layers, Filter } from "lucide-react";
import { useState, useRef } from "react";
import { Badge } from "../ui/badge";
import { DateRangeFilter, DateRange } from "../DateRangeFilter";
import { filterOrdersByDateRange, getDefaultDateRange } from "../../lib/dateUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ExportButtons } from "../ExportButtons";
import * as XLSX from "xlsx";

export function ProductionReport() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>("all");
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Filter orders by date range
  const filteredOrders = filterOrdersByDateRange(mockOrders, dateRange);

  // Calculate production metrics
  const totalProduction = filteredOrders.reduce((sum, o) => sum + o.realTimeData.totalNetWeight, 0);
  const totalWastage = filteredOrders.reduce((sum, o) => sum + o.realTimeData.totalWastage, 0);
  const totalMaterialInput = filteredOrders.reduce((sum, o) => sum + o.materialWeight, 0);
  const wastagePercentage = totalMaterialInput > 0 ? (totalWastage / totalMaterialInput) * 100 : 0;

  // Production by Material Type (High Density Polyethylene, etc.)
  const productionByMaterialType = Object.values(
    filteredOrders.reduce((acc, order) => {
      const materialType = order.materialType || 'Unknown';
      if (!acc[materialType]) {
        acc[materialType] = {
          material: materialType,
          netWeight: 0,
          wastage: 0,
          input: 0,
          orders: 0
        };
      }
      acc[materialType].netWeight += order.realTimeData.totalNetWeight || 0;
      acc[materialType].wastage += order.realTimeData.totalWastage || 0;
      acc[materialType].input += order.materialWeight || 0;
      acc[materialType].orders += 1;
      return acc;
    }, {} as Record<string, any>)
  ).map(item => ({
    ...item,
    efficiency: item.input > 0 ? ((item.netWeight / item.input) * 100) : 0,
    wastageRate: item.input > 0 ? ((item.wastage / item.input) * 100) : 0
  })).sort((a, b) => b.netWeight - a.netWeight);

  // Production by individual material (from mixMaterial in orders)
  const productionByMaterial = Object.values(
    filteredOrders.reduce((acc, order) => {
      order.mixMaterial.forEach((mat: any) => {
        if (!acc[mat.materialName]) {
          acc[mat.materialName] = {
            materialName: mat.materialName,
            totalUsed: 0,
            totalWastage: 0,
            totalPlanned: 0,
            orders: new Set()
          };
        }
        acc[mat.materialName].totalUsed += mat.actualUsedWeight || 0;
        acc[mat.materialName].totalWastage += mat.wastageWeight || 0;
        acc[mat.materialName].totalPlanned += mat.plannedWeight || 0;
        acc[mat.materialName].orders.add(order._id);
      });
      return acc;
    }, {} as Record<string, any>)
  ).map(item => ({
    ...item,
    orderCount: item.orders.size,
    wastageRate: item.totalPlanned > 0 ? ((item.totalWastage / item.totalPlanned) * 100) : 0,
    efficiency: item.totalPlanned > 0 ? ((item.totalUsed / item.totalPlanned) * 100) : 0
  })).sort((a, b) => b.totalUsed - a.totalUsed);

  // Production by status
  const productionByStatus = Object.values(
    filteredOrders.reduce((acc, order) => {
      const status = order.overallStatus;
      if (!acc[status]) {
        acc[status] = {
          status,
          count: 0,
          output: 0,
          wastage: 0,
          input: 0
        };
      }
      acc[status].count += 1;
      acc[status].output += order.realTimeData.totalNetWeight || 0;
      acc[status].wastage += order.realTimeData.totalWastage || 0;
      acc[status].input += order.materialWeight || 0;
      return acc;
    }, {} as Record<string, any>)
  ).sort((a, b) => b.output - a.output);

  // Production by Customer (Top 10)
  const productionByCustomer = Object.values(
    filteredOrders.reduce((acc, order) => {
      const customer = order.customerName;
      if (!acc[customer]) {
        acc[customer] = {
          customer: customer.split(' ')[0],
          netWeight: 0,
          wastage: 0,
          orders: 0
        };
      }
      acc[customer].netWeight += order.realTimeData.totalNetWeight || 0;
      acc[customer].wastage += order.realTimeData.totalWastage || 0;
      acc[customer].orders += 1;
      return acc;
    }, {} as Record<string, any>)
  ).sort((a, b) => b.netWeight - a.netWeight).slice(0, 10);

  // Daily production - filter based on date range
  const dailyData = mockProductionOutput.filter(item => {
    if (!dateRange.from || !dateRange.to) return true;
    const itemDate = new Date(item.date);
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return itemDate >= from && itemDate <= to;
  });

  // Material type distribution for pie chart
  const materialTypeDistribution = productionByMaterialType.map(item => ({
    name: item.material.replace(' Polyethylene', '').replace('Poly', 'P'),
    value: item.netWeight,
    orders: item.orders
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  const totalMaterialTypes = productionByMaterialType.length;
  const totalIndividualMaterials = productionByMaterial.length;
  const topMaterial = productionByMaterialType[0];

  // Get unique material types
  const materialTypes = Array.from(new Set(mockMaterials.map(m => m.materialType)));

  // Filter materials by selected type
  const filteredMaterialsByType = selectedMaterialType === "all"
    ? productionByMaterial
    : productionByMaterial.filter((mat: any) => {
        const materialInfo = mockMaterials.find(m => m.materialName === mat.materialName);
        return materialInfo?.materialType === selectedMaterialType;
      });

  // Export to Excel function
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Production Summary Sheet
    const summaryData = [{
      'Total Production (kg)': totalProduction.toFixed(0),
      'Material Input (kg)': totalMaterialInput.toFixed(0),
      'Total Wastage (kg)': totalWastage.toFixed(0),
      'Wastage (%)': wastagePercentage.toFixed(1),
      'Avg Yield (%)': (100 - wastagePercentage).toFixed(1)
    }];
    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");
    
    // Material Type Analysis Sheet
    const typeData = productionByMaterialType.map(t => ({
      'Material Type': t.material,
      'Orders': t.orders,
      'Input (kg)': t.input.toFixed(0),
      'Output (kg)': t.netWeight.toFixed(0),
      'Wastage (kg)': t.wastage.toFixed(0),
      'Wastage (%)': t.wastageRate.toFixed(1),
      'Efficiency (%)': t.efficiency.toFixed(1)
    }));
    const ws2 = XLSX.utils.json_to_sheet(typeData);
    XLSX.utils.book_append_sheet(wb, ws2, "Material Type Analysis");
    
    // Individual Materials Sheet
    const materialData = productionByMaterial.map((m: any) => {
      const materialInfo = mockMaterials.find(mat => mat.materialName === m.materialName);
      return {
        'Material': m.materialName,
        'Type': materialInfo?.materialType || 'Unknown',
        'Orders': m.orderCount,
        'Planned (kg)': m.totalPlanned.toFixed(0),
        'Used (kg)': m.totalUsed.toFixed(0),
        'Wastage (kg)': m.totalWastage.toFixed(0),
        'Wastage (%)': m.wastageRate.toFixed(1),
        'Efficiency (%)': m.efficiency.toFixed(1)
      };
    });
    const ws3 = XLSX.utils.json_to_sheet(materialData);
    XLSX.utils.book_append_sheet(wb, ws3, "Individual Materials");
    
    XLSX.writeFile(wb, `Production_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-slate-900">Production Report</h2>
          <p className="text-slate-600">Detailed production metrics and material analysis</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <ExportButtons onExportExcel={handleExportExcel} onPrint={handlePrint} />
          <DateRangeFilter onDateRangeChange={setDateRange} />
        </div>
      </div>

      {/* Material Type Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter by Material Type
              </CardTitle>
              <CardDescription>Select a material type to view detailed breakdown</CardDescription>
            </div>
            <Select value={selectedMaterialType} onValueChange={setSelectedMaterialType}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Material Types</SelectItem>
                {materialTypes.map(type => (
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
            <CardTitle className="text-sm">Total Production</CardTitle>
            <Package className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{totalProduction.toFixed(0)} kg</div>
            <p className="text-xs text-slate-600 mt-1">
              Net weight produced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Material Types</CardTitle>
            <Layers className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{totalMaterialTypes}</div>
            <p className="text-xs text-slate-600 mt-1">
              {totalIndividualMaterials} materials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Material Input</CardTitle>
            <Weight className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{totalMaterialInput.toFixed(0)} kg</div>
            <p className="text-xs text-slate-600 mt-1">
              Raw material used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Wastage</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{totalWastage.toFixed(0)} kg</div>
            <p className="text-xs text-orange-600 mt-1">
              {wastagePercentage.toFixed(1)}% of input
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{(100 - wastagePercentage).toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1">
              Production efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Materials by Selected Type */}
      {selectedMaterialType !== "all" && filteredMaterialsByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Materials - {selectedMaterialType}</CardTitle>
            <CardDescription>Usage and wastage by individual material</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredMaterialsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="materialName" 
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                          <p className="font-medium">{data.materialName}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">Orders: {data.orderCount}</p>
                            <p className="text-sm">Planned: {data.totalPlanned.toFixed(0)} kg</p>
                            <p className="text-sm text-green-600">Used: {data.totalUsed.toFixed(0)} kg</p>
                            <p className="text-sm text-orange-600">Wastage: {data.totalWastage.toFixed(0)} kg</p>
                            <p className="text-sm text-blue-600">Efficiency: {data.efficiency.toFixed(1)}%</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="totalUsed" fill="#10b981" name="Material Used (kg)" />
                <Bar dataKey="totalWastage" fill="#f59e0b" name="Wastage (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Production Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Production Trend</CardTitle>
            <CardDescription>Net weight and wastage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
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
                <Line 
                  type="monotone" 
                  dataKey="netWeight" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Net Weight (kg)"
                />
                <Line 
                  type="monotone" 
                  dataKey="wastage" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Wastage (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Material Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Production by Material Type</CardTitle>
            <CardDescription>Output distribution by material category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={materialTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(0)}kg`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {materialTypeDistribution.map((entry, index) => (
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
                          <p className="text-sm text-green-600">Output: {data.value.toFixed(0)} kg</p>
                          <p className="text-sm text-slate-600">Orders: {data.orders}</p>
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
      </div>

      {/* Production by Material Type - Detailed */}
      <Card>
        <CardHeader>
          <CardTitle>Production Analysis by Material Type</CardTitle>
          <CardDescription>Output, wastage, and efficiency by material category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productionByMaterialType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="material" 
                stroke="#64748b"
                tickFormatter={(value) => value.replace(' Polyethylene', '').replace('Poly', 'P')}
              />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                        <p className="font-medium">{data.material}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">Orders: {data.orders}</p>
                          <p className="text-sm">Input: {data.input.toFixed(0)} kg</p>
                          <p className="text-sm text-green-600">Output: {data.netWeight.toFixed(0)} kg</p>
                          <p className="text-sm text-orange-600">Wastage: {data.wastage.toFixed(0)} kg ({data.wastageRate.toFixed(1)}%)</p>
                          <p className="text-sm text-blue-600">Efficiency: {data.efficiency.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="netWeight" fill="#10b981" name="Net Weight (kg)" />
              <Bar dataKey="wastage" fill="#ef4444" name="Wastage (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Production by Individual Material */}
      <Card>
        <CardHeader>
          <CardTitle>Production by Individual Material</CardTitle>
          <CardDescription>Detailed breakdown by specific material</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productionByMaterial}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="materialName" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                        <p className="font-medium">{data.materialName}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">Orders: {data.orderCount}</p>
                          <p className="text-sm">Planned: {data.totalPlanned.toFixed(0)} kg</p>
                          <p className="text-sm text-green-600">Used: {data.totalUsed.toFixed(0)} kg</p>
                          <p className="text-sm text-orange-600">Wastage: {data.totalWastage.toFixed(0)} kg ({data.wastageRate.toFixed(1)}%)</p>
                          <p className="text-sm text-blue-600">Efficiency: {data.efficiency.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="totalUsed" fill="#3b82f6" name="Material Used (kg)" />
              <Bar dataKey="totalWastage" fill="#f59e0b" name="Wastage (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Production by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Production by Order Status</CardTitle>
          <CardDescription>Output breakdown by order status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productionByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="status" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const efficiency = data.input > 0 ? ((data.output / data.input) * 100) : 0;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                        <p className="font-medium capitalize">{data.status.replace('_', ' ')}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">Orders: {data.count}</p>
                          <p className="text-sm">Input: {data.input.toFixed(0)} kg</p>
                          <p className="text-sm text-green-600">Output: {data.output.toFixed(0)} kg</p>
                          <p className="text-sm text-orange-600">Wastage: {data.wastage.toFixed(0)} kg</p>
                          <p className="text-sm text-blue-600">Efficiency: {efficiency.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="output" fill="#8b5cf6" name="Output (kg)" />
              <Bar dataKey="wastage" fill="#ef4444" name="Wastage (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Production by Customer (Top 10) */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Customers by Production Output</CardTitle>
          <CardDescription>Highest producing customers</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productionByCustomer}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="customer" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                        <p className="font-medium">{data.customer}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">Orders: {data.orders}</p>
                          <p className="text-sm text-green-600">Output: {data.netWeight.toFixed(0)} kg</p>
                          <p className="text-sm text-orange-600">Wastage: {data.wastage.toFixed(0)} kg</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="netWeight" fill="#3b82f6" name="Net Weight (kg)" />
              <Bar dataKey="wastage" fill="#f59e0b" name="Wastage (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Material Type Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Material Type Detailed Analysis</CardTitle>
          <CardDescription>Performance metrics by material type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productionByMaterialType.map((typeData, typeIndex) => (
              <div key={typeIndex} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-slate-900">{typeData.material}</h3>
                    <p className="text-sm text-slate-600">
                      {typeData.orders} orders • {typeData.input.toFixed(0)} kg input • 
                      <span className="text-green-600 ml-1">{typeData.netWeight.toFixed(0)} kg output</span> • 
                      <span className="text-orange-600 ml-1">{typeData.wastage.toFixed(0)} kg wastage</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={typeData.efficiency >= 95 ? "default" : "secondary"}>
                      {typeData.efficiency.toFixed(1)}% efficiency
                    </Badge>
                    <Badge variant={typeData.wastageRate <= 5 ? "default" : "destructive"}>
                      {typeData.wastageRate.toFixed(1)}% wastage
                    </Badge>
                  </div>
                </div>
                
                {/* Find individual materials for this type */}
                <div className="mt-3">
                  <p className="text-sm font-medium text-slate-700 mb-2">Individual Materials:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {productionByMaterial
                      .filter((mat: any) => {
                        // Match materials to their type
                        const materialInfo = mockMaterials.find(m => m.materialName === mat.materialName);
                        return materialInfo?.materialType === typeData.material;
                      })
                      .map((mat: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 rounded p-2">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium">{mat.materialName}</span>
                            <span className="text-xs text-slate-600">{mat.orderCount} orders</span>
                          </div>
                          <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-slate-600">Used:</span>
                              <span className="text-green-600 ml-1">{mat.totalUsed.toFixed(0)}kg</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Wastage:</span>
                              <span className="text-orange-600 ml-1">{mat.totalWastage.toFixed(0)}kg</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Rate:</span>
                              <span className={`ml-1 ${mat.wastageRate <= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                {mat.wastageRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Materials Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Materials Summary</CardTitle>
          <CardDescription>Complete material usage and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-slate-600">Material</th>
                  <th className="text-left p-3 text-slate-600">Type</th>
                  <th className="text-right p-3 text-slate-600">Orders</th>
                  <th className="text-right p-3 text-slate-600">Planned (kg)</th>
                  <th className="text-right p-3 text-slate-600">Used (kg)</th>
                  <th className="text-right p-3 text-slate-600">Wastage (kg)</th>
                  <th className="text-right p-3 text-slate-600">Wastage %</th>
                  <th className="text-right p-3 text-slate-600">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {productionByMaterial.map((material, index) => {
                  const materialInfo = mockMaterials.find(m => m.materialName === material.materialName);
                  return (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium">{material.materialName}</td>
                      <td className="p-3 text-slate-600 text-sm">
                        {materialInfo?.materialType || 'Unknown'}
                      </td>
                      <td className="p-3 text-right">{material.orderCount}</td>
                      <td className="p-3 text-right text-slate-600">{material.totalPlanned.toFixed(0)}</td>
                      <td className="p-3 text-right text-green-600">{material.totalUsed.toFixed(0)}</td>
                      <td className="p-3 text-right text-orange-600">{material.totalWastage.toFixed(0)}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          material.wastageRate <= 3 ? 'bg-green-100 text-green-700' :
                          material.wastageRate <= 5 ? 'bg-blue-100 text-blue-700' :
                          material.wastageRate <= 7 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {material.wastageRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          material.efficiency >= 95 ? 'bg-green-100 text-green-700' :
                          material.efficiency >= 90 ? 'bg-blue-100 text-blue-700' :
                          material.efficiency >= 85 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {material.efficiency.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="p-3 font-medium" colSpan={2}>Total</td>
                  <td className="p-3 text-right font-medium">
                    {filteredOrders.length}
                  </td>
                  <td className="p-3 text-right font-medium">
                    {productionByMaterial.reduce((sum, m) => sum + m.totalPlanned, 0).toFixed(0)}
                  </td>
                  <td className="p-3 text-right font-medium text-green-600">
                    {productionByMaterial.reduce((sum, m) => sum + m.totalUsed, 0).toFixed(0)}
                  </td>
                  <td className="p-3 text-right font-medium text-orange-600">
                    {productionByMaterial.reduce((sum, m) => sum + m.totalWastage, 0).toFixed(0)}
                  </td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
