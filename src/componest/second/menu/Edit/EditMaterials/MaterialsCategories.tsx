import React, { useEffect, useState, useCallback } from "react";
import "./EditMaterials.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllMaterialTypesWithMaterials } from "../../../../redux/create/Materials/MaterialsCategories/MaterialsCategoriesActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

interface Material {
  _id: string;
  materialName: string;
  materialMol: number;
  type: string;
}

interface MaterialType {
  _id: string;
  materialTypeName: string;
  description?: string;
  materials: Material[];
  createdAt?: string;
  updatedAt?: string;
  branchId?: {
    _id: string;
    name: string;
  };
}

const EditMaterialsCategories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    categories: materialTypes = [],
    loading,
    error,
  } = useSelector((state: RootState) => state.materialCategories || {}) as unknown as {
    categories: MaterialType[];
    loading: boolean;
    error: string | null;
  };

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter material types based on search term
  const filteredMaterialTypes = materialTypes.filter((materialType: MaterialType) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      materialType.materialTypeName?.toLowerCase().includes(search) ||
      materialType.description?.toLowerCase().includes(search) ||
      materialType.materials?.some((m: Material) => 
        m.materialName?.toLowerCase().includes(search)
      )
    );
  });

  const selectedItem: MaterialType | undefined = filteredMaterialTypes[selectedRow];
  
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || filteredMaterialTypes.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredMaterialTypes.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredMaterialTypes[selectedRow];
        if (selected) {
          setEditName(selected.materialTypeName);
          setEditDescription(selected.description || "");
          setShowDetail(true);
        }
      }
    },
    [filteredMaterialTypes, selectedRow, showDetail]
  );

  useEffect(() => {
    dispatch(getAllMaterialTypesWithMaterials());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Reset selected row when search changes
    setSelectedRow(0);
  }, [searchTerm]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditDescription(e.target.value);
  };

  const handleEditSave = () => {
    if (!editName.trim()) {
      alert("Material type name is required");
      return;
    }
    alert("Material Type updated! (Update functionality needs to be implemented)");
    setShowDetail(false);
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this material category?"))
      return;
    
    alert("Delete functionality needs to be implemented");
    setShowDetail(false);
  };

  const handleRowClick = (index: number, item: MaterialType) => {
    setSelectedRow(index);
    setEditName(item.materialTypeName);
    setEditDescription(item.description || "");
    setShowDetail(true);
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

      {!showDetail && !loading && materialTypes.length > 0 ? (
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
                placeholder="Search by category name, description, or material..."
                                className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
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
              {filteredMaterialTypes.length} of {materialTypes.length} categories
            </div>
          </div>

          {/* Table */}
          {filteredMaterialTypes.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Material Category</th>
                  <th>Total Materials</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterialTypes.map((item: MaterialType, index: number) => (
                  <tr
                    key={item._id}
                    className={selectedRow === index ? "bg-blue-100" : ""}
                    onClick={() => handleRowClick(index, item)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{item.materialTypeName}</td>
                    <td>{item.materials?.length ?? 0}</td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "N/A"}</td>
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
              No material categories found matching "{searchTerm}"
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
            <label>Material Category Name:</label>
            <input type="text" value={editName} onChange={handleEditChange} />
          </div>

          <div className="form-section">
            <label>Description:</label>
            <textarea
              value={editDescription}
              onChange={handleDescriptionChange}
              rows={3}
            />
          </div>

          <button
            onClick={handleEditSave}
            className="save-button"
            disabled={
              !editName.trim() ||
              (editName === selectedItem.materialTypeName &&
              editDescription === (selectedItem.description || ""))
            }
          >
            Save
          </button>

          <div className="info-section">
            <p>
              <strong>Total Materials:</strong> {selectedItem?.materials?.length ?? 0}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : "N/A"}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString() : "N/A"}
            </p>
          </div>

          {selectedItem?.materials && selectedItem.materials.length > 0 ? (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Materials in this Category</h4>
              <table className="machine-details-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Material Name</th>
                    <th>Mol</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItem.materials.map((m: Material, idx: number) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{m.materialName}</td>
                      <td>{m.materialMol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: '#f5f5f5',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
            }}>
              No materials in this category.
            </div>
          )}
        </div>
      ) : (
        !loading && <p>No material categories available.</p>
      )}
    </div>
  );
};

export default EditMaterialsCategories;