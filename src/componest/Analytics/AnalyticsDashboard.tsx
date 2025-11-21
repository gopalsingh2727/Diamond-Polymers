import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardData {
  topMaterials: Array<{
    _id: string;
    materialName: string;
    totalUsed: number;
    ordersCount: number;
  }>;
  topProducts: Array<{
    _id: string;
    totalOrders: number;
    totalQuantity: number;
  }>;
  mixingStats: {
    averageMixingTime: number;
    totalMixingTime: number;
    ordersWithMixing: number;
  };
  statusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  wastageStats: {
    totalPlanned: number;
    totalActual: number;
    totalWastage: number;
    wastagePercentage: number;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'products' | 'mixing'>('overview');

  const API_BASE_URL = import.meta.env.VITE_API_27INFINITY_IN;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const COLORS = ['#FF6B35', '#10B981', '#F59E0B', '#EF4444', '#FFA500', '#EC4899'];

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const branchId = localStorage.getItem('selectedBranch');
      const response = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, {
        params: { branchId, days },
        headers: {
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-gray-600">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Material & Product Analytics</h1>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
        <p className="text-gray-600 mt-2">
          Overview of material usage, product orders, and production efficiency
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg shadow-sm">
        {(['overview', 'materials', 'products', 'mixing'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#FF6B35] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600">Total Materials</div>
              <div className="text-3xl font-bold text-[#FF6B35]">
                {analytics.topMaterials.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Different materials used</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600">Total Products</div>
              <div className="text-3xl font-bold text-green-600">
                {analytics.topProducts.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Product types ordered</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600">Avg Mixing Time</div>
              <div className="text-3xl font-bold text-yellow-600">
                {analytics.mixingStats.averageMixingTime?.toFixed(1) || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Minutes per order</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600">Wastage Rate</div>
              <div className="text-3xl font-bold text-red-600">
                {analytics.wastageStats.wastagePercentage?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Material wastage</div>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Order Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusBreakdown}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Top Materials Used</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.topMaterials}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="materialName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalUsed" fill="#FF6B35" name="Total Used (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Material Usage Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Material Name</th>
                    <th className="px-4 py-3 text-right">Total Used (kg)</th>
                    <th className="px-4 py-3 text-right">Orders Count</th>
                    <th className="px-4 py-3 text-right">Avg per Order (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topMaterials.map((material, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{material.materialName}</td>
                      <td className="px-4 py-3 text-right">{material.totalUsed.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{material.ordersCount}</td>
                      <td className="px-4 py-3 text-right">
                        {(material.totalUsed / material.ordersCount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wastage Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Material Wastage Analysis</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-gray-600">Total Planned</div>
                <div className="text-2xl font-bold text-[#FF6B35]">
                  {analytics.wastageStats.totalPlanned?.toFixed(2) || 0} kg
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-gray-600">Total Actual</div>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.wastageStats.totalActual?.toFixed(2) || 0} kg
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-gray-600">Total Wastage</div>
                <div className="text-2xl font-bold text-red-600">
                  {analytics.wastageStats.totalWastage?.toFixed(2) || 0} kg
                  ({analytics.wastageStats.wastagePercentage?.toFixed(1) || 0}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Most Ordered Products</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalOrders" fill="#FFA500" name="Total Orders" />
                <Bar yAxisId="right" dataKey="totalQuantity" fill="#F59E0B" name="Total Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Product Order Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Product Type</th>
                    <th className="px-4 py-3 text-right">Total Orders</th>
                    <th className="px-4 py-3 text-right">Total Quantity</th>
                    <th className="px-4 py-3 text-right">Avg Quantity/Order</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((product, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{product._id}</td>
                      <td className="px-4 py-3 text-right">{product.totalOrders}</td>
                      <td className="px-4 py-3 text-right">{product.totalQuantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        {(product.totalQuantity / product.totalOrders).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mixing Tab */}
      {activeTab === 'mixing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-gray-600">Average Mixing Time</div>
              <div className="text-3xl font-bold text-[#FF6B35]">
                {analytics.mixingStats.averageMixingTime?.toFixed(1) || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">minutes</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-gray-600">Total Mixing Time</div>
              <div className="text-3xl font-bold text-green-600">
                {((analytics.mixingStats.totalMixingTime || 0) / 60).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 mt-1">hours</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-gray-600">Orders with Mixing</div>
              <div className="text-3xl font-bold text-[#FFA500]">
                {analytics.mixingStats.ordersWithMixing || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">orders</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Mixing Efficiency</h2>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-gray-700">
                  On average, each order requires{' '}
                  <span className="font-bold text-[#FF6B35]">
                    {analytics.mixingStats.averageMixingTime?.toFixed(1) || 0} minutes
                  </span>{' '}
                  of mixing time.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-700">
                  Total mixing time in the last {days} days:{' '}
                  <span className="font-bold text-green-600">
                    {((analytics.mixingStats.totalMixingTime || 0) / 60).toFixed(1)} hours
                  </span>
                  {' '}across{' '}
                  <span className="font-bold text-green-600">
                    {analytics.mixingStats.ordersWithMixing || 0} orders
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => alert('Export functionality coming soon')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Export Report (PDF/Excel)
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
