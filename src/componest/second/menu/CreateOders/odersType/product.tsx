import { useState, useRef, KeyboardEvent } from "react";

type Product = {
  name: string;
  code: string;
  price: string;
};

const ProductOdresType = () => {
  // State declarations
  const [products, setProducts] = useState<Product[]>([{ name: "", code: "", price: "" }]);
  const [productSuggestionsList, setProductSuggestionsList] = useState<string[]>([]);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState<number | null>(null);
  
  // Refs
  const productInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handler functions
  const handleProductInputChange = (value: string, index: number) => {
    const updatedProducts = [...products];
    updatedProducts[index].name = value;
    setProducts(updatedProducts);
    
    // Simulated suggestions - replace with actual logic
    if (value.length > 2) {
      setProductSuggestionsList([`${value} Product 1`, `${value} Product 2`]);
    } else {
      setProductSuggestionsList([]);
    }
    
    setPopupIndex(index);
  };

  const handleProductKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter" && productSuggestionsList.length > 0 && activeProductIndex !== null) {
      selectProductSuggestion(productSuggestionsList[activeProductIndex], index);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveProductIndex(prev => 
        prev === null ? 0 : Math.min(prev + 1, productSuggestionsList.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveProductIndex(prev => 
        prev === null || prev === 0 ? null : prev - 1
      );
    } else if (e.key === "Escape") {
      setProductSuggestionsList([]);
    }
  };

  const selectProductSuggestion = (suggestion: string, index: number) => {
    const updatedProducts = [...products];
    updatedProducts[index].name = suggestion;
    setProducts(updatedProducts);
    setProductSuggestionsList([]);
    setActiveProductIndex(null);
    
    // Show popup after selection
    setShowProductPopup(true);
    setPopupIndex(index);
  };

  const handlePopupSave = () => {
    // Save logic would go here
    setShowProductPopup(false);
  };

  return (
    <div className="productInput">
      <h3>Product Details</h3>
      {products.map((product, index) => (
        <div key={index} className="product-row">
          <input
            ref={el => productInputRefs.current[index] = el}
            type="text"
            value={product.name}
            placeholder="Product name"
            onChange={(e) => handleProductInputChange(e.target.value, index)}
            onKeyDown={(e) => handleProductKeyDown(e, index)}
            onFocus={() => setProductSuggestionsList([])}
          />
          {productSuggestionsList.length > 0 && index === popupIndex && (
            <ul className="suggestion-box">
              {productSuggestionsList.map((s, i) => (
                <li
                  key={i}
                  className={i === activeProductIndex ? "active" : ""}
                  onMouseDown={() => selectProductSuggestion(s, index)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {showProductPopup && popupIndex !== null && (
        <div className="popup">
          <h4>Edit Product</h4>
          <label>
            Code:
            <input
              value={products[popupIndex].code}
              onChange={(e) =>
                setProducts((prev) => {
                  const updated = [...prev];
                  updated[popupIndex].code = e.target.value;
                  return updated;
                })
              }
            />
          </label>
          <label>
            Price:
            <input
              value={products[popupIndex].price}
              onChange={(e) =>
                setProducts((prev) => {
                  const updated = [...prev];
                  updated[popupIndex].price = e.target.value;
                  return updated;
                })
              }
            />
          </label>
          <button onClick={() => handlePopupSave()}>
            Save
          </button>
          <button onClick={() => setShowProductPopup(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ProductOdresType;