import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useDispatch } from "react-redux";
import OptimizedSuggestions from "../SuggestionInput/OptimizedSuggestions";
import '../materialAndProduct/materialAndProduct.css';

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

// Dimension type from backend
type Dimension = {
  name: string;
  value: any;
  unit?: string;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  formula?: string;
  isCalculated?: boolean;
};

// Material spec type
type MaterialSpec = {
  _id: string;
  specName: string;
  materialTypeId: string;
  mol?: number;
  weightPerPiece?: number;
  density?: number;
  dimensions: Dimension[];
  description?: string;
};

interface MaterialInOdersProps {
  initialData?: any;
  isEditMode?: boolean;
  showBottomGusset?: boolean;
  showFlap?: boolean;
  showAirHole?: boolean;
  sectionConfig?: any;
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
  materialSpecId: string;
  materialType: string;
  materialName: string;
  totalWeight: string;
  onePieceWeight: string;
  totalPieces: string;
  mixing: string;
  mixingData: MixMaterial[];
  specificationValues: { [key: string]: any };
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
          <OptimizedSuggestions
            searchTerm={mat.type}
            onSelect={handleTypeSuggestionSelect}
            suggestionType="materialType"
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
          <OptimizedSuggestions
            searchTerm={mat.name}
            onSelect={handleNameSuggestionSelect}
            suggestionType="materialName"
            filterBy={mat._id}
            showSuggestions={showNameSuggestions && mat.name.length > 0 && mat.type.length > 0}
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
  { initialData, isEditMode }: MaterialInOdersProps,
  ref: React.ForwardedRef<{ getMaterialData: () => MaterialData }>
) => {
  const dispatch = useDispatch<AppDispatch>();

  const [materialData, setMaterialData] = useState({ category: '' });
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

  // Material specifications state
  const [materialSpec, setMaterialSpec] = useState<MaterialSpec | null>(null);
  const [materialSpecId, setMaterialSpecId] = useState('');
  const [loadingSpec, setLoadingSpec] = useState(false);
  const [specificationValues, setSpecificationValues] = useState<{ [key: string]: any }>({});

  // Load initial data for edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      console.log('🔄 Loading material data for edit:', initialData);
      
      setMaterialData({
        category: initialData.material?.materialTypeName || initialData.materialType || ''
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

  // Load material specifications when material type changes
  useEffect(() => {
    const loadMaterialSpec = async () => {
      // Only load if materialTypeId exists, not in edit mode, and specs not already loaded
      if (materialTypeId && !isEditMode && !materialSpec) {
        setLoadingSpec(true);
        try {
          const specs = await dispatch(getMaterialSpecsByMaterialType(materialTypeId));
          if (specs && specs.length > 0) {
            const spec = specs[0]; // Use first spec for this material type
            setMaterialSpec(spec);
            setMaterialSpecId(spec._id);
            // Initialize specification values from spec dimensions
            const initialValues = spec.dimensions.reduce((acc: any, dim: Dimension) => {
              acc[dim.name] = dim.value || '';
              return acc;
            }, {});
            // Add built-in properties
            if (spec.mol) initialValues.mol = spec.mol;
            if (spec.weightPerPiece) initialValues.weightPerPiece = spec.weightPerPiece;
            if (spec.density) initialValues.density = spec.density;
            setSpecificationValues(initialValues);
            console.log('✅ Loaded material spec:', spec.specName, 'with', spec.dimensions.length, 'dimensions');
          } else {
            setMaterialSpec(null);
            setMaterialSpecId('');
            setSpecificationValues({});
            console.log('⚠️ No specification found for material type');
          }
        } catch (error) {
          console.error('❌ Error loading material spec:', error);
          setMaterialSpec(null);
          setMaterialSpecId('');
          setSpecificationValues({});
        } finally {
          setLoadingSpec(false);
        }
      } else if (!materialTypeId) {
        setMaterialSpec(null);
        setMaterialSpecId('');
        setSpecificationValues({});
      }
    };

    loadMaterialSpec();
  }, [materialTypeId, dispatch, isEditMode, materialSpec]);

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

  // Material Type Selection Handler
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

  // Material Name Selection Handler
  const handleMaterialNameSelect = (selectedMaterial: any) => {
    const materialId = selectedMaterial._id || selectedMaterial.materialId || '';
    const typeId = selectedMaterial.materialTypeId || selectedMaterial.materialType || materialTypeId || '';
    const matName = selectedMaterial.materialName || selectedMaterial.name || '';
    const typeName = selectedMaterial.materialTypeName || materialData.category || '';
    
    setMainMaterialId(materialId);
    if (typeId) setMaterialTypeId(typeId);
    setMaterialName(matName);
    setMaterialData({
      category: typeName
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

  // Update specification value
  const updateSpecificationValue = (dimensionName: string, value: any) => {
    setSpecificationValues(prev => ({
      ...prev,
      [dimensionName]: value
    }));
  };

  const getMaterialData = () => {
    const data = {
      mainMaterialId: mainMaterialId,
      materialTypeId: materialTypeId,
      materialSpecId: materialSpecId,
      materialType: materialData.category,
      materialName: materialName,
      totalWeight: totalWeight,
      onePieceWeight: onePieceWeight,
      totalPieces: formState.totalPieces,
      mixing: mixing,
      mixingData: savedMixing?.data || [],
      specificationValues: specificationValues
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
      {/* Hidden inputs for IDs */}
      <input type="hidden" name="materialTypeId" value={materialTypeId} />
      <input type="hidden" name="mainMaterialId" value={mainMaterialId} />
      {materialSpec && <input type="hidden" name="materialSpecId" value={materialSpecId} />}

      {/* Horizontal scroll layout with hidden scrollbar */}
      <div className="createProductCss">
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '10px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="material-horizontal-scroll">
          <div style={{ position: 'relative', minWidth: '200px', flexShrink: 0 }}>
            <label style={{ display: 'block' }}>Material Type</label>
            <input
              type="text"
              onChange={handleCategoryChange}
              value={materialData.category}
              placeholder="Material Type"
              className="createDivInput createDivInputwidth"
              onFocus={() => !isEditMode && setShowTypeSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
              readOnly={isEditMode}
            />
            {!isEditMode && (
              <OptimizedSuggestions
                searchTerm={materialData.category}
                onSelect={handleMaterialTypeSelect}
                suggestionType="materialType"
                showSuggestions={showTypeSuggestions && materialData.category.length > 0}
              />
            )}
          </div>

          <div style={{ position: 'relative', minWidth: '200px', flexShrink: 0 }}>
            <label style={{ display: 'block' }}>Material Name</label>
            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="Material Name"
              className="createDivInput createDivInputwidth"
              onFocus={() => !isEditMode && setShowNameSuggestions(true)}
              onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
              readOnly={isEditMode}
            />
            {!isEditMode && (
              <OptimizedSuggestions
                searchTerm={materialName}
                onSelect={handleMaterialNameSelect}
                suggestionType="materialName"
                filterBy={materialTypeId}
                showSuggestions={showNameSuggestions && materialName.length > 0 && materialData.category.length > 0}
              />
            )}
          </div>

          <div style={{ minWidth: '150px', flexShrink: 0 }}>
            <label style={{ display: 'block' }}>Mixing</label>
            <select
              value={mixing}
              id="myDropdown"
              onChange={handleMixingChange}
              className="createDivInput createDivInputwidth"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Specifications Section - dynamically loaded */}
          {loadingSpec && (
            <div style={{ padding: '10px', background: '#f0f9ff', borderRadius: '6px', textAlign: 'center', minWidth: '200px', flexShrink: 0 }}>
              <p style={{ fontSize: '12px', color: '#0369a1' }}>Loading material specifications...</p>
            </div>
          )}

          {/* Material specifications - horizontal layout */}
          {materialSpec && (
            <>
              {/* Built-in properties */}
              {materialSpec.mol !== undefined && materialSpec.mol > 0 && (
                <div style={{ minWidth: '150px', flexShrink: 0 }}>
                  <label style={{ display: 'block' }}>MOL</label>
                  <input
                    type="number"
                    value={specificationValues.mol || materialSpec.mol || ''}
                    onChange={(e) => updateSpecificationValue('mol', parseFloat(e.target.value) || 0)}
                    placeholder="MOL value"
                    className="createDivInput createDivInputwidth"
                  />
                </div>
              )}

              {materialSpec.weightPerPiece !== undefined && materialSpec.weightPerPiece > 0 && (
                <div style={{ minWidth: '180px', flexShrink: 0 }}>
                  <label style={{ display: 'block' }}>Weight Per Piece (g)</label>
                  <input
                    type="number"
                    value={specificationValues.weightPerPiece || materialSpec.weightPerPiece || ''}
                    onChange={(e) => updateSpecificationValue('weightPerPiece', parseFloat(e.target.value) || 0)}
                    placeholder="Weight per piece"
                    className="createDivInput createDivInputwidth"
                  />
                </div>
              )}

              {materialSpec.density !== undefined && materialSpec.density > 0 && (
                <div style={{ minWidth: '180px', flexShrink: 0 }}>
                  <label style={{ display: 'block' }}>Density (g/cm³)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={specificationValues.density || materialSpec.density || ''}
                    onChange={(e) => updateSpecificationValue('density', parseFloat(e.target.value) || 0)}
                    placeholder="Density"
                    className="createDivInput createDivInputwidth"
                  />
                </div>
              )}

              {/* Custom dimensions */}
              {materialSpec.dimensions && materialSpec.dimensions.length > 0 &&
                materialSpec.dimensions
                  .filter((dim: Dimension) => !dim.isCalculated)
                  .map((dim: Dimension, index: number) => (
                    <div key={index} style={{ minWidth: '180px', flexShrink: 0 }}>
                      <label style={{ display: 'block' }}>
                        {dim.name} {dim.unit ? `(${dim.unit})` : ''}
                      </label>
                      {dim.dataType === 'number' ? (
                        <input
                          type="number"
                          value={specificationValues[dim.name] || dim.value || ''}
                          onChange={(e) => updateSpecificationValue(dim.name, parseFloat(e.target.value) || '')}
                          placeholder={`Enter ${dim.name}`}
                          className="createDivInput createDivInputwidth"
                        />
                      ) : dim.dataType === 'boolean' ? (
                        <select
                          value={specificationValues[dim.name]?.toString() || dim.value?.toString() || 'false'}
                          onChange={(e) => updateSpecificationValue(dim.name, e.target.value === 'true')}
                          className="createDivInput createDivInputwidth"
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={specificationValues[dim.name] || dim.value || ''}
                          onChange={(e) => updateSpecificationValue(dim.name, e.target.value)}
                          placeholder={`Enter ${dim.name}`}
                          className="createDivInput createDivInputwidth"
                        />
                      )}
                    </div>
                  ))}
            </>
          )}
        </div>

        <style>{`
          .material-horizontal-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
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