import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllManagers,
  updateManager,
  deleteManager,
} from "../../../../redux/Manger/MangerActions";
import { listBranches } from "../../../../redux/createBranchAndManager/branchActions";
import { RootState } from "../../../../redux/rootReducer";
import "./editStyles.css";

interface Manager {
  _id: string;
  username: string;
  email?: string;
  phone?: string;
  fullName?: string;
  isActive?: boolean;
  createdAt: string;
  branchId?: {
    _id: string;
    name: string;
  };
}

interface Branch {
  _id: string;
  name: string;
}

const AllSeeMangerAndEdit: React.FC = () => {
  const dispatch = useDispatch();

  const { managers = [], loading, error } = useSelector(
    (state: RootState) => state.managerList || {}
  );
  const { branches = [] } = useSelector(
    (state: RootState) => state.branchList || {}
  );

  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    branchId: "",
    isActive: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllManagers() as any);
    dispatch(listBranches() as any);
  }, [dispatch]);

  const filteredManagers = managers.filter((manager: Manager) =>
    manager.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.branchId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditor = (manager: Manager) => {
    setSelectedManager(manager);
    setEditForm({
      username: manager.username || "",
      password: "",
      branchId: manager.branchId?._id || "",
      isActive: manager.isActive !== false,
    });
  };

  const handleEditChange = (field: keyof typeof editForm, value: string | boolean) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleUpdate = async () => {
    if (!selectedManager) return;

    if (!editForm.username.trim()) {
      alert("Username is required");
      return;
    }

    try {
      const updateData: any = {
        username: editForm.username.trim(),
      };

      if (editForm.password.trim()) {
        updateData.password = editForm.password.trim();
      }

      if (editForm.branchId) {
        updateData.branchId = editForm.branchId;
      }

      await dispatch(updateManager(selectedManager._id, updateData) as any);
      dispatch(getAllManagers() as any);
      setSelectedManager(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteManager(id) as any);
      dispatch(getAllManagers() as any);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleToggleActive = async (manager: Manager) => {
    try {
      await dispatch(
        updateManager(manager._id, {
          username: manager.username,
        }) as any
      );
      dispatch(getAllManagers() as any);
    } catch (err) {
      console.error("Toggle active failed:", err);
    }
  };

  if (loading) {
    return <div className="edit-loading">Loading managers...</div>;
  }

  if (error) {
    return <div className="edit-error">Error: {error}</div>;
  }

  return (
    <div className="edit-container">
      <div className="edit-header">
        <h2>Manager Management</h2>
        <p className="edit-subtitle">View, edit, and manage all managers</p>
      </div>

      {!selectedManager ? (
        <>
          <div className="edit-toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="toolbar-stats">
              Total: {filteredManagers.length} managers
            </div>
          </div>

          <div className="edit-table-wrapper">
            <table className="edit-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManagers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-data">
                      No managers found
                    </td>
                  </tr>
                ) : (
                  filteredManagers.map((manager: Manager) => (
                    <tr key={manager._id}>
                      <td className="cell-name">{manager.username}</td>
                      <td>{manager.email || "-"}</td>
                      <td>{manager.branchId?.name || "-"}</td>
                      <td className="cell-date">
                        {new Date(manager.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            manager.isActive !== false ? "active" : "inactive"
                          }`}
                          onClick={() => handleToggleActive(manager)}
                        >
                          {manager.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="cell-actions">
                        <button
                          className="btn-edit"
                          onClick={() => openEditor(manager)}
                        >
                          Edit
                        </button>
                        {deleteConfirm === manager._id ? (
                          <div className="delete-confirm">
                            <button
                              className="btn-confirm-delete"
                              onClick={() => handleDelete(manager._id)}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn-cancel-delete"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-delete"
                            onClick={() => setDeleteConfirm(manager._id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="edit-form-container">
          <div className="edit-form-header">
            <h3>Edit Manager</h3>
            <button
              className="btn-close"
              onClick={() => setSelectedManager(null)}
            >
              X
            </button>
          </div>

          <div className="edit-form">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => handleEditChange("username", e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) => handleEditChange("password", e.target.value)}
                placeholder="Leave empty to keep current"
              />
              <small className="form-hint">Only fill if you want to change the password</small>
            </div>

            <div className="form-group">
              <label>Branch</label>
              <select
                value={editForm.branchId}
                onChange={(e) => handleEditChange("branchId", e.target.value)}
              >
                <option value="">Select Branch</option>
                {branches.map((branch: Branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => handleEditChange("isActive", e.target.checked)}
                />
                <span>Active</span>
              </label>
            </div>

            <div className="form-actions">
              <button className="btn-save" onClick={handleUpdate}>
                Save Changes
              </button>
              <button
                className="btn-cancel"
                onClick={() => setSelectedManager(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSeeMangerAndEdit;
