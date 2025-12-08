import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { getOptions, deleteOption, updateOption } from '../../../../redux/option/optionActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import './EditOptionList.css';

const EditOptionList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { options, loading } = useSelector((state: RootState) => state.option);
  const { optionTypes } = useSelector((state: RootState) => state.optionType);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editOptionTypeId, setEditOptionTypeId] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getOptions({}));
    dispatch(getOptionTypes({}));
  }, [dispatch]);

  // Get option type name by ID
  const getOptionTypeName = (optionTypeId: string) => {
    if (!optionTypeId || !Array.isArray(optionTypes)) return 'N/A';
    const type = optionTypes.find((t: any) => t._id === optionTypeId);
    return type?.name || 'N/A';
  };

  // Filter options based on search
  const filteredOptions = Array.isArray(options)
    ? options.filter((option: any) =>
        option.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getOptionTypeName(option.optionTypeId).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const selectedItem = filteredOptions[selectedRow];

  const handleRowClick = (index: number, item: any) => {
    setSelectedRow(index);
    setEditId(item._id);
    setEditName(item.name || '');
    setEditOptionTypeId(item.optionTypeId || '');
    setShowDetail(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      alert('Option Name cannot be empty');
      return;
    }

    if (!editOptionTypeId) {
      alert('Please select an Option Type');
      return;
    }

    if (!editId) return;

    const branchId = localStorage.getItem('branchId') || '';

    try {
      await dispatch(updateOption(editId, {
        name: editName,
        optionTypeId: editOptionTypeId,
        branchId
      }));
      alert('Option updated successfully!');
      setShowDetail(false);
      dispatch(getOptions({}));
    } catch (err) {
      alert('Failed to update Option.');
    }
  };

  const handleDelete = async () => {
    if (!editId) return;

    if (!window.confirm('Are you sure you want to delete this option?'))
      return;

    try {
      await dispatch(deleteOption(editId));
      alert('Deleted successfully.');
      setShowDetail(false);
      dispatch(getOptions({}));
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
        Loading options...
      </div>
    );
  }

  return (
    <div className="EditOption EditMachineType">
      {!showDetail && !loading && options.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by name or option type..."
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
              {filteredOptions.length} of {options.length} options
            </div>
          </div>

          {/* Table */}
          {filteredOptions.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Option Name</th>
                    <th className="editsectionsTable-th">Option Type</th>
                    <th className="editsectionsTable-th">Branch</th>
                    <th className="editsectionsTable-th">Created</th>
                    <th className="editsectionsTable-th">Updated</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredOptions.map((item: any, index: number) => (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, item)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{item.name}</td>
                      <td className="editsectionsTable-td">{getOptionTypeName(item.optionTypeId)}</td>
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
              No options found matching "<span>{searchTerm}</span>"
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
            <label>Option Name:</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Option Type:</label>
            <select
              value={editOptionTypeId}
              onChange={(e) => setEditOptionTypeId(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '14px',
                border: 'none',
                borderBottom: '0.5px solid #333',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#333',
                outline: 'none',
              }}
            >
              <option value="">Select Option Type</option>
              {Array.isArray(optionTypes) && optionTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleEditSave}
            className="save-button"
            disabled={
              editName === selectedItem.name &&
              editOptionTypeId === selectedItem.optionTypeId
            }
          >
            Save
          </button>

          <div className="info-section">
            <p>
              <strong>Option Type:</strong> {getOptionTypeName(selectedItem.optionTypeId)}
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
        !loading && <p>No options available.</p>
      )}
    </div>
  );
};

export default EditOptionList;
