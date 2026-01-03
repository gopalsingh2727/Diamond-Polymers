import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Save, Mic, Camera, Image as ImageIcon, Check } from 'lucide-react';
import "./OperatorEntryView.css";

// Types
interface ColumnConfig {
  id: string;
  name: string;
  label: string;
  dataType: 'text' | 'number' | 'formula' | 'dropdown' | 'boolean' | 'date' | 'image' | 'file';
  isRequired: boolean;
  isReadOnly: boolean;
  isVisible: boolean;
  order: number;
  width: number;
  unit?: string;
  formula?: {
    type: string;
    expression: string;
    dependencies: string[];
  };
  dropdownOptions?: {label: string;value: string;}[];
  sourceType: 'manual' | 'order' | 'customer' | 'optionSpec' | 'calculated';
}

interface CustomerFieldsConfig {
  showName: boolean;
  showAlias: boolean;
  showAddress: boolean;
  showOrderId: boolean;
  showOrderDate: boolean;
  showImage: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showQuantity: boolean;
  showInstructions: boolean;
}

interface TotalsConfig {
  columnName: string;
  formula: 'SUM' | 'AVERAGE' | 'COUNT';
  label: string;
}

interface TemplateConfig {
  columns: ColumnConfig[];
  customerFields: CustomerFieldsConfig;
  totalsConfig: TotalsConfig[];
  settings: {
    autoStartTime: boolean;
    autoEndTime: boolean;
    requireOperator: boolean;
    requireHelper: boolean;
    requireApproval: boolean;
    allowVoiceNote: boolean;
    allowImageUpload: boolean;
  };
}

interface OrderInfo {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerAlias: string;
  address?: string;
  phone?: string;
  email?: string;
  quantity: number;
  productionDate: string;
  rollSize?: string;
  cuttingSize?: string;
  cuttingType?: string;
  brandName?: string;
  instructions?: string;
  orderImage?: string;
}

interface RowData {
  id: string;
  [key: string]: any;
}

interface OperatorEntryViewProps {
  template?: TemplateConfig;
  orderInfo?: OrderInfo;
  operators?: {id: string;name: string;}[];
  helpers?: {id: string;name: string;}[];
  machines?: {id: string;name: string;}[];
  onSave?: (data: RowData[], metadata: any) => void;
  existingData?: RowData[];
}

// Default template for demo - showing ALL data types
const defaultTemplate: TemplateConfig = {
  columns: [
  // NUMBER - Auto serial number
  { id: '1', name: 'slNo', label: 'Sl.No', dataType: 'number', isRequired: false, isReadOnly: true, isVisible: true, order: 0, width: 60, sourceType: 'calculated' },

  // NUMBER - Manual entry with unit
  { id: '2', name: 'grossWt', label: 'Gross Wt', dataType: 'number', isRequired: true, isReadOnly: false, isVisible: true, order: 1, width: 100, unit: 'kg', sourceType: 'manual' },

  // NUMBER - Manual entry with unit
  { id: '3', name: 'coreWt', label: 'Core Wt', dataType: 'number', isRequired: true, isReadOnly: false, isVisible: true, order: 2, width: 100, unit: 'kg', sourceType: 'manual' },

  // FORMULA - Auto calculated (Gross - Core)
  { id: '4', name: 'netWt', label: 'Net Wt', dataType: 'formula', isRequired: false, isReadOnly: true, isVisible: true, order: 3, width: 100, unit: 'kg', sourceType: 'calculated', formula: { type: 'CUSTOM', expression: 'grossWt - coreWt', dependencies: ['grossWt', 'coreWt'] } },

  // FORMULA - Auto calculated difference
  { id: '5', name: 'diffQty', label: 'Diff Qty', dataType: 'formula', isRequired: false, isReadOnly: true, isVisible: true, order: 4, width: 100, sourceType: 'calculated', formula: { type: 'CUSTOM', expression: 'targetQty - netWt', dependencies: ['netWt'] } },

  // DROPDOWN - Selection list
  { id: '6', name: 'quality', label: 'Quality', dataType: 'dropdown', isRequired: true, isReadOnly: false, isVisible: true, order: 5, width: 100, sourceType: 'manual', dropdownOptions: [
    { label: 'A Grade', value: 'a_grade' },
    { label: 'B Grade', value: 'b_grade' },
    { label: 'Rejected', value: 'rejected' }]
  },

  // BOOLEAN - Yes/No checkbox
  { id: '7', name: 'gaugeChecked', label: 'Gauge OK', dataType: 'boolean', isRequired: false, isReadOnly: false, isVisible: true, order: 6, width: 80, sourceType: 'manual' },

  // TEXT - String input
  { id: '8', name: 'remarks', label: 'Remarks', dataType: 'text', isRequired: false, isReadOnly: false, isVisible: true, order: 7, width: 150, sourceType: 'manual' },

  // DATE - Date picker
  { id: '9', name: 'productionDate', label: 'Date', dataType: 'date', isRequired: false, isReadOnly: false, isVisible: true, order: 8, width: 120, sourceType: 'manual' },

  // IMAGE - Camera/upload
  { id: '10', name: 'image', label: 'Image', dataType: 'image', isRequired: false, isReadOnly: false, isVisible: true, order: 9, width: 80, sourceType: 'manual' }],

  customerFields: {
    showName: true,
    showAlias: true,
    showAddress: false,
    showOrderId: true,
    showOrderDate: true,
    showImage: true,
    showPhone: false,
    showEmail: false,
    showQuantity: true,
    showInstructions: true
  },
  totalsConfig: [
  { columnName: 'grossWt', formula: 'SUM', label: 'Total' },
  { columnName: 'coreWt', formula: 'SUM', label: 'Total' },
  { columnName: 'netWt', formula: 'SUM', label: 'Total' },
  { columnName: 'diffQty', formula: 'SUM', label: 'Total' }],

  settings: {
    autoStartTime: true,
    autoEndTime: true,
    requireOperator: true,
    requireHelper: false,
    requireApproval: false,
    allowVoiceNote: true,
    allowImageUpload: true
  }
};

// Default order info for demo
const defaultOrderInfo: OrderInfo = {
  orderId: 'DP/2024-25/00001',
  orderDate: '2024-01-15',
  customerName: 'Abhi Plastics',
  customerAlias: 'AP',
  quantity: 500,
  productionDate: new Date().toISOString().split('T')[0],
  rollSize: '600mm',
  cuttingSize: '12" x 18"',
  cuttingType: 'B/S',
  brandName: 'Premium Pack',
  instructions: 'Handle with care. Check gauge for every roll.',
  orderImage: ''
};

const OperatorEntryView: React.FC<OperatorEntryViewProps> = ({
  template = defaultTemplate,
  orderInfo = defaultOrderInfo,
  operators = [{ id: '1', name: 'Ramesh' }, { id: '2', name: 'Suresh' }],
  helpers = [{ id: '1', name: 'Ganesh' }, { id: '2', name: 'Lokesh' }],
  machines = [{ id: '1', name: 'LLDPE Machine 1' }, { id: '2', name: 'LLDPE Machine 2' }],
  onSave,
  existingData = []
}) => {
  // State
  const [rows, setRows] = useState<RowData[]>([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedHelper, setSelectedHelper] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [startTime, setStartTime] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with existing data or empty row
  useEffect(() => {
    if (existingData.length > 0) {
      setRows(existingData);
    } else {
      addRow();
    }
  }, [existingData]);

  // Auto start time when operator is selected
  useEffect(() => {
    if (selectedOperator && template.settings.autoStartTime && !startTime) {
      setStartTime(new Date().toLocaleTimeString());
    }
  }, [selectedOperator, template.settings.autoStartTime, startTime]);

  // Generate unique ID
  const generateId = () => `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new row
  const addRow = () => {
    const newRow: RowData = { id: generateId() };
    template.columns.forEach((col) => {
      if (col.name === 'slNo') {
        newRow[col.name] = rows.length + 1;
      } else {
        newRow[col.name] = col.dataType === 'number' || col.dataType === 'formula' ? '' : '';
      }
    });
    setRows((prev) => [...prev, newRow]);
  };

  // Remove row
  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => {
      const newRows = prev.filter((_, i) => i !== index);
      // Recalculate serial numbers
      return newRows.map((row, i) => ({ ...row, slNo: i + 1 }));
    });
  };

  // Calculate formula value
  const calculateFormula = useCallback((expression: string, rowData: RowData, targetQty: number): number => {
    try {
      // Replace column names with values
      let calcExpression = expression;

      // Replace targetQty
      calcExpression = calcExpression.replace(/targetQty/g, String(targetQty));

      // Replace column values
      Object.keys(rowData).forEach((key) => {
        const value = parseFloat(rowData[key]) || 0;
        calcExpression = calcExpression.replace(new RegExp(key, 'g'), String(value));
      });

      // Evaluate (simple math only - no eval for security)
      // This is a simple parser for basic math expressions
      const result = Function('"use strict"; return (' + calcExpression + ')')();
      return isNaN(result) ? 0 : Math.round(result * 100) / 100;
    } catch (e) {
      return 0;
    }
  }, []);

  // Update cell value
  const updateCell = (rowIndex: number, columnName: string, value: any) => {
    setRows((prev) => {
      const newRows = [...prev];
      newRows[rowIndex] = { ...newRows[rowIndex], [columnName]: value };

      // Recalculate formula columns for this row
      template.columns.forEach((col) => {
        if (col.dataType === 'formula' && col.formula?.expression) {
          newRows[rowIndex][col.name] = calculateFormula(
            col.formula.expression,
            newRows[rowIndex],
            orderInfo.quantity
          );
        }
      });

      return newRows;
    });
  };

  // Calculate totals
  const calculateTotal = (columnName: string, formula: 'SUM' | 'AVERAGE' | 'COUNT'): number => {
    const values = rows.map((row) => parseFloat(row[columnName]) || 0);

    switch (formula) {
      case 'SUM':
        return values.reduce((a, b) => a + b, 0);
      case 'AVERAGE':
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'COUNT':
        return values.filter((v) => v > 0).length;
      default:
        return 0;
    }
  };

  // Handle save
  const handleSave = async () => {
    if (template.settings.requireOperator && !selectedOperator) {
      alert('Please select an operator');
      return;
    }

    setIsSaving(true);
    const endTime = template.settings.autoEndTime ? new Date().toLocaleTimeString() : null;

    const metadata = {
      operatorId: selectedOperator,
      helperId: selectedHelper,
      machineId: selectedMachine,
      startTime,
      endTime,
      voiceNote,
      savedAt: new Date().toISOString()
    };

    try {
      if (onSave) {
        await onSave(rows, metadata);
      }

      alert('Data saved successfully!');
    } catch (error) {

      alert('Failed to save data');
    } finally {
      setIsSaving(false);
    }
  };

  // Render cell input based on data type
  const renderCellInput = (column: ColumnConfig, rowIndex: number, value: any) => {
    const isDisabled = column.isReadOnly || column.dataType === 'formula';

    switch (column.dataType) {
      case 'number':
      case 'formula':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => updateCell(rowIndex, column.name, e.target.value)}
            disabled={isDisabled}
            className={isDisabled ? 'calculated' : ''}
            step="0.01" />);



      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => updateCell(rowIndex, column.name, e.target.checked)}
            disabled={isDisabled} />);



      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateCell(rowIndex, column.name, e.target.value)}
            disabled={isDisabled}>

            <option value="">Select</option>
            {column.dropdownOptions?.map((opt) =>
            <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
          </select>);


      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => updateCell(rowIndex, column.name, e.target.value)}
            disabled={isDisabled} />);



      case 'image':
        return (
          <div className="operatorEntry-imageCell">
            {value ?
            <img src={value} alt="Uploaded" className="operatorEntry-thumbnail" /> :

            <label className="operatorEntry-uploadBtn">
                <Camera size={16} />
                <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      updateCell(rowIndex, column.name, ev.target?.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                hidden />

              </label>
            }
          </div>);


      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateCell(rowIndex, column.name, e.target.value)}
            disabled={isDisabled} />);


    }
  };

  // Get visible columns sorted by order
  const visibleColumns = template.columns.
  filter((col) => col.isVisible).
  sort((a, b) => a.order - b.order);

  return (
    <div className="operatorEntry">
      {/* Header with Order Info */}
      <div className="operatorEntry-header">
        <div className="operatorEntry-orderInfo">
          {/* Left side - Text info */}
          <div className="operatorEntry-infoGrid">
            {template.customerFields.showOrderId &&
            <div className="operatorEntry-infoItem">
                <span className="label">Order No:</span>
                <span className="value">{orderInfo.orderId}</span>
              </div>
            }
            {template.customerFields.showOrderDate &&
            <div className="operatorEntry-infoItem">
                <span className="label">Order Date:</span>
                <span className="value">{orderInfo.orderDate}</span>
              </div>
            }
            {template.customerFields.showAlias &&
            <div className="operatorEntry-infoItem">
                <span className="label">Customer:</span>
                <span className="value">{orderInfo.customerAlias}</span>
              </div>
            }
            <div className="operatorEntry-infoItem">
              <span className="label">Production Date:</span>
              <span className="value">{orderInfo.productionDate}</span>
            </div>
            {orderInfo.rollSize &&
            <div className="operatorEntry-infoItem">
                <span className="label">Roll Size:</span>
                <span className="value">{orderInfo.rollSize}</span>
              </div>
            }
            {orderInfo.cuttingSize &&
            <div className="operatorEntry-infoItem">
                <span className="label">Cutting Size:</span>
                <span className="value">{orderInfo.cuttingSize}</span>
              </div>
            }
            {orderInfo.cuttingType &&
            <div className="operatorEntry-infoItem">
                <span className="label">Cutting Type:</span>
                <span className="value">{orderInfo.cuttingType}</span>
              </div>
            }
            {template.customerFields.showQuantity &&
            <div className="operatorEntry-infoItem highlight">
                <span className="label">Qty:</span>
                <span className="value">{orderInfo.quantity} kg</span>
              </div>
            }
          </div>

          {/* Right side - Image */}
          {template.customerFields.showImage && orderInfo.orderImage &&
          <div className="operatorEntry-orderImage">
              <img src={orderInfo.orderImage} alt="Order" />
            </div>
          }
        </div>

        {/* Instructions */}
        {template.customerFields.showInstructions && orderInfo.instructions &&
        <div className="operatorEntry-instructions">
            <strong>Instructions:</strong> {orderInfo.instructions}
          </div>
        }
      </div>

      {/* Operator Selection */}
      <div className="operatorEntry-operators">
        {template.settings.requireOperator &&
        <div className="operatorEntry-selectGroup">
            <label>Operator *</label>
            <select value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)}>
              <option value="">Select Operator</option>
              {operators.map((op) =>
            <option key={op.id} value={op.id}>{op.name}</option>
            )}
            </select>
          </div>
        }
        {template.settings.requireHelper &&
        <div className="operatorEntry-selectGroup">
            <label>Helper</label>
            <select value={selectedHelper} onChange={(e) => setSelectedHelper(e.target.value)}>
              <option value="">Select Helper</option>
              {helpers.map((h) =>
            <option key={h.id} value={h.id}>{h.name}</option>
            )}
            </select>
          </div>
        }
        <div className="operatorEntry-selectGroup">
          <label>Machine</label>
          <select value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)}>
            <option value="">Select Machine</option>
            {machines.map((m) =>
            <option key={m.id} value={m.id}>{m.name}</option>
            )}
          </select>
        </div>
        {startTime &&
        <div className="operatorEntry-time">
            <span className="label">Start Time:</span>
            <span className="value">{startTime}</span>
          </div>
        }
      </div>

      {/* Data Entry Table */}
      <div className="operatorEntry-tableWrapper">
        <table className="operatorEntry-table">
          <thead>
            <tr>
              {visibleColumns.map((col) =>
              <th key={col.id} style={{ width: col.width }}>
                  {col.label}
                  {col.unit && <span className="unit">({col.unit})</span>}
                  {col.isRequired && <span className="required">*</span>}
                </th>
              )}
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) =>
            <tr key={row.id}>
                {visibleColumns.map((col) =>
              <td key={col.id} className={col.dataType === 'formula' ? 'formula-cell' : ''}>
                    {renderCellInput(col, rowIndex, row[col.name])}
                  </td>
              )}
                <td className="actions">
                  <button
                  type="button"
                  className="operatorEntry-deleteBtn"
                  onClick={() => removeRow(rowIndex)}
                  disabled={rows.length <= 1}
                  title="Delete row">

                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
          {/* Totals Row */}
          {template.totalsConfig.length > 0 &&
          <tfoot>
              <tr className="totals-row">
                {visibleColumns.map((col, index) => {
                const totalConfig = template.totalsConfig.find((tc) => tc.columnName === col.name);
                return (
                  <td key={col.id}>
                      {index === 0 ?
                    <strong>Total</strong> :
                    totalConfig ?
                    <strong>{calculateTotal(col.name, totalConfig.formula).toFixed(2)}</strong> :
                    null}
                    </td>);

              })}
                <td></td>
              </tr>
            </tfoot>
          }
        </table>
      </div>

      {/* Add Row Button */}
      <button type="button" className="operatorEntry-addRowBtn" onClick={addRow}>
        <Plus size={16} /> Add Row
      </button>

      {/* Voice Note */}
      {template.settings.allowVoiceNote &&
      <div className="operatorEntry-voiceNote">
          <label>Voice Note / Instructions for next stage:</label>
          <div className="operatorEntry-voiceInput">
            <textarea
            value={voiceNote}
            onChange={(e) => setVoiceNote(e.target.value)}
            placeholder="Enter notes or instructions..."
            rows={2} />

            <button
            type="button"
            className={`operatorEntry-micBtn ${isRecording ? 'recording' : ''}`}
            onClick={() => setIsRecording(!isRecording)}
            title={isRecording ? 'Stop recording' : 'Start voice recording'}>

              <Mic size={20} />
            </button>
          </div>
        </div>
      }

      {/* Save Button */}
      <div className="operatorEntry-footer">
        <button
          type="button"
          className="operatorEntry-saveBtn"
          onClick={handleSave}
          disabled={isSaving || template.settings.requireOperator && !selectedOperator}>

          {isSaving ?
          'Saving...' :

          <>
              <Save size={18} /> Save Data
            </>
          }
        </button>
      </div>
    </div>);

};

export default OperatorEntryView;