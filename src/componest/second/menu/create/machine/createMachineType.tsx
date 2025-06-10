import { useState } from "react";
// import { useDispatch} from "react-redux";
// import your addMachineType action
// import { addMachineType } from "../../redux/actions/machineTypeActions";

const CreateMachineType = () => {
  const [machineTypeName, setMachineTypeName] = useState("");
  // const dispatch = useDispatch();

  const handleAddMachineType = () => {
    if (!machineTypeName.trim()) return;

    // Dispatch the action to add a machine type (uncomment and implement as needed)
    // dispatch(addMachineType({ machineTypeName }));

    console.log("Adding machine type:", machineTypeName); // for debug
    setMachineTypeName(""); // clear input
  };

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
        <button
          onClick={handleAddMachineType}
          className="save-button"
          disabled={machineTypeName.trim() === ""}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default CreateMachineType;