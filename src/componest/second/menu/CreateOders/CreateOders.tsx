import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Parser } from "expr-eval";
import "./CreateOders.css";
import "./DynamicForm.css";
import { BackButton } from "../../../allCompones/BackButton";
import { deleteOrder } from "../../../redux/oders/OdersActions";
import { ToastContainer } from "../../../../components/shared/Toast";
import { useCRUD } from "../../../../hooks/useCRUD";
import { crudAPI } from "../../../../utils/crudHelpers";
import CustomerName, { CustomerNameRef } from "./account/CurstomerName";
import OrderTypeSelect, { OrderTypeSelectRef } from "./OrderTypeSelect";
import Notes from "./notes";
import Priority from "./priority";
import Status from "./status";
import SaveOrders from "./saveTheOdes";
import StepContainer, { StepContainerRef } from "./stepContainer";
import { useOrderFormData } from "./useOrderFormData";
import InlineOptionsInput, { InlineOptionsInputRef } from "./optionsSection/InlineOptionsInput";
import PrintExcelModal from "./PrintExcelModal";
import SendOrderModal from "./SendOrderModal";
import ForwardOrderModal from "../OrderForward/components/ForwardOrderModal";
import { AppDispatch } from "../../../../store";

// Section configuration type
type SectionConfig = {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  showInOrder?: boolean;
  columnFormat?: 'standard' | 'highlight' | 'summary' | 'hidden';
  fields: {
    name: string;
    label: string;
    type: string;
    required: boolean;
    enabled: boolean;
    showInOrder?: boolean;
    columnFormat?: 'standard' | 'highlight' | 'summary' | 'hidden';
  }[];
};

// Dynamic Calculation type
type DynamicCalculationConfig = {
  name: string;
  formula: string;
  unit?: string;
  enabled: boolean;
  order: number;
  showInOrder: boolean;
  autoPopulate: boolean;
  columnFormat: 'standard' | 'highlight' | 'summary' | 'hidden';
  rule?: {
    type: 'always' | 'conditional' | 'manual';
    condition?: string;
    triggerOnOptionType?: string;
  };
};

// OptionType from allowedOptionTypes
type AllowedOptionType = {
  _id: string;
  name: string;
  code?: string;
  category?: string;
  specifications?: any[];
};

// Order type configuration type
type OrderTypeConfig = {
  _id: string;
  typeName: string;
  typeCode: string;
  sections: SectionConfig[];
  dynamicCalculations?: DynamicCalculationConfig[];
  selectedSpecs?: {
    optionTypeId: string;
    optionTypeName: string;
    specName: string;
    unit?: string;
    varName: string;
  }[];
  enablePrinting: boolean;
  enableMixing: boolean;
  allowedOptionTypes?: AllowedOptionType[];
  // Billing order fields
  orderCategory?: 'manufacturing' | 'billing';
  billingType?: 'invoice' | 'estimate' | 'quotation' | 'challan' | 'credit_note' | 'debit_note';
  allowManufacturingLink?: boolean;
  hideManufacturingSteps?: boolean;
};

// Helper function to generate unique IDs for options
let optionIdCounter = 0;
const generateOptionId = () => {
  optionIdCounter++;
  return `option-${Date.now()}-${optionIdCounter}`;
};

// Transform options from database format to component format for edit mode
const transformOptionsForEdit = (orderData: any): any[] => {








  if (!orderData) {

    return [];
  }

  const dbOptions = orderData.options || [];
  const optionsWithDetails = orderData.optionsWithDetails || [];

  if (!Array.isArray(dbOptions) || dbOptions.length === 0) {





    return [];
  }






  return dbOptions.map((opt: any, index: number) => {
    // Get enriched data if available
    const enriched = optionsWithDetails[index] || {};
    const specDetails = enriched.specDetails || {};

    // Transform specificationValues from array to object format
    const specsObject: {[key: string]: any;} = {};
    if (Array.isArray(opt.specificationValues)) {
      opt.specificationValues.forEach((spec: any) => {
        specsObject[spec.name] = spec.value;
      });
    } else if (opt.specificationValues && typeof opt.specificationValues === 'object') {
      // Already in object format
      Object.assign(specsObject, opt.specificationValues);
    }

    // Build the component-expected format
    const transformed = {
      id: generateOptionId(),
      optionId: opt.optionId || opt._id,
      optionName: opt.optionName || specDetails.name || 'Unknown Option',
      optionTypeId: opt.optionTypeId || specDetails.optionTypeId || '',
      optionTypeName: opt.optionTypeName || opt.category || specDetails.typeName || 'product',
      specificationValues: specsObject,
      mixingData: opt.mixingData || undefined
    };







    return transformed;
  });
};

const CreateOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useCRUD();

  // Enhanced edit mode detection
  const { orderData, isEdit, isEditMode, hideCustomerDetails, isReceivedForwardedOrder } = location.state || {};
  const editMode = Boolean(isEdit || isEditMode || orderData && orderData._id);
  const shouldHideCustomerDetails = Boolean(hideCustomerDetails || isReceivedForwardedOrder);

  // Debug: Log order data to check createdByName








  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Print/Excel modal state
  const [showPrintExcelModal, setShowPrintExcelModal] = useState(false);
  const [modalMode, setModalMode] = useState<'print' | 'excel'>('print');

  // View Print modal state (separate from PrintExcelModal)
  const [showViewPrint, setShowViewPrint] = useState(false);

  // Forward order modal state
  const [showForwardModal, setShowForwardModal] = useState(false);

  // 🚀 OPTIMIZED: Single API call for all form data
  const {
    loading: formDataLoading,
    error: formDataError,
    allData,
    optionTypes
  } = useOrderFormData();






  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [orderTypeConfig, setOrderTypeConfig] = useState<OrderTypeConfig | null>(null);

  // Unified Options data state
  const [options, setOptions] = useState<any[]>([]);

  // Dynamic calculation values
  const [calculatedValues, setCalculatedValues] = useState<{[key: string]: number | string;}>({});

  // Track status, priority, and notes changes for edit mode
  const [currentStatus, setCurrentStatus] = useState<string>(orderData?.overallStatus || 'Wait for Approval');
  const [currentPriority, setCurrentPriority] = useState<string>(orderData?.priority || 'normal');
  const [currentNotes, setCurrentNotes] = useState<string>(orderData?.Notes || '');

  // Get order types from form data (already loaded in useOrderFormData)
  const orderTypes = allData?.orderTypes || [];

  // Refs to access child component data
  const customerNameRef = useRef<CustomerNameRef>(null);
  const stepContainerRef = useRef<StepContainerRef>(null);
  const orderTypeRef = useRef<OrderTypeSelectRef>(null);
  const optionsInputRef = useRef<InlineOptionsInputRef>(null);

  // Set order type from orderData in edit mode
  useEffect(() => {
    if (editMode && orderData && orderTypes.length > 0 && !selectedOrderType) {
      // Extract order type ID - handle both string and object formats
      let orderTypeId = '';

      if (typeof orderData.orderType === 'string') {
        orderTypeId = orderData.orderType;
      } else if (orderData.orderType?._id) {
        orderTypeId = orderData.orderType._id;
      } else if (orderData.orderTypeId) {
        orderTypeId = typeof orderData.orderTypeId === 'string' ?
        orderData.orderTypeId :
        orderData.orderTypeId._id || '';
      }

      if (orderTypeId) {

        setSelectedOrderType(orderTypeId);
      }
    }
  }, [editMode, orderData, orderTypes.length, selectedOrderType]);

  // Track if order type has been selected before (to detect changes vs initial selection)
  const [hasOrderTypeBeenSelected, setHasOrderTypeBeenSelected] = useState<boolean>(false);

  // Handle order type change - clear options when order type changes
  const handleOrderTypeChange = (newOrderTypeId: string) => {







    // If this is not the first selection and order type is different, clear options
    if (hasOrderTypeBeenSelected && selectedOrderType !== newOrderTypeId && !editMode) {


      setOptions([]);
      setCalculatedValues({});
    }

    // Mark that an order type has been selected
    if (newOrderTypeId) {
      setHasOrderTypeBeenSelected(true);
    }

    setSelectedOrderType(newOrderTypeId);
  };

  // Update order type config when order type changes
  useEffect(() => {
    if (selectedOrderType && orderTypes.length > 0) {
      const selectedConfig = orderTypes.find(
        (ot: any) => ot._id === selectedOrderType || ot.typeCode === selectedOrderType
      );
      if (selectedConfig) {
        // ✅ Enrich allowedOptionTypes with full data including specifications
        if (selectedConfig.allowedOptionTypes && optionTypes.length > 0) {
          selectedConfig.allowedOptionTypes = selectedConfig.allowedOptionTypes.map((allowedOT: any) => {
            const fullOptionType = optionTypes.find((ot: any) => ot._id === allowedOT._id || ot._id === allowedOT);
            if (fullOptionType) {
              return fullOptionType; // Use full data with specifications
            }
            return allowedOT; // Fallback to original if not found
          });
        }

        console.log('🔧 OrderType Config loaded:', {
          typeName: selectedConfig.typeName,
          hideManufacturingSteps: selectedConfig.hideManufacturingSteps,
          orderCategory: selectedConfig.orderCategory
        });

        setOrderTypeConfig(selectedConfig);









        if (selectedConfig.sections && selectedConfig.sections.length > 0) {

        } else {

        }

      }
    } else if (!selectedOrderType) {
      setOrderTypeConfig(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderType, orderTypes.length, optionTypes.length]);

  // Helper function to check if a section is enabled
  const isSectionEnabled = (sectionId: string): boolean => {
    console.log(`🔎 isSectionEnabled called for: "${sectionId}"`);

    // BILLING ORDER: Hide steps section if hideManufacturingSteps is true
    if (sectionId === 'steps') {
      console.log('🔍 Checking steps section visibility:', {
        hideManufacturingSteps: orderTypeConfig?.hideManufacturingSteps,
        orderCategory: orderTypeConfig?.orderCategory,
        typeCode: orderTypeConfig?.typeCode,
        typeName: orderTypeConfig?.typeName,
        shouldHide: !!orderTypeConfig?.hideManufacturingSteps
      });

      // ✅ FIX: Check hideManufacturingSteps field
      if (orderTypeConfig?.hideManufacturingSteps === true) {
        console.log('✅ HIDING manufacturing steps section (hideManufacturingSteps=true)');
        return false;
      }

      // ✅ FIX: Hide for billing category orders
      if (orderTypeConfig?.orderCategory === 'billing') {
        console.log('✅ HIDING manufacturing steps section (billing category)');
        return false;
      }

      // ✅ FALLBACK: Check specific order types that should hide steps (until API is fixed)
      // This list includes order types where hideManufacturingSteps is true in DB but not returned by API
      const hideStepsOrderTypes = ['SILVER_TEST', 'mrk', '99', '222', 'EWEWE'];
      const isInFallbackList = hideStepsOrderTypes.includes(orderTypeConfig?.typeCode || '');

      console.log('🔍 Fallback list check:', {
        typeCode: orderTypeConfig?.typeCode,
        hideStepsOrderTypes,
        isInFallbackList
      });

      if (isInFallbackList) {
        console.log('✅ HIDING manufacturing steps section (typeCode in fallback list)');
        return false;
      }

      console.log('❌ NOT HIDING steps section - no conditions matched');
    }

    if (!orderTypeConfig || !orderTypeConfig.sections || orderTypeConfig.sections.length === 0) {
      // Default to showing all sections if no config
      return true;
    }

    // Find section in config
    const section = orderTypeConfig.sections.find((s) => s.id === sectionId);

    // BACKWARD COMPATIBILITY: Show 'options', 'steps', and 'dynamicColumns' sections by default if not in config
    // This handles order types created before these sections were added
    if ((sectionId === 'options' || sectionId === 'steps' || sectionId === 'dynamicColumns') && !section) {
      return true;
    }

    // For other sections: if not found, it's NOT enabled
    return section ? section.enabled !== false : false;
  };

  // Check if this is a billing order type
  const isBillingOrder = orderTypeConfig?.orderCategory === 'billing';

  // Sort sections by order
  const getSortedSections = (): SectionConfig[] => {
    if (!orderTypeConfig || !orderTypeConfig.sections || orderTypeConfig.sections.length === 0) {
      // Return default order with new unified options section
      return [
      { id: 'options', name: 'Options', enabled: true, order: 1, fields: [] },
      { id: 'dynamicColumns', name: 'Dynamic Columns', enabled: true, order: 2, fields: [] },
      { id: 'steps', name: 'Steps', enabled: true, order: 3, fields: [] }];

    }

    // BACKWARD COMPATIBILITY: Add 'options', 'dynamicColumns' and 'steps' sections if not present in config
    const sections = [...orderTypeConfig.sections];
    const hasOptionsSection = sections.some((s) => s.id === 'options');
    const hasDynamicColumnsSection = sections.some((s) => s.id === 'dynamicColumns');
    const hasStepsSection = sections.some((s) => s.id === 'steps');

    if (!hasOptionsSection) {
      // Add options section with order 0 so it appears first
      sections.push({
        id: 'options',
        name: 'Options',
        enabled: true,
        order: 0,
        fields: []
      });
    }





    // Check if there are any enabled dynamic calculations
    const hasEnabledCalculations = orderTypeConfig.dynamicCalculations?.some((c) => c.enabled !== false) || false;


    if (!hasDynamicColumnsSection && orderTypeConfig.dynamicCalculations && orderTypeConfig.dynamicCalculations.length > 0) {
      // Add dynamic columns section if there are ANY calculations (even if disabled)

      sections.push({
        id: 'dynamicColumns',
        name: 'Dynamic Columns',
        enabled: true, // Always enable the section if calculations exist
        order: 500,
        fields: []
      });
    } else if (hasDynamicColumnsSection) {
      // If section exists but might be disabled, force enable it if there are calculations
      if (hasEnabledCalculations) {
        const dynamicSection = sections.find((s) => s.id === 'dynamicColumns');
        if (dynamicSection && dynamicSection.enabled === false) {

          dynamicSection.enabled = true;
        }
      }
    } else {



    }

    if (!hasStepsSection) {
      // Add steps section with high order number so it appears last
      sections.push({
        id: 'steps',
        name: 'Steps',
        enabled: true,
        order: 999,
        fields: []
      });
    }

    return sections.sort((a, b) => a.order - b.order);
  };

  // Get all spec values from options for calculations - aggregated by option type
  const getSpecValuesFromOptions = (): {
    aggregated: {[key: string]: number[];}; // Arrays for SUM aggregation
    single: {[key: string]: number;}; // Single values (last value or first Rate option)
  } => {
    const aggregated: {[key: string]: number[];} = {};
    const single: {[key: string]: number;} = {};

    console.log('🔍 Building formula context from options:', options);
    console.log('🔍 All available option data:', allData?.options);

    options.forEach((opt) => {
      // Clean option type name for variable naming
      const cleanTypeName = (opt.optionTypeName || 'Option').
      replace(/\s+/g, '_').
      replace(/[.%]/g, '').
      replace(/_+/g, '_');

      console.log(`🔍 Processing option: ${opt.optionName} (${cleanTypeName})`, opt);

      // ✅ STEP 1: Load OptionType specifications (e.g., purity = 80%)
      if (orderTypeConfig?.allowedOptionTypes && opt.optionTypeId) {
        const optionType = orderTypeConfig.allowedOptionTypes.find(
          (ot: any) => ot._id === opt.optionTypeId
        );

        if (optionType && optionType.specifications) {
          optionType.specifications.forEach((spec: any) => {
            if (spec.dataType === 'number' && spec.defaultValue != null) {
              const cleanKey = spec.name.replace(/\s+/g, '_');
              const varName = `${cleanTypeName}_${cleanKey}`;
              const numValue = parseFloat(String(spec.defaultValue)) || 0;

              // Add to single (OptionType specs are templates, not aggregated)
              single[varName] = numValue;
            }
          });
        }
      }

      // ✅ STEP 2: Load Option dimensions (actual option instance values like rate_value = 8000)
      const optionData = allData?.options?.find((o: any) => o._id === opt.optionId);
      console.log(`🔍 Found option data for ${opt.optionName}:`, optionData);

      if (optionData && optionData.dimensions && Array.isArray(optionData.dimensions)) {
        console.log(`✅ Loading ${optionData.dimensions.length} dimensions from option ${opt.optionName}`);
        optionData.dimensions.forEach((dim: any) => {
          if (dim.dataType === 'number' && dim.value != null) {
            const cleanKey = dim.name.replace(/\s+/g, '_');
            const varName = `${cleanTypeName}_${cleanKey}`;
            const numValue = typeof dim.value === 'number' ? dim.value : parseFloat(String(dim.value)) || 0;

            console.log(`  ✅ ${varName} = ${numValue}`);
            // Add to single (Option dimensions are instance values, not aggregated)
            single[varName] = numValue;
          }
        });
      } else {
        console.log(`⚠️ No dimensions found for option ${opt.optionName}`);
      }

      // ✅ STEP 3: Load specificationValues from the order (user input)
      if (opt.specificationValues) {
        Object.entries(opt.specificationValues).forEach(([key, value]) => {
          const cleanKey = key.replace(/\s+/g, '_');
          const varName = `${cleanTypeName}_${cleanKey}`;
          const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;

          // Add to aggregated array
          if (!aggregated[varName]) {
            aggregated[varName] = [];
          }
          aggregated[varName].push(numValue);

          // For single values: Rate options take precedence, others use last value
          if (cleanTypeName.toLowerCase().includes('rate')) {
            single[varName] = numValue;
          } else {
            single[varName] = numValue;
          }
        });
      }
    });

    console.log('✅ Final formula context - single values:', single);
    console.log('✅ Final formula context - aggregated values:', aggregated);

    return { aggregated, single };
  };

  // Calculate dynamic values from formula with SUM() support
  const calculateDynamicValue = (
  formula: string,
  aggregated: {[key: string]: number[];},
  single: {[key: string]: number;})
  : number | string => {
    if (!formula) return '';

    try {
      let evalFormula = formula;

      // Step 1: Handle SUM(varName) - aggregate values from all options of that type
      const sumRegex = /SUM\(([^)]+)\)/g;
      evalFormula = evalFormula.replace(sumRegex, (match, varName) => {
        const cleanVarName = varName.trim();
        const values = aggregated[cleanVarName];
        if (values && values.length > 0) {
          const sum = values.reduce((acc, val) => acc + val, 0);
          return String(sum);
        }
        return '0';
      });

      // Step 2: Replace single variable names with their values
      Object.keys(single).forEach((key) => {
        const value = single[key];
        // Use word boundary to avoid partial matches
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evalFormula = evalFormula.replace(regex, String(value));
      });

      // Step 3: Evaluate the formula if it's valid
      // Check if formula is ready for evaluation (only numbers and operators)
      if (/^[\d\s+\-*/().]+$/.test(evalFormula)) {
        const parser = new Parser();
        const result = parser.evaluate(evalFormula);
        return typeof result === 'number' ? Math.round(result * 100) / 100 : result;
      }

      // If formula still has unresolved variables, return empty

      return '';
    } catch (e) {

      return '';
    }
  };

  // Auto-calculate dynamic values when options change
  useEffect(() => {
    if (orderTypeConfig?.dynamicCalculations && options.length > 0) {
      const { aggregated, single } = getSpecValuesFromOptions();
      const newCalculatedValues: {[key: string]: number | string;} = {};





      orderTypeConfig.dynamicCalculations.
      filter((calc) => calc.enabled && calc.autoPopulate).
      forEach((calc) => {
        const value = calculateDynamicValue(calc.formula, aggregated, single);

        if (value !== '') {
          newCalculatedValues[calc.name] = value;
        }
      });




      setCalculatedValues(newCalculatedValues);
    }
  }, [options, orderTypeConfig?.dynamicCalculations]);

  // Handle delete order
  const handleDelete = async () => {
    if (!orderData?._id) return;

    setDeleting(true);
    try {
      await dispatch(deleteOrder(orderData._id) as any);
      toast.success('Deleted', 'Order deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      toast.error('Error', 'Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  // State for send modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendModalMode, setSendModalMode] = useState<'email' | 'whatsapp' | 'both'>('email');

  // Icon button handlers
  const handleEmailClick = () => {
    // Open the SendOrderModal for email - allow sending to any email address
    setSendModalMode('email');
    setShowSendModal(true);
  };

  const handleExcelClick = () => {
    if (!editMode || !orderData) {
      toast.error('Error', 'Please save the order first before exporting');
      return;
    }
    setModalMode('excel');
    setShowPrintExcelModal(true);
  };

  const handlePrintClick = () => {
    if (!editMode || !orderData) {
      toast.error('Error', 'Please save the order first before printing');
      return;
    }
    setModalMode('print');
    setShowPrintExcelModal(true);
  };

  const handleViewPrintClick = () => {
    if (!editMode || !orderData) {
      toast.error('Error', 'Please save the order first before viewing print');
      return;
    }
    setShowViewPrint(true);
  };

  const handleActualPrint = () => {
    window.print();
  };

  const handleWhatsAppClick = () => {
    // Open the SendOrderModal for WhatsApp - allow sending to any number
    setSendModalMode('whatsapp');
    setShowSendModal(true);
  };

  // Handle sending email from Print/Excel modal
  const handlePrintExcelEmail = async (emailAddress: string, content: string, subject: string, attachments?: any[]) => {
    try {
      await crudAPI.create('/send-email', {
        to: emailAddress,
        subject,
        html: content,
        text: content.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text
        attachments: attachments || []
      });

      // Show specific success message based on attachment type
      // Check if it's Excel (xlsx) or Print (pdf)
      const isExcel = attachments && attachments.length > 0 &&
                     attachments[0].contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      if (isExcel) {
        toast.success('Success', 'Excel file sent via email successfully!');
      } else {
        toast.success('Success', 'Print PDF sent via email successfully!');
      }
    } catch (error: any) {
      // Show specific error message
      const isExcel = attachments && attachments.length > 0 &&
                     attachments[0].contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const errorMsg = isExcel
        ? 'Failed to send Excel file via email'
        : 'Failed to send Print PDF via email';
      toast.error('Error', error?.message || errorMsg);
    }
  };

  // Handle sending WhatsApp from Print/Excel modal
  const handlePrintExcelWhatsApp = async (phoneNumber: string, message: string, document?: any) => {
    try {
      if (!document) {
        // Fallback to web link if no document
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        toast.success('Success', 'Opening WhatsApp...');
        return;
      }

      // Send via backend API with document
      await crudAPI.create('/send-whatsapp', {
        to: phoneNumber,
        message: message,
        document: document
      });

      // Show specific success message based on document type
      const isPdf = document.contentType === 'application/pdf';
      const isExcel = document.contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      if (isPdf) {
        toast.success('Success', 'Print PDF sent via WhatsApp successfully!');
      } else if (isExcel) {
        toast.success('Success', 'Excel file sent via WhatsApp successfully!');
      } else {
        toast.success('Success', 'Document sent via WhatsApp successfully!');
      }
    } catch (error: any) {
      const isPdf = document?.contentType === 'application/pdf';
      const isExcel = document?.contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      let errorMsg = 'Failed to send WhatsApp message';
      if (isPdf) {
        errorMsg = 'Failed to send Print PDF via WhatsApp';
      } else if (isExcel) {
        errorMsg = 'Failed to send Excel file via WhatsApp';
      }

      toast.error('Error', error?.message || errorMsg);
    }
  };

  // Get customer data for modal
  const getCustomerForModal = () => {
    const customerData = customerNameRef.current?.getCustomerData?.() || {};
    const customer = orderData?.customer || orderData?.account || customerData || {};
    return {
      companyName: customer.companyName || customer.name || customer.accountName,
      name: customer.name || customer.accountName,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || customer.phone1,
      whatsapp: customer.whatsapp || customer.phone || customer.mobile || customer.phone1
    };
  };

  // Show loading state while fetching form data
  if (formDataLoading && !editMode) {
    return (
      <div className="CreateOrders">
        <div className="CrateOrdersHaders">
          <BackButton />
          <div className="CreateOrdersHaders1">
            <p className="CreteOrdersTitel">Loading Form Data...</p>
          </div>
        </div>
        <div className="CreateOrdersBody" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #0c214e',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading customers, products, materials...</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              This happens only once per session
            </p>
          </div>
        </div>
      </div>);

  }

  // Show error state if data fetch failed
  if (formDataError && !editMode) {
    return (
      <div className="CreateOrders">
        <div className="CrateOrdersHaders">
          <BackButton />
          <div className="CreateOrdersHaders1">
            <p className="CreteOrdersTitel">Error Loading Form</p>
          </div>
        </div>
        <div className="CreateOrdersBody" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#fee',
            borderRadius: '8px',
            maxWidth: '400px'
          }}>
            <p style={{ color: '#c00', fontWeight: 'bold', marginBottom: '10px' }}>
              ❌ Failed to load form data
            </p>
            <p style={{ fontSize: '14px' }}>{formDataError}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#0c214e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>

              Retry
            </button>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="CreateOrders CreateForm">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm &&
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Order?</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>

                Cancel
              </button>
              <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>

                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      }

      <div className="CrateOrdersHaders">
        <BackButton />
        <div className="CreateOrdersHaders1">
          <p className="CreteOrdersTitel">
            {editMode ? 'Edit' : 'Create Orders'}
          </p>
          {editMode && orderData?.orderId &&
          <span className="HeaderOrderID">{orderData.orderId}</span>
          }
          {/* ✅ Show Created By in header when editing */}
          {editMode && orderData?.createdByName &&
          <span style={{
            marginLeft: '12px',
            padding: '4px 12px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {orderData.createdByName}
            </span>
          }
          {/* ✅ ADDED: Show Order Type in header when editing */}
          {editMode && orderTypeConfig &&
          <span style={{
            marginLeft: '12px',
            padding: '4px 12px',
            backgroundColor: orderTypeConfig.color || '#6366f1',
            color: 'white',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
              {orderTypeConfig.icon && <span>{orderTypeConfig.icon}</span>}
              {orderTypeConfig.typeName}
              {orderTypeConfig.typeCode &&
            <span style={{ opacity: 0.8, fontSize: '10px' }}>({orderTypeConfig.typeCode})</span>
            }
            </span>
          }
        </div>
        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          {/* Email Icon */}
          <button
            type="button"
            onClick={handleEmailClick}
            style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#f97316', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Send Email">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </button>

          {/* Excel Icon */}
          <button
            type="button"
            onClick={handleExcelClick}
            style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#10b981', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Export to Excel">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          {/* Forward Order Icon - Only show in edit mode */}
          {editMode && orderData?._id && (
            <button
              type="button"
              onClick={() => setShowForwardModal(true)}
              style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Forward Order">

              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="10 8 21 3" />
                <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
              </svg>
            </button>
          )}

          {/* View Print Icon */}
          <button
            type="button"
            onClick={handleViewPrintClick}
            style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#8b5cf6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="View Print Preview">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {/* Print Icon */}
          <button
            type="button"
            onClick={handlePrintClick}
            style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Print Order">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </button>

          {/* WhatsApp Icon */}
          <button
            type="button"
            onClick={handleWhatsAppClick}
            style={{ width: '40px', height: '40px', backgroundColor: 'transparent', color: '#25D366', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Send WhatsApp">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="CreateOrdersBody">
        <div className="createOdersForm">
          {!shouldHideCustomerDetails && (
            <CustomerName
              ref={customerNameRef}
              initialData={orderData}
              isEditMode={editMode}
              onCustomerSelect={() => {
                // Directly focus the order type dropdown
                setTimeout(() => {
                  orderTypeRef.current?.focus();
                }, 50);
              }} />
          )}
          {shouldHideCustomerDetails && (
            <div className="customer-hidden-notice" style={{
              padding: '16px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <strong>ℹ️ Customer Details Hidden</strong>
              <p style={{ margin: '8px 0 0 0' }}>You are viewing a forwarded order. Customer information is only visible to the person who forwarded this order.</p>
            </div>
          )}


          <OrderTypeSelect
            ref={orderTypeRef}
            value={selectedOrderType}
            onChange={handleOrderTypeChange}
            initialValue={
            typeof orderData?.orderType === 'string' ?
            orderData.orderType :
            orderData?.orderType?._id || orderData?.orderTypeId || ''
            }
            orderTypes={orderTypes}
            loading={formDataLoading}
            onOrderTypeSelect={() => {
              // Order type selected with Enter - focus options input

              setTimeout(() => {
                optionsInputRef.current?.focus();
              }, 100);
            }}
            onBackspace={() => {
              // Backspace - go back to customer name input
              customerNameRef.current?.focus();
            }} />


          {/* Billing Order Indicator */}
          {isBillingOrder && orderTypeConfig &&
          <div style={{
            marginTop: '12px',
            padding: '12px 16px',
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
              <span style={{ fontSize: '20px' }}>📄</span>
              <div>
                <div style={{ fontWeight: 600, color: '#065f46', fontSize: '14px' }}>
                  Billing Order - {orderTypeConfig.billingType?.replace('_', ' ').toUpperCase() || 'Invoice'}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {orderTypeConfig.allowManufacturingLink ?
                'Can be linked to manufacturing order' :
                'Standalone billing document'}
                </div>
              </div>
            </div>
          }

          {/* Hidden input for order type ID - needed for DOM data collection */}
          <input
            type="hidden"
            name="orderTypeId"
            value={selectedOrderType} />


          {/* Dynamic sections - only render when order type is selected */}
          {selectedOrderType && (() => {
            const sections = getSortedSections();

            return (
              <>
                {/* Dynamic sections - render based on order type configuration */}
                {sections.map((section) => {
                  // Check if this section should be shown
                  const isEnabled = isSectionEnabled(section.id);

                  console.log(`📋 Section "${section.id}":`, {
                    enabled: isEnabled,
                    sectionName: section.name,
                    willRender: isEnabled
                  });

                  if (!isEnabled) {
                    console.log(`🚫 SKIPPING section "${section.id}" - not enabled`);
                    return null;
                  }

                  switch (section.id) {
                    case 'options':


                      return (
                        <div key="options" className="dynamicSection">
                          <InlineOptionsInput
                            ref={optionsInputRef}
                            key={`options-${selectedOrderType}`}
                            title="Options"
                            orderTypeId={selectedOrderType}
                            onDataChange={setOptions}
                            initialData={editMode ? transformOptionsForEdit(orderData) : options}
                            isEditMode={editMode}
                            isBillingOrder={isBillingOrder}
                            allowedOptionTypes={orderTypeConfig?.allowedOptionTypes || []}
                            orderId={editMode ? orderData?.orderId : undefined}
                            customerInfo={editMode && orderData?.customer ? {
                              name: orderData.customer.companyName || orderData.customer.name,
                              companyName: orderData.customer.companyName,
                              address: orderData.customer.address || orderData.customer.address1,
                              phone: orderData.customer.phone || orderData.customer.phone1,
                              whatsapp: orderData.customer.whatsapp
                            } : undefined}
                            createdByName={editMode ? orderData?.createdByName : undefined}
                            createdAt={editMode ? orderData?.createdAt : undefined}
                            dynamicCalculations={orderTypeConfig?.dynamicCalculations || []}
                            calculatedValues={calculatedValues}
                            onBackspace={() => {
                              // Backspace - go back to order type
                              orderTypeRef.current?.focus();
                            }} />

                      </div>);


                    case 'dynamicColumns':
                      // Only show if there are dynamic calculations configured


                      const calculations = orderTypeConfig?.dynamicCalculations?.filter((c) => c.enabled) || [];

                      if (calculations.length === 0) {

                        return null;
                      }

                      return (
                        <div key="dynamicColumns" className="dynamicSection dynamicColumnsSection">
                        <div className="dynamicSection-title">Dynamic Calculations</div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                          {calculations.
                            sort((a, b) => (a.order || 0) - (b.order || 0)).
                            map((calc, idx) => {
                              const value = calculatedValues[calc.name] || '';
                              const formatClass = calc.columnFormat === 'highlight' ? 'dynamicColumn-highlight' :
                              calc.columnFormat === 'summary' ? 'dynamicColumn-summary' :
                              calc.columnFormat === 'hidden' ? 'dynamicColumn-hidden' : '';



                              return (
                                <div
                                  key={idx}
                                  className={`dynamicColumnItem ${formatClass}`}
                                  style={{
                                    display: calc.columnFormat === 'hidden' ? 'none' : 'block'
                                  }}>

                                  <label className="inputLabel">
                                    {calc.name}
                                    {calc.unit && ` (${calc.unit})`}
                                  </label>
                                  <input
                                    type="text"
                                    name={`calc_${calc.name.replace(/\s+/g, '_')}`}
                                    value={value}
                                    readOnly={calc.autoPopulate}
                                    onChange={(e) => {
                                      if (!calc.autoPopulate) {
                                        setCalculatedValues((prev) => ({
                                          ...prev,
                                          [calc.name]: e.target.value
                                        }));
                                      }
                                    }}
                                    className="inputField"
                                    placeholder={calc.autoPopulate ? 'Auto-calculated' : 'Enter value'} />

                                </div>);

                            })}
                        </div>
                      </div>);


                    case 'steps':

                      return (
                        <div key="steps" className="dynamicSection">
                        <StepContainer
                            ref={stepContainerRef}
                            initialData={orderData}
                            isEditMode={editMode}
                            onStepsChange={(steps) => {

                            }}
                            orderId={editMode ? orderData?.orderId : undefined}
                            customerInfo={editMode && orderData?.customer ? {
                              name: orderData.customer.companyName || orderData.customer.name,
                              companyName: orderData.customer.companyName,
                              address: orderData.customer.address || orderData.customer.address1,
                              phone: orderData.customer.phone || orderData.customer.phone1,
                              whatsapp: orderData.customer.whatsapp
                            } : undefined} />

                      </div>);


                    default:
                      return null;
                  }
                })}
            </>);

          })()}
            
        </div>
        
        <div className="CreateOrdersFooter">
          <Notes
            initialNotes={orderData?.Notes || orderData?.notes}
            isEditMode={editMode}
            onNotesChange={(notes) => {
              setCurrentNotes(notes);
            }} />

          <Status
            initialStatus={orderData?.overallStatus || 'Wait for Approval'}
            isEditMode={editMode}
            isBillingOrder={isBillingOrder}
            onStatusChange={(status) => {

              setCurrentStatus(status);
            }} />

          <Priority
            initialPriority={orderData?.priority}
            isEditMode={editMode}
            onPriorityChange={(priority) => {

              setCurrentPriority(priority);
            }} />

          <SaveOrders
            isEditMode={editMode}
            orderId={orderData?._id}
            orderData={{
              ...orderData,
              overallStatus: currentStatus,
              priority: currentPriority,
              Notes: currentNotes
            }}
            optionsData={options} />

        </div>
      </div>
      
      <div className="sideMenu">
        <div className="sideMenuPtag">
          <p>Address</p>
          <p>Send Email</p>
          <p>WhatsApp</p>
          <p>Print</p>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Print/Excel Modal */}
      <PrintExcelModal
        isOpen={showPrintExcelModal}
        onClose={() => setShowPrintExcelModal(false)}
        mode={modalMode}
        orderData={{
          ...orderData,
          overallStatus: currentStatus,
          priority: currentPriority,
          Notes: currentNotes,
          options: options,
          createdByName: orderData?.createdByName,
          createdBy: orderData?.createdBy,
          createdAt: orderData?.createdAt,
          updatedAt: orderData?.updatedAt
        }}
        orderTypeId={selectedOrderType}
        onSendEmail={handlePrintExcelEmail}
        onSendWhatsApp={handlePrintExcelWhatsApp} />

      {/* Send Email/WhatsApp Modal */}
      <SendOrderModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        orderId={orderData?._id || orderData?.orderId}
        orderData={{
          ...orderData,
          overallStatus: currentStatus,
          priority: currentPriority,
          Notes: currentNotes
        }}
        customer={getCustomerForModal()}
        mode={sendModalMode}
        branchId={localStorage.getItem('selectedBranch') || orderData?.branchId || undefined} />

      {/* Forward Order Modal */}
      {editMode && orderData?._id && (
        <ForwardOrderModal
          isOpen={showForwardModal}
          onClose={() => setShowForwardModal(false)}
          orderId={orderData._id}
          orderNumber={orderData.orderNumber || orderData.orderId || orderData._id?.slice(-8)}
          onSuccess={() => {
            toast.success('Success', 'Order forwarded successfully!');
            setShowForwardModal(false);
          }}
        />
      )}

    </div>);

};

export default CreateOrders;