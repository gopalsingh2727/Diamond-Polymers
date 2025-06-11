// import React, { useEffect, useState, useCallback } from "react";
// import "./EditProductCategoris.css";
// import { useDispatch, useSelector } from "react-redux";
// import { getAllProductTypesWithProducts } from "../../../../redux/create/products/productCategories/productCategoriesActions";
// import { RootState } from "../../../../redux/rootReducer";
// import { AppDispatch } from "../../../../../store";

// interface Product {
//   _id: string;
//   productName: string;
//   price: number;
//   sizeX: number;
//   sizeY: number;
//   sizeZ: number;
// }

// interface ProductType {
//   _id: string;
//   productTypeName: string;
//   description: string;
//   products: Product[];
// }

// const EditProductCategories: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   const {
//     items: productTypes = [],
//     loading,
//     error,
//   } = useSelector((state: RootState) => state.productTypeWithProductsReducer || {});

//   const [selectedRow, setSelectedRow] = useState(0);
//   const [showDetail, setShowDetail] = useState(false);
//   const [editType, setEditType] = useState("");
//   const [editDescription, setEditDescription] = useState("");

//   const selectedItem = productTypes?.[selectedRow] || null;

//   const handleKeyDown = useCallback(
//     (e: KeyboardEvent) => {
//       if (showDetail || productTypes.length === 0) return;

//       if (e.key === "ArrowDown") {
//         setSelectedRow((prev) => Math.min(prev + 1, productTypes.length - 1));
//       } else if (e.key === "ArrowUp") {
//         setSelectedRow((prev) => Math.max(prev - 1, 0));
//       } else if (e.key === "Enter") {
//         const selected = productTypes[selectedRow];
//         if (selected) {
//           setEditType(selected.productTypeName);
//           setEditDescription(selected.description);
//           setShowDetail(true);
//         }
//       }
//     },
//     [productTypes, selectedRow, showDetail]
//   );

//   useEffect(() => {
//     dispatch(getAllProductTypesWithProducts());
//   }, [dispatch]);

//   useEffect(() => {
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [handleKeyDown]);

//   const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setEditType(e.target.value);
//   };

//   const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setEditDescription(e.target.value);
//   };

//   const handleEditSave = () => {
//     alert("Product Type updated! (not saved to DB)");
//   };

//   return (
//     <div className="EditMachineType">
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!showDetail && !loading && productTypes.length > 0 ? (
//         <table>
//           <thead>
//             <tr>
//               <th>No</th>
//               <th>Product Type</th>
//               <th>Total Products</th>
//               <th>Edit</th>
//             </tr>
//           </thead>
//           <tbody>
//             {productTypes.map((item, index) => (
//               <tr
//                 key={item._id}
//                 className={selectedRow === index ? "bg-blue-100" : ""}
//               >
//                 <td>{index + 1}</td>
//                 <td>{item.productTypeName}</td>
//                 <td>{item.products?.length ?? 0}</td>
//                 <td
//                   className="text-blue-600 emt-edit-text"
//                   onClick={() => {
//                     setSelectedRow(index);
//                     setEditType(item.productTypeName);
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
//             <button onClick={handleEditSave} className="Delete">Delete</button>
//           </div>

//           <div className="form-section">
//             <label>Product Type:</label>
//             <input type="text" value={editType} onChange={handleEditChange} />
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
//               editType === selectedItem.productTypeName &&
//               editDescription === selectedItem.description
//             }
//           >
//             Save
//           </button>

//           <div className="info-section">
//             <p>
//               <strong>Total Products:</strong>{" "}
//               {selectedItem?.products?.length ?? 0}
//             </p>
//           </div>

//           <table className="machine-details-table">
//             <thead>
//               <tr>
//                 <th>Product Name</th>
//                 <th>Price</th>
//                 <th>Size X</th>
//                 <th>Size Y</th>
//                 <th>Size Z</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedItem?.products.map((p) => (
//                 <tr key={p._id}>
//                   <td>{p.productName}</td>
//                   <td>{p.price}</td>
//                   <td>{p.sizeX}</td>
//                   <td>{p.sizeY}</td>
//                   <td>{p.sizeZ}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         !loading && <p>No product types available.</p>
//       )}
//     </div>
//   );
// };

// export default EditProductCategories;



const EditProductCategories: React.FC = () => {
  return (
    <div className="EditProductCategories">
      <h2>Edit Product Categories</h2>
      <p>This component is under construction.</p>
      {/* Future implementation will go here */}
    </div>
  );
}
export default EditProductCategories;
// import React, { useEffect, useState, useRef } from "react";
// import Headers from "../../../Headers";