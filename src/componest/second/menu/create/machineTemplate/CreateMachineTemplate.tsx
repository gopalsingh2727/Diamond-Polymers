import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createMachineTemplate, updateMachineTemplate, deleteMachineTemplate } from "../../../../redux/machineTemplate/machineTemplateActions";
import { getMachines } from "../../../../redux/create/machine/MachineActions";
import { getOrderTypes } from "../../../../redux/create/orderType/orderTypeActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import "./machineTemplate.css";

// Column configuration type
interface ColumnConfig {
  name: string;
  label: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'file' | 'link' | 'dropdown';
  unit?: string;
  formula?: string;
  isCalculated: boolean;
  isRequired: boolean;
  order: number;
  width?: number;
  sourceType: 'optionSpec' | 'order' | 'customer' | 'manual';
  sourceField?: string;
  optionTypeId?: string;
}

interface CustomerFieldsConfig {
  showName: boolean;
  showAddress: boolean;
  showOrderId: boolean;
  showImage: boolean;
  showPhone: boolean;
  showEmail: boolean;
}

interface TotalsConfig {
  columnName: string;
  formula: 'SUM' | 'AVERAGE' | 'COUNT' | 'MAX' | 'MIN' | 'CUSTOM';
  customFormula?: string;
}

interface CompletionConfig {
  enabled: boolean;
  targetField: string;
  targetSource: 'fixed' | 'orderQuantity' | 'optionSpec';
  fixedTargetValue?: number;
  autoComplete: boolean;
}

interface CreateMachineTemplateProps {
  initialData?: any;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const defaultColumn: ColumnConfig = {
  name: '',
  label: '',
  dataType: 'string',
  unit: '',
  formula: '',
  isCalculated: false,
  isRequired: false,
  order: 0,
  width: 150,
  sourceType: 'manual',
  sourceField: '',
  optionTypeId: ''
};

const defaultCustomerFields: CustomerFieldsConfig = {
  showName: true,
  showAddress: true,
  showOrderId: true,
  showImage: true,
  showPhone: false,
  showEmail: false
};

const defaultCompletionConfig: CompletionConfig = {
  enabled: true,
  targetField: '',
  targetSource: 'orderQuantity',
  fixedTargetValue: 0,
  autoComplete: false
};

const CreateMachineTemplate: React.FC<CreateMachineTemplateProps> = ({ initialData: propInitialData, onCancel, onSaveSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode detection
  const { templateData: locationData, isEdit } = location.state || {};
  const templateData = propInitialData || locationData;
  const editMode = Boolean(propInitialData || isEdit || (templateData && templateData._id));
  const templateId = templateData?._id;

  // Basic Information
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [machineId, setMachineId] = useState("");
  const [orderTypeId, setOrderTypeId] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Columns Configuration
  const [columns, setColumns] = useState<ColumnConfig[]>([{ ...defaultColumn, order: 0 }]);
  const [expandedColumn, setExpandedColumn] = useState<number | null>(0);

  // Customer Fields
  const [customerFields, setCustomerFields] = useState<CustomerFieldsConfig>(defaultCustomerFields);

  // Totals Configuration
  const [totalsConfig, setTotalsConfig] = useState<TotalsConfig[]>([]);

  // Completion Configuration
  const [completionConfig, setCompletionConfig] = useState<CompletionConfig>(defaultCompletionConfig);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  // Get data from Redux store
  const machines = useSelector((state: any) => state.machineList?.machines || []);
  const orderTypes = useSelector((state: any) => state.orderTypeList?.orderTypes || []);
  const optionTypes = useSelector((state: any) => state.optionType?.optionTypes || []);

  // Fetch required data on mount
  useEffect(() => {
    dispatch(getMachines());
    dispatch(getOrderTypes());
    dispatch(getOptionTypes());
  }, [dispatch]);

  // Handle ESC key to go back
  const handleBackToList = () => {
    if (onSaveSuccess) {
      onSaveSuccess();
    } else if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  useInternalBackNavigation(editMode && !showDeleteConfirm, handleBackToList);

  // Load existing data when editing
  useEffect(() => {
    if (editMode && templateData) {
      setTemplateName(templateData.templateName || "");
      setDescription(templateData.description || "");
      setMachineId(typeof templateData.machineId === 'object' ? templateData.machineId._id : templateData.machineId || "");
      setOrderTypeId(typeof templateData.orderTypeId === 'object' ? templateData.orderTypeId._id : templateData.orderTypeId || "");
      setIsActive(templateData.isActive !== false);

      if (templateData.columns && templateData.columns.length > 0) {
        setColumns(templateData.columns.map((col: any, idx: number) => ({
          ...defaultColumn,
          ...col,
          order: col.order ?? idx,
          optionTypeId: col.optionTypeId?._id || col.optionTypeId || ''
        })));
      }

      if (templateData.customerFields) {
        setCustomerFields({ ...defaultCustomerFields, ...templateData.customerFields });
      }

      if (templateData.totalsConfig) {
        setTotalsConfig(templateData.totalsConfig);
      }

      if (templateData.completionConfig) {
        setCompletionConfig({ ...defaultCompletionConfig, ...templateData.completionConfig });
      }
    }
  }, [editMode, templateData]);

  // Column handlers
  const addColumn = () => {
    const newColumn = { ...defaultColumn, order: columns.length };
    setColumns([...columns, newColumn]);
    setExpandedColumn(columns.length);
  };

  const removeColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns.map((col, i) => ({ ...col, order: i })));
    setExpandedColumn(null);
  };

  const updateColumn = (index: number, field: keyof ColumnConfig, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex >= 0 && swapIndex < columns.length) {
      [newColumns[index], newColumns[swapIndex]] = [newColumns[swapIndex], newColumns[index]];
      newColumns.forEach((col, i) => col.order = i);
      setColumns(newColumns);
      setExpandedColumn(swapIndex);
    }
  };

  // Totals handlers
  const addTotalConfig = () => {
    setTotalsConfig([...totalsConfig, { columnName: '', formula: 'SUM' }]);
  };

  const removeTotalConfig = (index: number) => {
    setTotalsConfig(totalsConfig.filter((_, i) => i !== index));
  };

  const updateTotalConfig = (index: number, field: keyof TotalsConfig, value: any) => {
    const newConfig = [...totalsConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };
    setTotalsConfig(newConfig);
  };

  const handleSubmit = () => {
    // Validation
    if (!templateName.trim() || !machineId || !orderTypeId) {
      toast.error("Validation Error", "Please fill all required fields: Template Name, Machine, and Order Type");
      return;
    }

    if (columns.length === 0 || !columns.some(col => col.name.trim())) {
      toast.error("Validation Error", "Please add at least one column with a name");
      return;
    }

    // Build template data
    const dataToSave = {
      templateName,
      description,
      machineId,
      orderTypeId,
      isActive,
      columns: columns.filter(col => col.name.trim()).map((col, idx) => ({
        ...col,
        order: idx,
        optionTypeId: col.optionTypeId || undefined
      })),
      customerFields,
      totalsConfig: totalsConfig.filter(tc => tc.columnName),
      completionConfig
    };

    if (editMode && templateId) {
      handleSave(
        () => dispatch(updateMachineTemplate(templateId, dataToSave)),
        {
          successMessage: "Template updated successfully!",
          onSuccess: () => {
            if (onSaveSuccess) onSaveSuccess();
            else navigate(-1);
          }
        }
      );
    } else {
      handleSave(
        () => dispatch(createMachineTemplate(dataToSave as any)),
        {
          successMessage: "Template created successfully!",
          onSuccess: () => {
            // Reset form
            setTemplateName("");
            setDescription("");
            setMachineId("");
            setOrderTypeId("");
            setColumns([{ ...defaultColumn, order: 0 }]);
            setCustomerFields(defaultCustomerFields);
            setTotalsConfig([]);
            setCompletionConfig(defaultCompletionConfig);
            setExpandedColumn(0);
          }
        }
      );
    }
  };

  const handleDelete = async () => {
    if (!templateId) return;
    setDeleting(true);
    try {
      await dispatch(deleteMachineTemplate(templateId));
      toast.success('Deleted', 'Template deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
        else navigate(-1);
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  const numericColumns = columns.filter(col => col.dataType === 'number' && col.name.trim());

  return (
    <div className="machineTemplateContainer CreateForm">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Template?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Are you sure you want to delete this template?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setShowDeleteConfirm(false)} style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleDelete} disabled={deleting} style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="machineTemplateHeader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {editMode && onCancel && (
              <button type="button" onClick={onCancel} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                &#8592; Back to List
              </button>
            )}
            <div>
              <h2 className="machineTemplateTitle">{editMode ? 'Edit Machine Template' : 'Create Machine Template'}</h2>
              <p className="machineTemplateSubtitle">{editMode ? `Editing: ${templateData?.templateName || 'Template'}` : 'Configure operator view template for machine'}</p>
            </div>
          </div>
          {editMode && (
            <button type="button" onClick={() => setShowDeleteConfirm(true)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="machineTemplateFormGrid">
        {/* Basic Information */}
        <div className="machineTemplateSection">
          <h3 className="machineTemplateSectionTitle">Basic Information</h3>
          <div className="machineTemplateFormRow">
            <div className="machineTemplateFormColumn">
              <label className="machineTemplateInputLabel">Template Name *</label>
              <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="machineTemplateFormInput" placeholder="e.g., Weight Tracking Template" required />
            </div>
            <div className="machineTemplateFormColumn">
              <label className="machineTemplateInputLabel">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="machineTemplateFormInput" placeholder="Optional description" />
            </div>
          </div>

          <div className="machineTemplateFormRow">
            <div className="machineTemplateFormColumn">
              <label className="machineTemplateInputLabel">Machine *</label>
              <select value={machineId} onChange={(e) => setMachineId(e.target.value)} className="machineTemplateFormInput" required>
                <option value="">Select Machine</option>
                {machines.map((machine: any) => (
                  <option key={machine._id} value={machine._id}>{machine.machineName}</option>
                ))}
              </select>
            </div>
            <div className="machineTemplateFormColumn">
              <label className="machineTemplateInputLabel">Order Type *</label>
              <select value={orderTypeId} onChange={(e) => setOrderTypeId(e.target.value)} className="machineTemplateFormInput" required>
                <option value="">Select Order Type</option>
                {orderTypes.map((ot: any) => (
                  <option key={ot._id} value={ot._id}>{ot.typeName}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label className="machineTemplateInputLabel">Status</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setIsActive(true)} style={{ padding: '8px 16px', background: isActive ? '#22c55e' : '#e5e7eb', color: isActive ? 'white' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Active</button>
              <button type="button" onClick={() => setIsActive(false)} style={{ padding: '8px 16px', background: !isActive ? '#ef4444' : '#e5e7eb', color: !isActive ? 'white' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Inactive</button>
            </div>
          </div>
        </div>

        {/* Column Configuration */}
        <div className="machineTemplateSection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="machineTemplateSectionTitle">Table Columns <FieldTooltip content="Configure columns that appear in the operator view table" position="right" /></h3>
            <button type="button" onClick={addColumn} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>+ Add Column</button>
          </div>

          <div className="machineTemplateColumnsConfig">
            {columns.map((col, index) => (
              <div key={index} className="machineTemplateColumnItem" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: expandedColumn === index ? '#f3f4f6' : '#fff', cursor: 'pointer' }} onClick={() => setExpandedColumn(expandedColumn === index ? null : index)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '600', color: '#374151' }}>{col.name || `Column ${index + 1}`}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280', background: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>{col.dataType}</span>
                    {col.isRequired && <span style={{ fontSize: '12px', color: '#dc2626' }}>*Required</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); moveColumn(index, 'up'); }} disabled={index === 0} style={{ padding: '4px 8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.5 : 1 }}>&#8593;</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); moveColumn(index, 'down'); }} disabled={index === columns.length - 1} style={{ padding: '4px 8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: index === columns.length - 1 ? 'not-allowed' : 'pointer', opacity: index === columns.length - 1 ? 0.5 : 1 }}>&#8595;</button>
                    {columns.length > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); removeColumn(index); }} style={{ padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>&#10005;</button>}
                    <span style={{ fontSize: '16px', transition: 'transform 0.2s', transform: expandedColumn === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>&#9660;</span>
                  </div>
                </div>

                {expandedColumn === index && (
                  <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Column Name *</label>
                        <input type="text" value={col.name} onChange={(e) => updateColumn(index, 'name', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="e.g., weight" />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Display Label</label>
                        <input type="text" value={col.label} onChange={(e) => updateColumn(index, 'label', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="e.g., Weight" />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Data Type</label>
                        <select value={col.dataType} onChange={(e) => updateColumn(index, 'dataType', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                          <option value="string">Text</option>
                          <option value="number">Number</option>
                          <option value="boolean">Yes/No</option>
                          <option value="date">Date</option>
                          <option value="file">File</option>
                          <option value="link">Link</option>
                          <option value="dropdown">Dropdown</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Unit</label>
                        <input type="text" value={col.unit || ''} onChange={(e) => updateColumn(index, 'unit', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="e.g., kg, g, pcs" />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Source Type</label>
                        <select value={col.sourceType} onChange={(e) => updateColumn(index, 'sourceType', e.target.value as any)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                          <option value="manual">Manual Entry</option>
                          <option value="optionSpec">From Option Spec</option>
                          <option value="order">From Order</option>
                          <option value="customer">From Customer</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Width (px)</label>
                        <input type="number" value={col.width || 150} onChange={(e) => updateColumn(index, 'width', Number(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} min={50} max={500} />
                      </div>
                    </div>

                    {col.sourceType === 'optionSpec' && (
                      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Option Type</label>
                          <select value={col.optionTypeId || ''} onChange={(e) => updateColumn(index, 'optionTypeId', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                            <option value="">Select Option Type</option>
                            {optionTypes.map((ot: any) => (
                              <option key={ot._id} value={ot._id}>{ot.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Source Field</label>
                          <input type="text" value={col.sourceField || ''} onChange={(e) => updateColumn(index, 'sourceField', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="e.g., weight, price" />
                        </div>
                      </div>
                    )}

                    {col.dataType === 'number' && (
                      <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={col.isCalculated} onChange={(e) => updateColumn(index, 'isCalculated', e.target.checked)} />
                          <span style={{ fontSize: '14px', color: '#374151' }}>Calculated Field</span>
                        </label>
                        {col.isCalculated && (
                          <div style={{ marginTop: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Formula</label>
                            <input type="text" value={col.formula || ''} onChange={(e) => updateColumn(index, 'formula', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="e.g., weight * quantity" />
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={col.isRequired} onChange={(e) => updateColumn(index, 'isRequired', e.target.checked)} />
                        <span style={{ fontSize: '14px', color: '#374151' }}>Required Field</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Customer Fields */}
        <div className="machineTemplateSection">
          <h3 className="machineTemplateSectionTitle">Customer Information Display <FieldTooltip content="Configure which customer information to show in operator view" position="right" /></h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { key: 'showName', label: 'Customer Name' },
              { key: 'showAddress', label: 'Address' },
              { key: 'showOrderId', label: 'Order ID' },
              { key: 'showImage', label: 'Order Image' },
              { key: 'showPhone', label: 'Phone Number' },
              { key: 'showEmail', label: 'Email' }
            ].map(field => (
              <label key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                <input type="checkbox" checked={customerFields[field.key as keyof CustomerFieldsConfig]} onChange={(e) => setCustomerFields({ ...customerFields, [field.key]: e.target.checked })} />
                <span style={{ fontSize: '14px', color: '#374151' }}>{field.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Totals Configuration */}
        <div className="machineTemplateSection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="machineTemplateSectionTitle">Totals Configuration <FieldTooltip content="Configure running totals for numeric columns" position="right" /></h3>
            <button type="button" onClick={addTotalConfig} disabled={numericColumns.length === 0} style={{ padding: '6px 12px', background: numericColumns.length === 0 ? '#d1d5db' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: numericColumns.length === 0 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>+ Add Total</button>
          </div>

          {numericColumns.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Add numeric columns to configure totals</p>
          ) : (
            <div style={{ marginTop: '12px' }}>
              {totalsConfig.map((tc, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Column</label>
                    <select value={tc.columnName} onChange={(e) => updateTotalConfig(index, 'columnName', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                      <option value="">Select Column</option>
                      {numericColumns.map(col => (
                        <option key={col.name} value={col.name}>{col.label || col.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Formula</label>
                    <select value={tc.formula} onChange={(e) => updateTotalConfig(index, 'formula', e.target.value as any)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                      <option value="SUM">SUM</option>
                      <option value="AVERAGE">AVERAGE</option>
                      <option value="COUNT">COUNT</option>
                      <option value="MAX">MAX</option>
                      <option value="MIN">MIN</option>
                      <option value="CUSTOM">CUSTOM</option>
                    </select>
                  </div>
                  {tc.formula === 'CUSTOM' && (
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Custom Formula</label>
                      <input type="text" value={tc.customFormula || ''} onChange={(e) => updateTotalConfig(index, 'customFormula', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="e.g., sum(weight) * 1.1" />
                    </div>
                  )}
                  <button type="button" onClick={() => removeTotalConfig(index)} style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>&#10005;</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Configuration */}
        <div className="machineTemplateSection">
          <h3 className="machineTemplateSectionTitle">Completion Settings <FieldTooltip content="Configure when an order is considered complete on this machine" position="right" /></h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={completionConfig.enabled} onChange={(e) => setCompletionConfig({ ...completionConfig, enabled: e.target.checked })} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Enable Completion Tracking</span>
            </label>
          </div>

          {completionConfig.enabled && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Target Source</label>
                <select value={completionConfig.targetSource} onChange={(e) => setCompletionConfig({ ...completionConfig, targetSource: e.target.value as any })} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                  <option value="orderQuantity">Order Quantity</option>
                  <option value="optionSpec">From Option Spec</option>
                  <option value="fixed">Fixed Value</option>
                </select>
              </div>

              {completionConfig.targetSource === 'fixed' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Fixed Target Value</label>
                  <input type="number" value={completionConfig.fixedTargetValue || 0} onChange={(e) => setCompletionConfig({ ...completionConfig, fixedTargetValue: Number(e.target.value) })} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>Track Column</label>
                <select value={completionConfig.targetField} onChange={(e) => setCompletionConfig({ ...completionConfig, targetField: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                  <option value="">Select Column</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.label || col.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={completionConfig.autoComplete} onChange={(e) => setCompletionConfig({ ...completionConfig, autoComplete: e.target.checked })} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Auto-complete when target reached</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="machineTemplateFormActions">
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
            className="machineTemplateSaveButton"
            disabled={!templateName.trim() || !machineId || !orderTypeId}
          >
            {editMode ? 'Update Template' : 'Create Template'}
          </ActionButton>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateMachineTemplate;
