import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProducts,
  updateProduct,
  deleteProduct,
} from "../../../../redux/create/products/ProductActions";
import { getProductCategories } from "../../../../redux/create/products/productCategories/productCategoriesActions";
import { RootState } from "../../../../redux/rootReducer";

interface ProductType {
  _id: string;
  name?: string;
}

interface BranchId {
  _id: string;
  name?: string;
}

interface Product {
  _id: string;
  productName: string;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  productType?: ProductType | string;
  branchId?: BranchId | string;
}

interface ProductCategory {
  _id: string;
  name: string;
}

const EditProducts: React.FC = () => {
  const dispatch = useDispatch();

  const { products = [], loading, error } = useSelector(
    (state: RootState) => state.productList || {}
  );
  const productCategoryState = useSelector(
    (state: RootState) => state.productCategories || {}
  );
  const productCategories = (productCategoryState as any).items || (productCategoryState as any).categories || (productCategoryState as any).data || [];
  const { success: updateSuccess } = useSelector(
    (state: RootState) => state.productUpdate || {}
  );
  const { success: deleteSuccess } = useSelector(
    (state: RootState) => state.productDelete || {}
  );

  const [focusedRow, setFocusedRow] = useState<number>(-1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    sizeX: "",
    sizeY: "",
    sizeZ: "",
    categoryId: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    dispatch(getProducts() as any);
    dispatch(getProductCategories() as any);
  }, [dispatch, updateSuccess, deleteSuccess]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
    product: Product
  ) => {
    if (e.key === "Enter") openEditor(product);
    else if (e.key === "ArrowDown")
      setFocusedRow((prev) => Math.min(prev + 1, products.length - 1));
    else if (e.key === "ArrowUp")
      setFocusedRow((prev) => Math.max(prev - 1, 0));
  };

  const openEditor = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.productName,
      sizeX: product.sizeX.toString(),
      sizeY: product.sizeY.toString(),
      sizeZ: product.sizeZ.toString(),
      categoryId: typeof product.productType === 'object' ? product.productType?._id || "" : product.productType || "",
    });
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleUpdate = () => {
    if (!selectedProduct) return;

    dispatch(
      updateProduct(selectedProduct._id, {
        productName: editForm.name,
        productType: editForm.categoryId,
        sizeX: Number(editForm.sizeX),
        sizeY: Number(editForm.sizeY),
        sizeZ: Number(editForm.sizeZ),
      }) as any
    );
    setSelectedProduct(null);
  };

  const handleDeleteClick = () => {
    setDeleteInput("");
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteInput === "DELETE" && selectedProduct) {
      dispatch(deleteProduct(selectedProduct._id) as any);
      setShowDeleteConfirm(false);
      setSelectedProduct(null);
    } else {
      alert("❌ Type DELETE to confirm deletion");
    }
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

  return (
    <div className="EditProducts p-4">
      <h2 className="text-xl font-semibold mb-4">Product List</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!selectedProduct ? (
        <table className="w-full border border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Product Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Size X</th>
              <th className="p-2 border">Size Y</th>
              <th className="p-2 border">Size Z</th>
              <th className="p-2 border">Branch</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product, index: number) => (
              <tr
                key={product._id}
                tabIndex={0}
                onClick={() => openEditor(product)}
                onKeyDown={(e) => handleKeyDown(e, product)}
                onFocus={() => setFocusedRow(index)}
                className={focusedRow === index ? "bg-blue-100" : ""}
              >
                <td className="p-2 border">{product.productName}</td>
                <td className="p-2 border">
                  {typeof product.productType === 'object' ? product.productType?.name : "—"}
                </td>
                <td className="p-2 border">{product.sizeX}</td>
                <td className="p-2 border">{product.sizeY}</td>
                <td className="p-2 border">{product.sizeZ}</td>
                <td className="p-2 border">
                  {typeof product.branchId === 'object' ? product.branchId?.name : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-white p-4 shadow-md rounded max-w-lg">
          <h3 className="text-lg font-bold mb-2">Edit Product</h3>

          <label className="block mb-1">Product Name</label>
          <input
            value={editForm.name}
            onChange={(e) => handleEditChange("name", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Category</label>
          <select
            value={editForm.categoryId}
            onChange={(e) => handleEditChange("categoryId", e.target.value)}
            className="border p-2 mb-3 w-full"
          >
            <option value="">Select Category</option>
            {productCategories.map((cat: ProductCategory) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <label className="block mb-1">Size X</label>
          <input
            value={editForm.sizeX}
            onChange={(e) => handleEditChange("sizeX", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Size Y</label>
          <input
            value={editForm.sizeY}
            onChange={(e) => handleEditChange("sizeY", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <label className="block mb-1">Size Z</label>
          <input
            value={editForm.sizeZ}
            onChange={(e) => handleEditChange("sizeZ", e.target.value)}
            className="border p-2 mb-3 w-full"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={handleDeleteClick}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
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

export default EditProducts;