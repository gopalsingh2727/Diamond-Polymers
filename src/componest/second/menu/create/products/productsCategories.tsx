import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProductCategory } from "../../../../redux/create/products/productCategories/productCategoriesActions";
import { RootState } from "../../../../redux/rootReducer";
import "./productcategories.css";
import { AppDispatch } from "../../../../../store";

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
          disabled={loading || categoryName.trim() === ""}
        >
          {loading ? "Adding..." : "Add"}
        </button>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">Category added successfully!</div>}
      </div>

   
    </div>
  );
};

export default ProductCategories;