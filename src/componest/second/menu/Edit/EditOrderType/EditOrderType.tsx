import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../store";
import {
  updateOrderType,
  deleteOrderType,
  getOrderTypes,
} from "../../../../redux/create/orderType/orderTypeActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import "../EditProductSpec/editProductSpec.css";

interface OrderType {
  _id: string;
  name: string;
  description?: string;
  sections?: {
    showProductSection?: boolean;
    showMaterialSection?: boolean;
    showMachineSection?: boolean;
    showFormulaSection?: boolean;
  };
  restrictions?: {
    allowedProductTypes?: string[];
    allowedProducts?: string[];
    allowedMaterialTypes?: string[];
    allowedMaterials?: string[];
  };
  orderNumberFormat?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const EditOrderType: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 🚀 OPTIMIZED: Get product/material types from cache for restrictions display
  const { productTypes, materialTypes, loading: cacheLoading } = useFormDataCache();

  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    orderNumberFormat: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Filter order types based on search term
  const filteredOrderTypes = useMemo(() => {
    if (!searchTerm) return orderTypes;

    const search = searchTerm.toLowerCase();
    return orderTypes.filter(
      (type) =>
        type.name?.toLowerCase().includes(search) ||
        type.description?.toLowerCase().includes(search)
    );
  }, [orderTypes, searchTerm]);

  // Fetch order types on mount
  useEffect(() => {
    const fetchOrderTypes = async () => {
      setLoading(true);
      try {
        const result = await dispatch(getOrderTypes());
        setOrderTypes(result.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch order types");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderTypes();
  }, [dispatch]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedOrderType || filteredOrderTypes.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredOrderTypes.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const type = filteredOrderTypes[selectedRow];
        if (type) openEditor(type);
      }
    },
    [filteredOrderTypes, selectedRow, selectedOrderType]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedRow(0);
  }, [searchTerm]);

  const openEditor = (orderType: OrderType) => {
    setSelectedOrderType(orderType);
    setEditForm({
      name: orderType.name,
      description: orderType.description || "",
      orderNumberFormat: orderType.orderNumberFormat || "",
    });
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleUpdate = async () => {
    if (!selectedOrderType) return;

    if (!editForm.name.trim()) {
      alert("Order type name is required");
      return;
    }

    try {
      await dispatch(
        updateOrderType(selectedOrderType._id, {
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          orderNumberFormat: editForm.orderNumberFormat.trim(),
        })
      );

      alert("Order type updated successfully!");
      setSelectedOrderType(null);

      // Refresh order types list
      const result = await dispatch(getOrderTypes());
      setOrderTypes(result.data || []);
    } catch (err: any) {
      alert(err.message || "Failed to update order type");
    }
  };

  const handleDeleteClick = () => {
    if (selectedOrderType?.isDefault) {
      alert("❌ Cannot delete the default order type");
      return;
    }
    setDeleteInput("");
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteInput !== "DELETE" || !selectedOrderType) {
      alert("❌ Type DELETE to confirm deletion");
      return;
    }

    try {
      await dispatch(deleteOrderType(selectedOrderType._id));

      alert("Order type deleted successfully!");
      setShowDeleteConfirm(false);
      setSelectedOrderType(null);

      // Refresh order types list
      const result = await dispatch(getOrderTypes());
      setOrderTypes(result.data || []);
    } catch (err: any) {
      alert(err.message || "Failed to delete order type");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await dispatch(getOrderTypes());
      setOrderTypes(result.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to refresh order types");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get product type names from IDs
  const getProductTypeNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return "All";
    return ids
      .map((id) => {
        const type = productTypes.find((t: any) => t._id === id);
        return type?.productTypeName || id;
      })
      .join(", ");
  };

  // Helper to get material type names from IDs
  const getMaterialTypeNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return "All";
    return ids
      .map((id) => {
        const type = materialTypes.find((t: any) => t._id === id);
        return type?.materialTypeName || id;
      })
      .join(", ");
  };

  return (
    <div className="edit-product-spec-container p-4">
      {loading || cacheLoading ? (
        <p className="loadingAndError">Loading...</p>
      ) : error ? (
        <p className="loadingAndError" style={{ color: "red" }}>
          {error}
        </p>
      ) : !selectedOrderType ? (
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
                placeholder="Search by order type name or description..."
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
              {filteredOrderTypes.length} of {orderTypes.length} types
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#E55A2B]"
              title="Refresh all order types"
            >
              <span className="text-lg">🔄</span>
              Refresh
            </button>
          </div>

          {/* Table */}
          {filteredOrderTypes.length > 0 ? (
            <table className="w-full border border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">No</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Number Format</th>
                  <th className="p-2 border">Sections</th>
                  <th className="p-2 border">Default</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrderTypes.map((type: OrderType, index: number) => (
                  <tr
                    key={type._id}
                    className={selectedRow === index ? "bg-orange-100" : ""}
                    onClick={() => {
                      setSelectedRow(index);
                      openEditor(type);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border font-semibold">{type.name}</td>
                    <td className="p-2 border">{type.description || "—"}</td>
                    <td className="p-2 border">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {type.orderNumberFormat || "—"}
                      </code>
                    </td>
                    <td className="p-2 border text-xs">
                      {type.sections?.showProductSection && "🔹 Product "}
                      {type.sections?.showMaterialSection && "🔸 Material "}
                      {type.sections?.showMachineSection && "🔧 Machine "}
                      {type.sections?.showFormulaSection && "📐 Formula"}
                      {!type.sections?.showProductSection &&
                        !type.sections?.showMaterialSection &&
                        !type.sections?.showMachineSection &&
                        !type.sections?.showFormulaSection &&
                        "—"}
                    </td>
                    <td className="p-2 border text-center">
                      {type.isDefault ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          ✓ Default
                        </span>
                      ) : (
                        "—"
                      )}
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
              No order types found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-4 shadow-md rounded max-w-3xl">
          <h3 className="text-lg font-bold mb-4">
            Edit Order Type: {selectedOrderType.name}
          </h3>

          {selectedOrderType.isDefault && (
            <div
              className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4"
              style={{ fontSize: "14px" }}
            >
              ⚠️ This is the default order type. You can edit the details but cannot delete it.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Name *</label>
              <input
                value={editForm.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="e.g., Standard Order"
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

            <div>
              <label className="block mb-1 font-semibold">Order Number Format</label>
              <input
                value={editForm.orderNumberFormat}
                onChange={(e) => handleEditChange("orderNumberFormat", e.target.value)}
                className="border p-2 w-full rounded font-mono text-sm"
                placeholder="e.g., ORD-{YYYY}-{####}"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported placeholders: {"{YYYY}"}, {"{MM}"}, {"{DD}"}, {"{####}"}
              </p>
            </div>

            {/* Display Current Sections (Read-only for now) */}
            <div>
              <label className="block mb-2 font-semibold">Active Sections</label>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedOrderType.sections?.showProductSection || false}
                      disabled
                      className="mr-2"
                    />
                    <span>Show Product Section</span>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedOrderType.sections?.showMaterialSection || false}
                      disabled
                      className="mr-2"
                    />
                    <span>Show Material Section</span>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedOrderType.sections?.showMachineSection || false}
                      disabled
                      className="mr-2"
                    />
                    <span>Show Machine Section</span>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedOrderType.sections?.showFormulaSection || false}
                      disabled
                      className="mr-2"
                    />
                    <span>Show Formula Section</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ℹ️ Section configuration is read-only. Use Create Order Type to configure sections.
                </p>
              </div>
            </div>

            {/* Display Current Restrictions (Read-only) */}
            {(selectedOrderType.restrictions?.allowedProductTypes ||
              selectedOrderType.restrictions?.allowedMaterialTypes) && (
              <div>
                <label className="block mb-2 font-semibold">Current Restrictions</label>
                <div className="bg-gray-50 p-3 rounded border text-sm">
                  {selectedOrderType.restrictions?.allowedProductTypes && (
                    <div className="mb-2">
                      <strong>Product Types:</strong>{" "}
                      {getProductTypeNames(selectedOrderType.restrictions.allowedProductTypes)}
                    </div>
                  )}
                  {selectedOrderType.restrictions?.allowedMaterialTypes && (
                    <div>
                      <strong>Material Types:</strong>{" "}
                      {getMaterialTypeNames(selectedOrderType.restrictions.allowedMaterialTypes)}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    ℹ️ Restrictions are read-only. Use Create Order Type to configure restrictions.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={!editForm.name.trim()}
              >
                💾 Save Changes
              </button>
              <button
                onClick={handleDeleteClick}
                className={`px-4 py-2 rounded ${
                  selectedOrderType.isDefault
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
                disabled={selectedOrderType.isDefault}
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setSelectedOrderType(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>

            {/* Metadata */}
            <div className="border-t pt-3 mt-4">
              <p className="text-xs text-gray-500">
                <strong>Created:</strong>{" "}
                {selectedOrderType.createdAt
                  ? new Date(selectedOrderType.createdAt).toLocaleString()
                  : "N/A"}
              </p>
              {selectedOrderType.updatedAt && (
                <p className="text-xs text-gray-500">
                  <strong>Updated:</strong>{" "}
                  {new Date(selectedOrderType.updatedAt).toLocaleString()}
                </p>
              )}
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

export default EditOrderType;
