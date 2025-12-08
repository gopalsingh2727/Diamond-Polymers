import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import "../productSpec/spec.css";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { createOptionSpec } from "../../../../redux/create/optionSpec/optionSpecActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { getOptionSpecs } from "../../../../redux/create/optionSpec/optionSpecActions";
import { Parser } from 'expr-eval';

interface Specification {
  name: string;
  value: string | number | boolean;
  unit?: string;
  dataType: "string" | "number" | "boolean";
  formula?: string;
  isCalculated?: boolean;
}

const CreateOptionSpec = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Get option types and option specs from Redux
  const { optionTypes, loading: optionTypesLoading } = useSelector(
    (state: RootState) => state.optionType
  );
  const { optionSpecs, loading: optionSpecsLoading } = useSelector(
    (state: RootState) => state.optionSpec
  );

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [optionTypeId, setOptionTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(false);

  // State for OptionSpec dimension name browser (to reference other OptionSpecs)
  const [selectedReferenceSpecId, setSelectedReferenceSpecId] = useState("");
  const [referenceDimensionNames, setReferenceDimensionNames] = useState<string[]>([]);

  // Load option types and option specs on mount
  useEffect(() => {
    dispatch(getOptionTypes({}));
    dispatch(getOptionSpecs({}));
  }, [dispatch]);

  // Load template when OptionType is selected
  useEffect(() => {
    if (optionTypeId && optionTypes.length > 0) {
      const selectedType = optionTypes.find((ot: any) => ot._id === optionTypeId);
      if (selectedType && selectedType.specificationTemplate) {
        // Load template dimensions
        const templateSpecs = selectedType.specificationTemplate.map((tmpl: any) => ({
          name: tmpl.name,
          value: tmpl.defaultValue || "",
          unit: tmpl.unit || "",
          dataType: tmpl.dataType || "string",
          formula: "",
          isCalculated: false
        }));
        setSpecifications(templateSpecs);
      }
    }
  }, [optionTypeId, optionTypes]);

  // Extract dimension names when reference OptionSpec is selected
  useEffect(() => {
    if (selectedReferenceSpecId && Array.isArray(optionSpecs)) {
      const spec = optionSpecs.find((s: any) => s._id === selectedReferenceSpecId);
      if (spec && spec.specifications) {
        const names = spec.specifications.map((d: any) => d.name);
        setReferenceDimensionNames(names);
      }
    } else {
      setReferenceDimensionNames([]);
    }
  }, [selectedReferenceSpecId, optionSpecs]);

  const evaluateDimensionFormulas = (specs: Specification[]): Specification[] => {
    const parser = new Parser();
    const context: Record<string, number> = {};

    // First pass: collect all non-formula values
    specs.forEach((spec) => {
      if (!spec.formula && spec.dataType === 'number') {
        context[spec.name] = Number(spec.value) || 0;
      }
    });

    // Second pass: evaluate formulas
    return specs.map((spec) => {
      if (spec.formula && spec.dataType === 'number') {
        try {
          const expression = parser.parse(spec.formula);
          const result = expression.evaluate(context);
          spec.value = result;
          spec.isCalculated = true;
          context[spec.name] = result;
        } catch (error) {
          console.error(`Formula evaluation error for ${spec.name}:`, error);
          spec.isCalculated = false;
        }
      }
      return spec;
    });
  };

  const addDimension = () => {
    setSpecifications([
      ...specifications,
      { name: "", value: "", unit: "", dataType: "string", formula: "", isCalculated: false },
    ]);
  };

  const updateDimension = (index: number, field: keyof Specification, value: any) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };

    // If updating formula, mark as calculated
    if (field === 'formula') {
      updated[index].isCalculated = value && value.trim() !== '';
    }

    // Re-evaluate all formulas when any dimension changes
    try {
      const evaluated = evaluateDimensionFormulas(updated);
      setSpecifications(evaluated);
    } catch (error) {
      // If evaluation fails, just update without evaluation
      setSpecifications(updated);
    }
  };

  const removeDimension = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const calculateTotal = (dimName: string): number => {
    return specifications
      .filter((s) => s.name === dimName && s.dataType === 'number')
      .reduce((sum, s) => sum + (Number(s.value) || 0), 0);
  };

  const handleSubmit = async () => {
    if (!name || !code || !optionTypeId) {
      alert('Name, code, and option type are required');
      return;
    }

    setLoading(true);

    try {
      const branchId = localStorage.getItem('branchId') || '';

      // Convert specification values based on dataType
      const processedSpecs = specifications.map((spec) => {
        let processedValue: string | number | boolean = spec.value;

        if (spec.dataType === "number") {
          processedValue = Number(spec.value);
        } else if (spec.dataType === "boolean") {
          processedValue = spec.value === "true" || spec.value === true;
        }

        return {
          name: spec.name,
          value: processedValue,
          unit: spec.unit,
          dataType: spec.dataType,
          formula: spec.formula,
          isCalculated: spec.isCalculated
        };
      });

      await dispatch(createOptionSpec({
        name,
        code,
        optionTypeId,
        description,
        specifications: processedSpecs,
        branchId
      }));

      alert('Option Spec created successfully!');

      // Reset form
      setName("");
      setCode("");
      setOptionTypeId("");
      setDescription("");
      setSpecifications([]);
    } catch (err: any) {
      alert(err.message || "Failed to create option spec");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: string) => {
    switch (template) {
      case "plasticBag":
        setSpecifications([
          { name: "length", value: 30, unit: "cm", dataType: "number", formula: "", isCalculated: false },
          { name: "width", value: 20, unit: "cm", dataType: "number", formula: "", isCalculated: false },
          { name: "thickness", value: 0.05, unit: "mm", dataType: "number", formula: "", isCalculated: false },
          { name: "area", value: "", unit: "cm²", dataType: "number", formula: "length * width", isCalculated: true },
          { name: "volume", value: "", unit: "cm³", dataType: "number", formula: "area * thickness / 10", isCalculated: true },
        ]);
        break;
      case "container":
        setSpecifications([
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
      <h2 className="specHeader">Create Option Specification</h2>

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
        {/* Name, Code, and Option Type in grid */}
        <div className="specFormRow">
          <div className="specFormColumn">
            <label className="specInputLabel">Spec Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="specFormInput"
              placeholder="e.g., LDPE 500x300x50"
            />
          </div>

          <div className="specFormColumn">
            <label className="specInputLabel">Spec Code *</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="specFormInput"
              placeholder="e.g., LDPE-500-300"
            />
          </div>
        </div>

        <div className="specFormColumn">
          <label className="specInputLabel">Option Type *</label>
          <select
            value={optionTypeId}
            onChange={(e) => setOptionTypeId(e.target.value)}
            className="specFormInput"
          >
            <option value="">Select option type</option>
            {Array.isArray(optionTypes) && optionTypes.map((type: any) => (
              <option key={type._id} value={type._id}>
                {type.name} ({type.category})
              </option>
            ))}
          </select>
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

        {/* Reference OptionSpec Dimension Browser */}
        <div className="specFormColumn">
          <div className="specReferenceBox">
            <h3 className="specReferenceTitle">
              📋 Reference Other Option Spec Dimensions
            </h3>
            <p className="specReferenceText">
              Select an Option Spec to see its dimension names. You can use these names in your formulas.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label className="specReferenceLabel">
                Select Option Spec:
              </label>
              <select
                value={selectedReferenceSpecId}
                onChange={(e) => setSelectedReferenceSpecId(e.target.value)}
                className="specFormInput"
              >
                <option value="">-- Select Option Spec to see dimension names --</option>
                {Array.isArray(optionSpecs) && optionSpecs.map((spec: any) => (
                  <option key={spec._id} value={spec._id}>
                    {spec.name} - {spec.code}
                  </option>
                ))}
              </select>
            </div>

            {referenceDimensionNames.length > 0 && (
              <div>
                <div className="specReferenceLabel" style={{ marginBottom: '0.5rem' }}>
                  Available dimension names from "{Array.isArray(optionSpecs) ? optionSpecs.find((s: any) => s._id === selectedReferenceSpecId)?.name : ''}":
                </div>
                <div className="specDimensionTags">
                  {referenceDimensionNames.map((name, idx) => (
                    <span key={idx} className="specDimensionTag">
                      {name}
                    </span>
                  ))}
                </div>
                <div className="specReferenceHint">
                  💡 <strong>How to use:</strong> Copy these dimension names and paste them into your formulas below.
                  For example, if reference spec has dimension "width", you can create a formula like: <code className="specCode">myValue / width</code>
                  <br />
                  <strong>Note:</strong> These are NAME references only. Actual values come from the selected Option Spec at runtime.
                </div>
              </div>
            )}

            {!selectedReferenceSpecId && (
              <div className="specReferenceEmpty">
                ℹ️ Select an Option Spec above to see available dimension names that you can use in formulas
              </div>
            )}
          </div>
        </div>

        <div className="specFormColumn">
          <div className="specDimensionsHeader">
            <label className="specInputLabel">Specifications</label>
            <button
              onClick={addDimension}
              className="specAddDimensionBtn"
            >
              + Add Dimension
            </button>
          </div>

          {specifications.map((spec, index) => (
            <div
              key={index}
              className="specDimensionRow"
              style={{
                backgroundColor: spec.isCalculated ? '#e8f5e9' : 'transparent'
              }}
            >
              <div className="specDimensionFields">
                <input
                  placeholder="Name"
                  value={spec.name}
                  onChange={(e) =>
                    updateDimension(index, "name", e.target.value)
                  }
                />

                <input
                  placeholder={spec.isCalculated ? "Auto-calculated" : "Value"}
                  value={spec.value.toString()}
                  onChange={(e) =>
                    updateDimension(index, "value", e.target.value)
                  }
                  disabled={spec.isCalculated}
                  style={{
                    backgroundColor: spec.isCalculated ? '#c8e6c9' : 'white'
                  }}
                />

                <input
                  placeholder="Unit"
                  value={spec.unit || ""}
                  onChange={(e) =>
                    updateDimension(index, "unit", e.target.value)
                  }
                />

                <select
                  value={spec.dataType}
                  onChange={(e) =>
                    updateDimension(
                      index,
                      "dataType",
                      e.target.value as Specification["dataType"]
                    )
                  }
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>

                <button
                  onClick={() => removeDimension(index)}
                  className="specRemoveDimensionBtn"
                >
                  ✕
                </button>
              </div>

              {/* Formula field - only for number type */}
              {spec.dataType === 'number' && (
                <div className="specFormulaRow">
                  <span className="specFormulaLabel">Formula:</span>
                  <input
                    placeholder="e.g., length * width (leave empty for manual value)"
                    value={spec.formula || ""}
                    onChange={(e) =>
                      updateDimension(index, "formula", e.target.value)
                    }
                    className="specFormulaInput"
                  />
                  {spec.isCalculated && (
                    <span className="specFormulaBadge">
                      🧮 Auto
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {specifications.length === 0 && (
            <p className="specEmptyState">
              No specifications added. Select an Option Type to load template, or click "+ Add Dimension" to start.
            </p>
          )}

          {/* Total Row */}
          {specifications.length > 0 && specifications.some(s => s.dataType === 'number') && (
            <div className="specTotalRow">
              <strong>Total:</strong>
              {specifications
                .filter((s, idx, arr) => s.dataType === 'number' && arr.findIndex(x => x.name === s.name) === idx)
                .map((spec, idx) => (
                  <span key={idx} className="specTotalItem">
                    {spec.name}: {calculateTotal(spec.name).toFixed(2)} {spec.unit}
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="specFormColumn">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="specSaveButton"
          >
            {loading ? "Saving..." : "💾 Save Option Spec"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOptionSpec;
