// import React, { useState, useEffect, useRef, ChangeEvent } from "react";
// import "./materialAndProduct.css";
// import Data from "../../../allCompones/date";
// type Product = {
//   name: string;
//   code: string;
//   price: string;
// };

// type Material = {
//   name: string;
//   totalWeight: string;
//   totalPieces: string;
//   onePiecesWeight: string;
// };

// type StepEntry = {
//   stepname: string;
//   steps: {
//     MachineType: string;
//     MachineName: string;
//     SizeX: string;
//     SizeY: string;
//     SizeZ: string;
//     OptereName: string
//   }[];
// };

// const stepData: StepEntry[] = [
//   {
//     stepname: "q213",
//     steps: [
//       {
//         MachineType: "Create",
//         MachineName: "Sk32.3",
//         SizeX: "10",
//         SizeY: "20",
//         SizeZ: "30",
//         OptereName: "Operator A" // 👈 Add operator name
//       },
//       {
//         MachineType: "Print",
//         MachineName: "Print32.3",
//         SizeX: "15",
//         SizeY: "25",
//         SizeZ: "35",
//         OptereName: "Operator B" // 👈 Add operator name
//       }
//     ]
//   }
// ];

// const productSuggestions: string[] = [
//   "Shirt", "Pants", "Jacket", "Saree", "T-shirt",
//   "Kurti", "Jeans", "Sweater", "Dress", "Blazer",
// ];

// const materialSuggestions: string[] = [
//   "Cotton", "Silk", "Wool", "Polyester", "Denim",
//   "Linen", "Rayon", "Georgette", "Velvet", "Chiffon"
// ];

// const MaterialAndProduct: React.FC = () => {
//   // Common
//   const [selectedOption, setSelectedOption] = useState<string>("");
  
//   // Size fields
//   const [width, setWidth] = useState("");
//   const [height, setHeight] = useState("");
//   const [gauge, setGauge] = useState("");

//   // Material fields for the simple form
//   const [materialName, setMaterialName] = useState("");
//   const [totalWeight, setTotalWeight] = useState("");
//   const [materiaType, setmaterialType] = useState("");
//   const [onePieceWeight, setOnePieceWeight] = useState("");

//   // Print work
//   const [printWork, setPrintWork] = useState("");
//   const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
//   // UI state
//   const [showCreateProduct, setShowCreateProduct] = useState(false);
//   const [showPrintSelect, setShowPrintSelect] = useState(false);
//   const [showStepContainer, setShowStepContainer] = useState(false);

//   // Step search and selection
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedStep, setSelectedStep] = useState<StepEntry | null>(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [savedStep, setSavedStep] = useState<StepEntry | null>(null);

//   // Notes
//   const [note, setNote] = useState("");

//   // Product States
//   const [products, setProducts] = useState<Product[]>([{ name: "", code: "", price: "" }]);
//   const [productSuggestionsList, setProductSuggestionsList] = useState<string[]>([]);
//   const [activeProductIndex, setActiveProductIndex] = useState<number>(-1);
//   const [showProductPopup, setShowProductPopup] = useState<boolean>(false);
//   const [popupIndex, setPopupIndex] = useState<number | null>(null);
//   const productInputRefs = useRef<Array<HTMLInputElement | null>>([]);

//   // Material States (for advanced material handling)
//   const [materialInput, setMaterialInput] = useState("");
//   const [materialSuggestionsList, setMaterialSuggestionsList] = useState<string[]>([]);
//   const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
//   const [materials, setMaterials] = useState<Material[]>([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editIndex, setEditIndex] = useState<number | null>(null);
//   const [showNext, setShowNext] = useState(false);
//   const [formState, setFormState] = useState<Material>({
//     name: "",
//     totalWeight: "",
//     totalPieces: "",
//     onePiecesWeight: ""
//   });
//   const materialInputRef = useRef<HTMLInputElement>(null);

//   // When size fields are filled, show material section
//   useEffect(() => {
//     if (width && height && gauge) {
//       setShowCreateProduct(true);
//     } else {
//       setShowCreateProduct(false);
//       setShowPrintSelect(false);
//       setShowStepContainer(false);
//     }
//   }, [width, height, gauge]);

//   // Show print section when material details are filled
//   useEffect(() => {
//     if (materiaType && materialName && totalWeight) {
//       setShowPrintSelect(true);
//     } else {
//       setShowPrintSelect(false);
//       setShowStepContainer(false);
//     }
//   }, [materiaType, materialName, totalWeight]);

//   // Step suggestions filter
//   const suggestions = stepData.filter((step) =>
//     step.stepname.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Select option handler
//   const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     setSelectedOption(e.target.value);
//   };

//   // Handle print work change
//   const handleChangePrint = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setPrintWork(e.target.value);
//     if (e.target.value === "no") {
//       setShowStepContainer(true);
//     } else {
//       setShowStepContainer(false);
//     }
//   };

//   // Handle file selection
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedImage(file);
//       setShowStepContainer(true);
//     }
//   };

//   // Step handling functions
//   const handleSelect = (step: StepEntry) => {
//     setSelectedStep({ ...step });
//     setShowPopup(true);
//   };

//   const handleSave = () => {
//     if (selectedStep) {
//       setSavedStep({ ...selectedStep });
//     }
//     setShowPopup(false);
//   };

//   const handleEdits = () => {
//     if (savedStep) {
//       setSelectedStep({ ...savedStep });
//       setShowPopup(true);
//     }
//   };

//   // =======================
//   // Product Logic
//   // =======================
//   const handleProductInputChange = (value: string, index: number) => {
//     const updated = [...products];
//     updated[index].name = value;
//     setProducts(updated);
//     setProductSuggestionsList(
//       value
//         ? productSuggestions.filter((p) => p.toLowerCase().includes(value.toLowerCase()))
//         : []
//     );
//     setActiveProductIndex(-1);
//     setPopupIndex(index);
//   };

//   const handleProductKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
//     if (productSuggestionsList.length) {
//       if (e.key === "ArrowDown") {
//         e.preventDefault();
//         setActiveProductIndex((prev) => (prev + 1) % productSuggestionsList.length);
//       } else if (e.key === "ArrowUp") {
//         e.preventDefault();
//         setActiveProductIndex((prev) =>
//           (prev - 1 + productSuggestionsList.length) % productSuggestionsList.length
//         );
//       } else if (e.key === "Enter") {
//         e.preventDefault();
//         if (activeProductIndex >= 0) {
//           selectProductSuggestion(productSuggestionsList[activeProductIndex], index);
//         } else {
//           setPopupIndex(index);
//           setShowProductPopup(true);
//         }
//       }
//     } else if (e.key === "Enter") {
//       setPopupIndex(index);
//       setShowProductPopup(true);
//     }
//   };

//   const selectProductSuggestion = (value: string, index: number) => {
//     const updated = [...products];
//     updated[index].name = value;
//     setProducts(updated);
//     setProductSuggestionsList([]);
//     setActiveProductIndex(-1);
//   };

//   const handlePopupSave = (index: number, updatedData: Product) => {
//     const updated = [...products];
//     updated[index] = updatedData;
//     setProducts(updated);
//     setShowProductPopup(false);
//     setPopupIndex(null);
//     productInputRefs.current[index]?.focus();
//   };

//   // =======================
//   // Material Logic (Advanced)
//   // =======================
//   useEffect(() => {
//     if (materialInput.trim() === "") {
//       setMaterialSuggestionsList([]);
//       return;
//     }

//     const filtered = materialSuggestions.filter((suggestion) =>
//       suggestion.toLowerCase().includes(materialInput.toLowerCase())
//     );
//     setMaterialSuggestionsList(filtered);
//     setSelectedSuggestionIndex(-1);
//   }, [materialInput]);

//   const handleMaterialInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setMaterialInput(e.target.value);
//     setFormState((prev) => ({ ...prev, name: e.target.value }));
//   };

//   const handleMaterialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setSelectedSuggestionIndex((prev) =>
//         Math.min(prev + 1, materialSuggestionsList.length - 1)
//       );
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setSelectedSuggestionIndex((prev) =>
//         Math.max(prev - 1, 0)
//       );
//     } else if (e.key === "Enter" && selectedSuggestionIndex !== -1) {
//       const selected = materialSuggestionsList[selectedSuggestionIndex];
//       setMaterialInput(selected);
//       setFormState((prev) => ({ ...prev, name: selected }));
//       setMaterialSuggestionsList([]);
//     }
//   };

//   const handleSuggestionClick = (suggestion: string) => {
//     setMaterialInput(suggestion);
//     setFormState((prev) => ({ ...prev, name: suggestion }));
//     setMaterialSuggestionsList([]);
//   };

//   const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormState((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleAddOrUpdateMaterial = () => {
//     if (!formState.name.trim()) return;

//     if (isEditing && editIndex !== null) {
//       const updated = [...materials];
//       updated[editIndex] = formState;
//       setMaterials(updated);
//     } else {
//       setMaterials((prev) => [...prev, formState]);
//     }

//     setFormState({ name: "", totalWeight: "", totalPieces: "", onePiecesWeight: "" });
//     setMaterialInput("");
//     setIsEditing(false);
//     setEditIndex(null);
//     setMaterialSuggestionsList([]);
//     setShowNext(true);
//     materialInputRef.current?.focus();
//   };

//   const handleEdit = (index: number) => {
//     const mat = materials[index];
//     setFormState(mat);
//     setMaterialInput(mat.name);
//     setIsEditing(true);
//     setEditIndex(index);
//     materialInputRef.current?.focus();
//   };

//   // =======================
//    const [customerData, setCustomerData] = useState({
//     name: '',
//     address: '',
//     phone: '',
//     whatsapp: '',
//     email: '',
//   });

//   const handleChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setCustomerData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = () => {
//     const customerArray = Object.values(customerData);
//     console.log('Customer Array:', customerArray);
//   };

//   const [orderId, setOrderId] = useState("");

//   useEffect(() => {
//     const generateOrderId = () => {
//       const date = new Date();
//       const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, "");
//       const random = Math.floor(100 + Math.random() * 900);
//       return `ORD-${formattedDate}-${random}`;
//     };

//     setOrderId(generateOrderId());
//   }, []);

//   // =======================
//   return (
//     <div className="createProductCssw">
//       <div>
//         <div>
//       <div className="OrderIDanddata">
//         <label className="OrderIDCreate">
//           <h3>Order ID: {orderId}</h3>
//         </label>
//         <Data />
//       </div>

//       <div className="CreateOrdersForm">
//         <div>
//           <input
//             name="name"
//             className="CurstomerNameInput"
//             value={customerData.name}
//             onChange={handleChanges}
//             type="text"
//             placeholder="Enter Customer Name"
//           />
//         </div>
//         <div>
//           <input
//             name="address"
//             className="CurstomerAddressInput"
//             value={customerData.address}
//             onChange={handleChanges}
//             type="text"
//             placeholder="Enter Customer Address"
//           />
//         </div>
//         <input
//           name="phone"
//           className="CurstomerInput"
//           value={customerData.phone}
//           onChange={handleChanges}
//           type="tel"
//           placeholder="Phone Number"
//         />
//         <input
//           name="whatsapp"
//           className="CurstomerInput"
//           value={customerData.whatsapp}
//           onChange={handleChanges}
//           type="tel"
//           placeholder="WhatsApp Number"
//         />
//         <input
//           name="email"
//           className="CurstomerInput"
//           value={customerData.email}
//           onChange={handleChanges}
//           type="email"
//           placeholder="Email"
//         />
//       </div>

    
//     </div>
//       </div>
//       <div className="SeleteType">
//         <label htmlFor="myDropdown">Choose an type:</label>
//          <select id="myDropdown" onChange={handleChange}>
//         <option value="">-- Select --</option>
//         <option value="product">Product</option>
//         <option value="material">Material</option>
//       </select>
//       </div>

//       {selectedOption === "material" && (
//         <div>
//           <div className="materialInputs">
//             <div className="label">W x H x Gauge</div>
//             <input
//               type="text"
//               value={width}
//               onChange={(e) => setWidth(e.target.value)}
//               placeholder="Enter Product Width"
//               className="inputBox"
//             />
//             <input
//               type="text"
//               value={height}
//               onChange={(e) => setHeight(e.target.value)}
//               placeholder="Enter Product Height"
//               className="inputBox"
//             />
//             <input
//               type="text"
//               value={gauge}
//               onChange={(e) => setGauge(e.target.value)}
//               placeholder="Enter Product Gauge"
//               className="inputBox"
//             />
//           </div>

//           {showCreateProduct && (
//             <div className="createProductCss">
  
//               <div className="materialForm">
//                 <div>
//                   <label>Material Type</label>
//                   <input
//                     type="text"
//                     value={materiaType}
//                     onChange={(e) => setmaterialType(e.target.value)}
//                     placeholder="Material Type (e.g., Cotton, Silk)"
//                     className="inputBox"
//                   />
//                 </div>
//                 <div>
//                   <label>Material Name</label>
//                   <input
//                     type="text"
//                     value={materialName}
//                     onChange={(e) => setMaterialName(e.target.value)}
//                     placeholder="Material Name (e.g., Cotton, Silk)"
//                     className="inputBox"
//                   />
//                 </div>
//                 <div> 
//                   <label>Weight</label>
//                   <input
//                     type="text"
//                     value={totalWeight}
//                     onChange={(e) => setTotalWeight(e.target.value)}
//                     placeholder="Total Weight"
//                     className="inputBox"
//                   />
//                 </div>
//                 <div>
//                   <label>One Piece Weight</label>
//                   <input
//                     type="text"
//                     value={onePieceWeight}
//                     onChange={(e) => setOnePieceWeight(e.target.value)}
//                     placeholder="One Piece Weight"
//                     className="inputBox"
//                   />
//                 </div>
//               </div>

//               {/* Display filled material data */}
//               {/* {materiaType && materialName && totalWeight && (
//                 <div className="materialDataDisplay">
//                   <h4>Material Information:</h4>
//                   <div className="dataRow">
//                     <span><strong>Type:</strong> {materiaType}</span>
//                   </div>
//                   <div className="dataRow">
//                     <span><strong>Name:</strong> {materialName}</span>
//                   </div>
//                   <div className="dataRow">
//                     <span><strong>Weight:</strong> {totalWeight}</span>
//                   </div>
//                   {onePieceWeight && (
//                     <div className="dataRow">
//                       <span><strong>One Piece Weight:</strong> {onePieceWeight}</span>
//                     </div>
//                   )}
//                 </div>
//               )} */}
//             </div>
//           )}

//           {showPrintSelect && (
//             <div className="printSection">
       

//               <div className="printForm">
//                 <label htmlFor="printSelect" className="printSelectLabel">Print:</label>
//                 <select id="printSelect" value={printWork} onChange={handleChangePrint}>
//                   <option value="">-- Select --</option>
//                   <option value="yes">Yes</option>
//                   <option value="no">No</option>
//                 </select>

//                 {printWork === "yes" && (
//                   <div className="imageUpload">
               
//                     <input 
//                       type="file" 
//                       id="printImage" 
//                       accept="image/*" 
//                       onChange={handleFileChange}
//                     />
//                     {/* {selectedImage && (
//                       <div className="selectedImageInfo">
//                         <p>✓ Selected: {selectedImage.name}</p>
//                       </div>
//                     )} */}
//                   </div>
//                 )}

//                 {printWork === "no" && (
//                   <div className="noPrintMessage">
//                     <p>✓ No print work selected. Ready to proceed to next step.</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//          {showStepContainer && (
//   <div className="container12">
//     <h3>Manufacturing Steps:</h3>

//     {!savedStep && (
//       <div className="section search">
//         <label htmlFor="searchInput">Step Name:</label>
//         <input
//           id="searchInput"
//           type="text"
//           placeholder="Enter step name (e.g., q213)..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="inputBox"
//         />
//         {suggestions.length > 0 && (
//           <ul className="suggestion-list">
//             {suggestions.slice(0, 5).map((step, idx) => (
//               <li key={idx} onClick={() => handleSelect(step)} className="suggestionItem">
//                 📋 {step.stepname}
//               </li>
//             ))}
//           </ul>
//         )}
//         {searchTerm && suggestions.length === 0 && (
//           <div className="noResults">
//             <p>No steps found matching "{searchTerm}"</p>
//           </div>
//         )}
//       </div>
//     )}

//     {showPopup && selectedStep && (
//       <div className="popup-overlay">
//         <div className="popup">
          
//           <div className="popup-content">
//             <h3>Configure Step: {selectedStep.stepname}</h3>
//             <div className="headerRow">
//               <span>Machine Type</span>
//               <span>Machine Name</span>
//               <span>Size X</span>
//               <span>Size Y</span>
//               <span>Size Z</span>
//               <span>Operator Name</span> {/* New column */}
//             </div>
//             {selectedStep.steps.map((step, index) => (
//               <div key={index} className="popupitemall">
//                 <input
//                   type="text"
//                   value={step.MachineType}
//                   onChange={(e) => {
//                     const updated = { ...selectedStep };
//                     updated.steps[index].MachineType = e.target.value;
//                     setSelectedStep({ ...updated });
//                   }}
//                   placeholder="Machine Type"
//                 />
//                 <input
//                   type="text"
//                   value={step.MachineName}
//                   onChange={(e) => {
//                     const updated = { ...selectedStep };
//                     updated.steps[index].MachineName = e.target.value;
//                     setSelectedStep({ ...updated });
//                   }}
//                   placeholder="Machine Name"
//                 />
//                 <input
//                   type="text"
//                   value={step.SizeX}
//                   onChange={(e) => {
//                     const updated = { ...selectedStep };
//                     updated.steps[index].SizeX = e.target.value;
//                     setSelectedStep({ ...updated });
//                   }}
//                   placeholder="Size X"
//                 />
//                 <input
//                   type="text"
//                   value={step.SizeY}
//                   onChange={(e) => {
//                     const updated = { ...selectedStep };
//                     updated.steps[index].SizeY = e.target.value;
//                     setSelectedStep({ ...updated });
//                   }}
//                   placeholder="Size Y"
//                 />
//                 <input
//                   type="text"
//                   value={step.SizeZ}
//                   onChange={(e) => {
//                     const updated = { ...selectedStep };
//                     updated.steps[index].SizeZ = e.target.value;
//                     setSelectedStep({ ...updated });
//                   }}
//                   placeholder="Size Z"
//                 />
//                 <input
//                   type="text"
//                   value={step.OptereName}
//                   onChange={(e) => {
//                     const updated = { ...selectedStep };
//                     updated.steps[index].OptereName = e.target.value;
//                     setSelectedStep({ ...updated });
//                   }}
//                   placeholder="Operator Name"
//                 />
//               </div>
//             ))}
//              <div className="popupButtons">
//             <button onClick={handleSave} className="saveButton">Save</button>
//             <button onClick={() => setShowPopup(false)} className="cancelButton">Cancel</button>
//           </div>
//           </div>
         
//         </div>
//       </div>
//     )}

//     {savedStep && (
//   <div className="section-result" onDoubleClick={handleEdits}>
//     <div className="savedStepDisplay">
//   <div className="stepHeaderRow">
//     <strong>#</strong>
//     <strong>Machine Type</strong>
//     <strong>Machine Name</strong>
//     <strong>Size X</strong>
//     <strong>Size Y</strong>
//     <strong>Size Z</strong>
//     <strong>Operator Name</strong>
//   </div>

//   {savedStep.steps.map((step, index) => (
//     <div key={index} className="stepRow">
//       <span>{index + 1}</span>
//       <span>{step.MachineType}</span>
//       <span>{step.MachineName}</span>
//       <span>{step.SizeX}</span>
//       <span>{step.SizeY}</span>
//       <span>{step.SizeZ}</span>
//       <span>{step.OptereName}</span>
//     </div>
//   ))}
// </div>

//      <div className="Configured-Step">
//        <h4>✓Configured Step: {savedStep.stepname}</h4>
     
//      </div>
//   </div>
// )}
//   </div>
// )}
//         </div>
//       )}

//       {selectedOption === "product" && (
//         <div className="productInput">
//           <h3>Product Details</h3>
//           {products.map((product, index) => (
//             <div key={index} className="product-row">
//               <input
//                 ref={(el) => (productInputRefs.current[index] = el)}
//                 type="text"
//                 value={product.name}
//                 placeholder="Product name"
//                 onChange={(e) => handleProductInputChange(e.target.value, index)}
//                 onKeyDown={(e) => handleProductKeyDown(e, index)}
//                 onFocus={() => setProductSuggestionsList([])}
//               />
//               {productSuggestionsList.length > 0 && index === popupIndex && (
//                 <ul className="suggestion-box">
//                   {productSuggestionsList.map((s, i) => (
//                     <li
//                       key={i}
//                       className={i === activeProductIndex ? "active" : ""}
//                       onMouseDown={() => selectProductSuggestion(s, index)}
//                     >
//                       {s}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           ))}

//           {showProductPopup && popupIndex !== null && (
//             <div className="popup">
//               <h4>Edit Product</h4>
//               <label>
//                 Code:
//                 <input
//                   value={products[popupIndex].code}
//                   onChange={(e) =>
//                     setProducts((prev) => {
//                       const updated = [...prev];
//                       updated[popupIndex].code = e.target.value;
//                       return updated;
//                     })
//                   }
//                 />
//               </label>
//               <label>
//                 Price:
//                 <input
//                   value={products[popupIndex].price}
//                   onChange={(e) =>
//                     setProducts((prev) => {
//                       const updated = [...prev];
//                       updated[popupIndex].price = e.target.value;
//                       return updated;
//                     })
//                   }
//                 />
//               </label>
//               <button onClick={() => handlePopupSave(popupIndex, products[popupIndex])}>Save</button>
//               <button onClick={() => setShowProductPopup(false)}>Cancel</button>
//             </div>
//           )}
//         </div>
//       )}

//       <div>
        
//       </div>
//         <div className="CreateOrdersFooter">
//         <div className="Notes">
//           <h3>Notes</h3>
//           <textarea
//             placeholder="Write your note here..."
//             value={note}
//             onChange={(e) => setNote(e.target.value)}
//             className="NotesTextarea "
//             rows={4}
//           />

             
//         </div>
        
//       </div>

//       <div className="CreateOrdersFooterbuttom">
//         <button className="CreateOrdersButton ">Save Oders </button>
//       </div>
//     </div>
//   );
// };

// export default MaterialAndProduct;