import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { getOptionTypes, deleteOptionType, updateOptionType } from '../../../../redux/option/optionTypeActions';
import { getOptions } from '../../../../redux/option/optionActions';
import './EditOptionTypeList.css';

const EditOptionTypeList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { optionTypes, loading } = useSelector((state: RootState) => state.optionType);
  const { options } = useSelector((state: RootState) => state.option);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getOptionTypes({}));
    dispatch(getOptions({}));
  }, [dispatch]);

  // Count options for each option type
  const getOptionCount = (typeId: string) => {
    if (!Array.isArray(options)) return 0;
    return options.filter((opt: any) => opt.optionTypeId === typeId).length;
  };

  // Filter option types based on search
  const filteredTypes = Array.isArray(optionTypes)
    ? optionTypes.filter((type: any) =>
        type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.branchId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const selectedItem = filteredTypes[selectedRow];

  const handleRowClick = (index: number, item: any) => {
    setSelectedRow(index);
    setEditId(item._id);
    setEditName(item.name || '');
    setEditDescription(item.description || '');
    setShowDetail(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      alert('Option Type Name cannot be empty');
      return;
    }

    if (!editId) return;

    const branchId = localStorage.getItem('branchId') || '';

    try {
      await dispatch(updateOptionType(editId, {
        name: editName,
        description: editDescription,
        branchId,
        isActive: true
      }));
      alert('Option Type updated successfully!');
      setShowDetail(false);
      dispatch(getOptionTypes({}));
    } catch (err) {
      alert('Failed to update Option Type.');
    }
  };

  const handleDelete = async () => {
    if (!editId) return;

    if (!window.confirm('Are you sure you want to delete this option type?'))
      return;

    try {
      await dispatch(deleteOptionType(editId));
      alert('Deleted successfully.');
      setShowDetail(false);
      dispatch(getOptionTypes({}));
    } catch (err) {
      alert('Failed to delete.');
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
        Loading option types...
      </div>
    );
  }

  return (
    <div className="EditOptionType EditMachineType">
      {!showDetail && !loading && optionTypes.length > 0 ? (
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
              {filteredTypes.length} of {optionTypes.length} types
            </div>
          </div>

          {/* Table */}
          {filteredTypes.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Option Type</th>
                    <th className="editsectionsTable-th">Total Options</th>
                    <th className="editsectionsTable-th">Branch</th>
                    <th className="editsectionsTable-th">Created</th>
                    <th className="editsectionsTable-th">Updated</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredTypes.map((item: any, index: number) => (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, item)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{item.name}</td>
                      <td className="editsectionsTable-td">{getOptionCount(item._id)}</td>
                      <td className="editsectionsTable-td">{item.branchId?.name || "N/A"}</td>
                      <td className="editsectionsTable-td">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</td>
                      <td className="editsectionsTable-td">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No option types found matching "<span>{searchTerm}</span>"
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
            <label>Option Type Name:</label>
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
              <strong>Total Options:</strong>{" "}
              {getOptionCount(selectedItem._id)}
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
        !loading && <p>No option types available.</p>
      )}
    </div>
  );
};

export default EditOptionTypeList;
