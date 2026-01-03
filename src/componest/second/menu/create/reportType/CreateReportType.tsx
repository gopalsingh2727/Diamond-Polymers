import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createReportType,
  updateReportType,
  deleteReportType,
  getReportTypes
} from "../../../../redux/create/reportType/reportTypeActions";
import { getOrderTypes } from "../../../../redux/create/orderType/orderTypeActions";
import { getOptionTypes } from "../../../../redux/option/optionTypeActions";
import { getOptions } from "../../../../redux/option/optionActions";
import { getMachines } from "../../../../redux/create/machine/MachineActions";
import { listOperators } from "../../../../redux/create/CreateMachineOpertor/MachineOpertorActions";
import { getCustomerCategories } from "../../../../redux/create/customerCategory/CustomerCategoryActions";
import { getCustomerParentCompanies } from "../../../../redux/create/customerParentCompany/CustomerParentCompanyActions";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import "../orderType/orderType.css";

// Report Categories
const REPORT_CATEGORIES = [
  { value: 'customer', label: 'Customer Reports' },
  { value: 'order', label: 'Order Reports' },
  { value: 'sales', label: 'Sales/Quantity Reports' },
  { value: 'production', label: 'Production Reports' },
  { value: 'custom', label: 'Custom Reports' }
];

// Date Filter Options
const DATE_FILTER_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

// Formula Options
const FORMULA_OPTIONS = [
  { value: 'SUM', label: 'Sum' },
  { value: 'AVG', label: 'Average' },
  { value: 'COUNT', label: 'Count' },
  { value: 'MIN', label: 'Minimum' },
  { value: 'MAX', label: 'Maximum' },
  { value: 'CUSTOM', label: 'Custom Expression' }
];

// Graph Types
const GRAPH_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'donut', label: 'Donut Chart' }
];

// Order Status Options
const ORDER_STATUSES = [
  'pending', 'in_progress', 'completed', 'dispatched', 'cancelled', 'on_hold'
];

// Available calculation fields
const CALCULATION_FIELDS = [
  { value: 'options.quantity', label: 'Option Quantity' },
  { value: 'options.specificationValues.Weight', label: 'Weight' },
  { value: 'machineTableData.totals', label: 'Machine Totals' },
  { value: 'orderCount', label: 'Order Count' },
  { value: 'customerCount', label: 'Customer Count' }
];

// Default columns for report data view
const DEFAULT_COLUMNS = [
  { key: 'orderId', label: 'Order ID', dataType: 'string', visible: true, order: 1 },
  { key: 'customerName', label: 'Customer', dataType: 'string', visible: true, order: 2 },
  { key: 'orderDate', label: 'Date', dataType: 'date', visible: true, order: 3 },
  { key: 'quantity', label: 'Quantity', dataType: 'number', visible: true, order: 4 },
  { key: 'status', label: 'Status', dataType: 'string', visible: true, order: 5 },
  { key: 'weight', label: 'Weight', dataType: 'number', visible: false, order: 6 },
  { key: 'machine', label: 'Machine', dataType: 'string', visible: false, order: 7 },
  { key: 'operator', label: 'Operator', dataType: 'string', visible: false, order: 8 }
];

interface Calculation {
  name: string;
  field: string;
  formula: string;
  customExpression?: string;
  unit?: string;
  showInSummary: boolean;
}

interface Graph {
  name: string;
  type: string;
  xAxis: { field: string; groupBy: string; label: string };
  yAxis: { field: string; formula: string; label: string };
  zAxis?: { field: string; label: string };
  colors: string[];
  showLegend: boolean;
}

interface Column {
  key: string;
  label: string;
  dataType: string;
  visible: boolean;
  order: number;
}

interface CreateReportTypeProps {
  initialData?: any;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

const CreateReportType: React.FC<CreateReportTypeProps> = ({
  initialData: propInitialData,
  onCancel,
  onSaveSuccess
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Edit mode detection
  const { reportTypeData: locationData, isEdit } = location.state || {};
  const reportTypeData = propInitialData || locationData;
  const editMode = Boolean(propInitialData || isEdit || (reportTypeData && reportTypeData._id));
  const reportTypeId = reportTypeData?._id;

  // Wizard step state
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    'Basic Info',
    'Customer Filter',
    'Order Type Filter',
    'Option Filter',
    'Machine Filter',
    'Operator Filter',
    'Date & Status',
    'Calculations',
    'Graphs',
    'Columns'
  ];

  // Basic Information
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [description, setDescription] = useState("");
  const [reportCategory, setReportCategory] = useState("order");

  // Customer Filter
  const [customerFilterType, setCustomerFilterType] = useState<'all' | 'category' | 'parentCompany' | 'specific'>('all');
  const [selectedCustomerCategories, setSelectedCustomerCategories] = useState<string[]>([]);
  const [selectedParentCompanies, setSelectedParentCompanies] = useState<string[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // Order Type Filter
  const [orderTypeFilterType, setOrderTypeFilterType] = useState<'all' | 'specific'>('all');
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([]);

  // Option Filter
  const [selectedOptionTypes, setSelectedOptionTypes] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedOptionCategories, setSelectedOptionCategories] = useState<string[]>([]);

  // Machine Filter
  const [machineFilterType, setMachineFilterType] = useState<'all' | 'specific'>('all');
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  // Operator Filter
  const [operatorFilterType, setOperatorFilterType] = useState<'all' | 'specific'>('all');
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);

  // Date Filter
  const [dateFilterType, setDateFilterType] = useState('thisMonth');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  // Status Filter
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Calculations
  const [calculations, setCalculations] = useState<Calculation[]>([]);

  // Graphs
  const [graphs, setGraphs] = useState<Graph[]>([]);

  // Columns
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);

  // Global/Default Settings
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  // Get user role
  const userRole = useSelector((state: any) => state.auth?.userData?.role);

  // Get data from Redux
  const rawOrderTypes = useSelector((state: any) => state.v2.orderType?.list);
  const orderTypes = Array.isArray(rawOrderTypes) ? rawOrderTypes : [];
  const rawOptionTypes = useSelector((state: any) => state.v2.optionType?.list);
  const optionTypes = Array.isArray(rawOptionTypes) ? rawOptionTypes : [];
  const rawOptions = useSelector((state: any) => state.v2.option?.list);
  const options = Array.isArray(rawOptions) ? rawOptions : [];
  const rawMachines = useSelector((state: any) => state.v2.machine?.list);
  const machines = Array.isArray(rawMachines) ? rawMachines : [];
  const rawOperators = useSelector((state: any) => state.v2.operator?.list);
  const operators = Array.isArray(rawOperators) ? rawOperators : [];
  const rawCustomerCategories = useSelector((state: any) => state.v2.customerCategory?.list);
  const customerCategories = Array.isArray(rawCustomerCategories) ? rawCustomerCategories : [];
  const rawParentCompanies = useSelector((state: any) => state.v2.parentCompany?.list);
  const parentCompanies = Array.isArray(rawParentCompanies) ? rawParentCompanies : [];

  // Fetch data on mount
  useEffect(() => {
    dispatch(getOrderTypes());
    dispatch(getOptionTypes());
    dispatch(getOptions());
    dispatch(getMachines());
    dispatch(listOperators());
    dispatch(getCustomerCategories());
    dispatch(getCustomerParentCompanies());
  }, [dispatch]);

  // Handle back navigation
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
    if (editMode && reportTypeData) {
      setTypeName(reportTypeData.typeName || "");
      setTypeCode(reportTypeData.typeCode || "");
      setDescription(reportTypeData.description || "");
      setReportCategory(reportTypeData.reportCategory || "order");

      // Customer Filter
      if (reportTypeData.filters?.customerFilter) {
        const cf = reportTypeData.filters.customerFilter;
        setCustomerFilterType(cf.type || 'all');
        setSelectedCustomerCategories(cf.categoryIds || []);
        setSelectedParentCompanies(cf.parentCompanyIds || []);
        setSelectedCustomerIds(cf.customerIds || []);
      }

      // Order Type Filter
      if (reportTypeData.filters?.orderTypeFilter) {
        const otf = reportTypeData.filters.orderTypeFilter;
        setOrderTypeFilterType(otf.type || 'all');
        setSelectedOrderTypes(otf.orderTypeIds || []);
      }

      // Option Filter
      if (reportTypeData.filters?.optionFilter) {
        const of = reportTypeData.filters.optionFilter;
        setSelectedOptionTypes(of.optionTypeIds || []);
        setSelectedOptions(of.optionIds || []);
        setSelectedOptionCategories(of.categories || []);
      }

      // Machine Filter
      if (reportTypeData.filters?.machineFilter) {
        const mf = reportTypeData.filters.machineFilter;
        setMachineFilterType(mf.type || 'all');
        setSelectedMachines(mf.machineIds || []);
      }

      // Operator Filter
      if (reportTypeData.filters?.operatorFilter) {
        const opf = reportTypeData.filters.operatorFilter;
        setOperatorFilterType(opf.type || 'all');
        setSelectedOperators(opf.operatorIds || []);
      }

      // Date Filter
      if (reportTypeData.filters?.dateFilter) {
        const df = reportTypeData.filters.dateFilter;
        setDateFilterType(df.type || 'thisMonth');
        setCustomDateFrom(df.customFrom || '');
        setCustomDateTo(df.customTo || '');
      }

      // Status Filter
      setSelectedStatuses(reportTypeData.filters?.statusFilter || []);

      // Calculations
      setCalculations(reportTypeData.calculations || []);

      // Graphs
      setGraphs(reportTypeData.graphs || []);

      // Columns
      if (reportTypeData.columns && reportTypeData.columns.length > 0) {
        setColumns(reportTypeData.columns);
      }

      // Settings
      setIsGlobal(reportTypeData.isGlobal || false);
      setIsDefault(reportTypeData.isDefault || false);
      setIsActive(reportTypeData.isActive !== false);
    }
  }, [editMode, reportTypeData]);

  // Add calculation
  const addCalculation = () => {
    setCalculations([...calculations, {
      name: '',
      field: CALCULATION_FIELDS[0].value,
      formula: 'SUM',
      unit: '',
      showInSummary: true
    }]);
  };

  // Remove calculation
  const removeCalculation = (index: number) => {
    setCalculations(calculations.filter((_, i) => i !== index));
  };

  // Update calculation
  const updateCalculation = (index: number, field: keyof Calculation, value: any) => {
    const updated = [...calculations];
    updated[index] = { ...updated[index], [field]: value };
    setCalculations(updated);
  };

  // Add graph
  const addGraph = () => {
    setGraphs([...graphs, {
      name: '',
      type: 'bar',
      xAxis: { field: 'createdAt', groupBy: 'month', label: 'Month' },
      yAxis: { field: 'orderCount', formula: 'COUNT', label: 'Orders' },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      showLegend: true
    }]);
  };

  // Remove graph
  const removeGraph = (index: number) => {
    setGraphs(graphs.filter((_, i) => i !== index));
  };

  // Update graph
  const updateGraph = (index: number, updates: Partial<Graph>) => {
    const updated = [...graphs];
    updated[index] = { ...updated[index], ...updates };
    setGraphs(updated);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (key: string) => {
    setColumns(columns.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit
  const handleSubmit = () => {
    if (!typeName.trim() || !typeCode.trim()) {
      toast.error("Validation Error", "Please fill all required fields: Type Name and Type Code");
      return;
    }

    const dataToSave = {
      typeName,
      typeCode: typeCode.toUpperCase(),
      description,
      reportCategory,
      filters: {
        customerFilter: {
          type: customerFilterType,
          categoryIds: selectedCustomerCategories,
          parentCompanyIds: selectedParentCompanies,
          customerIds: selectedCustomerIds
        },
        orderTypeFilter: {
          type: orderTypeFilterType,
          orderTypeIds: selectedOrderTypes
        },
        optionFilter: {
          optionTypeIds: selectedOptionTypes,
          optionIds: selectedOptions,
          categories: selectedOptionCategories
        },
        machineFilter: {
          type: machineFilterType,
          machineIds: selectedMachines
        },
        operatorFilter: {
          type: operatorFilterType,
          operatorIds: selectedOperators
        },
        dateFilter: {
          type: dateFilterType,
          customFrom: customDateFrom || undefined,
          customTo: customDateTo || undefined
        },
        statusFilter: selectedStatuses
      },
      calculations,
      graphs,
      columns,
      isGlobal,
      isDefault,
      isActive
    };

    if (editMode && reportTypeId) {
      handleSave(
        () => dispatch(updateReportType(reportTypeId, dataToSave)),
        {
          successMessage: "Report type updated successfully!",
          onSuccess: () => {
            setTimeout(() => {
              if (onSaveSuccess) {
                onSaveSuccess();
              } else {
                navigate(-1);
              }
            }, 1500);
          }
        }
      );
    } else {
      handleSave(
        () => dispatch(createReportType(dataToSave)),
        {
          successMessage: "Report type created successfully!",
          onSuccess: () => {
            // Reset form
            setTypeName("");
            setTypeCode("");
            setDescription("");
            setReportCategory("order");
            setCustomerFilterType('all');
            setSelectedCustomerCategories([]);
            setSelectedParentCompanies([]);
            setSelectedCustomerIds([]);
            setOrderTypeFilterType('all');
            setSelectedOrderTypes([]);
            setSelectedOptionTypes([]);
            setSelectedOptions([]);
            setSelectedOptionCategories([]);
            setMachineFilterType('all');
            setSelectedMachines([]);
            setOperatorFilterType('all');
            setSelectedOperators([]);
            setDateFilterType('thisMonth');
            setCustomDateFrom('');
            setCustomDateTo('');
            setSelectedStatuses([]);
            setCalculations([]);
            setGraphs([]);
            setColumns(DEFAULT_COLUMNS);
            setIsGlobal(false);
            setIsDefault(false);
            setCurrentStep(0);
          }
        }
      );
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!reportTypeId) return;

    setDeleting(true);
    try {
      await dispatch(deleteReportType(reportTypeId));
      toast.success('Deleted', 'Report type deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete report type');
    } finally {
      setDeleting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">Basic Information</h3>

            <div className="orderTypeFormRow">
              <div className="orderTypeFormColumn">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <label className="orderTypeInputLabel">Report Name *</label>
                  <FieldTooltip content="Name of this report type" position="right" />
                </div>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="orderTypeFormInput"
                  placeholder="e.g., Monthly Sales Report"
                  required
                />
              </div>

              <div className="orderTypeFormColumn">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <label className="orderTypeInputLabel">Report Code *</label>
                  <FieldTooltip content="Short code for this report" position="right" />
                </div>
                <input
                  type="text"
                  value={typeCode}
                  onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
                  className="orderTypeFormInput"
                  placeholder="e.g., MONTHLY_SALES"
                  maxLength={20}
                  required
                />
              </div>
            </div>

            <div className="orderTypeFormRow">
              <div className="orderTypeFormColumn">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <label className="orderTypeInputLabel">Report Category</label>
                  <FieldTooltip content="Category of report" position="right" />
                </div>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="orderTypeFormInput"
                >
                  {REPORT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="orderTypeFormColumn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <label className="orderTypeInputLabel">Description</label>
                <FieldTooltip content="Describe this report type" position="right" />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="orderTypeFormTextarea"
                placeholder="Describe this report..."
                rows={3}
              />
            </div>
          </div>
        );

      case 1: // Customer Filter
        return (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">Customer Filter</h3>

            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Filter By</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {['all', 'category', 'parentCompany', 'specific'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCustomerFilterType(type as any)}
                    style={{
                      padding: '8px 16px',
                      background: customerFilterType === type ? '#3b82f6' : '#e5e7eb',
                      color: customerFilterType === type ? 'white' : '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {type === 'all' ? 'All Customers' :
                      type === 'category' ? 'By Category' :
                        type === 'parentCompany' ? 'By Parent Company' : 'Specific Customers'}
                  </button>
                ))}
              </div>
            </div>

            {customerFilterType === 'category' && (
              <div className="orderTypeFormColumn" style={{ marginTop: '16px' }}>
                <label className="orderTypeInputLabel">Select Categories</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {customerCategories.map((cat: any) => (
                    <label key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedCustomerCategories.includes(cat._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomerCategories([...selectedCustomerCategories, cat._id]);
                          } else {
                            setSelectedCustomerCategories(selectedCustomerCategories.filter(id => id !== cat._id));
                          }
                        }}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {customerFilterType === 'parentCompany' && (
              <div className="orderTypeFormColumn" style={{ marginTop: '16px' }}>
                <label className="orderTypeInputLabel">Select Parent Companies</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {parentCompanies.map((pc: any) => (
                    <label key={pc._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedParentCompanies.includes(pc._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParentCompanies([...selectedParentCompanies, pc._id]);
                          } else {
                            setSelectedParentCompanies(selectedParentCompanies.filter(id => id !== pc._id));
                          }
                        }}
                      />
                      {pc.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Order Type Filter
        return (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">Order Type Filter</h3>

            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Filter By</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setOrderTypeFilterType('all')}
                  style={{
                    padding: '8px 16px',
                    background: orderTypeFilterType === 'all' ? '#3b82f6' : '#e5e7eb',
                    color: orderTypeFilterType === 'all' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  All Order Types
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTypeFilterType('specific')}
                  style={{
                    padding: '8px 16px',
                    background: orderTypeFilterType === 'specific' ? '#3b82f6' : '#e5e7eb',
                    color: orderTypeFilterType === 'specific' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Specific Order Types
                </button>
              </div>
            </div>

            {orderTypeFilterType === 'specific' && (
              <div className="orderTypeFormColumn" style={{ marginTop: '16px' }}>
                <label className="orderTypeInputLabel">Select Order Types</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {orderTypes.map((ot: any) => (
                    <label key={ot._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                      <input
                        type="checkbox"
                        checked={selectedOrderTypes.includes(ot._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrderTypes([...selectedOrderTypes, ot._id]);
                          } else {
                            setSelectedOrderTypes(selectedOrderTypes.filter(id => id !== ot._id));
                          }
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 500 }}>{ot.typeName}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{ot.typeCode}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Option Filter
        return (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">Option Filter</h3>

            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Select Option Types</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                {optionTypes.map((ot: any) => (
                  <label key={ot._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    <input
                      type="checkbox"
                      checked={selectedOptionTypes.includes(ot._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOptionTypes([...selectedOptionTypes, ot._id]);
                        } else {
                          setSelectedOptionTypes(selectedOptionTypes.filter(id => id !== ot._id));
                        }
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 500 }}>{ot.typeName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{ot.typeCode}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="orderTypeFormColumn" style={{ marginTop: '16px' }}>
              <label className="orderTypeInputLabel">Option Categories</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                {['product', 'material', 'printing', 'packaging'].map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedOptionCategories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOptionCategories([...selectedOptionCategories, cat]);
                        } else {
                          setSelectedOptionCategories(selectedOptionCategories.filter(c => c !== cat));
                        }
                      }}
                    />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Machine Filter
        return (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">Machine Filter</h3>

            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Filter By</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMachineFilterType('all')}
                  style={{
                    padding: '8px 16px',
                    background: machineFilterType === 'all' ? '#3b82f6' : '#e5e7eb',
                    color: machineFilterType === 'all' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  All Machines
                </button>
                <button
                  type="button"
                  onClick={() => setMachineFilterType('specific')}
                  style={{
                    padding: '8px 16px',
                    background: machineFilterType === 'specific' ? '#3b82f6' : '#e5e7eb',
                    color: machineFilterType === 'specific' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Specific Machines
                </button>
              </div>
            </div>

            {machineFilterType === 'specific' && (
              <div className="orderTypeFormColumn" style={{ marginTop: '16px' }}>
                <label className="orderTypeInputLabel">Select Machines</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {machines.map((m: any) => (
                    <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                      <input
                        type="checkbox"
                        checked={selectedMachines.includes(m._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMachines([...selectedMachines, m._id]);
                          } else {
                            setSelectedMachines(selectedMachines.filter(id => id !== m._id));
                          }
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 500 }}>{m.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{m.machineType?.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 5: // Operator Filter
        return (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">Operator Filter</h3>

            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Filter By</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setOperatorFilterType('all')}
                  style={{
                    padding: '8px 16px',
                    background: operatorFilterType === 'all' ? '#3b82f6' : '#e5e7eb',
                    color: operatorFilterType === 'all' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  All Operators
                </button>
                <button
                  type="button"
                  onClick={() => setOperatorFilterType('specific')}
                  style={{
                    padding: '8px 16px',
                    background: operatorFilterType === 'specific' ? '#3b82f6' : '#e5e7eb',
                    color: operatorFilterType === 'specific' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Specific Operators
                </button>
              </div>
            </div>

            {operatorFilterType === 'specific' && (
              <div className="orderTypeFormColumn" style={{ marginTop: '16px' }}>
                <label className="orderTypeInputLabel">Select Operators</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {operators.map((op: any) => (
                    <label key={op._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                      <input
                        type="checkbox"
                        checked={selectedOperators.includes(op._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOperators([...selectedOperators, op._id]);
                          } else {
                            setSelectedOperators(selectedOperators.filter(id => id !== op._id));
                          }
                        }}
                      />
                      {op.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 6: // Date & Status Filter
        return (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">Date & Status Filter</h3>

            <div className="orderTypeFormColumn">
              <label className="orderTypeInputLabel">Date Range</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                {DATE_FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDateFilterType(opt.value)}
                    style={{
                      padding: '8px 16px',
                      background: dateFilterType === opt.value ? '#3b82f6' : '#e5e7eb',
                      color: dateFilterType === opt.value ? 'white' : '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {dateFilterType === 'custom' && (
              <div className="orderTypeFormRow" style={{ marginTop: '16px' }}>
                <div className="orderTypeFormColumn">
                  <label className="orderTypeInputLabel">From Date</label>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="orderTypeFormInput"
                  />
                </div>
                <div className="orderTypeFormColumn">
                  <label className="orderTypeInputLabel">To Date</label>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="orderTypeFormInput"
                  />
                </div>
              </div>
            )}

            <div className="orderTypeFormColumn" style={{ marginTop: '24px' }}>
              <label className="orderTypeInputLabel">Order Status Filter</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                {ORDER_STATUSES.map(status => (
                  <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStatuses([...selectedStatuses, status]);
                        } else {
                          setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                        }
                      }}
                    />
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </label>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                Leave empty to include all statuses
              </p>
            </div>
          </div>
        );

      case 7: // Calculations
        return (
          <div className="orderTypeSection">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="orderTypeSectionTitle" style={{ marginBottom: 0 }}>Calculations</h3>
              <button
                type="button"
                onClick={addCalculation}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                + Add Calculation
              </button>
            </div>

            {calculations.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
                No calculations configured. Click "Add Calculation" to create one.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {calculations.map((calc, index) => (
                  <div key={index} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 600 }}>Calculation #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeCalculation(index)}
                        style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="orderTypeFormRow">
                      <div className="orderTypeFormColumn">
                        <label className="orderTypeInputLabel">Name</label>
                        <input
                          type="text"
                          value={calc.name}
                          onChange={(e) => updateCalculation(index, 'name', e.target.value)}
                          className="orderTypeFormInput"
                          placeholder="e.g., Total Weight"
                        />
                      </div>
                      <div className="orderTypeFormColumn">
                        <label className="orderTypeInputLabel">Field</label>
                        <select
                          value={calc.field}
                          onChange={(e) => updateCalculation(index, 'field', e.target.value)}
                          className="orderTypeFormInput"
                        >
                          {CALCULATION_FIELDS.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="orderTypeFormRow" style={{ marginTop: '12px' }}>
                      <div className="orderTypeFormColumn">
                        <label className="orderTypeInputLabel">Formula</label>
                        <select
                          value={calc.formula}
                          onChange={(e) => updateCalculation(index, 'formula', e.target.value)}
                          className="orderTypeFormInput"
                        >
                          {FORMULA_OPTIONS.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="orderTypeFormColumn">
                        <label className="orderTypeInputLabel">Unit</label>
                        <input
                          type="text"
                          value={calc.unit || ''}
                          onChange={(e) => updateCalculation(index, 'unit', e.target.value)}
                          className="orderTypeFormInput"
                          placeholder="e.g., kg, pcs"
                        />
                      </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={calc.showInSummary}
                        onChange={(e) => updateCalculation(index, 'showInSummary', e.target.checked)}
                      />
                      Show in summary
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 8: // Graphs
        return (
          <div className="orderTypeSection">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="orderTypeSectionTitle" style={{ marginBottom: 0 }}>Graphs</h3>
              <button
                type="button"
                onClick={addGraph}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                + Add Graph
              </button>
            </div>

            {graphs.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
                No graphs configured. Click "Add Graph" to create one.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {graphs.map((graph, index) => (
                  <div key={index} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 600 }}>Graph #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeGraph(index)}
                        style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="orderTypeFormRow">
                      <div className="orderTypeFormColumn">
                        <label className="orderTypeInputLabel">Name</label>
                        <input
                          type="text"
                          value={graph.name}
                          onChange={(e) => updateGraph(index, { name: e.target.value })}
                          className="orderTypeFormInput"
                          placeholder="e.g., Monthly Orders"
                        />
                      </div>
                      <div className="orderTypeFormColumn">
                        <label className="orderTypeInputLabel">Graph Type</label>
                        <select
                          value={graph.type}
                          onChange={(e) => updateGraph(index, { type: e.target.value })}
                          className="orderTypeFormInput"
                        >
                          {GRAPH_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="orderTypeFormRow" style={{ marginTop: '12px' }}>
                      <div className="orderTypeFormColumn">
                        <label className="orderTypeInputLabel">X-Axis Label</label>
                        <input
                          type="text"
                          value={graph.xAxis.label}
                          onChange={(e) => updateGraph(index, { xAxis: { ...graph.xAxis, label: e.target.value } })}
                          className="orderTypeFormInput"
                          placeholder="e.g., Month"
                        />
                      </div>
                      <div className="orderTypeFormColumn">
                        <label className="orderTypeInputLabel">Y-Axis Label</label>
                        <input
                          type="text"
                          value={graph.yAxis.label}
                          onChange={(e) => updateGraph(index, { yAxis: { ...graph.yAxis, label: e.target.value } })}
                          className="orderTypeFormInput"
                          placeholder="e.g., Orders"
                        />
                      </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={graph.showLegend}
                        onChange={(e) => updateGraph(index, { showLegend: e.target.checked })}
                      />
                      Show Legend
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 9: // Columns
        return (
          <div className="orderTypeSection">
            <h3 className="orderTypeSectionTitle">Data View Columns</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {columns.map(col => (
                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: col.visible ? '#eff6ff' : 'white' }}>
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => toggleColumnVisibility(col.key)}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{col.label}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{col.dataType}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Advanced Settings */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>Advanced Settings</h4>

              <div className="orderTypeCheckboxGrid">
                {userRole === 'admin' && (
                  <label className="orderTypeCheckboxLabel">
                    <input
                      type="checkbox"
                      checked={isGlobal}
                      onChange={(e) => setIsGlobal(e.target.checked)}
                    />
                    <span>Global Report Type</span>
                    <FieldTooltip content="Make this report type available across all branches" position="right" />
                  </label>
                )}

                <label className="orderTypeCheckboxLabel">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                  />
                  <span>Set as Default</span>
                  <FieldTooltip content="Make this the default report type" position="right" />
                </label>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label className="orderTypeInputLabel" style={{ marginBottom: '8px', display: 'block' }}>Status</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    style={{
                      padding: '8px 16px',
                      background: isActive ? '#22c55e' : '#e5e7eb',
                      color: isActive ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    style={{
                      padding: '8px 16px',
                      background: !isActive ? '#ef4444' : '#e5e7eb',
                      color: !isActive ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="orderTypeContainer CreateForm">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Report Type?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this report type? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="orderTypeHeader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {editMode && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Back to List
              </button>
            )}
            <div>
              <h2 className="orderTypeTitle">
                {editMode ? 'Edit Report Type' : 'Create Report Type'}
              </h2>
              <p className="orderTypeSubtitle">
                {editMode
                  ? `Editing: ${reportTypeData?.typeName || 'Report Type'}`
                  : 'Configure a new report type for your system'
                }
              </p>
            </div>
          </div>
          {editMode && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Step Progress */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '4px', minWidth: 'fit-content' }}>
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(index)}
              style={{
                padding: '8px 12px',
                background: currentStep === index ? '#3b82f6' : index < currentStep ? '#22c55e' : '#e5e7eb',
                color: currentStep === index || index < currentStep ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: currentStep === index ? 600 : 400,
                whiteSpace: 'nowrap'
              }}
            >
              {index + 1}. {step}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="orderTypeFormGrid">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="orderTypeFormActions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: '10px 24px',
              background: currentStep === 0 ? '#e5e7eb' : '#6b7280',
              color: currentStep === 0 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                style={{
                  padding: '10px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            ) : (
              <ActionButton
                type="save"
                state={saveState}
                onClick={handleSubmit}
                className="orderTypeSaveButton"
                disabled={!typeName.trim() || !typeCode.trim()}
              >
                {editMode ? 'Update Report Type' : 'Create Report Type'}
              </ActionButton>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateReportType;
