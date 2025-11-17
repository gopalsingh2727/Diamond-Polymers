import React, { useState } from 'react';
import { ActionButton } from '../shared/ActionButton';
import { ToastContainer } from '../shared/Toast';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { useCRUD } from '../../hooks/useCRUD';

/**
 * CRUD Example Component
 * Demonstrates save/update/delete operations with animations
 */
export const CRUDExample: React.FC = () => {
  const {
    saveState,
    updateState,
    deleteState,
    handleSave,
    handleUpdate,
    handleDelete,
    confirmDialog,
    closeConfirmDialog,
    toast
  } = useCRUD();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Simulate API calls
  const simulateSaveAPI = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Saved:', formData);
        resolve();
      }, 1500);
    });
  };

  const simulateUpdateAPI = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Updated:', formData);
        resolve();
      }, 1500);
    });
  };

  const simulateDeleteAPI = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Deleted!');
        resolve();
      }, 1500);
    });
  };

  // Handle save
  const onSave = () => {
    handleSave(simulateSaveAPI, {
      successMessage: 'Data saved successfully!',
      onSuccess: () => {
        setFormData({ name: '', email: '', phone: '' });
      }
    });
  };

  // Handle update
  const onUpdate = () => {
    handleUpdate(simulateUpdateAPI, {
      successMessage: 'Data updated successfully!'
    });
  };

  // Handle delete
  const onDelete = () => {
    handleDelete(simulateDeleteAPI, {
      confirmMessage: 'Are you sure you want to delete this? This action cannot be undone.',
      successMessage: 'Data deleted successfully!',
      onSuccess: () => {
        setFormData({ name: '', email: '', phone: '' });
      }
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 600 }}>
          CRUD Operations Demo
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Test the save, update, and delete operations below. Each operation shows loading states,
            success animations, and toast notifications.
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <ActionButton
            type="save"
            state={saveState}
            onClick={onSave}
          >
            Save Data
          </ActionButton>

          <ActionButton
            type="update"
            state={updateState}
            onClick={onUpdate}
          >
            Update Data
          </ActionButton>

          <ActionButton
            type="delete"
            state={deleteState}
            onClick={onDelete}
          >
            Delete Data
          </ActionButton>
        </div>

        {/* Info boxes */}
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            backgroundColor: '#eff6ff',
            padding: '1rem',
            borderRadius: '0.375rem',
            border: '1px solid #bfdbfe'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#1e40af' }}>
              💡 Try These Features:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.8125rem', color: '#1e40af' }}>
              <li>Click Save - See loading → success → toast notification</li>
              <li>Click Update - Same animations as Save</li>
              <li>Click Delete - Get confirmation dialog first</li>
              <li>Watch button states change (idle → loading → success → error)</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#f0fdf4',
            padding: '1rem',
            borderRadius: '0.375rem',
            border: '1px solid #bbf7d0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#166534' }}>
              ✨ What's Happening:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.8125rem', color: '#166534' }}>
              <li>Buttons show loading spinner during operation</li>
              <li>Success shows green checkmark with bounce animation</li>
              <li>Toasts slide in from right with auto-dismiss</li>
              <li>Delete requires confirmation before executing</li>
              <li>All operations use the useCRUD hook</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
        isLoading={deleteState === 'loading'}
      />
    </div>
  );
};

export default CRUDExample;
