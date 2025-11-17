import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMachineTypes } from "../../../../redux/create/machineType/machineTypeActions";
import { createMachine } from "../../../../redux/create/machine/MachineActions";
import { getProductSpecs } from "../../../../redux/create/productSpec/productSpecActions";
import { getMaterialSpecs } from "../../../../redux/create/materialSpec/materialSpecActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { Plus, Trash2, Download, Settings, Calculator, Eye, Table, Edit2, Check, X } from 'lucide-react';
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import "./createMachine.css";

type MachineSize = { x: string; y: string; z: string };

interface TableColumn {
  name: string;
  dataType: 'text' | 'number' | 'formula' | 'date';
  isRequired: boolean;
  order: number;
  placeholder: string;
}

interface Formula {
  expression: string;
  dependencies: string[];
  description: string;
}

interface TableRow {
  id: string;
  data: Record<string, any>;
}

const CreateMachine: React.FC = () => {
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [size, setSize] = useState<MachineSize>({ x: "", y: "", z: "" });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 🚀 CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  // View Mode State
  const [viewMode, setViewMode] = useState<'config' | 'preview' | 'data' | 'operatorView'>('config');

  // Table Configuration State
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([
    { name: 'Material Type', dataType: 'text', isRequired: true, order: 0, placeholder: 'Enter material name' },
    { name: 'Raw Weight', dataType: 'number', isRequired: true, order: 1, placeholder: 'Enter raw weight in kg' },
    { name: 'Wastage', dataType: 'number', isRequired: false, order: 2, placeholder: 'Enter wastage in kg' },
    { name: 'Net Weight', dataType: 'formula', isRequired: false, order: 3, placeholder: 'Auto calculated' }
  ]);
  
  const [tableFormulas, setTableFormulas] = useState<Record<string, Formula>>({
    'Net Weight': {
      expression: 'Raw Weight - Wastage',
      dependencies: ['Raw Weight', 'Wastage'],
      description: 'Net weight after removing wastage'
    }
  });

  // Test data for preview mode
  const [testRows, setTestRows] = useState<TableRow[]>([]);

  // Data Rows State
  const [tableRows, setTableRows] = useState<TableRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [currentRowData, setCurrentRowData] = useState<Record<string, any>>({});

  // UI State
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<'text' | 'number' | 'formula' | 'date'>('text');
  const [newColumnRequired, setNewColumnRequired] = useState(false);
  const [selectedFormulaColumn, setSelectedFormulaColumn] = useState('');
  const [formulaExpression, setFormulaExpression] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');

  // Operator View Configuration State - Separated into "for formulas" and "to show"
  const [productDimensionsForFormulas, setProductDimensionsForFormulas] = useState<string[]>([]);
  const [productDimensionsToShow, setProductDimensionsToShow] = useState<string[]>([]);
  const [materialDimensionsForFormulas, setMaterialDimensionsForFormulas] = useState<string[]>([]);
  const [materialDimensionsToShow, setMaterialDimensionsToShow] = useState<string[]>([]);
  const [operatorCalculations, setOperatorCalculations] = useState<Array<{
    name: string;
    displayName: string;
    formula: string;
    unit: string;
    description: string;
  }>>([]);

  // Operator View UI State - Lists of available specs and dimensions
  const [selectedProductSpecId, setSelectedProductSpecId] = useState('');
  const [selectedMaterialSpecId, setSelectedMaterialSpecId] = useState('');
  const [availableProductDimensions, setAvailableProductDimensions] = useState<string[]>([]);
  const [availableMaterialDimensions, setAvailableMaterialDimensions] = useState<string[]>([]);
  const [selectedProductDimToAdd, setSelectedProductDimToAdd] = useState('');
  const [selectedMaterialDimToAdd, setSelectedMaterialDimToAdd] = useState('');
  const [newCalculation, setNewCalculation] = useState({
    name: '',
    displayName: '',
    formula: '',
    unit: '',
    description: ''
  });
  const [formulaValidation, setFormulaValidation] = useState<{
    isValid: boolean;
    errors: string[];
    missingDimensions: string[];
  }>({ isValid: true, errors: [], missingDimensions: [] });
  const [formulaTestResult, setFormulaTestResult] = useState<{
    success: boolean;
    result: number | null;
    testValues: Record<string, number>;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: machineTypes, loading } = useSelector(
    (state: RootState) => state.machineTypeList
  );

  // Get Product Specs and Material Specs from Redux
  const { productSpecs = [] } = useSelector(
    (state: RootState) => state.productSpecList || { productSpecs: [] }
  );
  const { materialSpecs = [] } = useSelector(
    (state: RootState) => state.materialSpecList || { materialSpecs: [] }
  );

  // Predefined table templates
  const tableTemplates: { name: string; columns: TableColumn[]; formulas: Record<string, Formula>; }[] = [
    {
      name: 'Basic Weight Processing',
      columns: [
        { name: 'Material Type', dataType: 'text' as const, isRequired: true, order: 0, placeholder: 'Enter material name' },
        { name: 'Raw Weight', dataType: 'number' as const, isRequired: true, order: 1, placeholder: 'Enter raw weight in kg' },
        { name: 'Wastage', dataType: 'number' as const, isRequired: false, order: 2, placeholder: 'Enter wastage in kg' },
        { name: 'Net Weight', dataType: 'formula' as const, isRequired: false, order: 3, placeholder: 'Auto calculated' }
      ],
      formulas: {
        'Net Weight': {
          expression: 'Raw Weight - Wastage',
          dependencies: ['Raw Weight', 'Wastage'],
          description: 'Net weight after removing wastage'
        }
      }
    },
    {
      name: 'Production Costing',
      columns: [
        { name: 'Item Name', dataType: 'text' as const, isRequired: true, order: 0, placeholder: 'Enter item name' },
        { name: 'Quantity', dataType: 'number' as const, isRequired: true, order: 1, placeholder: 'Enter quantity' },
        { name: 'Unit Cost', dataType: 'number' as const, isRequired: true, order: 2, placeholder: 'Enter unit cost' },
        { name: 'Total Cost', dataType: 'formula' as const, isRequired: false, order: 3, placeholder: 'Auto calculated' },
        { name: 'Markup %', dataType: 'number' as const, isRequired: false, order: 4, placeholder: 'Enter markup percentage' },
        { name: 'Selling Price', dataType: 'formula' as const, isRequired: false, order: 5, placeholder: 'Auto calculated' }
      ],
      formulas: {
        'Total Cost': {
          expression: 'Quantity * Unit Cost',
          dependencies: ['Quantity', 'Unit Cost'],
          description: 'Total cost calculation'
        },
        'Selling Price': {
          expression: 'Total Cost + (Total Cost * Markup % / 100)',
          dependencies: ['Total Cost', 'Markup %'],
          description: 'Selling price with markup'
        }
      }
    },
    {
      name: 'Quality Control',
      columns: [
        { name: 'Batch ID', dataType: 'text' as const, isRequired: true, order: 0, placeholder: 'Enter batch ID' },
        { name: 'Total Units', dataType: 'number' as const, isRequired: true, order: 1, placeholder: 'Enter total units' },
        { name: 'Defective Units', dataType: 'number' as const, isRequired: true, order: 2, placeholder: 'Enter defective units' },
        { name: 'Pass Rate %', dataType: 'formula' as const, isRequired: false, order: 3, placeholder: 'Auto calculated' },
        { name: 'Good Units', dataType: 'formula' as const, isRequired: false, order: 4, placeholder: 'Auto calculated' }
      ],
      formulas: {
        'Pass Rate %': {
          expression: '((Total Units - Defective Units) / Total Units) * 100',
          dependencies: ['Total Units', 'Defective Units'],
          description: 'Quality pass rate percentage'
        },
        'Good Units': {
          expression: 'Total Units - Defective Units',
          dependencies: ['Total Units', 'Defective Units'],
          description: 'Number of good units'
        }
      }
    }
  ];

  // Common formula templates for machine calculations
  const formulaTemplates = [
    { name: 'Area', formula: 'w * h', description: 'Width × Height' },
    { name: 'Volume', formula: 'w * h * thickness', description: 'Width × Height × Thickness' },
    { name: 'Total Weight', formula: 'w * wt', description: 'Width × Weight per unit' },
    { name: 'Perimeter', formula: '(w + h) * 2', description: '(Width + Height) × 2' },
    { name: 'Weight from Density', formula: '(w * h * thickness) * density', description: 'Volume × Density' },
    { name: 'Pieces Weight', formula: 'weightPerPiece * quantity', description: 'Weight per piece × Quantity' },
    { name: 'Total MOL', formula: 'mol * quantity', description: 'MOL × Quantity' },
    { name: 'Custom', formula: '', description: 'Write your own formula' }
  ];

  useEffect(() => {
    dispatch(getMachineTypes());
    // Fetch product specs and material specs for operator view configuration
    dispatch(getProductSpecs() as any);
    dispatch(getMaterialSpecs() as any);
  }, [dispatch]);

  // Extract dimensions when product spec is selected
  useEffect(() => {
    if (selectedProductSpecId) {
      const spec = productSpecs.find((s: any) => s._id === selectedProductSpecId);
      if (spec && spec.dimensions) {
        const dimNames = spec.dimensions.map((d: any) => d.name);
        setAvailableProductDimensions(dimNames);
      }
    } else {
      setAvailableProductDimensions([]);
    }
  }, [selectedProductSpecId, productSpecs]);

  // Extract dimensions when material spec is selected
  useEffect(() => {
    if (selectedMaterialSpecId) {
      const spec = materialSpecs.find((s: any) => s._id === selectedMaterialSpecId);
      if (spec) {
        // Material spec has built-in properties + custom dimensions
        const builtInDims = [];
        if (spec.mol !== undefined) builtInDims.push('mol');
        if (spec.weightPerPiece !== undefined) builtInDims.push('weightPerPiece');
        if (spec.density !== undefined) builtInDims.push('density');

        const customDims = spec.dimensions ? spec.dimensions.map((d: any) => d.name) : [];
        setAvailableMaterialDimensions([...builtInDims, ...customDims]);
      }
    } else {
      setAvailableMaterialDimensions([]);
    }
  }, [selectedMaterialSpecId, materialSpecs]);

  useEffect(() => {
    const draft = localStorage.getItem("machineDraft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setMachineName(parsed.machineName || "");
      setMachineType(parsed.machineType || "");
      setSize(parsed.size || { x: "", y: "", z: "" });
      if (parsed.tableConfig) {
        setTableColumns(parsed.tableConfig.columns || tableColumns);
        setTableFormulas(parsed.tableConfig.formulas || tableFormulas);
      }
      if (parsed.tableRows) {
        setTableRows(parsed.tableRows);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (machineName || Object.values(size).some(Boolean) || tableColumns.length > 0) {
        const draftData = {
          machineName,
          machineType,
          size,
          tableConfig: {
            columns: tableColumns,
            formulas: tableFormulas
          },
          tableRows
        };
        localStorage.setItem("machineDraft", JSON.stringify(draftData));
        setHasUnsavedChanges(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [machineName, machineType, size, tableColumns, tableFormulas, tableRows]);

  // Validate formula in real-time with syntax checking and testing
  useEffect(() => {
    if (!newCalculation.formula.trim()) {
      setFormulaValidation({ isValid: true, errors: [], missingDimensions: [] });
      setFormulaTestResult(null);
      return;
    }

    const formula = newCalculation.formula;
    const allAvailableDimensions = [
      ...productDimensionsForFormulas,
      ...productDimensionsToShow,
      ...materialDimensionsForFormulas,
      ...materialDimensionsToShow
    ];
    const errors: string[] = [];
    const missingDims: string[] = [];

    // 1. SYNTAX VALIDATION - Check for common syntax errors

    // Check for double operators (like **, //, ++)
    if (/(\+\+|--|\*\*|\/\/|%%)/g.test(formula)) {
      errors.push('Invalid operator syntax detected (e.g., **, //, ++, --)');
    }

    // Check for operators at start or end
    if (/^[\+\-\*\/]/.test(formula.trim()) || /[\+\-\*\/]$/.test(formula.trim())) {
      errors.push('Formula cannot start or end with an operator');
    }

    // Check for balanced parentheses
    let parenBalance = 0;
    for (const char of formula) {
      if (char === '(') parenBalance++;
      if (char === ')') parenBalance--;
      if (parenBalance < 0) {
        errors.push('Unbalanced parentheses - closing ) without opening (');
        break;
      }
    }
    if (parenBalance > 0) {
      errors.push('Unbalanced parentheses - missing closing )');
    }

    // Check for empty parentheses
    if (/\(\s*\)/.test(formula)) {
      errors.push('Empty parentheses () not allowed');
    }

    // Check for consecutive operators (excluding negative numbers)
    if (/[\+\*\/]\s*[\+\*\/]/.test(formula)) {
      errors.push('Consecutive operators detected');
    }

    // 2. DIMENSION VALIDATION - Extract variable names from formula
    const variablePattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const variablesInFormula = formula.match(variablePattern) || [];

    // Filter out JavaScript Math functions
    const mathFunctions = ['sqrt', 'abs', 'sin', 'cos', 'tan', 'log', 'exp', 'pow', 'min', 'max', 'floor', 'ceil', 'round', 'Math'];
    const dimensionReferences = variablesInFormula.filter(v => !mathFunctions.includes(v));

    // Check for missing dimensions
    const missingDimensions = dimensionReferences.filter(dim => !allAvailableDimensions.includes(dim));
    if (missingDimensions.length > 0) {
      errors.push(`Dimension(s) not found: ${missingDimensions.join(', ')}`);
      missingDims.push(...missingDimensions);
    }

    // 3. FORMULA TESTER - Test with sample values
    if (errors.length === 0 && dimensionReferences.length > 0) {
      // Generate sample values for testing (all dimensions = 10 for simplicity)
      const testValues: Record<string, number> = {};
      allAvailableDimensions.forEach(dim => {
        testValues[dim] = 10; // Use 10 as default test value
      });

      try {
        // Replace dimension names with test values
        let testFormula = formula;
        allAvailableDimensions.forEach(dim => {
          // Replace whole word only (not part of other words)
          const regex = new RegExp(`\\b${dim}\\b`, 'g');
          testFormula = testFormula.replace(regex, testValues[dim].toString());
        });

        // Replace Math functions with Math.function format
        testFormula = testFormula.replace(/\bsqrt\b/g, 'Math.sqrt');
        testFormula = testFormula.replace(/\babs\b/g, 'Math.abs');
        testFormula = testFormula.replace(/\bsin\b/g, 'Math.sin');
        testFormula = testFormula.replace(/\bcos\b/g, 'Math.cos');
        testFormula = testFormula.replace(/\btan\b/g, 'Math.tan');
        testFormula = testFormula.replace(/\blog\b/g, 'Math.log');
        testFormula = testFormula.replace(/\bexp\b/g, 'Math.exp');
        testFormula = testFormula.replace(/\bpow\b/g, 'Math.pow');
        testFormula = testFormula.replace(/\bmin\b/g, 'Math.min');
        testFormula = testFormula.replace(/\bmax\b/g, 'Math.max');
        testFormula = testFormula.replace(/\bfloor\b/g, 'Math.floor');
        testFormula = testFormula.replace(/\bceil\b/g, 'Math.ceil');
        testFormula = testFormula.replace(/\bround\b/g, 'Math.round');

        // Evaluate the formula
        const result = eval(testFormula);

        if (typeof result === 'number' && !isNaN(result)) {
          setFormulaTestResult({
            success: true,
            result: result,
            testValues: testValues
          });
        } else {
          errors.push('Formula evaluation resulted in invalid number');
          setFormulaTestResult(null);
        }
      } catch (error: any) {
        errors.push(`Syntax error: ${error.message}`);
        setFormulaTestResult(null);
      }
    } else {
      setFormulaTestResult(null);
    }

    // Set validation state
    if (errors.length > 0) {
      setFormulaValidation({
        isValid: false,
        errors: errors,
        missingDimensions: Array.from(new Set(missingDims))
      });
    } else {
      setFormulaValidation({ isValid: true, errors: [], missingDimensions: [] });
    }
  }, [newCalculation.formula, productDimensionsForFormulas, productDimensionsToShow, materialDimensionsForFormulas, materialDimensionsToShow]);

  useEffect(() => {
    containerRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (hasUnsavedChanges) {
          confirm("Discard changes?") && navigate(-1);
        } else {
          navigate(-1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges, navigate]);

  // Generate sample test data
  const generateTestData = () => {
    const sampleData: TableRow[] = [];
    for (let i = 1; i <= 3; i++) {
      const rowData: Record<string, any> = {};
      
      tableColumns.forEach(col => {
        if (col.dataType === 'number') {
          rowData[col.name] = Math.floor(Math.random() * 100) + 10;
        } else if (col.dataType === 'text') {
          rowData[col.name] = `Sample ${col.name} ${i}`;
        } else if (col.dataType === 'date') {
          rowData[col.name] = new Date().toISOString().split('T')[0];
        }
      });

      const calculatedData = autoCalculateRow(rowData);
      
      sampleData.push({
        id: `test_${i}`,
        data: calculatedData
      });
    }
    
    setTestRows(sampleData);
  };

  // Calculate formula for a row
  const calculateFormula = (expression: string, rowData: Record<string, any>): number => {
    try {
      let formula = expression;
      
      tableColumns.forEach(col => {
        const value = rowData[col.name];
        if (value !== undefined && value !== '') {
          formula = formula.replace(new RegExp(col.name, 'g'), String(value));
        }
      });

      const result = eval(formula);
      return isNaN(result) ? 0 : Number(result.toFixed(2));
    } catch (error) {
      return 0;
    }
  };

  // Auto-calculate formula columns
  const autoCalculateRow = (rowData: Record<string, any>): Record<string, any> => {
    const calculatedData = { ...rowData };
    
    Object.entries(tableFormulas).forEach(([columnName, formula]) => {
      calculatedData[columnName] = calculateFormula(formula.expression, rowData);
    });

    return calculatedData;
  };

  // Calculate column totals
  const calculateTotal = (columnName: string, rows: TableRow[]): number => {
    if (tableColumns.find(c => c.name === columnName)?.dataType === 'number' || 
        tableColumns.find(c => c.name === columnName)?.dataType === 'formula') {
      return rows.reduce((sum, row) => {
        const value = Number(row.data[columnName]) || 0;
        return sum + value;
      }, 0);
    }
    return 0;
  };

  // Table Management Functions
  const applyTableTemplate = (template: typeof tableTemplates[0]) => {
    setTableColumns(template.columns.map((col, index) => ({
      ...col,
      order: index
    })));
    setTableFormulas(template.formulas);
    toast.success('Template Applied', `Applied template: ${template.name}`);
  };

  const addColumn = () => {
    if (!newColumnName.trim()) {
      toast.error('Validation Error', 'Please enter a column name');
      return;
    }

    if (tableColumns.some(col => col.name === newColumnName.trim())) {
      toast.error('Validation Error', 'Column name already exists');
      return;
    }

    const newColumn: TableColumn = {
      name: newColumnName.trim(),
      dataType: newColumnType,
      isRequired: newColumnRequired,
      order: tableColumns.length,
      placeholder: `Enter ${newColumnName.toLowerCase()}`
    };

    setTableColumns([...tableColumns, newColumn]);
    setNewColumnName("");
    setNewColumnType('text');
    setNewColumnRequired(false);
  };

  const removeColumn = (columnName: string) => {
    const updatedColumns = tableColumns.filter(col => col.name !== columnName);
    const reorderedColumns = updatedColumns.map((col, index) => ({
      ...col,
      order: index
    }));
    setTableColumns(reorderedColumns);

    const updatedFormulas = { ...tableFormulas };
    delete updatedFormulas[columnName];
    
    Object.keys(updatedFormulas).forEach(formulaCol => {
      const formula = updatedFormulas[formulaCol];
      if (formula.dependencies.includes(columnName)) {
        delete updatedFormulas[formulaCol];
      }
    });

    setTableFormulas(updatedFormulas);

    // Remove column data from all rows
    const updatedRows = tableRows.map(row => {
      const newData = { ...row.data };
      delete newData[columnName];
      return { ...row, data: newData };
    });
    setTableRows(updatedRows);
  };

  const addFormula = () => {
    if (!selectedFormulaColumn || !formulaExpression.trim()) {
      toast.error('Validation Error', 'Please select a column and enter a formula expression');
      return;
    }

    const dependencies = tableColumns
      .map(col => col.name)
      .filter(colName => 
        colName !== selectedFormulaColumn && 
        formulaExpression.includes(colName)
      );

    const newFormula: Formula = {
      expression: formulaExpression.trim(),
      dependencies,
      description: formulaDescription.trim() || `Formula for ${selectedFormulaColumn}`
    };

    const updatedColumns = tableColumns.map(col => 
      col.name === selectedFormulaColumn 
        ? { ...col, dataType: 'formula' as const, placeholder: 'Auto calculated' }
        : col
    );

    setTableColumns(updatedColumns);
    setTableFormulas({
      ...tableFormulas,
      [selectedFormulaColumn]: newFormula
    });

    setSelectedFormulaColumn('');
    setFormulaExpression('');
    setFormulaDescription('');
  };

  const removeFormula = (columnName: string) => {
    const updatedFormulas = { ...tableFormulas };
    delete updatedFormulas[columnName];
    setTableFormulas(updatedFormulas);

    const updatedColumns = tableColumns.map(col => 
      col.name === columnName 
        ? { ...col, dataType: 'text' as const, placeholder: `Enter ${col.name.toLowerCase()}` }
        : col
    );
    setTableColumns(updatedColumns);
  };

  // Data Entry Functions
  const addNewRow = () => {
    const newRow: TableRow = {
      id: `row_${Date.now()}`,
      data: {}
    };

    tableColumns.forEach(col => {
      if (col.dataType !== 'formula') {
        newRow.data[col.name] = '';
      }
    });

    setTableRows([...tableRows, newRow]);
    setEditingRowId(newRow.id);
    setCurrentRowData(newRow.data);
  };

  const updateRowData = (columnName: string, value: any) => {
    const updatedData = {
      ...currentRowData,
      [columnName]: value
    };
    
    const calculatedData = autoCalculateRow(updatedData);
    setCurrentRowData(calculatedData);
  };

  const saveRow = () => {
    if (editingRowId) {
      const updatedRows = tableRows.map(row => 
        row.id === editingRowId 
          ? { ...row, data: currentRowData }
          : row
      );
      setTableRows(updatedRows);
      setEditingRowId(null);
      setCurrentRowData({});
    }
  };

  const cancelEdit = () => {
    if (editingRowId && !Object.values(tableRows.find(r => r.id === editingRowId)?.data || {}).some(v => v !== '')) {
      setTableRows(tableRows.filter(r => r.id !== editingRowId));
    }
    setEditingRowId(null);
    setCurrentRowData({});
  };

  const editRow = (row: TableRow) => {
    setEditingRowId(row.id);
    setCurrentRowData(row.data);
  };

  const deleteRow = (rowId: string) => {
    const updatedRows = tableRows.filter(r => r.id !== rowId);
    setTableRows(updatedRows);
    
    if (editingRowId === rowId) {
      setEditingRowId(null);
      setCurrentRowData({});
    }
  };

  const exportTableConfig = () => {
    const config = {
      tableName: `${machineName || 'machine'}_table_config`,
      columns: tableColumns,
      formulas: tableFormulas,
      data: tableRows,
      settings: {
        autoCalculate: true,
        autoUpdateOrders: true,
        maxRows: 1000,
        enableHistory: true
      }
    };

    const jsonData = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${machineName || 'machine'}_data_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isValidForm = () => {
    return (
      machineName.trim().length > 0 &&
      machineType &&
      Object.values(size).every(val => val.trim().length > 0) &&
      tableColumns.length > 0
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isValidForm()) {
      toast.error('Validation Error', 'Please fill all required fields and define at least one table column');
      return;
    }

    const newMachine = {
      machineName: machineName.trim(),
      machineType,
      sizeX: size.x.trim(),
      sizeY: size.y.trim(),
      sizeZ: size.z.trim(),
      tableConfig: {
        columns: tableColumns,
        formulas: tableFormulas,
        data: tableRows,
        settings: {
          autoCalculate: true,
          autoUpdateOrders: true,
          maxRows: 1000,
          enableHistory: true
        }
      },
      operatorView: {
        productDimensions: {
          forFormulas: productDimensionsForFormulas,
          toShow: productDimensionsToShow
        },
        materialDimensions: {
          forFormulas: materialDimensionsForFormulas,
          toShow: materialDimensionsToShow
        },
        calculations: operatorCalculations
      }
    };

    handleSave(
      () => dispatch(createMachine(newMachine)),
      {
        successMessage: 'Machine with table configuration saved successfully!',
        onSuccess: () => {
          setTimeout(() => {
            resetForm();
            navigate(-1);
          }, 1500);
        }
      }
    );
  };

  const resetForm = () => {
    setMachineName("");
    setMachineType("");
    setSize({ x: "", y: "", z: "" });
    setHasUnsavedChanges(false);
    setTableColumns([
      { name: 'Material Type', dataType: 'text', isRequired: true, order: 0, placeholder: 'Enter material name' },
      { name: 'Raw Weight', dataType: 'number', isRequired: true, order: 1, placeholder: 'Enter raw weight in kg' },
      { name: 'Wastage', dataType: 'number', isRequired: false, order: 2, placeholder: 'Enter wastage in kg' },
      { name: 'Net Weight', dataType: 'formula', isRequired: false, order: 3, placeholder: 'Auto calculated' }
    ]);
    setTableFormulas({
      'Net Weight': {
        expression: 'Raw Weight - Wastage',
        dependencies: ['Raw Weight', 'Wastage'],
        description: 'Net weight after removing wastage'
      }
    });
    setTableRows([]);
    localStorage.removeItem("machineDraft");
  };

  const getColumnTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'formula': return <Calculator size={14} />;
      case 'number': return '#';
      case 'date': return '📅';
      default: return 'T';
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'config' | 'preview' | 'data') => {
    if (mode === 'preview') {
      generateTestData();
    }
    setViewMode(mode);
  };

  return (
    <div ref={containerRef} className="createMachineCss" aria-labelledby="CreateMachineFormTitle">
      <form onSubmit={handleSubmit} className="CreateMachineForm">
        <h2 id="CreateMachineFormTitle" className="CreateMachineFormTitle">
          Create Machine with Data Table
        </h2>

        {/* View Mode Tabs */}
        <div className="CreateMachineViewModeTabs">
          <button
            type="button"
            onClick={() => handleViewModeChange('config')}
            className={`CreateMachineTabButton ${viewMode === 'config' ? 'active' : ''}`}
          >
            <Settings size={16} />
            Configure Table
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('preview')}
            className={`CreateMachineTabButton ${viewMode === 'preview' ? 'active' : ''}`}
          >
            <Eye size={16} />
            Preview & Test
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('data')}
            className={`CreateMachineTabButton ${viewMode === 'data' ? 'active' : ''}`}
          >
            <Table size={16} />
            Data Entry
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('operatorView')}
            className={`CreateMachineTabButton ${viewMode === 'operatorView' ? 'active' : ''}`}
          >
            <Eye size={16} />
            Operator View
          </button>
        </div>

        {/* Basic Machine Information - Always visible */}
        <div className="CreateMachineFormGroup">
          <label htmlFor="CreateMachineMachineName" className="CreateMachineFormLabel">
            Machine Name *
          </label>
          <input
            id="CreateMachineMachineName"
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className="CreateMachineFormInput"
            placeholder="Enter machine name"
            aria-required="true"
          />
        </div>

        <div className="CreateMachineFormGroup">
          <label htmlFor="CreateMachineMachineType" className="CreateMachineFormLabel">
            Machine Type *
          </label>
          <select
            id="CreateMachineMachineType"
            value={machineType}
            onChange={(e) => setMachineType(e.target.value)}
            className="CreateMachineMachineSelect"
            aria-required="true"
          >
            <option value="">Select Machine Type</option>
            {loading ? (
              <option disabled>Loading...</option>
            ) : (
              machineTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.type}
                </option>
              ))
            )}
          </select>
        </div>

        <fieldset className="CreateMachineFormGroup">
          <legend className="CreateMachineFormLabel">Size (X, Y, Z) *</legend>
          <div className="CreateMachineSizeInputs">
            {(["x", "y", "z"] as const).map((axis) => (
              <input
                key={axis}
                type="number"
                min="0"
                step="0.1"
                placeholder={`Size ${axis.toUpperCase()}`}
                value={size[axis]}
                onChange={(e) =>
                  setSize((prev) => ({
                    ...prev,
                    [axis]: e.target.value,
                  }))
                }
                className="CreateMachineSizeInput"
                aria-label={`Size ${axis.toUpperCase()} dimension`}
                aria-required="true"
              />
            ))}
          </div>
        </fieldset>

        {/* Configuration View */}
        {viewMode === 'config' && (
          <div className="CreateMachineTableConfigurationSection">
            <div className="CreateMachineSectionHeader">
              <h3 className="CreateMachineSectionTitle">Data Table Configuration *</h3>
              <button
                type="button"
                onClick={exportTableConfig}
                className="CreateMachineExportConfigBtn"
              >
                <Download size={16} />
                Export Config
              </button>
            </div>

            {/* Template Selection */}
            <div className="CreateMachineTemplateSelection">
              <h4 className="CreateMachineSubsectionTitle">Quick Templates</h4>
              <div className="CreateMachineTemplateButtons">
                {tableTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applyTableTemplate(template)}
                    className="CreateMachineTemplateBtn"
                  >
                    <Settings size={14} />
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Column Management */}
            <div className="CreateMachineColumnManagement">
              <h4 className="CreateMachineSubsectionTitle">Table Columns</h4>
              
              {/* Current Columns Display */}
              <div className="CreateMachineCurrentColumns">
                {tableColumns.map((column) => (
                  <div key={column.name} className="CreateMachineColumnItem">
                    <div className="CreateMachineColumnInfo">
                      <span className="CreateMachineColumnTypeIcon">
                        {getColumnTypeIcon(column.dataType)}
                      </span>
                      <span className="CreateMachineColumnName">{column.name}</span>
                      <span className="CreateMachineColumnType">({column.dataType})</span>
                      {column.isRequired && <span className="CreateMachineRequiredBadge">Required</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeColumn(column.name)}
                      className="CreateMachineRemoveColumnBtn"
                      title="Remove column"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Column */}
              <div className="CreateMachineAddColumnForm">
                <div className="CreateMachineColumnInputs">
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Column name"
                    className="CreateMachineColumnNameInput"
                  />
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value as any)}
                    className="CreateMachineColumnTypeSelect"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="formula">Formula</option>
                  </select>
                  <label className="CreateMachineRequiredCheckbox">
                    <input
                      type="checkbox"
                      checked={newColumnRequired}
                      onChange={(e) => setNewColumnRequired(e.target.checked)}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={addColumn}
                    className="CreateMachineAddColumnBtn"
                  >
                    <Plus size={16} />
                    Add Column
                  </button>
                </div>
              </div>
            </div>

            {/* Formula Management */}
            <div className="CreateMachineFormulaManagement">
              <h4 className="CreateMachineSubsectionTitle">Formula Configuration</h4>
              
              {/* Current Formulas */}
              {Object.keys(tableFormulas).length > 0 && (
                <div className="CreateMachineCurrentFormulas">
                  {Object.entries(tableFormulas).map(([columnName, formula]) => (
                    <div key={columnName} className="CreateMachineFormulaItem">
                      <div className="CreateMachineFormulaHeader">
                        <span className="CreateMachineFormulaColumnName">{columnName}</span>
                        <button
                          type="button"
                          onClick={() => removeFormula(columnName)}
                          className="CreateMachineRemoveFormulaBtn"
                          title="Remove formula"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="CreateMachineFormulaExpression">
                        <strong>Expression:</strong> {formula.expression}
                      </div>
                      <div className="CreateMachineFormulaDependencies">
                        <strong>Dependencies:</strong> [{formula.dependencies.join(', ')}]
                      </div>
                      <div className="CreateMachineFormulaDescription">
                        <strong>Description:</strong> {formula.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Formula */}
              <div className="CreateMachineAddFormulaForm">
                <div className="CreateMachineFormulaInputs">
                  <select
                    value={selectedFormulaColumn}
                    onChange={(e) => setSelectedFormulaColumn(e.target.value)}
                    className="CreateMachineFormulaColumnSelect"
                  >
                    <option value="">Select column for formula</option>
                    {tableColumns
                      .filter(col => col.dataType !== 'formula')
                      .map(col => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))
                    }
                  </select>
                  <input
                    type="text"
                    value={formulaExpression}
                    onChange={(e) => setFormulaExpression(e.target.value)}
                    placeholder="e.g., Raw Weight - Wastage"
                    className="CreateMachineFormulaExpressionInput"
                  />
                </div>
                <input
                  type="text"
                  value={formulaDescription}
                  onChange={(e) => setFormulaDescription(e.target.value)}
                  placeholder="Formula description (optional)"
                  className="CreateMachineFormulaDescriptionInput"
                />
                <button
                  type="button"
                  onClick={addFormula}
                  className="CreateMachineAddFormulaBtn"
                  disabled={!selectedFormulaColumn || !formulaExpression.trim()}
                >
                  <Calculator size={16} />
                  Add Formula
                </button>
              </div>
              
              <div className="CreateMachineFormulaHelp">
                <p><strong>Available Operations:</strong> +, -, *, /, ( ), numbers</p>
                <p><strong>Column References:</strong> Use exact column names in formulas</p>
              </div>
            </div>

            {/* Table Preview */}
            <div className="CreateMachineTablePreview">
              <h4 className="CreateMachineSubsectionTitle">Table Structure Preview</h4>
              <div className="CreateMachinePreviewTableWrapper">
                <table className="CreateMachinePreviewTable">
                  <thead>
                    <tr>
                      <th className="CreateMachinePreviewHeader">Column Name</th>
                      <th className="CreateMachinePreviewHeader">Type</th>
                      <th className="CreateMachinePreviewHeader">Required</th>
                      <th className="CreateMachinePreviewHeader">Formula</th>
                      <th className="CreateMachinePreviewHeader">Placeholder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableColumns.map((column) => (
                      <tr key={column.name} className="CreateMachinePreviewRow">
                        <td className="CreateMachinePreviewCell">
                          <div className="CreateMachineCellContent">
                            {getColumnTypeIcon(column.dataType)}
                            {column.name}
                          </div>
                        </td>
                        <td className="CreateMachinePreviewCell">{column.dataType}</td>
                        <td className="CreateMachinePreviewCell">
                          {column.isRequired ? '✅' : '❌'}
                        </td>
                        <td className="CreateMachinePreviewCell">
                          {tableFormulas[column.name]?.expression || '-'}
                        </td>
                        <td className="CreateMachinePreviewCell">{column.placeholder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Preview & Test View */}
        {viewMode === 'preview' && (
          <div className="CreateMachinePreviewSection">
            <div className="CreateMachineSectionHeader">
              <h3 className="CreateMachineSectionTitle">Table Preview with Sample Data</h3>
              <button
                type="button"
                onClick={generateTestData}
                className="CreateMachineRegenerateBtn"
              >
                <Settings size={16} />
                Regenerate Test Data
              </button>
            </div>

            <div className="CreateMachineTestModeAlert">
              <strong>ℹ️ Test Mode:</strong> This shows how your table will look with sample data. Formulas are calculated automatically.
            </div>

            <div className="CreateMachinePreviewTableWrapper">
              <table className="CreateMachinePreviewTable">
                <thead>
                  <tr>
                    {tableColumns.map((col) => (
                      <th key={col.name} className="CreateMachinePreviewHeader">
                        <div className="CreateMachineCellContent">
                          {getColumnTypeIcon(col.dataType)}
                          {col.name}
                          {col.isRequired && <span className="CreateMachineRequiredMark">*</span>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {testRows.map((row) => (
                    <tr key={row.id} className="CreateMachinePreviewRow">
                      {tableColumns.map((col) => (
                        <td 
                          key={col.name} 
                          className={`CreateMachinePreviewCell ${col.dataType === 'formula' ? 'formula-cell' : ''}`}
                        >
                          {col.dataType === 'formula' ? (
                            <strong>{row.data[col.name] || 0}</strong>
                          ) : (
                            row.data[col.name] || '-'
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {testRows.length > 0 && (
                    <tr className="CreateMachineTotalRow">
                      {tableColumns.map((col, idx) => (
                        <td key={col.name} className="CreateMachinePreviewCell">
                          {idx === 0 ? 'Total:' : (
                            (col.dataType === 'number' || col.dataType === 'formula')
                              ? calculateTotal(col.name, testRows).toFixed(2)
                              : ''
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Formula explanation */}
            {Object.keys(tableFormulas).length > 0 && (
              <div className="CreateMachineFormulaExplanation">
                <h4 className="CreateMachineSubsectionTitle">
                  Active Formulas (Auto-calculated columns are highlighted):
                </h4>
                {Object.entries(tableFormulas).map(([colName, formula]) => (
                  <div key={colName} className="CreateMachineFormulaExplanationItem">
                    <strong>{colName}:</strong> {formula.expression} <em>({formula.description})</em>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Data Entry View */}
        {viewMode === 'data' && (
          <div className="CreateMachineDataEntrySection">
            <div className="CreateMachineSectionHeader">
              <h3 className="CreateMachineSectionTitle">Data Entries ({tableRows.length} rows)</h3>
              <button
                type="button"
                onClick={addNewRow}
                className="CreateMachineAddRowBtn"
              >
                <Plus size={16} />
                Add Row
              </button>
            </div>

            <div className="CreateMachinePreviewTableWrapper">
              <table className="CreateMachinePreviewTable">
                <thead>
                  <tr>
                    {tableColumns.map((col) => (
                      <th key={col.name} className="CreateMachinePreviewHeader">
                        <div className="CreateMachineCellContent">
                          {getColumnTypeIcon(col.dataType)}
                          {col.name}
                        </div>
                      </th>
                    ))}
                    <th className="CreateMachinePreviewHeader CreateMachineActionsHeader">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.id} className="CreateMachinePreviewRow">
                      {tableColumns.map((col) => (
                        <td key={col.name} className="CreateMachinePreviewCell">
                          {editingRowId === row.id ? (
                            col.dataType === 'formula' ? (
                              <span className="CreateMachineFormulaValue">
                                {currentRowData[col.name] || 0}
                              </span>
                            ) : (
                              <input
                                type={col.dataType === 'number' ? 'number' : col.dataType === 'date' ? 'date' : 'text'}
                                value={currentRowData[col.name] || ''}
                                onChange={(e) => updateRowData(col.name, e.target.value)}
                                className="CreateMachineDataInput"
                                placeholder={col.placeholder}
                              />
                            )
                          ) : (
                            <span>{row.data[col.name] || '-'}</span>
                          )}
                        </td>
                      ))}
                      <td className="CreateMachinePreviewCell CreateMachineActionsCell">
                        {editingRowId === row.id ? (
                          <div className="CreateMachineRowActions">
                            <button
                              type="button"
                              onClick={saveRow}
                              className="CreateMachineSaveRowBtn"
                            >
                              <Check size={14} />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="CreateMachineCancelRowBtn"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="CreateMachineRowActions">
                            <button
                              type="button"
                              onClick={() => editRow(row)}
                              className="CreateMachineEditRowBtn"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRow(row.id)}
                              className="CreateMachineDeleteRowBtn"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  {tableRows.length > 0 && (
                    <tr className="CreateMachineTotalRow">
                      {tableColumns.map((col, idx) => (
                        <td key={col.name} className="CreateMachinePreviewCell">
                          {idx === 0 ? 'Total:' : (
                            (col.dataType === 'number' || col.dataType === 'formula')
                              ? calculateTotal(col.name, tableRows).toFixed(2)
                              : ''
                          )}
                        </td>
                      ))}
                      <td className="CreateMachinePreviewCell"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {tableRows.length === 0 && (
              <div className="CreateMachineEmptyState">
                No data rows yet. Click "Add Row" to start entering data.
              </div>
            )}
          </div>
        )}

        {/* Operator View Tab */}
        {viewMode === 'operatorView' && (
          <div className="CreateMachineOperatorViewSection" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <div className="CreateMachineSectionHeader" style={{ marginBottom: '1.5rem' }}>
              <h3 className="CreateMachineSectionTitle" style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                <Eye size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Operator View Configuration
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Configure what product and material spec dimensions operators see, plus machine-specific calculations
              </p>
            </div>

            {/* Product Dimensions - Select Product Spec (Shared) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 className="CreateMachineSubsectionTitle" style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                📊 Product Spec Dimensions
              </h4>

              {/* Select Product Spec */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Choose Product Spec:
                </label>
                <select
                  value={selectedProductSpecId}
                  onChange={(e) => setSelectedProductSpecId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
                >
                  <option value="">-- Select a Product Spec --</option>
                  {productSpecs.map((spec: any) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.specName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section 1: For Formulas Only (Hidden from Operators) */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#eff6ff',
                border: '2px solid #93c5fd',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🔒</span>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', margin: 0 }}>
                    For Formulas Only (Hidden from Operators)
                  </h5>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.75rem' }}>
                  These dimensions can be used in calculations but won't be shown to operators
                </p>

                {/* Current Dimensions for Formulas */}
                {productDimensionsForFormulas.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {productDimensionsForFormulas.map((dim, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e40af', fontFamily: 'monospace' }}>{dim}</span>
                          <button
                            type="button"
                            onClick={() => setProductDimensionsForFormulas(productDimensionsForFormulas.filter((_, i) => i !== index))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Dimension for Formulas */}
                {availableProductDimensions.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={selectedProductDimToAdd}
                      onChange={(e) => setSelectedProductDimToAdd(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                    >
                      <option value="">-- Select Dimension to Add --</option>
                      {availableProductDimensions
                        .filter(dim => !productDimensionsForFormulas.includes(dim) && !productDimensionsToShow.includes(dim))
                        .map((dim, index) => (
                          <option key={index} value={dim}>{dim}</option>
                        ))
                      }
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedProductDimToAdd && !productDimensionsForFormulas.includes(selectedProductDimToAdd)) {
                          setProductDimensionsForFormulas([...productDimensionsForFormulas, selectedProductDimToAdd]);
                          setSelectedProductDimToAdd('');
                        }
                      }}
                      disabled={!selectedProductDimToAdd}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: selectedProductDimToAdd ? '#3b82f6' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: selectedProductDimToAdd ? 'pointer' : 'not-allowed',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      <Plus size={16} style={{ display: 'inline' }} /> Add
                    </button>
                  </div>
                )}
              </div>

              {/* Section 2: To Show Operators (Visible) */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>👁️</span>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#15803d', margin: 0 }}>
                    To Show Operators (Visible)
                  </h5>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#15803d', marginBottom: '0.75rem' }}>
                  These dimensions will be displayed to operators and can also be used in formulas
                </p>

                {/* Current Dimensions to Show */}
                {productDimensionsToShow.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {productDimensionsToShow.map((dim, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#dcfce7', border: '1px solid #22c55e', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#15803d', fontFamily: 'monospace' }}>{dim}</span>
                          <button
                            type="button"
                            onClick={() => setProductDimensionsToShow(productDimensionsToShow.filter((_, i) => i !== index))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Dimension to Show */}
                {availableProductDimensions.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={selectedProductDimToAdd}
                      onChange={(e) => setSelectedProductDimToAdd(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #86efac', borderRadius: '6px', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                    >
                      <option value="">-- Select Dimension to Add --</option>
                      {availableProductDimensions
                        .filter(dim => !productDimensionsForFormulas.includes(dim) && !productDimensionsToShow.includes(dim))
                        .map((dim, index) => (
                          <option key={index} value={dim}>{dim}</option>
                        ))
                      }
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedProductDimToAdd && !productDimensionsToShow.includes(selectedProductDimToAdd)) {
                          setProductDimensionsToShow([...productDimensionsToShow, selectedProductDimToAdd]);
                          setSelectedProductDimToAdd('');
                        }
                      }}
                      disabled={!selectedProductDimToAdd}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: selectedProductDimToAdd ? '#22c55e' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: selectedProductDimToAdd ? 'pointer' : 'not-allowed',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      <Plus size={16} style={{ display: 'inline' }} /> Add
                    </button>
                  </div>
                )}
              </div>

              {!selectedProductSpecId && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '0.875rem', color: '#92400e' }}>
                  ℹ️ Select a Product Spec above to see available dimensions
                </div>
              )}
            </div>

            {/* Material Dimensions - Select Material Spec (Shared) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 className="CreateMachineSubsectionTitle" style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                🔩 Material Spec Dimensions
              </h4>

              {/* Select Material Spec */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Choose Material Spec:
                </label>
                <select
                  value={selectedMaterialSpecId}
                  onChange={(e) => setSelectedMaterialSpecId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
                >
                  <option value="">-- Select a Material Spec --</option>
                  {materialSpecs.map((spec: any) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.specName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section 1: For Formulas Only (Hidden from Operators) */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef3f8',
                border: '2px solid #f9a8d4',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🔒</span>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#be123c', margin: 0 }}>
                    For Formulas Only (Hidden from Operators)
                  </h5>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#be123c', marginBottom: '0.75rem' }}>
                  These dimensions can be used in calculations but won't be shown to operators
                </p>

                {/* Current Dimensions for Formulas */}
                {materialDimensionsForFormulas.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {materialDimensionsForFormulas.map((dim, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#fce7f3', border: '1px solid #ec4899', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#be123c', fontFamily: 'monospace' }}>{dim}</span>
                          <button
                            type="button"
                            onClick={() => setMaterialDimensionsForFormulas(materialDimensionsForFormulas.filter((_, i) => i !== index))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Dimension for Formulas */}
                {availableMaterialDimensions.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={selectedMaterialDimToAdd}
                      onChange={(e) => setSelectedMaterialDimToAdd(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #f9a8d4', borderRadius: '6px', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                    >
                      <option value="">-- Select Dimension to Add --</option>
                      {availableMaterialDimensions
                        .filter(dim => !materialDimensionsForFormulas.includes(dim) && !materialDimensionsToShow.includes(dim))
                        .map((dim, index) => (
                          <option key={index} value={dim}>{dim}</option>
                        ))
                      }
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedMaterialDimToAdd && !materialDimensionsForFormulas.includes(selectedMaterialDimToAdd)) {
                          setMaterialDimensionsForFormulas([...materialDimensionsForFormulas, selectedMaterialDimToAdd]);
                          setSelectedMaterialDimToAdd('');
                        }
                      }}
                      disabled={!selectedMaterialDimToAdd}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: selectedMaterialDimToAdd ? '#ec4899' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: selectedMaterialDimToAdd ? 'pointer' : 'not-allowed',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      <Plus size={16} style={{ display: 'inline' }} /> Add
                    </button>
                  </div>
                )}
              </div>

              {/* Section 2: To Show Operators (Visible) */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>👁️</span>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#15803d', margin: 0 }}>
                    To Show Operators (Visible)
                  </h5>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#15803d', marginBottom: '0.75rem' }}>
                  These dimensions will be displayed to operators and can also be used in formulas
                </p>

                {/* Current Dimensions to Show */}
                {materialDimensionsToShow.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {materialDimensionsToShow.map((dim, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#dcfce7', border: '1px solid #22c55e', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#15803d', fontFamily: 'monospace' }}>{dim}</span>
                          <button
                            type="button"
                            onClick={() => setMaterialDimensionsToShow(materialDimensionsToShow.filter((_, i) => i !== index))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Dimension to Show */}
                {availableMaterialDimensions.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={selectedMaterialDimToAdd}
                      onChange={(e) => setSelectedMaterialDimToAdd(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #86efac', borderRadius: '6px', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                    >
                      <option value="">-- Select Dimension to Add --</option>
                      {availableMaterialDimensions
                        .filter(dim => !materialDimensionsForFormulas.includes(dim) && !materialDimensionsToShow.includes(dim))
                        .map((dim, index) => (
                          <option key={index} value={dim}>{dim}</option>
                        ))
                      }
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedMaterialDimToAdd && !materialDimensionsToShow.includes(selectedMaterialDimToAdd)) {
                          setMaterialDimensionsToShow([...materialDimensionsToShow, selectedMaterialDimToAdd]);
                          setSelectedMaterialDimToAdd('');
                        }
                      }}
                      disabled={!selectedMaterialDimToAdd}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: selectedMaterialDimToAdd ? '#22c55e' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: selectedMaterialDimToAdd ? 'pointer' : 'not-allowed',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      <Plus size={16} style={{ display: 'inline' }} /> Add
                    </button>
                  </div>
                )}
              </div>

              {!selectedMaterialSpecId && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '0.875rem', color: '#92400e' }}>
                  ℹ️ Select a Material Spec to see available dimensions
                </div>
              )}
            </div>

            {/* Machine Calculations */}
            <div>
              <h4 className="CreateMachineSubsectionTitle" style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                Machine-Specific Calculations
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Define calculations using dimensions from both specs (e.g., formula: "w * wt")
              </p>

              {/* Current Calculations */}
              {operatorCalculations.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  {operatorCalculations.map((calc, index) => (
                    <div key={index} style={{ padding: '1rem', marginBottom: '0.75rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '0.25rem' }}>
                            {calc.displayName} ({calc.name})
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.25rem' }}>
                            <strong>Formula:</strong> {calc.formula}
                          </div>
                          {calc.unit && (
                            <div style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.25rem' }}>
                              <strong>Unit:</strong> {calc.unit}
                            </div>
                          )}
                          {calc.description && (
                            <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                              <strong>Description:</strong> {calc.description}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setOperatorCalculations(operatorCalculations.filter((_, i) => i !== index))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Dimensions Helper - Now shows all four lists */}
              {(productDimensionsForFormulas.length > 0 || productDimensionsToShow.length > 0 || materialDimensionsForFormulas.length > 0 || materialDimensionsToShow.length > 0) && (
                <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', border: '2px solid #3b82f6', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📋</span> Available Dimensions for Formulas
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.75rem' }}>
                    You can use ANY of these dimensions in your formulas below:
                  </p>

                  {/* Product Dimensions */}
                  {(productDimensionsForFormulas.length > 0 || productDimensionsToShow.length > 0) && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
                        📊 Product Dimensions:
                      </div>
                      <div style={{ paddingLeft: '1rem' }}>
                        {productDimensionsForFormulas.length > 0 && (
                          <div style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: '#1e3a8a' }}>
                            <span style={{ fontWeight: '500' }}>🔒 Formula-only:</span>{' '}
                            <code style={{ backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                              {productDimensionsForFormulas.join(', ')}
                            </code>
                          </div>
                        )}
                        {productDimensionsToShow.length > 0 && (
                          <div style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: '#1e3a8a' }}>
                            <span style={{ fontWeight: '500' }}>👁️ Visible:</span>{' '}
                            <code style={{ backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                              {productDimensionsToShow.join(', ')}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Material Dimensions */}
                  {(materialDimensionsForFormulas.length > 0 || materialDimensionsToShow.length > 0) && (
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
                        🔩 Material Dimensions:
                      </div>
                      <div style={{ paddingLeft: '1rem' }}>
                        {materialDimensionsForFormulas.length > 0 && (
                          <div style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: '#1e3a8a' }}>
                            <span style={{ fontWeight: '500' }}>🔒 Formula-only:</span>{' '}
                            <code style={{ backgroundColor: '#fce7f3', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                              {materialDimensionsForFormulas.join(', ')}
                            </code>
                          </div>
                        )}
                        {materialDimensionsToShow.length > 0 && (
                          <div style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: '#1e3a8a' }}>
                            <span style={{ fontWeight: '500' }}>👁️ Visible:</span>{' '}
                            <code style={{ backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                              {materialDimensionsToShow.join(', ')}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add New Calculation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                <input
                  type="text"
                  value={newCalculation.name}
                  onChange={(e) => setNewCalculation({ ...newCalculation, name: e.target.value })}
                  placeholder="Name (e.g., 'x', 'total')"
                  style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
                />
                <input
                  type="text"
                  value={newCalculation.displayName}
                  onChange={(e) => setNewCalculation({ ...newCalculation, displayName: e.target.value })}
                  placeholder="Display Name (e.g., 'Total Weight')"
                  style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
                />

                {/* Formula Template Selector */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                    🎯 Quick Formula Templates:
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const template = formulaTemplates.find(t => t.name === e.target.value);
                      if (template && template.formula) {
                        setNewCalculation({ ...newCalculation, formula: template.formula });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: '#f9fafb',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Select a template or write custom --</option>
                    {formulaTemplates.map((template, idx) => (
                      <option key={idx} value={template.name}>
                        {template.name}: {template.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Formula Input with Validation */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
                    Formula:
                  </label>
                  <input
                    type="text"
                    value={newCalculation.formula}
                    onChange={(e) => setNewCalculation({ ...newCalculation, formula: e.target.value })}
                    placeholder="Formula (e.g., 'w * h' or 'w * wt')"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: `1px solid ${!formulaValidation.isValid && newCalculation.formula ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: !formulaValidation.isValid && newCalculation.formula ? '#fef2f2' : '#ffffff'
                    }}
                  />

                  {/* Validation Error Message */}
                  {!formulaValidation.isValid && newCalculation.formula && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: '600', marginBottom: '0.25rem' }}>
                        ❌ Formula Error:
                      </div>
                      {formulaValidation.errors.map((error, idx) => (
                        <div key={idx} style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                          {error}
                        </div>
                      ))}
                      {formulaValidation.missingDimensions.length > 0 && (
                        <div style={{ fontSize: '0.875rem', color: '#991b1b', marginTop: '0.5rem' }}>
                          <strong>Did you mean:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                            {[...productDimensions, ...materialDimensions].map((dim, idx) => (
                              <span
                                key={idx}
                                onClick={() => {
                                  // Auto-fix: replace first missing dimension with clicked dimension
                                  const missingDim = formulaValidation.missingDimensions[0];
                                  const fixedFormula = newCalculation.formula.replace(
                                    new RegExp(`\\b${missingDim}\\b`, 'g'),
                                    dim
                                  );
                                  setNewCalculation({ ...newCalculation, formula: fixedFormula });
                                }}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#dbeafe',
                                  color: '#1e40af',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}
                              >
                                {dim}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Success Message with Formula Tester */}
                  {formulaValidation.isValid && newCalculation.formula.trim() && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                        ✅ Formula looks good!
                      </div>

                      {/* Formula Tester - Show Example Calculation */}
                      {formulaTestResult && formulaTestResult.success && (
                        <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#15803d', marginBottom: '0.5rem' }}>
                            🧪 Formula Test Result:
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#166534' }}>
                            <strong>Test Values:</strong>{' '}
                            {Object.entries(formulaTestResult.testValues)
                              .filter(([key]) => newCalculation.formula.includes(key))
                              .map(([key, value]) => `${key}=${value}`)
                              .join(', ')}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.25rem' }}>
                            <strong>Calculated Result:</strong>{' '}
                            <span style={{
                              fontSize: '1rem',
                              fontWeight: '700',
                              color: '#15803d',
                              backgroundColor: '#dcfce7',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              marginLeft: '0.25rem'
                            }}>
                              {formulaTestResult.result.toFixed(2)}
                            </span>
                            {newCalculation.unit && <span style={{ marginLeft: '0.25rem' }}>{newCalculation.unit}</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            💡 Example: If {Object.entries(formulaTestResult.testValues)
                              .filter(([key]) => newCalculation.formula.includes(key))
                              .map(([key, value]) => `${key}=${value}`)
                              .join(', ')}, then {newCalculation.formula} = {formulaTestResult.result.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={newCalculation.unit}
                  onChange={(e) => setNewCalculation({ ...newCalculation, unit: e.target.value })}
                  placeholder="Unit (e.g., 'kg', 'cm³')"
                  style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
                />
                <input
                  type="text"
                  value={newCalculation.description}
                  onChange={(e) => setNewCalculation({ ...newCalculation, description: e.target.value })}
                  placeholder="Description (optional)"
                  style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCalculation.name.trim() && newCalculation.displayName.trim() && newCalculation.formula.trim() && formulaValidation.isValid) {
                      setOperatorCalculations([...operatorCalculations, {
                        name: newCalculation.name.trim(),
                        displayName: newCalculation.displayName.trim(),
                        formula: newCalculation.formula.trim(),
                        unit: newCalculation.unit.trim(),
                        description: newCalculation.description.trim()
                      }]);
                      setNewCalculation({ name: '', displayName: '', formula: '', unit: '', description: '' });
                    }
                  }}
                  disabled={!formulaValidation.isValid || !newCalculation.name.trim() || !newCalculation.displayName.trim() || !newCalculation.formula.trim()}
                  style={{
                    gridColumn: '1 / -1',
                    padding: '0.75rem',
                    backgroundColor: (!formulaValidation.isValid || !newCalculation.name.trim() || !newCalculation.displayName.trim() || !newCalculation.formula.trim()) ? '#9ca3af' : '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (!formulaValidation.isValid || !newCalculation.name.trim() || !newCalculation.displayName.trim() || !newCalculation.formula.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    opacity: (!formulaValidation.isValid || !newCalculation.name.trim() || !newCalculation.displayName.trim() || !newCalculation.formula.trim()) ? 0.6 : 1
                  }}
                >
                  <Calculator size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  {!formulaValidation.isValid ? 'Fix Formula Errors First' : 'Add Calculation'}
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '6px' }}>
              <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
                💡 How Operator View Works:
              </h5>
              <ul style={{ fontSize: '0.875rem', color: '#1e3a8a', margin: 0, paddingLeft: '1.25rem' }}>
                <li>Each machine has ONE fixed view structure that never changes</li>
                <li>Operators see selected dimensions from both Product and Material specs</li>
                <li>Machine calculations use dimensions from both specs (e.g., w * wt)</li>
                <li>Values change per order, but structure stays the same</li>
                <li>Example: Machine shows w, h (from Product) + wt (from Material) + calculated x = w * wt</li>
              </ul>
            </div>
          </div>
        )}

        <div className="CreateMachineFormActions">
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
            disabled={!isValidForm()}
            className="CreateMachineSaveButton"
          >
            Save Machine & Table Configuration
          </ActionButton>
        </div>
      </form>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateMachine;