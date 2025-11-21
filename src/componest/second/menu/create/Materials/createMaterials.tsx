import { useState } from "react";
import { useDispatch } from "react-redux";
import { createMaterial } from "../../../../redux/create/Materials/MaterialsActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
import "../CreateStep/createStep.css";
import "../../CreateOders/CreateOders.css";

const CreateMaterials = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [materialName, setMaterialName] = useState("");
  const [materialMol, setMaterialMol] = useState("");
  const [category, setCategory] = useState("");

  // 🚀 CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { materialTypes: categories, loading } = useFormDataCache();

  const handleSubmit = () => {
    if (!materialName || !materialMol || !category) {
      toast.error('Validation Error', 'All fields are required');
      return;
    }

    handleSave(
      () => dispatch(createMaterial({
        materialName,
        materialMol: parseFloat(materialMol),
        materialType: category,
      })),
      {
        successMessage: 'Material created successfully!',
        onSuccess: () => {
          setMaterialName("");
          setMaterialMol("");
          setCategory("");
        }
      }
    );
  };

  return (
    <div className="create-step-container">
      <div className="step-form-wrapper">
        <h2 className="form-title">Create Material</h2>

        <div className="step-name-group">
          <label className="form-label">Material Name *</label>
          <input
            type="text"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            className="createDivInput createDivInputwidth"
            placeholder="Enter material name"
          />
        </div>

        <div className="step-name-group">
          <label className="form-label">Material Mol *</label>
          <input
            type="number"
            value={materialMol}
            onChange={(e) => setMaterialMol(e.target.value)}
            className="createDivInput createDivInputwidth"
            placeholder="Enter material Mol"
          />
        </div>

        <div className="step-name-group">
          <label className="form-label">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="createDivInput createDivInputwidth machine-select"
          >
            <option value="">Select category</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.materialTypeName}
              </option>
            ))}
          </select>
        </div>

        <ActionButton
          type="save"
          state={saveState}
          onClick={handleSubmit}
          className="save-button"
        >
          Save Material
        </ActionButton>

        {/* Toast notifications */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  );
};

export default CreateMaterials;
