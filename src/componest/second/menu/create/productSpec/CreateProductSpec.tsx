import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import "./spec.css";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { createProductSpec } from "../../../../redux/create/productSpec/productSpecActions";
import { useFormDataCache } from '../../Edit/hooks/useFormDataCache';
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

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { productTypes, materialSpecs, loading: cacheLoading } = useFormDataCache();

  const [specName, setSpecName] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(false);

  // State for Material Spec dimension name browser
  const [selectedMaterialSpecId, setSelectedMaterialSpecId] = useState("");
  const [materialDimensionNames, setMaterialDimensionNames] = useState<string[]>([]);

  // ✅ No API calls needed - data comes from useFormDataCache!

  // Extract dimension names when Material Spec is selected
  useEffect(() => {
    if (selectedMaterialSpecId && Array.isArray(materialSpecs)) {
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
    <div className="specContainer">
      <h2 className="specHeader">Create Product Specification</h2>

      <div className="specTemplateButtons">
        <button
          onClick={() => loadTemplate("plasticBag")}
          className="specTemplateBtn"
        >
          📄 Load Bag Template
        </button>
        <button
          onClick={() => loadTemplate("container")}
          className="specTemplateBtn"
        >
          🥫 Load Container Template
        </button>
      </div>

      <div className="specFormGrid">
        {/* Spec Name and Product Type in one row */}
        <div className="specFormRow">
          <div className="specFormColumn">
            <label className="specInputLabel">Spec Name *</label>
            <input
              value={specName}
              onChange={(e) => setSpecName(e.target.value)}
              className="specFormInput"
              placeholder="e.g., LDPE Bag 30x20"
            />
          </div>

          <div className="specFormColumn">
            <label className="specInputLabel">Product Type *</label>
            <select
              value={productTypeId}
              onChange={(e) => setProductTypeId(e.target.value)}
              className="specFormInput"
            >
              <option value="">Select product type</option>
              {Array.isArray(productTypes) && productTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.productTypeName}
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

        {/* Material Spec Dimension Name Browser */}
        <div className="specFormColumn">
          <div className="specReferenceBox">
            <h3 className="specReferenceTitle">
              📋 Reference Material Spec Dimensions
            </h3>
            <p className="specReferenceText">
              Select a Material Spec to see its dimension names. You can use these names in your Product dimension formulas.
            </p>

            {/* Material Spec Dropdown */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="specReferenceLabel">
                Select Material Spec:
              </label>
              <select
                value={selectedMaterialSpecId}
                onChange={(e) => setSelectedMaterialSpecId(e.target.value)}
                className="specFormInput"
              >
                <option value="">-- Select Material Spec to see dimension names --</option>
                {Array.isArray(materialSpecs) && materialSpecs.map((spec: any) => (
                  <option key={spec._id} value={spec._id}>
                    {spec.specName}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Available Dimension Names */}
            {materialDimensionNames.length > 0 && (
              <div>
                <div className="specReferenceLabel" style={{ marginBottom: '0.5rem' }}>
                  Available dimension names from "{Array.isArray(materialSpecs) ? materialSpecs.find((s: any) => s._id === selectedMaterialSpecId)?.specName : ''}":
                </div>
                <div className="specDimensionTags">
                  {materialDimensionNames.map((name, idx) => (
                    <span key={idx} className="specDimensionTag">
                      {name}
                    </span>
                  ))}
                </div>
                <div className="specReferenceHint">
                  💡 <strong>How to use:</strong> Copy these dimension names and paste them into your Product dimension formulas below.
                  For example, if Material has dimension "b", you can create a Product formula like: <code className="specCode">myValue / b</code>
                  <br />
                  <strong>Note:</strong> These are NAME references only. Actual values come from the order's Material Spec at runtime.
                </div>
              </div>
            )}

            {!selectedMaterialSpecId && (
              <div className="specReferenceEmpty">
                ℹ️ Select a Material Spec above to see available dimension names that you can use in formulas
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
                    placeholder="e.g., length * width (leave empty for manual value)"
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
            {loading ? "Saving..." : "💾 Save Product Spec"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProductSpec;
