




const AllSeeMangerAndEdit = () =>{
    return(
        <div>
s 
        </div>
    )
}



export default AllSeeMangerAndEdit;




// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   listManagers,
//   updateManager,
// } from "../../../../redux/create/manager/managerActions";
// import { RootState } from "../../../../redux/rootReducer";

// interface Manager {
//   _id: string;
//   username: string;
//   createdAt: string;
//   branchId: {
//     _id: string;
//     name: string;
//   };
// }

// const AllSeeManagerAndEdit: React.FC = () => {
//   const dispatch = useDispatch();

//   const { managers = [], loading, error } = useSelector(
//     (state: RootState) => state.managerList || {}
//   );
//   const { success: updateSuccess } = useSelector(
//     (state: RootState) => state.managerUpdate || {}
//   );

//   const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
//   const [editForm, setEditForm] = useState({
//     username: "",
//     password: "",
//   });

//   useEffect(() => {
//     dispatch(listManagers());
//   }, [dispatch, updateSuccess]);

//   const openEditor = (manager: Manager) => {
//     setSelectedManager(manager);
//     setEditForm({
//       username: manager.username,
//       password: "",
//     });
//   };

//   const handleEditChange = (field: "username" | "password", value: string) => {
//     setEditForm({ ...editForm, [field]: value });
//   };

//   const handleUpdate = () => {
//     if (!selectedManager) return;

//     if (!editForm.username.trim()) {
//       alert("❌ Username is required");
//       return;
//     }

//     dispatch(
//       updateManager(selectedManager._id, {
//         username: editForm.username.trim(),
//         password: editForm.password.trim(), // optional
//       })
//     );

//     setSelectedManager(null);
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Managers</h2>

//       {loading && <p>Loading...</p>}
//       {error && <p className="text-red-600">{error}</p>}

//       {!selectedManager ? (
//         <table className="w-full border">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border p-2">Username</th>
//               <th className="border p-2">Branch</th>
//               <th className="border p-2">Created At</th>
//               <th className="border p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {managers.map((manager: Manager) => (
//               <tr key={manager._id}>
//                 <td className="border p-2">{manager.username}</td>
//                 <td className="border p-2">{manager.branchId?.name || "-"}</td>
//                 <td className="border p-2">
//                   {new Date(manager.createdAt).toLocaleString()}
//                 </td>
//                 <td className="border p-2">
//                   <button
//                     className="bg-blue-500 text-white px-3 py-1 rounded"
//                     onClick={() => openEditor(manager)}
//                   >
//                     Edit
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <div className="bg-white p-4 rounded shadow-md max-w-md">
//           <h3 className="text-lg font-bold mb-3">Edit Manager</h3>

//           <label className="block mb-1">Username</label>
//           <input
//             value={editForm.username}
//             onChange={(e) => handleEditChange("username", e.target.value)}
//             className="border p-2 w-full mb-3"
//           />

//           <label className="block mb-1">New Password</label>
//           <input
//             type="password"
//             value={editForm.password}
//             onChange={(e) => handleEditChange("password", e.target.value)}
//             className="border p-2 w-full mb-3"
//             placeholder="Leave empty to keep current"
//           />

//           <div className="flex gap-3 mt-4">
//             <button
//               onClick={handleUpdate}
//               className="bg-green-600 text-white px-4 py-2 rounded"
//             >
//               Save
//             </button>
//             <button
//               onClick={() => setSelectedManager(null)}
//               className="bg-gray-500 text-white px-4 py-2 rounded"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllSeeManagerAndEdit;