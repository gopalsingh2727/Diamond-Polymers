import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createMaterial } from "../../../../redux/create/Materials/MaterialsActions";
import { getMaterialCategories } from "../../../../redux/create/Materials/MaterialsCategories/MaterialsCategoriesActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import "./CreateMaterials.css";

const CreateMaterials = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [materialName, setMaterialName] = useState("");
  const [materialMol, setMaterialMol] = useState("");
  const [category, setCategory] = useState("");

  const { categories, loading, error } = useSelector(
    (state: RootState) => state.materialCategories
  );

  useEffect(() => {
    dispatch(getMaterialCategories());
  }, [dispatch]);

  const handleSave = () => {
    if (!materialName || !materialMol || !category) {
      alert("All fields are required");
      return;
    }

    dispatch(
      createMaterial({
        materialName,
        materialMol: parseFloat(materialMol),
        materialType: category,
      })
    );

    setMaterialName("");
    setMaterialMol("");
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
          value={materialMol}
          onChange={(e) => setMaterialMol(e.target.value)}
          className="form-input"
          type="number"
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
          {categories.map((cat: any) => (
            <option key={cat._id} value={cat._id}>
              {cat.materialTypeName}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleSave} className="save-button" disabled={loading}>
        {loading ? "Saving..." : "Save Material"}
      </button>

      {error && <div className="error-msg">{error}</div>}
    </div>
  );
};

export default CreateMaterials;