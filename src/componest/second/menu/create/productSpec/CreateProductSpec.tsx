import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import "./createProductSpec.css";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { getProductCategories } from "../../../../redux/create/products/productCategories/productCategoriesActions";
import { createProductSpec } from "../../../../redux/create/productSpec/productSpecActions";
import { getMaterialSpecs } from "../../../../redux/create/materialSpec/materialSpecActions";
import { evaluateDimensionFormulas } from "../../../../../utils/dimensionFormulaEvaluator";

interface Dimension {
  name: string;
  value: string | number | boolean;
  unit?: string;
  dataType: "string" | "number" | "boolean" | "date";
  formula?: string;
  isCalculated?: boolean;
}

const CreateProductSpec = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux State - Get product types from Redux
  const productCategoriesState = useSelector((state: RootState) => state.productCategories);
  const productTypes = productCategoriesState?.categories || [];

  // Get Material Specs from Redux for dimension name reference
  const { materialSpecs = [] } = useSelector(
    (state: RootState) => state.materialSpecList || { materialSpecs: [] }
  );

  const [specName, setSpecName] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(false);

  // State for Material Spec dimension name browser
  const [selectedMaterialSpecId, setSelectedMaterialSpecId] = useState("");
  const [materialDimensionNames, setMaterialDimensionNames] = useState<string[]>([]);

  useEffect(() => {
    dispatch(getProductCategories());
    dispatch(getMaterialSpecs() as any);
  }, [dispatch]);

  // Extract dimension names when Material Spec is selected
  useEffect(() => {
    if (selectedMaterialSpecId) {
      const spec = materialSpecs.find((s: any) => s._id === selectedMaterialSpecId);
      if (spec && spec.dimensions) {
        const names = spec.dimensions.map((d: any) => d.name);
        setMaterialDimensionNames(names);
      }
    } else {
      setMaterialDimensionNames([]);
    }
  }, [selectedMaterialSpecId, materialSpecs]);

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
    if (!specName || !productTypeId) {
      alert('Spec name and product type are required');
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
      await dispatch(createProductSpec({
        productTypeId,
        specName,
        description,
        dimensions: processedDimensions,
      }));

      alert('Product spec created successfully!');

      // Reset form
      setSpecName("");
      setProductTypeId("");
      setDescription("");
      setDimensions([]);
    } catch (err: any) {
      alert(err.message || "Failed to create product spec");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: string) => {
    switch (template) {
      case "plasticBag":
        setDimensions([
          { name: "length", value: 30, unit: "cm", dataType: "number", formula: "", isCalculated: false },
          { name: "width", value: 20, unit: "cm", dataType: "number", formula: "", isCalculated: false },
          { name: "thickness", value: 0.05, unit: "mm", dataType: "number", formula: "", isCalculated: false },
          { name: "area", value: "", unit: "cm²", dataType: "number", formula: "length * width", isCalculated: true },
          { name: "volume", value: "", unit: "cm³", dataType: "number", formula: "area * thickness / 10", isCalculated: true },
        ]);
        break;
      case "container":
        setDimensions([
          { name: "diameter", value: 10, unit: "cm", dataType: "number", formula: "", isCalculated: false },
          { name: "height", value: 15, unit: "cm", dataType: "number", formula: "", isCalculated: false },
          { name: "thickness", value: 2, unit: "mm", dataType: "number", formula: "", isCalculated: false },
          { name: "radius", value: "", unit: "cm", dataType: "number", formula: "diameter / 2", isCalculated: true },
          { name: "volume", value: "", unit: "cm³", dataType: "number", formula: "3.14159 * radius * radius * height", isCalculated: true },
        ]);
        break;
    }
  };

  return (
    <div className="create-product-spec-container">
      <h2 className="text-2xl font-bold mb-4">Create Product Specification</h2>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => loadTemplate("plasticBag")}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          📄 Load Bag Template
        </button>
        <button
          onClick={() => loadTemplate("container")}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          🥫 Load Container Template
        </button>
      </div>

      <div className="form-grid">
        {/* Spec Name and Product Type in one row */}
        <div className="form-row">
          <div className="form-column">
            <label className="input-label">Spec Name *</label>
            <input
              value={specName}
              onChange={(e) => setSpecName(e.target.value)}
              className="form-input"
              placeholder="e.g., LDPE Bag 30x20"
            />
          </div>

          <div className="form-column">
            <label className="input-label">Product Type *</label>
            <select
              value={productTypeId}
              onChange={(e) => setProductTypeId(e.target.value)}
              className="form-input"
            >
              <option value="">Select product type</option>
              {productTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.productTypeName}
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

        {/* Material Spec Dimension Name Browser */}
        <div className="form-column">
          <div style={{
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#0369a1',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 Reference Material Spec Dimensions
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#075985',
              marginBottom: '1rem'
            }}>
              Select a Material Spec to see its dimension names. You can use these names in your Product dimension formulas.
            </p>

            {/* Material Spec Dropdown */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#0c4a6e'
              }}>
                Select Material Spec:
              </label>
              <select
                value={selectedMaterialSpecId}
                onChange={(e) => setSelectedMaterialSpecId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #7dd3fc',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff'
                }}
                className="form-input"
              >
                <option value="">-- Select Material Spec to see dimension names --</option>
                {materialSpecs.map((spec: any) => (
                  <option key={spec._id} value={spec._id}>
                    {spec.specName}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Available Dimension Names */}
            {materialDimensionNames.length > 0 && (
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#0c4a6e',
                  marginBottom: '0.5rem'
                }}>
                  Available dimension names from "{materialSpecs.find((s: any) => s._id === selectedMaterialSpecId)?.specName}":
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  {materialDimensionNames.map((name, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        fontFamily: 'monospace',
                        border: '1px solid #93c5fd'
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#075985',
                  fontStyle: 'italic',
                  backgroundColor: '#e0f2fe',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}>
                  💡 <strong>How to use:</strong> Copy these dimension names and paste them into your Product dimension formulas below.
                  For example, if Material has dimension "b", you can create a Product formula like: <code style={{ fontFamily: 'monospace', backgroundColor: '#ffffff', padding: '2px 4px', borderRadius: '2px' }}>myValue / b</code>
                  <br />
                  <strong>Note:</strong> These are NAME references only. Actual values come from the order's Material Spec at runtime.
                </div>
              </div>
            )}

            {!selectedMaterialSpecId && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#92400e'
              }}>
                ℹ️ Select a Material Spec above to see available dimension names that you can use in formulas
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
                    placeholder="e.g., length * width (leave empty for manual value)"
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
            {loading ? "Saving..." : "💾 Save Product Spec"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProductSpec;
