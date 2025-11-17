import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../../../store";
import { RootState } from "../../../../redux/rootReducer";
import { getMaterialSpecsByMaterialType } from "../../../../redux/create/materialSpec/materialSpecActions";
import OrderTypeSelector from "../../../../../components/orderType/OrderTypeSelector";
import SearchableSelect from "../../../../../components/shared/SearchableSelect";
import FieldTooltip from "../../../../../components/shared/FieldTooltip";
import { Parser } from "expr-eval";
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

const CreateOrder = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSpecs, setProductSpecs] = useState<ProductSpec[]>([]);
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [materialSpecs, setMaterialSpecs] = useState<MaterialSpec[]>([]);

  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductSpec, setSelectedProductSpec] = useState("");
  const [selectedMaterialType, setSelectedMaterialType] = useState("");
  const [selectedMaterialSpec, setSelectedMaterialSpec] = useState("");

  const [productSpecValues, setProductSpecValues] = useState<{ [key: string]: string | number }>({});
  const [materialSpecValues, setMaterialSpecValues] = useState<{ [key: string]: string | number }>({});
  const [calculatedDimensions, setCalculatedDimensions] = useState<{ [key: string]: number }>({});
  const [calculatedMaterialWeight, setCalculatedMaterialWeight] = useState<number>(0);

  const [quantity, setQuantity] = useState("");
  const [orderDate, setOrderDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMaterialSpecs, setLoadingMaterialSpecs] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get selected order type from Redux store
  const { orderTypes } = useSelector((state: RootState) => state.orderTypeList);
  const selectedOrderTypeData = orderTypes?.find((type: any) => type._id === selectedOrderType);

  useEffect(() => {
    fetchProductTypes();
    fetchMaterialTypes();
  }, []);

  useEffect(() => {
    if (selectedProductType) {
      fetchProductsByType(selectedProductType);
    } else {
      setProducts([]);
      setSelectedProduct("");
    }
  }, [selectedProductType]);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductSpecsByProduct(selectedProduct);
    } else {
      setProductSpecs([]);
      setSelectedProductSpec("");
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProductSpec) {
      const spec = productSpecs.find(s => s._id === selectedProductSpec);
      if (spec) {
        const initialValues: { [key: string]: string | number } = {};
        spec.dimensions.forEach(dim => {
          if (!dim.isCalculated) {
            initialValues[dim.name] = dim.dataType === 'number' ? 0 : "";
          }
        });
        setProductSpecValues(initialValues);
      }
    }
  }, [selectedProductSpec, productSpecs]);

  // Fetch Material Specs when Material Type changes
  useEffect(() => {
    if (selectedMaterialType) {
      fetchMaterialSpecsByMaterialType(selectedMaterialType);
    } else {
      setMaterialSpecs([]);
      setSelectedMaterialSpec("");
    }
  }, [selectedMaterialType]);

  // Initialize Material Spec values when Material Spec is selected
  useEffect(() => {
    if (selectedMaterialSpec) {
      const spec = materialSpecs.find(s => s._id === selectedMaterialSpec);
      if (spec) {
        const initialValues: { [key: string]: string | number } = {};
        spec.dimensions.forEach(dim => {
          if (!dim.isCalculated) {
            initialValues[dim.name] = dim.dataType === 'number' ? 0 : "";
          }
        });
        setMaterialSpecValues(initialValues);
      }
    }
  }, [selectedMaterialSpec, materialSpecs]);

  // Calculate combined dimensions whenever product/material spec values change
  useEffect(() => {
    if (selectedProductSpec && selectedMaterialSpec) {
      calculateCombinedDimensions();
    }
  }, [selectedProductSpec, selectedMaterialSpec, productSpecValues, materialSpecValues, quantity]);

  const fetchProductTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/producttype`,
        {
          headers: {
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setProductTypes(Array.isArray(data) ? data : data.productTypes || []);
      }
    } catch (err) {
      console.error("Failed to fetch product types");
    }
  };

  const fetchProductsByType = async (productTypeId: string) => {
    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/product?productType=${productTypeId}`,
        {
          headers: {
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  const fetchProductSpecsByProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/productspec?productId=${productId}`,
        {
          headers: {
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setProductSpecs(Array.isArray(data) ? data : data.productSpecs || []);
      }
    } catch (err) {
      console.error("Failed to fetch product specs");
    }
  };

  const fetchMaterialTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/materialtype`,
        {
          headers: {
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMaterialTypes(Array.isArray(data) ? data : data.materialTypes || []);
      }
    } catch (err) {
      console.error("Failed to fetch material types");
    }
  };

  const fetchMaterialSpecsByMaterialType = async (materialTypeId: string) => {
    try {
      setLoadingMaterialSpecs(true);
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/materialspec/materialtype/${materialTypeId}`,
        {
          headers: {
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMaterialSpecs(Array.isArray(data) ? data : data.materialSpecs || []);
      }
    } catch (err) {
      console.error("Failed to fetch material specs");
    } finally {
      setLoadingMaterialSpecs(false);
    }
  };

  // Calculate combined dimensions from Product Spec + Material Spec formulas
  const calculateCombinedDimensions = () => {
    try {
      const productSpec = productSpecs.find(s => s._id === selectedProductSpec);
      const materialSpec = materialSpecs.find(s => s._id === selectedMaterialSpec);

      if (!productSpec || !materialSpec) return;

      // Combine all dimensions for evaluation context
      const context: { [key: string]: number } = {
        quantity: Number(quantity) || 0,
        mol: materialSpec.mol || 0,
        weightPerPiece: materialSpec.weightPerPiece || 0,
        density: materialSpec.density || 0,
      };

      // Add product spec values
      Object.entries(productSpecValues).forEach(([key, value]) => {
        context[key] = Number(value) || 0;
      });

      // Add material spec values
      Object.entries(materialSpecValues).forEach(([key, value]) => {
        context[key] = Number(value) || 0;
      });

      const calculated: { [key: string]: number } = {};
      const parser = new Parser();

      // Calculate dimensions with formulas from both specs
      const allDimensions = [
        ...(productSpec.dimensions || []),
        ...(materialSpec.dimensions || [])
      ];

      allDimensions.forEach(dim => {
        if (dim.formula && dim.isCalculated) {
          try {
            const expr = parser.parse(dim.formula);
            const result = expr.evaluate(context);
            calculated[dim.name] = result;
            context[dim.name] = result; // Add to context for dependent calculations
          } catch (err) {
            console.error(`Error calculating ${dim.name}:`, err);
          }
        }
      });

      setCalculatedDimensions(calculated);

      // Calculate material weight if we have necessary dimensions
      // Typically: materialWeight = volume * density or area * thickness * density
      let weight = 0;
      if (calculated.volume && materialSpec.density) {
        weight = calculated.volume * materialSpec.density * Number(quantity);
      } else if (calculated.area && calculated.thickness && materialSpec.density) {
        weight = calculated.area * calculated.thickness * materialSpec.density * Number(quantity);
      } else if (materialSpec.weightPerPiece) {
        weight = materialSpec.weightPerPiece * Number(quantity);
      }

      setCalculatedMaterialWeight(weight);
    } catch (err) {
      console.error("Error in combined calculations:", err);
    }
  };

  const handleProductSpecValueChange = (dimName: string, value: string) => {
    setProductSpecValues(prev => ({
      ...prev,
      [dimName]: value
    }));
  };

  const handleMaterialSpecValueChange = (dimName: string, value: string) => {
    setMaterialSpecValues(prev => ({
      ...prev,
      [dimName]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!selectedProductType || !selectedProduct || !selectedMaterialType || !quantity) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate based on order type requirements
    if (selectedOrderTypeData) {
      if (selectedOrderTypeData.requiresProductSpec && !selectedProductSpec) {
        setError(`Order type '${selectedOrderTypeData.typeName}' requires a product specification`);
        return;
      }
      if (selectedOrderTypeData.requiresMaterialSpec && !selectedMaterialSpec) {
        setError(`Order type '${selectedOrderTypeData.typeName}' requires a material specification`);
        return;
      }

      // Validate quantity against order type rules
      if (selectedOrderTypeData.validationRules) {
        const { minQuantity, maxQuantity } = selectedOrderTypeData.validationRules;
        const qty = Number(quantity);
        if (minQuantity && qty < minQuantity) {
          setError(`Minimum quantity for ${selectedOrderTypeData.typeName} is ${minQuantity}`);
          return;
        }
        if (maxQuantity && qty > maxQuantity) {
          setError(`Maximum quantity for ${selectedOrderTypeData.typeName} is ${maxQuantity}`);
          return;
        }
      }
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_API_KEY;

      const orderData: any = {
        productTypeId: selectedProductType,
        productId: selectedProduct,
        materialTypeId: selectedMaterialType,
        quantity: Number(quantity),
        orderDate: orderDate || new Date().toISOString(),
      };

      // Add optional fields if selected
      if (selectedOrderType) {
        orderData.orderTypeId = selectedOrderType;
      }
      if (selectedProductSpec) {
        orderData.productSpecId = selectedProductSpec;
        orderData.productSpecifications = productSpecValues;
      }
      if (selectedMaterialSpec) {
        orderData.materialSpecId = selectedMaterialSpec;
        orderData.materialSpecifications = materialSpecValues;
      }

      // Add calculated dimensions and material weight
      if (Object.keys(calculatedDimensions).length > 0) {
        orderData.calculatedDimensions = calculatedDimensions;
      }
      if (calculatedMaterialWeight > 0) {
        orderData.materialWeight = calculatedMaterialWeight;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_27INFINITY_IN}/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey || "",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      setSuccess(`Order created successfully! Order ID: ${data.order?.orderId || data.orderId || ''}`);

      // Reset form
      setSelectedOrderType("");
      setSelectedProductType("");
      setSelectedProduct("");
      setSelectedProductSpec("");
      setSelectedMaterialType("");
      setSelectedMaterialSpec("");
      setQuantity("");
      setOrderDate("");
      setProductSpecValues({});
      setMaterialSpecValues({});
      setCalculatedDimensions({});
      setCalculatedMaterialWeight(0);
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const selectedProductSpecData = productSpecs.find(s => s._id === selectedProductSpec);
  const selectedMaterialSpecData = materialSpecs.find(s => s._id === selectedMaterialSpec);

  return (
    <div className="create-order-container">
      <h2 className="text-2xl font-bold mb-4">Create Order</h2>

      <div className="form-grid">
        {/* Order Type Selection */}
        <div className="form-column">
          <OrderTypeSelector
            value={selectedOrderType}
            onChange={setSelectedOrderType}
            label="Order Type"
            showDescription={true}
          />
        </div>

        {/* Product Type Selection */}
        <div className="form-column">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label className="input-label">Product Type *</label>
            <FieldTooltip
              content="Select the category of product you want to order (e.g., Plastic Bag, Container, Film)"
              position="right"
            />
          </div>
          <SearchableSelect
            options={productTypes.map(type => ({
              value: type._id,
              label: type.productTypeName
            }))}
            value={selectedProductType}
            onChange={setSelectedProductType}
            placeholder="Type to search product types or * to see all"
            required
          />
        </div>

        {/* Product Name Selection */}
        <div className="form-column">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label className="input-label">Product Name *</label>
            <FieldTooltip
              content="Select the specific product variant. First select a Product Type to see available products."
              position="right"
            />
          </div>
          <SearchableSelect
            options={products.map(product => ({
              value: product._id,
              label: product.productName
            }))}
            value={selectedProduct}
            onChange={setSelectedProduct}
            placeholder={selectedProductType ? "Type to search products or * to see all" : "Select Product Type first"}
            disabled={!selectedProductType}
            required
          />
        </div>

        {/* Product Spec Selection */}
        <div className="form-column">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label className="input-label">
              Product Specification
              {selectedOrderTypeData?.requiresProductSpec && <span style={{ color: '#dc2626' }}> *</span>}
            </label>
            <FieldTooltip
              title="Product Specification"
              content="Define dimensions like length, width, thickness. These will be used to calculate material requirements and pricing."
              position="right"
            />
          </div>
          <SearchableSelect
            options={productSpecs.map(spec => ({
              value: spec._id,
              label: spec.specName,
              description: `${spec.dimensions.length} dimensions defined`
            }))}
            value={selectedProductSpec}
            onChange={setSelectedProductSpec}
            placeholder={selectedProduct ? "Type to search or * to see all specs" : "Select Product first"}
            disabled={!selectedProduct}
            required={selectedOrderTypeData?.requiresProductSpec}
          />
        </div>

        {/* Material Type Selection */}
        <div className="form-column">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label className="input-label">Material Type *</label>
            <FieldTooltip
              content="Select the material category (e.g., LDPE, HDPE, PP). This determines available material specifications."
              position="right"
            />
          </div>
          <SearchableSelect
            options={materialTypes.map(type => ({
              value: type._id,
              label: type.name
            }))}
            value={selectedMaterialType}
            onChange={setSelectedMaterialType}
            placeholder="Type to search material types or * to see all"
            required
          />
        </div>

        {/* Material Spec Selection */}
        <div className="form-column">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label className="input-label">
              Material Specification
              {selectedOrderTypeData?.requiresMaterialSpec && <span style={{ color: '#dc2626' }}> *</span>}
            </label>
            <FieldTooltip
              title="Material Specification"
              content="Defines material properties like density, weight per piece, and MOL. Combined with Product Spec to calculate total material weight."
              position="right"
            />
          </div>
          <SearchableSelect
            options={materialSpecs.map(spec => ({
              value: spec._id,
              label: spec.specName,
              description: spec.density ? `Density: ${spec.density} g/cm³` : undefined
            }))}
            value={selectedMaterialSpec}
            onChange={setSelectedMaterialSpec}
            placeholder={selectedMaterialType ? "Type to search or * to see all specs" : "Select Material Type first"}
            disabled={!selectedMaterialType}
            loading={loadingMaterialSpecs}
            required={selectedOrderTypeData?.requiresMaterialSpec}
          />
        </div>

        {/* Quantity */}
        <div className="form-column">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label className="input-label">Quantity *</label>
            <FieldTooltip
              content={
                selectedOrderTypeData?.validationRules?.minQuantity || selectedOrderTypeData?.validationRules?.maxQuantity
                  ? `Min: ${selectedOrderTypeData.validationRules.minQuantity || 1}, Max: ${selectedOrderTypeData.validationRules.maxQuantity || '∞'}`
                  : "Enter the number of units to manufacture"
              }
              position="right"
            />
          </div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="form-input"
            placeholder={`Enter quantity${selectedOrderTypeData?.validationRules?.minQuantity ? ` (min: ${selectedOrderTypeData.validationRules.minQuantity})` : ""}`}
            min={selectedOrderTypeData?.validationRules?.minQuantity || 1}
            max={selectedOrderTypeData?.validationRules?.maxQuantity}
          />
        </div>

        {/* Order Date */}
        <div className="form-column">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label className="input-label">Order Date</label>
            <FieldTooltip
              content="Leave empty to use today's date. Select a future date for scheduled orders."
              position="right"
            />
          </div>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Product Spec Dimensions */}
      {selectedProductSpecData && selectedProductSpecData.dimensions.length > 0 && (
        <div className="spec-dimensions-section">
          <h3 className="text-lg font-semibold mb-3 mt-4">Product Specifications</h3>

          <div className="dimensions-grid">
            {selectedProductSpecData.dimensions
              .filter(dim => !dim.isCalculated)
              .map((dim) => (
                <div key={dim.name} className="form-column">
                  <label className="input-label">
                    {dim.name} {dim.unit ? `(${dim.unit})` : ""}
                  </label>
                  {dim.dataType === "number" ? (
                    <input
                      type="number"
                      value={productSpecValues[dim.name] || ""}
                      onChange={(e) => handleProductSpecValueChange(dim.name, e.target.value)}
                      className="form-input"
                      placeholder={`Enter ${dim.name}`}
                    />
                  ) : dim.dataType === "boolean" ? (
                    <select
                      value={productSpecValues[dim.name]?.toString() || ""}
                      onChange={(e) => handleProductSpecValueChange(dim.name, e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={productSpecValues[dim.name] || ""}
                      onChange={(e) => handleProductSpecValueChange(dim.name, e.target.value)}
                      className="form-input"
                      placeholder={`Enter ${dim.name}`}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Material Spec Dimensions */}
      {selectedMaterialSpecData && selectedMaterialSpecData.dimensions.length > 0 && (
        <div className="spec-dimensions-section">
          <h3 className="text-lg font-semibold mb-3 mt-4">Material Specifications</h3>

          {/* Display fixed material properties */}
          <div className="dimensions-grid mb-3">
            {selectedMaterialSpecData.mol !== undefined && selectedMaterialSpecData.mol > 0 && (
              <div className="form-column">
                <label className="input-label">MOL</label>
                <input
                  type="text"
                  value={selectedMaterialSpecData.mol}
                  disabled
                  className="form-input bg-gray-100"
                />
              </div>
            )}
            {selectedMaterialSpecData.density !== undefined && selectedMaterialSpecData.density > 0 && (
              <div className="form-column">
                <label className="input-label">Density (g/cm³)</label>
                <input
                  type="text"
                  value={selectedMaterialSpecData.density}
                  disabled
                  className="form-input bg-gray-100"
                />
              </div>
            )}
            {selectedMaterialSpecData.weightPerPiece !== undefined && selectedMaterialSpecData.weightPerPiece > 0 && (
              <div className="form-column">
                <label className="input-label">Weight Per Piece (g)</label>
                <input
                  type="text"
                  value={selectedMaterialSpecData.weightPerPiece}
                  disabled
                  className="form-input bg-gray-100"
                />
              </div>
            )}
          </div>

          {/* Editable dimensions */}
          <div className="dimensions-grid">
            {selectedMaterialSpecData.dimensions
              .filter(dim => !dim.isCalculated)
              .map((dim) => (
                <div key={dim.name} className="form-column">
                  <label className="input-label">
                    {dim.name} {dim.unit ? `(${dim.unit})` : ""}
                  </label>
                  {dim.dataType === "number" ? (
                    <input
                      type="number"
                      value={materialSpecValues[dim.name] || ""}
                      onChange={(e) => handleMaterialSpecValueChange(dim.name, e.target.value)}
                      className="form-input"
                      placeholder={`Enter ${dim.name}`}
                    />
                  ) : dim.dataType === "boolean" ? (
                    <select
                      value={materialSpecValues[dim.name]?.toString() || ""}
                      onChange={(e) => handleMaterialSpecValueChange(dim.name, e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={materialSpecValues[dim.name] || ""}
                      onChange={(e) => handleMaterialSpecValueChange(dim.name, e.target.value)}
                      className="form-input"
                      placeholder={`Enter ${dim.name}`}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Calculated Dimensions Display */}
      {Object.keys(calculatedDimensions).length > 0 && (
        <div className="spec-dimensions-section">
          <h3 className="text-lg font-semibold mb-3 mt-4">Calculated Dimensions</h3>

          <div className="dimensions-grid">
            {Object.entries(calculatedDimensions).map(([name, value]) => {
              // Find the dimension to get its unit
              const allDims = [
                ...(selectedProductSpecData?.dimensions || []),
                ...(selectedMaterialSpecData?.dimensions || [])
              ];
              const dim = allDims.find(d => d.name === name);

              return (
                <div key={name} className="form-column">
                  <label className="input-label">
                    {name} {dim?.unit ? `(${dim.unit})` : ""}
                    <span className="text-blue-500 text-xs ml-1">(Calculated)</span>
                  </label>
                  <input
                    type="text"
                    value={typeof value === 'number' ? value.toFixed(4) : value}
                    disabled
                    className="form-input bg-blue-50"
                  />
                </div>
              );
            })}
          </div>

          {/* Material Weight Display */}
          {calculatedMaterialWeight > 0 && (
            <div className="mt-3">
              <div className="form-column">
                <label className="input-label">
                  Total Material Weight (g)
                  <span className="text-blue-500 text-xs ml-1">(Calculated)</span>
                </label>
                <input
                  type="text"
                  value={calculatedMaterialWeight.toFixed(2)}
                  disabled
                  className="form-input bg-blue-50 font-semibold"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="save-button mt-4"
        disabled={loading}
      >
        {loading ? "Creating Order..." : "Create Order"}
      </button>

      {/* Messages */}
      {error && <div className="error-msg mt-4">{error}</div>}
      {success && <div className="success-msg mt-4">{success}</div>}
    </div>
  );
};

export default CreateOrder;
