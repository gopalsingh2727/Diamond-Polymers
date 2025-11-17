import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createManager } from "../../../../redux/Manger/MangerActions";
import { fetchBranches } from "../../../../redux/Branch/BranchActions";
import type { AppDispatch, RootState } from "../../../../../store";
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';

const CreateManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 🚀 CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  // Select branches from Redux store
  const {
    branches = [],
    loading: branchesLoading,
    error: branchesError,
  } = useSelector((state: RootState) => state.branchList || {});

  // Select manager creation state
  const {
    loading: managerLoading,
    error: managerError,
  } = useSelector((state: RootState) => state.managerCreate || {});

  // Form data state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    branchId: "",
  });

  // Fetch branches on mount
  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Form submission handler
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const { username, password, branchId } = formData;

    // Validation
    if (!username.trim()) {
      toast.error('Validation Error', 'Username is required');
      return;
    }
    if (!password.trim()) {
      toast.error('Validation Error', 'Password is required');
      return;
    }
    if (!branchId) {
      toast.error('Validation Error', 'Please select a branch');
      return;
    }

    // Find branch name for success message
    const selectedBranch = branches.find((b: any) => b._id === branchId);
    const branchName = selectedBranch?.name || selectedBranch?.branchName || "Unknown Branch";

    handleSave(
      () => dispatch(createManager(formData)),
      {
        successMessage: `Manager created successfully for ${branchName}!`,
        onSuccess: () => {
          setFormData({ username: '', password: '', branchId: '' });
        }
      }
    );
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Create Manager</h2>

      {/* Status Messages */}
      {branchesLoading && (
        <p className="text-blue-500 text-sm mb-2">Loading branches...</p>
      )}
      {branchesError && (
        <p className="text-red-500 text-sm mb-2">{branchesError}</p>
      )}
      {managerError && (
        <p className="text-red-500 text-sm mb-2">{managerError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Branch *</label>
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
                {branch.name || branch.branchName || 'Unnamed Branch'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username *</label>
          <input
            name="username"
            type="text"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <input
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        <ActionButton
          type="save"
          state={saveState}
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Create Manager
        </ActionButton>
      </form>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateManager;
