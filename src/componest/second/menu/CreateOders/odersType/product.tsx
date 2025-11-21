import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import OptimizedSuggestions from "../SuggestionInput/OptimizedSuggestions";
import '../materialAndProduct/materialAndProduct.css';

interface ProductInOrdersProps {
  initialData?: any;
  isEditMode?: boolean;
  sectionConfig?: any;
}

// Single product item type
export type ProductItem = {
  id: string;
  productTypeId: string;
  productTypeName: string;
  productId: string;
  productName: string;
  productSpecId: string;
  productSpecName: string;
  specificationValues: { [key: string]: any };
  totalPieces: string;
};

// Export type for backward compatibility - now returns array
export type ProductData = ProductItem[];

// Generate unique ID for product items
const generateId = () => `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create empty product item
const createEmptyProduct = (): ProductItem => ({
  id: generateId(),
  productTypeId: '',
  productTypeName: '',
  productId: '',
  productName: '',
  productSpecId: '',
  productSpecName: '',
  specificationValues: {},
  totalPieces: ''
});

const ProductInOrders = forwardRef((
  { initialData, isEditMode, sectionConfig }: ProductInOrdersProps,
  ref: React.ForwardedRef<{ getProductData: () => ProductData }>
) => {
  // Saved products list
  const [products, setProducts] = useState<ProductItem[]>([]);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);

  // Current product being edited in popup
  const [currentProduct, setCurrentProduct] = useState<ProductItem>(createEmptyProduct());

  // Suggestions state
  const [showProductTypeSuggestions, setShowProductTypeSuggestions] = useState(false);
  const [showProductNameSuggestions, setShowProductNameSuggestions] = useState(false);

  // Refs for Enter key navigation
  const productTypeRef = React.useRef<HTMLInputElement>(null);
  const productNameRef = React.useRef<HTMLInputElement>(null);
  const quantityRef = React.useRef<HTMLInputElement>(null);

  // Load initial data for edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      console.log('🔄 Loading product data for edit:', initialData);

      // Check if initialData has multiple products (array) or single product
      if (initialData.products && Array.isArray(initialData.products)) {
        const loadedProducts = initialData.products.map((prod: any) => ({
          id: generateId(),
          productTypeId: prod.productType?._id || prod.productTypeId || '',
          productTypeName: prod.productType?.productTypeName || prod.productTypeName || '',
          productId: prod.product?._id || prod.productId || '',
          productName: prod.product?.productName || prod.productName || '',
          productSpecId: prod.productSpec?._id || prod.productSpecId || '',
          productSpecName: prod.productSpec?.specName || prod.productSpecName || '',
          specificationValues: prod.specificationValues || {},
          totalPieces: prod.totalPieces?.toString() || ''
        }));
        setProducts(loadedProducts);
      } else if (initialData.productType || initialData.productTypeId) {
        // Single product (backward compatibility)
        const singleProduct: ProductItem = {
          id: generateId(),
          productTypeId: initialData.productType?._id || initialData.productTypeId || '',
          productTypeName: initialData.productType?.productTypeName || initialData.productTypeName || '',
          productId: initialData.product?._id || initialData.productId || '',
          productName: initialData.product?.productName || initialData.productName || '',
          productSpecId: initialData.productSpec?._id || initialData.productSpecId || '',
          productSpecName: initialData.productSpec?.specName || initialData.productSpecName || '',
          specificationValues: initialData.specificationValues || {},
          totalPieces: initialData.totalPieces?.toString() || ''
        };
        setProducts([singleProduct]);
      }
    }
  }, [isEditMode, initialData]);

  // Open popup
  const openPopup = () => {
    setCurrentProduct(createEmptyProduct());
    setShowPopup(true);
    // Focus first field after popup opens
    setTimeout(() => productTypeRef.current?.focus(), 100);
  };

  // Handle Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent, field: 'type' | 'name' | 'qty') => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (field === 'type') {
        // Move to product name
        productNameRef.current?.focus();
      } else if (field === 'name') {
        // Move to quantity
        quantityRef.current?.focus();
      } else if (field === 'qty') {
        // Check if row is empty (end list)
        if (!currentProduct.productTypeName && !currentProduct.productName && !currentProduct.totalPieces) {
          // Empty row - close popup
          setShowPopup(false);
        } else if (currentProduct.productTypeName && currentProduct.productName) {
          // Save current product and start new row
          setProducts(prev => [...prev, { ...currentProduct, id: generateId() }]);
          setCurrentProduct(createEmptyProduct());
          // Focus back to first field
          productTypeRef.current?.focus();
        } else {
          // Missing required fields - move to first empty field
          if (!currentProduct.productTypeName) {
            productTypeRef.current?.focus();
          } else if (!currentProduct.productName) {
            productNameRef.current?.focus();
          }
        }
      }
    }
  };

  // Update current product field
  const updateCurrentProduct = (field: keyof ProductItem, value: any) => {
    setCurrentProduct(prev => ({ ...prev, [field]: value }));
  };

  // Product Type Selection Handler
  const handleProductTypeSelect = (selectedProductType: any) => {
    const typeId = selectedProductType._id || selectedProductType.productTypeId || '';
    const typeName = selectedProductType.productTypeName || selectedProductType.name || '';

    setCurrentProduct(prev => ({
      ...prev,
      productTypeId: typeId,
      productTypeName: typeName,
      productId: '',
      productName: '',
      productSpecId: '',
      productSpecName: '',
      specificationValues: {}
    }));
    setShowProductTypeSuggestions(false);
  };

  // Product Name Selection Handler
  const handleProductNameSelect = (selectedProduct: any) => {
    const prodId = selectedProduct._id || selectedProduct.productId || '';
    const prodName = selectedProduct.productName || selectedProduct.name || '';
    const typeId = selectedProduct.productTypeId || selectedProduct.productType || currentProduct.productTypeId || '';
    const typeName = selectedProduct.productTypeName || currentProduct.productTypeName || '';

    setCurrentProduct(prev => ({
      ...prev,
      productId: prodId,
      productName: prodName,
      productTypeId: typeId || prev.productTypeId,
      productTypeName: typeName || prev.productTypeName
    }));
    setShowProductNameSuggestions(false);
  };

  // Remove product from list
  const handleRemoveProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  // Double-click to reopen popup
  const handleListDoubleClick = () => {
    if (!isEditMode) {
      openPopup();
    }
  };

  const getProductData = (): ProductData => {
    const data = products.map(product => ({
      id: product.id,
      productTypeId: product.productTypeId,
      productTypeName: product.productTypeName,
      productId: product.productId,
      productName: product.productName,
      productSpecId: product.productSpecId,
      productSpecName: product.productSpecName,
      specificationValues: product.specificationValues,
      totalPieces: product.totalPieces
    }));

    console.log('Getting Product Data (Multiple):', data);
    return data;
  };

  // Expose data via ref
  useImperativeHandle(ref, () => ({
    getProductData: getProductData
  }));

  return (
    <div>
      {/* ✅ Hidden input for productSpecId - used by collectDataFromDOM */}
      <input
        type="hidden"
        name="productSpecId"
        value={products.length > 0 ? products[0].productSpecId : ''}
      />

      {/* Show trigger only when no products */}
      {products.length === 0 && (
        <div className="createProductCss">
          <div className="materialForm">
            <div>
              <label>Product Type</label>
              <input
                type="text"
                value=""
                placeholder="Click to add products"
                className="inputBox"
                onClick={() => !isEditMode && openPopup()}
                readOnly
                style={{ cursor: isEditMode ? 'default' : 'pointer' }}
              />
            </div>
            <div>
              <label>Product Name</label>
              <input
                type="text"
                value=""
                placeholder="No products added"
                className="inputBox"
                onClick={() => !isEditMode && openPopup()}
                readOnly
                style={{ cursor: isEditMode ? 'default' : 'pointer' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Products list display - using SaveMixing CSS pattern */}
      {products.length > 0 && (
        <div className="SaveMixing" onDoubleClick={handleListDoubleClick} style={{ cursor: isEditMode ? 'default' : 'pointer' }}>
          <div className="SaveMixingDisplay">
            <div className="SaveMixingHeaderRow">
              <strong>#</strong>
              <strong>Product Type</strong>
              <strong>Product Name</strong>
              <strong>Quantity</strong>
              {!isEditMode && <strong></strong>}
            </div>

            {products.map((product, index) => (
              <div key={product.id} className="SaveMixingstepRow">
                <span>{index + 1}</span>
                <span>{product.productTypeName}</span>
                <span>{product.productName}</span>
                <span>{product.totalPieces || '-'}</span>
                {!isEditMode && (
                  <span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveProduct(index);
                      }}
                      className="buttonStepRowNote"
                      style={{ color: '#dc2626', fontSize: '14px', fontWeight: 'bold' }}
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup for adding products */}
      {showPopup && (
        <div className="popup-overlay Machine-Table">
          <div className="popup Machine-Table" style={{ minWidth: '500px', background: 'white' }}>
            <h3 style={{ marginBottom: '10px', color: '#1e293b' }}>Add Products</h3>
            <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '15px' }}>
              Press Enter to move to next field. Enter on empty row to finish.
            </p>

            {/* Popup form */}
            <div className="popupitemall">
              {/* Product Type */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Product Type</label>
                <input
                  ref={productTypeRef}
                  type="text"
                  value={currentProduct.productTypeName}
                  onChange={(e) => updateCurrentProduct('productTypeName', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'type')}
                  placeholder="Type & Enter"
                  onFocus={() => setShowProductTypeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowProductTypeSuggestions(false), 200)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
                <OptimizedSuggestions
                  searchTerm={currentProduct.productTypeName}
                  onSelect={handleProductTypeSelect}
                  suggestionType="productType"
                  showSuggestions={showProductTypeSuggestions && currentProduct.productTypeName.length > 0}
                />
              </div>

              {/* Product Name */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Product Name</label>
                <input
                  ref={productNameRef}
                  type="text"
                  value={currentProduct.productName}
                  onChange={(e) => updateCurrentProduct('productName', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'name')}
                  placeholder="Name & Enter"
                  onFocus={() => setShowProductNameSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowProductNameSuggestions(false), 200)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
                <OptimizedSuggestions
                  searchTerm={currentProduct.productName}
                  onSelect={handleProductNameSelect}
                  suggestionType="productName"
                  filterBy={currentProduct.productTypeId}
                  showSuggestions={showProductNameSuggestions && currentProduct.productName.length > 0 && currentProduct.productTypeId?.length > 0}
                />
              </div>

              {/* Quantity */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Quantity</label>
                <input
                  ref={quantityRef}
                  type="number"
                  value={currentProduct.totalPieces}
                  onChange={(e) => updateCurrentProduct('totalPieces', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'qty')}
                  placeholder="Qty & Enter"
                  min="1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Products added so far in popup */}
            {products.length > 0 && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#f9fafb', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                  Products added: {products.length}
                </div>
                {products.map((p, i) => (
                  <div key={p.id} style={{ fontSize: '12px', padding: '2px 0', color: '#374151' }}>
                    {i + 1}. {p.productTypeName} - {p.productName} ({p.totalPieces || '-'})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProductInOrders;
