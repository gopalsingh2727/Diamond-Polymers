import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import "./createMaterialSpec.css";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { getMaterialCategories } from "../../../../redux/create/Materials/MaterialsCategories/MaterialsCategoriesActions";
import { createMaterialSpec } from "../../../../redux/create/materialSpec/materialSpecActions";
import { getProductSpecs } from "../../../../redux/create/productSpec/productSpecActions";
import { evaluateDimensionFormulas, validateFormulaSyntax } from "../../../../../utils/dimensionFormulaEvaluator";

interface Dimension {
  name: string;
  value: string | number | boolean;
  unit?: string;
  dataType: "string" | "number" | "boolean" | "date";
  formula?: string;
  isCalculated?: boolean;
}

const CreateMaterialSpec = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux State - Get material types from Redux
  const materialTypesState = useSelector((state: RootState) => state.materialCategories);
  const materialTypes = materialTypesState?.categories || [];

  // Get Product Specs from Redux for dimension name reference
  const { productSpecs = [] } = useSelector(
    (state: RootState) => state.productSpecList || { productSpecs: [] }
  );

  const [specName, setSpecName] = useState("");
  const [materialTypeId, setMaterialTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(false);

  // State for Product Spec dimension name browser
  const [selectedProductSpecId, setSelectedProductSpecId] = useState("");
  const [productDimensionNames, setProductDimensionNames] = useState<string[]>([]);

  useEffect(() => {
    dispatch(getMaterialCategories());
    dispatch(getProductSpecs() as any);
  }, [dispatch]);

  // Extract dimension names when Product Spec is selected
  useEffect(() => {
    if (selectedProductSpecId) {
      const spec = productSpecs.find((s: any) => s._id === selectedProductSpecId);
      if (spec && spec.dimensions) {
        const names = spec.dimensions.map((d: any) => d.name);
        setProductDimensionNames(names);
      }
    } else {
      setProductDimensionNames([]);
    }
  }, [selectedProductSpecId, productSpecs]);

  const addDimension = () => {
    setDimensions([
      ...dimensions,
      { name: "", value: "", unit: "", dataType: "string", formula: "", isCalculated: false },
    ]);
  };

  const updateDimension = (index: number, field: keyof Dimension, value: any) => {
    const updated = [...dimensions];
    updated[index] = { ...updated[index], [field]: value };

    // If updating formula, mark as calculated
    if (field === 'formula') {
      updated[index].isCalculated = value && value.trim() !== '';
    }

    // Re-evaluate all formulas when any dimension changes
    try {
      const evaluated = evaluateDimensionFormulas(updated);
      setDimensions(evaluated);
    } catch (error) {
      // If evaluation fails, just update without evaluation
      setDimensions(updated);
    }
  };

  const removeDimension = (index: number) => {
    setDimensions(dimensions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!specName || !materialTypeId) {
      alert('Spec name and material type are required');
      return;
    }

    setLoading(true);

    try {
      // Convert dimension values based on dataType
      const processedDimensions = dimensions.map((dim) => {
        let processedValue: string | number | boolean = dim.value;

        if (dim.dataType === "number") {
          processedValue = Number(dim.value);
        } else if (dim.dataType === "boolean") {
          processedValue = dim.value === "true" || dim.value === true;
        }

        return {
          ...dim,
          value: processedValue,
        };
      });

      // Use Redux action
      await dispatch(createMaterialSpec({
        materialTypeId,
        specName,
        description,
        dimensions: processedDimensions,
      }));

      alert('Material spec created successfully!');

      // Reset form
      setSpecName("");
      setMaterialTypeId("");
      setDescription("");
      setDimensions([]);
    } catch (err: any) {
      alert(err.message || "Failed to create material spec");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: string) => {
    switch (template) {
      case "plastic":
        setDimensions([
          { name: "weight", value: 10, unit: "g", dataType: "number", formula: "", isCalculated: false },
          { name: "height", value: 20, unit: "cm", dataType: "number", formula: "", isCalculated: false },
          { name: "volume", value: "", unit: "cm³", dataType: "number", formula: "weight * height", isCalculated: true },
          { name: "density", value: 300, unit: "g/cm³", dataType: "number", formula: "", isCalculated: false },
          { name: "adjusted", value: "", unit: "", dataType: "number", formula: "density / 300", isCalculated: true },
        ]);
        break;
      case "metal":
        setDimensions([
          { name: "length", value: 100, unit: "mm", dataType: "number", formula: "", isCalculated: false },
          { name: "width", value: 50, unit: "mm", dataType: "number", formula: "", isCalculated: false },
          { name: "area", value: "", unit: "mm²", dataType: "number", formula: "length * width", isCalculated: true },
          { name: "thickness", value: 2, unit: "mm", dataType: "number", formula: "", isCalculated: false },
          { name: "volume", value: "", unit: "mm³", dataType: "number", formula: "area * thickness", isCalculated: true },
        ]);
        break;
      case "paper":
        setDimensions([
          { name: "baseWeight", value: 80, unit: "g/m²", dataType: "number", formula: "", isCalculated: false },
          { name: "multiplier", value: 1.5, unit: "", dataType: "number", formula: "", isCalculated: false },
          { name: "finalWeight", value: "", unit: "g/m²", dataType: "number", formula: "baseWeight * multiplier", isCalculated: true },
        ]);
        break;
    }
  };

  return (
    <div className="create-material-spec-container">
      <h2 className="text-2xl font-bold mb-4">Create Material Specification</h2>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => loadTemplate("plastic")}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          🧪 Load Plastic Template
        </button>
        <button
          onClick={() => loadTemplate("metal")}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          🔩 Load Metal Template
        </button>
        <button
          onClick={() => loadTemplate("paper")}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          📄 Load Paper Template
        </button>
      </div>

      <div className="form-grid">
        {/* Spec Name and Material Type in one row */}
        <div className="form-row">
          <div className="form-column">
            <label className="input-label">Spec Name *</label>
            <input
              value={specName}
              onChange={(e) => setSpecName(e.target.value)}
              className="form-input"
              placeholder="e.g., Premium Plastic Grade A"
            />
          </div>

          <div className="form-column">
            <label className="input-label">Material Type *</label>
            <select
              value={materialTypeId}
              onChange={(e) => setMaterialTypeId(e.target.value)}
              className="form-input"
            >
              <option value="">Select material type</option>
              {materialTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.materialTypeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-column">
          <label className="input-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            rows={2}
            placeholder="Optional description"
          />
        </div>

        {/* Product Spec Dimension Name Browser */}
        <div className="form-column">
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef3f3',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📦 Reference Product Spec Dimensions
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#991b1b',
              marginBottom: '1rem'
            }}>
              Select a Product Spec to see its dimension names. You can use these names in your Material dimension formulas.
            </p>

            {/* Product Spec Dropdown */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#7f1d1d'
              }}>
                Select Product Spec:
              </label>
              <select
                value={selectedProductSpecId}
                onChange={(e) => setSelectedProductSpecId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff'
                }}
                className="form-input"
              >
                <option value="">-- Select Product Spec to see dimension names --</option>
                {productSpecs.map((spec: any) => (
                  <option key={spec._id} value={spec._id}>
                    {spec.specName}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Available Dimension Names */}
            {productDimensionNames.length > 0 && (
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#7f1d1d',
                  marginBottom: '0.5rem'
                }}>
                  Available dimension names from "{productSpecs.find((s: any) => s._id === selectedProductSpecId)?.specName}":
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  {productDimensionNames.map((name, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        fontFamily: 'monospace',
                        border: '1px solid #fca5a5'
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#991b1b',
                  fontStyle: 'italic',
                  backgroundColor: '#fef2f2',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}>
                  💡 <strong>How to use:</strong> Copy these dimension names and paste them into your Material dimension formulas below.
                  For example, if Product has dimension "length", you can create a formula like: <code style={{ fontFamily: 'monospace', backgroundColor: '#ffffff', padding: '2px 4px', borderRadius: '2px' }}>density * length</code>
                  <br />
                  <strong>Note:</strong> These are NAME references only. Actual values come from the order's Product Spec at runtime.
                </div>
              </div>
            )}

            {!selectedProductSpecId && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#92400e'
              }}>
                ℹ️ Select a Product Spec above to see available dimension names that you can use in formulas
              </div>
            )}
          </div>
        </div>

        <div className="form-column">
          <div className="flex justify-between items-center mb-2">
            <label className="input-label">Dimensions</label>
            <button
              onClick={addDimension}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              + Add Dimension
            </button>
          </div>

          {dimensions.map((dim, index) => (
            <div
              key={index}
              className="dimension-row bg-gray-50 p-3 rounded border mb-2"
            >
              <div className="grid grid-cols-5 gap-2 mb-2">
                <input
                  placeholder="Name"
                  value={dim.name}
                  onChange={(e) =>
                    updateDimension(index, "name", e.target.value)
                  }
                  className="form-input"
                />

                <input
                  placeholder={dim.isCalculated ? "Auto-calculated" : "Value"}
                  value={dim.value.toString()}
                  onChange={(e) =>
                    updateDimension(index, "value", e.target.value)
                  }
                  className="form-input"
                  disabled={dim.isCalculated}
                  style={dim.isCalculated ? { backgroundColor: '#e0f7e0', color: '#059669' } : {}}
                />

                <input
                  placeholder="Unit"
                  value={dim.unit || ""}
                  onChange={(e) =>
                    updateDimension(index, "unit", e.target.value)
                  }
                  className="form-input"
                />

                <select
                  value={dim.dataType}
                  onChange={(e) =>
                    updateDimension(
                      index,
                      "dataType",
                      e.target.value as Dimension["dataType"]
                    )
                  }
                  className="form-input"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                </select>

                <button
                  onClick={() => removeDimension(index)}
                  className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                >
                  ✕
                </button>
              </div>

              {/* Formula field - only for number type */}
              {dim.dataType === 'number' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 min-w-16">Formula:</span>
                  <input
                    placeholder="e.g., weight * height (leave empty for manual value)"
                    value={dim.formula || ""}
                    onChange={(e) =>
                      updateDimension(index, "formula", e.target.value)
                    }
                    className="form-input text-sm"
                    style={{ fontFamily: 'monospace' }}
                  />
                  {dim.isCalculated && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      🧮 Auto
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {dimensions.length === 0 && (
            <p className="text-gray-500 text-sm italic">
              No dimensions added. Click "+ Add Dimension" to start.
            </p>
          )}
        </div>

        <div className="form-column">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
          >
            {loading ? "Saving..." : "💾 Save Material Spec"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMaterialSpec;
