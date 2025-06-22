




const SeeAllAdminAndEdit= ()=>{
    return(
        <div>

        </div>
    )
}



export default SeeAllAdminAndEdit


// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   listAdmins,
//   updateAdmin,
// } from "../../../../redux/create/admin/adminActions";
// import { RootState } from "../../../../redux/rootReducer";

// interface Admin {
//   _id: string;
//   username: string;
//   createdAt: string;
// }

// const SeeAllAdminAndEdit: React.FC = () => {
//   const dispatch = useDispatch();

//   const { admins = [], loading, error } = useSelector(
//     (state: RootState) => state.adminList || {}
//   );
//   const { success: updateSuccess } = useSelector(
//     (state: RootState) => state.adminUpdate || {}
//   );

//   const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
//   const [editForm, setEditForm] = useState({
//     username: "",
//     password: "",
//   });

//   useEffect(() => {
//     dispatch(listAdmins());
//   }, [dispatch, updateSuccess]);

//   const openEditor = (admin: Admin) => {
//     setSelectedAdmin(admin);
//     setEditForm({
//       username: admin.username,
//       password: "",
//     });
//   };

//   const handleEditChange = (field: "username" | "password", value: string) => {
//     setEditForm({ ...editForm, [field]: value });
//   };

//   const handleUpdate = () => {
//     if (!selectedAdmin) return;

//     if (!editForm.username.trim()) {
//       alert("❌ Username required");
//       return;
//     }

//     dispatch(
//       updateAdmin(selectedAdmin._id, {
//         username: editForm.username.trim(),
//         password: editForm.password.trim(), // may be empty
//       })
//     );

//     setSelectedAdmin(null);
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Admins</h2>

//       {loading && <p>Loading...</p>}
//       {error && <p className="text-red-600">{error}</p>}

//       {!selectedAdmin ? (
//         <table className="w-full border">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border p-2">Username</th>
//               <th className="border p-2">Created At</th>
//               <th className="border p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {admins.map((admin: Admin) => (
//               <tr key={admin._id}>
//                 <td className="border p-2">{admin.username}</td>
//                 <td className="border p-2">
//                   {new Date(admin.createdAt).toLocaleString()}
//                 </td>
//                 <td className="border p-2">
//                   <button
//                     className="bg-blue-500 text-white px-3 py-1 rounded"
//                     onClick={() => openEditor(admin)}
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
//           <h3 className="text-lg font-bold mb-3">Edit Admin</h3>

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
//               onClick={() => setSelectedAdmin(null)}
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

// export default SeeAllAdminAndEdit;