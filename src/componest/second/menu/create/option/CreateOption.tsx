import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOption, updateOption, deleteOption } from '../../../../redux/option/optionActions';
import { getOptionTypes } from '../../../../redux/option/optionTypeActions';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { Parser } from 'expr-eval';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import ImportProgressPopup from '../../../../../components/shared/ImportProgressPopup';
import ImportAccountPopup from '../../../../../components/shared/ImportAccountPopup';
import * as XLSX from 'xlsx';
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
    optionType?: {_id: string;name: string;};
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
    const numericValues = values.filter((v) => typeof v === 'number' && !isNaN(v));

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
  const { handleSave, handleDelete: crudDelete, saveState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const optionTypeState = useSelector((state: RootState) => state.v2.optionType);
  const rawOptionTypes = optionTypeState?.list;
  const optionTypes = Array.isArray(rawOptionTypes) ? rawOptionTypes : [];
  const optionTypesLoading = optionTypeState?.loading;

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: RootState) => state.auth?.userData?.selectedBranch);

  const [name, setName] = useState('');
  const [optionTypeId, setOptionTypeId] = useState('');
  const [dimensions, setDimensions] = useState<Dimension[]>([]);

  // State for Option Type specifications display and formula support
  const [optionTypeSpecsData, setOptionTypeSpecsData] = useState<{name: string;defaultValue: number;unit?: string;}[]>([]);
  const [activeFormulaIndex, setActiveFormulaIndex] = useState<number | null>(null);

  // Excel import state
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    success: 0,
    failed: 0,
    percentage: 0,
  });
  const [importSummary, setImportSummary] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

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
      isCalculated: false
    }]
    );
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

    // Add Option Type specifications to context (e.g., optionType_purity = 80)
    // Support all case variations and prefixes for backward compatibility
    if (optionTypeSpecsData.length > 0) {
      optionTypeSpecsData.forEach((spec) => {
        if (!spec.name || spec.name.trim() === '') return;
        const varName = toVarName(spec.name);
        const value = Number(spec.defaultValue) || 0;
        // Add optionType_ prefix (matches backend)
        context['optionType_' + varName] = value;
        context['optionType_' + varName.toLowerCase()] = value;
        context['optionType_' + varName.toUpperCase()] = value;
        // Add OT_ prefix for backward compatibility
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

        }
      }
    });



    // Second pass: evaluate formulas (e.g., wastage = calculation - OT_purity)
    return dims.map((dim) => {
      if (hasValidFormula(dim.formula) && dim.dataType === 'number') {
        try {

          const expression = parser.parse(dim.formula);
          const result = expression.evaluate(context);

          dim.value = result;
          dim.isCalculated = true;
          // Add result to context for dependent formulas (chained calculations)
          addToContext(dim.name, result);
        } catch (error) {


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

      setDimensions(updated);
    }
  };

  // Update dimension field
  const updateDimension = (index: number, field: keyof Dimension, value: any) => {


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

    try {
      const evaluated = evaluateDimensionFormulas(updated);
      setDimensions(evaluated);
    } catch (error) {

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
  }, [dispatch, selectedBranch]);

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
          dataType: dim.dataType === 'string' || dim.dataType === 'number' ? dim.dataType : 'string',
          visible: dim.visible !== false,
          formula: dim.formula || '',
          isCalculated: dim.isCalculated || false
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
        const specsData = templateData.
        filter((spec: any) => {
          if (spec.dataType === 'number') return true;
          const val = spec.defaultValue;
          if (typeof val === 'number' && !isNaN(val)) return true;
          if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return true;
          return false;
        }).
        map((spec: any) => ({
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
      const hasOTFormulas = dimensions.some((dim) => dim.formula && dim.formula.includes('OT_'));
      if (hasOTFormulas) {

        try {
          const evaluated = evaluateDimensionFormulas([...dimensions]);
          setDimensions(evaluated);
        } catch (error) {

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



        // Load template dimensions with values from OptionType specifications including formula fields
        const templateSpecs: Dimension[] = templateData.map((tmpl: any) => ({
          name: tmpl.name || '',
          value: tmpl.defaultValue || '',
          unit: tmpl.unit || '',
          dataType: tmpl.dataType === 'string' || tmpl.dataType === 'number' ? tmpl.dataType : 'string',
          // Load visibility flag from Option Type specifications
          visible: tmpl.visible !== false,
          // Load formula fields
          formula: tmpl.formula || '',
          isCalculated: tmpl.isCalculated || false
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
      toast.error('Validation Error', 'Option Type and Option Name are required');
      return;
    }

    const branchId = localStorage.getItem('selectedBranch') || '';
    // Filter out empty dimensions
    const validDimensions = dimensions.filter((dim) => dim.name && dim.name.trim() !== '');
    const optionData: any = { name, optionTypeId, branchId, dimensions: validDimensions };

    const saveAction = async () => {
      if (isEditMode) {
        return dispatch(updateOption(initialData!._id, optionData) as any);
      } else {
        return dispatch(createOption(optionData));
      }
    };

    handleSave(saveAction, {
      successMessage: isEditMode ? 'Option updated successfully' : 'Option created successfully',
      onSuccess: () => {
        setName('');
        setOptionTypeId('');
        setDimensions([]);
        if (onSaveSuccess) {
          setTimeout(() => {
            onSaveSuccess();
          }, 1500);
        }
      }
    });
  };

  const handleDeleteClick = () => {
    if (!isEditMode || !initialData) return;

    crudDelete(
      () => dispatch(deleteOption(initialData._id) as any),
      {
        successMessage: 'Option deleted successfully',
        confirmMessage: 'Are you sure you want to delete this option? This action cannot be undone.',
        confirmTitle: 'Delete Option',
        onSuccess: () => {
          // Delay navigation to show toast
          setTimeout(() => {
            if (onSaveSuccess) onSaveSuccess();
          }, 1500);
        }
      }
    );
  };

  // Excel import functions
  const downloadExcelTemplate = () => {
    const instructions = [
      ['Option Bulk Import Template'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Maximum 50 options per import'],
      ['2. Required fields are marked with * in column headers'],
      ['3. Delete the example rows before adding your data'],
      ['4. Option Type Name must exactly match an existing option type'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['Option Name * - Required. Name of the option (e.g., "Red", "Large", "Premium")'],
      ['Option Type Name * - Required. Must match existing option type name (e.g., "Color", "Size", "Quality")'],
    ];

    const templateData = [
      {
        'Option Name *': 'Red',
        'Option Type Name *': 'Color'
      },
      {
        'Option Name *': 'Large',
        'Option Type Name *': 'Size'
      },
    ];

    const wb = XLSX.utils.book_new();
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');
    XLSX.writeFile(wb, 'Option_Import_Template.xlsx');

    toast.addToast({
      type: 'success',
      title: 'Success',
      message: 'Template downloaded successfully',
    });
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      if (!workbook.Sheets['Template']) {
        toast.addToast({
          type: 'error',
          title: 'Import Error',
          message: 'Template sheet not found. Please use the downloaded template.',
        });
        return;
      }

      const worksheet = workbook.Sheets['Template'];
      let jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.addToast({
          type: 'error',
          title: 'Import Error',
          message: 'No data found in Template sheet',
        });
        return;
      }

      if (jsonData.length > 50) {
        toast.addToast({
          type: 'warning',
          title: 'Import Limit',
          message: `Limiting import to first 50 options (found ${jsonData.length})`,
        });
        jsonData = jsonData.slice(0, 50);
      }

      const validationErrors: string[] = [];
      const processedData: any[] = [];
      const branchId = localStorage.getItem('selectedBranch') || "";

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;
        const errors: string[] = [];

        const optionName = row['Option Name *']?.toString().trim();
        if (!optionName) {
          errors.push(`Row ${rowNum}: Missing Option Name`);
        }

        const optionTypeName = row['Option Type Name *']?.toString().trim();
        let optionTypeId = '';
        if (!optionTypeName) {
          errors.push(`Row ${rowNum}: Missing Option Type Name`);
        } else {
          const optionType = optionTypes.find(
            (ot: any) => ot.name.toLowerCase() === optionTypeName.toLowerCase()
          );
          if (!optionType) {
            errors.push(`Row ${rowNum}: Option Type "${optionTypeName}" not found`);
          } else {
            optionTypeId = optionType._id;
          }
        }

        if (errors.length === 0) {
          processedData.push({
            name: optionName,
            optionTypeId,
            branchId,
            dimensions: []
          });
        } else {
          validationErrors.push(...errors);
        }
      });

      const validCount = processedData.length;
      const errorCount = validationErrors.length;

      const confirmMessage =
        `Ready to import ${validCount} options.\n` +
        (errorCount > 0 ? `${errorCount} validation issues found (see console for details).\n` : '') +
        '\nProceed with import?';

      if (errorCount > 0) {
        console.warn('Import Validation Errors:', validationErrors);
      }

      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }

      setBulkImporting(true);
      let successCount = 0;
      let failCount = 0;
      const importErrors: string[] = [];

      for (let i = 0; i < processedData.length; i++) {
        const optionData = processedData[i];

        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createOption(optionData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(
            `Row ${i + 2} (${optionData.name}): ${errorMsg}`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setBulkImporting(false);

      setImportSummary({
        total: processedData.length,
        success: successCount,
        failed: failCount,
        errors: importErrors,
      });

      if (successCount > 0) {
        toast.addToast({
          type: 'success',
          title: 'Import Complete',
          message: `Successfully imported ${successCount} option(s)`,
        });
      }
    } catch (error: any) {
      console.error('Excel import error:', error);
      toast.addToast({
        type: 'error',
        title: 'Import Failed',
        message: `Failed to import Excel file: ${error.message}`,
      });
      setBulkImporting(false);
    }
  };

  return (
    <div className="createOption-container">
      {/* Delete Confirmation Modal */}
      {confirmDialog.isOpen &&
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>

          <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center"
          }}>

            <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>{confirmDialog.title}</h3>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
              type="button"
              onClick={closeConfirmDialog}
              style={{
                padding: "10px 24px",
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}>

                Cancel
              </button>
              <button
              type="button"
              onClick={confirmDialog.onConfirm}
              disabled={deleteState === 'loading'}
              style={{
                padding: "10px 24px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                opacity: deleteState === 'loading' ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}>

                {deleteState === 'loading' ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Header Section */}
      <div className="createOption-header">
        {isEditMode &&
        <div className="createOption-actionButtons">
            <button type="button" onClick={onCancel} className="createOption-backButton">
              ← Back to List
            </button>
            <button
            type="button"
            onClick={handleDeleteClick}
            className="createOption-deleteButton"
            disabled={deleteState === 'loading'}
            style={{ opacity: deleteState === 'loading' ? 0.7 : 1, transition: "all 0.2s ease" }}>

              {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }

        {!isEditMode ? (
          <div className="createaccount-title-row">
            <h1 className="createOption-title" style={{ margin: 0, border: 'none', padding: 0 }}>Create Option</h1>

            <button
              type="button"
              onClick={() => setShowImportPopup(true)}
              className="import-accounts-title-btn"
              disabled={bulkImporting}
            >
              Import Options
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        ) : (
          <h1 className="createOption-title">Edit: {initialData?.name}</h1>
        )}
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
                    </option>);

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
                    </div>);

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
        {optionTypeId && optionTypeSpecsData.length > 0 &&
        <div className="createOption-section">
            <h3 className="createOption-sectionTitle">Option Type Values</h3>
            <div className="createOption-optionTypeValues">
              <h4 className="createOption-optionTypeValuesTitle">
                {Array.isArray(optionTypes) ? optionTypes.find((ot: any) => ot._id === optionTypeId)?.name : ''}
              </h4>
              <div className="createOption-optionTypeValuesGrid">
                {optionTypeSpecsData.map((spec, idx) =>
              <div
                key={idx}
                onClick={() => insertIntoFormula('optionType_' + spec.name.replace(/\s+/g, '_'))}
                className="createOption-optionTypeValueItem"
                title={`Click to use optionType_${spec.name.replace(/\s+/g, '_')} in formula`}>

                    <span className="createOption-optionTypeValueName">{spec.name}</span>
                    <span className="createOption-optionTypeValueNumber">
                      {spec.defaultValue}{spec.unit ? ` ${spec.unit}` : ''}
                    </span>
                  </div>
              )}
              </div>
              <div className="createOption-formulaHint">
                Formula Example: wastage = <code className="createOption-formulaCode">calculation - optionType_purity</code>
              </div>
            </div>
          </div>
        }

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
                    </span>);

                }
                return null;
              })()}
            </div>
            <button type="button" onClick={addDimension} className="createOption-addButton">
              + Add Dimension
            </button>
          </div>

          {dimensions.length === 0 &&
          <p className="createOption-emptyState">
              {optionTypeId ? 'No specifications template in this OptionType. Click "+ Add Dimension" to add custom data.' : 'Select an Option Type first, or click "+ Add Dimension" to add custom data columns.'}
            </p>
          }

          {dimensions.map((dim, index) =>
          <div key={index} className={`createOption-dimensionCard ${dim.isCalculated ? 'calculated' : ''}`}>
              {/* Row 1: Name, Value, DataType, Unit */}
              <div className="createOption-dimensionRow">
                <input
                type="text"
                placeholder="Name *"
                value={dim.name}
                onChange={(e) => updateDimension(index, 'name', e.target.value)}
                className="createOption-dimensionInput" />

                <input
                type={dim.dataType === 'number' ? 'number' : 'text'}
                placeholder={dim.isCalculated ? 'Auto-calculated' : 'Value'}
                value={dim.value}
                onChange={(e) => updateDimension(index, 'value', e.target.value)}
                disabled={dim.isCalculated}
                className={`createOption-dimensionInput ${dim.isCalculated ? 'calculated' : ''}`} />

                <select
                value={dim.dataType}
                onChange={(e) => updateDimension(index, 'dataType', e.target.value as DimensionDataType)}
                className="createOption-dimensionSelect">

                  <option value="string">String</option>
                  <option value="number">Number</option>
                </select>
                {dim.dataType === 'number' &&
              <select
                value={dim.unit || ''}
                onChange={(e) => updateDimension(index, 'unit', e.target.value)}
                className="createOption-unitSelect">

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
              }
                <button
                type="button"
                onClick={() => removeDimension(index)}
                className="createOption-removeButton">

                  ✕
                </button>
              </div>

              {/* Row 2: Formula field - only for number type */}
              {dim.dataType === 'number' &&
            <div className="createOption-formulaRow">
                  <span className="createOption-formulaLabel">Formula:</span>
                  <input
                type="text"
                placeholder="e.g., length * width or optionType_purity / 100 (leave empty for manual value)"
                value={dim.formula || ''}
                onChange={(e) => updateDimension(index, 'formula', e.target.value)}
                onFocus={() => setActiveFormulaIndex(index)}
                className="createOption-formulaInput"
                style={{
                  borderColor: activeFormulaIndex === index ? '#3b82f6' : undefined,
                  boxShadow: activeFormulaIndex === index ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : undefined
                }} />

                  {dim.isCalculated &&
              <span className="createOption-autoBadge">Auto</span>
              }
                </div>
            }

              {/* Row 3: Visibility Toggle */}
              <div className="createOption-visibilityRow">
                <label className="createOption-visibilityLabel">
                  <input
                  type="checkbox"
                  checked={dim.visible}
                  onChange={(e) => updateDimension(index, 'visible', e.target.checked)} />

                  <span className={`createOption-visibilityText ${dim.visible ? 'visible' : 'hidden'}`}>
                    {dim.visible ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="createOption-formActions">
        <button onClick={handleSubmit} disabled={saveState === 'loading' || optionTypesLoading} className="createOption-button" style={{ opacity: saveState === 'loading' ? 0.7 : 1, transition: "all 0.2s ease" }}>
          {saveState === 'loading' ? 'Saving...' : isEditMode ? 'Update Option' : 'Save Option'}
        </button>
      </div>

      {/* Import Account Popup */}
      <ImportAccountPopup
        isOpen={showImportPopup}
        onClose={() => setShowImportPopup(false)}
        onDownloadTemplate={downloadExcelTemplate}
        onFileSelect={(e) => {
          handleExcelImport(e);
          setShowImportPopup(false);
        }}
        isImporting={bulkImporting}
        title="Import Options"
        infoMessage="Bulk import up to 50 options at once. Download the template first."
        buttonText="Import from Excel"
      />

      {/* Import Progress Popup */}
      <ImportProgressPopup
        isOpen={bulkImporting}
        currentIndex={importProgress.current}
        total={importProgress.total}
        successCount={importProgress.success}
        failedCount={importProgress.failed}
        message={`Importing ${importProgress.current} of ${importProgress.total} options...`}
      />

      {/* Import Summary Modal */}
      {importSummary && (
        <div className="import-summary-overlay" onClick={() => setImportSummary(null)}>
          <div className="import-summary-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', color: '#1f2937', textAlign: 'center' }}>
              Import Complete
            </h2>

            <div className="summary-stats">
              <div className="stat-box success">
                <div className="stat-number">{importSummary.success}</div>
                <div className="stat-label">Success</div>
              </div>
              <div className="stat-box failed">
                <div className="stat-number">{importSummary.failed}</div>
                <div className="stat-label">Failed</div>
              </div>
            </div>

            {importSummary.errors.length > 0 && (
              <div className="error-list">
                <h4 style={{ margin: '0 0 12px 0', color: '#dc2626', fontWeight: 600 }}>Errors:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                  {importSummary.errors.map((err, idx) => (
                    <li key={idx} style={{ marginBottom: '8px', color: '#991b1b', fontSize: '0.875rem' }}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setImportSummary(null)}
              style={{
                width: '100%',
                padding: '12px 24px',
                marginTop: '24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>);

};

export default CreateOption;