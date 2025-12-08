import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getOptions, updateOption } from '../../../../redux/option/optionActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import '../../create/option/createOption.css';

const EditOption = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Redux selectors
  const { options } = useSelector((state: RootState) => state.option);
  const { optionTypes, loading: optionTypesLoading } = useSelector((state: RootState) => state.optionType);

  // Form state
  const [name, setName] = useState('');
  const [optionTypeId, setOptionTypeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load option data and option types on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await dispatch(getOptions({}));
        await dispatch(getOptionTypes({}));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Populate form when option data is loaded
  useEffect(() => {
    if (id && Array.isArray(options) && options.length > 0) {
      const option = options.find((opt: any) => opt._id === id);
      if (option) {
        setName(option.name || '');
        setOptionTypeId(option.optionTypeId || '');
      }
    }
  }, [id, options]);

  const handleSubmit = async () => {
    if (!name || !optionTypeId) {
      alert('Option Type and Option Name are required');
      return;
    }

    if (!id) {
      alert('Option ID is missing');
      return;
    }

    setLoading(true);

    try {
      const branchId = localStorage.getItem('branchId') || '';

      await dispatch(updateOption(id, {
        name,
        optionTypeId,
        branchId
      }));

      alert('Option updated successfully!');
      navigate('/menu/edit/option');
    } catch (err: any) {
      alert(err.message || 'Failed to update option');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/menu/edit/option');
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading option data...
      </div>
    );
  }

  return (
    <div className="createProductCss">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Edit Option</h2>
        <button
          onClick={handleCancel}
          style={{
            padding: '10px 20px',
            background: '#e2e8f0',
            color: '#475569',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          ← Back to List
        </button>
      </div>

      <div className="materialForm">
        <div>
          <label>Option Type *</label>
          <select
            value={optionTypeId}
            onChange={(e) => setOptionTypeId(e.target.value)}
            className="inputBox"
          >
            <option value="">Select option type</option>
            {Array.isArray(optionTypes) && optionTypes.map((type: any) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Option Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="inputBox"
            placeholder="e.g., LDPE Bag 500x300, Standard Printing"
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading || optionTypesLoading}
            style={{
              flex: 1,
              padding: '14px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            {loading ? 'Updating...' : 'Update Option'}
          </button>

          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOption;
