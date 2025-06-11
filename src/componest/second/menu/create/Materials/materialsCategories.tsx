import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMaterialCategory,
  getMaterialCategories,
} from "../../../../redux/create/Materials/MaterialsCategories/MaterialsCategoriesActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import "./materialsCategories.css";

const MaterialsCategories = () => {
  const [categoryName, setCategoryName] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const { categories, loading, error, success } = useSelector(
    (state: RootState) => state.materialCategories
  );

  useEffect(() => {
    dispatch(getMaterialCategories());
  }, [dispatch]);

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;
    dispatch(addMaterialCategory(categoryName.trim()));
    setCategoryName("");
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
          disabled={loading || !categoryName.trim()}
        >
          {loading ? "Adding..." : "Add"}
        </button>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">Category added!</div>}
      </div>

      <div className="form-column">
        <h3 className="input-label">Category List</h3>
        <ul>
          {categories.map((cat: any) => (
            <li key={cat._id}>{cat.materialTypeName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MaterialsCategories;