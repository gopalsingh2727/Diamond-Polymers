import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createCategory, updateCategory, deleteCategory } from '../../../../redux/category/categoryActions';
import './createCategory.css';

interface CreateCategoryProps {
  initialData?: {
    _id: string;
    name: string;
    description?: string;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateCategory: React.FC<CreateCategoryProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Category Name is required');
      return;
    }

    setLoading(true);
    const branchId = localStorage.getItem('branchId') || '';

    const categoryData = { name, description, branchId, isActive: true };

    try {
      if (isEditMode) {
        await dispatch(updateCategory(initialData!._id, categoryData) as any);
        alert('Category updated!');
      } else {
        await dispatch(createCategory(categoryData) as any);
        alert('Category created!');
      }
      handleReset();
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      alert('Failed to save Category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Delete this category?")) return;
    try {
      await dispatch(deleteCategory(initialData._id) as any);
      alert('Category deleted');
      if (onSaveSuccess) onSaveSuccess();
    } catch {
      alert('Failed to delete');
    }
  };

  const handleReset = () => {
    setName('');
    setDescription('');
  };

  return (
    <div className="createCategory-container">
      <form onSubmit={handleSubmit} className="createCategory-form">
        {isEditMode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button type="button" onClick={onCancel} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              ← Back to List
            </button>
            <button type="button" onClick={handleDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        )}

        <h2 className="createCategory-title">{isEditMode ? `Edit: ${initialData?.name}` : 'Create Category'}</h2>

        <div className="createCategory-group">
          <label className="createCategory-label">Category Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Products, Materials" required className="createCategory-input" />
        </div>

        <div className="createCategory-group">
          <label className="createCategory-label">Description (Optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} className="createCategory-textarea" />
        </div>

        <button type="submit" disabled={loading} className="createCategory-button">
          {loading ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
        </button>
        {!isEditMode && (
          <button type="button" onClick={handleReset} className="createCategory-resetButton">Reset</button>
        )}
      </form>
    </div>
  );
};

export default CreateCategory;
