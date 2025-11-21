import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  updateMachine,
  deleteMachine,
} from "../../../../redux/create/machine/MachineActions";
import { useFormDataCache } from "../hooks/useFormDataCache";
import { AppDispatch } from "../../../../../store";
import { Plus, Trash2, Edit2, Check, X, Calculator, Eye, Table as TableIcon, Settings, Download } from 'lucide-react';
import "./editMachines.css";

interface MachineType {
  _id: string;
  type: string;
  description?: string;
}

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
    data?: TableRow[];
    settings?: any;
  };
}

interface EditForm {
  machineName: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
  machineTypeId: string;
}

const EditMachines: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 🚀 OPTIMIZED: Get data from cached form data (no API calls!)
  const { machines, machineTypes, loading, error } = useFormDataCache();

  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    machineName: "",
    sizeX: "",
    sizeY: "",
    sizeZ: "",
    machineTypeId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Table editing state
  const [editMode, setEditMode] = useState<'basic' | 'config' | 'preview' | 'data'>('basic');
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [tableFormulas, setTableFormulas] = useState<Record<string, Formula>>({});
  const [tableRows, setTableRows] = useState<TableRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [currentRowData, setCurrentRowData] = useState<Record<string, any>>({});

  // UI State for adding columns and formulas
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<'text' | 'number' | 'formula' | 'date'>('text');
  const [newColumnRequired, setNewColumnRequired] = useState(false);
  const [selectedFormulaColumn, setSelectedFormulaColumn] = useState('');
  const [formulaExpression, setFormulaExpression] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');

  // Test data for preview mode
  const [testRows, setTestRows] = useState<TableRow[]>([]);

  // Predefined table templates
  const tableTemplates = [
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

  // Filter machines based on search term
  const filteredMachines = machines.filter((machine: Machine) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      machine.machineName?.toLowerCase().includes(search) ||
      machine.machineType?.type?.toLowerCase().includes(search) ||
      machine.branchId?.name?.toLowerCase().includes(search) ||
      machine.sizeX?.toLowerCase().includes(search) ||
      machine.sizeY?.toLowerCase().includes(search) ||
      machine.sizeZ?.toLowerCase().includes(search)
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showDetail || filteredMachines.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, filteredMachines.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selected = filteredMachines[selectedRow];
        if (selected) {
          openEditor(selected);
        }
      }
    },
    [filteredMachines, selectedRow, showDetail]
  );

  // ✅ No useEffect dispatch needed - data already loaded from cache!

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedRow(0);
  }, [searchTerm]);

  const openEditor = (machine: Machine) => {
    setSelectedMachine(machine);
    setEditForm({
      machineName: machine.machineName,
      sizeX: machine.sizeX,
      sizeY: machine.sizeY,
      sizeZ: machine.sizeZ,
      machineTypeId: machine.machineType?._id || "",
    });

    // Load table configuration if exists
    if (machine.tableConfig) {
      setTableColumns(machine.tableConfig.columns || []);
      setTableFormulas(machine.tableConfig.formulas || {});
      setTableRows(machine.tableConfig.data || []);
    } else {
      setTableColumns([]);
      setTableFormulas({});
      setTableRows([]);
    }

    setShowDetail(true);
    setEditMode('basic');
  };

  const handleEditChange = (field: keyof EditForm, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

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
  const calculateTotal = (columnName: string, rows?: TableRow[]): number => {
    const dataRows = rows || tableRows;
    if (tableColumns.find(c => c.name === columnName)?.dataType === 'number' || 
        tableColumns.find(c => c.name === columnName)?.dataType === 'formula') {
      return dataRows.reduce((sum, row) => {
        const value = Number(row.data[columnName]) || 0;
        return sum + value;
      }, 0);
    }
    return 0;
  };

  // Table Management Functions
 const applyTableTemplate = (template: typeof tableTemplates[0]) => {
  if (!confirm(`Apply template "${template.name}"? This will replace your current table configuration.`)) {
    return;
  }

  setTableColumns(
    template.columns.map((col, index) => ({
      ...col,
      order: index
    }))
  );


  const cleanFormulas = Object.fromEntries(
    Object.entries(template.formulas).filter(([_, f]) => f !== undefined)
  ) as Record<string, Formula>;

  setTableFormulas(cleanFormulas);

  alert(`✅ Applied template: ${template.name}`);
};

  const addColumn = () => {
    if (!newColumnName.trim()) {
      alert("Please enter a column name");
      return;
    }

    if (tableColumns.some(col => col.name === newColumnName.trim())) {
      alert("Column name already exists");
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
    if (!confirm(`Are you sure you want to delete column "${columnName}"? This will also delete all data in this column.`)) {
      return;
    }

    const updatedColumns = tableColumns.filter(col => col.name !== columnName);
    const reorderedColumns = updatedColumns.map((col, index) => ({
      ...col,
      order: index
    }));
    setTableColumns(reorderedColumns);

    // Remove formulas
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
      alert("Please select a column and enter a formula expression");
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

  // Row Management
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
    if (!confirm('Are you sure you want to delete this row?')) return;
    
    const updatedRows = tableRows.filter(r => r.id !== rowId);
    setTableRows(updatedRows);
    
    if (editingRowId === rowId) {
      setEditingRowId(null);
      setCurrentRowData({});
    }
  };

  const exportTableConfig = () => {
    const config = {
      tableName: `${selectedMachine?.machineName || 'machine'}_table_config`,
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
    a.download = `${selectedMachine?.machineName || 'machine'}_data_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdate = async () => {
    if (!selectedMachine) return;

    if (!editForm.machineName.trim()) {
      alert("Please enter machine name");
      return;
    }

    if (!editForm.machineTypeId) {
      alert("Please select machine type");
      return;
    }

    if (!editForm.sizeX || !editForm.sizeY || !editForm.sizeZ) {
      alert("Please enter all size dimensions");
      return;
    }

    try {
      const updateData: any = {
        machineName: editForm.machineName.trim(),
        sizeX: editForm.sizeX,
        sizeY: editForm.sizeY,
        sizeZ: editForm.sizeZ,
        machineType: editForm.machineTypeId,
      };

      // Include table config if it exists
      if (tableColumns.length > 0) {
        updateData.tableConfig = {
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
      }

      await dispatch(updateMachine(selectedMachine._id, updateData));
      alert("Machine updated successfully!");
      setShowDetail(false);
      setSelectedMachine(null);
      // ✅ OPTIMIZED: Cache will auto-refresh on next page load
    } catch (err) {
      alert("Failed to update machine.");
    }
  };

  const handleDelete = async () => {
    if (!selectedMachine) return;

    if (!window.confirm("Are you sure you want to delete this machine?"))
      return;

    try {
      await dispatch(deleteMachine(selectedMachine._id));
      alert("Deleted successfully.");
      setShowDetail(false);
      setSelectedMachine(null);
      // ✅ OPTIMIZED: Cache will auto-refresh on next page load
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleRowClick = (index: number, machine: Machine) => {
    setSelectedRow(index);
    openEditor(machine);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

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

  return (
    <div className="EditMachineType">
      {loading && <p className="loadingAndError">Loading...</p>}
      {error && <p className="loadingAndError" style={{ color: "red" }}>{error}</p>}

      {!showDetail && !loading && machines.length > 0 ? (
        <>
          {/* Search Bar */}
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by machine name, type, branch, or size..."
                className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#FF6B35] transition-all"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  fontSize: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2d89ef'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#666',
              }}>
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '4px 8px',
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div style={{
              padding: '12px 16px',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              whiteSpace: 'nowrap',
            }}>
              {filteredMachines.length} of {machines.length} machines
            </div>
          </div>

          {/* Table */}
          {filteredMachines.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Machine Name</th>
                  <th>Type</th>
                  <th>Size X</th>
                  <th>Size Y</th>
                  <th>Size Z</th>
                  <th>Branch</th>
                  <th>Table Config</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((machine: Machine, index: number) => (
                  <tr
                    key={machine._id}
                    className={selectedRow === index ? "bg-orange-100" : ""}
                    onClick={() => handleRowClick(index, machine)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{machine.machineName}</td>
                    <td>{machine.machineType?.type || "N/A"}</td>
                    <td>{machine.sizeX}</td>
                    <td>{machine.sizeY}</td>
                    <td>{machine.sizeZ}</td>
                    <td>{machine.branchId?.name || "N/A"}</td>
                    <td>
                      {machine.tableConfig ? (
                        <span style={{ color: 'green' }}>
                          ✅ {machine.tableConfig.columns?.length || 0} cols
                        </span>
                      ) : (
                        <span style={{ color: '#999' }}>❌ No config</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999',
              fontSize: '16px',
            }}>
              No machines found matching "{searchTerm}"
            </div>
          )}
        </>
      ) : showDetail && selectedMachine ? (
        <div className="detail-container">
          <div className="TopButtonEdit">
            <button onClick={() => setShowDetail(false)}>Back</button>
            <button onClick={handleDelete} className="Delete">
              Delete Machine
            </button>
          </div>

          {/* Edit Mode Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '20px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <button
              onClick={() => handleEditModeChange('basic')}
              style={{
                padding: '10px 20px',
                background: editMode === 'basic' ? '#2d89ef' : 'transparent',
                color: editMode === 'basic' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Settings size={16} />
              Basic Info
            </button>
            <button
              onClick={() => handleEditModeChange('config')}
              style={{
                padding: '10px 20px',
                background: editMode === 'config' ? '#2d89ef' : 'transparent',
                color: editMode === 'config' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Settings size={16} />
              Configure Table
            </button>
            <button
              onClick={() => handleEditModeChange('preview')}
              style={{
                padding: '10px 20px',
                background: editMode === 'preview' ? '#2d89ef' : 'transparent',
                color: editMode === 'preview' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Eye size={16} />
              Preview & Test
            </button>
            <button
              onClick={() => handleEditModeChange('data')}
              style={{
                padding: '10px 20px',
                background: editMode === 'data' ? '#2d89ef' : 'transparent',
                color: editMode === 'data' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <TableIcon size={16} />
              Data ({tableRows.length})
            </button>
          </div>

          {/* Basic Info Edit */}
          {editMode === 'basic' && (
            <>
              <div className="form-section">
                <label>Machine Type:</label>
                <select
                  value={editForm.machineTypeId}
                  onChange={(e) => handleEditChange("machineTypeId", e.target.value)}
                >
                  <option value="">Select Type</option>
                  {machineTypes.map((type: MachineType) => (
                    <option key={type._id} value={type._id}>
                      {type.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <label>Size X:</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editForm.sizeX}
                  onChange={(e) => handleEditChange("sizeX", e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>Size Y:</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editForm.sizeY}
                  onChange={(e) => handleEditChange("sizeY", e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>Size Z:</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editForm.sizeZ}
                  onChange={(e) => handleEditChange("sizeZ", e.target.value)}
                />
              </div>

              <div className="info-section">
                <p>
                  <strong>Branch:</strong> {selectedMachine.branchId?.name || "N/A"}
                </p>
                <p>
                  <strong>Current Type:</strong> {selectedMachine.machineType?.type || "N/A"}
                </p>
                <p>
                  <strong>Table Configuration:</strong>{" "}
                  {selectedMachine.tableConfig ? (
                    <span style={{ color: 'green' }}>
                      ✅ {selectedMachine.tableConfig.columns?.length || 0} columns configured
                    </span>
                  ) : (
                    <span style={{ color: '#999' }}>❌ No table configuration</span>
                  )}
                </p>
              </div>
            </>
          )}

          {/* Configure Table View */}
          {editMode === 'config' && (
            <div className="CreateMachineTableConfigurationSection">
              <div className="CreateMachineSectionHeader">
                <h3 className="CreateMachineSectionTitle">Data Table Configuration</h3>
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
          {editMode === 'preview' && (
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
          {editMode === 'data' && (
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

          {/* Save Button */}
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            background: '#f9fafb', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              onClick={() => setShowDetail(false)}
              style={{
                padding: '10px 24px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              style={{
                padding: '10px 24px',
                background: '#2d89ef',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EditMachines;
