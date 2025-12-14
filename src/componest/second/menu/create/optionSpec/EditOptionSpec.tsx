import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import "../productSpec/spec.css";

import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { updateOptionSpec, getOptionSpecById, getOptionSpecs } from "../../../../redux/create/optionSpec/optionSpecActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { Parser } from 'expr-eval';

interface MixDimension {
  name: string;
  value: string | number | boolean | any;
  unit?: string;
  dataType: "string" | "number" | "boolean" | "date" | "file" | "link" | "refer" | "dropdown";
  referenceEnabled?: boolean;
  referenceTo?: string;
  comparisonOperator?: string;
}

interface MixComponent {
  dimensions: MixDimension[];
  order: number;
}

interface Specification {
  name: string;
  value: string | number | boolean | any;
  unit?: string;
  dataType: "string" | "number" | "boolean" | "date" | "file" | "link" | "refer" | "dropdown";
  formula?: string;
  isCalculated?: boolean;
  mixingEnabled?: boolean;
  mixComponents?: MixComponent[];
  referenceEnabled?: boolean;
  referenceTo?: string;
  comparisonOperator?: string;
  dropdownOptions?: string[];
}

const EditOptionSpec = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Get option types and option specs from Redux
  const { optionTypes, loading: optionTypesLoading } = useSelector(
    (state: RootState) => state.optionType
  );
  const { currentOptionSpec, optionSpecs, loading: optionSpecsLoading } = useSelector(
    (state: RootState) => state.optionSpec
  );

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [optionTypeId, setOptionTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // State for OptionSpec dimension name browser (to reference other OptionSpecs)
  const [selectedReferenceSpecId, setSelectedReferenceSpecId] = useState("");
  const [referenceDimensionNames, setReferenceDimensionNames] = useState<string[]>([]);

  // State for mixing popup
  const [mixingPopupIndex, setMixingPopupIndex] = useState<number | null>(null);
  const [tempMixComponents, setTempMixComponents] = useState<MixComponent[]>([]);

  // State for reference popup (to select which dimension to reference)
  const [referencePopupIndex, setReferencePopupIndex] = useState<number | null>(null);

  // Refs for file inputs
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Load option types and option specs on mount
  useEffect(() => {
    dispatch(getOptionTypes({}));
    dispatch(getOptionSpecs({}));
  }, [dispatch]);

  // Load option spec data by ID
  useEffect(() => {
    const loadOptionSpec = async () => {
      if (id) {
        try {
          setLoadingData(true);
          await dispatch(getOptionSpecById(id));
        } catch (error) {
          console.error('Error loading option spec:', error);
          alert('Failed to load option spec');
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadOptionSpec();
  }, [id, dispatch]);

  // Populate form when currentOptionSpec is loaded
  useEffect(() => {
    if (currentOptionSpec && !loadingData) {
      setName(currentOptionSpec.name || "");
      setCode(currentOptionSpec.code || "");
      setOptionTypeId(currentOptionSpec.optionTypeId || "");
      setDescription(currentOptionSpec.description || "");

      // Ensure specifications have correct structure
      const specs = (currentOptionSpec.specifications || []).map((spec: any) => ({
        ...spec,
        mixingEnabled: spec.mixingEnabled || false,
        mixComponents: spec.mixComponents || []
      }));
      setSpecifications(specs);
    }
  }, [currentOptionSpec, loadingData]);

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
      {
        name: "",
        value: "",
        unit: "",
        dataType: "string",
        formula: "",
        isCalculated: false,
        mixingEnabled: false,
        mixComponents: [],
        referenceEnabled: false,
        referenceTo: "",
        comparisonOperator: ""
      },
    ]);
  };

  const updateDimension = (index: number, field: keyof Specification, value: any) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };

    // If updating formula, mark as calculated
    if (field === 'formula') {
      updated[index].isCalculated = value && value.trim() !== '';
    }

    // If changing dataType, reset value and formula
    if (field === 'dataType') {
      updated[index].value = '';
      updated[index].formula = '';
      updated[index].isCalculated = false;
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

  // File upload handler
  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updated = [...specifications];
    updated[index].value = {
      fileName: file.name,
      originalFileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      fileSize: file.size
    };
    setSpecifications(updated);
  };

  // Mixing handlers
  const handleMixingToggle = (index: number, enabled: boolean) => {
    const updated = [...specifications];
    updated[index].mixingEnabled = enabled;

    if (enabled && !updated[index].name) {
      alert('Please provide a dimension name first');
      updated[index].mixingEnabled = false;
      setSpecifications(updated);
      return;
    }

    if (enabled) {
      setSpecifications(updated);
      openMixingPopup(index);
    } else {
      updated[index].mixComponents = [];
      setSpecifications(updated);
    }
  };

  const openMixingPopup = (index: number) => {
    setMixingPopupIndex(index);
    setTempMixComponents(specifications[index].mixComponents || []);
  };

  const saveMixing = () => {
    if (mixingPopupIndex !== null) {
      const updated = [...specifications];
      updated[mixingPopupIndex].mixComponents = tempMixComponents;
      setSpecifications(updated);
    }
    setMixingPopupIndex(null);
    setTempMixComponents([]);
  };

  const addMixComponent = () => {
    setTempMixComponents([
      ...tempMixComponents,
      {
        dimensions: [
          { name: 'Material Name', value: '', dataType: 'string' },
          { name: 'Weight', value: 0, unit: 'kg', dataType: 'number' },
          { name: 'Percentage', value: 0, unit: '%', dataType: 'number' }
        ],
        order: tempMixComponents.length
      }
    ]);
  };

  const addMixDimension = (componentIndex: number) => {
    const updated = [...tempMixComponents];
    updated[componentIndex].dimensions.push({
      name: '',
      value: '',
      dataType: 'string'
    });
    setTempMixComponents(updated);
  };

  const updateMixDimension = (componentIndex: number, dimIndex: number, field: keyof MixDimension, value: any) => {
    const updated = [...tempMixComponents];
    updated[componentIndex].dimensions[dimIndex] = {
      ...updated[componentIndex].dimensions[dimIndex],
      [field]: value
    };
    setTempMixComponents(updated);
  };

  const removeMixDimension = (componentIndex: number, dimIndex: number) => {
    const updated = [...tempMixComponents];
    updated[componentIndex].dimensions = updated[componentIndex].dimensions.filter((_, i) => i !== dimIndex);
    setTempMixComponents(updated);
  };

  const removeMixComponent = (index: number) => {
    setTempMixComponents(tempMixComponents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name || !code || !optionTypeId) {
      alert('Name, code, and option type are required');
      return;
    }

    if (!id) {
      alert('Option Spec ID is missing');
      return;
    }

    setLoading(true);

    try {
      // Convert specification values based on dataType
      const processedSpecs = specifications.map((spec) => {
        let processedValue: any = spec.value;

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
          isCalculated: spec.isCalculated,
          mixingEnabled: spec.mixingEnabled || false,
          mixComponents: spec.mixComponents || [],
          referenceEnabled: spec.referenceEnabled || false,
          referenceTo: spec.referenceTo || "",
          comparisonOperator: spec.comparisonOperator || "",
          dropdownOptions: spec.dropdownOptions || []
        };
      });

      await dispatch(updateOptionSpec(id, {
        name,
        code,
        description,
        specifications: processedSpecs
      }));

      alert('Option Spec updated successfully!');
      navigate('/edit/option-spec-list');
    } catch (err: any) {
      alert(err.message || "Failed to update option spec");
    } finally {
      setLoading(false);
    }
  };

  // Render value input based on dataType
  const renderValueInput = (spec: Specification, index: number) => {
    if (spec.isCalculated) {
      return (
        <input
          placeholder="Auto-calculated"
          value={spec.value.toString()}
          disabled
          style={{ backgroundColor: '#c8e6c9', flex: 1 }}
        />
      );
    }

    switch (spec.dataType) {
      case 'string':
        return (
          <input
            placeholder="Value"
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            placeholder="Value"
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );

      case 'boolean':
        return (
          <select
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );

      case 'file':
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              ref={(el) => fileInputRefs.current[index] = el}
              type="file"
              onChange={(e) => handleFileUpload(index, e)}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRefs.current[index]?.click()}
              style={{
                padding: '6px 12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Upload File
            </button>
            {spec.value?.fileName && (
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {spec.value.fileName}
              </span>
            )}
          </div>
        );

      case 'link':
        return (
          <input
            type="url"
            placeholder="Enter URL"
            value={typeof spec.value === 'string' ? spec.value : spec.value?.url || ''}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );

      case 'refer':
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {spec.referenceTo ? (
              <span style={{
                padding: '6px 12px',
                background: '#dbeafe',
                color: '#1e40af',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Refers to: {spec.referenceTo}
              </span>
            ) : (
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                No reference selected
              </span>
            )}
          </div>
        );

      default:
        return (
          <input
            placeholder="Value"
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );
    }
  };

  if (loadingData || !currentOptionSpec) {
    return (
      <div className="specContainer">
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading option specification...
        </div>
      </div>
    );
  }

  return (
    <div className="specContainer">
      <h2 className="specHeader">Edit Option Specification</h2>

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
            disabled
          >
            <option value="">Select option type</option>
            {Array.isArray(optionTypes) && optionTypes.map((type: any) => (
              <option key={type._id} value={type._id}>
                {type.name} ({type.category})
              </option>
            ))}
          </select>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Option type cannot be changed when editing
          </p>
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
                {Array.isArray(optionSpecs) && optionSpecs
                  .filter((spec: any) => spec._id !== id) // Don't show current spec
                  .map((spec: any) => (
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
                backgroundColor: spec.isCalculated ? '#e8f5e9' : 'transparent',
                marginBottom: '16px'
              }}
            >
              {/* Main dimension row */}
              <div className="specDimensionFields" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  placeholder="Name"
                  value={spec.name}
                  onChange={(e) => updateDimension(index, "name", e.target.value)}
                  style={{ flex: 1 }}
                />

                {renderValueInput(spec, index)}

                {spec.dataType === 'number' && (
                  <select
                    value={spec.unit || ""}
                    onChange={(e) => updateDimension(index, "unit", e.target.value)}
                    style={{ width: '80px' }}
                  >
                    <option value="">Unit</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                    <option value="m">m</option>
                    <option value="inch">inch</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="pcs">pcs</option>
                    <option value="%">%</option>
                    <option value="°C">°C</option>
                  </select>
                )}

                <select
                  value={spec.dataType}
                  onChange={(e) => updateDimension(index, "dataType", e.target.value as Specification["dataType"])}
                  style={{ width: '100px' }}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="file">File</option>
                  <option value="link">Link</option>
                  <option value="refer">Refer</option>
                </select>

                {/* Mixing toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <label style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>Mix:</label>
                  <input
                    type="checkbox"
                    checked={spec.mixingEnabled || false}
                    onChange={(e) => handleMixingToggle(index, e.target.checked)}
                  />
                  {spec.mixingEnabled && (
                    <button
                      onClick={() => openMixingPopup(index)}
                      style={{
                        padding: '4px 8px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Edit ({spec.mixComponents?.length || 0})
                    </button>
                  )}
                </div>

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
                    onChange={(e) => updateDimension(index, "formula", e.target.value)}
                    className="specFormulaInput"
                  />
                  {spec.isCalculated && (
                    <span className="specFormulaBadge">
                      🧮 Auto
                    </span>
                  )}
                </div>
              )}

              {/* Reference controls - only for refer type */}
              {spec.dataType === 'refer' && (
                <div style={{ marginTop: '8px', padding: '12px', background: '#f1f5f9', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={spec.referenceEnabled || false}
                        onChange={(e) => updateDimension(index, "referenceEnabled", e.target.checked)}
                        style={{ marginRight: '6px' }}
                      />
                      Enable Reference
                    </label>

                    {spec.referenceEnabled && (
                      <button
                        onClick={() => setReferencePopupIndex(index)}
                        style={{
                          padding: '6px 12px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500
                        }}
                      >
                        Select Dimension to Reference
                      </button>
                    )}
                  </div>

                  {spec.referenceEnabled && spec.referenceTo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500 }}>Comparison:</label>
                      <select
                        value={spec.comparisonOperator || ""}
                        onChange={(e) => updateDimension(index, "comparisonOperator", e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      >
                        <option value="">Select operator</option>
                        <option value=">">Greater than {'(>)'}</option>
                        <option value="<">Less than {'(<)'}</option>
                        <option value="=">Equal to (=)</option>
                        <option value=">=">Greater than or equal {'>='}</option>
                        <option value="<=">Less than or equal {'<='}</option>
                        <option value="!=">Not equal (!=)</option>
                      </select>
                      {spec.comparisonOperator && (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {spec.name} {spec.comparisonOperator} {spec.referenceTo}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {specifications.length === 0 && (
            <p className="specEmptyState">
              No specifications added. Click "+ Add Dimension" to start.
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
            {loading ? "Updating..." : "💾 Update Option Spec"}
          </button>
          <button
            onClick={() => navigate('/edit/option-spec-list')}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              marginTop: '10px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Reference Popup - Select dimension to reference */}
      {referencePopupIndex !== null && (
        <div className="popup-overlay">
          <div className="popup" style={{ maxWidth: '600px' }}>
            <div className="popup-content">
              <h3>Select Dimension to Reference</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                Choose which dimension this "{specifications[referencePopupIndex]?.name}" should reference
              </p>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {specifications
                  .filter((s, idx) => idx !== referencePopupIndex) // Don't show current dimension
                  .map((spec, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        updateDimension(referencePopupIndex, "referenceTo", spec.name);
                        setReferencePopupIndex(null);
                      }}
                      style={{
                        padding: '12px 16px',
                        marginBottom: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dbeafe';
                        e.currentTarget.style.borderColor = '#3b82f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <div style={{ fontWeight: 500, fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>
                        {spec.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Type: {spec.dataType} {spec.unit && `• Unit: ${spec.unit}`}
                      </div>
                    </div>
                  ))}

                {specifications.filter((s, idx) => idx !== referencePopupIndex).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No other dimensions available to reference. Add more dimensions first.
                  </div>
                )}
              </div>

              <div className="popupButtons" style={{ marginTop: '20px' }}>
                <button onClick={() => setReferencePopupIndex(null)} className="cancelButton">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mixing Popup */}
      {mixingPopupIndex !== null && (
        <div className="popup-overlay">
          <div className="popup" style={{ maxWidth: '900px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="popup-content">
              <h3>Mixing Components for: {specifications[mixingPopupIndex]?.name}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                Each component can have dynamic dimensions (material name, weight, percentage, etc.)
              </p>

              {tempMixComponents.map((comp, compIdx) => (
                <div key={compIdx} style={{
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  background: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0 }}>Component {compIdx + 1}</h4>
                    <button
                      onClick={() => removeMixComponent(compIdx)}
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 12px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕ Remove Component
                    </button>
                  </div>

                  {/* Dimensions for this component */}
                  {comp.dimensions.map((dim, dimIdx) => (
                    <div key={dimIdx} style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      marginBottom: '8px',
                      background: 'white',
                      padding: '8px',
                      borderRadius: '4px'
                    }}>
                      <input
                        type="text"
                        placeholder="Dimension name"
                        value={dim.name}
                        onChange={(e) => updateMixDimension(compIdx, dimIdx, 'name', e.target.value)}
                        style={{ flex: 1, padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }}
                      />

                      {dim.dataType === 'string' && (
                        <input
                          type="text"
                          placeholder="Value"
                          value={dim.value.toString()}
                          onChange={(e) => updateMixDimension(compIdx, dimIdx, 'value', e.target.value)}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }}
                        />
                      )}

                      {dim.dataType === 'number' && (
                        <input
                          type="number"
                          placeholder="Value"
                          value={dim.value.toString()}
                          onChange={(e) => updateMixDimension(compIdx, dimIdx, 'value', parseFloat(e.target.value) || 0)}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }}
                        />
                      )}

                      {dim.dataType === 'boolean' && (
                        <select
                          value={dim.value.toString()}
                          onChange={(e) => updateMixDimension(compIdx, dimIdx, 'value', e.target.value)}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }}
                        >
                          <option value="">Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      )}

                      {dim.dataType === 'date' && (
                        <input
                          type="date"
                          value={dim.value.toString()}
                          onChange={(e) => updateMixDimension(compIdx, dimIdx, 'value', e.target.value)}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }}
                        />
                      )}

                      {dim.dataType === 'number' && (
                        <select
                          value={dim.unit || ''}
                          onChange={(e) => updateMixDimension(compIdx, dimIdx, 'unit', e.target.value)}
                          style={{ width: '80px', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }}
                        >
                          <option value="">Unit</option>
                          <option value="cm">cm</option>
                          <option value="mm">mm</option>
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="%">%</option>
                        </select>
                      )}

                      <select
                        value={dim.dataType}
                        onChange={(e) => updateMixDimension(compIdx, dimIdx, 'dataType', e.target.value)}
                        style={{ width: '100px', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="file">File</option>
                        <option value="link">Link</option>
                        <option value="refer">Refer</option>
                      </select>

                      <button
                        onClick={() => removeMixDimension(compIdx, dimIdx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '16px',
                          cursor: 'pointer',
                          color: '#dc2626',
                          padding: '4px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addMixDimension(compIdx)}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    + Add Dimension to Component {compIdx + 1}
                  </button>
                </div>
              ))}

              <button
                onClick={addMixComponent}
                style={{
                  marginTop: '10px',
                  padding: '10px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                + Add New Component
              </button>

              <div className="popupButtons" style={{ marginTop: '20px' }}>
                <button onClick={saveMixing} className="saveButton">
                  Save Mixing
                </button>
                <button onClick={() => setMixingPopupIndex(null)} className="cancelButton">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditOptionSpec;
