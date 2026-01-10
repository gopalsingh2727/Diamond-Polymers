import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllAdmins,
  updateAdmin,
  deleteAdmin } from
"../../../../redux/Admin/AdminActions";
import { listBranches } from "../../../../redux/createBranchAndManager/branchActions";
import { RootState } from "../../../../redux/rootReducer";
import DeletionOTPModal from "../../../../shared/DeletionOTPModal";
import "./editStyles.css";

interface Admin {
  _id: string;
  username: string;
  email?: string;
  phone?: string;
  fullName?: string;
  isActive?: boolean;
  createdAt: string;
  branchIds?: Array<{
    _id: string;
    name: string;
  }>;
}

interface Branch {
  _id: string;
  name: string;
}

const SeeAllAdminAndEdit: React.FC = () => {
  const dispatch = useDispatch();

  const { admins = [], loading, error } = useSelector(
    (state: RootState) => state.adminList || {}
  );
  const { branches = [] } = useSelector(
    (state: RootState) => state.branchList || {}
  );

  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    branchIds: [] as string[],
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    dispatch(getAllAdmins() as any);
    dispatch(listBranches() as any);
  }, [dispatch]);

  const filteredAdmins = admins.filter((admin: Admin) =>
  admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditor = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      username: admin.username || "",
      password: "",
      branchIds: admin.branchIds?.map((b) => b._id) || [],
      isActive: admin.isActive !== false
    });
  };

  const handleEditChange = (field: string, value: string | boolean | string[]) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleBranchToggle = (branchId: string) => {
    const newBranchIds = editForm.branchIds.includes(branchId) ?
    editForm.branchIds.filter((id) => id !== branchId) :
    [...editForm.branchIds, branchId];
    handleEditChange("branchIds", newBranchIds);
  };

  const handleUpdate = async () => {
    if (!selectedAdmin) return;

    if (!editForm.username.trim()) {
      alert("Username is required");
      return;
    }

    try {
      const updateData: any = {
        username: editForm.username.trim(),
        isActive: editForm.isActive
      };

      if (editForm.password.trim()) {
        updateData.password = editForm.password.trim();
      }

      if (editForm.branchIds.length > 0) {
        updateData.branchIds = editForm.branchIds;
      }

      await dispatch(updateAdmin(selectedAdmin._id, updateData) as any);
      dispatch(getAllAdmins() as any);
      setSelectedAdmin(null);
    } catch (err) {

    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ id, name });
  };

  const handleToggleActive = async (admin: Admin) => {
    try {
      await dispatch(
        updateAdmin(admin._id, {
          username: admin.username,
          isActive: !(admin.isActive !== false)
        }) as any
      );
      dispatch(getAllAdmins() as any);
    } catch (err) {

    }
  };

  if (loading) {
    return <div className="edit-loading">Loading admins...</div>;
  }

  if (error) {
    return <div className="edit-error">Error: {error}</div>;
  }

  return (
    <div className="edit-container">
  

      {!selectedAdmin ?
      <>
          <div className="edit-toolbar">
            <div className="search-box">
              <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input" />

            </div>
            <div className="toolbar-stats">
              Total: {filteredAdmins.length} admins
            </div>
          </div>

          <div className="edit-table-wrapper">
            <table className="edit-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Branches</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ?
              <tr>
                    <td colSpan={6} className="no-data">
                      No admins found
                    </td>
                  </tr> :

              filteredAdmins.map((admin: Admin) =>
              <tr key={admin._id}>
                      <td className="cell-name">{admin.username}</td>
                      <td>{admin.email || "-"}</td>
                      <td>
                        {admin.branchIds?.map((b) => b.name).join(", ") || "-"}
                      </td>
                      <td className="cell-date">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                    className={`status-badge ${
                    admin.isActive !== false ? "active" : "inactive"}`
                    }
                    onClick={() => handleToggleActive(admin)}>

                          {admin.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="cell-actions">
                        <button
                    className="btn-edit"
                    onClick={() => openEditor(admin)}>

                          Edit
                        </button>
                        <button
                    className="btn-delete"
                    onClick={() => handleDeleteClick(admin._id, admin.username)}>

                          Delete
                        </button>
                      </td>
                    </tr>
              )
              }
              </tbody>
            </table>
          </div>
        </> :

      <div className="edit-form-container">
          <div className="edit-form-header">
            <h3>Edit Admin</h3>
            <button
            className="btn-close"
            onClick={() => setSelectedAdmin(null)}>

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
              placeholder="Enter username" />

            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
              type="password"
              value={editForm.password}
              onChange={(e) => handleEditChange("password", e.target.value)}
              placeholder="Leave empty to keep current" />

              <small className="form-hint">Only fill if you want to change the password</small>
            </div>

            <div className="form-group">
              <label>Assigned Branches</label>
              <div className="branch-checkboxes">
                {branches.map((branch: Branch) =>
              <label key={branch._id} className="branch-checkbox-label">
                    <input
                  type="checkbox"
                  checked={editForm.branchIds.includes(branch._id)}
                  onChange={() => handleBranchToggle(branch._id)} />

                    <span>{branch.name}</span>
                  </label>
              )}
              </div>
              {branches.length === 0 &&
            <small className="form-hint">No branches available</small>
            }
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => handleEditChange("isActive", e.target.checked)} />

                <span>Active</span>
              </label>
            </div>

            <div className="form-actions">
              <button className="btn-save" onClick={handleUpdate}>
                Save Changes
              </button>
              <button
              className="btn-cancel"
              onClick={() => setSelectedAdmin(null)}>

                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      {/* Deletion OTP Modal */}
      <DeletionOTPModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        entityType="admin"
        entityId={deleteModal?.id || ''}
        entityName={deleteModal?.name || ''}
        onSuccess={() => {
          setDeleteModal(null);
          dispatch(getAllAdmins() as any);
        }}
      />
    </div>);

};

export default SeeAllAdminAndEdit;