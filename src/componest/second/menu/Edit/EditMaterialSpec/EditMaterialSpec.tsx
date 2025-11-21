import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../store";
import {
  updateMaterialSpec,
  deleteMaterialSpec,
  activateMaterialSpec,
  deactivateMaterialSpec,
} from "../../../../redux/create/materialSpec/materialSpecActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { evaluateDimensionFormulas } from "../../../../../utils/dimensionFormulaEvaluator";
import "../EditProductSpec/editProductSpec.css";

interface Dimension {
  name: string;
  value: string | number | boolean;
  unit?: string;
  dataType: "string" | "number" | "boolean" | "date";
  formula?: string;
  isCalculated?: boolean;
}

interface MaterialSpec {
  _id: string;
  specName: string;
  materialTypeId: {
    _id: string;
    materialTypeName: string;
  };
  description?: string;
  dimensions: Dimension[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

const EditMaterialSpec: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { materialTypes, productSpecs, loading, error } = useFormDataCache();

  // For material specs, we need to fetch them separately as they might not be in cache
  // TODO: Add materialSpecs to orderFormData cache in future optimization
  const [materialSpecs, setMaterialSpecs] = useState<MaterialSpec[]>([]);
  const [specsLoading, setSpecsLoading] = useState(false);

  const [selectedSpec, setSelectedSpec] = useState<MaterialSpec | null>(null);
  const [editForm, setEditForm] = useState({
    specName: "",
    description: "",
    dimensions: [] as Dimension[],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Product spec dimension name browser
  const [selectedProductSpecId, setSelectedProductSpecId] = useState("");
  const [productDimensionNames, setProductDimensionNames] = useState<string[]>([]);

  // Filter material specs based on search term
  const filteredMaterialSpecs = useMemo(() => {
    if (!searchTerm) return materialSpecs;

    const search = searchTerm.toLowerCase();
    return materialSpecs.filter((spec) =>
      spec.specName?.toLowerCase().includes(search) ||
      spec.materialTypeId?.materialTypeName?.toLowerCase().includes(search) ||
      spec.description?.toLowerCase().includes(search)
    );
  }, [materialSpecs, searchTerm]);

  // Fetch material specs on mount
  useEffect(() => {
    const fetchMaterialSpecs = async () => {
      setSpecsLoading(true);
      try {
        const API_KEY = import.meta.env.VITE_API_KEY;
        const token = localStorage.getItem("authToken");
        const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;

        const response = await fetch(`${baseUrl}/material-spec/specs`, {
          headers: {
            "x-api-key": API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch material specs");

        const data = await response.json();
        setMaterialSpecs(data.data || []);
      } catch (err: any) {
        console.error("Failed to fetch material specs:", err);
      } finally {
        setSpecsLoading(false);
      }
    };

    fetchMaterialSpecs();
  }, []);

  // Extract dimension names when Product Spec is selected
  useEffect(() => {
    if (selectedProductSpecId) {
      const spec = productSpecs.find((s: any) => s._id === selectedProductSpecId);
      if (spec && spec.dimensions) {
        const names = spec.dimensions.map((d: any) => d.name);
        setProductDimensionNames(names);
      }
    } else {
      setProductDimensionNames([]);
    }
  }, [selectedProductSpecId, productSpecs]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedSpec || filteredMaterialSpecs.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredMaterialSpecs.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const spec = filteredMaterialSpecs[selectedRow];
        if (spec) openEditor(spec);
      }
    },
    [filteredMaterialSpecs, selectedRow, selectedSpec]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedRow(0);
  }, [searchTerm]);

  const openEditor = (spec: MaterialSpec) => {
    setSelectedSpec(spec);
    setEditForm({
      specName: spec.specName,
      description: spec.description || "",
      dimensions: JSON.parse(JSON.stringify(spec.dimensions || [])),
    });
  };

  const handleEditChange = (field: keyof typeof editForm, value: any) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const updateDimension = (index: number, field: keyof Dimension, value: any) => {
    const updated = [...editForm.dimensions];
    updated[index] = { ...updated[index], [field]: value };

    // If updating formula, mark as calculated
    if (field === "formula") {
      updated[index].isCalculated = value && value.trim() !== "";
    }

    // Re-evaluate all formulas when any dimension changes
    try {
      const evaluated = evaluateDimensionFormulas(updated);
      setEditForm({ ...editForm, dimensions: evaluated });
    } catch (error) {
      // If evaluation fails, just update without evaluation
      setEditForm({ ...editForm, dimensions: updated });
    }
  };

  const addDimension = () => {
    setEditForm({
      ...editForm,
      dimensions: [
        ...editForm.dimensions,
        { name: "", value: "", unit: "", dataType: "string", formula: "", isCalculated: false },
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

    if (!editForm.specName.trim()) {
      alert("Spec name is required");
      return;
    }

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

      await dispatch(
        updateMaterialSpec(selectedSpec._id, {
          specName: editForm.specName,
          description: editForm.description,
          dimensions: processedDimensions,
        })
      );

      alert("Material spec updated successfully!");
      setSelectedSpec(null);

      // Refresh material specs list
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to update material spec");
    }
  };

  const handleToggleActive = async (specId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await dispatch(deactivateMaterialSpec(specId));
        alert("Material spec deactivated successfully!");
      } else {
        await dispatch(activateMaterialSpec(specId));
        alert("Material spec activated successfully!");
      }

      // Refresh material specs list
      window.location.reload();
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
      await dispatch(deleteMaterialSpec(selectedSpec._id));

      alert("Material spec deleted successfully!");
      setShowDeleteConfirm(false);
      setSelectedSpec(null);

      // Refresh material specs list
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to delete material spec");
    }
  };

  const loadTemplate = (template: string) => {
    switch (template) {
      case "plastic":
        setEditForm({
          ...editForm,
          dimensions: [
            { name: "weight", value: 10, unit: "g", dataType: "number", formula: "", isCalculated: false },
            { name: "height", value: 20, unit: "cm", dataType: "number", formula: "", isCalculated: false },
            { name: "volume", value: "", unit: "cm³", dataType: "number", formula: "weight * height", isCalculated: true },
            { name: "density", value: 300, unit: "g/cm³", dataType: "number", formula: "", isCalculated: false },
            { name: "adjusted", value: "", unit: "", dataType: "number", formula: "density / 300", isCalculated: true },
          ],
        });
        break;
      case "metal":
        setEditForm({
          ...editForm,
          dimensions: [
            { name: "length", value: 100, unit: "mm", dataType: "number", formula: "", isCalculated: false },
            { name: "width", value: 50, unit: "mm", dataType: "number", formula: "", isCalculated: false },
            { name: "area", value: "", unit: "mm²", dataType: "number", formula: "length * width", isCalculated: true },
            { name: "thickness", value: 2, unit: "mm", dataType: "number", formula: "", isCalculated: false },
            { name: "volume", value: "", unit: "mm³", dataType: "number", formula: "area * thickness", isCalculated: true },
          ],
        });
        break;
      case "paper":
        setEditForm({
          ...editForm,
          dimensions: [
            { name: "baseWeight", value: 80, unit: "g/m²", dataType: "number", formula: "", isCalculated: false },
            { name: "multiplier", value: 1.5, unit: "", dataType: "number", formula: "", isCalculated: false },
            { name: "finalWeight", value: "", unit: "g/m²", dataType: "number", formula: "baseWeight * multiplier", isCalculated: true },
          ],
        });
        break;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="edit-product-spec-container p-4">
      {loading || specsLoading ? (
        <p className="loadingAndError">Loading...</p>
      ) : error ? (
        <p className="loadingAndError" style={{ color: "red" }}>
          {error}
        </p>
      ) : !selectedSpec ? (
        <>
          {/* Search Bar */}
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                placeholder="Search by spec name, material type, or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 40px",
                  fontSize: "15px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2d89ef")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px",
                  color: "#666",
                }}
              >
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#999",
                    padding: "4px 8px",
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div
              style={{
                padding: "12px 16px",
                background: "#f5f5f5",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#666",
                whiteSpace: "nowrap",
              }}
            >
              {filteredMaterialSpecs.length} of {materialSpecs.length} specs
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#E55A2B]"
              title="Refresh all material specs"
            >
              <span className="text-lg">🔄</span>
              Refresh
            </button>
          </div>

          {/* Table */}
          {filteredMaterialSpecs.length > 0 ? (
            <table className="w-full border border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">No</th>
                  <th className="p-2 border">Spec Name</th>
                  <th className="p-2 border">Material Type</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Dimensions</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterialSpecs.map((spec: MaterialSpec, index: number) => (
                  <tr
                    key={spec._id}
                    className={selectedRow === index ? "bg-orange-100" : ""}
                    onClick={() => {
                      setSelectedRow(index);
                      openEditor(spec);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{spec.specName}</td>
                    <td className="p-2 border">
                      {spec.materialTypeId?.materialTypeName || "N/A"}
                    </td>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(spec._id, spec.isActive);
                        }}
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
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#999",
                fontSize: "16px",
              }}
            >
              No material specs found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-4 shadow-md rounded max-w-3xl">
          <h3 className="text-lg font-bold mb-4">
            Edit Material Spec: {selectedSpec.specName}
          </h3>

          {/* Template Buttons */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => loadTemplate("plastic")}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              🧪 Load Plastic Template
            </button>
            <button
              onClick={() => loadTemplate("metal")}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              🔩 Load Metal Template
            </button>
            <button
              onClick={() => loadTemplate("paper")}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              📄 Load Paper Template
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Spec Name *</label>
              <input
                value={editForm.specName}
                onChange={(e) => handleEditChange("specName", e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="e.g., Premium Plastic Grade A"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Material Type</label>
              <input
                value={selectedSpec.materialTypeId?.materialTypeName || "N/A"}
                className="border p-2 w-full rounded bg-gray-100"
                disabled
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleEditChange("description", e.target.value)}
                className="border p-2 w-full rounded"
                rows={2}
                placeholder="Optional description"
              />
            </div>

            {/* Product Spec Dimension Name Browser */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#fef3f3",
                border: "1px solid #fecaca",
                borderRadius: "8px",
              }}
            >
              <h4
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#dc2626",
                  marginBottom: "0.75rem",
                }}
              >
                📦 Reference Product Spec Dimensions
              </h4>
              <p style={{ fontSize: "0.875rem", color: "#991b1b", marginBottom: "1rem" }}>
                Select a Product Spec to see its dimension names for formula references.
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                  }}
                >
                  Select Product Spec:
                </label>
                <select
                  value={selectedProductSpecId}
                  onChange={(e) => setSelectedProductSpecId(e.target.value)}
                  className="border p-2 w-full rounded"
                >
                  <option value="">-- Select Product Spec --</option>
                  {productSpecs.map((spec: any) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.specName}
                    </option>
                  ))}
                </select>
              </div>

              {productDimensionNames.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Available dimension names:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {productDimensionNames.map((name, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: "0.25rem 0.75rem",
                          backgroundColor: "#fee2e2",
                          color: "#b91c1c",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                          fontFamily: "monospace",
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dimensions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-semibold">Dimensions</label>
                <button
                  onClick={addDimension}
                  className="bg-[#FF6B35] text-white px-3 py-1 rounded text-sm"
                >
                  + Add Dimension
                </button>
              </div>

              {editForm.dimensions.map((dim, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded border mb-2">
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    <input
                      placeholder="Name"
                      value={dim.name}
                      onChange={(e) => updateDimension(index, "name", e.target.value)}
                      className="border p-1 rounded"
                    />
                    <input
                      placeholder={dim.isCalculated ? "Auto-calculated" : "Value"}
                      value={dim.value.toString()}
                      onChange={(e) => updateDimension(index, "value", e.target.value)}
                      className="border p-1 rounded"
                      disabled={dim.isCalculated}
                      style={
                        dim.isCalculated
                          ? { backgroundColor: "#e0f7e0", color: "#059669" }
                          : {}
                      }
                    />
                    <input
                      placeholder="Unit"
                      value={dim.unit || ""}
                      onChange={(e) => updateDimension(index, "unit", e.target.value)}
                      className="border p-1 rounded"
                    />
                    <select
                      value={dim.dataType}
                      onChange={(e) => updateDimension(index, "dataType", e.target.value)}
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

                  {/* Formula field - only for number type */}
                  {dim.dataType === "number" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 min-w-16">Formula:</span>
                      <input
                        placeholder="e.g., weight * height (leave empty for manual value)"
                        value={dim.formula || ""}
                        onChange={(e) => updateDimension(index, "formula", e.target.value)}
                        className="border p-1 w-full rounded text-sm"
                        style={{ fontFamily: "monospace" }}
                      />
                      {dim.isCalculated && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          🧮 Auto
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {editForm.dimensions.length === 0 && (
                <p className="text-gray-500 text-sm italic">
                  No dimensions added. Click "+ Add Dimension" to start.
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={!editForm.specName.trim()}
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

export default EditMaterialSpec;
