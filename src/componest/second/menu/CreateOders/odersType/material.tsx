import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import MaterialSuggestions from "../SuggestionInput/MaterialSuggestions";
import '../materialAndProduct/materialAndProduct.css';
import PrintImage from "../printoptions";

type MixMaterial = {
  _id: string;
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
  id: string;
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
  initialData?: any;
  isEditMode?: boolean;
}

type Material = {
  id: string;
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

export type MaterialData = {
  mainMaterialId: string;
  materialTypeId: string; 
  materialType: string;
  materialName: string;
  width: string;
  height: string;
  gauge: string;
  totalWeight: string;
  onePieceWeight: string;
  totalPieces: string;
  dimensionUnit: string;
  gaugeUnit: string;
  bottomGusset: string;
  flap: string;
  airHole: string;
  mixing: string;
  mixingData: MixMaterial[];
};

const MixingRow = ({ mat, index, onMixChange, onRemove, isFirst }: MixingRowProps) => {
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  const handleNameSuggestionSelect = (data: any) => {
    const materialId = data._id || data.id || data.materialId || '';
    const materialName = data.materialName || data.name || '';
    const materialType = data.materialTypeName || data.typeName || data.materialType || data.type || '';
    
    if (materialId) onMixChange(index, "_id", materialId);
    if (materialName) onMixChange(index, "name", materialName);
    if (materialType) onMixChange(index, "type", materialType);
    
    setShowNameSuggestions(false);
  };

  const handleTypeSuggestionSelect = (data: any) => {
    const typeName = data.materialTypeName || data.typeName || data.name || '';
    if (typeName) onMixChange(index, "type", typeName);
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
          style={isFirst ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
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
          style={isFirst ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
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

const MaterialInOders = forwardRef((
  { showBottomGusset, showFlap, showAirHole, initialData, isEditMode }: MaterialInOdersProps,
  ref: React.ForwardedRef<{ getMaterialData: () => MaterialData }>
) => {
  const [materialValues, setMaterialValues] = useState<MaterialFormData>({
    id: '',
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
  const [bottomGusset, setBottomGusset] = useState('');
  const [flap, setFlap] = useState('');
  const [airHole, setAirHole] = useState('');
  const [materialData, setMaterialData] = useState({ category: '', mol: 0 });
  const [materialName, setMaterialName] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [onePieceWeight, setOnePieceWeight] = useState('');
  const [mixing, setMixing] = useState("no");
  const [showMixingPopup, setShowMixingPopup] = useState(false);
  const [mixMaterials, setMixMaterials] = useState<MixMaterial[]>([]);
  const [savedMixing, setSavedMixing] = useState<SavedMixingData | null>(null);
  const [loss] = useState(0);
  const [formState, setFormState] = useState<Material>({
    id: '',
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
  const [mainMaterialId, setMainMaterialId] = useState('');
  const [materialTypeId, setMaterialTypeId] = useState('');

  // FIXED: Enhanced initial data loading for edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      console.log('🔄 Loading material data for edit:', initialData);
      
      // Set material values with comprehensive mapping
      setMaterialValues({
        id: initialData.material?._id || initialData.materialId || '',
        materialType: initialData.material?.materialTypeName || initialData.materialType || '',
        materialName: initialData.material?.materialName || initialData.materialName || '',
        width: initialData.Width?.toString() || initialData.width || '',
        height: initialData.Height?.toString() || initialData.height || '',
        gauge: initialData.Thickness?.toString() || initialData.gauge || '',
        totalWeight: initialData.materialWeight?.toString() || initialData.totalWeight || '',
        onePieceWeight: initialData.onePieceWeight?.toString() || '',
        totalPieces: initialData.totalPieces?.toString() || '',
      });

      // Set other fields
      setDimensionUnit(initialData.dimensionUnit || 'mm');
      setGaugeUnit(initialData.gaugeUnit || 'gauge');
      setBottomGusset(initialData.BottomGusset?.toString() || initialData.bottomGusset?.toString() || '');
      setFlap(initialData.Flap?.toString() || initialData.flap?.toString() || '');
      setAirHole(initialData.AirHole?.toString() || initialData.airHole?.toString() || '');
      
      // Set material data
      setMaterialData({
        category: initialData.material?.materialTypeName || initialData.materialType || '',
        mol: initialData.material?.mol || 0
      });
      
      setMaterialName(initialData.material?.materialName || initialData.materialName || '');
      setTotalWeight(initialData.materialWeight?.toString() || initialData.totalWeight || '');
      setOnePieceWeight(initialData.onePieceWeight?.toString() || '');
      
      // Set form state
      setFormState({
        id: initialData._id || '',
        materialType: initialData.material?.materialTypeName || initialData.materialType || '',
        materialName: initialData.material?.materialName || initialData.materialName || '',
        totalWeight: initialData.materialWeight?.toString() || initialData.totalWeight || '',
        onePieceWeight: initialData.onePieceWeight?.toString() || '',
        totalPieces: initialData.totalPieces?.toString() || '',
        weight: 0,
        percentage: 0,
      });

      // Set IDs
      setMainMaterialId(initialData.material?._id || initialData.materialId || '');
      setMaterialTypeId(initialData.material?.materialType || initialData.materialTypeId || '');
      
      // Set mixing data if available
      if (initialData.mixMaterial && initialData.mixMaterial.length > 0) {
        setMixing('yes');
        setMixMaterials(initialData.mixMaterial);
        setSavedMixing({
          data: initialData.mixMaterial,
          loss: initialData.mixingLoss || 0
        });
      } else if (initialData.mixingData && initialData.mixingData.length > 0) {
        setMixing('yes');
        setMixMaterials(initialData.mixingData);
        setSavedMixing({
          data: initialData.mixingData,
          loss: initialData.mixingLoss || 0
        });
      }
    }
  }, [isEditMode, initialData]);

  const convertDimensionToMM = (value: number, unit: string): number => {
    if (unit === "inch") return value * 25.4;
    return value;
  };

  const convertGaugeToMicron = (value: number, unit: string): number => {
    if (unit === "gauge") return value / 4;
    return value;
  };

  const calculateOneBagWeight = (): number => {
    const width = parseFloat(materialValues.width) || 0;
    const height = parseFloat(materialValues.height) || 0;
    const gauge = parseFloat(materialValues.gauge) || 0;
    const mol = materialData.mol || 0;
    
    if (width === 0 || height === 0 || gauge === 0) return 0;

    const widthMM = convertDimensionToMM(width, dimensionUnit);
    const heightMM = convertDimensionToMM(height, dimensionUnit);
    const gaugeMicron = convertGaugeToMicron(gauge, gaugeUnit);

    return (widthMM * heightMM * gaugeMicron / mol);
  };

  const calculateTotalWeight = (): number => {
    const totalPcs = parseFloat(formState.totalPieces) || 0;
    const oneBagWt = calculateOneBagWeight();
    return totalPcs * oneBagWt;
  };

  const calculateTotalPieces = (): number => {
    const totalWt = parseFloat(totalWeight) || 0;
    const oneBagWt = calculateOneBagWeight();
    return oneBagWt ? Math.round(totalWt / oneBagWt) : 0;
  };

  useEffect(() => {
    if (!isEditMode) {
      const calculatedOneBagWeight = calculateOneBagWeight();
      setOnePieceWeight(calculatedOneBagWeight.toFixed(6));
    }
  }, [materialValues.width, materialValues.height, materialValues.gauge, dimensionUnit, gaugeUnit, materialData.mol, isEditMode]);

  useEffect(() => {
    if (!isEditMode && formState.totalPieces && !totalWeight) {
      const calculatedTotalWeight = calculateTotalWeight();
      setTotalWeight(calculatedTotalWeight.toFixed(3));
    }
  }, [formState.totalPieces, onePieceWeight, isEditMode]);

  useEffect(() => {
    if (!isEditMode && totalWeight && !formState.totalPieces) {
      const calculatedTotalPieces = calculateTotalPieces();
      setFormState(prev => ({ ...prev, totalPieces: calculatedTotalPieces.toString() }));
    }
  }, [totalWeight, onePieceWeight, isEditMode]);

  useEffect(() => {
    if (!isEditMode && materialData.mol && materialValues.width && materialValues.height && materialValues.gauge) {
      const calculatedOneBagWeight = calculateOneBagWeight();
      setOnePieceWeight(calculatedOneBagWeight.toFixed(6));
      
      if (formState.totalPieces) {
        const calculatedTotalWeight = calculateTotalWeight();
        setTotalWeight(calculatedTotalWeight.toFixed(3));
      }
      
      if (totalWeight) {
        const calculatedTotalPieces = calculateTotalPieces();
        setFormState(prev => ({ ...prev, totalPieces: calculatedTotalPieces.toString() }));
      }
    }
  }, [materialData.mol, isEditMode]);

  // Update mixing materials when main material changes
  useEffect(() => {
    if (mixing === "yes" && mainMaterialId && materialName && materialData.category && !isEditMode) {
      setMixMaterials(prev => {
        const updatedMaterials = [...prev];
        if (updatedMaterials.length > 0) {
          updatedMaterials[0] = {
            _id: mainMaterialId,
            name: materialName,
            type: materialData.category,
            weight: updatedMaterials[0].weight,
            percentage: updatedMaterials[0].percentage
          };
        }
        return updatedMaterials;
      });
    }
  }, [mainMaterialId, materialName, materialData.category, mixing, isEditMode]);

  const isAllDataFilled = (): boolean => {
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
      if (mainMaterialId && materialName && materialData.category) {
        if (!isEditMode || mixMaterials.length === 0) {
          setMixMaterials([
            {
              _id: mainMaterialId,
              name: materialName,
              type: materialData.category,
              weight: 0,
              percentage: 0
            }
          ]);
        }
        setShowMixingPopup(true);
      } else {
        alert('Please select a material first before enabling mixing');
        setMixing('no');
      }
    } else if (value === "no") {
      setMixMaterials([]);
      setSavedMixing(null);
      setShowMixingPopup(false);
    }
  };

  // FIXED Material Type Selection Handler
  const handleMaterialTypeSelect = (selectedMaterial: any) => {
    const typeId = selectedMaterial._id || selectedMaterial.materialTypeId || '';
    const typeName = selectedMaterial.materialTypeName || selectedMaterial.name || '';
    
    setMaterialTypeId(typeId);
    setMaterialData(prev => ({
      ...prev,
      category: typeName,
    }));
    setShowTypeSuggestions(false);
  };

  // FIXED Material Name Selection Handler
  const handleMaterialNameSelect = (selectedMaterial: any) => {
    const materialId = selectedMaterial._id || selectedMaterial.materialId || '';
    const typeId = selectedMaterial.materialTypeId || selectedMaterial.materialType || materialTypeId || '';
    const matName = selectedMaterial.materialName || selectedMaterial.name || '';
    const typeName = selectedMaterial.materialTypeName || materialData.category || '';
    const mol = selectedMaterial.materialMol || selectedMaterial.mol || 0;
    
    setMainMaterialId(materialId);
    if (typeId) setMaterialTypeId(typeId);
    setMaterialName(matName);
    setMaterialData({
      category: typeName,
      mol: mol,
    });
    setShowNameSuggestions(false);
  };

  const handleMixChange = (
    index: number,
    key: keyof MixMaterial,
    value: string | number
  ) => {
    setMixMaterials(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleAddRow = () => {
    setMixMaterials(prev => [...prev, { _id: '', name: '', type: '', weight: 0, percentage: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    setMixMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const saveMixing = () => {
    const mixingDataToSave = {
      data: mixMaterials,
      loss
    };
    
    setSavedMixing(mixingDataToSave);
    setShowMixingPopup(false);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaterialData(prev => ({
      ...prev,
      category: e.target.value,
    }));
  };

  const getMaterialData = () => {
    const data = {
      mainMaterialId: mainMaterialId,
      materialTypeId: materialTypeId,
      materialType: materialData.category,
      materialName: materialName,
      width: materialValues.width,
      height: materialValues.height,
      gauge: materialValues.gauge,
      totalWeight: totalWeight,
      onePieceWeight: onePieceWeight,
      totalPieces: formState.totalPieces,
      dimensionUnit: dimensionUnit,
      gaugeUnit: gaugeUnit,
      bottomGusset: bottomGusset,
      flap: flap,
      airHole: airHole,
      mixing: mixing,
      mixingData: savedMixing?.data || []
    };
    
    console.log('Getting Material Data:', data);
    return data;
  };

  // Expose data via ref
  useImperativeHandle(ref, () => ({
    getMaterialData: getMaterialData
  }));

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
              {/* Hidden inputs for IDs */}
              <input type="hidden" name="materialTypeId" value={materialTypeId} />
              <input type="hidden" name="mainMaterialId" value={mainMaterialId} />
              
              <div>
                <label>Material Type</label>
                <input
                  type="text"
                  onChange={handleCategoryChange}
                  value={materialData.category}
                  placeholder="Material Type"
                  className="inputBox"
                  onFocus={() => !isEditMode && setShowTypeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
                  readOnly={isEditMode}
                />
                {!isEditMode && (
                  <MaterialSuggestions
                    materialName={materialData.category}
                    onSelect={handleMaterialTypeSelect}
                    suggestionType="type"
                    showSuggestions={showTypeSuggestions && materialData.category.length > 0}
                  />
                )}
              </div>
              <div>
                <label>Material Name</label>
                <input
                  type="text"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder="Material Name"
                  className="inputBox"
                  onFocus={() => !isEditMode && setShowNameSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                  readOnly={isEditMode}
                />
                
                {!isEditMode && (
                  <MaterialSuggestions
                    materialName={materialName}
                    onSelect={handleMaterialNameSelect}
                    suggestionType="name"
                    selectedMaterialType={materialData.category}
                    showSuggestions={showNameSuggestions && materialName.length > 0 && materialData.category.length > 0}
                  />
                )}
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
              readOnly={!isEditMode}
              style={!isEditMode ? { backgroundColor: '#f5f5f5' } : {}}
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

   
    </div>
  );
});

export default MaterialInOders;