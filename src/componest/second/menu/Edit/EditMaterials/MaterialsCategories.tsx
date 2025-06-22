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
  branchId: {
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

  const selectedItem: MaterialType | undefined = materialTypes[selectedRow];
  
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || materialTypes.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, materialTypes.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = materialTypes[selectedRow];
        if (selected) {
          setEditName(selected.materialTypeName);
          setEditDescription(selected.description || "");
          setShowDetail(true);
        }
      }
    },
    [materialTypes, selectedRow, showDetail]
  );

  useEffect(() => {
    dispatch(getAllMaterialTypesWithMaterials());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditDescription(e.target.value);
  };

  const handleEditSave = () => {
    alert("Material Type updated! (not saved to DB)");
  };

  return (
    <div className="EditMachineType">
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && materialTypes.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Material Type</th>
              <th>Total Materials</th>
              <th>Branch</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {materialTypes.map((item, index) => (
              <tr
                key={item._id}
                className={selectedRow === index ? "bg-blue-100" : ""}
              >
                <td>{index + 1}</td>
                <td>{item.materialTypeName}</td>
                <td>{item.materials?.length ?? 0}</td>
                <td>{item.branchId?.name || "N/A"}</td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</td>
                <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "N/A"}</td>
                <td
                  className="text-blue-600 emt-edit-text"
                  onClick={() => {
                    setSelectedRow(index);
                    setEditName(item.materialTypeName);
                    setEditDescription(item.description || "");
                    setShowDetail(true);
                  }}
                >
                  Edit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : showDetail && selectedItem ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleEditSave} className="Delete">
              Delete
            </button>
          </div>

          <div className="form-section">
            <label>Material Type:</label>
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
              editName === selectedItem.materialTypeName &&
              editDescription === (selectedItem.description || "")
            }
          >
            Save
          </button>

          <div className="info-section">
            <p><strong>Total Materials:</strong> {selectedItem?.materials?.length ?? 0}</p>
            <p><strong>Branch:</strong> {selectedItem.branchId?.name || "N/A"}</p>
            <p><strong>Created At:</strong> {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : "N/A"}</p>
            <p><strong>Updated At:</strong> {selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString() : "N/A"}</p>
          </div>

          <table className="machine-details-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Material Name</th>
                <th>Mol</th>
              </tr>
            </thead>
            <tbody>
              {selectedItem?.materials.map((m, idx) => (
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
        !loading && <p>No material types available.</p>
      )}
    </div>
  );
};

export default EditMaterialsCategories;