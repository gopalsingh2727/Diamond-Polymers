import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingUp, Package, Weight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DateRangeFilter, DateRange } from "../DateRangeFilter";
import { getDefaultDateRange } from "../../lib/dateUtils";
import { ExportButtons } from "../ExportButtons";
import * as XLSX from "xlsx";
import { fetchCustomersReport } from "../../../../../redux/reports/reports/reportActions";
import type { RootState } from "../../../../../../store";

export function CustomerReport() {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const reportRef = useRef<HTMLDivElement>(null);

  // Get data from Redux store
  const { customers, loading, error } = useSelector((state: RootState) => state.reports);
  const customersData = customers?.customers || [];
  const ordersData = customers?.orders || [];

  // Fetch report data when component mounts or date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const filters = {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      };
      dispatch(fetchCustomersReport(filters) as any);
    }
  }, [dispatch, dateRange.from, dateRange.to]);

  // Filter orders by date range
  const filteredOrders = ordersData.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= dateRange.from && orderDate <= dateRange.to;
  });
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading customer report...</div>
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

  // Calculate customer metrics
  const totalCustomers = customersData.length;
  const activeCustomers = new Set(filteredOrders.map((o: any) => o.customerId)).size;

  // Customer-wise data
  const customerData = Object.values(
    filteredOrders.reduce((acc: any, order: any) => {
      // customerId might be an object (populated) or a string (ID only)
      const customerIdKey = typeof order.customerId === 'object' ? order.customerId?._id : order.customerId;
      const customerName = typeof order.customerId === 'object'
        ? (order.customerId?.companyName || order.customerId?.name)
        : 'Unknown Customer';

      if (!acc[customerIdKey]) {
        acc[customerIdKey] = {
          customerId: customerIdKey,
          name: customerName,
          orders: 0,
          avgEfficiency: 0,
          totalWeight: 0,
          totalWastage: 0,
          completedOrders: 0,
          materials: {} as Record<string, number>
        };
      }
      acc[customerIdKey].orders += 1;
      acc[customerIdKey].totalWeight += order.realTimeData.totalNetWeight || 0;
      acc[customerIdKey].totalWastage += order.realTimeData.totalWastage || 0;
      
      // Track materials used by customer
      const materialType = order.materialType || 'Unknown';
      if (!acc[customerIdKey].materials[materialType]) {
        acc[customerIdKey].materials[materialType] = 0;
      }
      acc[customerIdKey].materials[materialType] += order.realTimeData.totalNetWeight || 0;

      if (order.realTimeData.overallEfficiency > 0) {
        acc[customerIdKey].avgEfficiency += order.realTimeData.overallEfficiency;
      }

      if (order.overallStatus === 'completed') {
        acc[customerIdKey].completedOrders += 1;
      }
      
      return acc;
    }, {} as Record<string, any>)
  ).map(customer => ({
    ...customer,
    avgEfficiency: customer.orders > 0 ? customer.avgEfficiency / customer.orders : 0,
    completionRate: customer.orders > 0 ? (customer.completedOrders / customer.orders) * 100 : 0
  })).sort((a, b) => b.totalWeight - a.totalWeight);

  const topCustomer = customerData[0];
  const totalOutput = customerData.reduce((sum, c) => sum + c.totalWeight, 0);
  const avgOrdersPerCustomer = customerData.length > 0 
    ? customerData.reduce((sum, c) => sum + c.orders, 0) / customerData.length 
    : 0;

  // Material usage by customer (for top customer)
  const topCustomerMaterials = topCustomer ? Object.entries(topCustomer.materials).map(([material, weight]) => ({
    material,
    weight: weight as number,
    percentage: ((weight as number) / topCustomer.totalWeight) * 100
  })).sort((a, b) => b.weight - a.weight) : [];

  // Overall material distribution across all customers
  const materialDistribution = Object.values(
    filteredOrders.reduce((acc, order) => {
      const materialType = order.materialType || 'Unknown';
      if (!acc[materialType]) {
        acc[materialType] = {
          material: materialType,
          weight: 0,
          customers: new Set()
        };
      }
      acc[materialType].weight += order.realTimeData.totalNetWeight || 0;
      acc[materialType].customers.add(order.customerId);
      return acc;
    }, {} as Record<string, any>)
  ).map(item => ({
    material: item.material,
    weight: item.weight,
    customerCount: item.customers.size,
    percentage: (item.weight / totalOutput) * 100
  })).sort((a, b) => b.weight - a.weight);

  // Output distribution
  const outputDistribution = customerData.slice(0, 4).map(c => ({
    name: c.name ? c.name.split(' ')[0] : 'Unknown',
    value: c.totalWeight,
    percentage: totalOutput > 0 ? (c.totalWeight / totalOutput) * 100 : 0
  }));

  const COLORS = ['#FF6B35', '#10b981', '#f59e0b', '#8b5cf6'];



  // Export to Excel function
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Customer Summary Sheet
    const summaryData = customerData.map(c => ({
      'Customer': c.name || 'Unknown Customer',
      'Total Orders': c.orders,
      'Completed Orders': c.completedOrders,
      'Total Weight (kg)': c.totalWeight.toFixed(0),
      'Total Wastage (kg)': c.totalWastage.toFixed(0),
      'Avg Efficiency (%)': c.avgEfficiency.toFixed(1),
      'Completion Rate (%)': c.completionRate.toFixed(1)
    }));
    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Customer Summary");
    
    // Material Usage by Customer Sheet
    const materialData = materialDistribution.map(m => ({
      'Material Type': m.material,
      'Total Weight (kg)': m.weight.toFixed(0),
      'Customer Count': m.customerCount,
      'Percentage (%)': m.percentage.toFixed(1)
    }));
    const ws2 = XLSX.utils.json_to_sheet(materialData);
    XLSX.utils.book_append_sheet(wb, ws2, "Material Usage");
    
    XLSX.writeFile(wb, `Customer_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          <h2 className="text-slate-900">Customer Report</h2>
          <p className="text-slate-600">Customer performance and material usage analysis</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <ExportButtons onExportExcel={handleExportExcel} onPrint={handlePrint} />
          <DateRangeFilter onDateRangeChange={setDateRange} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-[#FF6B35]" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{totalCustomers}</div>
            <p className="text-xs text-green-600 mt-1">
              {activeCustomers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Top Customer</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 truncate">
              {topCustomer && topCustomer.name ? topCustomer.name.split(' ')[0] : 'N/A'}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {topCustomer ? `${topCustomer.totalWeight.toFixed(0)} kg output` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Orders</CardTitle>
            <Package className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">
              {customerData.length > 0 ? avgOrdersPerCustomer.toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Per customer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Output</CardTitle>
            <Weight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{totalOutput.toFixed(0)} kg</div>
            <p className="text-xs text-slate-600 mt-1">
              All customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* No Data Message */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-slate-500">No data available for the selected date range.</p>
              <p className="text-sm text-slate-400 mt-2">Try selecting a different date range.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      {filteredOrders.length > 0 && (
      <>
      {/* Output Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Production Output Distribution</CardTitle>
          <CardDescription>Top 4 customers by output</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outputDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {outputDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value.toFixed(0)} kg`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Material Distribution Across All Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Material Usage Distribution</CardTitle>
          <CardDescription>Output by material type across all customers</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={materialDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="material" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                        <p className="font-medium">{data.material}</p>
                        <p className="text-sm text-green-600">Output: {data.weight.toFixed(0)} kg</p>
                        <p className="text-sm text-[#FF6B35]">Customers: {data.customerCount}</p>
                        <p className="text-sm text-slate-600">Share: {data.percentage.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="weight" fill="#10b981" name="Output (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Efficiency Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Efficiency Analysis (Top 10)</CardTitle>
          <CardDescription>Efficiency and completion rate by customer</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-[#FF6B35]">Avg Efficiency: {data.avgEfficiency.toFixed(1)}%</p>
                        <p className="text-sm text-green-600">Completion: {data.completionRate.toFixed(0)}%</p>
                        <p className="text-sm text-slate-600">Orders: {data.orders}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="avgEfficiency" fill="#FF6B35" name="Avg Efficiency %" />
              <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>Comprehensive customer performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-slate-600">Customer</th>
                  <th className="text-right p-3 text-slate-600">Orders</th>
                  <th className="text-right p-3 text-slate-600">Completed</th>
                  <th className="text-right p-3 text-slate-600">Output (kg)</th>
                  <th className="text-right p-3 text-slate-600">Wastage (kg)</th>
                  <th className="text-right p-3 text-slate-600">Wastage %</th>
                  <th className="text-right p-3 text-slate-600">Avg Efficiency</th>
                  <th className="text-left p-3 text-slate-600">Top Material</th>
                </tr>
              </thead>
              <tbody>
                {customerData.map((customer) => {
                  const wastagePercent = customer.totalWeight > 0 
                    ? (customer.totalWastage / (customer.totalWeight + customer.totalWastage)) * 100 
                    : 0;
                  const topMaterial = Object.entries(customer.materials).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
                  return (
                    <tr key={customer.customerId} className="border-b hover:bg-slate-50">
                      <td className="p-3">{customer.name || 'Unknown Customer'}</td>
                      <td className="p-3 text-right">{customer.orders}</td>
                      <td className="p-3 text-right">
                        <span className="text-green-600">{customer.completedOrders}</span>
                        <span className="text-slate-400 text-xs ml-1">
                          ({customer.completionRate.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="p-3 text-right text-green-600">
                        {customer.totalWeight.toFixed(0)}
                      </td>
                      <td className="p-3 text-right text-orange-600">
                        {customer.totalWastage.toFixed(0)}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          wastagePercent <= 3 ? 'bg-green-100 text-green-700' :
                          wastagePercent <= 5 ? 'bg-orange-100 text-orange-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {wastagePercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          customer.avgEfficiency >= 95 ? 'bg-green-100 text-green-700' :
                          customer.avgEfficiency >= 90 ? 'bg-orange-100 text-orange-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {customer.avgEfficiency.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3">
                        {topMaterial ? (
                          <span className="text-sm text-slate-600">
                            {topMaterial[0]}
                            <span className="text-xs text-slate-400 ml-1">
                              ({((topMaterial[1] as number) / customer.totalWeight * 100).toFixed(0)}%)
                            </span>
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}</tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="p-3 font-medium">Total</td>
                  <td className="p-3 text-right font-medium">
                    {customerData.reduce((sum, c) => sum + c.orders, 0)}
                  </td>
                  <td className="p-3 text-right font-medium text-green-600">
                    {customerData.reduce((sum, c) => sum + c.completedOrders, 0)}
                  </td>
                  <td className="p-3 text-right font-medium text-green-600">
                    {customerData.reduce((sum, c) => sum + c.totalWeight, 0).toFixed(0)}
                  </td>
                  <td className="p-3 text-right font-medium text-orange-600">
                    {customerData.reduce((sum, c) => sum + c.totalWastage, 0).toFixed(0)}
                  </td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}
