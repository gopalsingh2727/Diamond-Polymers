import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMachineType } from "../../../../redux/create/machineType/machineTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";

const CreateMachineType: React.FC = () => {
  const [machineTypeName, setMachineTypeName] = useState("");
  const [description, setDescription] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const { loading, success, error } = useSelector(
    (state: RootState) => state.machineTypeCreate
  );

  const handleAddMachineType = () => {
    if (!machineTypeName.trim() || !description.trim()) return;
    dispatch(addMachineType(machineTypeName, description));
    setMachineTypeName("");
    setDescription("");
  };

  useEffect(() => {
    if (success) {
      console.log("Machine type added successfully");
    }
  }, [success]);

  return (
    <div className="form-grid">
      <h2 className="input-label">Machine Type</h2>
      <div className="form-column">
        <div className="form-input-group">
          <input
            value={machineTypeName}
            onChange={(e) => setMachineTypeName(e.target.value)}
            className="form-input"
            placeholder="Enter Machine Type"
          />
        </div>
        <div className="form-input-group">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            placeholder="Enter Description"
          />
        </div>
        <button
          onClick={handleAddMachineType}
          className="save-button"
          disabled={loading || !machineTypeName.trim() || !description.trim()}
        >
          {loading ? "Adding..." : "Add"}
        </button>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">Machine type added!</div>}
      </div>
    </div>
  );
};

export default CreateMachineType;