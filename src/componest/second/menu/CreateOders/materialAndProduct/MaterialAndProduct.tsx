import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import "./materialAndProduct.css";
import Data from "../../../../allCompones/date";
import PrintOrder from './print';
// ================ Type Definitions ================
type Product = {
  name: string;
  code: string;
  price: string;
};

type Material = {
  materialType: string;
  materialName: string;
  totalWeight: string;
  onePieceWeight: string;
  totalPieces: string;
};

type StepEntry = {
  stepname: string;
  steps: {
    MachineType: string;
    MachineName: string;
    SizeX: string;
    SizeY: string;
    SizeZ: string;
    OptereName: string;
  }[];
};

type MixMaterial = {
  name: string;
  type: string;
  weight: number;
  percentage: number | string;
};

type SavedMixingData = {
  data: MixMaterial[];
  totalWeight: string;
  loss: string;
};

// ================ Initial Data ================
const stepData: StepEntry[] = [
  {
    stepname: "q213",
    steps: [
      {
        MachineType: "Create",
        MachineName: "Sk32.3",
        SizeX: "10",
        SizeY: "20",
        SizeZ: "30",
        OptereName: "Operator A"
      },
      {
        MachineType: "Print",
        MachineName: "Print32.3",
        SizeX: "15",
        SizeY: "25",
        SizeZ: "35",
        OptereName: "Operator B"
      }
    ]
  }
];

const productSuggestions: string[] = [
  "Shirt", "Pants", "Jacket", "Saree", "T-shirt",
  "Kurti", "Jeans", "Sweater", "Dress", "Blazer",
];

// const materialSuggestions: string[] = [
//   "Cotton", "Silk", "Wool", "Polyester", "Denim",
//   "Linen", "Rayon", "Georgette", "Velvet", "Chiffon"
// ];

// ================ Main Component ================
const MaterialAndProduct: React.FC = () => {
  // ================ State Declarations ================
  // Common
  const [selectedOption, setSelectedOption] = useState<string>("");
  
  // Size fields
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [gauge, setGauge] = useState("");

const [isPrinting, setIsPrinting] = useState(false);
const [orderDate, setOrderDate] = useState('');

useEffect(() => {
  const generateOrderId = () => {
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, "");
    setOrderDate(format(date, 'MMMM dd, yyyy')); // Store formatted date
    const random = Math.floor(100 + Math.random() * 900);
    return `ORD-${formattedDate}-${random}`;
  };
  setOrderId(generateOrderId());
}, []);
const handlePrint = () => {
  setIsPrinting(true);
  setTimeout(() => {
    window.print();
    setIsPrinting(false);
  }, 100);
};



  // Material fields
  const [materialName, setMaterialName] = useState("");
  const [totalWeight, setTotalWeight] = useState("");
  const [materiaType, setmaterialType] = useState("");
  const [onePieceWeight, setOnePieceWeight] = useState("");

  // Print work
  const [printWork, setPrintWork] = useState("");
  // const  setSelectedImage  = useState<File | null>(null);
  
  // UI state
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showPrintSelect, setShowPrintSelect] = useState(false);
  const [showStepContainer, setShowStepContainer] = useState(false);

  // Step management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStep, setSelectedStep] = useState<StepEntry | null>(null);
  const [savedStep, setSavedStep] = useState<StepEntry | null>(null);
  const [showStepPopup, setShowStepPopup] = useState(false);

  // Notes
  const [note, setNote] = useState("");

  // Product management
  const [products, setProducts] = useState<Product[]>([{ name: "", code: "", price: "" }]);
  const [productSuggestionsList, setProductSuggestionsList] = useState<string[]>([]);
  const [activeProductIndex, setActiveProductIndex] = useState<number>(-1);
  const [showProductPopup, setShowProductPopup] = useState<boolean>(false);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const productInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Material management
  // const [materialInput, setMaterialInput] = useState("");
  // const [materialSuggestionsList, setMaterialSuggestionsList] = useState<string[]>([]);
  // const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  // const [materials, setMaterials] = useState<Material[]>([]);
  // const [isEditing, setIsEditing] = useState(false);
  // const [editIndex, setEditIndex] = useState<number | null>(null);
  // const [showNext, setShowNext] = useState(false);
  const [formState, setFormState] = useState<Material>({
    materialType: '',
    materialName: '',
    totalWeight: '',
    onePieceWeight: '',
    totalPieces: '',
  });
  
  // Dimension units
  const [dimensionUnit, setDimensionUnit] = useState("mm");
  const [gaugeUnit, setGaugeUnit] = useState("gauge");

  // Bag features
  const [showBottomGusset, setShowBottomGusset] = useState(false);
  const [showFlap, setShowFlap] = useState(false);
  const [showAirHole, setShowAirHole] = useState(false);
  const [bottomGusset, setBottomGusset] = useState('');
  const [flap, setFlap] = useState('');
  const [airHole, setAirHole] = useState('');

  // Customer data
  const [customerData, setCustomerData] = useState({
    name: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
  });

  // Order ID
  const [orderId, setOrderId] = useState("");

  // Mixing management (FIXED)
  const [mixing, setMixing] = useState("no");
  const [showMixingPopup, setShowMixingPopup] = useState(false);
  const [mixMaterials, setMixMaterials] = useState<MixMaterial[]>([]);
  const [savedMixing, setSavedMixing] = useState<SavedMixingData | null>(null);
  // const materialInputRef = useRef<HTMLInputElement>(null);

  // ================ Effects ================
  // Generate order ID
  useEffect(() => {
    const generateOrderId = () => {
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, "");
      const random = Math.floor(100 + Math.random() * 900);
      return `ORD-${formattedDate}-${random}`;
    };
    setOrderId(generateOrderId());
  }, []);

  // Show material section when size is filled
  useEffect(() => {
    if (width && height && gauge) {
      setShowCreateProduct(true);
    } else {
      setShowCreateProduct(false);
      setShowPrintSelect(false);
      setShowStepContainer(false);
    }
  }, [width, height, gauge]);




// Inside your MaterialAndProduct component






















  // Show print section when material is filled
  useEffect(() => {
    if (materiaType && materialName && totalWeight) {
      setShowPrintSelect(true);
    } else {
      setShowPrintSelect(false);
      setShowStepContainer(false);
    }
  }, [materiaType, materialName, totalWeight]);

  // ================ Helper Functions ================
  // Filter step suggestions
  const suggestions = stepData.filter((step) =>
    step.stepname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================ Event Handlers ================
  // Handle option selection
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  // Handle print work change
  const handleChangePrint = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrintWork(e.target.value);
    setShowStepContainer(e.target.value === "no");
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      
      setShowStepContainer(true);
    }
  };

  // Step handling functions
  const handleSelect = (step: StepEntry) => {
    setSelectedStep({ ...step });
    setShowStepPopup(true);
  };

  const handleSaveStep = () => {
    if (selectedStep) {
      setSavedStep({ ...selectedStep });
    }
    setShowStepPopup(false);
  };

  const handleEditStep = () => {
    if (savedStep) {
      setSelectedStep({ ...savedStep });
      setShowStepPopup(true);
    }
  };

  // Product management
  const handleProductInputChange = (value: string, index: number) => {
    const updated = [...products];
    updated[index].name = value;
    setProducts(updated);
    setProductSuggestionsList(
      value
        ? productSuggestions.filter((p) => p.toLowerCase().includes(value.toLowerCase()))
        : []
    );
    setActiveProductIndex(-1);
    setPopupIndex(index);
  };

// Add this state variable to your component
const [savedMixingData, setSavedMixingData] = useState(null);

// const saveMixing = () => {
//   // Save the current mixing data
//   const savedData = {
//     materials: [...mixMaterials], // Copy all materials
//     loss: loss, // Save the loss value
//     totalWeight: mixMaterials.reduce((sum, mat) => sum + (mat.weight || 0), 0),
//     savedAt: new Date().toLocaleString()
//   };
  
//   setSavedMixingData(savedData);
//   setShowMixingPopup(false);
  
//   console.log('Saved Mixing Data:', savedData); // For debugging
// };


  const handleProductKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (productSuggestionsList.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveProductIndex((prev) => (prev + 1) % productSuggestionsList.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveProductIndex((prev) =>
          (prev - 1 + productSuggestionsList.length) % productSuggestionsList.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeProductIndex >= 0) {
          selectProductSuggestion(productSuggestionsList[activeProductIndex], index);
        } else {
          setPopupIndex(index);
          setShowProductPopup(true);
        }
      }
    } else if (e.key === "Enter") {
      setPopupIndex(index);
      setShowProductPopup(true);
    }
  };

  const selectProductSuggestion = (value: string, index: number) => {
    const updated = [...products];
    updated[index].name = value;
    setProducts(updated);
    setProductSuggestionsList([]);
    setActiveProductIndex(-1);
  };

  const handlePopupSave = (index: number, updatedData: Product) => {
    const updated = [...products];
    updated[index] = updatedData;
    setProducts(updated);
    setShowProductPopup(false);
    setPopupIndex(null);
    productInputRefs.current[index]?.focus();
  };

  // Material management
  // useEffect(() => {
  //   if (materialInput.trim() === "") {
  //     setMaterialSuggestionsList([]);
  //     return;
  //   }

  //   const filtered = materialSuggestions.filter((suggestion) =>
  //     suggestion.toLowerCase().includes(materialInput.toLowerCase())
  //   );
  //   setMaterialSuggestionsList(filtered);
  //   setSelectedSuggestionIndex(-1);
  // }, [materialInput]);

  // const handleMaterialInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setMaterialInput(e.target.value);
  //   setFormState((prev) => ({ ...prev, materialName: e.target.value }));
  // };

  // const handleMaterialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "ArrowDown") {
  //     e.preventDefault();
  //     setSelectedSuggestionIndex((prev) =>
  //       Math.min(prev + 1, materialSuggestionsList.length - 1)
  //     );
  //   } else if (e.key === "ArrowUp") {
  //     e.preventDefault();
  //     setSelectedSuggestionIndex((prev) => Math.max(prev - 1, 0));
  //   } else if (e.key === "Enter" && selectedSuggestionIndex !== -1) {
  //     const selected = materialSuggestionsList[selectedSuggestionIndex];
  //     setMaterialInput(selected);
  //     setFormState((prev) => ({ ...prev, materialName: selected }));
  //     setMaterialSuggestionsList([]);
  //   }
  // };

  // const handleSuggestionClick = (suggestion: string) => {
  //   setMaterialInput(suggestion);
  //   setFormState((prev) => ({ ...prev, materialName: suggestion }));
  //   setMaterialSuggestionsList([]);
  // };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // const handleAddOrUpdateMaterial = () => {
  //   if (!formState.materialName.trim()) return;

  //   if (isEditing && editIndex !== null) {
  //     const updated = [...materials];
  //     updated[editIndex] = formState;
  //     setMaterials(updated);
  //   } else {
  //     setMaterials((prev) => [...prev, formState]);
  //   }

  //   setFormState({ 
  //     materialType: '',
  //     materialName: "", 
  //     totalWeight: "", 
  //     totalPieces: "", 
  //     onePieceWeight: "" 
  //   });
  //   setMaterialInput("");
  //   setIsEditing(false);
  //   setEditIndex(null);
  //   setMaterialSuggestionsList([]);
  //   setShowNext(true);
  //   materialInputRef.current?.focus();
  // };

  // const handleEdit = (index: number) => {
  //   const mat = materials[index];
  //   setFormState(mat);
  //   setMaterialInput(mat.materialName);
  //   setIsEditing(true);
  //   setEditIndex(index);
  //   materialInputRef.current?.focus();
  // };

  // Customer data handling
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  // Mixing functions (FIXED)
  const openMixPopup = () => {
    const initialWeight = parseFloat(totalWeight) || 0;
    setMixMaterials([
      {
        name: materialName,
        type: materiaType,
        weight: initialWeight,
        percentage: 100,
      },
    ]);
    setShowMixingPopup(true);
  };

  const handleMixingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMixing(value);
    if (value === "yes") {
      openMixPopup();
    } else if (value === "no") {
      setSavedMixing(null); // Clear saved mixing if no is selected
    }
  };

  const handleMixChange = (
    index: number, 
    key: keyof MixMaterial, 
    value: string | number
  ) => {
    const updated = [...mixMaterials];
    updated[index] = { ...updated[index], [key]: value };
    setMixMaterials(updated);
  };

  const handleAddRow = () => {
    setMixMaterials([
      ...mixMaterials,
      { name: "", type: "", weight: 0, percentage: 0 },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...mixMaterials];
    updated.splice(index, 1);
    setMixMaterials(updated);
  };

  const calculatePercentages = () => {
    const total = mixMaterials.reduce((sum, mat) => sum + mat.weight, 0);
    return mixMaterials.map((mat) => ({
      ...mat,
      percentage: total > 0 ? ((mat.weight / total) * 100).toFixed(2) : "0",
    }));
  };

  // FIXED saveMixing function
  const saveMixing = () => {
    const updatedMaterials = calculatePercentages();
    const totalMixedWeight = updatedMaterials.reduce((sum, mat) => sum + mat.weight, 0);
    const originalWeight = parseFloat(totalWeight) || 0;
    const loss = originalWeight > 0 ? (originalWeight - totalMixedWeight).toFixed(2) : "0";
    
    setSavedMixing({
      data: updatedMaterials,
      totalWeight,
      loss,
    });
    
    setShowMixingPopup(false);
  };

  const editMixing = () => {
    if (savedMixing) {
      setMixMaterials(savedMixing.data);
      setShowMixingPopup(true);
    }
  };

  const totalMixedWeight = mixMaterials.reduce((sum, mat) => sum + mat.weight, 0);
  const originalWeight = parseFloat(totalWeight) || 0;
  const loss = originalWeight > 0 ? (originalWeight - totalMixedWeight).toFixed(2) : "0";

  // ================ Render ================
  return (
    <div className="createProductCssw">
      <div>
        <div>
          <div className="OrderIDanddata">
            <label className="OrderIDCreate">
              <h3>Order ID: {orderId}</h3>
            </label>
            <Data />
          </div>

          <div className="CreateOrdersForm">
            <div>
              <input
                name="name"
                className="CurstomerNameInput"
                value={customerData.name}
                onChange={handleCustomerChange}
                type="text"
                placeholder="Enter Customer Name"
              />
            </div>
            <div>
              <input
                name="address"
                className="CurstomerAddressInput"
                value={customerData.address}
                onChange={handleCustomerChange}
                type="text"
                placeholder="Enter Customer Address"
              />
            </div>
            <input
              name="phone"
              className="CurstomerInput"
              value={customerData.phone}
              onChange={handleCustomerChange}
              type="tel"
              placeholder="Phone Number"
            />
            <input
              name="whatsapp"
              className="CurstomerInput"
              value={customerData.whatsapp}
              onChange={handleCustomerChange}
              type="tel"
              placeholder="WhatsApp Number"
            />
            <input
              name="email"
              className="CurstomerInput"
              value={customerData.email}
              onChange={handleCustomerChange}
              type="email"
              placeholder="Email"
            />
          </div>
        </div>
      </div>
      
      <div className="SeleteType">
        <label htmlFor="myDropdown">Choose a type:</label>
        <select id="myDropdown" onChange={handleChange}>
          <option value="">-- Select --</option>
          <option value="product">Product</option>
          <option value="material">Material</option>
        </select>
       
        {selectedOption === 'material' && (
          <div className="bottomGussetSelectandflapandAriHole">
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showBottomGusset}
                  onChange={(e) => setShowBottomGusset(e.target.checked)}
                />
                Bottom Gusset
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showFlap}
                  onChange={(e) => setShowFlap(e.target.checked)}
                />
                Flap
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showAirHole}
                  onChange={(e) => setShowAirHole(e.target.checked)}
                />
                Air Hole
              </label>
            </div>
          </div>
        )}
      </div>

      {selectedOption === "material" && (
        <div>
          <div className="materialInputs">
            
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div className="divRow">
                <label>Width</label>
                <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="Enter Width"
                className="inputBox"
              />
              </div>
              <div className="divRow">
                <label>Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Enter Height"
                className="inputBox"
              />
              </div>

               <div className="divRow">
              <label>Measurement</label>
                  <select 
                id="myDropdown" 
             
                value={dimensionUnit} 
                onChange={(e) => setDimensionUnit(e.target.value)}
              >
                <option value="mm">mm</option>
                <option value="inch">inch</option>
              </select>
               </div>

              <div className="divRow">
              <label>Thickness</label>
              <input
                type="text"
                value={gauge}
                onChange={(e) => setGauge(e.target.value)}
                placeholder="Enter Gauge/Micron"
                className="inputBox"
              />
              </div>
              <div className="divRow">
                   <select 
                value={gaugeUnit}  
                id="myDropdown"  
                onChange={(e) => setGaugeUnit(e.target.value)}
              >
                <option value="gauge">gauge</option>
                <option value="micron">micron</option>
              </select>
              </div>
            
            </div>

            
            
             
        


            {showBottomGusset && (
            <div className="divRow">
              <label>Bottom Gusset</label>
              <input
                type="number"
                value={bottomGusset}
                onChange={(e) => setBottomGusset(e.target.value)}
                placeholder="Enter Bottom Gusset"
                className="inputBox"
              />
            </div>
          )} 
          {showFlap && (
            <div className="divRow">
              <label>Flap</label>
              <input
                type="number"
                value={flap}
                onChange={(e) => setFlap(e.target.value)}
                placeholder="Enter Flap"
                className="inputBox"
              />
            </div>
          )}
           {showAirHole && (
            <div className="divRow">
              <label>Air Hole</label>
              <input
                type="number"
                value={airHole}
                onChange={(e) => setAirHole(e.target.value)}
                placeholder="Enter Air Hole"
                className="inputBox"
              />
            </div>
          )}

          </div>

          

        

         
          
           
         

          {showCreateProduct && (
            <div className="createProductCss">
              <div className="materialForm">
                <div>
                  <label>Material Type</label>
                  <input
                    type="text"
                    value={materiaType}
                    onChange={(e) => setmaterialType(e.target.value)}
                    placeholder="Material Type"
                    className="inputBox"
                  />
                </div>
                <div>
                  <label>Material Name</label>
                  <input
                    type="text"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="Material Name"
                    className="inputBox"
                  />
                </div>
                <div> 
                  <label>Total Weight (kg)</label>
                  <input
                    type="text"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(e.target.value)}
                    placeholder="Total Weight"
                    className="inputBox"
                  />
                </div>
                <div>
                  <label>One Piece Weight</label>
                  <input
                    type="text"
                    value={onePieceWeight}
                    onChange={(e) => setOnePieceWeight(e.target.value)}
                    placeholder="One Piece Weight"
                    className="inputBox"
                  />
                </div>
                <div>
                  <label>Total Pieces</label>
                  <input
                    type="text"
                    value={formState.totalPieces}
                    name="totalPieces"
                    onChange={handleFormChange}
                    placeholder="Total Pieces"
                    className="inputBox"
                  />
                </div>
                <div>
                  <label>Mixing</label>
                  <select 
                    value={mixing}
                    onChange={handleMixingChange}
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

            
              {savedMixing && (
                <div className="savedMixingDisplay" onDoubleClick={editMixing}>
                   <div className="mixingTable">
                   
                      
                    <div className="mixingLoss">
                      <strong>Total Loss: {savedMixing.loss} kg</strong>
                    </div>
                  </div>
                  <p><em>Double-click to edit</em></p>
                </div>
              )}
            </div>
          )}
{showMixingPopup && (
  <div className="popup-overlay">
    <div className="popup">
      <div className="popup-content">
        <h3>Mixing Materials</h3>
        <div className="headerRow">
          <span>Name</span>
          <span>Type</span>
          <span>Weight (kg)</span>
          <span>%</span>
          <span>Action</span>
        </div>
        {mixMaterials.map((mat, i) => (
          <div key={i} className="popupitemall">
            <input
              type="text"
              value={mat.name}
              onChange={(e) => handleMixChange(i, "name", e.target.value)}
              placeholder="Material Name"
            />
            <input
              type="text"
              value={mat.type}
              onChange={(e) => handleMixChange(i, "type", e.target.value)}
              placeholder="Material Type"
            />
            <input
              type="number"
              value={mat.weight}
              onChange={(e) => handleMixChange(i, "weight", parseFloat(e.target.value) || 0)}
              placeholder="Weight"
            />
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {typeof mat.percentage === 'number' ? mat.percentage.toFixed(2) : mat.percentage}%
            </span>
            {i !== 0 ? (
              <button
                onClick={() => handleRemoveRow(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#ff4444',
                  padding: '5px'
                }}
                title="Remove Row"
              >
                ✕
              </button>
            ) : (
              <span></span>
            )}
          </div>
        ))}
        
        <button
          onClick={handleAddRow}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Add Row
        </button>
        
        <div className="loss">Loss: {loss} kg</div>
        
        <div className="popupButtons">
          <button onClick={saveMixing} className="saveButton">
            Save
          </button>
          <button onClick={() => setShowMixingPopup(false)} className="cancelButton">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Saved Mixing Data Display */}
{savedMixingData && (
  <div className="section-result" onDoubleClick={() => setShowMixingPopup(true)}>
    <div className="savedStepDisplay">
      <div className="stepHeaderRow">
        <strong>#</strong>
        <strong>Material Name</strong>
        <strong>Material Type</strong>
        <strong>Weight (kg)</strong>
        <strong>Percentage (%)</strong>
      </div>
      {savedMixingData.materials.map((material, index) => (
        <div key={index} className="stepRow">
          <span>{index + 1}</span>
          <span>{material.name}</span>
          <span>{material.type}</span>
          <span>{material.weight}</span>
          <span>{typeof material.percentage === 'number' ? material.percentage.toFixed(2) : material.percentage}%</span>
        </div>
      ))}
      <div className="stepRow" style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
        <span></span>
        <span>Total Loss:</span>
        <span></span>
        <span>{savedMixingData.Loss} kg</span>
        <span></span>
      </div>
    </div>
    <div className="Configured-Step">
      <h4>✓ Mixing Materials Configured</h4>
    </div>
  </div>
)}
          {showPrintSelect && (
            <div className="printSection">
              <div className="printForm">
                <label htmlFor="printSelect" className="printSelectLabel">Print:</label>
                <select 
                  id="printSelect" 
                  value={printWork} 
                  onChange={handleChangePrint}
                >
                  <option value="">-- Select --</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>

                {printWork === "yes" && (
                  <div className="imageUpload">
                    <input 
                      type="file" 
                      id="printImage" 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
                  </div>
                )}

                {printWork === "no" && (
                  <div className="noPrintMessage">
                    <p>✓ No print work selected. Ready to proceed to next step.</p>
                  </div>
                )}
              </div>
            </div>
          )}

       {showStepContainer && (
            <div className="container12">
              <h3>Manufacturing Steps:</h3>

              {!savedStep && (
                <div className="section search">
                  <label htmlFor="searchInput">Step Name:</label>
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Enter step name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="inputBox"
                  />
                  {suggestions.length > 0 && (
                    <ul className="suggestion-list">
                      {suggestions.slice(0, 5).map((step, idx) => (
                        <li 
                          key={idx} 
                          onClick={() => handleSelect(step)} 
                          className="suggestionItem"
                        >
                          📋 {step.stepname}
                        </li>
                      ))}
                    </ul>
                  )}
                  {searchTerm && suggestions.length === 0 && (
                    <div className="noResults">
                      <p>No steps found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              )}

              {showStepPopup && selectedStep && (
                <div className="popup-overlay">
                  <div className="popup">
                    <div className="popup-content">
                      <h3>Configure Step: {selectedStep.stepname}</h3>
                      <div className="headerRow">
                        <span>Machine Type</span>
                        <span>Machine Name</span>
                        <span>Size X</span>
                        <span>Size Y</span>
                        <span>Size Z</span>
                        <span>Operator Name</span>
                        <span>Action</span>
                      </div>
                      {selectedStep.steps.map((step, index) => (
                        <div key={index} className="popupitemall">
                          <input
                            type="text"
                            value={step.MachineType}
                            onChange={(e) => {
                              const updated = { ...selectedStep };
                              updated.steps[index].MachineType = e.target.value;
                              setSelectedStep({ ...updated });
                            }}
                            placeholder="Machine Type"
                          />
                          <input
                            type="text"
                            value={step.MachineName}
                            onChange={(e) => {
                              const updated = { ...selectedStep };
                              updated.steps[index].MachineName = e.target.value;
                              setSelectedStep({ ...updated });
                            }}
                            placeholder="Machine Name"
                          />
                          <input
                            type="text"
                            value={step.SizeX}
                            onChange={(e) => {
                              const updated = { ...selectedStep };
                              updated.steps[index].SizeX = e.target.value;
                              setSelectedStep({ ...updated });
                            }}
                            placeholder="Size X"
                          />
                          <input
                            type="text"
                            value={step.SizeY}
                            onChange={(e) => {
                              const updated = { ...selectedStep };
                              updated.steps[index].SizeY = e.target.value;
                              setSelectedStep({ ...updated });
                            }}
                            placeholder="Size Y"
                          />
                          <input
                            type="text"
                            value={step.SizeZ}
                            onChange={(e) => {
                              const updated = { ...selectedStep };
                              updated.steps[index].SizeZ = e.target.value;
                              setSelectedStep({ ...updated });
                            }}
                            placeholder="Size Z"
                          />
                          <input
                            type="text"
                            value={step.OptereName}
                            onChange={(e) => {
                              const updated = { ...selectedStep };
                              updated.steps[index].OptereName = e.target.value;
                              setSelectedStep({ ...updated });
                            }}
                            placeholder="Operator Name"
                          />
                          <button
                            onClick={() => {
                              const updated = { ...selectedStep };
                              updated.steps.splice(index, 1);
                              setSelectedStep({ ...updated });
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '18px',
                              cursor: 'pointer',
                              color: '#ff4444',
                              padding: '5px'
                            }}
                            title="Remove Row"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => {
                          const updated = { ...selectedStep };
                          updated.steps.push({
                            MachineType: '',
                            MachineName: '',
                            SizeX: '',
                            SizeY: '',
                            SizeZ: '',
                            OptereName: ''
                          });
                          setSelectedStep({ ...updated });
                        }}
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        + Add Row
                      </button>

                      <div className="popupButtons">
                        <button onClick={handleSaveStep} className="saveButton">
                          Save
                        </button>
                        <button 
                          onClick={() => setShowStepPopup(false)} 
                          className="cancelButton"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {savedStep && (
                <div className="section-result" onDoubleClick={handleEditStep}>
                  <div className="savedStepDisplay">
                    <div className="stepHeaderRow">
                      <strong>#</strong>
                      <strong>Machine Type</strong>
                      <strong>Machine Name</strong>
                      <strong>Size X</strong>
                      <strong>Size Y</strong>
                      <strong>Size Z</strong>
                      <strong>Operator Name</strong>
                    </div>
                    {savedStep.steps.map((step, index) => (
                      <div key={index} className="stepRow">
                        <span>{index + 1}</span>
                        <span>{step.MachineType}</span>
                        <span>{step.MachineName}</span>
                        <span>{step.SizeX}</span>
                        <span>{step.SizeY}</span>
                        <span>{step.SizeZ}</span>
                        <span>{step.OptereName}</span>
                      </div>
                    ))}
                  </div>
                  <div className="Configured-Step">
                    <h4>✓Configured Step: {savedStep.stepname}</h4>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedOption === "product" && (
        <div className="productInput">
          <h3>Product Details</h3>
          {products.map((product, index) => (
            <div key={index} className="product-row">
              <input
                ref={(el) => (productInputRefs.current[index] = el)}
                type="text"
                value={product.name}
                placeholder="Product name"
                onChange={(e) => handleProductInputChange(e.target.value, index)}
                onKeyDown={(e) => handleProductKeyDown(e, index)}
                onFocus={() => setProductSuggestionsList([])}
              />
              {productSuggestionsList.length > 0 && index === popupIndex && (
                <ul className="suggestion-box">
                  {productSuggestionsList.map((s, i) => (
                    <li
                      key={i}
                      className={i === activeProductIndex ? "active" : ""}
                      onMouseDown={() => selectProductSuggestion(s, index)}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {showProductPopup && popupIndex !== null && (
            <div className="popup">
              <h4>Edit Product</h4>
              <label>
                Code:
                <input
                  value={products[popupIndex].code}
                  onChange={(e) =>
                    setProducts((prev) => {
                      const updated = [...prev];
                      updated[popupIndex].code = e.target.value;
                      return updated;
                    })
                  }
                />
              </label>
              <label>
                Price:
                <input
                  value={products[popupIndex].price}
                  onChange={(e) =>
                    setProducts((prev) => {
                      const updated = [...prev];
                      updated[popupIndex].price = e.target.value;
                      return updated;
                    })
                  }
                />
              </label>
              <button onClick={() => handlePopupSave(popupIndex, products[popupIndex])}>
                Save
              </button>
              <button onClick={() => setShowProductPopup(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}

      <div className="CreateOrdersFooter">
        <div className="Notes">
          <h3>Notes</h3>
          <textarea
            placeholder="Write your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="NotesTextarea "
            rows={4}
          />
        </div>
      </div>
         
      <div className="CreateOrdersFooterbuttom">
        <button className="CreateOrdersButton " onClick={() => window.print()}>Save Orders</button>
      </div>

      <div>
        {isPrinting && (
  <PrintOrder
    orderId={orderId}
    date={orderDate}
    customerData={customerData}
    selectedOption={selectedOption}
    materialData={{
      width,
      height,
      gauge,
      dimensionUnit,
      gaugeUnit,
      materialType: materiaType,
      materialName,
      totalWeight,
      onePieceWeight,
      totalPieces: formState.totalPieces,
      mixing,
      savedMixing,
      printWork,
      savedStep,
      bottomGusset: showBottomGusset ? bottomGusset : undefined,
      flap: showFlap ? flap : undefined,
      airHole: showAirHole ? airHole : undefined
    }}
    products={products}
    note={note}
  />
)}
      </div>
    </div>
  );
};

export default MaterialAndProduct;