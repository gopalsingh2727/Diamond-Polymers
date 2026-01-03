import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { getOptionSpecsV2, deleteOptionSpecV2, updateOptionSpecV2, getOptionTypesV2 } from '../../../../redux/unifiedV2';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import './EditOptionSpecList.css';
import '../EditMachineType/EditMachineyType.css';

const EditOptionSpecList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { handleSave, handleUpdate, handleDelete: crudDelete, saveState, updateState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const optionSpecState = useSelector((state: RootState) => state.v2.optionSpec);
  const rawOptionSpecs = optionSpecState?.list;
  const optionSpecs = Array.isArray(rawOptionSpecs) ? rawOptionSpecs : [];
  const loading = optionSpecState?.loading;
  const optionTypeState = useSelector((state: RootState) => state.v2.optionType);
  const rawOptionTypes = optionTypeState?.list;
  const optionTypes = Array.isArray(rawOptionTypes) ? rawOptionTypes : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getOptionSpecsV2());
    dispatch(getOptionTypesV2());
  }, [dispatch]);

  // Get option type name - handles both populated object and string ID
  const getOptionTypeName = (optionTypeId: any) => {
    if (!optionTypeId) return 'N/A';

    // If optionTypeId is already populated (object with name)
    if (typeof optionTypeId === 'object' && optionTypeId.name) {
      return optionTypeId.name;
    }

    // If optionTypeId is a string, look up from optionTypes array
    if (typeof optionTypeId === 'string' && Array.isArray(optionTypes)) {
      const type = optionTypes.find((t: any) => t._id === optionTypeId);
      return type?.name || 'N/A';
    }

    return 'N/A';
  };

  // Filter option specs based on search
  const filteredSpecs = Array.isArray(optionSpecs)
    ? optionSpecs.filter((spec: any) =>
        spec.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getOptionTypeName(spec.optionTypeId).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const selectedItem = filteredSpecs[selectedRow];

  const handleRowClick = (index: number, item: any) => {
    setSelectedRow(index);
    setEditId(item._id);
    setEditName(item.name || '');
    setEditCode(item.code || '');
    setEditDescription(item.description || '');
    setShowDetail(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      toast.error('Validation Error', 'Option Spec Name cannot be empty');
      return;
    }

    if (!editId) return;

    const branchId = localStorage.getItem('selectedBranch') || '';

    await handleUpdate(
      () => dispatch(updateOptionSpecV2(editId, {
        name: editName,
        code: editCode,
        description: editDescription,
        branchId,
        specifications: selectedItem.specifications || []
      })),
      {
        successMessage: 'Option Spec updated successfully!',
        errorMessage: 'Failed to update Option Spec.',
        onSuccess: () => {
          setTimeout(() => {
            setShowDetail(false);
            dispatch(getOptionSpecsV2());
          }, 1500);
        }
      }
    );
  };

  const handleDeleteClick = async () => {
    if (!editId) return;

    await crudDelete(
      () => dispatch(deleteOptionSpecV2(editId)),
      {
        confirmTitle: 'Delete Option Spec',
        confirmMessage: 'Are you sure you want to delete this option spec?',
        successMessage: 'Deleted successfully.',
        errorMessage: 'Failed to delete.',
        onSuccess: () => {
          setShowDetail(false);
          dispatch(getOptionSpecsV2());
        }
      }
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedRow(0);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading option specifications...
      </div>
    );
  }

  return (
    <div className="EditOptionSpec EditMachineType">
      {!showDetail && !loading && optionSpecs.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Page Title */}
          <h2 className="editsectionsTable-title">Option Specifications</h2>

          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by name, code, description, or option type..."
                value={searchTerm}
                className="editsectionsTable-searchInput"
                onChange={handleSearchChange}
              />
              <span className="editsectionsTable-searchIcon">🔍</span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="editsectionsTable-clearButton"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="editsectionsTable-countBadge">
              {filteredSpecs.length} of {optionSpecs.length} specs
            </div>
          </div>

          {/* Table */}
          {filteredSpecs.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Option Spec</th>
                    <th className="editsectionsTable-th">Code</th>
                    <th className="editsectionsTable-th">Option Type</th>
                    <th className="editsectionsTable-th">Dimensions</th>
                    <th className="editsectionsTable-th">Branch</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredSpecs.map((item: any, index: number) => (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, item)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{item.name}</td>
                      <td className="editsectionsTable-td">{item.code || 'N/A'}</td>
                      <td className="editsectionsTable-td">{getOptionTypeName(item.optionTypeId)}</td>
                      <td className="editsectionsTable-td">{item.specifications?.length || 0}</td>
                      <td className="editsectionsTable-td">{item.branchId?.name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No option specs found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : showDetail && selectedItem ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDeleteClick} className="Delete" disabled={deleteState === 'loading'}>
              {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
            </button>
          </div>

          <div className="form-section">
            <label>Option Spec Name:</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Code:</label>
            <input
              type="text"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Description:</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
            />
          </div>

          <button
            onClick={handleEditSave}
            className="save-button"
            disabled={
              updateState === 'loading' ||
              (editName === selectedItem.name &&
              editCode === selectedItem.code &&
              editDescription === selectedItem.description)
            }
          >
            {updateState === 'loading' ? 'Saving...' : 'Save'}
          </button>

          <div className="info-section">
            <p>
              <strong>Option Type:</strong> {getOptionTypeName(selectedItem.optionTypeId)}
            </p>
            <p>
              <strong>Total Dimensions:</strong>{" "}
              {selectedItem.specifications?.length || 0}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString() : 'N/A'}
            </p>
          </div>

          {selectedItem.specifications && selectedItem.specifications.length > 0 && (
            <table className="specs-details-table">
              <thead>
                <tr>
                  <th>Dimension Name</th>
                  <th>Data Type</th>
                  <th>Unit</th>
                  <th>Formula</th>
                </tr>
              </thead>
              <tbody>
                {selectedItem.specifications.map((spec: any, idx: number) => (
                  <tr key={idx}>
                    <td>{spec.name}</td>
                    <td>{spec.dataType}</td>
                    <td>{spec.unit || '-'}</td>
                    <td>{spec.formula || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        !loading && <p>No option specs available.</p>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{confirmDialog.title}</h3>
            <p style={{ marginBottom: '24px', color: '#666' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeConfirmDialog}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#dc2626',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditOptionSpecList;
