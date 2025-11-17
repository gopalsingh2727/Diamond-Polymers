import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchBranches } from "../redux/Branch/BranchActions";
import { setSelectedBranchInAuth } from "../redux/login/authActions";
import type { RootState, AppDispatch } from "../../store";

const BranchSelect = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, branches } = useSelector((state: RootState) => state.branches);
  const { isAuthenticated, userData } = useSelector((state: RootState) => state.auth);

  const [selectedBranch, setSelectedBranch] = useState("");

  useEffect(() => {
    if (isAuthenticated && userData?.role === "admin" && !userData?.selectedBranch) {
      dispatch(fetchBranches());
    }
  }, [isAuthenticated, userData?.role, userData?.selectedBranch, dispatch]);

  useEffect(() => {
    if (error === "Invalid or expired token") {
      localStorage.removeItem("userData");
      navigate("/login");
    }
  }, [error, navigate]);

  const handleBranchSelect = () => {
    if (!selectedBranch) return;

    // Use the action creator which handles localStorage update
    dispatch(setSelectedBranchInAuth(selectedBranch));
    navigate("/");
  };

  if (!isAuthenticated || userData?.role !== "admin" || userData?.selectedBranch) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md border border-gray-200">
        <div className="p-6 text-center border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Select Your Branch</h2>
          <p className="text-gray-600 mt-2">Please choose a branch to continue</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading branches...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-red-600 font-medium mb-2">Error Loading Branches</div>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Available Branches</label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-800"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="">-- Select a branch --</option>
                    {branches.map((branch: any) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name} • {branch.location}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all duration-300 ${
                  !selectedBranch
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                }`}
                onClick={handleBranchSelect}
                disabled={!selectedBranch}
              >
                Continue to Dashboard
              </button>
            </>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
          <p className="text-gray-500 text-xs">You can change your branch later from the dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default BranchSelect;