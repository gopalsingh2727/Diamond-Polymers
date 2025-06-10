import { useState } from "react";
import './materialsCategories.css'
const MaterialsCategories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const handleAddCategory = () => {
    if (categoryName.trim()) {
      setCategories((prev) => [...prev, categoryName]);
      setCategoryName("");
    }
  };

  return (
    <div className="form-grid">
    <h2 className="input-label">Material Categories</h2>
  
    <div className="form-column">
      <div className="form-input-group">
        <input
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="form-input"
          placeholder="Enter category name"
        />
      </div>
      <button
        onClick={handleAddCategory}
        className="save-button"
      >
        Add
      </button>
    </div>
  
    <ul>
      {categories.map((cat, index) => (
        <li key={index}>{cat}</li>
      ))}
    </ul>
  </div>
  );
};

export default MaterialsCategories;