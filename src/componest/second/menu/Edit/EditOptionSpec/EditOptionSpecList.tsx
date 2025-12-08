import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { getOptionSpecs, deleteOptionSpec, updateOptionSpec } from '../../../../redux/create/optionSpec/optionSpecActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import './EditOptionSpecList.css';

const EditOptionSpecList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { optionSpecs, loading } = useSelector((state: RootState) => state.optionSpec);
  const { optionTypes } = useSelector((state: RootState) => state.optionType);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getOptionSpecs({}));
    dispatch(getOptionTypes({}));
  }, [dispatch]);

  // Get option type name by ID
  const getOptionTypeName = (optionTypeId: string) => {
    if (!optionTypeId || !Array.isArray(optionTypes)) return 'N/A';
    const type = optionTypes.find((t: any) => t._id === optionTypeId);
    return type?.name || 'N/A';
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
      alert('Option Spec Name cannot be empty');
      return;
    }

    if (!editId) return;

    const branchId = localStorage.getItem('branchId') || '';

    try {
      await dispatch(updateOptionSpec(editId, {
        name: editName,
        code: editCode,
        description: editDescription,
        branchId,
        specifications: selectedItem.specifications || []
      }));
      alert('Option Spec updated successfully!');
      setShowDetail(false);
      dispatch(getOptionSpecs({}));
    } catch (err) {
      alert('Failed to update Option Spec.');
    }
  };

  const handleDelete = async () => {
    if (!editId) return;

    if (!window.confirm('Are you sure you want to delete this option spec?'))
      return;

    try {
      await dispatch(deleteOptionSpec(editId));
      alert('Deleted successfully.');
      setShowDetail(false);
      dispatch(getOptionSpecs({}));
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
        Loading option specifications...
      </div>
    );
  }

  return (
    <div className="EditOptionSpec EditMachineType">
      {!showDetail && !loading && optionSpecs.length > 0 ? (
        <>
          {/* Search Bar */}
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by name, code, description, or option type..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  fontSize: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2d89ef'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#666',
              }}>
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '4px 8px',
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div style={{
              padding: '12px 16px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              whiteSpace: 'nowrap',
            }}>
              {filteredSpecs.length} of {optionSpecs.length} specs
            </div>
          </div>

          {/* Table */}
          {filteredSpecs.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Option Spec</th>
                  <th>Code</th>
                  <th>Option Type</th>
                  <th>Dimensions</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredSpecs.map((item: any, index: number) => (
                  <tr
                    key={item._id}
                    className={selectedRow === index ? "bg-blue-100" : ""}
                    onClick={() => handleRowClick(index, item)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.code || 'N/A'}</td>
                    <td>{getOptionTypeName(item.optionTypeId)}</td>
                    <td>{item.specifications?.length || 0}</td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</td>
                    <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999',
              fontSize: '16px',
            }}>
              No option specs found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : showDetail && selectedItem ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDelete} className="Delete">
              Delete
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
              editName === selectedItem.name &&
              editCode === selectedItem.code &&
              editDescription === selectedItem.description
            }
          >
            Save
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
    </div>
  );
};

export default EditOptionSpecList;
