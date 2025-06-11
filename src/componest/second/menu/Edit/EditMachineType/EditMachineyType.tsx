// import React, { useEffect, useState, useCallback } from "react";
// import "./EditMachineyType.css";
// import { useDispatch, useSelector } from "react-redux";
// import { getAllMachineTypes } from "../../../../redux/create/machineType/machineTypeActions";
// import { RootState } from "../../../../redux/rootReducer";
// import { AppDispatch } from "../../../../../store";

// // Update interface to match backend data
// interface Machine {
//   _id: string;
//   machineName: string;
//   sizeX: string;
//   sizeY: string;
//   sizeZ: string;
// }

// interface MachineType {
//   _id: string;
//   type: string;
//   description: string;
//   machines: Machine[];
// }

// const EditMachineType: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const {
//     items: machineTypes = [],
//     loading,
//     error,
//   } = useSelector((state: RootState) => state.machineTypeList || {});

//   const [selectedRow, setSelectedRow] = useState(0);
//   const [showDetail, setShowDetail] = useState(false);
//   const [editType, setEditType] = useState("");
//   const [editDescription, setEditDescription] = useState("");

//   const selectedItem = machineTypes[selectedRow];

//   const handleKeyDown = useCallback(
//     (e: KeyboardEvent) => {
//       if (showDetail || machineTypes.length === 0) return;

//       if (e.key === "ArrowDown") {
//         setSelectedRow((prev) => Math.min(prev + 1, machineTypes.length - 1));
//       } else if (e.key === "ArrowUp") {
//         setSelectedRow((prev) => Math.max(prev - 1, 0));
//       } else if (e.key === "Enter") {
//         const selected = machineTypes[selectedRow];
//         if (selected) {
//           setEditType(selected.type);
//           setEditDescription(selected.description);
//           setShowDetail(true);
//         }
//       }
//     },
//     [machineTypes, selectedRow, showDetail]
//   );

//   useEffect(() => {
//     dispatch(getAllMachineTypes());
//   }, [dispatch]);

//   useEffect(() => {
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [handleKeyDown]);

//   const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setEditType(e.target.value);
//   };

//   const handleDescriptionChange = (
//     e: React.ChangeEvent<HTMLTextAreaElement>
//   ) => {
//     setEditDescription(e.target.value);
//   };

//   const handleEditSave = () => {
//     if (!editType.trim()) {
//       alert("Type cannot be empty");
//       return;
//     }

//     // TODO: Add real update API logic
//     alert("Machine Type updated! (not saved to DB)");
//   };

//   return (
//     <div className="EditMachineType">
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!showDetail && !loading && machineTypes.length > 0 ? (
//         <table>
//           <thead>
//             <tr>
//               <th>No</th>
//               <th>Machine Type</th>
//               <th>Total Machines</th>
//               <th>Edit</th>
//             </tr>
//           </thead>
//           <tbody>
//             {machineTypes.map((item, index) => (
//               <tr
//                 key={item._id}
//                 className={selectedRow === index ? "bg-blue-100" : ""}
//               >
//                 <td>{index + 1}</td>
//                 <td>{item.type}</td>
//                 <td>{item.machines?.length ?? 0}</td>
//                 <td
//                   className="text-blue-600 emt-edit-text"
//                   onClick={() => {
//                     setSelectedRow(index);
//                     setEditType(item.type);
//                     setEditDescription(item.description);
//                     setShowDetail(true);
//                   }}
//                 >
//                   Edit
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : showDetail && selectedItem ? (
//         <div className="detail-container">
//           <div className="TopButtonEdit">
//             <button onClick={() => setShowDetail(false)}>Back</button>
//             <button onClick={handleEditSave} className="Delete">
//               Delete
//             </button>
//           </div>

//           <div className="form-section">
//             <label>Machine Type:</label>
//             <input
//               type="text"
//               value={editType}
//               onChange={handleEditChange}
//             />
//           </div>

//           <div className="form-section">
//             <label>Description:</label>
//             <textarea
//               value={editDescription}
//               onChange={handleDescriptionChange}
//               rows={3}
//             />
//           </div>

//           <button
//             onClick={handleEditSave}
//             className="save-button"
//             disabled={
//               editType === selectedItem.type &&
//               editDescription === selectedItem.description
//             }
//           >
//             Save
//           </button>

//           <div className="info-section">
//             <p>
//               <strong>Total Machines:</strong>{" "}
//               {selectedItem?.machines?.length ?? 0}
//             </p>
//           </div>

//           <table className="machine-details-table">
//             <thead>
//               <tr>
//                 <th>Machine Name</th>
//                 <th>Size X</th>
//                 <th>Size Y</th>
//                 <th>Size Z</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedItem?.machines.map((m, idx) => (
//                 <tr key={idx}>
//                   <td>{m.machineName}</td>
//                   <td>{m.sizeX}</td>
//                   <td>{m.sizeY}</td>
//                   <td>{m.sizeZ}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         !loading && <p>No machine types available.</p>
//       )}
//     </div>
//   );
// };

// export default EditMachineType;


const EditMachineType: React.FC = () => {
  return (
    <div className="EditMachineType">
      <h2>Edit Machine Type</h2>
      <p>This component is under construction.</p>
      {/* Placeholder for future content */}
    </div>
  );
}
export default EditMachineType;