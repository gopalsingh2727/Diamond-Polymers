




const SeeAllBranchAndEdit =()=>{
    return(
        <div>heloo</div>
    )
}



export default SeeAllBranchAndEdit



// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   listBranches,
//   updateBranch,
// } from "../../../../redux/create/branch/branchActions";
// import { RootState } from "../../../../redux/rootReducer";

// interface Branch {
//   _id: string;
//   name: string;
//   code: string;
//   location: string;
//   createdAt: string;
// }

// const AllSeeBranchAndEdit: React.FC = () => {
//   const dispatch = useDispatch();

//   const { branches = [], loading, error } = useSelector(
//     (state: RootState) => state.branchList || {}
//   );
//   const { success: updateSuccess } = useSelector(
//     (state: RootState) => state.branchUpdate || {}
//   );

//   const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
//   const [editForm, setEditForm] = useState({
//     name: "",
//     code: "",
//     location: "",
//   });

//   useEffect(() => {
//     dispatch(listBranches());
//   }, [dispatch, updateSuccess]);

//   const openEditor = (branch: Branch) => {
//     setSelectedBranch(branch);
//     setEditForm({
//       name: branch.name,
//       code: branch.code,
//       location: branch.location,
//     });
//   };

//   const handleEditChange = (field: keyof typeof editForm, value: string) => {
//     setEditForm({ ...editForm, [field]: value });
//   };

//   const handleUpdate = () => {
//     if (!selectedBranch) return;

//     if (!editForm.name.trim() || !editForm.code.trim() || !editForm.location.trim()) {
//       alert("❌ All fields are required");
//       return;
//     }

//     dispatch(
//       updateBranch(selectedBranch._id, {
//         name: editForm.name.trim(),
//         code: editForm.code.trim(),
//         location: editForm.location.trim(),
//       })
//     );

//     setSelectedBranch(null);
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Branch List</h2>

//       {loading && <p>Loading...</p>}
//       {error && <p className="text-red-600">{error}</p>}

//       {!selectedBranch ? (
//         <table className="w-full border">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border p-2">Name</th>
//               <th className="border p-2">Code</th>
//               <th className="border p-2">Location</th>
//               <th className="border p-2">Created At</th>
//               <th className="border p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {branches.map((branch: Branch) => (
//               <tr key={branch._id}>
//                 <td className="border p-2">{branch.name}</td>
//                 <td className="border p-2">{branch.code}</td>
//                 <td className="border p-2">{branch.location}</td>
//                 <td className="border p-2">
//                   {new Date(branch.createdAt).toLocaleString()}
//                 </td>
//                 <td className="border p-2">
//                   <button
//                     className="bg-blue-500 text-white px-3 py-1 rounded"
//                     onClick={() => openEditor(branch)}
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
//           <h3 className="text-lg font-bold mb-3">Edit Branch</h3>

//           <label className="block mb-1">Branch Name</label>
//           <input
//             value={editForm.name}
//             onChange={(e) => handleEditChange("name", e.target.value)}
//             className="border p-2 w-full mb-3"
//           />

//           <label className="block mb-1">Branch Code</label>
//           <input
//             value={editForm.code}
//             onChange={(e) => handleEditChange("code", e.target.value)}
//             className="border p-2 w-full mb-3"
//           />

//           <label className="block mb-1">Location</label>
//           <input
//             value={editForm.location}
//             onChange={(e) => handleEditChange("location", e.target.value)}
//             className="border p-2 w-full mb-3"
//           />

//           <div className="flex gap-3 mt-4">
//             <button
//               onClick={handleUpdate}
//               className="bg-green-600 text-white px-4 py-2 rounded"
//             >
//               Save
//             </button>
//             <button
//               onClick={() => setSelectedBranch(null)}
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

// export default AllSeeBranchAndEdit;