import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOptionType, updateOptionType, deleteOptionType } from '../../../../redux/option/optionTypeActions';
import { getCategories } from '../../../../redux/category/categoryActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import './createOptionType.css';

// Specification data types - only string and number
type SpecDataType = 'string' | 'number';

interface SpecificationTemplate {
  name: string;
  unit?: string;
  dataType: SpecDataType;
  defaultValue?: any;
  required: boolean;
  allowFormula: boolean;
  // Visibility flag
  visible: boolean;
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
        visible: true,
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
      // Load specifications with visibility flag
      if (initialData.specifications) {
        setSpecifications(initialData.specifications.map((spec: any) => ({
          name: spec.name || '',
          unit: spec.unit || '',
          dataType: (spec.dataType === 'string' || spec.dataType === 'number') ? spec.dataType : 'string',
          defaultValue: spec.defaultValue || '',
          required: spec.required || false,
          allowFormula: spec.allowFormula || false,
          visible: spec.visible !== false,
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

  return (
    <form onSubmit={handleSubmit} className="createOptionType-container">
      {/* Header Section */}
      <div className="createOptionType-header">
        {isEditMode && (
          <div className="createOptionType-actionButtons">
            <button type="button" onClick={onCancel} className="createOptionType-backButton">
              ← Back to List
            </button>
            <button type="button" onClick={handleDelete} className="createOptionType-deleteButton">
              Delete
            </button>
          </div>
        )}
        <h1 className="createOptionType-title">{isEditMode ? `Edit: ${initialData?.name}` : 'Create Option Type'}</h1>
        <p className="createOptionType-subtitle">Define option types and their specification templates</p>
      </div>

      {/* Form Grid */}
      <div className="createOptionType-formGrid">
        {/* Basic Information Section */}
        <div className="createOptionType-section">
          <h3 className="createOptionType-sectionTitle">Basic Information</h3>

          <div className="createOptionType-row">
            <div className="createOptionType-column">
              <label className="createOptionType-label">Option Type Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Plastic Bag, Printing Type" required className="createOptionType-input" />
            </div>
            <div className="createOptionType-column">
              <label className="createOptionType-label">Category (Optional)</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="createOptionType-input" autoComplete="off">
                <option value="">-- Select a category --</option>
                {Array.isArray(categories) && categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="createOptionType-group">
            <label className="createOptionType-label">Description (Optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} className="createOptionType-textarea" />
          </div>
        </div>

        {/* Specifications Section */}
        <div className="createOptionType-section">
          <div className="createOptionType-specsHeader">
            <h3 className="createOptionType-sectionTitle" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Specifications Template</h3>
            <button type="button" onClick={addSpecification} className="createOptionType-addButton">
              + Add Specification
            </button>
          </div>

          {specifications.length === 0 && (
            <p className="createOptionType-emptyState">
              No specifications added. Click "+ Add Specification" to add template dimensions.
            </p>
          )}

          {specifications.map((spec, index) => (
            <div key={index} className="createOptionType-specCard">
              {/* Row 1: Name, DataType, Unit */}
              <div className="createOptionType-specRow">
                <input
                  type="text"
                  placeholder="Dimension Name *"
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                  className="createOptionType-specInput"
                />
                <select
                  value={spec.dataType}
                  onChange={(e) => updateSpecification(index, 'dataType', e.target.value as SpecDataType)}
                  className="createOptionType-specSelect"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                </select>
                {spec.dataType === 'number' && (
                  <select
                    value={spec.unit || ''}
                    onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                    className="createOptionType-unitSelect"
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
                  className="createOptionType-removeButton"
                >
                  ✕
                </button>
              </div>

              {/* Row 2: Default Value */}
              <input
                type={spec.dataType === 'number' ? 'number' : 'text'}
                placeholder="Default Value (Optional)"
                value={spec.defaultValue || ''}
                onChange={(e) => updateSpecification(index, 'defaultValue', e.target.value)}
                className="createOptionType-defaultInput"
              />

              {/* Row 3: Visibility Toggle */}
              <div className="createOptionType-visibilityRow">
                <label className="createOptionType-visibilityLabel">
                  <input
                    type="checkbox"
                    checked={spec.visible}
                    onChange={(e) => updateSpecification(index, 'visible', e.target.checked)}
                  />
                  <span className={`createOptionType-visibilityText ${spec.visible ? 'visible' : 'hidden'}`}>
                    {spec.visible ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>

              {/* Row 4: Additional flags */}
              <div className="createOptionType-flagsRow">
                <label className="createOptionType-flagLabel">
                  <input
                    type="checkbox"
                    checked={spec.required}
                    onChange={(e) => updateSpecification(index, 'required', e.target.checked)}
                  />
                  Required
                </label>
                <label className="createOptionType-flagLabel">
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
      </div>

      {/* Form Actions */}
      <div className="createOptionType-formActions">
        <button type="submit" disabled={loading} className="createOptionType-button">
          {loading ? 'Saving...' : isEditMode ? 'Update Option Type' : 'Save Option Type'}
        </button>
      </div>
    </form>
  );
};

export default CreateOptionType;
