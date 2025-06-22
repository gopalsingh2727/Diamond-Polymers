import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMaterials,
  updateMaterial,
  deleteMaterial,
} from "../../../../redux/create/Materials/MaterialsActions";
import { getMaterialCategories } from "../../../../redux/create/Materials/MaterialsCategories/MaterialsCategoriesActions";
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

  const { materials = [], loading, error } = useSelector(
    (state: RootState) => state.materialList || {}
  );
  const { categories: materialCategories = [] } = useSelector(
    (state: RootState) => state.materialCategories || {}
  );
  const { success: updateSuccess } = useSelector(
    (state: RootState) => state.materialUpdate || {}
  );
  const { success: deleteSuccess } = useSelector(
    (state: RootState) => state.materialDelete || {}
  );

  const [focusedRow, setFocusedRow] = useState<number>(-1);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [editForm, setEditForm] = useState({
    materialName: "",
    materialMol: "",
    materialTypeId: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    dispatch(getMaterials());
    dispatch(getMaterialCategories());
  }, [dispatch, updateSuccess, deleteSuccess]);

  useEffect(() => {
    if (focusedRow >= 0 && rowRefs.current[focusedRow]) {
      rowRefs.current[focusedRow]?.focus();
    }
  }, [focusedRow]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
    material: Material
  ) => {
    if (e.key === "Enter") openEditor(material);
    else if (e.key === "ArrowDown")
      setFocusedRow((prev) => Math.min(prev + 1, materials.length - 1));
    else if (e.key === "ArrowUp")
      setFocusedRow((prev) => Math.max(prev - 1, 0));
  };

  const openEditor = (material: Material) => {
    setSelectedMaterial(material);
    setEditForm({
      materialName: material.materialName || "",
      materialMol: material.materialMol?.toString() || "",
      materialTypeId: material.materialType?._id || "",
    });
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleUpdate = () => {
    if (!selectedMaterial) return;

    if (
      !editForm.materialName.trim() ||
      !editForm.materialMol.trim() ||
      !editForm.materialTypeId
    ) {
      alert("❌ All fields are required");
      return;
    }

    dispatch(
      updateMaterial(selectedMaterial._id, {
        materialName: editForm.materialName.trim(),
        materialMol: parseFloat(editForm.materialMol.trim()) || 0,
        materialType: editForm.materialTypeId,
      })
    );
    setSelectedMaterial(null);
  };

  const handleDeleteClick = () => {
    setDeleteInput("");
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteInput === "DELETE" && selectedMaterial) {
      dispatch(deleteMaterial(selectedMaterial._id));
      setShowDeleteConfirm(false);
      setSelectedMaterial(null);
    } else {
      alert("❌ Type DELETE to confirm deletion");
    }
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

  return (
    <div className="EditMaterials p-4">
      <h2 className="text-xl font-semibold mb-4">Material List</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!selectedMaterial ? (
        <table className="w-full border border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Mol</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Branch</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr
                key={material._id}
                ref={(el) => (rowRefs.current[index] = el)}
                tabIndex={0}
                onClick={() => openEditor(material)}
                onKeyDown={(e) => handleKeyDown(e, material)}
                onFocus={() => setFocusedRow(index)}
                className={focusedRow === index ? "bg-blue-100" : ""}
              >
                <td className="p-2 border">{material.materialName}</td>
                <td className="p-2 border">{material.materialMol}</td>
                <td className="p-2 border">
                  {material.materialType?.materialTypeName || "-"}
                </td>
                <td className="p-2 border">{material.branchId || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-white p-4 shadow-md rounded max-w-lg">
          <h3 className="text-lg font-bold mb-2">Edit Material</h3>

          <label className="block mb-1">Name</label>
          <input
            value={editForm.materialName}
            onChange={(e) => handleEditChange("materialName", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Mol</label>
          <input
            type="number"
            value={editForm.materialMol}
            onChange={(e) => handleEditChange("materialMol", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Material Category</label>
          <select
            value={editForm.materialTypeId}
            onChange={(e) => handleEditChange("materialTypeId", e.target.value)}
            className="border p-2 mb-3 w-full"
          >
            <option value="">Select Category</option>
            {materialCategories.map((type: MaterialType) => (
              <option key={type._id} value={type._id}>
                {type.materialTypeName}
              </option>
            ))}
          </select>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
            <button
              onClick={handleDeleteClick}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedMaterial(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">
              Type <span className="text-red-600 font-mono">DELETE</span> to confirm
            </h3>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="border p-2 w-full mb-4"
              placeholder="Type DELETE to confirm"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-400 text-white px-4 py-2 rounded"
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

export default EditMaterials;