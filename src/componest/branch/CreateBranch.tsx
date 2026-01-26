import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { RootState, AppDispatch } from "../../store";
import { InfinitySpinner } from "../../components/InfinitySpinner";
import { addBranchToAuth, logout, SET_SELECTED_BRANCH_IN_AUTH } from "../redux/login/authActions";
import { ADD_BRANCH_TO_LIST } from "../redux/Branch/BranchActions";
import { isTokenExpired, clearAuthData } from "../redux/utils/auth";

const CreateBranch = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { token, userData } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Track if we've already validated to prevent re-checking during state updates
  const hasValidated = useRef(false);

  // Check token validity on initial mount
  useEffect(() => {
    // Skip if already validated or if branch was just created (show success popup)
    if (hasValidated.current || success) return;

    // Skip redirect if branch was just created (session flag)
    if (sessionStorage.getItem('branchJustCreated') === 'true') {
      hasValidated.current = true;
      return;
    }

    // Get token from localStorage as fallback (Redux might not be hydrated yet)
    const storedToken = token || localStorage.getItem("authToken");

    if (!storedToken || isTokenExpired(storedToken)) {
      clearAuthData();
      dispatch(logout());
      navigate("/login", { replace: true });
      return;
    }

    hasValidated.current = true;
  }, []); // Empty dependency - only run on mount

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    code: "",
    phone: "",
    email: ""
  });

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || "https://api.27infinity.in";
  const apiKey = import.meta.env.VITE_API_KEY;

  const handleLogout = () => {
    // Clear the session flag
    sessionStorage.removeItem('branchJustCreated');
    clearAuthData();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Branch name is required");
      return false;
    }
    if (!formData.location.trim()) {
      setError("Location is required");
      return false;
    }
    if (!formData.code.trim()) {
      setError("Branch code is required");
      return false;
    }
    if (formData.code.length > 20) {
      setError("Branch code must be less than 20 characters");
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${baseUrl}/v2/branch`,
        {
          name: formData.name.trim(),
          location: formData.location.trim(),
          code: formData.code.trim().toUpperCase(),
          phone: formData.phone.trim(),
          email: formData.email.trim()
        },
        {
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );



      // Set the newly created branch as selected
      const newBranch = response.data.branch || response.data.data || response.data;
      const newBranchId = newBranch?._id;

      if (newBranchId) {
        // Save to localStorage
        localStorage.setItem('selectedBranch', newBranchId);
        localStorage.setItem('branchId', newBranchId);

        // Update userData in localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          userData.selectedBranch = newBranchId;
          userData.branches = [...(userData.branches || []), newBranch];
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        // Update Redux state with new branch
        dispatch(addBranchToAuth({
          _id: newBranchId,
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          location: formData.location.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim()
        }));

        // Explicitly set the selected branch in Redux
        dispatch({
          type: SET_SELECTED_BRANCH_IN_AUTH,
          payload: newBranchId
        });

        // Add branch to branches list (for dropdown in header)
        dispatch({
          type: ADD_BRANCH_TO_LIST,
          payload: {
            _id: newBranchId,
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            location: formData.location.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim()
          }
        });
      }

      // Auto-navigate to dashboard after branch creation
      navigate("/", { replace: true });
    } catch (err: any) {

      setError(
        err.response?.data?.message || "Failed to create branch. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Only master_admin or admin can create branches
  if (userData?.role !== "master_admin" && userData?.role !== "admin") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only Admins and Master Admins can create branches.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-medium py-2 px-6 rounded-lg transition">

            Go Back
          </button>
        </div>
      </div>);

  }

  // Success state - Popup after branch creation
  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-in fade-in zoom-in">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
          <h3 className="text-lg text-green-600 font-semibold mb-4">Account & Branch Created Successfully</h3>

          {/* Branch Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-600 text-sm mb-2">Your branch details:</p>
            <p className="text-lg font-bold text-gray-800">{formData.name}</p>
            <p className="text-sm text-gray-500">{formData.location}</p>
            <p className="text-xs text-gray-400 mt-1">Code: {formData.code.toUpperCase()}</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                sessionStorage.removeItem('branchJustCreated');
                navigate("/", { replace: true });
              }}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#FFA500] hover:opacity-90 transition shadow-lg">
              Go to Dashboard
            </button>
            {/* <button
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-100 transition">
              Logout
            </button> */}
          </div>

          {/* Info text */}
          <p className="text-xs text-gray-400 mt-4">
            You can access your branch settings anytime from the dashboard.
          </p>
        </div>
      </div>);

  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md border border-gray-200">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B35] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create New Branch</h2>
          <p className="text-gray-600 mt-2">Fill in the details below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Branch Name and Location - Same Line */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Main Factory"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition"
                required />

            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Mumbai, Maharashtra"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition"
                required />

            </div>
          </div>

          {/* Branch Code */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Branch Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., MUM01"
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition uppercase"
              required />

            <p className="text-gray-500 text-xs mt-1">Max 20 characters, will be converted to uppercase</p>
          </div>

          {/* Phone and Email - Same Line */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., +91 9876543210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition" />

            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., branch@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition" />

            </div>
          </div>

          {/* Error Message */}
          {error &&
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          }

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all duration-300 ${
            loading ?
            "bg-gray-400 cursor-not-allowed" :
            "bg-[#FF6B35] hover:bg-[#E55A2B] hover:shadow-lg"}`
            }>

            {loading ?
            <span className="flex items-center justify-center gap-2">
                <InfinitySpinner size="sm" />
                Creating Branch...
              </span> :

            "Create Branch"
            }
          </button>

          {/* Escape options */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              {/* Back to Dashboard - always show */}
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className="flex-1 py-2 px-4 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-100 transition-all duration-300">
                Back to Dashboard
              </button>

              {/* Logout button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2 px-4 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-100 transition-all duration-300">
                Logout
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>);

};

export default CreateBranch;