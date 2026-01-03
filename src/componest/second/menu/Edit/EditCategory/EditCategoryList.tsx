import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store';
import { deleteCategory, updateCategory } from '../../../../redux/category/categoryActions';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { useFormDataCache } from '../hooks/useFormDataCache';
import { ToastContainer } from '../../../../../components/shared/Toast';
import './EditCategoryList.css';

const EditCategoryList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { handleUpdate, handleDelete: crudDelete, updateState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  // Use unified form data cache (same as Account and Daybook)
  const { categories: rawCategories, optionTypes: rawOptionTypes, loading } = useFormDataCache();
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const optionTypes = Array.isArray(rawOptionTypes) ? rawOptionTypes : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Count option types for each category
  const getOptionTypeCount = (categoryId: string) => {
    if (!Array.isArray(optionTypes)) return 0;
    return optionTypes.filter((type: any) => type.categoryId === categoryId).length;
  };

  // Filter categories based on search
  const filteredCategories = Array.isArray(categories)
    ? categories.filter((cat: any) =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.branchId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const selectedItem = filteredCategories[selectedRow];

  const handleRowClick = (index: number, item: any) => {
    setSelectedRow(index);
    setEditId(item._id);
    setEditName(item.name || '');
    setEditDescription(item.description || '');
    setShowDetail(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      toast.error('Validation Error', 'Category Name cannot be empty');
      return;
    }

    if (!editId) return;

    const branchId = localStorage.getItem('selectedBranch') || '';

    handleUpdate(
      () => dispatch(updateCategory(editId, {
        name: editName,
        description: editDescription,
        branchId,
        isActive: true
      })),
      {
        successMessage: 'Category updated successfully!',
        errorMessage: 'Failed to update Category.',
        onSuccess: () => {
          setTimeout(() => {
            setShowDetail(false);
          }, 1500);
        }
      }
    );
  };

  const handleDelete = async () => {
    if (!editId) return;

    crudDelete(
      () => dispatch(deleteCategory(editId)),
      {
        confirmTitle: 'Delete Category',
        confirmMessage: 'Are you sure you want to delete this category?',
        successMessage: 'Deleted successfully.',
        errorMessage: 'Failed to delete.',
        onSuccess: () => {
          setShowDetail(false);
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
        Loading categories...
      </div>
    );
  }

  return (
    <div className="EditCategory EditMachineType">
      {/* Confirmation Dialog */}
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
            <h3 style={{ margin: '0 0 16px 0' }}>{confirmDialog.title}</h3>
            <p style={{ margin: '0 0 24px 0', color: '#64748b' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeConfirmDialog}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                disabled={deleteState === 'loading'}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#dc2626',
                  color: 'white',
                  cursor: deleteState === 'loading' ? 'not-allowed' : 'pointer'
                }}
              >
                {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showDetail && !loading && categories.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by name, description, or branch..."
                value={searchTerm}
                className="editsectionsTable-searchInput"
                onChange={handleSearchChange}
              />
              <span className="editsectionsTable-searchIcon">&#128269;</span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="editsectionsTable-clearButton"
                  title="Clear search"
                >
                  &#10005;
                </button>
              )}
            </div>
            <div className="editsectionsTable-countBadge">
              {filteredCategories.length} of {categories.length} categories
            </div>
          </div>

          {/* Table */}
          {filteredCategories.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Category</th>
                    <th className="editsectionsTable-th">Description</th>
                    <th className="editsectionsTable-th">Option Types</th>
                    <th className="editsectionsTable-th">Branch</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredCategories.map((item: any, index: number) => (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, item)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{item.name}</td>
                      <td className="editsectionsTable-td">{item.description || '-'}</td>
                      <td className="editsectionsTable-td">{getOptionTypeCount(item._id)}</td>
                      <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No categories found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : showDetail && selectedItem ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button
              onClick={handleDelete}
              className="Delete"
              disabled={deleteState === 'loading'}
            >
              {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
            </button>
          </div>

          <div className="form-section">
            <label>Category Name:</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
              editDescription === selectedItem.description)
            }
          >
            {updateState === 'loading' ? 'Saving...' : updateState === 'success' ? 'Saved!' : 'Save'}
          </button>

          <div className="info-section">
            <p>
              <strong>Total Option Types:</strong>{" "}
              {getOptionTypeCount(selectedItem._id)}
            </p>
            <p>
              <strong>Branch:</strong> {selectedItem.branchId?.name || "N/A"}
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
        </div>
      ) : (
        !loading && <p>No categories available.</p>
      )}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditCategoryList;
