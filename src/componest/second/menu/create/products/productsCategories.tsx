import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProductCategory } from "../../../../redux/create/products/ProductActions";
import "./productcategories.css";
import { AppDispatch } from '../../../../../store'; 
const ProductCategories = () => {
  const [categoryName, setCategoryName] = useState("");
 const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: any) => state.productCategories?.categories || []);

  const handleAddCategory = () => {
    if (categoryName.trim() === "") return;
    dispatch(addProductCategory(categoryName.trim()));
    setCategoryName("");
  };

  return (
    <div className="form-grid">
      <h2 className="input-label">Product Categories</h2>

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
          disabled={categoryName.trim() === ""}
        >
          Add
        </button>
      </div>

      <div>
        <h3 className="input-label">Category List:</h3>
        <ul>
          {categories.map((cat: string, index: number) => (
            <li key={index}>{cat}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductCategories;