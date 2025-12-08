import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { getCategories, deleteCategory, updateCategory } from '../../../../redux/category/categoryActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import './EditCategoryList.css';

const EditCategoryList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { categories, loading } = useSelector((state: RootState) => state.category);
  const { optionTypes } = useSelector((state: RootState) => state.optionType);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getCategories({}));
    dispatch(getOptionTypes({}));
  }, [dispatch]);

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
      alert('Category Name cannot be empty');
      return;
    }

    if (!editId) return;

    const branchId = localStorage.getItem('branchId') || '';

    try {
      await dispatch(updateCategory(editId, {
        name: editName,
        description: editDescription,
        branchId,
        isActive: true
      }));
      alert('Category updated successfully!');
      setShowDetail(false);
      dispatch(getCategories({}));
    } catch (err) {
      alert('Failed to update Category.');
    }
  };

  const handleDelete = async () => {
    if (!editId) return;

    if (!window.confirm('Are you sure you want to delete this category?'))
      return;

    try {
      await dispatch(deleteCategory(editId));
      alert('Deleted successfully.');
      setShowDetail(false);
      dispatch(getCategories({}));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
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
            <button onClick={handleDelete} className="Delete">
              Delete
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
              editName === selectedItem.name &&
              editDescription === selectedItem.description
            }
          >
            Save
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
    </div>
  );
};

export default EditCategoryList;
