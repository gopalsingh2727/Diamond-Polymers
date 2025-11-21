import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProductCategory } from "../../../../redux/create/products/productCategories/productCategoriesActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import "../CreateStep/createStep.css";
import "../../CreateOders/CreateOders.css";

const ProductCategories = () => {
  const [categoryName, setCategoryName] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const {
    loading,
    error,
    success,
  } = useSelector((state: RootState) => state.productCategories);

  const handleAddCategory = () => {
    if (categoryName.trim() === "") return;
    dispatch(addProductCategory(categoryName.trim()));
  };

  // Reset input after successful add
  useEffect(() => {
    if (success) setCategoryName("");
  }, [success]);

  return (
    <div className="create-step-container">
      <div className="step-form-wrapper">
        <h2 className="form-title">Product Categories</h2>

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
          disabled={loading || categoryName.trim() === ""}
        >
          {loading ? "Adding..." : "Add Category"}
        </button>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">Category added successfully!</div>}
      </div>
    </div>
  );
};

export default ProductCategories;
