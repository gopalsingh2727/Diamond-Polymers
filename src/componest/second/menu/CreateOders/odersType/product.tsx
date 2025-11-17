import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import OptimizedSuggestions from "../SuggestionInput/OptimizedSuggestions";
import '../materialAndProduct/materialAndProduct.css';

interface ProductInOrdersProps {
  initialData?: any;
  isEditMode?: boolean;
}

type ProductSpecDimension = {
  name: string;
  value: string | number | boolean;
  unit: string;
  dataType: "string" | "number" | "boolean" | "date";
};

type ProductSpec = {
  _id: string;
  specName: string;
  dimensions: ProductSpecDimension[];
};

export type ProductData = {
  productTypeId: string;
  productTypeName: string;
  productId: string;
  productName: string;
  productSpecId: string;
  productSpecName: string;
  specificationValues: { [key: string]: any };
  totalPieces: string;
};

const ProductInOrders = forwardRef((
  { initialData, isEditMode }: ProductInOrdersProps,
  ref: React.ForwardedRef<{ getProductData: () => ProductData }>
) => {
  const [productTypeId, setProductTypeId] = useState('');
  const [productTypeName, setProductTypeName] = useState('');
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [productSpecId, setProductSpecId] = useState('');
  const [productSpecName, setProductSpecName] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<ProductSpec | null>(null);
  const [specValues, setSpecValues] = useState<{ [key: string]: any }>({});
  const [totalPieces, setTotalPieces] = useState('');

  const [showProductTypeSuggestions, setShowProductTypeSuggestions] = useState(false);
  const [showProductNameSuggestions, setShowProductNameSuggestions] = useState(false);
  const [showProductSpecSuggestions, setShowProductSpecSuggestions] = useState(false);

  // Load initial data for edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      console.log('🔄 Loading product data for edit:', initialData);

      setProductTypeId(initialData.productType?._id || initialData.productTypeId || '');
      setProductTypeName(initialData.productType?.productTypeName || initialData.productTypeName || '');
      setProductId(initialData.product?._id || initialData.productId || '');
      setProductName(initialData.product?.productName || initialData.productName || '');
      setProductSpecId(initialData.productSpec?._id || initialData.productSpecId || '');
      setProductSpecName(initialData.productSpec?.specName || initialData.productSpecName || '');
      setTotalPieces(initialData.totalPieces?.toString() || '');

      // Load specification values if available
      if (initialData.specificationValues) {
        setSpecValues(initialData.specificationValues);
      }
    }
  }, [isEditMode, initialData]);

  // ✅ No longer needed - product specs are pre-loaded in orderFormData

  // Product Type Selection Handler
  const handleProductTypeSelect = (selectedProductType: any) => {
    const typeId = selectedProductType._id || selectedProductType.productTypeId || '';
    const typeName = selectedProductType.productTypeName || selectedProductType.name || '';

    setProductTypeId(typeId);
    setProductTypeName(typeName);
    setShowProductTypeSuggestions(false);

    // Reset dependent fields
    setProductId('');
    setProductName('');
    setProductSpecId('');
    setProductSpecName('');
    setSelectedSpec(null);
    setSpecValues({});
  };

  // Product Name Selection Handler
  const handleProductNameSelect = (selectedProduct: any) => {
    const prodId = selectedProduct._id || selectedProduct.productId || '';
    const prodName = selectedProduct.productName || selectedProduct.name || '';
    const typeId = selectedProduct.productTypeId || selectedProduct.productType || productTypeId || '';
    const typeName = selectedProduct.productTypeName || productTypeName || '';

    setProductId(prodId);
    setProductName(prodName);
    if (typeId) setProductTypeId(typeId);
    if (typeName) setProductTypeName(typeName);
    setShowProductNameSuggestions(false);
  };

  // Product Spec Selection Handler
  const handleProductSpecSelect = (selectedProductSpec: any) => {
    const specId = selectedProductSpec._id || '';
    const specName = selectedProductSpec.specName || selectedProductSpec.name || '';
    const dimensions = selectedProductSpec.dimensions || [];

    setProductSpecId(specId);
    setProductSpecName(specName);
    setSelectedSpec({
      _id: specId,
      specName: specName,
      dimensions: dimensions
    });

    // Initialize spec values
    const initialValues: { [key: string]: any } = {};
    dimensions.forEach((dim: ProductSpecDimension) => {
      initialValues[dim.name] = dim.dataType === 'number' ? 0 : "";
    });
    setSpecValues(initialValues);
    setShowProductSpecSuggestions(false);
  };

  const handleSpecValueChange = (dimName: string, value: any) => {
    setSpecValues(prev => ({
      ...prev,
      [dimName]: value
    }));
  };

  const getProductData = (): ProductData => {
    const data = {
      productTypeId: productTypeId,
      productTypeName: productTypeName,
      productId: productId,
      productName: productName,
      productSpecId: productSpecId,
      productSpecName: productSpecName,
      specificationValues: specValues,
      totalPieces: totalPieces
    };

    console.log('Getting Product Data:', data);
    return data;
  };

  // Expose data via ref
  useImperativeHandle(ref, () => ({
    getProductData: getProductData
  }));

  return (
    <div>
      <div className="createProductCss">

        <div className="materialForm">
    
          <input type="hidden" name="productTypeId" value={productTypeId} />
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="productSpecId" value={productSpecId} />

          <div >
            <label >Product Type</label>
            <input
              type="text"
              value={productTypeName}
              onChange={(e) => setProductTypeName(e.target.value)}
              placeholder="Product Type"
              className="inputBox"
              onFocus={() => !isEditMode && setShowProductTypeSuggestions(true)}
              onBlur={() => setTimeout(() => setShowProductTypeSuggestions(false), 200)}
              readOnly={isEditMode}
            />
            {!isEditMode && (
              <OptimizedSuggestions
                searchTerm={productTypeName}
                onSelect={handleProductTypeSelect}
                suggestionType="productType"
                showSuggestions={showProductTypeSuggestions && productTypeName.length > 0}
              />
            )}
          </div>

          <div >
            <label >Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Product Name"
              className="inputBox"
              onFocus={() => !isEditMode && setShowProductNameSuggestions(true)}
              onBlur={() => setTimeout(() => setShowProductNameSuggestions(false), 200)}
              readOnly={isEditMode}
            />


            {!isEditMode && (
              <OptimizedSuggestions
                searchTerm={productName}
                onSelect={handleProductNameSelect}
                suggestionType="productName"
                filterBy={productTypeId}
                showSuggestions={showProductNameSuggestions && productName.length > 0 && productTypeId.length > 0}
              />
            )}
          </div>

          <div>
            <label>Product Specification</label>
            <input
              type="text"
              value={productSpecName}
              onChange={(e) => setProductSpecName(e.target.value)}
              placeholder="Product Specification"
              className="inputBox"
              onFocus={() => !isEditMode && setShowProductSpecSuggestions(true)}
              onBlur={() => setTimeout(() => setShowProductSpecSuggestions(false), 200)}
              readOnly={isEditMode}
            />
            {!isEditMode && (
              <OptimizedSuggestions
                searchTerm={productSpecName}
                onSelect={handleProductSpecSelect}
                suggestionType="productSpec"
                filterBy={productTypeId}
                showSuggestions={showProductSpecSuggestions && productSpecName.length > 0 && productTypeId.length > 0}
              />
            )}
          </div>

          <div>
            <label>Total Pieces</label>
            <input
              type="number"
              value={totalPieces}
              onChange={(e) => setTotalPieces(e.target.value)}
              placeholder="Total Pieces"
              className="inputBox"
            />
          </div>
        </div>
      </div>

      {/* Product Specification Values */}
      {selectedSpec && selectedSpec.dimensions.length > 0 && (
        <div className="SaveMixing">
          <div className="SaveMixingDisplay">
            <div className="SaveMixingHeaderRow">
              <strong>Specification</strong>
              <strong>Value</strong>
              <strong>Unit</strong>
            </div>

            {selectedSpec.dimensions.map((dim, index) => (
              <div key={index} className="SaveMixingstepRow">
                <span>{dim.name}</span>
                <span>
                  {dim.dataType === "number" ? (
                    <input
                      type="number"
                      value={specValues[dim.name] || ""}
                      onChange={(e) => handleSpecValueChange(dim.name, parseFloat(e.target.value) || 0)}
                      className="form-input"
                      placeholder={`Enter ${dim.name}`}
                      style={{ width: '100%', padding: '4px' }}
                    />
                  ) : dim.dataType === "boolean" ? (
                    <select
                      value={specValues[dim.name]?.toString() || ""}
                      onChange={(e) => handleSpecValueChange(dim.name, e.target.value === "true")}
                      className="form-input"
                      style={{ width: '100%', padding: '4px' }}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={specValues[dim.name] || ""}
                      onChange={(e) => handleSpecValueChange(dim.name, e.target.value)}
                      className="form-input"
                      placeholder={`Enter ${dim.name}`}
                      style={{ width: '100%', padding: '4px' }}
                    />
                  )}
                </span>
                <span>{dim.unit || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProductInOrders;
