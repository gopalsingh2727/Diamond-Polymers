import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { newcreateManager } from "../../../../redux/Manger/MangerActions";
import { listBranches } from "../../../../redux/Branch/BranchActions";
import type { AppDispatch, RootState } from "../../../../../store";

const CreateManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select branches list and manager creation state from Redux store
  const {
    branches = [],
    loading: branchesLoading,
    error: branchesError,
  } = useSelector((state: RootState) => state.branchList || {});

 const {
  loading,
  error,
  success,
} = useSelector((state: RootState) => state.managerCreateReducer || {});
  // Form data state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    branchId: "",
  });

  // For storing form data with branchName on submit (used in popup)
  const [submittedFormData, setSubmittedFormData] = useState<{
    username: string;
    password: string;
    branchId: string;
    branchName: string;
  } | null>(null);

  // Popup and copy state
  const [showPopup, setShowPopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  // Fetch branches on mount
  useEffect(() => {
    dispatch(listBranches());
  }, [dispatch]);

  // When manager creation is successful, show popup & reset form
  useEffect(() => {
    if (success && submittedFormData) {
      setShowPopup(true);
      setFormData({ username: "", password: "", branchId: "" });
      setSubmittedFormData(null);
    }
  }, [success, submittedFormData]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password, branchId } = formData;
    if (!username || !password || !branchId) return;

    // Find branch name for popup display
    const selectedBranch = branches.find((b: any) => b._id === branchId);
    const branchName = selectedBranch?.name || "Unknown Branch";

    setSubmittedFormData({ ...formData, branchName });

    dispatch(newcreateManager(formData));
  };

  // Popup close handler
  const closePopup = () => {
    setShowPopup(false);
    setCopySuccess("");
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, type = "text") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess(`${type} copied!`);
        setTimeout(() => setCopySuccess(""), 2000);
      })
      .catch(() => {
        setCopySuccess("Failed to copy");
        setTimeout(() => setCopySuccess(""), 2000);
      });
  };

  // Copy all details combined
  const copyAllDetails = () => {
    if (!submittedFormData) return;
    const details = `Branch: ${submittedFormData.branchName}\nUsername: ${submittedFormData.username}\nPassword: ${submittedFormData.password}`;
    copyToClipboard(details, "All details");
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Create Manager</h2>

      {/* Status Messages */}
      {loading && (
        <p className="text-blue-500 text-sm mb-2">Creating manager...</p>
      )}
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {branchesLoading && (
        <p className="text-blue-500 text-sm mb-2">Loading branches...</p>
      )}
      {branchesError && (
        <p className="text-red-500 text-sm mb-2">{branchesError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <select
          name="branchId"
          value={formData.branchId}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Select Branch</option>
          {branches.map((branch: any) => (
            <option key={branch._id} value={branch._id}>
              {branch.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-400"
        >
          {loading ? "Creating..." : "Create Manager"}
        </button>
      </form>

      {/* Success Popup */}
      {showPopup && submittedFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-600">
                Manager Created Successfully!
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="Close popup"
              >
                ×
              </button>
            </div>

            {copySuccess && (
              <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm text-center">
                {copySuccess}
              </div>
            )}

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Branch:</span>
                  <button
                    onClick={() =>
                      copyToClipboard(submittedFormData.branchName, "Branch name")
                    }
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-gray-700">{submittedFormData.branchName}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Username:</span>
                  <button
                    onClick={() =>
                      copyToClipboard(submittedFormData.username, "Username")
                    }
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-gray-700">{submittedFormData.username}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Password:</span>
                  <button
                    onClick={() =>
                      copyToClipboard(submittedFormData.password, "Password")
                    }
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-gray-700">{submittedFormData.password}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={copyAllDetails}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
              >
                Copy All Details
              </button>
              <button
                onClick={closePopup}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateManager;