import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTableRow, updateTableRow, deleteTableRow, markOrderComplete } from "../../../redux/operatorView/operatorViewActions";
import { AppDispatch } from "../../../../store";
import { RootState } from "../../../redux/rootReducer";

interface ColumnConfig {
  _id?: string;
  name: string;
  label?: string;
  dataType: string;
  unit?: string;
  isRequired?: boolean;
  isCalculated?: boolean;
  isReadOnly?: boolean;
  formula?: string | { type: string; expression: string; dependencies?: string[] };
  width?: number;
  // Source configuration
  sourceType?: 'manual' | 'order' | 'customer' | 'optionSpec' | 'calculated';
  // OptionSpec source fields
  optionTypeId?: string;
  optionTypeName?: string;
  optionSpecId?: string;
  optionSpecName?: string;
  specField?: string;
  specFieldUnit?: string;
}

interface DataTableProps {
  machineId: string;
  orderId: string;
  template: any;
  tableData: any;
  order?: any;  // Order data with options for optionSpec column values
  editable?: boolean;  // If false, shows read-only table view
}

const DataTable: React.FC<DataTableProps> = ({ machineId, orderId, template, tableData, order, editable = true }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { rowLoading } = useSelector((state: RootState) => state.operatorView);

  // Get optionSpec value from order options
  const getOptionSpecValue = useCallback((column: ColumnConfig): any => {
    if (column.sourceType !== 'optionSpec' || !order?.options) {
      return null;
    }

    // Find the option that matches the optionTypeId or optionSpecId
    const matchingOption = order.options.find((opt: any) => {
      // Match by optionTypeId (the option's optionType) or optionSpecId (the option's optionSpec)
      const optionTypeMatch = opt.optionTypeId === column.optionTypeId ||
                              opt.optionType?._id === column.optionTypeId ||
                              opt.optionType === column.optionTypeId;
      const optionSpecMatch = opt.optionSpecId === column.optionSpecId ||
                              opt.optionSpec?._id === column.optionSpecId ||
                              opt.optionSpec === column.optionSpecId ||
                              opt._id === column.optionSpecId;

      return optionTypeMatch || optionSpecMatch;
    });

    if (!matchingOption) {
      return null;
    }

    // Find the spec value from specificationValues
    if (column.specField && matchingOption.specificationValues) {
      const specValue = matchingOption.specificationValues.find(
        (sv: any) => sv.name === column.specField || sv.specName === column.specField
      );
      if (specValue) {
        return specValue.value ?? specValue;
      }
    }

    // If no specField specified, return the option name
    return matchingOption.optionName || matchingOption.name;
  }, [order]);

  const columns: ColumnConfig[] = template?.columns || [];
  const rows = tableData?.rows || [];
  const totals = tableData?.totals || {};
  const progress = tableData?.progress || 0;
  const isComplete = tableData?.isComplete || false;
  const targetValue = tableData?.targetValue;
  const currentValue = tableData?.currentValue;

  // New row input state
  const [newRowValues, setNewRowValues] = useState<Record<string, any>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editRowValues, setEditRowValues] = useState<Record<string, any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Initialize new row values
  const resetNewRow = useCallback(() => {
    const initial: Record<string, any> = {};
    columns.forEach(col => {
      if (!col.isCalculated) {
        initial[col.name] = col.dataType === 'number' ? '' : '';
      }
    });
    setNewRowValues(initial);
  }, [columns]);

  // Handle new row input change
  const handleNewRowChange = (columnName: string, value: any) => {
    setNewRowValues(prev => ({ ...prev, [columnName]: value }));
  };

  // Handle edit row input change
  const handleEditRowChange = (columnName: string, value: any) => {
    setEditRowValues(prev => ({ ...prev, [columnName]: value }));
  };

  // Add new row
  const handleAddRow = async () => {
    const values = columns
      .filter(col => !col.isCalculated)
      .map(col => ({
        columnName: col.name,
        value: col.dataType === 'number'
          ? (parseFloat(newRowValues[col.name]) || 0)
          : newRowValues[col.name] || '',
        unit: col.unit
      }));

    try {
      await dispatch(addTableRow(machineId, orderId, { values }));
      resetNewRow();
    } catch (err) {
      console.error('Failed to add row:', err);
    }
  };

  // Start editing row
  const handleStartEdit = (row: any) => {
    const values: Record<string, any> = {};
    row.values.forEach((v: any) => {
      values[v.columnName] = v.value;
    });
    setEditRowValues(values);
    setEditingRowId(row._id);
  };

  // Save edited row
  const handleSaveEdit = async (rowId: string) => {
    const values = columns
      .filter(col => !col.isCalculated)
      .map(col => ({
        columnName: col.name,
        value: col.dataType === 'number'
          ? (parseFloat(editRowValues[col.name]) || 0)
          : editRowValues[col.name] || '',
        unit: col.unit
      }));

    try {
      await dispatch(updateTableRow(machineId, orderId, rowId, { values }));
      setEditingRowId(null);
      setEditRowValues({});
    } catch (err) {
      console.error('Failed to update row:', err);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditRowValues({});
  };

  // Delete row
  const handleDeleteRow = async (rowId: string) => {
    try {
      await dispatch(deleteTableRow(machineId, orderId, rowId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete row:', err);
    }
  };

  // Mark order complete
  const handleMarkComplete = async () => {
    try {
      await dispatch(markOrderComplete(machineId, orderId));
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  // Get row value by column name
  const getRowValue = (row: any, columnName: string): any => {
    const valueObj = row.values?.find((v: any) => v.columnName === columnName);
    return valueObj?.value ?? '';
  };

  // Format value for display
  const formatValue = (value: any, column: ColumnConfig): string => {
    if (value === null || value === undefined || value === '') return '-';

    if (column.dataType === 'number') {
      const num = parseFloat(value);
      if (isNaN(num)) return '-';
      return column.unit ? `${num.toLocaleString()} ${column.unit}` : num.toLocaleString();
    }

    if (column.dataType === 'boolean' || column.dataType === 'checkbox') {
      return value ? 'Yes' : 'No';
    }

    if (column.dataType === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    return String(value);
  };

  // Render cell content based on data type
  const renderCellContent = (value: any, column: ColumnConfig) => {
    if (value === null || value === undefined || value === '') return '-';

    switch (column.dataType) {
      case 'image':
        return value ? (
          <img src={value} alt="" className="dataTableCellImage" style={{ maxWidth: '60px', maxHeight: '40px', objectFit: 'cover', borderRadius: '4px' }} />
        ) : '-';

      case 'file':
      case 'audio':
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="dataTableCellLink">
            {column.dataType === 'audio' ? 'Play' : 'View'}
          </a>
        ) : '-';

      case 'link':
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="dataTableCellLink">
            {value.length > 30 ? value.substring(0, 30) + '...' : value}
          </a>
        ) : '-';

      case 'boolean':
      case 'checkbox':
        return (
          <span className={`dataTableCheckmark ${value ? 'checked' : ''}`}>
            {value ? '✓' : ''}
          </span>
        );

      default:
        return formatValue(value, column);
    }
  };

  // Render input based on data type
  const renderInput = (value: any, column: ColumnConfig, onChange: (val: any) => void, disabled: boolean) => {
    switch (column.dataType) {
      case 'boolean':
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="dataTableCheckbox"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="dataTableInput"
          />
        );

      case 'dropdown':
        // If column has options, render select; otherwise text input
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="dataTableInput"
            placeholder={column.label || column.name}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="dataTableInput"
            placeholder={column.label || column.name}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="dataTableInput"
            placeholder={column.label || column.name}
          />
        );
    }
  };

  // Get totals config
  const totalsConfig = template?.totalsConfig || [];

  return (
    <div className="dataTableContainer">
      {/* Progress Summary */}
      <div className="dataTableSummary">
        <div className="dataTableProgress">
          <div className="dataTableProgressInfo">
            <span>Progress: {Math.round(progress)}%</span>
            {targetValue && (
              <span className="dataTableTarget">
                {currentValue?.toLocaleString()} / {targetValue?.toLocaleString()}
              </span>
            )}
          </div>
          <div className="dataTableProgressBar">
            <div
              className={`dataTableProgressFill ${isComplete ? 'complete' : ''}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {!isComplete && progress >= 100 && (
          <button
            className="dataTableCompleteBtn"
            onClick={handleMarkComplete}
            disabled={rowLoading}
          >
            Mark Complete
          </button>
        )}

        {isComplete && (
          <span className="dataTableCompleteBadge">Order Complete</span>
        )}
      </div>

      {/* Data Table */}
      <div className="dataTableWrapper">
        <table className="dataTable">
          <thead>
            <tr>
              <th className="dataTableTh" style={{ width: '60px' }}>#</th>
              {columns.map(col => (
                <th
                  key={col._id || col.name}
                  className="dataTableTh"
                  style={{ width: col.width ? `${col.width}px` : 'auto' }}
                >
                  {col.label || col.name}
                  {col.unit && <span className="dataTableUnit">({col.unit})</span>}
                  {col.isRequired && editable && <span className="dataTableRequired">*</span>}
                </th>
              ))}
              {editable && <th className="dataTableTh" style={{ width: '120px' }}>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {/* Existing Rows */}
            {rows.map((row: any, index: number) => (
              <tr key={row._id} className="dataTableRow">
                <td className="dataTableTd">{index + 1}</td>
                {columns.map(col => {
                  // Check if column is optionSpec - always show value from order
                  const isOptionSpecCol = col.sourceType === 'optionSpec';
                  const optionSpecValue = isOptionSpecCol ? getOptionSpecValue(col) : null;
                  const isColumnReadOnly = col.isCalculated || col.isReadOnly || isOptionSpecCol;

                  return (
                    <td key={col._id || col.name} className={`dataTableTd ${isOptionSpecCol ? 'dataTableTd--optionSpec' : ''}`}>
                      {editable && editingRowId === row._id && !isColumnReadOnly ? (
                        renderInput(
                          editRowValues[col.name],
                          col,
                          (val) => handleEditRowChange(col.name, val),
                          rowLoading
                        )
                      ) : isOptionSpecCol ? (
                        // Show optionSpec value from order
                        renderCellContent(optionSpecValue, col)
                      ) : (
                        renderCellContent(getRowValue(row, col.name), col)
                      )}
                    </td>
                  );
                })}
                {editable && (
                  <td className="dataTableTd dataTableActions">
                    {editingRowId === row._id ? (
                      <>
                        <button
                          className="dataTableBtn save"
                          onClick={() => handleSaveEdit(row._id)}
                          disabled={rowLoading}
                        >
                          {rowLoading ? '...' : 'Save'}
                        </button>
                        <button
                          className="dataTableBtn cancel"
                          onClick={handleCancelEdit}
                          disabled={rowLoading}
                        >
                          Cancel
                        </button>
                      </>
                    ) : deleteConfirm === row._id ? (
                      <>
                        <button
                          className="dataTableBtn delete"
                          onClick={() => handleDeleteRow(row._id)}
                          disabled={rowLoading}
                        >
                          {rowLoading ? '...' : 'Confirm'}
                        </button>
                        <button
                          className="dataTableBtn cancel"
                          onClick={() => setDeleteConfirm(null)}
                          disabled={rowLoading}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="dataTableBtn edit"
                          onClick={() => handleStartEdit(row)}
                          disabled={isComplete || rowLoading}
                        >
                          Edit
                        </button>
                        <button
                          className="dataTableBtn delete"
                          onClick={() => setDeleteConfirm(row._id)}
                          disabled={isComplete || rowLoading}
                        >
                          Del
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}

            {/* New Row Input - only show in editable mode */}
            {editable && !isComplete && (
              <tr className="dataTableRowNew">
                <td className="dataTableTd">+</td>
                {columns.map(col => {
                  const isOptionSpecCol = col.sourceType === 'optionSpec';
                  const optionSpecValue = isOptionSpecCol ? getOptionSpecValue(col) : null;

                  return (
                    <td key={col._id || col.name} className={`dataTableTd ${isOptionSpecCol ? 'dataTableTd--optionSpec' : ''}`}>
                      {col.isCalculated ? (
                        <span className="dataTableCalculated">Auto</span>
                      ) : isOptionSpecCol ? (
                        // Show optionSpec value from order (read-only)
                        <span className="dataTableOptionSpecValue">
                          {formatValue(optionSpecValue, col)}
                        </span>
                      ) : col.isReadOnly ? (
                        <span className="dataTableReadOnly">-</span>
                      ) : (
                        <input
                          type={col.dataType === 'number' ? 'number' : 'text'}
                          value={newRowValues[col.name] ?? ''}
                          onChange={(e) => handleNewRowChange(col.name, e.target.value)}
                          className="dataTableInput"
                          placeholder={col.label || col.name}
                          disabled={rowLoading}
                        />
                      )}
                    </td>
                  );
                })}
                <td className="dataTableTd">
                  <button
                    className="dataTableBtn add"
                    onClick={handleAddRow}
                    disabled={rowLoading}
                  >
                    {rowLoading ? '...' : 'Add'}
                  </button>
                </td>
              </tr>
            )}
          </tbody>

          {/* Totals Row */}
          {totalsConfig.length > 0 && rows.length > 0 && (
            <tfoot>
              <tr className="dataTableTotals">
                <td className="dataTableTd"><strong>Total</strong></td>
                {columns.map(col => {
                  const totalConfig = totalsConfig.find((tc: any) => tc.columnName === col.name);
                  const totalValue = totals[col.name];
                  return (
                    <td key={col._id || col.name} className="dataTableTd dataTableTotalCell">
                      {totalConfig && totalValue !== undefined ? (
                        <strong>
                          {totalConfig.formula}: {formatValue(totalValue, col)}
                        </strong>
                      ) : '-'}
                    </td>
                  );
                })}
                {editable && <td className="dataTableTd"></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default DataTable;
