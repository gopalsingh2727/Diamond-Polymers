/**
 * Location Manager Component
 * CRUD operations for warehouse/inventory locations
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store';
import {
  createInventoryLocationV2,
  updateInventoryLocationV2,
  deleteInventoryLocationV2,
} from '../../../../redux/unifiedV2/inventoryLocationActions';

interface LocationManagerProps {
  locations: any[];
  loading: boolean;
  onRefresh: () => void;
}

const LocationManager: React.FC<LocationManagerProps> = ({
  locations,
  loading,
  onRefresh,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    setEditId(null);
    setFormData({ name: '', code: '', address: '', isDefault: false });
    setShowForm(true);
  };

  const handleEdit = (location: any) => {
    setEditId(location._id);
    setFormData({
      name: location.name || '',
      code: location.code || '',
      address: location.address || '',
      isDefault: location.isDefault || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete location "${name}"?`)) {
      return;
    }

    try {
      await dispatch(deleteInventoryLocationV2(id));
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete location');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Location name is required');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await dispatch(updateInventoryLocationV2(editId, formData));
      } else {
        await dispatch(createInventoryLocationV2(formData));
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ name: '', code: '', address: '', isDefault: false });
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ name: '', code: '', address: '', isDefault: false });
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        Loading locations...
      </div>
    );
  }

  return (
    <div className="location-manager">
      {/* Header */}
      <div className="location-header">
        <h3>Inventory Locations</h3>
        {!showForm && (
          <button className="add-location-btn" onClick={handleAdd}>
            + Add Location
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="location-form-container">
          <form onSubmit={handleSubmit} className="location-form">
            <h4>{editId ? 'Edit Location' : 'Add New Location'}</h4>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Location Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  placeholder="e.g., Main Warehouse"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="code">Location Code</label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="form-input"
                  placeholder="e.g., WH-001"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="form-input"
                rows={2}
                placeholder="Full address of the location"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                />
                Set as default location
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={saving || !formData.name.trim()}
              >
                {saving ? 'Saving...' : editId ? 'Update Location' : 'Add Location'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Location List */}
      {locations.length > 0 ? (
        <div className="location-list">
          <table className="location-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Code</th>
                <th>Address</th>
                <th>Default</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location, index) => (
                <tr key={location._id}>
                  <td>{index + 1}</td>
                  <td className="location-name">{location.name}</td>
                  <td>{location.code || '-'}</td>
                  <td className="address-cell">{location.address || '-'}</td>
                  <td>
                    {location.isDefault && (
                      <span className="default-badge">Default</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${location.isActive !== false ? 'active' : 'inactive'}`}>
                      {location.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(location)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(location._id, location.name)}
                      disabled={location.isDefault}
                      title={location.isDefault ? 'Cannot delete default location' : 'Delete location'}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-locations">
          <p>No locations defined yet.</p>
          <p>Add your first location to organize inventory across different warehouses or storage areas.</p>
        </div>
      )}
    </div>
  );
};

export default LocationManager;
