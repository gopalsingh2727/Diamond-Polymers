import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Parser } from "expr-eval";
import {
  updateMachine,
  deleteMachine,
} from "../../../../redux/create/machine/MachineActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { AppDispatch } from "../../../../../store";
import { EditTable, EditTableColumn } from "../../../../../components/shared/EditTable";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { Plus, Trash2, Download, Settings, Calculator, Eye, Table as TableIcon, Edit2, Check, X } from 'lucide-react';
import "./editMachines.css";

// ✅ Table Configuration Interfaces (copied from CreateMachine)
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

interface Machine {
  _id: string;
  machineName: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  machineType: {
    _id: string;
    type: string;
    description?: string;
  };
  branchId: {
    _id: string;
    name: string;
  };
  tableConfig?: {
    columns: TableColumn[];
    formulas: Record<string, Formula>;
    data: TableRow[];
    settings?: {
      autoCalculate: boolean;
      autoUpdateOrders: boolean;
      maxRows: number;
      enableHistory: boolean;
    };
  };
}

// ✅ FIXED: Changed machineTypeId → machineType to match backend API
interface EditForm {
  machineName: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  machineType: string; // Backend expects 'machineType' field, not 'machineTypeId'
}

const EditMachinesNew: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { machines, machineTypes, loading, error } = useFormDataCache();

  // Basic editing state
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    machineName: "",
    sizeX: "",
    sizeY: "",
    sizeZ: "",
    machineType: "", // ✅ FIXED: Changed field name
  });

  const { saveState, handleSave, toast } = useCRUD();

  // ✅ NEW: Edit Mode State - Basic or Config
  const [editMode, setEditMode] = useState<'basic' | 'config' | 'preview' | 'data'>('basic');

  // ✅ NEW: Table Configuration State (copied from CreateMachine)
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

  // UI State for Column/Formula Management
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<'text' | 'number' | 'formula' | 'date'>('text');
  const [newColumnRequired, setNewColumnRequired] = useState(false);
  const [selectedFormulaColumn, setSelectedFormulaColumn] = useState('');
  const [formulaExpression, setFormulaExpression] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');

  // ✅ OPTIMIZED: No auto-refresh or dispatch needed - data loaded from cache!

  // ✅ NEW: Table Templates (copied from CreateMachine)
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

  // ✅ NEW: Helper Functions (copied from CreateMachine)

  // Generate sample test data for preview mode
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

      // SECURITY FIX: Use expr-eval Parser instead of eval()
      const parser = new Parser();
      const result = parser.evaluate(formula);
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

  // Get icon for column type
  const getColumnTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'formula': return <Calculator size={14} />;
      case 'number': return '#';
      case 'date': return '📅';
      default: return 'T';
    }
  };

  // Handle edit mode change
  const handleEditModeChange = (mode: 'basic' | 'config' | 'preview' | 'data') => {
    if (mode === 'preview') {
      generateTestData();
    }
    setEditMode(mode);
  };

  // ✅ NEW: Table Management Functions (copied from CreateMachine)

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

  // ✅ NEW: Data Entry Functions (copied from CreateMachine)

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
    if (!selectedMachine) return;

    const config = {
      tableName: `${selectedMachine.machineName}_table_config`,
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
    a.download = `${selectedMachine.machineName}_data_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Define table columns
  const columns: EditTableColumn<Machine>[] = [
    {
      key: 'machineName',
      header: 'Machine Name',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ color: '#2c3e50' }}>{value}</strong>
          <span style={{
            backgroundColor: '#3498db',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}>
            {row.machineType?.type || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'branchId',
      header: 'Branch',
      sortable: true,
      render: (value) => value?.name || 'N/A'
    },
    {
      key: 'sizeX',
      header: 'Size X',
      align: 'center',
      render: (value) => <span style={{ fontFamily: 'Monaco, Menlo, monospace', fontWeight: 500, color: '#34495e' }}>{value}</span>
    },
    {
      key: 'sizeY',
      header: 'Size Y',
      align: 'center',
      render: (value) => <span style={{ fontFamily: 'Monaco, Menlo, monospace', fontWeight: 500, color: '#34495e' }}>{value}</span>
    },
    {
      key: 'sizeZ',
      header: 'Size Z',
      align: 'center',
      render: (value) => <span style={{ fontFamily: 'Monaco, Menlo, monospace', fontWeight: 500, color: '#34495e' }}>{value}</span>
    }
  ];

  // ✅ FIXED: Handle edit - corrected field mapping + load table config
  const handleEdit = (machine: Machine) => {
    setSelectedMachine(machine);
    setEditForm({
      machineName: machine.machineName,
      sizeX: machine.sizeX,
      sizeY: machine.sizeY,
      sizeZ: machine.sizeZ,
      machineType: machine.machineType?._id || "", // ✅ FIXED: Now uses correct field name
    });

    // ✅ NEW: Load table configuration if it exists
    if (machine.tableConfig) {
      setTableColumns(machine.tableConfig.columns || []);
      setTableFormulas(machine.tableConfig.formulas || {});
      setTableRows(machine.tableConfig.data || []);
    } else {
      // Reset to default template if no config exists
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
    }

    // Reset edit mode to basic when opening edit modal
    setEditMode('basic');
  };

  // Handle delete
  const handleDeleteMachine = async (machine: Machine) => {
    await dispatch(deleteMachine(machine._id));
    // ✅ OPTIMIZED: Cache will auto-refresh on next page load
  };

  // ✅ FIXED: Handle save - corrected field reset + save table config
  const handleSaveEdit = () => {
    if (!selectedMachine) return;

    // ✅ NEW: Include table configuration in update
    const updateData = {
      ...editForm,
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
      }
    };

    handleSave(
      () => dispatch(updateMachine(selectedMachine._id, updateData)),
      {
        successMessage: 'Machine and table configuration updated successfully!',
        onSuccess: () => {
          setSelectedMachine(null);
          setEditForm({ machineName: "", sizeX: "", sizeY: "", sizeZ: "", machineType: "" }); // ✅ FIXED: Changed field name
          // Reset table config to defaults
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
          setEditMode('basic');
          // ✅ OPTIMIZED: Cache will auto-refresh on next page load
        }
      }
    );
  };

  return (
    <div className="EditMachinesCss">
      <div className="EditMachinesContainer">
        {/* Header with gradient */}
        <div className="EditMachinesHeader">
          <h1 className="EditMachinesTitle">Machine Management</h1>
        </div>

        {error && (
          <div className="EditMachinesError">{error}</div>
        )}

        {/* Machine Table */}
        <div style={{ padding: '30px' }}>
          <EditTable
            data={machines}
            columns={columns}
            keyField="_id"
            searchable
            searchPlaceholder="Search by name, type, or branch..."
            searchFields={['machineName', 'machineType.type', 'branchId.name', 'sizeX', 'sizeY', 'sizeZ']}
            paginated
            pageSize={10}
            onEdit={handleEdit}
            onDelete={handleDeleteMachine}
            loading={loading}
            striped
            stickyHeader
            defaultSort={{ key: 'machineName', direction: 'asc' }}
          />
        </div>

        {/* ✅ NEW: Edit Form Modal with Multi-Mode Support */}
        {selectedMachine && (
          <div className="EditMachinesModal">
            <div className="EditMachinesModalContent" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflow: 'auto' }}>
              <div className="EditMachinesEditHeader">
                <h2 className="EditMachinesEditTitle">Edit Machine: {selectedMachine.machineName}</h2>
                <button
                  className="EditMachinesCloseBtn"
                  onClick={() => setSelectedMachine(null)}
                >
                  ✕
                </button>
              </div>

              {/* ✅ NEW: Edit Mode Tabs */}
              <div className="CreateMachineViewModeTabs" style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => handleEditModeChange('basic')}
                  className={`CreateMachineTabButton ${editMode === 'basic' ? 'active' : ''}`}
                  style={{
                    padding: '10px 20px',
                    border: editMode === 'basic' ? '2px solid #3498db' : '1px solid #ccc',
                    backgroundColor: editMode === 'basic' ? '#3498db' : '#f8f9fa',
                    color: editMode === 'basic' ? 'white' : '#333',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Edit2 size={16} />
                  Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => handleEditModeChange('config')}
                  className={`CreateMachineTabButton ${editMode === 'config' ? 'active' : ''}`}
                  style={{
                    padding: '10px 20px',
                    marginLeft: '10px',
                    border: editMode === 'config' ? '2px solid #3498db' : '1px solid #ccc',
                    backgroundColor: editMode === 'config' ? '#3498db' : '#f8f9fa',
                    color: editMode === 'config' ? 'white' : '#333',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Settings size={16} />
                  Table Config
                </button>
                <button
                  type="button"
                  onClick={() => handleEditModeChange('preview')}
                  className={`CreateMachineTabButton ${editMode === 'preview' ? 'active' : ''}`}
                  style={{
                    padding: '10px 20px',
                    marginLeft: '10px',
                    border: editMode === 'preview' ? '2px solid #3498db' : '1px solid #ccc',
                    backgroundColor: editMode === 'preview' ? '#3498db' : '#f8f9fa',
                    color: editMode === 'preview' ? 'white' : '#333',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => handleEditModeChange('data')}
                  className={`CreateMachineTabButton ${editMode === 'data' ? 'active' : ''}`}
                  style={{
                    padding: '10px 20px',
                    marginLeft: '10px',
                    border: editMode === 'data' ? '2px solid #3498db' : '1px solid #ccc',
                    backgroundColor: editMode === 'data' ? '#3498db' : '#f8f9fa',
                    color: editMode === 'data' ? 'white' : '#333',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <TableIcon size={16} />
                  Data Entry
                </button>
              </div>

              {/* ✅ MODE 1: Basic Info */}
              {editMode === 'basic' && (
                <div className="EditMachinesFormGrid">
                  <div className="EditMachinesFormGroup">
                    <label className="EditMachinesFormLabel">Machine Name</label>
                    <input
                      type="text"
                      className="EditMachinesFormInput"
                      value={editForm.machineName}
                      onChange={(e) => setEditForm({ ...editForm, machineName: e.target.value })}
                    />
                  </div>

                  <div className="EditMachinesFormGroup">
                    <label className="EditMachinesFormLabel">Machine Type</label>
                    <select
                      className="EditMachinesFormSelect"
                      value={editForm.machineType}
                      onChange={(e) => setEditForm({ ...editForm, machineType: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      {machineTypes.map((type: any) => (
                        <option key={type._id} value={type._id}>
                          {type.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="EditMachinesFormGroup">
                    <label className="EditMachinesFormLabel">Size X</label>
                    <input
                      type="text"
                      className="EditMachinesFormInput"
                      value={editForm.sizeX}
                      onChange={(e) => setEditForm({ ...editForm, sizeX: e.target.value })}
                    />
                  </div>

                  <div className="EditMachinesFormGroup">
                    <label className="EditMachinesFormLabel">Size Y</label>
                    <input
                      type="text"
                      className="EditMachinesFormInput"
                      value={editForm.sizeY}
                      onChange={(e) => setEditForm({ ...editForm, sizeY: e.target.value })}
                    />
                  </div>

                  <div className="EditMachinesFormGroup">
                    <label className="EditMachinesFormLabel">Size Z</label>
                    <input
                      type="text"
                      className="EditMachinesFormInput"
                      value={editForm.sizeZ}
                      onChange={(e) => setEditForm({ ...editForm, sizeZ: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* ✅ MODE 2: Table Configuration */}
              {editMode === 'config' && (
                <div className="CreateMachineTableConfigurationSection">
                  <div className="CreateMachineSectionHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 className="CreateMachineSectionTitle" style={{ margin: 0 }}>Data Table Configuration</h3>
                    <button
                      type="button"
                      onClick={exportTableConfig}
                      className="CreateMachineExportConfigBtn"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={16} />
                      Export Config
                    </button>
                  </div>

                  {/* Template Selection */}
                  <div className="CreateMachineTemplateSelection" style={{ marginBottom: '20px' }}>
                    <h4 className="CreateMachineSubsectionTitle" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Quick Templates</h4>
                    <div className="CreateMachineTemplateButtons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {tableTemplates.map((template, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => applyTableTemplate(template)}
                          className="CreateMachineTemplateBtn"
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Settings size={14} />
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column Management */}
                  <div className="CreateMachineColumnManagement" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <h4 className="CreateMachineSubsectionTitle" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Table Columns ({tableColumns.length})</h4>

                    {/* Current Columns Display */}
                    <div className="CreateMachineCurrentColumns" style={{ marginBottom: '15px' }}>
                      {tableColumns.map((column) => (
                        <div key={column.name} className="CreateMachineColumnItem" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'white', marginBottom: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                          <div className="CreateMachineColumnInfo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="CreateMachineColumnTypeIcon" style={{ fontSize: '16px' }}>
                              {getColumnTypeIcon(column.dataType)}
                            </span>
                            <span className="CreateMachineColumnName" style={{ fontWeight: 600 }}>{column.name}</span>
                            <span className="CreateMachineColumnType" style={{ fontSize: '12px', color: '#6c757d' }}>({column.dataType})</span>
                            {column.isRequired && <span className="CreateMachineRequiredBadge" style={{ fontSize: '11px', backgroundColor: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>Required</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeColumn(column.name)}
                            className="CreateMachineRemoveColumnBtn"
                            style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Remove column"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Column */}
                    <div className="CreateMachineAddColumnForm">
                      <div className="CreateMachineColumnInputs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={newColumnName}
                          onChange={(e) => setNewColumnName(e.target.value)}
                          placeholder="Column name"
                          className="CreateMachineColumnNameInput"
                          style={{ flex: '1', minWidth: '150px', padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }}
                        />
                        <select
                          value={newColumnType}
                          onChange={(e) => setNewColumnType(e.target.value as any)}
                          className="CreateMachineColumnTypeSelect"
                          style={{ padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="formula">Formula</option>
                        </select>
                        <label className="CreateMachineRequiredCheckbox" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                          style={{ padding: '8px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Plus size={16} />
                          Add Column
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Formula Management */}
                  <div className="CreateMachineFormulaManagement" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <h4 className="CreateMachineSubsectionTitle" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Formula Configuration</h4>

                    {/* Current Formulas */}
                    {Object.keys(tableFormulas).length > 0 && (
                      <div className="CreateMachineCurrentFormulas" style={{ marginBottom: '15px' }}>
                        {Object.entries(tableFormulas).map(([columnName, formula]) => (
                          <div key={columnName} className="CreateMachineFormulaItem" style={{ padding: '12px', backgroundColor: 'white', marginBottom: '10px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                            <div className="CreateMachineFormulaHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className="CreateMachineFormulaColumnName" style={{ fontWeight: 600, fontSize: '14px' }}>{columnName}</span>
                              <button
                                type="button"
                                onClick={() => removeFormula(columnName)}
                                className="CreateMachineRemoveFormulaBtn"
                                style={{ padding: '4px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Remove formula"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="CreateMachineFormulaExpression" style={{ fontSize: '13px', marginBottom: '4px' }}>
                              <strong>Expression:</strong> {formula.expression}
                            </div>
                            <div className="CreateMachineFormulaDependencies" style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                              <strong>Dependencies:</strong> [{formula.dependencies.join(', ')}]
                            </div>
                            <div className="CreateMachineFormulaDescription" style={{ fontSize: '12px', color: '#6c757d' }}>
                              <strong>Description:</strong> {formula.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Formula */}
                    <div className="CreateMachineAddFormulaForm">
                      <div className="CreateMachineFormulaInputs" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <select
                          value={selectedFormulaColumn}
                          onChange={(e) => setSelectedFormulaColumn(e.target.value)}
                          className="CreateMachineFormulaColumnSelect"
                          style={{ padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }}
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
                          style={{ padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }}
                        />
                        <input
                          type="text"
                          value={formulaDescription}
                          onChange={(e) => setFormulaDescription(e.target.value)}
                          placeholder="Formula description (optional)"
                          className="CreateMachineFormulaDescriptionInput"
                          style={{ padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }}
                        />
                        <button
                          type="button"
                          onClick={addFormula}
                          className="CreateMachineAddFormulaBtn"
                          disabled={!selectedFormulaColumn || !formulaExpression.trim()}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: !selectedFormulaColumn || !formulaExpression.trim() ? '#ccc' : '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: !selectedFormulaColumn || !formulaExpression.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Calculator size={16} />
                          Add Formula
                        </button>
                      </div>

                      <div className="CreateMachineFormulaHelp" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '12px' }}>
                        <p style={{ margin: '0 0 5px 0' }}><strong>Available Operations:</strong> +, -, *, /, ( ), numbers</p>
                        <p style={{ margin: 0 }}><strong>Column References:</strong> Use exact column names in formulas</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ MODE 3: Preview & Test */}
              {editMode === 'preview' && (
                <div className="CreateMachinePreviewSection">
                  <div className="CreateMachineSectionHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 className="CreateMachineSectionTitle" style={{ margin: 0 }}>Table Preview with Sample Data</h3>
                    <button
                      type="button"
                      onClick={generateTestData}
                      className="CreateMachineRegenerateBtn"
                      style={{ padding: '8px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Settings size={16} />
                      Regenerate Test Data
                    </button>
                  </div>

                  <div className="CreateMachineTestModeAlert" style={{ padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '4px', marginBottom: '15px' }}>
                    <strong>ℹ️ Test Mode:</strong> This shows how your table will look with sample data. Formulas are calculated automatically.
                  </div>

                  <div className="CreateMachinePreviewTableWrapper" style={{ overflowX: 'auto' }}>
                    <table className="CreateMachinePreviewTable" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {tableColumns.map((col) => (
                            <th key={col.name} className="CreateMachinePreviewHeader" style={{ padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left', fontWeight: 600 }}>
                              <div className="CreateMachineCellContent" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {getColumnTypeIcon(col.dataType)}
                                {col.name}
                                {col.isRequired && <span className="CreateMachineRequiredMark" style={{ color: '#e74c3c' }}>*</span>}
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
                                style={{ padding: '10px', borderBottom: '1px solid #dee2e6', backgroundColor: col.dataType === 'formula' ? '#fff3cd' : 'white' }}
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
                              <td key={col.name} className="CreateMachinePreviewCell" style={{ padding: '10px', borderBottom: '1px solid #dee2e6', backgroundColor: '#e7f3ff', fontWeight: 600 }}>
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
                    <div className="CreateMachineFormulaExplanation" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <h4 className="CreateMachineSubsectionTitle" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                        Active Formulas (Auto-calculated columns are highlighted):
                      </h4>
                      {Object.entries(tableFormulas).map(([colName, formula]) => (
                        <div key={colName} className="CreateMachineFormulaExplanationItem" style={{ fontSize: '13px', marginBottom: '8px' }}>
                          <strong>{colName}:</strong> {formula.expression} <em style={{ color: '#6c757d' }}>({formula.description})</em>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ✅ MODE 4: Data Entry */}
              {editMode === 'data' && (
                <div className="CreateMachineDataEntrySection">
                  <div className="CreateMachineSectionHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 className="CreateMachineSectionTitle" style={{ margin: 0 }}>Data Entries ({tableRows.length} rows)</h3>
                    <button
                      type="button"
                      onClick={addNewRow}
                      className="CreateMachineAddRowBtn"
                      style={{ padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} />
                      Add Row
                    </button>
                  </div>

                  <div className="CreateMachinePreviewTableWrapper" style={{ overflowX: 'auto' }}>
                    <table className="CreateMachinePreviewTable" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {tableColumns.map((col) => (
                            <th key={col.name} className="CreateMachinePreviewHeader" style={{ padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left', fontWeight: 600 }}>
                              <div className="CreateMachineCellContent" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {getColumnTypeIcon(col.dataType)}
                                {col.name}
                              </div>
                            </th>
                          ))}
                          <th className="CreateMachinePreviewHeader CreateMachineActionsHeader" style={{ padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'center', fontWeight: 600 }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((row) => (
                          <tr key={row.id} className="CreateMachinePreviewRow">
                            {tableColumns.map((col) => (
                              <td key={col.name} className="CreateMachinePreviewCell" style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>
                                {editingRowId === row.id ? (
                                  col.dataType === 'formula' ? (
                                    <span className="CreateMachineFormulaValue" style={{ fontWeight: 600, color: '#e67e22' }}>
                                      {currentRowData[col.name] || 0}
                                    </span>
                                  ) : (
                                    <input
                                      type={col.dataType === 'number' ? 'number' : col.dataType === 'date' ? 'date' : 'text'}
                                      value={currentRowData[col.name] || ''}
                                      onChange={(e) => updateRowData(col.name, e.target.value)}
                                      className="CreateMachineDataInput"
                                      placeholder={col.placeholder}
                                      style={{ width: '100%', padding: '6px', border: '1px solid #dee2e6', borderRadius: '4px' }}
                                    />
                                  )
                                ) : (
                                  <span>{row.data[col.name] || '-'}</span>
                                )}
                              </td>
                            ))}
                            <td className="CreateMachinePreviewCell CreateMachineActionsCell" style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                              {editingRowId === row.id ? (
                                <div className="CreateMachineRowActions" style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={saveRow}
                                    className="CreateMachineSaveRowBtn"
                                    style={{ padding: '6px 12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Check size={14} />
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="CreateMachineCancelRowBtn"
                                    style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <X size={14} />
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="CreateMachineRowActions" style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => editRow(row)}
                                    className="CreateMachineEditRowBtn"
                                    style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteRow(row.id)}
                                    className="CreateMachineDeleteRowBtn"
                                    style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
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
                              <td key={col.name} className="CreateMachinePreviewCell" style={{ padding: '10px', borderBottom: '1px solid #dee2e6', backgroundColor: '#e7f3ff', fontWeight: 600 }}>
                                {idx === 0 ? 'Total:' : (
                                  (col.dataType === 'number' || col.dataType === 'formula')
                                    ? calculateTotal(col.name, tableRows).toFixed(2)
                                    : ''
                                )}
                              </td>
                            ))}
                            <td className="CreateMachinePreviewCell" style={{ padding: '10px', borderBottom: '1px solid #dee2e6', backgroundColor: '#e7f3ff' }}></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {tableRows.length === 0 && (
                    <div className="CreateMachineEmptyState" style={{ textAlign: 'center', padding: '40px', color: '#6c757d', backgroundColor: '#f8f9fa', borderRadius: '4px', marginTop: '20px' }}>
                      No data rows yet. Click "Add Row" to start entering data.
                    </div>
                  )}
                </div>
              )}

              <div className="EditMachinesFormActions" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
                <button
                  className="EditMachinesCancelBtn"
                  onClick={() => setSelectedMachine(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  Cancel
                </button>
                <ActionButton
                  type="save"
                  state={saveState}
                  onClick={handleSaveEdit}
                  className="EditMachinesSaveBtn"
                >
                  Save All Changes
                </ActionButton>
              </div>
            </div>
          </div>
        )}

        {/* Toast notifications */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  );
};

export default EditMachinesNew;
