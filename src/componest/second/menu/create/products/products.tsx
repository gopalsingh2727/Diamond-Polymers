import { useState } from "react";
import { useDispatch } from "react-redux";
import { createProduct } from "../../../../redux/create/products/ProductActions";
import { AppDispatch } from "../../../../../store";
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import "../CreateStep/createStep.css";
import "../../CreateOders/CreateOders.css";

const Products = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [productName, setProductName] = useState("");
  const [sizeX, setSizeX] = useState("");
  const [sizeY, setSizeY] = useState("");
  const [sizeZ, setSizeZ] = useState("");
  const [category, setCategory] = useState("");
  const [success, setSuccess] = useState(false);

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { productTypes: categories, loading, error } = useFormDataCache();

  const handleSave = () => {
    if (!productName || !category || !sizeX || !sizeY || !sizeZ) {
      alert("All fields are required");
      return;
    }

    dispatch(
      createProduct({
        productName,
        productType: category,
        sizeX: parseFloat(sizeX),
        sizeY: parseFloat(sizeY),
        sizeZ: parseFloat(sizeZ),
      })
    );

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);

    setProductName("");
    setCategory("");
    setSizeX("");
    setSizeY("");
    setSizeZ("");
  };

  return (
    <div className="create-step-container">
      <div className="step-form-wrapper">
        <h2 className="form-title">Create Product</h2>

        <div className="step-name-group">
          <label className="form-label">Product Name *</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="createDivInput createDivInputwidth"
            placeholder="Enter product name"
          />
        </div>

        <div className="step-name-group">
          <label className="form-label">Select Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="createDivInput createDivInputwidth"
          >
            <option value="">Select category</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.productTypeName}
              </option>
            ))}
          </select>
        </div>

        <div className="machine-row">
          <div className="step-name-group">
            <label className="form-label">Size X</label>
            <input
              value={sizeX}
              onChange={(e) => setSizeX(e.target.value)}
              className="CurstomerInput inputCerateAndEndit"
              type="number"
              placeholder="X"
            />
          </div>
          <div className="step-name-group">
            <label className="form-label">Size Y</label>
            <input
              value={sizeY}
              onChange={(e) => setSizeY(e.target.value)}
              className="CurstomerInput inputCerateAndEndit"
              type="number"
              placeholder="Y"
            />
          </div>
          <div className="step-name-group">
            <label className="form-label">Size Z</label>
            <input
              value={sizeZ}
              onChange={(e) => setSizeZ(e.target.value)}
              className="CurstomerInput inputCerateAndEndit"
              type="number"
              placeholder="Z"
            />
          </div>
        </div>

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
