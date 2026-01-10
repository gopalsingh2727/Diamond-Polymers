import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import "./createOptionSpec.css";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { createOptionSpecV2, getOptionSpecsV2, getOptionTypesV2, getOptionsV2 } from "../../../../redux/unifiedV2";
import { Parser } from 'expr-eval';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import ImportProgressPopup from '../../../../../components/shared/ImportProgressPopup';
import ImportAccountPopup from '../../../../../components/shared/ImportAccountPopup';
import * as XLSX from 'xlsx';

// Reference dimension interface (for refer items)
interface ReferenceDimension {
  name: string;
  value: string | number | boolean | any;
  unit?: string;
  dataType: "string" | "number" | "boolean" | "date" | "file" | "link" | "dropdown";
  formula?: string;
  isCalculated?: boolean;
  includeInTotal?: boolean;
  totalFormula?: string;
}

// Reference item interface (each reference in a refer type)
interface ReferenceItem {
  optionTypeId?: string; // Optional - items can have just a name
  optionTypeName: string; // User-provided name (e.g., "Silver", "Platinum")
  dimensions: ReferenceDimension[];
  order: number;
}

interface Specification {
  name: string;
  value: string | number | boolean | any;
  unit?: string;
  dataType: "string" | "number" | "boolean" | "date" | "file" | "link" | "refer" | "dropdown";
  formula?: string;
  isCalculated?: boolean;
  referenceEnabled?: boolean;
  referenceTo?: string;
  comparisonOperator?: string;
  dropdownOptions?: string[]; // For dropdown type
  includeInTotal?: boolean; // Whether to include in totals row
  totalFormula?: string; // Formula for totals row calculation
  referenceItems?: ReferenceItem[]; // For refer type - multiple reference items
  visible?: boolean; // Whether this specification is visible (default true)
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

    // Custom formula evaluation - replace keywords with actual values
    let expression = formula;
    const sum = numericValues.reduce((sum, val) => sum + val, 0);
    const avg = sum / numericValues.length;
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);
    const count = numericValues.length;

    // Replace keywords (case insensitive)
    expression = expression.replace(/\bSUM\b/gi, sum.toString());
    expression = expression.replace(/\bAVERAGE\b/gi, avg.toString());
    expression = expression.replace(/\bAVG\b/gi, avg.toString());
    expression = expression.replace(/\bMAX\b/gi, max.toString());
    expression = expression.replace(/\bMIN\b/gi, min.toString());
    expression = expression.replace(/\bCOUNT\b/gi, count.toString());

    // Evaluate the expression safely
    // Remove any non-numeric/operator characters for safety
    const safeExpression = expression.replace(/[^0-9+\-*/.()]/g, '');
    if (safeExpression !== expression) {
      return 'Error: Invalid formula';
    }

    // Use Function constructor for safe evaluation
    const result = new Function('return ' + safeExpression)();

    if (typeof result === 'number' && !isNaN(result)) {
      return result;
    }

    return 'Error';
  } catch (error) {
    return 'Error';
  }
};

const CreateOptionSpec = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { handleSave, saveState, toast } = useCRUD();

  // Get option types and option specs from Redux
  const { list: optionTypes, loading: optionTypesLoading } = useSelector(
    (state: RootState) => state.v2.optionType
  );
  const { list: optionSpecs, loading: optionSpecsLoading } = useSelector(
    (state: RootState) => state.v2.optionSpec
  );
  // Get options (option names) from Redux
  const { list: options, loading: optionsLoading } = useSelector(
    (state: RootState) => state.v2.option
  );

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [optionTypeId, setOptionTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState<Specification[]>([]);

  // State for OptionSpec dimension name browser (to reference other OptionSpecs) - MULTIPLE SELECTION
  const [selectedReferenceSpecIds, setSelectedReferenceSpecIds] = useState<string[]>([]);
  const [referenceDimensionData, setReferenceDimensionData] = useState<{name: string;value: number;unit?: string;sourceName?: string;}[]>([]);

  // State for Option (Option Name) dimension browser - MULTIPLE SELECTION
  const [selectedReferenceOptionIds, setSelectedReferenceOptionIds] = useState<string[]>([]);
  const [referenceOptionDimensionData, setReferenceOptionDimensionData] = useState<{name: string;value: number;unit?: string;sourceName?: string;}[]>([]);

  // State for Option Type specifications (auto-populated when optionTypeId is selected)
  const [optionTypeSpecsData, setOptionTypeSpecsData] = useState<{name: string;defaultValue: number;unit?: string;}[]>([]);

  // State for tracking active formula field (for click-to-insert feature)
  const [activeFormulaIndex, setActiveFormulaIndex] = useState<number | null>(null);

  // State for reference popup (to select which dimension to reference)
  const [referencePopupIndex, setReferencePopupIndex] = useState<number | null>(null);

  // State for refer popup - DISABLED (not using this feature currently)
  // const [referPopupIndex, setReferPopupIndex] = useState<number | null>(null);
  // const [tempReferenceItems, setTempReferenceItems] = useState<ReferenceItem[]>([]);

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

  // Load option types, option specs, and options on mount
  useEffect(() => {
    dispatch(getOptionTypesV2());
    dispatch(getOptionSpecsV2());
    const branchId = localStorage.getItem('selectedBranch') || '';
    dispatch(getOptionsV2({ branchId }));
  }, [dispatch]);

  // Load template when OptionType is selected
  useEffect(() => {
    if (optionTypeId && optionTypes.length > 0) {
      const selectedType = optionTypes.find((ot: any) => ot._id === optionTypeId);
      // Check both specificationTemplate and specifications (new field name)
      const templateData = selectedType?.specificationTemplate || selectedType?.specifications || [];
      if (selectedType && templateData.length > 0) {
        // Load template dimensions with visible flag
        const templateSpecs = templateData.map((tmpl: any) => ({
          name: tmpl.name,
          value: tmpl.defaultValue || "",
          unit: tmpl.unit || "",
          dataType: tmpl.dataType || "string",
          formula: "",
          isCalculated: false,
          includeInTotal: true,
          totalFormula: "SUM",
          visible: tmpl.visible !== false // Default to true if not specified
        }));
        setSpecifications(templateSpecs);
      }
    }
  }, [optionTypeId, optionTypes]);

  // Extract dimension data when reference OptionSpecs are selected (MULTIPLE) - number types or numeric values for formulas
  useEffect(() => {
    if (selectedReferenceSpecIds.length > 0 && Array.isArray(optionSpecs)) {
      const allDimensionData: {name: string;value: number;unit?: string;sourceName?: string;}[] = [];

      selectedReferenceSpecIds.forEach((specId) => {
        const spec = optionSpecs.find((s: any) => s._id === specId);
        // Check both 'specifications' and 'dimensions' field names (backend may use either)
        const specData = spec?.specifications || spec?.dimensions || [];
        if (spec && specData.length > 0) {
          // Get dimensions that are number type OR have numeric values
          specData.
          filter((d: any) => {
            // Include if dataType is 'number'
            if (d.dataType === 'number') return true;
            // Include if value is a number or can be parsed as number
            const val = d.value;
            if (typeof val === 'number' && !isNaN(val)) return true;
            if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return true;
            return false;
          }).
          forEach((d: any) => {
            allDimensionData.push({
              name: d.name,
              value: Number(d.value) || 0,
              unit: d.unit || '',
              sourceName: spec.name || spec.code || 'Unknown'
            });
          });
        }
      });

      setReferenceDimensionData(allDimensionData);
    } else {
      setReferenceDimensionData([]);
    }
  }, [selectedReferenceSpecIds, optionSpecs]);

  // Extract dimension data when reference Options (Option Names) are selected (MULTIPLE) - number types or numeric values for formulas
  useEffect(() => {
    if (selectedReferenceOptionIds.length > 0 && Array.isArray(options)) {
      const allDimensionData: {name: string;value: number;unit?: string;sourceName?: string;}[] = [];

      selectedReferenceOptionIds.forEach((optionId) => {
        const option = options.find((o: any) => o._id === optionId);
        // Check both 'dimensions' and 'specifications' field names (backend may use either)
        const dimData = option?.dimensions || option?.specifications || [];
        if (option && dimData.length > 0) {
          // Get dimensions that are number type OR have numeric values
          dimData.
          filter((d: any) => {
            // Include if dataType is 'number'
            if (d.dataType === 'number') return true;
            // Include if value is a number or can be parsed as number
            const val = d.value;
            if (typeof val === 'number' && !isNaN(val)) return true;
            if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return true;
            return false;
          }).
          forEach((d: any) => {
            allDimensionData.push({
              name: d.name,
              value: Number(d.value) || 0,
              unit: d.unit || '',
              sourceName: option.name || 'Unknown'
            });
          });
        }
      });

      setReferenceOptionDimensionData(allDimensionData);
    } else {
      setReferenceOptionDimensionData([]);
    }
  }, [selectedReferenceOptionIds, options]);

  // Extract Option Type specifications when optionTypeId is selected (number types or numeric values for formulas)
  useEffect(() => {
    if (optionTypeId && optionTypes.length > 0) {
      const selectedType = optionTypes.find((ot: any) => ot._id === optionTypeId);
      const templateData = selectedType?.specificationTemplate || selectedType?.specifications || [];
      if (templateData.length > 0) {
        // Get specifications that are number type OR have numeric default values
        const specsData = templateData.
        filter((spec: any) => {
          // Include if dataType is 'number'
          if (spec.dataType === 'number') return true;
          // Include if defaultValue is a number or can be parsed as number
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

  const evaluateDimensionFormulas = (specs: Specification[]): Specification[] => {
    const parser = new Parser();
    const context: Record<string, number> = {};

    // Helper to make variable name formula-safe (replace spaces with underscores)
    const toVarName = (name: string) => name.replace(/\s+/g, '_');

    // ===== ADD REFERENCED OPTION SPEC VALUES TO CONTEXT (MULTIPLE) =====
    if (selectedReferenceSpecIds.length > 0 && Array.isArray(optionSpecs)) {
      selectedReferenceSpecIds.forEach((specId) => {
        const refSpec = optionSpecs.find((s: any) => s._id === specId);
        // Check both 'specifications' and 'dimensions' field names
        const refSpecData = refSpec?.specifications || refSpec?.dimensions || [];
        if (refSpec && refSpecData.length > 0) {
          refSpecData.forEach((dim: any) => {
            if (dim.dataType === 'number' || typeof dim.value === 'number' || !isNaN(Number(dim.value))) {
              const varName = toVarName(dim.name);
              const numValue = Number(dim.value) || 0;
              context[varName] = numValue;
              context[varName.toLowerCase()] = numValue;
              // Also add original name (for exact match)
              context[dim.name] = numValue;
            }
          });
        }
      });
    }

    // ===== ADD REFERENCED OPTION (OPTION NAME) VALUES TO CONTEXT (MULTIPLE) =====
    if (selectedReferenceOptionIds.length > 0 && Array.isArray(options)) {
      selectedReferenceOptionIds.forEach((optionId) => {
        const refOption = options.find((o: any) => o._id === optionId);
        // Check both 'dimensions' and 'specifications' field names
        const refOptionData = refOption?.dimensions || refOption?.specifications || [];
        if (refOption && refOptionData.length > 0) {
          refOptionData.forEach((dim: any) => {
            if (dim.dataType === 'number' || typeof dim.value === 'number' || !isNaN(Number(dim.value))) {
              const varName = toVarName(dim.name);
              const numValue = Number(dim.value) || 0;
              context[varName] = numValue;
              context[varName.toLowerCase()] = numValue;
              // Also add original name (for exact match)
              context[dim.name] = numValue;
            }
          });
        }
      });
    }

    // ===== ADD OPTION TYPE SPECIFICATIONS TO CONTEXT =====
    if (optionTypeSpecsData.length > 0) {
      optionTypeSpecsData.forEach((spec) => {
        const varName = toVarName(spec.name);
        // Use prefix to match backend: optionType_fieldName
        context['optionType_' + varName] = spec.defaultValue;
        context['optionType_' + varName.toLowerCase()] = spec.defaultValue;
        // Also add legacy prefixes for backward compatibility
        context['OT_' + varName] = spec.defaultValue;
        context['ot_' + varName.toLowerCase()] = spec.defaultValue;
      });
    }

    // First pass: collect all non-formula values from current spec
    specs.forEach((spec) => {
      if (!spec.formula && spec.dataType === 'number') {
        const varName = toVarName(spec.name);
        context[varName] = Number(spec.value) || 0;
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
          context[toVarName(spec.name)] = result;
          context[spec.name] = result;
        } catch (error) {

          spec.isCalculated = false;
        }
      }
      return spec;
    });
  };

  // Re-evaluate formulas when reference selections change
  useEffect(() => {
    if (specifications.length > 0 && specifications.some((s) => s.formula && s.formula.trim() !== '')) {
      try {
        const evaluated = evaluateDimensionFormulas(specifications);
        setSpecifications(evaluated);
      } catch (error) {

      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReferenceSpecIds, selectedReferenceOptionIds, referenceDimensionData, referenceOptionDimensionData]);

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
      referenceEnabled: false,
      referenceTo: "",
      comparisonOperator: "",
      includeInTotal: true, // Default to true
      totalFormula: "SUM", // Default formula
      visible: true // Default to visible
    }]
    );
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

  // Insert reference dimension name into active formula field
  const insertIntoFormula = (dimName: string) => {
    if (activeFormulaIndex === null) {
      alert('Please click on a formula field first, then click the dimension name to insert.');
      return;
    }
    const updated = [...specifications];
    const currentFormula = updated[activeFormulaIndex].formula || '';
    // Replace spaces with underscores for formula-safe variable names
    const safeDimName = dimName.replace(/\s+/g, '_');
    updated[activeFormulaIndex].formula = currentFormula + safeDimName;
    updated[activeFormulaIndex].isCalculated = true;

    // Re-evaluate all formulas after insertion
    try {
      const evaluated = evaluateDimensionFormulas(updated);
      setSpecifications(evaluated);
    } catch (error) {

      setSpecifications(updated);
    }
  };

  // ========== Refer Popup Handlers - DISABLED (not using this feature currently) ==========
  // Code kept for future reference - see bottom of file for full implementation

  const handleSubmit = async () => {
    if (!name || !code || !optionTypeId) {
      toast.error('Validation Error', 'Name, code, and option type are required');
      return;
    }

    const branchId = localStorage.getItem('selectedBranch') || '';

    // Convert specification values based on dataType and filter empty names
    const processedSpecs = specifications.
    filter((spec) => spec.name && spec.name.trim() !== '').
    map((spec) => {
      let processedValue: any = spec.value;

      if (spec.dataType === "number") {
        processedValue = Number(spec.value);
      } else if (spec.dataType === "boolean") {
        processedValue = spec.value === "true" || spec.value === true;
      }

      // Filter empty reference items and dimensions
      const filteredReferenceItems = (spec.referenceItems || []).
      filter((item) => item.optionTypeName && item.optionTypeName.trim() !== '').
      map((item) => ({
        ...item,
        dimensions: (item.dimensions || []).filter((dim) => dim.name && dim.name.trim() !== '')
      }));

      return {
        name: spec.name,
        value: processedValue,
        unit: spec.unit,
        dataType: spec.dataType,
        formula: spec.formula,
        isCalculated: spec.isCalculated,
        referenceEnabled: spec.referenceEnabled || false,
        referenceTo: spec.referenceTo || "",
        comparisonOperator: spec.comparisonOperator || "",
        dropdownOptions: spec.dropdownOptions || [],
        referenceItems: filteredReferenceItems,
        includeInTotal: spec.includeInTotal,
        totalFormula: spec.totalFormula,
        // 4 boolean flags
        public: spec.public || false,
        usedForFormulas: spec.usedForFormulas || false,
        orderTypeOnly: spec.orderTypeOnly || false,
        query: spec.query || false
      };
    });

    const saveAction = async () => {
      return dispatch(createOptionSpecV2({
        name,
        code,
        optionTypeId,
        description,
        specifications: processedSpecs,
        branchId
      }));
    };

    handleSave(saveAction, {
      successMessage: 'Option Spec created successfully',
      onSuccess: () => {
        // Reset form
        setName("");
        setCode("");
        setOptionTypeId("");
        setDescription("");
        setSpecifications([]);
      }
    });
  };

  // Excel import functions
  const downloadExcelTemplate = () => {
    const instructions = [
      ['Option Specification Bulk Import Template'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Maximum 50 option specifications per import'],
      ['2. Required fields are marked with * in column headers'],
      ['3. Delete the example rows before adding your data'],
      ['4. Option Type Name must exactly match an existing option type'],
      ['5. Code and Description are optional'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['Name * - Required. Option specification name (e.g., "Size A", "Model 1")'],
      ['Code - Optional. Specification code (e.g., "SA", "M1")'],
      ['Option Type Name * - Required. Must match existing option type name (e.g., "Size", "Model")'],
      ['Description - Optional. Description of the specification'],
    ];

    const templateData = [
      {
        'Name *': 'Size A',
        'Code': 'SA',
        'Option Type Name *': 'Size',
        'Description': 'Small size variant'
      },
      {
        'Name *': 'Model X',
        'Code': 'MX',
        'Option Type Name *': 'Model',
        'Description': 'Model X variant'
      },
    ];

    const wb = XLSX.utils.book_new();
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');
    XLSX.writeFile(wb, 'Option_Specification_Import_Template.xlsx');

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
          message: `Limiting import to first 50 specifications (found ${jsonData.length})`,
        });
        jsonData = jsonData.slice(0, 50);
      }

      const validationErrors: string[] = [];
      const processedData: any[] = [];
      const branchId = localStorage.getItem('selectedBranch') || "";

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;
        const errors: string[] = [];

        const name = row['Name *']?.toString().trim();
        if (!name) {
          errors.push(`Row ${rowNum}: Missing Name`);
        }

        const code = row['Code']?.toString().trim() || '';
        const description = row['Description']?.toString().trim() || '';

        const optionTypeName = row['Option Type Name *']?.toString().trim();
        let optionTypeId = '';
        if (!optionTypeName) {
          errors.push(`Row ${rowNum}: Missing Option Type Name`);
        } else {
          const optionType = (optionTypes as any[]).find(
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
            name,
            code,
            optionTypeId,
            description,
            specifications: [],
            branchId
          });
        } else {
          validationErrors.push(...errors);
        }
      });

      const validCount = processedData.length;
      const errorCount = validationErrors.length;

      const confirmMessage =
        `Ready to import ${validCount} option specifications.\n` +
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
        const specData = processedData[i];

        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createOptionSpecV2(specData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(
            `Row ${i + 2} (${specData.name}): ${errorMsg}`
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
          message: `Successfully imported ${successCount} option specification(s)`,
        });
        // Refresh option specs list
        dispatch(getOptionSpecsV2());
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

  const loadTemplate = (template: string) => {
    switch (template) {
      case "plasticBag":
        setSpecifications([
        { name: "length", value: 30, unit: "cm", dataType: "number", formula: "", isCalculated: false, includeInTotal: true, totalFormula: "SUM", public: false, usedForFormulas: true, orderTypeOnly: false, query: true },
        { name: "width", value: 20, unit: "cm", dataType: "number", formula: "", isCalculated: false, includeInTotal: true, totalFormula: "SUM", public: false, usedForFormulas: true, orderTypeOnly: false, query: true },
        { name: "thickness", value: 0.05, unit: "mm", dataType: "number", formula: "", isCalculated: false, includeInTotal: true, totalFormula: "SUM", public: false, usedForFormulas: true, orderTypeOnly: false, query: false },
        { name: "area", value: "", unit: "cm²", dataType: "number", formula: "length * width", isCalculated: true, includeInTotal: true, totalFormula: "SUM", public: true, usedForFormulas: false, orderTypeOnly: false, query: false },
        { name: "volume", value: "", unit: "cm³", dataType: "number", formula: "area * thickness / 10", isCalculated: true, includeInTotal: true, totalFormula: "SUM", public: true, usedForFormulas: false, orderTypeOnly: false, query: false }]
        );
        break;
      case "container":
        setSpecifications([
        { name: "diameter", value: 10, unit: "cm", dataType: "number", formula: "", isCalculated: false, includeInTotal: true, totalFormula: "SUM", public: false, usedForFormulas: true, orderTypeOnly: false, query: true },
        { name: "height", value: 15, unit: "cm", dataType: "number", formula: "", isCalculated: false, includeInTotal: true, totalFormula: "SUM", public: false, usedForFormulas: true, orderTypeOnly: false, query: true },
        { name: "thickness", value: 2, unit: "mm", dataType: "number", formula: "", isCalculated: false, includeInTotal: true, totalFormula: "SUM", public: false, usedForFormulas: true, orderTypeOnly: false, query: false },
        { name: "radius", value: "", unit: "cm", dataType: "number", formula: "diameter / 2", isCalculated: true, includeInTotal: true, totalFormula: "SUM", public: false, usedForFormulas: false, orderTypeOnly: false, query: false },
        { name: "volume", value: "", unit: "cm³", dataType: "number", formula: "3.14159 * radius * radius * height", isCalculated: true, includeInTotal: true, totalFormula: "SUM", public: true, usedForFormulas: false, orderTypeOnly: false, query: false }]
        );
        break;
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
          style={{ backgroundColor: '#c8e6c9', flex: 1 }} />);


    }

    switch (spec.dataType) {
      case 'string':
        return (
          <input
            placeholder="Value"
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }} />);



      case 'number':
        return (
          <input
            type="number"
            placeholder="Value"
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }} />);



      case 'boolean':
        return (
          <select
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}>

            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>);


      case 'date':
        return (
          <input
            type="date"
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }} />);



      case 'file':
        return (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '4px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#166534',
              fontWeight: 500
            }}>
              📎 File Upload Field (Files uploaded in Create Order)
            </span>
          </div>);


      case 'link':
        return (
          <input
            type="url"
            placeholder="Enter URL"
            value={typeof spec.value === 'string' ? spec.value : spec.value?.url || ''}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }} />);



      case 'refer':
        return (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '4px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#0369a1',
              fontWeight: 500
            }}>
              🔗 Reference Type (Feature coming soon)
            </span>
          </div>);


      case 'dropdown':
        return (
          <select
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}>

            <option value="">Select option</option>
            {spec.dropdownOptions && spec.dropdownOptions.length > 0 ?
            spec.dropdownOptions.map((option, idx) =>
            <option key={idx} value={option}>
                  {option}
                </option>
            ) :

            <option disabled>No options configured</option>
            }
          </select>);


      default:
        return (
          <input
            placeholder="Value"
            value={spec.value.toString()}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }} />);


    }
  };

  return (
    <div className="createOptionSpec-container">
      {/* Header Section */}
      <div className="createOptionSpec-header">
        <div className="createaccount-title-row">
          <h1 className="createOptionSpec-title" style={{ margin: 0, border: 'none', padding: 0 }}>Create Option Specification</h1>

          <button
            type="button"
            onClick={() => setShowImportPopup(true)}
            className="import-accounts-title-btn"
            disabled={bulkImporting}
          >
            Import Specs
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </button>
        </div>
        <p className="createOptionSpec-subtitle">Configure specifications for your manufacturing options</p>
      </div>

      {/* Template Buttons Section */}
      <div className="createOptionSpec-section">
        <h3 className="createOptionSpec-sectionTitle">Quick Templates</h3>
        <div className="createOptionSpec-templateButtons">
          <button
            onClick={() => loadTemplate("plasticBag")}
            className="createOptionSpec-templateBtn">

            Load Bag Template
          </button>
          <button
            onClick={() => loadTemplate("container")}
            className="createOptionSpec-templateBtn">

            Load Container Template
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="createOptionSpec-formGrid">
        {/* Basic Information Section */}
        <div className="createOptionSpec-section">
          <h3 className="createOptionSpec-sectionTitle">Basic Information</h3>

          <div className="createOptionSpec-formRow">
            <div className="createOptionSpec-formColumn">
              <label className="createOptionSpec-label">Spec Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="createOptionSpec-input"
                placeholder="e.g., LDPE 500x300x50" />

            </div>

            <div className="createOptionSpec-formColumn">
              <label className="createOptionSpec-label">Spec Code *</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="createOptionSpec-input"
                placeholder="e.g., LDPE-500-300" />

            </div>
          </div>

          <div className="createOptionSpec-formRow">
            <div className="createOptionSpec-formColumn">
              <label className="createOptionSpec-label">Option Type *</label>
              <select
                value={optionTypeId}
                onChange={(e) => setOptionTypeId(e.target.value)}
                className="createOptionSpec-input">

                <option value="">Select option type</option>
                {Array.isArray(optionTypes) && optionTypes.map((type: any) =>
                <option key={type._id} value={type._id}>
                    {type.name} ({type.category})
                  </option>
                )}
              </select>
            </div>

            <div className="createOptionSpec-formColumn">
              <label className="createOptionSpec-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="createOptionSpec-input"
                rows={2}
                placeholder="Optional description" />

            </div>
          </div>
        </div>

        {/* Reference Option Type Specifications Browser (Auto-populated) */}
        {optionTypeId &&
        <div className="createOptionSpec-formColumn">
            <div className="createOptionSpec-referenceBox" style={{ background: '#d1fae5', borderColor: '#10b981' }}>
              <h3 className="createOptionSpec-referenceTitle" style={{ color: '#065f46' }}>
                📦 Option Type Specifications (Numbers Only)
              </h3>
              <p className="createOptionSpec-referenceText">
                These are the <strong>number</strong> specifications from the selected Option Type. Use <code style={{ background: '#a7f3d0', padding: '2px 6px', borderRadius: '4px' }}>OT_</code> prefix in formulas.
              </p>

              {optionTypeSpecsData.length > 0 ?
            <div>
                  <div className="createOptionSpec-referenceLabel" style={{ marginBottom: '0.5rem' }}>
                    Available specifications from "{Array.isArray(optionTypes) ? optionTypes.find((ot: any) => ot._id === optionTypeId)?.name : ''}" (click to insert):
                  </div>
                  <div className="createOptionSpec-dimensionTags">
                    {optionTypeSpecsData.map((spec, idx) =>
                <span
                  key={idx}
                  className="createOptionSpec-dimensionTag"
                  onClick={() => insertIntoFormula('optionType_' + spec.name.replace(/\s+/g, '_'))}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#d1fae5',
                    border: '1px solid #10b981'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#10b981';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#d1fae5';
                    e.currentTarget.style.color = '';
                    e.currentTarget.style.transform = '';
                  }}
                  title={`Click to insert "optionType_${spec.name.replace(/\s+/g, '_')}" into formula (Default value: ${spec.defaultValue}${spec.unit ? ' ' + spec.unit : ''})`}>

                        <strong>optionType_{spec.name.replace(/\s+/g, '_')}</strong>
                        <span style={{
                    background: 'rgba(0,0,0,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                          = {spec.defaultValue}{spec.unit ? ` ${spec.unit}` : ''}
                        </span>
                      </span>
                )}
                  </div>
                  <div className="createOptionSpec-referenceHint" style={{ background: '#a7f3d0' }}>
                    💡 <strong>How to use:</strong> Click on a formula field below, then click on any specification above to insert it.
                    <br />
                    <strong>Note:</strong> Use the <code style={{ background: '#6ee7b7', padding: '2px 6px', borderRadius: '4px' }}>OT_</code> prefix (e.g., <code style={{ background: '#6ee7b7', padding: '2px 6px', borderRadius: '4px' }}>OT_length</code>) to reference Option Type specs.
                  </div>
                </div> :

            <div className="createOptionSpec-referenceEmpty" style={{ background: '#a7f3d0' }}>
                  ℹ️ The selected Option Type has no number-type specifications. Only number specifications can be used in formulas.
                </div>
            }
            </div>
          </div>
        }

        {/* Reference OptionSpec Dimension Browser */}
        <div className="createOptionSpec-formColumn">
          <div className="createOptionSpec-referenceBox">
            <h3 className="createOptionSpec-referenceTitle">
              📋 Reference Other Option Spec Dimensions (Numbers Only)
            </h3>
            <p className="createOptionSpec-referenceText">
              Select <strong>multiple</strong> Option Specs to see their <strong>number</strong> dimension names for use in formulas.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label className="createOptionSpec-referenceLabel">
                Select Option Specs (Multiple):
              </label>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px',
                background: '#f9fafb'
              }}>
                {Array.isArray(optionSpecs) && optionSpecs.length > 0 ?
                optionSpecs.map((spec: any) =>
                <label
                  key={spec._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    background: selectedReferenceSpecIds.includes(spec._id) ? '#dbeafe' : 'transparent',
                    border: selectedReferenceSpecIds.includes(spec._id) ? '1px solid #3b82f6' : '1px solid transparent'
                  }}>

                      <input
                    type="checkbox"
                    checked={selectedReferenceSpecIds.includes(spec._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReferenceSpecIds([...selectedReferenceSpecIds, spec._id]);
                      } else {
                        setSelectedReferenceSpecIds(selectedReferenceSpecIds.filter((id) => id !== spec._id));
                      }
                    }} />

                      <span style={{ fontSize: '13px' }}>{spec.name} - {spec.code}</span>
                    </label>
                ) :

                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>No Option Specs available</p>
                }
              </div>
              {selectedReferenceSpecIds.length > 0 &&
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669' }}>
                  ✓ {selectedReferenceSpecIds.length} Option Spec(s) selected
                </div>
              }
            </div>

            {referenceDimensionData.length > 0 &&
            <div>
                <div className="createOptionSpec-referenceLabel" style={{ marginBottom: '0.5rem' }}>
                  Available dimensions from selected Option Specs (click to insert):
                </div>
                <div className="createOptionSpec-dimensionTags">
                  {referenceDimensionData.map((dim, idx) => {
                  const safeName = dim.name.replace(/\s+/g, '_');
                  return (
                    <span
                      key={idx}
                      className="createOptionSpec-dimensionTag"
                      onClick={() => insertIntoFormula(dim.name)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#3b82f6';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.color = '';
                        e.currentTarget.style.transform = '';
                      }}
                      title={`Click to insert "${safeName}" into formula (From: ${dim.sourceName}, Value: ${dim.value}${dim.unit ? ' ' + dim.unit : ''})`}>

                      <strong>{safeName}</strong>
                      <span style={{
                        background: 'rgba(0,0,0,0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        = {dim.value}{dim.unit ? ` ${dim.unit}` : ''}
                      </span>
                      {dim.sourceName &&
                      <span style={{
                        background: '#dbeafe',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#1d4ed8'
                      }}>
                          {dim.sourceName}
                        </span>
                      }
                    </span>);

                })}
                </div>
                <div className="createOptionSpec-referenceHint">
                  💡 <strong>How to use:</strong> Click on a formula field below, then click on any dimension above to insert it.
                  For example: <code className="createOptionSpec-code">myValue / {referenceDimensionData[0]?.name?.replace(/\s+/g, '_') || 'dimension_name'}</code>
                  <br />
                  <strong>Values shown are from the selected Option Specs and will be used in formula calculations.</strong>
                </div>
              </div>
            }

            {selectedReferenceSpecIds.length === 0 &&
            <div className="createOptionSpec-referenceEmpty">
                ℹ️ Select one or more Option Specs above to see available dimension names that you can use in formulas
              </div>
            }
          </div>
        </div>

        {/* Reference Option Name Dimension Browser */}
        <div className="createOptionSpec-formColumn">
          <div className="createOptionSpec-referenceBox" style={{ background: '#fef3c7', borderColor: '#fbbf24' }}>
            <h3 className="createOptionSpec-referenceTitle" style={{ color: '#b45309' }}>
              🏷️ Reference Option Name Dimensions (Numbers Only)
            </h3>
            <p className="createOptionSpec-referenceText">
              Select <strong>multiple</strong> Options (Option Names) to see their <strong>number</strong> dimension names for use in formulas.
            </p>

            {/* First select Option Type to filter Option Names */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label className="createOptionSpec-referenceLabel">
                Filter by Option Type:
              </label>
              <select
                value={optionTypeId || ''}
                disabled={true}
                className="createOptionSpec-input"
                style={{ background: '#f3f4f6' }}>

                <option value="">-- Select Option Type above first --</option>
                {Array.isArray(optionTypes) && optionTypes.map((ot: any) =>
                <option key={ot._id} value={ot._id}>
                    {ot.name}
                  </option>
                )}
              </select>
              <small style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                Option Names are filtered by the Option Type selected above
              </small>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="createOptionSpec-referenceLabel">
                Select Option Names (Multiple):
              </label>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #fbbf24',
                borderRadius: '6px',
                padding: '8px',
                background: '#fffbeb',
                opacity: optionTypeId ? 1 : 0.5
              }}>
                {!optionTypeId ?
                <p style={{ color: '#92400e', fontSize: '12px', margin: 0 }}>Please select an Option Type above first</p> :

                <>
                    {Array.isArray(options) && options.
                  filter((option: any) => {
                    // Filter by selected optionTypeId
                    if (!optionTypeId) return false;
                    const optTypeId = typeof option.optionTypeId === 'string' ?
                    option.optionTypeId :
                    option.optionTypeId?._id || option.optionType?._id;
                    return optTypeId === optionTypeId;
                  }).
                  map((option: any) =>
                  <label
                    key={option._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      background: selectedReferenceOptionIds.includes(option._id) ? '#fef08a' : 'transparent',
                      border: selectedReferenceOptionIds.includes(option._id) ? '1px solid #f59e0b' : '1px solid transparent'
                    }}>

                          <input
                      type="checkbox"
                      checked={selectedReferenceOptionIds.includes(option._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReferenceOptionIds([...selectedReferenceOptionIds, option._id]);
                        } else {
                          setSelectedReferenceOptionIds(selectedReferenceOptionIds.filter((id) => id !== option._id));
                        }
                      }} />

                          <span style={{ fontSize: '13px' }}>{option.name}</span>
                        </label>
                  )}
                    {Array.isArray(options) && options.filter((option: any) => {
                    if (!optionTypeId) return false;
                    const optTypeId = typeof option.optionTypeId === 'string' ?
                    option.optionTypeId :
                    option.optionTypeId?._id || option.optionType?._id;
                    return optTypeId === optionTypeId;
                  }).length === 0 &&
                  <p style={{ color: '#92400e', fontSize: '12px', margin: 0 }}>No Options found for this Option Type</p>
                  }
                  </>
                }
              </div>
              {selectedReferenceOptionIds.length > 0 &&
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#b45309' }}>
                  ✓ {selectedReferenceOptionIds.length} Option Name(s) selected
                </div>
              }
            </div>

            {referenceOptionDimensionData.length > 0 &&
            <div>
                <div className="createOptionSpec-referenceLabel" style={{ marginBottom: '0.5rem' }}>
                  Available dimensions from selected Option Names (click to insert):
                </div>
                <div className="createOptionSpec-dimensionTags">
                  {referenceOptionDimensionData.map((dim, idx) => {
                  const safeName = dim.name.replace(/\s+/g, '_');
                  return (
                    <span
                      key={idx}
                      className="createOptionSpec-dimensionTag"
                      onClick={() => insertIntoFormula(dim.name)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fef3c7',
                        border: '1px solid #fbbf24'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f59e0b';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fef3c7';
                        e.currentTarget.style.color = '';
                        e.currentTarget.style.transform = '';
                      }}
                      title={`Click to insert "${safeName}" into formula (From: ${dim.sourceName}, Value: ${dim.value}${dim.unit ? ' ' + dim.unit : ''})`}>

                      <strong>{safeName}</strong>
                      <span style={{
                        background: 'rgba(0,0,0,0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        = {dim.value}{dim.unit ? ` ${dim.unit}` : ''}
                      </span>
                      {dim.sourceName &&
                      <span style={{
                        background: '#fef08a',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#92400e'
                      }}>
                          {dim.sourceName}
                        </span>
                      }
                    </span>);

                })}
                </div>
                <div className="createOptionSpec-referenceHint" style={{ background: '#fef9c3' }}>
                  💡 <strong>How to use:</strong> Click on a formula field below, then click on any dimension above to insert it.
                  <br />
                  <strong>Values shown are from the selected Option Names and will be used in formula calculations.</strong>
                </div>
              </div>
            }

            {selectedReferenceOptionIds.length === 0 &&
            <div className="createOptionSpec-referenceEmpty" style={{ background: '#fef9c3' }}>
                ℹ️ Select one or more Option Names above to see available dimension names that you can use in formulas
              </div>
            }

            {selectedReferenceOptionIds.length > 0 && referenceOptionDimensionData.length === 0 &&
            <div className="createOptionSpec-referenceEmpty" style={{ background: '#fef9c3' }}>
                ℹ️ The selected Option Names have no number-type dimensions. Only number dimensions can be used in formulas.
              </div>
            }
          </div>
        </div>

        {/* Specifications Section */}
        <div className="createOptionSpec-section">
          <div className="createOptionSpec-dimensionsHeader">
            <h3 className="createOptionSpec-sectionTitle" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Specifications</h3>
            <button
              onClick={addDimension}
              className="createOptionSpec-addDimensionBtn">

              + Add Dimension
            </button>
          </div>

          {specifications.map((spec, index) =>
          <div
            key={index}
            className="createOptionSpec-dimensionRow"
            style={{
              backgroundColor: spec.isCalculated ? '#e8f5e9' : 'transparent',
              marginBottom: '16px'
            }}>

              {/* Main dimension row */}
              <div className="createOptionSpec-dimensionFields" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                placeholder="Name"
                value={spec.name}
                onChange={(e) => updateDimension(index, "name", e.target.value)}
                style={{ flex: 1 }} />


                {renderValueInput(spec, index)}

                {spec.dataType === 'number' &&
              <select
                value={spec.unit || ""}
                onChange={(e) => updateDimension(index, "unit", e.target.value)}
                style={{ width: '80px' }}>

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
              }

                <select
                value={spec.dataType}
                onChange={(e) => updateDimension(index, "dataType", e.target.value as Specification["dataType"])}
                style={{ width: '100px' }}>

                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="file">File</option>
                  <option value="link">Link</option>
                  <option value="refer">Refer</option>
                  <option value="dropdown">Dropdown</option>
                </select>

                {/* Include in Total toggle - only for number type */}
                {spec.dataType === 'number' &&
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '12px', whiteSpace: 'nowrap' }} title="Include this field in totals row">
                      Total:
                    </label>
                    <input
                  type="checkbox"
                  checked={spec.includeInTotal !== false} // Default to true
                  onChange={(e) => updateDimension(index, "includeInTotal", e.target.checked)}
                  title="Include this field in totals row" />

                  </div>
              }

                <button
                onClick={() => removeDimension(index)}
                className="createOptionSpec-removeDimensionBtn">

                  ✕
                </button>
              </div>

              {/* Formula field - only for number type */}
              {spec.dataType === 'number' &&
            <div className="createOptionSpec-formulaRow">
                  <span className="createOptionSpec-formulaLabel">Formula:</span>
                  <input
                placeholder="e.g., length * width (leave empty for manual value)"
                value={spec.formula || ""}
                onChange={(e) => updateDimension(index, "formula", e.target.value)}
                onFocus={() => setActiveFormulaIndex(index)}
                className="createOptionSpec-formulaInput"
                style={{
                  borderColor: activeFormulaIndex === index ? '#3b82f6' : undefined,
                  boxShadow: activeFormulaIndex === index ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : undefined
                }} />

                  {spec.isCalculated &&
              <span className="createOptionSpec-formulaBadge">
                      🧮 Auto
                    </span>
              }
                </div>
            }

              {/* Visible Toggle Row */}
              <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              marginTop: '8px',
              padding: '10px 12px',
              background: '#f0fdf4',
              borderRadius: '6px',
              border: '1px solid #bbf7d0'
            }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                  type="checkbox"
                  checked={spec.visible !== false}
                  onChange={(e) => updateDimension(index, "visible", e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }} />

                  <span style={{ fontSize: '13px', fontWeight: 600, color: spec.visible !== false ? '#059669' : '#6b7280' }}>
                    Visible
                  </span>
                </label>
              </div>

              {/* Dropdown options configuration - only for dropdown type */}
              {spec.dataType === 'dropdown' &&
            <div style={{ marginTop: '8px', padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500 }}>Dropdown Options:</label>
                    <button
                  onClick={() => {
                    const updated = [...specifications];
                    if (!updated[index].dropdownOptions) {
                      updated[index].dropdownOptions = [];
                    }
                    updated[index].dropdownOptions!.push('');
                    setSpecifications(updated);
                  }}
                  style={{
                    padding: '4px 10px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}>

                      + Add Option
                    </button>
                  </div>

                  {spec.dropdownOptions && spec.dropdownOptions.length > 0 ?
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {spec.dropdownOptions.map((option, optIdx) =>
                <div key={optIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                    placeholder={`Option ${optIdx + 1}`}
                    value={option}
                    onChange={(e) => {
                      const updated = [...specifications];
                      updated[index].dropdownOptions![optIdx] = e.target.value;
                      setSpecifications(updated);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }} />

                          <button
                    onClick={() => {
                      const updated = [...specifications];
                      updated[index].dropdownOptions = updated[index].dropdownOptions!.filter((_, i) => i !== optIdx);
                      setSpecifications(updated);
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}>

                            ✕
                          </button>
                        </div>
                )}
                    </div> :

              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                      No options added. Click "+ Add Option" to add dropdown choices.
                    </p>
              }
                </div>
            }
            </div>
          )}

          {specifications.length === 0 &&
          <p className="createOptionSpec-emptyState">
              No specifications added. Select an Option Type to load template, or click "+ Add Dimension" to start.
            </p>
          }

          {/* Enhanced Total Row with Formula Support */}
          {specifications.length > 0 && specifications.some((s) => s.dataType === 'number' && s.includeInTotal !== false) &&
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '8px',
            border: '2px solid #f59e0b'
          }}>
              <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
                <strong style={{ fontSize: '16px', color: '#78350f' }}>📊 TOTALS ROW</strong>
                <span style={{ fontSize: '12px', color: '#92400e' }}>
                  (Type formulas: SUM, AVERAGE, MAX, MIN, COUNT, or custom like (SUM+MAX)/2)
                </span>
              </div>

              <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
                {specifications.
              filter((s) => s.dataType === 'number' && s.includeInTotal !== false).
              map((spec, idx) => {
                // Get current value(s) - in this case just the single value
                const values = [Number(spec.value) || 0];
                const formula = spec.totalFormula || 'SUM';
                const result = evaluateTotalFormula(formula, values);

                return (
                  <div key={idx} style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #fbbf24'
                  }}>
                        <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#92400e',
                      marginBottom: '8px'
                    }}>
                          {spec.name} {spec.unit && `(${spec.unit})`}
                        </label>

                        <input
                      type="text"
                      placeholder="e.g., SUM, AVERAGE, MAX"
                      value={formula}
                      onChange={(e) => updateDimension(
                        specifications.findIndex((s) => s.name === spec.name),
                        "totalFormula",
                        e.target.value
                      )}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #d97706',
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginBottom: '8px',
                        fontFamily: 'monospace'
                      }}
                      title="Enter formula: SUM, AVERAGE, MAX, MIN, COUNT, or custom like (SUM+MAX)/2" />


                        <div style={{
                      padding: '10px',
                      background: typeof result === 'number' ? '#dcfce7' : '#fee2e2',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: typeof result === 'number' ? '#166534' : '#991b1b'
                    }}>
                          {typeof result === 'number' ? result.toFixed(2) : result}
                          {typeof result === 'number' && spec.unit && ` ${spec.unit}`}
                        </div>

                        <div style={{
                      fontSize: '11px',
                      color: '#78350f',
                      marginTop: '6px',
                      textAlign: 'center'
                    }}>
                          Current value: {Number(spec.value).toFixed(2) || 0}
                        </div>
                      </div>);

              })}
              </div>

              <div style={{
              marginTop: '12px',
              padding: '10px',
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#78350f'
            }}>
                <strong>💡 Tip:</strong> Use the "Total" checkbox next to each number field to include/exclude it from this totals section.
                When using formulas, they operate on the current specification values above.
              </div>
            </div>
          }
        </div>

      </div>

      {/* Form Actions */}
      <div className="createOptionSpec-formActions">
        <button
          onClick={handleSubmit}
          disabled={saveState === 'loading'}
          className="createOptionSpec-button"
          style={{ opacity: saveState === 'loading' ? 0.7 : 1, transition: "all 0.2s ease" }}>

          {saveState === 'loading' ? "Saving..." : "Save Option Spec"}
        </button>
      </div>

      {/* Reference Popup - Select dimension to reference */}
      {referencePopupIndex !== null &&
      <div className="popup-overlay">
          <div className="popup" style={{ maxWidth: '600px' }}>
            <div className="popup-content">
              <h3>Select Dimension to Reference</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                Choose which dimension this "{specifications[referencePopupIndex]?.name}" should reference
              </p>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {specifications.
              filter((s, idx) => idx !== referencePopupIndex) // Don't show current dimension
              .map((spec, idx) =>
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
                }}>

                      <div style={{ fontWeight: 500, fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>
                        {spec.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Type: {spec.dataType} {spec.unit && `• Unit: ${spec.unit}`}
                      </div>
                    </div>
              )}

                {specifications.filter((s, idx) => idx !== referencePopupIndex).length === 0 &&
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No other dimensions available to reference. Add more dimensions first.
                  </div>
              }
              </div>

              <div className="popupButtons" style={{ marginTop: '20px' }}>
                <button onClick={() => setReferencePopupIndex(null)} className="createOptionSpec-cancelBtn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }

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
        title="Import Option Specifications"
        infoMessage="Bulk import up to 50 option specifications at once. Download the template first."
        buttonText="Import from Excel"
      />

      {/* Import Progress Popup */}
      <ImportProgressPopup
        isOpen={bulkImporting}
        currentIndex={importProgress.current}
        total={importProgress.total}
        successCount={importProgress.success}
        failedCount={importProgress.failed}
        message={`Importing ${importProgress.current} of ${importProgress.total} option specifications...`}
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

export default CreateOptionSpec;