import React from 'react';
import { Plus, Trash2, Download, Settings, Calculator, Eye, Table as TableIcon, Edit2, Check, X } from 'lucide-react';
import { useMachineTableConfig, TableColumn, Formula, TableRow, TABLE_TEMPLATES } from '../hooks/useMachineTableConfig';

interface MachineTableEditorProps {
  mode: 'config' | 'preview' | 'data';
  machineName?: string;
  tableConfig: ReturnType<typeof useMachineTableConfig>;
}

// Column type icon component
const ColumnTypeIcon: React.FC<{ dataType: string }> = ({ dataType }) => {
  switch (dataType) {
    case 'formula': return <Calculator size={14} />;
    case 'number': return <span>#</span>;
    case 'date': return <span>date</span>;
    default: return <span>T</span>;
  }
};

export const MachineTableEditor: React.FC<MachineTableEditorProps> = ({
  mode,
  machineName = 'machine',
  tableConfig
}) => {
  const {
    tableColumns,
    tableFormulas,
    tableRows,
    testRows,
    editingRowId,
    currentRowData,
    newColumnName,
    setNewColumnName,
    newColumnType,
    setNewColumnType,
    newColumnRequired,
    setNewColumnRequired,
    selectedFormulaColumn,
    setSelectedFormulaColumn,
    formulaExpression,
    setFormulaExpression,
    formulaDescription,
    setFormulaDescription,
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
    calculateTotal,
    templates
  } = tableConfig;

  const handleAddColumn = () => {
    const result = addColumn();
    if (!result.success && result.message) {
      alert(result.message);
    }
  };

  const handleAddFormula = () => {
    const result = addFormula();
    if (!result.success && result.message) {
      alert(result.message);
    }
  };

  const handleRemoveColumn = (columnName: string) => {
    if (confirm(`Delete column "${columnName}"? This will also delete all data in this column.`)) {
      removeColumn(columnName);
    }
  };

  const handleDeleteRow = (rowId: string) => {
    if (confirm('Delete this row?')) {
      deleteRow(rowId);
    }
  };

  const handleApplyTemplate = (template: typeof TABLE_TEMPLATES[0]) => {
    if (confirm(`Apply template "${template.name}"? This will replace your current table configuration.`)) {
      applyTemplate(template);
      alert(`Applied template: ${template.name}`);
    }
  };

  // Config Mode UI
  if (mode === 'config') {
    return (
      <div className="MachineTableConfig">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Data Table Configuration</h3>
          <button
            type="button"
            onClick={() => exportConfig(machineName)}
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

        {/* Templates */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Quick Templates</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {templates.map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleApplyTemplate(template)}
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
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
            Table Columns ({tableColumns.length})
          </h4>

          {/* Current Columns */}
          <div style={{ marginBottom: '15px' }}>
            {tableColumns.map((column) => (
              <div
                key={column.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: 'white',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>
                    <ColumnTypeIcon dataType={column.dataType} />
                  </span>
                  <span style={{ fontWeight: 600 }}>{column.name}</span>
                  <span style={{ fontSize: '12px', color: '#6c757d' }}>({column.dataType})</span>
                  {column.isRequired && (
                    <span style={{
                      fontSize: '11px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      Required
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveColumn(column.name)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Column Form */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name"
              style={{
                flex: '1',
                minWidth: '150px',
                padding: '8px',
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}
            />
            <select
              value={newColumnType}
              onChange={(e) => setNewColumnType(e.target.value as any)}
              style={{ padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="formula">Formula</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={newColumnRequired}
                onChange={(e) => setNewColumnRequired(e.target.checked)}
              />
              Required
            </label>
            <button
              type="button"
              onClick={handleAddColumn}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              Add Column
            </button>
          </div>
        </div>

        {/* Formula Management */}
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Formula Configuration</h4>

          {/* Current Formulas */}
          {Object.keys(tableFormulas).length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              {Object.entries(tableFormulas).map(([columnName, formula]) => (
                <div
                  key={columnName}
                  style={{
                    padding: '12px',
                    backgroundColor: 'white',
                    marginBottom: '10px',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{columnName}</span>
                    <button
                      type="button"
                      onClick={() => removeFormula(columnName)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                    <strong>Expression:</strong> {formula.expression}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                    <strong>Dependencies:</strong> [{formula.dependencies.join(', ')}]
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    <strong>Description:</strong> {formula.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Formula Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select
              value={selectedFormulaColumn}
              onChange={(e) => setSelectedFormulaColumn(e.target.value)}
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
              style={{ padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={formulaDescription}
              onChange={(e) => setFormulaDescription(e.target.value)}
              placeholder="Formula description (optional)"
              style={{ padding: '8px', border: '1px solid #dee2e6', borderRadius: '4px' }}
            />
            <button
              type="button"
              onClick={handleAddFormula}
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

          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '12px' }}>
            <p style={{ margin: '0 0 5px 0' }}><strong>Available Operations:</strong> +, -, *, /, ( ), numbers</p>
            <p style={{ margin: 0 }}><strong>Column References:</strong> Use exact column names in formulas</p>
          </div>
        </div>

        {/* Table Structure Preview */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Table Structure Preview</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Column Name</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Required</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Formula</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>Placeholder</th>
                </tr>
              </thead>
              <tbody>
                {tableColumns.map((column) => (
                  <tr key={column.name}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ColumnTypeIcon dataType={column.dataType} />
                        {column.name}
                      </div>
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{column.dataType}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{column.isRequired ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{tableFormulas[column.name]?.expression || '-'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{column.placeholder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Preview Mode UI
  if (mode === 'preview') {
    return (
      <div className="MachineTablePreview">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Table Preview with Sample Data</h3>
          <button
            type="button"
            onClick={generateTestData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Settings size={16} />
            Regenerate Test Data
          </button>
        </div>

        <div style={{ padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '4px', marginBottom: '15px' }}>
          <strong>Test Mode:</strong> This shows how your table will look with sample data. Formulas are calculated automatically.
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {tableColumns.map((col) => (
                  <th
                    key={col.name}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderBottom: '2px solid #dee2e6',
                      textAlign: 'left',
                      fontWeight: 600
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ColumnTypeIcon dataType={col.dataType} />
                      {col.name}
                      {col.isRequired && <span style={{ color: '#e74c3c' }}>*</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {testRows.map((row) => (
                <tr key={row.id}>
                  {tableColumns.map((col) => (
                    <td
                      key={col.name}
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: col.dataType === 'formula' ? '#fff3cd' : 'white'
                      }}
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
                <tr>
                  {tableColumns.map((col, idx) => (
                    <td
                      key={col.name}
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: '#e7f3ff',
                        fontWeight: 600
                      }}
                    >
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
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
              Active Formulas (Auto-calculated columns are highlighted):
            </h4>
            {Object.entries(tableFormulas).map(([colName, formula]) => (
              <div key={colName} style={{ fontSize: '13px', marginBottom: '8px' }}>
                <strong>{colName}:</strong> {formula.expression}{' '}
                <em style={{ color: '#6c757d' }}>({formula.description})</em>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Data Entry Mode UI
  return (
    <div className="MachineTableDataEntry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Data Entries ({tableRows.length} rows)</h3>
        <button
          type="button"
          onClick={addRow}
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
          <Plus size={16} />
          Add Row
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {tableColumns.map((col) => (
                <th
                  key={col.name}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6',
                    textAlign: 'left',
                    fontWeight: 600
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ColumnTypeIcon dataType={col.dataType} />
                    {col.name}
                  </div>
                </th>
              ))}
              <th
                style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #dee2e6',
                  textAlign: 'center',
                  fontWeight: 600
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.id}>
                {tableColumns.map((col) => (
                  <td key={col.name} style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>
                    {editingRowId === row.id ? (
                      col.dataType === 'formula' ? (
                        <span style={{ fontWeight: 600, color: '#e67e22' }}>
                          {currentRowData[col.name] || 0}
                        </span>
                      ) : (
                        <input
                          type={col.dataType === 'number' ? 'number' : col.dataType === 'date' ? 'date' : 'text'}
                          value={currentRowData[col.name] || ''}
                          onChange={(e) => updateRowData(col.name, e.target.value)}
                          placeholder={col.placeholder}
                          style={{
                            width: '100%',
                            padding: '6px',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px'
                          }}
                        />
                      )
                    ) : (
                      <span>{row.data[col.name] || '-'}</span>
                    )}
                  </td>
                ))}
                <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                  {editingRowId === row.id ? (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={saveRow}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={14} />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelRowEdit}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => editRow(row)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
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
              <tr>
                {tableColumns.map((col, idx) => (
                  <td
                    key={col.name}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: '#e7f3ff',
                      fontWeight: 600
                    }}
                  >
                    {idx === 0 ? 'Total:' : (
                      (col.dataType === 'number' || col.dataType === 'formula')
                        ? calculateTotal(col.name, tableRows).toFixed(2)
                        : ''
                    )}
                  </td>
                ))}
                <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6', backgroundColor: '#e7f3ff' }}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tableRows.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          No data rows yet. Click "Add Row" to start entering data.
        </div>
      )}
    </div>
  );
};

export default MachineTableEditor;
