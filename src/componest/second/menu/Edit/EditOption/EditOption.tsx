import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getOptions, updateOption } from '../../../../redux/option/optionActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import '../../create/option/createOption.css';

const EditOption = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{id: string;}>();
  const { handleUpdate, updateState, toast } = useCRUD();

  // Redux selectors
  const optionState = useSelector((state: RootState) => state.v2.option);
  const rawOptions = optionState?.list;
  const options = Array.isArray(rawOptions) ? rawOptions : [];
  const optionTypeState = useSelector((state: RootState) => state.v2.optionType);
  const rawOptionTypes = optionTypeState?.list;
  const optionTypes = Array.isArray(rawOptionTypes) ? rawOptionTypes : [];
  const optionTypesLoading = optionTypeState?.loading;

  // Form state
  const [name, setName] = useState('');
  const [optionTypeId, setOptionTypeId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: RootState) => state.auth?.userData?.selectedBranch);

  // Load option data and option types on mount and when branch changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await dispatch(getOptions({}));
        await dispatch(getOptionTypes({}));
      } catch (error) {

      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, selectedBranch]);

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
      toast.error('Validation Error', 'Option Type and Option Name are required');
      return;
    }

    if (!id) {
      toast.error('Error', 'Option ID is missing');
      return;
    }

    const branchId = localStorage.getItem('selectedBranch') || '';

    handleUpdate(
      () => dispatch(updateOption(id, {
        name,
        optionTypeId,
        branchId
      })),
      {
        successMessage: 'Option updated successfully!',
        errorMessage: 'Failed to update option',
        onSuccess: () => {
          setTimeout(() => {
            navigate('/menu/edit/option');
          }, 1500);
        }
      }
    );
  };

  const handleCancel = () => {
    navigate('/menu/edit/option');
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading option data...
      </div>);

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
          }}>

          &larr; Back to List
        </button>
      </div>

      <div className="materialForm">
        <div>
          <label>Option Type *</label>
          <select
            value={optionTypeId}
            onChange={(e) => setOptionTypeId(e.target.value)}
            className="inputBox">

            <option value="">Select option type</option>
            {Array.isArray(optionTypes) && optionTypes.map((type: any) =>
            <option key={type._id} value={type._id}>
                {type.name}
              </option>
            )}
          </select>
        </div>

        <div>
          <label>Option Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="inputBox"
            placeholder="e.g., LDPE Bag 500x300, Standard Printing" />

        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSubmit}
            disabled={updateState === 'loading' || optionTypesLoading}
            style={{
              flex: 1,
              padding: '14px',
              background: updateState === 'loading' ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: updateState === 'loading' ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600
            }}>

            {updateState === 'loading' ? 'Updating...' : updateState === 'success' ? 'Updated!' : 'Update Option'}
          </button>

          <button
            onClick={handleCancel}
            disabled={updateState === 'loading'}
            style={{
              flex: 1,
              padding: '14px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              cursor: updateState === 'loading' ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600
            }}>

            Cancel
          </button>
        </div>
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>);

};

export default EditOption;