import React, { useState, useEffect } from "react";
import MaterialSuggestions from "../SuggestionInput/MaterialSuggestions";
import '../materialAndProduct/materialAndProduct.css';
import PrintImage from "../printoptions";

type MixMaterial = {
  name: string;
  type: string;
  weight: number;
  percentage: number;
};

type SavedMixingData = {
  data: MixMaterial[];
  loss: number;
};

type MaterialFormData = {
  materialType: string;
  materialName: string;
  width: string;
  height: string;
  gauge: string;
  totalWeight: string;
  onePieceWeight: string;
  totalPieces: string;
};

interface MaterialInOdersProps {
  showBottomGusset: boolean;
  showFlap: boolean;
  showAirHole: boolean;
}

type Material = {
  materialType: string;
  materialName: string;
  totalWeight: string;
  onePieceWeight: string;
  totalPieces: string;
  weight: number;
  percentage: number;
};

type MixingRowProps = {
  mat: MixMaterial;
  index: number;
  onMixChange: (index: number, key: keyof MixMaterial, value: string | number) => void;
  onRemove: (index: number) => void;
  isFirst: boolean;
};

const MixingRow = ({ mat, index, onMixChange, onRemove, isFirst }: MixingRowProps) => {
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  const handleNameSuggestionSelect = (data: any) => {
    console.log('Name suggestion selected:', data); // Debug log
    
    
    if (data.materialName) {
      onMixChange(index, "name", data.materialName);
    }
    
    // Update material type if provided
    if (data.materialTypeName) {
      onMixChange(index, "type", data.materialTypeName);
    }
    
    setShowNameSuggestions(false);
  };

  const handleTypeSuggestionSelect = (data: any) => {
    console.log('Type suggestion selected:', data); // Debug log
    
    if (data.materialTypeName) {
      onMixChange(index, "type", data.materialTypeName);
    }
    
    setShowTypeSuggestions(false);
  };
  

  return (
    <div className="popupitemall">
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={mat.type}
          onChange={(e) => onMixChange(index, "type", e.target.value)}
          placeholder="Material Type"
          readOnly={isFirst}
          onFocus={() => !isFirst && setShowTypeSuggestions(true)}
          onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
        />
        {!isFirst && (
          <MaterialSuggestions
            materialName={mat.type}
            onSelect={handleTypeSuggestionSelect}
            suggestionType="type"
            showSuggestions={showTypeSuggestions && mat.type.length > 0}
          />
        )}
      </div>
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={mat.name}
          onChange={(e) => onMixChange(index, "name", e.target.value)}
          placeholder="Material Name"
          readOnly={isFirst}
          onFocus={() => !isFirst && setShowNameSuggestions(true)}
          onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
        />
        {!isFirst && (
          <MaterialSuggestions
            materialName={mat.name}
            onSelect={handleNameSuggestionSelect}
            suggestionType="name"
            selectedMaterialType={mat.type}
            showSuggestions={showNameSuggestions && mat.name.length > 0}
          />
        )}
      </div>
      
      <input
        type="number"
        value={mat.weight}
        onChange={(e) => onMixChange(index, "weight", parseFloat(e.target.value) || 0)}
        placeholder="Weight"
      />
      <input
        type="number"
        value={mat.percentage}
        onChange={(e) => onMixChange(index, "percentage", parseFloat(e.target.value) || 0)}
        placeholder="Percentage"
      />
      {!isFirst && (
        <button
          onClick={() => onRemove(index)}
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
      )}
    </div>
  );
};

const MaterialInOders: React.FC<MaterialInOdersProps> = ({
  showBottomGusset,
  showFlap,
  showAirHole,
}) => {
  // Material form data state
  const [materialValues, setMaterialValues] = useState<MaterialFormData>({
    materialType: '',
    materialName: '',
    width: '',
    height: '',
    gauge: '',
    totalWeight: '',
    onePieceWeight: '',
    totalPieces: '',
  });

  const [dimensionUnit, setDimensionUnit] = useState("mm");
  const [gaugeUnit, setGaugeUnit] = useState("gauge");

  // Bag features
  const [bottomGusset, setBottomGusset] = useState('');
  const [flap, setFlap] = useState('');
  const [airHole, setAirHole] = useState('');

  // Material form states
  const [materialData, setMaterialData] = useState({ category: '', mol: 0});
  const [materialName, setMaterialName] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [onePieceWeight, setOnePieceWeight] = useState('');

  // Mixing states
  const [mixing, setMixing] = useState("no");
  const [showMixingPopup, setShowMixingPopup] = useState(false);
  const [mixMaterials, setMixMaterials] = useState<MixMaterial[]>([]);
  const [savedMixing, setSavedMixing] = useState<SavedMixingData | null>(null);
  const [loss] = useState(0);

  const [formState, setFormState] = useState<Material>({
    materialType: '',
    materialName: '',
    totalWeight: '',
    onePieceWeight: '',
    totalPieces: '',
    weight: 0,
    percentage: 0,
  });

  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  // Calculation functions
  const convertDimensionToMM = (value: number, unit: string): number => {
    if (unit === "inch") {
      return value * 25.4; // Convert inch to mm
    }
    return value; // Already in mm
  };

  const convertGaugeToMicron = (value: number, unit: string): number => {
    if (unit === "gauge") {
      return value / 4; 
    }
    return value; 
  };

  const calculateOneBagWeight = () => {
    const width = parseFloat(materialValues.width) || 0;
    const height = parseFloat(materialValues.height) || 0;
    const gauge = parseFloat(materialValues.gauge) || 0;
    const mol = materialData.mol || 0;
    
    console.log(mol , "this data");
    
    if (width === 0 || height === 0 || gauge === 0) return 0;

    
    const widthMM = convertDimensionToMM(width, dimensionUnit);
    const heightMM = convertDimensionToMM(height, dimensionUnit);
    
    // Convert gauge to micron
    const gaugeMicron = convertGaugeToMicron(gauge, gaugeUnit);

    // Calculate: OneBagWeight = W * L * Gauge / mol
    const oneBagWeight = (widthMM * heightMM * gaugeMicron / mol) ; 
    return oneBagWeight;
  };

  const calculateTotalWeight = () => {
    const totalPcs = parseFloat(formState.totalPieces) || 0;
    const oneBagWt = calculateOneBagWeight();
    
    if (totalPcs === 0 || oneBagWt === 0) return 0;
    
    // TotalWeight = TotalPcs * OneBagWeight
    return totalPcs * oneBagWt;
  };

  const calculateTotalPieces = () => {
    const totalWt = parseFloat(totalWeight) || 0;
    const oneBagWt = calculateOneBagWeight();
    
    if (totalWt === 0 || oneBagWt === 0) return 0;
    
    // TotalPcs = TotalWeight / OneBagWeight
    return Math.round(totalWt / oneBagWt);
  };

  // Auto-calculate when dependencies change
  useEffect(() => {
    const calculatedOneBagWeight = calculateOneBagWeight();
    setOnePieceWeight(calculatedOneBagWeight.toFixed(6));
  }, [materialValues.width, materialValues.height, materialValues.gauge, dimensionUnit, gaugeUnit, materialData.mol]);

  useEffect(() => {
    if (formState.totalPieces && !totalWeight) {
      const calculatedTotalWeight = calculateTotalWeight();
      setTotalWeight(calculatedTotalWeight.toFixed(3));
    }
  }, [formState.totalPieces, onePieceWeight]);

  useEffect(() => {
    if (totalWeight && !formState.totalPieces) {
      const calculatedTotalPieces = calculateTotalPieces();
      setFormState(prev => ({ ...prev, totalPieces: calculatedTotalPieces.toString() }));
    }
  }, [totalWeight, onePieceWeight]);


 
  // Recalculate when material changes (mol value changes)
  useEffect(() => {
    if (materialData.mol && materialValues.width && materialValues.height && materialValues.gauge) {
      const calculatedOneBagWeight = calculateOneBagWeight();
      setOnePieceWeight(calculatedOneBagWeight.toFixed(6));
      
      // Recalculate total weight if total pieces exists
      if (formState.totalPieces) {
        const calculatedTotalWeight = calculateTotalWeight();
        setTotalWeight(calculatedTotalWeight.toFixed(3));
      }
      
      // Recalculate total pieces if total weight exists
      if (totalWeight) {
        const calculatedTotalPieces = calculateTotalPieces();
        setFormState(prev => ({ ...prev, totalPieces: calculatedTotalPieces.toString() }));
      }
    }
  }, [materialData.mol]);

  // Check if all required fields are filled
  const isAllDataFilled = () => {
    return (
      materialData.category.trim() !== '' &&
      materialName.trim() !== '' &&
      totalWeight.trim() !== '' &&
      formState.totalPieces.trim() !== ''
    );
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleMixingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMixing(value);
    
    if (value === "yes") {
      setMixMaterials([
        {
          name: materialName,
          type: materialData.category,
          weight: 0,
          percentage: 0
        }
      ]);
      setShowMixingPopup(true);
    } else if (value === "no") {
     
      setMixMaterials([]);
      setSavedMixing(null);
      setShowMixingPopup(false);
    }
  };

const handleCategorySelect = (selectedMaterial: any) => {
  console.log("Selected Material:", selectedMaterial);

  if (selectedMaterial.materialName) {
    if (selectedMaterial.materialMol !== undefined) {
      console.log("Selected materialMol:", selectedMaterial.materialMol);
    } else {
      console.warn("No materialMol found for selected material:", selectedMaterial.materialName);
    }

    setMaterialData(prev => ({
      ...prev,
      category: selectedMaterial.materialTypeName || '',
      mol: selectedMaterial.materialMol !== undefined ? selectedMaterial.materialMol : prev.mol,
    }));
    setMaterialName(selectedMaterial.materialName);
  } else {
    setMaterialData(prev => ({
      ...prev,
      category: selectedMaterial.materialTypeName,
    }));
  }
};




  const handleMixChange = (
    index: number,
    key: keyof MixMaterial,
    value: string | number
  ) => {
    console.log(`Updating mix material ${index}, ${key}:`, value); // Debug log
    
    setMixMaterials(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      console.log('Updated mix materials:', updated); // Debug log
      return updated;
    });
  };

  const handleAddRow = () => {
    setMixMaterials(prev => [...prev, { name: '', type: '', weight: 0, percentage: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    setMixMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const saveMixing = () => {
    console.log('Saving mixing data:', mixMaterials); // Debug log
    setSavedMixing({
      data: mixMaterials,
      loss
    });
    setShowMixingPopup(false);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaterialData(prev => ({
      ...prev,
      category: e.target.value,
    }));
  };

  return (
    <div>
      <div className="materialInputs">
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="divRow">
            <label>Width</label>
            <input
              type="text"
              value={materialValues.width}
              onChange={(e) => setMaterialValues(prev => ({ ...prev, width: e.target.value }))}
              placeholder="Enter Width"
              className="inputBox"
            />
          </div>
          <div className="divRow">
            <label>Height</label>
            <input
              type="text"
              value={materialValues.height}
              onChange={(e) => setMaterialValues(prev => ({ ...prev, height: e.target.value }))}
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
              value={materialValues.gauge}
              onChange={(e) => setMaterialValues(prev => ({ ...prev, gauge: e.target.value }))}
              placeholder="Enter Gauge/Micron"
              className="inputBox"
            />
          </div>
          <div className="divRow">
              <label>G/µm</label>
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

      <div className="createProductCss">
        <div className="materialForm">
          <div className="createProductCss">
            <div className="materialForm">
              <div>
                <label>Material Type</label>
                <input
                  type="text"
                  onChange={handleCategoryChange}
                  value={materialData.category}
                  placeholder="Material Type"
                  className="inputBox"
                  onFocus={() => setShowTypeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
                />
                <MaterialSuggestions
                  materialName={materialData.category}
                  onSelect={(data) => {
                    handleCategorySelect(data);
                    setShowTypeSuggestions(false);
                  }}
                  suggestionType="type"
                  showSuggestions={showTypeSuggestions && materialData.category.length > 0}
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
                  onFocus={() => setShowNameSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                />
                <MaterialSuggestions
                  materialName={materialName}
                  onSelect={(data) => {
                    handleCategorySelect(data);
                    setShowNameSuggestions(false);
                  }}
                  suggestionType="name"
                  selectedMaterialType={materialData.category}
                  showSuggestions={showNameSuggestions && materialName.length > 0 && materialData.category.length > 0}
                />
              </div>
            </div>
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
              readOnly
              style={{ backgroundColor: '#f5f5f5' }}
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
              id="myDropdown"
              onChange={handleMixingChange}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      {showMixingPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-content">
              <h3>Mixing Materials</h3>
              <div className="headerRowmaterialMixpop">
                <span>Type</span>
                <span>Name</span>
                <span>Weight (kg)</span>
                <span>%</span>
              </div>
              {mixMaterials.map((mat, i) => (
                <MixingRow
                  key={i}
                  mat={mat}
                  index={i}
                  onMixChange={handleMixChange}
                  onRemove={handleRemoveRow}
                  isFirst={i === 0}
                />
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

      {savedMixing && (
        <div className="SaveMixing">
          <div className="SaveMixingDisplay">
            <div className="SaveMixingHeaderRow">
              <strong>#</strong>
              <strong>Material Name</strong>
              <strong>Material Type</strong>
              <strong>Weight (kg)</strong>
              <strong>Percentage (%)</strong>
            </div>
            {savedMixing.data.map((material, index) => (
              <div key={index} className="SaveMixingstepRow">
                <span>{index + 1}</span>
                <span>{material.name}</span>
                <span>{material.type}</span>
                <span>{material.weight.toFixed(2)}</span>
                <span>{material.percentage}%</span>
              </div>
            ))}
            <div className="stepRow" style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
              <span></span>
              <span>Total Loss:</span>
              <span></span>
              <span>{savedMixing.loss} kg</span>
              <span></span>
            </div>
          </div>
        </div>
      )}

     
      {isAllDataFilled() && <PrintImage />}
    </div>
  );
};

export default MaterialInOders;