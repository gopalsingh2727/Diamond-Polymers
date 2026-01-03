import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../../../../redux/rootReducer";
import OrderTypeSelector from "../../../../../components/orderType/OrderTypeSelector";
import SearchableSelect, { SearchableSelectHandle } from "../../../../../components/shared/SearchableSelect";
import { Parser } from "expr-eval";
import { useKeyboardNavigation } from "../../../../../hooks/useKeyboardNavigation";
import KeyboardShortcutsGuide from "../../../../../components/shared/KeyboardShortcutsGuide";
import "./createOrder.css";

interface ProductType {
  _id: string;
  productTypeName: string;
}

interface Product {
  _id: string;
  productName: string;
  productType?: {
    _id: string;
    productTypeName: string;
  };
}

interface Dimension {
  name: string;
  value: string | number | boolean;
  unit: string;
  dataType: string;
  formula?: string;
  isCalculated?: boolean;
}

interface ProductSpec {
  _id: string;
  specName: string;
  dimensions: Dimension[];
}

interface MaterialSpec {
  _id: string;
  specName: string;
  materialTypeId: string;
  mol?: number;
  weightPerPiece?: number;
  density?: number;
  dimensions: Dimension[];
}

interface MaterialType {
  _id: string;
  name: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  enabled: boolean;
}

interface FormSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  fields: FormField[];
}

const CreateOrder = () => {
  // ✅ Get location state for edit mode
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as {isEdit?: boolean;orderData?: any;} | null;
  const isEditMode = locationState?.isEdit || false;
  const editOrderData = locationState?.orderData;

  // Refs for keyboard navigation
  const orderTypeRef = useRef<SearchableSelectHandle>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const priorityRef = useRef<HTMLSelectElement>(null);
  const productTypeRef = useRef<SearchableSelectHandle>(null);
  const productNameRef = useRef<SearchableSelectHandle>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const productSpecRef = useRef<SearchableSelectHandle>(null);
  const materialTypeRef = useRef<SearchableSelectHandle>(null);
  const materialNameRef = useRef<SearchableSelectHandle>(null);
  const mixingRef = useRef<HTMLSelectElement>(null);
  const printEnabledRef = useRef<HTMLSelectElement>(null);
  const printLengthRef = useRef<HTMLInputElement>(null);
  const printWidthRef = useRef<HTMLInputElement>(null);
  const printTypeRef = useRef<HTMLSelectElement>(null);
  const printColorRef = useRef<HTMLInputElement>(null);
  const printImageRef = useRef<HTMLInputElement>(null);
  const stepNameRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Data states
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSpecs, setProductSpecs] = useState<ProductSpec[]>([]);
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [materialSpecs, setMaterialSpecs] = useState<MaterialSpec[]>([]);

  // Form values - dynamic based on field names
  // ✅ Initialize with edit data if in edit mode
  const [formValues, setFormValues] = useState<{[key: string]: any;}>(() => {
    if (isEditMode && editOrderData) {
      return {
        overallStatus: editOrderData.overallStatus || editOrderData.status || 'Wait for Approval',
        priority: editOrderData.priority || 'normal',
        orderType: editOrderData.orderTypeId || editOrderData.orderType?._id || ''
        // Add other fields as needed
      };
    }
    return {};
  });
  const [productSpecValues, setProductSpecValues] = useState<{[key: string]: string | number;}>({});
  const [materialSpecValues, setMaterialSpecValues] = useState<{[key: string]: string | number;}>({});
  const [calculatedDimensions, setCalculatedDimensions] = useState<{[key: string]: number;}>({});
  const [calculatedMaterialWeight, setCalculatedMaterialWeight] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [loadingMaterialSpecs, setLoadingMaterialSpecs] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🚀 OPTIMIZED: Get ALL data from cached form data (no extra API calls)
  const { data: formData } = useSelector((state: RootState) => state.orderFormData || {});
  const orderTypes = formData?.orderTypes || [];
  const selectedOrderType = formValues.orderType || "";
  const selectedOrderTypeData = orderTypes.find((type: any) => type._id === selectedOrderType);

  // Get cached data - no API calls needed!
  const cachedProductTypes = formData?.productTypes || [];
  const cachedProducts = formData?.products || [];
  const cachedProductSpecs = formData?.productSpecs || [];
  const cachedMaterialTypes = formData?.materialTypes || [];
  const cachedMaterials = formData?.materials || [];

  // Default sections when order type has no sections configured
  const defaultSections: FormSection[] = [
  {
    id: "product",
    name: "Product Information",
    enabled: true,
    order: 1,
    fields: [
    { name: "productType", label: "Product Type", type: "suggestions", required: true, enabled: true },
    { name: "productName", label: "Product Name", type: "suggestions", required: true, enabled: true },
    { name: "quantity", label: "Quantity", type: "number", required: true, enabled: true }]

  },
  {
    id: "material",
    name: "Material Information",
    enabled: true,
    order: 2,
    fields: [
    { name: "materialType", label: "Material Type", type: "suggestions", required: true, enabled: true },
    { name: "materialName", label: "Material Specification", type: "suggestions", required: true, enabled: true },
    { name: "mixing", label: "Mixing", type: "select", required: false, enabled: true }]

  },
  {
    id: "printing",
    name: "Printing Options",
    enabled: true,
    order: 3,
    fields: [
    { name: "printEnabled", label: "Enable Printing", type: "select", required: false, enabled: true },
    { name: "printLength", label: "Print Length", type: "number", required: false, enabled: true },
    { name: "printWidth", label: "Print Width", type: "number", required: false, enabled: true },
    { name: "printType", label: "Print Type", type: "select", required: false, enabled: true },
    { name: "printColor", label: "Print Color", type: "text", required: false, enabled: true },
    { name: "printImage", label: "Print Image/Notes", type: "text", required: false, enabled: true }]

  },
  {
    id: "steps",
    name: "Manufacturing Steps",
    enabled: true,
    order: 4,
    fields: [
    { name: "stepName", label: "Step Name", type: "suggestions", required: false, enabled: true },
    { name: "notes", label: "Notes", type: "text", required: false, enabled: true }]

  }];


  // Get enabled sections from order type
  // IMPORTANT: Only use sections from database if they exist, otherwise use defaults
  const getSections = (): FormSection[] => {
    if (!selectedOrderTypeData) return defaultSections;

    const dbSections = selectedOrderTypeData.sections;

    // If order type has sections configured, use ONLY those sections
    if (dbSections && Array.isArray(dbSections) && dbSections.length > 0) {
      return dbSections.
      filter((s: any) => s.enabled !== false).
      sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).
      map((s: any) => ({
        id: s.id,
        name: s.name,
        enabled: s.enabled !== false,
        order: s.order || 0,
        fields: s.fields || []
      }));
    }

    // No sections configured - use defaults
    return defaultSections;
  };

  const sections = getSections();

  // 🎹 Keyboard Navigation Setup
  const buildFieldRegistry = () => {
    const fields: Array<{
      id: string;
      ref: React.RefObject<any>;
      onEnter?: () => void;
      isEnabled?: boolean;
      nextFieldId?: string;
    }> = [];

    // Always add order type, status, priority
    fields.push(
      { id: 'orderType', ref: orderTypeRef, isEnabled: true },
      { id: 'status', ref: statusRef, isEnabled: true },
      { id: 'priority', ref: priorityRef, isEnabled: true }
    );

    // Add fields based on enabled sections
    sections.forEach((section) => {
      if (section.id === 'product') {
        if (isFieldEnabled('product', 'productType')) {
          fields.push({ id: 'productType', ref: productTypeRef, isEnabled: true });
        }
        if (isFieldEnabled('product', 'productName')) {
          fields.push({ id: 'productName', ref: productNameRef, isEnabled: !!formValues.productType });
        }
        if (isFieldEnabled('product', 'quantity')) {
          fields.push({ id: 'quantity', ref: quantityRef, isEnabled: true });
        }
        if (formValues.productName && productSpecs.length > 0) {
          fields.push({ id: 'productSpec', ref: productSpecRef, isEnabled: true });
        }
      }

      if (section.id === 'material') {
        if (isFieldEnabled('material', 'materialType')) {
          fields.push({ id: 'materialType', ref: materialTypeRef, isEnabled: true });
        }
        if (isFieldEnabled('material', 'materialName')) {
          fields.push({ id: 'materialName', ref: materialNameRef, isEnabled: !!formValues.materialType });
        }
        if (isFieldEnabled('material', 'mixing')) {
          fields.push({ id: 'mixing', ref: mixingRef, isEnabled: true });
        }
      }

      if (section.id === 'printing') {
        if (isFieldEnabled('printing', 'printEnabled')) {
          fields.push({ id: 'printEnabled', ref: printEnabledRef, isEnabled: true });
        }
        if (isFieldEnabled('printing', 'printLength')) {
          fields.push({ id: 'printLength', ref: printLengthRef, isEnabled: true });
        }
        if (isFieldEnabled('printing', 'printWidth')) {
          fields.push({ id: 'printWidth', ref: printWidthRef, isEnabled: true });
        }
        if (isFieldEnabled('printing', 'printType')) {
          fields.push({ id: 'printType', ref: printTypeRef, isEnabled: true });
        }
        if (isFieldEnabled('printing', 'printColor')) {
          fields.push({ id: 'printColor', ref: printColorRef, isEnabled: true });
        }
        if (isFieldEnabled('printing', 'printImage')) {
          fields.push({ id: 'printImage', ref: printImageRef, isEnabled: true });
        }
      }

      if (section.id === 'steps') {
        if (isFieldEnabled('steps', 'stepName')) {
          fields.push({ id: 'stepName', ref: stepNameRef, isEnabled: true });
        }
        if (isFieldEnabled('steps', 'notes')) {
          fields.push({ id: 'notes', ref: notesRef, isEnabled: true });
        }
      }
    });

    // Add submit button at the end
    fields.push({ id: 'submit', ref: submitButtonRef, isEnabled: true });

    return fields;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const { focusNextField, focusPreviousField, focusField, setCurrentField } = useKeyboardNavigation({
    onSave: handleSubmit,
    onPrint: handlePrint,
    onBack: handleGoBack,
    enableGlobalShortcuts: true,
    fields: buildFieldRegistry()
  });

  // Debug: Log sections when order type changes
  useEffect(() => {
    if (selectedOrderType && selectedOrderTypeData) {







    }
  }, [selectedOrderType, selectedOrderTypeData, sections]);

  // Helper to check if a field is enabled in the current order type
  const isFieldEnabled = (sectionId: string, fieldName: string): boolean => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return false;

    // If section has no fields configured, show all fields (backward compatibility)
    if (!section.fields || section.fields.length === 0) {
      return true;
    }

    // Find the field in section's fields
    const field = section.fields.find((f) => f.name === fieldName);

    // If field not found, it's not configured for this order type
    if (!field) return false;

    return field.enabled ?? true;
  };

  // Helper to check if a field is required
  const isFieldRequired = (sectionId: string, fieldName: string): boolean => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return false;

    // If section has no fields configured, use default required values
    if (!section.fields || section.fields.length === 0) {
      // Default required fields
      const defaultRequired = ['productType', 'productName', 'quantity', 'materialType', 'materialName'];
      return defaultRequired.includes(fieldName);
    }

    const field = section.fields.find((f) => f.name === fieldName);
    return field?.required ?? false;
  };

  // Helper to get field label
  const getFieldLabel = (sectionId: string, fieldName: string, defaultLabel: string): string => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return defaultLabel;

    // If section has no fields configured, use default label
    if (!section.fields || section.fields.length === 0) {
      return defaultLabel;
    }

    const field = section.fields.find((f) => f.name === fieldName);
    return field?.label || defaultLabel;
  };

  // 🚀 OPTIMIZED: Load product types and material types from cache on mount
  useEffect(() => {
    if (cachedProductTypes.length > 0) {
      setProductTypes(cachedProductTypes);
    }
    if (cachedMaterialTypes.length > 0) {
      setMaterialTypes(cachedMaterialTypes);
    }
  }, [cachedProductTypes, cachedMaterialTypes]);

  // Reset form when order type changes
  useEffect(() => {
    if (selectedOrderType) {
      // Keep order type, reset other values
      setFormValues((prev) => ({ orderType: prev.orderType }));
      setProducts([]);
      setProductSpecs([]);
      setMaterialSpecs([]);
      setProductSpecValues({});
      setMaterialSpecValues({});
      setCalculatedDimensions({});
      setCalculatedMaterialWeight(0);
    }
  }, [selectedOrderType]);

  // 🚀 OPTIMIZED: Filter products from cache when product type changes (no API call)
  useEffect(() => {
    if (formValues.productType) {
      const filteredProducts = cachedProducts.filter(
        (product: any) => product.productType?._id === formValues.productType ||
        product.productTypeId === formValues.productType
      );
      setProducts(filteredProducts);
    } else {
      setProducts([]);
      setFormValues((prev) => ({ ...prev, productName: "", productSpec: "" }));
    }
  }, [formValues.productType, cachedProducts]);

  // 🚀 OPTIMIZED: Filter product specs from cache when product changes (no API call)
  useEffect(() => {
    if (formValues.productName) {
      const filteredSpecs = cachedProductSpecs.filter(
        (spec: any) => spec.productId === formValues.productName ||
        spec.product?._id === formValues.productName
      );
      setProductSpecs(filteredSpecs);
    } else {
      setProductSpecs([]);
      setFormValues((prev) => ({ ...prev, productSpec: "" }));
    }
  }, [formValues.productName, cachedProductSpecs]);

  // Initialize product spec values when selected
  useEffect(() => {
    if (formValues.productSpec) {
      const spec = productSpecs.find((s) => s._id === formValues.productSpec);
      if (spec) {
        const initialValues: {[key: string]: string | number;} = {};
        spec.dimensions.forEach((dim) => {
          if (!dim.isCalculated) {
            initialValues[dim.name] = dim.dataType === 'number' ? 0 : "";
          }
        });
        setProductSpecValues(initialValues);
      }
    }
  }, [formValues.productSpec, productSpecs]);

  // 🚀 OPTIMIZED: Filter material specs from cache when material type changes (no API call)
  useEffect(() => {
    if (formValues.materialType) {
      setLoadingMaterialSpecs(true);
      const filteredSpecs = cachedMaterials.filter(
        (material: any) => material.materialTypeId === formValues.materialType ||
        material.materialType?._id === formValues.materialType
      );
      setMaterialSpecs(filteredSpecs);
      setLoadingMaterialSpecs(false);
    } else {
      setMaterialSpecs([]);
      setFormValues((prev) => ({ ...prev, materialName: "" }));
    }
  }, [formValues.materialType, cachedMaterials]);

  // Initialize material spec values when selected
  useEffect(() => {
    if (formValues.materialName) {
      const spec = materialSpecs.find((s) => s._id === formValues.materialName);
      if (spec) {
        const initialValues: {[key: string]: string | number;} = {};
        spec.dimensions.forEach((dim) => {
          if (!dim.isCalculated) {
            initialValues[dim.name] = dim.dataType === 'number' ? 0 : "";
          }
        });
        setMaterialSpecValues(initialValues);
      }
    }
  }, [formValues.materialName, materialSpecs]);

  // Calculate dimensions
  useEffect(() => {
    if (formValues.productSpec && formValues.materialName) {
      calculateCombinedDimensions();
    }
  }, [formValues.productSpec, formValues.materialName, productSpecValues, materialSpecValues, formValues.quantity]);

  // 🚀 OPTIMIZED: All fetch functions removed - using cached data from orderFormData!

  const calculateCombinedDimensions = () => {
    try {
      const productSpec = productSpecs.find((s) => s._id === formValues.productSpec);
      const materialSpec = materialSpecs.find((s) => s._id === formValues.materialName);
      if (!productSpec || !materialSpec) return;

      const context: {[key: string]: number;} = {
        quantity: Number(formValues.quantity) || 0,
        mol: materialSpec.mol || 0,
        weightPerPiece: materialSpec.weightPerPiece || 0,
        density: materialSpec.density || 0
      };

      Object.entries(productSpecValues).forEach(([key, value]) => {
        context[key] = Number(value) || 0;
      });
      Object.entries(materialSpecValues).forEach(([key, value]) => {
        context[key] = Number(value) || 0;
      });

      const calculated: {[key: string]: number;} = {};
      const parser = new Parser();
      const allDimensions = [
      ...(productSpec.dimensions || []),
      ...(materialSpec.dimensions || [])];


      allDimensions.forEach((dim) => {
        if (dim.formula && dim.isCalculated) {
          try {
            const expr = parser.parse(dim.formula);
            const result = expr.evaluate(context);
            calculated[dim.name] = result;
            context[dim.name] = result;
          } catch (err) {

          }
        }
      });

      setCalculatedDimensions(calculated);

      let weight = 0;
      if (calculated.volume && materialSpec.density) {
        weight = calculated.volume * materialSpec.density * Number(formValues.quantity);
      } else if (calculated.area && calculated.thickness && materialSpec.density) {
        weight = calculated.area * calculated.thickness * materialSpec.density * Number(formValues.quantity);
      } else if (materialSpec.weightPerPiece) {
        weight = materialSpec.weightPerPiece * Number(formValues.quantity);
      }
      setCalculatedMaterialWeight(weight);
    } catch (err) {

    }
  };

  const handleFormValueChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleProductSpecValueChange = (dimName: string, value: string) => {
    setProductSpecValues((prev) => ({ ...prev, [dimName]: value }));
  };

  const handleMaterialSpecValueChange = (dimName: string, value: string) => {
    setMaterialSpecValues((prev) => ({ ...prev, [dimName]: value }));
  };

  const handleSubmit = async () => {




    // Validate required fields based on enabled sections
    const missingFields: string[] = [];

    sections.forEach((section) => {
      section.fields?.filter((f) => f.enabled && f.required).forEach((field) => {
        if (!formValues[field.name]) {
          missingFields.push(field.label);
        }
      });
    });



    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(", ")}`);

      return;
    }

    // Validate quantity against order type rules
    if (selectedOrderTypeData?.validationRules) {
      const { minQuantity, maxQuantity } = selectedOrderTypeData.validationRules;
      const qty = Number(formValues.quantity);
      if (minQuantity && qty < minQuantity) {
        setError(`Minimum quantity for ${selectedOrderTypeData.typeName} is ${minQuantity}`);
        return;
      }
      if (maxQuantity && qty > maxQuantity) {
        setError(`Maximum quantity for ${selectedOrderTypeData.typeName} is ${maxQuantity}`);
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");
      const apiKey = import.meta.env.VITE_API_KEY;

      // Get branchId from localStorage (set during login)
      const branchId = localStorage.getItem("selectedBranch") || localStorage.getItem('selectedBranch');

      const orderData: any = {
        orderTypeId: selectedOrderType
      };

      // Add branchId to order data
      if (branchId) {
        orderData.branchId = branchId;
      }

      // Map form fields to order data
      if (formValues.productType) orderData.productTypeId = formValues.productType;
      if (formValues.productName) orderData.productId = formValues.productName;
      if (formValues.materialType) orderData.materialTypeId = formValues.materialType;
      if (formValues.quantity) orderData.quantity = Number(formValues.quantity);
      if (formValues.orderDate) orderData.orderDate = formValues.orderDate;

      // Product spec
      if (formValues.productSpec) {
        orderData.productSpecId = formValues.productSpec;
        orderData.productSpecifications = productSpecValues;
      }

      // Material spec
      if (formValues.materialName) {
        orderData.materialSpecId = formValues.materialName;
        orderData.materialSpecifications = materialSpecValues;
      }

      // Printing options
      if (formValues.printEnabled !== undefined) {
        orderData.Printing = formValues.printEnabled === "true" || formValues.printEnabled === true;
      }
      if (formValues.printLength) orderData.printLength = Number(formValues.printLength);
      if (formValues.printWidth) orderData.printWidth = Number(formValues.printWidth);
      if (formValues.printType) orderData.printType = formValues.printType;
      if (formValues.printColor) orderData.colors = [formValues.printColor];
      if (formValues.printImage) orderData.designNotes = formValues.printImage;

      // Mixing
      if (formValues.mixing) orderData.mixing = formValues.mixing;

      // Calculated values
      if (Object.keys(calculatedDimensions).length > 0) {
        orderData.calculatedDimensions = calculatedDimensions;
      }
      if (calculatedMaterialWeight > 0) {
        orderData.materialWeight = calculatedMaterialWeight;
      }

      // ✅ Add status and priority from form
      if (formValues.overallStatus) orderData.overallStatus = formValues.overallStatus;
      if (formValues.priority) orderData.priority = formValues.priority;

      // Debug: Log order data being sent




      // ✅ Debug: Log edit data details
      if (isEditMode) {





      }

      // ✅ Handle both create and update modes
      // Use _id if it's a valid MongoDB ObjectId, otherwise use orderId
      const orderIdentifier = isEditMode ?
      editOrderData._id && editOrderData._id.length === 24 ? editOrderData._id : editOrderData.orderId :
      null;

      const url = isEditMode ?
      `${import.meta.env.VITE_API_27INFINITY_IN}/orders/${orderIdentifier}` :
      `${import.meta.env.VITE_API_27INFINITY_IN}/orders`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey || "",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} order`);
      }

      setSuccess(isEditMode ?
      `Order updated successfully!` :
      `Order created successfully! Order ID: ${data.order?.orderId || data.orderId || ''}`
      );

      // Reset form only for create mode
      if (!isEditMode) {
        setFormValues({});
        setProductSpecValues({});
        setMaterialSpecValues({});
        setCalculatedDimensions({});
        setCalculatedMaterialWeight(0);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} order`);
    } finally {
      setLoading(false);
    }
  };

  const selectedProductSpecData = productSpecs.find((s) => s._id === formValues.productSpec);
  const selectedMaterialSpecData = materialSpecs.find((s) => s._id === formValues.materialName);

  // Check if a section is enabled
  const isSectionEnabled = (sectionId: string): boolean => {
    return sections.some((s) => s.id === sectionId);
  };

  // Render a dynamic field based on its configuration
  const renderField = (
  sectionId: string,
  fieldName: string,
  defaultLabel: string,
  renderFn: () => JSX.Element,
  fieldRef?: React.RefObject<any>) =>
  {
    if (!isFieldEnabled(sectionId, fieldName)) return null;

    const label = getFieldLabel(sectionId, fieldName, defaultLabel);
    const required = isFieldRequired(sectionId, fieldName);

    return (
      <div className="form-column" key={`${sectionId}-${fieldName}`}>
        <label className="input-label">
          {label} {required && <span className="required-mark">*</span>}
        </label>
        {renderFn()}
      </div>);

  };

  // Render Product Section
  const renderProductSection = (section: FormSection) =>
  <div className="form-section" key={section.id}>
      <h3 className="section-title">{section.name}</h3>
      <div className="form-grid">
        {renderField("product", "productType", "Product Type", () =>
      <SearchableSelect
        ref={productTypeRef}
        options={productTypes.map((type) => ({
          value: type._id,
          label: type.productTypeName
        }))}
        value={formValues.productType || ""}
        onChange={(value) => handleFormValueChange("productType", value)}
        placeholder="Select product type"
        required={isFieldRequired("product", "productType")}
        onSelectionComplete={focusNextField}
        onFocus={() => setCurrentField('productType')}
        onSpaceBack={focusPreviousField} />,

      productTypeRef)}

        {renderField("product", "productName", "Product Name", () =>
      <SearchableSelect
        ref={productNameRef}
        options={products.map((product) => ({
          value: product._id,
          label: product.productName
        }))}
        value={formValues.productName || ""}
        onChange={(value) => handleFormValueChange("productName", value)}
        placeholder={formValues.productType ? "Select product" : "Select Product Type first"}
        disabled={!formValues.productType}
        required={isFieldRequired("product", "productName")}
        onSelectionComplete={focusNextField}
        onFocus={() => setCurrentField('productName')}
        onSpaceBack={focusPreviousField} />,

      productNameRef)}

        {renderField("product", "quantity", "Quantity", () =>
      <input
        ref={quantityRef}
        type="number"
        value={formValues.quantity || ""}
        onChange={(e) => handleFormValueChange("quantity", e.target.value)}
        onFocus={() => setCurrentField('quantity')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextField();
          }
        }}
        className="form-input"
        placeholder="Enter quantity"
        min={selectedOrderTypeData?.validationRules?.minQuantity || 1}
        max={selectedOrderTypeData?.validationRules?.maxQuantity} />,

      quantityRef)}

        {/* Product Spec */}
        {formValues.productName && productSpecs.length > 0 &&
      <div className="form-column">
            <label className="input-label">Product Specification</label>
            <SearchableSelect
          ref={productSpecRef}
          options={productSpecs.map((spec) => ({
            value: spec._id,
            label: spec.specName,
            description: `${spec.dimensions.length} dimensions`
          }))}
          value={formValues.productSpec || ""}
          onChange={(value) => handleFormValueChange("productSpec", value)}
          placeholder="Select specification"
          onSelectionComplete={focusNextField}
          onFocus={() => setCurrentField('productSpec')}
          onSpaceBack={focusPreviousField} />

          </div>
      }
      </div>

      {/* Product Spec Dimensions */}
      {selectedProductSpecData && selectedProductSpecData.dimensions.length > 0 &&
    <div className="dimensions-section">
          <h4 className="subsection-title">Product Dimensions</h4>
          <div className="form-grid">
            {selectedProductSpecData.dimensions.
        filter((dim) => !dim.isCalculated).
        map((dim) =>
        <div key={dim.name} className="form-column">
                  <label className="input-label">
                    {dim.name} {dim.unit ? `(${dim.unit})` : ""}
                  </label>
                  <input
            type={dim.dataType === "number" ? "number" : "text"}
            value={productSpecValues[dim.name] || ""}
            onChange={(e) => handleProductSpecValueChange(dim.name, e.target.value)}
            className="form-input"
            placeholder={`Enter ${dim.name}`} />

                </div>
        )}
          </div>
        </div>
    }
    </div>;


  // Render Material Section
  const renderMaterialSection = (section: FormSection) =>
  <div className="form-section" key={section.id}>
      <h3 className="section-title">{section.name}</h3>
      <div className="form-grid">
        {renderField("material", "materialType", "Material Type", () =>
      <SearchableSelect
        ref={materialTypeRef}
        options={materialTypes.map((type) => ({
          value: type._id,
          label: type.name
        }))}
        value={formValues.materialType || ""}
        onChange={(value) => handleFormValueChange("materialType", value)}
        placeholder="Select material type"
        required={isFieldRequired("material", "materialType")}
        onSelectionComplete={focusNextField}
        onFocus={() => setCurrentField('materialType')}
        onSpaceBack={focusPreviousField} />,

      materialTypeRef)}

        {renderField("material", "materialName", "Material Specification", () =>
      <SearchableSelect
        ref={materialNameRef}
        options={materialSpecs.map((spec) => ({
          value: spec._id,
          label: spec.specName,
          description: spec.density ? `Density: ${spec.density}` : undefined
        }))}
        value={formValues.materialName || ""}
        onChange={(value) => handleFormValueChange("materialName", value)}
        placeholder={formValues.materialType ? "Select material" : "Select Material Type first"}
        disabled={!formValues.materialType}
        loading={loadingMaterialSpecs}
        required={isFieldRequired("material", "materialName")}
        onSelectionComplete={focusNextField}
        onFocus={() => setCurrentField('materialName')}
        onSpaceBack={focusPreviousField} />,

      materialNameRef)}

        {renderField("material", "mixing", "Mixing", () =>
      <select
        ref={mixingRef}
        value={formValues.mixing || ""}
        onChange={(e) => handleFormValueChange("mixing", e.target.value)}
        onFocus={() => setCurrentField('mixing')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextField();
          } else if (e.key === ' ' && !e.currentTarget.value) {
            e.preventDefault();
            focusPreviousField();
          }
        }}
        className="form-input">

            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>,
      mixingRef)}
      </div>

      {/* Material Spec Dimensions */}
      {selectedMaterialSpecData && selectedMaterialSpecData.dimensions.length > 0 &&
    <div className="dimensions-section">
          <h4 className="subsection-title">Material Properties</h4>
          <div className="form-grid">
            {selectedMaterialSpecData.mol !== undefined && selectedMaterialSpecData.mol > 0 &&
        <div className="form-column">
                <label className="input-label">MOL</label>
                <input type="text" value={selectedMaterialSpecData.mol} disabled className="form-input disabled-input" />
              </div>
        }
            {selectedMaterialSpecData.density !== undefined && selectedMaterialSpecData.density > 0 &&
        <div className="form-column">
                <label className="input-label">Density (g/cm³)</label>
                <input type="text" value={selectedMaterialSpecData.density} disabled className="form-input disabled-input" />
              </div>
        }
            {selectedMaterialSpecData.dimensions.
        filter((dim) => !dim.isCalculated).
        map((dim) =>
        <div key={dim.name} className="form-column">
                  <label className="input-label">
                    {dim.name} {dim.unit ? `(${dim.unit})` : ""}
                  </label>
                  <input
            type={dim.dataType === "number" ? "number" : "text"}
            value={materialSpecValues[dim.name] || ""}
            onChange={(e) => handleMaterialSpecValueChange(dim.name, e.target.value)}
            className="form-input"
            placeholder={`Enter ${dim.name}`} />

                </div>
        )}
          </div>
        </div>
    }
    </div>;


  // Render Printing Section
  const renderPrintingSection = (section: FormSection) =>
  <div className="form-section" key={section.id}>
      <h3 className="section-title">{section.name}</h3>
      <div className="form-grid">
        {renderField("printing", "printEnabled", "Enable Printing", () =>
      <select
        ref={printEnabledRef}
        value={formValues.printEnabled || ""}
        onChange={(e) => handleFormValueChange("printEnabled", e.target.value)}
        onFocus={() => setCurrentField('printEnabled')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextField();
          }
        }}
        className="form-input">

            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>,
      printEnabledRef)}

        {renderField("printing", "printLength", "Print Length", () =>
      <input
        ref={printLengthRef}
        type="number"
        value={formValues.printLength || ""}
        onChange={(e) => handleFormValueChange("printLength", e.target.value)}
        onFocus={() => setCurrentField('printLength')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextField();
          }
        }}
        className="form-input"
        placeholder="Enter print length" />,

      printLengthRef)}

        {renderField("printing", "printWidth", "Print Width", () =>
      <input
        ref={printWidthRef}
        type="number"
        value={formValues.printWidth || ""}
        onChange={(e) => handleFormValueChange("printWidth", e.target.value)}
        onFocus={() => setCurrentField('printWidth')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextField();
          }
        }}
        className="form-input"
        placeholder="Enter print width" />,

      printWidthRef)}

        {renderField("printing", "printType", "Print Type", () =>
      <select
        ref={printTypeRef}
        value={formValues.printType || ""}
        onChange={(e) => handleFormValueChange("printType", e.target.value)}
        onFocus={() => setCurrentField('printType')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextField();
          }
        }}
        className="form-input">

            <option value="">Select</option>
            <option value="flexo">Flexo</option>
            <option value="gravure">Gravure</option>
            <option value="digital">Digital</option>
            <option value="offset">Offset</option>
          </select>,
      printTypeRef)}

        {renderField("printing", "printColor", "Print Color", () =>
      <input
        ref={printColorRef}
        type="text"
        value={formValues.printColor || ""}
        onChange={(e) => handleFormValueChange("printColor", e.target.value)}
        onFocus={() => setCurrentField('printColor')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextField();
          }
        }}
        className="form-input"
        placeholder="Enter color" />,

      printColorRef)}

        {renderField("printing", "printImage", "Print Image/Notes", () =>
      <input
        ref={printImageRef}
        type="text"
        value={formValues.printImage || ""}
        onChange={(e) => handleFormValueChange("printImage", e.target.value)}
        onFocus={() => setCurrentField('printImage')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextField();
          }
        }}
        className="form-input"
        placeholder="Enter image reference or notes" />,

      printImageRef)}
      </div>
    </div>;


  // Render Steps Section
  const renderStepsSection = (section: FormSection) =>
  <div className="form-section" key={section.id}>
      <h3 className="section-title">{section.name}</h3>
      <div className="form-grid">
        {renderField("steps", "stepName", "Step Name", () =>
      <input
        ref={stepNameRef}
        type="text"
        value={formValues.stepName || ""}
        onChange={(e) => handleFormValueChange("stepName", e.target.value)}
        onFocus={() => setCurrentField('stepName')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextField();
          }
        }}
        className="form-input"
        placeholder="Enter step name" />,

      stepNameRef)}

        {renderField("steps", "notes", "Notes", () =>
      <textarea
        ref={notesRef}
        value={formValues.notes || ""}
        onChange={(e) => handleFormValueChange("notes", e.target.value)}
        onFocus={() => setCurrentField('notes')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            focusNextField();
          }
        }}
        className="form-input form-textarea"
        placeholder="Enter notes (Ctrl+Enter to proceed)"
        rows={3} />,

      notesRef)}
      </div>
    </div>;


  // Render section based on id
  const renderSection = (section: FormSection) => {
    switch (section.id) {
      case 'product':
        return renderProductSection(section);
      case 'material':
        return renderMaterialSection(section);
      case 'printing':
        return renderPrintingSection(section);
      case 'steps':
        return renderStepsSection(section);
      default:
        return null;
    }
  };

  return (
    <div className="create-order-container">
      <h2 className="page-title">{isEditMode ? "Edit Order" : "Create Order"}</h2>

      {/* Order Type Selection - Always shown */}
      <div className="form-section">
        <div className="form-grid">
          <div className="form-column">
            <OrderTypeSelector
              ref={orderTypeRef}
              value={selectedOrderType}
              onChange={(value) => handleFormValueChange("orderType", value)}
              label="Order Type"
              showDescription={true}
              required
              onSelectionComplete={focusNextField}
              onFocus={() => setCurrentField('orderType')}
              onSpaceBack={focusPreviousField} />

          </div>
          <div className="form-column">
            <label className="input-label">Status</label>
            <select
              ref={statusRef}
              name="overallStatus"
              value={formValues.overallStatus || "Wait for Approval"}
              onChange={(e) => handleFormValueChange("overallStatus", e.target.value)}
              onFocus={() => setCurrentField('status')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  focusNextField();
                } else if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                  focusPreviousField();
                }
              }}
              className="form-input">

              <option value="Wait for Approval">Wait for Approval</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="dispatched">Dispatched</option>
              <option value="cancelled">Cancelled</option>
              <option value="issue">Issue</option>
            </select>
          </div>
          <div className="form-column">
            <label className="input-label">Priority</label>
            <select
              ref={priorityRef}
              name="priority"
              value={formValues.priority || "normal"}
              onChange={(e) => handleFormValueChange("priority", e.target.value)}
              onFocus={() => setCurrentField('priority')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  focusNextField();
                } else if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                  focusPreviousField();
                }
              }}
              className="form-input">

              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Show form only when order type is selected */}
      {selectedOrderType ?
      <>
          {/* Debug info - shows enabled sections */}
          {selectedOrderTypeData &&
        <div className="form-section" style={{ backgroundColor: '#f0f9ff', borderColor: '#bfdbfe' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
                <strong>{selectedOrderTypeData.typeName}</strong> - Sections (in order):{' '}
                {sections.map((s) => s.name).join(' → ') || 'None'}
              </p>
            </div>
        }

          {/* Render sections dynamically based on order */}
          {sections.map((section) => renderSection(section))}

          {/* Calculated Dimensions Display */}
          {Object.keys(calculatedDimensions).length > 0 &&
        <div className="form-section">
              <h3 className="section-title">Calculated Values</h3>
              <div className="form-grid">
                {Object.entries(calculatedDimensions).map(([name, value]) => {
              const allDims = [
              ...(selectedProductSpecData?.dimensions || []),
              ...(selectedMaterialSpecData?.dimensions || [])];

              const dim = allDims.find((d) => d.name === name);
              return (
                <div key={name} className="form-column">
                      <label className="input-label">
                        {name} {dim?.unit ? `(${dim.unit})` : ""}
                        <span className="calculated-mark">(Calculated)</span>
                      </label>
                      <input
                    type="text"
                    value={typeof value === 'number' ? value.toFixed(4) : value}
                    disabled
                    className="form-input calculated-input" />

                    </div>);

            })}
                {calculatedMaterialWeight > 0 &&
            <div className="form-column">
                    <label className="input-label">
                      Total Material Weight (g)
                      <span className="calculated-mark">(Calculated)</span>
                    </label>
                    <input
                type="text"
                value={calculatedMaterialWeight.toFixed(2)}
                disabled
                className="form-input calculated-input weight-input" />

                  </div>
            }
              </div>
            </div>
        }

          {/* Submit Button */}
          <button
          ref={submitButtonRef}
          onClick={handleSubmit}
          onFocus={() => setCurrentField('submit')}
          className="submit-button"
          disabled={loading}>

            {loading ?
          isEditMode ? "Updating Order..." : "Creating Order..." :
          isEditMode ? "Update Order" : "Create Order"}
          </button>
        </> :

      <div className="select-order-type-message">
          <p>Please select an Order Type to see the form fields.</p>
        </div>
      }

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Keyboard Shortcuts Guide */}
      <KeyboardShortcutsGuide context={isEditMode ? "edit-order" : "create-order"} />
    </div>);

};

export default CreateOrder;