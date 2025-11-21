import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAdmin } from '../../../../redux/Admin/AdminActions';
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { AppDispatch } from "../../../../../store";

const CreateAdmin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: any) => state.adminCreate || {});

  // 🚀 CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    handleSave(
      () => dispatch(createAdmin(formData)),
      {
        successMessage: 'Admin created successfully!',
        onSuccess: () => {
          setFormData({ username: '', password: '' });
        }
      }
    );
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Admin</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full p-2 border rounded"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <ActionButton
          type="save"
          state={saveState}
          onClick={handleSubmit}
          className="bg-[#FF6B35] text-white px-4 py-2 rounded"
        >
          Create Admin
        </ActionButton>
      </form>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateAdmin;