import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMaterialCategory,
} from "../../../../redux/create/Materials/MaterialsCategories/MaterialsCategoriesActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import "../CreateStep/createStep.css";
import "../../CreateOders/CreateOders.css";

const MaterialsCategories = () => {
  const [categoryName, setCategoryName] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { materialTypes: categories, loading: cacheLoading } = useFormDataCache();

  const { loading, error, success } = useSelector(
    (state: RootState) => state.materialCategories
  );

  // ✅ No API calls needed - data comes from useFormDataCache!

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;
    dispatch(addMaterialCategory(categoryName.trim()));
    setCategoryName("");
  };

  return (
    <div className="create-step-container">
      <div className="step-form-wrapper">
        <h2 className="form-title">Material Categories</h2>

        <div className="step-name-group">
          <label className="form-label">Category Name *</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="createDivInput createDivInputwidth"
            placeholder="Enter category name"
          />
        </div>

        <button
          onClick={handleAddCategory}
          className="save-button"
          disabled={loading || !categoryName.trim()}
        >
          {loading ? "Adding..." : "Add Category"}
        </button>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">Category added!</div>}

 
      </div>
    </div>
  );
};

export default MaterialsCategories;
