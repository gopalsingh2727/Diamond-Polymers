import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOption, updateOption, deleteOption } from '../../../../redux/option/optionActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import './createOption.css';

// Dimension data type
type DimensionDataType = 'string' | 'number' | 'boolean' | 'date' | 'file' | 'link' | 'dropdown';

interface Dimension {
  name: string;
  value: any;
  unit?: string;
  dataType: DimensionDataType;
  public: boolean;
  usedForFormulas: boolean;
  orderTypeOnly: boolean;
  query: boolean;
}

interface CreateOptionProps {
  initialData?: {
    _id: string;
    name: string;
    optionTypeId?: string;
    optionType?: { _id: string; name: string };
    dimensions?: Dimension[];
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateOption: React.FC<CreateOptionProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch<AppDispatch>();

  const { optionTypes, loading: optionTypesLoading } = useSelector((state: RootState) => state.optionType);

  const [name, setName] = useState('');
  const [optionTypeId, setOptionTypeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);

  // Add new dimension
  const addDimension = () => {
    setDimensions([
      ...dimensions,
      {
        name: '',
        value: '',
        unit: '',
        dataType: 'string',
        public: false,
        usedForFormulas: false,
        orderTypeOnly: false,
        query: false,
      },
    ]);
  };

  // Update dimension field
  const updateDimension = (index: number, field: keyof Dimension, value: any) => {
    const updated = [...dimensions];
    updated[index] = { ...updated[index], [field]: value };
    setDimensions(updated);
  };

  // Remove dimension
  const removeDimension = (index: number) => {
    setDimensions(dimensions.filter((_, i) => i !== index));
  };

  useEffect(() => {
    dispatch(getOptionTypes({}));
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setOptionTypeId(initialData.optionTypeId || initialData.optionType?._id || '');
      // Load dimensions with 4 boolean flags
      if (initialData.dimensions) {
        setDimensions(initialData.dimensions.map((dim: any) => ({
          name: dim.name || '',
          value: dim.value || '',
          unit: dim.unit || '',
          dataType: dim.dataType || 'string',
          public: dim.public || false,
          usedForFormulas: dim.usedForFormulas || false,
          orderTypeOnly: dim.orderTypeOnly || false,
          query: dim.query || false,
        })));
      }
    }
  }, [initialData]);


  const handleSubmit = async () => {
    if (!name || !optionTypeId) {
      alert('Option Type and Option Name are required');
      return;
    }

    setLoading(true);

    try {
      const branchId = localStorage.getItem('branchId') || '';
      // Filter out empty dimensions
      const validDimensions = dimensions.filter(dim => dim.name && dim.name.trim() !== '');
      const optionData: any = { name, optionTypeId, branchId, dimensions: validDimensions };

      if (isEditMode) {
        await dispatch(updateOption(initialData!._id, optionData) as any);
        alert('Option updated!');
      } else {
        await dispatch(createOption(optionData));
        alert('Option created!');
      }

      setName('');
      setOptionTypeId('');
      setDimensions([]);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to save option');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Delete this option?")) return;
    try {
      await dispatch(deleteOption(initialData._id) as any);
      alert('Option deleted');
      if (onSaveSuccess) onSaveSuccess();
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <div className="createOption-container">
      <div className="createOption-form">
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

        <h2 className="createOption-title">{isEditMode ? `Edit: ${initialData?.name}` : 'Create Option'}</h2>

        <div className="createOption-group">
          <label className="createOption-label">Option Type *</label>
          <select value={optionTypeId} onChange={(e) => setOptionTypeId(e.target.value)} className="createOption-select">
            <option value="">Select option type</option>
            {Array.isArray(optionTypes) && optionTypes.map((type: any) => (
              <option key={type._id} value={type._id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="createOption-group">
          <label className="createOption-label">Option Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="createOption-input" placeholder="e.g., LDPE Bag 500x300" />
        </div>

        {/* Dimensions Section */}
        <div className="createOption-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label className="createOption-label" style={{ marginBottom: 0 }}>Dimensions (Custom Data)</label>
            <button type="button" onClick={addDimension} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
              + Add Dimension
            </button>
          </div>

          {dimensions.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
              No dimensions added. Click "+ Add Dimension" to add custom data columns.
            </p>
          )}

          {dimensions.map((dim, index) => (
            <div key={index} style={{ padding: '14px', marginBottom: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {/* Row 1: Name, Value, DataType, Unit */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Name *"
                  value={dim.name}
                  onChange={(e) => updateDimension(index, 'name', e.target.value)}
                  style={{ flex: 1, minWidth: '120px', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                />
                <input
                  type={dim.dataType === 'number' ? 'number' : 'text'}
                  placeholder="Value"
                  value={dim.value}
                  onChange={(e) => updateDimension(index, 'value', e.target.value)}
                  style={{ flex: 1, minWidth: '100px', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                />
                <select
                  value={dim.dataType}
                  onChange={(e) => updateDimension(index, 'dataType', e.target.value as DimensionDataType)}
                  style={{ width: '100px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                </select>
                {dim.dataType === 'number' && (
                  <select
                    value={dim.unit || ''}
                    onChange={(e) => updateDimension(index, 'unit', e.target.value)}
                    style={{ width: '70px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                  >
                    <option value="">Unit</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="%">%</option>
                    <option value="$">$</option>
                    <option value="pcs">pcs</option>
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => removeDimension(index)}
                  style={{ padding: '8px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  ✕
                </button>
              </div>

              {/* Row 2: 4 Boolean Flags */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dim.public}
                    onChange={(e) => updateDimension(index, 'public', e.target.checked)}
                  />
                  <span style={{ color: '#059669', fontWeight: 500 }}>Public</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dim.usedForFormulas}
                    onChange={(e) => updateDimension(index, 'usedForFormulas', e.target.checked)}
                  />
                  <span style={{ color: '#7c3aed', fontWeight: 500 }}>Formulas</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dim.orderTypeOnly}
                    onChange={(e) => updateDimension(index, 'orderTypeOnly', e.target.checked)}
                  />
                  <span style={{ color: '#dc2626', fontWeight: 500 }}>Order Type</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dim.query}
                    onChange={(e) => updateDimension(index, 'query', e.target.checked)}
                  />
                  <span style={{ color: '#0284c7', fontWeight: 500 }}>Query</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={loading || optionTypesLoading} className="createOption-button">
          {loading ? 'Saving...' : isEditMode ? 'Update Option' : 'Save Option'}
        </button>
      </div>
    </div>
  );
};

export default CreateOption;
