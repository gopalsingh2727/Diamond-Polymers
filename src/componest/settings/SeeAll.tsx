import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RootState } from "../redux/rootReducer";
import { InfinitySpinner } from "../../components/InfinitySpinner";

interface Stats {
  branches: number;
  admins: number;
  managers: number;
  users: number;
  orders: number;
  machines: number;
  customers: number;
}

const SeeAll = () => {
  const navigate = useNavigate();
  const { token, userData } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState<Stats>({
    branches: 0,
    admins: 0,
    managers: 0,
    users: 0,
    orders: 0,
    machines: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || "https://api.27infinity.in";
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch all data in parallel
      const results = await Promise.allSettled([
      axios.get(`${baseUrl}/branch/branches`, {
        headers: { "x-api-key": apiKey, Authorization: `Bearer ${token}` }
      }),
      axios.get(`${baseUrl}/admin/all`, {
        headers: { "x-api-key": apiKey, Authorization: `Bearer ${token}` }
      }),
      axios.get(`${baseUrl}/manager/all`, {
        headers: { "x-api-key": apiKey, Authorization: `Bearer ${token}` }
      }),
      axios.get(`${baseUrl}/v2/orders?page=1&limit=1`, {
        headers: { "x-api-key": apiKey, Authorization: `Bearer ${token}` }
      }),
      axios.get(`${baseUrl}/customer`, {
        headers: { "x-api-key": apiKey, Authorization: `Bearer ${token}` }
      })]
      );

      const newStats: Stats = {
        branches: 0,
        admins: 0,
        managers: 0,
        users: 0,
        orders: 0,
        machines: 0,
        customers: 0
      };

      // Parse results
      if (results[0].status === "fulfilled") {
        newStats.branches = Array.isArray(results[0].value.data) ?
        results[0].value.data.length :
        0;
      }
      if (results[1].status === "fulfilled") {
        const data = results[1].value.data;
        newStats.admins = data.admins?.length || (Array.isArray(data) ? data.length : 0);
      }
      if (results[2].status === "fulfilled") {
        const data = results[2].value.data;
        newStats.managers = data.managers?.length || (Array.isArray(data) ? data.length : 0);
      }
      if (results[3].status === "fulfilled") {
        const data = results[3].value.data;
        // V2 API returns { success: true, data: { data: [], total: N } }
        newStats.orders = data.data?.total || data.total || 0;
      }
      if (results[4].status === "fulfilled") {
        const data = results[4].value.data;
        newStats.customers = data.customers?.length || (Array.isArray(data) ? data.length : 0);
      }

      setStats(newStats);
    } catch (err: any) {

      setError(err.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  // Only master_admin or admin can access this page
  if (userData?.role !== "master_admin" && userData?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to view this page.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-6 rounded-lg transition">

            Go Back
          </button>
        </div>
      </div>);

  }

  const statCards = [
  {
    title: "Branches",
    value: stats.branches,
    icon:
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>,

    color: "from-[#FF6B35] to-[#FFA500]",
    link: "/settings/branches"
  },
  {
    title: "Admins",
    value: stats.admins,
    icon:
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>,

    color: "from-purple-500 to-purple-600",
    link: "/settings/managers"
  },
  {
    title: "Managers",
    value: stats.managers,
    icon:
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>,

    color: "from-blue-500 to-blue-600",
    link: "/settings/managers"
  },
  {
    title: "Customers",
    value: stats.customers,
    icon:
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>,

    color: "from-green-500 to-green-600",
    link: "#"
  },
  {
    title: "Orders",
    value: stats.orders,
    icon:
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>,

    color: "from-indigo-500 to-indigo-600",
    link: "#"
  }];


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition">

            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">System Overview</h1>
            <p className="text-gray-600 text-sm">View all statistics and data</p>
          </div>
        </div>

        {/* Content */}
        {loading ?
        <div className="flex flex-col items-center justify-center py-16">
            <InfinitySpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading statistics...</p>
          </div> :
        error ?
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-medium mb-2">Error Loading Data</div>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
            onClick={fetchStats}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition">

              Retry
            </button>
          </div> :

        <>
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
              {statCards.map((card) =>
            <div
              key={card.title}
              onClick={() => card.link !== "#" && navigate(card.link)}
              className={`bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition ${
              card.link !== "#" ? "cursor-pointer" : ""}`
              }>

                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center text-white`}>
                      {card.icon}
                    </div>
                    {card.link !== "#" &&
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                }
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800">{card.value}</h3>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                </div>
            )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <button
                onClick={() => navigate("/create-branch")}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">

                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#FFA500] rounded-lg flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Create Branch</p>
                    <p className="text-xs text-gray-500">Add new branch</p>
                  </div>
                </button>

                <button
                onClick={() => navigate("/settings/branches")}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">

                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#FFA500] rounded-lg flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">View Branches</p>
                    <p className="text-xs text-gray-500">Manage all branches</p>
                  </div>
                </button>

                <button
                onClick={() => navigate("/settings/managers")}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">

                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">User Management</p>
                    <p className="text-xs text-gray-500">Manage admins & managers</p>
                  </div>
                </button>

                <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">

                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Dashboard</p>
                    <p className="text-xs text-gray-500">Go to main menu</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Master Admin Only - Integration Settings */}
            {userData?.role === "master_admin" &&
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Integration Settings</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <button
                onClick={() => navigate("/settings/api-keys")}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">

                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">External API Keys</p>
                      <p className="text-xs text-gray-500">Manage website integrations</p>
                    </div>
                  </button>

                  <button
                onClick={() => navigate("/settings/branch-settings")}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">

                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Branch Settings</p>
                      <p className="text-xs text-gray-500">Email & WhatsApp config</p>
                    </div>
                  </button>
                </div>
              </div>
          }
          </>
        }
      </div>
    </div>);

};

export default SeeAll;