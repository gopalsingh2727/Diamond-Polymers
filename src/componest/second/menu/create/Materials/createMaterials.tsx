import { useState } from "react";

const CreateMaterials = () => {
  const [materialName, setMaterialName] = useState("");
  const [category, setCategory] = useState("");

  // Dummy categories (replace with dynamic list if needed)
  const categories = ["Plastic", "Metal", "Fabric", "Wood"];

  const handleSave = () => {
    const material = {
      materialName,
      category,
    };
    console.log("Material Saved:", material);

    // Reset
    setMaterialName("");
    setCategory("");
  };

  return (
    <div className="form-grid">
  <h2 className="input-label">Create Material</h2>

  <div className="form-input-group">
    <label className="input-label">Material Name</label>
    <input
      value={materialName}
      onChange={(e) => setMaterialName(e.target.value)}
      className="form-input"
      placeholder="Enter material name"
    />

    <label className="input-label">Material Mol</label>
    <input
      value={materialName}
      onChange={(e) => setMaterialName(e.target.value)}
      className="form-input"
      placeholder="Enter material Mol"
    />
  </div>

  <div className="form-input-group">
    <label className="input-label">Category</label>
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      className="form-input"
    >
      <option value="">Select category</option>
      {categories.map((cat, i) => (
        <option key={i} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  </div>

  <button
    onClick={handleSave}
    className="save-button"
  >
    Save Material
  </button>
</div>
  );
};

export default CreateMaterials;