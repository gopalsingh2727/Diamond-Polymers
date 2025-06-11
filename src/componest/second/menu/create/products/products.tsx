import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../../../../redux/create/products/ProductActions";
import { getProductCategories } from "../../../../redux/create/products/productCategories/productCategoriesActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import "./products.css";

const Products = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [sizeX, setSizeX] = useState("");
  const [sizeY, setSizeY] = useState("");
  const [sizeZ, setSizeZ] = useState("");
  const [category, setCategory] = useState("");

  const { categories, loading, error, success } = useSelector(
    (state: RootState) => state.productCategories
  );


  useEffect(() => {
    dispatch(getProductCategories());
  }, [dispatch]);
  
  

  const handleSave = () => {
    if (!productName || !price || !category || !sizeX || !sizeY || !sizeZ) {
      alert("All fields are required");
      return;
    }

    dispatch(
      createProduct({
        productName,
        price: parseFloat(price),
        productType: category,
        sizeX: parseFloat(sizeX),
        sizeY: parseFloat(sizeY),
        sizeZ: parseFloat(sizeZ),
      })
    );

    setProductName("");
    setPrice("");
    setCategory("");
    setSizeX("");
    setSizeY("");
    setSizeZ("");
  };

  return (
    <div className="form-grid">
      <h2 className="text-2xl font-bold">Create Product</h2>

      <div className="form-column">
        <label className="input-label">Product Name</label>
        <input
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="form-input"
          placeholder="Enter product name"
        />
      </div>

      <div className="form-column">
        <label className="input-label">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="form-input"
          placeholder="Enter price"
        />
      </div>

      <div className="form-column">
        <label className="input-label">Select Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-input"
        >
          <option value="">Select category</option>
          {categories.map((cat: any) => (
            <option key={cat._id} value={cat._id}>
              {cat.productTypeName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-column">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="input-label">Size X</label>
            <input
              value={sizeX}
              onChange={(e) => setSizeX(e.target.value)}
              className="form-input"
              type="number"
            />
          </div>
          <div>
            <label className="input-label">Size Y</label>
            <input
              value={sizeY}
              onChange={(e) => setSizeY(e.target.value)}
              className="form-input"
              type="number"
            />
          </div>
          <div>
            <label className="input-label">Size Z</label>
            <input
              value={sizeZ}
              onChange={(e) => setSizeZ(e.target.value)}
              className="form-input"
              type="number"
            />
          </div>
        </div>
      </div>

      <div className="form-column">
        <button
          onClick={handleSave}
          className="save-button"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">Product created successfully!</div>}
      </div>
    </div>
  );
};

export default Products;