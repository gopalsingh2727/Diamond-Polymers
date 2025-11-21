import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import "./spec.css";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { createMaterialSpec } from "../../../../redux/create/materialSpec/materialSpecActions";
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
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

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { materialTypes, productSpecs, loading: cacheLoading } = useFormDataCache();

  const [specName, setSpecName] = useState("");
  const [materialTypeId, setMaterialTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(false);

  // State for Product Spec dimension name browser
  const [selectedProductSpecId, setSelectedProductSpecId] = useState("");
  const [productDimensionNames, setProductDimensionNames] = useState<string[]>([]);

  // ✅ No API calls needed - data comes from useFormDataCache!

  // Extract dimension names when Product Spec is selected
  useEffect(() => {
    if (selectedProductSpecId && Array.isArray(productSpecs)) {
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
      const errorMessage = err.response?.data?.message || err.message || "Failed to create material spec";
      alert(errorMessage);
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
    <div className="specContainer">
      <h2 className="specHeader">Create Material Specification</h2>

      <div className="specTemplateButtons">
        <button
          onClick={() => loadTemplate("plastic")}
          className="specTemplateBtn"
        >
          🧪 Load Plastic Template
        </button>
        <button
          onClick={() => loadTemplate("metal")}
          className="specTemplateBtn"
        >
          🔩 Load Metal Template
        </button>
        <button
          onClick={() => loadTemplate("paper")}
          className="specTemplateBtn"
        >
          📄 Load Paper Template
        </button>
      </div>

      <div className="specFormGrid">
        {/* Spec Name and Material Type in one row */}
        <div className="specFormRow">
          <div className="specFormColumn">
            <label className="specInputLabel">Spec Name *</label>
            <input
              value={specName}
              onChange={(e) => setSpecName(e.target.value)}
              className="specFormInput"
              placeholder="e.g., Premium Plastic Grade A"
            />
          </div>

          <div className="specFormColumn">
            <label className="specInputLabel">Material Type *</label>
            <select
              value={materialTypeId}
              onChange={(e) => setMaterialTypeId(e.target.value)}
              className="specFormInput"
            >
              <option value="">Select material type</option>
              {Array.isArray(materialTypes) && materialTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.materialTypeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="specFormColumn">
          <label className="specInputLabel">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="specFormInput"
            rows={2}
            placeholder="Optional description"
          />
        </div>

        {/* Product Spec Dimension Name Browser */}
        <div className="specFormColumn">
          <div className="specReferenceBox materialRef">
            <h3 className="specReferenceTitle">
              📦 Reference Product Spec Dimensions
            </h3>
            <p className="specReferenceText">
              Select a Product Spec to see its dimension names. You can use these names in your Material dimension formulas.
            </p>

            {/* Product Spec Dropdown */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="specReferenceLabel">
                Select Product Spec:
              </label>
              <select
                value={selectedProductSpecId}
                onChange={(e) => setSelectedProductSpecId(e.target.value)}
                className="specFormInput"
              >
                <option value="">-- Select Product Spec to see dimension names --</option>
                {Array.isArray(productSpecs) && productSpecs.map((spec: any) => (
                  <option key={spec._id} value={spec._id}>
                    {spec.specName}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Available Dimension Names */}
            {productDimensionNames.length > 0 && (
              <div>
                <div className="specReferenceLabel" style={{ marginBottom: '0.5rem' }}>
                  Available dimension names from "{Array.isArray(productSpecs) ? productSpecs.find((s: any) => s._id === selectedProductSpecId)?.specName : ''}":
                </div>
                <div className="specDimensionTags">
                  {productDimensionNames.map((name, idx) => (
                    <span
                      key={idx}
                      className="specDimensionTag"
                    >
                      {name}
                    </span>
                  ))}
                </div>
                <div className="specReferenceHint">
                  💡 <strong>How to use:</strong> Copy these dimension names and paste them into your Material dimension formulas below.
                  For example, if Product has dimension "length", you can create a formula like: <code className="specCode">density * length</code>
                  <br />
                  <strong>Note:</strong> These are NAME references only. Actual values come from the order's Product Spec at runtime.
                </div>
              </div>
            )}

            {!selectedProductSpecId && (
              <div className="specReferenceEmpty">
                ℹ️ Select a Product Spec above to see available dimension names that you can use in formulas
              </div>
            )}
          </div>
        </div>

        <div className="specFormColumn">
          <div className="specDimensionsHeader">
            <label className="specInputLabel">Dimensions</label>
            <button
              onClick={addDimension}
              className="specAddDimensionBtn"
            >
              + Add Dimension
            </button>
          </div>

          {dimensions.map((dim, index) => (
            <div
              key={index}
              className="specDimensionRow"
            >
              <div className="specDimensionFields">
                <input
                  placeholder="Name"
                  value={dim.name}
                  onChange={(e) =>
                    updateDimension(index, "name", e.target.value)
                  }
                />

                <input
                  placeholder={dim.isCalculated ? "Auto-calculated" : "Value"}
                  value={dim.value.toString()}
                  onChange={(e) =>
                    updateDimension(index, "value", e.target.value)
                  }
                  disabled={dim.isCalculated}
                />

                <input
                  placeholder="Unit"
                  value={dim.unit || ""}
                  onChange={(e) =>
                    updateDimension(index, "unit", e.target.value)
                  }
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
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                </select>

                <button
                  onClick={() => removeDimension(index)}
                  className="specRemoveDimensionBtn"
                >
                  ✕
                </button>
              </div>

              {/* Formula field - only for number type */}
              {dim.dataType === 'number' && (
                <div className="specFormulaRow">
                  <span className="specFormulaLabel">Formula:</span>
                  <input
                    placeholder="e.g., weight * height (leave empty for manual value)"
                    value={dim.formula || ""}
                    onChange={(e) =>
                      updateDimension(index, "formula", e.target.value)
                    }
                    className="specFormulaInput"
                  />
                  {dim.isCalculated && (
                    <span className="specFormulaBadge">
                      🧮 Auto
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {dimensions.length === 0 && (
            <p className="specEmptyState">
              No dimensions added. Click "+ Add Dimension" to start.
            </p>
          )}
        </div>

        <div className="specFormColumn">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="specSaveButton"
          >
            {loading ? "Saving..." : "💾 Save Material Spec"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMaterialSpec;
