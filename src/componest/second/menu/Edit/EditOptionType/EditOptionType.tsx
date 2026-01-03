import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getOptionTypes, updateOptionType } from '../../../../redux/option/optionTypeActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import '../../create/optionType/createOptionType.css';

const EditOptionType: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{id: string;}>();
  const { handleUpdate, updateState, toast } = useCRUD();

  const optionTypeState = useSelector((state: RootState) => state.v2.optionType);
  const rawOptionTypes = optionTypeState?.list;
  const optionTypes = Array.isArray(rawOptionTypes) ? rawOptionTypes : [];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load option types on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await dispatch(getOptionTypes({}));
      } catch (error) {

      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Populate form when option type data is loaded
  useEffect(() => {
    if (id && Array.isArray(optionTypes) && optionTypes.length > 0) {
      const type = optionTypes.find((t: any) => t._id === id);
      if (type) {
        setName(type.name || '');
        setDescription(type.description || '');
      }
    }
  }, [id, optionTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error('Validation Error', 'Option Type Name is required');
      return;
    }

    if (!id) {
      toast.error('Error', 'Option Type ID is missing');
      return;
    }

    const branchId = localStorage.getItem('selectedBranch') || '';

    const optionTypeData = {
      name,
      description,
      branchId,
      isActive: true
    };

    handleUpdate(
      () => dispatch(updateOptionType(id, optionTypeData)),
      {
        successMessage: 'Option Type updated successfully!',
        errorMessage: 'Failed to update Option Type',
        onSuccess: () => {
          setTimeout(() => {
            navigate('/menu/edit/optionType');
          }, 1500);
        }
      }
    );
  };

  const handleCancel = () => {
    navigate('/menu/edit/optionType');
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading option type data...
      </div>);

  }

  return (
    <div className="createOptionTypeContainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Edit Option Type</h2>
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

      <form onSubmit={handleSubmit} className="optionTypeForm">
        <div className="formSection">
          <div className="formGroup">
            <label>Option Type Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Plastic Bag, Printing Type, Material Type"
              required
              className="inputBox" />

          </div>

          <div className="formGroup">
            <label>Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this option type"
              rows={4}
              className="inputBox" />

          </div>
        </div>

        <div className="formActions">
          <button
            type="submit"
            disabled={updateState === 'loading'}
            style={{
              width: '100%',
              padding: '14px',
              background: updateState === 'loading' ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: updateState === 'loading' ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '10px'
            }}>

            {updateState === 'loading' ? 'Updating...' : updateState === 'success' ? 'Updated!' : 'Update Option Type'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              width: '100%',
              padding: '14px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 600
            }}>

            Cancel
          </button>
        </div>
      </form>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>);

};

export default EditOptionType;