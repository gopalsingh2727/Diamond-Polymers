import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RootState } from "../redux/rootReducer";
import { InfinitySpinner } from "../../components/InfinitySpinner";

interface Manager {
  _id: string;
  username: string;
  email: string;
  role: string;
  branchId?: {
    _id: string;
    name: string;
    code: string;
  };
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const SecretManager = () => {
  const navigate = useNavigate();
  const { token, userData } = useSelector((state: RootState) => state.auth);

  const [managers, setManagers] = useState<Manager[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"managers" | "admins">("managers");

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || "http://localhost:4000/dev";
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [managersRes, adminsRes] = await Promise.all([
        axios.get(`${baseUrl}/manager/all`, {
          headers: {
            "x-api-key": apiKey,
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => ({ data: [] })),
        axios.get(`${baseUrl}/admin/all`, {
          headers: {
            "x-api-key": apiKey,
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => ({ data: [] })),
      ]);

      setManagers(managersRes.data?.managers || managersRes.data || []);
      setAdmins(adminsRes.data?.admins || adminsRes.data || []);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Only master_admin can access this page
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
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600 text-sm">Manage admins and managers</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("managers")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "managers"
                ? "bg-[#FF6B35] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Managers ({managers.length})
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "admins"
                ? "bg-[#FF6B35] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Admins ({admins.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <InfinitySpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading users...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-medium mb-2">Error Loading Data</div>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Managers Tab */}
            {activeTab === "managers" && (
              <>
                {managers.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Managers Found</h2>
                    <p className="text-gray-600 mb-4">Create your first manager to get started.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {managers.map((manager) => (
                      <div
                        key={manager._id}
                        className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {manager.username?.charAt(0).toUpperCase() || "M"}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{manager.username}</h3>
                              <p className="text-sm text-gray-500">{manager.email}</p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              manager.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {manager.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="capitalize">{manager.role}</span>
                          </div>

                          {manager.branchId && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>{manager.branchId.name} ({manager.branchId.code})</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            Created: {new Date(manager.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Admins Tab */}
            {activeTab === "admins" && (
              <>
                {admins.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Admins Found</h2>
                    <p className="text-gray-600 mb-4">No admins have been created yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {admins.map((admin) => (
                      <div
                        key={admin._id}
                        className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {admin.username?.charAt(0).toUpperCase() || "A"}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{admin.username}</h3>
                              <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              admin.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {admin.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="capitalize">{admin.role}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            Created: {new Date(admin.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SecretManager;
