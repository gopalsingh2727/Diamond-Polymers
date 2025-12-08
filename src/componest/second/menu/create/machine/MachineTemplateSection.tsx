import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTemplatesByMachine,
  createMachineTemplate,
  updateMachineTemplate,
  deleteMachineTemplate,
  activateMachineTemplate,
  deactivateMachineTemplate
} from "../../../../redux/machineTemplate/machineTemplateActions";
import { getOrderTypes } from "../../../../redux/create/orderType/orderTypeActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { AppDispatch } from "../../../../../store";
import { RootState } from "../../../../redux/rootReducer";
import { Plus, Edit2, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

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

interface MachineTemplateSectionProps {
  machineId?: string;
  machineName?: string;
  isEditMode: boolean;
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

const MachineTemplateSection: React.FC<MachineTemplateSectionProps> = ({
  machineId,
  machineName,
  isEditMode
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { machineTemplates, loading: templateLoading } = useSelector((state: RootState) => state.machineTemplate);
  const orderTypes = useSelector((state: any) => state.orderTypeList?.orderTypes || []);
  const optionTypes = useSelector((state: any) => state.optionType?.optionTypes || []);

  // UI State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form State
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [orderTypeId, setOrderTypeId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>([{ ...defaultColumn, order: 0 }]);
  const [customerFields, setCustomerFields] = useState<CustomerFieldsConfig>(defaultCustomerFields);
  const [totalsConfig, setTotalsConfig] = useState<TotalsConfig[]>([]);
  const [completionConfig, setCompletionConfig] = useState<CompletionConfig>(defaultCompletionConfig);
  const [expandedColumn, setExpandedColumn] = useState<number | null>(0);

  // Fetch data
  useEffect(() => {
    dispatch(getOrderTypes());
    dispatch(getOptionTypes());
  }, [dispatch]);

  // Fetch templates when machineId is available
  useEffect(() => {
    if (machineId) {
      dispatch(getTemplatesByMachine(machineId));
    }
  }, [dispatch, machineId]);

  // Reset form
  const resetForm = () => {
    setTemplateName("");
    setDescription("");
    setOrderTypeId("");
    setIsActive(true);
    setColumns([{ ...defaultColumn, order: 0 }]);
    setCustomerFields(defaultCustomerFields);
    setTotalsConfig([]);
    setCompletionConfig(defaultCompletionConfig);
    setExpandedColumn(0);
    setShowCreateForm(false);
    setEditingTemplateId(null);
  };

  // Load template for editing
  const loadTemplateForEdit = (template: any) => {
    setTemplateName(template.templateName || "");
    setDescription(template.description || "");
    setOrderTypeId(typeof template.orderTypeId === 'object' ? template.orderTypeId._id : template.orderTypeId || "");
    setIsActive(template.isActive !== false);

    if (template.columns && template.columns.length > 0) {
      setColumns(template.columns.map((col: any, idx: number) => ({
        ...defaultColumn,
        ...col,
        order: col.order ?? idx,
        optionTypeId: col.optionTypeId?._id || col.optionTypeId || ''
      })));
    } else {
      setColumns([{ ...defaultColumn, order: 0 }]);
    }

    if (template.customerFields) {
      setCustomerFields({ ...defaultCustomerFields, ...template.customerFields });
    }

    if (template.totalsConfig) {
      setTotalsConfig(template.totalsConfig);
    }

    if (template.completionConfig) {
      setCompletionConfig({ ...defaultCompletionConfig, ...template.completionConfig });
    }

    setEditingTemplateId(template._id);
    setShowCreateForm(true);
  };

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

  // Save template
  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !orderTypeId || !machineId) {
      alert("Please fill Template Name and select Order Type");
      return;
    }

    if (columns.length === 0 || !columns.some(col => col.name.trim())) {
      alert("Please add at least one column with a name");
      return;
    }

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

    setActionLoading('save');
    try {
      if (editingTemplateId) {
        await dispatch(updateMachineTemplate(editingTemplateId, dataToSave));
      } else {
        await dispatch(createMachineTemplate(dataToSave as any));
      }
      resetForm();
      if (machineId) {
        dispatch(getTemplatesByMachine(machineId));
      }
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle template active status
  const handleToggleActive = async (template: any) => {
    setActionLoading(template._id);
    try {
      if (template.isActive) {
        await dispatch(deactivateMachineTemplate(template._id));
      } else {
        await dispatch(activateMachineTemplate(template._id));
      }
      if (machineId) {
        dispatch(getTemplatesByMachine(machineId));
      }
    } catch (err) {
      console.error('Failed to toggle template:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    setActionLoading(templateId);
    try {
      await dispatch(deleteMachineTemplate(templateId));
      setDeleteConfirm(null);
      if (machineId) {
        dispatch(getTemplatesByMachine(machineId));
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const numericColumns = columns.filter(col => col.dataType === 'number' && col.name.trim());

  // If not in edit mode or no machineId, show message
  if (!isEditMode || !machineId) {
    return (
      <div className="machineTemplateSectionEmpty">
        <p>Save the machine first to configure templates.</p>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Templates allow you to configure operator views for different order types on this machine.
        </p>
      </div>
    );
  }

  return (
    <div className="machineTemplateSection">
      {/* Header */}
      <div className="machineTemplateSectionHeader">
        <div>
          <h3>Order Type Templates</h3>
          <p>Configure operator view templates for different order types on {machineName || 'this machine'}</p>
        </div>
        {!showCreateForm && (
          <button
            type="button"
            className="machineTemplateAddBtn"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={16} /> Add Template
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="machineTemplateForm">
          <div className="machineTemplateFormHeader">
            <h4>{editingTemplateId ? 'Edit Template' : 'Create New Template'}</h4>
            <button type="button" className="machineTemplateCloseBtn" onClick={resetForm}>
              <X size={18} />
            </button>
          </div>

          {/* Basic Info */}
          <div className="machineTemplateFormRow">
            <div className="machineTemplateFormField">
              <label>Template Name *</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Weight Tracking"
              />
            </div>
            <div className="machineTemplateFormField">
              <label>Order Type *</label>
              <select value={orderTypeId} onChange={(e) => setOrderTypeId(e.target.value)}>
                <option value="">Select Order Type</option>
                {orderTypes.map((ot: any) => (
                  <option key={ot._id} value={ot._id}>{ot.typeName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="machineTemplateFormField">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {/* Columns */}
          <div className="machineTemplateFormSection">
            <div className="machineTemplateFormSectionHeader">
              <h5>Table Columns</h5>
              <button type="button" className="machineTemplateSmallBtn" onClick={addColumn}>
                <Plus size={14} /> Add Column
              </button>
            </div>

            <div className="machineTemplateColumns">
              {columns.map((col, index) => (
                <div key={index} className="machineTemplateColumnItem">
                  <div
                    className="machineTemplateColumnHeader"
                    onClick={() => setExpandedColumn(expandedColumn === index ? null : index)}
                  >
                    <span>{col.name || `Column ${index + 1}`}</span>
                    <div className="machineTemplateColumnActions">
                      <span className="machineTemplateColumnType">{col.dataType}</span>
                      {columns.length > 1 && (
                        <button
                          type="button"
                          className="machineTemplateIconBtn danger"
                          onClick={(e) => { e.stopPropagation(); removeColumn(index); }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {expandedColumn === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {expandedColumn === index && (
                    <div className="machineTemplateColumnBody">
                      <div className="machineTemplateFormRow">
                        <div className="machineTemplateFormField">
                          <label>Column Name *</label>
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => updateColumn(index, 'name', e.target.value)}
                            placeholder="e.g., weight"
                          />
                        </div>
                        <div className="machineTemplateFormField">
                          <label>Display Label</label>
                          <input
                            type="text"
                            value={col.label}
                            onChange={(e) => updateColumn(index, 'label', e.target.value)}
                            placeholder="e.g., Weight"
                          />
                        </div>
                        <div className="machineTemplateFormField">
                          <label>Data Type</label>
                          <select
                            value={col.dataType}
                            onChange={(e) => updateColumn(index, 'dataType', e.target.value)}
                          >
                            <option value="string">Text</option>
                            <option value="number">Number</option>
                            <option value="boolean">Yes/No</option>
                            <option value="date">Date</option>
                          </select>
                        </div>
                      </div>
                      <div className="machineTemplateFormRow">
                        <div className="machineTemplateFormField">
                          <label>Unit</label>
                          <input
                            type="text"
                            value={col.unit || ''}
                            onChange={(e) => updateColumn(index, 'unit', e.target.value)}
                            placeholder="e.g., kg, g"
                          />
                        </div>
                        <div className="machineTemplateFormField">
                          <label>Source Type</label>
                          <select
                            value={col.sourceType}
                            onChange={(e) => updateColumn(index, 'sourceType', e.target.value as any)}
                          >
                            <option value="manual">Manual Entry</option>
                            <option value="optionSpec">From Option Spec</option>
                            <option value="order">From Order</option>
                          </select>
                        </div>
                        <div className="machineTemplateFormField" style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={col.isRequired}
                              onChange={(e) => updateColumn(index, 'isRequired', e.target.checked)}
                            />
                            Required
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Fields */}
          <div className="machineTemplateFormSection">
            <h5>Customer Info Display</h5>
            <div className="machineTemplateCheckboxGrid">
              {[
                { key: 'showName', label: 'Customer Name' },
                { key: 'showAddress', label: 'Address' },
                { key: 'showOrderId', label: 'Order ID' },
                { key: 'showImage', label: 'Order Image' },
                { key: 'showPhone', label: 'Phone' },
                { key: 'showEmail', label: 'Email' }
              ].map(field => (
                <label key={field.key} className="machineTemplateCheckbox">
                  <input
                    type="checkbox"
                    checked={customerFields[field.key as keyof CustomerFieldsConfig]}
                    onChange={(e) => setCustomerFields({ ...customerFields, [field.key]: e.target.checked })}
                  />
                  {field.label}
                </label>
              ))}
            </div>
          </div>

          {/* Totals Config */}
          <div className="machineTemplateFormSection">
            <div className="machineTemplateFormSectionHeader">
              <h5>Totals Configuration</h5>
              <button
                type="button"
                className="machineTemplateSmallBtn"
                onClick={addTotalConfig}
                disabled={numericColumns.length === 0}
              >
                <Plus size={14} /> Add Total
              </button>
            </div>

            {numericColumns.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Add numeric columns to configure totals</p>
            ) : (
              totalsConfig.map((tc, index) => (
                <div key={index} className="machineTemplateTotalItem">
                  <select
                    value={tc.columnName}
                    onChange={(e) => updateTotalConfig(index, 'columnName', e.target.value)}
                  >
                    <option value="">Select Column</option>
                    {numericColumns.map(col => (
                      <option key={col.name} value={col.name}>{col.label || col.name}</option>
                    ))}
                  </select>
                  <select
                    value={tc.formula}
                    onChange={(e) => updateTotalConfig(index, 'formula', e.target.value as any)}
                  >
                    <option value="SUM">SUM</option>
                    <option value="AVERAGE">AVERAGE</option>
                    <option value="COUNT">COUNT</option>
                    <option value="MAX">MAX</option>
                    <option value="MIN">MIN</option>
                  </select>
                  <button
                    type="button"
                    className="machineTemplateIconBtn danger"
                    onClick={() => removeTotalConfig(index)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Completion Config */}
          <div className="machineTemplateFormSection">
            <h5>Completion Settings</h5>
            <label className="machineTemplateCheckbox">
              <input
                type="checkbox"
                checked={completionConfig.enabled}
                onChange={(e) => setCompletionConfig({ ...completionConfig, enabled: e.target.checked })}
              />
              Enable Completion Tracking
            </label>

            {completionConfig.enabled && (
              <div className="machineTemplateFormRow" style={{ marginTop: '0.75rem' }}>
                <div className="machineTemplateFormField">
                  <label>Target Source</label>
                  <select
                    value={completionConfig.targetSource}
                    onChange={(e) => setCompletionConfig({ ...completionConfig, targetSource: e.target.value as any })}
                  >
                    <option value="orderQuantity">Order Quantity</option>
                    <option value="optionSpec">From Option Spec</option>
                    <option value="fixed">Fixed Value</option>
                  </select>
                </div>
                {completionConfig.targetSource === 'fixed' && (
                  <div className="machineTemplateFormField">
                    <label>Fixed Target</label>
                    <input
                      type="number"
                      value={completionConfig.fixedTargetValue || 0}
                      onChange={(e) => setCompletionConfig({ ...completionConfig, fixedTargetValue: Number(e.target.value) })}
                    />
                  </div>
                )}
                <div className="machineTemplateFormField">
                  <label>Track Column</label>
                  <select
                    value={completionConfig.targetField}
                    onChange={(e) => setCompletionConfig({ ...completionConfig, targetField: e.target.value })}
                  >
                    <option value="">Select Column</option>
                    {numericColumns.map(col => (
                      <option key={col.name} value={col.name}>{col.label || col.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="machineTemplateFormActions">
            <button type="button" className="machineTemplateCancelBtn" onClick={resetForm}>
              Cancel
            </button>
            <button
              type="button"
              className="machineTemplateSaveBtn"
              onClick={handleSaveTemplate}
              disabled={actionLoading === 'save'}
            >
              {actionLoading === 'save' ? 'Saving...' : (editingTemplateId ? 'Update Template' : 'Create Template')}
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      {!showCreateForm && (
        <div className="machineTemplateList">
          {templateLoading ? (
            <p className="machineTemplateLoading">Loading templates...</p>
          ) : machineTemplates.length === 0 ? (
            <p className="machineTemplateEmpty">No templates configured yet. Click "Add Template" to create one.</p>
          ) : (
            machineTemplates.map((template: any) => (
              <div key={template._id} className="machineTemplateListItem">
                <div className="machineTemplateListItemHeader">
                  <div className="machineTemplateListItemInfo">
                    <span className="machineTemplateListItemName">{template.templateName}</span>
                    <span className="machineTemplateListItemType">
                      {template.orderType?.typeName || 'Unknown Type'}
                    </span>
                    <span className={`machineTemplateListItemStatus ${template.isActive ? 'active' : 'inactive'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="machineTemplateListItemActions">
                    <button
                      type="button"
                      className="machineTemplateIconBtn"
                      onClick={() => loadTemplateForEdit(template)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      className={`machineTemplateIconBtn ${template.isActive ? 'warning' : 'success'}`}
                      onClick={() => handleToggleActive(template)}
                      disabled={actionLoading === template._id}
                      title={template.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {template.isActive ? <X size={16} /> : <Check size={16} />}
                    </button>
                    {deleteConfirm === template._id ? (
                      <>
                        <button
                          type="button"
                          className="machineTemplateIconBtn danger"
                          onClick={() => handleDeleteTemplate(template._id)}
                          disabled={actionLoading === template._id}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          className="machineTemplateIconBtn"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="machineTemplateIconBtn danger"
                        onClick={() => setDeleteConfirm(template._id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                {template.description && (
                  <p className="machineTemplateListItemDesc">{template.description}</p>
                )}
                <div className="machineTemplateListItemMeta">
                  <span>{template.columns?.length || 0} columns</span>
                  <span>{template.totalsConfig?.length || 0} totals</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MachineTemplateSection;
