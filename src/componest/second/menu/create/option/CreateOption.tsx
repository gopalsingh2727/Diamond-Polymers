import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOption, updateOption, deleteOption } from '../../../../redux/option/optionActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import { getOptionSpecs } from '../../../../redux/create/optionSpec/optionSpecActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import './createOption.css';

interface CreateOptionProps {
  initialData?: {
    _id: string;
    name: string;
    optionTypeId?: string;
    optionType?: { _id: string; name: string };
    optionSpecId?: string;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateOption: React.FC<CreateOptionProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch<AppDispatch>();

  const { optionTypes, loading: optionTypesLoading } = useSelector((state: RootState) => state.optionType);
  const { optionSpecs, loading: optionSpecsLoading } = useSelector((state: RootState) => (state as any).optionSpec || { optionSpecs: [], loading: false });

  const [name, setName] = useState('');
  const [optionTypeId, setOptionTypeId] = useState('');
  const [optionSpecId, setOptionSpecId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getOptionTypes({}));
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setOptionTypeId(initialData.optionTypeId || initialData.optionType?._id || '');
      setOptionSpecId(initialData.optionSpecId || '');
    }
  }, [initialData]);

  useEffect(() => {
    if (optionTypeId) {
      const branchId = localStorage.getItem('branchId') || '';
      dispatch(getOptionSpecs({ optionTypeId, branchId }));
    } else {
      setOptionSpecId('');
    }
  }, [dispatch, optionTypeId]);

  const handleSubmit = async () => {
    if (!name || !optionTypeId) {
      alert('Option Type and Option Name are required');
      return;
    }

    setLoading(true);

    try {
      const branchId = localStorage.getItem('branchId') || '';
      const optionData: any = { name, optionTypeId, branchId };
      if (optionSpecId) optionData.optionSpecId = optionSpecId;

      if (isEditMode) {
        await dispatch(updateOption(initialData!._id, optionData) as any);
        alert('Option updated!');
      } else {
        await dispatch(createOption(optionData));
        alert('Option created!');
      }

      setName('');
      setOptionTypeId('');
      setOptionSpecId('');
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
          <label className="createOption-label">Option Spec (Optional)</label>
          <select value={optionSpecId} onChange={(e) => setOptionSpecId(e.target.value)} className="createOption-select" disabled={!optionTypeId || optionSpecsLoading}>
            <option value="">No specification</option>
            {Array.isArray(optionSpecs) && optionSpecs.map((spec: any) => (
              <option key={spec._id} value={spec._id}>{spec.name}</option>
            ))}
          </select>
        </div>

        <div className="createOption-group">
          <label className="createOption-label">Option Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="createOption-input" placeholder="e.g., LDPE Bag 500x300" />
        </div>

        <button onClick={handleSubmit} disabled={loading || optionTypesLoading} className="createOption-button">
          {loading ? 'Saving...' : isEditMode ? 'Update Option' : 'Save Option'}
        </button>
      </div>
    </div>
  );
};

export default CreateOption;
