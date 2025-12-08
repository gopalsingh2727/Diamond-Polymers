import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOptionType, updateOptionType, deleteOptionType } from '../../../../redux/option/optionTypeActions';
import { getCategories } from '../../../../redux/category/categoryActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import './createOptionType.css';

// Specification data types matching backend model
type SpecDataType = 'string' | 'number' | 'boolean' | 'date' | 'file' | 'link' | 'refer' | 'dropdown';

interface SpecificationTemplate {
  name: string;
  unit?: string;
  dataType: SpecDataType;
  defaultValue?: any;
  required: boolean;
  allowFormula: boolean;
  dropdownOptions: string[];
  referenceTo?: string;
}

interface CreateOptionTypeProps {
  initialData?: {
    _id: string;
    name: string;
    description?: string;
    categoryId?: string;
    category?: { _id: string; name: string };
    specifications?: SpecificationTemplate[];
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateOptionType: React.FC<CreateOptionTypeProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch<AppDispatch>();

  const { categories } = useSelector((state: RootState) => state.category);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getCategories({}));
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategoryId(initialData.categoryId || initialData.category?._id || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Option Type Name is required');
      return;
    }

    setLoading(true);
    const branchId = localStorage.getItem('branchId') || '';

    const optionTypeData = {
      name,
      description,
      branchId,
      categoryId: categoryId || undefined,
      isActive: true,
    };

    try {
      if (isEditMode) {
        await dispatch(updateOptionType(initialData!._id, optionTypeData) as any);
        alert('Option Type updated!');
      } else {
        await dispatch(createOptionType(optionTypeData) as any);
        alert('Option Type created!');
      }
      handleReset();
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      alert('Failed to save Option Type');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Delete this option type?")) return;
    try {
      await dispatch(deleteOptionType(initialData._id) as any);
      alert('Option Type deleted');
      if (onSaveSuccess) onSaveSuccess();
    } catch {
      alert('Failed to delete');
    }
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setCategoryId('');
  };

  return (
    <div className="createOptionType-container">
      <form onSubmit={handleSubmit} className="createOptionType-form">
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

        <h2 className="createOptionType-title">{isEditMode ? `Edit: ${initialData?.name}` : 'Create Option Type'}</h2>

        <div className="createOptionType-group">
          <label className="createOptionType-label">Option Type Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Plastic Bag, Printing Type" required className="createOptionType-input" />
        </div>

        <div className="createOptionType-group">
          <label className="createOptionType-label">Category (Optional)</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="createOptionType-input">
            <option value="">Select a category</option>
            {Array.isArray(categories) && categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="createOptionType-group">
          <label className="createOptionType-label">Description (Optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} className="createOptionType-textarea" />
        </div>

        <button type="submit" disabled={loading} className="createOptionType-button">
          {loading ? 'Saving...' : isEditMode ? 'Update Option Type' : 'Create Option Type'}
        </button>
        {!isEditMode && (
          <button type="button" onClick={handleReset} className="createOptionType-resetButton">Reset</button>
        )}
      </form>
    </div>
  );
};

export default CreateOptionType;
