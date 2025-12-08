import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import type { AppDispatch } from '../../../../../store';

interface Branch {
  _id: string;
  name: string;
  code?: string;
}

interface RootState {
  auth: {
    userData: {
      branches?: Branch[];
      product27InfinityId?: string;
    } | null;
  };
}

const CreateDeviceAccess: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.auth.userData);

  // Get branches from logged-in user
  const availableBranches = userData?.branches || [];
  const product27InfinityId = userData?.product27InfinityId || '';

  // CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  const [formData, setFormData] = useState({
    deviceName: '',
    password: '',
    confirmPassword: '',
    branchId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const { deviceName, password, confirmPassword, branchId } = formData;

    // Validation
    if (!deviceName.trim()) {
      toast.addToast('error', 'Device Name is required');
      return;
    }

    if (!password.trim()) {
      toast.addToast('error', 'Password is required');
      return;
    }

    if (password.length < 4) {
      toast.addToast('error', 'Password must be at least 4 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.addToast('error', 'Passwords do not match');
      return;
    }

    if (!branchId) {
      toast.addToast('error', 'Please select a branch');
      return;
    }

    if (!product27InfinityId) {
      toast.addToast('error', 'Missing product27InfinityId. Please re-login.');
      return;
    }

    // TODO: Add dispatch action for createDeviceAccess
    // handleSave(
    //   () => dispatch(createDeviceAccess({
    //     deviceName,
    //     password,
    //     branchId,
    //     product27InfinityId,
    //   })),
    //   {
    //     successMessage: 'Device Access created successfully!',
    //     onSuccess: () => {
    //       setFormData({
    //         deviceName: '',
    //         password: '',
    //         confirmPassword: '',
    //         branchId: '',
    //       });
    //     }
    //   }
    // );

    // Temporary success message (remove when backend is ready)
    toast.addToast('info', 'Device Access form ready - Backend API pending');
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Device Access</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Device Name *</label>
          <input
            type="text"
            name="deviceName"
            placeholder="Enter device name"
            className="w-full p-2 border rounded"
            value={formData.deviceName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            className="w-full p-2 border rounded"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            className="w-full p-2 border rounded"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Branch *</label>
          {availableBranches.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No branches available. Create a branch first.</p>
          ) : (
            <select
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Branch</option>
              {availableBranches.map((branch: Branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name} {branch.code ? `(${branch.code})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <ActionButton
          type="save"
          state={saveState}
          onClick={handleSubmit}
          className="w-full bg-[#FF6B35] text-white py-2 rounded hover:bg-[#E55A2B] transition"
        >
          Create Device Access
        </ActionButton>
      </form>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateDeviceAccess;
