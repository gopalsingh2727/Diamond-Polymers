import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listBranches,
  updateBranch,
  deleteBranch,
} from "../../../../redux/createBranchAndManager/branchActions";
import { RootState } from "../../../../redux/rootReducer";
import "./editStyles.css";

interface Branch {
  _id: string;
  name: string;
  code: string;
  location: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  createdAt: string;
}

const SeeAllBranchAndEdit: React.FC = () => {
  const dispatch = useDispatch();

  const { branches = [], loading, error } = useSelector(
    (state: RootState) => state.branchList || {}
  );

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    location: "",
    phone: "",
    email: "",
    isActive: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(listBranches() as any);
  }, [dispatch]);

  const filteredBranches = branches.filter((branch: Branch) =>
    branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditor = (branch: Branch) => {
    setSelectedBranch(branch);
    setEditForm({
      name: branch.name || "",
      code: branch.code || "",
      location: branch.location || "",
      phone: branch.phone || "",
      email: branch.email || "",
      isActive: branch.isActive !== false,
    });
  };

  const handleEditChange = (field: keyof typeof editForm, value: string | boolean) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleUpdate = async () => {
    if (!selectedBranch) return;

    if (!editForm.name.trim()) {
      alert("Branch name is required");
      return;
    }

    try {
      await dispatch(
        updateBranch(selectedBranch._id, {
          name: editForm.name.trim(),
          location: editForm.location.trim(),
        }) as any
      );
      dispatch(listBranches() as any);
      setSelectedBranch(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteBranch(id) as any);
      dispatch(listBranches() as any);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleToggleActive = async (branch: Branch) => {
    try {
      await dispatch(
        updateBranch(branch._id, {
          name: branch.name,
          location: branch.location,
        }) as any
      );
      dispatch(listBranches() as any);
    } catch (err) {
      console.error("Toggle active failed:", err);
    }
  };

  if (loading) {
    return <div className="edit-loading">Loading branches...</div>;
  }

  if (error) {
    return <div className="edit-error">Error: {error}</div>;
  }

  return (
    <div className="edit-container">
      <div className="edit-header">
        <h2>Branch Management</h2>
        <p className="edit-subtitle">View, edit, and manage all branches</p>
      </div>

      {!selectedBranch ? (
        <>
          <div className="edit-toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="toolbar-stats">
              Total: {filteredBranches.length} branches
            </div>
          </div>

          <div className="edit-table-wrapper">
            <table className="edit-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Location</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-data">
                      No branches found
                    </td>
                  </tr>
                ) : (
                  filteredBranches.map((branch: Branch) => (
                    <tr key={branch._id}>
                      <td className="cell-name">{branch.name}</td>
                      <td className="cell-code">{branch.code}</td>
                      <td>{branch.location || "-"}</td>
                      <td className="cell-date">
                        {new Date(branch.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            branch.isActive !== false ? "active" : "inactive"
                          }`}
                          onClick={() => handleToggleActive(branch)}
                        >
                          {branch.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="cell-actions">
                        <button
                          className="btn-edit"
                          onClick={() => openEditor(branch)}
                        >
                          Edit
                        </button>
                        {deleteConfirm === branch._id ? (
                          <div className="delete-confirm">
                            <button
                              className="btn-confirm-delete"
                              onClick={() => handleDelete(branch._id)}
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
                            onClick={() => setDeleteConfirm(branch._id)}
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
            <h3>Edit Branch</h3>
            <button
              className="btn-close"
              onClick={() => setSelectedBranch(null)}
            >
              X
            </button>
          </div>

          <div className="edit-form">
            <div className="form-group">
              <label>Branch Name *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                placeholder="Enter branch name"
              />
            </div>

            <div className="form-group">
              <label>Branch Code</label>
              <input
                type="text"
                value={editForm.code}
                onChange={(e) => handleEditChange("code", e.target.value)}
                placeholder="Enter branch code"
                disabled
              />
              <small className="form-hint">Code cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => handleEditChange("location", e.target.value)}
                placeholder="Enter location"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => handleEditChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => handleEditChange("email", e.target.value)}
                placeholder="Enter email"
              />
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
                onClick={() => setSelectedBranch(null)}
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

export default SeeAllBranchAndEdit;
