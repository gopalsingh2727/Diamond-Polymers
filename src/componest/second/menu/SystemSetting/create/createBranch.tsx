import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBranch } from "../../../../redux/createBranchAndManager/branchActions";
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import type { AppDispatch} from "../../../../../store";

const CreateBranch: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    code: "",
  });

  const [errors, setErrors] = useState<Partial<{ name: string; code: string }>>({});

  // 🚀 CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  const branchCreate = useSelector((state: any) => state.branchCreate);
  const { loading } = branchCreate;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    let validationErrors: Partial<{ name: string; code: string }> = {};
    if (!formData.name.trim()) validationErrors.name = "Branch name is required";
    if (!formData.code.trim()) validationErrors.code = "Branch code is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    handleSave(
      () => dispatch(createBranch(formData)),
      {
        successMessage: 'Branch created successfully!',
        onSuccess: () => {
          setFormData({ name: "", location: "", code: "" });
          setErrors({});
        }
      }
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Create New Branch</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Branch Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter branch name"
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter branch code"
          />
          {errors.code && <p className="text-sm text-red-600 mt-1">{errors.code}</p>}
        </div>

        <ActionButton
          type="save"
          state={saveState}
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Create Branch
        </ActionButton>
      </form>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateBranch;