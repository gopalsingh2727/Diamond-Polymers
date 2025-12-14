import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOptionType, updateOptionType, deleteOptionType } from '../../../../redux/option/optionTypeActions';
import { getCategories } from '../../../../redux/category/categoryActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
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
  // 4 boolean flags for dimension usage
  public: boolean;
  usedForFormulas: boolean;
  orderTypeOnly: boolean;
  query: boolean;
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
  const [specifications, setSpecifications] = useState<SpecificationTemplate[]>([]);

  // Add new specification
  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      {
        name: '',
        unit: '',
        dataType: 'string',
        defaultValue: '',
        required: false,
        allowFormula: false,
        dropdownOptions: [],
        referenceTo: '',
        public: false,
        usedForFormulas: false,
        orderTypeOnly: false,
        query: false,
      },
    ]);
  };

  // Update specification field
  const updateSpecification = (index: number, field: keyof SpecificationTemplate, value: any) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
  };

  // Remove specification
  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  useEffect(() => {
    dispatch(getCategories({}));
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategoryId(initialData.categoryId || initialData.category?._id || '');
      // Load specifications with 4 boolean flags
      if (initialData.specifications) {
        setSpecifications(initialData.specifications.map((spec: any) => ({
          name: spec.name || '',
          unit: spec.unit || '',
          dataType: spec.dataType || 'string',
          defaultValue: spec.defaultValue || '',
          required: spec.required || false,
          allowFormula: spec.allowFormula || false,
          dropdownOptions: spec.dropdownOptions || [],
          referenceTo: spec.referenceTo || '',
          public: spec.public || false,
          usedForFormulas: spec.usedForFormulas || false,
          orderTypeOnly: spec.orderTypeOnly || false,
          query: spec.query || false,
        })));
      }
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

    // Filter out empty specifications
    const validSpecs = specifications.filter(spec => spec.name && spec.name.trim() !== '');

    const optionTypeData = {
      name,
      description,
      branchId,
      categoryId: categoryId || undefined,
      isActive: true,
      specifications: validSpecs,
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
    setSpecifications([]);
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
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="createOptionType-input" autoComplete="off">
            <option value="">-- Select a category --</option>
            {Array.isArray(categories) && categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="createOptionType-group">
          <label className="createOptionType-label">Description (Optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} className="createOptionType-textarea" />
        </div>

        {/* Specifications Section */}
        <div className="createOptionType-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label className="createOptionType-label" style={{ marginBottom: 0 }}>Specifications Template</label>
            <button type="button" onClick={addSpecification} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
              + Add Specification
            </button>
          </div>

          {specifications.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: '6px' }}>
              No specifications added. Click "+ Add Specification" to add template dimensions.
            </p>
          )}

          {specifications.map((spec, index) => (
            <div key={index} style={{ padding: '16px', marginBottom: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {/* Row 1: Name, DataType, Unit */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Dimension Name *"
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                  style={{ flex: 2, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                <select
                  value={spec.dataType}
                  onChange={(e) => updateSpecification(index, 'dataType', e.target.value as SpecDataType)}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="file">File</option>
                  <option value="link">Link</option>
                  <option value="dropdown">Dropdown</option>
                </select>
                {spec.dataType === 'number' && (
                  <select
                    value={spec.unit || ''}
                    onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                    style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  >
                    <option value="">Unit</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                    <option value="m">m</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="%">%</option>
                    <option value="pcs">pcs</option>
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Row 2: Default Value */}
              <div style={{ marginBottom: '12px' }}>
                <input
                  type={spec.dataType === 'number' ? 'number' : 'text'}
                  placeholder="Default Value (Optional)"
                  value={spec.defaultValue || ''}
                  onChange={(e) => updateSpecification(index, 'defaultValue', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              {/* Row 3: 4 Boolean Flags */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '12px', background: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={spec.public}
                    onChange={(e) => updateSpecification(index, 'public', e.target.checked)}
                  />
                  <span style={{ color: '#059669', fontWeight: 500 }}>🌐 Public</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={spec.usedForFormulas}
                    onChange={(e) => updateSpecification(index, 'usedForFormulas', e.target.checked)}
                  />
                  <span style={{ color: '#7c3aed', fontWeight: 500 }}>🧮 Used for Formulas</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={spec.orderTypeOnly}
                    onChange={(e) => updateSpecification(index, 'orderTypeOnly', e.target.checked)}
                  />
                  <span style={{ color: '#dc2626', fontWeight: 500 }}>📋 Order Type Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={spec.query}
                    onChange={(e) => updateSpecification(index, 'query', e.target.checked)}
                  />
                  <span style={{ color: '#0284c7', fontWeight: 500 }}>🔍 Query</span>
                </label>
              </div>

              {/* Row 4: Additional flags */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={spec.required}
                    onChange={(e) => updateSpecification(index, 'required', e.target.checked)}
                  />
                  Required
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={spec.allowFormula}
                    onChange={(e) => updateSpecification(index, 'allowFormula', e.target.checked)}
                  />
                  Allow Formula
                </label>
              </div>
            </div>
          ))}
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
