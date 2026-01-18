import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { AppDispatch } from '../../../../../store';
import { getOptionSpecsV2, deleteOptionSpecV2, updateOptionSpecV2, getOptionTypesV2, getOptionsV2 } from '../../../../redux/unifiedV2';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { Parser } from 'expr-eval';
import './EditOptionSpecList.css';
import '../EditMachineType/EditMachineyType.css';
import '../../create/optionSpec/createOptionSpec.css';

// Reference dimension interface (for refer items)
interface ReferenceDimension {
  name: string;
  value: string | number | boolean | any;
  unit?: string;
  dataType: "string" | "number" | "boolean" | "date" | "file" | "link" | "dropdown";
  formula?: string;
  isCalculated?: boolean;
  includeInTotal?: boolean;
  totalFormula?: string;
}

// Reference item interface (each reference in a refer type)
interface ReferenceItem {
  optionTypeId?: string;
  optionTypeName: string;
  dimensions: ReferenceDimension[];
  order: number;
}

interface Specification {
  name: string;
  value: string | number | boolean | any;
  unit?: string;
  dataType: "string" | "number" | "boolean" | "date" | "file" | "link" | "refer" | "dropdown";
  formula?: string;
  isCalculated?: boolean;
  referenceEnabled?: boolean;
  referenceTo?: string;
  comparisonOperator?: string;
  dropdownOptions?: string[];
  includeInTotal?: boolean;
  totalFormula?: string;
  referenceItems?: ReferenceItem[];
  visible?: boolean;
  public?: boolean;
  usedForFormulas?: boolean;
  orderTypeOnly?: boolean;
  query?: boolean;
}

// Evaluate formula for TOTALS row
const evaluateTotalFormula = (formula: string, values: number[]): number | string => {
  if (!formula || formula.trim() === '') {
    return '-';
  }

  const formulaUpper = formula.trim().toUpperCase();

  try {
    const numericValues = values.filter((v) => typeof v === 'number' && !isNaN(v));

    if (numericValues.length === 0) {
      return '-';
    }

    if (formulaUpper === 'SUM') {
      return numericValues.reduce((sum, val) => sum + val, 0);
    }

    if (formulaUpper === 'AVERAGE' || formulaUpper === 'AVG') {
      const sum = numericValues.reduce((sum, val) => sum + val, 0);
      return sum / numericValues.length;
    }

    if (formulaUpper === 'MAX') {
      return Math.max(...numericValues);
    }

    if (formulaUpper === 'MIN') {
      return Math.min(...numericValues);
    }

    if (formulaUpper === 'COUNT') {
      return numericValues.length;
    }

    let expression = formula;
    const sum = numericValues.reduce((sum, val) => sum + val, 0);
    const avg = sum / numericValues.length;
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);
    const count = numericValues.length;

    expression = expression.replace(/\bSUM\b/gi, sum.toString());
    expression = expression.replace(/\bAVERAGE\b/gi, avg.toString());
    expression = expression.replace(/\bAVG\b/gi, avg.toString());
    expression = expression.replace(/\bMAX\b/gi, max.toString());
    expression = expression.replace(/\bMIN\b/gi, min.toString());
    expression = expression.replace(/\bCOUNT\b/gi, count.toString());

    const safeExpression = expression.replace(/[^0-9+\-*/.()]/g, '');
    if (safeExpression !== expression) {
      return 'Error: Invalid formula';
    }

    const result = new Function('return ' + safeExpression)();

    if (typeof result === 'number' && !isNaN(result)) {
      return result;
    }

    return 'Error';
  } catch (error) {
    return 'Error';
  }
};

const EditOptionSpecList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { handleUpdate, handleDelete: crudDelete, updateState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const optionSpecState = useSelector((state: RootState) => state.v2.optionSpec);
  const rawOptionSpecs = optionSpecState?.list;
  const optionSpecs = Array.isArray(rawOptionSpecs) ? rawOptionSpecs : [];
  const loading = optionSpecState?.loading;
  const optionTypeState = useSelector((state: RootState) => state.v2.optionType);
  const rawOptionTypes = optionTypeState?.list;
  const optionTypes = Array.isArray(rawOptionTypes) ? rawOptionTypes : [];

  // Get options (option names) from Redux
  const optionState = useSelector((state: RootState) => state.v2.option);
  const rawOptions = optionState?.list;
  const options = Array.isArray(rawOptions) ? rawOptions : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  // Store the selected item data directly to avoid issues when filteredSpecs changes
  const [selectedItemData, setSelectedItemData] = useState<any>(null);

  // State for OptionSpec dimension name browser (MULTIPLE SELECTION)
  const [selectedReferenceSpecIds, setSelectedReferenceSpecIds] = useState<string[]>([]);
  const [referenceDimensionData, setReferenceDimensionData] = useState<{name: string; value: number; unit?: string; sourceName?: string;}[]>([]);

  // State for Option (Option Name) dimension browser - MULTIPLE SELECTION
  const [selectedReferenceOptionIds, setSelectedReferenceOptionIds] = useState<string[]>([]);
  const [referenceOptionDimensionData, setReferenceOptionDimensionData] = useState<{name: string; value: number; unit?: string; sourceName?: string;}[]>([]);

  // State for Option Type specifications (auto-populated when optionTypeId is selected)
  const [optionTypeSpecsData, setOptionTypeSpecsData] = useState<{name: string; defaultValue: number; unit?: string;}[]>([]);

  // State for tracking active formula field (for click-to-insert feature)
  const [activeFormulaIndex, setActiveFormulaIndex] = useState<number | null>(null);

  // State for reference popup (to select which dimension to reference)
  const [referencePopupIndex, setReferencePopupIndex] = useState<number | null>(null);

  // Current editing item's optionTypeId
  const [editOptionTypeId, setEditOptionTypeId] = useState<string>('');

  useEffect(() => {
    dispatch(getOptionSpecsV2());
    dispatch(getOptionTypesV2());
    const branchId = localStorage.getItem('selectedBranch') || '';
    dispatch(getOptionsV2({ branchId }));
  }, [dispatch]);

  // Get option type name - handles both populated object and string ID
  const getOptionTypeName = (optionTypeId: any) => {
    if (!optionTypeId) return 'N/A';

    if (typeof optionTypeId === 'object' && optionTypeId.name) {
      return optionTypeId.name;
    }

    if (typeof optionTypeId === 'string' && Array.isArray(optionTypes)) {
      const type = optionTypes.find((t: any) => t._id === optionTypeId);
      return type?.name || 'N/A';
    }

    return 'N/A';
  };

  // Get option type ID from optionTypeId field
  const getOptionTypeIdString = (optionTypeId: any): string => {
    if (!optionTypeId) return '';
    if (typeof optionTypeId === 'string') return optionTypeId;
    if (typeof optionTypeId === 'object' && optionTypeId._id) return optionTypeId._id;
    return '';
  };

  // Filter option specs based on search
  const filteredSpecs = Array.isArray(optionSpecs)
    ? optionSpecs.filter((spec: any) =>
        spec.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getOptionTypeName(spec.optionTypeId).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Extract dimension data when reference OptionSpecs are selected (MULTIPLE)
  useEffect(() => {
    if (selectedReferenceSpecIds.length > 0 && Array.isArray(optionSpecs)) {
      const allDimensionData: {name: string; value: number; unit?: string; sourceName?: string;}[] = [];

      selectedReferenceSpecIds.forEach((specId) => {
        const spec = optionSpecs.find((s: any) => s._id === specId);
        const specData = spec?.specifications || spec?.dimensions || [];
        if (spec && specData.length > 0) {
          specData
            .filter((d: any) => {
              if (d.dataType === 'number') return true;
              const val = d.value;
              if (typeof val === 'number' && !isNaN(val)) return true;
              if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return true;
              return false;
            })
            .forEach((d: any) => {
              allDimensionData.push({
                name: d.name,
                value: Number(d.value) || 0,
                unit: d.unit || '',
                sourceName: spec.name || spec.code || 'Unknown'
              });
            });
        }
      });

      setReferenceDimensionData(allDimensionData);
    } else {
      setReferenceDimensionData([]);
    }
  }, [selectedReferenceSpecIds, optionSpecs]);

  // Extract dimension data when reference Options (Option Names) are selected (MULTIPLE)
  useEffect(() => {
    if (selectedReferenceOptionIds.length > 0 && Array.isArray(options)) {
      const allDimensionData: {name: string; value: number; unit?: string; sourceName?: string;}[] = [];

      selectedReferenceOptionIds.forEach((optionId) => {
        const option = options.find((o: any) => o._id === optionId);
        const dimData = option?.dimensions || option?.specifications || [];
        if (option && dimData.length > 0) {
          dimData
            .filter((d: any) => {
              if (d.dataType === 'number') return true;
              const val = d.value;
              if (typeof val === 'number' && !isNaN(val)) return true;
              if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return true;
              return false;
            })
            .forEach((d: any) => {
              allDimensionData.push({
                name: d.name,
                value: Number(d.value) || 0,
                unit: d.unit || '',
                sourceName: option.name || 'Unknown'
              });
            });
        }
      });

      setReferenceOptionDimensionData(allDimensionData);
    } else {
      setReferenceOptionDimensionData([]);
    }
  }, [selectedReferenceOptionIds, options]);

  // Extract Option Type specifications when editOptionTypeId changes
  useEffect(() => {
    if (editOptionTypeId && optionTypes.length > 0) {
      const selectedType = optionTypes.find((ot: any) => ot._id === editOptionTypeId);
      const templateData = selectedType?.specificationTemplate || selectedType?.specifications || [];
      if (templateData.length > 0) {
        const specsData = templateData
          .filter((spec: any) => {
            if (spec.dataType === 'number') return true;
            const val = spec.defaultValue;
            if (typeof val === 'number' && !isNaN(val)) return true;
            if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return true;
            return false;
          })
          .map((spec: any) => ({
            name: spec.name,
            defaultValue: Number(spec.defaultValue) || 0,
            unit: spec.unit || ''
          }));
        setOptionTypeSpecsData(specsData);
      } else {
        setOptionTypeSpecsData([]);
      }
    } else {
      setOptionTypeSpecsData([]);
    }
  }, [editOptionTypeId, optionTypes]);

  const evaluateDimensionFormulas = (specs: Specification[]): Specification[] => {
    const parser = new Parser();
    const context: Record<string, number> = {};

    const toVarName = (name: string) => name.replace(/\s+/g, '_');

    // Add referenced Option Spec values to context
    if (selectedReferenceSpecIds.length > 0 && Array.isArray(optionSpecs)) {
      selectedReferenceSpecIds.forEach((specId) => {
        const refSpec = optionSpecs.find((s: any) => s._id === specId);
        const refSpecData = refSpec?.specifications || refSpec?.dimensions || [];
        if (refSpec && refSpecData.length > 0) {
          refSpecData.forEach((dim: any) => {
            if (dim.dataType === 'number' || typeof dim.value === 'number' || !isNaN(Number(dim.value))) {
              const varName = toVarName(dim.name);
              const numValue = Number(dim.value) || 0;
              context[varName] = numValue;
              context[varName.toLowerCase()] = numValue;
              context[dim.name] = numValue;
            }
          });
        }
      });
    }

    // Add referenced Option (Option Name) values to context
    if (selectedReferenceOptionIds.length > 0 && Array.isArray(options)) {
      selectedReferenceOptionIds.forEach((optionId) => {
        const refOption = options.find((o: any) => o._id === optionId);
        const refOptionData = refOption?.dimensions || refOption?.specifications || [];
        if (refOption && refOptionData.length > 0) {
          refOptionData.forEach((dim: any) => {
            if (dim.dataType === 'number' || typeof dim.value === 'number' || !isNaN(Number(dim.value))) {
              const varName = toVarName(dim.name);
              const numValue = Number(dim.value) || 0;
              context[varName] = numValue;
              context[varName.toLowerCase()] = numValue;
              context[dim.name] = numValue;
            }
          });
        }
      });
    }

    // Add Option Type specifications to context
    if (optionTypeSpecsData.length > 0) {
      optionTypeSpecsData.forEach((spec) => {
        const varName = toVarName(spec.name);
        context['optionType_' + varName] = spec.defaultValue;
        context['optionType_' + varName.toLowerCase()] = spec.defaultValue;
        context['OT_' + varName] = spec.defaultValue;
        context['ot_' + varName.toLowerCase()] = spec.defaultValue;
      });
    }

    // First pass: collect all non-formula values from current spec
    specs.forEach((spec) => {
      if (!spec.formula && spec.dataType === 'number') {
        const varName = toVarName(spec.name);
        context[varName] = Number(spec.value) || 0;
        context[spec.name] = Number(spec.value) || 0;
      }
    });

    // Second pass: evaluate formulas
    return specs.map((spec) => {
      if (spec.formula && spec.dataType === 'number') {
        try {
          const expression = parser.parse(spec.formula);
          const result = expression.evaluate(context);
          spec.value = result;
          spec.isCalculated = true;
          context[toVarName(spec.name)] = result;
          context[spec.name] = result;
        } catch (error) {
          spec.isCalculated = false;
        }
      }
      return spec;
    });
  };

  // Re-evaluate formulas when reference selections change
  useEffect(() => {
    if (specifications.length > 0 && specifications.some((s) => s.formula && s.formula.trim() !== '')) {
      try {
        const evaluated = evaluateDimensionFormulas(specifications);
        setSpecifications(evaluated);
      } catch (error) {
        // Ignore errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReferenceSpecIds, selectedReferenceOptionIds, referenceDimensionData, referenceOptionDimensionData]);

  const handleRowClick = (index: number, item: any) => {
    setSelectedRow(index);
    setSelectedItemData(item); // Store the full item data
    setEditId(item._id);
    setEditName(item.name || '');
    setEditCode(item.code || '');
    setEditDescription(item.description || '');
    const optTypeId = getOptionTypeIdString(item.optionTypeId);
    setEditOptionTypeId(optTypeId);

    // Load specifications with all fields
    const specs = (item.specifications || []).map((spec: any) => ({
      name: spec.name || '',
      value: spec.value ?? '',
      unit: spec.unit || '',
      dataType: spec.dataType || 'string',
      formula: spec.formula || '',
      isCalculated: spec.isCalculated || false,
      referenceEnabled: spec.referenceEnabled || false,
      referenceTo: spec.referenceTo || '',
      comparisonOperator: spec.comparisonOperator || '',
      dropdownOptions: spec.dropdownOptions || [],
      includeInTotal: spec.includeInTotal !== false,
      totalFormula: spec.totalFormula || 'SUM',
      referenceItems: spec.referenceItems || [],
      visible: spec.visible !== false,
      public: spec.public || false,
      usedForFormulas: spec.usedForFormulas || false,
      orderTypeOnly: spec.orderTypeOnly || false,
      query: spec.query || false
    }));
    setSpecifications(specs);

    // Reset reference selections
    setSelectedReferenceSpecIds([]);
    setSelectedReferenceOptionIds([]);
    setActiveFormulaIndex(null);

    setShowDetail(true);
  };

  const addDimension = () => {
    setSpecifications([
      ...specifications,
      {
        name: "",
        value: "",
        unit: "",
        dataType: "string",
        formula: "",
        isCalculated: false,
        referenceEnabled: false,
        referenceTo: "",
        comparisonOperator: "",
        includeInTotal: true,
        totalFormula: "SUM",
        visible: true,
        public: false,
        usedForFormulas: false,
        orderTypeOnly: false,
        query: false
      }
    ]);
  };

  const updateDimension = (index: number, field: keyof Specification, value: any) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'formula') {
      updated[index].isCalculated = value && value.trim() !== '';
    }

    if (field === 'dataType') {
      updated[index].value = '';
      updated[index].formula = '';
      updated[index].isCalculated = false;
    }

    try {
      const evaluated = evaluateDimensionFormulas(updated);
      setSpecifications(evaluated);
    } catch (error) {
      setSpecifications(updated);
    }
  };

  const removeDimension = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Insert reference dimension name into active formula field
  const insertIntoFormula = (dimName: string) => {
    if (activeFormulaIndex === null) {
      toast.error('Formula Error', 'Please click on a formula field first, then click the dimension name to insert.');
      return;
    }
    const updated = [...specifications];
    const currentFormula = updated[activeFormulaIndex].formula || '';
    const safeDimName = dimName.replace(/\s+/g, '_');
    updated[activeFormulaIndex].formula = currentFormula + safeDimName;
    updated[activeFormulaIndex].isCalculated = true;

    try {
      const evaluated = evaluateDimensionFormulas(updated);
      setSpecifications(evaluated);
    } catch (error) {
      setSpecifications(updated);
    }
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      toast.error('Validation Error', 'Option Spec Name cannot be empty');
      return;
    }

    if (!editId) return;

    const branchId = localStorage.getItem('selectedBranch') || '';

    // Convert specification values based on dataType and filter empty names
    const processedSpecs = specifications
      .filter((spec) => spec.name && spec.name.trim() !== '')
      .map((spec) => {
        let processedValue: any = spec.value;

        if (spec.dataType === "number") {
          processedValue = Number(spec.value);
        } else if (spec.dataType === "boolean") {
          processedValue = spec.value === "true" || spec.value === true;
        }

        // Filter empty reference items and dimensions
        const filteredReferenceItems = (spec.referenceItems || [])
          .filter((item) => item.optionTypeName && item.optionTypeName.trim() !== '')
          .map((item) => ({
            ...item,
            dimensions: (item.dimensions || []).filter((dim) => dim.name && dim.name.trim() !== '')
          }));

        return {
          name: spec.name,
          value: processedValue,
          unit: spec.unit,
          dataType: spec.dataType,
          formula: spec.formula,
          isCalculated: spec.isCalculated,
          referenceEnabled: spec.referenceEnabled || false,
          referenceTo: spec.referenceTo || "",
          comparisonOperator: spec.comparisonOperator || "",
          dropdownOptions: spec.dropdownOptions || [],
          referenceItems: filteredReferenceItems,
          includeInTotal: spec.includeInTotal,
          totalFormula: spec.totalFormula,
          visible: spec.visible,
          public: spec.public || false,
          usedForFormulas: spec.usedForFormulas || false,
          orderTypeOnly: spec.orderTypeOnly || false,
          query: spec.query || false
        };
      });

    await handleUpdate(
      () => dispatch(updateOptionSpecV2(editId, {
        name: editName,
        code: editCode,
        description: editDescription,
        branchId,
        specifications: processedSpecs
      })),
      {
        successMessage: 'Option Spec updated successfully!',
        errorMessage: 'Failed to update Option Spec.',
        onSuccess: () => {
          setTimeout(() => {
            setShowDetail(false);
            dispatch(getOptionSpecsV2());
          }, 1500);
        }
      }
    );
  };

  const handleDeleteClick = async () => {
    if (!editId) return;

    await crudDelete(
      () => dispatch(deleteOptionSpecV2(editId)),
      {
        confirmTitle: 'Delete Option Spec',
        confirmMessage: 'Are you sure you want to delete this option spec?',
        successMessage: 'Deleted successfully.',
        errorMessage: 'Failed to delete.',
        onSuccess: () => {
          setShowDetail(false);
          setSelectedItemData(null);
          setEditId(null);
          dispatch(getOptionSpecsV2());
        }
      }
    );
  };

  // Handle back button click - clear selected item data
  const handleBackClick = () => {
    setShowDetail(false);
    setSelectedItemData(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedRow(0);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Render value input based on dataType
  const renderValueInput = (spec: Specification, index: number) => {
    if (spec.isCalculated) {
      return (
        <input
          placeholder="Auto-calculated"
          value={spec.value?.toString() || ''}
          disabled
          style={{ backgroundColor: '#c8e6c9', flex: 1 }}
        />
      );
    }

    switch (spec.dataType) {
      case 'string':
        return (
          <input
            placeholder="Value"
            value={spec.value?.toString() || ''}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            placeholder="Value"
            value={spec.value?.toString() || ''}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );

      case 'boolean':
        return (
          <select
            value={spec.value?.toString() || ''}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={spec.value?.toString() || ''}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );

      case 'file':
        return (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '4px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#166534',
              fontWeight: 500
            }}>
              File Upload Field (Files uploaded in Create Order)
            </span>
          </div>
        );

      case 'link':
        return (
          <input
            type="url"
            placeholder="Enter URL"
            value={typeof spec.value === 'string' ? spec.value : spec.value?.url || ''}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );

      case 'refer':
        return (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '4px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#0369a1',
              fontWeight: 500
            }}>
              Reference Type (Feature coming soon)
            </span>
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={spec.value?.toString() || ''}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select option</option>
            {spec.dropdownOptions && spec.dropdownOptions.length > 0 ?
              spec.dropdownOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              )) :
              <option disabled>No options configured</option>
            }
          </select>
        );

      default:
        return (
          <input
            placeholder="Value"
            value={spec.value?.toString() || ''}
            onChange={(e) => updateDimension(index, "value", e.target.value)}
            style={{ flex: 1 }}
          />
        );
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading option specifications...
      </div>
    );
  }

  return (
    <div className="EditOptionSpec EditMachineType">
      {!showDetail && !loading && optionSpecs.length > 0 ? (
        <div className="editsectionsTable-container">
          {/* Page Title */}
          <h2 className="editsectionsTable-title">Option Specifications</h2>

          {/* Search Bar */}
          <div className="editsectionsTable-searchWrapper">
            <div className="editsectionsTable-searchBox">
              <input
                type="text"
                placeholder="Search by name, code, description, or option type..."
                value={searchTerm}
                className="editsectionsTable-searchInput"
                onChange={handleSearchChange}
              />
              <span className="editsectionsTable-searchIcon">Search</span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="editsectionsTable-clearButton"
                  title="Clear search"
                >
                  X
                </button>
              )}
            </div>
            <div className="editsectionsTable-countBadge">
              {filteredSpecs.length} of {optionSpecs.length} specs
            </div>
          </div>

          {/* Table */}
          {filteredSpecs.length > 0 ? (
            <div className="editsectionsTable-wrapper">
              <table className="editsectionsTable-table">
                <thead className="editsectionsTable-thead">
                  <tr>
                    <th className="editsectionsTable-th">No</th>
                    <th className="editsectionsTable-th">Option Spec</th>
                    <th className="editsectionsTable-th">Code</th>
                    <th className="editsectionsTable-th">Option Type</th>
                    <th className="editsectionsTable-th">Dimensions</th>
                    <th className="editsectionsTable-th">Branch</th>
                  </tr>
                </thead>
                <tbody className="editsectionsTable-tbody">
                  {filteredSpecs.map((item: any, index: number) => (
                    <tr
                      key={item._id}
                      className={`editsectionsTable-tr ${selectedRow === index ? "editsectionsTable-trSelected" : ""}`}
                      onClick={() => handleRowClick(index, item)}
                    >
                      <td className="editsectionsTable-td">{index + 1}</td>
                      <td className="editsectionsTable-td">{item.name}</td>
                      <td className="editsectionsTable-td">{item.code || 'N/A'}</td>
                      <td className="editsectionsTable-td">{getOptionTypeName(item.optionTypeId)}</td>
                      <td className="editsectionsTable-td">{item.specifications?.length || 0}</td>
                      <td className="editsectionsTable-td">{item.branchId?.name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="editsectionsTable-empty">
              No option specs found matching "<span>{searchTerm}</span>"
            </div>
          )}
        </div>
      ) : showDetail && editId ? (
        <div
          className="createOptionSpec-container"
          style={{
            maxWidth: '1400px',
            minHeight: 'auto',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {/* Header with Back and Delete buttons */}
          <div className="TopButtonEdit" style={{ marginBottom: '20px' }}>
            <button onClick={handleBackClick}>Back</button>
            <button onClick={handleDeleteClick} className="Delete" disabled={deleteState === 'loading'}>
              {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
            </button>
          </div>

          {/* Header Section */}
          <div className="createOptionSpec-header">
            <h1 className="createOptionSpec-title" style={{ margin: 0, border: 'none', padding: 0 }}>Edit Option Specification</h1>
            <p className="createOptionSpec-subtitle">Update specifications for your manufacturing options</p>
          </div>

          {/* Form Grid */}
          <div className="createOptionSpec-formGrid">
            {/* Basic Information Section */}
            <div className="createOptionSpec-section">
              <h3 className="createOptionSpec-sectionTitle">Basic Information</h3>

              <div className="createOptionSpec-formRow">
                <div className="createOptionSpec-formColumn">
                  <label className="createOptionSpec-label">Spec Name *</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="createOptionSpec-input"
                    placeholder="e.g., LDPE 500x300x50"
                  />
                </div>

                <div className="createOptionSpec-formColumn">
                  <label className="createOptionSpec-label">Spec Code</label>
                  <input
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="createOptionSpec-input"
                    placeholder="e.g., LDPE-500-300"
                  />
                </div>
              </div>

              <div className="createOptionSpec-formRow">
                <div className="createOptionSpec-formColumn">
                  <label className="createOptionSpec-label">Option Type</label>
                  <input
                    value={getOptionTypeName(editOptionTypeId)}
                    className="createOptionSpec-input"
                    disabled
                    style={{ background: '#f3f4f6' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '11px' }}>
                    Option type cannot be changed when editing
                  </small>
                </div>

                <div className="createOptionSpec-formColumn">
                  <label className="createOptionSpec-label">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="createOptionSpec-input"
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>
              </div>
            </div>

            {/* Reference Option Type Specifications Browser (Auto-populated) */}
            {editOptionTypeId && (
              <div className="createOptionSpec-formColumn">
                <div className="createOptionSpec-referenceBox" style={{ background: '#d1fae5', borderColor: '#10b981' }}>
                  <h3 className="createOptionSpec-referenceTitle" style={{ color: '#065f46' }}>
                    Option Type Specifications (Numbers Only)
                  </h3>
                  <p className="createOptionSpec-referenceText">
                    These are the <strong>number</strong> specifications from the selected Option Type. Use <code style={{ background: '#a7f3d0', padding: '2px 6px', borderRadius: '4px' }}>OT_</code> prefix in formulas.
                  </p>

                  {optionTypeSpecsData.length > 0 ? (
                    <div>
                      <div className="createOptionSpec-referenceLabel" style={{ marginBottom: '0.5rem' }}>
                        Available specifications from "{getOptionTypeName(editOptionTypeId)}" (click to insert):
                      </div>
                      <div className="createOptionSpec-dimensionTags">
                        {optionTypeSpecsData.map((spec, idx) => (
                          <span
                            key={idx}
                            className="createOptionSpec-dimensionTag"
                            onClick={() => insertIntoFormula('optionType_' + spec.name.replace(/\s+/g, '_'))}
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#d1fae5',
                              border: '1px solid #10b981'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#10b981';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#d1fae5';
                              e.currentTarget.style.color = '';
                              e.currentTarget.style.transform = '';
                            }}
                            title={`Click to insert "optionType_${spec.name.replace(/\s+/g, '_')}" into formula (Default value: ${spec.defaultValue}${spec.unit ? ' ' + spec.unit : ''})`}
                          >
                            <strong>optionType_{spec.name.replace(/\s+/g, '_')}</strong>
                            <span style={{
                              background: 'rgba(0,0,0,0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              = {spec.defaultValue}{spec.unit ? ` ${spec.unit}` : ''}
                            </span>
                          </span>
                        ))}
                      </div>
                      <div className="createOptionSpec-referenceHint" style={{ background: '#a7f3d0' }}>
                        <strong>How to use:</strong> Click on a formula field below, then click on any specification above to insert it.
                        <br />
                        <strong>Note:</strong> Use the <code style={{ background: '#6ee7b7', padding: '2px 6px', borderRadius: '4px' }}>OT_</code> prefix (e.g., <code style={{ background: '#6ee7b7', padding: '2px 6px', borderRadius: '4px' }}>OT_length</code>) to reference Option Type specs.
                      </div>
                    </div>
                  ) : (
                    <div className="createOptionSpec-referenceEmpty" style={{ background: '#a7f3d0' }}>
                      The selected Option Type has no number-type specifications. Only number specifications can be used in formulas.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reference OptionSpec Dimension Browser */}
            <div className="createOptionSpec-formColumn">
              <div className="createOptionSpec-referenceBox">
                <h3 className="createOptionSpec-referenceTitle">
                  Reference Other Option Spec Dimensions (Numbers Only)
                </h3>
                <p className="createOptionSpec-referenceText">
                  Select <strong>multiple</strong> Option Specs to see their <strong>number</strong> dimension names for use in formulas.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="createOptionSpec-referenceLabel">
                    Select Option Specs (Multiple):
                  </label>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '8px',
                    background: '#f9fafb'
                  }}>
                    {Array.isArray(optionSpecs) && optionSpecs.length > 0 ?
                      optionSpecs
                        .filter((spec: any) => spec._id !== editId) // Don't show current spec
                        .map((spec: any) => (
                          <label
                            key={spec._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 8px',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              marginBottom: '4px',
                              background: selectedReferenceSpecIds.includes(spec._id) ? '#dbeafe' : 'transparent',
                              border: selectedReferenceSpecIds.includes(spec._id) ? '1px solid #3b82f6' : '1px solid transparent'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedReferenceSpecIds.includes(spec._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedReferenceSpecIds([...selectedReferenceSpecIds, spec._id]);
                                } else {
                                  setSelectedReferenceSpecIds(selectedReferenceSpecIds.filter((id) => id !== spec._id));
                                }
                              }}
                            />
                            <span style={{ fontSize: '13px' }}>{spec.name} - {spec.code}</span>
                          </label>
                        )) :
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>No Option Specs available</p>
                    }
                  </div>
                  {selectedReferenceSpecIds.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669' }}>
                      {selectedReferenceSpecIds.length} Option Spec(s) selected
                    </div>
                  )}
                </div>

                {referenceDimensionData.length > 0 && (
                  <div>
                    <div className="createOptionSpec-referenceLabel" style={{ marginBottom: '0.5rem' }}>
                      Available dimensions from selected Option Specs (click to insert):
                    </div>
                    <div className="createOptionSpec-dimensionTags">
                      {referenceDimensionData.map((dim, idx) => {
                        const safeName = dim.name.replace(/\s+/g, '_');
                        return (
                          <span
                            key={idx}
                            className="createOptionSpec-dimensionTag"
                            onClick={() => insertIntoFormula(dim.name)}
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#3b82f6';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '';
                              e.currentTarget.style.color = '';
                              e.currentTarget.style.transform = '';
                            }}
                            title={`Click to insert "${safeName}" into formula (From: ${dim.sourceName}, Value: ${dim.value}${dim.unit ? ' ' + dim.unit : ''})`}
                          >
                            <strong>{safeName}</strong>
                            <span style={{
                              background: 'rgba(0,0,0,0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              = {dim.value}{dim.unit ? ` ${dim.unit}` : ''}
                            </span>
                            {dim.sourceName && (
                              <span style={{
                                background: '#dbeafe',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#1d4ed8'
                              }}>
                                {dim.sourceName}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                    <div className="createOptionSpec-referenceHint">
                      <strong>How to use:</strong> Click on a formula field below, then click on any dimension above to insert it.
                      For example: <code className="createOptionSpec-code">myValue / {referenceDimensionData[0]?.name?.replace(/\s+/g, '_') || 'dimension_name'}</code>
                      <br />
                      <strong>Values shown are from the selected Option Specs and will be used in formula calculations.</strong>
                    </div>
                  </div>
                )}

                {selectedReferenceSpecIds.length === 0 && (
                  <div className="createOptionSpec-referenceEmpty">
                    Select one or more Option Specs above to see available dimension names that you can use in formulas
                  </div>
                )}
              </div>
            </div>

            {/* Reference Option Name Dimension Browser */}
            <div className="createOptionSpec-formColumn">
              <div className="createOptionSpec-referenceBox" style={{ background: '#fef3c7', borderColor: '#fbbf24' }}>
                <h3 className="createOptionSpec-referenceTitle" style={{ color: '#b45309' }}>
                  Reference Option Name Dimensions (Numbers Only)
                </h3>
                <p className="createOptionSpec-referenceText">
                  Select <strong>multiple</strong> Options (Option Names) to see their <strong>number</strong> dimension names for use in formulas.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="createOptionSpec-referenceLabel">
                    Select Option Names (Multiple):
                  </label>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    padding: '8px',
                    background: '#fffbeb',
                    opacity: editOptionTypeId ? 1 : 0.5
                  }}>
                    {!editOptionTypeId ? (
                      <p style={{ color: '#92400e', fontSize: '12px', margin: 0 }}>No Option Type selected</p>
                    ) : (
                      <>
                        {Array.isArray(options) && options
                          .filter((option: any) => {
                            if (!editOptionTypeId) return false;
                            const optTypeId = typeof option.optionTypeId === 'string' ?
                              option.optionTypeId :
                              option.optionTypeId?._id || option.optionType?._id;
                            return optTypeId === editOptionTypeId;
                          })
                          .map((option: any) => (
                            <label
                              key={option._id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                marginBottom: '4px',
                                background: selectedReferenceOptionIds.includes(option._id) ? '#fef08a' : 'transparent',
                                border: selectedReferenceOptionIds.includes(option._id) ? '1px solid #f59e0b' : '1px solid transparent'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedReferenceOptionIds.includes(option._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedReferenceOptionIds([...selectedReferenceOptionIds, option._id]);
                                  } else {
                                    setSelectedReferenceOptionIds(selectedReferenceOptionIds.filter((id) => id !== option._id));
                                  }
                                }}
                              />
                              <span style={{ fontSize: '13px' }}>{option.name}</span>
                            </label>
                          ))}
                        {Array.isArray(options) && options.filter((option: any) => {
                          if (!editOptionTypeId) return false;
                          const optTypeId = typeof option.optionTypeId === 'string' ?
                            option.optionTypeId :
                            option.optionTypeId?._id || option.optionType?._id;
                          return optTypeId === editOptionTypeId;
                        }).length === 0 && (
                          <p style={{ color: '#92400e', fontSize: '12px', margin: 0 }}>No Options found for this Option Type</p>
                        )}
                      </>
                    )}
                  </div>
                  {selectedReferenceOptionIds.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#b45309' }}>
                      {selectedReferenceOptionIds.length} Option Name(s) selected
                    </div>
                  )}
                </div>

                {referenceOptionDimensionData.length > 0 && (
                  <div>
                    <div className="createOptionSpec-referenceLabel" style={{ marginBottom: '0.5rem' }}>
                      Available dimensions from selected Option Names (click to insert):
                    </div>
                    <div className="createOptionSpec-dimensionTags">
                      {referenceOptionDimensionData.map((dim, idx) => {
                        const safeName = dim.name.replace(/\s+/g, '_');
                        return (
                          <span
                            key={idx}
                            className="createOptionSpec-dimensionTag"
                            onClick={() => insertIntoFormula(dim.name)}
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#fef3c7',
                              border: '1px solid #fbbf24'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f59e0b';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fef3c7';
                              e.currentTarget.style.color = '';
                              e.currentTarget.style.transform = '';
                            }}
                            title={`Click to insert "${safeName}" into formula (From: ${dim.sourceName}, Value: ${dim.value}${dim.unit ? ' ' + dim.unit : ''})`}
                          >
                            <strong>{safeName}</strong>
                            <span style={{
                              background: 'rgba(0,0,0,0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              = {dim.value}{dim.unit ? ` ${dim.unit}` : ''}
                            </span>
                            {dim.sourceName && (
                              <span style={{
                                background: '#fef08a',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#92400e'
                              }}>
                                {dim.sourceName}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                    <div className="createOptionSpec-referenceHint" style={{ background: '#fef9c3' }}>
                      <strong>How to use:</strong> Click on a formula field below, then click on any dimension above to insert it.
                      <br />
                      <strong>Values shown are from the selected Option Names and will be used in formula calculations.</strong>
                    </div>
                  </div>
                )}

                {selectedReferenceOptionIds.length === 0 && (
                  <div className="createOptionSpec-referenceEmpty" style={{ background: '#fef9c3' }}>
                    Select one or more Option Names above to see available dimension names that you can use in formulas
                  </div>
                )}

                {selectedReferenceOptionIds.length > 0 && referenceOptionDimensionData.length === 0 && (
                  <div className="createOptionSpec-referenceEmpty" style={{ background: '#fef9c3' }}>
                    The selected Option Names have no number-type dimensions. Only number dimensions can be used in formulas.
                  </div>
                )}
              </div>
            </div>

            {/* Specifications Section */}
            <div className="createOptionSpec-section">
              <div className="createOptionSpec-dimensionsHeader">
                <h3 className="createOptionSpec-sectionTitle" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Specifications</h3>
                <button
                  onClick={addDimension}
                  className="createOptionSpec-addDimensionBtn"
                >
                  + Add Dimension
                </button>
              </div>

              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="createOptionSpec-dimensionRow"
                  style={{
                    backgroundColor: spec.isCalculated ? '#e8f5e9' : 'transparent',
                    marginBottom: '16px'
                  }}
                >
                  {/* Main dimension row */}
                  <div className="createOptionSpec-dimensionFields" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      placeholder="Name"
                      value={spec.name}
                      onChange={(e) => updateDimension(index, "name", e.target.value)}
                      style={{ flex: 1 }}
                    />

                    {renderValueInput(spec, index)}

                    {spec.dataType === 'number' && (
                      <select
                        value={spec.unit || ""}
                        onChange={(e) => updateDimension(index, "unit", e.target.value)}
                        style={{ width: '80px' }}
                      >
                        <option value="">Unit</option>
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="m">m</option>
                        <option value="inch">inch</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="mL">mL</option>
                        <option value="pcs">pcs</option>
                        <option value="%">%</option>
                        <option value="C">C</option>
                      </select>
                    )}

                    <select
                      value={spec.dataType}
                      onChange={(e) => updateDimension(index, "dataType", e.target.value as Specification["dataType"])}
                      style={{ width: '100px' }}
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                      <option value="file">File</option>
                      <option value="link">Link</option>
                      <option value="refer">Refer</option>
                      <option value="dropdown">Dropdown</option>
                    </select>

                    {/* Include in Total toggle - only for number type */}
                    {spec.dataType === 'number' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <label style={{ fontSize: '12px', whiteSpace: 'nowrap' }} title="Include this field in totals row">
                          Total:
                        </label>
                        <input
                          type="checkbox"
                          checked={spec.includeInTotal !== false}
                          onChange={(e) => updateDimension(index, "includeInTotal", e.target.checked)}
                          title="Include this field in totals row"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => removeDimension(index)}
                      className="createOptionSpec-removeDimensionBtn"
                    >
                      X
                    </button>
                  </div>

                  {/* Formula field - only for number type */}
                  {spec.dataType === 'number' && (
                    <div className="createOptionSpec-formulaRow">
                      <span className="createOptionSpec-formulaLabel">Formula:</span>
                      <input
                        placeholder="e.g., length * width (leave empty for manual value)"
                        value={spec.formula || ""}
                        onChange={(e) => updateDimension(index, "formula", e.target.value)}
                        onFocus={() => setActiveFormulaIndex(index)}
                        className="createOptionSpec-formulaInput"
                        style={{
                          borderColor: activeFormulaIndex === index ? '#3b82f6' : undefined,
                          boxShadow: activeFormulaIndex === index ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : undefined
                        }}
                      />
                      {spec.isCalculated && (
                        <span className="createOptionSpec-formulaBadge">
                          Auto
                        </span>
                      )}
                    </div>
                  )}

                  {/* Visible Toggle Row */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    marginTop: '8px',
                    padding: '10px 12px',
                    background: '#f0fdf4',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={spec.visible !== false}
                        onChange={(e) => updateDimension(index, "visible", e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: spec.visible !== false ? '#059669' : '#6b7280' }}>
                        Visible
                      </span>
                    </label>
                  </div>

                  {/* Dropdown options configuration - only for dropdown type */}
                  {spec.dataType === 'dropdown' && (
                    <div style={{ marginTop: '8px', padding: '12px', background: '#f0fdf4', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500 }}>Dropdown Options:</label>
                        <button
                          onClick={() => {
                            const updated = [...specifications];
                            if (!updated[index].dropdownOptions) {
                              updated[index].dropdownOptions = [];
                            }
                            updated[index].dropdownOptions!.push('');
                            setSpecifications(updated);
                          }}
                          style={{
                            padding: '4px 10px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          + Add Option
                        </button>
                      </div>

                      {spec.dropdownOptions && spec.dropdownOptions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {spec.dropdownOptions.map((option, optIdx) => (
                            <div key={optIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <input
                                placeholder={`Option ${optIdx + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const updated = [...specifications];
                                  updated[index].dropdownOptions![optIdx] = e.target.value;
                                  setSpecifications(updated);
                                }}
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}
                              />
                              <button
                                onClick={() => {
                                  const updated = [...specifications];
                                  updated[index].dropdownOptions = updated[index].dropdownOptions!.filter((_, i) => i !== optIdx);
                                  setSpecifications(updated);
                                }}
                                style={{
                                  padding: '4px 8px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px'
                                }}
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                          No options added. Click "+ Add Option" to add dropdown choices.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {specifications.length === 0 && (
                <p className="createOptionSpec-emptyState">
                  No specifications added. Click "+ Add Dimension" to start.
                </p>
              )}

              {/* Enhanced Total Row with Formula Support */}
              {specifications.length > 0 && specifications.some((s) => s.dataType === 'number' && s.includeInTotal !== false) && (
                <div style={{
                  marginTop: '24px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '8px',
                  border: '2px solid #f59e0b'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <strong style={{ fontSize: '16px', color: '#78350f' }}>TOTALS ROW</strong>
                    <span style={{ fontSize: '12px', color: '#92400e' }}>
                      (Type formulas: SUM, AVERAGE, MAX, MIN, COUNT, or custom like (SUM+MAX)/2)
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px'
                  }}>
                    {specifications
                      .filter((s) => s.dataType === 'number' && s.includeInTotal !== false)
                      .map((spec) => {
                        const values = [Number(spec.value) || 0];
                        const formula = spec.totalFormula || 'SUM';
                        const result = evaluateTotalFormula(formula, values);

                        return (
                          <div key={spec.name} style={{
                            background: 'white',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #fbbf24'
                          }}>
                            <label style={{
                              display: 'block',
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#92400e',
                              marginBottom: '8px'
                            }}>
                              {spec.name} {spec.unit && `(${spec.unit})`}
                            </label>

                            <input
                              type="text"
                              placeholder="e.g., SUM, AVERAGE, MAX"
                              value={formula}
                              onChange={(e) => updateDimension(
                                specifications.findIndex((s) => s.name === spec.name),
                                "totalFormula",
                                e.target.value
                              )}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid #d97706',
                                borderRadius: '4px',
                                fontSize: '12px',
                                marginBottom: '8px',
                                fontFamily: 'monospace'
                              }}
                              title="Enter formula: SUM, AVERAGE, MAX, MIN, COUNT, or custom like (SUM+MAX)/2"
                            />

                            <div style={{
                              padding: '10px',
                              background: typeof result === 'number' ? '#dcfce7' : '#fee2e2',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '16px',
                              fontWeight: '700',
                              color: typeof result === 'number' ? '#166534' : '#991b1b'
                            }}>
                              {typeof result === 'number' ? result.toFixed(2) : result}
                              {typeof result === 'number' && spec.unit && ` ${spec.unit}`}
                            </div>

                            <div style={{
                              fontSize: '11px',
                              color: '#78350f',
                              marginTop: '6px',
                              textAlign: 'center'
                            }}>
                              Current value: {(Number(spec.value) || 0).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#78350f'
                  }}>
                    <strong>Tip:</strong> Use the "Total" checkbox next to each number field to include/exclude it from this totals section.
                    When using formulas, they operate on the current specification values above.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="createOptionSpec-formActions">
            <button
              onClick={handleEditSave}
              disabled={updateState === 'loading'}
              className="createOptionSpec-button"
              style={{ opacity: updateState === 'loading' ? 0.7 : 1, transition: "all 0.2s ease" }}
            >
              {updateState === 'loading' ? "Saving..." : "Save Option Spec"}
            </button>
          </div>

          {/* Reference Popup - Select dimension to reference */}
          {referencePopupIndex !== null && (
            <div className="popup-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="popup" style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}>
                <div className="popup-content">
                  <h3 style={{ marginTop: 0 }}>Select Dimension to Reference</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                    Choose which dimension this "{specifications[referencePopupIndex]?.name}" should reference
                  </p>

                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {specifications
                      .filter((s, idx) => idx !== referencePopupIndex)
                      .map((spec, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            updateDimension(referencePopupIndex, "referenceTo", spec.name);
                            setReferencePopupIndex(null);
                          }}
                          style={{
                            padding: '12px 16px',
                            marginBottom: '8px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dbeafe';
                            e.currentTarget.style.borderColor = '#3b82f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <div style={{ fontWeight: 500, fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>
                            {spec.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Type: {spec.dataType} {spec.unit && `| Unit: ${spec.unit}`}
                          </div>
                        </div>
                      ))}

                    {specifications.filter((s, idx) => idx !== referencePopupIndex).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No other dimensions available to reference. Add more dimensions first.
                      </div>
                    )}
                  </div>

                  <div className="popupButtons" style={{ marginTop: '20px' }}>
                    <button onClick={() => setReferencePopupIndex(null)} className="createOptionSpec-cancelBtn">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        !loading && <p>No option specs available.</p>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{confirmDialog.title}</h3>
            <p style={{ marginBottom: '24px', color: '#666' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeConfirmDialog}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#dc2626',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditOptionSpecList;
