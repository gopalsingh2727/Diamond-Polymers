import { useState } from "react";
import "./products.css"; // Make sure this CSS file is imported correctly

const Products = () => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [sizeX, setSizeX] = useState("");
  const [sizeY, setSizeY] = useState("");
  const [sizeZ, setSizeZ] = useState("");
  const [category, setCategory] = useState("");

  // Dummy categories (can be replaced with dynamic data)
  const categories = ["Electronics", "Clothing", "Furniture", "Toys"];

  const handleSave = () => {
    const product = {
      productName,
      price,
      category,
      sizes: {
        x: sizeX,
        y: sizeY,
        z: sizeZ,
      },
    };
    console.log("Product Saved:", product);

    // Reset fields
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

      {/* Product Name */}
      <div className="form-column">
        <label className="input-label">Product Name</label>
        <input
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="form-input"
          placeholder="Enter product name"
        />
      </div>

      {/* Price */}
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

      {/* Category Select */}
      <div className="form-column">
        <label className="input-label">Select Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-input"
        >
          <option value="" disabled>Select category</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Sizes: Size X, Y, Z */}
      <div className="form-column">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="input-label">Size X</label>
            <input
              value={sizeX}
              onChange={(e) => setSizeX(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="input-label">Size Y</label>
            <input
              value={sizeY}
              onChange={(e) => setSizeY(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="input-label">Size Z</label>
            <input
              value={sizeZ}
              onChange={(e) => setSizeZ(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="form-column">
        <button
          onClick={handleSave}
          className="save-button"
        >
          Save Product
        </button>
      </div>
    </div>
  );
};

export default Products;