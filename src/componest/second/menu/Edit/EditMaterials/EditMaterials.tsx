import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  updateMaterial,
  deleteMaterial,
} from "../../../../redux/create/Materials/MaterialsActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { RootState } from "../../../../redux/rootReducer";
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

interface Material {
  _id: string;
  materialName: string;
  materialMol: number;
  materialType?: {
    _id: string;
    materialTypeName: string;
  };
  branchId?: string;
}

interface MaterialType {
  _id: string;
  materialTypeName: string;
}

const EditMaterials: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { materials, materialTypes, loading, error } = useFormDataCache();
  const materialCategories = materialTypes; // Material types are the categories

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [editForm, setEditForm] = useState({
    materialName: "",
    materialMol: "",
    materialTypeId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter materials based on search term
  const filteredMaterials = materials.filter((material: Material) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      material.materialName?.toLowerCase().includes(search) ||
      material.materialMol?.toString().includes(search) ||
      material.materialType?.materialTypeName?.toLowerCase().includes(search)
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || filteredMaterials.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredMaterials.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredMaterials[selectedRow];
        if (selected) {
          openEditor(selected);
        }
      }
    },
    [filteredMaterials, selectedRow, showDetail]
  );

  // ✅ No useEffect dispatch needed - data already loaded from cache!

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Reset selected row when search changes
    setSelectedRow(0);
  }, [searchTerm]);

  const openEditor = (material: Material) => {
    setSelectedMaterial(material);
    setEditForm({
      materialName: material.materialName || "",
      materialMol: material.materialMol?.toString() || "",
      materialTypeId: material.materialType?._id || "",
    });
    setShowDetail(true);
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleUpdate = async () => {
    if (!selectedMaterial) return;

    if (
      !editForm.materialName.trim() ||
      !editForm.materialMol.trim() ||
      !editForm.materialTypeId
    ) {
      alert("All fields are required");
      return;
    }

    try {
      await dispatch(
        updateMaterial(selectedMaterial._id, {
          materialName: editForm.materialName.trim(),
          materialMol: parseFloat(editForm.materialMol.trim()) || 0,
          materialType: editForm.materialTypeId,
        })
      );
      alert("Material updated successfully!");
      setShowDetail(false);
      setSelectedMaterial(null);
      // ✅ OPTIMIZED: Cache will auto-refresh on next page load
    } catch (err) {
      alert("Failed to update material.");
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;

    if (!window.confirm("Are you sure you want to delete this material?"))
      return;

    try {
      await dispatch(deleteMaterial(selectedMaterial._id));
      alert("Deleted successfully.");
      setShowDetail(false);
      setSelectedMaterial(null);
      // ✅ OPTIMIZED: Cache will auto-refresh on next page load
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleRowClick = (index: number, material: Material) => {
    setSelectedRow(index);
    openEditor(material);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="EditMachineType">
       {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError"  style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && materials.length > 0 ? (
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
                placeholder="Search by material name, mol, or category..."
                                className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#FF6B35] transition-all"
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
              {filteredMaterials.length} of {materials.length} materials
            </div>
          </div>

          {/* Table */}
          {filteredMaterials.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Material Name</th>
                  <th>Mol</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material: Material, index: number) => (
                  <tr
                    key={material._id}
                    className={selectedRow === index ? "bg-orange-100" : ""}
                    onClick={() => handleRowClick(index, material)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{material.materialName}</td>
                    <td>{material.materialMol}</td>
                    <td>{material.materialType?.materialTypeName || "N/A"}</td>
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
              No materials found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : showDetail && selectedMaterial ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDelete} className="Delete">
              Delete
            </button>
          </div>

          <div className="form-section">
            <label>Material Name:</label>
            <input
              type="text"
              value={editForm.materialName}
              onChange={(e) => handleEditChange("materialName", e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Mol:</label>
            <input
              type="number"
              step="0.01"
              value={editForm.materialMol}
              onChange={(e) => handleEditChange("materialMol", e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>Material Category:</label>
            <select
              value={editForm.materialTypeId}
              onChange={(e) => handleEditChange("materialTypeId", e.target.value)}
            >
              <option value="">Select Category</option>
              {materialCategories.map((type: MaterialType) => (
                <option key={type._id} value={type._id}>
                  {type.materialTypeName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleUpdate}
            className="save-button"
            disabled={
              !editForm.materialName.trim() ||
              !editForm.materialMol.trim() ||
              !editForm.materialTypeId
            }
          >
            Save
          </button>

          <div className="info-section">
            <p>
              <strong>Current Category:</strong>{" "}
              {selectedMaterial.materialType?.materialTypeName || "N/A"}
            </p>
            <p>
              <strong>Current Mol:</strong> {selectedMaterial.materialMol}
            </p>
          </div>
        </div>
      ) : (
        !loading && <p>No materials available.</p>
      )}
    </div>
  );
};

export default EditMaterials;