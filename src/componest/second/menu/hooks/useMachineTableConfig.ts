import { useState, useCallback } from 'react';

// Data types for columns
export type ColumnDataType = 'text' | 'number' | 'formula' | 'dropdown' | 'boolean' | 'date' | 'image' | 'file' | 'audio';
export type ColumnSourceType = 'manual' | 'order' | 'customer' | 'optionSpec' | 'calculated';

// Shared interfaces
export interface TableColumn {
  id?: string;
  name: string;
  label?: string;
  dataType: ColumnDataType;
  isRequired: boolean;
  isReadOnly?: boolean;
  isVisible?: boolean;
  order: number;
  width?: number;
  placeholder?: string;
  unit?: string;

  // Formula configuration
  formula?: {
    type: 'SUM' | 'AVERAGE' | 'COUNT' | 'MULTIPLY' | 'DIVIDE' | 'CUSTOM';
    expression: string;
    dependencies: string[];
  };

  // Dropdown options
  dropdownOptions?: { label: string; value: string }[];

  // Source configuration - where data comes from
  sourceType?: ColumnSourceType;
  sourceField?: string;

  // Option Spec source fields
  optionTypeId?: string;
  optionTypeName?: string;
  specField?: string;
  specFieldUnit?: string;
}

export interface Formula {
  expression: string;
  dependencies: string[];
  description: string;
}

export interface TableRow {
  id: string;
  data: Record<string, any>;
}

export interface TableConfig {
  columns: TableColumn[];
  formulas: Record<string, Formula>;
  data: TableRow[];
  settings?: {
    autoCalculate: boolean;
    autoUpdateOrders: boolean;
    maxRows: number;
    enableHistory: boolean;
  };
}

// Predefined table templates
export const TABLE_TEMPLATES = [
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

// Default table config
const DEFAULT_CONFIG: TableConfig = {
  columns: TABLE_TEMPLATES[0].columns,
  formulas: TABLE_TEMPLATES[0].formulas,
  data: [],
  settings: {
    autoCalculate: true,
    autoUpdateOrders: true,
    maxRows: 1000,
    enableHistory: true
  }
};

interface UseMachineTableConfigOptions {
  initialConfig?: TableConfig;
  onConfigChange?: (config: TableConfig) => void;
}

export function useMachineTableConfig(options: UseMachineTableConfigOptions = {}) {
  const { initialConfig, onConfigChange } = options;

  // State
  const [tableColumns, setTableColumns] = useState<TableColumn[]>(
    initialConfig?.columns || DEFAULT_CONFIG.columns
  );
  const [tableFormulas, setTableFormulas] = useState<Record<string, Formula>>(
    initialConfig?.formulas || DEFAULT_CONFIG.formulas
  );
  const [tableRows, setTableRows] = useState<TableRow[]>(
    initialConfig?.data || []
  );
  const [testRows, setTestRows] = useState<TableRow[]>([]);

  // Row editing state
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [currentRowData, setCurrentRowData] = useState<Record<string, any>>({});

  // Column form state
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<ColumnDataType>('text');
  const [newColumnRequired, setNewColumnRequired] = useState(false);

  // Formula form state
  const [selectedFormulaColumn, setSelectedFormulaColumn] = useState('');
  const [formulaExpression, setFormulaExpression] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');

  // Calculate formula for a row
  const calculateFormula = useCallback((expression: string, rowData: Record<string, any>): number => {
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
    } catch {
      return 0;
    }
  }, [tableColumns]);

  // Auto-calculate formula columns
  const autoCalculateRow = useCallback((rowData: Record<string, any>): Record<string, any> => {
    const calculatedData = { ...rowData };
    Object.entries(tableFormulas).forEach(([columnName, formula]) => {
      calculatedData[columnName] = calculateFormula(formula.expression, rowData);
    });
    return calculatedData;
  }, [tableFormulas, calculateFormula]);

  // Calculate column totals
  const calculateTotal = useCallback((columnName: string, rows?: TableRow[]): number => {
    const dataRows = rows || tableRows;
    const column = tableColumns.find(c => c.name === columnName);
    if (column?.dataType === 'number' || column?.dataType === 'formula') {
      return dataRows.reduce((sum, row) => {
        const value = Number(row.data[columnName]) || 0;
        return sum + value;
      }, 0);
    }
    return 0;
  }, [tableColumns, tableRows]);

  // Generate test data
  const generateTestData = useCallback(() => {
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
      sampleData.push({
        id: `test_${i}`,
        data: autoCalculateRow(rowData)
      });
    }
    setTestRows(sampleData);
  }, [tableColumns, autoCalculateRow]);

  // Apply template
  const applyTemplate = useCallback((template: typeof TABLE_TEMPLATES[0]) => {
    setTableColumns(template.columns.map((col, index) => ({ ...col, order: index })));
    const cleanFormulas = Object.fromEntries(
      Object.entries(template.formulas).filter(([_, f]) => f !== undefined)
    ) as Record<string, Formula>;
    setTableFormulas(cleanFormulas);
    setTableRows([]);
  }, []);

  // Add column
  const addColumn = useCallback(() => {
    if (!newColumnName.trim()) return { success: false, message: 'Please enter a column name' };
    if (tableColumns.some(col => col.name === newColumnName.trim())) {
      return { success: false, message: 'Column name already exists' };
    }

    const newColumn: TableColumn = {
      name: newColumnName.trim(),
      dataType: newColumnType,
      isRequired: newColumnRequired,
      order: tableColumns.length,
      placeholder: `Enter ${newColumnName.toLowerCase()}`
    };

    setTableColumns(prev => [...prev, newColumn]);
    setNewColumnName("");
    setNewColumnType('text');
    setNewColumnRequired(false);
    return { success: true };
  }, [newColumnName, newColumnType, newColumnRequired, tableColumns]);

  // Remove column
  const removeColumn = useCallback((columnName: string) => {
    const updatedColumns = tableColumns
      .filter(col => col.name !== columnName)
      .map((col, index) => ({ ...col, order: index }));
    setTableColumns(updatedColumns);

    // Remove related formulas
    const updatedFormulas = { ...tableFormulas };
    delete updatedFormulas[columnName];
    Object.keys(updatedFormulas).forEach(formulaCol => {
      if (updatedFormulas[formulaCol].dependencies.includes(columnName)) {
        delete updatedFormulas[formulaCol];
      }
    });
    setTableFormulas(updatedFormulas);

    // Remove column data from rows
    setTableRows(prev => prev.map(row => {
      const newData = { ...row.data };
      delete newData[columnName];
      return { ...row, data: newData };
    }));
  }, [tableColumns, tableFormulas]);

  // Add formula
  const addFormula = useCallback(() => {
    if (!selectedFormulaColumn || !formulaExpression.trim()) {
      return { success: false, message: 'Please select a column and enter a formula expression' };
    }

    const dependencies = tableColumns
      .map(col => col.name)
      .filter(colName => colName !== selectedFormulaColumn && formulaExpression.includes(colName));

    const newFormula: Formula = {
      expression: formulaExpression.trim(),
      dependencies,
      description: formulaDescription.trim() || `Formula for ${selectedFormulaColumn}`
    };

    setTableColumns(prev => prev.map(col =>
      col.name === selectedFormulaColumn
        ? { ...col, dataType: 'formula' as ColumnDataType, placeholder: 'Auto calculated' }
        : col
    ));

    setTableFormulas(prev => ({ ...prev, [selectedFormulaColumn]: newFormula }));
    setSelectedFormulaColumn('');
    setFormulaExpression('');
    setFormulaDescription('');
    return { success: true };
  }, [selectedFormulaColumn, formulaExpression, formulaDescription, tableColumns]);

  // Remove formula
  const removeFormula = useCallback((columnName: string) => {
    const updatedFormulas = { ...tableFormulas };
    delete updatedFormulas[columnName];
    setTableFormulas(updatedFormulas);

    setTableColumns(prev => prev.map(col =>
      col.name === columnName
        ? { ...col, dataType: 'text' as ColumnDataType, placeholder: `Enter ${col.name.toLowerCase()}` }
        : col
    ));
  }, [tableFormulas]);

  // Row management
  const addRow = useCallback(() => {
    const newRow: TableRow = { id: `row_${Date.now()}`, data: {} };
    tableColumns.forEach(col => {
      if (col.dataType !== 'formula') {
        newRow.data[col.name] = '';
      }
    });
    setTableRows(prev => [...prev, newRow]);
    setEditingRowId(newRow.id);
    setCurrentRowData(newRow.data);
  }, [tableColumns]);

  const updateRowData = useCallback((columnName: string, value: any) => {
    const updatedData = { ...currentRowData, [columnName]: value };
    setCurrentRowData(autoCalculateRow(updatedData));
  }, [currentRowData, autoCalculateRow]);

  const saveRow = useCallback(() => {
    if (editingRowId) {
      setTableRows(prev => prev.map(row =>
        row.id === editingRowId ? { ...row, data: currentRowData } : row
      ));
      setEditingRowId(null);
      setCurrentRowData({});
    }
  }, [editingRowId, currentRowData]);

  const cancelRowEdit = useCallback(() => {
    if (editingRowId) {
      const row = tableRows.find(r => r.id === editingRowId);
      if (row && !Object.values(row.data).some(v => v !== '')) {
        setTableRows(prev => prev.filter(r => r.id !== editingRowId));
      }
    }
    setEditingRowId(null);
    setCurrentRowData({});
  }, [editingRowId, tableRows]);

  const editRow = useCallback((row: TableRow) => {
    setEditingRowId(row.id);
    setCurrentRowData(row.data);
  }, []);

  const deleteRow = useCallback((rowId: string) => {
    setTableRows(prev => prev.filter(r => r.id !== rowId));
    if (editingRowId === rowId) {
      setEditingRowId(null);
      setCurrentRowData({});
    }
  }, [editingRowId]);

  // Export config
  const exportConfig = useCallback((machineName: string) => {
    const config = {
      tableName: `${machineName}_table_config`,
      columns: tableColumns,
      formulas: tableFormulas,
      data: tableRows,
      settings: DEFAULT_CONFIG.settings
    };

    const jsonData = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${machineName}_data_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tableColumns, tableFormulas, tableRows]);

  // Load config (for edit mode)
  const loadConfig = useCallback((config: TableConfig | undefined) => {
    if (config) {
      setTableColumns(config.columns || DEFAULT_CONFIG.columns);
      setTableFormulas(config.formulas || DEFAULT_CONFIG.formulas);
      setTableRows(config.data || []);
    } else {
      setTableColumns(DEFAULT_CONFIG.columns);
      setTableFormulas(DEFAULT_CONFIG.formulas);
      setTableRows([]);
    }
  }, []);

  // Reset to default
  const resetConfig = useCallback(() => {
    setTableColumns(DEFAULT_CONFIG.columns);
    setTableFormulas(DEFAULT_CONFIG.formulas);
    setTableRows([]);
    setEditingRowId(null);
    setCurrentRowData({});
  }, []);

  // Get current config
  const getConfig = useCallback((): TableConfig => ({
    columns: tableColumns,
    formulas: tableFormulas,
    data: tableRows,
    settings: DEFAULT_CONFIG.settings
  }), [tableColumns, tableFormulas, tableRows]);

  // Get column type icon
  const getColumnTypeIcon = useCallback((dataType: string) => {
    switch (dataType) {
      case 'formula': return 'fx';
      case 'number': return '#';
      case 'date': return 'date';
      default: return 'T';
    }
  }, []);

  return {
    // State
    tableColumns,
    tableFormulas,
    tableRows,
    testRows,
    editingRowId,
    currentRowData,

    // Column form state
    newColumnName,
    setNewColumnName,
    newColumnType,
    setNewColumnType,
    newColumnRequired,
    setNewColumnRequired,

    // Formula form state
    selectedFormulaColumn,
    setSelectedFormulaColumn,
    formulaExpression,
    setFormulaExpression,
    formulaDescription,
    setFormulaDescription,

    // Actions
    applyTemplate,
    addColumn,
    removeColumn,
    addFormula,
    removeFormula,
    addRow,
    updateRowData,
    saveRow,
    cancelRowEdit,
    editRow,
    deleteRow,
    generateTestData,
    exportConfig,
    loadConfig,
    resetConfig,
    getConfig,

    // Utilities
    calculateTotal,
    autoCalculateRow,
    getColumnTypeIcon,

    // Constants
    templates: TABLE_TEMPLATES
  };
}

export default useMachineTableConfig;
