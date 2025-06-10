import React, { useEffect, useState } from "react";
import './EditMachineyType.css';

const EditMachineType = () => {
  const [machineTypes, setMachineTypes] = useState([
    {
      id: 1,
      type: "Creater",
      totalMachines: 2,
      machines: [
        { name: "CR-101", x: 20, y: 30, z: 10 },
        { name: "CR-102", x: 25, y: 35, z: 15 },
      ],
    },
    {
      id: 2,
      type: "Printer",
      totalMachines: 1,
      machines: [{ name: "PR-201", x: 10, y: 15, z: 5 }],
    },
    {
      id: 3,
      type: "Cutter",
      totalMachines: 1,
      machines: [{ name: "CT-301", x: 12, y: 18, z: 8 }],
    },
  ]);

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editType, setEditType] = useState("");

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showDetail) return;

    if (e.key === "ArrowDown") {
      setSelectedRow((prev) => Math.min(prev + 1, machineTypes.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedRow((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      setEditType(machineTypes[selectedRow].type);
      setShowDetail(true);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditType(e.target.value);
  };

  const handleEditSave = () => {
    const updated = [...machineTypes];
    updated[selectedRow].type = editType;
    setMachineTypes(updated);
    alert("Machine Type updated!");
  };

  const selectedItem = machineTypes[selectedRow];

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRow, showDetail]);

  return (
    <div className="emt-container">
      {!showDetail ? (
        <table className="emt-table">
          <thead className="emt-thead">
            <tr>
              <th className="emt-th">No</th>
              <th className="emt-th">Machine Type</th>
              <th className="emt-th">Total Machines</th>
              <th className="emt-th">Edit</th>
            </tr>
          </thead>
          <tbody>
            {machineTypes.map((item, index) => (
              <tr
                key={item.id}
                className={selectedRow === index ? "emt-row-selected" : ""}
              >
                <td className="emt-td">{index + 1}</td>
                <td className="emt-td">{item.type}</td>
                <td className="emt-td">{item.totalMachines}</td>
                <td className="emt-td emt-edit-text">Edit</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>
          <div className="emt-top-buttons">
            <button
              onClick={() => setShowDetail(false)}
              className="emt-btn-back"
            >
              Back
            </button>
            <button onClick={handleEditSave} className="emt-btn-delete">
              Delete
            </button>
          </div>

          <div className="emt-edit-field">
            <label className="emt-label">Machine Type:</label>
            <input
              type="text"
              value={editType}
              onChange={handleEditChange}
              className="emt-input"
            />
            <button onClick={handleEditSave} className="emt-btn-save">
              Save
            </button>
          </div>

          <p className="emt-info">
            <strong>Total Machines:</strong> {selectedItem.totalMachines}
          </p>

          <table className="emt-table">
            <thead className="emt-thead">
              <tr>
                <th className="emt-th">Machine Name</th>
                <th className="emt-th">Size X</th>
                <th className="emt-th">Size Y</th>
                <th className="emt-th">Size Z</th>
              </tr>
            </thead>
            <tbody>
              {selectedItem.machines.map((m, idx) => (
                <tr key={idx}>
                  <td className="emt-td">{m.name}</td>
                  <td className="emt-td">{m.x}</td>
                  <td className="emt-td">{m.y}</td>
                  <td className="emt-td">{m.z}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EditMachineType;