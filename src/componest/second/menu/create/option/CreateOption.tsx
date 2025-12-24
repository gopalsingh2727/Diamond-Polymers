import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOption, updateOption, deleteOption } from '../../../../redux/option/optionActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { Parser } from 'expr-eval';
import './createOption.css';

// Dimension data type - only string and number
type DimensionDataType = 'string' | 'number';

interface Dimension {
  name: string;
  value: any;
  unit?: string;
  dataType: DimensionDataType;
  visible: boolean;
  formula?: string;
  isCalculated?: boolean;
}

interface CreateOptionProps {
  initialData?: {
    _id: string;
    name: string;
    optionTypeId?: string;
    optionType?: { _id: string; name: string };
    dimensions?: Dimension[];
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

// Evaluate formula for TOTALS row
const evaluateTotalFormula = (formula: string, values: number[]): number | string => {
  if (!formula || formula.trim() === '') {
    return '-';
  }

  const formulaUpper = formula.trim().toUpperCase();

  try {
    // Extract only numeric values
    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));

    if (numericValues.length === 0) {
      return '-';
    }

    // Built-in functions
    if (formulaUpper === 'SUM') {
      return numericValues.reduce((sum, val) => sum + val, 0);
    }

    if (formulaUpper === 'AVERAGE' || formulaUpper === 'AVG') {
      const sum = numericValues.reduce((sum, val) => sum + val, 0);
      return sum / numericValues.length;
    }

    if (formulaUpper === 'MAX') {
      return Math.max(...numericValues);
    }

    if (formulaUpper === 'MIN') {
      return Math.min(...numericValues);
    }

    if (formulaUpper === 'COUNT') {
      return numericValues.length;
    }

    // Custom formula evaluation
    let expression = formula;
    const sum = numericValues.reduce((sum, val) => sum + val, 0);
    const avg = sum / numericValues.length;
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);
    const count = numericValues.length;

    expression = expression.replace(/\bSUM\b/gi, sum.toString());
    expression = expression.replace(/\bAVERAGE\b/gi, avg.toString());
    expression = expression.replace(/\bAVG\b/gi, avg.toString());
    expression = expression.replace(/\bMAX\b/gi, max.toString());
    expression = expression.replace(/\bMIN\b/gi, min.toString());
    expression = expression.replace(/\bCOUNT\b/gi, count.toString());

    const safeExpression = expression.replace(/[^0-9+\-*/.()]/g, '');
    if (safeExpression !== expression) {
      return 'Error: Invalid formula';
    }

    const result = new Function('return ' + safeExpression)();

    if (typeof result === 'number' && !isNaN(result)) {
      return result;
    }

    return 'Error';
  } catch (error) {
    return 'Error';
  }
};

const CreateOption: React.FC<CreateOptionProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch<AppDispatch>();

  const { optionTypes, loading: optionTypesLoading } = useSelector((state: RootState) => state.optionType);

  const [name, setName] = useState('');
  const [optionTypeId, setOptionTypeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);

  // State for Option Type specifications display and formula support
  const [optionTypeSpecsData, setOptionTypeSpecsData] = useState<{ name: string; defaultValue: number; unit?: string }[]>([]);
  const [activeFormulaIndex, setActiveFormulaIndex] = useState<number | null>(null);

  // Add new dimension
  const addDimension = () => {
    setDimensions([
      ...dimensions,
      {
        name: '',
        value: '',
        unit: '',
        dataType: 'string',
        visible: true,
        formula: '',
        isCalculated: false,
      },
    ]);
  };

  // Helper function to check if a formula is empty or just whitespace
  const hasValidFormula = (formula: string | undefined): boolean => {
    return !!(formula && formula.trim() !== '');
  };

  // Formula evaluation function - uses Option Type values (like purity) and other dimensions
  const evaluateDimensionFormulas = (dims: Dimension[]): Dimension[] => {
    const parser = new Parser();
    const context: Record<string, number> = {};

    // Helper to make variable name formula-safe (replace spaces with underscores)
    const toVarName = (name: string) => name.replace(/\s+/g, '_');

    // Helper to add all case variations of a variable to context
    const addToContext = (name: string, value: number) => {
      if (!name || name.trim() === '') return;
      const varName = toVarName(name);
      context[varName] = value;
      context[varName.toLowerCase()] = value;
      context[varName.toUpperCase()] = value;
      context[name] = value;
      context[name.toLowerCase()] = value;
      context[name.toUpperCase()] = value;
    };

    // Add Option Type specifications to context (e.g., OT_purity = 80)
    // Support all case variations: OT_PURITY, OT_purity, OT_Purity, etc.
    if (optionTypeSpecsData.length > 0) {
      optionTypeSpecsData.forEach((spec) => {
        if (!spec.name || spec.name.trim() === '') return;
        const varName = toVarName(spec.name);
        const value = Number(spec.defaultValue) || 0;
        // Add all case variations for OT_ prefix
        context['OT_' + varName] = value;
        context['OT_' + varName.toLowerCase()] = value;
        context['OT_' + varName.toUpperCase()] = value;
        context['ot_' + varName] = value;
        context['ot_' + varName.toLowerCase()] = value;
        context['ot_' + varName.toUpperCase()] = value;
        // Also add without prefix for convenience
        addToContext(spec.name, value);
      });
    }

    // First pass: collect all NON-FORMULA values from current dimensions
    // A dimension is added to context if it has NO formula (empty, undefined, or whitespace-only)
    dims.forEach((dim) => {
      if (dim.dataType === 'number' && dim.name && dim.name.trim() !== '') {
        // Only add to context if there's NO valid formula (dimension has manual value)
        if (!hasValidFormula(dim.formula)) {
          const numValue = Number(dim.value) || 0;
          addToContext(dim.name, numValue);
          console.log(`📊 Added to context: ${dim.name} = ${numValue}`);
        }
      }
    });

    console.log('🧮 Formula context:', context);

    // Second pass: evaluate formulas (e.g., wastage = calculation - OT_purity)
    return dims.map((dim) => {
      if (hasValidFormula(dim.formula) && dim.dataType === 'number') {
        try {
          console.log(`🧮 Evaluating formula for ${dim.name}: ${dim.formula}`);
          const expression = parser.parse(dim.formula);
          const result = expression.evaluate(context);
          console.log(`🧮 Result: ${result}`);
          dim.value = result;
          dim.isCalculated = true;
          // Add result to context for dependent formulas (chained calculations)
          addToContext(dim.name, result);
        } catch (error) {
          console.error(`❌ Formula evaluation error for ${dim.name}:`, error);
          console.error('Context was:', context);
          dim.isCalculated = false;
        }
      }
      return dim;
    });
  };

  // Insert reference dimension name into active formula field
  const insertIntoFormula = (dimName: string) => {
    if (activeFormulaIndex === null) {
      alert('Please click on a formula field first, then click the dimension name to insert.');
      return;
    }
    const updated = [...dimensions];
    const currentFormula = updated[activeFormulaIndex].formula || '';
    updated[activeFormulaIndex].formula = currentFormula + dimName;
    updated[activeFormulaIndex].isCalculated = true;

    // Evaluate the formula after inserting the dimension name
    try {
      const evaluated = evaluateDimensionFormulas(updated);
      setDimensions(evaluated);
    } catch (error) {
      console.error('Error evaluating formula after insert:', error);
      setDimensions(updated);
    }
  };

  // Update dimension field
  const updateDimension = (index: number, field: keyof Dimension, value: any) => {
    console.log(`🔄 updateDimension called: index=${index}, field=${field}, value=${value}`);

    const updated = [...dimensions];
    updated[index] = { ...updated[index], [field]: value };

    // If updating formula, mark as calculated based on hasValidFormula
    if (field === 'formula') {
      updated[index].isCalculated = hasValidFormula(value);
    }

    // If changing dataType, reset value and formula
    if (field === 'dataType') {
      updated[index].value = '';
      updated[index].formula = '';
      updated[index].isCalculated = false;
    }

    // Re-evaluate all formulas when any dimension changes (value, name, formula, etc.)
    // This ensures that if CALCULATION changes from 103 to 110, the formula CALCULATION - OT_PURITY recalculates
    console.log('🔄 Re-evaluating all formulas after dimension change...');
    try {
      const evaluated = evaluateDimensionFormulas(updated);
      setDimensions(evaluated);
    } catch (error) {
      console.error('❌ Error during formula evaluation:', error);
      // If evaluation fails, just update without evaluation
      setDimensions(updated);
    }
  };

  // Remove dimension
  const removeDimension = (index: number) => {
    setDimensions(dimensions.filter((_, i) => i !== index));
  };

  useEffect(() => {
    dispatch(getOptionTypes({}));
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setOptionTypeId(initialData.optionTypeId || initialData.optionType?._id || '');
      // Load dimensions with visibility flag and formula fields
      if (initialData.dimensions) {
        setDimensions(initialData.dimensions.map((dim: any) => ({
          name: dim.name || '',
          value: dim.value || '',
          unit: dim.unit || '',
          dataType: (dim.dataType === 'string' || dim.dataType === 'number') ? dim.dataType : 'string',
          visible: dim.visible !== false,
          formula: dim.formula || '',
          isCalculated: dim.isCalculated || false,
        })));
      }
    }
  }, [initialData]);

  // Extract Option Type specifications when optionTypeId is selected (e.g., purity = 80%)
  useEffect(() => {
    if (optionTypeId && optionTypes.length > 0) {
      const selectedType = optionTypes.find((ot: any) => ot._id === optionTypeId);
      const templateData = selectedType?.specificationTemplate || selectedType?.specifications || [];
      if (templateData.length > 0) {
        const specsData = templateData
          .filter((spec: any) => {
            if (spec.dataType === 'number') return true;
            const val = spec.defaultValue;
            if (typeof val === 'number' && !isNaN(val)) return true;
            if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return true;
            return false;
          })
          .map((spec: any) => ({
            name: spec.name,
            defaultValue: Number(spec.defaultValue) || 0,
            unit: spec.unit || ''
          }));
        setOptionTypeSpecsData(specsData);
      } else {
        setOptionTypeSpecsData([]);
      }
    } else {
      setOptionTypeSpecsData([]);
    }
  }, [optionTypeId, optionTypes]);

  // Re-evaluate formulas when Option Type specs data changes (e.g., when purity value is loaded)
  useEffect(() => {
    if (optionTypeSpecsData.length > 0 && dimensions.length > 0) {
      // Check if any dimension has a formula that uses OT_ variables
      const hasOTFormulas = dimensions.some(dim => dim.formula && dim.formula.includes('OT_'));
      if (hasOTFormulas) {
        console.log('🔄 Re-evaluating formulas with new Option Type specs:', optionTypeSpecsData);
        try {
          const evaluated = evaluateDimensionFormulas([...dimensions]);
          setDimensions(evaluated);
        } catch (error) {
          console.error('Error re-evaluating formulas:', error);
        }
      }
    }
  }, [optionTypeSpecsData]);

  // Load specifications template from OptionType when selected (only for new options, not edit mode)
  useEffect(() => {
    if (optionTypeId && Array.isArray(optionTypes) && optionTypes.length > 0 && !isEditMode) {
      const selectedType = optionTypes.find((ot: any) => ot._id === optionTypeId);
      // Check both specificationTemplate and specifications (new field name)
      const templateData = selectedType?.specificationTemplate || selectedType?.specifications || [];

      if (selectedType && templateData.length > 0) {
        console.log('📋 Loading specifications template from OptionType:', selectedType.name);
        console.log('📋 Template data:', templateData);

        // Load template dimensions with values from OptionType specifications including formula fields
        const templateSpecs: Dimension[] = templateData.map((tmpl: any) => ({
          name: tmpl.name || '',
          value: tmpl.defaultValue || '',
          unit: tmpl.unit || '',
          dataType: (tmpl.dataType === 'string' || tmpl.dataType === 'number') ? tmpl.dataType : 'string',
          // Load visibility flag from Option Type specifications
          visible: tmpl.visible !== false,
          // Load formula fields
          formula: tmpl.formula || '',
          isCalculated: tmpl.isCalculated || false,
        }));

        setDimensions(templateSpecs);
      } else {
        // Clear dimensions if no template
        setDimensions([]);
      }
    }
  }, [optionTypeId, optionTypes, isEditMode]);


  const handleSubmit = async () => {
    if (!name || !optionTypeId) {
      alert('Option Type and Option Name are required');
      return;
    }

    setLoading(true);

    try {
      const branchId = localStorage.getItem('branchId') || '';
      // Filter out empty dimensions
      const validDimensions = dimensions.filter(dim => dim.name && dim.name.trim() !== '');
      const optionData: any = { name, optionTypeId, branchId, dimensions: validDimensions };

      if (isEditMode) {
        await dispatch(updateOption(initialData!._id, optionData) as any);
        alert('Option updated!');
      } else {
        await dispatch(createOption(optionData));
        alert('Option created!');
      }

      setName('');
      setOptionTypeId('');
      setDimensions([]);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to save option');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData) return;
    if (!window.confirm("Delete this option?")) return;
    try {
      await dispatch(deleteOption(initialData._id) as any);
      alert('Option deleted');
      if (onSaveSuccess) onSaveSuccess();
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <div className="createOption-container">
      {/* Header Section */}
      <div className="createOption-header">
        {isEditMode && (
          <div className="createOption-actionButtons">
            <button type="button" onClick={onCancel} className="createOption-backButton">
              ← Back to List
            </button>
            <button type="button" onClick={handleDelete} className="createOption-deleteButton">
              Delete
            </button>
          </div>
        )}
        <h1 className="createOption-title">{isEditMode ? `Edit: ${initialData?.name}` : 'Create Option'}</h1>
        <p className="createOption-subtitle">Configure a new option for your manufacturing system</p>
      </div>

      {/* Form Grid */}
      <div className="createOption-formGrid">
        {/* Basic Information Section */}
        <div className="createOption-section">
          <h3 className="createOption-sectionTitle">Basic Information</h3>

          <div className="createOption-formRow">
            <div className="createOption-group">
              <label className="createOption-label">Option Type *</label>
              <select value={optionTypeId} onChange={(e) => setOptionTypeId(e.target.value)} className="createOption-select">
                <option value="">Select option type</option>
                {Array.isArray(optionTypes) && optionTypes.map((type: any) => {
                  const specCount = (type.specificationTemplate || type.specifications || []).length;
                  return (
                    <option key={type._id} value={type._id}>
                      {type.name} {specCount > 0 ? `(${specCount} specs)` : ''}
                    </option>
                  );
                })}
              </select>
              {/* Show OptionType specifications info */}
              {optionTypeId && (() => {
                const selectedType = Array.isArray(optionTypes) && optionTypes.find((ot: any) => ot._id === optionTypeId);
                const templateData = selectedType?.specificationTemplate || selectedType?.specifications || [];
                if (templateData.length > 0) {
                  return (
                    <div className="createOption-optionTypeInfo">
                      <div className="createOption-optionTypeInfoTitle">
                        Specifications Template Loaded ({templateData.length} fields)
                      </div>
                      <div className="createOption-optionTypeInfoFields">
                        Fields: {templateData.map((t: any) => t.name).join(', ')}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="createOption-group">
              <label className="createOption-label">Option Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="createOption-input" placeholder="e.g., LDPE Bag 500x300" />
            </div>
          </div>
        </div>

        {/* Option Type Values Display - Shows purity and other specs from selected Option Type */}
        {optionTypeId && optionTypeSpecsData.length > 0 && (
          <div className="createOption-section">
            <h3 className="createOption-sectionTitle">Option Type Values</h3>
            <div className="createOption-optionTypeValues">
              <h4 className="createOption-optionTypeValuesTitle">
                {Array.isArray(optionTypes) ? optionTypes.find((ot: any) => ot._id === optionTypeId)?.name : ''}
              </h4>
              <div className="createOption-optionTypeValuesGrid">
                {optionTypeSpecsData.map((spec, idx) => (
                  <div
                    key={idx}
                    onClick={() => insertIntoFormula('OT_' + spec.name.replace(/\s+/g, '_'))}
                    className="createOption-optionTypeValueItem"
                    title={`Click to use OT_${spec.name.replace(/\s+/g, '_')} in formula`}
                  >
                    <span className="createOption-optionTypeValueName">{spec.name}</span>
                    <span className="createOption-optionTypeValueNumber">
                      {spec.defaultValue}{spec.unit ? ` ${spec.unit}` : ''}
                    </span>
                  </div>
                ))}
              </div>
              <div className="createOption-formulaHint">
                Formula Example: wastage = <code className="createOption-formulaCode">calculation - OT_purity</code>
              </div>
            </div>
          </div>
        )}

        {/* Dimensions Section */}
        <div className="createOption-section">
          <div className="createOption-dimensionsHeader">
            <div className="createOption-dimensionsTitle">
              <h3 className="createOption-sectionTitle" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Dimensions (Custom Data)</h3>
              {optionTypeId && (() => {
                const selectedType = Array.isArray(optionTypes) && optionTypes.find((ot: any) => ot._id === optionTypeId);
                const templateData = selectedType?.specificationTemplate || selectedType?.specifications || [];
                if (templateData.length > 0 && !isEditMode) {
                  return (
                    <span className="createOption-templateBadge">
                      (from OptionType template)
                    </span>
                  );
                }
                return null;
              })()}
            </div>
            <button type="button" onClick={addDimension} className="createOption-addButton">
              + Add Dimension
            </button>
          </div>

          {dimensions.length === 0 && (
            <p className="createOption-emptyState">
              {optionTypeId ? 'No specifications template in this OptionType. Click "+ Add Dimension" to add custom data.' : 'Select an Option Type first, or click "+ Add Dimension" to add custom data columns.'}
            </p>
          )}

          {dimensions.map((dim, index) => (
            <div key={index} className={`createOption-dimensionCard ${dim.isCalculated ? 'calculated' : ''}`}>
              {/* Row 1: Name, Value, DataType, Unit */}
              <div className="createOption-dimensionRow">
                <input
                  type="text"
                  placeholder="Name *"
                  value={dim.name}
                  onChange={(e) => updateDimension(index, 'name', e.target.value)}
                  className="createOption-dimensionInput"
                />
                <input
                  type={dim.dataType === 'number' ? 'number' : 'text'}
                  placeholder={dim.isCalculated ? 'Auto-calculated' : 'Value'}
                  value={dim.value}
                  onChange={(e) => updateDimension(index, 'value', e.target.value)}
                  disabled={dim.isCalculated}
                  className={`createOption-dimensionInput ${dim.isCalculated ? 'calculated' : ''}`}
                />
                <select
                  value={dim.dataType}
                  onChange={(e) => updateDimension(index, 'dataType', e.target.value as DimensionDataType)}
                  className="createOption-dimensionSelect"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                </select>
                {dim.dataType === 'number' && (
                  <select
                    value={dim.unit || ''}
                    onChange={(e) => updateDimension(index, 'unit', e.target.value)}
                    className="createOption-unitSelect"
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
                    <option value="%">%</option>
                    <option value="$">$</option>
                    <option value="Rs">Rs</option>
                    <option value="pcs">pcs</option>
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => removeDimension(index)}
                  className="createOption-removeButton"
                >
                  ✕
                </button>
              </div>

              {/* Row 2: Formula field - only for number type */}
              {dim.dataType === 'number' && (
                <div className="createOption-formulaRow">
                  <span className="createOption-formulaLabel">Formula:</span>
                  <input
                    type="text"
                    placeholder="e.g., length * width or OT_purity / 100 (leave empty for manual value)"
                    value={dim.formula || ''}
                    onChange={(e) => updateDimension(index, 'formula', e.target.value)}
                    onFocus={() => setActiveFormulaIndex(index)}
                    className="createOption-formulaInput"
                    style={{
                      borderColor: activeFormulaIndex === index ? '#3b82f6' : undefined,
                      boxShadow: activeFormulaIndex === index ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : undefined
                    }}
                  />
                  {dim.isCalculated && (
                    <span className="createOption-autoBadge">Auto</span>
                  )}
                </div>
              )}

              {/* Row 3: Visibility Toggle */}
              <div className="createOption-visibilityRow">
                <label className="createOption-visibilityLabel">
                  <input
                    type="checkbox"
                    checked={dim.visible}
                    onChange={(e) => updateDimension(index, 'visible', e.target.checked)}
                  />
                  <span className={`createOption-visibilityText ${dim.visible ? 'visible' : 'hidden'}`}>
                    {dim.visible ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="createOption-formActions">
        <button onClick={handleSubmit} disabled={loading || optionTypesLoading} className="createOption-button">
          {loading ? 'Saving...' : isEditMode ? 'Update Option' : 'Save Option'}
        </button>
      </div>
    </div>
  );
};

export default CreateOption;
