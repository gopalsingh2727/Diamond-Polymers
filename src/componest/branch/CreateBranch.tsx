import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { RootState, AppDispatch } from "../../store";
import { InfinitySpinner } from "../../components/InfinitySpinner";
import { setSelectedBranchInAuth } from "../redux/login/authActions";

const CreateBranch = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { token, userData } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    code: "",
    phone: "",
    email: ""
  });

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || "https://api.27infinity.in";
  const apiKey = import.meta.env.VITE_API_KEY;

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
        `${baseUrl}/branch/create`,
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
      const newBranchId = response.data.branch?._id || response.data._id;
      if (newBranchId) {
        dispatch(setSelectedBranchInAuth(newBranchId));
      }

      setSuccess(true);

      // Redirect to main menu after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
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

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Branch Created!</h2>
          <p className="text-gray-600 mb-6">
            Your branch has been created successfully.
            <br />
            Redirecting to main menu...
          </p>
          <div className="flex justify-center">
            <InfinitySpinner size="md" />
          </div>
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
        </form>
      </div>
    </div>);

};

export default CreateBranch;