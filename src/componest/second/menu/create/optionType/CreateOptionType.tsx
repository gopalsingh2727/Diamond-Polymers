import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOptionType, updateOptionType, deleteOptionType } from '../../../../redux/option/optionTypeActions';
import { getCategories } from '../../../../redux/category/categoryActions';
import { getInventoryTypesV2, seedInventoryTypesV2 } from '../../../../redux/unifiedV2';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import ImportProgressPopup from '../../../../../components/shared/ImportProgressPopup';
import ImportAccountPopup from '../../../../../components/shared/ImportAccountPopup';
import * as XLSX from 'xlsx';
import './createOptionType.css';

// Specification data types - only string and number
type SpecDataType = 'string' | 'number';

interface SpecificationTemplate {
  name: string;
  unit?: string;
  dataType: SpecDataType;
  defaultValue?: any;
  required: boolean;
  allowFormula: boolean;
  // Visibility flag
  visible: boolean;
}

interface CreateOptionTypeProps {
  initialData?: {
    _id: string;
    name: string;
    description?: string;
    categoryId?: string;
    category?: {_id: string;name: string;};
    specifications?: SpecificationTemplate[];
    isInventoryBased?: boolean;
    inventoryUnits?: string[];
    primaryInventoryUnit?: string;
  };
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateOptionType: React.FC<CreateOptionTypeProps> = ({ initialData, onCancel, onSaveSuccess }) => {
  const isEditMode = !!initialData;
  const dispatch = useDispatch<AppDispatch>();
  const { handleSave, handleDelete: crudDelete, saveState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const categoryState = useSelector((state: RootState) => state.v2.category);
  const rawCategories = categoryState?.list;
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const inventoryTypeState = useSelector((state: RootState) => state.v2.inventoryType);
  const rawInventoryTypes = inventoryTypeState?.list;
  const inventoryTypes = Array.isArray(rawInventoryTypes) ? rawInventoryTypes : [];
  const inventoryTypesLoading = inventoryTypeState?.loading;

  // Get selected branch to refetch when it changes
  const selectedBranch = useSelector((state: RootState) => state.auth?.userData?.selectedBranch);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isInventoryBased, setIsInventoryBased] = useState(false);
  const [inventoryUnits, setInventoryUnits] = useState<string[]>([]);
  const [primaryInventoryUnit, setPrimaryInventoryUnit] = useState('');
  const [specifications, setSpecifications] = useState<SpecificationTemplate[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);

  // Excel import state
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    success: 0,
    failed: 0,
    percentage: 0,
  });
  const [importSummary, setImportSummary] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Add new specification
  const addSpecification = () => {
    setSpecifications([
    ...specifications,
    {
      name: '',
      unit: '',
      dataType: 'string',
      defaultValue: '',
      required: false,
      allowFormula: false,
      visible: true
    }]
    );
  };

  // Update specification field
  const updateSpecification = (index: number, field: keyof SpecificationTemplate, value: any) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
  };

  // Remove specification
  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  useEffect(() => {
    dispatch(getCategories({}));
    dispatch(getInventoryTypesV2());
  }, [dispatch, selectedBranch]);

  // Seed inventory types if none exist
  const handleSeedInventoryTypes = async () => {
    try {
      await dispatch(seedInventoryTypesV2());
      toast.success('Success', 'Default inventory types created (kg, pcs, ltr, etc.)');
    } catch (error) {
      toast.error('Error', 'Failed to seed inventory types');
    }
  };

  // Toggle inventory unit selection
  const toggleInventoryUnit = (unitId: string) => {
    if (inventoryUnits.includes(unitId)) {
      setInventoryUnits(inventoryUnits.filter((id) => id !== unitId));
      // If removing primary unit, clear it
      if (primaryInventoryUnit === unitId) {
        setPrimaryInventoryUnit('');
      }
    } else {
      setInventoryUnits([...inventoryUnits, unitId]);
      // Auto-set primary if first selection
      if (inventoryUnits.length === 0) {
        setPrimaryInventoryUnit(unitId);
      }
    }
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategoryId(initialData.categoryId || initialData.category?._id || '');
      setIsInventoryBased(initialData.isInventoryBased || false);
      // Load inventory units
      if (initialData.inventoryUnits && Array.isArray(initialData.inventoryUnits)) {
        setInventoryUnits(initialData.inventoryUnits.map((u: any) => typeof u === 'string' ? u : u._id));
      }
      if (initialData.primaryInventoryUnit) {
        const primaryId = typeof initialData.primaryInventoryUnit === 'string' ?
        initialData.primaryInventoryUnit :
        (initialData.primaryInventoryUnit as any)?._id;
        setPrimaryInventoryUnit(primaryId || '');
      }
      // Load specifications with visibility flag
      if (initialData.specifications) {
        setSpecifications(initialData.specifications.map((spec: any) => ({
          name: spec.name || '',
          unit: spec.unit || '',
          dataType: spec.dataType === 'string' || spec.dataType === 'number' ? spec.dataType : 'string',
          defaultValue: spec.defaultValue || '',
          required: spec.required || false,
          allowFormula: spec.allowFormula || false,
          visible: spec.visible !== false
        })));
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Validation Error', 'Option Type Name is required');
      return;
    }

    const branchId = localStorage.getItem('selectedBranch') || '';

    // Filter out empty specifications
    const validSpecs = specifications.filter((spec) => spec.name && spec.name.trim() !== '');

    const optionTypeData = {
      name,
      description,
      branchId,
      categoryId: categoryId || undefined,
      isActive: true,
      isInventoryBased,
      inventoryUnits: isInventoryBased ? inventoryUnits : [],
      primaryInventoryUnit: isInventoryBased && primaryInventoryUnit ? primaryInventoryUnit : undefined,
      specifications: validSpecs
    };

    const saveAction = async () => {
      if (isEditMode) {
        return dispatch(updateOptionType(initialData!._id, optionTypeData) as any);
      } else {
        return dispatch(createOptionType(optionTypeData) as any);
      }
    };

    handleSave(saveAction, {
      successMessage: isEditMode ? 'Option Type updated!' : 'Option Type created!',
      onSuccess: () => {
        if (onSaveSuccess) {
          setTimeout(() => {
            onSaveSuccess();
          }, 1500);
        }
      }
    });
  };

  const handleDeleteClick = () => {
    if (!isEditMode || !initialData) return;

    crudDelete(
      () => dispatch(deleteOptionType(initialData._id) as any),
      {
        successMessage: 'Option Type deleted',
        confirmMessage: 'Are you sure you want to delete this option type? This action cannot be undone.',
        confirmTitle: 'Delete Option Type',
        onSuccess: () => {
          // Delay navigation to show toast
          setTimeout(() => {
            if (onSaveSuccess) onSaveSuccess();
          }, 1500);
        }
      }
    );
  };

  // Download Excel Template
  const downloadExcelTemplate = () => {
    // Create sample data with instructions
    const templateData = [
    {
      'Name *': 'Example: Plastic Bag',
      'Description': 'Optional description of the option type',
      'Category': 'Category name (must exist in system)',
      'Is Inventory Based': 'TRUE or FALSE',
      'Inventory Units': 'kg,pcs (comma-separated unit symbols)',
      'Primary Unit': 'kg (symbol of primary unit)',
      'Spec 1 - Name': 'Width',
      'Spec 1 - DataType': 'number',
      'Spec 1 - Unit': 'cm',
      'Spec 1 - Default': '10',
      'Spec 1 - Required': 'TRUE',
      'Spec 1 - AllowFormula': 'FALSE',
      'Spec 1 - Visible': 'TRUE',
      'Spec 2 - Name': 'Height',
      'Spec 2 - DataType': 'number',
      'Spec 2 - Unit': 'cm',
      'Spec 2 - Default': '15',
      'Spec 2 - Required': 'TRUE',
      'Spec 2 - AllowFormula': 'FALSE',
      'Spec 2 - Visible': 'TRUE',
      'Spec 3 - Name': 'Material',
      'Spec 3 - DataType': 'string',
      'Spec 3 - Unit': '',
      'Spec 3 - Default': 'HDPE',
      'Spec 3 - Required': 'FALSE',
      'Spec 3 - AllowFormula': 'FALSE',
      'Spec 3 - Visible': 'TRUE'
    },
    {
      'Name *': 'Box',
      'Description': 'Cardboard packaging',
      'Category': '',
      'Is Inventory Based': 'FALSE',
      'Inventory Units': '',
      'Primary Unit': '',
      'Spec 1 - Name': 'Length',
      'Spec 1 - DataType': 'number',
      'Spec 1 - Unit': 'cm',
      'Spec 1 - Default': '',
      'Spec 1 - Required': 'TRUE',
      'Spec 1 - AllowFormula': 'FALSE',
      'Spec 1 - Visible': 'TRUE',
      'Spec 2 - Name': '',
      'Spec 2 - DataType': '',
      'Spec 2 - Unit': '',
      'Spec 2 - Default': '',
      'Spec 2 - Required': '',
      'Spec 2 - AllowFormula': '',
      'Spec 2 - Visible': '',
      'Spec 3 - Name': '',
      'Spec 3 - DataType': '',
      'Spec 3 - Unit': '',
      'Spec 3 - Default': '',
      'Spec 3 - Required': '',
      'Spec 3 - AllowFormula': '',
      'Spec 3 - Visible': ''
    }];


    // Instructions sheet
    const instructions = [
    ['OPTION TYPE BULK IMPORT TEMPLATE'],
    [''],
    ['INSTRUCTIONS:'],
    ['1. Fill in the data starting from row 2 (the first example row)'],
    ['2. You can add up to 100 option types at once'],
    ['3. Required fields are marked with * in column headers'],
    ['4. You can add up to 10 specifications per option type (Spec 1 to Spec 10)'],
    [''],
    ['FIELD DESCRIPTIONS:'],
    ['Name *: The name of the option type (required)'],
    ['Description: Optional description'],
    ['Category: Category name (must already exist in your system, or leave blank)'],
    ['Is Inventory Based: TRUE or FALSE (whether to track inventory)'],
    ['Inventory Units: Comma-separated unit symbols (e.g., kg,pcs,ltr)'],
    ['Primary Unit: Symbol of the primary unit for inventory'],
    [''],
    ['SPECIFICATION FIELDS (up to 10 specs):'],
    ['Spec X - Name: Name of the specification dimension'],
    ['Spec X - DataType: Either "string" or "number"'],
    ['Spec X - Unit: Unit for number types (cm, mm, m, kg, g, %, pcs, etc.)'],
    ['Spec X - Default: Default value for this specification'],
    ['Spec X - Required: TRUE or FALSE'],
    ['Spec X - AllowFormula: TRUE or FALSE (allow formula-based values)'],
    ['Spec X - Visible: TRUE or FALSE (show in UI)'],
    [''],
    ['NOTES:'],
    ['- Delete the example rows before importing your data'],
    ['- Empty specification fields will be ignored'],
    ['- DataType must be exactly "string" or "number"'],
    ['- Boolean fields accept: TRUE/FALSE, true/false, 1/0, yes/no']];


    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add instructions sheet
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Add template sheet with up to 10 specs support
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');

    // Generate file
    XLSX.writeFile(wb, 'OptionType_Import_Template.xlsx');
    toast.success('Download Complete', 'Excel template downloaded! Check your Downloads folder.');
  };

  // Parse Excel and import data
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames.find((name) => name === 'Template') || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('Import Error', 'No data found in Excel file');
        setBulkImporting(false);
        return;
      }

      if (jsonData.length > 100) {
        toast.info('Import Notice', 'Maximum 100 option types allowed per import. Only first 100 will be processed.');
      }

      const branchId = localStorage.getItem('selectedBranch') || '';
      const processedData: any[] = [];
      const errors: string[] = [];

      // Process each row
      for (let i = 0; i < Math.min(jsonData.length, 100); i++) {
        const row: any = jsonData[i];
        const rowNum = i + 2; // Excel row number (accounting for header)

        // Validate required fields
        const name = row['Name *']?.toString().trim();
        if (!name) {
          errors.push(`Row ${rowNum}: Name is required`);
          continue;
        }

        // Parse category
        let categoryId = '';
        if (row['Category']) {
          const categoryName = row['Category'].toString().trim();
          const category = categories.find((c: any) => c.name.toLowerCase() === categoryName.toLowerCase());
          if (category) {
            categoryId = category._id;
          } else {
            errors.push(`Row ${rowNum}: Category "${categoryName}" not found`);
          }
        }

        // Parse inventory settings
        const isInventoryBased = parseBooleanField(row['Is Inventory Based']);
        let inventoryUnitsArray: string[] = [];
        let primaryUnit = '';

        if (isInventoryBased && row['Inventory Units']) {
          const unitSymbols = row['Inventory Units'].toString().split(',').map((s: string) => s.trim());
          unitSymbols.forEach((symbol: string) => {
            const unit = inventoryTypes.find((u: any) => u.symbol.toLowerCase() === symbol.toLowerCase());
            if (unit) {
              inventoryUnitsArray.push(unit._id);
            }
          });

          // Parse primary unit
          if (row['Primary Unit']) {
            const primarySymbol = row['Primary Unit'].toString().trim();
            const primaryUnitObj = inventoryTypes.find((u: any) => u.symbol.toLowerCase() === primarySymbol.toLowerCase());
            if (primaryUnitObj) {
              primaryUnit = primaryUnitObj._id;
            }
          }
        }

        // Parse specifications (up to 10)
        const specifications: SpecificationTemplate[] = [];
        for (let specNum = 1; specNum <= 10; specNum++) {
          const specName = row[`Spec ${specNum} - Name`]?.toString().trim();
          if (!specName) continue; // Skip empty specs

          const dataTypeRaw = row[`Spec ${specNum} - DataType`]?.toString().trim().toLowerCase();
          const dataType: SpecDataType = dataTypeRaw === 'number' || dataTypeRaw === 'string' ? dataTypeRaw : 'string';

          specifications.push({
            name: specName,
            unit: row[`Spec ${specNum} - Unit`]?.toString().trim() || '',
            dataType,
            defaultValue: row[`Spec ${specNum} - Default`] || '',
            required: parseBooleanField(row[`Spec ${specNum} - Required`]),
            allowFormula: parseBooleanField(row[`Spec ${specNum} - AllowFormula`]),
            visible: row[`Spec ${specNum} - Visible`] === undefined ? true : parseBooleanField(row[`Spec ${specNum} - Visible`])
          });
        }

        // Build option type object
        processedData.push({
          name,
          description: row['Description']?.toString().trim() || '',
          branchId,
          categoryId: categoryId || undefined,
          isActive: true,
          isInventoryBased,
          inventoryUnits: inventoryUnitsArray,
          primaryInventoryUnit: primaryUnit || undefined,
          specifications
        });
      }

      if (errors.length > 0) {
        toast.error('Import Errors', `Found ${errors.length} error(s): ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...and more' : ''}`);
      }

      if (processedData.length === 0) {
        toast.error('Import Error', 'No valid data to import');
        setBulkImporting(false);
        return;
      }

      // Confirm before bulk save
      const confirmed = window.confirm(
        `Ready to import ${processedData.length} option type(s).\n${errors.length > 0 ? `\n${errors.length} rows had errors and will be skipped.` : ''}\n\nProceed with import?`
      );

      if (!confirmed) {
        setBulkImporting(false);
        return;
      }

      // Bulk save
      let successCount = 0;
      let failCount = 0;
      const importErrors: string[] = [];

      for (let i = 0; i < processedData.length; i++) {
        const optionTypeData = processedData[i];

        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createOptionType(optionTypeData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(`${optionTypeData.name}: ${errorMsg}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setImportSummary({
        total: processedData.length,
        success: successCount,
        failed: failCount,
        errors: [...errors, ...importErrors],
      });

      if (successCount > 0) {
        toast.success('Import Complete', `Successfully created: ${successCount}, Failed: ${failCount}`);
      } else {
        toast.error('Import Failed', `Successfully created: ${successCount}, Failed: ${failCount}`);
      }

      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {

      toast.error('Import Error', 'Failed to process Excel file. Please check the format.');
    } finally {
      setBulkImporting(false);
    }
  };

  // Helper function to parse boolean fields
  const parseBooleanField = (value: any): boolean => {
    if (value === undefined || value === null || value === '') return false;
    const strValue = value.toString().toLowerCase().trim();
    return strValue === 'true' || strValue === '1' || strValue === 'yes';
  };

  return (
    <form onSubmit={handleSubmit} className="createOptionType-container">
      {/* Delete Confirmation Modal */}
      {confirmDialog.isOpen &&
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>

          <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center"
          }}>

            <div style={{ fontSize: "48px", marginBottom: "16px" }}>Warning</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>{confirmDialog.title}</h3>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
              type="button"
              onClick={closeConfirmDialog}
              style={{
                padding: "10px 24px",
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}>

                Cancel
              </button>
              <button
              type="button"
              onClick={confirmDialog.onConfirm}
              disabled={deleteState === 'loading'}
              style={{
                padding: "10px 24px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}>

                {deleteState === 'loading' ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Header Section */}
      <div className="createOptionType-header">
        {isEditMode &&
        <div className="createOptionType-actionButtons">
            <button type="button" onClick={onCancel} className="createOptionType-backButton">
              ← Back to List
            </button>
            <button
            type="button"
            onClick={handleDeleteClick}
            disabled={deleteState === 'loading'}
            className="createOptionType-deleteButton">

              {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
        {!isEditMode ? (
          <div className="createaccount-title-row">
            <h1 className="createOptionType-title" style={{ margin: 0, border: 'none', padding: 0 }}>
              Create Option Type
            </h1>

            <button
              type="button"
              onClick={() => setShowImportPopup(true)}
              className="import-accounts-title-btn"
              disabled={bulkImporting}
            >
              Import Option Types
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        ) : (
          <h1 className="createOptionType-title">Edit: {initialData?.name}</h1>
        )}
        <p className="createOptionType-subtitle">Define option types and their specification templates</p>
      </div>

      {/* Form Grid */}
      <div className="createOptionType-formGrid">
        {/* Basic Information Section */}
        <div className="createOptionType-section">
          <h3 className="createOptionType-sectionTitle">Basic Information</h3>

          <div className="createOptionType-row">
            <div className="createOptionType-column">
              <label className="createOptionType-label">Option Type Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Plastic Bag, Printing Type" required className="createOptionType-input" />
            </div>
            <div className="createOptionType-column">
              <label className="createOptionType-label">Category (Optional)</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="createOptionType-input" autoComplete="off">
                <option value="">-- Select a category --</option>
                {Array.isArray(categories) && categories.map((cat: any) =>
                <option key={cat._id} value={cat._id}>{cat.name}</option>
                )}
              </select>
            </div>
          </div>

          <div className="createOptionType-group">
            <label className="createOptionType-label">Description (Optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} className="createOptionType-textarea" />
          </div>

          <div className="createOptionType-group createOptionType-inventoryToggle">
            <label className="createOptionType-inventoryLabel">
              <input
                type="checkbox"
                checked={isInventoryBased}
                onChange={(e) => setIsInventoryBased(e.target.checked)} />

              <span className="createOptionType-inventoryText">
                Track Inventory for this Option Type
              </span>
            </label>
            <p className="createOptionType-inventoryHint">
              When enabled, options of this type will automatically track inventory levels. Stock will be auto-debited when orders are approved.
            </p>
          </div>

          {/* Inventory Units Section - Only show when isInventoryBased is checked */}
          {isInventoryBased &&
          <div className="createOptionType-group createOptionType-inventoryUnitsSection">
              <label className="createOptionType-label">Inventory Units (Multi-select)</label>
              <p className="createOptionType-inventoryHint" style={{ marginBottom: '8px' }}>
                Select which units to track inventory in (e.g., Weight in grams AND Pieces count)
              </p>

              {inventoryTypesLoading ?
            <p>Loading inventory types...</p> :
            Array.isArray(inventoryTypes) && inventoryTypes.length > 0 ?
            <>
                  <div className="createOptionType-inventoryUnitsGrid">
                    {inventoryTypes.map((unit: any) =>
                <label key={unit._id} className="createOptionType-inventoryUnitItem">
                        <input
                    type="checkbox"
                    checked={inventoryUnits.includes(unit._id)}
                    onChange={() => toggleInventoryUnit(unit._id)} />

                        <span className="createOptionType-unitName">{unit.name}</span>
                        <span className="createOptionType-unitSymbol">({unit.symbol})</span>
                      </label>
                )}
                  </div>

                  {/* Primary Unit Selector */}
                  {inventoryUnits.length > 0 &&
              <div className="createOptionType-primaryUnit">
                      <label className="createOptionType-label">Primary Unit</label>
                      <select
                  value={primaryInventoryUnit}
                  onChange={(e) => setPrimaryInventoryUnit(e.target.value)}
                  className="createOptionType-input">

                        <option value="">-- Select Primary Unit --</option>
                        {inventoryUnits.map((unitId) => {
                    const unit = inventoryTypes.find((u: any) => u._id === unitId);
                    return unit ?
                    <option key={unit._id} value={unit._id}>
                              {unit.name} ({unit.symbol})
                            </option> :
                    null;
                  })}
                      </select>
                      <p className="createOptionType-inventoryHint">
                        The primary unit is used for default display and calculations.
                      </p>
                    </div>
              }
                </> :

            <div className="createOptionType-noUnits">
                  <p>No inventory units found.</p>
                  <button
                type="button"
                onClick={handleSeedInventoryTypes}
                className="createOptionType-seedButton">

                    Create Default Units (kg, pcs, ltr, etc.)
                  </button>
                </div>
            }
            </div>
          }
        </div>

        {/* Specifications Section */}
        <div className="createOptionType-section">
          <div className="createOptionType-specsHeader">
            <h3 className="createOptionType-sectionTitle" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Specifications Template</h3>
            <button type="button" onClick={addSpecification} className="createOptionType-addButton">
              + Add Specification
            </button>
          </div>

          {specifications.length === 0 &&
          <p className="createOptionType-emptyState">
              No specifications added. Click "+ Add Specification" to add template dimensions.
            </p>
          }

          {specifications.map((spec, index) =>
          <div key={index} className="createOptionType-specCard">
              {/* Row 1: Name, DataType, Unit */}
              <div className="createOptionType-specRow">
                <input
                type="text"
                placeholder="Dimension Name *"
                value={spec.name}
                onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                className="createOptionType-specInput" />

                <select
                value={spec.dataType}
                onChange={(e) => updateSpecification(index, 'dataType', e.target.value as SpecDataType)}
                className="createOptionType-specSelect">

                  <option value="string">String</option>
                  <option value="number">Number</option>
                </select>
                {spec.dataType === 'number' &&
              <select
                value={spec.unit || ''}
                onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                className="createOptionType-unitSelect">

                    <option value="">Unit</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                    <option value="m">m</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="%">%</option>
                    <option value="pcs">pcs</option>
                  </select>
              }
                <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="createOptionType-removeButton">

                  ✕
                </button>
              </div>

              {/* Row 2: Default Value */}
              <input
              type={spec.dataType === 'number' ? 'number' : 'text'}
              placeholder="Default Value (Optional)"
              value={spec.defaultValue || ''}
              onChange={(e) => updateSpecification(index, 'defaultValue', e.target.value)}
              className="createOptionType-defaultInput" />


              {/* Row 3: Visibility Toggle */}
              <div className="createOptionType-visibilityRow">
                <label className="createOptionType-visibilityLabel">
                  <input
                  type="checkbox"
                  checked={spec.visible}
                  onChange={(e) => updateSpecification(index, 'visible', e.target.checked)} />

                  <span className={`createOptionType-visibilityText ${spec.visible ? 'visible' : 'hidden'}`}>
                    {spec.visible ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>

              {/* Row 4: Additional flags */}
              <div className="createOptionType-flagsRow">
                <label className="createOptionType-flagLabel">
                  <input
                  type="checkbox"
                  checked={spec.required}
                  onChange={(e) => updateSpecification(index, 'required', e.target.checked)} />

                  Required
                </label>
                <label className="createOptionType-flagLabel">
                  <input
                  type="checkbox"
                  checked={spec.allowFormula}
                  onChange={(e) => updateSpecification(index, 'allowFormula', e.target.checked)} />

                  Allow Formula
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="createOptionType-formActions">
        <button type="submit" disabled={saveState === 'loading'} className="createOptionType-button">
          {saveState === 'loading' ? 'Saving...' : isEditMode ? 'Update Option Type' : 'Save Option Type'}
        </button>
      </div>

      {/* Import Account Popup */}
      <ImportAccountPopup
        isOpen={showImportPopup}
        onClose={() => setShowImportPopup(false)}
        onDownloadTemplate={downloadExcelTemplate}
        onFileSelect={(e) => {
          handleExcelImport(e);
          setShowImportPopup(false);
        }}
        isImporting={bulkImporting}
        title="Import Option Types"
        infoMessage="Bulk import up to 100 option types at once. Download the template first."
        buttonText="Import from Excel"
      />

      {/* Import Progress Popup */}
      <ImportProgressPopup
        isOpen={bulkImporting}
        currentIndex={importProgress.current}
        total={importProgress.total}
        successCount={importProgress.success}
        failedCount={importProgress.failed}
        message={`Importing ${importProgress.current} of ${importProgress.total} option types...`}
      />

      {/* Import Summary Modal */}
      {importSummary && (
        <div className="import-summary-overlay" onClick={() => setImportSummary(null)}>
          <div className="import-summary-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px', color: '#1f2937', textAlign: 'center' }}>
              Import Complete
            </h2>

            <div className="summary-stats">
              <div className="stat-box success">
                <div className="stat-number">{importSummary.success}</div>
                <div className="stat-label">Success</div>
              </div>
              <div className="stat-box failed">
                <div className="stat-number">{importSummary.failed}</div>
                <div className="stat-label">Failed</div>
              </div>
            </div>

            {importSummary.errors.length > 0 && (
              <div className="error-list">
                <h4 style={{ margin: '0 0 12px 0', color: '#dc2626', fontWeight: 600 }}>Errors:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                  {importSummary.errors.map((err, idx) => (
                    <li key={idx} style={{ marginBottom: '8px', color: '#991b1b', fontSize: '0.875rem' }}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setImportSummary(null)}
              style={{
                width: '100%',
                padding: '12px 24px',
                marginTop: '24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </form>);

};

export default CreateOptionType;