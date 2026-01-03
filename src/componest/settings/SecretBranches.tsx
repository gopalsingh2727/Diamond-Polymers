import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RootState } from "../redux/rootReducer";
import { InfinitySpinner } from "../../components/InfinitySpinner";

interface Branch {
  _id: string;
  name: string;
  code: string;
  location: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

const SecretBranches = () => {
  const navigate = useNavigate();
  const { token, userData } = useSelector((state: RootState) => state.auth);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || "https://api.27infinity.in";
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetchAllBranches();
  }, []);

  const fetchAllBranches = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${baseUrl}/branch/branches`, {
        headers: {
          "x-api-key": apiKey,
          Authorization: `Bearer ${token}`
        }
      });

      setBranches(response.data || []);
    } catch (err: any) {

      setError(err.response?.data?.message || "Failed to load branches");
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
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-6 rounded-lg transition">

            Go Back
          </button>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition">

              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">All Branches</h1>
              <p className="text-gray-600 text-sm">Manage all branches in the system</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/create-branch")}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2">

            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Branch
          </button>
        </div>

        {/* Content */}
        {loading ?
        <div className="flex flex-col items-center justify-center py-16">
            <InfinitySpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading branches...</p>
          </div> :
        error ?
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-medium mb-2">Error Loading Branches</div>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
            onClick={fetchAllBranches}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition">

              Retry
            </button>
          </div> :
        branches.length === 0 ?
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Branches Found</h2>
            <p className="text-gray-600 mb-4">Create your first branch to get started.</p>
            <button
            onClick={() => navigate("/create-branch")}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-6 rounded-lg transition">

              Create Branch
            </button>
          </div> :

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) =>
          <div
            key={branch._id}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-[#FFA500] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{branch.code.substring(0, 2)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{branch.name}</h3>
                      <p className="text-sm text-gray-500">{branch.code}</p>
                    </div>
                  </div>
                  <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                branch.isActive ?
                "bg-green-100 text-green-700" :
                "bg-red-100 text-red-700"}`
                }>

                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{branch.location}</span>
                  </div>

                  {branch.phone &&
              <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{branch.phone}</span>
                    </div>
              }

                  {branch.email &&
              <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{branch.email}</span>
                    </div>
              }
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Created: {new Date(branch.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
          )}
          </div>
        }
      </div>
    </div>);

};

export default SecretBranches;