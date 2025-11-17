import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from "../../../../../store";
import { RootState } from "../../../../redux/rootReducer";
import {
  getProductSpecs,
  updateProductSpec,
  deleteProductSpec,
  activateProductSpec,
  deactivateProductSpec
} from "../../../../redux/create/productSpec/productSpecActions";
import "./editProductSpec.css";

interface Dimension {
  name: string;
  value: string | number | boolean;
  unit: string;
  dataType: "string" | "number" | "boolean" | "date";
}

interface ProductSpec {
  _id: string;
  specName: string;
  productTypeId: {
    _id: string;
    productTypeName: string;
  };
  description: string;
  dimensions: Dimension[];
  isActive: boolean;
  createdAt: string;
}

const EditProductSpec: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const productSpecListState = useSelector((state: RootState) => state.productSpecList);
  const productSpecs = productSpecListState?.productSpecs || [];
  const loading = productSpecListState?.loading || false;
  const error = productSpecListState?.error || "";

  const [selectedSpec, setSelectedSpec] = useState<ProductSpec | null>(null);
  const [editForm, setEditForm] = useState({
    specName: "",
    description: "",
    dimensions: [] as Dimension[],
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    dispatch(getProductSpecs());
  }, [dispatch]);

  const openEditor = (spec: ProductSpec) => {
    setSelectedSpec(spec);
    setEditForm({
      specName: spec.specName,
      description: spec.description,
      dimensions: JSON.parse(JSON.stringify(spec.dimensions)),
    });
  };

  const handleEditChange = (field: keyof typeof editForm, value: any) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const updateDimension = (
    index: number,
    field: keyof Dimension,
    value: any
  ) => {
    const updated = [...editForm.dimensions];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm({ ...editForm, dimensions: updated });
  };

  const addDimension = () => {
    setEditForm({
      ...editForm,
      dimensions: [
        ...editForm.dimensions,
        { name: "", value: "", unit: "", dataType: "string" },
      ],
    });
  };

  const removeDimension = (index: number) => {
    setEditForm({
      ...editForm,
      dimensions: editForm.dimensions.filter((_, i) => i !== index),
    });
  };

  const handleUpdate = async () => {
    if (!selectedSpec) return;

    try {
      const processedDimensions = editForm.dimensions.map((dim) => {
        let processedValue: string | number | boolean = dim.value;

        if (dim.dataType === "number") {
          processedValue = Number(dim.value);
        } else if (dim.dataType === "boolean") {
          processedValue = dim.value === "true" || dim.value === true;
        }

        return { ...dim, value: processedValue };
      });

      await dispatch(updateProductSpec(selectedSpec._id, {
        specName: editForm.specName,
        description: editForm.description,
        dimensions: processedDimensions,
      }));

      alert("Product spec updated successfully!");
      setSelectedSpec(null);
      dispatch(getProductSpecs());
    } catch (err: any) {
      alert(err.message || "Failed to update product spec");
    }
  };

  const handleToggleActive = async (specId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await dispatch(deactivateProductSpec(specId));
        alert("Product spec deactivated successfully!");
      } else {
        await dispatch(activateProductSpec(specId));
        alert("Product spec activated successfully!");
      }
      dispatch(getProductSpecs());
    } catch (err: any) {
      alert(err.message || "Operation failed");
    }
  };

  const handleDeleteClick = () => {
    setDeleteInput("");
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteInput !== "DELETE" || !selectedSpec) {
      alert("❌ Type DELETE to confirm deletion");
      return;
    }

    try {
      await dispatch(deleteProductSpec(selectedSpec._id));

      alert("Product spec deleted successfully!");
      setShowDeleteConfirm(false);
      setSelectedSpec(null);
      dispatch(getProductSpecs());
    } catch (err: any) {
      alert(err.message || "Failed to delete product spec");
    }
  };

  const handleRefresh = () => {
    dispatch(getProductSpecs());
  };

  return (
    <div className="edit-product-spec-container p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Specifications</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title="Refresh all product specs"
        >
          <span className="text-lg">🔄</span>
          Refresh
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!selectedSpec ? (
        <table className="w-full border border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Spec Name</th>
              <th className="p-2 border">Product Type</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Dimensions</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productSpecs.map((spec: ProductSpec) => (
              <tr key={spec._id}>
                <td
                  className="p-2 border cursor-pointer hover:bg-blue-50"
                  onClick={() => openEditor(spec)}
                >
                  {spec.specName}
                </td>
                <td className="p-2 border">{spec.productTypeId?.productTypeName}</td>
                <td className="p-2 border">{spec.description || "—"}</td>
                <td className="p-2 border">{spec.dimensions?.length || 0}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      spec.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {spec.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleToggleActive(spec._id, spec.isActive)}
                    className={`text-xs px-2 py-1 rounded ${
                      spec.isActive
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {spec.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-white p-4 shadow-md rounded max-w-3xl">
          <h3 className="text-lg font-bold mb-4">
            Edit Product Spec: {selectedSpec.specName}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Spec Name</label>
              <input
                value={editForm.specName}
                onChange={(e) => handleEditChange("specName", e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleEditChange("description", e.target.value)}
                className="border p-2 w-full rounded"
                rows={2}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-semibold">Dimensions</label>
                <button
                  onClick={addDimension}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  + Add
                </button>
              </div>

              {editForm.dimensions.map((dim, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded border mb-2">
                  <div className="grid grid-cols-5 gap-2">
                    <input
                      placeholder="Name"
                      value={dim.name}
                      onChange={(e) =>
                        updateDimension(index, "name", e.target.value)
                      }
                      className="border p-1 rounded"
                    />
                    <input
                      placeholder="Value"
                      value={dim.value.toString()}
                      onChange={(e) =>
                        updateDimension(index, "value", e.target.value)
                      }
                      className="border p-1 rounded"
                    />
                    <input
                      placeholder="Unit"
                      value={dim.unit}
                      onChange={(e) =>
                        updateDimension(index, "unit", e.target.value)
                      }
                      className="border p-1 rounded"
                    />
                    <select
                      value={dim.dataType}
                      onChange={(e) =>
                        updateDimension(index, "dataType", e.target.value)
                      }
                      className="border p-1 rounded"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                    </select>
                    <button
                      onClick={() => removeDimension(index)}
                      className="bg-red-500 text-white rounded"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                💾 Save Changes
              </button>
              <button
                onClick={handleDeleteClick}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setSelectedSpec(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
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
              placeholder="Type DELETE"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

export default EditProductSpec;
