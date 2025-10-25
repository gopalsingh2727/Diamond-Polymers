import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMachineTypes } from "../../../../redux/create/machineType/machineTypeActions";
import { createMachine } from "../../../../redux/create/machine/MachineActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { Plus, Trash2, Download, Settings, Save, Edit, Calculator } from 'lucide-react';
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

const CreateMachine: React.FC = () => {
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [size, setSize] = useState<MachineSize>({ x: "", y: "", z: "" });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

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

  // UI State
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<'text' | 'number' | 'formula' | 'date'>('text');
  const [newColumnRequired, setNewColumnRequired] = useState(false);
  const [selectedFormulaColumn, setSelectedFormulaColumn] = useState('');
  const [formulaExpression, setFormulaExpression] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: machineTypes, loading } = useSelector(
    (state: RootState) => state.machineTypeList
  );

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

  useEffect(() => {
    dispatch(getMachineTypes());
  }, [dispatch]);

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
          }
        };
        localStorage.setItem("machineDraft", JSON.stringify(draftData));
        setHasUnsavedChanges(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [machineName, machineType, size, tableColumns, tableFormulas]);

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

  // Table Management Functions
  const applyTableTemplate = (template: typeof tableTemplates[0]) => {
    setTableColumns(template.columns.map((col, index) => ({
      ...col,
      order: index
    })));
    setTableFormulas(template.formulas);
    setSavedMessage(`✅ Applied template: ${template.name}`);
    setTimeout(() => setSavedMessage(""), 3000);
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
    // Remove column
    const updatedColumns = tableColumns.filter(col => col.name !== columnName);
    // Reorder remaining columns
    const reorderedColumns = updatedColumns.map((col, index) => ({
      ...col,
      order: index
    }));
    setTableColumns(reorderedColumns);

    // Remove any formulas that depend on this column or are for this column
    const updatedFormulas = { ...tableFormulas };
    delete updatedFormulas[columnName];
    
    // Remove formulas that depend on the deleted column
    Object.keys(updatedFormulas).forEach(formulaCol => {
      const formula = updatedFormulas[formulaCol];
      if (formula.dependencies.includes(columnName)) {
        delete updatedFormulas[formulaCol];
      }
    });

    setTableFormulas(updatedFormulas);
  };

  const addFormula = () => {
    if (!selectedFormulaColumn || !formulaExpression.trim()) {
      alert("Please select a column and enter a formula expression");
      return;
    }

    // Find dependencies by checking which column names are mentioned in the formula
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

    // Update the column to be a formula type
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

    // Update column type back to text/number
    const updatedColumns = tableColumns.map(col => 
      col.name === columnName 
        ? { ...col, dataType: 'text' as const, placeholder: `Enter ${col.name.toLowerCase()}` }
        : col
    );
    setTableColumns(updatedColumns);
  };

  const exportTableConfig = () => {
    const config = {
      tableName: `${machineName || 'machine'}_table_config`,
      columns: tableColumns,
      formulas: tableFormulas,
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
    a.download = `${machineName || 'machine'}_table_config.json`;
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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isValidForm()) {
      alert("Please fill all required fields and define at least one table column");
      return;
    }

    // Prepare table configuration for MongoDB
    const tableConfig = {
      columns: tableColumns,
      formulas: new Map(
        Object.entries(tableFormulas).map(([key, value]) => [key, value])
      ),
      settings: {
        autoCalculate: true,
        autoUpdateOrders: true,
        maxRows: 1000,
        enableHistory: true
      }
    };

    const newMachine = {
      machineName: machineName.trim(),
      machineType,
      sizeX: size.x.trim(),
      sizeY: size.y.trim(),
      sizeZ: size.z.trim(),
      tableConfig
    };

    dispatch(createMachine(newMachine));
    setSavedMessage("✅ Machine with table configuration saved successfully.");
    resetForm();
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

  return (
    <div ref={containerRef} className="createMachineCss" aria-labelledby="CreateMachineFormTitle">
      <form onSubmit={handleSubmit} className="CreateMachineForm">
        <h2 id="CreateMachineFormTitle" className="CreateMachineFormTitle">Create Machine with Data Table</h2>

        {savedMessage && <div className="CreateMachineSuccessMsg">{savedMessage}</div>}

        {/* Basic Machine Information */}
        <div className="CreateMachineFormGroup">
          <label htmlFor="CreateMachineMachineName" className="CreateMachineFormLabel">Machine Name *</label>
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
          <label htmlFor="CreateMachineMachineType" className="CreateMachineFormLabel">Machine Type *</label>
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

        {/* Table Configuration Section */}
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

        <div className="CreateMachineFormActions">
          <button type="submit" className="CreateMachineSaveButton" disabled={!isValidForm()}>
            Save Machine & Table Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMachine;