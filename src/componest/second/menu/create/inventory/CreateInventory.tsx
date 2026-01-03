/**
 * Create Inventory - Like OrderType
 *
 * Features:
 * - Name, Code, Description
 * - Select Option Types (like allowedOptionTypes in OrderType)
 * - Select Specifications for formulas
 * - Dynamic Calculations with formulas
 * - Inventory Units (KG, PCS, etc.)
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createInventoryV2,
  updateInventoryV2,
  deleteInventoryV2,
  getInventoryV2,
} from '../../../../redux/unifiedV2/inventoryActions';
import { getOptionTypesV2, getInventoryTypesV2 } from '../../../../redux/unifiedV2';
import { AppDispatch } from '../../../../../store';
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import './createInventory.css';
import { BackButton } from '@/componest/allCompones/BackButton';

// Types
interface SelectedSpec {
  optionTypeId: string;
  optionTypeName: string;
  specName: string;
  unit?: string;
  varName: string;
}

interface DynamicCalculation {
  name: string;
  formula: string;
  unit?: string;
  enabled: boolean;
  order: number;
  showInInventory: boolean;
  columnFormat: 'standard' | 'highlight' | 'summary' | 'hidden';
}

interface InventoryUnit {
  inventoryTypeId: string;
  isActive: boolean;
  isPrimary: boolean;
}

interface InventoryData {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  allowedOptionTypes: string[];
  selectedSpecs: SelectedSpec[];
  dynamicCalculations: DynamicCalculation[];
  inventoryUnits: InventoryUnit[];
  isActive?: boolean;
}

interface CreateInventoryProps {
  initialData?: InventoryData;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateInventory: React.FC<CreateInventoryProps> = ({
  initialData: propInitialData,
  onCancel,
  onSaveSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { saveState, handleSave, toast } = useCRUD();

  // Support both props and route state for edit mode
  const routeData = (location.state as any)?.inventoryData;
  const initialData = propInitialData || routeData;

  // Edit mode if initialData has _id
  const isEditMode = !!initialData?._id;

  // Basic form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Option Types selection
  const [allowedOptionTypes, setAllowedOptionTypes] = useState<string[]>([]);

  // Selected Specifications for formulas
  const [selectedSpecs, setSelectedSpecs] = useState<SelectedSpec[]>([]);

  // Dynamic Calculations
  const [dynamicCalculations, setDynamicCalculations] = useState<DynamicCalculation[]>([]);
  const [activeFormulaIndex, setActiveFormulaIndex] = useState<number | null>(null);

  // Inventory Units
  const [inventoryUnits, setInventoryUnits] = useState<InventoryUnit[]>([]);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get data from Redux
  const rawOptionTypes = useSelector((state: any) => state.v2.optionType?.list);
  const optionTypes = Array.isArray(rawOptionTypes) ? rawOptionTypes : [];
  const optionTypesLoading = useSelector((state: any) => state.v2.optionType?.loading);
  const rawInventoryTypes = useSelector((state: any) => state.v2.inventoryType?.list);
  const inventoryTypes = Array.isArray(rawInventoryTypes) ? rawInventoryTypes : [];
  const inventoryTypesLoading = useSelector((state: any) => state.v2.inventoryType?.loading);

  // Fetch data on mount
  useEffect(() => {
    dispatch(getOptionTypesV2());
    dispatch(getInventoryTypesV2());
  }, [dispatch]);

  // Load initial data for edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive !== false);
      setAllowedOptionTypes(
        initialData.allowedOptionTypes?.map((ot: any) =>
          typeof ot === 'string' ? ot : ot._id
        ) || []
      );
      setSelectedSpecs(initialData.selectedSpecs || []);
      setDynamicCalculations(
        initialData.dynamicCalculations?.map((calc: any, idx: number) => ({
          name: calc.name || '',
          formula: calc.formula || '',
          unit: calc.unit || '',
          enabled: calc.enabled !== false,
          order: calc.order || idx + 1,
          showInInventory: calc.showInInventory !== false,
          columnFormat: calc.columnFormat || 'standard',
        })) || []
      );
      setInventoryUnits(
        initialData.inventoryUnits?.map((u: any) => ({
          inventoryTypeId: typeof u.inventoryTypeId === 'string' ? u.inventoryTypeId : u.inventoryTypeId?._id,
          isActive: u.isActive !== false,
          isPrimary: u.isPrimary || false,
        })) || []
      );
    }
  }, [initialData]);

  // Reset form
  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
    setAllowedOptionTypes([]);
    setSelectedSpecs([]);
    setDynamicCalculations([]);
    setInventoryUnits([]);
    setIsActive(true);
  };

  // Toggle option type selection
  const toggleOptionType = (optionTypeId: string) => {
    if (allowedOptionTypes.includes(optionTypeId)) {
      setAllowedOptionTypes(allowedOptionTypes.filter(id => id !== optionTypeId));
      // Remove specs from this option type
      setSelectedSpecs(selectedSpecs.filter(spec => spec.optionTypeId !== optionTypeId));
    } else {
      setAllowedOptionTypes([...allowedOptionTypes, optionTypeId]);
    }
  };

  // Toggle specification selection
  const toggleSpec = (optionTypeId: string, optionTypeName: string, specName: string, unit?: string) => {
    const varName = `${optionTypeName.replace(/\s+/g, '_')}_${specName.replace(/\s+/g, '_')}`;
    const existingIndex = selectedSpecs.findIndex(
      s => s.optionTypeId === optionTypeId && s.specName === specName
    );

    if (existingIndex >= 0) {
      setSelectedSpecs(selectedSpecs.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedSpecs([...selectedSpecs, { optionTypeId, optionTypeName, specName, unit, varName }]);
    }
  };

  // Toggle inventory unit
  const toggleInventoryUnit = (unitId: string) => {
    const existingIndex = inventoryUnits.findIndex(u => u.inventoryTypeId === unitId);
    if (existingIndex >= 0) {
      const newUnits = inventoryUnits.filter(u => u.inventoryTypeId !== unitId);
      if (inventoryUnits[existingIndex].isPrimary && newUnits.length > 0) {
        newUnits[0].isPrimary = true;
      }
      setInventoryUnits(newUnits);
    } else {
      const isPrimary = inventoryUnits.length === 0;
      setInventoryUnits([...inventoryUnits, { inventoryTypeId: unitId, isActive: true, isPrimary }]);
    }
  };

  // Set primary unit
  const setPrimaryUnit = (unitId: string) => {
    setInventoryUnits(inventoryUnits.map(u => ({
      ...u,
      isPrimary: u.inventoryTypeId === unitId
    })));
  };

  // Add dynamic calculation
  const addCalculation = () => {
    setDynamicCalculations([
      ...dynamicCalculations,
      {
        name: `Calculation ${dynamicCalculations.length + 1}`,
        formula: '',
        unit: '',
        enabled: true,
        order: dynamicCalculations.length + 1,
        showInInventory: true,
        columnFormat: 'standard',
      },
    ]);
  };

  // Update calculation
  const updateCalculation = (index: number, field: keyof DynamicCalculation, value: any) => {
    setDynamicCalculations(
      dynamicCalculations.map((calc, i) =>
        i === index ? { ...calc, [field]: value } : calc
      )
    );
  };

  // Remove calculation
  const removeCalculation = (index: number) => {
    setDynamicCalculations(dynamicCalculations.filter((_, i) => i !== index));
    if (activeFormulaIndex === index) setActiveFormulaIndex(null);
  };

  // Insert spec variable into formula
  const insertSpecIntoFormula = (varName: string) => {
    if (activeFormulaIndex === null) return;
    const calc = dynamicCalculations[activeFormulaIndex];
    const newFormula = calc.formula ? `${calc.formula} + ${varName}` : varName;
    updateCalculation(activeFormulaIndex, 'formula', newFormula);
  };

  // Handle save
  const onSave = async () => {
    if (!name.trim()) {
      toast.error('Error', 'Name is required');
      return;
    }
    if (!code.trim()) {
      toast.error('Error', 'Code is required');
      return;
    }

    const data = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      allowedOptionTypes,
      selectedSpecs,
      dynamicCalculations,
      inventoryUnits,
      isActive,
    };

    if (isEditMode && initialData?._id) {
      handleSave(
        () => dispatch(updateInventoryV2(initialData._id!, data)),
        {
          successMessage: 'Inventory updated successfully',
          onSuccess: () => {
            dispatch(getInventoryV2());
            if (onSaveSuccess || routeData) {
              setTimeout(() => {
                if (onSaveSuccess) {
                  onSaveSuccess();
                } else if (routeData) {
                  // Navigate back if came from route
                  navigate('/menu/inventory');
                }
              }, 1500);
            }
          },
        }
      );
    } else {
      handleSave(
        () => dispatch(createInventoryV2(data)),
        {
          successMessage: 'Inventory created successfully',
          onSuccess: () => {
            dispatch(getInventoryV2());
            resetForm();
          },
        }
      );
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!initialData?._id) return;
    setDeleting(true);
    try {
      await dispatch(deleteInventoryV2(initialData._id));
      toast.success('Deleted', 'Inventory deleted successfully');
      if (onSaveSuccess) {
        onSaveSuccess();
      } else if (routeData) {
        navigate('/menu/inventory');
      }
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to delete');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Get selected option types with full data
  const selectedOptionTypesData = optionTypes.filter((ot: any) =>
    allowedOptionTypes.includes(ot._id)
  );

  return (
    <div className="createInventory-container">
     <BackButton/>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Header */}
      <div className="createinventory-header">
        <div className="createinventory-header-left">
          {onCancel && (
            <button className="createinventory-back-btn" onClick={onCancel}>
              ← Back
            </button>
          )}
          <h1>{isEditMode ? 'Edit Inventory' : 'Create Inventory'}</h1>
        </div>
        <div className="createinventory-header-actions">
          {isEditMode && (
            <button className="createinventory-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="createinventory-content">
        {/* Left Column - Form */}
        <div className="createinventory-form">
          {/* Create Inventory Section with Active Badge */}
          <div className="createinventory-section">
            <div className="createinventory-title-row">
              <h2 className="createinventory-title">Create Inventory</h2>
              <label className="createinventory-active-toggle">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className={`active-badge ${isActive ? 'active' : 'inactive'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Raw Materials, Finished Goods"
                />
              </div>
              <div className="form-group">
                <label>Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., RAW, FG"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={2}
              />
            </div>
          </div>

          {/* Option Types */}
          <div className="form-section">
            <h3>Linked Option Types</h3>
            <p className="section-hint">Select which option types can be tracked in this inventory</p>
            {optionTypesLoading ? (
              <div className="loading-state">Loading option types...</div>
            ) : optionTypes.length === 0 ? (
              <div className="empty-state">
                <p>No option types found.</p>
                <p className="hint">Create option types in Create → Options System → Create Option Type first.</p>
              </div>
            ) : (
              <div className="option-types-grid">
                {optionTypes.map((ot: any) => (
                  <div
                    key={ot._id}
                    className={`option-type-card ${allowedOptionTypes.includes(ot._id) ? 'selected' : ''}`}
                    onClick={() => toggleOptionType(ot._id)}
                  >
                    <span className="check">{allowedOptionTypes.includes(ot._id) ? '✓' : ''}</span>
                    <span className="name">{ot.name}</span>
                    {ot.specifications?.length > 0 && (
                      <span className="spec-count">{ot.specifications.length} specs</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Specifications */}
          {selectedOptionTypesData.length > 0 && (
            <div className="form-section">
              <h3>Specifications for Formulas</h3>
              <p className="section-hint">Select specifications to use in calculations</p>
              {selectedOptionTypesData.map((ot: any) => (
                <div key={ot._id} className="spec-group">
                  <h4>{ot.name}</h4>
                  <div className="specs-list">
                    {ot.specifications?.map((spec: any) => {
                      const isSelected = selectedSpecs.some(
                        s => s.optionTypeId === ot._id && s.specName === spec.name
                      );
                      return (
                        <div
                          key={spec.name}
                          className={`spec-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleSpec(ot._id, ot.name, spec.name, spec.unit)}
                        >
                          <span className="check">{isSelected ? '✓' : ''}</span>
                          <span className="spec-name">{spec.name}</span>
                          {spec.unit && <span className="spec-unit">({spec.unit})</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Calculations */}
          <div className="form-section">
            <div className="section-header">
              <h3>Dynamic Calculations</h3>
              <button type="button" className="add-btn" onClick={addCalculation}>
                + Add Calculation
              </button>
            </div>
            <p className="section-hint">Create formulas using selected specifications</p>

            {dynamicCalculations.length === 0 ? (
              <div className="empty-calcs">No calculations yet. Click "+ Add Calculation" to create one.</div>
            ) : (
              <div className="calculations-list">
                {dynamicCalculations.map((calc, index) => (
                  <div key={index} className={`calculation-item ${activeFormulaIndex === index ? 'active' : ''}`}>
                    <div className="calc-header">
                      <input
                        type="text"
                        value={calc.name}
                        onChange={(e) => updateCalculation(index, 'name', e.target.value)}
                        placeholder="Calculation name"
                        className="calc-name"
                      />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeCalculation(index)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="calc-formula">
                      <input
                        type="text"
                        value={calc.formula}
                        onChange={(e) => updateCalculation(index, 'formula', e.target.value)}
                        onFocus={() => setActiveFormulaIndex(index)}
                        placeholder="Enter formula (e.g., Paper_Weight * Paper_Price)"
                        className="formula-input"
                      />
                      <input
                        type="text"
                        value={calc.unit || ''}
                        onChange={(e) => updateCalculation(index, 'unit', e.target.value)}
                        placeholder="Unit"
                        className="unit-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Spec Variables for click-to-insert */}
            {activeFormulaIndex !== null && selectedSpecs.length > 0 && (
              <div className="spec-variables">
                <p className="hint">Click to insert into formula:</p>
                <div className="variables-list">
                  {selectedSpecs.map((spec) => (
                    <button
                      key={spec.varName}
                      type="button"
                      className="var-btn"
                      onClick={() => insertSpecIntoFormula(spec.varName)}
                    >
                      {spec.varName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inventory Units */}
          <div className="form-section">
            <h3>Inventory Units</h3>
            <p className="section-hint">Select which units to track (KG, PCS, etc.)</p>
            {inventoryTypesLoading ? (
              <div className="loading-state">Loading inventory units...</div>
            ) : inventoryTypes.length === 0 ? (
              <div className="empty-state">
                <p>No inventory units found.</p>
                <p className="hint">Units like KG, PCS, LTR need to be created in the backend first.</p>
              </div>
            ) : (
              <div className="units-grid">
                {inventoryTypes.map((unit: any) => {
                  const isSelected = inventoryUnits.some(u => u.inventoryTypeId === unit._id);
                  const isPrimary = inventoryUnits.find(u => u.inventoryTypeId === unit._id)?.isPrimary;
                  return (
                    <div
                      key={unit._id}
                      className={`unit-card ${isSelected ? 'selected' : ''} ${isPrimary ? 'primary' : ''}`}
                      onClick={() => toggleInventoryUnit(unit._id)}
                    >
                      <span className="symbol">{unit.symbol}</span>
                      <span className="name">{unit.name}</span>
                      {isSelected && (
                        <button
                          type="button"
                          className={`primary-btn ${isPrimary ? 'is-primary' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryUnit(unit._id);
                          }}
                        >
                          {isPrimary ? 'Primary' : 'Set Primary'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="form-actions">
            {onCancel && (
              <button className="cancel-btn" onClick={onCancel}>
                Cancel
              </button>
            )}
            <ActionButton
              type={isEditMode ? 'update' : 'save'}
              state={saveState}
              onClick={onSave}
            />
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="createInventory-preview">
          <div className="preview-card">
            <h3>Preview</h3>
            <div className="preview-content">
              <div className="preview-header">
                <span className="preview-code">{code || 'CODE'}</span>
                <span className="preview-name">{name || 'Inventory Name'}</span>
              </div>
              {description && <p className="preview-desc">{description}</p>}

              <div className="preview-section">
                <h4>Option Types ({allowedOptionTypes.length})</h4>
                {selectedOptionTypesData.length > 0 ? (
                  <div className="preview-tags">
                    {selectedOptionTypesData.map((ot: any) => (
                      <span key={ot._id} className="tag">{ot.name}</span>
                    ))}
                  </div>
                ) : (
                  <p className="empty">No option types selected</p>
                )}
              </div>

              <div className="preview-section">
                <h4>Formulas ({dynamicCalculations.length})</h4>
                {dynamicCalculations.length > 0 ? (
                  <ul className="preview-formulas">
                    {dynamicCalculations.map((calc, i) => (
                      <li key={i}>
                        <strong>{calc.name}:</strong> {calc.formula || '(no formula)'} {calc.unit && `(${calc.unit})`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty">No formulas defined</p>
                )}
              </div>

              <div className="preview-section">
                <h4>Units ({inventoryUnits.length})</h4>
                {inventoryUnits.length > 0 ? (
                  <div className="preview-tags">
                    {inventoryUnits.map((u) => {
                      const unitData = inventoryTypes.find((t: any) => t._id === u.inventoryTypeId);
                      return (
                        <span key={u.inventoryTypeId} className={`tag ${u.isPrimary ? 'primary' : ''}`}>
                          {unitData?.symbol || '?'}
                          {u.isPrimary && ' *'}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="empty">No units selected</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Inventory?</h3>
            <p>Are you sure you want to delete "{initialData?.name}"?</p>
            <p className="modal-warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInventory;
